create extension if not exists pgcrypto;

create table if not exists public.publicaciones (
    id text primary key,
    section text not null,
    type text not null default 'texto',
    title text not null,
    description text,
    media_url text,
    action_url text,
    action_label text,
    author_name text default 'admin',
    created_at timestamptz not null default timezone('utc', now())
);

create index if not exists publicaciones_section_created_at_idx
    on public.publicaciones (section, created_at desc);

alter table public.publicaciones enable row level security;

create or replace function public.is_admin_user()
returns boolean
language sql
stable
as $$
    select
        coalesce(auth.jwt() ->> 'email', '') in (
            'galvrei3435@iessantaaurelia.es',
            'amuh@iessantaaurelia.es',
            'martaalvarez@iessantaaurelia.es',
            'antoniomanuelgarciask@iessantaaurelia.es'
        )
        or lower(regexp_replace(coalesce(auth.jwt() -> 'user_metadata' ->> 'username', auth.jwt() -> 'user_metadata' ->> 'name', auth.jwt() -> 'user_metadata' ->> 'full_name', ''), '[^a-zA-Z0-9]', '', 'g')) in (
            'antonio',
            'antoniomanuelgarciask',
            'marta',
            'amuh',
            'carmen',
            'maria',
            'dario'
        );
$$;

drop policy if exists "public read publicaciones" on public.publicaciones;
create policy "public read publicaciones"
on public.publicaciones
for select
to anon, authenticated
using (true);

drop policy if exists "admin full publicaciones" on public.publicaciones;
create policy "admin full publicaciones"
on public.publicaciones
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "users create own profiles comments likes" on public.publicaciones;
create policy "users create own profiles comments likes"
on public.publicaciones
for insert
to authenticated
with check (
    section in ('__profiles__', '__comments__', '__likes__')
    and coalesce((coalesce(nullif(description, ''), '{}'))::jsonb ->> 'userId', '') = auth.uid()::text
);

drop policy if exists "users update own profiles comments likes" on public.publicaciones;
create policy "users update own profiles comments likes"
on public.publicaciones
for update
to authenticated
using (
    section in ('__profiles__', '__comments__', '__likes__')
    and coalesce((coalesce(nullif(description, ''), '{}'))::jsonb ->> 'userId', '') = auth.uid()::text
)
with check (
    section in ('__profiles__', '__comments__', '__likes__')
    and coalesce((coalesce(nullif(description, ''), '{}'))::jsonb ->> 'userId', '') = auth.uid()::text
);

drop policy if exists "users delete own profiles comments likes" on public.publicaciones;
create policy "users delete own profiles comments likes"
on public.publicaciones
for delete
to authenticated
using (
    section in ('__profiles__', '__comments__', '__likes__')
    and coalesce((coalesce(nullif(description, ''), '{}'))::jsonb ->> 'userId', '') = auth.uid()::text
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$;

create table if not exists public.perfiles (
    user_id uuid primary key references auth.users (id) on delete cascade,
    user_name text not null unique,
    avatar_color text,
    banned boolean not null default false,
    ban_until timestamptz,
    ban_reason text,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.comentarios (
    id uuid primary key default gen_random_uuid(),
    section text not null,
    user_id uuid not null references auth.users (id) on delete cascade,
    user_name text not null,
    message text not null,
    banned boolean not null default false,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    constraint comentarios_message_not_empty check (length(trim(message)) > 0)
);

create table if not exists public.likes (
    id uuid primary key default gen_random_uuid(),
    section text not null,
    item_id text not null,
    user_id uuid not null references auth.users (id) on delete cascade,
    created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.novedades (
    id text primary key,
    version text not null,
    titulo text,
    descripcion text,
    changes text not null,
    author_name text default 'admin',
    created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.bigbang (
    id text primary key,
    triggered_by text,
    triggered_at timestamptz not null default timezone('utc', now())
);

create index if not exists perfiles_user_name_idx
    on public.perfiles (user_name);

create index if not exists comentarios_section_created_at_idx
    on public.comentarios (section, created_at asc);

create index if not exists comentarios_user_id_idx
    on public.comentarios (user_id);

create index if not exists likes_section_item_id_idx
    on public.likes (section, item_id);

create index if not exists likes_user_id_idx
    on public.likes (user_id);

create unique index if not exists likes_unique_user_per_item_idx
    on public.likes (section, item_id, user_id);

create index if not exists novedades_created_at_idx
    on public.novedades (created_at desc);

create index if not exists bigbang_triggered_at_idx
    on public.bigbang (triggered_at desc);

drop trigger if exists perfiles_set_updated_at on public.perfiles;
create trigger perfiles_set_updated_at
before update on public.perfiles
for each row
execute function public.set_updated_at();

drop trigger if exists comentarios_set_updated_at on public.comentarios;
create trigger comentarios_set_updated_at
before update on public.comentarios
for each row
execute function public.set_updated_at();

alter table public.perfiles enable row level security;
alter table public.comentarios enable row level security;
alter table public.likes enable row level security;
alter table public.novedades enable row level security;
alter table public.bigbang enable row level security;

drop policy if exists "public read perfiles" on public.perfiles;
create policy "public read perfiles"
on public.perfiles
for select
to authenticated
using (true);

drop policy if exists "users insert own perfil" on public.perfiles;
create policy "users insert own perfil"
on public.perfiles
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "users update own perfil" on public.perfiles;
create policy "users update own perfil"
on public.perfiles
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "admin manage perfiles" on public.perfiles;
create policy "admin manage perfiles"
on public.perfiles
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "public read comentarios" on public.comentarios;
create policy "public read comentarios"
on public.comentarios
for select
to anon, authenticated
using (true);

drop policy if exists "users insert own comentarios" on public.comentarios;
create policy "users insert own comentarios"
on public.comentarios
for insert
to authenticated
with check (
    user_id = auth.uid()
    and length(trim(message)) > 0
);

drop policy if exists "users delete own comentarios" on public.comentarios;
create policy "users delete own comentarios"
on public.comentarios
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "admin manage comentarios" on public.comentarios;
create policy "admin manage comentarios"
on public.comentarios
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "public read likes" on public.likes;
create policy "public read likes"
on public.likes
for select
to anon, authenticated
using (true);

drop policy if exists "users insert own likes" on public.likes;
create policy "users insert own likes"
on public.likes
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "users delete own likes" on public.likes;
create policy "users delete own likes"
on public.likes
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "admin manage likes" on public.likes;
create policy "admin manage likes"
on public.likes
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "public read novedades" on public.novedades;
create policy "public read novedades"
on public.novedades
for select
to anon, authenticated
using (true);

drop policy if exists "admin manage novedades" on public.novedades;
create policy "admin manage novedades"
on public.novedades
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "public read bigbang" on public.bigbang;
create policy "public read bigbang"
on public.bigbang
for select
to anon, authenticated
using (true);

drop policy if exists "admin manage bigbang" on public.bigbang;
create policy "admin manage bigbang"
on public.bigbang
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "public read media bucket" on storage.objects;
create policy "public read media bucket"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'media');

drop policy if exists "admin upload media bucket" on storage.objects;
create policy "admin upload media bucket"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'media'
    and public.is_admin_user()
);

drop policy if exists "admin update media bucket" on storage.objects;
create policy "admin update media bucket"
on storage.objects
for update
to authenticated
using (
    bucket_id = 'media'
    and public.is_admin_user()
)
with check (
    bucket_id = 'media'
    and public.is_admin_user()
);

drop policy if exists "admin delete media bucket" on storage.objects;
create policy "admin delete media bucket"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'media'
    and public.is_admin_user()
);

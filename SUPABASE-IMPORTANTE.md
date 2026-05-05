# Supabase Importante

Esta web ya no depende solo de `public.publicaciones`.

Ahora mismo usa estas piezas en Supabase:

- `public.publicaciones`
  - publicaciones normales
  - imagenes diarias
  - notas de version
  - efectos globales como Big Bang
- `public.perfiles`
  - nombre visible del usuario
  - color de avatar
  - baneos y motivo
- `public.comentarios`
  - comentarios por seccion
  - moderacion y baneos
- `public.likes`
  - me gustas por publicacion o comentario
  - un solo like por usuario e item
- `public.novedades`
  - ventanas emergentes de actualizacion publicadas desde admin
- `public.bigbang`
  - lanzamientos globales del efecto Big Bang
- bucket `media`
  - fotos
  - videos
  - modelos 3D
  - imagenes diarias

## Lo importante

1. Ejecuta completo el archivo [supabase_setup.sql](/C:/Users/anton/Desktop/Plandeta%20REVELDE%20V2%20-%20copia/Planeta-revelde-main/supabase_setup.sql:1) en el SQL Editor de Supabase.

2. El registro publico usa Supabase Auth con emails internos de este estilo:
   - `usuario@users.planetarebelde.es`

3. Para ese flujo conviene desactivar la confirmacion obligatoria por email en Supabase Auth, o el alta publica se quedara a medias.

4. Los comentarios, likes y cuentas publicas dependen de estas tablas:
   - `perfiles`
   - `comentarios`
   - `likes`
   - `novedades`
   - `bigbang`

5. La tabla `likes` tiene que conservar el indice unico por:
   - `section`
   - `item_id`
   - `user_id`

   Eso es lo que garantiza un solo like por usuario en cada publicacion o comentario.

6. El panel admin necesita que las cuentas administradoras existan en Supabase Auth con los emails permitidos en `app.js`.

7. Banear desde frontend bloquea al usuario dentro de la web, pero borrar usuarios de `auth.users` de forma real sigue requiriendo backend o Admin API con service role.

## Si algo falla

- Si no puedes registrarte o iniciar sesion:
  - revisa `SUPABASE_URL`
  - revisa `SUPABASE_KEY`
  - revisa que Auth permita el alta publica
- Si no aparecen comentarios o likes:
  - revisa que se haya ejecutado el SQL nuevo
  - revisa las policies RLS
  - revisa el indice unico de `likes`
- Si subes archivos y no se ven:
  - revisa que exista el bucket `media`
  - revisa sus policies de lectura publica y subida admin

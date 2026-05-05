const STORAGE_KEY = "planetaRebeldeContent";
const ONBOARDING_KEY = "planetaRebeldeOnboarding";
const AUTH_FLASH_KEY = "planetaRebeldeAuthFlash";
const MEDIA_DB_NAME = "planetaRebeldeMedia";
const MEDIA_STORE_NAME = "mediaFiles";
const DAILY_IMAGE_CACHE_KEY = "planetaRebeldeDailyImageCache";
const DAILY_IMAGE_LIBRARY_KEY = "planetaRebeldeDailyImageLibrary";
const RELEASE_NOTES_SEEN_KEY = "planetaRebeldeReleaseNotesSeen";
const APP_VERSION = "v2";
const RELEASE_NOTES_VERSION = "2026-05-05-v2";
const BUG_REPORT_EMAIL = "planetarevelde@gmail.com";
const BUG_REPORT_ENDPOINT = `https://formsubmit.co/ajax/${BUG_REPORT_EMAIL}`;
const BUG_REPORT_MAX_TOTAL_SIZE = 10 * 1024 * 1024;

// Si quereis cargar la imagen diaria desde otra web, poned aqui la URL de un JSON.
// Acepta una lista de URLs o un objeto con { images: [...] }.
const DAILY_IMAGE_MANIFEST_URL = "";

const SUPABASE_URL = "https://wmfakzggzasxjdopzeum.supabase.co";
const SUPABASE_KEY = "sb_publishable_PazuWCH8UemDvm0QwUIhbA_CWnJa95c";

const AUTHORIZED_ADMIN_EMAILS = new Set([
    "galvrei3435@iessantaaurelia.es",
    "amuh@iessantaaurelia.es",
    "martaalvarez@iessantaaurelia.es",
    "antoniomanuelgarciask@iessantaaurelia.es"
]);

const ADMIN_DISPLAY_NAME_MAP = {
    galvrei3435: "Antonio",
    antoniomanuelgarciask: "Antonio",
    amuh: "Todopoderoso Amin",
    martaalvarez: "Marta"
};

// La cuenta entra al panel si el nombre en user_metadata o la parte antes de @ en el email coincide con una clave permitida.
const ADMIN_ACCESS_KEYS = new Set([
    "antonio",
    "antoniomanuelgarciask",
    "marta",
    "amuh",
    "carmen",
    "maria",
    "dario"
]);

const SECTION_NAMES = {
    inicio: "Inicio",
    museo: "Museo",
    eventos: "Eventos",
    noticias: "Noticias",
    juegos: "Juegos",
    aprende: "Aprende",
    "sobre-nosotros": "Sobre nosotros",
    "redes-sociales": "Redes sociales"
};

const CONTENT_TYPE_NAMES = {
    texto: "Texto",
    video: "Video",
    foto: "Foto",
    enlace: "Enlace",
    modelo3d: "Modelo 3D"
};

const CONTENT_MEDIA_CONFIG = {
    video: {
        mediaLabel: "URL del video",
        fileLabel: "Video desde tu ordenador",
        accept: "video/*",
        help: "Puedes usar una URL de YouTube, una URL directa o subir un video. Los archivos se suben a Supabase."
    },
    foto: {
        mediaLabel: "URL de la foto",
        fileLabel: "Foto desde tu ordenador",
        accept: "image/*",
        help: "Puedes pegar una URL de imagen o subir una foto. Los archivos se suben a Supabase."
    },
    modelo3d: {
        mediaLabel: "URL del modelo 3D (.glb, .gltf, .obj)",
        fileLabel: "Modelo 3D desde tu ordenador",
        accept: ".glb,.gltf,.obj,.fbx",
        help: "Sube un archivo GLB, GLTF u OBJ. Se subira a Supabase y cualquier usuario podra verlo e interactuar con el."
    }
};

const WORD_GAMES = {
    astro6: {
        key: "astro6",
        length: 6,
        attempts: 6,
        words: ["MARTE", "COMETA", "ORBITA", "COSMOS", "PLUTON", "APOGEO", "QUASAR", "METEOR", "NEBULA", "PEGASO"]
    },
    cielo5: {
        key: "cielo5",
        length: 5,
        attempts: 6,
        words: ["ORION", "VENUS", "SIRIO", "TITAN", "SOLAR", "LUNAR", "POLAR", "ATLAS", "HYDRA", "FOTON"]
    }
};

const THEME_PALETTES = {
    amarillo: {
        "--color-fondo-1": "#fff7bf",
        "--color-fondo-2": "#ffd976",
        "--color-fondo-3": "#fff0b0",
        "--color-texto": "#4f3b0c",
        "--color-principal": "#d98500",
        "--color-secundario": "#907122",
        "--color-tarjeta": "rgba(255, 255, 255, 0.84)",
        "--color-borde": "rgba(79, 59, 12, 0.12)"
    },
    blanco: {
        "--color-fondo-1": "#f7f7f7",
        "--color-fondo-2": "#e4e7ec",
        "--color-fondo-3": "#d3dae6",
        "--color-texto": "#253246",
        "--color-principal": "#4f6d8c",
        "--color-secundario": "#8698ab",
        "--color-tarjeta": "rgba(255, 255, 255, 0.88)",
        "--color-borde": "rgba(37, 50, 70, 0.12)"
    },
    azul: {
        "--color-fondo-1": "#dff3ff",
        "--color-fondo-2": "#83c9ff",
        "--color-fondo-3": "#5ea4ff",
        "--color-texto": "#163152",
        "--color-principal": "#1667c8",
        "--color-secundario": "#0c93a0",
        "--color-tarjeta": "rgba(255, 255, 255, 0.84)",
        "--color-borde": "rgba(22, 49, 82, 0.12)"
    },
    verde: {
        "--color-fondo-1": "#e4f8df",
        "--color-fondo-2": "#9edc92",
        "--color-fondo-3": "#56b88a",
        "--color-texto": "#173b2d",
        "--color-principal": "#2f8f52",
        "--color-secundario": "#1a7d75",
        "--color-tarjeta": "rgba(255, 255, 255, 0.84)",
        "--color-borde": "rgba(23, 59, 45, 0.12)"
    }
};

let mediaDatabasePromise = null;
const wordGameInstances = new WeakMap();
const supabaseClient = createSupabaseClient();
const userPreferencesState = {
    applyRequestId: 0,
    dailyImage: null,
    dailyImageStatus: "idle",
    elements: null
};
const releaseNotesState = {
    modal: null
};
const bugReportState = {
    modal: null,
    previewUrls: []
};

applyStoredTheme();

document.addEventListener("DOMContentLoaded", async () => {
    loadPublicUserSession();
    setupRevealAnimations();
    initPlanetDecorations();
    initHomeOnboarding();
    await initHomeAdminAccess();
    await renderDynamicContent();
    await initUserPreferences();
    initBugReportUi();
    await initReleaseNotesModal();
    await initSupabaseReleaseModal();
    await initBigBang();
    await initAdminPage();
    await initPublicUserSessionSync();
    initWordGames();
    initCountdown();
    updateUserAuthButton();
    renderAllCommentSections();

    const userAuthBtn = document.getElementById("user-auth-button");
    if (userAuthBtn) userAuthBtn.addEventListener("click", openUserAuthModal);
});

function createSupabaseClient() {
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
        return null;
    }

    if (!hasSupabaseConfig()) {
        return null;
    }

    return window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    });
}

function hasSupabaseConfig() {
    return Boolean(
        SUPABASE_URL &&
        SUPABASE_KEY &&
        !SUPABASE_URL.includes("REEMPLAZA_AQUI") &&
        !SUPABASE_KEY.includes("REEMPLAZA_AQUI")
    );
}

function setupRevealAnimations() {
    observeAnimatedElements(document);
}

function observeAnimatedElements(root) {
    const elements = root.querySelectorAll(".animar:not([data-animado])");

    if (!elements.length) {
        return;
    }

    if (!("IntersectionObserver" in window)) {
        elements.forEach((element) => {
            element.classList.add("visible");
            element.dataset.animado = "true";
        });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add("visible");
            entry.target.dataset.animado = "true";
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.15
    });

    elements.forEach((element) => observer.observe(element));
}

function getStoredItems() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const data = raw ? JSON.parse(raw) : [];
        return Array.isArray(data) ? data : [];
    } catch (error) {
        return [];
    }
}

function saveStoredItems(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// ── Supabase: publicaciones ──────────────────────────────────────────────────

async function getSupabaseItems(section) {
    if (!supabaseClient) return [];
    try {
        let query = supabaseClient
            .from("publicaciones")
            .select("*")
            .order("created_at", { ascending: false });
        if (section) query = query.eq("section", section);
        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map(normalizeSupabaseItem);
    } catch (e) {
        console.error("[Supabase] getSupabaseItems:", e);
        return [];
    }
}

async function getAllSupabaseItems() {
    return getSupabaseItems(null);
}

function normalizeSupabaseItem(row) {
    return {
        id: row.id,
        section: row.section,
        type: row.type,
        title: row.title,
        description: row.description || "",
        mediaUrl: row.media_url || "",
        mediaBlobId: "",
        mediaFileName: "",
        mediaMimeType: "",
        actionUrl: row.action_url || "",
        actionLabel: row.action_label || "",
        authorName: row.author_name || "admin",
        createdAt: row.created_at,
        _fromSupabase: true
    };
}

async function saveSupabaseItem(item) {
    if (!supabaseClient) throw new Error("Sin conexion a Supabase.");
    const { error } = await supabaseClient.from("publicaciones").insert({
        id: item.id,
        section: item.section,
        type: item.type,
        title: item.title,
        description: item.description || null,
        media_url: item.mediaUrl || null,
        action_url: item.actionUrl || null,
        action_label: item.actionLabel || null,
        author_name: item.authorName || "admin"
    });
    if (error) throw error;
}

async function deleteSupabaseItem(itemId) {
    if (!supabaseClient) throw new Error("Sin conexion a Supabase.");
    const { data } = await supabaseClient
        .from("publicaciones")
        .select("media_url")
        .eq("id", itemId)
        .single();
    if (data?.media_url && data.media_url.includes("/storage/v1/object/public/media/")) {
        const filePath = data.media_url.split("/storage/v1/object/public/media/")[1];
        await supabaseClient.storage.from("media").remove([filePath]).catch(() => {});
    }
    const { error } = await supabaseClient.from("publicaciones").delete().eq("id", itemId);
    if (error) throw error;
}

async function uploadFileToSupabase(file, folder) {
    if (!supabaseClient) throw new Error("Sin conexion a Supabase.");
    const ext = file.name.split(".").pop();
    const fileName = `${folder}/${createId()}.${ext}`;
    const { error } = await supabaseClient.storage.from("media").upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type
    });
    if (error) throw error;
    const { data: urlData } = supabaseClient.storage.from("media").getPublicUrl(fileName);
    return urlData.publicUrl;
}

// ── Supabase: imagenes diarias ───────────────────────────────────────────────

async function getSupabaseImagenes() {
    if (!supabaseClient) return [];
    try {
        const { data, error } = await supabaseClient
            .from("imagenes_diarias")
            .select("*")
            .order("created_at", { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (e) {
        return [];
    }
}

async function saveSupabaseImagen(entry) {
    if (!supabaseClient) throw new Error("Sin conexion a Supabase.");
    const { error } = await supabaseClient.from("imagenes_diarias").insert({
        id: entry.id,
        title: entry.title,
        description: entry.description || null,
        date: entry.date || null,
        media_url: entry.mediaUrl,
        author_name: entry.authorName || "admin"
    });
    if (error) throw error;
}

async function deleteSupabaseImagen(itemId) {
    if (!supabaseClient) throw new Error("Sin conexion a Supabase.");
    const { data } = await supabaseClient.from("imagenes_diarias").select("media_url").eq("id", itemId).single();
    if (data?.media_url && data.media_url.includes("/storage/v1/object/public/media/")) {
        const filePath = data.media_url.split("/storage/v1/object/public/media/")[1];
        await supabaseClient.storage.from("media").remove([filePath]).catch(() => {});
    }
    const { error } = await supabaseClient.from("imagenes_diarias").delete().eq("id", itemId);
    if (error) throw error;
}

async function getDailyImageFromSupabase() {
    const entries = await getSupabaseImagenes();
    if (!entries.length) return null;
    const dateKey = getCurrentDateKey();
    const normalized = entries.map(e => ({
        id: e.id,
        title: e.title || "Imagen diaria",
        description: e.description || "",
        date: e.date || "",
        mediaUrl: e.media_url || "",
        createdAt: e.created_at
    }));
    const selected = pickEntryByDate(normalized, dateKey);
    if (!selected || !selected.mediaUrl) return null;
    return { url: selected.mediaUrl, title: selected.title, description: selected.description, date: selected.date };
}

// ── Supabase: novedades ──────────────────────────────────────────────────────

const SUPABASE_RELEASE_SEEN_KEY = "planetaRebeldeSupabaseRelease";

async function getLatestSupabaseNovedad() {
    if (!supabaseClient) return null;
    try {
        const { data, error } = await supabaseClient
            .from("novedades")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(1);
        if (error) throw error;
        return data?.[0] || null;
    } catch (e) {
        return null;
    }
}

async function getAllSupabaseNovedades() {
    if (!supabaseClient) return [];
    try {
        const { data, error } = await supabaseClient
            .from("novedades")
            .select("*")
            .order("created_at", { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (e) {
        return [];
    }
}

async function saveSupabaseNovedad(item) {
    if (!supabaseClient) throw new Error("Sin conexion a Supabase.");
    const { error } = await supabaseClient.from("novedades").insert({
        id: item.id,
        version: item.version,
        titulo: item.titulo || null,
        descripcion: item.descripcion || null,
        changes: item.changes,
        author_name: item.authorName || "admin"
    });
    if (error) throw error;
}

async function deleteSupabaseNovedad(id) {
    if (!supabaseClient) throw new Error("Sin conexion a Supabase.");
    const { error } = await supabaseClient.from("novedades").delete().eq("id", id);
    if (error) throw error;
}

function formatVersionLabel(version) {
    const raw = String(version || "").trim();
    if (!raw) {
        return APP_VERSION;
    }
    return /^v/i.test(raw) ? raw : `v${raw}`;
}

function hasSeenSupabaseRelease(version) {
    return localStorage.getItem(SUPABASE_RELEASE_SEEN_KEY) === String(version);
}

function markSupabaseReleaseAsSeen(version) {
    localStorage.setItem(SUPABASE_RELEASE_SEEN_KEY, String(version));
}

async function initSupabaseReleaseModal() {
    if (document.body?.dataset.page === "admin") return;
    const novedad = await getLatestSupabaseNovedad();
    if (!novedad) return;
    const versionKey = `${novedad.version}-${novedad.id}`;
    if (hasSeenSupabaseRelease(versionKey)) return;
    await waitForWelcomeModalToClose();
    showSupabaseReleaseModal(novedad, versionKey);
}

function showSupabaseReleaseModal(novedad, versionKey, options = {}) {
    const existing = document.getElementById("supabase-release-modal");
    if (existing) existing.remove();

    const changes = String(novedad.changes || "").split("\n").filter(Boolean);
    const versionLabel = formatVersionLabel(novedad.version);
    const shouldMarkSeen = options.markSeen !== false;
    const modal = document.createElement("div");
    modal.id = "supabase-release-modal";
    modal.className = "onboarding-modal release-notes-modal supabase-release-modal oculto";
    modal.setAttribute("aria-hidden", "true");

    modal.innerHTML = `
        <div class="onboarding-card release-notes-card">
            <div class="release-notes-hero">
                <div class="release-notes-topline">
                    <span class="etiqueta">Novedades</span>
                    <span class="version-pill version-pill-light">Version ${versionLabel}</span>
                </div>
                <h2>${novedad.titulo || "Planeta rebelde " + versionLabel}</h2>
                <p>${novedad.descripcion || "Nueva version disponible con mejoras y cambios."}</p>
            </div>
            <div class="release-notes-grid supabase-release-modal">
                ${changes.map(c => `<article class="release-note-item"><p>${c}</p></article>`).join("")}
            </div>
            <div class="fila-botones release-notes-actions">
                <button class="boton-accion" type="button" id="sr-close-1">Empezar</button>
                <button class="boton-secundario-linea" type="button" id="sr-close-2">Lo he visto</button>
            </div>
        </div>
    `;

    const close = () => {
        if (shouldMarkSeen && versionKey) {
            markSupabaseReleaseAsSeen(versionKey);
        }
        modal.classList.add("oculto");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("sin-scroll");
    };

    modal.querySelector("#sr-close-1").addEventListener("click", close);
    modal.querySelector("#sr-close-2").addEventListener("click", close);

    document.body.appendChild(modal);

    requestAnimationFrame(() => {
        modal.classList.remove("oculto");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("sin-scroll");
    });
}

async function openLatestReleaseNotesModal(forceOpen = false) {
    const latestSupabaseRelease = await getLatestSupabaseNovedad();

    if (latestSupabaseRelease) {
        const versionKey = `${latestSupabaseRelease.version}-${latestSupabaseRelease.id}`;
        if (forceOpen || !hasSeenSupabaseRelease(versionKey)) {
            await waitForWelcomeModalToClose();
            showSupabaseReleaseModal(latestSupabaseRelease, versionKey, { markSeen: true });
        }
        return;
    }

    await openReleaseNotesModal(forceOpen);
}

// ────────────────────────────────────────────────────────────────────────────

function getOnboardingData() {
    try {
        const raw = localStorage.getItem(ONBOARDING_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        return {
            seen: Boolean(parsed.seen),
            name: String(parsed.name || "").trim(),
            age: String(parsed.age || "").trim(),
            color: normalizeThemeColor(parsed.color),
            themeMode: normalizeThemeMode(parsed.themeMode)
        };
    } catch (error) {
        return {
            seen: false,
            name: "",
            age: "",
            color: "",
            themeMode: "color"
        };
    }
}

function saveOnboardingData(data) {
    const currentData = getOnboardingData();
    const nextData = {
        seen: typeof data.seen === "boolean" ? data.seen : currentData.seen,
        name: typeof data.name === "string" ? data.name.trim() : currentData.name,
        age: typeof data.age === "string" ? data.age.trim() : currentData.age,
        color: normalizeThemeColor(typeof data.color === "string" ? data.color : currentData.color),
        themeMode: normalizeThemeMode(typeof data.themeMode === "string" ? data.themeMode : currentData.themeMode)
    };

    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(nextData));
}

function applyStoredTheme() {
    const data = getOnboardingData();
    applyTheme(data.color);
}

function applyTheme(colorKey) {
    const palette = THEME_PALETTES[String(colorKey || "").toLowerCase()];

    if (!palette) {
        return;
    }

    Object.entries(palette).forEach(([property, value]) => {
        document.documentElement.style.setProperty(property, value);
    });
}

function formatColorName(colorKey) {
    const names = {
        amarillo: "Amarillo",
        blanco: "Blanco",
        azul: "Azul",
        verde: "Verde"
    };

    return names[colorKey] || "Predeterminado";
}

function normalizeThemeColor(value) {
    const normalized = String(value || "").trim().toLowerCase();
    return THEME_PALETTES[normalized] ? normalized : "";
}

function normalizeThemeMode(value) {
    return String(value || "").trim().toLowerCase() === "daily-image"
        ? "daily-image"
        : "color";
}

function getCurrentDateKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function hashText(value) {
    return Array.from(String(value || "")).reduce((hash, character) => {
        return ((hash << 5) - hash + character.charCodeAt(0)) | 0;
    }, 0);
}

function pickEntryByDate(entries, dateKey = getCurrentDateKey()) {
    if (!Array.isArray(entries) || !entries.length) {
        return null;
    }

    const datedEntry = entries.find((entry) => String(entry?.date || "").trim() === dateKey);

    if (datedEntry) {
        return datedEntry;
    }

    const undatedEntries = entries.filter((entry) => !String(entry?.date || "").trim());

    if (!undatedEntries.length) {
        return null;
    }

    const index = Math.abs(hashText(dateKey)) % undatedEntries.length;
    return undatedEntries[index];
}

function hasDailyImageManifestConfig() {
    return Boolean(String(DAILY_IMAGE_MANIFEST_URL || "").trim());
}

function getDailyImageHelpText() {
    if (hasDailyImageManifestConfig()) {
        return "La imagen diaria cambia automaticamente con las imagenes preparadas para cada dia.";
    }

    return "La imagen diaria cambia automaticamente con las imagenes que guarde el equipo.";
}

function buildPreferencesSummary(data = getOnboardingData()) {
    if (data.themeMode === "daily-image") {
        if (userPreferencesState.dailyImage?.title) {
            return `Modo imagen diaria activo. Hoy se muestra: ${userPreferencesState.dailyImage.title}.`;
        }

        if (userPreferencesState.dailyImageStatus === "empty") {
            return "Modo imagen diaria activo. En cuanto haya fotos publicadas o un JSON externo configurado, se actualizara automaticamente.";
        }

        return "Modo imagen diaria activo. La web cambiara la imagen automaticamente cada dia.";
    }

    if (data.color) {
        return `Color ${formatColorName(data.color)} activo. Puedes cambiarlo cuando quieras.`;
    }

    return "Estas usando el estilo original. Puedes cambiar tu nombre y el aspecto cuando quieras.";
}

function buildBugReportMailto(extraLines = []) {
    const subject = encodeURIComponent("Reporte de bug - Planeta rebelde");
    const lines = [
        "Hola, he encontrado un error en la web.",
        "",
        "Que ha pasado:",
        "",
        "En que pagina ocurrio:",
        window.location.href,
        "",
        `Version: ${APP_VERSION}`,
        "",
        ...extraLines
    ];

    return `mailto:${BUG_REPORT_EMAIL}?subject=${subject}&body=${encodeURIComponent(lines.join("\n"))}`;
}

function initBugReportUi() {
    if (document.body?.dataset.page === "admin") {
        return;
    }

    ensureBugReportModal();
}

function ensureBugReportModal() {
    if (bugReportState.modal?.isConnected) {
        return bugReportState.modal;
    }

    const modal = buildBugReportModal();
    const form = modal.querySelector("#bug-report-form");
    const screenshotInput = modal.querySelector("#bug-report-screenshots");
    const closeButtons = modal.querySelectorAll("[data-close-bug-report]");
    const formButtons = document.querySelectorAll("[data-open-bug-report]");

    closeButtons.forEach((button) => {
        button.addEventListener("click", closeBugReportModal);
    });

    formButtons.forEach((button) => {
        button.addEventListener("click", () => {
            openBugReportModal();
        });
    });

    screenshotInput?.addEventListener("change", () => {
        renderBugReportPreview(screenshotInput.files);
    });

    form?.addEventListener("submit", async (event) => {
        event.preventDefault();
        await submitBugReport(form);
    });

    document.body.appendChild(modal);
    bugReportState.modal = modal;
    return modal;
}

function buildBugReportModal() {
    const modal = document.createElement("div");
    modal.id = "bug-report-modal";
    modal.className = "onboarding-modal bug-report-modal oculto";
    modal.setAttribute("aria-hidden", "true");

    modal.innerHTML = `
        <div class="onboarding-card bug-report-card">
            <div class="release-notes-topline">
                <span class="etiqueta">Reportar bug</span>
                <span class="version-pill version-pill-light">Version ${APP_VERSION}</span>
            </div>

            <h2>Cuéntanos que ha fallado</h2>
            <p>Rellena el formulario y enviaremos el aviso a ${BUG_REPORT_EMAIL} sin sacarte de la web. Si es la primera vez o se ha cambiado el correo destino, revisa ese Gmail para activar FormSubmit.</p>

            <div id="bug-report-status" class="estado ok">Describe el error y, si puedes, adjunta capturas de pantalla. Si no llegan, revisa spam y el correo de activacion de FormSubmit.</div>

            <form id="bug-report-form" class="formulario bug-report-form" enctype="multipart/form-data">
                <div class="campo">
                    <label for="bug-report-device-type">Tipo de dispositivo</label>
                    <select id="bug-report-device-type" name="device_type" required>
                        <option value="">Selecciona una opcion</option>
                        <option value="Ordenador">Ordenador</option>
                        <option value="Movil">Movil</option>
                        <option value="Tablet">Tablet</option>
                    </select>
                </div>

                <div class="campo">
                    <label for="bug-report-device-model">Modelo</label>
                    <input id="bug-report-device-model" name="device_model" type="text" placeholder="Ejemplo: Samsung A54, iPad Air, HP EliteBook" required>
                </div>

                <div class="campo bug-report-full">
                    <label for="bug-report-problem">Que ha pasado</label>
                    <textarea id="bug-report-problem" name="problem_description" placeholder="Explica el problema con el mayor detalle posible" required></textarea>
                </div>

                <div class="campo bug-report-full">
                    <label for="bug-report-screenshots">Capturas de pantalla</label>
                    <input id="bug-report-screenshots" name="attachment" type="file" accept="image/*" multiple>
                    <p class="upload-note">Puedes adjuntar varias capturas. El total no debe pasar de 10 MB.</p>
                    <div id="bug-report-preview" class="bug-report-preview vacio">
                        <strong>Aun no has seleccionado capturas.</strong>
                        <p>Si las anades, las enviaremos junto al reporte.</p>
                    </div>
                </div>

                <input type="hidden" name="_subject" value="Reporte de bug - Planeta rebelde v${APP_VERSION}">
                <input type="hidden" name="_template" value="table">
                <input type="hidden" name="_captcha" value="false">
                <input type="hidden" name="_honey" value="">

                <div class="fila-botones bug-report-actions">
                    <button class="boton-accion" type="submit">Enviar bug</button>
                    <button class="boton-secundario-linea" type="button" data-close-bug-report>Cancelar</button>
                </div>
            </form>
        </div>
    `;

    return modal;
}

function openBugReportModal() {
    const modal = ensureBugReportModal();
    const form = modal.querySelector("#bug-report-form");
    const deviceType = modal.querySelector("#bug-report-device-type");
    const modelField = modal.querySelector("#bug-report-device-model");
    const problemField = modal.querySelector("#bug-report-problem");
    const status = modal.querySelector("#bug-report-status");

    form?.reset();
    renderBugReportPreview(null);
    showStatus(status, "ok", "Describe el error y, si puedes, adjunta capturas de pantalla.");

    const detectedType = detectDeviceType();

    if (deviceType && detectedType) {
        deviceType.value = detectedType;
    }

    const guessedModel = guessDeviceModel();

    if (modelField && guessedModel) {
        modelField.value = guessedModel;
    }

    modal.classList.remove("oculto");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("sin-scroll");

    requestAnimationFrame(() => {
        problemField?.focus();
    });
}

function closeBugReportModal() {
    const modal = bugReportState.modal;

    if (!modal) {
        return;
    }

    modal.classList.add("oculto");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("sin-scroll");
}

function renderBugReportPreview(fileList) {
    const modal = bugReportState.modal;
    const preview = modal?.querySelector("#bug-report-preview");

    if (!preview) {
        return;
    }

    bugReportState.previewUrls.forEach((url) => URL.revokeObjectURL(url));
    bugReportState.previewUrls = [];
    preview.innerHTML = "";

    const files = Array.from(fileList || []);

    if (!files.length) {
        preview.className = "bug-report-preview vacio";
        preview.innerHTML = "<strong>Aun no has seleccionado capturas.</strong><p>Si las anades, las enviaremos junto al reporte.</p>";
        return;
    }

    preview.className = "bug-report-preview";

    files.forEach((file) => {
        const item = document.createElement("article");
        item.className = "bug-report-preview-item";

        const info = document.createElement("div");
        info.className = "bug-report-preview-info";
        info.innerHTML = `<strong>${file.name}</strong><span>${formatFileSize(file.size)}</span>`;
        item.appendChild(info);

        if (file.type.startsWith("image/")) {
            const image = document.createElement("img");
            const imageUrl = URL.createObjectURL(file);
            bugReportState.previewUrls.push(imageUrl);
            image.src = imageUrl;
            image.alt = file.name;
            image.loading = "lazy";
            item.appendChild(image);
        }

        preview.appendChild(item);
    });
}

async function submitBugReport(form) {
    const modal = bugReportState.modal;
    const status = modal?.querySelector("#bug-report-status");
    const submitButton = form.querySelector("button[type='submit']");
    const data = new FormData(form);
    const files = Array.from(data.getAll("attachment")).filter((value) => value instanceof File && value.size > 0);
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    if (files.some((file) => !file.type.startsWith("image/"))) {
        showStatus(status, "error", "Las capturas deben ser imagenes validas.");
        return;
    }

    if (files.length && totalSize > BUG_REPORT_MAX_TOTAL_SIZE) {
        showStatus(status, "error", "Las capturas pesan demasiado. El total debe ser de 10 MB o menos.");
        return;
    }

    data.append("visitor_name", getOnboardingData().name || "Sin nombre");
    data.append("page_url", window.location.href);
    data.append("page_name", document.body?.dataset.page || "desconocida");
    data.append("app_version", APP_VERSION);
    data.append("browser_info", navigator.userAgent);
    data.append("_url", window.location.href);

    submitButton.disabled = true;
    showStatus(status, "ok", "Enviando el bug...");

    try {
        const response = await fetch(BUG_REPORT_ENDPOINT, {
            method: "POST",
            headers: {
                Accept: "application/json"
            },
            body: data
        });

        if (!response.ok) {
            throw new Error("No se pudo enviar el formulario.");
        }

        showStatus(status, "ok", "Bug enviado. Si es la primera vez con este correo, revisa el Gmail de destino y pulsa el enlace de activacion de FormSubmit.");
        form.reset();
        renderBugReportPreview(null);

        window.setTimeout(() => {
            closeBugReportModal();
        }, 900);
    } catch (error) {
        showStatus(status, "error", `No se ha podido enviar el bug automaticamente. Puedes escribirnos a ${BUG_REPORT_EMAIL}.`);
    } finally {
        submitButton.disabled = false;
    }
}

function detectDeviceType() {
    const agent = navigator.userAgent.toLowerCase();

    if (/tablet|ipad/.test(agent)) {
        return "Tablet";
    }

    if (/mobi|android|iphone/.test(agent)) {
        return "Movil";
    }

    return "Ordenador";
}

function guessDeviceModel() {
    const agent = navigator.userAgent || "";
    const platform = navigator.userAgentData?.platform || navigator.platform || "";

    if (/iphone/i.test(agent)) {
        return "iPhone";
    }

    if (/ipad/i.test(agent)) {
        return "iPad";
    }

    if (/android/i.test(agent)) {
        return "Android";
    }

    return `${platform}`.trim();
}

function formatFileSize(size) {
    if (size >= 1024 * 1024) {
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }

    if (size >= 1024) {
        return `${Math.round(size / 1024)} KB`;
    }

    return `${size} B`;
}

function hasSeenReleaseNotes() {
    return localStorage.getItem(RELEASE_NOTES_SEEN_KEY) === RELEASE_NOTES_VERSION;
}

function markReleaseNotesAsSeen() {
    localStorage.setItem(RELEASE_NOTES_SEEN_KEY, RELEASE_NOTES_VERSION);
}

function updateVisitorText() {
    if (document.body?.dataset.page !== "index") {
        return;
    }

    const greeting = document.getElementById("visitor-greeting");
    const summary = document.getElementById("visitor-summary");
    const data = getOnboardingData();

    if (greeting) {
        greeting.textContent = data.name
            ? `Hola, ${data.name}. Bienvenido a Planeta rebelde.`
            : "Bienvenidos a nuestra asociacion Planeta rebelde.";
    }

    if (!summary) {
        return;
    }

    if (!data.seen) {
        summary.textContent = "Personaliza tu primera visita con el cartel de bienvenida. Despues podras cambiarlo todo desde configuracion.";
        return;
    }

    if (data.themeMode === "daily-image") {
        summary.textContent = userPreferencesState.dailyImage?.title
            ? `Tienes activadas las imagenes diarias. Hoy se muestra: ${userPreferencesState.dailyImage.title}.`
            : "Tienes activadas las imagenes diarias. Puedes cambiarlo cuando quieras desde configuracion.";
        return;
    }

    if (data.color) {
        summary.textContent = `Tu color activo es ${formatColorName(data.color)}. Puedes cambiarlo cuando quieras desde configuracion.`;
        return;
    }

    summary.textContent = "Has saltado la personalizacion inicial. Puedes cambiar tu nombre y el aspecto cuando quieras desde configuracion.";
}

async function initUserPreferences() {
    if (document.body?.dataset.page === "admin") {
        return;
    }

    const mainContent = document.querySelector(".contenido");

    if (!mainContent) {
        return;
    }

    const toolbar = buildUserPreferencesToolbar();
    mainContent.insertBefore(toolbar, mainContent.firstChild);

    userPreferencesState.elements = {
        toolbar,
        summary: toolbar.querySelector("[data-preferences-summary]"),
        heading: toolbar.querySelector("[data-preferences-heading]"),
        toggleButton: toolbar.querySelector("[data-toggle-preferences]"),
        form: toolbar.querySelector("#preferences-form"),
        nameInput: toolbar.querySelector("#preferences-name"),
        modeInputs: toolbar.querySelectorAll("input[name='themeMode']"),
        colorButtons: toolbar.querySelectorAll("[data-theme-color]"),
        dailyButton: toolbar.querySelector("[data-theme-mode='daily-image']"),
        note: toolbar.querySelector("[data-preferences-note]"),
        openNotesButtons: toolbar.querySelectorAll("[data-open-release-notes]"),
        resetDataButton: toolbar.querySelector("[data-reset-user-data]")
    };

    bindUserPreferencesToolbar();
    updateUserPreferencesUi();
    await applyUserAppearance();
}

async function initReleaseNotesModal() {
    if (document.body?.dataset.page === "admin") {
        return;
    }

    const latestSupabaseRelease = await getLatestSupabaseNovedad();
    if (latestSupabaseRelease) {
        return;
    }

    await openReleaseNotesModal();
}

async function openReleaseNotesModal(forceOpen = false) {
    if (document.body?.dataset.page === "admin") {
        return;
    }

    if (!forceOpen && hasSeenReleaseNotes()) {
        return;
    }

    const modal = ensureReleaseNotesModal();

    await waitForWelcomeModalToClose();

    modal.classList.remove("oculto");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("sin-scroll");
}

function closeReleaseNotesModal() {
    const modal = releaseNotesState.modal;

    if (!modal) {
        return;
    }

    markReleaseNotesAsSeen();
    modal.classList.add("oculto");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("sin-scroll");
}

function ensureReleaseNotesModal() {
    if (releaseNotesState.modal?.isConnected) {
        return releaseNotesState.modal;
    }

    const modal = buildReleaseNotesModal();
    modal.querySelectorAll("[data-close-release-notes]").forEach((button) => {
        button.addEventListener("click", closeReleaseNotesModal);
    });

    document.body.appendChild(modal);
    releaseNotesState.modal = modal;
    return modal;
}

function buildReleaseNotesModal() {
    const modal = document.createElement("div");
    modal.id = "release-notes-modal";
    modal.className = "onboarding-modal release-notes-modal oculto";
    modal.setAttribute("aria-hidden", "true");

    modal.innerHTML = `
        <div class="onboarding-card release-notes-card">
            <div class="release-notes-hero">
                <div class="release-notes-topline">
                    <span class="etiqueta">Novedades</span>
                    <span class="version-pill version-pill-light">Version ${APP_VERSION}</span>
                </div>
                <h2>Planeta rebelde ${APP_VERSION}</h2>
                <p>La web estrena una version mas cuidada, mas flexible y con herramientas nuevas para admins y usuarios.</p>
            </div>

            <div class="release-notes-grid">
                ${buildReleaseNotesCardsHtml()}
            </div>

            <div class="fila-botones release-notes-actions">
                <button class="boton-accion" type="button" data-close-release-notes>Empezar</button>
                <button class="boton-secundario-linea" type="button" data-close-release-notes>Lo he visto</button>
            </div>
        </div>
    `;

    return modal;
}

function buildReleaseNotesCardsHtml() {
    const notes = [
        {
            title: "Museo interactivo",
            text: "Llega la seccion Museo con planetas y modelos 3D que se pueden girar y explorar con el dedo o con el cursor."
        },
        {
            title: "Eventos astronómicos",
            text: "La nueva seccion Eventos muestra las proximas citas del cielo y tambien destaca si hay alguna activa en ese momento."
        },
        {
            title: "Ambientacion espacial",
            text: "La web se decora con mas planetas, fondos animados y detalles visuales que refuerzan la atmosfera del proyecto."
        },
        {
            title: "Colores mejor equilibrados",
            text: "Se han ajustado tonos y contraste para que el contenido combine mejor con los fondos e imagenes."
        },
        {
            title: "Imagen diaria arreglada",
            text: "El fallo que impedia mostrar algunas imagenes del dia ya esta corregido."
        },
        {
            title: "Comentarios y likes",
            text: "La comunidad ya puede comentar y dar me gusta, con un control para que cada usuario solo deje un like por publicacion."
        },
        {
            title: "Moderacion automatica",
            text: "Los comentarios ofensivos se filtran mejor para mantener un espacio mas limpio y agradable."
        },
        {
            title: "Logo y acceso rapido",
            text: "El logo ya forma parte de la cabecera y se añade el boton Big Bang como acceso destacado."
        },
        {
            title: "Cuenta atras y sonido",
            text: "La portada incorpora la cuenta regresiva para año nuevo y nuevos detalles sonoros."
        },
        {
            title: "Sesion y personalizacion",
            text: "El sistema de inicio de sesion ya esta integrado y abre mas opciones de personalizacion para cada usuario."
        },
        {
            title: "Avisos y panel admin",
            text: "Se preparan herramientas para lanzar actualizaciones a los visitantes y se han hecho mas intuitivos los botones del panel admin."
        },
        {
            title: "Juegos mas estables",
            text: "Se han corregido errores en la zona de juegos y se han pulido varios fallos generales de la experiencia."
        }
    ];

    return notes.map((note) => `
        <article class="release-note-item">
            <strong>${note.title}</strong>
            <p>${note.text}</p>
        </article>
    `).join("");
}

function waitForWelcomeModalToClose() {
    const onboardingModal = document.getElementById("onboarding-modal");

    if (!onboardingModal || onboardingModal.classList.contains("oculto")) {
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        const observer = new MutationObserver(() => {
            if (!onboardingModal.classList.contains("oculto")) {
                return;
            }

            observer.disconnect();
            resolve();
        });

        observer.observe(onboardingModal, {
            attributes: true,
            attributeFilter: ["class"]
        });
    });
}

function buildUserPreferencesToolbar() {
    const toolbar = document.createElement("section");
    toolbar.className = "panel preferences-toolbar";

    const colorButtons = Object.entries(THEME_PALETTES).map(([colorKey, palette]) => {
        return `
            <button
                class="theme-circle"
                type="button"
                data-theme-color="${colorKey}"
                aria-label="Usar color ${formatColorName(colorKey)}"
                title="${formatColorName(colorKey)}"
                style="--theme-circle-start: ${palette["--color-fondo-1"]}; --theme-circle-middle: ${palette["--color-fondo-2"]}; --theme-circle-end: ${palette["--color-principal"]};"
            ><span class="theme-circle-core"></span></button>
        `;
    }).join("");

    toolbar.innerHTML = `
        <div class="preferences-toolbar-top">
            <div class="preferences-copy">
                <div class="preferences-copy-top">
                    <span class="etiqueta">Configuracion</span>
                    <span class="version-pill">Version ${APP_VERSION}</span>
                </div>
                <h2 data-preferences-heading>Personaliza tu visita</h2>
                <p data-preferences-summary>Puedes cambiar el color, usar imagen diaria y editar tu nombre cuando quieras.</p>
            </div>

            <div class="preferences-actions">
                <div class="quick-theme-buttons" role="group" aria-label="Cambiar rapidamente el estilo">
                    ${colorButtons}
                    <button
                        class="theme-circle theme-circle-image"
                        type="button"
                        data-theme-mode="daily-image"
                        aria-label="Activar imagen diaria"
                        title="Imagen diaria"
                    >
                        <span class="theme-circle-core">Dia</span>
                    </button>
                </div>

                <div class="preferences-toolbar-buttons">
                    <button class="boton-accion bug-report-button" type="button" data-open-bug-report>Reportar bug</button>
                    <button class="boton-secundario-linea" type="button" data-open-release-notes>Ver novedades</button>
                    <button class="boton-secundario-linea" type="button" data-toggle-preferences>Configuracion</button>
                </div>
            </div>
        </div>

        <form id="preferences-form" class="preferences-form oculto">
            <div class="campo">
                <label for="preferences-name">Tu nombre</label>
                <input id="preferences-name" name="name" type="text" placeholder="Como quieres que te llamemos">
            </div>

            <div class="campo">
                <span class="preferences-label">Fondo de la web</span>

                <div class="preferences-mode-grid">
                    <label class="preferences-option">
                        <input type="radio" name="themeMode" value="color">
                        <span>Colores</span>
                        <small>Usa los botones circulares de arriba para cambiar rapido.</small>
                    </label>

                    <label class="preferences-option">
                        <input type="radio" name="themeMode" value="daily-image">
                        <span>Imagen diaria</span>
                        <small>La web cambia la imagen automaticamente cada dia.</small>
                    </label>
                </div>

                <p class="upload-note" data-preferences-note></p>
            </div>

            <div class="fila-botones">
                <button class="boton-accion" type="submit">Guardar configuracion</button>
                <button class="boton-secundario-linea" type="button" data-open-release-notes>Ver novedades</button>
                <button class="boton-secundario-linea" type="button" data-reset-user-data>Borrar mis datos</button>
                <button class="boton-secundario-linea" type="button" data-close-preferences>Cerrar</button>
            </div>
        </form>
    `;

    return toolbar;
}

function bindUserPreferencesToolbar() {
    const elements = userPreferencesState.elements;

    if (!elements) {
        return;
    }

    elements.toggleButton?.addEventListener("click", () => {
        const shouldOpen = elements.form?.classList.contains("oculto");
        toggleUserPreferencesForm(shouldOpen);
    });

    elements.form?.querySelector("[data-close-preferences]")?.addEventListener("click", () => {
        toggleUserPreferencesForm(false);
    });

    elements.openNotesButtons.forEach((button) => {
        button.addEventListener("click", async () => {
            await openLatestReleaseNotesModal(true);
        });
    });

    elements.resetDataButton?.addEventListener("click", () => {
        resetUserExperience();
    });

    elements.colorButtons.forEach((button) => {
        button.addEventListener("click", async () => {
            const current = getOnboardingData();

            saveOnboardingData({
                seen: true,
                name: current.name,
                age: current.age,
                color: button.dataset.themeColor,
                themeMode: "color"
            });

            await applyUserAppearance();
        });
    });

    elements.dailyButton?.addEventListener("click", async () => {
        const current = getOnboardingData();

        saveOnboardingData({
            seen: true,
            name: current.name,
            age: current.age,
            color: current.color,
            themeMode: "daily-image"
        });

        await applyUserAppearance();
    });

    elements.form?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const current = getOnboardingData();
        const formData = new FormData(elements.form);

        saveOnboardingData({
            seen: true,
            name: String(formData.get("name") || "").trim(),
            age: current.age,
            color: current.color,
            themeMode: String(formData.get("themeMode") || "color")
        });

        await applyUserAppearance();
        toggleUserPreferencesForm(false);
    });
}

function toggleUserPreferencesForm(shouldOpen) {
    const elements = userPreferencesState.elements;

    if (!elements?.form || !elements.toggleButton) {
        return;
    }

    const open = typeof shouldOpen === "boolean"
        ? shouldOpen
        : elements.form.classList.contains("oculto");

    elements.form.classList.toggle("oculto", !open);
    elements.toggleButton.textContent = open ? "Cerrar configuracion" : "Configuracion";
    elements.toggleButton.setAttribute("aria-expanded", String(open));
}

function resetUserExperience() {
    const confirmed = window.confirm("Se borraran tu nombre, tu color, el modo elegido y el aviso de novedades para empezar como si entraras por primera vez. Quieres seguir?");

    if (!confirmed) {
        return;
    }

    localStorage.removeItem(ONBOARDING_KEY);
    localStorage.removeItem(RELEASE_NOTES_SEEN_KEY);
    localStorage.removeItem(DAILY_IMAGE_CACHE_KEY);
    sessionStorage.removeItem(AUTH_FLASH_KEY);

    window.location.href = "index.html";
}

function updateUserPreferencesUi() {
    const elements = userPreferencesState.elements;

    if (!elements) {
        return;
    }

    const data = getOnboardingData();

    if (elements.heading) {
        elements.heading.textContent = data.name
            ? `Hola, ${data.name}`
            : "Personaliza tu visita";
    }

    if (elements.summary) {
        elements.summary.textContent = buildPreferencesSummary(data);
    }

    if (elements.note) {
        elements.note.textContent = getDailyImageHelpText();
    }

    if (elements.nameInput) {
        elements.nameInput.value = data.name;
    }

    elements.modeInputs.forEach((input) => {
        input.checked = input.value === data.themeMode;
    });

    elements.colorButtons.forEach((button) => {
        const isActive = data.themeMode === "color" && button.dataset.themeColor === data.color;
        button.classList.toggle("activo", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });

    if (elements.dailyButton) {
        const isActive = data.themeMode === "daily-image";
        elements.dailyButton.classList.toggle("activo", isActive);
        elements.dailyButton.setAttribute("aria-pressed", String(isActive));
    }
}

async function applyUserAppearance() {
    const requestId = ++userPreferencesState.applyRequestId;
    const data = getOnboardingData();

    applyTheme(data.color);

    if (data.themeMode !== "daily-image") {
        clearDailyImageBackground();
        userPreferencesState.dailyImage = null;
        userPreferencesState.dailyImageStatus = "color";
        updateUserPreferencesUi();
        updateVisitorText();
        return;
    }

    const dailyImage = await getDailyImageForToday();

    if (requestId !== userPreferencesState.applyRequestId) {
        return;
    }

    if (dailyImage?.url) {
        applyDailyImageBackground(dailyImage.url);
        userPreferencesState.dailyImage = dailyImage;
        userPreferencesState.dailyImageStatus = "ready";
    } else {
        clearDailyImageBackground();
        userPreferencesState.dailyImage = null;
        userPreferencesState.dailyImageStatus = "empty";
    }

    updateUserPreferencesUi();
    updateVisitorText();
}

function applyDailyImageBackground(url) {
    if (!document.body) return;
    document.body.classList.add("modo-imagen-diaria");
    document.body.style.setProperty("--daily-image-url", `url("${escapeCssUrl(url)}")`);
    applyDailyImageContrast(url);
}

function applyDailyImageContrast(imageUrl) {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
        try {
            const canvas = document.createElement("canvas");
            canvas.width = 50; canvas.height = 50;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, 50, 50);
            const d = ctx.getImageData(0, 0, 50, 50).data;
            let brightness = 0;
            for (let i = 0; i < d.length; i += 4) {
                brightness += (d[i] * 299 + d[i+1] * 587 + d[i+2] * 114) / 1000;
            }
            brightness /= (d.length / 4);
            document.body.classList.toggle("fondo-oscuro", brightness < 110);
        } catch (e) {
            document.body.classList.remove("fondo-oscuro");
        }
    };
    img.onerror = () => document.body.classList.remove("fondo-oscuro");
    img.src = imageUrl;
}

function clearDailyImageBackground() {
    if (!document.body) return;
    document.body.classList.remove("modo-imagen-diaria");
    document.body.classList.remove("fondo-oscuro");
    document.body.style.removeProperty("--daily-image-url");
}

async function getDailyImageForToday() {
    // 1. Intentar desde Supabase (visible para todos)
    const supabaseImage = await getDailyImageFromSupabase();
    if (supabaseImage?.url) return supabaseImage;

    // 2. Fallback: biblioteca local del admin
    const adminLibraryImage = await getDailyImageFromAdminLibrary();
    if (adminLibraryImage?.url) return adminLibraryImage;

    // 3. Fallback: manifest remoto
    const remoteImage = await getDailyImageFromRemoteManifest();
    if (remoteImage?.url) return remoteImage;

    // 4. Fallback: publicaciones con foto
    return getDailyImageFromPublishedContent();
}

async function getDailyImageFromRemoteManifest() {
    if (!hasDailyImageManifestConfig()) {
        return null;
    }

    const dateKey = getCurrentDateKey();
    const cached = getDailyImageCache();

    if (cached?.dateKey === dateKey && cached.manifestUrl === DAILY_IMAGE_MANIFEST_URL && cached.image?.url) {
        return cached.image;
    }

    try {
        const response = await fetch(DAILY_IMAGE_MANIFEST_URL, {
            cache: "no-store"
        });

        if (!response.ok) {
            return null;
        }

        const payload = await response.json();
        const entries = normalizeDailyImageEntries(payload);
        const selected = pickEntryByDate(entries, dateKey);

        if (selected) {
            saveDailyImageCache({
                dateKey,
                manifestUrl: DAILY_IMAGE_MANIFEST_URL,
                image: selected
            });
        }

        return selected;
    } catch (error) {
        return null;
    }
}

function normalizeDailyImageEntries(payload) {
    const source = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.images)
            ? payload.images
            : [];

    return source
        .map((entry, index) => normalizeDailyImageEntry(entry, index))
        .filter(Boolean);
}

function normalizeDailyImageEntry(entry, index) {
    if (!entry) {
        return null;
    }

    if (typeof entry === "string") {
        const url = entry.trim();

        if (!url) {
            return null;
        }

        return {
            url,
            title: `Imagen diaria ${index + 1}`,
            description: "",
            date: ""
        };
    }

    const rawUrl = String(entry.url || entry.image || entry.src || "").trim();

    if (!rawUrl) {
        return null;
    }

    let resolvedUrl = rawUrl;

    try {
        resolvedUrl = new URL(rawUrl, DAILY_IMAGE_MANIFEST_URL).href;
    } catch (error) {
        resolvedUrl = rawUrl;
    }

    return {
        url: resolvedUrl,
        title: String(entry.title || entry.name || `Imagen diaria ${index + 1}`).trim(),
        description: String(entry.description || entry.credit || "").trim(),
        date: String(entry.date || "").trim()
    };
}

function getDailyImageCache() {
    try {
        const raw = localStorage.getItem(DAILY_IMAGE_CACHE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        return null;
    }
}

function saveDailyImageCache(value) {
    localStorage.setItem(DAILY_IMAGE_CACHE_KEY, JSON.stringify(value));
}

function clearDailyImageCache() {
    localStorage.removeItem(DAILY_IMAGE_CACHE_KEY);
}

function getDailyImageLibrary() {
    try {
        const raw = localStorage.getItem(DAILY_IMAGE_LIBRARY_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
}

function saveDailyImageLibrary(entries) {
    localStorage.setItem(DAILY_IMAGE_LIBRARY_KEY, JSON.stringify(entries));
    clearDailyImageCache();
}

async function getDailyImageFromAdminLibrary() {
    const entries = getDailyImageLibrary()
        .filter((entry) => isImagePublication(entry))
        .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));

    const selectedEntry = pickEntryByDate(entries);

    if (!selectedEntry) {
        return null;
    }

    const mediaSource = await resolveMediaSource(selectedEntry);

    if (!mediaSource.url || mediaSource.missing || mediaSource.kind !== "image") {
        return null;
    }

    return {
        url: mediaSource.url,
        title: selectedEntry.title || "Imagen diaria",
        description: selectedEntry.description || "",
        date: selectedEntry.date || ""
    };
}

async function getDailyImageFromPublishedContent() {
    const imageItems = getStoredItems()
        .filter((item) => isImagePublication(item))
        .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));

    const selectedItem = pickEntryByDate(imageItems);

    if (!selectedItem) {
        return null;
    }

    const mediaSource = await resolveMediaSource(selectedItem);

    if (!mediaSource.url || mediaSource.missing || mediaSource.kind !== "image") {
        return null;
    }

    return {
        url: mediaSource.url,
        title: selectedItem.title || "Imagen diaria",
        description: selectedItem.description || "",
        date: ""
    };
}

function isImagePublication(item) {
    if (!item) {
        return false;
    }

    if (String(item.type || "").trim().toLowerCase() === "foto") {
        return true;
    }

    if (String(item.mediaMimeType || "").trim().toLowerCase().startsWith("image/")) {
        return true;
    }

    return isImage(String(item.mediaUrl || "").trim());
}

function escapeCssUrl(value) {
    return String(value || "")
        .replace(/\\/g, "\\\\")
        .replace(/"/g, "\\\"");
}

function initHomeOnboarding() {
    if (document.body.dataset.page !== "index") {
        return;
    }

    const modal = document.getElementById("onboarding-modal");
    const form = document.getElementById("onboarding-form");
    const skipButton = document.getElementById("onboarding-skip");
    const adminToggle = document.getElementById("onboarding-admin-toggle");
    const adminPanel = document.getElementById("onboarding-admin-panel");
    const adminDismissButton = document.getElementById("onboarding-admin-dismiss");

    if (!modal || !form || !skipButton) {
        return;
    }

    const currentData = getOnboardingData();
    const nameInput = form.querySelector("input[name='visitorName']");
    const colorInput = currentData.color
        ? form.querySelector(`input[name='favoriteColor'][value='${currentData.color}']`)
        : null;

    if (nameInput) {
        nameInput.value = currentData.name;
    }

    if (colorInput) {
        colorInput.checked = true;
    }

    const closeModal = () => {
        modal.classList.add("oculto");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("sin-scroll");
    };

    const openModal = () => {
        modal.classList.remove("oculto");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("sin-scroll");
    };

    const markOnboardingAsSeenAndClose = () => {
        const current = getOnboardingData();

        saveOnboardingData({
            seen: true,
            name: current.name,
            color: current.color,
            themeMode: current.themeMode
        });

        applyUserAppearance();
        closeModal();
    };

    updateVisitorText();

    if (getOnboardingData().seen) {
        closeModal();
    } else {
        openModal();
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const selectedColor = String(formData.get("favoriteColor") || "").trim().toLowerCase();
        const payload = {
            seen: true,
            name: String(formData.get("visitorName") || "").trim(),
            color: selectedColor,
            themeMode: "color"
        };

        saveOnboardingData(payload);
        applyUserAppearance();
        closeModal();
    });

    skipButton.addEventListener("click", markOnboardingAsSeenAndClose);

    if (adminDismissButton) {
        adminDismissButton.addEventListener("click", markOnboardingAsSeenAndClose);
    }

    if (adminToggle && adminPanel) {
        adminToggle.addEventListener("click", () => {
            const isHidden = adminPanel.classList.contains("oculto");

            adminPanel.classList.toggle("oculto", !isHidden);
            adminToggle.setAttribute("aria-expanded", String(isHidden));
            adminToggle.textContent = isHidden
                ? "Ocultar acceso de administrador"
                : "Eres administrador? Pulsa aqui";

            if (isHidden) {
                requestAnimationFrame(() => {
                    adminPanel.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                });
            }
        });
    }
}

async function initHomeAdminAccess() {
    if (document.body.dataset.page !== "index") {
        return;
    }

    const loginCard = document.getElementById("home-access-card");
    const sessionCard = document.getElementById("home-authenticated");
    const loginForm = document.getElementById("home-login-form");
    const statusBox = document.getElementById("home-auth-status");
    const logoutButton = document.getElementById("home-logout-button");
    const sessionEmail = document.getElementById("home-auth-email");
    const onboardingLoginWrap = document.getElementById("onboarding-admin-login");
    const onboardingToolsWrap = document.getElementById("onboarding-admin-tools");
    const onboardingForm = document.getElementById("onboarding-admin-form");
    const onboardingStatusBox = document.getElementById("onboarding-auth-status");
    const onboardingEmail = document.getElementById("onboarding-auth-email");
    const onboardingLogoutButton = document.getElementById("onboarding-admin-logout");
    const flashMessage = consumeAuthFlash();
    let homeStatusOverride = flashMessage;
    let homeStatusType = "ok";

    if (!loginCard || !sessionCard || !loginForm || !statusBox) {
        return;
    }

    const showHomeStatuses = (type, message) => {
        showStatus(statusBox, type, message);

        if (onboardingStatusBox) {
            showStatus(onboardingStatusBox, type, message);
        }
    };

    const setLoggedState = (session) => {
        const isLogged = Boolean(session);

        loginCard.classList.toggle("oculto", isLogged);
        sessionCard.classList.toggle("oculto", !isLogged);
        onboardingLoginWrap?.classList.toggle("oculto", isLogged);
        onboardingToolsWrap?.classList.toggle("oculto", !isLogged);

        if (sessionEmail) {
            sessionEmail.textContent = session?.user?.email || "";
        }

        if (onboardingEmail) {
            onboardingEmail.textContent = session?.user?.email || "";
        }

        if (isLogged) {
            applyAdminIdentityToWelcome(session);
            homeStatusOverride = "";
            homeStatusType = "ok";
            showHomeStatuses("ok", "Sesion activa. Ya puedes entrar al panel de administracion.");
            return;
        }

        showHomeStatuses(homeStatusType, homeStatusOverride || "Accede con tu email y contrasena de Supabase.");
    };

    const resetAdminForms = () => {
        loginForm.reset();

        if (onboardingForm) {
            onboardingForm.reset();
        }
    };

    const signOutHomeAdmin = async (message = "Sesion cerrada.") => {
        await supabaseClient.auth.signOut();
        homeStatusType = "ok";
        homeStatusOverride = message;
        setLoggedState(null);
    };

    const handleAdminSignIn = async (form, redirectAfterLogin) => {
        const formData = new FormData(form);
        const email = String(formData.get("email") || "").trim();
        const password = String(formData.get("password") || "").trim();

        if (!email || !password) {
            showHomeStatuses("error", "Escribe tu email y tu contrasena.");
            return;
        }

        showHomeStatuses("ok", "Comprobando acceso...");

        const {
            data: signInData,
            error: signInError
        } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (signInError || !signInData.session) {
            showHomeStatuses("error", signInError?.message || "No se pudo iniciar sesion.");
            return;
        }

        if (!isAuthorizedAdmin(signInData.session.user)) {
            homeStatusType = "error";
            homeStatusOverride = buildUnauthorizedAdminMessage();
            await supabaseClient.auth.signOut();
            setLoggedState(null);
            return;
        }

        resetAdminForms();
        setLoggedState(signInData.session);

        if (redirectAfterLogin) {
            window.location.href = "admin.html";
        }
    };

    if (!supabaseClient) {
        showHomeStatuses("error", "Configura SUPABASE_URL y SUPABASE_KEY en app.js para activar el login con Supabase.");
        loginForm.querySelectorAll("input, button").forEach((field) => {
            field.disabled = true;
        });

        if (onboardingForm) {
            onboardingForm.querySelectorAll("input, button").forEach((field) => {
                field.disabled = true;
            });
        }

        return;
    }

    const {
        data,
        error
    } = await supabaseClient.auth.getSession();

    if (error) {
        showHomeStatuses("error", "No se ha podido comprobar la sesion actual.");
    }

    if (data?.session?.user && !isAuthorizedAdmin(data.session.user)) {
        homeStatusType = "ok";
        homeStatusOverride = "Hay una sesion abierta de usuario. Si quieres entrar al panel admin, inicia sesion con una cuenta autorizada.";
        setLoggedState(null);
    } else {
        setLoggedState(data?.session || null);
    }

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        await handleAdminSignIn(loginForm, true);
    });

    if (onboardingForm) {
        onboardingForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            await handleAdminSignIn(onboardingForm, false);
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", async () => {
            await signOutHomeAdmin();
        });
    }

    if (onboardingLogoutButton) {
        onboardingLogoutButton.addEventListener("click", async () => {
            await signOutHomeAdmin();
        });
    }

    supabaseClient.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user && !isAuthorizedAdmin(session.user)) {
            homeStatusType = "ok";
            homeStatusOverride = "Hay una sesion abierta de usuario. Si quieres entrar al panel admin, inicia sesion con una cuenta autorizada.";
            setLoggedState(null);
            return;
        }

        setLoggedState(session);
    });
}

async function initAdminPage() {
    if (document.body.dataset.page !== "admin") {
        return;
    }

    if (!supabaseClient) {
        redirectToIndex("Configura Supabase en app.js antes de usar admin.html.");
        return;
    }

    const {
        data,
        error
    } = await supabaseClient.auth.getSession();

    if (error || !data?.session) {
        redirectToIndex("Tu sesion no existe o ha caducado. Inicia sesion desde la portada.");
        return;
    }

    if (!isAuthorizedAdmin(data.session.user)) {
        await supabaseClient.auth.signOut();
        redirectToIndex(buildUnauthorizedAdminMessage());
        return;
    }

    let activeSession = data.session;

    const panelName = document.getElementById("session-name");
    const panelEmail = document.getElementById("session-email");
    const logoutButton = document.getElementById("logout-button");
    const publishForm = document.getElementById("publish-form");
    const statusBox = document.getElementById("admin-status");
    const typeField = document.getElementById("content-type");
    const mediaFieldWrap = document.getElementById("media-field");
    const actionFieldWrap = document.getElementById("action-field");
    const actionLabelWrap = document.getElementById("action-label-field");
    const fileFieldWrap = document.getElementById("file-field");
    const fileInput = document.getElementById("content-media-file");
    const mediaUrlInput = document.getElementById("content-media-url");
    const mediaLabel = document.querySelector("label[for='content-media-url']");
    const fileLabel = document.querySelector("label[for='content-media-file']");
    const uploadNote = fileFieldWrap?.querySelector(".upload-note");
    const itemList = document.getElementById("admin-items");
    const dailyImageForm = document.getElementById("daily-image-form");
    const dailyImageStatus = document.getElementById("daily-image-status");
    const dailyImageItems = document.getElementById("daily-image-items");
    const dailyImageFileInput = document.getElementById("daily-image-file");

    if (!publishForm || !statusBox || !typeField || !itemList) {
        document.body.classList.remove("auth-pending");
        return;
    }

    const syncTypeFields = () => {
        const type = typeField.value;
        const mediaConfig = CONTENT_MEDIA_CONFIG[type];
        const showMediaFields = Boolean(mediaConfig);
        const showActionFields = type !== "texto";

        mediaFieldWrap.classList.toggle("oculto", !showMediaFields);
        fileFieldWrap.classList.toggle("oculto", !showMediaFields);
        actionFieldWrap.classList.toggle("oculto", !showActionFields);
        actionLabelWrap.classList.toggle("oculto", !showActionFields);

        if (mediaConfig && mediaLabel) {
            mediaLabel.textContent = mediaConfig.mediaLabel;
        }

        if (mediaConfig && fileLabel) {
            fileLabel.textContent = mediaConfig.fileLabel;
        }

        if (mediaConfig && fileInput) {
            fileInput.setAttribute("accept", mediaConfig.accept);
        }

        if (mediaConfig && uploadNote) {
            uploadNote.textContent = mediaConfig.help;
        }

        if (!showMediaFields) {
            if (mediaUrlInput) {
                mediaUrlInput.value = "";
            }

            if (fileInput) {
                fileInput.removeAttribute("accept");
                fileInput.value = "";
            }
        }
    };

    const setAdminFormsEnabled = (enabled) => {
        publishForm.querySelectorAll("input, textarea, select, button").forEach((field) => {
            field.disabled = !enabled;
        });

        dailyImageForm?.querySelectorAll("input, textarea, button").forEach((field) => {
            field.disabled = !enabled;
        });
    };

    const updateAdminHeader = () => {
        const user = activeSession?.user;
        const label = getUserDisplayName(user);

        if (panelName) {
            panelName.textContent = label;
        }

        if (panelEmail) {
            panelEmail.textContent = user?.email || "";
        }

        setAdminFormsEnabled(Boolean(user));
        renderAdminItems(itemList);
        renderDailyImageItems(dailyImageItems);
        document.body.classList.remove("auth-pending");
    };

    updateAdminHeader();
    syncTypeFields();
    showStatus(statusBox, "ok", `Sesion validada como ${getUserDisplayName(activeSession.user)}.`);
    showStatus(dailyImageStatus, "ok", "Tu biblioteca diaria esta lista para guardar imagenes.");

    // ── Navegación entre paneles ──────────────────────────────────────────
    const emptyState = document.getElementById("admin-empty-state");
    const paneles = document.querySelectorAll(".admin-subpanel");
    const actionBtns = document.querySelectorAll("[data-open-panel]");

    const openPanel = (id) => {
        paneles.forEach(p => p.classList.add("oculto"));
        actionBtns.forEach(b => b.classList.remove("activo"));
        if (emptyState) emptyState.classList.add("oculto");
        const panel = document.getElementById(`panel-${id}`);
        if (panel) panel.classList.remove("oculto");
        const btn = document.querySelector(`[data-open-panel="${id}"]`);
        if (btn) btn.classList.add("activo");
    };

    const closePanel = () => {
        paneles.forEach(p => p.classList.add("oculto"));
        actionBtns.forEach(b => b.classList.remove("activo"));
        if (emptyState) emptyState.classList.remove("oculto");
    };

    actionBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            openPanel(btn.dataset.openPanel);
            if (btn.dataset.openPanel === "usuarios") initAdminUsuariosPanel();
        });
    });

    document.querySelectorAll("[data-close-panel]").forEach(btn => {
        btn.addEventListener("click", closePanel);
    });

    typeField.addEventListener("change", syncTypeFields);

    if (logoutButton) {
        logoutButton.addEventListener("click", async () => {
            await supabaseClient.auth.signOut();
            redirectToIndex("Has cerrado sesion correctamente.");
        });
    }

    supabaseClient.auth.onAuthStateChange(async (_event, session) => {
        if (!session) {
            redirectToIndex("Tu sesion ya no esta activa. Vuelve a iniciar sesion.");
            return;
        }

        if (!isAuthorizedAdmin(session.user)) {
            await supabaseClient.auth.signOut();
            redirectToIndex(buildUnauthorizedAdminMessage());
            return;
        }

        activeSession = session;
        updateAdminHeader();
    });

    publishForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!activeSession?.user) {
            redirectToIndex("Necesitas una sesion valida para publicar.");
            return;
        }

        const formData = new FormData(publishForm);
        const type = String(formData.get("type") || "texto");
        const title = String(formData.get("title") || "").trim();
        const description = String(formData.get("description") || "").trim();
        const mediaUrl = String(formData.get("mediaUrl") || "").trim();
        const actionUrl = String(formData.get("actionUrl") || "").trim();
        const actionLabel = String(formData.get("actionLabel") || "").trim();
        const uploadedFile = fileInput?.files && fileInput.files[0] ? fileInput.files[0] : null;

        if (!title) {
            showStatus(statusBox, "error", "Escribe un titulo para publicar.");
            return;
        }

        if (CONTENT_MEDIA_CONFIG[type] && !mediaUrl && !uploadedFile) {
            showStatus(statusBox, "error", `Para ${type === "foto" ? "una foto" : "un video"} necesitas una URL o un archivo de tu ordenador.`);
            return;
        }

        if (type === "enlace" && !actionUrl) {
            showStatus(statusBox, "error", "Para un enlace necesitas una URL.");
            return;
        }

        let mediaBlobId = "";
        let finalMediaUrl = mediaUrl;

        if (uploadedFile) {
            if (type === "video" && !uploadedFile.type.startsWith("video/")) {
                showStatus(statusBox, "error", "El archivo local debe ser un video valido.");
                return;
            }

            if (type === "foto" && !uploadedFile.type.startsWith("image/")) {
                showStatus(statusBox, "error", "El archivo local debe ser una imagen valida.");
                return;
            }

            if (supabaseClient) {
                try {
                    showStatus(statusBox, "ok", "Subiendo archivo...");
                    finalMediaUrl = await uploadFileToSupabase(uploadedFile, "publicaciones");
                } catch (uploadError) {
                    showStatus(statusBox, "error", "No se pudo subir el archivo: " + (uploadError.message || "error desconocido"));
                    return;
                }
            } else {
                try {
                    mediaBlobId = await saveMediaFile(uploadedFile);
                } catch (saveError) {
                    showStatus(statusBox, "error", "No se ha podido guardar el archivo local en este navegador.");
                    return;
                }
            }
        }

        const newItem = {
            id: createId(),
            section: String(formData.get("section") || "inicio"),
            type,
            title,
            description,
            mediaUrl: finalMediaUrl,
            mediaBlobId,
            mediaFileName: uploadedFile ? uploadedFile.name : "",
            mediaMimeType: uploadedFile ? uploadedFile.type : "",
            actionUrl,
            actionLabel,
            authorKey: activeSession.user.id,
            authorName: getUserDisplayName(activeSession.user),
            createdAt: new Date().toISOString()
        };

        try {
            if (supabaseClient) {
                await saveSupabaseItem(newItem);
            } else {
                const items = getStoredItems();
                items.push(newItem);
                saveStoredItems(items);
            }
        } catch (saveError) {
            if (mediaBlobId) {
                await deleteMediaFile(mediaBlobId).catch(() => {});
            }
            showStatus(statusBox, "error", "No se ha podido guardar la publicacion: " + (saveError.message || ""));
            return;
        }

        publishForm.reset();
        typeField.value = "texto";
        syncTypeFields();
        showStatus(statusBox, "ok", `Contenido publicado en ${SECTION_NAMES[newItem.section]}.`);
        renderAdminItems(itemList);
        await renderDynamicContent();
    });

    dailyImageForm?.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!activeSession?.user) {
            redirectToIndex("Necesitas una sesion valida para guardar imagenes diarias.");
            return;
        }

        const formData = new FormData(dailyImageForm);
        const title = String(formData.get("title") || "").trim();
        const description = String(formData.get("description") || "").trim();
        const mediaUrl = String(formData.get("mediaUrl") || "").trim();
        const date = String(formData.get("date") || "").trim();
        const uploadedFile = dailyImageFileInput?.files && dailyImageFileInput.files[0]
            ? dailyImageFileInput.files[0]
            : null;

        if (!mediaUrl && !uploadedFile) {
            showStatus(dailyImageStatus, "error", "Para la imagen diaria necesitas una URL o una imagen de tu ordenador.");
            return;
        }

        let finalMediaUrl = mediaUrl;

        if (uploadedFile) {
            if (!uploadedFile.type.startsWith("image/")) {
                showStatus(dailyImageStatus, "error", "El archivo debe ser una imagen valida.");
                return;
            }
            try {
                showStatus(dailyImageStatus, "ok", "Subiendo imagen a Supabase...");
                finalMediaUrl = await uploadFileToSupabase(uploadedFile, "imagenes-diarias");
            } catch (uploadError) {
                showStatus(dailyImageStatus, "error", "No se pudo subir la imagen: " + (uploadError.message || ""));
                return;
            }
        }

        const nextEntry = {
            id: createId(),
            title: title || (date ? `Imagen diaria ${date}` : "Imagen diaria"),
            description,
            date,
            mediaUrl: finalMediaUrl,
            authorName: getUserDisplayName(activeSession.user),
            createdAt: new Date().toISOString()
        };

        try {
            if (supabaseClient) {
                await saveSupabaseImagen(nextEntry);
            } else {
                const entries = getDailyImageLibrary();
                entries.push({ ...nextEntry, mediaBlobId: "", mediaFileName: uploadedFile?.name || "", mediaMimeType: uploadedFile?.type || "" });
                saveDailyImageLibrary(entries);
            }
        } catch (saveError) {
            showStatus(dailyImageStatus, "error", "No se ha podido guardar la imagen diaria: " + (saveError.message || ""));
            return;
        }

        dailyImageForm.reset();
        showStatus(dailyImageStatus, "ok", "Imagen guardada en la biblioteca diaria. Ya la veran todos los usuarios.");
        renderDailyImageItems(dailyImageItems);
    });

    itemList.addEventListener("click", async (event) => {
        const button = event.target.closest("[data-delete-id]");

        if (!button) {
            return;
        }

        if (!activeSession?.user) {
            redirectToIndex("Tu sesion ya no es valida para eliminar contenido.");
            return;
        }

        const itemId = button.dataset.deleteId;

        try {
            if (supabaseClient) {
                await deleteSupabaseItem(itemId);
            } else {
                const items = getStoredItems();
                const selectedItem = items.find((item) => item.id === itemId);
                const nextItems = items.filter((item) => item.id !== itemId);
                saveStoredItems(nextItems);
                if (selectedItem?.mediaBlobId) {
                    await deleteMediaFile(selectedItem.mediaBlobId).catch(() => {});
                }
            }
        } catch (deleteError) {
            showStatus(statusBox, "error", "No se ha podido eliminar la publicacion.");
            return;
        }

        showStatus(statusBox, "ok", "Publicacion eliminada.");
        renderAdminItems(itemList);
        await renderDynamicContent();
    });

    dailyImageItems?.addEventListener("click", async (event) => {
        const button = event.target.closest("[data-delete-daily-image]");
        if (!button) return;
        if (!activeSession?.user) {
            redirectToIndex("Tu sesion ya no es valida para eliminar imagenes diarias.");
            return;
        }
        const itemId = button.dataset.deleteDailyImage;
        try {
            if (supabaseClient) {
                await deleteSupabaseImagen(itemId);
            } else {
                const items = getDailyImageLibrary();
                const selectedItem = items.find((item) => item.id === itemId);
                const nextItems = items.filter((item) => item.id !== itemId);
                saveDailyImageLibrary(nextItems);
                if (selectedItem?.mediaBlobId) {
                    await deleteMediaFile(selectedItem.mediaBlobId).catch(() => {});
                }
            }
        } catch (deleteError) {
            showStatus(dailyImageStatus, "error", "No se ha podido eliminar la imagen diaria.");
            return;
        }
        showStatus(dailyImageStatus, "ok", "Imagen diaria eliminada.");
        renderDailyImageItems(dailyImageItems);
    });

    // ── Novedades ──────────────────────────────────────────────────────────
    const novedadesForm = document.getElementById("novedades-form");
    const novedadesStatus = document.getElementById("novedades-status");
    const novedadesItems = document.getElementById("novedades-items");

    if (novedadesForm && novedadesStatus) {
        renderNovedadesItems(novedadesItems);

        novedadesForm.addEventListener("submit", async (event) => {            event.preventDefault();
            if (!activeSession?.user) {
                redirectToIndex("Necesitas una sesion valida para publicar novedades.");
                return;
            }
            const formData = new FormData(novedadesForm);
            const version = String(formData.get("version") || "").trim();
            const titulo = String(formData.get("titulo") || "").trim();
            const descripcion = String(formData.get("descripcion") || "").trim();
            const changes = String(formData.get("changes") || "").trim();

            if (!version) {
                showStatus(novedadesStatus, "error", "Escribe el numero de version.");
                return;
            }
            if (!changes) {
                showStatus(novedadesStatus, "error", "Escribe al menos un cambio.");
                return;
            }

            const novedad = {
                id: createId(),
                version,
                titulo,
                descripcion,
                changes,
                authorName: getUserDisplayName(activeSession.user)
            };

            try {
                await saveSupabaseNovedad(novedad);
            } catch (saveError) {
                showStatus(novedadesStatus, "error", "No se pudo guardar: " + (saveError.message || ""));
                return;
            }

            novedadesForm.reset();
            showStatus(novedadesStatus, "ok", `Novedades ${formatVersionLabel(version)} publicadas. Los usuarios las veran al entrar.`);
            renderNovedadesItems(novedadesItems);
        });
    }

    // Big Bang
    initAdminBigBang(activeSession);
}

function redirectToIndex(message = "") {
    if (message) {
        sessionStorage.setItem(AUTH_FLASH_KEY, message);
    }

    window.location.replace("index.html");
}

function consumeAuthFlash() {
    const value = sessionStorage.getItem(AUTH_FLASH_KEY) || "";

    if (value) {
        sessionStorage.removeItem(AUTH_FLASH_KEY);
    }

    return value;
}

function getUserDisplayName(user) {
    if (!user) {
        return "admin";
    }

    const mappedName = getKnownAdminDisplayName(user.email);

    if (mappedName) {
        return mappedName;
    }

    const metadataName = String(user.user_metadata?.name || user.user_metadata?.full_name || "").trim();

    if (metadataName) {
        return metadataName;
    }

    if (user.email) {
        return user.email.split("@")[0];
    }

    return "admin";
}

function getKnownAdminDisplayName(email) {
    const normalizedEmail = normalizeAdminEmail(email);
    const localPart = normalizedEmail ? normalizedEmail.split("@")[0] : "";
    const adminKey = normalizeAdminKey(localPart);
    return ADMIN_DISPLAY_NAME_MAP[adminKey] || "";
}

function applyAdminIdentityToWelcome(session) {
    if (document.body?.dataset.page !== "index" || !session?.user) {
        return;
    }

    const adminName = getUserDisplayName(session.user);

    if (!adminName) {
        return;
    }

    const current = getOnboardingData();

    if (!current.name) {
        saveOnboardingData({
            seen: current.seen,
            name: adminName,
            color: current.color,
            themeMode: current.themeMode
        });
    }

    const nameInput = document.getElementById("visitor-name");

    if (nameInput && !nameInput.value.trim()) {
        nameInput.value = adminName;
    }

    updateVisitorText();
    updateUserPreferencesUi();
}

function normalizeAdminKey(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toLowerCase();
}

function normalizeAdminEmail(value) {
    return String(value || "").trim().toLowerCase();
}

function getUserAdminKeys(user) {
    if (!user) {
        return [];
    }

    const possibleValues = [
        user.user_metadata?.name,
        user.user_metadata?.full_name,
        user.user_metadata?.preferred_username,
        user.user_metadata?.nickname,
        user.email ? user.email.split("@")[0] : ""
    ];

    return Array.from(new Set(
        possibleValues
            .map((value) => normalizeAdminKey(value))
            .filter(Boolean)
    ));
}

function isAuthorizedAdmin(user) {
    const email = normalizeAdminEmail(user?.email);

    if (email && AUTHORIZED_ADMIN_EMAILS.has(email)) {
        return true;
    }

    return getUserAdminKeys(user).some((key) => ADMIN_ACCESS_KEYS.has(key));
}

function buildUnauthorizedAdminMessage() {
    return "Tu cuenta no esta autorizada para el panel. Usa uno de los correos o usuarios admin permitidos.";
}

function supportsMediaStorage() {
    return typeof indexedDB !== "undefined";
}

function openMediaDatabase() {
    if (!supportsMediaStorage()) {
        return Promise.reject(new Error("Este navegador no permite guardar archivos locales."));
    }

    if (mediaDatabasePromise) {
        return mediaDatabasePromise;
    }

    mediaDatabasePromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(MEDIA_DB_NAME, 1);

        request.onupgradeneeded = () => {
            const database = request.result;

            if (!database.objectStoreNames.contains(MEDIA_STORE_NAME)) {
                database.createObjectStore(MEDIA_STORE_NAME, {
                    keyPath: "id"
                });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error("No se pudo abrir la base local."));
        request.onblocked = () => reject(new Error("La base local esta bloqueada en este navegador."));
    });

    return mediaDatabasePromise;
}

async function saveMediaFile(file) {
    const database = await openMediaDatabase();
    const mediaId = createId();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(MEDIA_STORE_NAME, "readwrite");
        const store = transaction.objectStore(MEDIA_STORE_NAME);

        store.put({
            id: mediaId,
            file,
            name: file.name,
            type: file.type,
            createdAt: new Date().toISOString()
        });

        transaction.oncomplete = () => resolve(mediaId);
        transaction.onerror = () => reject(transaction.error || new Error("No se pudo guardar el archivo local."));
        transaction.onabort = () => reject(transaction.error || new Error("La operacion de guardado fue cancelada."));
    });
}

async function getMediaFile(mediaId) {
    if (!mediaId || !supportsMediaStorage()) {
        return null;
    }

    const database = await openMediaDatabase();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(MEDIA_STORE_NAME, "readonly");
        const store = transaction.objectStore(MEDIA_STORE_NAME);
        const request = store.get(mediaId);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error || new Error("No se pudo leer el archivo guardado."));
    });
}

async function deleteMediaFile(mediaId) {
    if (!mediaId || !supportsMediaStorage()) {
        return;
    }

    const database = await openMediaDatabase();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(MEDIA_STORE_NAME, "readwrite");
        const store = transaction.objectStore(MEDIA_STORE_NAME);

        store.delete(mediaId);

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error || new Error("No se pudo borrar el archivo guardado."));
        transaction.onabort = () => reject(transaction.error || new Error("La operacion de borrado fue cancelada."));
    });
}

async function renderDynamicContent() {
    const containers = document.querySelectorAll("[data-render-content]");

    for (const container of containers) {
        const section = container.dataset.renderContent;

        let items = [];
        if (supabaseClient) {
            items = await getSupabaseItems(section);
        }
        if (!items.length) {
            items = getStoredItems()
                .filter((item) => item.section === section)
                .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
        }

        container.innerHTML = "";

        if (!items.length) {
            const empty = document.createElement("div");
            empty.className = "vacio animar";
            empty.innerHTML = "<strong>Aun no hay publicaciones nuevas.</strong><p>Cuando un admin anada contenido desde el panel, aparecera aqui automaticamente.</p>";
            container.appendChild(empty);
            observeAnimatedElements(container);
            continue;
        }

        for (const item of items) {
            const article = document.createElement("article");
            article.className = "publicacion animar";

            const typeBadge = document.createElement("span");
            typeBadge.className = "etiqueta";
            typeBadge.textContent = formatTypeName(item.type);
            article.appendChild(typeBadge);

            const title = document.createElement("h3");
            title.textContent = item.title;
            article.appendChild(title);

            if (item.description) {
                const description = document.createElement("p");
                description.textContent = item.description;
                article.appendChild(description);
            }

            const media = await createMediaElement(item);
            if (media) {
                article.appendChild(media);
            }

            if (item.actionUrl) {
                const action = document.createElement("a");
                action.className = "boton-accion";
                action.href = item.actionUrl;
                action.target = "_blank";
                action.rel = "noopener noreferrer";
                action.textContent = item.actionLabel || "Abrir contenido";
                article.appendChild(action);
            }

            const meta = document.createElement("p");
            meta.className = "meta";
            meta.textContent = `Publicado por ${item.authorName} en ${formatDate(item.createdAt)}`;
            article.appendChild(meta);

            // Botón like por publicación
            const likeRow = document.createElement("div");
            likeRow.style.cssText = "display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:10px;";
            const likeBtn = document.createElement("button");
            likeBtn.style.cssText = "background:none;border:none;cursor:pointer;font:inherit;font-size:0.92rem;padding:0;";
            const likeScope = buildPublicationLikeScope(section);
            const { count: lc, userLiked: ul } = await getLikes(likeScope, item.id).catch(() => ({ count: 0, userLiked: false }));
            likeBtn.textContent = `${ul ? "❤️" : "🤍"} ${lc}`;
            likeBtn.addEventListener("click", async () => {
                if (!publicUserSession) { openUserAuthModal(); return; }
                if (likeBtn.dataset.processing === "1") return;
                likeBtn.dataset.processing = "1";
                try {
                    const liked = await toggleLike(likeScope, item.id);
                    const prev = parseInt(likeBtn.textContent.replace(/\D/g,"")) || 0;
                    likeBtn.textContent = `${liked ? "❤️" : "🤍"} ${liked ? prev + 1 : Math.max(0, prev - 1)}`;
                } catch(e) { openUserAuthModal(); }
                likeBtn.dataset.processing = "0";
            });
            likeRow.appendChild(likeBtn);

            const commentsScope = buildPublicationCommentsScope(section, item.id);
            const commentsPanel = document.createElement("div");
            commentsPanel.dataset.commentsSection = commentsScope;
            commentsPanel.className = "oculto";
            commentsPanel.style.cssText = "width:100%;margin-top:12px;";

            const commentsBtn = document.createElement("button");
            commentsBtn.className = "boton-secundario-linea";
            commentsBtn.type = "button";

            const updateCommentsBtn = async () => {
                const comments = await getComentarios(commentsScope).catch(() => []);
                const total = comments.length;
                commentsBtn.textContent = `💬 Comentarios ${total ? `(${total})` : ""}`.trim();
            };

            await updateCommentsBtn();

            commentsBtn.addEventListener("click", async () => {
                const willOpen = commentsPanel.classList.contains("oculto");
                commentsPanel.classList.toggle("oculto", !willOpen);
                commentsBtn.textContent = willOpen ? "💬 Ocultar comentarios" : commentsBtn.textContent;

                if (willOpen) {
                    await initCommentSection(commentsPanel, commentsScope, {
                        onChange: updateCommentsBtn
                    });
                    commentsBtn.textContent = "💬 Ocultar comentarios";
                    return;
                }

                await updateCommentsBtn();
            });

            likeRow.appendChild(commentsBtn);
            article.appendChild(likeRow);
            article.appendChild(commentsPanel);

            container.appendChild(article);
        }

        observeAnimatedElements(container);
    }
}

async function createMediaElement(item) {
    const mediaSource = await resolveMediaSource(item);

    if (mediaSource.missing) {
        const warning = document.createElement("p");
        warning.className = "media-warning";
        warning.textContent = "El archivo local de esta publicacion ya no esta disponible en este navegador.";
        return warning;
    }

    if (!mediaSource.url) {
        return null;
    }

    // Visor 3D interactivo
    if (mediaSource.kind === "modelo3d") {
        return createModelViewer(mediaSource.url, item.title);
    }

    if (mediaSource.kind === "youtube") {
        const iframe = document.createElement("iframe");
        iframe.src = mediaSource.url;
        iframe.title = item.title;
        iframe.loading = "lazy";
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;
        return iframe;
    }

    if (mediaSource.kind === "video") {
        const video = document.createElement("video");
        video.controls = true;
        video.src = mediaSource.url;
        video.preload = "metadata";
        return video;
    }

    if (mediaSource.kind === "image") {
        const image = document.createElement("img");
        image.src = mediaSource.url;
        image.alt = item.title;
        image.loading = "lazy";
        return image;
    }

    const fallback = document.createElement("a");
    fallback.className = "boton-social";
    fallback.href = mediaSource.url;
    fallback.target = "_blank";
    fallback.rel = "noopener noreferrer";
    fallback.textContent = "Abrir media";
    return fallback;
}

function createModelViewer(url, title) {
    if (!document.querySelector('script[src*="model-viewer"]')) {
        const script = document.createElement("script");
        script.type = "module";
        script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
        document.head.appendChild(script);
    }
    const wrapper = document.createElement("div");
    wrapper.className = "modelo3d-wrapper";
    wrapper.style.marginTop = "16px";
    const mv = document.createElement("model-viewer");
    mv.setAttribute("src", url);
    mv.setAttribute("alt", title || "Modelo 3D");
    mv.setAttribute("camera-controls", "");
    mv.setAttribute("touch-action", "pan-y");
    mv.setAttribute("auto-rotate", "");
    mv.setAttribute("auto-rotate-delay", "1000");
    mv.setAttribute("rotation-per-second", "30deg");
    mv.setAttribute("shadow-intensity", "1");
    mv.setAttribute("environment-image", "neutral");
    mv.setAttribute("exposure", "1");
    mv.setAttribute("loading", "lazy");
    mv.style.cssText = "width:100%;height:400px;border-radius:18px;background:#0d0d1a;--poster-color:transparent;";
    const hint = document.createElement("p");
    hint.style.cssText = "font-size:0.82rem;opacity:0.6;margin-top:8px;text-align:center;";
    hint.textContent = "Arrastra para rotar · Rueda para zoom · Doble toque para centrar";
    wrapper.appendChild(mv);
    wrapper.appendChild(hint);
    return wrapper;
}

async function resolveMediaSource(item) {
    if (item.mediaBlobId) {
        try {
            const record = await getMediaFile(item.mediaBlobId);

            if (!record || !record.file) {
                return {
                    missing: true
                };
            }

            const url = URL.createObjectURL(record.file);
            const fileType = record.file.type || item.mediaMimeType || "";

            if (fileType.startsWith("video/")) {
                return {
                    kind: "video",
                    url
                };
            }

            if (fileType.startsWith("image/")) {
                return {
                    kind: "image",
                    url
                };
            }

            return {
                kind: "link",
                url
            };
        } catch (error) {
            return {
                missing: true
            };
        }
    }

    const sourceUrl = String(item.mediaUrl || "").trim();

    if (!sourceUrl) {
        return {
            url: ""
        };
    }

    if (item.type === "video") {
        const youtubeUrl = getYouTubeEmbedUrl(sourceUrl);

        if (youtubeUrl) {
            return {
                kind: "youtube",
                url: youtubeUrl
            };
        }

        if (isDirectVideo(sourceUrl)) {
            return {
                kind: "video",
                url: sourceUrl
            };
        }
    }

    if (item.type === "foto") {
        return { kind: "image", url: sourceUrl };
    }

    if (item.type === "modelo3d") {
        return { kind: "modelo3d", url: sourceUrl };
    }

    if (isModel3D(sourceUrl)) {
        return { kind: "modelo3d", url: sourceUrl };
    }

    if (isImage(sourceUrl)) {
        return {
            kind: "image",
            url: sourceUrl
        };
    }

    return {
        kind: "link",
        url: sourceUrl
    };
}

function isDirectVideo(url) {
    return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

function isImage(url) {
    return /\.(jpg|jpeg|png|gif|webp|svg|avif)(\?.*)?$/i.test(url);
}

function isModel3D(url) {
    return /\.(glb|gltf|obj|fbx)(\?.*)?$/i.test(url);
}

function getYouTubeEmbedUrl(url) {
    const value = String(url || "").trim();

    if (!value) {
        return "";
    }

    const shortMatch = value.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
    if (shortMatch) {
        return `https://www.youtube.com/embed/${shortMatch[1]}`;
    }

    const watchMatch = value.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
    if (watchMatch) {
        return `https://www.youtube.com/embed/${watchMatch[1]}`;
    }

    const embedMatch = value.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/);
    if (embedMatch) {
        return `https://www.youtube.com/embed/${embedMatch[1]}`;
    }

    return "";
}

function formatTypeName(type) {
    return CONTENT_TYPE_NAMES[type] || "Contenido";
}

function formatDate(dateText) {
    const date = new Date(dateText);

    if (Number.isNaN(date.getTime())) {
        return "fecha desconocida";
    }

    return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(date);
}

function formatCalendarDate(dateText) {
    if (!dateText) {
        return "sin fecha";
    }

    const normalized = dateText.includes("T")
        ? dateText
        : `${dateText}T00:00:00`;
    const date = new Date(normalized);

    if (Number.isNaN(date.getTime())) {
        return "sin fecha";
    }

    return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(date);
}

function renderAdminItems(container) {
    if (supabaseClient) {
        getAllSupabaseItems().then((items) => _renderAdminItemsList(container, items));
    } else {
        const items = getStoredItems()
            .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
        _renderAdminItemsList(container, items);
    }
}

function _renderAdminItemsList(container, items) {

    container.innerHTML = "";

    if (!items.length) {
        const empty = document.createElement("div");
        empty.className = "vacio";
        empty.innerHTML = "<strong>Todavia no hay contenido creado.</strong><p>Usa el formulario y apareceran aqui tus publicaciones.</p>";
        container.appendChild(empty);
        return;
    }

    items.forEach((item) => {
        const card = document.createElement("article");
        card.className = "item-admin";

        const title = document.createElement("strong");
        title.textContent = item.title;
        card.appendChild(title);

        const meta = document.createElement("div");
        meta.className = "meta";
        meta.textContent = `${SECTION_NAMES[item.section]} | ${formatTypeName(item.type)} | ${item.authorName} | ${formatDate(item.createdAt)}`;
        card.appendChild(meta);

        if (item.mediaFileName) {
            const fileMeta = document.createElement("div");
            fileMeta.className = "meta";
            fileMeta.textContent = `Archivo local: ${item.mediaFileName}`;
            card.appendChild(fileMeta);
        }

        if (item.description) {
            const description = document.createElement("p");
            description.textContent = item.description;
            card.appendChild(description);
        }

        const actions = document.createElement("div");
        actions.className = "fila-botones";

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "boton-borrar";
        deleteButton.dataset.deleteId = item.id;
        deleteButton.textContent = "Eliminar";
        actions.appendChild(deleteButton);

        card.appendChild(actions);
        container.appendChild(card);
    });
}

function renderDailyImageItems(container) {
    if (!container) return;

    if (supabaseClient) {
        getSupabaseImagenes().then((rows) => {
            const items = rows.map(r => ({
                id: r.id,
                title: r.title || "Imagen diaria",
                date: r.date || "",
                authorName: r.author_name || "admin",
                createdAt: r.created_at,
                mediaUrl: r.media_url || "",
                mediaFileName: "",
                description: r.description || ""
            }));
            _renderDailyImageList(container, items);
        });
    } else {
        const items = getDailyImageLibrary()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        _renderDailyImageList(container, items);
    }
}

function _renderDailyImageList(container, items) {
    container.innerHTML = "";

    if (!items.length) {
        const empty = document.createElement("div");
        empty.className = "vacio";
        empty.innerHTML = "<strong>Todavia no hay imagenes diarias guardadas.</strong><p>Usa el formulario para crear una biblioteca que se ira actualizando sola.</p>";
        container.appendChild(empty);
        return;
    }

    items.forEach((item) => {
        const card = document.createElement("article");
        card.className = "item-admin";

        const title = document.createElement("strong");
        title.textContent = item.title || "Imagen diaria";
        card.appendChild(title);

        const schedule = document.createElement("div");
        schedule.className = "meta";
        schedule.textContent = item.date ? `Programada para ${formatCalendarDate(item.date)}` : "Rotacion automatica";
        card.appendChild(schedule);

        const meta = document.createElement("div");
        meta.className = "meta";
        meta.textContent = `${item.authorName || "admin"} | ${formatDate(item.createdAt)}`;
        card.appendChild(meta);

        if (item.mediaFileName) {
            const fileMeta = document.createElement("div");
            fileMeta.className = "meta";
            fileMeta.textContent = `Archivo: ${item.mediaFileName}`;
            card.appendChild(fileMeta);
        } else if (item.mediaUrl) {
            const urlMeta = document.createElement("div");
            urlMeta.className = "meta";
            urlMeta.textContent = item.mediaUrl.length > 60 ? item.mediaUrl.slice(0, 60) + "…" : item.mediaUrl;
            card.appendChild(urlMeta);
        }

        if (item.description) {
            const description = document.createElement("p");
            description.textContent = item.description;
            card.appendChild(description);
        }

        const actions = document.createElement("div");
        actions.className = "fila-botones";
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "boton-borrar";
        deleteButton.dataset.deleteDailyImage = item.id;
        deleteButton.textContent = "Eliminar";
        actions.appendChild(deleteButton);
        card.appendChild(actions);
        container.appendChild(card);
    });
}

function renderNovedadesItems(container) {
    if (!container) return;
    getAllSupabaseNovedades().then((rows) => {
        container.innerHTML = "";
        if (!rows.length) {
            container.innerHTML = '<div class="vacio"><strong>Todavia no hay novedades publicadas.</strong></div>';
            return;
        }
        rows.forEach((row) => {
            const card = document.createElement("article");
            card.className = "item-admin";
            const title = document.createElement("strong");
            title.textContent = `${formatVersionLabel(row.version)} — ${row.titulo || "Sin titulo"}`;
            card.appendChild(title);
            const meta = document.createElement("div");
            meta.className = "meta";
            meta.textContent = `${row.author_name || "admin"} | ${formatDate(row.created_at)}`;
            card.appendChild(meta);
            if (row.descripcion) {
                const desc = document.createElement("p");
                desc.textContent = row.descripcion;
                card.appendChild(desc);
            }
            const actions = document.createElement("div");
            actions.className = "fila-botones";

            const previewButton = document.createElement("button");
            previewButton.className = "boton-secundario-linea";
            previewButton.type = "button";
            previewButton.textContent = "Vista previa";
            previewButton.addEventListener("click", async () => {
                showSupabaseReleaseModal(row, `${row.version}-${row.id}`, { markSeen: false });
            });
            actions.appendChild(previewButton);

            const deleteButton = document.createElement("button");
            deleteButton.className = "boton-secundario-linea";
            deleteButton.type = "button";
            deleteButton.textContent = "Borrar";
            deleteButton.addEventListener("click", async () => {
                const confirmed = window.confirm(`¿Quieres borrar las novedades ${formatVersionLabel(row.version)}?`);
                if (!confirmed) {
                    return;
                }
                try {
                    await deleteSupabaseNovedad(row.id);
                    renderNovedadesItems(container);
                } catch (error) {
                    window.alert("No se ha podido borrar esta actualizacion.");
                }
            });
            actions.appendChild(deleteButton);

            card.appendChild(actions);
            container.appendChild(card);
        });
    });
}

function initWordGames() {
    const gameElements = document.querySelectorAll("[data-word-game]");

    gameElements.forEach((element) => {
        const config = WORD_GAMES[element.dataset.wordGame];

        if (!config) {
            return;
        }

        const board = element.querySelector("[data-wordle-board]");
        const form = element.querySelector("[data-wordle-form]");
        const input = form.querySelector("input[name='guess']");
        const message = element.querySelector("[data-wordle-message]");
        const resetButton = element.querySelector("[data-reset-game]");

        const instance = {
            config,
            board,
            form,
            input,
            message,
            submitButton: form.querySelector("button[type='submit']"),
            state: createWordGameState(config)
        };

        wordGameInstances.set(element, instance);

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            submitWordGameGuess(element);
        });

        resetButton.addEventListener("click", () => {
            instance.state = createWordGameState(config, instance.state.target);
            renderWordGame(element);
        });

        renderWordGame(element);
    });
}

function createWordGameState(config, previousTarget = "") {
    return {
        target: pickWord(config.words, previousTarget),
        attempts: [],
        finished: false,
        won: false,
        message: `Escribe una palabra de ${config.length} letras.`
    };
}

function pickWord(words, previousTarget = "") {
    if (!words.length) {
        return "";
    }

    if (words.length === 1) {
        return words[0];
    }

    let chosen = words[Math.floor(Math.random() * words.length)];

    while (chosen === previousTarget) {
        chosen = words[Math.floor(Math.random() * words.length)];
    }

    return chosen;
}

function submitWordGameGuess(element) {
    const instance = wordGameInstances.get(element);

    if (!instance || instance.state.finished) {
        return;
    }

    const {
        config,
        input,
        state
    } = instance;
    const guess = normalizeWord(input.value);

    if (guess.length !== config.length) {
        state.message = `La palabra debe tener ${config.length} letras.`;
        renderWordGame(element);
        return;
    }

    if (!/^[A-Z]+$/.test(guess)) {
        state.message = "Solo puedes usar letras.";
        renderWordGame(element);
        return;
    }

    const evaluation = evaluateGuess(guess, state.target);
    state.attempts.push({
        guess,
        evaluation
    });

    if (guess === state.target) {
        state.finished = true;
        state.won = true;
        state.message = `Has acertado: ${state.target}. Pulsa reiniciar para jugar otra vez.`;
    } else if (state.attempts.length >= config.attempts) {
        state.finished = true;
        state.message = `Se acabaron los intentos. La palabra era ${state.target}.`;
    } else {
        state.message = `Intento ${state.attempts.length} de ${config.attempts}. Sigue probando.`;
    }

    input.value = "";
    renderWordGame(element);
}

function renderWordGame(element) {
    const instance = wordGameInstances.get(element);

    if (!instance) {
        return;
    }

    const {
        config,
        board,
        input,
        message,
        submitButton,
        state
    } = instance;

    board.innerHTML = "";

    for (let rowIndex = 0; rowIndex < config.attempts; rowIndex += 1) {
        const row = document.createElement("div");
        row.className = "wordle-row";
        row.style.gridTemplateColumns = `repeat(${config.length}, minmax(0, 1fr))`;

        const attempt = state.attempts[rowIndex];

        for (let columnIndex = 0; columnIndex < config.length; columnIndex += 1) {
            const cell = document.createElement("div");
            cell.className = "wordle-cell";

            if (attempt) {
                cell.textContent = attempt.guess[columnIndex];
                cell.classList.add(attempt.evaluation[columnIndex]);
            }

            row.appendChild(cell);
        }

        board.appendChild(row);
    }

    message.textContent = state.message;
    input.disabled = state.finished;
    submitButton.disabled = state.finished;

    if (!state.finished) {
        input.focus();
    }
}

function evaluateGuess(guess, target) {
    const result = Array.from({
        length: target.length
    }, () => "absent");
    const remainingLetters = {};

    for (let index = 0; index < target.length; index += 1) {
        const targetLetter = target[index];
        const guessLetter = guess[index];

        if (guessLetter === targetLetter) {
            result[index] = "correct";
        } else {
            remainingLetters[targetLetter] = (remainingLetters[targetLetter] || 0) + 1;
        }
    }

    for (let index = 0; index < guess.length; index += 1) {
        if (result[index] === "correct") {
            continue;
        }

        const letter = guess[index];

        if (remainingLetters[letter]) {
            result[index] = "present";
            remainingLetters[letter] -= 1;
        }
    }

    return result;
}

function normalizeWord(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z]/g, "")
        .toUpperCase();
}

function showStatus(element, type, message) {
    if (!element) {
        return;
    }

    element.className = `estado ${type}`;
    element.textContent = message;
}

function createId() {
    if (window.crypto && "randomUUID" in window.crypto) {
        return window.crypto.randomUUID();
    }

    return `item-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

// ── Big Bang ──────────────────────────────────────────────────────────────────

const BIGBANG_SEEN_KEY = "planetaRebeldeBigBangSeen";

async function getLatestBigBang() {
    if (!supabaseClient) return null;
    try {
        const { data, error } = await supabaseClient
            .from("bigbang")
            .select("*")
            .order("triggered_at", { ascending: false })
            .limit(1);
        if (error) throw error;
        return data?.[0] || null;
    } catch (e) { return null; }
}

async function triggerBigBang(authorName) {
    if (!supabaseClient) throw new Error("Sin conexion a Supabase.");
    const { error } = await supabaseClient.from("bigbang").insert({
        id: createId(),
        triggered_by: authorName
    });
    if (error) throw error;
}

function hasSeenBigBang(id) {
    return localStorage.getItem(BIGBANG_SEEN_KEY) === String(id);
}

function markBigBangAsSeen(id) {
    localStorage.setItem(BIGBANG_SEEN_KEY, String(id));
}

async function initBigBang() {
    if (document.body?.dataset.page === "admin") return;
    const bb = await getLatestBigBang();
    if (!bb) return;
    if (hasSeenBigBang(bb.id)) return;
    markBigBangAsSeen(bb.id);
    showBigBangAnimation();
}

function playBigBangSound() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
        return;
    }

    try {
        const context = new AudioContextClass();
        const master = context.createGain();
        master.gain.setValueAtTime(0.0001, context.currentTime);
        master.connect(context.destination);
        master.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.04);
        master.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 2.8);

        const buildTone = (type, startFreq, endFreq, startAt, duration, gainAmount) => {
            const osc = context.createOscillator();
            const gain = context.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(startFreq, context.currentTime + startAt);
            osc.frequency.exponentialRampToValueAtTime(endFreq, context.currentTime + startAt + duration);
            gain.gain.setValueAtTime(0.0001, context.currentTime + startAt);
            gain.gain.exponentialRampToValueAtTime(gainAmount, context.currentTime + startAt + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + startAt + duration);
            osc.connect(gain);
            gain.connect(master);
            osc.start(context.currentTime + startAt);
            osc.stop(context.currentTime + startAt + duration + 0.05);
        };

        buildTone("sawtooth", 80, 28, 0, 1.8, 0.14);
        buildTone("triangle", 320, 120, 0.18, 2.1, 0.05);
        buildTone("sine", 620, 220, 0.42, 2.2, 0.035);

        const noiseBuffer = context.createBuffer(1, context.sampleRate * 1.6, context.sampleRate);
        const channel = noiseBuffer.getChannelData(0);
        for (let i = 0; i < channel.length; i++) {
            channel[i] = (Math.random() * 2 - 1) * (1 - i / channel.length);
        }
        const noiseSource = context.createBufferSource();
        const noiseFilter = context.createBiquadFilter();
        const noiseGain = context.createGain();
        noiseSource.buffer = noiseBuffer;
        noiseFilter.type = "lowpass";
        noiseFilter.frequency.setValueAtTime(1200, context.currentTime);
        noiseFilter.frequency.exponentialRampToValueAtTime(180, context.currentTime + 1.6);
        noiseGain.gain.setValueAtTime(0.0001, context.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.035, context.currentTime + 0.05);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1.6);
        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(master);
        noiseSource.start();
        noiseSource.stop(context.currentTime + 1.65);

        setTimeout(() => {
            context.close().catch(() => {});
        }, 3200);
    } catch (error) {
        // Si el navegador bloquea audio automatico, la animacion sigue funcionando sin sonido.
    }
}

function showBigBangAnimation() {
    const overlay = document.createElement("div");
    overlay.id = "bigbang-overlay";

    const canvas = document.createElement("canvas");
    canvas.id = "bigbang-canvas";
    overlay.appendChild(canvas);

    const center = document.createElement("div");
    center.className = "bigbang-center";
    center.innerHTML = `
        <h1 class="bigbang-title">Planeta Rebelde</h1>
        <p class="bigbang-subtitle">El universo siempre esta evolucionando</p>
        <button class="boton-accion bigbang-accept oculto" type="button">Aceptar</button>
    `;
    overlay.appendChild(center);
    document.body.appendChild(overlay);
    document.body.classList.add("sin-scroll");
    playBigBangSound();

    const acceptButton = center.querySelector(".bigbang-accept");
    let isClosing = false;

    const closeOverlay = () => {
        if (isClosing) {
            return;
        }
        isClosing = true;
        overlay.classList.add("fadeout");
        setTimeout(() => {
            overlay.remove();
            document.body.classList.remove("sin-scroll");
        }, 1300);
    };

    setTimeout(() => {
        acceptButton?.classList.remove("oculto");
    }, 5000);

    acceptButton?.addEventListener("click", closeOverlay);

    const ctx = canvas.getContext("2d");
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    window.addEventListener("resize", () => {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    });

    const COLORS = [
        "#7c3aed","#a78bfa","#c4b5fd",
        "#3b82f6","#60a5fa","#93c5fd",
        "#f59e0b","#fbbf24","#fcd34d",
        "#ef4444","#fb923c","#ffffff"
    ];

    const particles = [];
    const TOTAL = 320;
    let frame = 0;

    for (let i = 0; i < TOTAL; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 7;
        const delay = Math.floor(Math.random() * 40);
        particles.push({
            x: W / 2, y: H / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 1.5 + Math.random() * 4,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            alpha: 1,
            delay,
            trail: []
        });
    }

    let flashAlpha = 1;

    function draw() {
        ctx.clearRect(0, 0, W, H);

        if (flashAlpha > 0) {
            ctx.fillStyle = `rgba(255,255,255,${flashAlpha})`;
            ctx.fillRect(0, 0, W, H);
            flashAlpha -= 0.045;
        }

        for (const p of particles) {
            if (frame < p.delay) continue;

            p.trail.push({ x: p.x, y: p.y });
            if (p.trail.length > 8) p.trail.shift();

            for (let t = 0; t < p.trail.length; t++) {
                const ta = (t / p.trail.length) * p.alpha * 0.35;
                ctx.beginPath();
                ctx.arc(p.trail[t].x, p.trail[t].y, p.size * 0.5, 0, Math.PI * 2);
                ctx.globalAlpha = ta;
                ctx.fillStyle = p.color;
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2);
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.fill();
            ctx.globalAlpha = 1;

            const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
            grd.addColorStop(0, p.color);
            grd.addColorStop(1, "transparent");
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
            ctx.globalAlpha = p.alpha * 0.25;
            ctx.fillStyle = grd;
            ctx.fill();
            ctx.globalAlpha = 1;

            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.985;
            p.vy *= 0.985;
            p.alpha -= 0.006;
        }

        if (frame > 30) {
            const starCount = Math.min((frame - 30) * 2, 200);
            for (let s = 0; s < starCount; s++) {
                const sx = ((s * 1234567) % W);
                const sy = ((s * 7654321) % H);
                const ss = (s % 3 === 0) ? 1.5 : 0.8;
                ctx.beginPath();
                ctx.arc(sx, sy, ss, 0, Math.PI * 2);
                ctx.globalAlpha = 0.6;
                ctx.fillStyle = "#ffffff";
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }

        frame++;
        const allDone = particles.every(p => frame < p.delay || p.alpha <= 0);

        if (!allDone || frame < 130) {
            requestAnimationFrame(draw);
        } else {
            closeOverlay();
        }
    }

    requestAnimationFrame(draw);
}

function initAdminBigBang(activeSession) {
    const btn = document.getElementById("bigbang-trigger-btn");
    const status = document.getElementById("bigbang-status");
    if (!btn || !status) return;

    btn.addEventListener("click", async () => {
        btn.disabled = true;
        showStatus(status, "ok", "Activando...");
        try {
            playBigBangSound();
            await triggerBigBang(getUserDisplayName(activeSession.user));
            showStatus(status, "ok", "💥 Big Bang activado. Los usuarios veran la animacion la proxima vez que entren.");
        } catch (e) {
            showStatus(status, "error", "No se pudo activar: " + (e.message || ""));
            btn.disabled = false;
        }
    });
}

// ── Sistema de usuarios públicos ──────────────────────────────────────────────

const USER_SESSION_KEY = "planetaRebeldeUserSession";
const BAD_WORDS = ["puta","puto","mierda","gilipollas","capullo","imbecil","idiota","suicid","matar","fuck","shit","bitch","asshole","bastard","polla","coño","joder","hostia","cabron"];

let publicUserSession = null;
let publicUserAuthListenerReady = false;

function loadPublicUserSession() {
    try {
        const raw = localStorage.getItem(USER_SESSION_KEY);
        publicUserSession = raw ? JSON.parse(raw) : null;
    } catch(e) { publicUserSession = null; }
}

function savePublicUserSession(session) {
    publicUserSession = session;
    if (session) localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(USER_SESSION_KEY);
}

function containsBadWords(text) {
    const normalized = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return BAD_WORDS.some(w => normalized.includes(w));
}

function isPublicPortalUser(user) {
    const email = String(user?.email || "").toLowerCase();
    return email.endsWith("@users.planetarebelde.es");
}

function getPublicUserNameFromEmail(email) {
    return String(email || "").split("@")[0] || "usuario";
}

async function ensurePublicProfile(user, fallbackName = "") {
    if (!supabaseClient || !user?.id) {
        return null;
    }

    const fallbackUserName = String(
        fallbackName ||
        user.user_metadata?.display_name ||
        getPublicUserNameFromEmail(user.email)
    ).trim();

    let { data: profile, error } = await supabaseClient
        .from("perfiles")
        .select("user_id,user_name,avatar_color,banned,ban_until,ban_reason")
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!profile) {
        const avatarColor = randomAvatarColor();
        const payload = {
            user_id: user.id,
            user_name: fallbackUserName,
            avatar_color: avatarColor
        };
        const { data: insertedProfile, error: upsertError } = await supabaseClient
            .from("perfiles")
            .upsert(payload, { onConflict: "user_id" })
            .select("user_id,user_name,avatar_color,banned,ban_until,ban_reason")
            .single();

        if (upsertError) {
            throw upsertError;
        }

        profile = insertedProfile;
    }

    return profile;
}

async function syncPublicUserSessionFromSupabase(session = null) {
    if (!supabaseClient) {
        savePublicUserSession(null);
        return;
    }

    let activeSession = session;

    if (activeSession === null) {
        const { data, error } = await supabaseClient.auth.getSession();
        if (error) {
            throw error;
        }
        activeSession = data?.session || null;
    }

    if (!activeSession?.user || !isPublicPortalUser(activeSession.user)) {
        savePublicUserSession(null);
        return;
    }

    const profile = await ensurePublicProfile(activeSession.user);

    if (profile?.banned) {
        await supabaseClient.auth.signOut();
        savePublicUserSession(null);
        throw new Error(profile.ban_reason || "Tu cuenta ha sido baneada.");
    }

    savePublicUserSession({
        userId: activeSession.user.id,
        userName: profile?.user_name || getPublicUserNameFromEmail(activeSession.user.email),
        avatarColor: profile?.avatar_color || randomAvatarColor()
    });
}

async function initPublicUserSessionSync() {
    if (!supabaseClient) {
        savePublicUserSession(null);
        return;
    }

    try {
        await syncPublicUserSessionFromSupabase();
    } catch (error) {
        savePublicUserSession(null);
    }

    if (publicUserAuthListenerReady) {
        return;
    }

    supabaseClient.auth.onAuthStateChange(async (_event, session) => {
        try {
            await syncPublicUserSessionFromSupabase(session);
        } catch (error) {
            savePublicUserSession(null);
        }

        updateUserAuthButton();
        renderAllCommentSections();
    });

    publicUserAuthListenerReady = true;
}

async function registerPublicUser(userName, password) {
    if (!supabaseClient) throw new Error("Sin conexion a Supabase.");
    const clean = userName.toLowerCase().trim().replace(/[^a-z0-9_]/g, "");
    if (!clean) throw new Error("El nombre de usuario solo puede tener letras, numeros y guion bajo.");
    const email = `${clean}@users.planetarebelde.es`;
    const { data, error } = await supabaseClient.auth.signUp({ email, password,
        options: { data: { display_name: userName } }
    });
    if (error) {
        if (error.message.includes("already")) throw new Error("Ese nombre de usuario ya existe. Prueba con otro.");
        throw new Error("No se pudo crear la cuenta. Intenta con otro nombre.");
    }
    if (data.user) {
        const avatarColor = randomAvatarColor();
        const { error: profileError } = await supabaseClient.from("perfiles").upsert({
            user_id: data.user.id,
            user_name: userName,
            avatar_color: avatarColor
        }, { onConflict: "user_id" });
        if (profileError) throw profileError;
        savePublicUserSession({ userId: data.user.id, userName, avatarColor });
    }
    return data;
}

async function loginPublicUser(userName, password) {
    if (!supabaseClient) throw new Error("Sin conexion a Supabase.");
    const clean = userName.toLowerCase().trim().replace(/[^a-z0-9_]/g, "");
    const email = `${clean}@users.planetarebelde.es`;
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw new Error("Usuario o contraseña incorrectos.");
    const perfil = await ensurePublicProfile(data.user, userName);
    if (perfil?.banned) {
        await supabaseClient.auth.signOut();
        throw new Error("Tu cuenta ha sido baneada.");
    }
    const displayName = perfil?.user_name || userName;
    savePublicUserSession({ userId: data.user.id, userName: displayName, avatarColor: perfil?.avatar_color });
    return data;
}

async function logoutPublicUser() {
    if (supabaseClient) await supabaseClient.auth.signOut().catch(() => {});
    savePublicUserSession(null);
}

function randomAvatarColor() {
    const colors = ["#7c3aed","#2563eb","#059669","#d97706","#dc2626","#db2777","#0891b2"];
    return colors[Math.floor(Math.random() * colors.length)];
}

// ── Comentarios ───────────────────────────────────────────────────────────────

async function getComentarios(section) {
    if (!supabaseClient) return [];
    try {
        const { data, error } = await supabaseClient
            .from("comentarios")
            .select("*")
            .eq("section", section)
            .eq("banned", false)
            .order("created_at", { ascending: true });
        if (error) throw error;
        return data || [];
    } catch(e) { return []; }
}

async function postComentario(section, message) {
    if (!supabaseClient || !publicUserSession) throw new Error("Debes iniciar sesion para comentar.");
    if (containsBadWords(message)) throw new Error("Tu comentario contiene palabras no permitidas.");
    const { error } = await supabaseClient.from("comentarios").insert({
        section,
        user_id: publicUserSession.userId,
        user_name: publicUserSession.userName,
        message: message.trim()
    });
    if (error) throw error;
}

async function deleteComentario(id) {
    if (!supabaseClient) return;
    await supabaseClient.from("comentarios").delete().eq("id", id);
}

async function banComentario(id) {
    if (!supabaseClient) return;
    await supabaseClient.from("comentarios").update({ banned: true }).eq("id", id);
}

// ── Likes ──────────────────────────────────────────────────────────────────────

function buildPublicationLikeScope(section) {
    return String(section || "");
}

function buildPublicationCommentsScope(section, itemId) {
    return `publication:${String(section || "")}:${String(itemId)}`;
}

function buildCommentLikeScope(section) {
    return `comment:${String(section || "")}`;
}

async function getLikes(section, itemId) {
    if (!supabaseClient) return { count: 0, userLiked: false };
    try {
        const { data } = await supabaseClient
            .from("likes")
            .select("id,user_id")
            .eq("section", String(section))
            .eq("item_id", String(itemId));
        const uniqueUserIds = new Set((data || []).map((like) => String(like.user_id)));
        const count = uniqueUserIds.size;
        const userLiked = publicUserSession
            ? uniqueUserIds.has(String(publicUserSession.userId))
            : false;
        return { count, userLiked };
    } catch(e) { return { count: 0, userLiked: false }; }
}

async function toggleLike(section, itemId) {
    if (!supabaseClient || !publicUserSession) throw new Error("login");
    const { data, error } = await supabaseClient
        .from("likes")
        .select("id")
        .eq("section", String(section))
        .eq("item_id", String(itemId))
        .eq("user_id", String(publicUserSession.userId));
    if (error) throw error;
    if (data && data.length > 0) {
        const likeIds = data.map((like) => like.id).filter(Boolean);
        if (likeIds.length) {
            await supabaseClient.from("likes").delete().in("id", likeIds);
        }
        return false; // quitado
    } else {
        const { error: insertError } = await supabaseClient.from("likes").insert({
            section: String(section),
            item_id: String(itemId),
            user_id: String(publicUserSession.userId)
        });
        if (insertError) throw insertError;
        return true; // añadido
    }
}

// ── UI: Auth pública ──────────────────────────────────────────────────────────

function buildUserAuthModal() {
    const modal = document.createElement("div");
    modal.id = "user-auth-modal";
    modal.style.cssText = "position:fixed;inset:0;z-index:8000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);";
    modal.innerHTML = `
        <div style="width:min(100%,400px);background:var(--color-tarjeta,rgba(255,255,255,0.97));border-radius:28px;padding:28px;box-shadow:0 24px 60px rgba(0,0,0,0.2);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
                <span class="etiqueta">Mi cuenta</span>
                <button id="user-auth-close" style="background:none;border:none;cursor:pointer;font-size:1.2rem;opacity:0.5;">✕</button>
            </div>
            <div style="display:flex;gap:8px;margin-bottom:18px;">
                <button class="user-tab" data-tab="login" style="flex:1;padding:10px;border-radius:999px;border:none;cursor:pointer;font:inherit;font-weight:700;background:var(--color-principal,#ef5b47);color:#fff;">Entrar</button>
                <button class="user-tab" data-tab="register" style="flex:1;padding:10px;border-radius:999px;border:none;cursor:pointer;font:inherit;font-weight:700;background:rgba(0,0,0,0.07);">Registrarse</button>
            </div>
            <div id="user-auth-status" style="padding:10px 14px;border-radius:12px;font-weight:700;background:rgba(15,143,148,0.1);color:var(--color-secundario,#0f8f94);margin-bottom:14px;font-size:0.92rem;">Escribe tu nombre de usuario y contraseña.</div>
            <div style="display:grid;gap:12px;">
                <div class="campo">
                    <label style="font-weight:700;">Nombre de usuario</label>
                    <input id="ua-username" type="text" placeholder="Sin espacios ni simbolos" autocomplete="username" style="width:100%;padding:12px 14px;border-radius:14px;border:1px solid rgba(32,48,67,0.14);background:rgba(255,255,255,0.92);font:inherit;">
                    <small id="ua-hint" style="font-size:0.8rem;opacity:0.6;"></small>
                </div>
                <div class="campo">
                    <label style="font-weight:700;">Contraseña</label>
                    <input id="ua-password" type="password" placeholder="Al menos 6 caracteres" autocomplete="current-password" style="width:100%;padding:12px 14px;border-radius:14px;border:1px solid rgba(32,48,67,0.14);background:rgba(255,255,255,0.92);font:inherit;">
                </div>
                <button id="ua-submit" class="boton-accion" style="width:100%;padding:13px;">Entrar</button>
            </div>
        </div>`;
    return modal;
}

function openUserAuthModal() {
    const existing = document.getElementById("user-auth-modal");
    if (existing) { existing.remove(); return; }

    if (publicUserSession) {
        if (window.confirm(`Sesion activa como ${publicUserSession.userName}. ¿Cerrar sesion?`)) {
            logoutPublicUser();
            updateUserAuthButton();
        }
        return;
    }

    const modal = buildUserAuthModal();
    document.body.appendChild(modal);

    document.getElementById("user-auth-close").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });

    let currentTab = "login";

    modal.querySelectorAll(".user-tab").forEach(btn => {
        btn.addEventListener("click", () => {
            currentTab = btn.dataset.tab;
            modal.querySelectorAll(".user-tab").forEach(b => {
                const active = b.dataset.tab === currentTab;
                b.style.background = active ? "var(--color-principal,#ef5b47)" : "rgba(0,0,0,0.07)";
                b.style.color = active ? "#fff" : "";
            });
            const status = document.getElementById("user-auth-status");
            const hint = document.getElementById("ua-hint");
            const submit = document.getElementById("ua-submit");
            if (currentTab === "register") {
                status.textContent = "Elige un nombre de usuario y una contraseña para crear tu cuenta.";
                hint.textContent = "Solo letras, números y guion bajo. Sin espacios.";
                submit.textContent = "Crear cuenta";
            } else {
                status.textContent = "Escribe tu nombre de usuario y contraseña.";
                hint.textContent = "";
                submit.textContent = "Entrar";
            }
        });
    });

    document.getElementById("ua-username").addEventListener("input", e => {
        const hint = document.getElementById("ua-hint");
        if (currentTab === "register") {
            const clean = e.target.value.replace(/[^a-z0-9_]/gi, "");
            hint.textContent = clean ? `Tu usuario sera: ${clean}` : "Solo letras, numeros y guion bajo.";
        }
    });

    document.getElementById("ua-submit").addEventListener("click", async () => {
        const username = document.getElementById("ua-username").value.trim();
        const password = document.getElementById("ua-password").value;
        const status = document.getElementById("user-auth-status");
        const btn = document.getElementById("ua-submit");

        if (!username) { status.textContent = "Escribe tu nombre de usuario."; status.style.background = "rgba(239,91,71,0.12)"; status.style.color = "#b63a2c"; return; }
        if (password.length < 6) { status.textContent = "La contraseña debe tener al menos 6 caracteres."; status.style.background = "rgba(239,91,71,0.12)"; status.style.color = "#b63a2c"; return; }

        btn.disabled = true;
        status.style.background = "rgba(15,143,148,0.1)";
        status.style.color = "var(--color-secundario,#0f8f94)";
        status.textContent = currentTab === "login" ? "Entrando..." : "Creando cuenta...";

        try {
            if (currentTab === "login") await loginPublicUser(username, password);
            else await registerPublicUser(username, password);
            updateUserAuthButton();
            modal.remove();
            renderAllCommentSections();
        } catch(e) {
            status.textContent = e.message || "No se pudo completar la operacion.";
            status.style.background = "rgba(239,91,71,0.12)";
            status.style.color = "#b63a2c";
            btn.disabled = false;
        }
    });

    // Entrar con Enter
    modal.addEventListener("keydown", e => {
        if (e.key === "Enter") document.getElementById("ua-submit")?.click();
    });

    setTimeout(() => document.getElementById("ua-username")?.focus(), 100);
}

function updateUserAuthButton() {
    const btn = document.getElementById("user-auth-button");
    if (!btn) return;
    if (publicUserSession) {
        btn.textContent = publicUserSession.userName;
        btn.style.background = publicUserSession.avatarColor || "var(--color-principal)";
        btn.style.color = "#fff";
    } else {
        btn.textContent = "Cuenta";
        btn.style.background = "";
        btn.style.color = "";
    }
}

// ── UI: Sección de comentarios ────────────────────────────────────────────────

function renderAllCommentSections() {
    document.querySelectorAll("[data-comments-section]").forEach(el => {
        initCommentSection(el, el.dataset.commentsSection);
    });
}

async function initCommentSection(container, section, options = {}) {
    container.innerHTML = "";

    // Fila de entrada: textarea + botón like a la derecha
    const inputRow = document.createElement("div");
    inputRow.style.cssText = "display:flex;gap:10px;align-items:flex-end;margin-bottom:16px;";

    const textarea = document.createElement("textarea");
    textarea.placeholder = publicUserSession ? "Escribe tu comentario..." : "Inicia sesion para comentar";
    textarea.disabled = !publicUserSession;
    textarea.style.cssText = "flex:1;padding:12px 14px;border-radius:16px;border:1px solid rgba(32,48,67,0.14);background:rgba(255,255,255,0.92);font:inherit;min-height:72px;max-height:160px;resize:vertical;";

    const sendBtn = document.createElement("button");
    sendBtn.className = "boton-accion";
    sendBtn.style.cssText = "flex-shrink:0;padding:12px 18px;height:fit-content;";
    sendBtn.innerHTML = publicUserSession ? "💬 Comentar" : "Iniciar sesion";

    if (!publicUserSession) {
        sendBtn.addEventListener("click", openUserAuthModal);
    } else {
        sendBtn.addEventListener("click", async () => {
            const msg = textarea.value.trim();
            if (!msg) return;
            sendBtn.disabled = true;
            try {
                await postComentario(section, msg);
                textarea.value = "";
                await loadComments(feed, section, options);
                if (typeof options.onChange === "function") {
                    await options.onChange();
                }
            } catch(e) { alert(e.message); }
            sendBtn.disabled = false;
        });
    }

    inputRow.appendChild(textarea);
    inputRow.appendChild(sendBtn);
    container.appendChild(inputRow);

    const feed = document.createElement("div");
    feed.style.cssText = "display:grid;gap:10px;";
    container.appendChild(feed);
    await loadComments(feed, section, options);
    if (typeof options.onChange === "function") {
        await options.onChange();
    }
}

async function loadComments(feed, section, options = {}) {
    const comments = await getComentarios(section);
    feed.innerHTML = "";
    if (!comments.length) {
        feed.innerHTML = '<div class="vacio"><strong>Sin comentarios aun.</strong><p>Se el primero en comentar.</p></div>';
        return;
    }
    for (const c of comments) {
        const card = document.createElement("article");
        card.style.cssText = "display:grid;gap:8px;padding:14px;border-radius:16px;background:rgba(255,255,255,0.72);border:1px solid rgba(32,48,67,0.08);";

        // Cabecera: avatar + nombre + fecha
        const header = document.createElement("div");
        header.style.cssText = "display:flex;align-items:center;gap:8px;";
        const avatar = document.createElement("div");
        const col = c.avatar_color || randomAvatarColor();
        avatar.style.cssText = `width:30px;height:30px;border-radius:50%;background:${col};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:0.85rem;flex-shrink:0;`;
        avatar.textContent = (c.user_name || "?")[0].toUpperCase();
        const nameEl = document.createElement("strong");
        nameEl.textContent = c.user_name;
        nameEl.style.fontSize = "0.95rem";
        const dateEl = document.createElement("span");
        dateEl.textContent = formatDate(c.created_at);
        dateEl.style.cssText = "font-size:0.8rem;opacity:0.55;margin-left:auto;";
        header.appendChild(avatar); header.appendChild(nameEl); header.appendChild(dateEl);

        // Mensaje
        const msgEl = document.createElement("p");
        msgEl.textContent = c.message;
        msgEl.style.cssText = "margin:0;line-height:1.55;font-size:0.95rem;";

        // Fila de acciones: like inline + borrar propio
        const actions = document.createElement("div");
        actions.style.cssText = "display:flex;gap:10px;align-items:center;";

        // Like con contador actualizable
        const likeScope = buildCommentLikeScope(section);
        const { count: lc, userLiked: ul } = await getLikes(likeScope, c.id).catch(() => ({ count: 0, userLiked: false }));
        let currentCount = lc;
        let currentLiked = ul;

        const likeBtn = document.createElement("button");
        likeBtn.style.cssText = "display:inline-flex;align-items:center;gap:5px;background:none;border:1px solid rgba(32,48,67,0.12);border-radius:999px;padding:5px 12px;cursor:pointer;font:inherit;font-size:0.88rem;transition:background 0.15s,transform 0.15s;";
        const updateLikeBtn = () => {
            likeBtn.innerHTML = `${currentLiked ? "❤️" : "🤍"} <span>${currentCount}</span>`;
            likeBtn.style.background = currentLiked ? "rgba(239,91,71,0.1)" : "transparent";
            likeBtn.style.borderColor = currentLiked ? "rgba(239,91,71,0.3)" : "rgba(32,48,67,0.12)";
        };
        updateLikeBtn();
        likeBtn.addEventListener("click", async () => {
            if (!publicUserSession) { openUserAuthModal(); return; }
            if (likeBtn.dataset.processing === "1") return; // bloquear doble clic
            likeBtn.dataset.processing = "1";
            likeBtn.style.transform = "scale(1.2)";
            setTimeout(() => likeBtn.style.transform = "", 150);
            try {
                const liked = await toggleLike(likeScope, c.id);
                currentCount = liked ? currentCount + 1 : Math.max(0, currentCount - 1);
                currentLiked = liked;
                updateLikeBtn();
            } catch(e) { openUserAuthModal(); }
            likeBtn.dataset.processing = "0";
        });
        actions.appendChild(likeBtn);

        // Borrar propio
        if (publicUserSession && String(publicUserSession.userId) === String(c.user_id)) {
            const delBtn = document.createElement("button");
            delBtn.textContent = "Borrar";
            delBtn.style.cssText = "background:none;border:none;cursor:pointer;font:inherit;font-size:0.82rem;color:#b63a2c;opacity:0.7;padding:0;";
            delBtn.addEventListener("click", async () => {
                await deleteComentario(c.id);
                await loadComments(feed, section, options);
                if (typeof options.onChange === "function") {
                    await options.onChange();
                }
            });
            actions.appendChild(delBtn);
        }

        card.appendChild(header);
        card.appendChild(msgEl);
        card.appendChild(actions);
        feed.appendChild(card);
    }
}

// ── Planetas decorativos ───────────────────────────────────────────────────────

function initPlanetDecorations() {
    if (document.body.dataset.page === "admin") return;
    const shell = document.querySelector(".site-shell");
    if (!shell) return;

    const planets = [
        { size: 120, top: "8%",  right: "-40px", color1: "#7c3aed", color2: "#4c1d95", rings: true,  speed: 22 },
        { size: 70,  top: "35%", left:  "-25px",  color1: "#0891b2", color2: "#164e63", rings: false, speed: 18 },
        { size: 90,  top: "65%", right: "-30px",  color1: "#d97706", color2: "#92400e", rings: true,  speed: 26 },
        { size: 50,  top: "80%", left:  "-15px",  color1: "#059669", color2: "#064e3b", rings: false, speed: 20 }
    ];

    planets.forEach((p, i) => {
        const wrapper = document.createElement("div");
        wrapper.style.cssText = `position:fixed;${p.top ? "top:" + p.top : ""};${p.right ? "right:" + p.right : ""};${p.left ? "left:" + p.left : ""};z-index:0;pointer-events:none;opacity:0.35;animation:planet-float-${i} ${p.speed}s ease-in-out infinite;`;

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", p.size);
        svg.setAttribute("height", p.size + (p.rings ? 20 : 0));
        svg.setAttribute("viewBox", `0 0 ${p.size} ${p.size + (p.rings ? 20 : 0)}`);
        svg.style.filter = "drop-shadow(0 0 12px " + p.color1 + "66)";

        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        const grad = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
        grad.setAttribute("id", `pg${i}`);
        grad.setAttribute("cx", "35%"); grad.setAttribute("cy", "35%");
        const s1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        s1.setAttribute("offset", "0%"); s1.setAttribute("stop-color", p.color1);
        const s2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        s2.setAttribute("offset", "100%"); s2.setAttribute("stop-color", p.color2);
        grad.appendChild(s1); grad.appendChild(s2);
        defs.appendChild(grad);
        svg.appendChild(defs);

        const cy = p.rings ? p.size / 2 + 10 : p.size / 2;
        const r = p.size / 2;

        if (p.rings) {
            const ringEl = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
            ringEl.setAttribute("cx", p.size / 2); ringEl.setAttribute("cy", cy);
            ringEl.setAttribute("rx", r * 1.4); ringEl.setAttribute("ry", r * 0.22);
            ringEl.setAttribute("fill", "none");
            ringEl.setAttribute("stroke", p.color1 + "88"); ringEl.setAttribute("stroke-width", "4");
            svg.appendChild(ringEl);
        }

        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", p.size / 2); circle.setAttribute("cy", cy);
        circle.setAttribute("r", r - 2);
        circle.setAttribute("fill", `url(#pg${i})`);
        svg.appendChild(circle);

        wrapper.appendChild(svg);
        document.body.appendChild(wrapper);
    });

    const style = document.createElement("style");
    style.textContent = planets.map((p, i) => `
        @keyframes planet-float-${i} {
            0%,100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(${12 + i * 4}px) rotate(${i % 2 === 0 ? 8 : -8}deg); }
        }
    `).join("");
    document.head.appendChild(style);
}

// ── Cuenta regresiva año nuevo ────────────────────────────────────────────────

function initCountdown() {
    const container = document.getElementById("countdown-widget") || document.getElementById("new-year-countdown");
    const targetYearLabel = document.getElementById("countdown-target-year");
    if (!container) return;
    function update() {
        const now = new Date();
        const next = new Date(now.getFullYear() + 1, 0, 1);
        if (targetYearLabel) {
            targetYearLabel.textContent = String(next.getFullYear());
        }
        const diff = next - now;
        if (diff <= 0) { container.textContent = "🎆 ¡Feliz Año Nuevo!"; return; }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        if (container.id === "new-year-countdown") {
            container.textContent = `${d}d ${String(h).padStart(2,"0")}h ${String(m).padStart(2,"0")}m ${String(s).padStart(2,"0")}s`;
        } else {
            container.innerHTML = `<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
                ${[["Días",d],["Horas",h],["Min",m],["Seg",s]].map(([l,v])=>`
                <div style="text-align:center;min-width:60px;">
                    <div style="font-size:2rem;font-weight:700;color:var(--color-principal)">${String(v).padStart(2,"0")}</div>
                    <div style="font-size:0.78rem;opacity:0.6;">${l}</div>
                </div>`).join("")}
            </div>`;
        }
    }
    update();
    setInterval(update, 1000);
}


// ── Panel admin: gestión de usuarios ─────────────────────────────────────────

async function initAdminUsuariosPanel() {
    const lista = document.getElementById("usuarios-lista");
    const status = document.getElementById("usuarios-status");
    if (!lista || !status) return;
    if (!supabaseClient) { showStatus(status, "error", "Sin conexion a Supabase."); return; }

    showStatus(status, "ok", "Cargando usuarios...");

    try {
        const { data: perfiles, error } = await supabaseClient
            .from("perfiles")
            .select("*")
            .order("created_at", { ascending: false });
        if (error) throw error;

        lista.innerHTML = "";

        if (!perfiles || !perfiles.length) {
            lista.innerHTML = '<div class="vacio"><strong>No hay usuarios registrados aun.</strong></div>';
            showStatus(status, "ok", "Sin usuarios todavia.");
            return;
        }

        showStatus(status, "ok", `${perfiles.length} usuario${perfiles.length !== 1 ? "s" : ""} registrado${perfiles.length !== 1 ? "s" : ""}.`);

        for (const p of perfiles) {
            const card = document.createElement("article");
            card.className = "item-admin";
            card.style.cssText = p.banned ? "border-left:3px solid #ef4444;" : "";

            // Cabecera del usuario
            const header = document.createElement("div");
            header.style.cssText = "display:flex;align-items:center;gap:10px;";
            const avatar = document.createElement("div");
            avatar.style.cssText = `width:34px;height:34px;border-radius:50%;background:${p.avatar_color || "#7c3aed"};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:0.9rem;flex-shrink:0;`;
            avatar.textContent = (p.user_name || "?")[0].toUpperCase();
            const info = document.createElement("div");
            info.style.cssText = "flex:1;";
            info.innerHTML = `<strong>${p.user_name}</strong>${p.banned ? ' <span style="color:#ef4444;font-size:0.8rem;">● BANEADO</span>' : ''}<div style="font-size:0.82rem;opacity:0.6;">Registrado ${formatDate(p.created_at)}</div>`;
            header.appendChild(avatar);
            header.appendChild(info);
            card.appendChild(header);

            // Comentarios del usuario
            const { data: comentarios } = await supabaseClient
                .from("comentarios")
                .select("section, message, created_at, banned")
                .eq("user_id", p.user_id)
                .order("created_at", { ascending: false })
                .limit(10);

            if (comentarios && comentarios.length) {
                const toggle = document.createElement("button");
                toggle.style.cssText = "background:none;border:none;cursor:pointer;font:inherit;font-size:0.85rem;color:var(--color-secundario);padding:0;text-align:left;";
                toggle.textContent = `Ver ${comentarios.length} comentario${comentarios.length !== 1 ? "s" : ""}`;
                const commList = document.createElement("div");
                commList.style.cssText = "display:none;margin-top:8px;display:none;gap:6px;flex-direction:column;";
                commentarios?.forEach(c => {
                    const ci = document.createElement("div");
                    ci.style.cssText = `padding:8px 10px;border-radius:10px;font-size:0.88rem;background:${c.banned ? "rgba(239,91,71,0.08)" : "rgba(0,0,0,0.04)"};border-left:3px solid ${c.banned ? "#ef4444" : "transparent"};`;
                    ci.innerHTML = `<span style="opacity:0.6;font-size:0.78rem;">${c.section} · ${formatDate(c.created_at)}</span><br>${c.message}${c.banned ? ' <em style="color:#ef4444;">(baneado)</em>' : ''}`;
                    commList.appendChild(ci);
                });
                let shown = false;
                toggle.addEventListener("click", () => {
                    shown = !shown;
                    commList.style.display = shown ? "flex" : "none";
                    toggle.textContent = shown ? "Ocultar comentarios" : `Ver ${comentarios.length} comentario${comentarios.length !== 1 ? "s" : ""}`;
                });
                card.appendChild(toggle);
                card.appendChild(commList);
            } else {
                const noComm = document.createElement("p");
                noComm.style.cssText = "font-size:0.85rem;opacity:0.5;margin:4px 0 0;";
                noComm.textContent = "Sin comentarios.";
                card.appendChild(noComm);
            }

            // Botones de acción
            const actions = document.createElement("div");
            actions.className = "fila-botones";
            actions.style.marginTop = "8px";

            if (!p.banned) {
                // Selector de tiempo de baneo
                const banSelect = document.createElement("select");
                banSelect.style.cssText = "padding:8px 12px;border-radius:12px;border:1px solid rgba(32,48,67,0.14);background:rgba(255,255,255,0.9);font:inherit;font-size:0.88rem;cursor:pointer;";
                banSelect.innerHTML = `
                    <option value="1">Banear 1 día</option>
                    <option value="2">Banear 2 días</option>
                    <option value="7">Banear 7 días</option>
                    <option value="30">Banear 30 días</option>
                    <option value="0">Banear permanente</option>`;

                const banBtn = document.createElement("button");
                banBtn.className = "boton-borrar";
                banBtn.textContent = "🚫 Banear";
                banBtn.addEventListener("click", async () => {
                    const days = parseInt(banSelect.value);
                    const label = days === 0 ? "permanentemente" : `durante ${days} día${days !== 1 ? "s" : ""}`;
                    if (!confirm(`¿Banear a ${p.user_name} ${label}?`)) return;
                    banBtn.disabled = true;
                    try {
                        const banUntil = days === 0 ? null : new Date(Date.now() + days * 86400000).toISOString();
                        await supabaseClient.from("perfiles").update({
                            banned: true,
                            ban_until: banUntil,
                            ban_reason: `Baneado por admin ${label}`
                        }).eq("user_id", p.user_id);
                        // Banear también sus comentarios
                        await supabaseClient.from("comentarios").update({ banned: true }).eq("user_id", p.user_id);
                        showStatus(status, "ok", `${p.user_name} baneado ${label}.`);
                        await initAdminUsuariosPanel();
                    } catch(e) {
                        showStatus(status, "error", "Error al banear: " + (e.message || ""));
                        banBtn.disabled = false;
                    }
                });
                actions.appendChild(banSelect);
                actions.appendChild(banBtn);
            } else {
                const unbanBtn = document.createElement("button");
                unbanBtn.className = "boton-secundario-linea";
                unbanBtn.textContent = "✅ Desbanear";
                unbanBtn.addEventListener("click", async () => {
                    if (!confirm(`¿Desbanear a ${p.user_name}?`)) return;
                    await supabaseClient.from("perfiles").update({ banned: false, ban_until: null, ban_reason: null }).eq("user_id", p.user_id);
                    await supabaseClient.from("comentarios").update({ banned: false }).eq("user_id", p.user_id);
                    showStatus(status, "ok", `${p.user_name} desbaneado.`);
                    await initAdminUsuariosPanel();
                });
                actions.appendChild(unbanBtn);
            }

            card.appendChild(actions);
            lista.appendChild(card);
        }
    } catch(e) {
        showStatus(status, "error", "Error al cargar usuarios: " + (e.message || ""));
    }
}

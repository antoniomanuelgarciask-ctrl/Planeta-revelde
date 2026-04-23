const STORAGE_KEY = "planetaRebeldeContent";
const ONBOARDING_KEY = "planetaRebeldeOnboarding";
const AUTH_FLASH_KEY = "planetaRebeldeAuthFlash";
const MEDIA_DB_NAME = "planetaRebeldeMedia";
const MEDIA_STORE_NAME = "mediaFiles";
const DAILY_IMAGE_CACHE_KEY = "planetaRebeldeDailyImageCache";
const DAILY_IMAGE_LIBRARY_KEY = "planetaRebeldeDailyImageLibrary";
const RELEASE_NOTES_SEEN_KEY = "planetaRebeldeReleaseNotesSeen";
const APP_VERSION = "1.2";
const RELEASE_NOTES_VERSION = "2026-04-21-v1.2";
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
    enlace: "Enlace"
};

const CONTENT_MEDIA_CONFIG = {
    video: {
        mediaLabel: "URL del video",
        fileLabel: "Video desde tu ordenador",
        accept: "video/*",
        help: "Puedes usar una URL de YouTube, una URL directa o subir un video. Los archivos locales siguen guardandose solo en este navegador."
    },
    foto: {
        mediaLabel: "URL de la foto",
        fileLabel: "Foto desde tu ordenador",
        accept: "image/*",
        help: "Puedes pegar una URL de imagen o subir una foto. Los archivos locales siguen guardandose solo en este navegador."
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
    setupRevealAnimations();
    initHomeOnboarding();
    await initHomeAdminAccess();
    await renderDynamicContent();
    await initUserPreferences();
    initBugReportUi();
    await initReleaseNotesModal();
    await initAdminPage();
    initWordGames();
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
            title: "Panel admin renovado",
            text: "Ahora se pueden publicar fotos y tambien cargar una biblioteca propia para la imagen diaria."
        },
        {
            title: "Imagen diaria mejorada",
            text: "El fondo puede rotar automaticamente por fechas o por imagenes sin fecha fija."
        },
        {
            title: "Configuracion mas completa",
            text: "Puedes cambiar el color, tu nombre, ver las novedades otra vez y borrar tus datos para empezar desde cero."
        },
        {
            title: "Bienvenida mas comoda",
            text: "Si entras como admin desde la bienvenida, el nombre se rellena solo con tu cuenta."
        },
        {
            title: "Reporte de bugs guiado",
            text: "Ahora el formulario pide tipo de dispositivo, modelo, descripcion y permite adjuntar capturas."
        },
        {
            title: "Diseno mas bonito",
            text: "Se han rehecho los circulos de colores y el panel de novedades para que se vea mas cuidado."
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
            await openReleaseNotesModal(true);
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
    if (!document.body) {
        return;
    }

    document.body.classList.add("modo-imagen-diaria");
    document.body.style.setProperty("--daily-image-url", `url("${escapeCssUrl(url)}")`);
}

function clearDailyImageBackground() {
    if (!document.body) {
        return;
    }

    document.body.classList.remove("modo-imagen-diaria");
    document.body.style.removeProperty("--daily-image-url");
}

async function getDailyImageForToday() {
    const adminLibraryImage = await getDailyImageFromAdminLibrary();

    if (adminLibraryImage?.url) {
        return adminLibraryImage;
    }

    const remoteImage = await getDailyImageFromRemoteManifest();

    if (remoteImage?.url) {
        return remoteImage;
    }

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
        homeStatusType = "error";
        homeStatusOverride = buildUnauthorizedAdminMessage();
        await supabaseClient.auth.signOut();
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
            homeStatusType = "error";
            homeStatusOverride = buildUnauthorizedAdminMessage();
            await supabaseClient.auth.signOut();
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

        let mediaBlobId = "";

        if (uploadedFile) {
            if (!uploadedFile.type.startsWith("image/")) {
                showStatus(dailyImageStatus, "error", "El archivo de la imagen diaria debe ser una imagen valida.");
                return;
            }

            try {
                mediaBlobId = await saveMediaFile(uploadedFile);
            } catch (saveError) {
                showStatus(dailyImageStatus, "error", "No se ha podido guardar la imagen diaria en este navegador.");
                return;
            }
        }

        const nextEntry = {
            id: createId(),
            type: "foto",
            title: title || (date ? `Imagen diaria ${date}` : "Imagen diaria"),
            description,
            date,
            mediaUrl,
            mediaBlobId,
            mediaFileName: uploadedFile ? uploadedFile.name : "",
            mediaMimeType: uploadedFile ? uploadedFile.type : "",
            authorKey: activeSession.user.id,
            authorName: getUserDisplayName(activeSession.user),
            createdAt: new Date().toISOString()
        };

        try {
            const entries = getDailyImageLibrary();
            entries.push(nextEntry);
            saveDailyImageLibrary(entries);
        } catch (saveError) {
            if (mediaBlobId) {
                await deleteMediaFile(mediaBlobId).catch(() => {});
            }

            showStatus(dailyImageStatus, "error", "No se ha podido guardar la imagen diaria.");
            return;
        }

        dailyImageForm.reset();
        showStatus(dailyImageStatus, "ok", "Imagen guardada en la biblioteca diaria.");
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

        if (!button) {
            return;
        }

        if (!activeSession?.user) {
            redirectToIndex("Tu sesion ya no es valida para eliminar imagenes diarias.");
            return;
        }

        const itemId = button.dataset.deleteDailyImage;
        const items = getDailyImageLibrary();
        const selectedItem = items.find((item) => item.id === itemId);
        const nextItems = items.filter((item) => item.id !== itemId);

        try {
            saveDailyImageLibrary(nextItems);

            if (selectedItem?.mediaBlobId) {
                await deleteMediaFile(selectedItem.mediaBlobId).catch(() => {});
            }
        } catch (deleteError) {
            showStatus(dailyImageStatus, "error", "No se ha podido eliminar la imagen diaria.");
            return;
        }

        showStatus(dailyImageStatus, "ok", "Imagen diaria eliminada.");
        renderDailyImageItems(dailyImageItems);
    });
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
        return {
            kind: "image",
            url: sourceUrl
        };
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
    if (!container) {
        return;
    }

    const items = getDailyImageLibrary()
        .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));

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
        schedule.textContent = item.date
            ? `Programada para ${formatCalendarDate(item.date)}`
            : "Rotacion automatica";
        card.appendChild(schedule);

        const meta = document.createElement("div");
        meta.className = "meta";
        meta.textContent = `${item.authorName || "admin"} | ${formatDate(item.createdAt)}`;
        card.appendChild(meta);

        if (item.mediaFileName) {
            const fileMeta = document.createElement("div");
            fileMeta.className = "meta";
            fileMeta.textContent = `Archivo local: ${item.mediaFileName}`;
            card.appendChild(fileMeta);
        } else if (item.mediaUrl) {
            const urlMeta = document.createElement("div");
            urlMeta.className = "meta";
            urlMeta.textContent = item.mediaUrl;
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

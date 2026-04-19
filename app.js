const STORAGE_KEY = "planetaRebeldeContent";
const ONBOARDING_KEY = "planetaRebeldeOnboarding";
const AUTH_FLASH_KEY = "planetaRebeldeAuthFlash";
const MEDIA_DB_NAME = "planetaRebeldeMedia";
const MEDIA_STORE_NAME = "mediaFiles";

const SUPABASE_URL = "https://wmfakzggzasxjdopzeum.supabase.co";
const SUPABASE_KEY = "sb_publishable_PazuWCH8UemDvm0QwUIhbA_CWnJa95c";

// La cuenta entra al panel si el nombre en user_metadata o la parte antes de @ en el email coincide con una clave permitida.
const ADMIN_ACCESS_KEYS = new Set([
    "antonio",
    "antoniomanuelgarciask",
    "marta",
    "amin",
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

applyStoredTheme();

document.addEventListener("DOMContentLoaded", async () => {
    setupRevealAnimations();
    initHomeOnboarding();
    await initHomeAdminAccess();
    await renderDynamicContent();
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

function getOnboardingData() {
    try {
        const raw = localStorage.getItem(ONBOARDING_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        return {
            seen: Boolean(parsed.seen),
            name: String(parsed.name || "").trim(),
            age: String(parsed.age || "").trim(),
            color: String(parsed.color || "").trim().toLowerCase()
        };
    } catch (error) {
        return {
            seen: false,
            name: "",
            age: "",
            color: ""
        };
    }
}

function saveOnboardingData(data) {
    const nextData = {
        seen: Boolean(data.seen),
        name: String(data.name || "").trim(),
        age: String(data.age || "").trim(),
        color: String(data.color || "").trim().toLowerCase()
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
    const greeting = document.getElementById("visitor-greeting");
    const summary = document.getElementById("visitor-summary");

    if (!modal || !form || !skipButton) {
        return;
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
            age: current.age,
            color: current.color
        });

        applyTheme(current.color);
        updateVisitorText();
        closeModal();
    };

    const updateVisitorText = () => {
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
            summary.textContent = "Personaliza tu primera visita con el cartel de bienvenida.";
            return;
        }

        if (data.color) {
            summary.textContent = `Tu tema activo es ${formatColorName(data.color)} y seguira guardado en este navegador.`;
            return;
        }

        summary.textContent = "Has saltado la personalizacion inicial. Puedes seguir navegando con el estilo original.";
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
            age: String(formData.get("visitorAge") || "").trim(),
            color: selectedColor
        };

        saveOnboardingData(payload);
        applyTheme(payload.color);
        updateVisitorText();
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
    const itemList = document.getElementById("admin-items");

    if (!publishForm || !statusBox || !typeField || !itemList) {
        document.body.classList.remove("auth-pending");
        return;
    }

    const syncTypeFields = () => {
        const type = typeField.value;
        const showVideoFields = type === "video";
        const showActionFields = type !== "texto";

        mediaFieldWrap.classList.toggle("oculto", !showVideoFields);
        fileFieldWrap.classList.toggle("oculto", !showVideoFields);
        actionFieldWrap.classList.toggle("oculto", !showActionFields);
        actionLabelWrap.classList.toggle("oculto", !showActionFields);

        if (!showVideoFields && fileInput) {
            fileInput.value = "";
        }
    };

    const setPublishingEnabled = (enabled) => {
        publishForm.querySelectorAll("input, textarea, select, button").forEach((field) => {
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

        setPublishingEnabled(Boolean(user));
        renderAdminItems(itemList);
        document.body.classList.remove("auth-pending");
    };

    updateAdminHeader();
    syncTypeFields();
    showStatus(statusBox, "ok", `Sesion validada como ${getUserDisplayName(activeSession.user)}.`);

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

        if (type === "video" && !mediaUrl && !uploadedFile) {
            showStatus(statusBox, "error", "Para un video necesitas una URL o un archivo de tu ordenador.");
            return;
        }

        if (type === "enlace" && !actionUrl) {
            showStatus(statusBox, "error", "Para un enlace necesitas una URL.");
            return;
        }

        let mediaBlobId = "";

        if (uploadedFile) {
            if (!uploadedFile.type.startsWith("video/")) {
                showStatus(statusBox, "error", "El archivo local debe ser un video valido.");
                return;
            }

            try {
                mediaBlobId = await saveMediaFile(uploadedFile);
            } catch (saveError) {
                showStatus(statusBox, "error", "No se ha podido guardar el video local en este navegador.");
                return;
            }
        }

        const newItem = {
            id: createId(),
            section: String(formData.get("section") || "inicio"),
            type,
            title,
            description,
            mediaUrl,
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
            const items = getStoredItems();
            items.push(newItem);
            saveStoredItems(items);
        } catch (saveError) {
            if (mediaBlobId) {
                await deleteMediaFile(mediaBlobId).catch(() => {});
            }

            showStatus(statusBox, "error", "No se ha podido guardar la publicacion.");
            return;
        }

        publishForm.reset();
        typeField.value = "texto";
        syncTypeFields();
        showStatus(statusBox, "ok", `Contenido publicado en ${SECTION_NAMES[newItem.section]}.`);
        renderAdminItems(itemList);
        await renderDynamicContent();
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
        const items = getStoredItems();
        const selectedItem = items.find((item) => item.id === itemId);
        const nextItems = items.filter((item) => item.id !== itemId);

        try {
            saveStoredItems(nextItems);

            if (selectedItem?.mediaBlobId) {
                await deleteMediaFile(selectedItem.mediaBlobId).catch(() => {});
            }
        } catch (deleteError) {
            showStatus(statusBox, "error", "No se ha podido eliminar la publicacion.");
            return;
        }

        showStatus(statusBox, "ok", "Publicacion eliminada.");
        renderAdminItems(itemList);
        await renderDynamicContent();
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

    const metadataName = String(user.user_metadata?.name || user.user_metadata?.full_name || "").trim();

    if (metadataName) {
        return metadataName;
    }

    if (user.email) {
        return user.email.split("@")[0];
    }

    return "admin";
}

function normalizeAdminKey(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toLowerCase();
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
    return getUserAdminKeys(user).some((key) => ADMIN_ACCESS_KEYS.has(key));
}

function buildUnauthorizedAdminMessage() {
    return "Tu cuenta no esta autorizada para el panel. Admins permitidos: Antonio, Marta, Amin, Carmen, Maria y Dario.";
}

function supportsMediaStorage() {
    return typeof indexedDB !== "undefined";
}

function openMediaDatabase() {
    if (!supportsMediaStorage()) {
        return Promise.reject(new Error("Este navegador no permite guardar videos locales."));
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
        transaction.onerror = () => reject(transaction.error || new Error("No se pudo guardar el video local."));
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
        request.onerror = () => reject(request.error || new Error("No se pudo leer el video guardado."));
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
        transaction.onerror = () => reject(transaction.error || new Error("No se pudo borrar el video guardado."));
        transaction.onabort = () => reject(transaction.error || new Error("La operacion de borrado fue cancelada."));
    });
}

async function renderDynamicContent() {
    const containers = document.querySelectorAll("[data-render-content]");

    for (const container of containers) {
        const section = container.dataset.renderContent;
        const items = getStoredItems()
            .filter((item) => item.section === section)
            .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));

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
    return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url);
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
    const names = {
        texto: "Texto",
        video: "Video",
        enlace: "Enlace"
    };

    return names[type] || "Contenido";
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

function renderAdminItems(container) {
    const items = getStoredItems()
        .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));

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

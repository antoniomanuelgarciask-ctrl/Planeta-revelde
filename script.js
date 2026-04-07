const STORAGE_KEY = "planetaRebeldeContent";
const SESSION_KEY = "planetaRebeldeAdminSession";
const MEDIA_DB_NAME = "planetaRebeldeMedia";
const MEDIA_STORE_NAME = "mediaFiles";

const ADMIN_USERS = {
    antonio: {
        name: "Antonio",
        password: "SolR3belde!27"
    },
    marta: {
        name: "Marta",
        password: "Orbit4Marta#81"
    },
    amin: {
        name: "Amin",
        password: "NovaAmin@54"
    },
    carmen: {
        name: "Carmen",
        password: "CarmenLuna*92"
    }
};

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

let mediaDatabasePromise = null;
const wordGameInstances = new WeakMap();

document.addEventListener("DOMContentLoaded", () => {
    setupRevealAnimations();
    renderDynamicContent();
    initAdminPanel();
    initWordGames();
});

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

function getSessionUserKey() {
    return localStorage.getItem(SESSION_KEY) || "";
}

function setSessionUserKey(userKey) {
    localStorage.setItem(SESSION_KEY, userKey);
}

function clearSessionUserKey() {
    localStorage.removeItem(SESSION_KEY);
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

function initAdminPanel() {
    const page = document.body.dataset.page;

    if (page !== "admin") {
        return;
    }

    const loginView = document.getElementById("login-view");
    const panelView = document.getElementById("panel-view");
    const loginForm = document.getElementById("login-form");
    const publishForm = document.getElementById("publish-form");
    const statusBox = document.getElementById("admin-status");
    const sessionName = document.getElementById("session-name");
    const logoutButton = document.getElementById("logout-button");
    const typeField = document.getElementById("content-type");
    const mediaFieldWrap = document.getElementById("media-field");
    const actionFieldWrap = document.getElementById("action-field");
    const actionLabelWrap = document.getElementById("action-label-field");
    const fileFieldWrap = document.getElementById("file-field");
    const fileInput = document.getElementById("content-media-file");
    const itemList = document.getElementById("admin-items");
    const welcomeOverlay = document.getElementById("welcome-overlay");
    const welcomeName = document.getElementById("welcome-name");
    const closeWelcomeButton = document.getElementById("close-welcome");

    const hideWelcomeOverlay = () => {
        if (!welcomeOverlay || welcomeOverlay.classList.contains("oculto")) {
            return;
        }

        welcomeOverlay.classList.remove("visible");
        window.setTimeout(() => {
            welcomeOverlay.classList.add("oculto");
            welcomeOverlay.setAttribute("aria-hidden", "true");
            document.body.classList.remove("sin-scroll");
        }, 220);
    };

    const showWelcomeOverlay = (userName) => {
        if (!welcomeOverlay) {
            return;
        }

        welcomeName.textContent = userName;
        welcomeOverlay.classList.remove("oculto");
        welcomeOverlay.setAttribute("aria-hidden", "false");
        document.body.classList.add("sin-scroll");

        requestAnimationFrame(() => {
            welcomeOverlay.classList.add("visible");
        });
    };

    const syncTypeFields = () => {
        const type = typeField.value;
        const showVideoFields = type === "video";
        const showActionFields = type !== "texto";

        mediaFieldWrap.classList.toggle("oculto", !showVideoFields);
        fileFieldWrap.classList.toggle("oculto", !showVideoFields);
        actionFieldWrap.classList.toggle("oculto", !showActionFields);
        actionLabelWrap.classList.toggle("oculto", !showActionFields);

        if (!showVideoFields) {
            fileInput.value = "";
        }
    };

    const setPublishingEnabled = (enabled) => {
        publishForm.querySelectorAll("input, textarea, select, button").forEach((field) => {
            field.disabled = !enabled;
        });
    };

    const updateView = () => {
        const userKey = getSessionUserKey();
        const currentUser = ADMIN_USERS[userKey];

        loginView.classList.toggle("oculto", Boolean(currentUser));
        panelView.classList.toggle("oculto", !currentUser);
        setPublishingEnabled(Boolean(currentUser));

        if (currentUser) {
            sessionName.textContent = currentUser.name;
        } else {
            hideWelcomeOverlay();
        }

        renderAdminItems(itemList);
    };

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(loginForm);
        const userKey = String(formData.get("user") || "").trim().toLowerCase();
        const password = String(formData.get("password") || "");
        const account = ADMIN_USERS[userKey];

        if (!account || account.password !== password) {
            showStatus(statusBox, "error", "Usuario o contrasena incorrectos.");
            return;
        }

        setSessionUserKey(userKey);
        loginForm.reset();
        showStatus(statusBox, "ok", `Sesion iniciada como ${account.name}.`);
        updateView();
        showWelcomeOverlay(account.name);
    });

    logoutButton.addEventListener("click", () => {
        clearSessionUserKey();
        showStatus(statusBox, "ok", "Sesion cerrada.");
        updateView();
    });

    closeWelcomeButton.addEventListener("click", hideWelcomeOverlay);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            hideWelcomeOverlay();
        }
    });

    typeField.addEventListener("change", syncTypeFields);

    publishForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const userKey = getSessionUserKey();
        const currentUser = ADMIN_USERS[userKey];

        if (!currentUser) {
            showStatus(statusBox, "error", "Primero debes iniciar sesion.");
            updateView();
            return;
        }

        const formData = new FormData(publishForm);
        const type = String(formData.get("type") || "texto");
        const title = String(formData.get("title") || "").trim();
        const description = String(formData.get("description") || "").trim();
        const mediaUrl = String(formData.get("mediaUrl") || "").trim();
        const actionUrl = String(formData.get("actionUrl") || "").trim();
        const actionLabel = String(formData.get("actionLabel") || "").trim();
        const uploadedFile = fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;

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
            } catch (error) {
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
            authorKey: userKey,
            authorName: currentUser.name,
            createdAt: new Date().toISOString()
        };

        try {
            const items = getStoredItems();
            items.push(newItem);
            saveStoredItems(items);
        } catch (error) {
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

        const itemId = button.dataset.deleteId;
        const items = getStoredItems();
        const selectedItem = items.find((item) => item.id === itemId);
        const nextItems = items.filter((item) => item.id !== itemId);

        try {
            saveStoredItems(nextItems);

            if (selectedItem && selectedItem.mediaBlobId) {
                await deleteMediaFile(selectedItem.mediaBlobId).catch(() => {});
            }
        } catch (error) {
            showStatus(statusBox, "error", "No se ha podido eliminar la publicacion.");
            return;
        }

        showStatus(statusBox, "ok", "Publicacion eliminada.");
        renderAdminItems(itemList);
        await renderDynamicContent();
    });

    syncTypeFields();
    updateView();
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

    const { config, input, state } = instance;
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

    const { config, board, input, message, submitButton, state } = instance;

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
    element.className = `estado ${type}`;
    element.textContent = message;
}

function createId() {
    if (window.crypto && "randomUUID" in window.crypto) {
        return window.crypto.randomUUID();
    }

    return `item-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

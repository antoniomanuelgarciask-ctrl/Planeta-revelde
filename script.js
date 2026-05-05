// Legacy file kept only for compatibility.
// The active application code now lives in app.js.
(function loadPlanetaRebeldeApp() {
    if (window.__planetaRebeldeAppLoaded) {
        return;
    }

    window.__planetaRebeldeAppLoaded = true;

    const script = document.createElement("script");
    script.src = "app.js";
    script.defer = true;
    document.head.appendChild(script);
}());

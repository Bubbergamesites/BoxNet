(function() {
    console.log("Boss Key: Script Loaded");

    const CONFIG = {
        fakeTitle: "Google",
        fakeFavicon: "https://www.google.com/favicon.ico",
        fakeImgUrl: window.location.origin + "stuff/google.png", // Try removing the leading slash
        idleTime: 50000, // Reduced to 5s for faster testing
        panicKey: "Escape"
    };

    let idleTimer;
    let isHidden = false;
    let originalTitle = document.title;
    let originalFavicon = "";

    // Helper to find the favicon
    function getFavicon() {
        let link = document.querySelector("link[rel*='icon']");
        return link ? link.href : "/favicon.ico";
    }

    function updateTab(title, iconUrl) {
        document.title = title;
        let link = document.querySelector("link[rel*='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = iconUrl + "?v=" + Date.now();
    }

    function hide() {
        if (isHidden) return;
        console.log("Boss Key: Hiding Evidence...");
        isHidden = true;
        
        updateTab(CONFIG.fakeTitle, CONFIG.fakeFavicon);

        const overlay = document.createElement('div');
        overlay.id = "boss-overlay";
        overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 2147483647 !important;
            background: white url('${CONFIG.fakeImgUrl}') no-repeat center center / cover !important;
            display: block !important;
        `;
        
        // Use documentElement to ensure it stays above the body
        document.documentElement.appendChild(overlay);
    }

    function show() {
        if (!isHidden) return;
        console.log("Boss Key: Restoring Page...");
        isHidden = false;
        
        updateTab(originalTitle, originalFavicon);
        
        const overlay = document.getElementById("boss-overlay");
        if (overlay) overlay.remove();
        
        resetTimer();
    }

    function resetTimer() {
        clearTimeout(idleTimer);
        if (!isHidden) {
            idleTimer = setTimeout(hide, CONFIG.idleTime);
        }
    }

    // Capture the icon path on start
    originalFavicon = getFavicon();

    // Listen for the Panic Key
    window.addEventListener('keydown', (e) => {
        if (e.key === CONFIG.panicKey) {
            console.log("Boss Key: Panic Key Pressed");
            isHidden ? show() : hide();
        } else {
            show();
        }
    }, true);

    // Listen for mouse movement/clicks
    ['mousedown', 'mousemove', 'scroll'].forEach(evt => {
        window.addEventListener(evt, () => {
            if (isHidden) show();
            else resetTimer();
        }, {passive: true});
    });

    // Instant hide on tab switch
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) hide();
    });

    resetTimer();
    console.log("Boss Key: Timer Started (" + CONFIG.idleTime + "ms)");
})();

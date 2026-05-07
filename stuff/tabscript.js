(function() {
    const CONFIG = {
        fakeTitle: "Google",
        fakeFavicon: "https://www.google.com/favicon.ico",
        // Absolute path to your image
        fakeImgUrl: window.location.origin + "/stuff/google.png", 
        idleTime: 10000 
    };

    let idleTimer;
    let isHidden = false;
    let originalTitle = document.title;
    let originalFavicon = "";

    // Pre-load the image into the browser's memory immediately
    const preLoadImg = new Image();
    preLoadImg.src = CONFIG.fakeImgUrl;

    function init() {
        const link = document.querySelector("link[rel*='icon']");
        originalFavicon = link ? link.href : window.location.origin + "/favicon.ico";
        resetTimer();
    }

    function updateFavicon(url) {
        document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());
        const link = document.createElement('link');
        link.rel = 'icon';
        // Cache-buster to force the tab to update
        link.href = url + (url.includes('?') ? '&' : '?') + "v=" + Date.now();
        document.head.appendChild(link);
    }

    function hideEvidence() {
        if (isHidden) return;
        isHidden = true;
        
        document.title = CONFIG.fakeTitle;
        updateFavicon(CONFIG.fakeFavicon);

        // We create a DIV container instead of just an IMG for better reliability
        const overlay = document.createElement('div');
        overlay.id = "fake-overlay";
        overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 2147483647 !important;
            background-color: white !important; /* Fallback if image fails */
            background-image: url('${CONFIG.fakeImgUrl}') !important;
            background-size: cover !important;
            background-position: center !important;
            display: block !important;
            cursor: none !important;
        `;
        
        // Instant removal on mouse touch
        overlay.addEventListener('mouseenter', restorePage);
        
        // Append to the HTML tag to bypass any body loading issues
        document.documentElement.appendChild(overlay);
    }

    function restorePage() {
        const overlay = document.getElementById('fake-overlay');
        if (!isHidden && !overlay) return;

        document.title = originalTitle;
        updateFavicon(originalFavicon);

        if (overlay) overlay.remove();

        isHidden = false;
        resetTimer();
    }

    function resetTimer() {
        clearTimeout(idleTimer);
        if (!isHidden) {
            idleTimer = setTimeout(hideEvidence, CONFIG.idleTime);
        }
    }

    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(evt => {
        document.addEventListener(evt, () => {
            if (isHidden) restorePage();
            else resetTimer();
        }, true);
    });

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) hideEvidence();
        else restorePage();
    });

    init();
})();

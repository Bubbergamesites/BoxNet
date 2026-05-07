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
        
        document.title = CONFIG.fakeTitle;
        let favicon = document.querySelector("link[rel*='icon']");
        if (favicon) favicon.href = CONFIG.fakeFavicon;

        // Create the image overlay
        const img = document.createElement('img');
        img.id = "fake-overlay";
        img.src = CONFIG.fakeImgUrl;
        img.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            object-fit: cover;
            z-index: 2147483647; /* Maximum possible z-index */
            cursor: default;
        `;
        
        document.body.appendChild(img);
        isHidden = true;
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

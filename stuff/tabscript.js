(function() {
    const CONFIG = {
        originalTitle: document.title,
        originalFavicon: document.querySelector("link[rel*='icon']")?.href || "",
        fakeTitle: "Google",
        fakeFavicon: "https://www.google.com/favicon.ico",
        fakeImgUrl: "/stuff/google.png", 
        idleTime: 10000 
    };

    let idleTimer;
    let isHidden = false;

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
        if (!isHidden) return;

        document.title = CONFIG.originalTitle;
        let favicon = document.querySelector("link[rel*='icon']");
        if (favicon) favicon.href = CONFIG.originalFavicon;

        const img = document.getElementById('fake-overlay');
        if (img) img.remove();

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
    });

    resetTimer();
})();

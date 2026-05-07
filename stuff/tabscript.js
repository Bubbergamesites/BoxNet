(function() {
    const CONFIG = {
        fakeTitle: "Google",
        fakeFavicon: "https://www.google.com/favicon.ico",
        fakeImgUrl: window.location.origin + "/stuff/google.png", 
        idleTime: 10000 
    };

    let idleTimer;
    let isHidden = false;
    let originalTitle = document.title;
    let originalIcons = [];

    function saveOriginalIcons() {
        const icons = document.querySelectorAll("link[rel*='icon']");
        icons.forEach(icon => {
            originalIcons.push({
                rel: icon.rel,
                href: icon.href,
                sizes: icon.sizes.value,
                type: icon.type
            });
        });
    }

    function updateIcons(url) {
        document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = url + "?v=" + Date.now();
        document.head.appendChild(link);
    }

    function restoreIcons() {
        document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());
        originalIcons.forEach(iconData => {
            const link = document.createElement('link');
            link.rel = iconData.rel;
            link.href = iconData.href + "?v=" + Date.now();
            if (iconData.sizes) link.sizes = iconData.sizes;
            if (iconData.type) link.type = iconData.type;
            document.head.appendChild(link);
        });
    }

    function hideEvidence() {
        // Kill any existing timer so they don't stack
        clearTimeout(idleTimer);
        
        if (isHidden) return;
        isHidden = true;
        
        document.title = CONFIG.fakeTitle;
        updateIcons(CONFIG.fakeFavicon);

        const img = document.createElement('img');
        img.id = "emergency-overlay";
        img.src = CONFIG.fakeImgUrl;
        img.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            object-fit: cover !important;
            z-index: 2147483647 !important;
            background: white !important;
            display: block !important;
        `;
        
        // Instant trigger on mouse touch
        img.addEventListener('mouseenter', restorePage);
        
        document.documentElement.appendChild(img);
    }

    function restorePage() {
        // Force the check to be sure we are actually hidden
        const img = document.getElementById('emergency-overlay');
        
        if (!isHidden && !img) return;

        // Clean up
        if (img) img.remove();
        
        document.title = originalTitle;
        restoreIcons();

        isHidden = false;
        
        // CRITICAL: Restart the idle timer from scratch
        resetTimer();
    }

    function resetTimer() {
        clearTimeout(idleTimer);
        if (!isHidden) {
            idleTimer = setTimeout(hideEvidence, CONFIG.idleTime);
        }
    }

    // Capture activity and force a reset
    ['mousedown', 'mousemove', 'keypress', 'scroll'].forEach(evt => {
        document.addEventListener(evt, () => {
            if (isHidden) {
                restorePage();
            } else {
                resetTimer();
            }
        }, true);
    });

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            hideEvidence();
        } else {
            restorePage();
        }
    });

    saveOriginalIcons();
    resetTimer();
})();

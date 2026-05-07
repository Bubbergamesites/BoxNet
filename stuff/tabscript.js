(function() {
    // --- CONFIGURATION ---
    const CONFIG = {
        fakeTitle: "Google",
        fakeFavicon: "https://www.google.com/favicon.ico",
        // Use the absolute path or a full URL to ensure it loads
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

    function updateIcons(url, forceRefresh = false) {
        document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = url + (forceRefresh ? "?v=" + Date.now() : "");
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
        `;
        
        // Instant removal on mouse touch
        img.addEventListener('mouseenter', restorePage);
        
        // Append to HTML root to ensure visibility
        document.documentElement.appendChild(img);
    }

    function restorePage() {
        if (!isHidden) return;
        isHidden = false;

        document.title = originalTitle;
        restoreIcons();

        const img = document.getElementById('emergency-overlay');
        if (img) img.remove();

        resetTimer();
    }

    function resetTimer() {
        clearTimeout(idleTimer);
        if (!isHidden) {
            idleTimer = setTimeout(hideEvidence, CONFIG.idleTime);
        }
    }

    // Activity Listeners
    ['mousedown', 'mousemove', 'keypress', 'scroll'].forEach(evt => {
        document.addEventListener(evt, () => {
            if (isHidden) restorePage();
            else resetTimer();
        }, true);
    });

    // INSTANT SWITCH on Tab Change
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            hideEvidence(); // Switches to Google the millisecond you click away
        } else {
            restorePage();
        }
    });

    saveOriginalIcons();
    resetTimer();
})();

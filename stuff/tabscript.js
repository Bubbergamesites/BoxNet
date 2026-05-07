(function() {
    // --- CONFIGURATION ---
    const CONFIG = {
        fakeTitle: "Google",
        fakeFavicon: "https://www.google.com/favicon.ico",
        // Forces the path to be absolute to your current domain
        fakeImgUrl: window.location.origin + "/stuff/google.png", 
        idleTime: 10000 
    };

    let idleTimer;
    let isHidden = false;
    let originalTitle = document.title;
    let originalIcons = [];

    // Save all current favicons so we can restore them later
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
        // Cache-busting prevents the Google icon from "sticking"
        link.href = url + (forceRefresh ? "?v=" + Date.now() : "");
        document.head.appendChild(link);
    }

    function restoreIcons() {
        document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());
        originalIcons.forEach(iconData => {
            const link = document.createElement('link');
            link.rel = iconData.rel;
            // Force browser to re-render original icon
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

        // Create the image overlay
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
        
        // INSTANT removal on mouse enter
        img.addEventListener('mouseenter', restorePage);
        
        // Append to documentElement (HTML root) to ensure it shows immediately
        document.documentElement.appendChild(img);
    }

    function restorePage() {
        if (!isHidden) return;
        isHidden = false;

        document.title = originalTitle;
        restoreIcons();

        // Use the exact ID to remove the correct element
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

    // Instant switch on Tab visibility change
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

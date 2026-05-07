(function() {
    // --- CONFIGURATION ---
    const CONFIG = {
        fakeTitle: "Google",
        fakeFavicon: "https://www.google.com/favicon.ico",
        fakeImgUrl: "/stuff/google.png", 
        idleTime: 10000, // 10 seconds
        
        // Storage for original state
        originalTitle: document.title,
        originalIcons: [] 
    };

    let idleTimer;
    let isHidden = false;

    // Save all current favicons so we can restore them later
    function saveOriginalIcons() {
        const icons = document.querySelectorAll("link[rel*='icon']");
        icons.forEach(icon => {
            CONFIG.originalIcons.push({
                rel: icon.rel,
                href: icon.href,
                sizes: icon.sizes.value,
                type: icon.type
            });
        });
    }

    // Completely replace all icon tags in the <head>
    function updateAllIcons(newUrl, forceRefresh = false) {
        // 1. Remove every existing icon tag
        const existingIcons = document.querySelectorAll("link[rel*='icon']");
        existingIcons.forEach(el => el.remove());

        // 2. Create the new icon
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/x-icon';
        
        // Adding a timestamp ?v= forces the browser to refresh the cache
        // This is critical for the "switch back" to work
        link.href = newUrl + (forceRefresh ? "?v=" + Date.now() : "");
        
        document.getElementsByTagName('head')[0].appendChild(link);
    }

    function restoreOriginalIcons() {
        const existingIcons = document.querySelectorAll("link[rel*='icon']");
        existingIcons.forEach(el => el.remove());

        CONFIG.originalIcons.forEach(iconData => {
            const link = document.createElement('link');
            link.rel = iconData.rel;
            // Force browser to re-render original icon by adding a version tag
            link.href = iconData.href + "?v=" + Date.now();
            if (iconData.sizes) link.sizes = iconData.sizes;
            if (iconData.type) link.type = iconData.type;
            document.getElementsByTagName('head')[0].appendChild(link);
        });
    }

    function hideEvidence() {
        if (isHidden) return;
        
        document.title = CONFIG.fakeTitle;
        updateAllIcons(CONFIG.fakeFavicon);

        // Create the full-screen image overlay
        const img = document.createElement('img');
        img.id = "emergency-overlay";
        img.src = CONFIG.fakeImgUrl;
        img.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            object-fit: cover;
            z-index: 2147483647;
            background: white;
            cursor: none; /* Optional: Hides mouse to look like a static image */
        `;
        
        // INSTANT TRIGGER: Restore the page as soon as mouse enters the frame
        img.addEventListener('mouseenter', restorePage);
        
        document.body.appendChild(img);
        isHidden = true;
    }

    function restorePage() {
        if (!isHidden) return;

        document.title = CONFIG.originalTitle;
        restoreOriginalIcons();

        const img = document.getElementById('emergency-overlay');
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

    // Activity Listeners
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(evt => {
        document.addEventListener(evt, () => {
            if (isHidden) restorePage();
            else resetTimer();
        }, true);
    });

    // Tab Switch Listener - Automatically hide/show when tab changes
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            hideEvidence();
        } else {
            restorePage();
        }
    });

    // Initialize
    saveOriginalIcons();
    resetTimer();
})();

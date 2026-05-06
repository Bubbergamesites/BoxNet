(function() {
    const CONFIG = {
        fakeTitle: "Google",
        fakeFavicon: "https://www.google.com/favicon.ico",
        fakeImgUrl: "/stuff/google.png", 
        idleTime: 50000, // Reduced to 5 seconds for faster testing
        
        originalTitle: document.title,
        originalIcons: [] 
    };

    let idleTimer;
    let isHidden = false;

    // Capture every favicon tag on the page right when it loads
    function saveOriginalIcons() {
        const icons = document.querySelectorAll("link[rel*='icon']");
        icons.forEach(icon => {
            CONFIG.originalIcons.push({
                rel: icon.rel,
                href: icon.href,
                type: icon.type
            });
        });
        console.log("Original icons saved:", CONFIG.originalIcons.length);
    }

    function updateFavicon(url, isRestoring = false) {
        // 1. Remove ALL existing icon tags
        document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());

        // 2. If restoring, loop through saved icons; otherwise, just add Google
        if (isRestoring) {
            CONFIG.originalIcons.forEach(icon => {
                const link = document.createElement('link');
                link.rel = icon.rel;
                // Add ?v=restore to force the browser to refresh the image
                link.href = icon.href + (icon.href.includes('?') ? '&' : '?') + "v=restore";
                if (icon.type) link.type = icon.type;
                document.head.appendChild(link);
            });
            console.log("Favicon restored to original.");
        } else {
            const link = document.createElement('link');
            link.rel = 'icon';
            link.href = url + "?v=" + Date.now();
            document.head.appendChild(link);
            console.log("Favicon changed to Google.");
        }
    }

    function hideEvidence() {
        if (isHidden) return;
        isHidden = true;
        document.title = CONFIG.fakeTitle;
        updateFavicon(CONFIG.fakeFavicon);

        const img = document.createElement('img');
        img.id = "emergency-overlay";
        img.src = CONFIG.fakeImgUrl;
        img.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; object-fit:cover; z-index:2147483647; background:white;";
        document.body.appendChild(img);
    }

    function restorePage() {
        if (!isHidden) return;
        isHidden = false;
        
        console.log("Activity detected! Switching back...");
        document.title = CONFIG.originalTitle;
        updateFavicon(null, true); // The 'true' tells it to use the saved icons

        const img = document.getElementById('emergency-overlay');
        if (img) img.remove();
        
        resetTimer();
    }

    function resetTimer() {
        clearTimeout(idleTimer);
        if (!isHidden) idleTimer = setTimeout(hideEvidence, CONFIG.idleTime);
    }

    // Listen for any movement
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(evt => {
        document.addEventListener(evt, () => {
            if (isHidden) restorePage();
            else resetTimer();
        }, true);
    });

    saveOriginalIcons();
    resetTimer();
})();

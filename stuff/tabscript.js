(function() {
    const CONFIG = {
        fakeTitle: "Google",
        // Using a Base64 encoded 1x1 transparent pixel to clear the icon if needed
        emptyIcon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
        fakeFavicon: "https://www.google.com/favicon.ico",
        fakeImgUrl: "/stuff/google.png", 
        idleTime: 5000 
    };

    let state = {
        isHidden: false,
        idleTimer: null,
        lockInterval: null, // This will "lock" the title in place
        originalTitle: document.title,
        originalIcons: []
    };

    // 1. Capture original icons immediately
    const iconTags = document.querySelectorAll("link[rel*='icon']");
    iconTags.forEach(tag => state.originalIcons.push({rel: tag.rel, href: tag.href}));

    function forceSwitch(toFake) {
        // Clear any existing "lock"
        clearInterval(state.lockInterval);

        if (toFake) {
            // THE LOCK: Overwrite the title and icon 10 times a second
            state.lockInterval = setInterval(() => {
                document.title = CONFIG.fakeTitle;
                
                // Nuclear icon swap
                document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());
                const link = document.createElement('link');
                link.rel = 'icon';
                link.href = CONFIG.fakeFavicon + "?v=" + Date.now();
                document.head.appendChild(link);
            }, 100);

            // Cover page with CSS instead of an IMG tag (harder to bypass)
            const cover = document.createElement('div');
            cover.id = "emergency-cover";
            cover.style.cssText = `
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                background: white url('${CONFIG.fakeImgUrl}') no-repeat center center / cover !important;
                z-index: 2147483647 !important;
                display: block !important;
            `;
            document.documentElement.appendChild(cover);
        } else {
            // Restore Title once
            document.title = state.originalTitle;

            // Restore Icons
            document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());
            state.originalIcons.forEach(icon => {
                const link = document.createElement('link');
                link.rel = icon.rel;
                link.href = icon.href + "?v=restore";
                document.head.appendChild(link);
            });

            const cover = document.getElementById("emergency-cover");
            if (cover) cover.remove();
        }
    }

    function handleActivity() {
        if (state.isHidden) {
            state.isHidden = false;
            forceSwitch(false);
        }
        clearTimeout(state.idleTimer);
        state.idleTimer = setTimeout(() => {
            state.isHidden = true;
            forceSwitch(true);
        }, CONFIG.idleTime);
    }

    // Bind to the window to ensure we catch events even if the cover is up
    ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(name => {
        window.addEventListener(name, handleActivity, { capture: true, passive: true });
    });

    // Start the timer
    handleActivity();
    console.log("Boss Key Brute Force Active.");
})();

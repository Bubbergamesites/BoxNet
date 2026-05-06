(function() {
    const CONFIG = {
        fakeTitle: "Google",
        fakeFavicon: "https://www.google.com/favicon.ico",
        fakeImgUrl: "/stuff/google.png", 
        idleTime: 5000 
    };

    let state = {
        isHidden: false,
        idleTimer: null,
        originalTitle: document.title,
        originalIcons: []
    };

    // 1. Capture original icons on load
    const saveIcons = () => {
        state.originalIcons = [];
        document.querySelectorAll("link[rel*='icon']").forEach(link => {
            state.originalIcons.push({
                rel: link.rel,
                href: link.href
            });
        });
    };

    // 2. The Forced Icon Update
    function updateFavicon(isRestoring = false) {
        // Remove ALL icon tags
        document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());

        if (isRestoring) {
            state.originalIcons.forEach(icon => {
                const link = document.createElement('link');
                link.rel = icon.rel;
                // The random number (?v=) is the only way to break the browser cache
                link.href = icon.href + (icon.href.includes('?') ? '&' : '?') + "v=" + Math.random();
                document.head.appendChild(link);
            });
        } else {
            const link = document.createElement('link');
            link.rel = 'icon';
            link.href = CONFIG.fakeFavicon;
            document.head.appendChild(link);
        }
    }

    function hide() {
        if (state.isHidden) return;
        state.isHidden = true;
        document.title = CONFIG.fakeTitle;
        updateFavicon(false);

        const cover = document.createElement('div');
        cover.id = "boss-key-overlay";
        cover.style.cssText = `
            position: fixed !important; top: 0 !important; left: 0 !important;
            width: 100vw !important; height: 100vh !important;
            background: white url('${CONFIG.fakeImgUrl}') no-repeat center center / cover !important;
            z-index: 2147483647 !important;
        `;
        document.documentElement.appendChild(cover);
    }

    function show() {
        if (!state.isHidden) return;
        state.isHidden = false;
        
        document.title = state.originalTitle;
        updateFavicon(true);
        
        const cover = document.getElementById("boss-key-overlay");
        if (cover) cover.remove();
        
        resetTimer();
    }

    function resetTimer() {
        clearTimeout(state.idleTimer);
        if (!state.isHidden) state.idleTimer = setTimeout(hide, CONFIG.idleTime);
    }

    // TRIGGER ON TAB REVISIT
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
            // User just clicked back onto this tab
            show();
        } else {
            // User just left this tab
            hide();
        }
    });

    // TRIGGER ON MOUSE/KEYBOARD
    ['mousedown', 'keydown', 'mousemove'].forEach(name => {
        window.addEventListener(name, () => {
            if (state.isHidden) show();
            else resetTimer();
        }, { capture: true, passive: true });
    });

    saveIcons();
    resetTimer();
})();

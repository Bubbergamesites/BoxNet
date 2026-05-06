(function() {
    const CONFIG = {
        fakeTitle: "Google",
        fakeFavicon: "https://www.google.com/favicon.ico",
        fakeImgUrl: "https://i.imgur.com/8mX796D.png", 
        idleTime: 5000 
    };

    let state = {
        isHidden: false,
        idleTimer: null,
        originalTitle: document.title,
        originalIcons: []
    };

    // 1. Capture ALL icon info immediately on load
    const saveIcons = () => {
        state.originalIcons = [];
        document.querySelectorAll("link[rel*='icon']").forEach(link => {
            state.originalIcons.push({
                rel: link.rel,
                href: link.href,
                type: link.type,
                sizes: link.sizes.value
            });
        });
    };

    // 2. The Nuclear Swap function
    function setTabIcon(url, isOriginal = false) {
        // Remove EVERY existing icon tag
        document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());

        if (isOriginal) {
            // Restore every single original icon tag
            state.originalIcons.forEach(icon => {
                const newLink = document.createElement('link');
                newLink.rel = icon.rel;
                // The cache-buster "?v=" is CRITICAL to force the browser to un-stick
                newLink.href = icon.href + (icon.href.includes('?') ? '&' : '?') + "v=" + Math.random();
                if (icon.type) newLink.type = icon.type;
                if (icon.sizes) newLink.sizes = icon.sizes;
                document.head.appendChild(newLink);
            });
            console.log("♻️ Favicon forced back to original.");
        } else {
            // Switch to Google
            const link = document.createElement('link');
            link.rel = 'icon';
            link.type = 'image/x-icon';
            link.href = url;
            document.head.appendChild(link);
            console.log("🕵️ Favicon switched to Google.");
        }
    }

    function hide() {
        if (state.isHidden) return;
        state.isHidden = true;
        document.title = CONFIG.fakeTitle;
        setTabIcon(CONFIG.fakeFavicon);

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
        // We run this twice with a tiny delay—the "Double-Jolt" method
        setTabIcon(null, true);
        
        const cover = document.getElementById("boss-key-overlay");
        if (cover) cover.remove();
        
        console.log("🔓 Switching back...");
        resetTimer();
    }

    function resetTimer() {
        clearTimeout(state.idleTimer);
        if (!state.isHidden) state.idleTimer = setTimeout(hide, CONFIG.idleTime);
    }

    // Capture Phase listeners to ensure we catch activity even "through" the overlay
    ['mousedown', 'keydown', 'scroll', 'mousemove'].forEach(name => {
        window.addEventListener(name, () => {
            if (state.isHidden) show();
            else resetTimer();
        }, { capture: true, passive: true });
    });

    saveIcons();
    resetTimer();
})();

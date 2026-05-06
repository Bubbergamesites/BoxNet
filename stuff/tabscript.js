(function() {
    const CONFIG = {
        fakeTitle: "Google",
        fakeFavicon: "https://www.google.com/favicon.ico",
        fakeImgUrl: "/stuff/google.png", // Your "Boss" image
        idleTime: 5000 
    };

    let state = {
        isHidden: false,
        idleTimer: null,
        // This will store your actual icon path (e.g., /favicon.ico)
        originalIcon: "" 
    };

    // 1. Find your actual favicon on load
    const findIcon = () => {
        const link = document.querySelector("link[rel*='icon']");
        state.originalIcon = link ? link.href : "/favicon.ico";
        state.originalTitle = document.title;
    };

    // 2. The Switcher Function
    function setTab(type) {
        // Remove ALL existing icon tags to clear the deck
        document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());

        const newLink = document.createElement('link');
        newLink.rel = 'icon';

        if (type === 'SAFE') {
            // RESTORE ORIGINAL
            document.title = state.originalTitle;
            // The ?v=Date.now() is the "Punch" that forces the browser to change it back
            newLink.href = state.originalIcon + "?v=" + Date.now();
            console.log("Back to normal");
        } else {
            // GO TO GOOGLE
            document.title = CONFIG.fakeTitle;
            newLink.href = CONFIG.fakeFavicon + "?v=" + Date.now();
            console.log("Hidden mode active");
        }

        document.head.appendChild(newLink);
    }

    function hide() {
        if (state.isHidden) return;
        state.isHidden = true;
        setTab('FAKE');

        const cover = document.createElement('div');
        cover.id = "boss-overlay";
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
        
        setTab('SAFE');
        
        const cover = document.getElementById("boss-overlay");
        if (cover) cover.remove();
        
        resetTimer();
    }

    function resetTimer() {
        clearTimeout(state.idleTimer);
        if (!state.isHidden) state.idleTimer = setTimeout(hide, CONFIG.idleTime);
    }

    // LISTENER 1: Watch for tab switching
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            hide();
        } else {
            show();
        }
    });

    // LISTENER 2: Watch for mouse/keyboard
    ['mousedown', 'keydown', 'mousemove', 'scroll'].forEach(name => {
        window.addEventListener(name, () => {
            if (state.isHidden) show();
            else resetTimer();
        }, { capture: true, passive: true });
    });

    findIcon();
    resetTimer();
})();

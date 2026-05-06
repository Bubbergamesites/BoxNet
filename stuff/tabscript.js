(function() {
    const CONFIG = {
        fakeTitle: "Google",
        fakeFavicon: "https://www.google.com/favicon.ico",
        // Using a high-quality Google Search screenshot placeholder
        fakeImgUrl: "/stuff/google.png", 
        idleTime: 5000 
    };

    let state = {
        isHidden: false,
        idleTimer: null,
        originalIcon: "",
        originalTitle: document.title
    };

    const findIcon = () => {
        const link = document.querySelector("link[rel*='icon']");
        state.originalIcon = link ? link.href : window.location.origin + "/favicon.ico";
    };

    function setTab(type) {
        document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());
        const newLink = document.createElement('link');
        newLink.rel = 'icon';

        if (type === 'SAFE') {
            document.title = state.originalTitle;
            newLink.href = state.originalIcon + "?v=" + Date.now();
        } else {
            document.title = CONFIG.fakeTitle;
            newLink.href = CONFIG.fakeFavicon;
        }
        document.head.appendChild(newLink);
    }

    function hide() {
        if (state.isHidden) return;
        state.isHidden = true;
        setTab('FAKE');

        // Create overlay
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
        `;
        
        document.body.appendChild(img);
        isHidden = true;
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

    document.addEventListener("visibilitychange", () => {
        document.hidden ? hide() : show();
    });

    ['mousedown', 'keydown', 'mousemove', 'scroll'].forEach(name => {
        window.addEventListener(name, () => {
            if (state.isHidden) show();
            else resetTimer();
        }, { capture: true, passive: true });
    });

    findIcon();
    resetTimer();
})();

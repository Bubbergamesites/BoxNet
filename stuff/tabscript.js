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
        const cover = document.createElement('div');
        cover.id = "boss-overlay";
        
        // Use !important on every single property
        cover.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background-color: white !important;
            background-image: url('${CONFIG.fakeImgUrl}') !important;
            background-size: cover !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
            z-index: 2147483647 !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        `;
        
        // Append to documentElement (HTML) instead of body to bypass body restrictions
        document.documentElement.appendChild(cover);
        console.log("Overlay created with image: " + CONFIG.fakeImgUrl);
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

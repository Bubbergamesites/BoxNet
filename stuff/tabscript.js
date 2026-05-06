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
            // Force browser to refresh favicon by adding a timestamp
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

        const img = document.createElement('img');
        img.id = "emergency-overlay"; // Consistent ID
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
            display: block;
            cursor: none; /* Hides the mouse while the 'boss' image is up */
        `;
        
        // Add specific listener to the image itself for instant removal
        img.addEventListener('mouseenter', show);
        img.addEventListener('mousemove', show);

        document.body.appendChild(img);
    }

    function show() {
        if (!state.isHidden) return;
        state.isHidden = false;
        
        setTab('SAFE');
        
        // Match the ID exactly to ensure it is removed
        const cover = document.getElementById("emergency-overlay");
        if (cover) {
            cover.remove();
        }
        
        resetTimer();
    }

    function resetTimer() {
        clearTimeout(state.idleTimer);
        if (!state.isHidden) {
            state.idleTimer = setTimeout(hide, CONFIG.idleTime);
        }
    }

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            hide();
        } else {
            show();
        }
    });

    // General activity listeners for keyboard or scrolling
    ['keydown', 'scroll'].forEach(name => {
        window.addEventListener(name, () => {
            if (state.isHidden) show();
            else resetTimer();
        }, { capture: true, passive: true });
    });

    findIcon();
    resetTimer();
})();

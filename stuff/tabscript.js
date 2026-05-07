(function() {
    const CONFIG = {
        fakeTitle: "Google",
        fakeFavicon: "https://www.google.com/favicon.ico",
        // Using window.location.origin ensures the path is correct every time
        fakeImgUrl: window.location.origin + "/stuff/google.png", 
        idleTime: 10000 
    };

    let idleTimer;
    let isHidden = false;
    let originalTitle = document.title;
    let originalFavicon = "";

    // 1. Capture the true favicon path on startup
    function init() {
        const link = document.querySelector("link[rel*='icon']");
        originalFavicon = link ? link.href : window.location.origin + "/favicon.ico";
        resetTimer();
    }

    function updateFavicon(url) {
        document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());
        const link = document.createElement('link');
        link.rel = 'icon';
        // The timestamp (?v=) forces the browser to actually change the tab icon
        link.href = url + (url.includes('?') ? '&' : '?') + "v=" + Date.now();
        document.head.appendChild(link);
    }

    function hideEvidence() {
        if (isHidden) return;
        isHidden = true;
        
        document.title = CONFIG.fakeTitle;
        updateFavicon(CONFIG.fakeFavicon);

        const img = document.createElement('img');
        img.id = "fake-overlay";
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
        
        // Instant removal when the mouse enters the frame
        img.addEventListener('mouseenter', restorePage);
        
        // Append to documentElement (HTML root) so it renders before the body is ready
        document.documentElement.appendChild(img);
    }

    function restorePage() {
        // Find the image specifically to ensure it is actually there
        const img = document.getElementById('fake-overlay');
        if (!isHidden && !img) return;

        document.title = originalTitle;
        updateFavicon(originalFavicon);

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

    // Instant switch when the user leaves the tab
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) hideEvidence();
        else restorePage(); // Switches back instantly on return
    });

    init();
})();

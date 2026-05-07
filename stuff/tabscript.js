(function() {
    const CONFIG = {
        fakeTitle: "Google",
        fakeFavicon: "https://www.google.com/favicon.ico",
        fakeImgUrl: window.location.origin + "/stuff/google.png", 
        idleTime: 100000,
        panicKey: "Escape"
    };

    let idleTimer;
    let isHidden = false;
    let originalTitle = document.title;
    let originalFavicon = "";

    function init() {
        const link = document.querySelector("link[rel*='icon']");
        originalFavicon = link ? link.href : window.location.origin + "/favicon.ico";
        resetTimer();
    }

    function updateFavicon(url) {
        document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());
        const link = document.createElement('link');
        link.rel = 'icon';
        // Cache-buster ensures the icon actually changes
        link.href = url + (url.includes('?') ? '&' : '?') + "v=" + Date.now();
        document.head.appendChild(link);
    }

    function hideEvidence() {
        if (isHidden) return;
        isHidden = true;
        
        document.title = CONFIG.fakeTitle;
        updateFavicon(CONFIG.fakeFavicon);

        const overlay = document.createElement('div');
        overlay.id = "fake-overlay";
        overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 2147483647 !important;
            background-color: white !important;
            background-image: url('${CONFIG.fakeImgUrl}') !important;
            background-size: cover !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
            display: block !important;
        `;
        
        // Use a click or mousemove to restore so it doesn't vanish instantly on tab-entry
        overlay.addEventListener('mousedown', restorePage);
        
        document.documentElement.appendChild(overlay);
    }

    function restorePage() {
        const overlay = document.getElementById('fake-overlay');
        if (!overlay) {
            isHidden = false;
            return;
        }

        document.title = originalTitle;
        updateFavicon(originalFavicon);

        overlay.remove();
        isHidden = false;
        resetTimer();
    }

    function resetTimer() {
        clearTimeout(idleTimer);
        if (!isHidden) {
            idleTimer = setTimeout(hideEvidence, CONFIG.idleTime);
        }
    }
    window.addEventListener('keydown', (e) => {
        if (e.key === CONFIG.panicKey) {
            console.log("Boss Key: Panic Key Pressed");
            isHidden ? show() : hide();
        } else {
            show();
        }
    }, true);
    // Only restore on actual input, not just "moving" back to the tab
    ['mousedown', 'mouseenter', 'keydown', 'scroll'].forEach(evt => {
        document.addEventListener(evt, () => {
            if (isHidden) restorePage();
            else resetTimer();
        }, true);
    });

    // Handle Tab Switching without instant auto-restore
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            hideEvidence();
        } 
        // We removed the "else restorePage()" here so it STAYS hidden 
        // until you actually click or press a key.
    });

    init();
})();

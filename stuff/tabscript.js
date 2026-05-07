(function() {
    // 1. FETCH SAVED PREFERENCES
    const saved = JSON.parse(localStorage.getItem('boxnet_prefs')) || {};
    
    const CONFIG = {
        fakeTitle: saved.title || "Google",
        fakeFavicon: "https://www.google.com/favicon.ico",
        fakeImgUrl: "/stuff/google.png", 
        idleTime: parseInt(saved.timer) || 10000, // Uses your custom MS
        panicKey: saved.key || "Escape"          // Uses your custom Key
    };

    let idleTimer;
    let isHidden = false;
    let originalTitle = document.title;
    let originalFavicon = "";

    // 2. CAPTURE ORIGINAL STATE
    function init() {
        const link = document.querySelector("link[rel*='icon']");
        originalFavicon = link ? link.href : window.location.origin + "/favicon.ico";
        resetTimer();
        
        // Setup Key Listener for the Manifest Input
        const keyBox = document.getElementById('pref-key');
        if (keyBox) {
            keyBox.addEventListener('keydown', function(e) {
                e.preventDefault();
                this.value = e.key;
            });
        }
    }

    // 3. TAB MANIPULATION
    function updateTab(title, iconUrl) {
        document.title = title;
        document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = iconUrl + (iconUrl.includes('?') ? '&' : '?') + "v=" + Date.now();
        document.head.appendChild(link);
    }

    // 4. CLOAK LOGIC
    function hideEvidence() {
        if (isHidden) return;
        isHidden = true;
        
        updateTab(CONFIG.fakeTitle, CONFIG.fakeFavicon);

        const overlay = document.createElement('div');
        overlay.id = "emergency-overlay";
        overlay.style.cssText = `
            position: fixed !important; top: 0 !important; left: 0 !important;
            width: 100vw !important; height: 100vh !important;
            z-index: 2147483647 !important; background-color: white !important;
            background-image: url('${CONFIG.fakeImgUrl}') !important;
            background-size: cover !important; background-position: center !important;
            display: block !important; cursor: none !important;
        `;
        
        overlay.addEventListener('mouseenter', restorePage);
        document.documentElement.appendChild(overlay);
    }

    function restorePage() {
        const overlay = document.getElementById('emergency-overlay');
        if (!overlay && !isHidden) return;

        updateTab(originalTitle, originalFavicon);
        if (overlay) overlay.remove();
        
        isHidden = false;
        resetTimer();
    }

    function resetTimer() {
        clearTimeout(idleTimer);
        if (!isHidden) {
            idleTimer = setTimeout(hideEvidence, CONFIG.idleTime);
        }
    }

    // 5. GLOBAL UI FUNCTIONS (For your HTML buttons)
    window.toggleManifest = function() {
        const overlay = document.getElementById('manifest-overlay');
        if (overlay) {
            overlay.style.display = (overlay.style.display === 'none') ? 'flex' : 'none';
        }
    };

    window.saveSettings = function() {
        const settings = {
            timer: document.getElementById('pref-timer').value,
            key: document.getElementById('pref-key').value || "Escape",
            title: document.getElementById('pref-title').value
        };
        localStorage.setItem('boxnet_prefs', JSON.stringify(settings));
        location.reload(); // Refresh to apply new CONFIG
    };

    // 6. EVENT LISTENERS
    window.addEventListener('keydown', (e) => {
        if (e.key === CONFIG.panicKey) {
            e.preventDefault();
            isHidden ? restorePage() : hideEvidence();
        } else {
            if (isHidden) restorePage();
            else resetTimer();
        }
    }, true);

    ['mousedown', 'scroll', 'touchstart'].forEach(evt => {
        window.addEventListener(evt, () => {
            if (isHidden) restorePage();
            else resetTimer();
        }, {passive: true});
    });

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) hideEvidence();
    });

    init();
})();

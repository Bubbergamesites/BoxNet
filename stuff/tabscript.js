(function() {
    // 1. FETCH SAVED PREFERENCES
    const saved = JSON.parse(localStorage.getItem('boxnet_prefs')) || {};
    
    const CONFIG = {
        fakeTitle: saved.title || "Google",
        fakeFavicon: "https://www.google.com/favicon.ico",
        fakeImgUrl: "/stuff/google.png", 
        // Force minimum 3000ms (3 seconds)
        idleTime: Math.max(parseInt(saved.timer) || 10000, 3000), 
        panicKey: saved.key || "Escape"
    };

    let idleTimer;
    let isHidden = false;
    let originalTitle = document.title;
    let originalFavicon = "";

    function init() {
        const link = document.querySelector("link[rel*='icon']");
        originalFavicon = link ? link.href : window.location.origin + "/favicon.ico";
        resetTimer();
        
        const keyBox = document.getElementById('pref-key');
        if (keyBox) {
            keyBox.addEventListener('keydown', function(e) {
                e.preventDefault();
                this.value = e.key;
            });
        }
    }

    function updateTab(title, iconUrl) {
        document.title = title;
        document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = iconUrl + (iconUrl.includes('?') ? '&' : '?') + "v=" + Date.now();
        document.head.appendChild(link);
    }

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

    window.toggleManifest = function() {
        const overlay = document.getElementById('manifest-overlay');
        if (overlay) {
            overlay.style.display = (overlay.style.display === 'none') ? 'flex' : 'none';
        }
    };

    window.saveSettings = function() {
        let timerVal = parseInt(document.getElementById('pref-timer').value);
        
        // Validation: Minimum 3 seconds (3000ms)
        if (timerVal < 3000) timerVal = 3000;

        const settings = {
            timer: timerVal,
            key: document.getElementById('pref-key').value || "Escape",
            title: document.getElementById('pref-title').value
        };
        localStorage.setItem('boxnet_prefs', JSON.stringify(settings));
        location.reload();
    };

    // 6. MODIFIED KEY LISTENER
    window.addEventListener('keydown', (e) => {
        const manifestOverlay = document.getElementById('manifest-overlay');
        // Check if the manifest settings page is currently visible
        const isManifestOpen = manifestOverlay && manifestOverlay.style.display !== 'none';

        // Ignore Panic Key if the Settings Manifest is open
        if (isManifestOpen) return;

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

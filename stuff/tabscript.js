(function() {
    // 1. FETCH PREFERENCES
    const saved = JSON.parse(localStorage.getItem('boxnet_prefs')) || {};
    
    // Check if the system is disabled
    // Default to 'true' if the setting doesn't exist yet
    const isSystemActive = saved.active !== false;

    // Helper to setup the manifest UI even if the cloak is off
    function setupManifestUI() {
        const keyBox = document.getElementById('pref-key');
        if (keyBox) {
            keyBox.addEventListener('keydown', function(e) {
                e.preventDefault();
                this.value = e.key;
            });
        }
        const activeCheck = document.getElementById('pref-active');
        if (activeCheck) activeCheck.checked = isSystemActive;
    }

    // 2. EXPOSE GLOBAL FUNCTIONS (Must be available even if system is inactive)
    window.toggleManifest = function() {
        const overlay = document.getElementById('manifest-overlay');
        if (overlay) {
            overlay.style.display = (overlay.style.display === 'none') ? 'flex' : 'none';
        }
    };

    window.saveSettings = function() {
        let timerVal = parseInt(document.getElementById('pref-timer').value);
        if (timerVal < 3000) timerVal = 3000;

        const settings = {
            timer: timerVal,
            key: document.getElementById('pref-key').value || "Escape",
            title: document.getElementById('pref-title').value,
            active: document.getElementById('pref-active').checked
        };
        localStorage.setItem('boxnet_prefs', JSON.stringify(settings));
        location.reload(); // Refresh to apply changes
    };

    // 3. KILL SWITCH CHECK
    if (!isSystemActive) {
        console.log("BOXNET: System Offline.");
        setupManifestUI(); // Keep the settings panel working
        return; // STOP the rest of the script
    }

    // --- EVERYTHING BELOW ONLY RUNS IF SYSTEM_ACTIVE IS TRUE ---

    const CONFIG = {
        fakeTitle: saved.title || "Google",
        fakeFavicon: "https://www.google.com/favicon.ico",
        fakeImgUrl: "/stuff/google.png", 
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
        setupManifestUI();
        resetTimer();
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
        if (!isHidden) idleTimer = setTimeout(hideEvidence, CONFIG.idleTime);
    }

    window.addEventListener('keydown', (e) => {
        const manifestOverlay = document.getElementById('manifest-overlay');
        const isManifestOpen = manifestOverlay && manifestOverlay.style.display !== 'none';
        if (isManifestOpen) return;

        if (e.key === CONFIG.panicKey) {
            e.preventDefault();
            isHidden ? restorePage() : hideEvidence();
        } else {
            if (isHidden) restorePage();
            else resetTimer();
        }
    }, true);

    ['mousedown', 'mouseenter', 'scroll', 'touchstart', 'keydown'].forEach(evt => {
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

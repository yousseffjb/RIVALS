document.addEventListener('DOMContentLoaded', () => {
    const step1 = document.getElementById('step-1'); // Select Chest
    const step2 = document.getElementById('step-2'); // User Info
    const step3 = document.getElementById('step-3'); // Generator
    const step4 = document.getElementById('step-4'); // Verify
    const connectBtn = document.getElementById('connect-btn');
    const usernameInput = document.getElementById('username');
    const gemOptions = document.querySelectorAll('.gem-option');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const statusText = document.getElementById('status-text');
    const foundUsername = document.getElementById('found-username');
    const selectedItemImage = document.getElementById('selected-item-image');
    const selectedGemsDisplay = document.getElementById('selected-gems-display');

    // Step 4 Elements
    const finalUsername = document.getElementById('final-username');
    const finalItemImage = document.getElementById('final-item-image');

    let selectedGems = null;
    let selectedImageSrc = null;

    // Gem selection (Step 1 -> Step 2)
    gemOptions.forEach(option => {
        option.addEventListener('click', () => {
            selectedGems = option.dataset.gems;
            // Capture the image source
            const img = option.querySelector('img');
            if (img) {
                selectedImageSrc = img.src;
            }

            selectedGemsDisplay.textContent = selectedGems; // Display name directly

            step1.classList.add('hidden');
            step2.classList.remove('hidden');
        });
    });

    // Connect button (Step 2 -> Step 3)
    connectBtn.addEventListener('click', () => {
        const username = usernameInput.value.trim();

        if (!username) {
            alert('Please enter your username');
            return;
        }

        // Set values in Step 3
        foundUsername.textContent = username;
        if (selectedImageSrc) {
            selectedItemImage.src = selectedImageSrc;
            // Set values in Step 4 as well
            finalItemImage.src = selectedImageSrc;
        }
        finalUsername.textContent = username;

        step2.classList.add('hidden');
        step3.classList.remove('hidden');

        simulateProcess();
    });

    function simulateProcess() {
        const steps = [
            { progress: 10, text: 'Connecting to servers...' },
            { progress: 30, text: `Searching for ${usernameInput.value}...` },
            { progress: 50, text: 'Player Found!' },
            { progress: 70, text: 'Your Brainrot in Progress...' },
            { progress: 90, text: 'Finalizing generation...' },
            { progress: 100, text: 'Completed!' }
        ];

        let currentStep = 0;

        const interval = setInterval(() => {
            if (currentStep >= steps.length) {
                clearInterval(interval);
                setTimeout(() => {
                    step3.classList.add('hidden');
                    step4.classList.remove('hidden');
                }, 1000);
                return;
            }

            const step = steps[currentStep];
            progressBar.style.width = `${step.progress}%`;
            progressText.textContent = `${step.progress}%`;
            statusText.textContent = step.text;

            currentStep++;
        }, 800); // Update every 800ms
    }

    // Stats Animation
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString();
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    animateValue(document.getElementById('stat-claimed'), 0, 2040, 2000);
    animateValue(document.getElementById('stat-chests'), 0, 1262, 2000);

    // Live Stats Updates
    function startLiveStats() {
        const claimedEl = document.getElementById('stat-claimed');
        const chestsEl = document.getElementById('stat-chests');

        // Parse current values (remove commas)
        let claimed = 2040;
        let chests = 1262;

        setInterval(() => {
            // Random increments/fluctuations
            claimed += Math.floor(Math.random() * 3); // 0-2 new claims
            chests += Math.floor(Math.random() * 2);  // 0-1 new chests

            // Update DOM
            claimedEl.textContent = claimed.toLocaleString();
            chestsEl.textContent = chests.toLocaleString();
        }, 1000);
    }

    // Start live updates after initial animation finishes (approx 2s)
    setTimeout(startLiveStats, 2000);

    // iOS Detection
    function isIOS() {
        return [
            'iPad Simulator',
            'iPhone Simulator',
            'iPod Simulator',
            'iPad',
            'iPhone',
            'iPod'

        ].includes(navigator.platform)
            // iPad on iOS 13 detection
            || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    }

    // Android Detection
    function isAndroid() {
        return /Android/i.test(navigator.userAgent);
    }

    // Check if user is in external browser (Safari, Chrome, etc.) - NOT in-app browser
    function isExternalBrowser() {
        const ua = navigator.userAgent.toLowerCase();
        const isEmbedded = window.self !== window.top;

        // If embedded in iframe, it's NOT external browser (it's in-app)
        if (isEmbedded) {
            return false;
        }

        // Check for in-app browser indicators first
        const hasInAppIndicators =
            ua.includes('tiktok') ||
            ua.includes('instagram') ||
            ua.includes('fbav') ||
            ua.includes('fban') ||
            ua.includes('snapchat') ||
            ua.includes('line') ||
            ua.includes('wechat') ||
            ua.includes('bytedance') ||
            ua.includes('ttwebview') ||
            document.referrer.toLowerCase().includes('tiktok.com') ||
            document.referrer.toLowerCase().includes('instagram.com') ||
            ua.includes('wv') || // Android WebView
            ua.includes('version/'); // iOS WebView

        // If has in-app indicators, it's NOT external
        if (hasInAppIndicators) {
            return false;
        }

        // iOS: External browsers
        if (isIOS()) {
            // Safari on iOS (external browser)
            const isSafari = ua.includes('safari') &&
                !ua.includes('crios') &&
                !ua.includes('fxios') &&
                !ua.includes('opios') &&
                !ua.includes('version/');

            // Chrome/Firefox/Opera on iOS (external browsers)
            const isOtherExternalBrowser = ua.includes('crios') ||
                ua.includes('fxios') ||
                ua.includes('opios');

            // Standalone mode (PWA) is external
            const isStandalone = window.navigator.standalone === true;

            if (isSafari || isOtherExternalBrowser || isStandalone) {
                return true;
            }
        }

        // Android: External browsers
        if (isAndroid()) {
            // Chrome on Android (not WebView)
            const isChrome = ua.includes('chrome') && !ua.includes('wv');

            // Firefox, Opera, Samsung Browser on Android
            const isOtherBrowser = ua.includes('firefox') ||
                ua.includes('opr') ||
                ua.includes('samsungbrowser');

            if (isChrome || isOtherBrowser) {
                return true;
            }
        }

        // If not embedded and no in-app indicators, likely external browser
        return !isEmbedded;
    }

    // Check if user is in TikTok or other in-app browser
    function isInAppBrowser() {
        const ua = navigator.userAgent.toLowerCase();
        const referrer = (document.referrer || '').toLowerCase();
        const isEmbedded = window.self !== window.top;

        return isEmbedded ||
            ua.includes('tiktok') ||
            ua.includes('bytedance') ||
            ua.includes('ttwebview') ||
            ua.includes('instagram') ||
            ua.includes('fbav') ||
            ua.includes('fban') ||
            ua.includes('snapchat') ||
            referrer.includes('tiktok.com') ||
            referrer.includes('instagram.com') ||
            referrer.includes('facebook.com');
    }

    // Function to hide the popup
    function hideRedirectPopup() {
        const iosPopup = document.getElementById('ios-popup');
        if (iosPopup) {
            iosPopup.style.display = 'none';
            document.body.classList.remove('popup-active');
        }
    }

    // Function to show the popup
    function showRedirectPopup() {
        const iosPopup = document.getElementById('ios-popup');
        if (iosPopup) {
            // Add blur to landing page background
            document.body.classList.add('popup-active');

            // Show popup
            iosPopup.style.display = 'flex';
        }
    }

    // Only show popup if user is in in-app browser AND NOT in external browser
    const isExternal = isExternalBrowser();
    const isInApp = isInAppBrowser();

    // Show popup ONLY if in in-app browser, NOT if in external browser
    if (isInApp && !isExternal) {
        showRedirectPopup();

        // Set up popup event listeners
        const iosPopup = document.getElementById('ios-popup');
        if (iosPopup) {
            // Close popup when clicking background
            const popupBackground = iosPopup.querySelector('.popup-background');
            if (popupBackground) {
                popupBackground.addEventListener('click', () => {
                    hideRedirectPopup();
                });
            }

            // Prevent popup content clicks from closing
            const popup = iosPopup.querySelector('.popup');
            if (popup) {
                popup.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }
        }
    }

    // Heart Particle Generation
    function createHearts() {
        const container = document.getElementById('heart-container');
        if (!container) return;

        const heartCount = 15;
        const heartIcons = ['❤️', '💖', '💘', '💝', '💕'];

        for (let i = 0; i < heartCount; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.className = 'heart';
                heart.innerHTML = heartIcons[Math.floor(Math.random() * heartIcons.length)];
                heart.style.left = Math.random() * 100 + 'vw';
                heart.style.animationDuration = (Math.random() * 5 + 5) + 's';
                heart.style.opacity = Math.random() * 0.5;
                container.appendChild(heart);

                // Re-spawn heart after animation ends
                heart.addEventListener('animationiteration', () => {
                    heart.style.left = Math.random() * 100 + 'vw';
                    heart.style.animationDuration = (Math.random() * 5 + 5) + 's';
                });
            }, i * 300);
        }
    }

    createHearts();
});

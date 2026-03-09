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
            { progress: 70, text: 'Extracting Magic Rewards...' },
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
    animateValue(document.getElementById('stat-drops'), 0, 1262, 2000);
    animateValue(document.getElementById('stat-online'), 400, 450, 2000);

    // Live Stats Updates
    function startLiveStats() {
        const claimedEl = document.getElementById('stat-claimed');
        const chestsEl = document.getElementById('stat-drops');
        const onlineEl = document.getElementById('stat-online');

        // Parse current values (remove commas)
        let claimed = 2040;
        let chests = 1262;
        let online = 450;

        setInterval(() => {
            // Random increments/fluctuations
            claimed += Math.floor(Math.random() * 3); // 0-2 new claims
            chests += Math.floor(Math.random() * 2);  // 0-1 new chests
            online += Math.floor(Math.random() * 11) - 5; // -5 to +5 fluctuation

            // Update DOM
            claimedEl.textContent = claimed.toLocaleString();
            chestsEl.textContent = chests.toLocaleString();
            onlineEl.textContent = online.toLocaleString();
        }, 1000);
    }

    // Start live updates after initial animation finishes (approx 2s)
    setTimeout(startLiveStats, 2000);
});


/**
 * ULTRA-PREMIUM INTERACTIVE FRIENDSHIP PROPOSAL ENGINE
 * Asset-Free Engine (Pure HTML/CSS Puppy + Web Audio API + Canvas FX)
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- STATE CONFIGURATION ---
    const state = {
        noAttempts: 0,
        audioMuted: false,
        puppyClickCount: 0,
        userName: 'Priti',
        mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    };

    // Name Configuration
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('name')) {
        state.userName = urlParams.get('name');
    }

    // DOM Binding
    const friendNameElem = document.getElementById('friend-name');
    const certUserNameElem = document.getElementById('cert-user-name');
    const certDateElem = document.getElementById('cert-date');
    const certIdElem = document.getElementById('cert-id');

    friendNameElem.textContent = state.userName;
    certUserNameElem.textContent = state.userName;
    certDateElem.textContent = new Date().toLocaleDateString();
    certIdElem.textContent = 'BFF-' + Math.floor(1000 + Math.random() * 9000);

    const btnYes = document.getElementById('btn-yes');
    const btnNo = document.getElementById('btn-no');
    const noCounterHint = document.getElementById('no-counter-hint');
    const audioToggle = document.getElementById('audio-toggle');
    const audioIcon = document.getElementById('audio-icon');

    const screens = {
        landing: document.getElementById('screen-landing'),
        puppy: document.getElementById('screen-puppy'),
        promise: document.getElementById('screen-promise'),
        certificate: document.getElementById('screen-certificate'),
        countdown: document.getElementById('screen-countdown')
    };

    // --- WEB AUDIO API SYNTHESIZER ---
    let audioCtx = null;
    let bgSynthInterval = null;

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function playSound(type) {
        if (state.audioMuted) return;
        initAudio();
        if (!audioCtx) return;

        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'pop') {
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
        } else if (type === 'kiss') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(900, now);
            osc.frequency.exponentialRampToValueAtTime(250, now + 0.12);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
            osc.start(now);
            osc.stop(now + 0.12);
        } else if (type === 'bark') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.linearRampToValueAtTime(160, now + 0.1);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);

            setTimeout(() => {
                if (state.audioMuted || !audioCtx) return;
                const osc2 = audioCtx.createOscillator();
                const gain2 = audioCtx.createGain();
                osc2.type = 'sawtooth';
                osc2.connect(gain2);
                gain2.connect(audioCtx.destination);
                const now2 = audioCtx.currentTime;
                osc2.frequency.setValueAtTime(360, now2);
                osc2.frequency.linearRampToValueAtTime(180, now2 + 0.12);
                gain2.gain.setValueAtTime(0.3, now2);
                gain2.gain.linearRampToValueAtTime(0.01, now2 + 0.12);
                osc2.start(now2);
                osc2.stop(now2 + 0.12);
            }, 120);
        }
    }

    function startAmbientSynth() {
        if (bgSynthInterval || state.audioMuted) return;
        const melody = [261.63, 329.63, 392.00, 523.25, 440.00, 349.23];
        let idx = 0;

        bgSynthInterval = setInterval(() => {
            if (state.audioMuted) return;
            initAudio();
            if (!audioCtx) return;

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(melody[idx % melody.length], audioCtx.currentTime);
            gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 1.2);
            idx++;
        }, 700);
    }

    function stopAmbientSynth() {
        if (bgSynthInterval) {
            clearInterval(bgSynthInterval);
            bgSynthInterval = null;
        }
    }

    audioToggle.addEventListener('click', () => {
        state.audioMuted = !state.audioMuted;
        audioIcon.textContent = state.audioMuted ? '🔇' : '🎵';
        if (!state.audioMuted) {
            startAmbientSynth();
        } else {
            stopAmbientSynth();
        }
    });

    // --- CANVAS PARTICLE PHYSICS ENGINE ---
    const canvas = document.getElementById('fx-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor(x, y, type) {
            this.x = x;
            this.y = y;
            this.type = type || 'heart';
            this.size = Math.random() * 14 + 10;
            this.vx = (Math.random() - 0.5) * 8;
            this.vy = (Math.random() - 0.5) * 8 - (type === 'confetti' ? 5 : 0);
            this.rotation = Math.random() * Math.PI * 2;
            this.vRot = (Math.random() - 0.5) * 0.15;
            this.alpha = 1;
            this.color = `hsl(${Math.random() * 60 + 320}, 100%, 65%)`;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.vRot;
            this.alpha -= 0.012;
            if (this.type === 'confetti') this.vy += 0.15;
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.alpha);
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);

            if (this.type === 'heart') {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(-this.size/4, -this.size/4, this.size/4, 0, Math.PI, true);
                ctx.arc(this.size/4, -this.size/4, this.size/4, 0, Math.PI, true);
                ctx.lineTo(0, this.size/2);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.fillStyle = this.color;
                ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
            }
            ctx.restore();
        }
    }

    function spawnExplosion(x, y, count = 30, type = 'heart') {
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(x, y, type));
        }
    }

    function animateFX() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (Math.random() < 0.08) {
            particles.push(new Particle(Math.random() * canvas.width, canvas.height + 20, 'heart'));
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].alpha <= 0) {
                particles.splice(i, 1);
            }
        }
        requestAnimationFrame(animateFX);
    }
    animateFX();

    window.addEventListener('mousemove', (e) => {
        state.mouse.x = e.clientX;
        state.mouse.y = e.clientY;
        if (Math.random() < 0.25) {
            particles.push(new Particle(e.clientX, e.clientY, 'heart'));
        }
        updatePuppyEyes(e.clientX, e.clientY);
    });

    // --- PUPPY EYE TRACKING & INTERACTIVES ---
    const pupilLeft = document.getElementById('pupil-left');
    const pupilRight = document.getElementById('pupil-right');
    const puppyElement = document.getElementById('puppy-element');
    const puppyTongue = document.getElementById('puppy-tongue');
    const screenLickOverlay = document.getElementById('screen-lick-overlay');

    function updatePuppyEyes(mouseX, mouseY) {
        if (!pupilLeft || !pupilRight) return;

        const leftRect = pupilLeft.getBoundingClientRect();
        const rightRect = pupilRight.getBoundingClientRect();

        const calculatePupilOffset = (rect) => {
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const angle = Math.atan2(mouseY - centerY, mouseX - centerX);
            const dist = Math.min(4, Math.hypot(mouseX - centerX, mouseY - centerY) / 20);
            return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
        };

        const offL = calculatePupilOffset(leftRect);
        const offR = calculatePupilOffset(rightRect);

        pupilLeft.style.transform = `translate(${offL.x}px, ${offL.y}px)`;
        pupilRight.style.transform = `translate(${offR.x}px, ${offR.y}px)`;
    }

    function performPuppyLick() {
        if (screens.puppy.classList.contains('active')) {
            puppyTongue.classList.add('licking');
            playSound('kiss');

            screenLickOverlay.classList.remove('hidden');
            setTimeout(() => screenLickOverlay.classList.add('hidden'), 800);

            const rect = puppyElement.getBoundingClientRect();
            spawnExplosion(rect.left + rect.width / 2, rect.top + 40, 25, 'heart');

            setTimeout(() => puppyTongue.classList.remove('licking'), 1200);
        }
    }

    setInterval(() => {
        if (Math.random() < 0.4) performPuppyLick();
    }, 4500);

    const puppyBox = document.getElementById('puppy-box');
    if (puppyBox) {
        puppyBox.addEventListener('click', (e) => {
            state.puppyClickCount++;
            playSound('bark');
            playSound('kiss');

            puppyElement.classList.add('jump');
            setTimeout(() => puppyElement.classList.remove('jump'), 500);

            spawnExplosion(e.clientX, e.clientY, 35, 'heart');

            if (state.puppyClickCount === 10) {
                unlockAchievement('DOG LOVER 🐶', 'You clicked the puppy 10 times!');
            }
        });
    }

    // --- NO BUTTON EVASION ---
    const noPhrases = [
        "No", "Really?", "Think Again 😏", "Wrong Button 😂",
        "Catch Me", "Oops", "Still No?", "Impossible",
        "Nice Try", "Almost", "HAHA 😂", "Nope"
    ];

    function evadeNoButton() {
        state.noAttempts++;
        playSound('pop');

        noCounterHint.textContent = `You tried pressing NO ${state.noAttempts} times 😂`;

        if (state.noAttempts >= 20) {
            const rect = btnNo.getBoundingClientRect();
            spawnExplosion(rect.left + rect.width / 2, rect.top + rect.height / 2, 80, 'heart');
            btnNo.style.display = 'none';
            noCounterHint.textContent = "The NO button exploded from defeat! 💥";
            return;
        }

        btnNo.textContent = noPhrases[Math.floor(Math.random() * noPhrases.length)];

        const windowWidth = window.innerWidth - 120;
        const windowHeight = window.innerHeight - 60;

        const randomX = Math.max(20, Math.floor(Math.random() * windowWidth));
        const randomY = Math.max(20, Math.floor(Math.random() * windowHeight));
        const randomScale = (Math.random() * 0.4 + 0.7).toFixed(2);
        const randomRot = Math.floor((Math.random() - 0.5) * 90);

        btnNo.style.position = 'fixed';
        btnNo.style.left = `${randomX}px`;
        btnNo.style.top = `${randomY}px`;
        btnNo.style.transform = `scale(${randomScale}) rotate(${randomRot}deg)`;
        btnNo.style.opacity = Math.random() < 0.3 ? '0.2' : '1';

        if (state.noAttempts === 10) {
            unlockAchievement('PERSISTENT ONE 🙈', 'Tried clicking NO 10 times!');
        }
    }

    document.addEventListener('mousemove', (e) => {
        if (btnNo.style.display === 'none') return;
        const rect = btnNo.getBoundingClientRect();
        const dist = Math.hypot(e.clientX - (rect.left + rect.width / 2), e.clientY - (rect.top + rect.height / 2));
        if (dist < 100) evadeNoButton();
    });

    btnNo.addEventListener('click', evadeNoButton);

    // --- YES BUTTON & TRANSITIONS ---
    btnYes.addEventListener('click', () => {
        startAmbientSynth();
        playSound('bark');
        spawnExplosion(window.innerWidth / 2, window.innerHeight / 2, 150, 'confetti');
        document.body.classList.add('shake');
        setTimeout(() => document.body.classList.remove('shake'), 500);

        switchScreen(screens.landing, screens.puppy);

        setTimeout(() => {
            switchScreen(screens.puppy, screens.promise);
        }, 4000);
    });

    // --- PROMISE & CERTIFICATE ---
    const handlePromise = () => {
        playSound('pop');
        spawnExplosion(window.innerWidth / 2, window.innerHeight / 2, 60, 'heart');
        switchScreen(screens.promise, screens.certificate);
    };

    document.getElementById('btn-promise-1').addEventListener('click', handlePromise);
    document.getElementById('btn-promise-2').addEventListener('click', handlePromise);

    document.getElementById('btn-download-cert').addEventListener('click', () => {
        playSound('pop');

        const certCanvas = document.createElement('canvas');
        certCanvas.width = 800;
        certCanvas.height = 500;
        const c = certCanvas.getContext('2d');

        c.fillStyle = '#fffdf9';
        c.fillRect(0, 0, 800, 500);

        c.strokeStyle = '#d4af37';
        c.lineWidth = 8;
        c.strokeRect(20, 20, 760, 460);

        c.fillStyle = '#ff2a75';
        c.font = 'bold 32px sans-serif';
        c.textAlign = 'center';
        c.fillText('OFFICIAL FRIENDSHIP CERTIFICATE', 400, 80);

        c.fillStyle = '#333';
        c.font = '20px sans-serif';
        c.fillText('This certifies that', 400, 140);

        c.fillStyle = '#ff2a75';
        c.font = 'bold 42px sans-serif';
        c.fillText(state.userName, 400, 220);

        c.fillStyle = '#555';
        c.font = '20px sans-serif';
        c.fillText('holds a truly special place in my heart forever! ❤️', 400, 300);

        c.font = '16px sans-serif';
        c.textAlign = 'left';
        c.fillText(`Date: ${new Date().toLocaleDateString()}`, 60, 420);
        c.fillText(`ID: BFF-${Math.floor(1000 + Math.random() * 9000)}`, 60, 445);

        const link = document.createElement('a');
        link.download = `Friendship_Certificate_${state.userName}.png`;
        link.href = certCanvas.toDataURL();
        link.click();

        setTimeout(() => {
            switchScreen(screens.certificate, screens.countdown);
            runCountdown();
        }, 1000);
    });

    // --- GRAND FINALE CELEBRATION ---
    function runCountdown() {
        let count = 3;
        const timerElem = document.getElementById('countdown-timer');
        const titleElem = document.querySelector('.countdown-title');

        const interval = setInterval(() => {
            count--;
            if (count > 0) {
                timerElem.textContent = count;
                playSound('pop');
            } else {
                clearInterval(interval);
                
                if (titleElem) titleElem.textContent = "PROMISE KEPT FOREVER! 💖";
                timerElem.innerHTML = `
                    <div style="font-size: 1.8rem; margin-top: 15px; color: #ff2a75; font-weight: 700; line-height: 1.5;">
                        Thank you for being in my life, ${state.userName}.<br>
                        <span style="font-size: 1.3rem; color: #4a154b; font-weight: 500;">
                            I am, and will always be, truly yours! 🥹✨❤️
                        </span>
                    </div>
                `;

                document.body.classList.add('shake');
                setTimeout(() => document.body.classList.remove('shake'), 600);
                playSound('bark');

                const explosionInterval = setInterval(() => {
                    spawnExplosion(
                        Math.random() * window.innerWidth,
                        Math.random() * window.innerHeight,
                        60,
                        Math.random() < 0.5 ? 'heart' : 'confetti'
                    );
                    playSound('pop');
                }, 250);

                setTimeout(() => clearInterval(explosionInterval), 12000);
            }
        }, 1000);
    }

    // --- UTILITIES ---
    function switchScreen(fromScreen, toScreen) {
        fromScreen.classList.remove('active');
        fromScreen.classList.add('hidden');

        setTimeout(() => {
            toScreen.classList.remove('hidden');
            toScreen.classList.add('active');
        }, 300);
    }

    function unlockAchievement(title, desc) {
        const toast = document.getElementById('achievement-toast');
        document.getElementById('toast-title').textContent = title;
        document.getElementById('toast-desc').textContent = desc;

        toast.classList.remove('hidden');
        playSound('pop');

        setTimeout(() => {
            toast.classList.add('hidden');
        }, 4000);
    }
});

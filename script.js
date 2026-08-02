document.addEventListener('DOMContentLoaded', () => {

    const state = {
        noCount: 0,
        muted: false,
        audioCtx: null
    };

    function initAudio() {
        if (!state.audioCtx) {
            state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    function playNote(freq, dur, type = 'sine', vol = 0.1) {
        if (state.muted) return;
        initAudio();
        if (!state.audioCtx) return;
        try {
            const osc = state.audioCtx.createOscillator();
            const gain = state.audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, state.audioCtx.currentTime);
            gain.gain.setValueAtTime(vol, state.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, state.audioCtx.currentTime + dur);
            osc.connect(gain);
            gain.connect(state.audioCtx.destination);
            osc.start();
            osc.stop(state.audioCtx.currentTime + dur);
        } catch(e) {}
    }

    const sounds = {
        pop: () => playNote(600, 0.08, 'square', 0.05),
        kiss: () => { playNote(800, 0.15, 'triangle'); setTimeout(() => playNote(600, 0.15, 'triangle'), 80); },
        bark: () => { playNote(200, 0.1, 'sawtooth'); setTimeout(() => playNote(220, 0.1, 'sawtooth'), 100); },
        win: () => { [440, 554, 659, 880].forEach((f, i) => setTimeout(() => playNote(f, 0.4), i * 120)); }
    };

    // CANVAS ENGINE
    const canvas = document.getElementById('fx-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    let particles = [];

    function resize() { if (canvas) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; } }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor(x, y, type) {
            this.x = x; this.y = y; this.type = type;
            this.sz = Math.random() * 12 + 8;
            this.vx = (Math.random() - 0.5) * 8;
            this.vy = (Math.random() - 0.5) * 8;
            this.life = 1;
        }
        draw() {
            if (!ctx) return;
            ctx.globalAlpha = Math.max(0, this.life);
            ctx.font = `${this.sz}px Arial`;
            ctx.fillText(this.type === 'heart' ? '❤️' : '✨', this.x, this.y);
        }
        update() { this.x += this.vx; this.y += this.vy; this.life -= 0.015; }
    }

    function burst(x, y, type = 'heart', count = 25) {
        for (let i = 0; i < count; i++) particles.push(new Particle(x, y, type));
    }

    function anim() {
        if (ctx && canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles = particles.filter(p => p.life > 0);
            particles.forEach(p => { p.update(); p.draw(); });
        }
        requestAnimationFrame(anim);
    }
    anim();

    // UNIVERSAL SCREEN SWITCHER
    function gotoScreen(fromId, toId) {
        sounds.pop();
        const fromElem = document.getElementById(fromId);
        const toElem = document.getElementById(toId);

        if (fromElem) {
            fromElem.classList.remove('active');
            fromElem.classList.add('hidden');
        }

        if (toElem) {
            toElem.classList.remove('hidden');
            toElem.classList.add('active');
        }

        if (toId === 'screen-puppy') startPuppyLogic();
        if (toId === 'screen-finale') startFinale();
    }

    // NO BUTTON EVASION
    const btnNo = document.getElementById('btn-no');
    if (btnNo) {
        const evade = (e) => {
            e.preventDefault();
            state.noCount++;
            sounds.pop();
            const x = Math.max(20, Math.random() * (window.innerWidth - 120));
            const y = Math.max(20, Math.random() * (window.innerHeight - 60));
            btnNo.style.position = 'fixed';
            btnNo.style.left = x + 'px';
            btnNo.style.top = y + 'px';

            if (state.noCount >= 15) {
                btnNo.style.display = 'none';
            }
        };

        btnNo.addEventListener('mouseover', evade);
        btnNo.addEventListener('touchstart', evade);
        btnNo.addEventListener('click', evade);
    }

    // BUTTON EVENT LISTENERS
    const btnYes = document.getElementById('btn-yes');
    if (btnYes) {
        btnYes.addEventListener('click', () => {
            sounds.win();
            burst(window.innerWidth / 2, window.innerHeight / 2, 'heart', 80);
            gotoScreen('screen-landing', 'screen-puppy');
        });
    }

    const btnToEmotional = document.getElementById('btn-to-emotional');
    if (btnToEmotional) {
        btnToEmotional.addEventListener('click', () => {
            gotoScreen('screen-puppy', 'screen-emotional');
        });
    }

    const btnToPromise = document.getElementById('btn-to-promise');
    if (btnToPromise) {
        btnToPromise.addEventListener('click', () => {
            gotoScreen('screen-emotional', 'screen-promise');
        });
    }

    const btnPromise1 = document.getElementById('btn-promise-1');
    const btnPromise2 = document.getElementById('btn-promise-2');
    if (btnPromise1) btnPromise1.addEventListener('click', () => gotoScreen('screen-promise', 'screen-certificate'));
    if (btnPromise2) btnPromise2.addEventListener('click', () => gotoScreen('screen-promise', 'screen-certificate'));

    // DOWNLOAD CERTIFICATE
    const btnDownload = document.getElementById('btn-download-cert');
    if (btnDownload) {
        btnDownload.addEventListener('click', () => {
            sounds.pop();
            const canvasCert = document.createElement('canvas');
            canvasCert.width = 600; canvasCert.height = 400;
            const c = canvasCert.getContext('2d');

            c.fillStyle = '#fffdf9'; c.fillRect(0,0,600,400);
            c.strokeStyle = '#d4af37'; c.lineWidth = 8; c.strokeRect(15,15,570,370);

            c.fillStyle = '#ff2a75'; c.font = 'bold 24px Arial'; c.textAlign = 'center';
            c.fillText('OFFICIAL FRIENDSHIP CERTIFICATE', 300, 70);
            c.fillStyle = '#333'; c.font = '18px Arial'; c.fillText('This certifies that', 300, 130);
            c.fillStyle = '#ff2a75'; c.font = 'bold 40px Georgia'; c.fillText('Priti', 300, 200);
            c.fillStyle = '#555'; c.font = '18px Arial'; c.fillText('is my Best Friend Forever! ❤️', 300, 270);
            c.font = '40px Arial'; c.fillText('⭐', 300, 340);

            const link = document.createElement('a');
            link.download = 'Friendship_Certificate_Priti.png';
            link.href = canvasCert.toDataURL();
            link.click();

            setTimeout(() => gotoScreen('screen-certificate', 'screen-finale'), 1200);
        });
    }

    function startPuppyLogic() {
        const puppy = document.getElementById('puppy-element');
        const overlay = document.getElementById('lick-overlay');
        setInterval(() => {
            if (document.getElementById('screen-puppy').classList.contains('active') && Math.random() > 0.6) {
                if (puppy) puppy.classList.add('licking');
                sounds.kiss();
                if (overlay) overlay.classList.add('show');
                setTimeout(() => {
                    if (puppy) puppy.classList.remove('licking');
                    if (overlay) overlay.classList.remove('show');
                }, 1000);
            }
        }, 3500);
    }

    function startFinale() {
        sounds.win();
        setInterval(() => {
            burst(Math.random() * window.innerWidth, Math.random() * window.innerHeight, 'heart', 25);
            burst(Math.random() * window.innerWidth, Math.random() * window.innerHeight, 'sparkle', 15);
            sounds.pop();
        }, 400);
    }

    const audioToggle = document.getElementById('audio-toggle');
    if (audioToggle) {
        audioToggle.addEventListener('click', () => {
            state.muted = !state.muted;
            document.getElementById('audio-icon').textContent = state.muted ? '🔇' : '🎵';
            initAudio();
        });
    }
});

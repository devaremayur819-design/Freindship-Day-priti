document.addEventListener('DOMContentLoaded', () => {
    const state = {
        noCount: 0,
        audioStarted: false,
        muted: false,
        userName: 'Priti'
    };

    // --- WEB AUDIO SYNTH ---
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playNote(freq, dur, type = 'sine', vol = 0.1) {
        if (state.muted) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + dur);
    }

    const sounds = {
        pop: () => playNote(600, 0.1, 'square', 0.05),
        kiss: () => { playNote(800, 0.2, 'triangle'); setTimeout(() => playNote(600, 0.2, 'triangle'), 100); },
        bark: () => { playNote(200, 0.1, 'sawtooth'); setTimeout(() => playNote(200, 0.1, 'sawtooth'), 150); },
        success: () => { [440, 554, 659].forEach((f, i) => setTimeout(() => playNote(f, 0.5), i * 150)); }
    };

    // --- CANVAS ENGINE ---
    const canvas = document.getElementById('fx-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor(x, y, color, type) {
            this.x = x; this.y = y; this.color = color; this.type = type;
            this.sz = Math.random() * 10 + 5;
            this.vx = (Math.random() - 0.5) * 10;
            this.vy = (Math.random() - 0.5) * 10;
            this.life = 1;
        }
        draw() {
            ctx.globalAlpha = this.life;
            ctx.fillStyle = this.color;
            ctx.font = `${this.sz}px Arial`;
            ctx.fillText(this.type === 'heart' ? '❤️' : '✨', this.x, this.y);
        }
        update() { this.x += this.vx; this.y += this.vy; this.life -= 0.01; }
    }

    function burst(x, y, type = 'heart', count = 20) {
        for(let i=0; i<count; i++) particles.push(new Particle(x, y, '#ff2a75', type));
    }

    function anim() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles = particles.filter(p => p.life > 0);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(anim);
    }
    anim();

    // --- INTERACTION ---
    const btnNo = document.getElementById('btn-no');
    const btnYes = document.getElementById('btn-yes');

    btnNo.addEventListener('mouseover', () => {
        state.noCount++;
        sounds.pop();
        const x = Math.random() * (window.innerWidth - 100);
        const y = Math.random() * (window.innerHeight - 50);
        btnNo.style.position = 'fixed';
        btnNo.style.left = x + 'px';
        btnNo.style.top = y + 'px';
        
        if(state.noCount === 5) showToast("Wrong Choice! 😂", "Keep trying...");
        if(state.noCount === 15) {
            btnNo.style.display = 'none';
            showToast("Achievement Unlocked!", "Persistence! But NO is gone. 😂");
        }
    });

    btnYes.addEventListener('click', () => {
        sounds.success();
        burst(window.innerWidth/2, window.innerHeight/2, 'heart', 100);
        nextSlide('screen-landing', 'screen-puppy');
    });

    // --- SLIDE SYSTEM ---
    window.nextSlide = (currId, nextId) => {
        sounds.pop();
        document.getElementById(currId).classList.remove('active');
        document.getElementById(currId).classList.add('hidden');
        const next = document.getElementById(nextId);
        next.style.display = 'flex';
        setTimeout(() => {
            next.classList.remove('hidden');
            next.classList.add('active');
        }, 50);

        if(nextId === 'screen-puppy') startPuppyLogic();
        if(nextId === 'screen-finale') startFinale();
    };

    function startPuppyLogic() {
        const puppy = document.getElementById('puppy-element');
        setInterval(() => {
            if(Math.random() > 0.7) {
                puppy.classList.add('licking');
                sounds.kiss();
                document.getElementById('lick-overlay').classList.add('show');
                setTimeout(() => {
                    puppy.classList.remove('licking');
                    document.getElementById('lick-overlay').classList.remove('show');
                }, 1000);
            }
        }, 4000);
    }

    function startFinale() {
        setInterval(() => {
            burst(Math.random() * window.innerWidth, Math.random() * window.innerHeight, 'heart', 30);
            burst(Math.random() * window.innerWidth, Math.random() * window.innerHeight, 'sparkle', 20);
            sounds.pop();
        }, 500);
    }

    // --- DOWNLOAD CERT ---
    document.getElementById('btn-download-cert').addEventListener('click', () => {
        const cert = document.getElementById('certificate-node');
        const canvasCert = document.createElement('canvas');
        canvasCert.width = 600; canvasCert.height = 400;
        const c = canvasCert.getContext('2d');
        
        c.fillStyle = '#fff'; c.fillRect(0,0,600,400);
        c.strokeStyle = '#d4af37'; c.lineWidth = 10; c.strokeRect(20,20,560,360);
        
        c.fillStyle = '#2d0c41'; c.font = '30px Arial'; c.textAlign = 'center';
        c.fillText('BFF CERTIFICATE', 300, 80);
        c.font = '20px Arial'; c.fillText('This certifies that', 300, 150);
        c.fillStyle = '#ff2a75'; c.font = '50px Georgia'; c.fillText('Priti', 300, 220);
        c.fillStyle = '#2d0c41'; c.font = '20px Arial'; c.fillText('is my Best Friend Forever!', 300, 280);
        c.font = '50px Arial'; c.fillText('⭐', 300, 350);

        const link = document.createElement('a');
        link.download = 'Friendship_Certificate.png';
        link.href = canvasCert.toDataURL();
        link.click();
        
        setTimeout(() => nextSlide('screen-certificate', 'screen-finale'), 1500);
    });

    // --- UTILS ---
    function showToast(title, desc) {
        const toast = document.getElementById('achievement-toast');
        document.getElementById('toast-title').textContent = title;
        document.getElementById('toast-desc').textContent = desc;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 4000);
    }

    document.getElementById('audio-toggle').addEventListener('click', () => {
        state.muted = !state.muted;
        document.getElementById('audio-icon').textContent = state.muted ? '🔇' : '🎵';
        if (!state.audioStarted) { audioCtx.resume(); state.audioStarted = true; }
    });
});

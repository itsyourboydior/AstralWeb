// --- Language ---
let currentLang = 'sq';
function switchLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.getElementById('langToggle').innerText = lang.toUpperCase();
    document.querySelectorAll('[data-en]').forEach(el => {
        const t = lang === 'en' ? el.dataset.en : (el.dataset.sq || el.dataset.en);
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = t;
        else {
            if (el.tagName === 'H1' && typeof TextScramble !== 'undefined') {
                if (!el.fx) el.fx = new TextScramble(el);
                el.fx.setText(t);
            } else {
                el.innerHTML = t;
            }
        }
    });
}
document.getElementById('langToggle').addEventListener('click', () => {
    switchLanguage(currentLang === 'en' ? 'sq' : 'en');
});

// --- FAQ ---
document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => q.parentElement.classList.toggle('active'));
});

// --- Header scroll ---
window.addEventListener('scroll', () => {
    document.querySelector('header').classList.toggle('scrolled', window.scrollY > 50);
});

// --- Hamburger ---
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('show');
        document.body.style.overflow = mobileMenu.classList.contains('show') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('show');
            document.body.style.overflow = '';
        });
    });
}

// --- Scroll Reveal ---
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// --- Stat Counters ---
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target.querySelector('.stat-num');
        if (!el || el.dataset.counted) return;
        el.dataset.counted = '1';
        const raw = el.textContent.trim();
        const digits = parseInt(raw.replace(/[^0-9]/g, ''));
        const suffix = raw.replace(/[0-9]/g, '');
        const dur = 2000, start = performance.now();
        (function tick(now) {
            const t = Math.min((now - start) / dur, 1);
            const ease = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.round(ease * digits) + suffix;
            if (t < 1) requestAnimationFrame(tick);
        })(start);
        counterObserver.unobserve(entry.target);
    });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-card').forEach(el => counterObserver.observe(el));

// --- 3D Card Tilt ---
document.querySelectorAll('.service-card, .feature-card, .team-card, .price-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top - r.height / 2) / r.height) * -8;
        const ry = ((e.clientX - r.left - r.width / 2) / r.width) * 8;
        card.style.transition = 'transform 0.08s ease';
        card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.5s ease';
        card.style.transform = '';
    });
});

// --- Nav Scrollspy ---
const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
            const a = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
            if (a) a.classList.add('active');
        }
    });
}, { threshold: 0.3 });
document.querySelectorAll('section[id]').forEach(s => spyObserver.observe(s));

// --- Text Scramble on Hero ---
class TextScramble {
    constructor(el) { this.el = el; this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!<>-_\\/[]{}=+*^?#'; this.update = this.update.bind(this); }
    setText(targetHTML) {
        this.queue = [];
        const temp = document.createElement('div');
        temp.innerHTML = targetHTML;
        temp.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                for (let c of node.textContent) {
                    this.queue.push({ to: c, isGradient: false });
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const isGrad = node.classList.contains('gradient');
                for (let c of node.textContent) {
                    this.queue.push({ to: c, isGradient: isGrad });
                }
            }
        });
        
        for (let i = 0; i < this.queue.length; i++) {
            const isSpace = this.queue[i].to === ' ';
            const start = isSpace ? 0 : Math.floor(i * 1.0);
            const end = isSpace ? 0 : start + Math.floor(Math.random() * 10) + 15;
            this.queue[i].start = start;
            this.queue[i].end = end;
            this.queue[i].char = '';
        }
        
        cancelAnimationFrame(this.raf);
        this.frame = 0;
        this.resolve = () => {};
        const p = new Promise(r => this.resolve = r);
        this.update();
        return p;
    }
    update() {
        let out = '', done = 0;
        let inGrad = false;
        for (let i = 0; i < this.queue.length; i++) {
            let { to, start, end, char, isGradient } = this.queue[i];
            
            if (isGradient && !inGrad) {
                out += '<span class="gradient">';
                inGrad = true;
            } else if (!isGradient && inGrad) {
                out += '</span>';
                inGrad = false;
            }
            
            if (this.frame >= end) {
                done++;
                out += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.45) {
                    char = this.chars[Math.floor(Math.random() * this.chars.length)];
                    this.queue[i].char = char;
                }
                const charStyle = isGradient ? 'opacity:.9' : 'color:#fff;opacity:.9';
                out += `<span style="${charStyle}">${char}</span>`;
            } else {
                out += `<span style="opacity:0">${to}</span>`;
            }
        }
        if (inGrad) {
            out += '</span>';
        }
        this.el.innerHTML = out;
        if (done < this.queue.length) { this.raf = requestAnimationFrame(this.update); this.frame++; }
        else this.resolve();
    }
}

switchLanguage('sq');

// --- Timeline Scroll Progress ---
window.addEventListener('scroll', () => {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;
    
    const rect = timeline.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    const startPoint = windowHeight * 0.8; 
    let progress = (startPoint - rect.top) / rect.height;
    progress = Math.max(0, Math.min(1, progress));
    
    const progressBar = document.querySelector('.timeline-progress');
    if (progressBar) progressBar.style.height = `${progress * 100}%`;
    
    document.querySelectorAll('.timeline-step').forEach((step) => {
        const stepRect = step.getBoundingClientRect();
        const dot = step.querySelector('.timeline-dot');
        if (stepRect.top < windowHeight * 0.7) {
            dot.classList.add('active');
            step.classList.add('active');
        } else {
            dot.classList.remove('active');
            step.classList.remove('active');
        }
    });
});

// --- Portfolio Carousel ---
const carouselWrapper = document.querySelector('.portfolio-carousel-wrapper');
if (carouselWrapper) {
    const carousel = carouselWrapper.querySelector('.portfolio-carousel');
    const items = Array.from(carousel.querySelectorAll('.carousel-item'));
    const dots = Array.from(carouselWrapper.querySelectorAll('.dot'));
    const prevBtn = carouselWrapper.querySelector('.prev-btn');
    const nextBtn = carouselWrapper.querySelector('.next-btn');
    let currentIndex = 0;

    function updateCarousel() {
        const angle = currentIndex * -120;
        carousel.style.transform = `translateZ(var(--tz, -350px)) scale(var(--scale, 1)) rotateY(${angle}deg)`;
        
        let normalizedIndex = ((currentIndex % 3) + 3) % 3;
        
        items.forEach((item, i) => {
            item.classList.toggle('active', i === normalizedIndex);
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === normalizedIndex);
        });
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { currentIndex--; updateCarousel(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { currentIndex++; updateCarousel(); });
    
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            let normalizedIndex = ((currentIndex % 3) + 3) % 3;
            let diff = i - normalizedIndex;
            if (diff > 1) diff -= 3;
            if (diff < -1) diff += 3;
            currentIndex += diff;
            updateCarousel();
        });
    });

    let startX = 0;
    carouselWrapper.addEventListener('touchstart', e => startX = e.touches[0].clientX, {passive: true});
    carouselWrapper.addEventListener('touchend', e => {
        let endX = e.changedTouches[0].clientX;
        if (startX - endX > 40) { currentIndex++; updateCarousel(); }
        if (startX - endX < -40) { currentIndex--; updateCarousel(); }
    });
    
    updateCarousel();
}

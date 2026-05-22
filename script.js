// --- Language ---
let currentLang = 'sq';
function switchLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    const langBtn = document.getElementById('langToggle');
    if (langBtn) langBtn.innerText = lang === 'en' ? 'SQ' : 'EN';
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
    document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
}
document.getElementById('langToggle').addEventListener('click', () => {
    switchLanguage(currentLang === 'en' ? 'sq' : 'en');
});

// --- Mobile Menu Resize Handler ---
window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && mobileMenu && mobileMenu.classList.contains('show')) {
        if (hamburger) hamburger.classList.remove('active');
        mobileMenu.classList.remove('show');
        document.body.style.overflow = '';
    }
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
        const match = raw.match(/^([^0-9]*)([0-9]+)([^0-9]*)$/);
        if (!match) return;
        const prefix = match[1];
        const digits = parseInt(match[2]);
        const suffix = match[3];
        const dur = 2000, start = performance.now();
        (function tick(now) {
            const t = Math.min((now - start) / dur, 1);
            const ease = 1 - Math.pow(1 - t, 3);
            el.textContent = prefix + Math.round(ease * digits) + suffix;
            if (t < 1) requestAnimationFrame(tick);
        })(start);
        counterObserver.unobserve(entry.target);
    });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-card').forEach(el => counterObserver.observe(el));

// --- 3D Card Tilt ---
document.querySelectorAll('.service-card, .feature-card, .team-card, .price-card, .stat-card').forEach(card => {
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
        const measure = this.el.cloneNode(false);
        measure.innerHTML = targetHTML;
        measure.style.position = 'absolute';
        measure.style.visibility = 'hidden';
        measure.style.height = 'auto';
        measure.style.width = this.el.offsetWidth + 'px';
        document.body.appendChild(measure);
        const targetHeight = measure.offsetHeight;
        document.body.removeChild(measure);
        this.el.style.height = Math.max(this.el.offsetHeight, targetHeight) + 'px';

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
        else {
            this.resolve();
            // Smooth height release to prevent layout snap on mobile
            const el = this.el;
            const fromH = el.offsetHeight;
            el.style.height = '';
            const toH = el.offsetHeight;
            if (fromH !== toH) {
                el.style.height = fromH + 'px';
                el.style.transition = 'height 0.3s ease';
                requestAnimationFrame(() => { el.style.height = toH + 'px'; });
                setTimeout(() => { el.style.height = ''; el.style.transition = ''; }, 350);
            }
        }
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

// --- Circular Portfolio Carousel ---
(function() {
    const projects = [
        {
            name: 'Rafuna Consulting',
            designation: { en: 'Financial Consulting Firm – Web Design & SEO', sq: 'Firmë Konsulence Financiare – Dizajn Web & SEO' },
            quote: {
                en: 'Complete website redesign with modern glassmorphism aesthetics, integrated financial dashboard, and full SEO optimization achieving top Google rankings.',
                sq: 'Ridizajnim i plotë i faqes me estetikë moderne glassmorphism, panel financiar i integruar, dhe optimizim i plotë SEO duke arritur renditje të larta në Google.'
            }
        },
        {
            name: 'Rafuna SEO',
            designation: { en: 'Digital Marketing Agency Platform', sq: 'Platformë për Agjenci Marketingu Digjital' },
            quote: {
                en: 'Built a high-converting landing page with vibrant purple dark-mode design, animated hero section, and strategic SEO architecture driving 300% organic traffic growth.',
                sq: 'Ndërtim i një faqe konvertimi me dizajn vibrant purpurt në modalitetin e errët, seksion hero i animuar, dhe arkitekturë strategjike SEO duke sjellë rritje 300% të trafikut organik.'
            }
        },
        {
            name: "Art n'Flok",
            designation: { en: 'Luxury Barbershop – Booking System & Web Design', sq: 'Berberhane Luksoze – Sistem Rezervimi & Dizajn Web' },
            quote: {
                en: 'Elegant dark & gold website with online booking integration, gallery showcase, and local SEO strategy that placed them #1 for barbershop searches in their area.',
                sq: 'Faqe elegante në të zezë & ar me integrim të rezervimit online, galeri punësh, dhe strategji SEO lokale që i vendosi #1 për kërkim berberhanësh në zonën e tyre.'
            }
        }
    ];

    const wraps = document.querySelectorAll('.circ-carousel__img-wrap');
    const nameEl = document.getElementById('circName');
    const desigEl = document.getElementById('circDesignation');
    const quoteEl = document.getElementById('circQuote');
    const textWrap = document.getElementById('circTextWrap');
    const prevBtn = document.getElementById('circPrev');
    const nextBtn = document.getElementById('circNext');
    const dotsWrap = document.getElementById('circDots');
    const dots = dotsWrap ? dotsWrap.querySelectorAll('.circ-carousel__dot') : [];

    let activeIndex = 0;
    let total = projects.length;
    let autoplayTimer = null;
    let textTransitionTimer = null;

    function getState(index) {
        if (index === activeIndex) return 'active';
        if ((activeIndex - 1 + total) % total === index) return 'left';
        if ((activeIndex + 1) % total === index) return 'right';
        return 'hidden';
    }

    function animateQuoteWords(text) {
        quoteEl.innerHTML = '';
        const words = text.split(' ');
        words.forEach((word, i) => {
            const span = document.createElement('span');
            span.className = 'word';
            span.textContent = word;
            span.style.animationDelay = (i * 0.03) + 's';
            quoteEl.appendChild(span);
            if (i < words.length - 1) {
                quoteEl.appendChild(document.createTextNode(' '));
            }
        });
    }

    function update(isInitial = false) {
        const lang = typeof currentLang !== 'undefined' ? currentLang : 'en';
        const p = projects[activeIndex];

        // Images
        wraps.forEach((w, i) => {
            w.setAttribute('data-state', getState(i));
        });

        // Dots
        dots.forEach((d, i) => {
            d.classList.toggle('active', i === activeIndex);
        });

        // Clear any pending transitions/timeouts
        if (textTransitionTimer) {
            clearTimeout(textTransitionTimer);
            textTransitionTimer = null;
        }

        if (isInitial) {
            if (nameEl) nameEl.textContent = p.name;
            if (desigEl) desigEl.textContent = lang === 'sq' ? p.designation.sq : p.designation.en;
            if (quoteEl) animateQuoteWords(lang === 'sq' ? p.quote.sq : p.quote.en);
            if (textWrap) {
                textWrap.style.transition = 'none';
                textWrap.style.opacity = '1';
                textWrap.style.transform = 'translateY(0)';
            }
        } else {
            // Text - fade out then in
            if (textWrap) {
                textWrap.style.transition = 'opacity .15s ease, transform .15s ease';
                textWrap.style.opacity = '0';
                textWrap.style.transform = 'translateY(12px)';
            }
            textTransitionTimer = setTimeout(() => {
                if (nameEl) nameEl.textContent = p.name;
                if (desigEl) desigEl.textContent = lang === 'sq' ? p.designation.sq : p.designation.en;
                if (quoteEl) animateQuoteWords(lang === 'sq' ? p.quote.sq : p.quote.en);
                if (textWrap) {
                    textWrap.style.transition = 'opacity .35s ease, transform .35s ease';
                    textWrap.style.opacity = '1';
                    textWrap.style.transform = 'translateY(0)';
                }
            }, 200);
        }
    }

    function goNext() {
        activeIndex = (activeIndex + 1) % total;
        update();
        resetAutoplay();
    }

    function goPrev() {
        activeIndex = (activeIndex - 1 + total) % total;
        update();
        resetAutoplay();
    }

    function goTo(i) {
        activeIndex = i;
        update();
        resetAutoplay();
    }

    function startAutoplay() {
        if (autoplayTimer) clearInterval(autoplayTimer);
        autoplayTimer = setInterval(() => {
            activeIndex = (activeIndex + 1) % total;
            update();
        }, 5000);
    }

    function stopAutoplay() {
        if (autoplayTimer) {
            clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
    }

    function resetAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    // Events
    if (nextBtn) nextBtn.addEventListener('click', goNext);
    if (prevBtn) prevBtn.addEventListener('click', goPrev);

    wraps.forEach((w) => {
        w.addEventListener('click', () => {
            const state = w.getAttribute('data-state');
            if (state === 'left') {
                goPrev();
            } else if (state === 'right') {
                goNext();
            }
        });
    });

    dots.forEach((d, i) => {
        d.addEventListener('click', () => goTo(i));
    });

    // Keyboard (ignore if typing in form inputs)
    window.addEventListener('keydown', e => {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
            return;
        }
        if (e.key === 'ArrowLeft') goPrev();
        if (e.key === 'ArrowRight') goNext();
    });

    // Touch/swipe (prevent scroll interference)
    let touchStartX = 0;
    let touchStartY = 0;
    const carousel = document.getElementById('circCarousel');
    if (carousel) {
        carousel.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        carousel.addEventListener('touchend', e => {
            const diffX = touchStartX - e.changedTouches[0].clientX;
            const diffY = touchStartY - e.changedTouches[0].clientY;
            // Only slide if horizontal swipe is larger than vertical swipe & exceeds threshold
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
                if (diffX > 0) goNext();
                else goPrev();
            }
        }, { passive: true });

        // Pause autoplay on hover
        carousel.addEventListener('mouseenter', stopAutoplay);
        carousel.addEventListener('mouseleave', startAutoplay);
    }

    // Init
    update(true);
    startAutoplay();

    // Listen to custom languagechange event
    document.addEventListener('languagechange', () => {
        update();
    });
})();

// --- Formspree Redirect Handling ---
window.addEventListener('load', () => {
    if (window.location.search.includes('submitted=1')) {
        // Clean URL parameter
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.hash;
        window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
        
        // Show success alert based on current lang
        alert(currentLang === 'en' ? 
            '✅ Success! We received your request. We will reply within 24h.' : 
            '✅ Sukses! Kërkesa u mor. Do të përgjigjemi brenda 24 orëve.');
    }
});


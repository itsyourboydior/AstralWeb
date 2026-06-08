document.addEventListener('DOMContentLoaded', () => {
    
    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Language Toggle Mechanism
    const langToggle = document.getElementById('langToggle');
    let currentLang = 'sq'; // Default language

    const updateLanguage = (lang) => {
        currentLang = lang;
        document.documentElement.lang = lang;
        
        // Update elements with translation tags
        const translatables = document.querySelectorAll('[data-sq], [data-en], [data-placeholder-sq], [data-placeholder-en]');
        translatables.forEach(el => {
            const translation = el.getAttribute(`data-${lang}`);
            const placeholderAttr = el.getAttribute(`data-placeholder-${lang}`);

            if (placeholderAttr && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
                el.placeholder = placeholderAttr;
            }

            if (translation) {
                if (el.tagName === 'OPTION') {
                    el.textContent = translation;
                } else {
                    if (translation.includes('<span') || translation.includes('<i') || translation.includes('<br')) {
                        el.innerHTML = translation;
                    } else {
                        el.textContent = translation;
                    }
                }
            }
        });

        // Toggle UI Lang Button State
        if (langToggle) {
            langToggle.textContent = lang === 'en' ? 'SQ' : 'EN';
        }

        // Emit Language Change Custom Event
        const event = new CustomEvent('languagechange', { detail: { lang } });
        document.dispatchEvent(event);
    };

    if (langToggle) {
        langToggle.addEventListener('click', () => {
            updateLanguage(currentLang === 'en' ? 'sq' : 'en');
        });
    }

    // Initial Trigger on Load
    updateLanguage('sq');

    // FAQ Accordion Toggle
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const trigger = item.querySelector('.faq-trigger');
        if (!trigger) return;

        trigger.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close other items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });

            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // Mobile Nav Toggle Mechanism
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link, .mobile-nav-cta');

    if (hamburgerBtn && mobileNavOverlay) {
        const toggleMobileNav = () => {
            const isActive = hamburgerBtn.classList.toggle('active');
            mobileNavOverlay.classList.toggle('active');
            hamburgerBtn.setAttribute('aria-expanded', isActive);
            document.body.style.overflow = isActive ? 'hidden' : '';
        };

        hamburgerBtn.addEventListener('click', toggleMobileNav);

        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburgerBtn.classList.remove('active');
                mobileNavOverlay.classList.remove('active');
                hamburgerBtn.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
    }

    // Scroll Assembly Animation Logic
    // We use matchMedia to ensure this ONLY runs on Desktop (> 768px)
    let mm = gsap.matchMedia();

    mm.add("(min-width: 769px)", () => {
        // Elements
        const home = document.getElementById('home');
        const heroText = document.querySelector('.hero-text-content');
        const heroGlow = document.querySelector('.hero-glow');
        const cardSeo = document.getElementById('card-seo');
        const cardPerf = document.getElementById('card-perf');
        const cardDesign = document.getElementById('card-design');
        const cardConv = document.getElementById('card-conv');
        const cardUptime = document.getElementById('card-uptime');
        const dashboard = document.getElementById('assembly-dashboard');
        
        if (!cardSeo || !cardPerf || !cardDesign || !cardConv || !cardUptime || !dashboard || !home) return;

        // Save original style attributes from HTML to perform clean coordinate measurements
        const originalStyles = {
            cardSeo: cardSeo.getAttribute('style') || '',
            cardPerf: cardPerf.getAttribute('style') || '',
            cardDesign: cardDesign.getAttribute('style') || '',
            cardConv: cardConv.getAttribute('style') || '',
            cardUptime: cardUptime.getAttribute('style') || '',
            dashboard: dashboard.getAttribute('style') || ''
        };

        // Function to get relative coordinates between an element and a parent container
        function getRelativeCoords(element, parent) {
            const rect = element.getBoundingClientRect();
            const parentRect = parent.getBoundingClientRect();
            return {
                top: rect.top - parentRect.top,
                left: rect.left - parentRect.left
            };
        }

        // Variables to store dynamic target offsets (deltas)
        let seoDelta = { dx: 0, dy: 0 };
        let perfDelta = { dx: 0, dy: 0 };
        let designDelta = { dx: 0, dy: 0 };
        let convDelta = { dx: 0, dy: 0 };
        let uptimeDelta = { dx: 0, dy: 0 };

        // Helper function to calculate exact translations needed for cards to align with slots
        function calculateDeltas() {
            // 1. Restore HTML styles exactly as they were written in the markup to avoid measuring dirty GSAP translation states
            cardSeo.setAttribute('style', originalStyles.cardSeo);
            cardPerf.setAttribute('style', originalStyles.cardPerf);
            cardDesign.setAttribute('style', originalStyles.cardDesign);
            cardConv.setAttribute('style', originalStyles.cardConv);
            cardUptime.setAttribute('style', originalStyles.cardUptime);
            dashboard.setAttribute('style', originalStyles.dashboard);

            // 2. Temporarily set the dashboard to its final active state (centered in #home)
            gsap.set(dashboard, {
                position: "absolute",
                top: "50%",
                left: "50%",
                xPercent: -50,
                yPercent: -50,
                y: 0,
                opacity: 1
            });

            // 3. Retrieve slot elements
            const slotSeo = document.querySelector('.slot-seo');
            const slotPerf = document.querySelector('.slot-perf');
            const slotDesign = document.querySelector('.slot-design');
            const slotConv = document.querySelector('.slot-conv');
            const slotUptime = document.querySelector('.slot-uptime');

            if (!slotSeo || !slotPerf || !slotDesign || !slotConv || !slotUptime) return;

            // 4. Measure coords relative to `#home`
            const cardSeoCoords = getRelativeCoords(cardSeo, home);
            const cardPerfCoords = getRelativeCoords(cardPerf, home);
            const cardDesignCoords = getRelativeCoords(cardDesign, home);
            const cardConvCoords = getRelativeCoords(cardConv, home);
            const cardUptimeCoords = getRelativeCoords(cardUptime, home);

            const slotSeoCoords = getRelativeCoords(slotSeo, home);
            const slotPerfCoords = getRelativeCoords(slotPerf, home);
            const slotDesignCoords = getRelativeCoords(slotDesign, home);
            const slotConvCoords = getRelativeCoords(slotConv, home);
            const slotUptimeCoords = getRelativeCoords(slotUptime, home);

            // 5. Save deltas
            seoDelta = { dx: slotSeoCoords.left - cardSeoCoords.left, dy: slotSeoCoords.top - cardSeoCoords.top };
            perfDelta = { dx: slotPerfCoords.left - cardPerfCoords.left, dy: slotPerfCoords.top - cardPerfCoords.top };
            designDelta = { dx: slotDesignCoords.left - cardDesignCoords.left, dy: slotDesignCoords.top - cardDesignCoords.top };
            convDelta = { dx: slotConvCoords.left - cardConvCoords.left, dy: slotConvCoords.top - cardConvCoords.top };
            uptimeDelta = { dx: slotUptimeCoords.left - cardUptimeCoords.left, dy: slotUptimeCoords.top - cardUptimeCoords.top };

            // 6. Restore HTML styles again so animation starts clean
            cardSeo.setAttribute('style', originalStyles.cardSeo);
            cardPerf.setAttribute('style', originalStyles.cardPerf);
            cardDesign.setAttribute('style', originalStyles.cardDesign);
            cardConv.setAttribute('style', originalStyles.cardConv);
            cardUptime.setAttribute('style', originalStyles.cardUptime);
            dashboard.setAttribute('style', originalStyles.dashboard);
        }

        // Calculate deltas on page load
        calculateDeltas();

        // Re-calculate deltas on window resize / ScrollTrigger refresh to ensure responsiveness
        ScrollTrigger.addEventListener("refreshInit", calculateDeltas);

        // Set initial centered states for elements with percentage transforms to prevent GSAP conflicts
        if (heroGlow) {
            gsap.set(heroGlow, { xPercent: -50, yPercent: -50, x: 0, y: 0 });
        }

        // Define starting values for the animated dashboard
        gsap.set(dashboard, {
            position: "absolute",
            top: "50%",
            left: "50%",
            xPercent: -50,
            yPercent: -50,
            y: 150, // Start shifted down
            opacity: 0,
            pointerEvents: "none" // Disable pointer events until fully assembled
        });

        // Create the ScrollTrigger timeline pinning #home
        let tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#home",
                start: "top top",      // pin when hero reaches top of viewport
                end: "+=120%",         // pin duration (120% of viewport height)
                pin: true,             // pin the hero section!
                scrub: 1,              // smooth scrub linked to scroll
                invalidateOnRefresh: true,
                onLeave: () => {
                    gsap.set(dashboard, { pointerEvents: "auto" }); // make dashboard clickable when assembled
                },
                onEnterBack: () => {
                    gsap.set(dashboard, { pointerEvents: "none" }); // disable interaction when scrolling back up
                }
            }
        });

        // 1. Animate Hero Text (Fades out, scales down, and slides up slightly)
        tl.to(heroText, {
            y: -100,
            scale: 0.85,
            opacity: 0,
            duration: 0.6,
            ease: "power2.inOut"
        }, 0);

        // 2. Animate Hero Glow (Fades and scales down slightly on scroll, plus continuous floating idle motion)
        if (heroGlow) {
            tl.to(heroGlow, {
                opacity: 0.15, // Lowered scroll end opacity as requested
                scale: 0.7,
                duration: 0.6,
                ease: "power2.inOut"
            }, 0);

            // Subtle circular floating idle motion (split x and y to avoid property conflicts)
            gsap.to(heroGlow, {
                x: 25, // Subtle drift x
                duration: 7,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
            gsap.to(heroGlow, {
                y: -15, // Subtle drift y
                duration: 5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }

        // 3. Animate Dashboard (Fades in and slides up to center)
        tl.to(dashboard, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out"
        }, 0.2);

        // 4. Animate Cards (Fly to slots and align rotation)
        tl.to(cardSeo, {
            x: () => seoDelta.dx,
            y: () => seoDelta.dy,
            rotation: 0,
            duration: 0.8,
            ease: "power2.out"
        }, 0.2);

        tl.to(cardPerf, {
            x: () => perfDelta.dx,
            y: () => perfDelta.dy,
            rotation: 0,
            duration: 0.8,
            ease: "power2.out"
        }, 0.2);

        tl.to(cardDesign, {
            x: () => designDelta.dx,
            y: () => designDelta.dy,
            rotation: 0,
            duration: 0.8,
            ease: "power2.out"
        }, 0.2);

        tl.to(cardConv, {
            x: () => convDelta.dx,
            y: () => convDelta.dy,
            rotation: 0,
            duration: 0.8,
            ease: "power2.out"
        }, 0.2);

        tl.to(cardUptime, {
            x: () => uptimeDelta.dx,
            y: () => uptimeDelta.dy,
            rotation: 0,
            duration: 0.8,
            ease: "power2.out"
        }, 0.2);
    });

    // Examples Carousel Logic (translating the React motion component behavior to Vanilla JS + GSAP)
    const initCarousel = () => {
        const container = document.querySelector('.work-carousel-container');
        const track = document.getElementById('carouselMenuTrack');
        const stack = document.getElementById('carouselCardsStack');
        if (!track || !stack) return;

        const buttons = Array.from(track.querySelectorAll('.carousel-menu-btn'));
        const cards = Array.from(stack.querySelectorAll('.carousel-card'));
        const total = buttons.length;
        let currentIndex = 0;
        let autoplayTimer = null;
        let isPaused = false;
        const ITEM_HEIGHT = 65; // Height of each button + gap on desktop

        function wrap(min, max, v) {
            const rangeSize = max - min;
            return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
        }

        function getCardStatus(index) {
            const diff = index - currentIndex;
            let normalizedDiff = diff;
            if (diff > total / 2) normalizedDiff -= total;
            if (diff < -total / 2) normalizedDiff += total;

            if (normalizedDiff === 0) return "active";
            if (normalizedDiff === -1) return "prev";
            if (normalizedDiff === 1) return "next";
            return "hidden";
        }

        function updateCarousel(index) {
            currentIndex = (index + total) % total;

            // 1. Update Menu Buttons
            buttons.forEach((btn, idx) => {
                const isActive = idx === currentIndex;
                
                if (window.innerWidth > 768) {
                    // On desktop, translate buttons vertically relative to track center with wrap-around
                    const distance = idx - currentIndex;
                    const wrappedDistance = wrap(-(total / 2), total / 2, distance);
                    
                    gsap.to(btn, {
                        xPercent: -50, // Keep centered horizontally
                        y: wrappedDistance * ITEM_HEIGHT,
                        opacity: 1 - Math.abs(wrappedDistance) * 0.35,
                        scale: isActive ? 1 : 0.9,
                        duration: 0.6,
                        ease: "power2.out"
                    });
                } else {
                    // Reset translations on mobile so they flow inline
                    gsap.set(btn, { xPercent: 0, x: 0, y: 0, opacity: 1, scale: 1 });
                    if (isActive) {
                        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    }
                }

                if (isActive) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // 2. Update Stack Cards
            cards.forEach((card, idx) => {
                const status = getCardStatus(idx);
                card.className = `carousel-card ${status}`;
            });
        }

        // Click handlers for buttons
        buttons.forEach((btn, idx) => {
            btn.addEventListener('click', () => {
                updateCarousel(idx);
            });
        });

        // Click handlers for prev/next cards to make the card stack interactive
        cards.forEach((card, idx) => {
            card.addEventListener('click', () => {
                const status = getCardStatus(idx);
                if (status === 'next') {
                    updateCarousel(currentIndex + 1);
                } else if (status === 'prev') {
                    updateCarousel(currentIndex - 1);
                }
            });
        });

        // Navigation Buttons click handlers
        const prevBtn = container ? container.querySelector('.prev-btn') : null;
        const nextBtn = container ? container.querySelector('.next-btn') : null;
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                updateCarousel(currentIndex - 1);
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                updateCarousel(currentIndex + 1);
            });
        }

        // Handle resize events to recalculate layout behavior
        window.addEventListener('resize', () => {
            updateCarousel(currentIndex);
        });

        // Initial update
        updateCarousel(0);
    };

    initCarousel();

    // --- Header Scrolled State Toggle ---
    const headerEl = document.querySelector('.main-header');
    if (headerEl) {
        const checkScroll = () => {
            if (window.scrollY > 50) {
                headerEl.classList.add('scrolled');
            } else {
                headerEl.classList.remove('scrolled');
            }
        };
        window.addEventListener('scroll', checkScroll);
        checkScroll(); // Check once on load
    }

    // --- Page Load Animations (GSAP) ---
    // Make sure elements exist before running timelines
    const heroTitle = document.querySelector('.hero-text-content h1');
    if (heroTitle) {
        const loadTl = gsap.timeline();
        
        // Header elements and Hero elements animate simultaneously at time 0
        loadTl.from('.logo-container img', {
            y: -20,
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out'
        }, 0)
        .from('.nav-menu a', {
            y: -20,
            opacity: 0,
            duration: 0.5,
            stagger: 0.06,
            ease: 'power2.out'
        }, 0)
        .from('.header-actions', {
            y: -20,
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out'
        }, 0)
        .from('.hero-text-content h1', {
            y: 40,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out'
        }, 0)
        .from('.hero-text-content p', {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out'
        }, 0.1) // Subtitle starts with a microscopic offset for a organic feel
        .from('.hero-cta-group', {
            y: 20,
            opacity: 0,
            duration: 0.6,
            ease: 'power3.out'
        }, 0.2); // Hero buttons start with a microscopic offset
    }

    // --- Scroll Reveal Animations (ScrollTrigger) ---
    // 1. Service Cards stagger reveal
    const serviceCards = document.querySelectorAll('#services .service-card');
    if (serviceCards.length > 0) {
        gsap.from(serviceCards, {
            scrollTrigger: {
                trigger: '#services',
                start: 'top 80%',
                toggleActions: 'play none none none'
            },
            y: 60,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out'
        });
    }

    // 2. Fullscreen Sticky Scroll Left Header reveal
    const hiwHeader = document.querySelector('.hiw-header-side');
    if (hiwHeader) {
        gsap.from(hiwHeader.children, {
            scrollTrigger: {
                trigger: '#process',
                start: 'top 80%',
                toggleActions: 'play none none none'
            },
            y: 35,
            opacity: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out'
        });
    }

    // 3. FAQ Items stagger reveal
    const faqItemsReveal = document.querySelectorAll('#faq .faq-item');
    if (faqItemsReveal.length > 0) {
        gsap.from(faqItemsReveal, {
            scrollTrigger: {
                trigger: '#faq',
                start: 'top 82%',
                toggleActions: 'play none none none'
            },
            y: 40,
            opacity: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out'
        });
    }

    // 4. Contact Form Grid columns reveal
    const contactCols = document.querySelectorAll('#contact .grid-2 > div');
    if (contactCols.length > 0) {
        gsap.from(contactCols, {
            scrollTrigger: {
                trigger: '#contact',
                start: 'top 80%',
                toggleActions: 'play none none none'
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out'
        });
    }

    // 5. Section headers reveal (excluding hero)
    const sectionHeaders = document.querySelectorAll('.container > div:first-child');
    sectionHeaders.forEach(headerBlock => {
        if (headerBlock.closest('#home')) return;
        gsap.from(headerBlock.children, {
            scrollTrigger: {
                trigger: headerBlock,
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            y: 35,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out'
        });
    });

    // --- Contact Form Success Popup Modal Handler ---
    const contactForm = document.querySelector('#contact form');
    const successModal = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModalBtn');

    if (contactForm && successModal) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Show modal popup
            successModal.classList.add('active');
            contactForm.reset();
        });
    }

    if (closeModalBtn && successModal) {
        closeModalBtn.addEventListener('click', () => {
            successModal.classList.remove('active');
        });
        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) {
                successModal.classList.remove('active');
            }
        });
    }

    // --- 6. Fullscreen Sticky Scroll "How It Works" (Procesi) ---
    const hiwWrapper = document.getElementById('process');
    const hiwProgressFill = document.getElementById('hiwProgressFill');
    const hiwPanels = document.querySelectorAll('.hiw-snap-panel');
    const hiwDots = document.querySelectorAll('.hiw-dot');
    const hiwVisuals = document.querySelectorAll('.hiw-visual-card');

    if (hiwWrapper && hiwProgressFill && hiwPanels.length > 0) {
        let lastLoggedWidth = 0;
        const updateStickyScroll = () => {
            if (window.innerWidth <= 768) {
                if (lastLoggedWidth > 768 || lastLoggedWidth === 0) {
                    console.log("[StickyScroll] Viewport <= 768px: Bypassing sticky behavior (running static layout).");
                    lastLoggedWidth = window.innerWidth;
                }
                return;
            }
            if (lastLoggedWidth <= 768) {
                console.log("[StickyScroll] Viewport > 768px: Activating sticky scroll tracking.");
            }
            lastLoggedWidth = window.innerWidth;

            const rect = hiwWrapper.getBoundingClientRect();
            const scrolled = -rect.top;
            const totalHeight = rect.height - window.innerHeight;
            
            let progress = scrolled / totalHeight;
            progress = Math.max(0, Math.min(1, progress));

            hiwProgressFill.style.height = (progress * 100) + '%';

            const panelsCount = hiwPanels.length;
            const activeIndex = Math.max(0, Math.min(panelsCount - 1, Math.floor(progress * panelsCount)));

            // Optional diagnostic logging (uncomment in developer tools if needed)
            // console.log(`[StickyScroll] top: ${rect.top.toFixed(0)}px, progress: ${(progress * 100).toFixed(0)}%, active: ${activeIndex}`);

            hiwPanels.forEach((panel, idx) => {
                if (idx === activeIndex) {
                    panel.classList.add('in-view');
                } else {
                    panel.classList.remove('in-view');
                }
            });

            hiwVisuals.forEach((visual, idx) => {
                if (idx === activeIndex) {
                    visual.classList.add('active');
                } else {
                    visual.classList.remove('active');
                }
            });

            hiwDots.forEach((dot, idx) => {
                if (idx === activeIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        };

        window.addEventListener('scroll', updateStickyScroll, { passive: true });
        window.addEventListener('resize', updateStickyScroll);
        updateStickyScroll();
    }

    // --- ScrollSpy: Highlight active navigation link based on scroll position ---
    const spySections = document.querySelectorAll('section, #process');
    const spyNavLinks = document.querySelectorAll('.nav-menu a');
    const spyMobileLinks = document.querySelectorAll('.mobile-nav-menu a');

    const spyOptions = {
        root: null,
        rootMargin: '-30% 0px -40% 0px',
        threshold: 0
    };

    const spyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                
                // Update desktop nav links
                spyNavLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });

                // Update mobile nav links
                spyMobileLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, spyOptions);

    spySections.forEach(section => {
        if (section.id) {
            spyObserver.observe(section);
        }
    });
});

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

        // Update URL search query dynamically to support indexing
        if (lang === 'en') {
            window.history.replaceState(null, '', '?lang=en');
        } else {
            window.history.replaceState(null, '', window.location.pathname);
        }

        // Dynamic SEO adjustments based on language
        const canonicalLink = document.getElementById('canonical-link');
        const metaDesc = document.querySelector('meta[name="description"]');
        const ogTitle = document.querySelector('meta[property="og:title"]');
        const ogDesc = document.querySelector('meta[property="og:description"]');
        const twitterTitle = document.querySelector('meta[name="twitter:title"]');
        const twitterDesc = document.querySelector('meta[name="twitter:description"]');

        if (lang === 'en') {
            document.title = "AstralWeb - Elite Web Development Agency";
            if (metaDesc) metaDesc.setAttribute("content", "AstralWeb - Elite agency for bespoke web development and advanced SEO optimization. We build websites with 100/100 performance.");
            if (ogTitle) ogTitle.setAttribute("content", "AstralWeb - Elite Web Development Agency");
            if (ogDesc) ogDesc.setAttribute("content", "We are an elite web development and SEO optimization agency. We build outstanding interfaces with maximum performance.");
            if (twitterTitle) twitterTitle.setAttribute("content", "AstralWeb - Elite Web Development Agency");
            if (twitterDesc) twitterDesc.setAttribute("content", "Elite web development and SEO optimization agency.");
            if (canonicalLink) canonicalLink.setAttribute("href", "https://astralweb.net/en/");
        } else {
            document.title = "AstralWeb - Agjenci Elite e Zhvillimit të Uebit";
            if (metaDesc) metaDesc.setAttribute("content", "AstralWeb - Agjenci elite për zhvillimin e uebfaqeve bespoke dhe optimizimin SEO të avancuar. Ndërtojmë uebfaqe me performancë 100/100.");
            if (ogTitle) ogTitle.setAttribute("content", "AstralWeb - Agjenci Elite e Zhvillimit të Uebit");
            if (ogDesc) ogDesc.setAttribute("content", "Ne jemi një agjenci elite e zhvillimit të uebit dhe optimizimit SEO. Krijojmë ndërfaqe të jashtëzakonshme me performancë maksimale.");
            if (twitterTitle) twitterTitle.setAttribute("content", "AstralWeb - Agjenci Elite e Zhvillimit të Uebit");
            if (twitterDesc) twitterDesc.setAttribute("content", "Agjenci elite e zhvillimit të uebit dhe optimizimit SEO.");
            if (canonicalLink) canonicalLink.setAttribute("href", "https://astralweb.net/");
        }

        // Dynamically inject/update FAQPage JSON-LD Schema
        const existingFaqSchema = document.getElementById('faq-schema');
        if (existingFaqSchema) existingFaqSchema.remove();

        const faqSchemaData = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": []
        };

        const faqElements = document.querySelectorAll('.faq-item');
        faqElements.forEach(item => {
            const trigger = item.querySelector('.faq-trigger span');
            const answer = item.querySelector('.faq-answer p');
            if (trigger && answer) {
                const questionText = trigger.getAttribute(`data-${lang}`) || trigger.textContent;
                const answerText = answer.getAttribute(`data-${lang}`) || answer.textContent;
                faqSchemaData.mainEntity.push({
                    "@type": "Question",
                    "name": questionText.trim(),
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": answerText.trim()
                    }
                });
            }
        });

        const scriptEl = document.createElement('script');
        scriptEl.type = 'application/ld+json';
        scriptEl.id = 'faq-schema';
        scriptEl.text = JSON.stringify(faqSchemaData);
        document.head.appendChild(scriptEl);

        // Emit Language Change Custom Event
        const event = new CustomEvent('languagechange', { detail: { lang } });
        document.dispatchEvent(event);
    };

    if (langToggle && langToggle.tagName === 'BUTTON') {
        langToggle.addEventListener('click', () => {
            updateLanguage(currentLang === 'en' ? 'sq' : 'en');
        });
    }

    // Initial Trigger on Load: support ?lang=en url param and HTML tag attribute fallback
    const urlParams = new URLSearchParams(window.location.search);
    const htmlLang = document.documentElement.lang === 'en' ? 'en' : 'sq';
    const initialLang = urlParams.get('lang') === 'en' ? 'en' : htmlLang;
    updateLanguage(initialLang);

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

            // 2. KEY FIX: Temporarily zero-out CSS rotation transforms before measuring.
            //    getBoundingClientRect() of a rotated element returns the axis-aligned bounding
            //    box, which shifts the measured left/top by the rotation amount (a few px).
            //    We need the layout (pre-rotation) position so GSAP x/y translations land
            //    pixel-perfectly on the slot outlines.
            [cardSeo, cardPerf, cardDesign, cardConv, cardUptime].forEach(el => {
                el.style.transform = 'none';
            });

            // 3. Temporarily set the dashboard to its final active state (centered in #home)
            gsap.set(dashboard, {
                position: "absolute",
                top: "50%",
                left: "50%",
                xPercent: -50,
                yPercent: -50,
                y: 0,
                opacity: 1
            });

            // 4. Retrieve slot elements
            const slotSeo = document.querySelector('.slot-seo');
            const slotPerf = document.querySelector('.slot-perf');
            const slotDesign = document.querySelector('.slot-design');
            const slotConv = document.querySelector('.slot-conv');
            const slotUptime = document.querySelector('.slot-uptime');

            if (!slotSeo || !slotPerf || !slotDesign || !slotConv || !slotUptime) return;

            // 5. Measure layout coords relative to `#home` (rotation-cleared = pure layout position)
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

            // 6. Save deltas (slot layout position minus card layout position, both relative to #home)
            seoDelta = { dx: slotSeoCoords.left - cardSeoCoords.left, dy: slotSeoCoords.top - cardSeoCoords.top };
            perfDelta = { dx: slotPerfCoords.left - cardPerfCoords.left, dy: slotPerfCoords.top - cardPerfCoords.top };
            designDelta = { dx: slotDesignCoords.left - cardDesignCoords.left, dy: slotDesignCoords.top - cardDesignCoords.top };
            convDelta = { dx: slotConvCoords.left - cardConvCoords.left, dy: slotConvCoords.top - cardConvCoords.top };
            uptimeDelta = { dx: slotUptimeCoords.left - cardUptimeCoords.left, dy: slotUptimeCoords.top - cardUptimeCoords.top };

            // 7. Restore HTML styles (including original rotations) so animation starts from the correct visual position
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
                        const btnOffsetLeft = btn.offsetLeft;
                        const btnWidth = btn.offsetWidth;
                        const trackWidth = track.offsetWidth;
                        const targetScroll = btnOffsetLeft - (trackWidth / 2) + (btnWidth / 2);
                        // Use scrollLeft directly to avoid WebKit page-scrolling bug on smooth scrollTo
                        track.scrollLeft = targetScroll;
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

        // Handle resize events to recalculate layout behavior (only on width change to prevent mobile URL bar scroll jumps)
        let lastWidth = window.innerWidth;
        window.addEventListener('resize', () => {
            if (window.innerWidth !== lastWidth) {
                lastWidth = window.innerWidth;
                updateCarousel(currentIndex);
            }
        });

        // Initial update
        updateCarousel(0);
    };

    initCarousel();

    // --- Header Scrolled State + Direction-Aware Hide/Show ---
    const headerEl = document.querySelector('.main-header');
    if (headerEl) {
        let lastScrollY = 0;
        const checkScroll = () => {
            const currentY = window.scrollY;

            // Compact glass state after 50px
            if (currentY > 50) {
                headerEl.classList.add('scrolled');
            } else {
                headerEl.classList.remove('scrolled');
            }

            // Hide nav when scrolling DOWN past 80px — re-show when scrolling back UP
            if (currentY > 80) {
                if (currentY > lastScrollY) {
                    headerEl.classList.add('nav-hidden');
                } else {
                    headerEl.classList.remove('nav-hidden');
                }
            } else {
                headerEl.classList.remove('nav-hidden');
            }

            lastScrollY = currentY;
        };
        window.addEventListener('scroll', checkScroll, { passive: true });
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
    // Using gsap.fromTo() instead of gsap.from() to GUARANTEE the final state (opacity:1, y:0)
    // is explicitly set. This prevents elements from getting permanently stuck at opacity:0
    // if a ScrollTrigger fires at an incorrect position due to pin spacer offsets.

    // 1. Service Cards stagger reveal
    const serviceCards = document.querySelectorAll('#services .service-card');
    if (serviceCards.length > 0) {
        gsap.fromTo(serviceCards,
            { y: 60, opacity: 0 },
            {
                scrollTrigger: {
                    trigger: '#services',
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                },
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.15,
                ease: 'power3.out'
            }
        );
    }

    // 2. Process Section Left Header reveal
    const hiwHeader = document.querySelector('.hiw-header-side');
    if (hiwHeader) {
        gsap.fromTo(hiwHeader.children,
            { y: 35, opacity: 0 },
            {
                scrollTrigger: {
                    trigger: '#process',
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                },
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.12,
                ease: 'power3.out'
            }
        );
    }

    // 3. FAQ Items stagger reveal
    const faqItemsReveal = document.querySelectorAll('#faq .faq-item');
    if (faqItemsReveal.length > 0) {
        gsap.fromTo(faqItemsReveal,
            { y: 40, opacity: 0 },
            {
                scrollTrigger: {
                    trigger: '#faq',
                    start: 'top 82%',
                    toggleActions: 'play none none none'
                },
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.12,
                ease: 'power3.out'
            }
        );
    }

    // 4. Contact Form Grid columns reveal
    const contactCols = document.querySelectorAll('#contact .grid-2 > div');
    if (contactCols.length > 0) {
        gsap.fromTo(contactCols,
            { y: 50, opacity: 0 },
            {
                scrollTrigger: {
                    trigger: '#contact',
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                },
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.15,
                ease: 'power3.out'
            }
        );
    }

    // 5. Section headers reveal (excluding hero)
    const sectionHeaders = document.querySelectorAll('.container > div:first-child');
    sectionHeaders.forEach(headerBlock => {
        if (headerBlock.closest('#home')) return;
        gsap.fromTo(Array.from(headerBlock.children),
            { y: 35, opacity: 0 },
            {
                scrollTrigger: {
                    trigger: headerBlock,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                y: 0,
                opacity: 1,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power2.out'
            }
        );
    });

    // --- Contact Form Success Popup Modal Handler ---
    const contactForm = document.getElementById('agency-contact-form');
    const successModal = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModalBtn');

    if (contactForm && successModal) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            
            // Check honeypot bot check field
            if (formData.get('botcheck')) {
                console.log("[Web3Forms] Bot detected. Submission rejected.");
                return;
            }

            // Perform fetch submission to API
            fetch(contactForm.action, {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    successModal.classList.add('active');
                    contactForm.reset();
                } else {
                    alert("Gabim gjatë dërgimit. Ju lutem provoni përsëri.");
                }
            })
            .catch(err => {
                console.error("Error submitting form:", err);
                // Fallback for visual testing / offline dev
                successModal.classList.add('active');
                contactForm.reset();
            });
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
    // FIX: Previously used raw getBoundingClientRect() to calculate scroll progress.
    // This broke when GSAP's ScrollTrigger injected a .gsap-pin-spacer for the hero section,
    // which shifted the DOM position of #process and kept progress stuck near 0 (only step 1 shown).
    // Fix: Use a GSAP ScrollTrigger instance which internally accounts for all pin spacers.
    const hiwWrapper = document.getElementById('process');
    const hiwProgressFill = document.getElementById('hiwProgressFill');
    const hiwPanels = document.querySelectorAll('.hiw-snap-panel');
    const hiwDots = document.querySelectorAll('.hiw-dot');
    const hiwVisuals = document.querySelectorAll('.hiw-visual-card');

    if (hiwWrapper && hiwPanels.length > 0) {

        // Helper: sync UI state from a 0-1 progress value
        const applyHiwProgress = (progress) => {
            if (hiwProgressFill) {
                hiwProgressFill.style.height = (progress * 100) + '%';
            }
            const panelsCount = hiwPanels.length;
            // Clamp to last index so the final step stays active at progress=1.0
            const activeIndex = Math.max(0, Math.min(panelsCount - 1, Math.floor(progress * panelsCount)));

            hiwPanels.forEach((panel, idx) => {
                panel.classList.toggle('in-view', idx === activeIndex);
            });
            hiwVisuals.forEach((visual, idx) => {
                visual.classList.toggle('active', idx === activeIndex);
            });
            hiwDots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === activeIndex);
            });
        };

        // Desktop: GSAP ScrollTrigger tracks progress through the 500vh wrapper accurately
        ScrollTrigger.create({
            trigger: hiwWrapper,
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: (self) => {
                if (window.innerWidth <= 768) return;
                applyHiwProgress(self.progress);
            },
            onRefresh: (self) => {
                if (window.innerWidth <= 768) return;
                applyHiwProgress(self.progress);
            }
        });

        // Mobile: show all panels statically (no sticky scroll on mobile)
        const syncMobileLayout = () => {
            if (window.innerWidth <= 768) {
                hiwPanels.forEach(panel => panel.classList.add('in-view'));
                hiwVisuals.forEach(visual => visual.classList.add('active'));
            }
        };
        syncMobileLayout();
        window.addEventListener('resize', syncMobileLayout);
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

    // Refresh all ScrollTrigger positions after the full page has loaded.
    // Fonts, images, and GSAP pin spacers must all be in their final layout
    // state before trigger offsets are calculated. This prevents elements
    // from getting stuck at their 'from' state due to stale position data.
    window.addEventListener('load', () => {
        setTimeout(() => {
            ScrollTrigger.refresh();
        }, 150);
    });
});

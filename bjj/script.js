/* BJJ Basics
   Motion is deliberately limited: one entrance, scroll reveals, a pinned
   horizontal track on desktop, and a slow drift on the gi / no-gi panels.
   Everything degrades to a plain scrolling page if GSAP never loads. */

(function () {
    'use strict';

    var root = document.documentElement;
    var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Without GSAP, or with reduced motion, drop the class that hides things.
    if (!hasGsap || reduced) {
        root.classList.remove('js');
    }

    /* ------------------------------------------------------------ masthead */

    var masthead = document.getElementById('masthead');
    var hero = document.querySelector('.hero');

    if (masthead && hero) {
        var flipHeader = function () {
            var past = window.scrollY > hero.offsetHeight - 90;
            masthead.classList.toggle('is-light', past);
        };
        window.addEventListener('scroll', flipHeader, { passive: true });
        flipHeader();
    }

    /* ------------------------------------------------------------ contact form */

    // Front-end demo. No server, so it validates and answers on the page.
    var form = document.getElementById('contact-form');
    var formMessage = document.getElementById('form-message');

    if (form && formMessage) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();

            var name = document.getElementById('name');
            var email = document.getElementById('email');
            var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());

            if (name.value.trim() === '') {
                formMessage.textContent = 'Add your name so we know who to look out for.';
                name.focus();
                return;
            }

            if (!emailOk) {
                formMessage.textContent = 'That email does not look right.';
                email.focus();
                return;
            }

            formMessage.textContent = 'Thanks. We will reply with the night to start on.';
            form.reset();
        });
    }

    if (!hasGsap || reduced) return;

    gsap.registerPlugin(ScrollTrigger);

    /* ------------------------------------------------------------ entrance */

    var intro = gsap.timeline({ defaults: { ease: 'power3.out' } });

    intro
        .to('.hero-media img', { scale: 1, duration: 1.8, ease: 'power2.out' })
        .to('.reveal-line > span', { y: 0, duration: 1.05, stagger: 0.085 }, 0.2)
        .to('[data-hero]', { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 }, 0.75);

    /* ------------------------------------------------------------ scroll reveals */

    gsap.utils.toArray('[data-anim]').forEach(function (el) {
        gsap.fromTo(el,
            { opacity: 0, y: 34 },
            {
                opacity: 1,
                y: 0,
                duration: 0.9,
                ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 86%', once: true }
            }
        );
    });

    // the reasons list staggers its own rows rather than arriving as one block
    var reasonItems = gsap.utils.toArray('.reasons li');
    if (reasonItems.length) {
        gsap.fromTo(reasonItems,
            { opacity: 0, y: 26 },
            {
                opacity: 1,
                y: 0,
                duration: 0.7,
                ease: 'power3.out',
                stagger: 0.09,
                scrollTrigger: { trigger: '.reasons', start: 'top 82%', once: true }
            }
        );
    }

    /* ------------------------------------------------------------ responsive motion */

    var mm = gsap.matchMedia();

    mm.add('(min-width: 821px)', function () {
        var inner = document.getElementById('track-inner');
        var section = document.querySelector('.mat');

        // Pinned horizontal track. The distance is measured from the content,
        // and recalculated on resize, so it never over or under scrolls.
        var track = document.getElementById('track');

        if (inner && section) {
            // The row scrolls on its own until this point. Hand that over to
            // the timeline, otherwise the two fight each other.
            if (track) {
                track.scrollLeft = 0;
                track.classList.add('is-pinned');
            }

            // Measured from the last slide rather than from scrollWidth,
            // which is unreliable once the row is clipped by .is-pinned.
            // Both rects carry the same transform, so it cancels out.
            var slides = inner.querySelectorAll('.slide');
            var last = slides[slides.length - 1];

            var distance = function () {
                if (!last) return 0;
                var pad = parseFloat(getComputedStyle(inner).paddingRight) || 0;
                var width = last.getBoundingClientRect().right - inner.getBoundingClientRect().left;
                return Math.max(0, Math.round(width + pad - window.innerWidth));
            };

            gsap.to(inner, {
                x: function () { return -distance(); },
                ease: 'none',
                scrollTrigger: {
                    trigger: section,
                    start: 'top top',
                    end: function () { return '+=' + distance(); },
                    pin: true,
                    scrub: 0.6,
                    anticipatePin: 1,
                    invalidateOnRefresh: true
                }
            });

            // The ratios above keep the widths right before the photos load,
            // but a decoded image can still land a fraction off, so the
            // measurements are taken again once the row has finished loading.
            var waiting = 0;
            var settle = function () {
                if (--waiting <= 0) ScrollTrigger.refresh();
            };

            Array.prototype.forEach.call(inner.querySelectorAll('img'), function (img) {
                if (img.complete && img.naturalWidth) return;
                waiting++;
                img.addEventListener('load', settle, { once: true });
                img.addEventListener('error', settle, { once: true });
            });
        }

        // The two style panels drift apart slightly as they pass through.
        gsap.to('[data-panel="a"]', {
            y: -46,
            ease: 'none',
            scrollTrigger: { trigger: '.styles-split', start: 'top bottom', end: 'bottom top', scrub: true }
        });

        gsap.to('[data-panel="b"]', {
            y: 46,
            ease: 'none',
            scrollTrigger: { trigger: '.styles-split', start: 'top bottom', end: 'bottom top', scrub: true }
        });

        // A slow push on the closing photo, so the section is not static.
        gsap.fromTo('.community-media img',
            { scale: 1.16 },
            {
                scale: 1,
                ease: 'none',
                scrollTrigger: { trigger: '.community', start: 'top bottom', end: 'bottom top', scrub: true }
            }
        );

        // Dropping below 821px gives the row back to the browser.
        return function () {
            if (track) track.classList.remove('is-pinned');
        };
    });

    // Late-loading images change the layout, so measurements are refreshed.
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();

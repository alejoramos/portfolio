/* Momentum Athletics
   Scroll reveals, a looping marquee, the sport switcher, and magnetic
   buttons on pointer devices. Falls back to a plain page without GSAP. */

(function () {
    'use strict';

    var root = document.documentElement;
    var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hasGsap || reduced) {
        root.classList.remove('js');
    }

    /* ------------------------------------------------------------ header */

    var header = document.getElementById('site-header');
    var hero = document.querySelector('.hero');

    if (header && hero) {
        var flip = function () {
            header.classList.toggle('is-light', window.scrollY > hero.offsetHeight - 80);
        };
        window.addEventListener('scroll', flip, { passive: true });
        flip();
    }

    /* ------------------------------------------------------------ contact form */

    // Front-end demo. No server behind it, so it checks and answers inline.
    var form = document.getElementById('contact-form');
    var formMessage = document.getElementById('form-message');

    if (form && formMessage) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();

            var name = document.getElementById('name');
            var email = document.getElementById('email');
            var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());

            if (name.value.trim() === '') {
                formMessage.textContent = 'Add your name so we know who to expect.';
                name.focus();
                return;
            }

            if (!emailOk) {
                formMessage.textContent = 'That email does not look right.';
                email.focus();
                return;
            }

            formMessage.textContent = 'Thanks. We will reply with the session to start with.';
            form.reset();
        });
    }

    if (!hasGsap || reduced) return;

    gsap.registerPlugin(ScrollTrigger);

    /* ------------------------------------------------------------ entrance */

    gsap.timeline({ defaults: { ease: 'power3.out' } })
        .to('.hero-media img', { scale: 1, duration: 1.7, ease: 'power2.out' })
        .to('.reveal-line > span', { y: 0, duration: 1, stagger: 0.08 }, 0.18)
        .to('[data-hero]', { opacity: 1, y: 0, duration: 0.8 }, 0.7);

    /* ------------------------------------------------------------ scroll reveals */

    gsap.utils.toArray('[data-anim]').forEach(function (el) {
        gsap.fromTo(el,
            { opacity: 0, y: 32 },
            {
                opacity: 1, y: 0, duration: 0.85, ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 87%', once: true }
            }
        );
    });

    var whyItems = gsap.utils.toArray('.why-list li');
    if (whyItems.length) {
        gsap.fromTo(whyItems,
            { opacity: 0, y: 24 },
            {
                opacity: 1, y: 0, duration: 0.65, ease: 'power3.out', stagger: 0.08,
                scrollTrigger: { trigger: '.why-list', start: 'top 84%', once: true }
            }
        );
    }

    /* ------------------------------------------------------------ marquee */

    // One copy of the text is duplicated in the markup, so shifting by half
    // the track width and repeating gives a seamless loop.
    var track = document.getElementById('marquee-track');
    if (track) {
        var loop = gsap.to(track, {
            xPercent: -50,
            duration: 26,
            ease: 'none',
            repeat: -1
        });

        // Nudges speed with scroll direction, which keeps it feeling connected
        // to the page rather than running on its own.
        ScrollTrigger.create({
            onUpdate: function (self) {
                var speed = 1 + Math.min(Math.abs(self.getVelocity()) / 1800, 2.2);
                gsap.to(loop, { timeScale: speed, duration: 0.4, overwrite: true });
            }
        });
    }

    /* ------------------------------------------------------------ responsive motion */

    var mm = gsap.matchMedia();

    mm.add('(min-width: 861px)', function () {
        // The sport list drives which photo shows in the sticky column.
        var items = gsap.utils.toArray('.showcase-item');
        var figures = gsap.utils.toArray('.showcase-figure');

        var setActive = function (index) {
            items.forEach(function (el, i) { el.classList.toggle('is-active', i === index); });
            figures.forEach(function (el, i) { el.classList.toggle('is-active', i === index); });
        };

        items.forEach(function (item, i) {
            ScrollTrigger.create({
                trigger: item,
                start: 'top 62%',
                end: 'bottom 62%',
                onToggle: function (self) { if (self.isActive) setActive(i); }
            });
        });

        // Slow drift on the two closing photographs.
        gsap.fromTo('.join-media img',
            { scale: 1.14 },
            {
                scale: 1, ease: 'none',
                scrollTrigger: { trigger: '.join', start: 'top bottom', end: 'bottom top', scrub: true }
            }
        );

        gsap.fromTo('.moment-b img',
            { y: -26 },
            {
                y: 26, ease: 'none',
                scrollTrigger: { trigger: '.moments-collage', start: 'top bottom', end: 'bottom top', scrub: true }
            }
        );
    });

    // Magnetic buttons, pointer devices only so touch is never affected.
    mm.add('(min-width: 861px) and (pointer: fine)', function () {
        var magnets = gsap.utils.toArray('[data-magnetic]');

        magnets.forEach(function (el) {
            var move = function (event) {
                var box = el.getBoundingClientRect();
                var x = event.clientX - (box.left + box.width / 2);
                var y = event.clientY - (box.top + box.height / 2);
                gsap.to(el, { x: x * 0.28, y: y * 0.34, duration: 0.5, ease: 'power3.out' });
            };
            var reset = function () {
                gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
            };

            el.addEventListener('mousemove', move);
            el.addEventListener('mouseleave', reset);
            // cleanup when the media query stops matching
            return function () {
                el.removeEventListener('mousemove', move);
                el.removeEventListener('mouseleave', reset);
                gsap.set(el, { x: 0, y: 0 });
            };
        });
    });

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();

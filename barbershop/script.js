/* Leland Barbers
   Menu, opening hours, the before and after switches, the booking form, and a
   scroll driven photo stack. Everything here is an enhancement: with no GSAP,
   or with reduced motion, the page is a plain scrolling document. */

(function () {
    'use strict';

    var root = document.documentElement;
    var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Dropping the class restores every element the CSS was holding hidden.
    if (!hasGsap || reduced) {
        root.classList.remove('js');
    }

    /* ------------------------------------------------------------ masthead */

    var masthead = document.getElementById('masthead');
    var hero = document.querySelector('.hero');

    if (masthead && hero) {
        var flipHeader = function () {
            masthead.classList.toggle('is-light', window.scrollY > hero.offsetHeight - 90);
        };
        window.addEventListener('scroll', flipHeader, { passive: true });
        flipHeader();
    }

    /* ------------------------------------------------------------ mobile menu */

    var toggle = document.getElementById('menu-toggle');
    var nav = document.getElementById('nav');

    if (toggle && nav) {
        var setMenu = function (open) {
            nav.classList.toggle('is-open', open);
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
            document.body.style.overflow = open ? 'hidden' : '';
        };

        toggle.addEventListener('click', function () {
            setMenu(toggle.getAttribute('aria-expanded') !== 'true');
        });

        nav.addEventListener('click', function (event) {
            if (event.target.closest('a')) setMenu(false);
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && nav.classList.contains('is-open')) {
                setMenu(false);
                toggle.focus();
            }
        });

        // a resize back to desktop should not leave the body locked
        window.matchMedia('(min-width: 861px)').addEventListener('change', function (event) {
            if (event.matches) setMenu(false);
        });
    }

    /* ------------------------------------------------------------ opening hours */

    // index is getDay(), so Sunday first. null means closed that day.
    var WEEK = [
        { name: 'Sunday', open: 10, close: 16 },
        { name: 'Monday', open: null, close: null },
        { name: 'Tuesday', open: 10, close: 20 },
        { name: 'Wednesday', open: 10, close: 20 },
        { name: 'Thursday', open: 10, close: 20 },
        { name: 'Friday', open: 10, close: 20 },
        { name: 'Saturday', open: 9, close: 18 }
    ];

    var clock = function (hour) {
        var h = hour % 12;
        return (h === 0 ? 12 : h) + ':00';
    };

    var state = document.getElementById('open-state');
    var label = document.getElementById('open-label');

    if (state && label) {
        var now = new Date();
        var today = WEEK[now.getDay()];
        var minutes = now.getHours() + now.getMinutes() / 60;
        var isOpen = today.open !== null && minutes >= today.open && minutes < today.close;

        if (isOpen) {
            label.textContent = 'Open now until ' + clock(today.close);
        } else if (today.open !== null && minutes < today.open) {
            label.textContent = 'Opens today at ' + clock(today.open);
        } else {
            // walk forward to whichever day opens next
            var next = today;
            for (var i = 1; i <= 7; i++) {
                var day = WEEK[(now.getDay() + i) % 7];
                if (day.open !== null) { next = day; break; }
            }
            label.textContent = 'Closed now. Opens ' + next.name + ' at ' + clock(next.open);
        }

        state.classList.add(isOpen ? 'is-open' : 'is-shut');

        var todayRow = document.querySelector('.hours tr[data-day="' + now.getDay() + '"]');
        if (todayRow) todayRow.classList.add('is-today');
    }

    /* ------------------------------------------------------------ before and after */

    Array.prototype.forEach.call(document.querySelectorAll('[data-cut]'), function (cut) {
        var button = cut.querySelector('.cut-toggle');
        if (!button) return;

        var sync = function () {
            var after = cut.classList.contains('is-after');
            button.setAttribute('aria-pressed', String(after));
            button.setAttribute('aria-label', after ? 'Show the photo from before the cut' : 'Show the photo from after the cut');
        };

        button.addEventListener('click', function () {
            cut.classList.toggle('is-after');
            sync();
        });

        sync();
    });

    /* ------------------------------------------------------------ booking form */

    // Front end demo. There is no server, so it validates and answers inline.
    var form = document.getElementById('booking-form');
    var message = document.getElementById('form-message');

    if (form && message) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();

            var name = document.getElementById('name');
            var phone = document.getElementById('phone');
            var digits = phone.value.replace(/\D/g, '');

            message.classList.remove('is-good');

            if (name.value.trim() === '') {
                message.textContent = 'Add your name so we know who the chair is for.';
                name.focus();
                return;
            }

            if (digits.length < 10) {
                message.textContent = 'We need a phone number we can text you back on.';
                phone.focus();
                return;
            }

            message.textContent = 'Got it. We will text you with a time within the day.';
            message.classList.add('is-good');
            form.reset();
        });
    }

    if (!hasGsap || reduced) return;

    gsap.registerPlugin(ScrollTrigger);

    /* ------------------------------------------------------------ hero */

    var intro = gsap.timeline({ defaults: { ease: 'power3.out' } });

    intro
        .to('.hero-media img', { scale: 1, duration: 1.9, ease: 'power2.out' })
        .to('.mask > span', { y: 0, duration: 1.05, stagger: 0.09 }, 0.25)
        .to('[data-hero]', { opacity: 1, duration: 0.8, stagger: 0.1 }, 0.8);

    /* ------------------------------------------------------------ scroll reveals */

    gsap.utils.toArray('[data-anim]').forEach(function (el) {
        gsap.fromTo(el,
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.9,
                ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 88%', once: true }
            }
        );
    });

    /* ------------------------------------------------------------ responsive motion */

    var mm = gsap.matchMedia();

    mm.add('(min-width: 861px)', function () {
        var stage = document.querySelector('.room-stage');
        var cards = gsap.utils.toArray('.stack-card');

        // The photos deal themselves onto the pile as the section goes past,
        // and each one pushes the card underneath a little further back.
        if (stage && cards.length > 1) {
            var deal = gsap.timeline({
                defaults: { ease: 'none' },
                scrollTrigger: {
                    trigger: stage,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 0.55
                }
            });

            cards.forEach(function (card, i) {
                if (i === 0) return;

                // slides up over the one below at full opacity, so the two
                // never overlap as a cross fade
                deal.fromTo(card,
                    { yPercent: 101 },
                    { yPercent: 0, duration: 1, ease: 'power2.inOut' },
                    i - 1
                );

                // the card underneath settles back a touch as it gets covered
                deal.to(cards[i - 1], { scale: 0.955, yPercent: -2.5, duration: 1 }, i - 1);
            });
        }

        // A slow push on the storefront, so the closing image is not static.
        gsap.fromTo('.visit-media img',
            { scale: 1.12 },
            {
                scale: 1,
                ease: 'none',
                scrollTrigger: { trigger: '.visit', start: 'top bottom', end: 'bottom top', scrub: true }
            }
        );
    });

    // Late loading photos change the layout, so measurements are taken again.
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();

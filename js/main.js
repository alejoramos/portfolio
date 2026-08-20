/* ==========================================================================
   Eddy Ramos, portfolio
   Plain JavaScript, no libraries. Each block below does one thing.
   ========================================================================== */

(function () {
  'use strict';

  var root = document.documentElement;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ------------------------------------------------------------------------
     1. Theme toggle
     The theme itself is set in the <head> so the page never flashes.
     This only handles switching it and keeping the button label truthful.
     ---------------------------------------------------------------------- */

  var themeToggle = document.getElementById('theme-toggle');

  function describeTheme() {
    if (!themeToggle) return;

    var isDark = root.dataset.theme === 'dark';
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  if (themeToggle) {
    describeTheme();

    themeToggle.addEventListener('click', function () {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';

      try {
        localStorage.setItem('theme', root.dataset.theme);
      } catch (error) {
        // Private browsing can block storage. The toggle still works for this visit.
      }

      describeTheme();
    });
  }

  /* ------------------------------------------------------------------------
     2. Mobile menu
     ---------------------------------------------------------------------- */

  var menuToggle = document.getElementById('menu-toggle');
  var mobileMenu = document.getElementById('mobile-menu');

  function openMenu() {
    mobileMenu.hidden = false;
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';

    var firstLink = mobileMenu.querySelector('a');
    if (firstLink) firstLink.focus();
  }

  function closeMenu(returnFocus) {
    mobileMenu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';

    if (returnFocus) menuToggle.focus();
  }

  function menuIsOpen() {
    return mobileMenu && !mobileMenu.hidden;
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      if (menuIsOpen()) {
        closeMenu(true);
      } else {
        openMenu();
      }
    });

    // Tapping a link should navigate and close the menu.
    mobileMenu.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeMenu(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menuIsOpen()) closeMenu(true);
    });

    // Keep tabbing inside the menu while it covers the page.
    mobileMenu.addEventListener('keydown', function (event) {
      if (event.key !== 'Tab') return;

      var links = mobileMenu.querySelectorAll('a');
      var first = links[0];
      var last = links[links.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    // If the window grows past the breakpoint the desktop nav is back, so close.
    window.matchMedia('(min-width: 961px)').addEventListener('change', function (event) {
      if (event.matches && menuIsOpen()) closeMenu(false);
    });
  }

  /* ------------------------------------------------------------------------
     3. Scroll driven UI
     One scroll listener, throttled with requestAnimationFrame, updating:
     the progress rule, the back to top button, and the current nav link.
     ---------------------------------------------------------------------- */

  var progressBar = document.getElementById('scroll-progress');
  var toTopButton = document.getElementById('to-top');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.primary-nav a[href^="#"]'));
  var watchedSections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute('href')); })
    .filter(Boolean);

  var ticking = false;

  function updateOnScroll() {
    var scrolled = window.scrollY;
    var scrollable = document.documentElement.scrollHeight - window.innerHeight;

    if (progressBar) {
      var progress = scrollable > 0 ? Math.min(scrolled / scrollable, 1) : 0;
      progressBar.style.transform = 'scaleX(' + progress + ')';
    }

    if (toTopButton) {
      toTopButton.classList.toggle('is-visible', scrolled > window.innerHeight * 0.75);
    }

    if (watchedSections.length) {
      var current = null;

      watchedSections.forEach(function (section) {
        // a section counts as current once its top passes the header line
        if (section.getBoundingClientRect().top <= 120) current = section.id;
      });

      navLinks.forEach(function (link) {
        var isCurrent = link.getAttribute('href') === '#' + current;
        link.classList.toggle('is-current', isCurrent);

        if (isCurrent) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }

    ticking = false;
  }

  function requestScrollUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateOnScroll);
  }

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate);
  updateOnScroll();

  if (toTopButton) {
    toTopButton.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: reducedMotion.matches ? 'auto' : 'smooth'
      });
    });
  }

  /* ------------------------------------------------------------------------
     4. Reveal on scroll
     ---------------------------------------------------------------------- */

  var revealTargets = document.querySelectorAll('[data-reveal]');

  if (!('IntersectionObserver' in window) || reducedMotion.matches) {
    // No observer or the visitor asked for less motion: show everything now.
    revealTargets.forEach(function (target) { target.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, {
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.08
    });

    revealTargets.forEach(function (target) { revealObserver.observe(target); });
  }

  /* ------------------------------------------------------------------------
     5. Light parallax on the project screenshots
     Desktop only, transform only, and only while the frame is on screen.
     ---------------------------------------------------------------------- */

  var wideScreen = window.matchMedia('(min-width: 961px)');
  var parallaxFrames = [];

  function shiftFrames() {
    parallaxFrames.forEach(function (frame) {
      var box = frame.getBoundingClientRect();
      var middle = box.top + box.height / 2;
      var fromCentre = (middle - window.innerHeight / 2) / window.innerHeight;
      frame.style.setProperty('--shift', (fromCentre * 10).toFixed(1) + 'px');
    });
  }

  var parallaxTicking = false;

  function requestShift() {
    if (parallaxTicking || !parallaxFrames.length) return;
    parallaxTicking = true;
    window.requestAnimationFrame(function () {
      shiftFrames();
      parallaxTicking = false;
    });
  }

  function setUpParallax() {
    var frames = document.querySelectorAll('.section-work .frame');

    if (!wideScreen.matches || reducedMotion.matches || !('IntersectionObserver' in window)) {
      frames.forEach(function (frame) {
        frame.removeAttribute('data-parallax');
        frame.style.removeProperty('--shift');
      });
      parallaxFrames = [];
      return;
    }

    frames.forEach(function (frame) { frame.setAttribute('data-parallax', ''); });

    var visibilityObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var index = parallaxFrames.indexOf(entry.target);

        if (entry.isIntersecting && index === -1) {
          parallaxFrames.push(entry.target);
        } else if (!entry.isIntersecting && index > -1) {
          parallaxFrames.splice(index, 1);
        }
      });

      requestShift();
    }, { rootMargin: '15% 0px' });

    frames.forEach(function (frame) { visibilityObserver.observe(frame); });
  }

  setUpParallax();
  window.addEventListener('scroll', requestShift, { passive: true });
  wideScreen.addEventListener('change', setUpParallax);
  reducedMotion.addEventListener('change', setUpParallax);

  /* ------------------------------------------------------------------------
     6. Contact form
     Validates in the browser, then posts to Formspree with fetch so the
     visitor stays on the page. Without JavaScript the form still submits
     normally, because the action and method are in the HTML.
     ---------------------------------------------------------------------- */

  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  var submitButton = document.getElementById('submit-btn');

  if (form && status && submitButton) {
    var checks = [
      {
        field: 'name',
        isValid: function (value) { return value.trim().length > 0; }
      },
      {
        field: 'email',
        isValid: function (value) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()); }
      },
      {
        field: 'message',
        isValid: function (value) { return value.trim().length > 1; }
      }
    ];

    function showFieldState(check) {
      var input = document.getElementById(check.field);
      var error = document.getElementById(check.field + '-error');
      var wrapper = input.closest('.field');
      var valid = check.isValid(input.value);

      error.hidden = valid;
      input.setAttribute('aria-invalid', String(!valid));

      if (valid) {
        wrapper.removeAttribute('data-invalid');
        input.removeAttribute('aria-describedby');
      } else {
        wrapper.setAttribute('data-invalid', '');
        input.setAttribute('aria-describedby', check.field + '-error');
      }

      return valid;
    }

    // Once a field has been flagged, re-check it as the visitor types.
    checks.forEach(function (check) {
      var input = document.getElementById(check.field);

      input.addEventListener('input', function () {
        if (input.closest('.field').hasAttribute('data-invalid')) showFieldState(check);
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (submitButton.disabled) return; // guard against a double click

      var firstInvalid = null;

      checks.forEach(function (check) {
        var valid = showFieldState(check);
        if (!valid && !firstInvalid) firstInvalid = document.getElementById(check.field);
      });

      if (firstInvalid) {
        status.textContent = 'Please check the highlighted fields.';
        status.dataset.state = 'error';
        firstInvalid.focus();
        return;
      }

      submitButton.disabled = true;
      status.dataset.state = 'sending';
      status.textContent = 'Sending your message.';

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (response) {
          if (!response.ok) throw new Error('Formspree returned ' + response.status);

          form.reset();
          status.dataset.state = 'success';
          status.textContent = 'Thanks, your message is on its way. I will get back to you soon.';
          submitButton.disabled = false;
        })
        .catch(function () {
          status.dataset.state = 'error';
          status.textContent = 'Something went wrong sending that. You can email me directly at eddyalejramos@gmail.com.';
          submitButton.disabled = false;
        });
    });
  }

  /* ------------------------------------------------------------------------
     Certificate lightbox

     The thumbnails are real buttons in the markup, so with no JavaScript they
     simply do nothing rather than looking clickable and failing.
     ------------------------------------------------------------------------ */

  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxClose = document.getElementById('lightbox-close');
  var certButtons = document.querySelectorAll('[data-cert]');

  if (lightbox && lightboxImg && certButtons.length) {
    var lastFocused = null;

    var openLightbox = function (button) {
      var full = button.getAttribute('data-full');
      var thumb = button.querySelector('img');
      if (!full) return;

      lastFocused = button;
      lightboxImg.src = full;
      // The thumbnail's alt already describes the certificate, so reuse it
      // rather than writing the same thing twice in the markup.
      lightboxImg.alt = thumb ? thumb.getAttribute('alt') || '' : '';
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      if (lightboxClose) lightboxClose.focus();
    };

    var closeLightbox = function () {
      lightbox.hidden = true;
      lightboxImg.src = '';
      document.body.style.overflow = '';
      if (lastFocused) lastFocused.focus();
    };

    Array.prototype.forEach.call(certButtons, function (button) {
      button.addEventListener('click', function () { openLightbox(button); });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

    // Clicking the backdrop closes it, clicking the image itself does not.
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !lightbox.hidden) closeLightbox();
    });
  }
})();

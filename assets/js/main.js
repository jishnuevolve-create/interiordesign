/* ==========================================================================
   Oakline Studio — interactions (vanilla JS, no dependencies)

   1. Helpers
   2. Intro + image loading states
   3. Navbar (glass on scroll, active link)
   4. Mobile menu
   5. Hero parallax
   6. Scroll reveal + count-up stats
   7. Carousels (services, testimonials)
   8. Portfolio filter
   9. Contact form validation
   10. Newsletter
   11. Floating action buttons
   ========================================================================== */
(() => {
  'use strict';

  /* 1. HELPERS ============================================================ */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Run a callback at most once per animation frame. */
  const rafThrottle = (fn) => {
    let queued = false;
    return (...args) => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; fn(...args); });
    };
  };

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* 2. INTRO + IMAGE LOADING STATES ======================================= */
  // Kick off the hero's staggered entrance on the next frame.
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-ready')));

  // Fade images in over a soft shimmer skeleton once they've decoded.
  $$('.media').forEach((wrap) => {
    const img = $('img', wrap);
    if (!img) return;
    const done = () => wrap.classList.add('is-loaded');
    if (img.complete && img.naturalWidth) done();
    else {
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    }
  });

  /* 3. NAVBAR ============================================================= */
  const nav = $('#nav');
  const onScrollNav = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
  onScrollNav();
  window.addEventListener('scroll', rafThrottle(onScrollNav), { passive: true });

  // Highlight the nav link for the section currently in view.
  const navLinks = $$('.nav__link');
  const sectionIds = navLinks.map((a) => a.getAttribute('href').slice(1));
  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => {
          const active = a.getAttribute('href') === `#${entry.target.id}`;
          a.toggleAttribute('aria-current', active);
          if (active) a.setAttribute('aria-current', 'true');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* 4. MOBILE MENU ======================================================== */
  const toggle = $('.nav__toggle');
  const menu = $('#mobile-menu');
  let lastFocus = null;

  const focusables = () => $$('a, button', menu).concat(toggle);

  const openMenu = () => {
    lastFocus = document.activeElement;
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('is-open'));
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    document.body.classList.add('menu-open');
    setTimeout(() => $('a', menu)?.focus(), 50);
  };

  const closeMenu = (restoreFocus = true) => {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('menu-open');
    setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 360);
    if (restoreFocus && lastFocus) lastFocus.focus();
  };

  toggle.addEventListener('click', () => (menu.classList.contains('is-open') ? closeMenu() : openMenu()));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => closeMenu(false)));

  document.addEventListener('keydown', (e) => {
    if (!menu.classList.contains('is-open')) return;
    if (e.key === 'Escape') { closeMenu(); return; }
    // Simple focus trap: keep Tab inside the menu + toggle
    if (e.key === 'Tab') {
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Close the overlay if the viewport grows to desktop width.
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (mq) => {
    if (mq.matches && menu.classList.contains('is-open')) closeMenu(false);
  });

  /* 5. HERO PARALLAX ====================================================== */
  const parallax = $('[data-parallax]');
  const hero = $('.hero');
  if (parallax && !reduceMotion) {
    const onParallax = () => {
      const y = window.scrollY;
      if (y > hero.offsetHeight) return;          // off-screen: skip work
      parallax.style.transform = `translate3d(0, ${y * 0.25}px, 0) scale(1.02)`;
    };
    onParallax();
    window.addEventListener('scroll', rafThrottle(onParallax), { passive: true });
  }

  /* 6. SCROLL REVEAL + COUNT-UP =========================================== */
  const countUp = (el) => {
    const target = parseFloat(el.dataset.count);
    if (reduceMotion || Number.isNaN(target)) return;
    const duration = 1600;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 4);   // easeOutQuart
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * ease(p));
      if (p < 1) requestAnimationFrame(tick);
    };
    el.textContent = '0';
    requestAnimationFrame(tick);
  };

  const revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        $$('[data-count]', entry.target).forEach(countUp);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* 7. CAROUSELS ========================================================== */
  $$('[data-carousel]').forEach((track) => {
    const slides = Array.from(track.children);
    const prev = $(`[data-carousel-prev="${track.id}"]`);
    const next = $(`[data-carousel-next="${track.id}"]`);
    const progress = track.dataset.progress ? document.getElementById(track.dataset.progress) : null;
    const dotsWrap = track.dataset.dots ? document.getElementById(track.dataset.dots) : null;

    const gap = () => parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = () => slides[0].getBoundingClientRect().width + gap();
    const maxScroll = () => track.scrollWidth - track.clientWidth;
    const behavior = reduceMotion ? 'auto' : 'smooth';

    const scrollToIndex = (i) => {
      const clamped = Math.max(0, Math.min(i, slides.length - 1));
      track.scrollTo({ left: Math.min(clamped * step(), maxScroll()), behavior });
    };
    const currentIndex = () => Math.round(track.scrollLeft / step());

    // Dots (one per slide)
    let dots = [];
    if (dotsWrap) {
      dots = slides.map((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'dot';
        b.setAttribute('aria-label', `Show testimonial ${i + 1}`);
        b.addEventListener('click', () => scrollToIndex(i));
        dotsWrap.appendChild(b);
        return b;
      });
    }

    const update = () => {
      const max = maxScroll();
      const x = track.scrollLeft;
      if (prev) prev.disabled = x <= 4;
      if (next) next.disabled = x >= max - 4;

      if (progress) {
        const visible = track.clientWidth / track.scrollWidth;
        progress.style.width = `${visible * 100}%`;
        progress.style.transform = `translateX(${max > 0 ? (x / max) * ((1 - visible) / visible) * 100 : 0}%)`;
      }
      if (dots.length) {
        // At the far right, mark the last dot active even if it can't snap to start
        const idx = x >= max - 4 ? slides.length - 1 : currentIndex();
        dots.forEach((d, i) => d.toggleAttribute('aria-current', i === idx));
        dots[idx]?.setAttribute('aria-current', 'true');
      }
    };

    prev?.addEventListener('click', () => scrollToIndex(currentIndex() - 1));
    next?.addEventListener('click', () => scrollToIndex(currentIndex() + 1));
    track.addEventListener('scroll', rafThrottle(update), { passive: true });
    window.addEventListener('resize', rafThrottle(update));

    // Keyboard: arrows / Home / End when the track has focus
    track.addEventListener('keydown', (e) => {
      const map = { ArrowRight: 1, ArrowLeft: -1 };
      if (e.key in map) { e.preventDefault(); scrollToIndex(currentIndex() + map[e.key]); }
      else if (e.key === 'Home') { e.preventDefault(); scrollToIndex(0); }
      else if (e.key === 'End') { e.preventDefault(); scrollToIndex(slides.length - 1); }
    });

    update();
  });

  /* 8. PORTFOLIO FILTER =================================================== */
  const bento = $('#bento');
  const filterBtns = $$('.filter-btn');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      bento.classList.toggle('is-filtered', filter !== 'all');

      $$('.tile', bento).forEach((tile) => {
        const show = filter === 'all' || tile.dataset.category === filter;
        tile.classList.toggle('is-hidden', !show);
        tile.classList.remove('is-entering');
        if (show && !reduceMotion) {
          void tile.offsetWidth;                    // restart animation
          tile.classList.add('is-entering');
        }
        tile.classList.add('is-visible');           // never leave filtered tiles un-revealed
      });
    });
  });

  /* 9. CONTACT FORM ======================================================= */
  const form = $('#contact-form');
  const formCard = $('#form-card');
  const submitBtn = $('#submit-btn');
  const status = $('#form-status');

  const validators = {
    name: (v) => v.trim().length >= 2 || 'Please enter your name (at least 2 characters).',
    phone: (v) => {
      const digits = v.replace(/\D/g, '');
      if (!digits.length) return 'Please enter your phone number so we can call you back.';
      return (digits.length >= 7 && digits.length <= 15) || 'That number looks a little short. Please check it.';
    },
    email: (v) => {
      if (!v.trim()) return 'Please enter your email address.';
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Please enter a valid email, like name@example.com.';
    },
    project_type: (v) => !!v || 'Please choose the type of project.',
  };

  /** Validate a single field; returns true when valid. */
  const validateField = (input) => {
    const rule = validators[input.name];
    if (!rule) return true;
    const field = input.closest('.field');
    const result = rule(input.value);
    const ok = result === true;
    field.classList.toggle('has-error', !ok);
    field.classList.toggle('is-valid', ok);
    input.setAttribute('aria-invalid', String(!ok));
    if (!ok) $('.field__error span', field).textContent = result;
    return ok;
  };

  if (form) {
    const inputs = $$('[name]', form).filter((el) => validators[el.name]);

    // Validate on blur; once a field has shown an error, re-validate as the user types.
    inputs.forEach((input) => {
      input.addEventListener('blur', () => { if (input.value) validateField(input); });
      input.addEventListener('input', () => {
        if (input.closest('.field').classList.contains('has-error')) validateField(input);
      });
      input.addEventListener('change', () => { if (input.tagName === 'SELECT') validateField(input); });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const results = inputs.map(validateField);
      if (results.includes(false)) {
        const firstInvalid = inputs[results.indexOf(false)];
        firstInvalid.focus();
        status.textContent = 'Please fix the highlighted fields.';
        return;
      }
      if (form.elements.company.value) return;              // honeypot tripped — silently drop

      submitBtn.classList.add('is-loading');
      submitBtn.setAttribute('aria-busy', 'true');
      $('.btn__label', submitBtn).textContent = 'Sending…';

      try {
        /* --------------------------------------------------------------
           Replace this simulated request with your real endpoint, e.g.:
           await fetch('https://formspree.io/f/XXXX', {
             method: 'POST', body: new FormData(form),
             headers: { Accept: 'application/json' }
           });
           -------------------------------------------------------------- */
        await new Promise((r) => setTimeout(r, 1200));

        const first = form.elements.name.value.trim().split(' ')[0];
        $('#success-name').textContent = first ? `, ${first}` : '';
        formCard.classList.add('is-success');
        $('#form-success').focus();
      } catch (err) {
        status.textContent = 'Something went wrong. Please try again or call us.';
      } finally {
        submitBtn.classList.remove('is-loading');
        submitBtn.removeAttribute('aria-busy');
        $('.btn__label', submitBtn).textContent = 'Send request';
      }
    });

    $('#form-reset').addEventListener('click', () => {
      form.reset();
      $$('.field', form).forEach((f) => f.classList.remove('has-error', 'is-valid'));
      inputs.forEach((i) => i.removeAttribute('aria-invalid'));
      formCard.classList.remove('is-success');
      form.elements.name.focus();
    });
  }

  /* 10. NEWSLETTER ======================================================== */
  const nlForm = $('#newsletter-form');
  const nlMsg = $('#newsletter-msg');
  nlForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = nlForm.email.value.trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    nlMsg.classList.toggle('is-error', !ok);
    nlMsg.classList.toggle('is-success', ok);
    nlMsg.textContent = ok
      ? 'You’re on the list. Look out for our next issue.'
      : 'Please enter a valid email address.';
    if (ok) nlForm.reset();
    else nlForm.email.focus();
  });

  /* 11. FLOATING ACTION BUTTONS (mobile) ================================== */
  const fab = $('#fab-group');
  const contact = $('#contact');
  if (fab) {
    let contactVisible = false;
    if ('IntersectionObserver' in window && contact) {
      new IntersectionObserver(([entry]) => {
        contactVisible = entry.isIntersecting;
        onFab();
      }, { threshold: 0.2 }).observe(contact);
    }
    // Show after the hero; hide while the contact form is on screen to avoid overlap.
    const onFab = () => {
      const pastHero = window.scrollY > window.innerHeight * 0.6;
      fab.classList.toggle('is-visible', pastHero && !contactVisible);
    };
    onFab();
    window.addEventListener('scroll', rafThrottle(onFab), { passive: true });
  }
})();

/**
 * Abnauona — global behaviour (vanilla JS, no dependencies).
 * Header & mobile drawer · announcement bar · language memory · scroll reveal · stat counters
 * countdown · calendar statuses · fee-table highlight · gallery filter · lightbox · testimonials slider
 * analytics (Google Analytics / Meta Pixel) with consent.
 * Exposes window.ABN (data + pricing helpers) for booking.js / calculator.js / contact.js.
 */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var rtl = root.dir === 'rtl';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dataEl = $('#abn-data');
  var D = dataEl ? JSON.parse(dataEl.textContent) : {};
  var S = D.strings || {};

  /* ---------------------------------------------------------------- helpers */
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
    remove: function (k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };
  var fmt = function (n) { return Number(n || 0).toLocaleString('en-US'); };
  var currency = (S.common && S.common.currency) || 'AED';
  var money = function (n) { return D.lang === 'ar' ? fmt(n) + ' ' + currency : currency + ' ' + fmt(n); };
  var moneyHtml = function (n) {
    var a = '<span class="amt">' + fmt(n) + '</span>';
    var c = '<span class="cur">' + currency + '</span>';
    return D.lang === 'ar' ? a + ' ' + c : c + ' ' + a;
  };
  var escapeHtml = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var interpolate = function (str, vars) {
    return String(str).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] !== undefined ? vars[k] : m; });
  };

  /** Price calculation shared by the booking wizard and the fee calculator. */
  function quote(sel) {
    var f = D.fees;
    if (!f) return null;
    var stage = null;
    for (var i = 0; i < f.stages.length; i++) if (f.stages[i].id === sel.stage) stage = f.stages[i];
    var zone = null;
    for (var j = 0; j < f.transport.length; j++) if (f.transport[j].id === sel.transport) zone = f.transport[j];
    var q = {
      stage: stage,
      tuition: stage && sel.track ? stage[sel.track] : 0,
      books: stage ? stage.booksPerTerm * (sel.books === 'one' ? 1 : 2) : 0,
      registration: f.extras.registration,
      uniform: sel.uniform ? f.extras.uniform : 0,
      busBooking: zone ? f.extras.busBooking : 0,
      transport: zone ? zone.price : 0
    };
    q.total = q.tuition + q.books + q.registration + q.uniform + q.busBooking + q.transport;
    return q;
  }

  /* ---------------------------------------------------------------- analytics */
  var A = D.analytics || {};
  var analyticsLoaded = false;
  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;
    if (A.googleAnalyticsId) {
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(A.googleAnalyticsId);
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', A.googleAnalyticsId, { anonymize_ip: true });
    }
    if (A.metaPixelId) {
      /* Meta Pixel base code */
      (function (f, b, e, v, n, t, s) {
        if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
        t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', A.metaPixelId);
      window.fbq('track', 'PageView');
    }
  }
  /** Track a conversion in whichever tools are loaded (no-op otherwise). */
  function track(event, params) {
    if (window.gtag) window.gtag('event', event, params || {});
    if (window.fbq) window.fbq('track', event === 'generate_lead' ? 'Lead' : 'Contact', params || {});
  }
  if (A.googleAnalyticsId || A.metaPixelId) {
    var consent = store.get('abn-consent');
    var banner = $('.consent');
    if (!A.requireConsent || consent === 'granted') loadAnalytics();
    else if (!consent && banner) {
      banner.hidden = false;
      banner.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-consent]');
        if (!btn) return;
        var v = btn.getAttribute('data-consent') === 'grant' ? 'granted' : 'denied';
        store.set('abn-consent', v);
        banner.hidden = true;
        if (v === 'granted') loadAnalytics();
      });
    }
  }

  window.ABN = {
    data: D, $: $, $$: $$, store: store, fmt: fmt, money: money, moneyHtml: moneyHtml,
    escapeHtml: escapeHtml, interpolate: interpolate, quote: quote, track: track, rtl: rtl
  };

  /* ---------------------------------------------------------------- header */
  var header = $('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* mobile drawer */
  var nav = $('#main-nav');
  var toggle = $('.nav-toggle');
  var overlay = $('.nav-overlay');
  if (nav && toggle) {
    var mobile = window.matchMedia('(max-width: 1199px)');
    var lastFocus = null;
    var openNav = function () {
      lastFocus = document.activeElement;
      nav.classList.add('is-open');
      overlay.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      root.classList.add('no-scroll');
      var first = $('.nav-close', nav);
      if (first) setTimeout(function () { first.focus(); }, 50);
    };
    var closeNav = function () {
      if (!nav.classList.contains('is-open')) return;
      nav.classList.remove('is-open');
      overlay.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      root.classList.remove('no-scroll');
      if (lastFocus && mobile.matches) lastFocus.focus();
    };
    toggle.addEventListener('click', openNav);
    overlay.addEventListener('click', closeNav);
    $('.nav-close', nav).addEventListener('click', closeNav);
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) closeNav(); });
    document.addEventListener('keydown', function (e) {
      if (!nav.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeNav();
      if (e.key === 'Tab') {
        var f = $$('a, button', nav).filter(function (el) { return el.offsetParent !== null; });
        var first = f[0];
        var last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    (mobile.addEventListener ? mobile.addEventListener.bind(mobile, 'change') : mobile.addListener.bind(mobile))(function () { closeNav(); });
  }

  /* announcement bar */
  var ann = $('.announcement');
  if (ann) {
    $('.announcement-close', ann).addEventListener('click', function () {
      store.set('abn-ann', ann.getAttribute('data-announcement'));
      root.classList.add('ann-closed');
    });
  }

  /* remember explicit language choice */
  $$('[data-lang]').forEach(function (a) {
    a.addEventListener('click', function () { store.set('abn-lang', a.getAttribute('data-lang')); });
  });

  /* ---------------------------------------------------------------- reveal on scroll */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* stat counters */
  var counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !reduceMotion) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        var el = en.target;
        var to = Number(el.getAttribute('data-count'));
        var t0 = performance.now();
        var dur = 1400;
        var step = function (t) {
          var p = Math.min(1, (t - t0) / dur);
          el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(step);
        };
        el.textContent = '0';
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------------------------------------------------------------- calendar */
  var DAY = 86400000;
  var eventStart = function (date) { return new Date(date + 'T00:00:00' + (D.timezoneOffset || '+04:00')).getTime(); };
  var now = Date.now();
  var events = (D.events || []).slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });

  // Status badges on every timeline list (past / today / next)
  $$('.timeline, .tl-compact').forEach(function (list) {
    var nextMarked = false;
    $$('[data-event-date]', list).sort(function (a, b) {
      return a.getAttribute('data-event-date') < b.getAttribute('data-event-date') ? -1 : 1;
    }).forEach(function (el) {
      var start = eventStart(el.getAttribute('data-event-date'));
      var badge = $('.tl-status', el);
      var label = '';
      if (now >= start + DAY) { el.classList.add('is-past'); label = S.calendar.past; }
      else if (now >= start) { el.classList.add('is-today'); label = S.calendar.today; nextMarked = true; }
      else if (!nextMarked) { el.classList.add('is-next'); label = S.calendar.upcoming; nextMarked = true; }
      if (badge && label) { badge.textContent = label; badge.hidden = false; }
    });
  });

  // Countdown → next term start, otherwise next event
  var countdowns = $$('[data-countdown]');
  if (countdowns.length) {
    var upcoming = events.filter(function (e) { return eventStart(e.date) > now; });
    var target = upcoming.filter(function (e) { return e.type === 'start'; })[0] || upcoming[0];
    var dateFmt = new Intl.DateTimeFormat(D.intl, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Dubai' });
    countdowns.forEach(function (cd) {
      if (!target) {
        $('.cd-units', cd).hidden = true;
        $('.cd-heading', cd).hidden = true;
        $('.cd-done', cd).hidden = false;
        return;
      }
      $('[data-cd-title]', cd).textContent = target.title;
      $('[data-cd-date]', cd).textContent = dateFmt.format(new Date(eventStart(target.date)));
    });
    if (target) {
      var goal = eventStart(target.date);
      var pad = function (n) { return (n < 10 ? '0' : '') + n; };
      var tick = function () {
        var diff = Math.max(0, goal - Date.now());
        var parts = {
          days: Math.floor(diff / DAY),
          hours: Math.floor(diff / 3600000) % 24,
          minutes: Math.floor(diff / 60000) % 60,
          seconds: Math.floor(diff / 1000) % 60
        };
        countdowns.forEach(function (cd) {
          Object.keys(parts).forEach(function (k) { $('[data-cd="' + k + '"]', cd).textContent = k === 'days' ? parts[k] : pad(parts[k]); });
        });
      };
      tick();
      setInterval(tick, 1000);
    }
  }

  /* ---------------------------------------------------------------- fees table highlight */
  $$('[data-fees-table]').forEach(function (wrap) {
    wrap.addEventListener('click', function (e) {
      var b = e.target.closest('[data-highlight-btn]');
      if (!b) return;
      wrap.setAttribute('data-highlight', b.getAttribute('data-highlight-btn'));
      $$('[data-highlight-btn]', wrap).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    });
  });

  /* ---------------------------------------------------------------- gallery filter */
  var filters = $('.gallery-filters');
  if (filters) {
    filters.addEventListener('click', function (e) {
      var b = e.target.closest('[data-filter]');
      if (!b) return;
      var cat = b.getAttribute('data-filter');
      $$('[data-filter]', filters).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      $$('.gallery-item').forEach(function (it) { it.hidden = cat !== 'all' && it.getAttribute('data-cat') !== cat; });
    });
  }

  /* ---------------------------------------------------------------- lightbox */
  var lb = $('#lightbox');
  if (lb && typeof lb.showModal === 'function') {
    var lbImg = $('.lb-img', lb);
    var lbCap = $('.lb-caption', lb);
    var lbCount = $('.lb-counter', lb);
    var group = [];
    var idx = 0;
    var opener = null;
    var show = function (i) {
      idx = (i + group.length) % group.length;
      var a = group[idx];
      var cap = a.getAttribute('data-caption') || '';
      lbImg.src = a.getAttribute('href');
      lbImg.alt = cap;
      lbCap.textContent = cap;
      lbCount.textContent = interpolate((S.gallery && S.gallery.counter) || '{i} / {n}', { i: idx + 1, n: group.length });
    };
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-lightbox]');
      if (!a) return;
      e.preventDefault();
      var name = a.getAttribute('data-lightbox');
      group = $$('a[data-lightbox="' + name + '"]').filter(function (x) { return !x.closest('[hidden]'); });
      opener = a;
      lb.classList.toggle('is-single', group.length < 2);
      show(group.indexOf(a));
      lb.showModal();
      root.classList.add('no-scroll');
    });
    $('.lb-prev', lb).addEventListener('click', function () { show(idx - 1); });
    $('.lb-next', lb).addEventListener('click', function () { show(idx + 1); });
    $('.lb-close', lb).addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-stage')) lb.close(); });
    lb.addEventListener('close', function () {
      root.classList.remove('no-scroll');
      lbImg.removeAttribute('src');
      if (opener) opener.focus();
    });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') show(idx + (rtl ? -1 : 1));
      if (e.key === 'ArrowLeft') show(idx + (rtl ? 1 : -1));
    });
    var sx = null;
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (sx === null || group.length < 2) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 45) show(idx + ((dx < 0) !== rtl ? 1 : -1));
      sx = null;
    });
  }

  /* ---------------------------------------------------------------- testimonials slider */
  $$('[data-slider]').forEach(function (slider) {
    var track = $('.slider-track', slider);
    var slides = $$('.slide', slider);
    var prev = $('[data-slider-prev]', slider);
    var next = $('[data-slider-next]', slider);
    var dotsWrap = $('.slider-dots', slider);
    var index = 0;
    var paused = false;
    var perView = function () { return parseInt(getComputedStyle(slider).getPropertyValue('--per-view'), 10) || 1; };
    var maxIndex = function () { return Math.max(0, slides.length - perView()); };

    var buildDots = function () {
      dotsWrap.innerHTML = '';
      for (var i = 0; i <= maxIndex(); i++) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'slider-dot';
        b.setAttribute('aria-label', interpolate(S.testimonials.goTo, { n: i + 1 }));
        b.addEventListener('click', go.bind(null, i));
        dotsWrap.appendChild(b);
      }
    };
    function go(i) {
      var pv = perView();
      index = Math.max(0, Math.min(i, maxIndex()));
      track.style.transform = 'translateX(' + ((rtl ? 1 : -1) * index * 100 / pv) + '%)';
      $$('.slider-dot', dotsWrap).forEach(function (d, k) { d.setAttribute('aria-current', String(k === index)); });
      prev.disabled = index === 0;
      next.disabled = index === maxIndex();
      slides.forEach(function (s, k) {
        var visible = k >= index && k < index + pv;
        s.setAttribute('aria-hidden', String(!visible));
        if ('inert' in s) s.inert = !visible;
      });
    }
    prev.addEventListener('click', function () { go(index - 1); });
    next.addEventListener('click', function () { go(index + 1); });
    var lastPv = perView();
    window.addEventListener('resize', function () {
      if (perView() !== lastPv) { lastPv = perView(); buildDots(); go(index); }
    });
    // swipe
    var startX = null;
    track.addEventListener('pointerdown', function (e) { startX = e.clientX; });
    track.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 40) go(index + ((dx < 0) !== rtl ? 1 : -1));
      startX = null;
    });
    // gentle autoplay (paused on hover/focus, off for reduced motion)
    slider.addEventListener('mouseenter', function () { paused = true; });
    slider.addEventListener('mouseleave', function () { paused = false; });
    slider.addEventListener('focusin', function () { paused = true; });
    slider.addEventListener('focusout', function () { paused = false; });
    if (!reduceMotion) {
      setInterval(function () {
        if (paused || document.hidden) return;
        var r = slider.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        go(index >= maxIndex() ? 0 : index + 1);
      }, 7000);
    }
    buildDots();
    go(0);
  });
})();

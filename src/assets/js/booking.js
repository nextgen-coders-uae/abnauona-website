/**
 * Booking wizard (4 steps) → preliminary invoice → WhatsApp message.
 * - State is saved to localStorage on every change (expires after booking.storageDays) and survives
 *   reloads and language switches (field values are language-neutral ids).
 * - Prefill from the URL: ?stage=p13&track=languages&books=one&transport=dubai&uniform=0
 */
(function () {
  'use strict';
  var ABN = window.ABN;
  var form = document.getElementById('booking-form');
  if (!ABN || !form) return;

  var $ = ABN.$;
  var $$ = ABN.$$;
  var D = ABN.data;
  var L = D.labels;
  var B = L.booking;
  var E = B.errors;
  var KEY = 'abn-booking';
  var TOTAL = 4;
  var DAY = 86400000;

  var panels = $$('.wizard-panel', form);
  var indicators = $$('[data-step-indicator]', form);
  var progress = $('.wizard-progress', form);
  var prevBtn = $('[data-prev]', form);
  var nextBtn = $('[data-next]', form);
  var alertBox = $('.form-alert', form);
  var announce = $('[data-step-announce]', form);
  var sendBtn = $('[data-send]', form);

  var step = 1;
  var maxReached = 1;
  var orderId = null;

  /* ------------------------------------------------------------ values & storage */
  function values() {
    var v = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.disabled) return;
      if (el.type === 'radio') { if (el.checked) v[el.name] = el.value; else if (!(el.name in v)) v[el.name] = ''; }
      else if (el.type === 'checkbox') v[el.name] = el.checked;
      else v[el.name] = el.value.trim();
    });
    return v;
  }

  function apply(fields) {
    Object.keys(fields || {}).forEach(function (name) {
      var el = form.elements[name];
      if (!el) return;
      var val = fields[name];
      if (el.type === 'checkbox') el.checked = !!val;
      else if (typeof val === 'string') el.value = val; // works for radio groups (RadioNodeList)
    });
  }

  function save() {
    ABN.store.set(KEY, JSON.stringify({ v: 1, savedAt: Date.now(), step: step, maxReached: maxReached, orderId: orderId, fields: values() }));
  }

  function restore() {
    var saved = null;
    try { saved = JSON.parse(ABN.store.get(KEY)); } catch (e) { saved = null; }
    if (!saved || saved.v !== 1) return;
    if (Date.now() - saved.savedAt > (D.booking.storageDays || 3) * DAY) { ABN.store.remove(KEY); return; }
    apply(saved.fields);
    step = saved.step || 1;
    maxReached = saved.maxReached || step;
    orderId = saved.orderId || null;
  }

  function prefillFromUrl() {
    var p = new URLSearchParams(location.search);
    if (!Array.from(p.keys()).length) return false;
    var map = {
      stage: D.fees.stages.map(function (s) { return s.id; }),
      track: ['arabic', 'languages'],
      books: ['one', 'both'],
      transport: ['none'].concat(D.fees.transport.map(function (z) { return z.id; }))
    };
    Object.keys(map).forEach(function (k) {
      var val = p.get(k);
      if (val && map[k].indexOf(val) > -1) form.elements[k].value = val;
    });
    if (p.has('uniform')) form.elements.uniform.checked = p.get('uniform') !== '0';
    history.replaceState(null, '', location.pathname + location.hash);
    return true;
  }

  /* ------------------------------------------------------------ labels */
  var stageName = function (id) { return L.stages[id] || ''; };
  var trackName = function (id) { return L.tracks[id] || ''; };
  var zoneName = function (id) { return L.zones[id] || ''; };
  var formatDob = function (iso) { var p = (iso || '').split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso; };
  var digits = function (s) { return String(s || '').replace(/\D/g, '').replace(/^0+/, ''); };
  var phoneFull = function (v) { return v.cc + ' ' + digits(v.phone); };

  function currentQuote(v) {
    return ABN.quote({ stage: v.stage, track: v.track, books: v.books, transport: v.transport === 'none' ? null : v.transport, uniform: v.uniform });
  }

  /* ------------------------------------------------------------ validation */
  var NAME_RE = /^[\p{L}\p{M}\s'’.\-]+$/u;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var validName = function (s) {
    if (!s || !NAME_RE.test(s)) return false;
    var parts = s.split(/\s+/).filter(Boolean);
    return parts.length >= 2 && parts.every(function (w) { return w.replace(/[.'’\-]/g, '').length >= 2; });
  };

  function fieldTarget(name) {
    var el = form.elements[name];
    if (!el) return null;
    if (el.length && el[0] && el[0].type === 'radio') return el[0].closest('fieldset');
    return el;
  }

  function setError(name, msg) {
    var box = document.getElementById('err-' + name);
    var target = fieldTarget(name);
    if (box) { box.textContent = msg || ''; box.hidden = !msg; }
    if (target) {
      if (msg) target.setAttribute('aria-invalid', 'true');
      else target.removeAttribute('aria-invalid');
    }
  }

  function checkStep(n, v) {
    var errs = {};
    if (n === 1) {
      if (!v.stage) errs.stage = E.stage;
      if (!v.track) errs.track = E.track;
    }
    if (n === 3) {
      if (!v.studentName) errs.studentName = E.required;
      else if (!validName(v.studentName)) errs.studentName = E.name;

      if (!v.dob) errs.dob = E.dob;
      else {
        var d = new Date(v.dob + 'T00:00:00');
        var age = (Date.now() - d.getTime()) / (365.25 * DAY);
        if (isNaN(age)) errs.dob = E.dob;
        else if (age < 2 || age > 20) errs.dob = E.dobRange;
      }
      if (!v.gender) errs.gender = E.gender;

      if (!v.guardianName) errs.guardianName = E.required;
      else if (!validName(v.guardianName)) errs.guardianName = E.name;

      var ph = digits(v.phone);
      if (!v.phone) errs.phone = E.required;
      else if (!/^[\d\s\-()+]+$/.test(v.phone) || ph.length < 7 || ph.length > 12) errs.phone = E.phone;

      if (v.email && !EMAIL_RE.test(v.email)) errs.email = E.email;
      if (!v.emirate) errs.emirate = E.emirate;
    }
    return errs;
  }

  var STEP_FIELDS = { 1: ['stage', 'track'], 3: ['studentName', 'dob', 'gender', 'guardianName', 'phone', 'email', 'emirate'] };

  /** Validate step n and show/clear its errors. Returns true when valid. */
  function validateStep(n, show) {
    var errs = checkStep(n, values());
    var fields = STEP_FIELDS[n] || [];
    if (show) fields.forEach(function (f) { setError(f, errs[f]); });
    var bad = fields.filter(function (f) { return errs[f]; });
    if (show) {
      alertBox.hidden = !bad.length;
      if (bad.length) {
        var t = fieldTarget(bad[0]);
        var focusEl = t && t.tagName === 'FIELDSET' ? $('input', t) : t;
        if (focusEl) {
          focusEl.focus({ preventScroll: true });
          (t || focusEl).scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
    return !bad.length;
  }

  /* ------------------------------------------------------------ rendering */
  function makeOrderId() {
    var d = new Date();
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var rnd = window.crypto && crypto.getRandomValues ? crypto.getRandomValues(new Uint32Array(1))[0] % 9000 + 1000 : Math.floor(Math.random() * 9000) + 1000;
    return (D.orderPrefix || 'ABN') + '-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' + rnd;
  }

  function dl(target, rows) {
    target.innerHTML = rows.filter(function (r) { return r[1]; }).map(function (r) {
      return '<div><dt>' + ABN.escapeHtml(r[0]) + '</dt><dd>' + ABN.escapeHtml(r[1]) + '</dd></div>';
    }).join('');
  }

  function invoiceRows(v, q) {
    var rows = [
      { label: B.tuition, sub: stageName(v.stage) + ' · ' + trackName(v.track), amount: q.tuition },
      { label: B.books, sub: v.books === 'one' ? B.booksOneShort : B.booksBothShort, amount: q.books },
      { label: B.registration, amount: q.registration },
      { label: B.uniform, amount: q.uniform, zero: !v.uniform }
    ];
    if (q.transport) {
      rows.push({ label: B.transport, sub: zoneName(v.transport), amount: q.transport });
      rows.push({ label: B.busBooking, amount: q.busBooking });
    } else {
      rows.push({ label: B.transport, amount: 0, zero: true });
    }
    return rows;
  }

  function updateLive() {
    var v = values();
    var q = currentQuote(v);
    form.setAttribute('data-track', v.track || '');

    // step 1 price preview
    var tuitionEl = $('[data-tuition]', form);
    tuitionEl.innerHTML = v.stage && v.track ? ABN.moneyHtml(q.tuition) : ABN.escapeHtml(B.pickStage);

    // step 2 helpers
    var booksHint = $('[data-books-hint]', form);
    if (q.stage) {
      var n = v.books === 'one' ? 1 : 2;
      booksHint.textContent = ABN.money(q.stage.booksPerTerm) + ' × ' + n + ' = ' + ABN.money(q.books);
    }
    $('[data-installments-hint]', form).hidden = v.payment !== 'installments';
    $('[data-siblings-note]', form).hidden = !(Number(v.siblings) > 0);

    // live total (aside / mobile bar)
    var stageLine = $('[data-live-stage]');
    var linesEl = $('[data-live-lines]');
    var totalEl = $('[data-live-total]');
    if (v.stage) {
      stageLine.textContent = stageName(v.stage) + (v.track ? ' · ' + trackName(v.track) : '');
      var rows = invoiceRows(v, q).filter(function (r) { return r.amount; });
      linesEl.innerHTML = rows.map(function (r) {
        return '<div><dt>' + ABN.escapeHtml(r.label) + '</dt><dd>' + ABN.money(r.amount) + '</dd></div>';
      }).join('');
      totalEl.innerHTML = v.track ? ABN.moneyHtml(q.total) : '—';
    } else {
      stageLine.textContent = B.pickStage;
      linesEl.innerHTML = '';
      totalEl.textContent = '—';
    }
  }

  function buildMessage(v, q) {
    var W = B.wa;
    var none = W.none;
    var lines = [
      W.title,
      W.sep,
      (v.gender === 'female' ? W.studentFemale : W.studentMale) + ': ' + v.studentName,
      W.dob + ': ' + formatDob(v.dob),
      W.gender + ': ' + (v.gender === 'female' ? B.female : B.male),
      W.stage + ': ' + stageName(v.stage) + ' | ' + W.track + ': ' + trackName(v.track)
    ];
    if (v.prevSchool) lines.push(W.prevSchool + ': ' + v.prevSchool);
    lines.push(
      W.sep,
      W.tuition + ': ' + ABN.money(q.tuition),
      W.books + ': ' + ABN.money(q.books) + ' (' + (v.books === 'one' ? B.booksOneShort : B.booksBothShort) + ')',
      W.registration + ': ' + ABN.money(q.registration),
      W.uniform + ': ' + (v.uniform ? ABN.money(q.uniform) : B.notIncluded),
      W.transport + ': ' + (q.transport
        ? zoneName(v.transport) + ' ' + ABN.money(q.transport) + ' + ' + W.busBooking + ' ' + ABN.money(q.busBooking)
        : none),
      W.sep,
      W.total + ': ' + ABN.money(q.total),
      W.payment + ': ' + (v.payment === 'installments' ? B.installments : B.cash),
      W.siblings + ': ' + (v.siblings || '0'),
      W.sep,
      W.guardian + ': ' + v.guardianName,
      W.phone + ': ' + phoneFull(v)
    );
    if (v.email) lines.push(W.email + ': ' + v.email);
    lines.push(
      W.area + ': ' + [L.emirates[v.emirate], v.area].filter(Boolean).join(' – '),
      W.notes + ': ' + (v.notes || none),
      W.orderId + ': ' + orderId
    );
    return lines.join('\n');
  }

  function renderSummary() {
    if (!orderId) orderId = makeOrderId();
    var v = values();
    var q = currentQuote(v);
    $('[data-order-id]', form).textContent = orderId;

    dl($('[data-summary="package"]', form), [
      [B.stage, stageName(v.stage)],
      [B.track, trackName(v.track)],
      [B.transport, v.transport && v.transport !== 'none' ? zoneName(v.transport) : B.wa.none],
      [B.books, v.books === 'one' ? B.booksOneShort : B.booksBothShort],
      [B.uniform, v.uniform ? D.strings.common.yes : D.strings.common.no],
      [B.payment, v.payment === 'installments' ? B.installments : B.cash]
    ]);
    dl($('[data-summary="student"]', form), [
      [B.studentName, v.studentName],
      [B.dob, formatDob(v.dob)],
      [B.gender, v.gender === 'female' ? B.female : B.male],
      [B.prevSchool, v.prevSchool]
    ]);
    dl($('[data-summary="guardian"]', form), [
      [B.guardianName, v.guardianName],
      [B.phone, '⁦' + phoneFull(v) + '⁩'],
      [B.email, v.email],
      [B.emirate, [L.emirates[v.emirate], v.area].filter(Boolean).join(' – ')],
      [B.siblings, String(v.siblings || 0)]
    ]);

    $('[data-invoice]', form).innerHTML = invoiceRows(v, q).map(function (r) {
      return '<tr' + (r.zero ? ' class="is-zero"' : '') + '><th scope="row">' + ABN.escapeHtml(r.label) +
        (r.sub ? '<small>' + ABN.escapeHtml(r.sub) + '</small>' : '') + '</th><td>' +
        (r.zero ? ABN.escapeHtml(B.notIncluded) : ABN.moneyHtml(r.amount)) + '</td></tr>';
    }).join('');
    $('[data-invoice-total]', form).innerHTML = ABN.moneyHtml(q.total);

    sendBtn.href = 'https://wa.me/' + D.whatsapp + '?text=' + encodeURIComponent(buildMessage(v, q));
  }

  /* ------------------------------------------------------------ navigation */
  function goTo(n, opts) {
    opts = opts || {};
    step = Math.max(1, Math.min(TOTAL, n));
    maxReached = Math.max(maxReached, step);
    panels.forEach(function (p) { p.hidden = Number(p.getAttribute('data-panel')) !== step; });
    indicators.forEach(function (li) {
      var i = Number(li.getAttribute('data-step-indicator'));
      var btn = $('.wp-btn', li);
      li.classList.toggle('is-current', i === step);
      li.classList.toggle('is-done', i < step || (i <= maxReached && i !== step));
      btn.disabled = i > maxReached || i === step;
      if (i === step) btn.setAttribute('aria-current', 'step'); else btn.removeAttribute('aria-current');
    });
    progress.style.setProperty('--progress', String((step - 1) / (TOTAL - 1)));
    prevBtn.hidden = step === 1;
    nextBtn.hidden = step === TOTAL;
    alertBox.hidden = true;
    announce.textContent = ABN.interpolate(B.stepOf, { n: step, total: TOTAL }) + ' — ' + B.steps[step - 1].title;
    if (step === TOTAL) renderSummary();
    save();
    if (opts.focus !== false) {
      var top = form.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.6) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      var title = $('.panel-title', panels[step - 1]);
      title.setAttribute('tabindex', '-1');
      title.focus({ preventScroll: true });
    }
  }

  /** Move forward to `target`, validating every step on the way. */
  function advanceTo(target) {
    for (var s = step; s < target; s++) {
      if (!validateStep(s, false)) {
        if (s !== step) goTo(s, { focus: false });
        validateStep(s, true);
        return;
      }
    }
    goTo(target);
  }

  nextBtn.addEventListener('click', function () { advanceTo(step + 1); });
  prevBtn.addEventListener('click', function () { goTo(step - 1); });
  form.addEventListener('submit', function (e) { e.preventDefault(); if (step < TOTAL) advanceTo(step + 1); });
  form.addEventListener('click', function (e) {
    var g = e.target.closest('[data-goto]');
    if (!g || g.disabled) return;
    var n = Number(g.getAttribute('data-goto'));
    if (n < step) goTo(n); else if (n > step) advanceTo(n);
  });

  form.addEventListener('input', onChange);
  form.addEventListener('change', onChange);
  function onChange(e) {
    var name = e.target.name;
    if (name) {
      var box = document.getElementById('err-' + name);
      if (box && !box.hidden) {
        var errs = checkStep(step, values());
        setError(name, errs[name]);
      }
    }
    updateLive();
    if (step === TOTAL) renderSummary();
    save();
  }

  $('[data-reset]', form).addEventListener('click', function () {
    if (!window.confirm(B.resetConfirm)) return;
    form.reset();
    ABN.store.remove(KEY);
    orderId = null;
    maxReached = 1;
    Object.keys(STEP_FIELDS).forEach(function (s) { STEP_FIELDS[s].forEach(function (f) { setError(f, ''); }); });
    updateLive();
    goTo(1);
  });

  /* ------------------------------------------------------------ send */
  sendBtn.addEventListener('click', function (e) {
    var v = values();
    for (var s = 1; s < TOTAL; s++) {
      if (!validateStep(s, false)) {
        e.preventDefault();
        goTo(s, { focus: false });
        validateStep(s, true);
        return;
      }
    }
    renderSummary();
    var q = currentQuote(v);
    try {
      sessionStorage.setItem('abn-last-order', JSON.stringify({ id: orderId, url: sendBtn.href, student: v.studentName }));
    } catch (e) { /* ignore */ }
    ABN.track('generate_lead', { value: q.total, currency: 'AED', stage: v.stage, track: v.track });
    ABN.store.remove(KEY);
    setTimeout(function () { location.href = D.urls.thanks; }, 700);
  });

  /* ------------------------------------------------------------ init */
  var dob = form.elements.dob;
  if (dob) dob.max = new Date().toISOString().slice(0, 10);
  restore();
  var prefilled = prefillFromUrl();
  if (prefilled) step = 1;
  // never resume on a step whose previous steps are incomplete
  for (var s = 1; s < step; s++) if (!validateStep(s, false)) { step = s; break; }
  updateLive();
  goTo(step, { focus: false });
})();

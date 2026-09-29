'use strict';
const c = require('../components');

module.exports = (ctx) => {
  const { t, raw, icon, data, esc, moneyHtml, money } = ctx;
  const steps = raw('booking.steps');
  const busFee = data.fees.extras.busBooking;

  const err = (id) => `<p class="field-error" id="err-${id}" hidden></p>`;
  const opt = `<span class="opt">(${t('booking.optional')})</span>`;
  const req = `<span class="req" aria-hidden="true">*</span>`;

  /* ---------------------------------------------------------- progress bar */
  const progress = `
<ol class="wizard-progress">
  ${steps.map((s, i) => `
  <li class="wp-step${i === 0 ? ' is-current' : ''}" data-step-indicator="${i + 1}">
    <button type="button" class="wp-btn" data-goto="${i + 1}" ${i === 0 ? 'aria-current="step"' : 'disabled'}>
      ${c.lotusColumn('wp-col', { short: true })}
      <span class="wp-text"><span class="wp-num">${i + 1}</span><span class="wp-title">${esc(s.title)}</span><span class="wp-sub">${esc(s.sub)}</span></span>
    </button>
  </li>`).join('')}
</ol>`;

  /* ---------------------------------------------------------- step 1 */
  const programIcon = Object.fromEntries(data.programs.map((p) => [p.id, p.icon]));
  const step1 = `
<section class="wizard-panel" data-panel="1" aria-labelledby="panel1-title">
  <h2 class="panel-title" id="panel1-title">${icon('scroll')}${t('booking.stageHeading')}</h2>
  <fieldset class="choice-grid choice-grid--stages" aria-describedby="err-stage">
    <legend class="sr-only">${t('booking.stageHeading')}</legend>
    ${data.fees.stages.map((s) => `
    <label class="choice-card">
      <input type="radio" name="stage" value="${s.id}">
      <span class="choice-body">
        <span class="choice-icon">${icon(programIcon[s.program] || 'book')}</span>
        <strong class="choice-title">${esc(raw(`stages.${s.id}.name`))}</strong>
        <small class="choice-sub">${esc(raw(`stages.${s.id}.grades`))}</small>
        <span class="choice-prices">
          <span data-price-track="arabic"><small>${t('tracks.arabic')}</small><b>${moneyHtml(s.arabic)}</b></span>
          <span data-price-track="languages"><small>${t('tracks.languages')}</small><b>${moneyHtml(s.languages)}</b></span>
        </span>
      </span>
      <span class="choice-check" aria-hidden="true">${icon('check')}</span>
    </label>`).join('')}
  </fieldset>
  ${err('stage')}

  <h3 class="panel-subtitle">${t('booking.trackHeading')}</h3>
  <fieldset class="segmented segmented--lg" aria-describedby="err-track">
    <legend class="sr-only">${t('booking.trackHeading')}</legend>
    <label><input type="radio" name="track" value="arabic"><span>${icon('book')}${t('tracks.arabic')}</span></label>
    <label><input type="radio" name="track" value="languages"><span>${icon('globe')}${t('tracks.languages')}</span></label>
  </fieldset>
  ${err('track')}

  <div class="price-preview" aria-live="polite">
    <span class="price-preview-label">${icon('wallet')}${t('booking.tuitionLabel')}</span>
    <strong class="price-preview-value" data-tuition>${t('booking.pickStage')}</strong>
  </div>
</section>`;

  /* ---------------------------------------------------------- step 2 */
  const zones = [{ id: 'none', price: 0 }, ...data.fees.transport];
  const step2 = `
<section class="wizard-panel" data-panel="2" aria-labelledby="panel2-title" hidden>
  <h2 class="panel-title" id="panel2-title">${icon('bus')}${t('booking.transportHeading')}</h2>
  <fieldset class="choice-grid choice-grid--zones">
    <legend class="sr-only">${t('booking.transportHeading')}</legend>
    ${zones.map((z) => `
    <label class="choice-card choice-card--compact">
      <input type="radio" name="transport" value="${z.id}"${z.id === 'none' ? ' checked' : ''}>
      <span class="choice-body">
        <span class="choice-icon">${icon(z.id === 'none' ? 'close' : 'pin')}</span>
        <strong class="choice-title">${t(`zones.${z.id}`)}</strong>
        ${z.price ? `<small class="choice-sub">${moneyHtml(z.price)} <span>+ ${esc(money(busFee))}</span></small>` : ''}
      </span>
      <span class="choice-check" aria-hidden="true">${icon('check')}</span>
    </label>`).join('')}
  </fieldset>
  <p class="hint">${icon('info')}${t('booking.transportHint', { bus: ctx.num(busFee) })}</p>

  <div class="panel-grid">
    <div>
      <h3 class="panel-subtitle">${icon('shirt')}${t('booking.uniformHeading')}</h3>
      <label class="switch switch--card">
        <input type="checkbox" name="uniform" checked>
        <span class="switch-ui" aria-hidden="true"></span>
        <span>${t('booking.uniformLabel')} <strong>${moneyHtml(data.fees.extras.uniform)}</strong></span>
      </label>
    </div>
    <div>
      <h3 class="panel-subtitle">${icon('book')}${t('booking.booksHeading')}</h3>
      <fieldset class="segmented">
        <legend class="sr-only">${t('booking.booksHeading')}</legend>
        <label><input type="radio" name="books" value="one"><span>${t('booking.booksOne')}</span></label>
        <label><input type="radio" name="books" value="both" checked><span>${t('booking.booksBoth')}</span></label>
      </fieldset>
      <p class="hint hint--sm" data-books-hint></p>
    </div>
  </div>

  <h3 class="panel-subtitle">${icon('card')}${t('booking.paymentHeading')}</h3>
  <fieldset class="segmented segmented--lg">
    <legend class="sr-only">${t('booking.paymentHeading')}</legend>
    <label><input type="radio" name="payment" value="cash" checked><span>${icon('wallet')}${t('booking.cash')}</span></label>
    <label><input type="radio" name="payment" value="installments"><span>${icon('card')}${t('booking.installments')}</span></label>
  </fieldset>
  <p class="hint" data-installments-hint hidden>${icon('info')}${t('booking.installmentsHint')}</p>
</section>`;

  /* ---------------------------------------------------------- step 3 */
  const field = ({ id, label, type = 'text', required = true, ph, autocomplete, extra = '', inputmode }) => `
  <div class="field">
    <label for="f-${id}">${label} ${required ? req : opt}</label>
    <input id="f-${id}" name="${id}" type="${type}"${required ? ' required aria-required="true"' : ''} ${ph ? `placeholder="${ph}"` : ''} ${autocomplete ? `autocomplete="${autocomplete}"` : ''} ${inputmode ? `inputmode="${inputmode}"` : ''} aria-describedby="err-${id}" ${extra}>
    ${err(id)}
  </div>`;

  const step3 = `
<section class="wizard-panel" data-panel="3" aria-labelledby="panel3-title" hidden>
  <h2 class="panel-title" id="panel3-title">${icon('user')}${t('booking.studentHeading')}</h2>
  <div class="form-grid">
    ${field({ id: 'studentName', label: t('booking.studentName'), ph: t('booking.studentNamePh'), autocomplete: 'off', extra: 'maxlength="80"' })}
    ${field({ id: 'dob', label: t('booking.dob'), type: 'date', extra: 'min="2000-01-01"' })}
    <fieldset class="field" aria-describedby="err-gender">
      <legend>${t('booking.gender')} ${req}</legend>
      <div class="segmented">
        <label><input type="radio" name="gender" value="male"><span>${t('booking.male')}</span></label>
        <label><input type="radio" name="gender" value="female"><span>${t('booking.female')}</span></label>
      </div>
      ${err('gender')}
    </fieldset>
    ${field({ id: 'prevSchool', label: t('booking.prevSchool'), required: false, ph: t('booking.prevSchoolPh'), extra: 'maxlength="120"' })}
  </div>

  <h2 class="panel-title" id="panel3b-title">${icon('users')}${t('booking.guardianHeading')}</h2>
  <div class="form-grid">
    ${field({ id: 'guardianName', label: t('booking.guardianName'), autocomplete: 'name', extra: 'maxlength="80"' })}
    <div class="field">
      <label for="f-phone">${t('booking.phone')} ${req}</label>
      <div class="phone-group" dir="ltr">
        <div class="select-wrap select-wrap--cc">
          <select id="f-cc" name="cc" aria-label="${t('booking.countryCode')}" autocomplete="tel-country-code">
            ${data.booking.countryCodes.map((cc) => `<option value="${cc}"${cc === data.booking.defaultCountryCode ? ' selected' : ''}>${cc}</option>`).join('')}
          </select>
        </div>
        <input id="f-phone" name="phone" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="${t('booking.phonePh')}" required aria-required="true" aria-describedby="err-phone" maxlength="16">
      </div>
      ${err('phone')}
    </div>
    ${field({ id: 'email', label: t('booking.email'), type: 'email', required: false, autocomplete: 'email', ph: 'name@example.com', extra: 'dir="ltr" maxlength="120"' })}
    <div class="field">
      <label for="f-emirate">${t('booking.emirate')} ${req}</label>
      <div class="select-wrap">
        <select id="f-emirate" name="emirate" required aria-required="true" aria-describedby="err-emirate">
          <option value="">${t('booking.choose')}</option>
          ${data.booking.emirates.map((e) => `<option value="${e}">${t(`emirates.${e}`)}</option>`).join('')}
        </select>
      </div>
      ${err('emirate')}
    </div>
    ${field({ id: 'area', label: t('booking.area'), required: false, ph: t('booking.areaPh'), autocomplete: 'address-level3', extra: 'maxlength="80"' })}
    <div class="field">
      <label for="f-siblings">${t('booking.siblings')}</label>
      <div class="select-wrap">
        <select id="f-siblings" name="siblings">
          ${Array.from({ length: data.booking.maxSiblings + 1 }, (_, n) => `<option value="${n}">${n}${n === data.booking.maxSiblings ? '+' : ''}</option>`).join('')}
        </select>
      </div>
    </div>
  </div>
  <p class="note note--gold" data-siblings-note hidden>${icon('star')}${t('booking.siblingsNote')}</p>
  <div class="field">
    <label for="f-notes">${t('booking.notes')} ${opt}</label>
    <textarea id="f-notes" name="notes" rows="3" maxlength="500" placeholder="${t('booking.notesPh')}"></textarea>
  </div>
</section>`;

  /* ---------------------------------------------------------- step 4 */
  const step4 = `
<section class="wizard-panel" data-panel="4" aria-labelledby="panel4-title" hidden>
  <div class="summary-head">
    <h2 class="panel-title" id="panel4-title">${icon('file')}${t('booking.summaryHeading')}</h2>
    <p class="order-id">${t('booking.orderId')}: <strong dir="ltr" data-order-id>—</strong></p>
  </div>
  <div class="summary-blocks">
    <div class="summary-block"><div class="summary-block-head"><h3>${t('booking.packageSection')}</h3><button type="button" class="link-btn" data-goto="1">${icon('edit')}${t('booking.edit')}</button></div><dl data-summary="package"></dl></div>
    <div class="summary-block"><div class="summary-block-head"><h3>${t('booking.studentSection')}</h3><button type="button" class="link-btn" data-goto="3">${icon('edit')}${t('booking.edit')}</button></div><dl data-summary="student"></dl></div>
    <div class="summary-block"><div class="summary-block-head"><h3>${t('booking.guardianSection')}</h3><button type="button" class="link-btn" data-goto="3">${icon('edit')}${t('booking.edit')}</button></div><dl data-summary="guardian"></dl></div>
  </div>
  <div class="invoice">
    <div class="invoice-head">${icon('scroll')}<h3>${t('booking.invoiceTitle')}</h3></div>
    <table class="invoice-table">
      <thead><tr><th scope="col">${t('booking.item')}</th><th scope="col">${t('booking.amount')}</th></tr></thead>
      <tbody data-invoice></tbody>
      <tfoot><tr><th scope="row">${t('booking.total')}</th><td data-invoice-total>—</td></tr></tfoot>
    </table>
    <p class="note">${icon('info')}${t('booking.disclaimer')}</p>
  </div>
  <div class="send-box">
    <a class="btn btn-wa btn-lg btn-block" href="https://wa.me/${data.contact.whatsapp}" target="_blank" rel="noopener" data-send>${icon('whatsapp')}<span>${t('booking.send')}</span></a>
    <p class="hint">${t('booking.sendHint')}</p>
  </div>
</section>`;

  const body = `
${c.pageHero(ctx, { title: t('booking.title'), lead: t('booking.lead') })}
<section class="section section--booking">
  <div class="container booking-layout">
    <form class="wizard card" id="booking-form" novalidate aria-label="${t('booking.formLabel')}">
      ${progress}
      <p class="sr-only" aria-live="polite" data-step-announce></p>
      <div class="form-alert" role="alert" hidden>${icon('alert')}<span>${t('booking.errors.summary')}</span></div>
      ${step1}${step2}${step3}${step4}
      <div class="wizard-nav">
        <button type="button" class="btn btn-ghost" data-prev hidden>${icon('arrow', 'icon-dir-rev')}<span>${t('booking.back')}</span></button>
        <button type="button" class="btn btn-royal" data-next><span>${t('booking.next')}</span>${icon('arrow', 'icon-dir')}</button>
      </div>
      <p class="wizard-saved">${icon('shield')}<span>${t('booking.saved')}</span> <button type="button" class="link-btn" data-reset>${icon('trash')}${t('booking.reset')}</button></p>
    </form>
    <aside class="live-total" aria-label="${t('booking.liveTotal')}">
      <div class="live-total-card">
        <p class="live-total-stage" data-live-stage>${t('booking.pickStage')}</p>
        <dl class="live-total-lines" data-live-lines></dl>
        <p class="live-total-sum"><span>${t('booking.liveTotal')}</span><strong data-live-total>—</strong></p>
        <p class="live-total-note">${t('booking.disclaimer')}</p>
      </div>
    </aside>
  </div>
</section>`;

  const b = raw('booking');
  return {
    body,
    bodyClass: 'has-live-total',
    scripts: ['booking'],
    client: {
      fees: data.fees,
      booking: data.booking,
      orderPrefix: data.site.orderPrefix,
      labels: {
        stages: Object.fromEntries(data.fees.stages.map((s) => [s.id, raw(`stages.${s.id}.name`)])),
        tracks: raw('tracks'),
        zones: raw('zones'),
        emirates: raw('emirates'),
        booking: {
          steps: b.steps, stepOf: b.stepOf, pickStage: b.pickStage, errors: b.errors, wa: b.wa,
          tuition: b.tuition, books: b.books, booksOneShort: b.booksOneShort, booksBothShort: b.booksBothShort,
          registration: b.registration, uniform: b.uniform, busBooking: b.busBooking, transport: b.transport,
          notIncluded: b.notIncluded, total: b.total, cash: b.cash, installments: b.installments,
          male: b.male, female: b.female, studentName: b.studentName, dob: b.dob, gender: b.gender,
          prevSchool: b.prevSchool, guardianName: b.guardianName, phone: b.phone, email: b.email,
          emirate: b.emirate, area: b.area, siblings: b.siblings, notes: b.notes, resetConfirm: b.resetConfirm,
          stage: raw('fees.calcStage'), track: raw('fees.calcTrack'), payment: b.paymentHeading,
        },
      },
    },
  };
};

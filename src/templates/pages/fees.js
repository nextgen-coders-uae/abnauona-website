'use strict';
const c = require('../components');

/** Server-side default quote so the calculator shows real numbers before JS runs. */
function defaultQuote(data) {
  const s = data.fees.stages[0];
  const e = data.fees.extras;
  return s.arabic + s.booksPerTerm * 2 + e.registration + e.uniform;
}

module.exports = (ctx) => {
  const { t, raw, url, icon, data, esc, money, moneyHtml } = ctx;

  const calculator = `
<form class="calc card reveal" id="fee-calc" novalidate aria-labelledby="calc-title">
  <div class="calc-fields">
    <div class="field">
      <label for="calc-stage">${t('fees.calcStage')}</label>
      <div class="select-wrap">
        <select id="calc-stage" name="stage">
          ${data.fees.stages.map((s, i) => `<option value="${s.id}"${i === 0 ? ' selected' : ''}>${esc(raw(`stages.${s.id}.name`))} — ${esc(raw(`stages.${s.id}.grades`))}</option>`).join('')}
        </select>
      </div>
    </div>
    <fieldset class="field">
      <legend>${t('fees.calcTrack')}</legend>
      <div class="segmented">
        <label><input type="radio" name="track" value="arabic" checked><span>${t('tracks.arabic')}</span></label>
        <label><input type="radio" name="track" value="languages"><span>${t('tracks.languages')}</span></label>
      </div>
    </fieldset>
    <fieldset class="field">
      <legend>${t('fees.calcBooks')}</legend>
      <div class="segmented">
        <label><input type="radio" name="books" value="one"><span>${t('fees.booksOne')}</span></label>
        <label><input type="radio" name="books" value="both" checked><span>${t('fees.booksBoth')}</span></label>
      </div>
    </fieldset>
    <div class="field">
      <label for="calc-transport">${t('fees.calcTransport')}</label>
      <div class="select-wrap">
        <select id="calc-transport" name="transport">
          <option value="none" selected>${t('zones.none')}</option>
          ${data.fees.transport.map((z) => `<option value="${z.id}">${t(`zones.${z.id}`)} — ${esc(money(z.price))}</option>`).join('')}
        </select>
      </div>
    </div>
    <label class="switch">
      <input type="checkbox" name="uniform" checked>
      <span class="switch-ui" aria-hidden="true"></span>
      <span>${t('fees.calcUniform')}</span>
    </label>
  </div>
  <div class="calc-result">
    <dl class="calc-lines" data-calc-lines></dl>
    <p class="calc-total" aria-live="polite"><span>${t('fees.calcTotal')}</span><strong data-calc-total>${moneyHtml(defaultQuote(data))}</strong></p>
    ${c.btn(ctx, { href: url('booking'), label: t('fees.calcContinue'), iconEnd: 'arrow', attrs: 'data-calc-continue' })}
    <p class="calc-note">${icon('info')}${t('fees.calcNote')}</p>
  </div>
</form>`;

  const body = `
${c.pageHero(ctx, {
    title: t('fees.title'),
    lead: t('fees.lead'),
    extra: `<div class="btn-row btn-row--center">${c.btn(ctx, { href: '#fee-calc-section', label: t('fees.calcKicker'), icon: 'wallet' })}${c.btn(ctx, { href: url('booking'), label: t('common.bookNow'), variant: 'outline-light' })}</div>`,
  })}

<section class="section" aria-labelledby="table-title">
  <div class="container">
    ${c.sectionHead(ctx, { kicker: t('fees.tableKicker'), title: t('fees.tableTitle'), id: 'table-title' })}
    ${c.feesTable(ctx)}
    ${c.extrasCards(ctx)}
  </div>
</section>

<section class="section section--alt bg-glyphs" id="fee-calc-section" aria-labelledby="calc-title">
  <div class="container">
    ${c.sectionHead(ctx, { kicker: t('fees.calcKicker'), title: t('fees.calcTitle'), lead: t('fees.calcLead'), id: 'calc-title' })}
    ${calculator}
  </div>
</section>

<section class="section" aria-labelledby="poster-title">
  <div class="container split split--center">
    <div class="split-text">
      ${c.sectionHead(ctx, { kicker: t('home.feesKicker'), title: t('fees.posterTitle'), align: 'start', id: 'poster-title' })}
      <ul class="check-list">${raw('home.feesPoints').map((p) => `<li>${icon('check')}${esc(p)}</li>`).join('')}</ul>
      <div class="btn-row">${c.btn(ctx, { href: url('faq'), label: t('nav.faq'), variant: 'ghost', icon: 'question' })}${c.btn(ctx, { href: url('booking'), label: t('common.bookNow'), variant: 'royal' })}</div>
    </div>
    ${c.posterFigure(ctx, 'poster-fees', { title: raw('fees.posterTitle'), alt: raw('fees.posterAlt') })}
  </div>
</section>

${c.ctaBand(ctx)}`;

  return {
    body,
    scripts: ['calculator'],
    client: {
      fees: data.fees,
      labels: {
        stages: Object.fromEntries(data.fees.stages.map((s) => [s.id, raw(`stages.${s.id}.name`)])),
        tracks: raw('tracks'),
        zones: raw('zones'),
        booking: {
          tuition: raw('booking.tuition'),
          books: raw('booking.books'),
          booksOneShort: raw('booking.booksOneShort'),
          booksBothShort: raw('booking.booksBothShort'),
          registration: raw('booking.registration'),
          uniform: raw('booking.uniform'),
          busBooking: raw('booking.busBooking'),
          transport: raw('booking.transport'),
        },
      },
    },
  };
};

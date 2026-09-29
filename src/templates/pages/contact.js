'use strict';
const c = require('../components');

module.exports = (ctx) => {
  const { t, icon, data, esc, raw } = ctx;
  const m = data.contact.map;
  const q = encodeURIComponent(m.query);
  const mapEmbed = m.lat && m.lng
    ? `https://maps.google.com/maps?q=${m.lat},${m.lng}&z=16&hl=${ctx.lang}&output=embed`
    : `https://maps.google.com/maps?q=${q}&z=15&hl=${ctx.lang}&output=embed`;
  const directions = m.lat && m.lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${q}`;

  const info = `
<ul class="contact-cards" role="list">
  <li class="contact-card reveal">
    <span class="contact-icon">${icon('pin')}</span>
    <div><h3>${t('contact.addressLabel')}</h3><p>${t('contact.address')}</p>
    <a class="link-arrow" href="${directions}" target="_blank" rel="noopener">${t('contact.directions')} ${icon('arrow', 'icon-dir')}</a></div>
  </li>
  <li class="contact-card reveal" style="--d:60ms">
    <span class="contact-icon">${icon('phone')}</span>
    <div><h3>${t('contact.phonesLabel')}</h3>
    <p class="contact-lines">${data.contact.phones.map((p) => `<a href="tel:${p.tel}" dir="ltr">${esc(p.display)}</a>`).join('')}</p></div>
  </li>
  <li class="contact-card reveal" style="--d:120ms">
    <span class="contact-icon contact-icon--wa">${icon('whatsapp')}</span>
    <div><h3>${t('contact.whatsappLabel')}</h3>
    <p><a href="https://wa.me/${data.contact.whatsapp}" target="_blank" rel="noopener" dir="ltr">+${data.contact.whatsapp}</a></p></div>
  </li>
  <li class="contact-card reveal" style="--d:180ms">
    <span class="contact-icon">${icon('mail')}</span>
    <div><h3>${t('contact.emailLabel')}</h3>
    <p><a href="mailto:${data.contact.email}">${esc(data.contact.email)}</a></p>
    <h3 class="contact-sub">${t('contact.websiteLabel')}</h3>
    <p><a href="https://${data.contact.website}" dir="ltr">${esc(data.contact.website)}</a></p></div>
  </li>
</ul>`;

  const form = `
<form class="contact-form card reveal" id="contact-form" novalidate aria-labelledby="form-title">
  <h2 class="panel-title" id="form-title">${icon('send')}${t('contact.formTitle')}</h2>
  <div class="form-grid">
    <div class="field">
      <label for="c-name">${t('contact.name')} <span class="req" aria-hidden="true">*</span></label>
      <input id="c-name" name="name" type="text" autocomplete="name" required aria-required="true" aria-describedby="err-c-name" maxlength="80">
      <p class="field-error" id="err-c-name" hidden></p>
    </div>
    <div class="field">
      <label for="c-phone">${t('contact.phone')} <span class="req" aria-hidden="true">*</span></label>
      <input id="c-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" dir="ltr" required aria-required="true" aria-describedby="err-c-phone" maxlength="20">
      <p class="field-error" id="err-c-phone" hidden></p>
    </div>
  </div>
  <div class="field">
    <label for="c-subject">${t('contact.subject')}</label>
    <div class="select-wrap">
      <select id="c-subject" name="subject">
        ${Object.keys(raw('contact.subjects')).map((k) => `<option value="${k}">${t(`contact.subjects.${k}`)}</option>`).join('')}
      </select>
    </div>
  </div>
  <div class="field">
    <label for="c-message">${t('contact.message')} <span class="req" aria-hidden="true">*</span></label>
    <textarea id="c-message" name="message" rows="5" required aria-required="true" aria-describedby="err-c-message" maxlength="1000"></textarea>
    <p class="field-error" id="err-c-message" hidden></p>
  </div>
  <div class="btn-row">
    <button type="submit" class="btn btn-wa" data-channel="whatsapp">${icon('whatsapp')}<span>${t('contact.sendWhatsapp')}</span></button>
    <button type="submit" class="btn btn-ghost" data-channel="email">${icon('mail')}<span>${t('contact.sendEmail')}</span></button>
  </div>
  <p class="hint">${icon('shield')}${t('contact.formNote')}</p>
</form>`;

  const body = `
${c.pageHero(ctx, { title: t('contact.title'), lead: t('contact.lead') })}
<section class="section bg-glyphs" aria-labelledby="info-title">
  <div class="container contact-layout">
    <div>
      <h2 class="section-title section-title--sm" id="info-title">${t('contact.infoTitle')}</h2>
      ${info}
    </div>
    ${form}
  </div>
</section>
<section class="section section--alt" aria-labelledby="map-title">
  <div class="container">
    ${c.sectionHead(ctx, { title: t('contact.mapTitle'), id: 'map-title' })}
    <div class="map-frame reveal">
      <iframe src="${mapEmbed}" title="${t('contact.mapFrameTitle')}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
    </div>
    <p class="section-more">${c.btn(ctx, { href: directions, label: t('contact.directions'), variant: 'royal', icon: 'navigation', attrs: 'target="_blank" rel="noopener"' })}</p>
  </div>
</section>`;

  return {
    body,
    scripts: ['contact'],
    client: {
      contact: {
        waTitle: raw('contact.waTitle'),
        errors: raw('contact.errors'),
        labels: { name: raw('contact.name'), phone: raw('contact.phone'), subject: raw('contact.subject'), message: raw('contact.message') },
        subjects: raw('contact.subjects'),
      },
    },
  };
};

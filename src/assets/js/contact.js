/**
 * Contact form → composes a WhatsApp message or an email (no backend needed).
 */
(function () {
  'use strict';
  var ABN = window.ABN;
  var form = document.getElementById('contact-form');
  if (!ABN || !form) return;

  var C = ABN.data.contact;
  var lastChannel = 'whatsapp';
  form.addEventListener('click', function (e) {
    var b = e.target.closest('[data-channel]');
    if (b) lastChannel = b.getAttribute('data-channel');
  });

  function setError(id, msg) {
    var input = document.getElementById(id);
    var box = document.getElementById('err-' + id);
    box.textContent = msg || '';
    box.hidden = !msg;
    if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    return !msg;
  }

  function validate() {
    var name = form.elements.name.value.trim();
    var phone = form.elements.phone.value.replace(/\D/g, '');
    var message = form.elements.message.value.trim();
    var ok = [
      setError('c-name', name.length >= 2 ? '' : C.errors.name),
      setError('c-phone', phone.length >= 7 && phone.length <= 15 ? '' : C.errors.phone),
      setError('c-message', message.length >= 10 ? '' : C.errors.message)
    ];
    var firstBad = ['c-name', 'c-phone', 'c-message'].filter(function (id, i) { return !ok[i]; })[0];
    if (firstBad) document.getElementById(firstBad).focus();
    return !firstBad;
  }

  form.addEventListener('input', function (e) {
    var box = document.getElementById('err-' + e.target.id);
    if (box && !box.hidden) validate();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var channel = (e.submitter && e.submitter.getAttribute('data-channel')) || lastChannel;
    if (!validate()) return;
    var f = form.elements;
    var subject = C.subjects[f.subject.value] || '';
    var body = [
      '👤 ' + C.labels.name + ': ' + f.name.value.trim(),
      '📞 ' + C.labels.phone + ': ' + f.phone.value.trim(),
      '📌 ' + C.labels.subject + ': ' + subject,
      '📝 ' + C.labels.message + ': ' + f.message.value.trim()
    ].join('\n');
    ABN.track('contact', { channel: channel });
    if (channel === 'email') {
      location.href = 'mailto:' + ABN.data.email + '?subject=' + encodeURIComponent(subject + ' — ' + f.name.value.trim()) + '&body=' + encodeURIComponent(body);
    } else {
      window.open('https://wa.me/' + ABN.data.whatsapp + '?text=' + encodeURIComponent(C.waTitle + '\n━━━━━━━━━━━━━━\n' + body), '_blank', 'noopener');
    }
  });
})();

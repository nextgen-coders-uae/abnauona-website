/**
 * Thank-you page: shows the request number of the booking just sent from this tab
 * and offers to reopen WhatsApp with the same message.
 */
(function () {
  'use strict';
  var order = null;
  try { order = JSON.parse(sessionStorage.getItem('abn-last-order')); } catch (e) { order = null; }
  var box = document.querySelector('[data-order-box]');
  var missing = document.querySelector('[data-no-order]');
  var resend = document.querySelector('[data-resend]');
  if (order && order.id) {
    box.querySelector('[data-order-id]').textContent = order.id;
    box.hidden = false;
    if (order.url) { resend.href = order.url; resend.hidden = false; }
  } else if (missing) {
    missing.hidden = false;
  }
})();

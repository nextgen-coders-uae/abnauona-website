/**
 * Quick fee calculator (fees page) — independent of the booking wizard, but its
 * "continue" button pre-fills the wizard through URL parameters.
 */
(function () {
  'use strict';
  var ABN = window.ABN;
  var form = document.getElementById('fee-calc');
  if (!ABN || !form) return;

  var L = ABN.data.labels;
  var B = L.booking;
  var linesEl = form.querySelector('[data-calc-lines]');
  var totalEl = form.querySelector('[data-calc-total]');
  var cont = form.querySelector('[data-calc-continue]');

  function read() {
    var get = function (name) { var el = form.querySelector('[name="' + name + '"]:checked'); return el ? el.value : ''; };
    return {
      stage: form.elements.stage.value,
      track: get('track'),
      books: get('books'),
      transport: form.elements.transport.value,
      uniform: form.elements.uniform.checked
    };
  }

  function render() {
    var v = read();
    var q = ABN.quote({ stage: v.stage, track: v.track, books: v.books, transport: v.transport === 'none' ? null : v.transport, uniform: v.uniform });
    var rows = [
      [B.tuition + ' · ' + L.tracks[v.track], q.tuition],
      [B.books + ' (' + (v.books === 'one' ? B.booksOneShort : B.booksBothShort) + ')', q.books],
      [B.registration, q.registration]
    ];
    if (q.uniform) rows.push([B.uniform, q.uniform]);
    if (q.transport) {
      rows.push([B.transport + ' · ' + L.zones[v.transport], q.transport]);
      rows.push([B.busBooking, q.busBooking]);
    }
    linesEl.innerHTML = rows.map(function (r) {
      return '<div><dt>' + ABN.escapeHtml(r[0]) + '</dt><dd>' + ABN.money(r[1]) + '</dd></div>';
    }).join('');
    totalEl.innerHTML = ABN.moneyHtml(q.total);

    var params = new URLSearchParams({ stage: v.stage, track: v.track, books: v.books, transport: v.transport, uniform: v.uniform ? '1' : '0' });
    cont.href = ABN.data.urls.booking + '?' + params.toString();
  }

  form.addEventListener('change', render);
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  render();
})();

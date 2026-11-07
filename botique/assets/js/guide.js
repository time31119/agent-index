/* BOTIQUE — field guide */
(function () {
  'use strict';
  const D = window.BOTIQUE_DATA;
  const S = window.BOTIQUE;
  const picks = ['eilik', 'loona', 'moflin', 'sphero-bolt'];

  function render() {
    const host = document.getElementById('guide-picks');
    if (!host) return;
    host.innerHTML = picks.map(function (id) { return S.productCard(D.byId(id)); }).join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    S.init();
    render();
    document.addEventListener('botique:currency', render);
    document.addEventListener('botique:lang', render);
  });
})();

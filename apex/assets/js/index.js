(function () {
  'use strict';
  const A = window.APEX, U = A.ui;
  const rail = document.getElementById('featuredRail');
  const catGrid = document.getElementById('catGrid');
  const VERIFIED = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-label="已认证"><circle cx="12" cy="12" r="9" fill="currentColor" stroke="none" opacity=".14"/><path d="m8 12.3 2.6 2.6L16.2 9"/></svg>';

  if (rail) {
    const featured = A.AGENTS.slice()
      .sort((a, b) => (b.rating - a.rating) || (b.reviews - a.reviews))
      .slice(0, 8);

    rail.innerHTML = featured.map(a => {
      const badge = a.badge ? '<span class="badge ' + (a.badge === '编辑精选' ? 'badge-gold' : '') + ' agent-top-badge">' + a.badge + '</span>' : '';
      return '<a class="agent-card" href="agent.html?id=' + a.id + '">' +
        '<div class="agent-head">' + U.agentIcon(a) +
          '<div><div class="agent-name">' + a.name + (a.verified ? ' <span class="verified">' + VERIFIED + '</span>' : '') + '</div>' +
          '<div class="agent-maker">' + a.maker + ' · ' + a.cat + '</div></div>' +
          badge +
        '</div>' +
        '<p class="agent-tagline">' + a.tagline + '</p>' +
        '<div class="agent-tags">' + (a.tags || []).map(t => '<span class="tag">' + t + '</span>').join('') + '</div>' +
        '<div class="agent-foot">' +
          '<span class="rating">' + U.STAR + a.rating.toFixed(1) + ' <span>(' + a.reviews.toLocaleString('en-US') + ')</span></span>' +
          '<span class="price">' + a.price.label + '<span class="note">' + a.price.note + '</span></span>' +
        '</div>' +
      '</a>';
    }).join('');
  }

  if (catGrid) {
    catGrid.innerHTML = A.CATEGORIES.map(c => {
      const n = A.AGENTS.filter(a => a.cat === c.name).length;
      return '<a class="cat-card" href="agents.html?cat=' + encodeURIComponent(c.name) + '">' +
        '<span class="cat-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg></span>' +
        '<div><div class="cat-icon"><svg class="cat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + c.svg + '</svg></div><div class="cat-name">' + c.name + '</div>' +
        '<div class="cat-count">' + n + ' 个编辑精选</div></div>' +
      '</a>';
    }).join('');
  }
})();

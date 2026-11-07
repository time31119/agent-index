(function () {
  'use strict';
  const A = window.APEX, U = A.ui;
  const grid = document.getElementById('agentGrid');
  const empty = document.getElementById('emptyState');
  const filtersBody = document.getElementById('filtersBody');
  const searchInput = document.getElementById('agentSearch');
  const sortSelect = document.getElementById('sortSelect');
  const resultCount = document.getElementById('resultCount');
  if (!grid) return;

  const params = new URLSearchParams(location.search);
  const state = {
    q: params.get('q') || '',
    cats: new Set(params.get('cat') ? [params.get('cat')] : []),
    prices: new Set(),
    verified: false,
    high: false,
    sort: params.get('sort') === 'popular' ? 'installs' : 'rec'
  };
  if (state.q) searchInput.value = state.q;
  sortSelect.value = state.sort;

  const PRICE_TYPES = [
    { k: 'subscription', n: '订阅' },
    { k: 'usage', n: '按量计费' },
    { k: 'seat', n: '按席位' },
    { k: 'enterprise', n: '企业报价' }
  ];
  const VERIFIED = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-label="已认证"><circle cx="12" cy="12" r="9" fill="currentColor" stroke="none" opacity=".14"/><path d="m8 12.3 2.6 2.6L16.2 9"/></svg>';

  function priceNum(a) {
    const m = String(a.price.label).match(/[\d.]+/);
    return m ? parseFloat(m[0]) : 0;
  }

  function buildFilters() {
    let html = '<div class="filter-group"><div class="filter-title">类别</div>';
    A.CATEGORIES.forEach(c => {
      const n = A.AGENTS.filter(a => a.cat === c.name).length;
      html += '<label class="filter-opt"><input type="checkbox" data-kind="cat" value="' + c.name + '"' +
        (state.cats.has(c.name) ? ' checked' : '') + '><span>' + c.name + '</span><span class="cnt">' + n + '</span></label>';
    });
    html += '</div>';

    html += '<div class="filter-group"><div class="filter-title">定价方式</div>';
    PRICE_TYPES.forEach(p => {
      const n = A.AGENTS.filter(a => a.price.model === p.k).length;
      html += '<label class="filter-opt"><input type="checkbox" data-kind="price" value="' + p.k + '"><span>' + p.n + '</span><span class="cnt">' + n + '</span></label>';
    });
    html += '</div>';

    const vn = A.AGENTS.filter(a => a.verified).length;
    const hn = A.AGENTS.filter(a => a.rating >= 4.8).length;
    html += '<div class="filter-group"><div class="filter-title">信任等级</div>' +
      '<label class="filter-opt"><input type="checkbox" data-kind="verified"><span>仅显示已验证</span><span class="cnt">' + vn + '</span></label>' +
      '<label class="filter-opt"><input type="checkbox" data-kind="high"><span>评分 4.8 以上</span><span class="cnt">' + hn + '</span></label>' +
      '</div>';

    html += '<button class="filter-reset" type="button" id="resetFilters">清除全部筛选</button>' +
      '<div class="mt-32 filter-note" style="border-top:1px solid var(--line);padding-top:16px">' +
      '<div class="filter-title">上架标准</div>' +
      '<p class="small" style="line-height:1.6">身份核验 · 权限最小化 · 200 个真实任务评测 · 运行时行为监控。' +
      '<a href="blueprint.html#trust" style="color:var(--accent)">了解审计流程</a></p></div>';

    filtersBody.innerHTML =
      '<div class="filter-sheet-head"><span>筛选</span><span class="filter-sheet-actions"><button type="button" class="filter-sheet-clear" id="filterClear">清除</button><button type="button" class="filter-sheet-close" id="filterClose">完成</button></span></div>' +
      html +
      '<button class="btn btn-primary btn-block filter-apply" id="filterApply" type="button">查看结果</button>';
  }

  function filtered() {
    const q = state.q.trim().toLowerCase();
    let list = A.AGENTS.filter(a => {
      if (state.cats.size && !state.cats.has(a.cat)) return false;
      if (state.prices.size && !state.prices.has(a.price.model)) return false;
      if (state.verified && !a.verified) return false;
      if (state.high && a.rating < 4.8) return false;
      if (q) {
        const hay = (a.name + ' ' + a.zh + ' ' + a.maker + ' ' + a.cat + ' ' + a.tagline + ' ' + (a.tags || []).join(' ')).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (state.sort === 'rating') list.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    else if (state.sort === 'installs') list.sort((a, b) => b.installs - a.installs);
    else if (state.sort === 'price') list.sort((a, b) => priceNum(a) - priceNum(b));
    else list.sort((a, b) => {
      const score = x => x.rating + (x.badge ? 0.6 : 0) + Math.log10(x.installs + 10) / 12;
      return score(b) - score(a);
    });
    return list;
  }

  function card(a) {
    const badge = a.badge ? '<span class="badge ' + (a.badge === '编辑精选' ? 'badge-gold' : '') + ' agent-top-badge">' + a.badge + '</span>' : '';
    return '<a class="agent-card" href="agent.html?id=' + a.id + '">' +
      '<div class="agent-head">' + U.agentIcon(a) +
        '<div><div class="agent-name">' + a.name + (a.verified ? ' <span class="verified">' + VERIFIED + '</span>' : '') + '</div>' +
        '<div class="agent-maker">' + a.maker + ' · ' + a.cat + '</div></div>' + badge +
      '</div>' +
      '<p class="agent-tagline">' + a.tagline + '</p>' +
      '<div class="agent-tags">' + (a.tags || []).map(t => '<span class="tag">' + t + '</span>').join('') + '</div>' +
      '<div class="agent-foot">' +
        '<span class="rating">' + U.STAR + a.rating.toFixed(1) + ' <span>(' + a.reviews.toLocaleString('en-US') + ')</span></span>' +
        '<span class="price">' + a.price.label + '<span class="note">' + a.price.note + '</span></span>' +
      '</div>' +
    '</a>';
  }

  function render() {
    const list = filtered();
    grid.innerHTML = list.map(card).join('');
    empty.style.display = list.length ? 'none' : 'block';
    resultCount.textContent = list.length + ' 个结果';
    const active = state.cats.size + state.prices.size + (state.verified ? 1 : 0) + (state.high ? 1 : 0);
    resultCount.textContent = list.length + ' 个结果' + (active ? ' · 已筛选' : '');
    filterToggle.innerHTML = '筛选' + (active ? '<span class="filter-badge">' + active + '</span>' : '');
    const applyBtn = document.getElementById('filterApply');
    if (applyBtn) applyBtn.textContent = '查看 ' + list.length + ' 个结果';
  }

  buildFilters();

  const filterToggle = document.getElementById('filterToggle');
  const filterScrim = document.getElementById('filterScrim');
  function closeFilters() {
    filtersBody.classList.remove('is-open');
    filterScrim.classList.remove('is-open');
    filterToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  function openFilters() {
    filtersBody.classList.add('is-open');
    filterScrim.classList.add('is-open');
    filterToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  filterToggle.addEventListener('click', () => {
    filtersBody.classList.contains('is-open') ? closeFilters() : openFilters();
  });
  filterScrim.addEventListener('click', closeFilters);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeFilters(); });
  filtersBody.addEventListener('click', (e) => {
    if (e.target.id === 'filterClear') { resetAll(); return; }
    if (e.target.id === 'filterClose' || e.target.id === 'filterApply') closeFilters();
  });

  filtersBody.addEventListener('change', (e) => {
    const el = e.target;
    const kind = el.getAttribute('data-kind');
    if (kind === 'cat') { el.checked ? state.cats.add(el.value) : state.cats.delete(el.value); }
    if (kind === 'price') { el.checked ? state.prices.add(el.value) : state.prices.delete(el.value); }
    if (kind === 'verified') state.verified = el.checked;
    if (kind === 'high') state.high = el.checked;
    render();
  });

  filtersBody.addEventListener('click', (e) => {
    if (e.target.id === 'resetFilters') resetAll();
  });

  function resetAll() {
    state.q = '';
    state.cats.clear();
    state.prices.clear();
    state.verified = false;
    state.high = false;
    state.sort = 'rec';
    searchInput.value = '';
    sortSelect.value = 'rec';
    U.$$('input', filtersBody).forEach(i => { i.checked = false; });
    render();
  }

  document.getElementById('resetEmpty').addEventListener('click', resetAll);
  searchInput.addEventListener('input', () => { state.q = searchInput.value; render(); });
  sortSelect.addEventListener('change', () => { state.sort = sortSelect.value; render(); });

  render();
})();


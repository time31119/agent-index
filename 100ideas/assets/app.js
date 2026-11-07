(() => {
  'use strict';

  const DEFAULT_IDEAS = window.DEFAULT_IDEAS || [];
  const IDEA_KEY = 'fengyuanzhang.ideas.v1';
  const REVIEW_KEY = 'fengyuanzhang.reviews.v1';
  const STATUSES = ['未验证', '验证中', '收到第一块钱', '放弃'];
  const DIFF_ORDER = { '低': 0, '中': 1, '高': 2 };
  const VIEWS = ['ideas', 'board', 'review', 'data'];

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  let ideas = [];
  let reviews = [];
  let currentView = 'ideas';
  let currentId = null;
  let toastTimer = null;
  let searchTimer = null;
  let filters = { q: '', category: 'all', status: 'all', difficulty: 'all', sort: 'rating' };

  /* ---------- helpers ---------- */
  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }
  function money(n) {
    const v = Number(n) || 0;
    return '¥' + v.toLocaleString('zh-CN', { maximumFractionDigits: 2 });
  }
  function num(n) { return (Number(n) || 0).toLocaleString('zh-CN'); }
  function dateStr(d) {
    const off = d.getTimezoneOffset();
    return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
  }
  function today() { return dateStr(new Date()); }
  function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return dateStr(d); }
  function stars(n) {
    const v = Math.max(0, Math.min(5, Number(n) || 0));
    return '★'.repeat(v) + '☆'.repeat(5 - v);
  }
  function statusClass(s) {
    if (s === '验证中') return 'status-testing';
    if (s === '收到第一块钱') return 'status-paid';
    if (s === '放弃') return 'status-dropped';
    return 'status-unverified';
  }
  function ideaRevenue(idea) { return (idea.logs || []).reduce((s, l) => s + (Number(l.revenue) || 0), 0); }
  function ideaSpend(idea) { return (idea.logs || []).reduce((s, l) => s + (Number(l.cost) || 0), 0); }
  function idealogCount(idea) { return (idea.logs || []).length; }
  function allLogs() {
    return ideas.flatMap((i) => (i.logs || []).map((l) => ({ ...l, ideaId: i.id, ideaTitle: i.title })));
  }

  function normalizeIdea(i) {
    return {
      ...i,
      id: String(i.id || ''),
      category: i.category || '未分类',
      title: i.title || '未命名点子',
      what: i.what || '',
      payer: i.payer || '',
      first: i.first || '',
      difficulty: ['低', '中', '高'].includes(i.difficulty) ? i.difficulty : '中',
      cost: Number(i.cost) || 0,
      risk: i.risk || '',
      rating: Math.max(1, Math.min(5, Number(i.rating) || 3)),
      status: STATUSES.includes(i.status) ? i.status : '未验证',
      notes: i.notes || '',
      next: i.next || '',
      logs: Array.isArray(i.logs) ? i.logs.map((l) => ({
        ...l,
        id: String(l.id || Math.random().toString(36).slice(2)),
        date: l.date || today(),
        action: l.action || '',
        result: l.result || '',
        lesson: l.lesson || '',
        revenue: Number(l.revenue) || 0,
        cost: Number(l.cost) || 0
      })) : []
    };
  }

  /* ---------- storage ---------- */
  function loadIdeas() {
    try {
      const raw = localStorage.getItem(IDEA_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length) return arr.map(normalizeIdea);
      }
    } catch (e) { /* ignore */ }
    return clone(DEFAULT_IDEAS).map(normalizeIdea);
  }
  function loadReviews() {
    try {
      const raw = localStorage.getItem(REVIEW_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return arr;
      }
    } catch (e) { /* ignore */ }
    return [];
  }
  function saveIdeas() {
    try { localStorage.setItem(IDEA_KEY, JSON.stringify(ideas)); }
    catch (e) { toast('本地存储不可用：请用本地服务器打开，或先导出备份'); }
  }
  function saveReviews() {
    try { localStorage.setItem(REVIEW_KEY, JSON.stringify(reviews)); }
    catch (e) { toast('本地存储不可用：请用本地服务器打开'); }
  }

  /* ---------- toast ---------- */
  function toast(msg) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  /* ---------- stats / next ---------- */
  function renderStats() {
    const total = ideas.length;
    const active = ideas.filter((i) => i.status === '验证中').length;
    const paid = ideas.filter((i) => i.status === '收到第一块钱' || ideaRevenue(i) > 0).length;
    const revenue = ideas.reduce((s, i) => s + ideaRevenue(i), 0);
    $('#stat-total').textContent = total;
    $('#stat-active').textContent = active;
    $('#stat-paid').textContent = paid;
    $('#stat-revenue').textContent = money(revenue);
  }

  function pickNext() {
    const unverified = ideas.filter((i) => i.status === '未验证');
    const pool = unverified.length ? unverified : ideas.filter((i) => i.status === '验证中');
    if (!pool.length) return null;
    return [...pool].sort((a, b) =>
      b.rating - a.rating || a.cost - b.cost || a.id.localeCompare(b.id)
    )[0];
  }

  function renderNext() {
    const idea = pickNext();
    const title = $('#next-title');
    const meta = $('#next-meta');
    const btn = $('#start-next');
    if (!idea) {
      title.textContent = '100 个都试过了';
      meta.textContent = '去加一个新点子，或者把“放弃”的重新捡起来。';
      btn.hidden = true;
      btn.dataset.id = '';
      return;
    }
    title.textContent = idea.id + ' · ' + idea.title;
    meta.textContent = idea.payer + ' · ' + idea.first + ' · ' + idea.difficulty + '难度';
    btn.hidden = false;
    btn.dataset.id = idea.id;
    btn.textContent = idea.status === '未验证' ? '开始验证 →' : '继续验证 →';
  }

  /* ---------- filters / cards ---------- */
  function populateFilters() {
    const cat = $('#filter-category');
    if (!cat) return;
    const cats = [...new Set(ideas.map((i) => i.category))];
    if (!cats.includes(filters.category)) filters.category = 'all';
    cat.innerHTML = '<option value="all">全部分类</option>' +
      cats.map((c) => '<option value="' + esc(c) + '">' + esc(c) + '</option>').join('');
    cat.value = filters.category;
  }

  function syncFilterUI() {
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
    set('filter-category', filters.category);
    set('filter-status', filters.status);
    set('filter-difficulty', filters.difficulty);
    set('sort', filters.sort);
    const s = $('#search');
    if (s) s.value = filters.q;
  }

  function getFilteredIdeas() {
    const q = filters.q;
    let list = ideas.filter((i) => {
      if (filters.category !== 'all' && i.category !== filters.category) return false;
      if (filters.status !== 'all' && i.status !== filters.status) return false;
      if (filters.difficulty !== 'all' && i.difficulty !== filters.difficulty) return false;
      if (q) {
        const hay = [i.id, i.title, i.what, i.payer, i.first, i.category, i.risk, i.notes]
          .join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const sort = filters.sort;
    list.sort((a, b) => {
      if (sort === 'id') return a.id.localeCompare(b.id);
      if (sort === 'cost') return a.cost - b.cost || b.rating - a.rating;
      if (sort === 'difficulty') {
        return (DIFF_ORDER[a.difficulty] ?? 1) - (DIFF_ORDER[b.difficulty] ?? 1) || b.rating - a.rating;
      }
      return b.rating - a.rating || a.cost - b.cost || a.id.localeCompare(b.id);
    });
    return list;
  }

  function cardHTML(i) {
    const rev = ideaRevenue(i);
    const meta = i.difficulty + '难度 · ' + (i.cost ? money(i.cost) + ' 启动' : '0 成本') +
      (rev > 0 ? ' · 已收 ' + money(rev) : '');
    return '' +
      '<article class="card" data-open="' + esc(i.id) + '" tabindex="0" role="button" aria-label="' + esc(i.title) + '">' +
        '<div class="card-top">' +
          '<span class="num">' + esc(i.id) + '</span>' +
          '<span class="chip" data-cat="' + esc(i.category) + '">' + esc(i.category) + '</span>' +
          '<span class="stars" title="' + i.rating + ' 星">' + stars(i.rating) + '</span>' +
        '</div>' +
        '<h3>' + esc(i.title) + '</h3>' +
        '<p class="what">' + esc(i.what) + '</p>' +
        '<div class="facts">' +
          '<div><span>谁付钱</span><strong>' + esc(i.payer) + '</strong></div>' +
          '<div><span>第一块钱</span><strong>' + esc(i.first) + '</strong></div>' +
        '</div>' +
        '<div class="card-foot">' +
          '<span class="badge ' + statusClass(i.status) + '">' + esc(i.status) + '</span>' +
          '<span class="meta">' + esc(meta) + '</span>' +
          '<span class="open-hint">详情 →</span>' +
        '</div>' +
      '</article>';
  }

  function renderIdeas() {
    const list = getFilteredIdeas();
    const grid = $('#idea-grid');
    if (!grid) return;
    grid.innerHTML = list.map(cardHTML).join('');
    const empty = $('#ideas-empty');
    if (empty) empty.hidden = list.length !== 0;

    const count = $('#result-count');
    if (count) count.textContent = list.length + ' 个点子' + (list.length !== ideas.length ? ' / 共 ' + ideas.length : '');

    const bits = [];
    if (filters.q) bits.push('搜索“' + filters.q + '”');
    if (filters.category !== 'all') bits.push(filters.category);
    if (filters.status !== 'all') bits.push(filters.status);
    if (filters.difficulty !== 'all') bits.push(filters.difficulty + '难度');
    const active = $('#active-filters');
    if (active) active.textContent = bits.length ? '· ' + bits.join(' · ') : '';
  }

  /* ---------- board ---------- */
  function miniHTML(i) {
    return '' +
      '<div class="mini-card" draggable="true" data-id="' + esc(i.id) + '" data-open="' + esc(i.id) + '" tabindex="0" role="button">' +
        '<div class="mini-top">' +
          '<span class="num">' + esc(i.id) + '</span>' +
          '<span class="chip" data-cat="' + esc(i.category) + '">' + esc(i.category) + '</span>' +
        '</div>' +
        '<h4>' + esc(i.title) + '</h4>' +
        '<p>' + esc(i.payer) + ' · ' + esc(i.first) + '</p>' +
      '</div>';
  }

  function renderBoard() {
    const board = $('#board-grid');
    if (!board) return;
    board.innerHTML = STATUSES.map((status) => {
      const list = ideas.filter((i) => i.status === status)
        .sort((a, b) => b.rating - a.rating || a.id.localeCompare(b.id));
      const visible = list.slice(0, 12);
      const more = list.length > 12
        ? '<p class="empty-log">还有 ' + (list.length - 12) + ' 个，去点子库筛选</p>'
        : '';
      const body = visible.length
        ? visible.map(miniHTML).join('') + more
        : '<p class="empty-log">拖到这里</p>';
      return '' +
        '<div class="column">' +
          '<div class="col-head"><h3>' + status + '</h3><span>' + list.length + '</span></div>' +
          '<div class="col-body" data-drop="' + status + '">' + body + '</div>' +
        '</div>';
    }).join('');
  }

  function setStatus(id, status) {
    const idea = ideas.find((i) => i.id === id);
    if (!idea || idea.status === status) return;
    idea.status = status;
    if (status === '验证中' && !idea.next) idea.next = '先找 10 个客户，收第一笔钱。';
    saveIdeas();
    renderAll();
    toast('已移到「' + status + '」');
  }

  /* ---------- reviews ---------- */
  function renderReviews() {
    const listEl = $('#review-list');
    const countEl = $('#review-count');
    if (!listEl) return;

    if (countEl) countEl.textContent = reviews.length + ' 条';

    const sorted = [...reviews].sort((a, b) =>
      String(b.date || '').localeCompare(String(a.date || '')) || (b.id - a.id)
    );

    listEl.innerHTML = sorted.length ? sorted.map((r) => {
      const nums = '订阅 ' + num(r.subs) + ' · 播放 ' + num(r.views) +
        ' · 实验 ' + num(r.experiments) + ' · 收入 ' + money(r.revenue) +
        ' · 支出 ' + money(r.spend);
      return '' +
        '<div class="review-item">' +
          '<div class="review-top">' +
            '<span class="review-date">' + esc(r.date) + '</span>' +
            '<button class="review-del" data-del-review="' + esc(r.id) + '">删除</button>' +
          '</div>' +
          '<div class="review-nums">' + esc(nums) + '</div>' +
          (r.lesson ? '<p class="review-lesson">' + esc(r.lesson) + '</p>' : '') +
          (r.next ? '<p class="review-next">下周：' + esc(r.next) + '</p>' : '') +
        '</div>';
    }).join('') : '<p class="empty-log">还没有复盘记录。每周日花 30 分钟，记下 6 个数。</p>';

    const chart = $('#review-chart');
    if (!chart) return;
    const recent = [...reviews].sort((a, b) =>
      String(a.date || '').localeCompare(String(b.date || '')) || (a.id - b.id)
    ).slice(-8);
    if (!recent.length) {
      chart.innerHTML = '<p class="empty-log">收入曲线会出现在这里。</p>';
      return;
    }
    const max = Math.max(1, ...recent.map((r) => Number(r.revenue) || 0));
    chart.innerHTML = recent.map((r) => {
      const value = Number(r.revenue) || 0;
      const h = Math.max(4, Math.round((value / max) * 100));
      return '' +
        '<div class="bar-wrap" title="' + esc(r.date) + ' · ' + money(value) + '">' +
          '<em>' + (value ? money(value) : '') + '</em>' +
          '<div class="bar" style="height:' + h + '%"></div>' +
          '<span>' + esc(String(r.date || '').slice(5)) + '</span>' +
        '</div>';
    }).join('');
  }

  function autofillReview() {
    const cutoff = daysAgo(6);
    const end = today();
    const logs = allLogs().filter((l) => l.date && l.date >= cutoff && l.date <= end);
    $('#rv-exp').value = logs.length;
    $('#rv-revenue').value = logs.reduce((s, l) => s + (Number(l.revenue) || 0), 0);
    $('#rv-spend').value = logs.reduce((s, l) => s + (Number(l.cost) || 0), 0);
    toast('已按最近 7 天的 ' + logs.length + ' 条实验记录填入');
  }

  /* ---------- data ---------- */
  function renderData() {
    const tbody = $('#data-table');
    if (!tbody) return;
    const cats = [...new Set(ideas.map((i) => i.category))];
    tbody.innerHTML = cats.map((cat) => {
      const list = ideas.filter((i) => i.category === cat);
      const paid = list.filter((i) => i.status === '收到第一块钱' || ideaRevenue(i) > 0).length;
      const rev = list.reduce((s, i) => s + ideaRevenue(i), 0);
      const exp = list.reduce((s, i) => s + idealogCount(i), 0);
      return '<tr><td>' + esc(cat) + '</td><td>' + list.length + '</td><td>' + paid + '</td><td>' + money(rev) + '</td><td>' + exp + '</td></tr>';
    }).join('');
    updateStorageInfo();
  }

  function updateStorageInfo() {
    const el = $('#storage-info');
    if (!el) return;
    try {
      const bytes = new Blob([JSON.stringify({ ideas, reviews })]).size;
      el.textContent = '当前数据约 ' + (bytes / 1024).toFixed(1) + ' KB · 保存在本机浏览器';
    } catch (e) {
      el.textContent = '数据保存在本机浏览器。';
    }
  }

  /* ---------- modal: detail ---------- */
  function renderLogs(idea) {
    if (!idea.logs.length) {
      return '<p class="empty-log">还没有实验记录。第一次实验不用完美，先收 1 块钱。</p>';
    }
    return [...idea.logs]
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
      .map((l) => '' +
        '<div class="log-item">' +
          '<div class="log-date">' + esc(l.date) + '</div>' +
          '<div class="log-body">' +
            '<strong>' + esc(l.action) + '</strong>' +
            (l.result ? '<p>' + esc(l.result) + '</p>' : '') +
            (l.lesson ? '<p class="lesson">' + esc(l.lesson) + '</p>' : '') +
          '</div>' +
          '<div class="log-money">' +
            (l.revenue ? '<span class="in">+' + money(l.revenue) + '</span>' : '') +
            (l.cost ? '<span class="out">-' + money(l.cost) + '</span>' : '') +
          '</div>' +
          '<button class="log-del" data-del-log="' + esc(l.id) + '" aria-label="删除记录">×</button>' +
        '</div>'
      ).join('');
  }

  function openDetail(id) {
    const idea = ideas.find((i) => i.id === id);
    if (!idea) return;
    const root = $('#modal-root');
    const prevScroll = root.querySelector('.modal') ? root.querySelector('.modal').scrollTop : 0;
    currentId = id;
    const rev = ideaRevenue(idea);
    const spend = ideaSpend(idea);

    root.innerHTML = '' +
      '<div class="modal-backdrop">' +
        '<div class="modal" role="dialog" aria-modal="true" aria-label="' + esc(idea.title) + '">' +
          '<button class="modal-x" data-close aria-label="关闭">×</button>' +
          '<div class="modal-head">' +
            '<span class="num">' + esc(idea.id) + '</span>' +
            '<span class="chip" data-cat="' + esc(idea.category) + '">' + esc(idea.category) + '</span>' +
            '<span class="badge ' + statusClass(idea.status) + '">' + esc(idea.status) + '</span>' +
            '<span class="stars">' + stars(idea.rating) + '</span>' +
          '</div>' +
          '<h2>' + esc(idea.title) + '</h2>' +
          '<p class="modal-what">' + esc(idea.what) + '</p>' +
          '<div class="detail-grid">' +
            '<div><span>谁付钱</span><strong>' + esc(idea.payer) + '</strong></div>' +
            '<div><span>第一块钱怎么收</span><strong>' + esc(idea.first) + '</strong></div>' +
            '<div><span>难度 / 启动成本</span><strong>' + esc(idea.difficulty) + ' · ' + (idea.cost ? money(idea.cost) : '0 成本') + '</strong></div>' +
            '<div><span>合规 / 风险</span><strong>' + esc(idea.risk) + '</strong></div>' +
          '</div>' +
          '<div class="edit-grid">' +
            '<label>状态<select id="m-status">' +
              STATUSES.map((s) => '<option' + (s === idea.status ? ' selected' : '') + '>' + s + '</option>').join('') +
            '</select></label>' +
            '<label>下一步<input id="m-next" value="' + esc(idea.next) + '" placeholder="先找 10 个客户…"></label>' +
            '<label class="span-2">备注<textarea id="m-notes" rows="2" placeholder="客户原话、卡点、报价…">' + esc(idea.notes) + '</textarea></label>' +
          '</div>' +
          '<div class="modal-actions">' +
            '<button class="btn primary" id="m-save">保存修改</button>' +
            '<span class="muted">累计收入 ' + money(rev) + ' · 支出 ' + money(spend) + '</span>' +
          '</div>' +
          '<div class="logs">' +
            '<div class="logs-head"><h3>实验记录</h3><span>' + idea.logs.length + ' 条 · 收入 ' + money(rev) + ' · 支出 ' + money(spend) + '</span></div>' +
            '<div class="log-list" id="m-logs">' + renderLogs(idea) + '</div>' +
            '<form class="log-form" id="m-log-form">' +
              '<input type="date" id="l-date" value="' + today() + '" required>' +
              '<input id="l-action" placeholder="做了什么" required>' +
              '<input id="l-result" placeholder="结果如何">' +
              '<div class="log-money">' +
                '<input type="number" id="l-revenue" step="0.01" placeholder="收入（元）">' +
                '<input type="number" id="l-cost" step="0.01" placeholder="支出（元）">' +
              '</div>' +
              '<textarea id="l-lesson" rows="2" placeholder="学到什么 / 下次怎么改"></textarea>' +
              '<button class="btn primary" type="submit">添加记录</button>' +
            '</form>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      const modal = root.querySelector('.modal');
      if (modal) modal.scrollTop = prevScroll;
    });
    bindModal(idea);
  }

  function bindModal(idea) {
    const root = $('#modal-root');
    const backdrop = root.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeModal();
      });
    }
    const x = root.querySelector('.modal-x');
    if (x) x.addEventListener('click', closeModal);

    const saveBtn = $('#m-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const target = ideas.find((i) => i.id === currentId);
        if (!target) return;
        target.status = $('#m-status').value;
        target.next = $('#m-next').value.trim();
        target.notes = $('#m-notes').value.trim();
        saveIdeas();
        renderAll();
        closeModal();
        toast('已保存修改');
      });
    }

    const form = $('#m-log-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const action = $('#l-action').value.trim();
        if (!action) { toast('先写“做了什么”'); return; }
        const target = ideas.find((i) => i.id === currentId);
        if (!target) return;
        const log = {
          id: Date.now().toString(36),
          date: $('#l-date').value || today(),
          action,
          result: $('#l-result').value.trim(),
          lesson: $('#l-lesson').value.trim(),
          revenue: Number($('#l-revenue').value) || 0,
          cost: Number($('#l-cost').value) || 0
        };
        target.logs = target.logs || [];
        target.logs.push(log);
        if (log.revenue > 0 && target.status !== '放弃') target.status = '收到第一块钱';
        else if (target.status === '未验证') target.status = '验证中';
        if (!target.next && log.result) target.next = log.result;
        saveIdeas();
        renderAll();
        openDetail(currentId);
        toast(log.revenue > 0 ? '收到第一块钱，记下了' : '实验记录已添加');
      });
    }

    root.querySelectorAll('[data-del-log]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!confirm('删除这条实验记录？')) return;
        const target = ideas.find((i) => i.id === currentId);
        if (!target) return;
        target.logs = target.logs.filter((l) => String(l.id) !== btn.dataset.delLog);
        saveIdeas();
        renderAll();
        openDetail(currentId);
        toast('记录已删除');
      });
    });
  }

  function closeModal() {
    const root = $('#modal-root');
    if (root) root.innerHTML = '';
    document.body.style.overflow = '';
    currentId = null;
  }

  /* ---------- modal: add idea ---------- */
  function openAdd() {
    const root = $('#modal-root');
    const cats = [...new Set(ideas.map((i) => i.category))];
    const options = cats.map((c) => '<option>' + esc(c) + '</option>').join('') +
      (cats.includes('其他') ? '' : '<option>其他</option>');

    root.innerHTML = '' +
      '<div class="modal-backdrop">' +
        '<div class="modal" role="dialog" aria-modal="true" aria-label="新点子">' +
          '<button class="modal-x" data-close aria-label="关闭">×</button>' +
          '<p class="eyebrow">新点子</p>' +
          '<h2>加一个你自己的点子</h2>' +
          '<p class="modal-what">还是那三条：谁付钱、第一块钱怎么收、48 小时能不能找到 10 个客户。</p>' +
          '<div class="edit-grid">' +
            '<label>分类<select id="a-category">' + options + '</select></label>' +
            '<label>推荐指数<select id="a-rating">' +
              [5, 4, 3, 2, 1].map((n) => '<option value="' + n + '"' + (n === 4 ? ' selected' : '') + '>' + stars(n) + '</option>').join('') +
            '</select></label>' +
            '<label class="span-2">点子<input id="a-title" placeholder="一句话说清它是什么"></label>' +
            '<label class="span-2">具体做什么<textarea id="a-what" rows="2" placeholder="输入什么、输出什么、交付物是什么"></textarea></label>' +
            '<label>谁付钱<input id="a-payer" placeholder="店老板 / 家长 / 中介…"></label>' +
            '<label>第一块钱怎么收<input id="a-first" placeholder="先做 1 单，收 99 元"></label>' +
            '<label>难度<select id="a-difficulty"><option>低</option><option>中</option><option>高</option></select></label>' +
            '<label>启动成本（元）<input type="number" id="a-cost" min="0" value="0"></label>' +
            '<label class="span-2">合规 / 风险<input id="a-risk" placeholder="不承诺结果 / 隐私 / 需要资质"></label>' +
          '</div>' +
          '<div class="modal-actions">' +
            '<button class="btn primary" id="a-save">保存点子</button>' +
            '<span class="muted">保存后出现在点子库，也会进入看板。</span>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.style.overflow = 'hidden';
    const backdrop = root.querySelector('.modal-backdrop');
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });
    root.querySelector('.modal-x').addEventListener('click', closeModal);
    $('#a-save').addEventListener('click', () => {
      const title = $('#a-title').value.trim();
      const payer = $('#a-payer').value.trim();
      const first = $('#a-first').value.trim();
      if (!title || !payer || !first) {
        toast('点子、谁付钱、第一块钱怎么收，这三项必填');
        return;
      }
      const max = ideas.reduce((m, i) => {
        const n = parseInt(i.id, 10);
        return Number.isFinite(n) ? Math.max(m, n) : m;
      }, 100);
      const id = String(max + 1).padStart(3, '0');
      ideas.push(normalizeIdea({
        id,
        category: $('#a-category').value,
        title,
        what: $('#a-what').value.trim(),
        payer,
        first,
        difficulty: $('#a-difficulty').value,
        cost: Number($('#a-cost').value) || 0,
        risk: $('#a-risk').value.trim(),
        rating: Number($('#a-rating').value) || 3,
        status: '未验证',
        notes: '',
        next: '',
        logs: [],
        custom: true
      }));
      saveIdeas();
      populateFilters();
      renderAll();
      closeModal();
      toast('新点子已加入');
      openDetail(id);
    });
  }

  /* ---------- import / export ---------- */
  function exportJSON() {
    const payload = {
      app: '蜂院长 · 100 个 AI 点子',
      version: 1,
      exportedAt: new Date().toISOString(),
      ideas,
      reviews
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'fengyuanzhang-ideas-' + today() + '.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('已导出 JSON');
  }

  async function importJSON(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const arr = Array.isArray(data) ? data : data.ideas;
      if (!Array.isArray(arr) || !arr.length) throw new Error('没有找到 ideas 数组');
      if (!confirm('导入 ' + arr.length + ' 个点子，会覆盖当前数据。继续？')) return;
      ideas = arr.map(normalizeIdea);
      reviews = Array.isArray(data.reviews) ? data.reviews : [];
      saveIdeas();
      saveReviews();
      filters = { q: '', category: 'all', status: 'all', difficulty: 'all', sort: 'rating' };
      populateFilters();
      syncFilterUI();
      renderAll();
      toast('导入完成');
    } catch (err) {
      toast('导入失败：' + err.message);
    }
  }

  function resetAll() {
    if (!confirm('恢复默认 100 个点子？当前修改和复盘会清空。')) return;
    ideas = clone(DEFAULT_IDEAS).map(normalizeIdea);
    reviews = [];
    filters = { q: '', category: 'all', status: 'all', difficulty: 'all', sort: 'rating' };
    saveIdeas();
    saveReviews();
    populateFilters();
    syncFilterUI();
    renderAll();
    toast('已恢复默认 100 个');
  }

  /* ---------- views ---------- */
  function setView(v) {
    if (!VIEWS.includes(v)) v = 'ideas';
    currentView = v;
    $$('.view').forEach((el) => el.classList.toggle('active', el.id === 'view-' + v));
    $$('.tab').forEach((el) => el.classList.toggle('active', el.dataset.view === v));
    if (v === 'ideas') renderIdeas();
    if (v === 'board') renderBoard();
    if (v === 'review') renderReviews();
    if (v === 'data') renderData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleHash() {
    const h = location.hash.replace('#', '') || 'ideas';
    const m = h.match(/^idea-(\d+)$/);
    if (m) {
      setView('ideas');
      openDetail(m[1]);
      return;
    }
    setView(VIEWS.includes(h) ? h : 'ideas');
  }

  function navigate(v) {
    if (!VIEWS.includes(v)) v = 'ideas';
    if (location.hash === '#' + v) setView(v);
    else location.hash = v;
  }

  function renderAll() {
    renderStats();
    renderNext();
    renderIdeas();
    if (currentView === 'board') renderBoard();
    if (currentView === 'review') renderReviews();
    if (currentView === 'data') renderData();
    updateStorageInfo();
  }

  /* ---------- events ---------- */
  function bindEvents() {
    $$('.tab').forEach((btn) => btn.addEventListener('click', () => navigate(btn.dataset.view)));
    window.addEventListener('hashchange', handleHash);

    const search = $('#search');
    if (search) {
      search.addEventListener('input', (e) => {
        clearTimeout(searchTimer);
        const value = e.target.value.trim().toLowerCase();
        searchTimer = setTimeout(() => {
          filters.q = value;
          renderIdeas();
        }, 120);
      });
    }

    const map = {
      'filter-category': 'category',
      'filter-status': 'status',
      'filter-difficulty': 'difficulty',
      'sort': 'sort'
    };
    Object.keys(map).forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('change', () => {
        filters[map[id]] = el.value;
        renderIdeas();
      });
    });

    const add = $('#add-idea');
    if (add) add.addEventListener('click', openAdd);

    const start = $('#start-next');
    if (start) {
      start.addEventListener('click', () => {
        const id = start.dataset.id;
        if (!id) return;
        const idea = ideas.find((i) => i.id === id);
        if (idea && idea.status === '未验证') {
          idea.status = '验证中';
          if (!idea.next) idea.next = '先找 10 个客户，收第一笔钱。';
          saveIdeas();
          renderAll();
        }
        openDetail(id);
      });
    }

    const reviewForm = $('#review-form');
    if (reviewForm) {
      reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const review = {
          id: Date.now(),
          date: $('#rv-date').value || today(),
          subs: Number($('#rv-subs').value) || 0,
          views: Number($('#rv-views').value) || 0,
          experiments: Number($('#rv-exp').value) || 0,
          revenue: Number($('#rv-revenue').value) || 0,
          spend: Number($('#rv-spend').value) || 0,
          lesson: $('#rv-lesson').value.trim(),
          next: $('#rv-next').value.trim()
        };
        reviews.push(review);
        saveReviews();
        renderReviews();
        $('#rv-lesson').value = '';
        $('#rv-next').value = '';
        toast('复盘已保存');
      });
    }

    const autofill = $('#autofill-review');
    if (autofill) autofill.addEventListener('click', autofillReview);

    const exportBtn = $('#export-btn');
    if (exportBtn) exportBtn.addEventListener('click', exportJSON);

    const importInput = $('#import-input');
    if (importInput) {
      importInput.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) await importJSON(file);
        e.target.value = '';
      });
    }

    const resetBtn = $('#reset-btn');
    if (resetBtn) resetBtn.addEventListener('click', resetAll);

    const grid = $('#idea-grid');
    if (grid) {
      grid.addEventListener('click', (e) => {
        const card = e.target.closest('[data-open]');
        if (card) openDetail(card.dataset.open);
      });
      grid.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-open]')) {
          e.preventDefault();
          openDetail(e.target.dataset.open);
        }
      });
    }

    const board = $('#board-grid');
    if (board) {
      board.addEventListener('click', (e) => {
        const card = e.target.closest('[data-open]');
        if (card) openDetail(card.dataset.open);
      });
      board.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.mini-card')) {
          e.preventDefault();
          openDetail(e.target.dataset.id);
        }
      });
      board.addEventListener('dragstart', (e) => {
        const card = e.target.closest('.mini-card');
        if (!card) return;
        e.dataTransfer.setData('text/plain', card.dataset.id);
        e.dataTransfer.effectAllowed = 'move';
        card.classList.add('dragging');
      });
      board.addEventListener('dragend', () => {
        $$('.mini-card').forEach((c) => c.classList.remove('dragging'));
        $$('.col-body').forEach((c) => c.classList.remove('drag-over'));
      });
      board.addEventListener('dragover', (e) => {
        const col = e.target.closest('.col-body');
        if (!col) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        $$('.col-body').forEach((c) => c.classList.toggle('drag-over', c === col));
      });
      board.addEventListener('dragleave', (e) => {
        const col = e.target.closest('.col-body');
        if (col && !col.contains(e.relatedTarget)) col.classList.remove('drag-over');
      });
      board.addEventListener('drop', (e) => {
        const col = e.target.closest('.col-body');
        if (!col) return;
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        const status = col.dataset.drop;
        if (id && status) setStatus(id, status);
        $$('.col-body').forEach((c) => c.classList.remove('drag-over'));
      });
    }

    const reviewList = $('#review-list');
    if (reviewList) {
      reviewList.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-del-review]');
        if (!btn) return;
        if (!confirm('删除这条复盘？')) return;
        reviews = reviews.filter((r) => String(r.id) !== btn.dataset.delReview);
        saveReviews();
        renderReviews();
        toast('复盘已删除');
      });
    }

    document.addEventListener('keydown', (e) => {
      const tag = (document.activeElement && document.activeElement.tagName) || '';
      if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(tag)) {
        e.preventDefault();
        const s = $('#search');
        if (s) s.focus();
      }
      if (e.key === 'Escape') closeModal();
    });
  }

  /* ---------- init ---------- */
  function init() {
    ideas = loadIdeas();
    reviews = loadReviews();
    populateFilters();
    syncFilterUI();
    bindEvents();

    handleHash();
    if (!location.hash) history.replaceState(null, '', '#ideas');

    const d = $('#rv-date');
    if (d) d.value = today();
    renderAll();
  }

  document.addEventListener('DOMContentLoaded', init);
})();

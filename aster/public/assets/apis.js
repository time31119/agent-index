(function () {
  'use strict';

  var state = { items: [], region: '全部', q: '', available: {} };
  var $ = function (s) { return document.querySelector(s); };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function regionOf(x) {
    return x.region === '中国' || x.region === '美国' ? x.region : '其他';
  }

  function isAvailable(vendor) {
    var v = vendor === '阿里云' ? '阿里' : vendor;
    return !!state.available[v];
  }

  function countRegion(name) {
    if (name === '全部') return state.items.length;
    return state.items.filter(function (x) { return regionOf(x) === name; }).length;
  }

  function renderChips() {
    var box = $('#regionChips');
    if (!box) return;
    var names = ['全部', '中国', '美国', '其他'];
    box.innerHTML = names.map(function (n) {
      return '<button class="chip' + (state.region === n ? ' on' : '') + '" data-region="' + n + '">' +
        n + ' <span style="opacity:.55">' + countRegion(n) + '</span></button>';
    }).join('');
  }

  function matches(x) {
    if (state.region !== '全部' && regionOf(x) !== state.region) return false;
    if (!state.q) return true;
    var q = state.q.toLowerCase();
    return [x.vendor, x.model, x.base, x.form, x.access, x.tier, x.note, x.auth]
      .join(' ').toLowerCase().indexOf(q) >= 0;
  }

  function compatBadge(v) {
    if (v === '是') return '<span class="badge ok">是</span>';
    if (v === '部分') return '<span class="badge warn">部分</span>';
    return '<span class="badge">否</span>';
  }

  function renderTable() {
    var body = $('#dirRows');
    var list = state.items.filter(matches);
    var count = $('#dirCount');
    if (count) count.textContent = '显示 ' + list.length + ' / ' + state.items.length + ' 条';

    if (!list.length) {
      body.innerHTML = '<tr><td colspan="7" class="empty-row">没有匹配的条目，换个关键词试试</td></tr>';
      return;
    }

    body.innerHTML = list.map(function (x) {
      var hasUrl = x.base && x.base !== '—';
      var urlCell = hasUrl
        ? '<div class="url-cell"><code title="' + esc(x.base) + '">' + esc(x.base) + '</code>' +
          '<button class="copy-btn" data-copy="' + esc(x.base) + '" title="复制 Base URL" aria-label="复制 Base URL">⧉</button></div>'
        : '<span class="dim">—</span>';

      return '<tr>' +
        '<td><div class="model-cell">' +
          '<span class="model-avatar">' + esc(x.vendor.slice(0, 1)) + '</span>' +
          '<span class="vendor-cell"><b>' + esc(x.vendor) +
            (isAvailable(x.vendor) ? ' <span class="badge ok" style="font-size:10px;padding:1px 6px;vertical-align:1px">已上架</span>' : '') +
          '</b><small>' + esc(x.region) + '</small></span>' +
        '</div></td>' +
        '<td><b style="font-weight:550">' + esc(x.model) + '</b></td>' +
        '<td><div style="font-size:12.8px">' + esc(x.form) + '</div>' +
          '<small class="dim" style="font-size:11.5px">' + esc(x.access) + '</small></td>' +
        '<td class="url">' + urlCell + '</td>' +
        '<td class="col-auth mono" style="font-size:11.8px;color:var(--muted)">' + esc(x.auth) + '</td>' +
        '<td>' + compatBadge(x.compat) + '</td>' +
        '<td class="col-tier"><span class="tier">' + esc(x.tier) + '</span></td>' +
      '</tr>';
    }).join('');
  }

  function copyText(text, btn) {
    var done = function () {
      btn.classList.add('done');
      btn.textContent = '✓';
      setTimeout(function () { btn.classList.remove('done'); btn.textContent = '⧉'; }, 1200);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallback(text, done); });
    } else {
      fallback(text, done);
    }
  }

  function fallback(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }

  function bind() {
    var chips = $('#regionChips');
    if (chips) {
      chips.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-region]');
        if (!btn) return;
        state.region = btn.getAttribute('data-region');
        renderChips();
        renderTable();
      });
    }

    var q = $('#q');
    if (q) {
      q.addEventListener('input', function () {
        state.q = q.value.trim();
        renderTable();
      });
    }

    var body = $('#dirRows');
    if (body) {
      body.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-copy]');
        if (!btn) return;
        copyText(btn.getAttribute('data-copy'), btn);
      });
    }
  }

  function shapeOf(x) {
    var f = String(x.form || '');
    if (f.indexOf('自部署') >= 0) return '自部署';
    if (f.indexOf('兼容') >= 0 || f.toLowerCase().indexOf('openai') >= 0) return 'OpenAI 兼容';
    return '原生协议';
  }

  function setStats(data) {
    var byRegion = {};
    data.regions.forEach(function (r) { byRegion[r.name] = r.count; });
    var compat = 0;
    data.compat.forEach(function (c) { if (c.name === '是') compat = c.count; });
    var shapes = {};
    state.items.forEach(function (x) { shapes[shapeOf(x)] = 1; });
    var set = function (id, v) { var el = $('#' + id); if (el) el.textContent = v; };
    set('stTotal', data.total);
    set('stCn', byRegion['中国'] || 0);
    set('stCompat', compat);
    set('stForms', Object.keys(shapes).length);
    set('dirTotal', data.total);
    set('dirVersion', data.version || '2026-11');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
    bind();

    fetch('/api/public/apis').then(function (r) { return r.json(); }).then(function (data) {
      state.items = data.items || [];
      (data.available_vendors || []).forEach(function (v) { state.available[v] = 1; });
      setStats(data);
      renderChips();
      renderTable();
    }).catch(function () {
      var body = $('#dirRows');
      if (body) body.innerHTML = '<tr><td colspan="7" class="empty-row">目录加载失败，请刷新页面重试</td></tr>';
      var c = $('#dirCount');
      if (c) c.textContent = '加载失败';
    });
  });
})();

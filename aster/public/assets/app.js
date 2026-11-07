/* ASTER · 控制台 SPA */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var state = { me: null, catalog: null, view: 'dashboard', query: {} };

  /* ---------------- 工具 ---------------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function money(m) {
    var v = (Number(m) || 0) / 1e6;
    return '¥' + v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function int(n) {
    return String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function compact(n) {
    n = Number(n) || 0;
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return String(Math.round(n));
  }

  function dt(ts) {
    if (!ts) return '—';
    var d = new Date(ts);
    var p = function (x) { return String(x).padStart(2, '0'); };
    return p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function ago(ts) {
    if (!ts) return '从未';
    var s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
    if (s < 60) return s + ' 秒前';
    if (s < 3600) return Math.floor(s / 60) + ' 分钟前';
    if (s < 86400) return Math.floor(s / 3600) + ' 小时前';
    return Math.floor(s / 86400) + ' 天前';
  }

  async function api(path, opts) {
    var o = Object.assign({ credentials: 'same-origin', headers: {} }, opts || {});
    if (o.body && typeof o.body !== 'string') {
      o.headers['Content-Type'] = 'application/json';
      o.body = JSON.stringify(o.body);
    }
    var r = await fetch(path, o);
    var data = {};
    try { data = await r.json(); } catch (e) { data = {}; }
    if (r.status === 401) { location.href = '/login'; throw new Error('登录已过期'); }
    if (!r.ok) {
      var msg = (data.error && data.error.message) || data.message || ('请求失败 ' + r.status);
      var err = new Error(msg);
      err.code = data.error && data.error.code;
      throw err;
    }
    return data;
  }

  /* ---------------- 反馈 ---------------- */
  function toast(msg, type) {
    var root = $('#toastRoot');
    var el = document.createElement('div');
    el.className = 'toast ' + (type || '');
    el.textContent = msg;
    root.appendChild(el);
    setTimeout(function () {
      el.style.opacity = '0';
      el.style.transform = 'translateY(6px)';
      el.style.transition = 'all .2s';
      setTimeout(function () { el.remove(); }, 220);
    }, 2600);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { toast('已复制到剪贴板', 'ok'); });
    }
    var ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); toast('已复制到剪贴板', 'ok'); } catch (e) { toast('复制失败，请手动选择', 'err'); }
    ta.remove();
    return Promise.resolve();
  }

  function openModal(opts) {
    var root = $('#modalRoot');
    var wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML = '<div class="modal" role="dialog" aria-modal="true">' +
      '<div class="modal-head"><h3>' + esc(opts.title) + '</h3>' +
      '<button class="icon-btn" data-close aria-label="关闭">✕</button></div>' +
      '<div class="modal-body">' + (opts.body || '') + '</div>' +
      (opts.footer === false ? '' : '<div class="modal-foot"><button class="btn" data-close>取消</button>' +
        '<button class="btn btn-primary" data-submit>' + esc(opts.submit || '确定') + '</button></div>') +
      '</div>';
    root.appendChild(wrap);

    function close() { wrap.remove(); document.removeEventListener('keydown', onKey); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);

    wrap.addEventListener('click', function (e) {
      if (e.target === wrap || e.target.closest('[data-close]')) close();
    });

    var submitBtn = $('[data-submit]', wrap);
    if (submitBtn && opts.onSubmit) {
      submitBtn.addEventListener('click', async function () {
        submitBtn.disabled = true;
        var label = submitBtn.textContent;
        submitBtn.textContent = '处理中…';
        try {
          var keep = await opts.onSubmit(wrap);
          if (keep !== false) close();
        } catch (err) {
          toast(err.message || '操作失败', 'err');
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = label;
        }
      });
    }
    if (opts.onMount) opts.onMount(wrap);
    return { el: wrap, close: close };
  }

  function confirmModal(title, text, onYes) {
    openModal({
      title: title,
      body: '<p class="muted" style="font-size:13.4px">' + esc(text) + '</p>',
      submit: '确认',
      onSubmit: onYes,
    });
  }

  /* ---------------- 图形 ---------------- */
  function areaChart(series, key, color) {
    var w = 620, h = 180, pad = 8;
    var max = 1;
    series.forEach(function (s) { if (s[key] > max) max = s[key]; });
    var n = series.length;
    var pts = series.map(function (s, i) {
      var x = pad + (n > 1 ? i * (w - pad * 2) / (n - 1) : 0);
      var y = h - pad - (s[key] / max) * (h - pad * 2 - 6);
      return [Number(x.toFixed(1)), Number(y.toFixed(1))];
    });
    if (!pts.length) return '<div class="empty">暂无数据</div>';
    var line = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0] + ' ' + p[1]; }).join(' ');
    var area = line + ' L ' + pts[pts.length - 1][0] + ' ' + (h - pad) + ' L ' + pts[0][0] + ' ' + (h - pad) + ' Z';
    var c = color || '#7c6bff';
    var gid = 'ag' + Math.random().toString(36).slice(2, 8);
    var dots = pts.map(function (p, i) {
      if (n > 12 && i % 2 === 1) return '';
      return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="2.4" fill="' + c + '"/>';
    }).join('');
    return '<svg class="chart" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">' +
      '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="' + c + '" stop-opacity="0.35"/>' +
      '<stop offset="100%" stop-color="' + c + '" stop-opacity="0"/></linearGradient></defs>' +
      '<path d="' + area + '" fill="url(#' + gid + ')"/>' +
      '<path d="' + line + '" fill="none" stroke="' + c + '" stroke-width="2" vector-effect="non-scaling-stroke"/>' +
      dots + '</svg>';
  }

  function axisLabels(series) {
    return '<div style="display:flex;justify-content:space-between;font-size:10.5px;color:var(--dim);margin-top:8px">' +
      series.map(function (s, i) {
        if (series.length > 10 && i % 3 !== 0 && i !== series.length - 1) return '<span></span>';
        return '<span>' + esc(s.date) + '</span>';
      }).join('') + '</div>';
  }

  /* ---------------- 布局片段 ---------------- */
  function kpi(label, value, foot, accent) {
    return '<div class="kpi"><div class="label"><span>' + esc(label) + '</span>' +
      (accent ? '<span class="badge ' + accent.cls + '">' + esc(accent.text) + '</span>' : '') +
      '</div><div class="value">' + value + '</div>' +
      (foot ? '<div class="foot">' + foot + '</div>' : '') + '</div>';
  }

  function pageHead(title, sub, actions) {
    return '<div class="page-head"><div><h2>' + esc(title) + '</h2><p>' + esc(sub) + '</p></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' + (actions || '') + '</div></div>';
  }

  function statusPill(status) {
    if (status === 'active' || status === 200) return '<span class="pill-status"><i></i>正常</span>';
    if (status === 'disabled' || status === 'banned') return '<span class="pill-status err"><i></i>已停用</span>';
    if (status === 'pending') return '<span class="pill-status warn"><i></i>待支付</span>';
    return '<span class="pill-status err"><i></i>失败</span>';
  }

  /* ---------------- 路由 ---------------- */
  var VIEWS = {};

  function currentRoute() {
    var raw = (location.hash || '').replace(/^#\/?/, '');
    return raw || 'dashboard';
  }

  async function render() {
    var view = currentRoute();
    state.view = view;
    var fn = VIEWS[view] || VIEWS.dashboard;
    $$('.side-nav a').forEach(function (a) {
      a.classList.toggle('on', a.getAttribute('data-view') === view);
    });
    var titles = {
      dashboard: '概览', playground: '演练场', models: '模型广场', keys: '令牌管理',
      usage: '用量明细', wallet: '钱包与账单', settings: '账号设置',
      admin: '运营概览', 'admin-models': '模型与定价', 'admin-groups': '令牌分组',
      'admin-upstreams': '上游渠道', 'admin-users': '用户与额度', 'admin-ledger': '资金流水',
      'admin-automation': '自动化引擎',
    };
    $('#pageTitle').textContent = titles[view] || '控制台';
    var root = $('#view');
    root.innerHTML = '<div class="loading"><div class="spinner"></div>加载中…</div>';
    try {
      await fn(root);
    } catch (err) {
      root.innerHTML = '<div class="panel"><div class="empty">' + esc(err.message || '加载失败') + '</div></div>';
    }
  }

  /* ==================================================================
   * 概览
   * ================================================================== */
  VIEWS.dashboard = async function (root) {
    var range = state.query.range || '7d';
    var d = await api('/api/dashboard?range=' + encodeURIComponent(range));
    var s = d.stats;
    var spendDelta = s.prev_spend ? ((s.spend - s.prev_spend) / s.prev_spend) * 100 : 0;
    var reqDelta = s.prev_requests ? ((s.requests - s.prev_requests) / s.prev_requests) * 100 : 0;

    root.innerHTML = pageHead('概览', '账户余额、消费趋势与调用健康度', 
      '<select class="select btn-sm" id="rangeSel" style="width:120px;height:38px">' +
        ['7d', '30d'].map(function (r) {
          return '<option value="' + r + '"' + (range === r ? ' selected' : '') + '>' + (r === '7d' ? '近 7 天' : '近 30 天') + '</option>';
        }).join('') + '</select>' +
      '<a class="btn btn-primary" href="#/keys">新建令牌</a>') +

      (d.notices && d.notices.length
        ? '<div class="panel" style="margin-bottom:14px"><div class="panel-body" style="padding:12px 16px;font-size:12.8px;color:var(--muted)">' +
          '<b style="color:var(--text)">公告</b> · ' + esc(d.notices[d.notices.length - 1].text) + '</div></div>'
        : '') +

      '<div class="kpi-grid">' +
        kpi('可用余额', money(s.available), '余额 ' + money(s.balance) + (state.me.credit_limit ? ' · 授信 ' + money(state.me.credit_limit) : '')) +
        kpi('本期消费', money(s.spend), (spendDelta >= 0 ? '<span class="up">↑ ' : '<span class="down">↓ ') + Math.abs(spendDelta).toFixed(1) + '%</span> 环比上期') +
        kpi('请求数', int(s.requests), (reqDelta >= 0 ? '<span class="up">↑ ' : '<span class="down">↓ ') + Math.abs(reqDelta).toFixed(1) + '%</span> 环比上期') +
        kpi('成功率', (s.success_rate * 100).toFixed(2) + '%', '平均耗时 ' + Math.round(s.avg_latency) + ' ms') +
      '</div>' +

      '<div class="grid-2" style="margin-bottom:14px">' +
        '<div class="panel"><div class="panel-head"><h3>消费趋势</h3>' +
          '<div class="chart-legend"><span><i style="background:#7c6bff"></i>消费（元）</span></div></div>' +
          '<div class="panel-body">' + areaChart(d.series, 'spend', '#7c6bff') + axisLabels(d.series) + '</div></div>' +

        '<div class="panel"><div class="panel-head"><h3>模型消费占比</h3><span class="tiny dim">' + compact(s.tokens) + ' tokens</span></div>' +
          '<div class="panel-body">' +
            (d.top_models.length ? d.top_models.map(function (m) {
              return '<div class="bar-row"><span class="name">' + esc(m.name) + '</span>' +
                '<div class="bar-track"><div class="bar-fill" style="width:' + Math.max(3, m.share * 100).toFixed(1) + '%"></div></div>' +
                '<span class="val">' + money(m.spend) + '</span></div>';
            }).join('') : '<div class="empty">还没有调用记录</div>') +
          '</div></div>' +
      '</div>' +

      '<div class="grid-2">' +
        '<div class="panel"><div class="panel-head"><h3>最近调用</h3><a class="tiny dim" href="#/usage">查看全部 →</a></div>' +
          '<div class="panel-body tight"><table class="tbl compact"><thead><tr><th>时间</th><th>模型</th><th style="text-align:right">tokens</th><th style="text-align:right">费用</th><th>状态</th></tr></thead><tbody>' +
          (d.recent.length ? d.recent.map(function (r) {
            return '<tr><td class="tiny dim">' + dt(r.ts) + '</td><td>' + esc(r.model_name) + '</td>' +
              '<td class="mono tiny" style="text-align:right">' + compact(r.prompt_tokens + r.completion_tokens) + '</td>' +
              '<td class="mono tiny" style="text-align:right">' + money(r.cost) + '</td>' +
              '<td>' + statusPill(r.status) + '</td></tr>';
          }).join('') : '<tr><td colspan="5"><div class="empty">还没有调用记录，去演练场试一次吧</div></td></tr>') +
          '</tbody></table></div></div>' +

        '<div class="panel"><div class="panel-head"><h3>请求量分布</h3></div>' +
          '<div class="panel-body">' + areaChart(d.series, 'requests', '#39d8ff') + axisLabels(d.series) + '</div></div>' +
      '</div>';

    var sel = $('#rangeSel');
    if (sel) sel.addEventListener('change', function () { state.query.range = sel.value; render(); });
  };

  /* ==================================================================
   * 模型广场
   * ================================================================== */
  VIEWS.models = async function (root) {
    var data = await api('/api/public/models');
    state.catalog = data;
    var group = state.query.group || 'default';
    var vendors = ['all'];
    data.models.forEach(function (m) { if (vendors.indexOf(m.vendor) < 0) vendors.push(m.vendor); });
    var vendor = state.query.vendor || 'all';

    function rows() {
      return data.models.filter(function (m) { return vendor === 'all' || m.vendor === vendor; }).map(function (m) {
        var p = (m.prices && m.prices[group]) || m.price;
        var ctx = m.context ? (m.context >= 1000000 ? (m.context / 1000000) + 'M' : Math.round(m.context / 1000) + 'K') : '—';
        var isImage = m.billing === 'image';
        return '<tr>' +
          '<td><div class="model-cell"><span class="model-avatar">' + esc(m.vendor.slice(0, 1)) + '</span>' +
            '<span><b>' + esc(m.name) + '</b><small class="mono">' + esc(m.slug) + '</small></span></div></td>' +
          '<td class="tiny dim">' + esc(m.vendor) + '</td>' +
          '<td class="mono tiny">' + esc(ctx) + '</td>' +
          (isImage
            ? '<td class="mono" colspan="2" style="text-align:right">¥' + p.unit + ' / 张</td>'
            : '<td class="mono" style="text-align:right">¥' + p.input + '</td><td class="mono" style="text-align:right">¥' + p.output + '</td>') +
          '<td>' + (m.tags || []).slice(0, 3).map(function (t) { return '<span class="badge">' + esc(t) + '</span>'; }).join(' ') + '</td>' +
          '<td style="text-align:right"><button class="btn btn-sm" data-act="use-model" data-model="' + esc(m.slug) + '">用它</button></td>' +
        '</tr>';
      }).join('');
    }

    function shell() {
      root.innerHTML = pageHead('模型广场', '实时模型目录与分组价格。同一模型在不同分组下价格不同。',
        '<a class="btn" href="#/keys">管理令牌</a><a class="btn btn-primary" href="#/playground">打开演练场</a>') +
        '<div class="chips">' + vendors.map(function (v) {
          return '<button class="chip' + (vendor === v ? ' on' : '') + '" data-vendor="' + esc(v) + '">' + (v === 'all' ? '全部厂商' : esc(v)) + '</button>';
        }).join('') + '</div>' +
        '<div class="row" style="align-items:center;margin-bottom:14px;gap:10px;flex-wrap:wrap">' +
          '<label class="tiny muted" for="grpSel">计费分组</label>' +
          '<select class="select" id="grpSel" style="max-width:280px">' + data.groups.map(function (g) {
            return '<option value="' + esc(g.slug) + '"' + (g.slug === group ? ' selected' : '') + '>' + esc(g.name) + '（×' + g.multiplier + '）</option>';
          }).join('') + '</select>' +
          '<span class="tiny dim" id="grpHint"></span>' +
        '</div>' +
        '<div class="table-wrap"><table class="tbl"><thead><tr>' +
          '<th style="min-width:200px">模型</th><th>厂商</th><th>上下文</th>' +
          '<th style="text-align:right">输入 ¥/1M</th><th style="text-align:right">输出 ¥/1M</th><th>标签</th><th></th>' +
        '</tr></thead><tbody id="modelBody">' + rows() + '</tbody></table></div>' +
        '<p class="tiny dim" style="margin-top:12px">价格为已折算的最终价（元 / 百万 tokens）。扣费按实际 usage 计算，缓存读写单独计价。</p>';

      var g = data.groups.filter(function (x) { return x.slug === group; })[0];
      var hint = $('#grpHint');
      if (hint && g) hint.textContent = g.desc || '';

      $$('.chip[data-vendor]', root).forEach(function (b) {
        b.addEventListener('click', function () { vendor = b.getAttribute('data-vendor'); shell(); });
      });
      $('#grpSel').addEventListener('change', function (e) {
        group = e.target.value;
        state.query.group = group;
        shell();
      });
      $$('[data-act="use-model"]', root).forEach(function (b) {
        b.addEventListener('click', function () {
          state.query.playModel = b.getAttribute('data-model');
          location.hash = '#/playground';
        });
      });
    }
    shell();
  };

  /* ==================================================================
   * 令牌管理
   * ================================================================== */
  function showSecret(secret) {
    openModal({
      title: '令牌已创建',
      body: '<p class="tiny muted" style="margin-bottom:14px">这是完整密钥，请立即复制保存。你随时可以在令牌列表中再次查看。</p>' +
        '<div class="copy-field"><span class="val" id="secretVal">' + esc(secret) + '</span>' +
        '<button class="btn btn-sm" data-copy>' + '复制' + '</button></div>' +
        '<p class="tiny dim" style="margin-top:12px">安全提示：不要把密钥写入前端代码或公开仓库。</p>',
      submit: '我已保存',
      onSubmit: function () { return true; },
      onMount: function (wrap) {
        $('[data-copy]', wrap).addEventListener('click', function () { copyText(secret); });
      },
    });
  }

  VIEWS.keys = async function (root) {
    var data = await api('/api/keys');
    state.catalog = state.catalog || {};

    root.innerHTML = pageHead('令牌管理', '令牌决定可用模型、额度上限与限流阈值。建议按环境分别创建。',
      '<button class="btn btn-primary" id="newKeyBtn">新建令牌</button>') +
      '<div class="table-wrap"><table class="tbl"><thead><tr>' +
        '<th>名称</th><th>密钥</th><th>分组</th><th>额度使用</th><th>状态</th><th>最近使用</th><th style="text-align:right">操作</th>' +
      '</tr></thead><tbody>' +
      (data.keys.length ? data.keys.map(function (k) {
        var pct = k.quota > 0 ? Math.min(100, (k.used / k.quota) * 100) : 0;
        return '<tr>' +
          '<td><b style="font-weight:550">' + esc(k.name) + '</b>' + (k.allow.length ? '<div class="tiny dim">限制 ' + k.allow.length + ' 个模型</div>' : '') + '</td>' +
          '<td class="mono tiny">' + esc(k.masked) + '</td>' +
          '<td><span class="badge violet">' + esc(k.group.name) + ' ×' + k.group.multiplier + '</span></td>' +
          '<td style="min-width:150px"><div class="tiny mono" style="margin-bottom:5px">' + money(k.used) + ' / ' + (k.quota > 0 ? money(k.quota) : '不限') + '</div>' +
            '<div class="bar-track"><div class="bar-fill" style="width:' + Math.max(2, pct).toFixed(1) + '%"></div></div></td>' +
          '<td>' + statusPill(k.status) + '</td>' +
          '<td class="tiny dim">' + ago(k.last_used_at) + '</td>' +
          '<td style="text-align:right;white-space:nowrap">' +
            '<button class="btn btn-sm" data-act="reveal" data-id="' + k.id + '">查看</button> ' +
            '<button class="btn btn-sm" data-act="toggle" data-id="' + k.id + '" data-status="' + (k.status === 'active' ? 'disabled' : 'active') + '">' +
              (k.status === 'active' ? '停用' : '启用') + '</button> ' +
            '<button class="btn btn-sm" data-act="del" data-id="' + k.id + '">删除</button>' +
          '</td>' +
        '</tr>';
      }).join('') : '<tr><td colspan="7"><div class="empty">还没有令牌，点击右上角「新建令牌」创建第一把 Key</div></td></tr>') +
      '</tbody></table></div>' +
      '<p class="tiny dim" style="margin-top:12px">密钥以 AES-256-GCM 加密存储，因此「查看」可以再次显示完整 Key；若怀疑泄漏，请立即停用并重新创建。</p>';

    $('#newKeyBtn').addEventListener('click', function () {
      var body = '<div class="field"><label>令牌名称</label><input class="input" id="kName" placeholder="例如：生产环境"></div>' +
        '<div class="field"><label>令牌分组</label><select class="select" id="kGroup">' +
          data.groups.map(function (g) { return '<option value="' + esc(g.slug) + '">' + esc(g.name) + '（×' + g.multiplier + '）</option>'; }).join('') +
        '</select><div class="hint">分组决定可调用的模型与计费倍率。</div></div>' +
        '<div class="row"><div class="field"><label>额度上限（元）</label><input class="input" id="kQuota" type="number" min="0" step="1" value="0" placeholder="0 表示不限"></div>' +
        '<div class="field"><label>有效期（天）</label><input class="input" id="kDays" type="number" min="0" step="1" value="0" placeholder="0 表示长期"></div></div>' +
        '<div class="field"><label>速率上限（次/分钟）</label><input class="input" id="kRpm" type="number" min="10" max="6000" value="600"></div>' +
        '<div class="field"><label>模型白名单（留空表示全部可用）</label>' +
          '<select class="select" id="kAllow" multiple size="5" style="height:auto;padding:6px">' +
          (data.models || []).map(function (m) { return '<option value="' + esc(m.slug) + '">' + esc(m.name) + '</option>'; }).join('') +
          '</select></div>';

      openModal({
        title: '新建令牌',
        body: body,
        submit: '创建',
        onSubmit: async function (wrap) {
          var allow = Array.prototype.slice.call($('#kAllow', wrap).selectedOptions || []).map(function (o) { return o.value; });
          var res = await api('/api/keys', {
            method: 'POST',
            body: {
              name: $('#kName', wrap).value.trim(),
              group: $('#kGroup', wrap).value,
              quota: Number($('#kQuota', wrap).value) || 0,
              expires_in_days: Number($('#kDays', wrap).value) || 0,
              rpm: Number($('#kRpm', wrap).value) || 600,
              allow: allow,
            },
          });
          showSecret(res.secret);
          render();
          return true;
        },
      });
    });

    $$('[data-act]', root).forEach(function (btn) {
      btn.addEventListener('click', async function () {
        var id = btn.getAttribute('data-id');
        var act = btn.getAttribute('data-act');
        try {
          if (act === 'reveal') {
            var r = await api('/api/keys/' + id + '/reveal', { method: 'POST' });
            showSecret(r.secret);
          } else if (act === 'toggle') {
            await api('/api/keys/' + id, { method: 'PATCH', body: { status: btn.getAttribute('data-status') } });
            toast('已更新令牌状态', 'ok');
            render();
          } else if (act === 'del') {
            confirmModal('删除令牌', '删除后使用该 Key 的请求会立即失败，且无法恢复。', async function () {
              await api('/api/keys/' + id, { method: 'DELETE' });
              toast('令牌已删除', 'ok');
              render();
            });
          }
        } catch (err) { toast(err.message, 'err'); }
      });
    });
  };

  /* ==================================================================
   * 用量明细
   * ================================================================== */
  VIEWS.usage = async function (root) {
    var range = state.query.range || '7d';
    var page = state.query.page || 1;
    var model = state.query.model || '';
    var d = await api('/api/usage?range=' + range + '&page=' + page + '&model=' + encodeURIComponent(model));
    var pages = Math.max(1, Math.ceil(d.total / d.limit));

    root.innerHTML = pageHead('用量明细', '逐条记录每次请求的 token、费用与耗时。', 
      '<select class="select" id="uRange" style="width:120px;height:38px">' +
        ['7d', '30d', '90d'].map(function (r) {
          return '<option value="' + r + '"' + (r === range ? ' selected' : '') + '>' + ({ '7d': '近 7 天', '30d': '近 30 天', '90d': '近 90 天' })[r] + '</option>';
        }).join('') + '</select>') +

      '<div class="kpi-grid">' +
        kpi('总费用', money(d.summary.spend), '共 ' + int(d.summary.requests) + ' 次请求') +
        kpi('输入 tokens', compact(d.summary.prompt_tokens), '按模型输入单价计费') +
        kpi('输出 tokens', compact(d.summary.completion_tokens), '按模型输出单价计费') +
        kpi('平均单次费用', money(d.summary.requests ? d.summary.spend / d.summary.requests : 0), '含缓存读写') +
      '</div>' +

      '<div class="panel"><div class="panel-head"><h3>请求记录</h3>' +
        '<select class="select" id="uModel" style="width:200px;height:32px;font-size:12.5px">' +
          '<option value="">全部模型</option>' +
          d.models.map(function (m) { return '<option value="' + esc(m) + '"' + (m === model ? ' selected' : '') + '>' + esc(m) + '</option>'; }).join('') +
        '</select></div>' +
        '<div class="panel-body tight"><table class="tbl compact"><thead><tr>' +
          '<th>时间</th><th>模型</th><th>分组</th><th style="text-align:right">输入</th><th style="text-align:right">输出</th>' +
          '<th style="text-align:right">费用</th><th style="text-align:right">耗时</th><th>状态</th>' +
        '</tr></thead><tbody>' +
        (d.rows.length ? d.rows.map(function (r) {
          return '<tr><td class="tiny dim">' + dt(r.ts) + '</td>' +
            '<td>' + esc(r.model_name) + '</td><td class="tiny dim">' + esc(r.group) + '</td>' +
            '<td class="mono tiny" style="text-align:right">' + compact(r.prompt_tokens) + '</td>' +
            '<td class="mono tiny" style="text-align:right">' + compact(r.completion_tokens) + '</td>' +
            '<td class="mono tiny" style="text-align:right">' + money(r.cost) + '</td>' +
            '<td class="mono tiny" style="text-align:right">' + Math.round(r.latency) + 'ms</td>' +
            '<td>' + statusPill(r.status) + '</td></tr>';
        }).join('') : '<tr><td colspan="8"><div class="empty">该时间段没有调用记录</div></td></tr>') +
        '</tbody></table></div>' +
        '<div class="panel-head" style="border-top:1px solid var(--line);border-bottom:0;justify-content:space-between">' +
          '<span class="tiny dim">共 ' + int(d.total) + ' 条 · 第 ' + page + ' / ' + pages + ' 页</span>' +
          '<span style="display:flex;gap:8px">' +
            '<button class="btn btn-sm" id="prevPage"' + (page <= 1 ? ' disabled' : '') + '>上一页</button>' +
            '<button class="btn btn-sm" id="nextPage"' + (page >= pages ? ' disabled' : '') + '>下一页</button>' +
          '</span></div></div>';

    $('#uRange').addEventListener('change', function (e) { state.query.range = e.target.value; state.query.page = 1; render(); });
    $('#uModel').addEventListener('change', function (e) { state.query.model = e.target.value; state.query.page = 1; render(); });
    $('#prevPage').addEventListener('click', function () { state.query.page = Math.max(1, page - 1); render(); });
    $('#nextPage').addEventListener('click', function () { state.query.page = Math.min(pages, page + 1); render(); });
  };

  /* ==================================================================
   * 钱包与账单
   * ================================================================== */
  function autoInvoicePanels(inv) {
    var auto = inv.auto || {};
    var rows = inv.invoices || [];
    return '<div class="grid-2" style="margin-top:14px">' +
      '<div class="panel"><div class="panel-head"><h3>自动充值与开票</h3><span class="badge ok">无人值守</span></div>' +
        '<div class="panel-body">' +
          '<label style="display:flex;align-items:center;gap:10px;font-size:13.5px;margin-bottom:8px;cursor:pointer">' +
            '<input type="checkbox" id="arToggle"' + (auto.enabled ? ' checked' : '') + ' style="width:16px;height:16px;accent-color:#7c6bff"> ' +
            '余额低于阈值时自动充值</label>' +
          '<p class="tiny dim" style="margin-bottom:14px">当前策略：可用余额低于 ' + money(auto.threshold || 0) +
            ' 时自动充值 ' + money(auto.amount || 0) + '，并有月度上限保护，不会无限扣款。</p>' +
          '<div class="copy-field"><span class="val">可开票账期：' + ((inv.issuable || []).join('  /  ') || '—') + '</span>' +
            '<button class="btn btn-sm" id="issueBtn">申请开票</button></div>' +
        '</div></div>' +
      '<div class="panel"><div class="panel-head"><h3>发票</h3><span class="tiny dim">' + rows.length + ' 张 · 每月 1 日自动开具</span></div>' +
        '<div class="panel-body tight"><table class="tbl compact"><thead><tr>' +
          '<th>发票号</th><th>账期</th><th style="text-align:right">金额</th><th></th>' +
        '</tr></thead><tbody>' +
        (rows.length ? rows.map(function (i) {
          return '<tr><td class="mono tiny">' + esc(i.no) + '</td>' +
            '<td class="tiny dim">' + esc(i.period) + '</td>' +
            '<td class="mono tiny" style="text-align:right">' + money(i.amount) + '</td>' +
            '<td style="text-align:right"><button class="btn btn-sm" data-invoice="' + i.id + '">下载</button></td></tr>';
        }).join('') : '<tr><td colspan="4"><div class="empty">暂无发票</div></td></tr>') +
        '</tbody></table></div></div>' +
    '</div>';
  }

  VIEWS.wallet = async function (root) {
    var d = await api('/api/wallet');
    var inv = await api('/api/wallet/invoices');
    var typeMap = { topup: '充值', bonus: '赠送', usage: '调用扣费', adjust: '人工调整', refund: '退款' };

    root.innerHTML = pageHead('钱包与账单', '充值余额长期有效，未消费部分可按原路退回。',
      '<button class="btn btn-primary" id="topupBtn">充值</button>') +

      '<div class="grid-3" style="margin-bottom:14px">' +
        '<div class="panel"><div class="panel-body">' +
          '<div class="tiny dim">可用余额</div>' +
          '<div style="font-size:32px;font-weight:650;margin:8px 0 4px">' + money(d.available) + '</div>' +
          '<div class="tiny dim">余额 ' + money(d.balance) + (d.credit_limit ? ' · 授信 ' + money(d.credit_limit) : '') + '</div>' +
          '<div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap">' +
            [50, 100, 500].map(function (v) { return '<button class="btn btn-sm" data-topup="' + v + '">充 ¥' + v + '</button>'; }).join('') +
          '</div>' +
        '</div></div>' +
        '<div class="panel"><div class="panel-body">' +
          '<div class="tiny dim">本月消费</div>' +
          '<div style="font-size:28px;font-weight:650;margin:8px 0 4px">' + money(d.month_spend) + '</div>' +
          '<div class="tiny dim">累计充值 ' + money(d.total_topup) + '</div>' +
        '</div></div>' +
        '<div class="panel"><div class="panel-body">' +
          '<div class="tiny dim">支付方式</div>' +
          '<div style="font-size:16px;margin:10px 0 6px">' + (d.payment_mode === 'mock' ? '在线支付（演示即时到账）' : '对公转账 / 人工确认') + '</div>' +
          '<div class="tiny dim">支持支付宝、微信支付、对公转账，可开具增值税发票。</div>' +
        '</div></div>' +
      '</div>' +

      '<div class="grid-2">' +
        '<div class="panel"><div class="panel-head"><h3>资金流水</h3><span class="tiny dim">最近 60 条</span></div>' +
          '<div class="panel-body tight"><table class="tbl compact"><thead><tr>' +
            '<th>时间</th><th>类型</th><th>说明</th><th style="text-align:right">金额</th><th style="text-align:right">余额</th>' +
          '</tr></thead><tbody>' +
          (d.ledger.length ? d.ledger.map(function (l) {
            return '<tr><td class="tiny dim">' + dt(l.ts) + '</td>' +
              '<td>' + esc(typeMap[l.type] || l.type) + '</td>' +
              '<td class="tiny dim">' + esc(l.note || '—') + '</td>' +
              '<td class="mono tiny" style="text-align:right;color:' + (l.amount >= 0 ? 'var(--ok)' : 'var(--muted)') + '">' +
                (l.amount >= 0 ? '+' : '') + money(l.amount).replace('¥-', '-¥') + '</td>' +
              '<td class="mono tiny" style="text-align:right">' + money(l.balance_after) + '</td></tr>';
          }).join('') : '<tr><td colspan="5"><div class="empty">暂无流水</div></td></tr>') +
          '</tbody></table></div></div>' +

        '<div class="panel"><div class="panel-head"><h3>充值记录</h3></div>' +
          '<div class="panel-body tight"><table class="tbl compact"><thead><tr>' +
            '<th>订单号</th><th>金额</th><th>状态</th><th>时间</th>' +
          '</tr></thead><tbody>' +
          (d.orders.length ? d.orders.map(function (o) {
            return '<tr><td class="mono tiny">' + esc(o.id.replace('ord_', '')) + '</td>' +
              '<td class="mono tiny">' + money(o.amount) + '</td>' +
              '<td>' + statusPill(o.status === 'paid' ? 'active' : 'pending') + '</td>' +
              '<td class="tiny dim">' + dt(o.ts) + '</td></tr>';
          }).join('') : '<tr><td colspan="4"><div class="empty">暂无充值记录</div></td></tr>') +
          '</tbody></table></div></div>' +
      '</div>' +
      autoInvoicePanels(inv);

    function doTopup(amount) {
      openModal({
        title: '充值 ' + amount + ' 元',
        body: '<p class="tiny muted" style="margin-bottom:14px">' +
          (d.payment_mode === 'mock' ? '当前为演示支付模式，确认后额度立即到账。' : '提交后将生成对公转账订单，到账后自动入账。') + '</p>' +
          '<div class="copy-field"><span class="val">订单金额：¥' + amount + '.00</span></div>',
        submit: '确认支付',
        onSubmit: async function () {
          var res = await api('/api/wallet/topup', { method: 'POST', body: { amount: amount, channel: 'alipay' } });
          if (res.paid) toast('充值成功，余额已到账', 'ok');
          else toast('订单已创建，请按指引转账', 'ok');
          render();
          return true;
        },
      });
    }

    $('#topupBtn').addEventListener('click', function () {
      openModal({
        title: '充值',
        body: '<div class="field"><label>充值金额（元）</label><input class="input" id="amount" type="number" min="1" step="1" value="100"></div>' +
          '<div class="chips" style="margin-top:4px">' + [50, 100, 300, 500, 1000].map(function (v) {
            return '<button class="chip" data-quick="' + v + '">' + v + '</button>';
          }).join('') + '</div>' +
          '<p class="tiny dim">余额长期有效。单笔超过 5000 元请联系商务获取对公账户。</p>',
        submit: '去支付',
        onMount: function (wrap) {
          $$('[data-quick]', wrap).forEach(function (b) {
            b.addEventListener('click', function () { $('#amount', wrap).value = b.getAttribute('data-quick'); });
          });
        },
        onSubmit: async function (wrap) {
          var amount = Number($('#amount', wrap).value) || 0;
          if (amount < 1) throw new Error('金额不能小于 1 元');
          var res = await api('/api/wallet/topup', { method: 'POST', body: { amount: amount, channel: 'alipay' } });
          toast(res.paid ? '充值成功，余额已到账' : '订单已创建，请按指引转账', 'ok');
          render();
          return true;
        },
      });
    });
    $$('[data-topup]', root).forEach(function (b) {
      b.addEventListener('click', function () { doTopup(Number(b.getAttribute('data-topup'))); });
    });

    var arToggle = $('#arToggle');
    if (arToggle) {
      arToggle.addEventListener('change', async function () {
        try {
          await api('/api/wallet/autorecharge', { method: 'POST', body: { enabled: arToggle.checked } });
          toast(arToggle.checked ? '已开启自动充值' : '已关闭自动充值', 'ok');
          render();
        } catch (e) { toast(e.message, 'err'); }
      });
    }

    $$('[data-invoice]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        window.open('/api/invoices/' + b.getAttribute('data-invoice'), '_blank');
      });
    });

    var issueBtn = $('#issueBtn');
    if (issueBtn) {
      issueBtn.addEventListener('click', function () {
        openModal({
          title: '申请开票',
          body: '<div class="field"><label>账期</label><select class="select" id="invPeriod">' +
              (inv.issuable || []).map(function (p) { return '<option value="' + esc(p) + '">' + esc(p) + '</option>'; }).join('') +
            '</select></div>' +
            '<div class="field"><label>发票抬头</label><input class="input" id="invTitle" value="' + esc(state.me.company || '') + '" placeholder="公司名称（可选）"></div>' +
            '<p class="tiny dim">系统按该账期的实际消费金额开票，税率 6%，生成后可立即下载。</p>',
          submit: '开具发票',
          onSubmit: async function (wrap) {
            var r = await api('/api/wallet/invoice', {
              method: 'POST',
              body: { period: $('#invPeriod', wrap).value, title: $('#invTitle', wrap).value.trim() },
            });
            toast(r.existed ? '该账期已开票' : '发票已生成', 'ok');
            render();
            return true;
          },
        });
      });
    }
  };

  /* ==================================================================
   * 演练场
   * ================================================================== */
  VIEWS.playground = async function (root) {
    var data = state.catalog && state.catalog.models ? state.catalog : await api('/api/public/models');
    state.catalog = data;
    var chosen = state.query.playModel || (data.models[0] && data.models[0].slug);
    var group = state.query.playGroup || 'default';
    var messages = [];

    root.innerHTML = pageHead('演练场', '在这里直接验证模型与分组，请求会真实计费。', '') +
      '<div class="play-grid">' +
        '<div class="panel"><div class="panel-head"><h3>参数</h3></div><div class="panel-body">' +
          '<div class="field"><label>模型</label><select class="select" id="pgModel">' +
            data.models.map(function (m) { return '<option value="' + esc(m.slug) + '"' + (m.slug === chosen ? ' selected' : '') + '>' + esc(m.name) + ' · ' + esc(m.vendor) + '</option>'; }).join('') +
          '</select></div>' +
          '<div class="field"><label>令牌分组</label><select class="select" id="pgGroup">' +
            data.groups.map(function (g) { return '<option value="' + esc(g.slug) + '"' + (g.slug === group ? ' selected' : '') + '>' + esc(g.name) + '（×' + g.multiplier + '）</option>'; }).join('') +
          '</select></div>' +
          '<div class="row"><div class="field"><label>max_tokens</label><input class="input" id="pgMax" type="number" value="512" min="8" max="4096"></div>' +
          '<div class="field"><label>temperature</label><input class="input" id="pgTemp" type="number" value="0.7" step="0.1" min="0" max="2"></div></div>' +
          '<p class="tiny dim">提示：分组成员关系不匹配时会返回 403，可在此快速验证某个模型属于哪个分组。</p>' +
        '</div></div>' +

        '<div class="panel" style="display:flex;flex-direction:column">' +
          '<div class="panel-head"><h3>对话</h3><span class="tiny dim" id="pgCost"></span></div>' +
          '<div class="chat-box" id="chatBox">' +
            '<div class="msg bot">你好，我是 ASTER 演练场。选择模型后发送一条消息，我会走完整的网关链路返回结果。<span class="meta">demo upstream</span></div>' +
          '</div>' +
          '<div class="panel-body" style="border-top:1px solid var(--line)">' +
            '<textarea class="textarea" id="pgInput" placeholder="输入问题，Ctrl + Enter 发送"></textarea>' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px">' +
              '<span class="tiny dim">请求会真实扣费，可在用量明细中查看</span>' +
              '<button class="btn btn-primary" id="pgSend">发送</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    function push(role, text, meta) {
      var box = $('#chatBox');
      var el = document.createElement('div');
      el.className = 'msg ' + (role === 'user' ? 'user' : 'bot');
      el.textContent = text;
      if (meta) {
        var m = document.createElement('span');
        m.className = 'meta';
        m.textContent = meta;
        el.appendChild(m);
      }
      box.appendChild(el);
      box.scrollTop = box.scrollHeight;
      return el;
    }

    async function send() {
      var input = $('#pgInput');
      var text = input.value.trim();
      if (!text) return;
      input.value = '';
      messages.push({ role: 'user', content: text });
      push('user', text);
      var btn = $('#pgSend');
      btn.disabled = true;
      btn.textContent = '生成中…';
      var placeholder = push('bot', '…');
      try {
        var res = await api('/api/playground', {
          method: 'POST',
          body: {
            model: $('#pgModel').value,
            group: $('#pgGroup').value,
            messages: messages,
            max_tokens: Number($('#pgMax').value) || 512,
            temperature: Number($('#pgTemp').value),
          },
        });
        var content = (res.choices && res.choices[0] && res.choices[0].message && res.choices[0].message.content) || '（空响应）';
        placeholder.textContent = content;
        var u = res.usage || {};
        var meta = document.createElement('span');
        meta.className = 'meta';
        meta.textContent = 'in ' + (u.prompt_tokens || 0) + ' · out ' + (u.completion_tokens || 0) + ' tokens';
        placeholder.appendChild(meta);
        messages.push({ role: 'assistant', content: content });
      } catch (err) {
        placeholder.textContent = '调用失败：' + err.message;
      } finally {
        btn.disabled = false;
        btn.textContent = '发送';
        var box = $('#chatBox');
        box.scrollTop = box.scrollHeight;
        loadCost();
      }
    }

    async function loadCost() {
      try {
        var d = await api('/api/dashboard?range=7d');
        $('#pgCost').textContent = '余额 ' + money(d.stats.available);
      } catch (e) { /* ignore */ }
    }

    $('#pgSend').addEventListener('click', send);
    $('#pgInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); send(); }
    });
    loadCost();
  };

  /* ==================================================================
   * 账号设置
   * ================================================================== */
  VIEWS.settings = async function (root) {
    var me = state.me;
    root.innerHTML = pageHead('账号设置', '修改昵称与登录密码。', '') +
      '<div class="grid-2">' +
        '<div class="panel"><div class="panel-head"><h3>基本信息</h3></div><div class="panel-body">' +
          '<div class="field"><label>邮箱</label><input class="input" value="' + esc(me.email) + '" disabled></div>' +
          '<div class="field"><label>昵称</label><input class="input" id="setName" value="' + esc(me.name) + '"></div>' +
          '<div class="field"><label>账号 ID</label><input class="input mono" value="' + esc(me.id) + '" disabled></div>' +
          '<button class="btn btn-primary" id="saveProfile">保存</button>' +
        '</div></div>' +
        '<div class="panel"><div class="panel-head"><h3>修改密码</h3></div><div class="panel-body">' +
          '<div class="field"><label>当前密码</label><input class="input" id="curPw" type="password" autocomplete="current-password"></div>' +
          '<div class="field"><label>新密码</label><input class="input" id="newPw" type="password" autocomplete="new-password"><div class="hint">至少 8 位，建议包含大小写与符号。</div></div>' +
          '<button class="btn" id="savePw">更新密码</button>' +
        '</div></div>' +
      '</div>';

    $('#saveProfile').addEventListener('click', async function () {
      try {
        var r = await api('/api/me', { method: 'PATCH', body: { name: $('#setName').value.trim() } });
        state.me = r.user;
        paintUser();
        toast('已保存', 'ok');
      } catch (e) { toast(e.message, 'err'); }
    });
    $('#savePw').addEventListener('click', async function () {
      try {
        await api('/api/me', { method: 'PATCH', body: { current_password: $('#curPw').value, password: $('#newPw').value } });
        $('#curPw').value = ''; $('#newPw').value = '';
        toast('密码已更新', 'ok');
      } catch (e) { toast(e.message, 'err'); }
    });
  };

  /* ==================================================================
   * 管理后台
   * ================================================================== */
  function adminOnly(root) {
    if (state.me.role !== 'admin') {
      root.innerHTML = '<div class="panel"><div class="empty">需要管理员权限。请使用 admin@aster.dev 登录。</div></div>';
      return false;
    }
    return true;
  }

  function fieldHtml(f, value) {
    var v = value === undefined || value === null ? (f.value !== undefined ? f.value : '') : value;
    var id = 'f_' + f.key;
    if (f.type === 'select') {
      return '<select class="select" id="' + id + '">' + (f.options || []).map(function (o) {
        var val = typeof o === 'string' ? o : o.value;
        var label = typeof o === 'string' ? o : o.label;
        return '<option value="' + esc(val) + '"' + (String(val) === String(v) ? ' selected' : '') + '>' + esc(label) + '</option>';
      }).join('') + '</select>';
    }
    if (f.type === 'multi') {
      var arr = Array.isArray(v) ? v : [];
      return '<select class="select" id="' + id + '" multiple size="' + Math.min(6, (f.options || []).length) + '" style="height:auto;padding:6px">' +
        (f.options || []).map(function (o) {
          var val = typeof o === 'string' ? o : o.value;
          var label = typeof o === 'string' ? o : o.label;
          return '<option value="' + esc(val) + '"' + (arr.indexOf(val) >= 0 ? ' selected' : '') + '>' + esc(label) + '</option>';
        }).join('') + '</select>';
    }
    if (f.type === 'checkbox') {
      return '<label style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--muted)">' +
        '<input type="checkbox" id="' + id + '"' + (v ? ' checked' : '') + ' style="width:16px;height:16px;accent-color:#7c6bff"> ' + esc(f.text || '启用') + '</label>';
    }
    if (f.type === 'textarea') {
      return '<textarea class="textarea" id="' + id + '" placeholder="' + esc(f.placeholder || '') + '">' + esc(v) + '</textarea>';
    }
    return '<input class="input" id="' + id + '" type="' + (f.type || 'text') + '" value="' + esc(v) + '"' +
      (f.step ? ' step="' + f.step + '"' : '') + ' placeholder="' + esc(f.placeholder || '') + '"' + (f.disabled ? ' disabled' : '') + '>';
  }

  function formModal(title, fields, initial, onSubmit, submitText) {
    var body = fields.map(function (f) {
      var val = initial ? initial[f.key] : f.value;
      return '<div class="field"><label>' + esc(f.label) + '</label>' + fieldHtml(f, val) +
        (f.hint ? '<div class="hint">' + esc(f.hint) + '</div>' : '') + '</div>';
    }).join('');
    openModal({
      title: title,
      body: body,
      submit: submitText || '保存',
      onSubmit: function (wrap) {
        var out = {};
        fields.forEach(function (f) {
          var el = $('#f_' + f.key, wrap);
          if (!el) return;
          if (f.type === 'checkbox') out[f.key] = el.checked;
          else if (f.type === 'multi') out[f.key] = Array.prototype.slice.call(el.selectedOptions || []).map(function (o) { return o.value; });
          else if (f.type === 'number') out[f.key] = Number(el.value) || 0;
          else out[f.key] = el.value.trim();
        });
        return onSubmit(out);
      },
    });
  }

  VIEWS.admin = async function (root) {
    if (!adminOnly(root)) return;
    var d = await api('/api/admin/overview');
    root.innerHTML = pageHead('运营概览', '平台级指标：用户、流水、错误率与渠道健康度。', '') +
      '<div class="kpi-grid">' +
        kpi('本月充值', money(d.topup_month), '本月消费 ' + money(d.spend_month)) +
        kpi('今日请求', int(d.requests_today), '24h 错误率 ' + (d.error_rate * 100).toFixed(2) + '%') +
        kpi('用户数', int(d.users), '活跃 ' + int(d.active_users) + ' · 令牌 ' + int(d.keys)) +
        kpi('用户余额合计', money(d.revenue_balance), '待消耗的预付款') +
      '</div>' +
      '<div class="grid-2">' +
        '<div class="panel"><div class="panel-head"><h3>上游渠道健康度</h3><a class="tiny dim" href="#/admin/upstreams">管理 →</a></div>' +
          '<div class="panel-body tight"><table class="tbl compact"><thead><tr>' +
            '<th>渠道</th><th>协议</th><th style="text-align:right">成功率</th><th style="text-align:right">延迟</th><th>状态</th>' +
          '</tr></thead><tbody>' + d.upstreams_health.map(function (u) {
            return '<tr><td>' + esc(u.name) + '</td><td class="tiny dim mono">' + esc(u.protocol) + '</td>' +
              '<td class="mono tiny" style="text-align:right">' + (u.success_rate * 100).toFixed(1) + '%</td>' +
              '<td class="mono tiny" style="text-align:right">' + Math.round(u.latency) + 'ms</td>' +
              '<td>' + (u.enabled ? '<span class="pill-status"><i></i>启用</span>' : '<span class="pill-status err"><i></i>停用</span>') + '</td></tr>';
          }).join('') + '</tbody></table></div></div>' +

        '<div class="panel"><div class="panel-head"><h3>最近注册</h3><a class="tiny dim" href="#/admin/users">用户管理 →</a></div>' +
          '<div class="panel-body tight"><table class="tbl compact"><thead><tr>' +
            '<th>用户</th><th>套餐</th><th style="text-align:right">余额</th><th>注册</th>' +
          '</tr></thead><tbody>' + d.recent_users.map(function (u) {
            return '<tr><td>' + esc(u.name) + '<div class="tiny dim">' + esc(u.email) + '</div></td>' +
              '<td class="tiny dim">' + esc(u.plan) + '</td>' +
              '<td class="mono tiny" style="text-align:right">' + money(u.balance) + '</td>' +
              '<td class="tiny dim">' + dt(u.created_at) + '</td></tr>';
          }).join('') + '</tbody></table></div></div>' +
      '</div>';
  };

  VIEWS['admin-models'] = async function (root) {
    if (!adminOnly(root)) return;
    var d = await api('/api/admin/models');
    var groups = (state.catalog && state.catalog.groups) || [];
    root.innerHTML = pageHead('模型与定价', '价格单位：元 / 1M tokens（图片模型为元 / 次）。', '<button class="btn btn-primary" id="addModel">新增模型</button>') +
      '<div class="table-wrap"><table class="tbl compact"><thead><tr>' +
        '<th>模型</th><th>厂商</th><th style="text-align:right">输入</th><th style="text-align:right">输出</th>' +
        '<th style="text-align:right">缓存读</th><th>分组</th><th>状态</th><th style="text-align:right">操作</th>' +
      '</tr></thead><tbody>' + d.models.map(function (m) {
        return '<tr><td><b style="font-weight:550">' + esc(m.name) + '</b><div class="tiny dim mono">' + esc(m.slug) + '</div></td>' +
          '<td class="tiny dim">' + esc(m.vendor) + '</td>' +
          '<td class="mono tiny" style="text-align:right">' + (m.billing === 'image' ? '¥' + m.unit_price + '/张' : m.input) + '</td>' +
          '<td class="mono tiny" style="text-align:right">' + (m.billing === 'image' ? '—' : m.output) + '</td>' +
          '<td class="mono tiny" style="text-align:right">' + (m.cache_read || 0) + '</td>' +
          '<td class="tiny dim">' + (m.groups || []).join(', ') + '</td>' +
          '<td>' + (m.enabled ? statusPill('active') : statusPill('disabled')) + '</td>' +
          '<td style="text-align:right;white-space:nowrap">' +
            '<button class="btn btn-sm" data-edit="' + m.id + '">编辑</button> ' +
            '<button class="btn btn-sm" data-del="' + m.id + '">删除</button></td></tr>';
      }).join('') + '</tbody></table></div>';

    var fields = [
      { key: 'name', label: '显示名称' },
      { key: 'slug', label: '模型标识（调用时填写的 model）', hint: '创建后不建议修改；仅支持小写字母、数字、点、横线' },
      { key: 'vendor', label: '厂商' },
      { key: 'input', label: '输入价格（元/1M）', type: 'number', step: '0.01' },
      { key: 'output', label: '输出价格（元/1M）', type: 'number', step: '0.01' },
      { key: 'cache_read', label: '缓存读价格', type: 'number', step: '0.001' },
      { key: 'cache_write', label: '缓存写价格', type: 'number', step: '0.001' },
      { key: 'context', label: '上下文长度', type: 'number' },
      { key: 'billing', label: '计费方式', type: 'select', options: [{ value: 'token', label: '按 token' }, { value: 'image', label: '按张' }] },
      { key: 'unit_price', label: '按张价格（元/张）', type: 'number', step: '0.01' },
      { key: 'groups', label: '可用分组', type: 'multi', options: groups.map(function (g) { return { value: g.slug, label: g.name }; }) },
      { key: 'enabled', label: '状态', type: 'checkbox', text: '启用该模型' },
    ];

    $('#addModel').addEventListener('click', function () {
      formModal('新增模型', fields, { billing: 'token', enabled: true, groups: ['default'], context: 128000 }, async function (v) {
        v.tags = [];
        await api('/api/admin/models', { method: 'POST', body: v });
        toast('模型已创建', 'ok');
        render();
        return true;
      });
    });

    $$('[data-edit]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var m = d.models.filter(function (x) { return x.id === btn.getAttribute('data-edit'); })[0];
        var f2 = fields.map(function (f) { return Object.assign({}, f); });
        f2[1].disabled = true;
        formModal('编辑模型 · ' + m.name, f2, m, async function (v) {
          delete v.slug;
          await api('/api/admin/models/' + m.id, { method: 'PATCH', body: v });
          toast('已保存', 'ok');
          render();
          return true;
        });
      });
    });
    $$('[data-del]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        confirmModal('删除模型', '删除后该模型将从目录中消失，已有令牌调用会返回 404。', async function () {
          await api('/api/admin/models/' + btn.getAttribute('data-del'), { method: 'DELETE' });
          toast('已删除', 'ok');
          render();
        });
      });
    });
  };

  VIEWS['admin-groups'] = async function (root) {
    if (!adminOnly(root)) return;
    var d = await api('/api/admin/groups');
    var ups = (await api('/api/admin/upstreams')).upstreams;
    root.innerHTML = pageHead('令牌分组', '分组决定模型可用范围与计费倍率，倍率直接乘在基础价上。', '<button class="btn btn-primary" id="addGroup">新增分组</button>') +
      '<div class="table-wrap"><table class="tbl compact"><thead><tr>' +
        '<th>分组</th><th>标识</th><th style="text-align:right">倍率</th><th>上游</th><th>状态</th><th style="text-align:right">操作</th>' +
      '</tr></thead><tbody>' + d.groups.map(function (g) {
        return '<tr><td><b style="font-weight:550">' + esc(g.name) + '</b><div class="tiny dim">' + esc(g.badge || '') + '</div></td>' +
          '<td class="mono tiny">' + esc(g.slug) + '</td>' +
          '<td class="mono tiny" style="text-align:right">×' + g.multiplier + '</td>' +
          '<td class="tiny dim">' + (g.upstreams || []).map(function (id) {
            var u = ups.filter(function (x) { return x.id === id; })[0];
            return u ? esc(u.name) : id;
          }).join(' / ') + '</td>' +
          '<td>' + (g.enabled ? statusPill('active') : statusPill('disabled')) + '</td>' +
          '<td style="text-align:right;white-space:nowrap">' +
            '<button class="btn btn-sm" data-edit="' + g.id + '">编辑</button> ' +
            '<button class="btn btn-sm" data-del="' + g.id + '">删除</button></td></tr>';
      }).join('') + '</tbody></table></div>';

    var fields = [
      { key: 'name', label: '分组名称' },
      { key: 'slug', label: '分组标识', hint: '小写字母、数字、横线，创建后不建议修改' },
      { key: 'multiplier', label: '计费倍率', type: 'number', step: '0.05', hint: '0.65 表示基础价的 6.5 折' },
      { key: 'badge', label: '角标文案' },
      { key: 'desc', label: '说明', type: 'textarea' },
      { key: 'upstreams', label: '上游渠道（按优先级排序）', type: 'multi', options: ups.map(function (u) { return { value: u.id, label: u.name }; }) },
      { key: 'enabled', label: '状态', type: 'checkbox', text: '启用该分组' },
    ];

    $('#addGroup').addEventListener('click', function () {
      formModal('新增分组', fields, { multiplier: 1, enabled: true, upstreams: [] }, async function (v) {
        await api('/api/admin/groups', { method: 'POST', body: v });
        toast('分组已创建', 'ok');
        render();
        return true;
      });
    });
    $$('[data-edit]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var g = d.groups.filter(function (x) { return x.id === btn.getAttribute('data-edit'); })[0];
        var f2 = fields.map(function (f) { return Object.assign({}, f); });
        f2[1].disabled = true;
        formModal('编辑分组 · ' + g.name, f2, g, async function (v) {
          delete v.slug;
          await api('/api/admin/groups/' + g.id, { method: 'PATCH', body: v });
          toast('已保存', 'ok');
          render();
          return true;
        });
      });
    });
    $$('[data-del]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        confirmModal('删除分组', '若仍有令牌归属于该分组，删除会被拒绝。', async function () {
          try {
            await api('/api/admin/groups/' + btn.getAttribute('data-del'), { method: 'DELETE' });
            toast('已删除', 'ok');
            render();
          } catch (e) { toast(e.message, 'err'); return false; }
        });
      });
    });
  };

  VIEWS['admin-upstreams'] = async function (root) {
    if (!adminOnly(root)) return;
    var d = await api('/api/admin/upstreams');
    root.innerHTML = pageHead('上游渠道', '渠道是真正的模型供给方。演示上游（mock）无需密钥即可运行。',
      '<button class="btn btn-primary" id="addUp">新增渠道</button>') +
      '<div class="table-wrap"><table class="tbl compact"><thead><tr>' +
        '<th>渠道</th><th>协议</th><th>Base URL</th><th>密钥</th><th style="text-align:right">优先级</th><th>健康度</th><th>状态</th><th style="text-align:right">操作</th>' +
      '</tr></thead><tbody>' + d.upstreams.map(function (u) {
        var total = (u.health.ok || 0) + (u.health.fail || 0);
        var rate = total ? ((u.health.ok || 0) / total * 100).toFixed(1) + '%' : '—';
        return '<tr><td><b style="font-weight:550">' + esc(u.name) + '</b><div class="tiny dim">' + esc(u.note || '') + '</div></td>' +
          '<td class="mono tiny">' + esc(u.protocol) + '</td>' +
          '<td class="tiny dim" style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(u.base_url || '—') + '</td>' +
          '<td>' + (u.has_key ? '<span class="badge ok">已配置</span>' : '<span class="badge warn">未配置</span>') + '</td>' +
          '<td class="mono tiny" style="text-align:right">' + u.priority + '</td>' +
          '<td class="tiny dim">' + rate + ' · ' + Math.round(u.health.latency || 0) + 'ms</td>' +
          '<td>' + (u.enabled ? statusPill('active') : statusPill('disabled')) + '</td>' +
          '<td style="text-align:right;white-space:nowrap">' +
            '<button class="btn btn-sm" data-edit="' + u.id + '">编辑</button> ' +
            '<button class="btn btn-sm" data-del="' + u.id + '">删除</button></td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<p class="tiny dim" style="margin-top:12px">接入真实模型：新增一条 openai 或 anthropic 渠道，填入 Base URL 与密钥，再把该渠道加入分组即可。模型名不一致时可在渠道上配置映射。</p>';

    var fields = [
      { key: 'name', label: '渠道名称' },
      { key: 'protocol', label: '协议', type: 'select', options: [{ value: 'openai', label: 'OpenAI 兼容' }, { value: 'anthropic', label: 'Anthropic 原生' }, { value: 'mock', label: '本地 mock' }] },
      { key: 'base_url', label: 'Base URL', placeholder: 'https://api.openai.com/v1' },
      { key: 'key', label: '密钥', type: 'password', hint: '加密存储，留空表示保持原有密钥' },
      { key: 'priority', label: '优先级（数字越小越优先）', type: 'number' },
      { key: 'enabled', label: '状态', type: 'checkbox', text: '启用该渠道' },
      { key: 'note', label: '备注', type: 'textarea' },
    ];

    $('#addUp').addEventListener('click', function () {
      formModal('新增渠道', fields, { protocol: 'openai', priority: 5, enabled: true }, async function (v) {
        await api('/api/admin/upstreams', { method: 'POST', body: v });
        toast('渠道已创建', 'ok');
        render();
        return true;
      });
    });
    $$('[data-edit]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var u = d.upstreams.filter(function (x) { return x.id === btn.getAttribute('data-edit'); })[0];
        formModal('编辑渠道 · ' + u.name, fields, { name: u.name, protocol: u.protocol, base_url: u.base_url, priority: u.priority, enabled: u.enabled, note: u.note, key: '' }, async function (v) {
          if (!v.key) delete v.key;
          await api('/api/admin/upstreams/' + u.id, { method: 'PATCH', body: v });
          toast('已保存', 'ok');
          render();
          return true;
        });
      });
    });
    $$('[data-del]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        confirmModal('删除渠道', '删除后会自动从所有分组中移除。', async function () {
          await api('/api/admin/upstreams/' + btn.getAttribute('data-del'), { method: 'DELETE' });
          toast('已删除', 'ok');
          render();
        });
      });
    });
  };

  VIEWS['admin-users'] = async function (root) {
    if (!adminOnly(root)) return;
    var d = await api('/api/admin/users');
    root.innerHTML = pageHead('用户与额度', '可调整余额、授信额度与账号状态。', '') +
      '<div class="table-wrap"><table class="tbl compact"><thead><tr>' +
        '<th>用户</th><th>角色</th><th>套餐</th><th style="text-align:right">余额</th><th style="text-align:right">累计消费</th>' +
        '<th style="text-align:right">令牌</th><th>状态</th><th style="text-align:right">操作</th>' +
      '</tr></thead><tbody>' + d.users.map(function (u) {
        return '<tr><td><b style="font-weight:550">' + esc(u.name) + '</b><div class="tiny dim">' + esc(u.email) + '</div></td>' +
          '<td class="tiny">' + (u.role === 'admin' ? '<span class="badge violet">管理员</span>' : '用户') + '</td>' +
          '<td class="tiny dim">' + esc(u.plan) + '</td>' +
          '<td class="mono tiny" style="text-align:right">' + money(u.balance) + '</td>' +
          '<td class="mono tiny" style="text-align:right">' + money(u.spend) + '</td>' +
          '<td class="mono tiny" style="text-align:right">' + u.keys + '</td>' +
          '<td>' + statusPill(u.status) + '</td>' +
          '<td style="text-align:right;white-space:nowrap">' +
            '<button class="btn btn-sm" data-credit="' + u.id + '">调整额度</button> ' +
            '<button class="btn btn-sm" data-toggle="' + u.id + '" data-status="' + (u.status === 'active' ? 'banned' : 'active') + '">' +
              (u.status === 'active' ? '封禁' : '解封') + '</button></td></tr>';
      }).join('') + '</tbody></table></div>';

    $$('[data-credit]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var u = d.users.filter(function (x) { return x.id === btn.getAttribute('data-credit'); })[0];
        formModal('调整额度 · ' + u.name, [
          { key: 'amount', label: '调整金额（元，负数为扣减）', type: 'number', step: '0.01' },
          { key: 'note', label: '备注' },
        ], { amount: 0, note: '' }, async function (v) {
          await api('/api/admin/users/' + u.id + '/credit', { method: 'POST', body: v });
          toast('额度已调整', 'ok');
          render();
          return true;
        });
      });
    });
    $$('[data-toggle]', root).forEach(function (btn) {
      btn.addEventListener('click', async function () {
        try {
          await api('/api/admin/users/' + btn.getAttribute('data-toggle'), { method: 'PATCH', body: { status: btn.getAttribute('data-status') } });
          toast('状态已更新', 'ok');
          render();
        } catch (e) { toast(e.message, 'err'); }
      });
    });
  };

  VIEWS['admin-ledger'] = async function (root) {
    if (!adminOnly(root)) return;
    var d = await api('/api/admin/ledger');
    var typeMap = { topup: '充值', bonus: '赠送', usage: '扣费', adjust: '调整', refund: '退款' };
    root.innerHTML = pageHead('资金流水', '最近 200 条账务变动与充值订单。', '') +
      '<div class="grid-2">' +
        '<div class="panel"><div class="panel-head"><h3>账务流水</h3></div><div class="panel-body tight" style="max-height:560px;overflow:auto">' +
          '<table class="tbl compact"><thead><tr><th>时间</th><th>用户</th><th>类型</th><th style="text-align:right">金额</th><th style="text-align:right">余额</th></tr></thead><tbody>' +
          d.ledger.map(function (l) {
            return '<tr><td class="tiny dim">' + dt(l.ts) + '</td><td class="tiny">' + esc(l.user) + '</td>' +
              '<td class="tiny dim">' + esc(typeMap[l.type] || l.type) + '</td>' +
              '<td class="mono tiny" style="text-align:right;color:' + (l.amount >= 0 ? 'var(--ok)' : 'var(--muted)') + '">' + money(l.amount) + '</td>' +
              '<td class="mono tiny" style="text-align:right">' + money(l.balance_after) + '</td></tr>';
          }).join('') + '</tbody></table></div></div>' +
        '<div class="panel"><div class="panel-head"><h3>充值订单</h3></div><div class="panel-body tight" style="max-height:560px;overflow:auto">' +
          '<table class="tbl compact"><thead><tr><th>订单</th><th>用户</th><th style="text-align:right">金额</th><th>状态</th></tr></thead><tbody>' +
          d.orders.map(function (o) {
            return '<tr><td class="mono tiny">' + esc(o.id.replace('ord_', '')) + '</td>' +
              '<td class="tiny">' + esc(o.user) + '</td>' +
              '<td class="mono tiny" style="text-align:right">' + money(o.amount) + '</td>' +
              '<td>' + statusPill(o.status === 'paid' ? 'active' : 'pending') + '</td></tr>';
          }).join('') + '</tbody></table></div></div>' +
      '</div>';
  };

  VIEWS['admin-automation'] = async function (root) {
    if (!adminOnly(root)) return;
    var d = await api('/api/admin/automation');
    var cfg = d.config || {};
    var jobs = d.jobs || [];
    var logs = d.log || [];
    var box = d.outbox || [];
    var todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    var todayActs = logs.filter(function (l) { return l.ts >= todayStart.getTime(); }).length;
    var failures = jobs.reduce(function (a, j) { return a + (j.errors || 0); }, 0);
    var queued = box.filter(function (m) { return m.status === 'queued'; }).length;

    root.innerHTML = pageHead('自动化引擎',
      '系统按调度自动完成余额巡检、自动充值、开票、探活、限流与通知投递。',
      '<button class="btn ' + (cfg.enabled ? '' : 'btn-primary') + '" id="autoToggle">' + (cfg.enabled ? '暂停自动化' : '启用自动化') + '</button>') +

      '<div class="kpi-grid">' +
        kpi('定时任务', String(jobs.length), cfg.enabled ? '引擎运行中 · 每分钟 tick' : '引擎已暂停') +
        kpi('今日自动动作', String(todayActs), '由调度器写入审计日志') +
        kpi('待投递通知', String(queued), d.notify && d.notify.configured ? '已配置投递通道' : '未配置，暂存 outbox') +
        kpi('任务失败累计', String(failures), failures ? '请查看日志定位' : '无失败记录') +
      '</div>' +

      '<div class="panel" style="margin-bottom:14px"><div class="panel-head"><h3>调度任务</h3>' +
        '<span class="tiny dim">间隔可调，支持手动触发</span></div>' +
        '<div class="panel-body tight"><table class="tbl compact"><thead><tr>' +
          '<th>任务</th><th>最近执行</th><th style="text-align:right">耗时</th><th style="text-align:right">成功/失败</th>' +
          '<th>下次执行</th><th style="text-align:right">操作</th>' +
        '</tr></thead><tbody>' +
        jobs.map(function (j) {
          return '<tr><td><b style="font-weight:550">' + esc(j.title) + '</b><div class="tiny dim mono">' + esc(j.name) + ' · 每 ' + Math.round(j.every / 60000) + ' 分钟</div></td>' +
            '<td class="tiny dim">' + (j.last ? dt(j.last) : '尚未执行') + '</td>' +
            '<td class="mono tiny" style="text-align:right">' + (j.last_ms || 0) + 'ms</td>' +
            '<td class="mono tiny" style="text-align:right">' + (j.ok || 0) + ' / ' + (j.errors || 0) + '</td>' +
            '<td class="tiny dim">' + (j.next ? dt(j.next) : '待触发') + '</td>' +
            '<td style="text-align:right"><button class="btn btn-sm" data-run="' + esc(j.name) + '">立即运行</button></td></tr>';
        }).join('') +
        '</tbody></table></div></div>' +

      '<div class="panel" style="margin-bottom:14px"><div class="panel-head"><h3>策略参数</h3>' +
        '<span class="tiny dim">保存后下一轮调度生效</span></div><div class="panel-body">' +
        '<div class="row" style="flex-wrap:wrap">' +
          '<div class="field" style="min-width:180px"><label>余额提醒阈值（元）</label><input class="input" id="cfgThreshold" type="number" step="1" value="' + ((cfg.low_balance_threshold || 0) / 1e6) + '"></div>' +
          '<div class="field" style="min-width:180px"><label>自动充值金额（元）</label><input class="input" id="cfgAmount" type="number" step="1" value="' + ((cfg.auto_recharge_amount || 0) / 1e6) + '"></div>' +
          '<div class="field" style="min-width:180px"><label>自动充值月度上限（元）</label><input class="input" id="cfgCap" type="number" step="1" value="' + ((cfg.auto_recharge_cap || 0) / 1e6) + '"></div>' +
          '<div class="field" style="min-width:180px"><label>风控阈值（10 分钟请求数）</label><input class="input" id="cfgRisk" type="number" step="100" value="' + (cfg.risk_requests_10m || 0) + '"></div>' +
        '</div>' +
        '<button class="btn btn-primary" id="saveCfg" style="margin-top:6px">保存参数</button>' +
        '<p class="tiny dim" style="margin-top:12px">通知投递：' + (d.notify && d.notify.configured
          ? '已配置 <span class="mono">' + esc(d.notify.url) + '</span>，队列每分钟自动投递。'
          : '未配置 NOTIFY_WEBHOOK_URL，消息只入库不发送（可在下方队列查看内容）。') + '</p>' +
      '</div></div>' +

      '<div class="grid-2">' +
        '<div class="panel"><div class="panel-head"><h3>自动化审计日志</h3><span class="tiny dim">最近 80 条</span></div>' +
          '<div class="panel-body tight" style="max-height:420px;overflow:auto"><table class="tbl compact"><thead><tr>' +
            '<th style="width:120px">时间</th><th>动作</th><th>详情</th>' +
          '</tr></thead><tbody>' +
          (logs.length ? logs.map(function (l) {
            return '<tr><td class="tiny dim">' + dt(l.ts) + '</td>' +
              '<td><span class="badge ' + (l.kind === 'risk' ? 'warn' : (l.kind === 'failover' ? 'violet' : 'ok')) + '">' + esc(l.title) + '</span></td>' +
              '<td class="tiny dim">' + esc(l.detail) + '</td></tr>';
          }).join('') : '<tr><td colspan="3"><div class="empty">暂无自动动作</div></td></tr>') +
          '</tbody></table></div></div>' +

        '<div class="panel"><div class="panel-head"><h3>通知队列</h3><span class="tiny dim">最近 30 条</span></div>' +
          '<div class="panel-body tight" style="max-height:420px;overflow:auto"><table class="tbl compact"><thead><tr>' +
            '<th>收件人</th><th>主题</th><th>状态</th>' +
          '</tr></thead><tbody>' +
          (box.length ? box.map(function (m) {
            return '<tr><td class="tiny">' + esc(m.to) + '</td>' +
              '<td class="tiny dim">' + esc(m.subject) + '</td>' +
              '<td>' + (m.status === 'sent' ? '<span class="pill-status"><i></i>已投递</span>'
                : (m.status === 'failed' ? '<span class="pill-status err"><i></i>失败</span>'
                  : '<span class="pill-status warn"><i></i>待投递</span>')) + '</td></tr>';
          }).join('') : '<tr><td colspan="3"><div class="empty">暂无通知</div></td></tr>') +
          '</tbody></table></div></div>' +
      '</div>';

    $('#autoToggle').addEventListener('click', async function () {
      try {
        await api('/api/admin/automation', { method: 'PATCH', body: { enabled: !cfg.enabled } });
        toast(cfg.enabled ? '自动化已暂停' : '自动化已启用', 'ok');
        render();
      } catch (e) { toast(e.message, 'err'); }
    });

    $$('[data-run]', root).forEach(function (b) {
      b.addEventListener('click', async function () {
        b.disabled = true;
        var label = b.textContent;
        b.textContent = '执行中…';
        try {
          var r = await api('/api/admin/automation/run', { method: 'POST', body: { job: b.getAttribute('data-run') } });
          toast('任务执行完成（' + r.ms + 'ms）', 'ok');
          render();
        } catch (e) { toast(e.message, 'err'); b.disabled = false; b.textContent = label; }
      });
    });

    $('#saveCfg').addEventListener('click', async function () {
      try {
        await api('/api/admin/automation', {
          method: 'PATCH',
          body: {
            low_balance_threshold: Number($('#cfgThreshold').value) * 1e6,
            auto_recharge_amount: Number($('#cfgAmount').value) * 1e6,
            auto_recharge_cap: Number($('#cfgCap').value) * 1e6,
            risk_requests_10m: Number($('#cfgRisk').value),
          },
        });
        toast('策略已保存', 'ok');
        render();
      } catch (e) { toast(e.message, 'err'); }
    });
  };

  /* ==================================================================
   * 启动
   * ================================================================== */
  function paintUser() {
    if (!state.me) return;
    $('#userName').textContent = state.me.name;
    $('#avatar').textContent = (state.me.name || 'A').slice(0, 1).toUpperCase();
  }

  function bindShell() {
    $('#userChip').addEventListener('click', function () {
      openModal({
        title: '账号',
        footer: false,
        body: '<div style="display:flex;gap:12px;align-items:center;margin-bottom:16px">' +
            '<span class="avatar" style="width:40px;height:40px;font-size:16px">' + esc((state.me.name || 'A').slice(0, 1)) + '</span>' +
            '<div><div style="font-weight:600">' + esc(state.me.name) + '</div><div class="tiny dim">' + esc(state.me.email) + '</div></div>' +
          '</div>' +
          '<div class="tiny muted" style="line-height:2">余额：' + money(state.me.balance) + '<br>套餐：' + esc(state.me.plan) +
            '<br>角色：' + (state.me.role === 'admin' ? '管理员' : '普通用户') + '</div>' +
          '<div style="display:flex;gap:8px;margin-top:18px"><a class="btn" href="#/settings" style="flex:1">账号设置</a>' +
          '<button class="btn" id="logoutBtn" style="flex:1">退出登录</button></div>',
        onMount: function (wrap) {
          $('#logoutBtn', wrap).addEventListener('click', async function () {
            await api('/api/auth/logout', { method: 'POST' }).catch(function () {});
            location.href = '/login';
          });
        },
      });
    });

    $('#menuBtn').addEventListener('click', function () {
      $('#side').classList.toggle('open');
    });

    if (window.innerWidth <= 1080) $('#menuBtn').style.display = 'inline-flex';

    document.addEventListener('click', function (e) {
      var a = e.target.closest('.side-nav a');
      if (a && window.innerWidth <= 1080) $('#side').classList.remove('open');
    });
  }

  async function boot() {
    try {
      var me = await api('/api/me');
      state.me = me.user;
    } catch (e) {
      return;
    }
    paintUser();
    if (state.me.role === 'admin') $('#adminNav').style.display = 'block';
    bindShell();

    try {
      var cat = await api('/api/public/models');
      state.catalog = cat;
    } catch (e) { /* ignore */ }

    window.addEventListener('hashchange', render);
    if (!location.hash) {
      location.hash = location.pathname.indexOf('/admin') === 0 ? '#/admin' : '#/dashboard';
    }
    render();
  }

  document.addEventListener('DOMContentLoaded', boot);
})();

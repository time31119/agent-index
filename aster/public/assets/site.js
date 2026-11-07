/* ASTER · 官网交互：实时价格、代码示例、公开统计 */
(function () {
  'use strict';

  var state = { models: [], groups: [], vendor: 'all', group: 'default' };
  var $ = function (sel) { return document.querySelector(sel); };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function yuan(v) {
    var n = Number(v) || 0;
    if (n >= 100) return n.toFixed(0);
    if (n >= 10) return n.toFixed(1);
    return n.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  }

  function fmtNum(n) {
    n = Number(n) || 0;
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return String(Math.round(n));
  }

  function avatar(vendor) {
    var map = { OpenAI: 'O', Anthropic: 'A', Google: 'G', 'xAI': 'x', DeepSeek: 'D', '智谱': '智', '阿里': 'Q', '月之暗面': 'K' };
    return map[vendor] || String(vendor || '?').slice(0, 1);
  }

  /* ---------------- 代码示例 ---------------- */
  var CODE = {
    curl: '<span class="c"># 一次普通调用</span>\n' +
      'curl https://api.aster.dev/v1/chat/completions \\\n' +
      '  -H <span class="s">"Authorization: Bearer sk-ast-..."</span> \\\n' +
      '  -H <span class="s">"Content-Type: application/json"</span> \\\n' +
      '  -d <span class="s">\'{"model":"claude-sonnet-5-5","messages":[{"role":"user","content":"你好"}]}\'</span>\n\n' +
      '<span class="c"># 响应头里带着本次费用与上游</span>\n' +
      '<span class="c"># x-aster-cost: 1832   x-aster-provider: anthropic</span>',
    python: '<span class="k">from</span> openai <span class="k">import</span> OpenAI\n\n' +
      'client = OpenAI(\n' +
      '    api_key=<span class="s">"sk-ast-..."</span>,\n' +
      '    base_url=<span class="s">"https://api.aster.dev/v1"</span>,\n' +
      ')\n\n' +
      'stream = client.chat.completions.create(\n' +
      '    model=<span class="s">"gpt-6-astra"</span>,\n' +
      '    messages=[{<span class="s">"role"</span>: <span class="s">"user"</span>, <span class="s">"content"</span>: <span class="s">"写一个快排"</span>}],\n' +
      '    stream=<span class="n">True</span>,\n' +
      ')\n' +
      '<span class="k">for</span> chunk <span class="k">in</span> stream:\n' +
      '    <span class="k">print</span>(chunk.choices[<span class="n">0</span>].delta.content <span class="k">or</span> <span class="s">""</span>, end=<span class="s">""</span>)',
    node: '<span class="k">import</span> OpenAI <span class="k">from</span> <span class="s">"openai"</span>;\n\n' +
      '<span class="k">const</span> client = <span class="k">new</span> OpenAI({\n' +
      '  apiKey: process.env.ASTER_KEY,\n' +
      '  baseURL: <span class="s">"https://api.aster.dev/v1"</span>,\n' +
      '});\n\n' +
      '<span class="k">const</span> res = <span class="k">await</span> client.chat.completions.create({\n' +
      '  model: <span class="s">"gemini-4-argon"</span>,\n' +
      '  messages: [{ role: <span class="s">"user"</span>, content: <span class="s">"总结这份合同"</span> }],\n' +
      '});\n' +
      'console.log(res.choices[<span class="n">0</span>].message.content);',
    claude: '<span class="c"># Claude Code 直连（Anthropic 原生协议）</span>\n' +
      '<span class="k">export</span> ANTHROPIC_BASE_URL=<span class="s">"https://api.aster.dev"</span>\n' +
      '<span class="k">export</span> ANTHROPIC_AUTH_TOKEN=<span class="s">"sk-ast-..."</span>\n' +
      '<span class="k">export</span> ANTHROPIC_MODEL=<span class="s">"claude-opus-5-5"</span>\n\n' +
      'claude\n\n' +
      '<span class="c"># Codex / Cursor 等 OpenAI 兼容客户端</span>\n' +
      '<span class="c"># Base URL 填 https://api.aster.dev/v1 即可</span>'
  };

  function renderCode(name) {
    var body = $('#codeBody');
    if (body) body.innerHTML = CODE[name] || CODE.curl;
  }

  function bindTabs() {
    var tabs = $('#codeTabs');
    if (!tabs) return;
    tabs.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-tab]');
      if (!btn) return;
      Array.prototype.forEach.call(tabs.children, function (b) { b.classList.remove('on'); });
      btn.classList.add('on');
      renderCode(btn.getAttribute('data-tab'));
    });
  }

  /* ---------------- 价格表 ---------------- */
  function renderChips() {
    var box = $('#vendorChips');
    if (!box) return;
    var vendors = ['all'];
    state.models.forEach(function (m) { if (vendors.indexOf(m.vendor) < 0) vendors.push(m.vendor); });
    box.innerHTML = vendors.map(function (v) {
      var label = v === 'all' ? '全部厂商' : v;
      return '<button class="chip' + (state.vendor === v ? ' on' : '') + '" data-vendor="' + esc(v) + '">' + esc(label) + '</button>';
    }).join('');
  }

  function renderGroups() {
    var sel = $('#groupSel');
    if (!sel) return;
    sel.innerHTML = state.groups.map(function (g) {
      return '<option value="' + esc(g.slug) + '">' + esc(g.name) + '（×' + g.multiplier + '）</option>';
    }).join('');
    sel.value = state.group;
    var hint = $('#groupHint');
    var g = state.groups.filter(function (x) { return x.slug === state.group; })[0];
    if (hint && g) hint.textContent = g.desc || '';
  }

  function renderTable() {
    var body = $('#modelRows');
    if (!body) return;
    var rows = state.models.filter(function (m) { return state.vendor === 'all' || m.vendor === state.vendor; });
    if (!rows.length) {
      body.innerHTML = '<tr><td colspan="6"><div class="empty">该厂商暂无可用模型</div></td></tr>';
      return;
    }
    body.innerHTML = rows.map(function (m) {
      var p = (m.prices && m.prices[state.group]) || m.price;
      var isImage = m.billing === 'image';
      var ctx = m.context ? (m.context >= 1000000 ? (m.context / 1000000) + 'M' : Math.round(m.context / 1000) + 'K') : '—';
      return '<tr>' +
        '<td><div class="model-cell">' +
          '<span class="model-avatar">' + esc(avatar(m.vendor)) + '</span>' +
          '<span><b>' + esc(m.name) + '</b><small>' + esc(m.slug) + '</small></span>' +
        '</div></td>' +
        '<td class="mono tiny">' + esc(ctx) + '</td>' +
        (isImage
          ? '<td colspan="3" class="price" style="text-align:right">¥' + yuan(p.unit) + ' <small>/ 张</small></td>'
          : '<td class="price" style="text-align:right">¥' + yuan(p.input) + '</td>' +
            '<td class="price" style="text-align:right">¥' + yuan(p.output) + '</td>' +
            '<td class="price" style="text-align:right">¥' + yuan(p.cache_read || 0) + '</td>') +
        '<td>' + (m.tags || []).slice(0, 2).map(function (t) { return '<span class="badge">' + esc(t) + '</span>'; }).join(' ') + '</td>' +
      '</tr>';
    }).join('');
  }

  function bindFilters() {
    var chips = $('#vendorChips');
    if (chips) {
      chips.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-vendor]');
        if (!btn) return;
        state.vendor = btn.getAttribute('data-vendor');
        renderChips();
        renderTable();
      });
    }
    var sel = $('#groupSel');
    if (sel) {
      sel.addEventListener('change', function () {
        state.group = sel.value;
        renderGroups();
        renderTable();
      });
    }
  }

  /* ---------------- 统计 ---------------- */
  function renderStats(s) {
    var set = function (id, v) { var el = $('#' + id); if (el) el.textContent = v; };
    set('stModels', s.models || '—');
    set('stReq', s.requests_24h ? fmtNum(s.requests_24h) : '0');
    set('stUptime', ((s.success_rate || 0.9995) * 100).toFixed(2) + '%');
    set('stLatency', s.avg_latency ? Math.round(s.avg_latency) + 'ms' : '—');
  }

  /* ---------------- 启动 ---------------- */
  document.addEventListener('DOMContentLoaded', function () {
    renderCode('curl');
    bindTabs();
    bindFilters();
    var y = $('#year');
    if (y) y.textContent = new Date().getFullYear();

    fetch('/api/public/models').then(function (r) { return r.json(); }).then(function (data) {
      state.models = data.models || [];
      state.groups = data.groups || [];
      if (!state.groups.length) state.groups = [{ slug: 'default', name: '标准分组', multiplier: 1, desc: '' }];
      renderChips();
      renderGroups();
      renderTable();
    }).catch(function () {
      var body = $('#modelRows');
      if (body) body.innerHTML = '<tr><td colspan="6"><div class="empty">价格加载失败，请刷新页面重试</div></td></tr>';
    });

    fetch('/api/public/stats').then(function (r) { return r.json(); }).then(renderStats).catch(function () {});
  });
})();

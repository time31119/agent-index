/* /invest 单位经济计算器
   纯前端，无依赖。改动任一滑杆即时重算，并把情景写进 URL，便于分享。 */
(function () {
  'use strict';

  var DEFAULTS = {
    np: 150, arp_p: 120,
    nt: 80, arp_t: 900,
    ne: 10, arp_e: 6000,
    share_self: 35, share_byok: 12, share_ent: 8,
    util: 62, price: 10, cost_h: 30, thru: 3000,
    opex: 37400
  };

  var CAC = 15000;          // 企业客户获客成本假设
  var MG_RESALE = 0.18;     // 官方转售毛利率
  var MG_BYOK = 0.85;
  var MG_ENT = 0.70;

  var S = Object.assign({}, DEFAULTS);
  var KEYS = Object.keys(DEFAULTS);

  function $(id) { return document.getElementById(id); }
  function num(v) { return Number(v) || 0; }

  function money(v) {
    var abs = Math.abs(v);
    var sign = v < 0 ? '-' : '';
    if (abs >= 10000) return sign + '¥' + (abs / 10000).toFixed(1) + ' 万';
    return sign + '¥' + Math.round(abs).toLocaleString('zh-CN');
  }

  function pct(v) { return (v * 100).toFixed(1) + '%'; }

  /* ---------------- 核心计算 ---------------- */

  function compute(s) {
    var revP = s.np * s.arp_p;
    var revT = s.nt * s.arp_t;
    var revE = s.ne * s.arp_e;
    var mrr = revP + revT + revE;
    var customers = s.np + s.nt + s.ne;

    // 收入结构归一化（三项之和超过 100% 时按比例压缩）
    var rawSum = s.share_self + s.share_byok + s.share_ent;
    var shSelf, shByok, shEnt, shResale;
    if (rawSum > 100) {
      shSelf = s.share_self / rawSum;
      shByok = s.share_byok / rawSum;
      shEnt = s.share_ent / rawSum;
      shResale = 0;
    } else {
      shSelf = s.share_self / 100;
      shByok = s.share_byok / 100;
      shEnt = s.share_ent / 100;
      shResale = (100 - rawSum) / 100;
    }

    var rev = {
      resale: mrr * shResale,
      self: mrr * shSelf,
      byok: mrr * shByok,
      ent: mrr * shEnt
    };

    // 自部署：每小时产出（百万 tokens） × 售价 × 利用率 = 每小时收入
    var hourlyMTok = (s.thru * 3600) / 1e6;
    var hourlyRev = hourlyMTok * s.price * (s.util / 100);
    var mgSelf = hourlyRev > 0 ? 1 - s.cost_h / hourlyRev : -1;

    var gp = rev.resale * MG_RESALE + rev.self * mgSelf + rev.byok * MG_BYOK + rev.ent * MG_ENT;
    var gm = mrr > 0 ? gp / mrr : 0;
    var net = gp - s.opex;
    var be = gm > 0 ? s.opex / gm : Infinity;

    var gpPerCustomer = customers > 0 ? gp / customers : 0;
    var clientsNeeded = gpPerCustomer > 0 ? s.opex / gpPerCustomer : Infinity;

    var ltv = s.arp_e * MG_ENT * 24;
    var ltvCac = ltv / CAC;

    return {
      mrr: mrr, arr: mrr * 12, gp: gp, gm: gm, net: net, be: be,
      mgSelf: mgSelf, rev: rev, customers: customers,
      arpu: customers > 0 ? mrr / customers : 0,
      gpPerCustomer: gpPerCustomer,
      clientsNeeded: clientsNeeded,
      ltv: ltv, ltvCac: ltvCac,
      overShares: rawSum > 100,
      shResale: shResale
    };
  }

  /* ---------------- 渲染 ---------------- */

  function render() {
    var r = compute(S);

    KEYS.forEach(function (k) {
      var el = $('v-' + k);
      if (!el) return;
      var v = S[k];
      if (k === 'opex') el.textContent = (v / 10000).toFixed(1);
      else if (k === 'price') el.textContent = Number(v).toFixed(1);
      else el.textContent = v;
    });

    $('o-mrr').textContent = money(r.mrr);
    $('o-arr').textContent = 'ARR ' + money(r.arr);
    $('o-gm').textContent = pct(r.gm);
    $('o-gp').textContent = '毛利 ' + money(r.gp) + '/月';
    $('o-net').textContent = (r.net >= 0 ? '+' : '') + money(r.net);
    $('o-net-s').textContent = r.net >= 0 ? '已盈利' : '每月烧 ' + money(-r.net);
    $('o-net-box').className = 'out ' + (r.net >= 0 ? 'good' : 'bad');

    if (isFinite(r.be)) {
      $('o-be').textContent = money(r.be);
      $('o-be-s').textContent = r.mrr >= r.be ? '已达到' : '还差 ' + money(r.be - r.mrr);
    } else {
      $('o-be').textContent = '不可达';
      $('o-be-s').textContent = '毛利率为负';
    }

    $('o-mgself').textContent = pct(r.mgSelf);
    $('o-mgself').style.color = r.mgSelf < 0.2 ? 'var(--bad)' : (r.mgSelf > 0.5 ? 'var(--ok)' : '');
    $('o-arpu').textContent = money(r.gpPerCustomer);
    $('o-clients').textContent = isFinite(r.clientsNeeded) ? Math.ceil(r.clientsNeeded) + ' 家' : '—';
    $('o-ltv').textContent = r.ltvCac.toFixed(1) + '×';

    var warn = $('calc-warn');
    var msgs = [];
    if (r.overShares) msgs.push('收入结构三项之和超过 100%，已按比例归一化。');
    if (r.mgSelf < 0.2) msgs.push('当前利用率下自部署毛利只有 ' + pct(r.mgSelf) + '，低于 20%——这是这台机器的盈亏警戒线。');
    if (r.net < 0) msgs.push('当前每月净流出 ' + money(-r.net) + '，¥200 万大约可支撑 ' + Math.floor(2000000 / (-r.net)) + ' 个月。');
    warn.style.display = msgs.length ? 'block' : 'none';
    warn.innerHTML = msgs.join('<br>');

    drawWaterfall(r);
    drawSensitivity(r);
  }

  /* ---------------- 瀑布图 ---------------- */

  function drawWaterfall(r) {
    var svg = $('wf');
    if (!svg) return;
    var W = 640, H = 190, base = 158, top = 14;
    var maxVal = Math.max(r.mrr, r.gp, S.opex, Math.abs(r.net), 1);
    var scale = (base - top) / maxVal;
    function y(v) { return base - v * scale; }

    var x0 = 62, bw = 76, gap = 22;

    var bars = [];
    bars.push({ x: x0, from: 0, to: r.mrr, color: '#7c6bff', label: '收入', value: r.mrr });
    bars.push({ x: x0 + (bw + gap), from: r.gp, to: r.mrr, color: '#ff5f7e', label: '变动成本', value: r.mrr - r.gp });
    bars.push({ x: x0 + (bw + gap) * 2, from: 0, to: r.gp, color: '#8b7bff', label: '毛利', value: r.gp });
    bars.push({ x: x0 + (bw + gap) * 3, from: Math.min(r.net, r.gp), to: Math.max(r.net, r.gp), color: '#ffc258', label: '运营', value: S.opex });
    bars.push({ x: x0 + (bw + gap) * 4, from: Math.min(0, r.net), to: Math.max(0, r.net), color: r.net >= 0 ? '#34e3a4' : '#ff5f7e', label: '净利', value: r.net });

    function short(v) {
      var a = Math.abs(v);
      if (a >= 10000) return (v / 10000).toFixed(1) + '万';
      return String(Math.round(v));
    }

    var out = '<line x1="20" y1="' + base + '" x2="' + (W - 12) + '" y2="' + base + '" stroke="rgba(255,255,255,.16)" stroke-width="1"/>';
    bars.forEach(function (b) {
      var yTop = y(Math.max(b.from, b.to));
      var h = Math.max(2, Math.abs(y(b.from) - y(b.to)));
      out += '<rect x="' + b.x + '" y="' + yTop.toFixed(1) + '" width="' + bw + '" height="' + h.toFixed(1) + '" rx="4" fill="' + b.color + '" opacity="0.85"/>';
      out += '<text x="' + (b.x + bw / 2) + '" y="' + (base + 17) + '" text-anchor="middle" font-size="10.5" fill="#8b93a7">' + b.label + '</text>';
      out += '<text x="' + (b.x + bw / 2) + '" y="' + (base + 32) + '" text-anchor="middle" font-size="10.5" fill="#cfd6e6" font-family="ui-monospace,monospace">' + short(b.value) + '</text>';
    });
    // 连接线
    for (var i = 0; i < bars.length - 1; i++) {
      var lx = bars[i].x + bw;
      var ly = y(bars[i].to);
      out += '<line x1="' + lx + '" y1="' + ly.toFixed(1) + '" x2="' + (lx + gap) + '" y2="' + ly.toFixed(1) + '" stroke="rgba(255,255,255,.14)" stroke-dasharray="3 3"/>';
    }
    svg.innerHTML = out;
  }

  /* ---------------- 敏感性图 ---------------- */

  function drawSensitivity(r) {
    var svg = $('sens');
    if (!svg) return;
    var W = 640, H = 170, padL = 40, padR = 12, padT = 12, padB = 26;
    var pts = [];
    for (var u = 5; u <= 100; u += 2.5) {
      var c = compute(Object.assign({}, S, { util: u }));
      pts.push({ u: u, net: c.net });
    }
    var maxAbs = 1;
    pts.forEach(function (p) { maxAbs = Math.max(maxAbs, Math.abs(p.net)); });
    var zeroY = padT + (H - padT - padB) / 2;
    function x(u) { return padL + (u - 5) / 95 * (W - padL - padR); }
    function y(v) { return zeroY - (v / maxAbs) * ((H - padT - padB) / 2); }

    var line = pts.map(function (p, i) { return (i ? 'L' : 'M') + x(p.u).toFixed(1) + ' ' + y(p.net).toFixed(1); }).join(' ');
    var area = line + ' L' + x(100) + ' ' + zeroY + ' L' + x(5) + ' ' + zeroY + ' Z';

    var out = '<defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">'
      + '<stop offset="0%" stop-color="#34e3a4" stop-opacity=".28"/>'
      + '<stop offset="100%" stop-color="#34e3a4" stop-opacity="0"/></linearGradient></defs>';
    out += '<line x1="' + padL + '" y1="' + zeroY + '" x2="' + (W - padR) + '" y2="' + zeroY + '" stroke="rgba(255,255,255,.18)" stroke-dasharray="4 4"/>';
    out += '<path d="' + area + '" fill="url(#sg)"/>';
    out += '<path d="' + line + '" fill="none" stroke="#34e3a4" stroke-width="2"/>';

    // 盈亏平衡利用率
    var cross = null;
    for (var i = 1; i < pts.length; i++) {
      if (pts[i - 1].net < 0 && pts[i].net >= 0) { cross = pts[i].u; break; }
    }
    if (cross !== null) {
      var bx = x(cross);
      out += '<line x1="' + bx.toFixed(1) + '" y1="' + padT + '" x2="' + bx.toFixed(1) + '" y2="' + (H - padB) + '" stroke="rgba(255,194,88,.5)" stroke-dasharray="4 4"/>';
      out += '<text x="' + (bx + 6).toFixed(1) + '" y="' + (padT + 12) + '" font-size="10.5" fill="#ffc258">盈亏平衡 ' + cross.toFixed(0) + '%</text>';
    } else if (pts.length && pts[pts.length - 1].net < 0) {
      out += '<text x="' + (W - padR) + '" y="' + (padT + 12) + '" font-size="10.5" fill="#ff5f7e" text-anchor="end">100% 利用率仍亏损</text>';
    }

    // 当前点
    var cx = x(Math.max(5, Math.min(100, S.util)));
    var cy = y(compute(S).net);
    out += '<line x1="' + cx + '" y1="' + padT + '" x2="' + cx + '" y2="' + (H - padB) + '" stroke="rgba(124,107,255,.55)" stroke-width="1"/>';
    out += '<circle cx="' + cx + '" cy="' + cy + '" r="4" fill="#7c6bff" stroke="#fff" stroke-width="1.5"/>';

    // 刻度
    out += '<text x="' + padL + '" y="' + (H - 8) + '" font-size="10" fill="#646c80">5%</text>';
    out += '<text x="' + (W - padR) + '" y="' + (H - 8) + '" font-size="10" fill="#646c80" text-anchor="end">100% 利用率</text>';
    out += '<text x="4" y="' + (padT + 8) + '" font-size="10" fill="#646c80">' + (maxAbs >= 10000 ? (maxAbs / 10000).toFixed(1) + '万' : Math.round(maxAbs)) + '</text>';
    out += '<text x="4" y="' + (H - padB) + '" font-size="10" fill="#646c80">-' + (maxAbs >= 10000 ? (maxAbs / 10000).toFixed(1) + '万' : Math.round(maxAbs)) + '</text>';
    svg.innerHTML = out;
  }

  /* ---------------- 交互 ---------------- */

  function bind() {
    KEYS.forEach(function (k) {
      var el = $(k);
      if (!el) return;
      el.value = S[k];
      el.addEventListener('input', function () {
        S[k] = num(el.value);
        render();
      });
    });

    document.querySelectorAll('[data-preset]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('[data-preset]').forEach(function (b) { b.classList.remove('on'); });
        btn.classList.add('on');
        applyPreset(btn.getAttribute('data-preset'));
      });
    });

    var shareBtn = $('shareBtn');
    if (shareBtn) {
      shareBtn.addEventListener('click', function () {
        var encoded = btoa(JSON.stringify(S));
        var url = location.origin + location.pathname + '#s=' + encoded;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(function () {
            shareBtn.textContent = '已复制链接';
            setTimeout(function () { shareBtn.textContent = '复制当前情景链接'; }, 1800);
          });
        } else {
          location.hash = 's=' + encoded;
        }
      });
    }
  }

  function applyPreset(name) {
    var p = Object.assign({}, DEFAULTS);
    if (name === 'now') {
      p.np = 20; p.nt = 3; p.ne = 0;
      p.share_self = 10; p.share_byok = 5; p.share_ent = 0;
      p.util = 30;
    } else if (name === 'y1') {
      // 默认即 12 个月目标
    } else if (name === 'y2') {
      p.np = 300; p.nt = 140; p.ne = 18;
      p.share_self = 45; p.share_byok = 10; p.share_ent = 10;
      p.util = 75; p.opex = 52000;
    } else if (name === 'stress') {
      p.util = 25;
    }
    S = p;
    Object.keys(p).forEach(function (k) {
      var el = $(k);
      if (el) el.value = p[k];
    });
    render();
  }

  function fromHash() {
    var m = /#s=([A-Za-z0-9+/=]+)/.exec(location.hash || '');
    if (!m) return;
    try {
      var obj = JSON.parse(atob(m[1]));
      Object.keys(DEFAULTS).forEach(function (k) {
        if (typeof obj[k] === 'number') S[k] = obj[k];
      });
    } catch (e) { /* 忽略坏链接 */ }
  }

  document.addEventListener('DOMContentLoaded', function () {
    fromHash();
    bind();
    render();
  });
})();

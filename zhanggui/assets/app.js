/* 掌柜 ZHANGGUI — 交互脚本（无依赖） */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var ZG = {};

  /* ---------------------------------------------------------------- 顶栏 */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var links = document.getElementById('navLinks');
    if (!toggle || !links) return;

    function close() {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', '打开菜单');
    }

    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    });

    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    document.addEventListener('click', function (e) {
      if (!links.contains(e.target) && !toggle.contains(e.target)) close();
    });
  }

  /* ---------------------------------------------------------------- 入场 */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------- 图表 */
  function smoothPath(pts) {
    if (!pts.length) return '';
    if (pts.length < 3) {
      return 'M' + pts.map(function (p) { return p.x.toFixed(2) + ',' + p.y.toFixed(2); }).join(' L');
    }
    var d = 'M' + pts[0].x.toFixed(2) + ',' + pts[0].y.toFixed(2);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i];
      var p1 = pts[i];
      var p2 = pts[i + 1];
      var p3 = pts[i + 2] || p2;
      var c1x = p1.x + (p2.x - p0.x) / 6;
      var c1y = p1.y + (p2.y - p0.y) / 6;
      var c2x = p2.x - (p3.x - p1.x) / 6;
      var c2y = p2.y - (p3.y - p1.y) / 6;
      d += ' C' + c1x.toFixed(2) + ',' + c1y.toFixed(2) + ' ' +
        c2x.toFixed(2) + ',' + c2y.toFixed(2) + ' ' +
        p2.x.toFixed(2) + ',' + p2.y.toFixed(2);
    }
    return d;
  }

  ZG.chart = function (svg, data) {
    if (!svg || !data) return;
    var NS = 'http://www.w3.org/2000/svg';
    var W = 760;
    var H = 250;
    var pad = { t: 18, r: 18, b: 30, l: 46 };
    var iw = W - pad.l - pad.r;
    var ih = H - pad.t - pad.b;

    var max = Math.max.apply(null, data.gmv.concat(data.spend, [1]));
    max = Math.ceil(max / 5000) * 5000;
    var n = data.gmv.length;

    function y(v) { return pad.t + ih - (v / max) * ih; }
    function x(i) { return pad.l + (iw * i) / (n - 1); }

    var el = function (tag, attrs) {
      var node = document.createElementNS(NS, tag);
      for (var k in attrs) node.setAttribute(k, attrs[k]);
      return node;
    };

    /* 网格与 Y 轴 */
    for (var g = 0; g <= 4; g++) {
      var val = (max / 4) * g;
      var gy = y(val);
      svg.appendChild(el('line', {
        x1: pad.l, y1: gy, x2: W - pad.r, y2: gy,
        stroke: 'rgba(233,227,214,0.07)', 'stroke-width': 1
      }));
      var label = el('text', {
        x: pad.l - 10, y: gy + 3.5,
        'text-anchor': 'end',
        fill: 'rgba(114,110,101,1)',
        'font-size': '10',
        'font-family': 'SF Mono, Consolas, monospace'
      });
      label.textContent = val === 0 ? '0' : (val / 1000) + 'k';
      svg.appendChild(label);
    }

    /* X 轴标签 */
    data.labels.forEach(function (lb, i) {
      var t = el('text', {
        x: x(i), y: H - 8,
        'text-anchor': 'middle',
        fill: 'rgba(114,110,101,1)',
        'font-size': '10',
        'font-family': 'SF Mono, Consolas, monospace'
      });
      t.textContent = lb;
      svg.appendChild(t);
    });

    var gmvPts = data.gmv.map(function (v, i) { return { x: x(i), y: y(v) }; });
    var spendPts = data.spend.map(function (v, i) { return { x: x(i), y: y(v) }; });

    /* 渐变 */
    var defs = el('defs', {});
    var grad = el('linearGradient', { id: 'zgGmvFill', x1: '0', y1: '0', x2: '0', y2: '1' });
    grad.appendChild(el('stop', { offset: '0%', 'stop-color': '#e7b968', 'stop-opacity': '0.26' }));
    grad.appendChild(el('stop', { offset: '100%', 'stop-color': '#e7b968', 'stop-opacity': '0' }));
    defs.appendChild(grad);
    svg.appendChild(defs);

    var gmvD = smoothPath(gmvPts);
    var areaD = gmvD + ' L' + x(n - 1) + ',' + (pad.t + ih) + ' L' + x(0) + ',' + (pad.t + ih) + ' Z';

    var area = el('path', { d: areaD, fill: 'url(#zgGmvFill)', opacity: '0' });
    svg.appendChild(area);

    var gmvLine = el('path', {
      d: gmvD, fill: 'none', stroke: '#e7b968', 'stroke-width': '1.8',
      'stroke-linecap': 'round', 'stroke-linejoin': 'round'
    });
    svg.appendChild(gmvLine);

    var spendLine = el('path', {
      d: smoothPath(spendPts), fill: 'none', stroke: 'rgba(95,211,168,0.75)',
      'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round'
    });
    svg.appendChild(spendLine);

    /* 末端端点 */
    var lastG = gmvPts[n - 1];
    var lastS = spendPts[n - 1];
    svg.appendChild(el('circle', { cx: lastG.x, cy: lastG.y, r: 4.5, fill: '#0b0d13', stroke: '#e7b968', 'stroke-width': 2 }));
    svg.appendChild(el('circle', { cx: lastS.x, cy: lastS.y, r: 3.5, fill: '#0b0d13', stroke: '#5fd3a8', 'stroke-width': 1.6 }));

    var tagBg = el('rect', {
      x: lastG.x - 58, y: lastG.y - 30, width: 56, height: 21, rx: 5,
      fill: 'rgba(231,185,104,0.14)', stroke: 'rgba(231,185,104,0.3)'
    });
    svg.appendChild(tagBg);
    var tag = el('text', {
      x: lastG.x - 30, y: lastG.y - 15.5, 'text-anchor': 'middle',
      fill: '#e7b968', 'font-size': '11', 'font-family': 'SF Mono, Consolas, monospace'
    });
    tag.textContent = '¥18.4k';
    svg.appendChild(tag);

    /* 动画 */
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      [gmvLine, spendLine].forEach(function (p) {
        var len = p.getTotalLength ? p.getTotalLength() : 0;
        if (!len) return;
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = len;
        p.getBoundingClientRect();
        p.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(.22,.61,.36,1)';
        p.style.strokeDashoffset = '0';
      });
      area.style.transition = 'opacity 1.2s ease 0.4s';
      area.style.opacity = '1';
    } else {
      area.style.opacity = '1';
    }
  };

  /* ---------------------------------------------------------------- 审批 */
  ZG.initQueue = function () {
    var panel = document.getElementById('queue');
    if (!panel) return;
    var cards = Array.prototype.slice.call(panel.querySelectorAll('[data-queue-item]'));
    var title = document.getElementById('queueTitle');
    var kpi = document.getElementById('kpiQueue');
    var toast = document.getElementById('toast');

    function say(msg) {
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add('is-on');
      clearTimeout(say._t);
      say._t = setTimeout(function () { toast.classList.remove('is-on'); }, 2600);
    }

    function refresh() {
      var left = cards.filter(function (c) { return !c.classList.contains('is-resolved'); }).length;
      if (title) title.textContent = '等你点头 · ' + left;
      if (kpi) kpi.innerHTML = left + '<small>件</small>';
      var chip = document.querySelector('.nav-actions .count, .side-nav .count');
      if (chip) chip.textContent = left;
    }

    function resolve(card, ok) {
      if (card.classList.contains('is-resolved')) return;
      card.classList.add('is-resolved');
      if (!ok) card.classList.add('is-rejected');
      var res = card.querySelector('[data-result]');
      if (res) {
        res.innerHTML = ok
          ? '<span aria-hidden="true">✓</span> 已批准，将在下一轮执行，并记入店铺记忆'
          : '<span aria-hidden="true">✕</span> 已驳回，同类建议 30 天内不再提出';
      }
      say(ok ? '已批准，夜班继续。' : '已驳回，记入店铺记忆。');
      refresh();
    }

    panel.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      if (btn.hasAttribute('data-approve-all')) {
        cards.forEach(function (c) { resolve(c, true); });
        return;
      }
      var card = btn.closest('[data-queue-item]');
      if (!card) return;
      if (btn.hasAttribute('data-approve')) resolve(card, true);
      if (btn.hasAttribute('data-reject')) resolve(card, false);
    });

    refresh();
  };

  /* ---------------------------------------------------------------- 提示 */
  ZG.initToast = function () {
    var toast = document.getElementById('toast');
    if (!toast) return;
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-toast]');
      if (!t) return;
      toast.textContent = t.getAttribute('data-toast');
      toast.classList.add('is-on');
      clearTimeout(ZG.initToast._t);
      ZG.initToast._t = setTimeout(function () { toast.classList.remove('is-on'); }, 2600);
    });
  };

  /* ---------------------------------------------------------------- 计算器 */
  ZG.initCalc = function () {
    var root = document.getElementById('calc');
    if (!root) return;

    var spend = document.getElementById('spendRange');
    var gmv = document.getElementById('gmvRange');
    var spendOut = document.getElementById('spendOut');
    var gmvOut = document.getElementById('gmvOut');
    var outSub = document.getElementById('outSub');
    var outFee = document.getElementById('outFee');
    var outShare = document.getElementById('outShare');
    var outTotal = document.getElementById('outTotal');
    var outRate = document.getElementById('outRate');
    var buttons = root.querySelectorAll('[data-plan]');
    var sub = 299;

    function money(v) { return '¥' + Math.round(v).toLocaleString('zh-CN'); }

    function update() {
      var s = Number(spend.value);
      var g = Number(gmv.value);
      var fee = s * 0.08;
      var share = Math.min(g * 0.03, 3000);
      var total = sub + fee + share;

      spendOut.textContent = money(s);
      gmvOut.textContent = money(g);
      outSub.textContent = money(sub);
      outFee.textContent = money(fee);
      outShare.textContent = money(share) + (g * 0.03 > 3000 ? '（已封顶）' : '');
      outTotal.textContent = money(total);
      outRate.textContent = g > 0 ? ((total / g) * 100).toFixed(1) + '%' : '—';
    }

    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        buttons.forEach(function (o) {
          o.classList.remove('is-selected');
          o.setAttribute('aria-pressed', 'false');
          o.style.borderColor = '';
          o.style.color = '';
        });
        b.classList.add('is-selected');
        b.setAttribute('aria-pressed', 'true');
        sub = Number(b.getAttribute('data-plan'));
        update();
      });
    });

    /* 初始选中态 */
    buttons.forEach(function (b) {
      if (b.classList.contains('is-selected')) {
        b.style.borderColor = 'rgba(231,185,104,0.55)';
        b.style.color = '#e7b968';
      }
    });

    spend.addEventListener('input', update);
    gmv.addEventListener('input', update);
    update();
  };

  /* ---------------------------------------------------------------- 启动 */
  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initReveal();
  });

  window.ZG = ZG;
})();

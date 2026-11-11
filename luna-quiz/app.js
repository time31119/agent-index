/*!
 * 星语测试 · 界面层
 * 纯原生 JS，无依赖。状态机：hero → intro → quiz → loading → result
 */
(function () {
  'use strict';

  var C = window.LunaContent;
  var L = window.LunaLogic;
  var root = document.getElementById('main');
  if (!C || !L || !root) {
    document.body.innerHTML =
      '<p style="padding:40px;color:#e8cf9f;font-family:sans-serif">' +
      '页面资源加载失败：请确认 content.js / logic.js 与 index.html 在同一目录。</p>';
    return;
  }

  var TOTAL = C.QUESTIONS.length;
  var STORE_KEY = 'luna.quiz.v1';
  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 状态 ---------- */
  var state = {
    screen: 'hero',
    name: '',
    month: '',
    day: '',
    answers: [],          // [{ questionIndex, optionIndex }]
    report: null,
    busy: false,          // 选项切换动画期间锁输入
    storage: safeStorage()
  };

  /* ---------- DOM ---------- */
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var screens = {
    hero: $('#screen-hero'),
    intro: $('#screen-intro'),
    quiz: $('#screen-quiz'),
    loading: $('#screen-loading'),
    result: $('#screen-result')
  };
  var els = {
    startBtn: $('#start-btn'),
    introForm: $('#intro-form'),
    name: $('#name'),
    month: $('#birth-month'),
    day: $('#birth-day'),
    introError: $('#intro-error'),
    progress: $('#progress-bar'),
    progressFill: $('#progress-fill'),
    qCount: $('#q-count'),
    backBtn: $('#back-btn'),
    questionCard: $('#question-card'),
    qTitle: $('#q-title'),
    qSub: $('#q-sub'),
    options: $('#options'),
    loadingStep: $('#loading-step'),
    loadingFill: $('#loading-fill'),
    loadingPct: $('#loading-pct'),
    resultEyebrow: $('#result-eyebrow'),
    resultSigil: $('#result-sigil'),
    resultTitle: $('#result-title'),
    resultSub: $('#result-sub'),
    resultTags: $('#result-tags'),
    reportBody: $('#report-body'),
    reportGifts: $('#report-gifts'),
    reportShadows: $('#report-shadows'),
    reportNotes: $('#report-notes'),
    reportPractice: $('#report-practice'),
    signBlock: $('#sign-block'),
    signName: $('#sign-name'),
    signElement: $('#sign-element'),
    signNote: $('#sign-note'),
    offer: $('#offer'),
    waitlistForm: $('#waitlist-form'),
    email: $('#email'),
    waitlistError: $('#waitlist-error'),
    waitlistDone: $('#waitlist-done'),
    shareBtn: $('#share-btn'),
    retakeBtn: $('#retake-btn'),
    toast: $('#toast')
  };

  /* ---------- 工具 ---------- */
  function safeStorage() {
    try {
      var k = '__probe__';
      localStorage.setItem(k, '1');
      localStorage.removeItem(k);
      return localStorage;
    } catch (e) {
      return null;
    }
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  var toastTimer = null;
  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      els.toast.classList.remove('is-visible');
    }, 2600);
  }

  /* ---------- 持久化（只存本机） ---------- */
  function saveProgress() {
    if (!state.storage) return;
    try {
      state.storage.setItem(STORE_KEY, JSON.stringify({
        name: state.name,
        month: state.month,
        day: state.day,
        answers: state.answers,
        screen: state.screen === 'result' ? 'result' : state.screen
      }));
    } catch (e) { /* 隐私模式下静默失败 */ }
  }

  function loadProgress() {
    if (!state.storage) return null;
    try {
      var raw = state.storage.getItem(STORE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || !Array.isArray(data.answers)) return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  function clearProgress() {
    if (state.storage) {
      try { state.storage.removeItem(STORE_KEY); } catch (e) {}
    }
  }

  /* ---------- 屏幕切换 ---------- */
  function show(name) {
    state.screen = name;
    Object.keys(screens).forEach(function (key) {
      screens[key].classList.toggle('is-active', key === name);
    });
    saveProgress();

    // 把焦点交给新屏幕的标题，读屏用户能立刻知道发生了什么
    var heading = screens[name].querySelector('h1, h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  /* ---------- ① 首页 ---------- */
  function initHero() {
    var saved = loadProgress();
    var hasProgress = saved && saved.answers && saved.answers.length > 0 &&
                      saved.answers.length < TOTAL;

    if (hasProgress) {
      state.name = saved.name || '';
      state.month = saved.month || '';
      state.day = saved.day || '';
      state.answers = saved.answers;

      els.startBtn.querySelector('span').textContent = '继续上次的测试';
      els.startBtn.setAttribute('aria-label', '继续上次的测试，已完成 ' + saved.answers.length + ' 题');
      var note = el('p', 'eyebrow', '已保存进度：' + saved.answers.length + ' / ' + TOTAL + ' 题');
      note.style.marginBottom = '0';
      if (els.startBtn.nextSibling) {
        els.startBtn.parentNode.insertBefore(note, els.startBtn.nextSibling);
      } else {
        els.startBtn.parentNode.appendChild(note);
      }
    }

    els.startBtn.addEventListener('click', function () {
      if (state.answers.length > 0 && state.answers.length < TOTAL) {
        renderQuestion(state.answers.length);
        show('quiz');
      } else {
        show('intro');
        setTimeout(function () { els.name.focus(); }, 120);
      }
    });
  }

  /* ---------- ② 登记 ---------- */
  function initIntro() {
    els.introForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = els.name.value.trim().slice(0, 12);
      var m = els.month.value.trim();
      var d = els.day.value.trim();

      clearError(els.introError);
      [els.name, els.month, els.day].forEach(function (input) {
        input.removeAttribute('aria-invalid');
      });

      if (!!m !== !!d) {
        return failIntro((!m ? '月份' : '日期') + '还空着一个，两个都填或都不填。',
          !m ? els.month : els.day);
      }

      if (m && d) {
        var sign = L.getSign(m, d, C);
        if (!sign) {
          return failIntro('这个日期好像不存在，检查一下月份和日期。', els.day);
        }
      }
      state.name = name;
      state.month = m;
      state.day = d;
      state.answers = [];
      saveProgress();
      renderQuestion(0);
      show('quiz');
    });
  }

  function failIntro(msg, input) {
    els.introError.textContent = msg;
    els.introError.hidden = false;
    if (input) {
      input.setAttribute('aria-invalid', 'true');
      input.focus();
    }
  }

  function clearError(node) {
    if (!node) return;
    node.textContent = '';
    node.hidden = true;
  }

  /* ---------- ③ 答题 ---------- */
  function renderQuestion(index) {
    var q = C.QUESTIONS[index];
    if (!q) return;

    state.busy = false;
    els.qTitle.textContent = q.q;
    els.qSub.textContent = q.sub || '';

    els.options.textContent = '';
    var saved = state.answers[index];

    q.options.forEach(function (opt, i) {
      var id = 'opt-' + index + '-' + i;
      var label = el('label', 'option');
      label.htmlFor = id;

      var input = document.createElement('input');
      input.type = 'radio';
      input.name = 'q' + index;
      input.id = id;
      input.value = String(i);
      input.className = 'sr-only';
      input.addEventListener('change', function () {
        choose(index, i);
      });

      var key = el('span', 'option-key', String.fromCharCode(65 + i));
      key.setAttribute('aria-hidden', 'true');

      var text = el('span', 'option-label', opt.label);

      label.appendChild(input);
      label.appendChild(key);
      label.appendChild(text);
      els.options.appendChild(label);
    });

    // 回退时恢复已选项
    if (saved) {
      var prev = els.options.querySelector('input[value="' + saved.optionIndex + '"]');
      if (prev) prev.checked = true;
    }

    els.qCount.textContent = '第 ' + (index + 1) + ' / ' + TOTAL + ' 题';
    els.backBtn.hidden = index === 0;
    els.progress.setAttribute('aria-valuenow', String(index + 1));
    els.progressFill.style.width = ((index + 1) / TOTAL * 100) + '%';

    // 重新触发入场动画
    var card = els.questionCard;
    card.classList.remove('is-leaving');
    card.style.animation = 'none';
    void card.offsetWidth;
    card.style.animation = '';

    // 键盘：1–5 直接选择
    document.onkeydown = function (e) {
      if (state.screen !== 'quiz' || state.busy) return;
      var n = parseInt(e.key, 10);
      if (n >= 1 && n <= q.options.length) {
        choose(index, n - 1);
      }
    };
  }

  function choose(index, optionIndex) {
    if (state.busy) return;

    // 回退改答案时，丢弃这一题之后的结果，避免后面的题沿用旧选择
    var hadLater = state.answers.length > index + 1;
    if (hadLater && !window.confirm('改这一题会清空后面已答的题，重新走一遍。继续吗？')) {
      var current = state.answers[index];
      var previous = els.options.querySelector('input[value="' + current.optionIndex + '"]');
      if (previous) previous.checked = true;
      return;
    }

    state.busy = true;
    if (hadLater) state.answers.length = index;

    var inputs = els.options.querySelectorAll('input');
    var labels = els.options.querySelectorAll('.option');
    labels.forEach(function (label, i) {
      label.classList.toggle('is-selected', i === optionIndex);
    });
    if (inputs[optionIndex]) inputs[optionIndex].checked = true;

    state.answers[index] = { questionIndex: index, optionIndex: optionIndex };
    saveProgress();
    addConstellationStar(index);

    // 键盘选择后，让焦点跟上选中项，读屏顺序不乱
    if (document.activeElement !== inputs[optionIndex]) {
      inputs[optionIndex].focus({ preventScroll: true });
    }

    setTimeout(function () {
      if (index + 1 < TOTAL) {
        renderQuestion(index + 1);
      } else {
        finish();
      }
    }, reduceMotion ? 60 : 360);
  }

  function initBack() {
    els.backBtn.addEventListener('click', function () {
      if (state.busy || state.screen !== 'quiz') return;
      var index = state.answers.length - 1;
      if (index <= 0) {
        // 从第 1 题退回登记页：清空进度，避免下次从中间开始
        state.answers = [];
        saveProgress();
        show('intro');
        return;
      }
      state.answers.length = index; // 丢掉最后一题，回到上一题
      renderQuestion(index - 1);
      saveProgress();
    });
  }

  /* ---------- ④ 生成中 ---------- */
  var LOADER_STEPS = [
    '读取你的 8 个答案…',
    '计算五个原型的权重…',
    '匹配你的组合人格…',
    '正在生成解读…'
  ];

  function finish() {
    show('loading');
    if (window.LunaSky) window.LunaSky.complete();

    var pct = 0;
    var step = 0;
    els.loadingFill.style.width = '0%';
    els.loadingPct.textContent = '0%';
    els.loadingStep.textContent = LOADER_STEPS[0];

    var timer = setInterval(function () {
      pct = Math.min(100, pct + (pct < 70 ? 7 : pct < 92 ? 3 : 1));
      els.loadingFill.style.width = pct + '%';
      els.loadingPct.textContent = pct + '%';

      var next = Math.min(LOADER_STEPS.length - 1, Math.floor(pct / 26));
      if (next !== step) {
        step = next;
        els.loadingStep.textContent = LOADER_STEPS[next];
      }

      if (pct >= 100) {
        clearInterval(timer);
        setTimeout(function () {
          buildAndShowReport();
        }, reduceMotion ? 80 : 320);
      }
    }, reduceMotion ? 40 : 90);
  }

  function buildAndShowReport() {
    state.report = L.buildReport({
      name: state.name,
      month: state.month,
      day: state.day,
      answers: state.answers
    }, C);

    renderReport(state.report);
    show('result');
  }

  /* ---------- ⑤ 结果 ---------- */
  function renderReport(r) {
    var a = r.archetype;
    var b = r.secondary;

    els.resultEyebrow.textContent = r.name === '你'
      ? '你的星语人格'
      : r.name + '，你的星语人格是';

    els.resultSigil.textContent = a.icon;
    els.resultTitle.textContent = r.pairTitle;
    els.resultSub.textContent = r.tagline;

    clear(els.resultTags);
    [
      a.name,
      b.name + '的底色',
      r.sign ? '太阳' + r.sign.name : null
    ].filter(Boolean).forEach(function (t) {
      els.resultTags.appendChild(el('li', null, t));
    });

    // 正文：主原型三段 + 组合点睛
    clear(els.reportBody);
    a.desc.forEach(function (p) {
      els.reportBody.appendChild(el('p', null, p));
    });
    els.reportBody.appendChild(el('p', 'blend-line', r.blend));

    clear(els.reportGifts);
    a.gift.split('、').forEach(function (g) {
      els.reportGifts.appendChild(el('li', null, g));
    });
    var pairGift = b.gift.split('、')[0];
    els.reportGifts.appendChild(el('li', null, '来自' + b.name + '的：' + pairGift));

    clear(els.reportShadows);
    a.shadow.split('；').forEach(function (s) {
      els.reportShadows.appendChild(el('li', null, s));
    });
    if (b.shadow) {
      var bShadow = b.shadow.split('；')[0];
      els.reportShadows.appendChild(el('li', null, '组合副作用：' + bShadow));
    }

    clear(els.reportNotes);
    r.notes.forEach(function (n) {
      els.reportNotes.appendChild(el('li', null, n));
    });
    if (r.sign) {
      els.reportNotes.appendChild(el('li', null,
        '你填了生日，太阳落在' + r.sign.name + '——这让你的' + r.sign.element + '元素更明显。'));
    }

    els.reportPractice.textContent = a.practice;

    if (r.sign) {
      els.signBlock.hidden = false;
      els.signName.textContent = r.sign.name;
      els.signElement.textContent = r.sign.element + '元素';
      els.signNote.textContent = r.elementNote;
    } else {
      els.signBlock.hidden = true;
    }

    // 每次生成新报告，重置订阅表单状态
    els.waitlistDone.hidden = true;
    clearError(els.waitlistError);
    els.email.value = '';
    els.waitlistForm.querySelector('.inline-field').hidden = false;
    els.waitlistForm.querySelector('label').hidden = false;
    els.waitlistForm.querySelector('.fineprint').hidden = false;
    els.offer.hidden = false;

    if (window.LunaSky) window.LunaSky.reveal();
  }

  /* ---------- 订阅（原型：仅本机存储） ---------- */
  function initWaitlist() {
    els.waitlistForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearError(els.waitlistError);
      els.email.removeAttribute('aria-invalid');

      var email = els.email.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        els.waitlistError.textContent = '邮箱格式看起来不太对，再检查一下？';
        els.waitlistError.hidden = false;
        els.email.setAttribute('aria-invalid', 'true');
        els.email.focus();
        return;
      }

      // 正式上线时，把这里替换成你的后端 / 邮件服务（见 README）
      try {
        if (state.storage) {
          var list = JSON.parse(state.storage.getItem('luna.waitlist') || '[]');
          if (list.indexOf(email) === -1) list.push(email);
          state.storage.setItem('luna.waitlist', JSON.stringify(list));
        }
      } catch (err) { /* 忽略 */ }

      els.waitlistForm.querySelector('.inline-field').hidden = true;
      els.waitlistForm.querySelector('label').hidden = true;
      els.waitlistForm.querySelector('.fineprint').hidden = true;
      els.waitlistDone.hidden = false;
      els.waitlistDone.setAttribute('tabindex', '-1');
      els.waitlistDone.focus({ preventScroll: true });
      toast('已记在这台设备上');
    });
  }

  /* ---------- 分享 / 重测 ---------- */
  function initActions() {
    els.shareBtn.addEventListener('click', function () {
      if (!state.report) return;
      var text = L.toShareText(state.report);
      var done = function () { toast('结果已复制，去分享吧 ✦'); };
      var failed = function () {
        window.prompt('复制这段结果：', text);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, failed);
      } else {
        failed();
      }
    });

    els.retakeBtn.addEventListener('click', function () {
      if (!window.confirm('重新开始会清空这次的结果，确定吗？')) return;
      state.answers = [];
      state.report = null;
      state.month = '';
      state.day = '';
      els.month.value = '';
      els.day.value = '';
      clearProgress();
      addedStars = 0;
      if (window.LunaSky) window.LunaSky.reset();
      show('intro');
      els.name.value = state.name;
      els.name.focus();
    });
  }

  /* ---------- 星空背景 ---------- */
  function initSky() {
    var canvas = document.getElementById('sky');
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext('2d');
    var stars = [];
    var links = [];
    var bright = [];
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0;
    var raf = null;
    var t0 = performance.now();
    var maxLinks = TOTAL;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var count = Math.max(70, Math.min(190, Math.round(w * h / 9000)));
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.2 + 0.25,
          a: Math.random() * 0.45 + 0.12,
          sp: Math.random() * 0.5 + 0.15,
          ph: Math.random() * Math.PI * 2
        });
      }
    }

    function draw(now) {
      var t = (now - t0) / 1000;
      ctx.clearRect(0, 0, w, h);

      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var tw = reduceMotion ? 1 : 0.65 + Math.sin(t * s.sp + s.ph) * 0.35;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(236, 231, 247,' + (s.a * tw).toFixed(3) + ')';
        ctx.fill();
      }

      // 答题时连成的个人星图
      if (links.length) {
        ctx.lineWidth = 0.6;
        ctx.strokeStyle = 'rgba(232, 207, 159, 0.22)';
        ctx.beginPath();
        for (var j = 1; j < bright.length; j++) {
          ctx.moveTo(bright[j - 1].x, bright[j - 1].y);
          ctx.lineTo(bright[j].x, bright[j].y);
        }
        ctx.stroke();
      }

      for (var k = 0; k < bright.length; k++) {
        var b = bright[k];
        var pulse = reduceMotion ? 1 : 0.8 + Math.sin(t * 1.4 + k) * 0.2;
        var g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 14);
        g.addColorStop(0, 'rgba(244, 227, 191,' + (0.9 * pulse).toFixed(3) + ')');
        g.addColorStop(0.4, 'rgba(232, 207, 159,' + (0.28 * pulse).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(232, 207, 159, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(b.x, b.y, 1.9, 0, Math.PI * 2);
        ctx.fillStyle = '#f7ecd2';
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    function start() {
      if (raf == null && !reduceMotion) raf = requestAnimationFrame(draw);
      else if (reduceMotion) draw(performance.now());
    }
    function stop() {
      if (raf != null) { cancelAnimationFrame(raf); raf = null; }
    }

    resize();
    var rt = null;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(resize, 160);
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else start();
    });

    window.LunaSky = {
      addStar: function () {
        if (bright.length >= maxLinks) return;
        bright.push({
          x: (0.12 + Math.random() * 0.76) * w,
          y: (0.1 + Math.random() * 0.7) * h
        });
        links.push(1);
        start();
      },
      complete: function () {},
      reveal: function () { start(); },
      reset: function () { bright = []; links = []; start(); }
    };

    start();
  }

  var addedStars = 0;
  function addConstellationStar(index) {
    if (!window.LunaSky) return;
    if (index < addedStars) return;
    addedStars = index + 1;
    window.LunaSky.addStar();
  }

  /* ---------- 启动 ---------- */
  function boot() {
    initHero();
    initIntro();
    initBack();
    initWaitlist();
    initActions();
    initSky();

    // 页脚锚点（#how / #privacy）：滚动到对应说明，不改变当前屏幕
    if (location.hash && /^#(how|privacy)$/.test(location.hash)) {
      var target = document.querySelector(location.hash);
      if (target) setTimeout(function () { target.scrollIntoView(); }, 60);
    }

    // 恢复：如果上次已经答完，直接给结果
    var saved = loadProgress();
    if (saved && saved.answers && saved.answers.length === TOTAL) {
      state.name = saved.name || '';
      state.month = saved.month || '';
      state.day = saved.day || '';
      state.answers = saved.answers;
      buildAndShowReport();
      toast('已恢复上次的结果');
    }

    // 演示：?demo=1（随机）/ ?demo=seed:小满:10-24
    var demo = new URLSearchParams(location.search).get('demo');
    if (demo) {
      var parts = demo.split(':');
      state.name = parts[1] || '小满';
      var seed = demo === '1' ? Math.random().toString(36).slice(2) : (parts[1] || 'demo');
      var md = (parts[2] || '10-24').split('-');
      state.month = md[0] || '';
      state.day = md[1] || '';
      state.answers = [];
      for (var i = 0; i < TOTAL; i++) {
        var h = 0;
        var str = seed + ':' + i;
        for (var j = 0; j < str.length; j++) h = (h * 31 + str.charCodeAt(j)) >>> 0;
        state.answers.push({
          questionIndex: i,
          optionIndex: Math.floor((h / 4294967296) * C.QUESTIONS[i].options.length)
        });
      }
      buildAndShowReport();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

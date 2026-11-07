/*
 * 识途 · 众筹视频分镜动画
 * 时间轴 + 中英双语字幕 + 合成音效 + 可选旁白（浏览器 TTS）
 * 没有任何音频文件：声音全部在浏览器里实时合成。
 */
(function () {
  'use strict';

  var DURATION = 75;

  // 与 SRT 文件一致
  var CUES = [
    { s: 0.8, e: 4.6, cn: '每次出门，你都要先掏出手机。', en: 'Every time you leave, you reach for your phone.' },
    { s: 5.2, e: 14.2, cn: '可你的手，早就满了。', en: 'But your hands are already full.' },
    { s: 15.3, e: 24.2, cn: '识途。按一下，说去哪。', en: 'SHITU. Press once. Say where.' },
    { s: 25.3, e: 28.2, cn: '“去最近的地铁站。”', en: '"Take me to the nearest subway."' },
    { s: 28.6, e: 31.6, cn: '“直走两百米。”', en: '"Straight for 200 meters."' },
    { s: 32.2, e: 39.8, cn: '它只说一句：前面路口，右转。', en: 'It says one thing: turn right at the corner.' },
    { s: 40.3, e: 51.5, cn: '不掏手机，不看屏。', en: 'No phone. No screen.' },
    { s: 52.2, e: 61.5, cn: '没信号，也认得回家的路。', en: 'No signal. Still knows the way home.' },
    { s: 62.2, e: 69.5, cn: '给不会用地图的人。', en: "For people who don't use maps." },
    { s: 70.2, e: 74.5, cn: '识途。Kickstarter 首发，129 美元起。', en: 'SHITU. Back us on Kickstarter. From $129.' }
  ];

  var SCENES = [[0, 5], [5, 15], [15, 25], [25, 32], [32, 40], [40, 52], [52, 62], [62, 70], [70, 75]];

  var scenes = Array.prototype.slice.call(document.querySelectorAll('.scene'));
  var subCn = document.getElementById('subCn');
  var subEn = document.getElementById('subEn');
  var timeEl = document.getElementById('time');
  var seek = document.getElementById('seek');
  var playBtn = document.getElementById('play');
  var overlay = document.getElementById('overlay');
  var sfxBtn = document.getElementById('sfxBtn');
  var ttsBtn = document.getElementById('ttsBtn');

  var t = 0;
  var playing = false;
  var lastTs = 0;
  var mode = 'both';
  var sfxOn = true;
  var ttsOn = true;
  var lastCue = -1;
  var lastScene = -1;
  var stepMark = -1;

  /* ================= 音频（Web Audio 实时合成） ================= */
  var ac = null, master = null, noiseBuf = null, rainNode = null, padGain = null;

  function ensureAudio() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!ac) {
      ac = new AC();
      master = ac.createGain();
      master.gain.value = 0.55;
      master.connect(ac.destination);
      noiseBuf = makeNoise(1.0);
      startPad();
    }
    if (ac.state === 'suspended') ac.resume();
  }

  function makeNoise(sec) {
    var len = Math.floor(ac.sampleRate * sec);
    var buf = ac.createBuffer(1, len, ac.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  // 底噪：两个低频正弦，压得很低，只负责“不空”
  function startPad() {
    var g = ac.createGain();
    g.gain.value = 0.03;
    padGain = g;
    var lp = ac.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 240;
    [55, 82.41].forEach(function (f) {
      var o = ac.createOscillator();
      o.type = 'sine';
      o.frequency.value = f;
      o.connect(lp);
      o.start();
    });
    lp.connect(g);
    g.connect(master);
  }

  function step() {
    if (!sfxOn || !ac) return;
    var src = ac.createBufferSource();
    src.buffer = noiseBuf;
    var lp = ac.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 620;
    var g = ac.createGain();
    var now = ac.currentTime;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.1, now + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
    src.connect(lp); lp.connect(g); g.connect(master);
    src.start();
    src.stop(now + 0.2);
  }

  function buzz() {
    if (!sfxOn || !ac) return;
    [0, 0.16].forEach(function (dt) {
      var o = ac.createOscillator();
      o.type = 'square';
      o.frequency.value = 108;
      var g = ac.createGain();
      var t0 = ac.currentTime + dt;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.05, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.085);
      o.connect(g); g.connect(master);
      o.start(t0); o.stop(t0 + 0.12);
    });
  }

  function ding() {
    if (!sfxOn || !ac) return;
    [880, 1318.5].forEach(function (f, i) {
      var o = ac.createOscillator();
      o.type = 'sine';
      o.frequency.value = f;
      var g = ac.createGain();
      var t0 = ac.currentTime + i * 0.06;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.06, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.9);
      o.connect(g); g.connect(master);
      o.start(t0); o.stop(t0 + 1);
    });
  }

  function rain(on) {
    if (!ac) return;
    if (on && !rainNode && sfxOn) {
      var src = ac.createBufferSource();
      src.buffer = noiseBuf;
      src.loop = true;
      var hp = ac.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 1100;
      var g = ac.createGain();
      g.gain.value = 0.055;
      src.connect(hp); hp.connect(g); g.connect(master);
      src.start();
      rainNode = { src: src, g: g };
    } else if (!on && rainNode) {
      try { rainNode.src.stop(); } catch (e) {}
      rainNode = null;
    }
  }

  /* ================= 旁白（浏览器 TTS） ================= */
  function speakCue(cue) {
    if (!ttsOn || !cue || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      var en = mode === 'en';
      var u = new SpeechSynthesisUtterance(en ? cue.en : cue.cn);
      u.lang = en ? 'en-US' : 'zh-CN';
      u.rate = 0.98;
      u.pitch = 1;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  function stopSpeech() {
    try { window.speechSynthesis.cancel(); } catch (e) {}
  }

  /* ================= 画面 ================= */
  function sceneIndex() {
    for (var i = 0; i < SCENES.length; i++) {
      if (t >= SCENES[i][0] && t < SCENES[i][1]) return i;
    }
    return SCENES.length - 1;
  }

  function cueIndex() {
    for (var j = 0; j < CUES.length; j++) {
      if (t >= CUES[j].s && t <= CUES[j].e) return j;
    }
    return -1;
  }

  function render() {
    var si = sceneIndex();
    for (var i = 0; i < scenes.length; i++) {
      scenes[i].classList.toggle('on', i === si);
    }

    var ci = cueIndex();
    var cue = ci >= 0 ? CUES[ci] : null;

    subCn.textContent = cue ? cue.cn : '';
    subEn.textContent = cue ? cue.en : '';
    subCn.style.visibility = mode === 'en' ? 'hidden' : 'visible';
    subEn.style.visibility = mode === 'cn' ? 'hidden' : 'visible';

    seek.value = t;
    timeEl.textContent = fmt(t) + ' / ' + fmt(DURATION);

    return { si: si, ci: ci, cue: cue };
  }

  function fmt(s) {
    s = Math.max(0, Math.floor(s));
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  /* ================= 播放控制 ================= */
  function loop(now) {
    if (playing) {
      if (!lastTs) lastTs = now;
      t += (now - lastTs) / 1000;
      lastTs = now;
      if (t >= DURATION) {
        t = DURATION;
        pause();
      }
      var st = render();

      // 镜头切换：只触发一次
      if (st.si !== lastScene) {
        lastScene = st.si;
        if (st.si === 1) buzz();   // 包里手机在响
        if (st.si === 4) buzz();   // 转弯时的两下震动
        if (st.si === 8) ding();   // 结尾提示音
      }

      // 脚步声（镜头 1）
      if (st.si === 0) {
        var k = Math.floor(t / 0.55);
        if (k !== stepMark) { stepMark = k; step(); }
      } else {
        stepMark = -1;
      }

      // 雨声（镜头 6）
      rain(st.si === 5);

      // 旁白：只在进入新字幕时念一次
      if (st.ci !== lastCue) {
        lastCue = st.ci;
        if (st.cue) speakCue(st.cue);
      }
    } else {
      render();
    }
    requestAnimationFrame(loop);
  }

  function play() {
    ensureAudio();
    if (t >= DURATION) t = 0;
    playing = true;
    lastTs = 0;
    lastCue = -1;
    playBtn.textContent = '暂停';
    if (overlay) overlay.classList.add('hide');
    if (padGain && ac) padGain.gain.setTargetAtTime(0.03, ac.currentTime, 0.25);
    var st = render();
    lastCue = st.ci;
    if (st.cue) speakCue(st.cue);
  }

  function pause() {
    playing = false;
    playBtn.textContent = '播放';
    if (overlay) overlay.classList.remove('hide');
    if (padGain && ac) padGain.gain.setTargetAtTime(0, ac.currentTime, 0.2);
    rain(false);
    stopSpeech();
    lastCue = cueIndex();
  }

  function toggle() {
    if (playing) pause(); else play();
  }

  /* ================= 初始化 ================= */
  playBtn.addEventListener('click', toggle);
  if (overlay) overlay.addEventListener('click', toggle);

  document.getElementById('restart').addEventListener('click', function () {
    t = 0;
    lastCue = -1;
    lastScene = -1;
    stepMark = -1;
    render();
    if (!playing) play(); else { rain(false); }
  });

  seek.addEventListener('input', function () {
    t = parseFloat(seek.value) || 0;
    lastCue = cueIndex();
    lastScene = -1;
    stepMark = -1;
    render();
    if (playing) { stopSpeech(); rain(false); }
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-mode]'), function (btn) {
    btn.addEventListener('click', function () {
      mode = btn.dataset.mode;
      Array.prototype.forEach.call(document.querySelectorAll('[data-mode]'), function (b) {
        b.classList.toggle('on', b === btn);
      });
      render();
    });
  });

  sfxBtn.addEventListener('click', function () {
    sfxOn = !sfxOn;
    sfxBtn.textContent = '音效 ' + (sfxOn ? '开' : '关');
    if (!sfxOn) rain(false);
  });

  ttsBtn.addEventListener('click', function () {
    ttsOn = !ttsOn;
    ttsBtn.textContent = '旁白 ' + (ttsOn ? '开' : '关');
    if (!ttsOn) stopSpeech();
  });

  document.addEventListener('keydown', function (e) {
    if (e.code === 'Space') {
      var tag = e.target && e.target.tagName;
      if (tag === 'BUTTON' || tag === 'INPUT') return;
      e.preventDefault();
      toggle();
    }
  });

  // 产品镜头
  var slot = document.getElementById('productSlot');
  if (slot && window.PENDANT) {
    try { slot.innerHTML = window.PENDANT.render(window.PENDANT.CONCEPTS[0], 'vid'); } catch (e) {}
  }

  render();
  requestAnimationFrame(loop);
})();

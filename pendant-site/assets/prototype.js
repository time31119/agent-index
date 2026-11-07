/*
 * 识途 SHITU · 手机 Web 原型
 * 定位 + 语音输入 + 路线 + 语音播报
 * 无高德 Key 时使用内置演示路线，保证任何环境都能跑通。
 */
(function () {
  'use strict';

  var $ = function (s) { return document.querySelector(s); };

  var DEMO_START = { lat: 39.9042, lng: 116.4074, name: '天安门东（示例起点）' };
  var POIS = {
    '王府井': { lat: 39.9151, lng: 116.4074 },
    '天安门': { lat: 39.9087, lng: 116.3975 },
    '外滩': { lat: 31.2397, lng: 121.4998 },
    '南京东路': { lat: 31.2354, lng: 121.4802 },
    '西湖': { lat: 30.2425, lng: 120.1500 }
  };

  var S = {
    pos: null, dest: null, destName: '',
    segs: [], total: 0, dist: 0,
    timer: null, watchId: null, rec: null,
    listening: false, voice: true, useGps: false,
    lastSeg: -1, arrived: false
  };

  /* ---------- 数学 ---------- */
  function toRad(x) { return x * Math.PI / 180; }

  function dist(a, b) {
    var R = 6371000;
    var dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
    var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(s));
  }

  function bearing(a, b) {
    var y = Math.sin(toRad(b.lng - a.lng)) * Math.cos(toRad(b.lat));
    var x = Math.cos(toRad(a.lat)) * Math.sin(toRad(b.lat)) -
      Math.sin(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.cos(toRad(b.lng - a.lng));
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  }

  function fmt(m) {
    m = Math.max(0, Math.round(m));
    return m >= 1000 ? (m / 1000).toFixed(2) + ' 公里' : m + ' 米';
  }

  /* ---------- 路线 ---------- */
  function buildMockRoute(a, b) {
    var pts = [{ lat: a.lat, lng: a.lng }];
    var n = 4;
    for (var i = 1; i < n; i++) {
      var t = i / n;
      var lat = a.lat + (b.lat - a.lat) * t;
      var lng = a.lng + (b.lng - a.lng) * t;
      var dLat = b.lat - a.lat, dLng = b.lng - a.lng;
      var len = Math.sqrt(dLat * dLat + dLng * dLng) || 1e-9;
      var off = len * 0.09 * (i % 2 ? 1 : -1);
      lat += dLng / len * off;
      lng += -dLat / len * off;
      pts.push({ lat: lat, lng: lng });
    }
    pts.push({ lat: b.lat, lng: b.lng });
    return pts;
  }

  function buildSegs(route) {
    var segs = [];
    for (var i = 0; i < route.length - 1; i++) {
      segs.push({
        from: route[i], to: route[i + 1],
        len: dist(route[i], route[i + 1]),
        brg: bearing(route[i], route[i + 1]),
        turn: '继续直行'
      });
    }
    for (var j = 0; j < segs.length - 1; j++) {
      var diff = ((segs[j + 1].brg - segs[j].brg + 540) % 360) - 180;
      segs[j].turn = diff > 20 ? '右转' : diff < -20 ? '左转' : '继续直行';
    }
    if (segs.length) segs[segs.length - 1].turn = '到达';
    return segs;
  }

  function setSegs(segs) {
    S.segs = segs;
    S.total = segs.reduce(function (a, s) { return a + s.len; }, 0);
    S.dist = 0;
    S.lastSeg = -1;
    S.arrived = false;
  }

  function posAt(d) {
    if (!S.segs.length) return null;
    var acc = 0;
    for (var i = 0; i < S.segs.length; i++) {
      var s = S.segs[i];
      if (d <= acc + s.len || i === S.segs.length - 1) {
        var t = s.len > 0 ? Math.max(0, Math.min(1, (d - acc) / s.len)) : 1;
        return {
          lat: s.from.lat + (s.to.lat - s.from.lat) * t,
          lng: s.from.lng + (s.to.lng - s.from.lng) * t,
          seg: i,
          remain: Math.max(0, s.len * (1 - t))
        };
      }
      acc += s.len;
    }
    return null;
  }

  function snapToRoute(p) {
    if (!S.segs.length) return false;
    var bestD = Infinity, bestDist = 0, acc = 0;
    S.segs.forEach(function (s) {
      for (var t = 0; t <= 1; t += 0.04) {
        var q = {
          lat: s.from.lat + (s.to.lat - s.from.lat) * t,
          lng: s.from.lng + (s.to.lng - s.from.lng) * t
        };
        var d = dist(p, q);
        if (d < bestD) { bestD = d; bestDist = acc + s.len * t; }
      }
      acc += s.len;
    });
    if (bestD < 90) { S.dist = bestDist; return true; }
    return false;
  }

  /* ---------- 高德（可选） ---------- */
  function amapKey() {
    var el = $('#amapKey');
    return el ? el.value.trim() : '';
  }

  function amapGeocode(addr, key) {
    var url = 'https://restapi.amap.com/v3/geocode/geo?address=' +
      encodeURIComponent(addr) + '&key=' + encodeURIComponent(key);
    return fetch(url).then(function (r) { return r.json(); }).then(function (j) {
      if (j.status !== '1' || !j.geocodes || !j.geocodes.length) {
        throw new Error(j.info || '高德没有找到这个地址');
      }
      var loc = j.geocodes[0].location.split(',');
      return { lat: Number(loc[1]), lng: Number(loc[0]) };
    });
  }

  function amapWalking(a, b, key) {
    var url = 'https://restapi.amap.com/v3/direction/walking?origin=' +
      a.lng + ',' + a.lat + '&destination=' + b.lng + ',' + b.lat +
      '&key=' + encodeURIComponent(key);
    return fetch(url).then(function (r) { return r.json(); }).then(function (j) {
      if (j.status !== '1' || !j.route || !j.route.paths || !j.route.paths.length) {
        throw new Error(j.info || '高德没有返回路线');
      }
      var pts = [];
      j.route.paths[0].steps.forEach(function (st) {
        (st.polyline || '').split(';').forEach(function (pair) {
          var p = pair.split(',');
          var lng = Number(p[0]), lat = Number(p[1]);
          if (isFinite(lat) && isFinite(lng)) pts.push({ lat: lat, lng: lng });
        });
      });
      if (pts.length < 2) throw new Error('路线为空');
      return buildSegs(pts);
    });
  }

  /* ---------- 语音 ---------- */
  function speak(text) {
    log('🔊 ' + text);
    if (!S.voice || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN';
      u.rate = 1.05;
      window.speechSynthesis.speak(u);
    } catch (e) { /* 忽略 */ }
  }

  function startListen() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { log('这个浏览器不支持语音识别，请直接打字'); return; }
    if (S.listening) return;
    try {
      var rec = new SR();
      rec.lang = 'zh-CN';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onstart = function () {
        S.listening = true;
        $('#mic').classList.add('listening');
        $('#mic').textContent = '在听…';
        log('开始听');
      };
      rec.onresult = function (e) {
        var text = e.results[0][0].transcript;
        log('听到：' + text);
        resolveDest(text);
      };
      rec.onerror = function (e) { log('识别失败：' + e.error); };
      rec.onend = function () {
        S.listening = false;
        $('#mic').classList.remove('listening');
        $('#mic').textContent = '点一下说';
      };
      rec.start();
      S.rec = rec;
    } catch (e) {
      log('无法启动语音识别：' + e.message);
    }
  }

  /* ---------- 目的地 ---------- */
  function nearestPoi(p) {
    var best = null, bd = Infinity;
    Object.keys(POIS).forEach(function (k) {
      var d = dist(p, POIS[k]);
      if (d < bd) { bd = d; best = k; }
    });
    return { name: best, d: bd };
  }

  function resolveDest(text) {
    var q = String(text).replace(/^(导航到|带我去|我想去|我要去|去|到)/, '').trim();
    if (!q) { log('没听清地点'); return; }
    var hit = Object.keys(POIS).filter(function (k) { return q.indexOf(k) >= 0 || k.indexOf(q) >= 0; })[0];
    if (hit) { setDest(POIS[hit], hit); return; }

    var key = amapKey();
    if (!key) {
      log('没匹配到「' + q + '」。可试试：' + Object.keys(POIS).join('、') + '，或在设置里填高德 Key');
      return;
    }
    log('正在用高德解析「' + q + '」…');
    amapGeocode(q, key).then(function (p) {
      setDest(p, q);
    }).catch(function (e) {
      log('高德解析失败：' + e.message);
    });
  }

  function setDest(p, name) {
    S.dest = { lat: p.lat, lng: p.lng };
    S.destName = name;
    // 演示模式下，如果起点离目的地太远（跨城），把起点挪到附近，保证能模拟走完
    if (!S.useGps && (!S.pos || dist(S.pos, S.dest) > 50000)) {
      S.pos = { lat: p.lat - 0.006, lng: p.lng - 0.004 };
      log('起点已设为目的地附近（演示用）');
    }
    $('#to').textContent = '目的地 · ' + name;
    log('目的地：' + name);
    plan();
  }

  /* ---------- 规划 ---------- */
  function plan() {
    if (!S.dest) return;
    if (!S.pos) S.pos = { lat: DEMO_START.lat, lng: DEMO_START.lng };

    var key = amapKey();
    if (key) {
      log('用高德规划步行路线…');
      amapWalking(S.pos, S.dest, key).then(function (segs) {
        setSegs(segs);
        log('高德路线：' + fmt(S.total));
        afterPlan();
      }).catch(function (e) {
        log('高德路线失败，改用演示路线：' + e.message);
        useMock();
      });
    } else {
      useMock();
    }
  }

  function useMock() {
    setSegs(buildSegs(buildMockRoute(S.pos, S.dest)));
    afterPlan();
  }

  function afterPlan() {
    var p = posAt(0);
    renderNav(p);
    draw();
    speak('路线已规划，全程约 ' + fmt(S.total));
  }

  /* ---------- 导航 ---------- */
  function startNav() {
    if (!S.dest) {
      log('先告诉我目的地');
      speak('请先说你要去哪');
      return;
    }
    if (!S.pos) S.pos = { lat: DEMO_START.lat, lng: DEMO_START.lng };

    if (!S.segs.length) {
      plan();
      if (!S.segs.length) {
        log('正在规划路线，请稍后再点一次“开始导航”');
        return;
      }
    }
    S.dist = 0;
    S.lastSeg = 0;
    S.arrived = false;
    renderNav(posAt(0));
    draw();
    log('开始导航（模拟前进）');
    var first = S.segs[0];
    speak('开始导航，全程约 ' + fmt(S.total) + '，先直行 ' + fmt(first.len) + '，然后' + first.turn);

    if (S.timer) clearInterval(S.timer);
    S.timer = setInterval(tick, 120);

    if (S.useGps) startWatch();
  }

  function tick() {
    if (!S.segs.length) return;
    S.dist = Math.min(S.total, S.dist + 5);
    var p = posAt(S.dist);
    renderNav(p);
    draw();

    if (p && p.seg !== S.lastSeg) {
      S.lastSeg = p.seg;
      var seg = S.segs[p.seg];
      if (seg.turn === '到达') speak('继续前行 ' + fmt(p.remain) + '，到达目的地');
      else speak('直行 ' + fmt(seg.len) + '，然后' + seg.turn);
      $('#arrow').textContent = seg.turn === '右转' ? '→' : seg.turn === '左转' ? '←' : '↑';
    }

    if (S.dist >= S.total - 1 && !S.arrived) {
      S.arrived = true;
      stopNav(true);
      speak('到达目的地附近');
      log('已到达');
    }
  }

  function stopNav(silent) {
    if (S.timer) { clearInterval(S.timer); S.timer = null; }
    if (S.watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(S.watchId);
      S.watchId = null;
    }
    if (!silent) log('已结束导航');
    $('#arrow').textContent = '↑';
  }

  function startWatch() {
    if (!navigator.geolocation) { log('不支持定位'); return; }
    if (S.watchId !== null) return;
    S.watchId = navigator.geolocation.watchPosition(function (pos) {
      S.pos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      snapToRoute(S.pos);
      var p = posAt(S.dist);
      renderNav(p);
      draw();
    }, function (e) {
      log('定位失败：' + e.message);
    }, { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 });
  }

  function renderNav(p) {
    if (!p) {
      $('#ins').textContent = '先说出你要去哪';
      $('#sub').textContent = '例如：去王府井';
      $('#arrow').textContent = '↑';
      return;
    }
    var seg = S.segs[p.seg];
    var left = S.total - S.dist;
    var mins = Math.max(1, Math.round(left / 1.35 / 60));

    if (seg.turn === '到达') {
      $('#ins').textContent = '继续前行 ' + fmt(p.remain) + ' 到达';
      $('#arrow').textContent = '●';
    } else {
      $('#ins').textContent = '前方 ' + fmt(p.remain) + ' ' + seg.turn;
      $('#arrow').textContent = seg.turn === '右转' ? '→' : seg.turn === '左转' ? '←' : '↑';
    }
    $('#sub').textContent = '距终点 ' + fmt(left) + ' · 约 ' + mins + ' 分钟' +
      (S.useGps ? ' · GPS' : ' · 模拟');
  }

  /* ---------- 画布 ---------- */
  function draw() {
    var c = $('#map');
    if (!c) return;
    var dpr = window.devicePixelRatio || 1;
    var w = c.clientWidth, h = c.clientHeight;
    if (!w || !h) return;
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
    }
    var ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#070b10';
    ctx.fillRect(0, 0, w, h);

    // 网格
    ctx.strokeStyle = 'rgba(255,255,255,.045)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < w; gx += 36) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
    }
    for (var gy = 0; gy < h; gy += 36) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
    }

    if (!S.segs.length) {
      ctx.fillStyle = '#3d4b5c';
      ctx.font = '13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('说出目的地后，这里会画出路线', w / 2, h / 2);
      return;
    }

    // 包围盒
    var pts = [];
    S.segs.forEach(function (s) { pts.push(s.from); });
    pts.push(S.segs[S.segs.length - 1].to);
    if (S.pos) pts.push(S.pos);

    var minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    pts.forEach(function (p) {
      minLat = Math.min(minLat, p.lat); maxLat = Math.max(maxLat, p.lat);
      minLng = Math.min(minLng, p.lng); maxLng = Math.max(maxLng, p.lng);
    });

    var midLat = (minLat + maxLat) / 2;
    var cos = Math.cos(toRad(midLat)) || 1;
    var mLat = 111320, mLng = 111320 * cos;
    var spanX = Math.max(1, (maxLng - minLng) * mLng);
    var spanY = Math.max(1, (maxLat - minLat) * mLat);
    var padX = 44, padY = 44;
    var scale = Math.min((w - padX * 2) / spanX, (h - padY * 2) / spanY);
    var cx = (minLng + maxLng) / 2, cy = (minLat + maxLat) / 2;

    function map(p) {
      return {
        x: w / 2 + (p.lng - cx) * mLng * scale,
        y: h / 2 - (p.lat - cy) * mLat * scale
      };
    }

    // 路线
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(255,107,53,.95)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    S.segs.forEach(function (s, i) {
      var a = map(s.from);
      if (i === 0) ctx.moveTo(a.x, a.y);
      var b = map(s.to);
      ctx.lineTo(b.x, b.y);
    });
    ctx.stroke();

    // 已走部分
    if (S.dist > 0) {
      ctx.strokeStyle = 'rgba(94,234,212,.65)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      var cur = posAt(S.dist);
      ctx.moveTo(map(S.segs[0].from).x, map(S.segs[0].from).y);
      for (var i = 0; i < S.segs.length; i++) {
        if (i < cur.seg) {
          var q = map(S.segs[i].to); ctx.lineTo(q.x, q.y);
        } else {
          var q2 = map(cur); ctx.lineTo(q2.x, q2.y);
          break;
        }
      }
      ctx.stroke();
    }

    // 终点
    var d = map(S.dest);
    ctx.fillStyle = '#ff6b35';
    ctx.beginPath(); ctx.arc(d.x, d.y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,107,53,.45)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(d.x, d.y, 13, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#c9d5e3';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(S.destName || '终点', d.x, d.y - 20);

    // 当前位置
    var me = S.pos ? map(S.pos) : map(S.segs[0].from);
    var pulse = 10 + Math.sin(Date.now() / 400) * 2;
    ctx.fillStyle = 'rgba(94,234,212,.18)';
    ctx.beginPath(); ctx.arc(me.x, me.y, pulse + 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5eead4';
    ctx.beginPath(); ctx.arc(me.x, me.y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#071016'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(me.x, me.y, 6, 0, Math.PI * 2); ctx.stroke();

    // 比例尺
    var meters = 100;
    var px = meters * scale;
    if (px > w * 0.5) { meters = 50; px = meters * scale; }
    ctx.strokeStyle = 'rgba(255,255,255,.35)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(16, h - 16); ctx.lineTo(16 + px, h - 16); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    ctx.font = '10px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(meters + ' m', 16, h - 22);
  }

  /* ---------- 日志 ---------- */
  function log(msg) {
    var el = $('#log');
    if (!el) return;
    var d = document.createElement('div');
    var t = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    d.textContent = t + '  ' + msg;
    el.insertBefore(d, el.firstChild);
    el.scrollTop = 0;
  }

  /* ---------- 初始化 ---------- */
  function init() {
    if (location.protocol === 'file:') {
      var b = $('#banner');
      b.hidden = false;
      b.textContent = '提示：当前是 file:// 打开，浏览器会禁用定位和麦克风。请用 python -m http.server 起一个本地服务，访问 http://localhost:8000/prototype.html';
    }

    S.pos = { lat: DEMO_START.lat, lng: DEMO_START.lng };
    $('#to').textContent = '起点 · ' + DEMO_START.name;

    // 恢复设置
    try {
      var k = localStorage.getItem('shitu_amap_key');
      if (k) $('#amapKey').value = k;
    } catch (e) {}

    $('#mic').addEventListener('click', function () {
      if (S.listening && S.rec) { S.rec.stop(); return; }
      startListen();
    });

    $('#ask').addEventListener('submit', function (e) {
      e.preventDefault();
      var v = $('#dest').value.trim();
      if (v) resolveDest(v);
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-poi]'), function (btn) {
      btn.addEventListener('click', function () {
        var name = btn.dataset.poi;
        setDest(POIS[name], name);
      });
    });

    $('#start').addEventListener('click', startNav);
    $('#stop').addEventListener('click', function () { stopNav(false); });

    $('#voice').addEventListener('change', function () { S.voice = this.checked; });
    $('#useGps').addEventListener('change', function () {
      S.useGps = this.checked;
      if (this.checked) {
        if (!navigator.geolocation) { log('浏览器不支持定位'); return; }
        navigator.geolocation.getCurrentPosition(function (p) {
          S.pos = { lat: p.coords.latitude, lng: p.coords.longitude };
          log('拿到你的位置：' + S.pos.lat.toFixed(4) + ', ' + S.pos.lng.toFixed(4));
          var near = nearestPoi(S.pos);
          if (near.d > 100000) {
            log('你离示例目的地很远，自动切到最近的演示点：' + near.name);
            setDest(POIS[near.name], near.name);
          } else if (S.dest) {
            plan();
          }
        }, function (e) { log('定位失败：' + e.message); }, { enableHighAccuracy: true, timeout: 10000 });
      }
    });

    $('#amapKey').addEventListener('change', function () {
      try { localStorage.setItem('shitu_amap_key', this.value.trim()); } catch (e) {}
    });

    window.addEventListener('resize', draw);
    setInterval(draw, 900); // 让呼吸点动起来

    log('就绪。先点一个演示目的地，再点“开始导航”。');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

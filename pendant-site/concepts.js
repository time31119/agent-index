/*
 * 10 款「可穿戴 AI 挂件」概念图
 * 纯 SVG 参数化生成，不依赖任何外部图片，直接 file:// 打开也能显示。
 * 用法：window.PENDANT.CONCEPTS / window.PENDANT.render(concept, index)
 */
(function (global) {
  'use strict';

  var CONCEPTS = [
    {
      id: 'pebble', name: '鹅卵石', en: 'PEBBLE', cat: 'daily',
      tagline: '像一颗温润的石头，只在你需要时开口',
      desc: '圆形磨砂机身，正面一块低功耗墨水屏。平时只显示时间，导航时只显示一个会随你转向的箭头。它不提供地图，只回答“下一步往哪走”。',
      tags: ['日常', '极简'],
      spec: { 形态: '圆形 · 直径 42mm', 材质: '磨砂再生塑料 + 硅胶圈', 交互: '单键 / 双击唤醒', 适合: '通勤、不爱盯屏幕的人', 方案: '蓝牙伴生版', 成本: 'BOM ¥65–90' },
      shape: 'circle', screen: 'route', clip: 'magnet', led: false,
      colors: { bg1: '#f2ede4', bg2: '#ddd3c2', body1: '#fdfcf9', body2: '#d6cfc0', accent: '#ff6a3d', screen: '#faf7f0', ink: '#2a2a2a' }
    },
    {
      id: 'ring', name: '航迹环', en: 'ROUTE RING', cat: 'outdoor',
      tagline: '用一圈光代替屏幕，指向你要去的地方',
      desc: '阳极氧化铝外壳，正面是一圈 24 颗 LED。方向由光带的缺口位置表示，距离用光带长度表示；戴手套、看不了屏也能用，配合轻微震动几乎不用低头。',
      tags: ['户外', '运动'],
      spec: { 形态: '圆形 · 46mm · 厚 9mm', 材质: '6063 铝合金 + 蓝宝石玻璃', 交互: '旋转表冠 + 震动', 适合: '跑步、骑行、徒步', 方案: '蓝牙伴生版', 成本: 'BOM ¥95–130' },
      shape: 'circle', screen: 'compass', clip: 'ring', led: true,
      colors: { bg1: '#0e1a21', bg2: '#16303c', body1: '#46545d', body2: '#222c33', accent: '#4ff0c6', screen: '#0b141a', ink: '#e8fff9' }
    },
    {
      id: 'voicepin', name: '语音徽章', en: 'VOICE PIN', cat: 'play',
      tagline: '别在胸口，随时开口，松手就答',
      desc: '织物表带配三色 LED 点。按住侧键说话，松手即发送，回答从正面小喇叭出来。没有屏幕，只有光：白=待机、青=在听、橙=在想。',
      tags: ['潮玩', '学生'],
      spec: { 形态: '方形 · 38×42mm', 材质: '再生织物 + 再生铝', 交互: '按住说话 / 双击打断', 适合: '学生、开发者、播客党', 方案: '蓝牙伴生版', 成本: 'BOM ¥70–95' },
      shape: 'square', screen: 'wave', clip: 'lanyard', led: false,
      colors: { bg1: '#1d1430', bg2: '#2c1d48', body1: '#7a5ae0', body2: '#4a2fa0', accent: '#ffe066', screen: '#190f2e', ink: '#f3ecff' }
    },
    {
      id: 'card', name: '口袋卡', en: 'POCKET CARD', cat: 'pro',
      tagline: '塞进口袋的路线卡，两周充一次电',
      desc: '超薄卡片形态，电子墨水屏不耗电。只显示两行字：下一步动作和剩余距离。没有喇叭，靠震动提醒；适合开会、出差这种“不想掏手机”的场合。',
      tags: ['商务', '长续航'],
      spec: { 形态: '卡片 · 62×44×7mm', 材质: '不锈钢中框 + 素皮背板', 交互: '轻触翻页 + 震动', 适合: '商务差旅、会议多的人', 方案: '蓝牙伴生版', 成本: 'BOM ¥80–110' },
      shape: 'card', screen: 'text', clip: 'none', led: false,
      copy: ['右转 200 米', '沿建设路直行'],
      colors: { bg1: '#e9edf0', bg2: '#cbd3d9', body1: '#f8f9fa', body2: '#c9d1d7', accent: '#2f6bff', screen: '#f1f2ee', ink: '#22282e' }
    },
    {
      id: 'loop', name: '小绳结', en: 'LOOP', cat: 'care',
      tagline: '孩子的第一个 AI 伙伴，一按就有人应',
      desc: '食品级硅胶，圆润无棱角，一根挂绳挂在脖子上。一颗大按钮：按一下说“我要回家”，它就开始导航并用最慢的语速一步步说；长按直接呼叫家人。',
      tags: ['儿童', '关怀'],
      spec: { 形态: '胶囊 · 58×34×16mm', 材质: '食品级硅胶 + 尼龙绳', 交互: '单大键 / 长按呼叫', 适合: '6–12 岁儿童、老人', 方案: '蓝牙伴生版', 成本: 'BOM ¥60–85' },
      shape: 'pill', screen: 'home', clip: 'lanyard', led: false, button: true,
      colors: { bg1: '#ffe9d8', bg2: '#ffd0ae', body1: '#ffb27a', body2: '#ff8a4c', accent: '#ffffff', screen: '#fff6ec', ink: '#7a3b12' }
    },
    {
      id: 'clip', name: '领夹', en: 'CLIP', cat: 'daily',
      tagline: '夹在衣领，轻声说，只有你听得见',
      desc: '哑光金属小方块，背面强磁夹。配骨传导振子，贴着锁骨传声，地铁里也能听清又不外放。开会时把回答“只震动不发声”，抬手一碰就知道结果。',
      tags: ['通勤', '隐私'],
      spec: { 形态: '方块 · 34×30×8mm', 材质: '阳极铝 + 磁吸夹', 交互: '单键 + 触觉反馈', 适合: '地铁通勤、开放式办公', 方案: '蓝牙伴生版', 成本: 'BOM ¥85–115' },
      shape: 'square', screen: 'dial', clip: 'clip', led: false, dialPct: 0.72, dialText: '6',
      colors: { bg1: '#e8ebee', bg2: '#c7ced5', body1: '#333a41', body2: '#151a1f', accent: '#7dd3fc', screen: '#0d1216', ink: '#dff6ff' }
    },
    {
      id: 'trail', name: '山径', en: 'TRAIL', cat: 'outdoor',
      tagline: '没信号也能带你回起点',
      desc: '军绿橡胶包边、IP67 防水、背面一条太阳能边条。上山前同步路线，山里断网就切到离线航位推算：指南针 + 计步 + 气压，只显示“距下一路口多少米”。',
      tags: ['户外', '离线'],
      spec: { 形态: '方形 · 44×46×13mm', 材质: 'TPU 包边 + 不锈钢背板', 交互: '双大键（戴手套可按）', 适合: '徒步、越野、钓鱼', 方案: '独立 4G 版', 成本: 'BOM ¥210–260' },
      shape: 'square', screen: 'compass', clip: 'loop', led: false,
      colors: { bg1: '#232f1e', bg2: '#3c4b2f', body1: '#73835c', body2: '#3d4a31', accent: '#ffd166', screen: '#e9e5d1', ink: '#2f3a25' }
    },
    {
      id: 'lumi', name: '露米', en: 'LUMI', cat: 'play',
      tagline: '会做表情的小挂件，导航时眼睛变成箭头',
      desc: '透明外壳里藏一块点阵屏。待机时是一张会眨眼的脸，导航时两只眼睛合成一个箭头，说话时嘴变成波形。把工具做成玩具，孩子才愿意戴。',
      tags: ['潮玩', '社交'],
      spec: { 形态: '圆形 · 40mm', 材质: '透明 PC + 磨砂内胆', 交互: '摇晃 / 双击 / 语音', 适合: '年轻人、送礼、IP 联名', 方案: '蓝牙伴生版', 成本: 'BOM ¥75–100' },
      shape: 'circle', screen: 'pixel', clip: 'ring', led: false,
      colors: { bg1: '#1a1030', bg2: '#33205c', body1: '#ffffff', body2: '#b9a7e8', accent: '#ff7ad9', screen: '#120a24', ink: '#ffffff' }
    },
    {
      id: 'care', name: '安心', en: 'CARE', cat: 'care',
      tagline: '一个按键，一条回家的路',
      desc: '米白配色、超大字号、单键操作。跌倒检测自动上报，SOS 键长按 3 秒接通家人。导航只说三句话：“直走 200 米”“前面路口左转”“到了”。',
      tags: ['老人', '应急'],
      spec: { 形态: '方形 · 48×52×14mm', 材质: '亲肤涂层 + 防滑纹', 交互: '单大键 + 语音播报', 适合: '独居老人、认知障碍者', 方案: '独立 4G 版', 成本: 'BOM ¥190–240' },
      shape: 'square', screen: 'sos', clip: 'lanyard', led: false,
      colors: { bg1: '#f6f2e9', bg2: '#e5dcc9', body1: '#fdfbf6', body2: '#ded5c4', accent: '#e63946', screen: '#fffdf8', ink: '#3a3a3a' }
    },
    {
      id: 'modular', name: '拼装', en: 'MODULAR', cat: 'pro',
      tagline: '主机不变，面板随便换',
      desc: '一块金属中框 + 磁吸面板：今天装墨水屏看路线，明天换摄像头模块记录沿途，后天扣上太阳能背板。开放 SDK，续航和重量按需取舍。',
      tags: ['极客', '模块化'],
      spec: { 形态: '卡片 · 64×46×9mm', 材质: 'CNC 铝框 + 磁吸面板', 交互: '旋钮 + 可编程按键', 适合: '开发者、DIY 玩家', 方案: '独立 4G 版', 成本: 'BOM ¥230–300' },
      shape: 'card', screen: 'dial', clip: 'magnet', led: false, dialPct: 0.42, dialText: '8',
      colors: { bg1: '#101418', bg2: '#1c2632', body1: '#a3adb6', body2: '#5b666f', accent: '#a3e635', screen: '#0e1418', ink: '#dcffb0' }
    }
  ];

  /* 机身与屏幕的几何位置（viewBox 440×560） */
  var GEO = {
    circle: { body: { cx: 220, cy: 308, r: 116 }, screen: { x: 158, y: 246, w: 124, h: 124, rx: 44 }, top: 192 },
    square: { body: { x: 112, y: 198, w: 216, h: 220, rx: 54 }, screen: { x: 146, y: 232, w: 148, h: 148, rx: 38 }, top: 198 },
    pill:   { body: { x: 160, y: 160, w: 120, h: 300, rx: 60 }, screen: { x: 176, y: 198, w: 88, h: 106, rx: 26 }, top: 160 },
    card:   { body: { x: 98, y: 212, w: 244, h: 196, rx: 30 }, screen: { x: 118, y: 234, w: 204, h: 116, rx: 14 }, top: 212 }
  };

  function R(r) {
    return 'x="' + r.x + '" y="' + r.y + '" width="' + r.w + '" height="' + r.h + '" rx="' + (r.rx || 0) + '"';
  }

  function esc(t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ---------- 屏幕内容 ---------- */
  function content(kind, r, c, s) {
    var x = r.x, y = r.y, w = r.w, h = r.h;
    var cx = x + w / 2, cy = y + h / 2;
    var out, i;

    if (kind === 'route') {
      var road = 'stroke="#000" stroke-opacity=".08" stroke-linecap="round"';
      out = '<rect ' + R(r) + ' fill="' + c.screen + '"/>';
      out += '<path d="M' + (x + w * 0.26) + ' ' + (y - 4) + ' V' + (y + h + 4) + '" ' + road + ' stroke-width="' + Math.max(10, w * 0.13) + '"/>';
      out += '<path d="M' + (x - 4) + ' ' + (y + h * 0.64) + ' H' + (x + w + 4) + '" ' + road + ' stroke-width="' + Math.max(8, w * 0.1) + '"/>';
      out += '<path d="M' + (x + w * 0.8) + ' ' + (y - 4) + ' V' + (y + h + 4) + '" ' + road + ' stroke-width="' + Math.max(6, w * 0.055) + '"/>';
      out += '<path d="M' + (x + w * 0.26) + ' ' + (y + h * 0.86) +
             ' V' + (y + h * 0.44) + ' H' + (x + w * 0.64) + ' V' + (y + h * 0.2) +
             '" fill="none" stroke="' + c.accent + '" stroke-width="' + Math.max(5, w * 0.055) +
             '" stroke-linecap="round" stroke-linejoin="round"/>';
      out += '<circle cx="' + (x + w * 0.26) + '" cy="' + (y + h * 0.86) + '" r="' + Math.max(5, w * 0.05) + '" fill="' + c.accent + '"/>';
      out += '<circle cx="' + (x + w * 0.26) + '" cy="' + (y + h * 0.86) + '" r="' + Math.max(2, w * 0.02) + '" fill="#fff"/>';
      out += '<polygon points="' + (x + w * 0.64) + ',' + (y + h * 0.08) + ' ' +
             (x + w * 0.64 - w * 0.07) + ',' + (y + h * 0.24) + ' ' +
             (x + w * 0.64 + w * 0.07) + ',' + (y + h * 0.24) + '" fill="' + c.accent + '"/>';
      return out;
    }

    if (kind === 'compass') {
      var rad = Math.min(w, h) * 0.38;
      out = '<rect ' + R(r) + ' fill="' + c.screen + '"/>';
      out += '<circle cx="' + cx + '" cy="' + cy + '" r="' + rad + '" fill="none" stroke="' + c.ink + '" stroke-opacity=".2" stroke-width="2"/>';
      out += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (rad * 0.74) + '" fill="none" stroke="' + c.accent + '" stroke-opacity=".5" stroke-width="2" stroke-dasharray="3 9"/>';
      out += '<polygon points="' + cx + ',' + (cy - rad * 0.86) + ' ' + (cx - rad * 0.16) + ',' + (cy + rad * 0.12) + ' ' + (cx + rad * 0.16) + ',' + (cy + rad * 0.12) + '" fill="' + c.accent + '"/>';
      out += '<polygon points="' + cx + ',' + (cy + rad * 0.7) + ' ' + (cx - rad * 0.14) + ',' + (cy + rad * 0.06) + ' ' + (cx + rad * 0.14) + ',' + (cy + rad * 0.06) + '" fill="' + c.ink + '" opacity=".35"/>';
      out += '<circle cx="' + cx + '" cy="' + cy + '" r="' + Math.max(3, rad * 0.09) + '" fill="#fff"/>';
      out += '<text x="' + cx + '" y="' + (cy - rad * 0.96) + '" font-size="' + (rad * 0.2) + '" font-weight="700" fill="' + c.ink + '" opacity=".65" text-anchor="middle">N</text>';
      return out;
    }

    if (kind === 'wave') {
      var bars = [0.28, 0.52, 0.82, 0.42, 0.94, 0.62, 0.34];
      var bw = Math.max(4, w * 0.055);
      var gap = (w - bw * bars.length) / (bars.length + 1);
      out = '<rect ' + R(r) + ' fill="' + c.screen + '"/>';
      for (i = 0; i < bars.length; i++) {
        var bh = h * 0.62 * bars[i];
        out += '<rect x="' + (x + gap + i * (bw + gap)) + '" y="' + (cy - bh / 2) + '" width="' + bw + '" height="' + bh + '" rx="' + (bw / 2) + '" fill="' + c.accent + '"/>';
      }
      out += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (Math.min(w, h) * 0.44) + '" fill="none" stroke="' + c.accent + '" stroke-opacity=".2" stroke-width="2"/>';
      return out;
    }

    if (kind === 'pixel') {
      var u = Math.min(w, h) / 10;
      out = '<rect ' + R(r) + ' fill="' + c.screen + '"/>';
      out += '<rect x="' + (cx - u * 2.7) + '" y="' + (cy - u * 1.5) + '" width="' + (u * 1.2) + '" height="' + (u * 2) + '" rx="' + (u * 0.3) + '" fill="' + c.accent + '"/>';
      out += '<rect x="' + (cx + u * 1.5) + '" y="' + (cy - u * 1.5) + '" width="' + (u * 1.2) + '" height="' + (u * 2) + '" rx="' + (u * 0.3) + '" fill="' + c.accent + '"/>';
      for (i = -1; i <= 1; i++) {
        out += '<rect x="' + (cx + i * u * 1.3 - u * 0.45) + '" y="' + (cy + u * 2.1) + '" width="' + (u * 0.9) + '" height="' + (u * 0.55) + '" rx="' + (u * 0.2) + '" fill="' + c.accent + '" opacity=".85"/>';
      }
      return out;
    }

    if (kind === 'text') {
      var l1 = (s.copy && s.copy[0]) || '左转 200 米';
      var l2 = (s.copy && s.copy[1]) || '沿建设路直行';
      var f1 = Math.min(w * 0.13, h * 0.28);
      out = '<rect ' + R(r) + ' fill="' + c.screen + '"/>';
      out += '<text x="' + cx + '" y="' + (cy + f1 * 0.35) + '" font-size="' + f1 + '" font-weight="700" fill="' + c.ink + '" text-anchor="middle">' + esc(l1) + '</text>';
      out += '<text x="' + cx + '" y="' + (cy + f1 * 1.55) + '" font-size="' + Math.max(10, f1 * 0.42) + '" fill="' + c.ink + '" opacity=".55" text-anchor="middle">' + esc(l2) + '</text>';
      return out;
    }

    if (kind === 'home') {
      var uu = Math.min(w, h) * 0.42;
      out = '<rect ' + R(r) + ' fill="' + c.screen + '"/>';
      out += '<polygon points="' + cx + ',' + (cy - uu * 0.66) + ' ' + (cx - uu * 0.54) + ',' + (cy - uu * 0.14) + ' ' + (cx + uu * 0.54) + ',' + (cy - uu * 0.14) + '" fill="' + c.accent + '"/>';
      out += '<rect x="' + (cx - uu * 0.38) + '" y="' + (cy - uu * 0.14) + '" width="' + (uu * 0.76) + '" height="' + (uu * 0.5) + '" rx="' + (uu * 0.06) + '" fill="' + c.accent + '"/>';
      out += '<rect x="' + (cx - uu * 0.09) + '" y="' + (cy + uu * 0.1) + '" width="' + (uu * 0.18) + '" height="' + (uu * 0.26) + '" rx="2" fill="' + c.screen + '"/>';
      out += '<text x="' + cx + '" y="' + (cy + uu * 0.92) + '" font-size="' + (uu * 0.4) + '" font-weight="700" fill="' + c.ink + '" text-anchor="middle">回家</text>';
      return out;
    }

    if (kind === 'dial') {
      var rd = Math.min(w, h) * 0.34;
      var circ = 2 * Math.PI * rd;
      var pct = (s.dialPct || 0.6);
      out = '<rect ' + R(r) + ' fill="' + c.screen + '"/>';
      out += '<circle cx="' + cx + '" cy="' + cy + '" r="' + rd + '" fill="none" stroke="' + c.ink + '" stroke-opacity=".15" stroke-width="' + (rd * 0.22) + '"/>';
      out += '<circle cx="' + cx + '" cy="' + cy + '" r="' + rd + '" fill="none" stroke="' + c.accent + '" stroke-width="' + (rd * 0.22) +
             '" stroke-linecap="round" stroke-dasharray="' + (circ * pct) + ' ' + circ + '" transform="rotate(-90 ' + cx + ' ' + cy + ')"/>';
      out += '<text x="' + cx + '" y="' + (cy + rd * 0.18) + '" font-size="' + (rd * 0.62) + '" font-weight="700" fill="' + c.ink + '" text-anchor="middle">' + esc(s.dialText || '8') + '</text>';
      out += '<text x="' + cx + '" y="' + (cy + rd * 0.7) + '" font-size="' + (rd * 0.26) + '" fill="' + c.ink + '" opacity=".55" text-anchor="middle">分钟</text>';
      return out;
    }

    if (kind === 'sos') {
      var rs = Math.min(w, h) * 0.19;
      out = '<rect ' + R(r) + ' fill="' + c.screen + '"/>';
      out += '<circle cx="' + cx + '" cy="' + (cy - h * 0.05) + '" r="' + rs + '" fill="' + c.accent + '"/>';
      out += '<text x="' + cx + '" y="' + (cy - h * 0.05 + rs * 0.28) + '" font-size="' + (rs * 0.72) + '" font-weight="800" fill="#fff" text-anchor="middle">SOS</text>';
      out += '<text x="' + cx + '" y="' + (cy + h * 0.3) + '" font-size="' + Math.min(w * 0.085, 15) + '" fill="' + c.ink + '" opacity=".6" text-anchor="middle">长按呼叫家人</text>';
      return out;
    }

    return '<rect ' + R(r) + ' fill="' + c.screen + '"/>';
  }

  /* ---------- 机身 ---------- */
  function bodyPath(s, g, uid) {
    var b = g.body;
    var fill = 'url(#' + uid + '-b)';
    if (s.shape === 'circle') {
      return '<circle cx="' + b.cx + '" cy="' + b.cy + '" r="' + b.r + '" fill="' + fill + '" filter="url(#' + uid + '-sh)"/>' +
             '<circle cx="' + b.cx + '" cy="' + b.cy + '" r="' + (b.r - 1) + '" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>';
    }
    return '<rect ' + R(b) + ' fill="' + fill + '" filter="url(#' + uid + '-sh)"/>' +
           '<rect x="' + (b.x + 1) + '" y="' + (b.y + 1) + '" width="' + (b.w - 2) + '" height="' + (b.h - 2) + '" rx="' + (b.rx - 1) + '" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="2"/>';
  }

  function screenSVG(s, g, uid) {
    var r = g.screen;
    var bz = { x: r.x - 8, y: r.y - 8, w: r.w + 16, h: r.h + 16, rx: (r.rx || 0) + 6 };
    return '<rect ' + R(bz) + ' fill="#101418" opacity=".92"/>' +
           '<g clip-path="url(#' + uid + '-sc)">' + content(s.screen, r, s.colors, s) + '</g>' +
           '<rect ' + R(r) + ' fill="none" stroke="#fff" stroke-opacity=".14"/>';
  }

  function drawClip(s, g) {
    var top = g.top;
    var metal = '#9aa1a9';
    if (s.clip === 'lanyard') {
      return '<path d="M190 ' + (top + 6) + ' C170 ' + (top - 60) + ' 150 120 168 82" fill="none" stroke="#8d949c" stroke-width="5" stroke-linecap="round"/>' +
             '<path d="M250 ' + (top + 6) + ' C270 ' + (top - 60) + ' 290 120 272 82" fill="none" stroke="#8d949c" stroke-width="5" stroke-linecap="round"/>' +
             '<circle cx="220" cy="80" r="7" fill="#8d949c"/>';
    }
    if (s.clip === 'loop') {
      return '<circle cx="220" cy="' + (top - 8) + '" r="13" fill="none" stroke="' + metal + '" stroke-width="6"/>' +
             '<path d="M220 ' + (top - 21) + ' C220 ' + (top - 54) + ' 198 ' + (top - 72) + ' 220 66" fill="none" stroke="#8d949c" stroke-width="4" opacity=".75"/>';
    }
    if (s.clip === 'ring') {
      return '<circle cx="220" cy="' + (top - 10) + '" r="11" fill="none" stroke="' + metal + '" stroke-width="5"/>';
    }
    if (s.clip === 'clip') {
      return '<path d="M196 ' + (top + 12) + ' h48 v-16 a8 8 0 0 0 -8 -8 h-32 a8 8 0 0 0 -8 8 z" fill="#b9bec5"/>' +
             '<rect x="204" y="' + (top - 12) + '" width="32" height="6" rx="3" fill="#8b9098"/>';
    }
    if (s.clip === 'magnet') {
      return '<rect x="198" y="' + (top - 6) + '" width="44" height="14" rx="7" fill="#3a3f45" opacity=".9"/>';
    }
    return '';
  }

  function drawDetails(s, g) {
    var b = g.body;
    var by = s.shape === 'circle' ? b.cy + b.r : b.y + b.h;
    var out = '';
    if (s.button && s.shape === 'pill') {
      var cyb = by - 72;
      out += '<circle cx="220" cy="' + cyb + '" r="25" fill="#fff" fill-opacity=".22"/>';
      out += '<circle cx="220" cy="' + cyb + '" r="25" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>';
      out += '<circle cx="220" cy="' + cyb + '" r="9" fill="#fff" fill-opacity=".65"/>';
    }
    out += '<circle cx="220" cy="' + (by - 24) + '" r="3" fill="#000" fill-opacity=".35"/>';
    var slots = [-12, -6, 0, 6, 12];
    for (var i = 0; i < slots.length; i++) {
      out += '<circle cx="' + (220 + slots[i]) + '" cy="' + (by - 12) + '" r="1.9" fill="#000" fill-opacity=".3"/>';
    }
    return out;
  }

  /* ---------- 组装 ---------- */
  function render(s, i) {
    var uid = 'c' + i;
    var c = s.colors;
    var g = GEO[s.shape];
    var b = g.body;
    var isCircle = s.shape === 'circle';
    var bodyClip = isCircle
      ? '<circle cx="' + b.cx + '" cy="' + b.cy + '" r="' + b.r + '"/>'
      : '<rect ' + R(b) + '/>';

    return '<svg viewBox="0 0 440 560" xmlns="http://www.w3.org/2000/svg" role="img" ' +
      'aria-label="' + esc(s.name) + ' 设计概念图" font-family="system-ui, \'PingFang SC\', \'Microsoft YaHei\', sans-serif">' +
      '<title>' + esc(s.name) + ' · ' + esc(s.en) + '</title>' +
      '<defs>' +
        '<linearGradient id="' + uid + '-bg" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0" stop-color="' + c.bg1 + '"/><stop offset="1" stop-color="' + c.bg2 + '"/>' +
        '</linearGradient>' +
        '<linearGradient id="' + uid + '-b" x1="0.1" y1="0" x2="0.75" y2="1">' +
          '<stop offset="0" stop-color="' + c.body1 + '"/><stop offset="1" stop-color="' + c.body2 + '"/>' +
        '</linearGradient>' +
        '<filter id="' + uid + '-sh" x="-45%" y="-45%" width="190%" height="190%">' +
          '<feDropShadow dx="0" dy="16" stdDeviation="15" flood-color="#000" flood-opacity=".3"/>' +
        '</filter>' +
        '<clipPath id="' + uid + '-bc">' + bodyClip + '</clipPath>' +
        '<clipPath id="' + uid + '-sc"><rect ' + R(g.screen) + '/></clipPath>' +
      '</defs>' +
      '<rect width="440" height="560" fill="url(#' + uid + '-bg)"/>' +
      '<circle cx="356" cy="92" r="150" fill="#fff" opacity=".06"/>' +
      '<circle cx="72" cy="486" r="118" fill="#fff" opacity=".045"/>' +
      drawClip(s, g) +
      bodyPath(s, g, uid) +
      (s.led ? '<circle cx="220" cy="308" r="101" fill="none" stroke="' + c.accent + '" stroke-width="3" stroke-dasharray="2 9" opacity=".9"/>' : '') +
      screenSVG(s, g, uid) +
      drawDetails(s, g) +
      '</svg>';
  }

  global.PENDANT = { CONCEPTS: CONCEPTS, render: render };
})(window);

/*
 * 识途 · 佩戴场景与配件插画
 * 纯 SVG 手绘风示意（非实拍），供 index.html 注入。
 */
(function () {
  'use strict';

  var A = '#ff6b35';

  function lanyard(nx, ny, px, py, c, s) {
    s = s || 1;
    return '<path d="M' + (nx - 9 * s) + ' ' + ny + ' L' + px + ' ' + py + '" fill="none" stroke="' + c + '" stroke-width="' + (3.4 * s) + '" stroke-linecap="round"/>' +
      '<path d="M' + (nx + 9 * s) + ' ' + ny + ' L' + px + ' ' + py + '" fill="none" stroke="' + c + '" stroke-width="' + (3.4 * s) + '" stroke-linecap="round"/>' +
      '<rect x="' + (px - 10 * s) + '" y="' + py + '" width="' + (20 * s) + '" height="' + (24 * s) + '" rx="' + (8 * s) + '" fill="#141a21" stroke="' + c + '" stroke-width="' + (1.8 * s) + '"/>' +
      '<circle cx="' + px + '" cy="' + (py + 12 * s) + '" r="' + (3.6 * s) + '" fill="' + c + '"/>';
  }

  function frame(uid, bg1, bg2, inner, label) {
    return '<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + label + '">' +
      '<defs><linearGradient id="' + uid + '-bg" x1="0" y1="0" x2="0.8" y2="1">' +
      '<stop offset="0" stop-color="' + bg1 + '"/><stop offset="1" stop-color="' + bg2 + '"/>' +
      '</linearGradient></defs>' +
      '<rect width="800" height="480" fill="url(#' + uid + '-bg)"/>' +
      inner +
      '</svg>';
  }

  /* ---------------- 骑行 ---------------- */
  function cycling(uid) {
    var inner =
      '<circle cx="648" cy="112" r="80" fill="' + A + '" opacity=".10"/>' +
      '<rect y="392" width="800" height="88" fill="#000" opacity=".24"/>' +
      '<g stroke="#5eead4" stroke-opacity=".28" stroke-width="3" stroke-linecap="round">' +
      '<path d="M52 250 H146"/><path d="M34 292 H112"/><path d="M64 334 H132"/></g>' +
      '<g fill="none" stroke="#93a3b5" stroke-width="7" stroke-opacity=".85">' +
      '<circle cx="250" cy="330" r="64"/><circle cx="560" cy="330" r="64"/></g>' +
      '<g stroke="#93a3b5" stroke-width="2" stroke-opacity=".3">' +
      '<path d="M250 266 V394 M186 330 H314"/><path d="M560 266 V394 M496 330 H624"/></g>' +
      '<g fill="none" stroke="#cfdae6" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity=".92">' +
      '<path d="M250 330 L330 252 L395 330 Z"/><path d="M330 252 L505 246 L560 330"/><path d="M395 330 L505 246"/></g>' +
      '<path d="M308 250 H352" stroke="#cfdae6" stroke-width="8" stroke-linecap="round"/>' +
      '<path d="M505 246 L528 236" stroke="#cfdae6" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M518 226 H552" stroke="#cfdae6" stroke-width="6" stroke-linecap="round"/>' +
      '<g stroke="#e8eef5" stroke-linecap="round" fill="none">' +
      '<path d="M352 258 L425 190" stroke-width="30"/>' +
      '<path d="M428 186 L520 238" stroke-width="13"/>' +
      '<path d="M352 258 L392 302 L405 346" stroke-width="14"/>' +
      '<path d="M352 258 L372 322 L398 332" stroke-width="14"/>' +
      '</g>' +
      '<circle cx="448" cy="162" r="25" fill="#e8eef5"/>' +
      '<path d="M421 158 A28 28 0 0 1 477 156 L477 166 H421 Z" fill="#2b3742"/>' +
      '<circle cx="400" cy="232" r="30" fill="' + A + '" opacity=".12"/>' +
      lanyard(437, 180, 400, 224, A, 1) +
      '<path d="M448 176 L448 190" stroke="#e8eef5" stroke-width="12" stroke-linecap="round"/>';
    return frame(uid, '#13242f', '#080e13', inner, '挂在脖子上骑自行车');
  }

  /* ---------------- 通勤 ---------------- */
  function commute(uid) {
    var inner =
      '<circle cx="640" cy="120" r="96" fill="' + A + '" opacity=".10"/>' +
      '<rect y="400" width="800" height="80" fill="#000" opacity=".22"/>' +
      '<g fill="none" stroke="#e8eef5" stroke-linecap="round" opacity=".9">' +
      '<path d="M262 252 V72" stroke-width="5"/>' +
      '<path d="M150 104 Q262 26 374 104 Q262 132 150 104 Z" fill="#e8eef5" stroke="none" opacity=".92"/>' +
      '<path d="M206 112 V88 M262 106 V80 M318 112 V88" stroke-width="3" stroke-opacity=".35"/>' +
      '</g>' +
      '<g stroke="#e8eef5" stroke-linecap="round" fill="none">' +
      '<path d="M330 178 L330 306" stroke-width="34"/>' +
      '<path d="M330 306 L304 404" stroke-width="15"/>' +
      '<path d="M330 306 L358 404" stroke-width="15"/>' +
      '<path d="M330 204 L268 250" stroke-width="13"/>' +
      '<path d="M330 204 L380 250" stroke-width="13"/>' +
      '</g>' +
      '<circle cx="330" cy="150" r="25" fill="#e8eef5"/>' +
      '<rect x="382" y="250" width="24" height="30" rx="6" fill="#e8eef5"/>' +
      '<path d="M386 250 h16" stroke="' + A + '" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="330" cy="238" r="28" fill="' + A + '" opacity=".12"/>' +
      lanyard(330, 180, 330, 230, A, 1);
    return frame(uid, '#2b1d14', '#0b0705', inner, '通勤时挂在脖子上');
  }

  /* ---------------- 徒步 ---------------- */
  function hike(uid) {
    var inner =
      '<circle cx="640" cy="110" r="88" fill="#ffd166" opacity=".08"/>' +
      '<path d="M0 400 L150 210 L300 400 Z" fill="#182a20" opacity=".85"/>' +
      '<path d="M220 400 L400 180 L580 400 Z" fill="#20362a" opacity=".9"/>' +
      '<path d="M470 400 L640 240 L800 400 Z" fill="#172820" opacity=".9"/>' +
      '<rect y="400" width="800" height="80" fill="#000" opacity=".28"/>' +
      '<rect x="366" y="196" width="58" height="92" rx="22" fill="#cfdae6" opacity=".9"/>' +
      '<g stroke="#e8eef5" stroke-linecap="round" fill="none">' +
      '<path d="M400 178 L400 302" stroke-width="34"/>' +
      '<path d="M400 302 L372 404" stroke-width="15"/>' +
      '<path d="M400 302 L430 404" stroke-width="15"/>' +
      '<path d="M400 208 L360 258" stroke-width="13"/>' +
      '<path d="M400 208 L442 258" stroke-width="13"/>' +
      '</g>' +
      '<path d="M444 260 L470 404" stroke="#93a3b5" stroke-width="5" stroke-linecap="round"/>' +
      '<circle cx="400" cy="150" r="25" fill="#e8eef5"/>' +
      '<path d="M374 146 A28 28 0 0 1 426 146 L426 156 H374 Z" fill="#2b3742"/>' +
      '<circle cx="400" cy="238" r="28" fill="' + A + '" opacity=".13"/>' +
      lanyard(400, 180, 400, 230, A, 1);
    return frame(uid, '#16241c', '#070d09', inner, '徒步时挂在脖子上');
  }

  /* ---------------- 老人 ---------------- */
  function elder(uid) {
    var inner =
      '<circle cx="620" cy="130" r="90" fill="' + A + '" opacity=".08"/>' +
      '<rect y="404" width="800" height="76" fill="#000" opacity=".2"/>' +
      '<g stroke="#e8eef5" stroke-linecap="round" fill="none">' +
      '<path d="M400 186 Q434 246 416 306" stroke-width="36"/>' +
      '<path d="M416 306 L392 406" stroke-width="16"/>' +
      '<path d="M416 306 L444 406" stroke-width="16"/>' +
      '<path d="M404 212 L444 258" stroke-width="13"/>' +
      '<path d="M406 214 L372 262" stroke-width="13"/>' +
      '</g>' +
      '<path d="M446 260 L474 406" stroke="#cfdae6" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M466 260 A20 20 0 0 1 476 258" fill="none" stroke="#cfdae6" stroke-width="6"/>' +
      '<circle cx="398" cy="160" r="26" fill="#e8eef5"/>' +
      '<path d="M372 152 Q398 132 424 152" fill="none" stroke="#cfdae6" stroke-width="4"/>' +
      '<circle cx="400" cy="240" r="27" fill="' + A + '" opacity=".12"/>' +
      lanyard(400, 188, 402, 234, A, 1);
    return frame(uid, '#2a1f16', '#0a0705', inner, '老人挂在脖子上');
  }

  /* ---------------- 孩子 ---------------- */
  function kid(uid) {
    var inner =
      '<circle cx="636" cy="120" r="92" fill="#5eead4" opacity=".08"/>' +
      '<rect y="400" width="800" height="80" fill="#000" opacity=".2"/>' +
      '<g stroke="#e8eef5" stroke-linecap="round" fill="none">' +
      '<path d="M400 222 L400 302" stroke-width="30"/>' +
      '<path d="M400 302 L368 350 L346 362" stroke-width="14"/>' +
      '<path d="M400 302 L432 350 L456 342" stroke-width="14"/>' +
      '<path d="M400 242 L358 270" stroke-width="12"/>' +
      '<path d="M400 242 L444 268" stroke-width="12"/>' +
      '</g>' +
      '<circle cx="400" cy="196" r="23" fill="#e8eef5"/>' +
      '<path d="M378 188 Q400 170 422 188" fill="none" stroke="#2b3742" stroke-width="9" stroke-linecap="round"/>' +
      '<circle cx="400" cy="252" r="26" fill="' + A + '" opacity=".14"/>' +
      lanyard(400, 218, 400, 246, A, .92);
    return frame(uid, '#1d2a33', '#0a1014', inner, '孩子挂在脖子上');
  }

  /* ---------------- 尺寸图 ---------------- */
  function dimensions(uid) {
    var inner =
      '<g stroke="#8b98a9" stroke-width="1.5" fill="none">' +
      '<circle cx="210" cy="250" r="96" stroke="#cfdae6" stroke-width="3"/>' +
      '<circle cx="210" cy="250" r="76" stroke="#2a3542" stroke-width="10"/>' +
      '<path d="M210 154 V96 M138 96 H282" stroke-dasharray="4 6"/>' +
      '<path d="M282 96 l-8 -5 v10 z" fill="#8b98a9"/>' +
      '<path d="M114 250 H70 M70 190 V310 M66 190 h8 M66 310 h8" stroke-dasharray="4 6"/>' +
      '</g>' +
      '<text x="210" y="82" fill="#e8eef5" font-size="20" text-anchor="middle" font-family="ui-monospace, monospace">Ø 42 mm</text>' +
      '<text x="46" y="254" fill="#8b98a9" font-size="15" text-anchor="middle" font-family="ui-monospace, monospace" transform="rotate(-90 46 254)">42 mm</text>' +
      '<g stroke="#8b98a9" stroke-width="1.5" fill="none">' +
      '<rect x="470" y="154" width="150" height="192" rx="36" stroke="#cfdae6" stroke-width="3"/>' +
      '<path d="M470 128 H620 M470 124 v8 M620 124 v8" stroke-dasharray="4 6"/>' +
      '<path d="M644 154 V346 M640 154 h8 M640 346 h8" stroke-dasharray="4 6"/>' +
      '</g>' +
      '<text x="545" y="112" fill="#e8eef5" font-size="20" text-anchor="middle" font-family="ui-monospace, monospace">11 mm</text>' +
      '<text x="666" y="254" fill="#8b98a9" font-size="15" text-anchor="middle" font-family="ui-monospace, monospace" transform="rotate(90 666 254)">42 mm</text>' +
      '<text x="400" y="420" fill="#5a6878" font-size="14" text-anchor="middle">正面 / 侧面（单位：毫米，目标值）</text>';
    return frame(uid, '#0e141b', '#080b10', inner, '尺寸标注图');
  }

  /* ---------------- 配件 ---------------- */
  function accSVG(kind, uid) {
    var s = '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="配件示意">' +
      '<defs><linearGradient id="' + uid + '-bg" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#10171f"/><stop offset="1" stop-color="#080c11"/>' +
      '</linearGradient></defs>' +
      '<rect width="400" height="300" fill="url(#' + uid + '-bg)"/>';

    if (kind === 'lanyard') {
      s += '<path d="M132 16 L200 176" stroke="' + A + '" stroke-width="12" stroke-linecap="round"/>' +
        '<path d="M268 16 L200 176" stroke="' + A + '" stroke-width="12" stroke-linecap="round"/>' +
        '<rect x="120" y="78" width="26" height="16" rx="6" fill="#141a21" stroke="#8b98a9" stroke-width="2"/>' +
        '<rect x="254" y="78" width="26" height="16" rx="6" fill="#141a21" stroke="#8b98a9" stroke-width="2"/>' +
        '<rect x="182" y="170" width="36" height="18" rx="7" fill="#2b3742"/>' +
        '<rect x="182" y="192" width="36" height="46" rx="12" fill="#141a21" stroke="' + A + '" stroke-width="2.5"/>' +
        '<circle cx="200" cy="215" r="5" fill="' + A + '"/>' +
        '<text x="200" y="272" fill="#8b98a9" font-size="13" text-anchor="middle">断裂式安全扣 · 45cm 可调</text>';
    } else if (kind === 'kids') {
      s += '<path d="M154 26 L200 148" stroke="#5eead4" stroke-width="11" stroke-linecap="round"/>' +
        '<path d="M246 26 L200 148" stroke="#5eead4" stroke-width="11" stroke-linecap="round"/>' +
        '<rect x="182" y="142" width="36" height="16" rx="6" fill="#2b3742"/>' +
        '<rect x="184" y="162" width="32" height="42" rx="11" fill="#141a21" stroke="#5eead4" stroke-width="2.5"/>' +
        '<circle cx="200" cy="183" r="4" fill="#5eead4"/>' +
        '<text x="200" y="246" fill="#8b98a9" font-size="13" text-anchor="middle">35cm · 更轻的安全扣</text>';
    } else if (kind === 'pouch') {
      s += '<path d="M140 96 q60 -46 120 0" fill="none" stroke="#8b98a9" stroke-width="4"/>' +
        '<rect x="120" y="96" width="160" height="146" rx="30" fill="#151d25" stroke="#cfdae6" stroke-width="2.5"/>' +
        '<circle cx="200" cy="162" r="18" fill="none" stroke="' + A + '" stroke-width="3"/>' +
        '<path d="M156 96 q44 -30 88 0" fill="none" stroke="#2a3542" stroke-width="2"/>' +
        '<text x="200" y="272" fill="#8b98a9" font-size="13" text-anchor="middle">防泼水 · 可挂包上</text>';
    } else if (kind === 'clip') {
      s += '<rect x="128" y="70" width="144" height="120" rx="26" fill="#1b232c" stroke="#cfdae6" stroke-width="2.5"/>' +
        '<rect x="146" y="88" width="108" height="84" rx="18" fill="#0e141b" stroke="#2a3542" stroke-width="2"/>' +
        '<circle cx="200" cy="130" r="18" fill="none" stroke="' + A + '" stroke-width="3"/>' +
        '<path d="M128 190 h144" stroke="#2a3542" stroke-width="2"/>' +
        '<text x="200" y="238" fill="#8b98a9" font-size="13" text-anchor="middle">强磁背夹 · 3kg 拉力</text>';
    } else if (kind === 'case') {
      s += '<rect x="140" y="52" width="120" height="150" rx="40" fill="none" stroke="#5eead4" stroke-width="3" stroke-dasharray="6 6"/>' +
        '<rect x="152" y="64" width="96" height="126" rx="32" fill="#141a21" stroke="#cfdae6" stroke-width="2"/>' +
        '<rect x="168" y="84" width="64" height="64" rx="22" fill="#0b0f14" stroke="#2a3542" stroke-width="2"/>' +
        '<text x="200" y="238" fill="#8b98a9" font-size="13" text-anchor="middle">食品级硅胶 · 四色</text>';
    } else if (kind === 'charger') {
      s += '<circle cx="200" cy="128" r="56" fill="#151d25" stroke="#cfdae6" stroke-width="2.5"/>' +
        '<circle cx="200" cy="128" r="30" fill="none" stroke="' + A + '" stroke-width="3"/>' +
        '<path d="M200 184 V246 Q200 262 218 262 H286" fill="none" stroke="#8b98a9" stroke-width="4" stroke-linecap="round"/>' +
        '<rect x="286" y="252" width="22" height="20" rx="5" fill="#2b3742"/>' +
        '<text x="200" y="222" fill="#8b98a9" font-size="13" text-anchor="middle">磁吸 · 2 小时充满</text>';
    } else if (kind === 'mount') {
      s += '<path d="M60 150 H340" stroke="#cfdae6" stroke-width="16" stroke-linecap="round"/>' +
        '<path d="M170 150 Q170 96 200 86 Q230 96 230 150" fill="none" stroke="#8b98a9" stroke-width="6"/>' +
        '<rect x="164" y="66" width="72" height="28" rx="10" fill="#141a21" stroke="' + A + '" stroke-width="2"/>' +
        '<text x="200" y="240" fill="#8b98a9" font-size="13" text-anchor="middle">车把快装 · 免工具</text>';
    } else {
      s += '<circle cx="200" cy="120" r="34" fill="none" stroke="#cfdae6" stroke-width="6"/>' +
        '<circle cx="200" cy="120" r="20" fill="none" stroke="#2a3542" stroke-width="6"/>' +
        '<path d="M200 154 V196" stroke="' + A + '" stroke-width="8" stroke-linecap="round"/>' +
        '<text x="200" y="238" fill="#8b98a9" font-size="13" text-anchor="middle">快拆挂环 · 不锈钢</text>';
    }
    return s + '</svg>';
  }

  var ACCESSORIES = [
    { id: 'lanyard', name: '织带挂绳', feature: true, spec: '45cm 可调 · 断裂式安全扣 · 承重 3kg', desc: '默认佩戴方式。织带里嵌了反光丝，夜间车灯扫过会亮；安全扣在受到 3kg 以上拉力时自动脱开，避免勒住脖子。' },
    { id: 'kids', name: '儿童短绳', spec: '35cm · 更轻的安全扣', desc: '给孩子用的短一截，跑动时不甩到脸。' },
    { id: 'clip', name: '磁吸夹', spec: '钕磁铁 · 3kg 拉力', desc: '夹在衣领或口袋边，适合不想挂绳的人。' },
    { id: 'case', name: '硅胶保护套', spec: '食品级硅胶 · 四色', desc: '防摔、防汗，脏了直接水冲。' },
    { id: 'charger', name: '磁吸充电座', spec: 'USB-C · 2 小时充满', desc: '无开孔机身，靠磁吸触点充电。' },
    { id: 'mount', name: '车把支架', spec: '免工具快装', desc: '骑车时把它固定在车把，麦克风朝嘴。' },
    { id: 'ring', name: '快拆挂环', spec: '不锈钢 · 一秒换绳', desc: '换挂绳、换夹子，不用拆机身。' },
    { id: 'pouch', name: '收纳袋', spec: '防泼水尼龙 · 可挂包上', desc: '不戴的时候收进去，避免刮花屏幕。' }
  ];

  var SCENES = [
    { id: 'cycling', name: '骑行', note: '挂绳贴在胸前，风大也不打脸' },
    { id: 'commute', name: '通勤', note: '一手咖啡一手伞，照样能问路' },
    { id: 'hike', name: '徒步', note: '背包带不压挂绳，抬手就能说' },
    { id: 'elder', name: '老人', note: '挂绳够粗，手指不灵活也抓得住' },
    { id: 'kid', name: '孩子', note: '安全扣 3kg 自动脱开，跑跳不勒' }
  ];

  function renderScene(kind, uid) {
    if (kind === 'cycling') return cycling(uid);
    if (kind === 'commute') return commute(uid);
    if (kind === 'hike') return hike(uid);
    if (kind === 'elder') return elder(uid);
    if (kind === 'kid') return kid(uid);
    return '';
  }

  window.SCENES = {
    list: SCENES,
    accessories: ACCESSORIES,
    render: renderScene,
    dimensions: dimensions,
    accessory: accSVG
  };
})();

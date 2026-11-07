/* AILink 智链 · 应用层
 * 纯前端演示：路由、会员门禁、筛选、详情、订阅支付模拟、AI 邮件引擎。
 * 生产环境需把 auth / membership / outreach 替换为服务端 API。
 */
(function () {
  'use strict';

  var D = window.AILINK_DATA;
  var PROJECTS = D.projects;
  var CAPITAL = D.capital;
  var TALENTS = D.talents;

  var ICONS = {
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowUp: '<path d="M7 17 17 7M7 7h10v10"/>',
    corner: '<path d="M5 5v7a3 3 0 0 0 3 3h11M15 11l4 4-4 4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    unlock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M3 10h18"/>',
    bank: '<path d="M3 10 12 4l9 6"/><path d="M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    sparkles: '<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8Z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    building: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M10 21v-3h4v3"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z"/>',
    at: '<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4Z"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4 2v-8Z"/>',
    download: '<path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9Z"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    layers: '<path d="m12 2 9 5-9 5-9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z"/>',
    chart: '<path d="M3 3v18h18"/><path d="m7 15 4-5 3 3 5-7"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/>'
  };

  var PLANS = {
    free: {
      key: 'free', name: '访客版', en: 'VISITOR', price: 0, credits: 0, exportLimit: 0, seats: 1,
      desc: '先感受这张网络，浏览三大库的公开概况。',
      features: ['浏览项目 / 资金 / 人才库摘要', '每日 3 次关键词搜索', '查看赛道、城市与阶段分布', '不含联系方式与完整档案']
    },
    pro: {
      key: 'pro', name: '专业会员', en: 'PRO', price: 399, credits: 500, exportLimit: 200, seats: 1,
      desc: '适合创业者、投资经理与独立顾问的高频使用。',
      features: ['解锁三大库全部档案与核验联系方式', '每月 500 封 AI 邮件额度', '每月 200 条数据导出', 'AI 起草、模板库与发送报告', '收藏、跟进与团队标签（个人）']
    },
    team: {
      key: 'team', name: '团队会员', en: 'TEAM', price: 1299, credits: 2500, exportLimit: 1000, seats: 5,
      desc: '适合投资机构、产业方与 AI 创业公司的 BD 团队。',
      features: ['包含专业会员全部权益', '每月 2,500 封 AI 邮件额度', '每月 1,000 条数据导出', '5 个席位与共享收藏', '优先数据更新与专属顾问', '对公发票与年度合同']
    },
    enterprise: {
      key: 'enterprise', name: '机构版', en: 'ENTERPRISE', price: 0, credits: 10000, exportLimit: 99999, seats: 20,
      desc: '面向园区、协会、大型企业与数据合作方。',
      features: ['定制数据接入与字段', '每月 10,000+ 封邮件额度', 'API / CRM 双向同步', '专属客户成功与合规审查', '私有化部署选项', '年度框架协议']
    }
  };

  var PACKS = [
    { qty: 500, price: 299 },
    { qty: 2000, price: 999 },
    { qty: 5000, price: 1999 },
    { qty: 20000, price: 5999 }
  ];

  var TEMPLATES = [
    {
      id: 'first-touch',
      name: '首次触达',
      scene: '项目 / 资本',
      subject: '{{company}} × AILink｜想和你聊聊这条赛道的下一步',
      body: '{{name}}您好，\n\n我是 AILink 智链的 {{sender}}。我们在整理{{city}}{{sector}}方向的创业者与机构网络时看到了{{company}}，你们正在做的事和我们的会员需求很匹配。\n\n我们每月会组织 2–3 场小范围闭门交流，参与者主要是同赛道的创始人、投资人和产业方。想邀请你先花 20 分钟聊聊，看看是否有合适的合作或对接机会。\n\n如果方便，回复一个你合适的时间即可。\n\n{{sender}}\nAILink 智链 · AI 创业社区'
    },
    {
      id: 'fundraising',
      name: '融资对接',
      scene: '项目',
      subject: '邀请 {{company}} 参加 {{city}} 闭门资本对接',
      body: '{{name}}您好，\n\n我们正在筹备一场{{city}}的 AI 闭门资本对接会，定向邀请 8–10 位处在{{stage}}阶段的创始团队，以及关注{{sector}}的早期基金合伙人。\n\n看到{{company}}在{{city}}做{{sector}}，和本期机构的投资偏好比较接近。若你们正在看新一轮融资，我可以先把机构画像和往期对接情况发你参考。\n\n这封邮件不占你太多时间，回复“感兴趣”即可，我把详细材料发你。\n\n{{sender}}\nAILink 智链 · 会员运营'
    },
    {
      id: 'talent',
      name: '人才邀约',
      scene: '人才',
      subject: '{{name}}，有一家 {{sector}} 团队想认识你',
      body: '{{name}}你好，\n\n我是 AILink 智链的 {{sender}}。看到你在{{company}}做{{sector}}相关的工作，经历和一家正在组建核心团队的 AI 公司很匹配。\n\n对方在{{city}}，方向是{{sector}}，目前处在{{stage}}阶段，正在寻找能一起把产品从 0 带到 1 的伙伴。方便的话，我可以先把团队背景、股权与薪酬区间发你，再决定要不要聊。\n\n无论是否感兴趣，都祝你工作顺利。\n\n{{sender}}\nAILink 智链 · 人才服务'
    },
    {
      id: 'membership',
      name: '会员邀请',
      scene: '通用',
      subject: '把 {{company}} 放进 AI 创业者的合作网络',
      body: '{{name}}您好，\n\nAILink 智链正在做一张面向 AI 创业者的项目、资本与人才网络。首站覆盖杭州、深圳、上海、广州，所有联系方式都经过来源记录与定期核验。\n\n想邀请{{company}}成为首批会员：可以查看三大库的完整档案，也可以用 AI 邮件引擎定向触达同赛道的创始人和机构。\n\n回信“了解”，我把会员权益和首批数据样本发你。\n\n{{sender}}\nAILink 智链'
    }
  ];

  var DB = {
    projects: {
      key: 'projects', label: '项目库', en: 'PROJECT DATABASE', code: '01', icon: 'folder',
      desc: '杭州、深圳各首批收录 42 家 AI 核心企业（公开资料），按 7 大产业链分类；其余城市为演示样本。支持按赛道、城区、企业状态与融资阶段筛选。',
      unit: 'AI 企业 / 项目',
      sortOptions: [
        { key: 'recommended', label: '编辑推荐' },
        { key: 'latest', label: '最近更新' },
        { key: 'team', label: '团队规模' },
        { key: 'confidence', label: '核验可信度' }
      ],
      filters: [
        { key: 'region', label: '区域', type: 'chips', field: 'region', options: ['全部', '华东', '华南', '华北', '西南'] },
        { key: 'city', label: '城市', type: 'select', field: 'city', options: 'cities' },
        { key: 'sector', label: '产业链 / 赛道', type: 'select', field: 'sector', options: 'sector' },
        { key: 'district', label: '城区（杭州 / 深圳）', type: 'select', field: 'district', options: 'district' },
        { key: 'status', label: '企业状态', type: 'select', field: 'status', options: 'status' },
        { key: 'stage', label: '融资阶段', type: 'select', field: 'stage', options: 'stage' }
      ]
    },
    capital: {
      key: 'capital', label: '资金库', en: 'CAPITAL DATABASE', code: '02', icon: 'bank',
      desc: '覆盖全国重点城市的机构与个人投资人样本，包含机构类型、关注赛道、投资阶段、单笔金额、管理规模与核验联系方式。',
      unit: '机构 / 天使',
      sortOptions: [
        { key: 'recommended', label: '编辑推荐' },
        { key: 'latest', label: '最近更新' },
        { key: 'aum', label: '管理规模' },
        { key: 'confidence', label: '核验可信度' }
      ],
      filters: [
        { key: 'region', label: '区域', type: 'chips', field: 'region', options: ['全部', '华东', '华南', '华北', '西南'] },
        { key: 'city', label: '城市', type: 'select', field: 'city', options: 'cities' },
        { key: 'sector', label: '机构类型', type: 'select', field: 'type', options: 'kind' },
        { key: 'focus', label: '关注赛道', type: 'select', field: 'focus', options: 'focus', array: true },
        { key: 'stage', label: '投资阶段', type: 'select', field: 'stages', options: 'stages', array: true }
      ]
    },
    talents: {
      key: 'talents', label: '人才库', en: 'TALENT DATABASE', code: '03', icon: 'users',
      desc: '面向 AI 企业的核心人才与合伙人候选，覆盖算法、Infra、具身智能、芯片、产品与增长。仅收录主动登记或授权公开的候选人。',
      unit: 'AI 核心人才',
      sortOptions: [
        { key: 'recommended', label: '编辑推荐' },
        { key: 'latest', label: '最近更新' },
        { key: 'years', label: '工作年限' },
        { key: 'confidence', label: '核验可信度' }
      ],
      filters: [
        { key: 'region', label: '区域', type: 'chips', field: 'region', options: ['全部', '华东', '华南', '华北'] },
        { key: 'city', label: '城市', type: 'select', field: 'city', options: 'cities' },
        { key: 'role', label: '方向', type: 'select', field: 'role', options: 'role' },
        { key: 'availability', label: '求职状态', type: 'select', field: 'availability', options: 'availability' }
      ]
    }
  };

  var LS = {
    user: 'ailink.user.v1',
    profiles: 'ailink.profiles.v1',
    bookmarks: 'ailink.bookmarks.v1',
    campaigns: 'ailink.campaigns.v1',
    billing: 'ailink.billing.v1'
  };

  var state = {
    route: 'home',
    user: null,
    profiles: {},
    bookmarks: { projects: [], capital: [], talents: [] },
    filters: {},
    campaigns: [],
    billing: 'monthly',
    demoMember: false,
    authMode: 'login',
    pendingPlan: null,
    outreachTab: 'compose',
    composeDraft: null,
    sendTimer: null,
    userMenuOpen: false,
    searchQuery: ''
  };

  /* ----------------------------------------------------------------------
     Utilities
     ---------------------------------------------------------------------- */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function icon(name, cls) {
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage full / blocked */ }
  }

  function unique(list) {
    var out = [];
    list.forEach(function (item) { if (out.indexOf(item) === -1) out.push(item); });
    return out;
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function maskEmail(email) {
    if (!email) return '••••';
    var parts = email.split('@');
    return parts[0].slice(0, 2) + '•••@' + parts[1];
  }

  function maskPhone(phone) {
    if (!phone) return '••••';
    return phone.replace(/^(\d{3,4}).*(\d{2})$/, '$1-••••-$2');
  }

  function maskName(name) {
    if (!name) return '••••';
    return name.slice(0, 1) + '**';
  }

  function planOf(user) {
    return PLANS[(user && user.plan) || 'free'] || PLANS.free;
  }

  function isMember() {
    return !!state.user && ['pro', 'team', 'enterprise'].indexOf(state.user.plan) >= 0;
  }

  function isLoggedIn() {
    return !!state.user;
  }

  function saveUser() {
    if (!state.user) return;
    state.profiles[state.user.email] = state.user;
    writeJSON(LS.user, state.user);
    writeJSON(LS.profiles, state.profiles);
  }

  function toast(message, kind) {
    var root = $('#toast-root');
    if (!root) return;
    var el = document.createElement('div');
    el.className = 'toast' + (kind === 'error' ? ' error' : '');
    el.innerHTML = icon(kind === 'error' ? 'x' : 'checkCircle') + '<span>' + esc(message) + '</span>';
    root.appendChild(el);
    setTimeout(function () {
      el.style.opacity = '0';
      el.style.transform = 'translateY(8px)';
      el.style.transition = 'opacity .25s ease, transform .25s ease';
      setTimeout(function () { el.remove(); }, 280);
    }, 3000);
  }

  function copyText(text) {
    var done = function () { toast('已复制到剪贴板'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      done();
    } catch (e) {
      toast('复制失败，请手动选择文本', 'error');
    }
  }

  function getRecord(type, id) {
    return (D[type] || []).filter(function (r) { return r.id === id; })[0] || null;
  }

  function hasContact(record) {
    return !!(record && record.contact && (record.contact.email || record.contact.phone));
  }

  function isAtlasRecord(record) {
    return !!(record && (record.dataset === 'hz-atlas' || record.dataset === 'sz-atlas'));
  }

  function contactOf(record) {
    return (record && record.contact) || { name: '', title: '', phone: '', email: '', wechat: '' };
  }

  function websiteOf(record) {
    return record && record.website && /^https?:\/\//.test(record.website) ? record.website : '';
  }

  function websiteAction(record) {
    var url = websiteOf(record);
    if (!url) return '';
    return '<a class="contact-strip is-web" href="' + esc(url) + '" target="_blank" rel="noopener">' + icon('globe') +
      '<span class="contact-text">公开资料收录 · 电话 / 邮箱待核验</span><span class="contact-action">访问官网 ↗</span></a>';
  }

  function projectsOfCity(city) {
    return PROJECTS.filter(function (r) { return r.city === city; }).length;
  }

  function capitalOfCity(city) {
    return CAPITAL.filter(function (r) { return r.city === city; }).length;
  }

  function talentsOfCity(city) {
    return TALENTS.filter(function (r) { return r.city === city; }).length;
  }

  function countBy(list, field) {
    var map = {};
    list.forEach(function (item) { map[item[field]] = (map[item[field]] || 0) + 1; });
    return map;
  }

  function formatDate(date) {
    var d = date || new Date();
    return d.getFullYear() + '.' + pad(d.getMonth() + 1) + '.' + pad(d.getDate());
  }

  function plural(n, unit) {
    return n + ' ' + unit;
  }

  function initials(name) {
    return (name || 'A').slice(0, 1);
  }

  function memberLabel() {
    return planOf(state.user).name;
  }

  function currentUserName() {
    return state.user ? state.user.name : 'AILink';
  }

  /* ----------------------------------------------------------------------
     Boot & routing
     ---------------------------------------------------------------------- */

  function boot() {
    state.user = readJSON(LS.user, null);
    state.profiles = readJSON(LS.profiles, {});
    state.bookmarks = readJSON(LS.bookmarks, { projects: [], capital: [], talents: [] });
    state.campaigns = readJSON(LS.campaigns, []);
    state.billing = readJSON(LS.billing, 'monthly');
    if (!state.bookmarks.projects) state.bookmarks.projects = [];
    if (!state.bookmarks.capital) state.bookmarks.capital = [];
    if (!state.bookmarks.talents) state.bookmarks.talents = [];

    if (!location.hash) {
      try { history.replaceState(null, '', '#/home'); } catch (e) { location.hash = '#/home'; }
    }

    bindGlobal();
    renderHeaderAuth();
    renderRoute();
    setupReveals();
  }

  function parseRoute() {
    var raw = location.hash.replace(/^#\/?/, '');
    if (!raw) return 'home';
    return raw.split('#')[0].split('?')[0] || 'home';
  }

  function parseAnchor() {
    var parts = location.hash.split('#');
    return parts.length > 2 ? parts[2] : '';
  }

  function navigate(route) {
    if (parseRoute() === route) {
      renderRoute({ scroll: false });
    } else {
      location.hash = '#/' + route;
    }
  }

  function renderRoute(options) {
    options = options || {};
    if (state.sendTimer) {
      clearInterval(state.sendTimer);
      state.sendTimer = null;
    }
    if (options.clearOverlays !== false) {
      closeDrawer();
      closeModal();
      closeUserMenu();
      closeMobileMenu();
    }

    state.route = parseRoute();
    if (!DB[state.route] && ['home', 'pricing', 'outreach', 'data'].indexOf(state.route) === -1) {
      state.route = 'home';
    }

    var app = $('#app');
    var html = '';
    var title = 'AILink 智链 · AI 创业者的项目、资本与人才网络';

    switch (state.route) {
      case 'projects':
        html = libraryPage('projects');
        title = '项目库 · AILink 智链';
        break;
      case 'capital':
        html = libraryPage('capital');
        title = '资金库 · AILink 智链';
        break;
      case 'talents':
        html = libraryPage('talents');
        title = '人才库 · AILink 智链';
        break;
      case 'pricing':
        html = pricingPage();
        title = '会员方案 · AILink 智链';
        break;
      case 'outreach':
        html = outreachPage();
        title = 'AI 邮件引擎 · AILink 智链';
        break;
      case 'data':
        html = dataPage();
        title = '数据方法与获取方案 · AILink 智链';
        break;
      default:
        html = homePage();
    }

    app.innerHTML = html;
    document.title = title;
    updateNav();
    renderHeaderAuth();
    if (options.scroll !== false) window.scrollTo(0, 0);
    setupReveals();

    var anchor = parseAnchor();
    if (anchor) {
      setTimeout(function () {
        var el = document.getElementById(anchor);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  }

  function updateNav() {
    $$('.main-nav a[data-nav]').forEach(function (link) {
      link.classList.toggle('is-active', link.getAttribute('data-nav') === state.route);
    });
  }

  function setupReveals() {
    var items = $$('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ----------------------------------------------------------------------
     Header / auth UI
     ---------------------------------------------------------------------- */

  function renderHeaderAuth() {
    var box = $('#header-auth');
    var mobile = $('#mobile-auth');
    var cta = $('#header-cta');
    if (!box) return;

    if (isMember() && cta) {
      cta.textContent = '会员中心';
      cta.setAttribute('href', '#/pricing');
    } else if (cta) {
      cta.textContent = '成为会员';
      cta.setAttribute('href', '#/pricing');
    }

    if (!state.user) {
      box.innerHTML = '<button class="btn btn-sm btn-ghost" type="button" data-action="open-auth">登录</button>';
      if (mobile) mobile.innerHTML = '<button class="btn btn-sm btn-ghost" type="button" data-action="open-auth">登录</button><a class="btn btn-sm btn-dark" href="#/pricing">成为会员</a>';
      return;
    }

    var p = planOf(state.user);
    box.innerHTML =
      '<button class="user-chip" type="button" data-action="toggle-user-menu" aria-haspopup="true" aria-expanded="false">' +
        '<span class="avatar">' + esc(initials(state.user.name)) + '</span>' +
        '<span class="user-meta"><strong>' + esc(state.user.name) + '</strong><span>' + esc(p.name) + '</span></span>' +
      '</button>' +
      '<div class="user-menu" id="user-menu" hidden>' +
        '<div class="user-menu-head"><strong>' + esc(state.user.name) + '</strong><span>' + esc(state.user.email) + '</span></div>' +
        '<a href="#/pricing">' + icon('settings') + ' 会员中心与额度</a>' +
        '<a href="#/outreach">' + icon('mail') + ' AI 邮件引擎</a>' +
        '<a href="#/outreach" data-action="open-saved">' + icon('bookmark') + ' 我的收藏 <span style="margin-left:auto;color:var(--muted-2);font-size:9px">' + totalBookmarks() + '</span></a>' +
        '<div class="menu-sep"></div>' +
        '<button type="button" data-action="logout">' + icon('arrowUp') + ' 退出登录</button>' +
      '</div>';

    if (mobile) {
      mobile.innerHTML = '<a class="btn btn-sm btn-ghost" href="#/pricing">' + esc(p.name) + ' · 额度 ' + (state.user.credits || 0) + '</a><button class="btn btn-sm btn-dark" type="button" data-action="logout">退出</button>';
    }
  }

  function totalBookmarks() {
    return state.bookmarks.projects.length + state.bookmarks.capital.length + state.bookmarks.talents.length;
  }

  function toggleUserMenu() {
    var menu = $('#user-menu');
    var chip = $('.user-chip');
    if (!menu) return;
    menu.hidden = !menu.hidden;
    if (chip) chip.setAttribute('aria-expanded', String(!menu.hidden));
  }

  function closeUserMenu() {
    var menu = $('#user-menu');
    if (menu) menu.hidden = true;
    var chip = $('.user-chip');
    if (chip) chip.setAttribute('aria-expanded', 'false');
  }

  function closeMobileMenu() {
    var menu = $('#mobile-menu');
    if (!menu) return;
    menu.hidden = true;
    var btn = $('.mobile-toggle');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function toggleMobileMenu() {
    var menu = $('#mobile-menu');
    var btn = $('.mobile-toggle');
    if (!menu) return;
    menu.hidden = !menu.hidden;
    if (btn) btn.setAttribute('aria-expanded', String(!menu.hidden));
  }

  /* ----------------------------------------------------------------------
     Home
     ---------------------------------------------------------------------- */

  function homePage() {
    var featuredProject = PROJECTS[2];
    var total = PROJECTS.length + CAPITAL.length + TALENTS.length;
    var member = state.demoMember;
    var eastProjects = PROJECTS.filter(function (r) { return r.region === '华东'; }).length;
    var southProjects = PROJECTS.filter(function (r) { return r.region === '华南'; }).length;

    return '' +
      '<section class="hero">' +
        '<div class="container hero-inner">' +
          '<div class="hero-copy">' +
            '<div class="hero-badge"><span class="pulse"></span>华东 / 华南首批开放 <strong>' + unique(PROJECTS.map(function (r) { return r.city; })).length + ' 城 · ' + total + ' 条精选</strong></div>' +
            '<h1><span class="line">让每一个 AI 项目，</span><span class="line">遇见<span class="accent">对的资本</span>与人。</span></h1>' +
            '<p class="hero-sub">AILink 智链把 AI 创业者的<strong>项目、资金与人才</strong>放进同一张网络。杭州 42 家、深圳 42 家公开图谱企业已接入，并分别向 938 家、2,600+ 家全量目标扩充；会员可查看核验联系方式，并用 AI 邮件引擎完成精准触达。</p>' +
            '<div class="hero-actions">' +
              '<a class="btn btn-lime btn-lg" href="#/projects">进入项目库 ' + icon('arrow') + '</a>' +
              '<a class="btn btn-ghost-light btn-lg" href="#/pricing">查看会员权益</a>' +
            '</div>' +
            '<div class="hero-trust">' +
              '<div class="avatar-stack"><span class="avatar">周</span><span class="avatar">陈</span><span class="avatar">顾</span><span class="avatar">林</span></div>' +
              '<p><strong>每周核验、来源可追溯</strong><br>杭州 / 深圳各 42 家来自公开图谱；其余批次为演示样本</p>' +
            '</div>' +
            '<div class="hero-stats">' +
              '<div class="hero-stat"><strong>' + PROJECTS.length + '</strong><span>AI 项目 · 华东华南</span></div>' +
              '<div class="hero-stat"><strong>' + CAPITAL.length + '</strong><span>资金方 · 全国样本</span></div>' +
              '<div class="hero-stat"><strong>' + TALENTS.length + '</strong><span>AI 核心人才</span></div>' +
            '</div>' +
          '</div>' +
          '<div class="hero-visual">' +
            '<div class="hero-visual-glow"></div>' +
            '<div class="orbit orbit-1"></div><div class="orbit orbit-2"></div><div class="orbit orbit-3"></div>' +
            '<div class="hero-panel">' +
              '<div class="hero-panel-top"><span class="dot"></span><span class="live">LIVE</span><span>生态匹配台</span><span class="time">' + formatDate() + '</span></div>' +
              '<div class="match-row"><span class="match-icon">深</span><span class="mrow-text"><strong>深度求索</strong><span>杭州 · 基础模型与算力 · 独角兽</span></span><span class="match-pill">项目</span></div>' +
              '<div class="match-connector">' + icon('corner') + ' AI 推荐 3 个匹配</div>' +
              '<div class="match-row"><span class="match-icon alt">潮</span><span class="mrow-text"><strong>南山潮汐</strong><span>深圳 · 早期 VC · 单笔 500–4,000 万</span></span><span class="match-pill">资金</span></div>' +
              '<div class="match-row"><span class="match-icon alt-2">陈</span><span class="mrow-text"><strong>陈知远</strong><span>杭州 · 大模型算法 · 8 年 · 看机会</span></span><span class="match-pill">人才</span></div>' +
              '<div class="match-score"><div><div class="score-label">MATCH SCORE</div><div class="score-value">92<small>/ 100</small></div><p>赛道、阶段与地域同时命中</p></div><span class="tag lime">可对接</span></div>' +
            '</div>' +
            '<div class="float-card float-mail"><div class="fc-head"><span class="fc-icon">' + icon('mail') + '</span><div><strong>本周触达</strong><span>杭州 · 闭门融资对接</span></div></div><div class="fc-stats"><div><strong>186</strong><span>已发送</span></div><div><strong>61%</strong><span>打开率</span></div><div><strong>14</strong><span>回复</span></div></div></div>' +
          '</div>' +
        '</div>' +
        '<div class="city-strip"><div class="city-track">' +
          ['杭州 HANGZHOU', '深圳 SHENZHEN', '上海 SHANGHAI', '广州 GUANGZHOU', '南京 NANJING', '苏州 SUZHOU', '厦门 XIAMEN', '北京 BEIJING', '成都 CHENGDU'].map(function (c) {
            var parts = c.split(' ');
            return '<span><b>' + parts[0] + '</b> ' + parts[1] + '</span>';
          }).join('') +
          ['杭州 HANGZHOU', '深圳 SHENZHEN', '上海 SHANGHAI', '广州 GUANGZHOU', '南京 NANJING', '苏州 SUZHOU', '厦门 XIAMEN', '北京 BEIJING', '成都 CHENGDU'].map(function (c) {
            var parts = c.split(' ');
            return '<span><b>' + parts[0] + '</b> ' + parts[1] + '</span>';
          }).join('') +
        '</div></div>' +
      '</section>' +

      '<section class="section">' +
        '<div class="container">' +
          '<div class="section-head reveal">' +
            '<div><div class="eyebrow">THE NETWORK</div><h2>三个库，一张创业网络。</h2><p>不是一份静态名录，而是可以按赛道、阶段、城市切片，并直接发起合作的活数据。</p></div>' +
            '<a class="btn-text" href="#/data">看看数据怎么来 ' + icon('arrowUp') + '</a>' +
          '</div>' +
          '<div class="library-grid">' + libraryCard('projects') + libraryCard('capital') + libraryCard('talents') + '</div>' +
        '</div>' +
      '</section>' +

      '<section class="section membership">' +
        '<div class="container membership-grid">' +
          '<div class="reveal">' +
            '<div class="eyebrow">MEMBERSHIP</div>' +
            '<h2>一个会员身份，<br>打开三张网。</h2>' +
            '<p class="lead">访客可以感受网络的结构；会员才能拿到完整档案、决策人联系方式，以及把信息变成见面的工具。</p>' +
            '<ul class="check-list">' +
              '<li><span class="check">' + icon('check') + '</span><span>项目库、资金库、人才库全部档案与核验联系方式</span></li>' +
              '<li><span class="check">' + icon('check') + '</span><span>按城市 / 赛道 / 阶段筛选，一键导出 CSV</span></li>' +
              '<li><span class="check">' + icon('check') + '</span><span>每月 500 封起的 AI 邮件额度，按量加购</span></li>' +
              '<li><span class="check">' + icon('check') + '</span><span>来源、核验时间与可信度全部可追溯</span></li>' +
            '</ul>' +
            '<div class="membership-actions">' +
              '<a class="btn btn-dark" href="#/pricing">查看会员方案 ' + icon('arrow') + '</a>' +
              '<button class="btn btn-ghost" type="button" data-action="open-auth">先登录</button>' +
            '</div>' +
          '</div>' +
          '<div class="unlock-demo reveal" id="unlock-demo">' + demoCardInner(member) + '</div>' +
        '</div>' +
      '</section>' +

      '<section class="section email-section">' +
        '<div class="container">' +
          '<div class="email-grid">' +
            '<div class="reveal">' +
              '<div class="eyebrow light">AI OUTREACH</div>' +
              '<h2>别再群发。<br>让每一封邮件<br>都叫得出名字。</h2>' +
              '<p>从三个库里选人，AI 按赛道与阶段起草，按发送量计费。打开、点击、回复都有记录，频控与退订默认开启。</p>' +
              '<div class="email-features">' +
                '<div class="email-feature"><strong>' + icon('sparkles') + 'AI 个性化起草</strong><span>把公司、联系人、赛道与阶段自动写进正文。</span></div>' +
                '<div class="email-feature"><strong>' + icon('target') + '精准人群切片</strong><span>按城市、赛道、阶段组合，避免无效群发。</span></div>' +
                '<div class="email-feature"><strong>' + icon('chart') + '按量计费</strong><span>会员含额度，超出部分按阶梯单价购买。</span></div>' +
                '<div class="email-feature"><strong>' + icon('shield') + '合规频控</strong><span>退订、发送上限与来源记录，默认开启。</span></div>' +
              '</div>' +
            '</div>' +
            '<div class="email-mock reveal">' +
              '<div class="mock-head"><span class="win-dot"></span><span class="win-dot"></span><span class="win-dot"></span><span>Campaign builder</span><span class="mock-badge">AI DRAFT</span></div>' +
              '<div class="mock-body">' +
                '<div class="mock-subject"><span class="spark">' + icon('sparkles') + '</span>邀请星穹具身参加深圳闭门资本对接<span>已生成</span></div>' +
                '<div class="mock-lines"><div class="mock-line w-90"></div><div class="mock-line w-80"></div><div class="mock-line highlight w-70"></div><div class="mock-line w-90"></div><div class="mock-line w-50"></div></div>' +
                '<div class="mock-recipient"><span class="mini-avatar">顾</span><span>收件人 <b>顾行</b> · 星穹具身 · 杭州</span><span style="margin-left:auto;color:var(--green)">已匹配</span></div>' +
              '</div>' +
              '<div class="mock-progress"><div class="mock-progress-top"><span>正在发送 · 186 位收件人</span><strong>68%</strong></div><div class="progress-track"><div class="progress-fill" style="width:68%"></div></div></div>' +
              '<div class="mock-stats"><div class="mock-stat"><strong>186</strong><span>已发送</span></div><div class="mock-stat"><strong>61%</strong><span>打开率</span></div><div class="mock-stat"><strong>14</strong><span>回复</span></div></div>' +
            '</div>' +
          '</div>' +
          '<div class="price-strip">' +
            '<div class="price-cell"><strong>500 封</strong><span>专业会员 / 每月含</span></div>' +
            '<div class="price-cell"><strong>2,500 封</strong><span>团队会员 / 每月含</span></div>' +
            '<div class="price-cell"><strong>¥299 起</strong><span>500 封加油包</span></div>' +
            '<div class="price-cell"><strong>¥0.30 / 封</strong><span>20,000 封阶梯单价</span></div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="section">' +
        '<div class="container coverage-grid">' +
          '<div class="reveal">' +
            '<div class="eyebrow">COVERAGE ROADMAP</div>' +
            '<h2 style="margin-top:13px;font-family:var(--serif);font-size:clamp(32px,3.4vw,46px);font-weight:600;line-height:1.24;letter-spacing:-.03em">从华东华南出发，<br>再连到全国。</h2>' +
            '<div class="phase-list">' +
              '<div class="phase-item done"><div class="phase-label">PHASE 0 <b>DONE</b></div><h4>定义字段与核验标准</h4><p>统一项目、机构、人才三类 schema；建立来源、更新时间与可信度记录。</p></div>' +
              '<div class="phase-item active"><div class="phase-label">PHASE 1 <b>NOW</b></div><h4>杭州 + 深圳，华东 + 华南</h4><p>首批 ' + total + ' 条数据已上线（含杭州 / 深圳各 42 家公开图谱）；目标 8 周内达到 2,000 项目 / 300 资金 / 1,000 人才。</p></div>' +
              '<div class="phase-item"><div class="phase-label">PHASE 2</div><h4>全国重点省市</h4><p>北京、成都、武汉、西安、合肥；建立区域数据运营与机构合作。</p></div>' +
              '<div class="phase-item"><div class="phase-label">PHASE 3</div><h4>持续更新与 API</h4><p>周级增量、会员认领、开放 API 与 CRM 双向同步。</p></div>' +
            '</div>' +
            '<a class="btn-text" style="margin-top:18px" href="#/data">阅读完整数据方案 ' + icon('arrowUp') + '</a>' +
          '</div>' +
          '<div class="reveal">' +
            '<div class="city-groups">' +
              '<div class="city-group"><div class="city-group-head"><h5>华东 · EAST</h5><span>' + eastProjects + ' 个项目</span></div>' +
                ['杭州', '上海', '南京', '苏州'].map(function (city) {
                  return '<div class="city-line"><span class="cdot"></span><strong>' + city + '</strong><em class="open">' + projectsOfCity(city) + ' / ' + capitalOfCity(city) + ' / ' + talentsOfCity(city) + '</em></div>';
                }).join('') +
                '<div class="city-legend">每行：项目 / 资金 / 人才</div>' +
              '</div>' +
              '<div class="city-group"><div class="city-group-head"><h5>华南 · SOUTH</h5><span>' + southProjects + ' 个项目</span></div>' +
                ['深圳', '广州', '厦门', '东莞'].map(function (city) {
                  return '<div class="city-line"><span class="cdot"></span><strong>' + city + '</strong><em class="open">' + projectsOfCity(city) + ' / ' + capitalOfCity(city) + ' / ' + talentsOfCity(city) + '</em></div>';
                }).join('') +
                '<div class="city-legend">每行：项目 / 资金 / 人才</div>' +
              '</div>' +
              '<div class="city-group"><div class="city-group-head"><h5>华北 · NORTH</h5><span>资金先行</span></div>' +
                ['北京', '成都'].map(function (city) {
                  return '<div class="city-line"><span class="cdot"></span><strong>' + city + '</strong><em class="soon">' + projectsOfCity(city) + ' / ' + capitalOfCity(city) + ' / ' + talentsOfCity(city) + '</em></div>';
                }).join('') +
              '</div>' +
              '<div class="city-group"><div class="city-group-head"><h5>下一批</h5><span>2027 Q1</span></div>' +
                ['武汉', '西安', '合肥', '珠海'].map(function (city) {
                  return '<div class="city-line"><span class="cdot"></span><strong>' + city + '</strong><em class="soon">接入中</em></div>';
                }).join('') +
              '</div>' +
            '</div>' +
            '<div class="compliance-note" style="margin-top:12px">' + icon('shield') + '<span><strong>先核验，再收录。</strong>演示站点仅使用虚构样本；正式数据将记录来源、授权方式与最近核验时间，并提供删除与退订通道。</span></div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="section-tight" style="background:var(--paper-2);border-top:1px solid var(--line);border-bottom:1px solid var(--line)">' +
        '<div class="container">' +
          '<div class="section-head reveal" style="margin-bottom:0"><div><div class="eyebrow">HOW IT WORKS</div><h2 style="font-size:clamp(28px,2.6vw,38px)">从一条记录，到一次真实的见面。</h2></div><a class="btn-text" href="#/data">数据方法 ' + icon('arrowUp') + '</a></div>' +
          '<div class="process-grid">' +
            '<div class="process-card"><div class="process-num">01</div><h4>发现</h4><p>从工商、园区、融资事件与会员登记中定位企业与关键人。</p><span class="tag outline">公开信息 + 授权数据</span></div>' +
            '<div class="process-card"><div class="process-num">02</div><h4>结构化</h4><p>统一字段、行业标签与阶段口径，补全城市与赛道维度。</p><span class="tag outline">Schema 0.9</span></div>' +
            '<div class="process-card"><div class="process-num">03</div><h4>核验</h4><p>官网 / 电话 / 邮箱多源交叉，标记可信度与最近核验时间。</p><span class="tag outline">每周抽检</span></div>' +
            '<div class="process-card"><div class="process-num">04</div><h4>连接</h4><p>会员筛选目标，AI 起草邮件，记录打开、回复与后续跟进。</p><span class="tag outline">按量计费</span></div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="cta-band">' +
        '<div class="container cta-inner">' +
          '<div><h2>先让对的 1,000 人，<br>看见你的项目。</h2><p>首批会员开放中。三大库 + AI 邮件引擎，一张通行证。</p></div>' +
          '<a class="btn btn-dark btn-lg" href="#/pricing">成为首批会员 ' + icon('arrow') + '</a>' +
        '</div>' +
      '</section>';
  }

  function libraryCard(type) {
    var cfg = DB[type];
    var rows = D[type];
    var preview = rows.slice(0, 3);
    var cls = type === 'capital' ? ' dark' : (type === 'talents' ? ' lime' : '');
    var pendingTotal = PROJECTS.filter(function (p) { return p.pending; }).length;
    var tags = type === 'projects' ? ['杭州 42 家', '深圳 42 家', pendingTotal + ' 待核验', '7 大分类'] : type === 'capital' ? ['早期 VC', 'CVC', '天使', 'PE'] : ['算法', 'Infra', '产品', '合伙人'];
    var link = type === 'projects' ? '#/projects' : type === 'capital' ? '#/capital' : '#/talents';
    var previewHtml = preview.map(function (r) {
      var meta = type === 'projects' ? r.city : type === 'capital' ? r.type : r.role;
      return '<div class="lib-row"><span class="dot"></span><strong>' + esc(r.name) + '</strong><span>' + esc(meta) + '</span></div>';
    }).join('');

    return '<article class="library-card' + cls + ' reveal">' +
      '<div class="lib-top"><span class="lib-icon">' + icon(cfg.icon) + '</span><span class="lib-index">DB / ' + cfg.code + '</span></div>' +
      '<div class="lib-count"><strong>' + rows.length + '</strong><span>条首批精选</span></div>' +
      '<h3 class="lib-title">' + cfg.label + '</h3>' +
      '<p class="lib-desc">' + cfg.desc + '</p>' +
      '<div class="lib-tags">' + tags.map(function (t) { return '<span class="tag">' + t + '</span>'; }).join('') + '</div>' +
      '<div class="lib-preview">' + previewHtml + '</div>' +
      '<div class="lib-foot"><a class="lib-link" href="' + link + '">浏览' + cfg.label.replace('库', '') + ' ' + icon('arrowUp') + '</a><span class="lib-arrow">' + icon('arrow') + '</span></div>' +
    '</article>';
  }

  function demoCardInner(member) {
    var t = TALENTS[0];
    return '' +
      '<div class="demo-bar"><span class="demo-label"><span class="status-dot"></span>实时预览</span>' +
        '<div class="demo-toggle"><button type="button" class="' + (!member ? 'is-active' : '') + '" data-action="demo-toggle" data-mode="guest">访客视图</button><button type="button" class="' + (member ? 'is-active' : '') + '" data-action="demo-toggle" data-mode="member">会员视图</button></div>' +
      '</div>' +
      '<div class="profile-mini">' +
        '<div class="profile-mini-top"><span class="profile-avatar">' + (member ? '陈' : '陈') + '</span><div><h4>' + (member ? esc(t.name) : maskName(t.name)) + '</h4><p>' + esc(t.role) + ' · ' + esc(t.city) + ' · ' + t.years + ' 年</p></div><span class="verified-badge">' + icon('checkCircle') + ' 已核验</span></div>' +
        '<div class="contact-demo-list">' +
          '<div class="contact-demo-row"><span class="cd-label">邮箱</span><span class="cd-value ' + (member ? '' : 'is-masked') + '">' + esc(member ? t.contact.email : maskEmail(t.contact.email)) + '</span>' + icon(member ? 'copy' : 'lock') + '</div>' +
          '<div class="contact-demo-row"><span class="cd-label">电话</span><span class="cd-value ' + (member ? '' : 'is-masked') + '">' + esc(member ? t.contact.phone : maskPhone(t.contact.phone)) + '</span>' + icon(member ? 'copy' : 'lock') + '</div>' +
          '<div class="contact-demo-row"><span class="cd-label">微信</span><span class="cd-value ' + (member ? '' : 'is-masked') + '">' + esc(member ? t.contact.wechat : 'ailink_••••') + '</span>' + icon(member ? 'copy' : 'lock') + '</div>' +
        '</div>' +
        '<p class="demo-note">当前为<strong>' + (member ? '会员视图' : '访客视图') + '</strong>。' + (member ? '联系方式来自授权登记，最近核验 2026.10.18。' : '升级会员后，可查看完整姓名、联系方式与求职意向。') + '</p>' +
      '</div>';
  }

  /* ----------------------------------------------------------------------
     Database pages
     ---------------------------------------------------------------------- */

  function getFilter(type) {
    if (!state.filters[type]) {
      state.filters[type] = {
        q: '', region: '全部', city: '全部', sector: '全部', district: '全部', status: '全部', stage: '全部',
        focus: '全部', role: '全部', availability: '全部',
        verified: false, listedOnly: false, pendingOnly: false, sort: 'recommended', page: 1
      };
    }
    return state.filters[type];
  }

  function filterOptions(type, source) {
    var rows = D[type];
    var values = [];
    if (source === 'cities') values = rows.map(function (r) { return r.city; });
    else if (source === 'sector') values = rows.map(function (r) { return r.sector; });
    else if (source === 'stage') values = rows.map(function (r) { return r.stage; });
    else if (source === 'kind') values = rows.map(function (r) { return r.type; });
    else if (source === 'focus') {
      rows.forEach(function (r) { (r.focus || []).forEach(function (x) { values.push(x); }); });
    } else if (source === 'stages') {
      rows.forEach(function (r) { (r.stages || []).forEach(function (x) { values.push(x); }); });
    } else if (source === 'role') values = rows.map(function (r) { return r.role; });
    else if (source === 'availability') values = rows.map(function (r) { return r.availability; });
    else if (source === 'district') values = rows.map(function (r) { return r.district; });
    else if (source === 'status') values = rows.map(function (r) { return r.status; });
    values = unique(values).filter(Boolean);
    values.sort(function (a, b) { return String(a).localeCompare(String(b), 'zh-CN'); });
    return ['全部'].concat(values);
  }

  function libraryPage(type) {
    var cfg = DB[type];
    var rows = D[type];
    var f = getFilter(type);
    var verified = rows.filter(function (r) { return r.verified; }).length;
    var verifiedPct = Math.round(verified / rows.length * 100);
    var resultRows = filteredRecords(type);

    var pendingCount = rows.filter(function (r) { return r.pending; }).length;
    var heroStats = type === 'projects'
      ? '<div><strong>' + rows.length + '</strong><span>条项目</span></div>' +
        '<div><strong>' + pendingCount + '</strong><span>条待核验</span></div>' +
        '<div><strong>2,600+</strong><span>深圳 AI 企业总量</span></div>'
      : '<div><strong>' + rows.length + '</strong><span>条首批精选</span></div>' +
        '<div><strong>' + unique(rows.map(function (r) { return r.city; })).length + '</strong><span>覆盖城市</span></div>' +
        '<div><strong>' + verifiedPct + '%</strong><span>已核验</span></div>';

    return '' +
      '<section class="db-hero">' +
        '<div class="container">' +
          '<div class="crumb"><a href="#/home">首页</a><span class="sep">/</span><span>' + cfg.label + '</span></div>' +
          '<div class="db-hero-grid">' +
            '<div>' +
              '<div class="eyebrow light">DATABASE / ' + cfg.code + '</div>' +
              '<h1>' + cfg.label + '</h1>' +
              '<p class="db-hero-desc">' + cfg.desc + '</p>' +
            '</div>' +
            '<div class="db-hero-stats">' + heroStats + '</div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      (type === 'projects' ? '<div class="container">' + cityRailsHTML() + '</div>' : '') +

      '<div class="container app-shell">' +
        '<aside class="filters" id="filter-panel">' + filtersHTML(type) + '</aside>' +
        '<section class="results">' +
          '<div class="results-head">' +
            '<div><h2>' + cfg.label.replace('库', '') + ' <span><b id="result-count">' + resultRows.length + '</b> 条匹配</span></h2><p id="result-note">' + resultNote(type, resultRows.length) + '</p></div>' +
            '<div class="results-actions">' +
              '<select class="sort-select" id="sort-select" aria-label="排序">' + cfg.sortOptions.map(function (o) {
                return '<option value="' + o.key + '"' + (f.sort === o.key ? ' selected' : '') + '>' + o.label + '</option>';
              }).join('') + '</select>' +
              '<button class="export-btn" type="button" data-action="export" data-type="' + type + '">' + icon('download') + ' 导出 CSV</button>' +
            '</div>' +
          '</div>' +
          (isMember() ? '' : '<div class="gate-banner">' + icon('lock') + '<span><strong>访客视图：</strong>联系方式、决策人与融资细节已隐藏。升级会员后可查看全部 ' + rows.length + ' 条档案，其中 ' + rows.filter(hasContact).length + ' 条含可联系信息。</span><a class="banner-link" href="#/pricing">解锁全部</a></div>') +
          (type === 'projects' && rows.filter(function (r) { return r.pending; }).length && !f.pendingOnly
            ? '<div class="pending-banner">' + icon('clock') + '<span><strong>待核验批次已批量导入 ' + rows.filter(function (r) { return r.pending; }).length + ' 家（杭州 ' + rows.filter(function (r) { return r.pending && r.city === '杭州'; }).length + ' + 深圳 ' + rows.filter(function (r) { return r.pending && r.city === '深圳'; }).length + ' + 其他地区 ' + rows.filter(function (r) { return r.pending && r.city !== '杭州' && r.city !== '深圳'; }).length + '）。</strong>仅名称、板块/城区与初分方向，联系方式尚未采集；已用黄色标签标注。</span><button class="banner-link" type="button" data-action="show-pending">只看待核验</button></div>'
            : '') +
          '<div class="record-grid" id="result-grid">' + cardsHTML(type, resultRows.slice(0, f.page * 9)) + '</div>' +
          '<div class="load-wrap"><button class="btn btn-ghost load-more" type="button" id="load-more" ' + (resultRows.length <= f.page * 9 ? 'hidden' : '') + '>加载更多</button></div>' +
        '</section>' +
      '</div>';
  }

  function resultNote(type, count) {
    var total = D[type].length;
    var verified = D[type].filter(function (r) { return r.verified; }).length;
    var contactCount = D[type].filter(hasContact).length;
    var pending = D[type].filter(function (r) { return r.pending; }).length;
    var prefix = type === 'projects'
      ? '全部 ' + total + ' 条 · 双城公开图谱 ' + ((D.meta.hzIncluded || 42) + (D.meta.szIncluded || 42)) + ' 家 · ' + pending + ' 条待核验 · ' + contactCount + ' 条含可联系档案 · '
      : '全部 ' + total + ' 条 · 已核验 ' + verified + ' 条 · ';
    return prefix + (count === total ? '显示全部' : '当前筛选 ' + count + ' 条') + (type === 'projects' ? ' · 双城公开图谱企业联系方式待核验' : ' · 演示数据');
  }

  function cityRailsHTML() {
    return '<div class="city-rails">' + cityMapRail('hz') + cityMapRail('sz') + '</div>';
  }

  function cityMapRail(key) {
    var isHz = key === 'hz';
    var city = isHz ? '杭州' : '深圳';
    var dataset = isHz ? 'hz-atlas' : 'sz-atlas';
    var cats = (isHz ? D.meta.hzCategories : D.meta.szCategories) || [];
    var rows = PROJECTS.filter(function (r) { return r.dataset === dataset; });
    var counts = {};
    rows.forEach(function (r) { counts[r.sector] = (counts[r.sector] || 0) + 1; });
    var f = getFilter('projects');
    var included = rows.length;
    var core = isHz ? (D.meta.hzCoreCompanies || 938) : (D.meta.szCoreCompanies || 2600);
    var targetLabel = isHz ? String(core) : '2,600+';
    var pct = Math.max(0.4, Math.round(included / core * 1000) / 10);
    var title = isHz ? '杭州 AI 核心企业' : '深圳 AI 企业';
    var note = isHz
      ? '首批 ' + included + ' 家代表企业，来自公开信息图谱，按产业链重新分类。' + core + ' 家为公开报道的全市 AI 核心企业总量，本库尚未全量收录。'
      : '首批 ' + included + ' 家代表企业，按 7 条产业链重新分类。官方口径：2025 年深圳 AI 典型企业超 2,600 家，2026 年目标超 3,000 家。';
    var batch = isHz ? '杭州 AI 图谱' : '深圳 AI 企业图谱';
    var updated = isHz ? D.meta.hzUpdated : D.meta.szUpdated;
    var sourceLink = isHz
      ? '<a href="https://spap.jst.go.jp/china/news/260902/topic_5_01.html" target="_blank" rel="noopener">来源</a>'
      : '<a href="https://fgw.sz.gov.cn/gkmlpt/content/12/12639/post_12639574.html" target="_blank" rel="noopener">来源</a>';

    return '<section class="category-rail city-rail">' +
      '<div class="cat-head">' +
        '<div><div class="eyebrow">' + (isHz ? 'HANGZHOU AI ATLAS' : 'SHENZHEN AI ATLAS') + '</div><h2>' + title + ' · 7 大分类</h2><p>' + note + '</p></div>' +
        '<div class="cat-coverage"><strong>' + included + '<span> / ' + targetLabel + '</span></strong><div class="cat-bar"><i style="width:' + pct + '%"></i></div><small>当前覆盖 ' + pct + '%，全量名录需接入园区 / 工商授权数据</small></div>' +
      '</div>' +
      '<div class="category-chips">' +
        '<button class="category-chip' + (f.city === city && f.sector === '全部' ? ' is-active' : '') + '" type="button" data-action="set-city-sector" data-city="' + city + '" data-sector="全部" data-scroll="1">全部企业 <b>' + included + '</b></button>' +
        cats.map(function (c) {
          return '<button class="category-chip' + (f.city === city && f.sector === c.name ? ' is-active' : '') + '" type="button" data-action="set-city-sector" data-city="' + city + '" data-sector="' + esc(c.name) + '" data-scroll="1"><span class="cat-dot" style="background:' + esc(c.color) + '"></span>' + esc(c.name) + ' <b>' + (counts[c.name] || 0) + '</b></button>';
        }).join('') +
      '</div>' +
      '<div class="cat-foot">' + icon('database') + ' <span>数据批次：' + batch + ' · 更新于 ' + esc(updated || '2026-11-01') + ' · 企业信息为公开资料；电话 / 邮箱待核验，不编造。</span>' + sourceLink + '<a href="#/data#batch">扩库方案 →</a></div>' +
    '</section>';
  }

  function updateCategoryChips() {
    if (state.route !== 'projects') return;
    var f = getFilter('projects');
    $$('.category-chip').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-city') === f.city && btn.getAttribute('data-sector') === f.sector);
    });
  }

  function setCitySector(city, sector) {
    var f = getFilter('projects');
    f.city = city;
    f.sector = sector;
    f.region = '全部';
    f.district = '全部';
    f.page = 1;
    var panel = $('#filter-panel');
    if (panel) panel.innerHTML = filtersHTML('projects');
    renderResults('projects');
    updateCategoryChips();
  }

  function filtersHTML(type) {
    var cfg = DB[type];
    var f = getFilter(type);
    var groups = '';

    cfg.filters.forEach(function (def) {
      if (def.type === 'chips') {
        groups += '<div class="filter-group"><label>' + def.label + '</label><div class="chip-row">' +
          def.options.map(function (opt) {
            return '<button class="chip' + (f[def.key] === opt ? ' is-active' : '') + '" type="button" data-action="set-filter" data-type="' + type + '" data-key="' + def.key + '" data-value="' + esc(opt) + '">' + esc(opt) + '</button>';
          }).join('') + '</div></div>';
      } else {
        var opts = filterOptions(type, def.options);
        groups += '<div class="filter-group"><label>' + def.label + '</label><select class="filter-select" data-select-filter="' + def.key + '" data-type="' + type + '" aria-label="' + def.label + '">' +
          opts.map(function (opt) {
            return '<option value="' + esc(opt) + '"' + (f[def.key] === opt ? ' selected' : '') + '>' + esc(opt === '全部' ? '全部' + def.label.replace('融资', '').replace('投资', '') : opt) + '</option>';
          }).join('') + '</select></div>';
      }
    });

    groups = '<div class="filter-group"><label>关键词</label><input class="filter-select" id="filter-q" data-type="' + type + '" type="search" value="' + esc(f.q) + '" placeholder="企业 / 赛道 / 城市" autocomplete="off"></div>' + groups;

    groups += '<div class="filter-group"><label>数据质量</label>' +
      '<label class="check-row"><input type="checkbox" id="verified-only" ' + (f.verified ? 'checked' : '') + '> 仅看已核验</label>' +
      (type === 'projects' ? '<label class="check-row"><input type="checkbox" id="listed-only" ' + (f.listedOnly ? 'checked' : '') + '> 仅看上市企业</label>' : '') +
      (type === 'projects' ? '<label class="check-row"><input type="checkbox" id="pending-only" ' + (f.pendingOnly ? 'checked' : '') + '> 仅看待核验</label>' : '') +
      '<label class="check-row"><input type="checkbox" id="has-contact" checked disabled> 含有效联系方式</label>' +
      '</div>';

    return '<div class="filter-head"><h3>' + icon('filter') + ' 筛选条件</h3><div class="filter-head-actions"><button class="filter-reset" type="button" data-action="reset-filters" data-type="' + type + '">重置</button><button class="filter-collapse" type="button" data-action="toggle-filters" aria-expanded="false">筛选</button></div></div>' +
      '<div class="filter-groups">' + groups + '</div>' +
      '<div class="filter-tip"><strong>关于本库</strong>' + cfg.desc + '</div>';
  }

  function filteredRecords(type) {
    var cfg = DB[type];
    var f = getFilter(type);
    var q = f.q.trim().toLowerCase();
    var rows = D[type].filter(function (r) {
      if (f.verified && (!r.verified || r.pending)) return false;
      if (f.listedOnly && !r.listed) return false;
      if (f.pendingOnly && !r.pending) return false;
      for (var i = 0; i < cfg.filters.length; i++) {
        var def = cfg.filters[i];
        var val = f[def.key];
        if (!val || val === '全部') continue;
        var fieldVal = r[def.field];
        if (def.array) {
          if ((fieldVal || []).indexOf(val) === -1) return false;
        } else if (fieldVal !== val) {
          return false;
        }
      }
      if (q) {
        var haystack = [r.name, r.city, r.district, r.status, r.desc, r.tagline, r.sector, r.role, r.type, r.current, r.keywords, (r.skills || []).join(' '), (r.focus || []).join(' '), (r.highlights || []).join(' ')].join(' ').toLowerCase();
        if (haystack.indexOf(q) === -1) return false;
      }
      return true;
    });
    return sortRecords(type, rows, f.sort);
  }

  function sortRecords(type, rows, sort) {
    var copy = rows.slice();
    if (sort === 'latest') {
      copy.sort(function (a, b) { return String(b.updated).localeCompare(String(a.updated)); });
    } else if (sort === 'team') {
      copy.sort(function (a, b) { return (b.team || 0) - (a.team || 0); });
    } else if (sort === 'years') {
      copy.sort(function (a, b) { return (b.years || 0) - (a.years || 0); });
    } else if (sort === 'aum') {
      copy.sort(function (a, b) { return parseAum(b.aum) - parseAum(a.aum); });
    } else if (sort === 'confidence') {
      copy.sort(function (a, b) { return (b.confidence || 0) - (a.confidence || 0); });
    }
    return copy;
  }

  function parseAum(aum) {
    var n = parseFloat(String(aum || '0').replace(/[^\d.]/g, ''));
    return isNaN(n) ? 0 : n;
  }

  function cardsHTML(type, rows) {
    if (!rows.length) {
      return '<div class="empty-state"><span class="empty-icon">' + icon('search') + '</span><h4>没有匹配的记录</h4><p>换一个城市、赛道或关键词试试。</p></div>';
    }
    return rows.map(function (r) { return recordCard(type, r); }).join('');
  }

  function recordCard(type, r) {
    var member = isMember();
    var saved = (state.bookmarks[type] || []).indexOf(r.id) >= 0;
    var isAtlas = isAtlasRecord(r);
    var isPending = !!r.pending;
    var verified = isPending
      ? '<span class="verified-badge pending">' + icon('clock') + ' 待核验</span>'
      : isAtlas
        ? '<span class="verified-badge">' + icon('database') + ' 公开资料</span>'
        : r.verified
          ? '<span class="verified-badge">' + icon('checkCircle') + ' 已核验</span>'
          : '<span class="verified-badge pending">' + icon('clock') + ' 待复核</span>';

    var title = '';
    var subtitle = '';
    var tags = '';
    var metrics = '';
    var desc = esc(r.desc);

    if (type === 'projects') {
      title = esc(r.name);
      subtitle = isPending
        ? '<b>' + esc(r.city) + '</b> · ' + esc(r.district) + ' · ' + esc(r.sector) + ' · <span style="color:var(--orange)">待核验</span>'
        : isAtlas
          ? '<b>' + esc(r.city) + '</b> · ' + esc(r.district) + ' · ' + esc(r.sector) + ' · ' + esc(r.status)
          : '<b>' + esc(r.city) + '</b> · ' + esc(r.sector) + ' · ' + esc(r.stage);
      tags = isPending
        ? '<span class="tag outline">' + esc(r.sector) + '</span><span class="tag" style="background:#fbefd8;color:#9a5a1c">' + (String(r.batchId || '').indexOf('B01') >= 0 ? 'Batch 01' : 'Batch 02') + '</span><span class="tag" style="background:#fbefd8;color:#9a5a1c">待核验</span>'
        : (r.highlights || []).slice(0, 2).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') +
          '<span class="tag outline">' + esc(r.sector) + '</span>' +
          (isAtlas ? '<span class="tag ' + (r.listed ? 'lime' : 'green') + '">' + (r.listed ? '上市' : r.status) + '</span>' : '');
      metrics = isPending
        ? '<div><span>城区</span><strong>' + esc(r.district || '—') + '</strong></div>' +
          '<div><span>初分方向</span><strong>' + esc(r.sector) + '</strong></div>' +
          '<div><span>数据状态</span><strong style="color:var(--orange)">待核验</strong></div>'
        : isAtlas
          ? '<div><span>成立</span><strong>' + (r.founded || '—') + '</strong></div>' +
            '<div><span>城区</span><strong>' + esc(r.district || '—') + '</strong></div>' +
            '<div><span>企业状态</span><strong>' + esc(r.status || '—') + '</strong></div>'
          : '<div><span>成立</span><strong>' + (r.founded || '—') + '</strong></div>' +
            '<div><span>团队</span><strong>' + (r.team ? r.team + ' 人' : '未披露') + '</strong></div>' +
            '<div><span>最新融资</span><strong>' + (member ? esc(r.funding) : '<span style="color:var(--muted-2)">会员可见</span>') + '</strong></div>';
    } else if (type === 'capital') {
      title = esc(r.name);
      subtitle = '<b>' + esc(r.city) + '</b> · ' + esc(r.type) + ' · 管理 ' + esc(r.aum);
      tags = r.focus.slice(0, 2).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '<span class="tag outline">' + esc(r.stages[0]) + '</span>' + (r.teamCount ? '<span class="tag lime">团队 ' + r.teamCount + ' 人</span>' : '');
      metrics = '<div><span>类型</span><strong>' + esc(r.type) + '</strong></div>' +
        '<div><span>单笔</span><strong>' + esc(r.ticket) + '</strong></div>' +
        '<div><span>管理规模</span><strong>' + esc(r.aum) + '</strong></div>';
    } else {
      title = (member ? esc(r.name) : maskName(r.name)) + ' <span style="font-weight:400;color:var(--muted)">· ' + esc(r.role) + '</span>';
      subtitle = '<b>' + esc(r.city) + '</b> · ' + r.years + ' 年 · ' + esc(r.current) + ' · ' + esc(r.availability);
      tags = r.skills.slice(0, 2).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') +
        (r.openTo.indexOf('合伙人机会') >= 0 ? '<span class="tag lime">可谈合伙人</span>' : '') +
        '<span class="tag outline">' + esc(r.education) + '</span>';
      metrics = '<div><span>方向</span><strong>' + esc(r.role) + '</strong></div>' +
        '<div><span>年限</span><strong>' + r.years + ' 年</strong></div>' +
        '<div><span>期望年薪</span><strong>' + (member ? esc(r.expect) : '<span style="color:var(--muted-2)">会员可见</span>') + '</strong></div>';
    }

    var contact;
    if (!hasContact(r)) {
      contact = websiteAction(r) || '<span class="contact-strip is-pending">' + icon('clock') + '<span class="contact-text">待核验 · 联系方式尚未采集</span><span class="contact-action">仅档案</span></span>';
    } else if (member) {
      contact = '<button class="contact-strip is-member" type="button" data-action="copy-contact" data-type="' + type + '" data-id="' + r.id + '">' + icon('mail') + '<span class="contact-text">' + esc(contactOf(r).email) + ' · ' + esc(contactOf(r).phone) + '</span><span class="contact-action">复制</span></button>';
    } else {
      contact = '<button class="contact-strip" type="button" data-action="open-pricing">' + icon('lock') + '<span class="contact-text">联系人、电话与邮箱仅会员可见</span><span class="contact-action">解锁</span></button>';
    }

    return '<article class="record-card" data-record="' + r.id + '">' +
      '<div class="record-top">' +
        '<span class="logo-tile" style="--brand:' + r.brand + ';--tint:' + r.tint + '">' + esc(r.logo) + '</span>' +
        '<div class="record-title"><h3>' + title + ' ' + verified + '</h3><p>' + subtitle + '</p></div>' +
        '<button class="icon-btn bookmark-btn' + (saved ? ' active' : '') + '" type="button" data-action="bookmark" data-type="' + type + '" data-id="' + r.id + '" aria-label="收藏">' + icon('bookmark') + '</button>' +
      '</div>' +
      '<p class="record-desc">' + desc + '</p>' +
      '<div class="tag-row">' + tags + '</div>' +
      '<div class="card-metrics">' + metrics + '</div>' +
      contact +
      '<div class="card-foot"><button class="card-detail-btn" type="button" data-action="open-detail" data-type="' + type + '" data-id="' + r.id + '">查看完整档案 ' + icon('arrowUp') + '</button><span class="card-source">' + esc(r.source) + '</span></div>' +
    '</article>';
  }

  function renderResults(type) {
    var f = getFilter(type);
    var rows = filteredRecords(type);
    var grid = $('#result-grid');
    var count = $('#result-count');
    var note = $('#result-note');
    var load = $('#load-more');
    if (!grid) return;
    grid.innerHTML = cardsHTML(type, rows.slice(0, f.page * 9));
    if (count) count.textContent = rows.length;
    if (note) note.textContent = resultNote(type, rows.length);
    if (load) load.hidden = rows.length <= f.page * 9;
  }

  function setFilter(type, key, value, options) {
    var f = getFilter(type);
    f[key] = value;
    f.page = 1;
    if (key === 'region' && value !== '全部' && f.city !== '全部') {
      var cities = D[type].filter(function (r) { return r.region === value; }).map(function (r) { return r.city; });
      if (cities.indexOf(f.city) === -1) f.city = '全部';
    }
    if (key === 'city') f.district = '全部';
    if (!options || options.rerenderFilters !== false) {
      var panel = $('#filter-panel');
      if (panel) panel.innerHTML = filtersHTML(type);
    }
    renderResults(type);
    updateCategoryChips();
  }

  function resetFilters(type) {
    state.filters[type] = {
      q: '', region: '全部', city: '全部', sector: '全部', district: '全部', status: '全部', stage: '全部',
      focus: '全部', role: '全部', availability: '全部',
      verified: false, listedOnly: false, pendingOnly: false, sort: 'recommended', page: 1
    };
    var panel = $('#filter-panel');
    if (panel) panel.innerHTML = filtersHTML(type);
    var sort = $('#sort-select');
    if (sort) sort.value = 'recommended';
    renderResults(type);
    updateCategoryChips();
    toast('筛选条件已重置');
  }

  function exportCSV(type) {
    if (!isMember()) {
      openPricing();
      toast('导出完整数据需要会员权限');
      return;
    }
    var rows = filteredRecords(type);
    var headers;
    var lines;
    if (type === 'projects') {
      headers = ['企业名称', '城市', '城区', '省份', '区域', '产业链 / 赛道', '企业状态', '是否上市', '成立年份', '团队规模', '最新融资', '简介', '官网', '联系人', '职位', '电话', '邮箱', '微信', '数据来源', '最近核验', '可信度'];
      lines = rows.map(function (r) {
        var c = contactOf(r);
        return [r.name, r.city, r.district || '', r.province, r.region, r.sector, r.status || r.stage, r.listed ? '是' : '否', r.founded, r.team || '', r.funding, r.desc, r.website || '', c.name, c.title, c.phone, c.email, c.wechat, r.source, r.updated, r.confidence + '%'];
      });
    } else if (type === 'capital') {
      headers = ['机构名称', '类型', '城市', '省份', '区域', '关注赛道', '投资阶段', '单笔金额', '管理规模', '简介', '联系人', '职位', '电话', '邮箱', '微信', '数据来源', '最近核验', '可信度'];
      lines = rows.map(function (r) {
        var c = contactOf(r);
        return [r.name, r.type, r.city, r.province, r.region, r.focus.join(' / '), r.stages.join(' / '), r.ticket, r.aum, r.desc, c.name, c.title, c.phone, c.email, c.wechat, r.source, r.updated, r.confidence + '%'];
      });
    } else {
      headers = ['姓名', '方向', '城市', '省份', '区域', '工作年限', '当前公司', '学历', '求职状态', '期望年薪', '技能', '合作意向', '简介', '电话', '邮箱', '微信', '数据来源', '最近核验', '可信度'];
      lines = rows.map(function (r) {
        var c = contactOf(r);
        return [r.name, r.role, r.city, r.province, r.region, r.years, r.current, r.education, r.availability, r.expect, r.skills.join(' / '), r.openTo.join(' / '), r.desc, c.phone, c.email, c.wechat, r.source, r.updated, r.confidence + '%'];
      });
    }
    var csv = '\ufeff' + [headers].concat(lines).map(function (line) {
      return line.map(function (cell) {
        return '"' + String(cell == null ? '' : cell).replace(/"/g, '""') + '"';
      }).join(',');
    }).join('\r\n');
    downloadBlob(csv, 'ailink-' + type + '-' + formatDate().replace(/\./g, '') + '.csv', 'text/csv;charset=utf-8');
    toast('已导出 ' + rows.length + ' 条 ' + DB[type].label + '数据');
  }

  function downloadBlob(content, filename, mime) {
    var blob = new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  /* ----------------------------------------------------------------------
     Detail drawer
     ---------------------------------------------------------------------- */

  function openDrawer(type, id) {
    var r = getRecord(type, id);
    if (!r) return;
    closeModal();
    var root = $('#drawer-root');
    root.innerHTML = drawerHTML(type, r);
    document.body.classList.add('no-scroll');
    var btn = $('.drawer-close');
    if (btn) btn.focus();
  }

  function closeDrawer() {
    var root = $('#drawer-root');
    if (root) root.innerHTML = '';
    syncScrollLock();
  }

  function drawerHTML(type, r) {
    var member = isMember();
    var cfg = DB[type];
    var contact = contactOf(r);
    var hasC = hasContact(r);
    var isProject = type === 'projects';
    var isCapital = type === 'capital';
    var isAtlas = isAtlasRecord(r);
    var isPending = !!r.pending;
    var batchLabel = String(r.batchId || '').indexOf('B01') >= 0 ? 'Batch 01' : 'Batch 02';
    var actionLabel = type === 'talents' ? '邀约沟通' : '发送合作邮件';

    var details = '';
    var highlights = '';
    var extraMetrics = '';

    if (isProject) {
      if (isPending) {
        details = detailItem('所在城区', r.district || '—') +
          detailItem('初分方向', r.sector) +
          detailItem('数据批次', r.batchId || 'SZ-B02') +
          detailItem('数据状态', '待核验') +
          detailItem('最近更新', r.updated) +
          detailItem('联系方式', '未采集');
        highlights = '<div class="detail-section"><h4>待核验说明 <span>' + batchLabel + '</span></h4>' +
          '<p class="tagline-text">该记录按“先导入、后核验”的批次策略进入项目库。当前只确认企业名称、城区与初分方向，业务描述、规模、融资与联系方式均未核验。</p>' +
          '<ul class="highlight-list"><li><span class="hl-dot"></span><span>来源：' + esc(r.source) + '</span></li><li><span class="hl-dot"></span><span>核验通过前，不参与邮件触达与联系方式展示</span></li></ul></div>';
      } else if (isAtlas) {
        details = detailItem('所在城区', r.district || '—') +
          detailItem('成立年份', String(r.founded || '—')) +
          detailItem('企业状态', r.status || '—') +
          detailItem('是否上市', r.listed ? '是 · ' + (r.ticker || '') : '否') +
          detailItem('产业链分类', r.sector) +
          detailItem('最近更新', r.updated);
        if (r.metrics && r.metrics.length) {
          extraMetrics = '<div class="detail-section"><h4>关键数据 <span>公开报道 / 企业口径</span></h4><div class="detail-grid">' +
            r.metrics.map(function (m) { return detailItem(m.label, m.value); }).join('') +
          '</div><p class="metric-note">' + r.metrics.map(function (m) { return m.value + ' · ' + m.label + (m.note ? '（' + m.note + '）' : ''); }).join('；') + '</p></div>';
        }
        highlights = '<div class="detail-section"><h4>AI 抓手 <span>公开资料</span></h4>' +
          (r.tagline ? '<p class="tagline-text">' + esc(r.tagline) + '</p>' : '') +
          '<ul class="highlight-list">' + (r.highlights || []).map(function (h) { return '<li><span class="hl-dot"></span><span>' + esc(h) + '</span></li>'; }).join('') + '</ul></div>';
      } else {
        details = detailItem('城市 / 区域', r.city + ' · ' + r.region) +
          detailItem('成立年份', String(r.founded || '—')) +
          detailItem('团队规模', r.team ? r.team + ' 人' : '未披露') +
          detailItem('当前阶段', r.stage) +
          detailItem('最新融资', member ? r.funding : '会员可见') +
          detailItem('数据可信度', r.confidence + '%');
        highlights = '<div class="detail-section"><h4>核心亮点 <span>' + (member ? '来自访谈与公开资料' : '会员可见') + '</span></h4>' +
          (member
            ? '<ul class="highlight-list">' + r.highlights.map(function (h) { return '<li><span class="hl-dot"></span><span>' + esc(h) + '</span></li>'; }).join('') + '</ul>'
            : '<div class="unlock-panel"><h5>3 条核心亮点</h5><p>团队、客户与增长数据仅向会员开放。</p><button class="btn btn-lime btn-sm" type="button" data-action="open-pricing">解锁完整档案</button></div>') +
          '</div>';
      }
    } else if (isCapital) {
      details = detailItem('机构类型', r.type) +
        detailItem('城市 / 区域', r.city + ' · ' + r.region) +
        detailItem('管理规模', r.aum) +
        detailItem('单笔金额', r.ticket) +
        detailItem('关注阶段', r.stages.join(' / ')) +
        detailItem('数据可信度', r.confidence + '%');
      highlights = '<div class="detail-section"><h4>投资偏好 <span>来自机构官网与访谈</span></h4>' +
        '<div class="detail-grid" style="margin-bottom:10px">' + r.focus.map(function (f) { return '<div class="detail-item"><span>关注赛道</span><strong>' + esc(f) + '</strong></div>'; }).join('') + '</div>' +
        '<p>' + esc(r.desc) + '</p></div>' +
        ((r.people && r.people.length) ? '<div class="detail-section"><h4>投资团队 <span>公开团队页</span></h4><ul class="highlight-list">' +
          r.people.slice(0, 8).map(function (p) { return '<li><span class="hl-dot"></span><span><strong>' + esc(p.name) + '</strong> · ' + esc(p.title || '') + (p.focus ? ' · ' + esc(p.focus) : '') + '</span></li>'; }).join('') +
          '</ul><p class="metric-note">人员来自机构官网/公开团队页，联系方式待逐人核验。</p></div>' : '');
    } else {
      details = detailItem('方向', r.role) +
        detailItem('城市 / 区域', r.city + ' · ' + r.region) +
        detailItem('工作年限', r.years + ' 年') +
        detailItem('当前公司', r.current) +
        detailItem('学历', r.education) +
        detailItem('求职状态', r.availability);
      highlights = '<div class="detail-section"><h4>合作意向 <span>候选人授权公开</span></h4>' +
        '<div class="detail-grid" style="margin-bottom:10px">' + detailItem('期望年薪', member ? r.expect : '会员可见') + detailItem('可谈机会', r.openTo.join(' / ')) + '</div>' +
        '<div class="tag-row">' + r.skills.map(function (s) { return '<span class="tag">' + esc(s) + '</span>'; }).join('') + '</div>' +
        '</div>';
    }

    var contactHTML;
    if (!hasC) {
      var website = websiteOf(r);
      contactHTML = '<div class="contact-panel">' +
        (website ? '<div class="contact-row"><span class="cr-label">官网</span><a class="cr-value link-value" href="' + esc(website) + '" target="_blank" rel="noopener">' + esc(r.websiteLabel || website) + ' ↗</a></div>' : '') +
        '<div class="contact-row is-locked"><span class="cr-label">电话</span><span class="cr-value">' + (isPending ? batchLabel + ' 未采集' : '公开图谱未提供') + '</span><span class="copy-btn">' + icon('lock') + '</span></div>' +
        '<div class="contact-row is-locked"><span class="cr-label">邮箱</span><span class="cr-value">' + (isPending ? batchLabel + ' 未采集' : '公开图谱未提供') + '</span><span class="copy-btn">' + icon('lock') + '</span></div>' +
        '</div>' +
        '<div class="contact-pending">' + icon('database') + '<span><strong>' + (isPending ? '待核验批次。' : '不编造联系方式。') + '</strong>' + (isPending ? batchLabel + ' 只完成名称、城区与初分方向登记；联系方式、业务与融资信息尚未核验，核验通过前不开放。' : '该企业来自公开资料图谱，原数据只有官网与业务信息。我们已将电话 / 邮箱标记为“待核验”，补全后才会向会员开放。') + '</span></div>';
    } else if (member) {
      contactHTML = '<div class="contact-panel">' +
        contactRow('联系人', contact.name, false) +
        contactRow('职位 / 身份', contact.title, false) +
        contactRow('电话', contact.phone, true) +
        contactRow('邮箱', contact.email, true) +
        contactRow('微信', contact.wechat, true) +
      '</div>';
    } else {
      contactHTML = '<div class="contact-panel">' +
        contactRow('联系人', maskName(contact.name), false, true) +
        contactRow('职位 / 身份', contact.title, false, true) +
        contactRow('电话', maskPhone(contact.phone), true, true) +
        contactRow('邮箱', maskEmail(contact.email), true, true) +
        contactRow('微信', 'ailink_••••', true, true) +
      '</div>' +
      '<div class="unlock-panel" style="margin-top:10px"><h5>完整联系方式仅会员可见</h5><p>包含决策人姓名、电话、邮箱与微信，来自授权登记并记录最近核验时间。</p><button class="btn btn-lime btn-sm" type="button" data-action="open-pricing">查看会员方案</button></div>';
    }

    var tags;
    if (isProject) {
      tags = isPending
        ? '<span class="tag lime">' + esc(r.sector) + '</span><span class="tag">' + esc(r.district) + '</span><span class="tag" style="background:#fbefd8;color:#9a5a1c">' + batchLabel + ' · 待核验</span>'
        : isAtlas
          ? '<span class="tag lime">' + esc(r.sector) + '</span><span class="tag">' + esc(r.district) + '</span><span class="tag">' + (r.listed && r.status !== '上市' ? '上市' : esc(r.status)) + '</span>'
          : '<span class="tag lime">' + esc(r.sector) + '</span><span class="tag">' + esc(r.stage) + '</span><span class="tag">' + esc(r.city) + '</span>';
    } else if (isCapital) {
      tags = '<span class="tag lime">' + esc(r.type) + '</span><span class="tag">' + esc(r.city) + '</span><span class="tag">' + esc(r.aum) + '</span>';
    } else {
      tags = '<span class="tag lime">' + esc(r.role) + '</span><span class="tag">' + esc(r.city) + '</span><span class="tag">' + (member ? esc(r.name) : maskName(r.name)) + '</span>';
    }

    var sourceLinks = '';
    if (isAtlas && r.atlasSources && r.atlasSources.length) {
      sourceLinks = '<div class="source-links"><span>公开来源</span>' + r.atlasSources.map(function (s) {
        return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.label) + ' ↗</a>';
      }).join('') + '</div>';
    }

    var callout = '';
    if (isPending) {
      callout = '<div class="lock-callout" style="background:#fdf3df;border-color:#e7c98f;color:#6d4d24">' + icon('clock') + '<span><strong>待核验批次。</strong>' + batchLabel + ' 按“先导入、后核验”策略批量入库；当前只有企业名称、城区与初分方向，联系方式、业务与融资信息尚未核验。</span></div>';
    } else if (isAtlas) {
      callout = '<div class="lock-callout public-callout">' + icon('database') + '<span><strong>公开资料档案。</strong>企业信息来自' + esc(r.source || '公开资料图谱') + '；电话 / 邮箱未在原数据中提供，已标记为待核验，不向访客或会员编造。</span></div>';
    } else if (!member) {
      callout = '<div class="lock-callout">' + icon('lock') + '<span><strong>访客视图。</strong>你看到的是脱敏档案；会员可解锁联系人、融资细节与完整背调信息。</span></div>';
    }

    var primaryAction;
    if (isPending) {
      primaryAction = '<button class="btn btn-ghost" type="button" data-action="pending-info">' + icon('clock') + ' 待核验 · 暂无联系方式</button>';
    } else if (hasC && member) {
      primaryAction = '<button class="btn btn-dark" type="button" data-action="outreach-from-detail" data-type="' + type + '" data-id="' + r.id + '">' + icon('mail') + ' ' + actionLabel + '</button>';
    } else if (!hasC && websiteOf(r)) {
      primaryAction = '<a class="btn btn-dark" href="' + esc(websiteOf(r)) + '" target="_blank" rel="noopener">' + icon('globe') + ' 访问官网</a>';
    } else {
      primaryAction = '<button class="btn btn-lime" type="button" data-action="open-pricing">' + icon('unlock') + ' 解锁完整档案</button>';
    }

    return '<div class="overlay" data-overlay>' +
      '<aside class="drawer" role="dialog" aria-modal="true" aria-label="' + esc(r.name) + ' 档案">' +
        '<div class="drawer-head">' +
          '<button class="drawer-close" type="button" data-action="close-drawer" aria-label="关闭">' + icon('x') + '</button>' +
          '<div class="drawer-kicker">' + cfg.label + ' / ' + r.id.toUpperCase() + '</div>' +
          '<div class="drawer-title-row"><span class="logo-tile drawer-logo" style="--brand:' + r.brand + ';--tint:' + r.tint + '">' + esc(r.logo) + '</span>' +
            '<div class="drawer-title"><h2>' + esc(r.name) + '</h2><p>' + esc(r.city) + ' · ' + (isProject ? esc(r.sector) : isCapital ? esc(r.type) : esc(r.role)) + ' · ' + (isProject ? esc(isPending ? '待核验' : isAtlas ? r.status : r.stage) : isCapital ? esc(r.ticket) : r.years + ' 年经验') + '</p></div></div>' +
          '<div class="drawer-tags">' + tags + '</div>' +
        '</div>' +
        '<div class="drawer-body">' +
          callout +
          '<div class="detail-section"><h4>简介 <span>' + (isPending ? '待核验' : isAtlas ? '公开资料' : r.verified ? '已核验' : '待复核') + '</span></h4><p>' + esc(r.desc) + '</p></div>' +
          '<div class="detail-section"><h4>档案信息 <span>最近更新 ' + esc(r.updated) + '</span></h4><div class="detail-grid">' + details + '</div></div>' +
          extraMetrics +
          highlights +
          '<div class="detail-section"><h4>联系方式 <span>' + (isPending ? '未采集' : isAtlas ? '待核验' : member ? '会员可见' : '已脱敏') + '</span></h4>' + contactHTML + sourceLinks + '</div>' +
          '<div class="drawer-actions">' +
            primaryAction +
            '<button class="btn btn-ghost" type="button" data-action="bookmark" data-type="' + type + '" data-id="' + r.id + '">' + icon('bookmark') + ' ' + ((state.bookmarks[type] || []).indexOf(r.id) >= 0 ? '已收藏' : '收藏') + '</button>' +
          '</div>' +
          '<div class="drawer-source"><span>' + icon('database') + ' 来源：' + esc(r.source) + '</span><span>' + icon('clock') + ' 更新：' + esc(r.updated) + '</span><span class="confidence">' + icon('shield') + ' 可信度 ' + r.confidence + '%</span><span>' + icon(isPending ? 'clock' : isAtlas ? 'database' : 'checkCircle') + (isPending ? ' 待核验' : isAtlas ? ' 公开资料' : r.verified ? ' 已核验' : ' 待复核') + '</span></div>' +
        '</div>' +
      '</aside>' +
    '</div>';
  }

  function detailItem(label, value) {
    return '<div class="detail-item"><span>' + esc(label) + '</span><strong>' + esc(value) + '</strong></div>';
  }

  function contactRow(label, value, copyable, locked) {
    return '<div class="contact-row' + (locked ? ' is-locked' : '') + '"><span class="cr-label">' + esc(label) + '</span><span class="cr-value">' + esc(value) + '</span>' +
      (copyable ? '<button class="copy-btn" type="button" data-action="copy" data-copy="' + esc(value) + '" aria-label="复制' + esc(label) + '">' + icon('copy') + '</button>' : '') +
      (locked ? '<span class="copy-btn">' + icon('lock') + '</span>' : '') +
      '</div>';
  }

  /* ----------------------------------------------------------------------
     Global search
     ---------------------------------------------------------------------- */

  function openSearch() {
    state.searchQuery = '';
    closeMobileMenu();
    openModal(
      '<div class="search-modal">' +
        '<div class="search-input-row">' + icon('search') + '<input id="global-search" type="text" placeholder="搜索项目、机构、人才、城市或赛道…" autocomplete="off" aria-label="全站搜索"><kbd>ESC</kbd></div>' +
        '<div class="search-body" id="search-results">' + searchDefaultHTML() + '</div>' +
        '<div class="search-foot"><span>' + icon('database') + ' 搜索三大库 ' + (PROJECTS.length + CAPITAL.length + TALENTS.length) + ' 条数据</span><span>Enter 打开 · ESC 关闭</span></div>' +
      '</div>', true, true);
    var input = $('#global-search');
    if (input) setTimeout(function () { input.focus(); }, 30);
  }

  function searchDefaultHTML() {
    return '<div class="search-group-label">热门搜索</div>' +
      '<div class="search-hot">' + ['具身智能', '杭州', '大模型', '天使轮', 'AI Infra', '深圳', '医疗 AI', '合伙人'].map(function (t) {
        return '<button type="button" data-action="search-hot" data-q="' + esc(t) + '">' + esc(t) + '</button>';
      }).join('') + '</div>' +
      '<div class="search-group-label">最近收录</div>' +
      [PROJECTS[1], CAPITAL[17], TALENTS[2]].map(function (r, i) {
        var type = i === 0 ? 'projects' : i === 1 ? 'capital' : 'talents';
        return searchResultHTML(type, r);
      }).join('');
  }

  function searchResultHTML(type, r) {
    var sub = type === 'projects'
      ? (r.pending ? r.city + ' · ' + r.district + ' · ' + r.sector + ' · 待核验' : isAtlasRecord(r) ? r.city + ' · ' + r.district + ' · ' + r.sector + ' · ' + r.status : r.city + ' · ' + r.sector + ' · ' + r.stage)
      : type === 'capital' ? r.city + ' · ' + r.type + ' · ' + r.ticket
        : r.city + ' · ' + r.role + ' · ' + r.years + ' 年';
    return '<button class="search-result" type="button" data-action="search-open" data-type="' + type + '" data-id="' + r.id + '">' +
      '<span class="logo-tile sr-logo" style="--brand:' + r.brand + ';--tint:' + r.tint + '">' + esc(r.logo) + '</span>' +
      '<span class="sr-text"><strong>' + esc(type === 'talents' && !isMember() ? maskName(r.name) : r.name) + '</strong><span>' + esc(sub) + '</span></span>' +
      '<span class="sr-type">' + DB[type].label + '</span></button>';
  }

  function renderSearchResults(q) {
    state.searchQuery = q;
    var box = $('#search-results');
    if (!box) return;
    q = q.trim().toLowerCase();
    if (!q) {
      box.innerHTML = searchDefaultHTML();
      return;
    }
    var groups = [];
    ['projects', 'capital', 'talents'].forEach(function (type) {
      var rows = D[type].filter(function (r) {
        var hay = [r.name, r.city, r.district, r.status, r.desc, r.tagline, r.sector, r.role, r.type, r.current, r.keywords, (r.skills || []).join(' '), (r.focus || []).join(' ')].join(' ').toLowerCase();
        return hay.indexOf(q) >= 0;
      }).slice(0, 5);
      if (rows.length) {
        groups.push('<div class="search-group-label">' + DB[type].label + ' · ' + rows.length + '</div>' + rows.map(function (r) { return searchResultHTML(type, r); }).join(''));
      }
    });
    box.innerHTML = groups.length ? groups.join('') : '<div class="search-empty"><strong>没有找到「' + esc(q) + '」</strong><p>试试城市、赛道或机构类型，例如「深圳」「具身智能」「CVC」。</p></div>';
  }

  /* ----------------------------------------------------------------------
     Modal primitives
     ---------------------------------------------------------------------- */

  function openModal(html, wide, bare) {
    closeDrawer();
    closeUserMenu();
    var root = $('#modal-root');
    var inner = bare ? html : '<div class="modal-card' + (wide ? ' modal-wide' : '') + '" role="dialog" aria-modal="true">' + html + '</div>';
    root.innerHTML = '<div class="modal-overlay" data-modal-overlay>' + inner + '</div>';
    document.body.classList.add('no-scroll');
    var closeBtn = $('.modal-card .modal-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    var root = $('#modal-root');
    if (root) root.innerHTML = '';
    syncScrollLock();
  }

  function syncScrollLock() {
    var hasDrawer = $('#drawer-root') && $('#drawer-root').innerHTML.trim() !== '';
    var hasModal = $('#modal-root') && $('#modal-root').innerHTML.trim() !== '';
    document.body.classList.toggle('no-scroll', hasDrawer || hasModal);
  }

  function modalCloseButton() {
    return '<button class="modal-close" type="button" data-action="close-modal" aria-label="关闭">' + icon('x') + '</button>';
  }

  /* ----------------------------------------------------------------------
     Auth / checkout / plans
     ---------------------------------------------------------------------- */

  function openAuth(mode, plan) {
    state.authMode = mode || 'login';
    state.pendingPlan = plan || null;
    openModal(authModalHTML());
  }

  function authModalHTML() {
    var login = state.authMode !== 'register';
    return '<div class="modal-head"><div><h3>' + (login ? '欢迎回到 AILink' : '创建你的 AILink 账号') + '</h3><p>' + (login ? '登录后继续浏览三大库与邮件引擎。' : '注册即获得访客权限，可随时升级会员。') + '</p></div>' + modalCloseButton() + '</div>' +
      '<div class="auth-tabs"><button type="button" class="' + (login ? 'is-active' : '') + '" data-action="auth-tab" data-mode="login">登录</button><button type="button" class="' + (!login ? 'is-active' : '') + '" data-action="auth-tab" data-mode="register">注册</button></div>' +
      '<form class="auth-form" id="auth-form" novalidate>' +
        (login ? '' : '<div class="form-field"><label>你的称呼</label><input type="text" name="name" placeholder="例如：林知夏" autocomplete="name"></div>') +
        '<div class="form-field"><label>工作邮箱</label><input type="email" name="email" placeholder="you@company.com" autocomplete="email" required></div>' +
        '<div class="form-field"><label>密码</label><input type="password" name="password" placeholder="至少 6 位" autocomplete="' + (login ? 'current-password' : 'new-password') + '" required></div>' +
        '<div class="form-error" id="auth-error" hidden></div>' +
        '<button class="btn btn-dark btn-block" type="submit">' + (login ? '登录' : '创建账号') + '</button>' +
      '</form>' +
      '<div class="auth-divider">或使用演示身份</div>' +
      '<div class="auth-demo"><p>演示环境：密码不会上传，仅保存在浏览器状态中。会员账号含 500 封额度（已用 186 封）与两条活动记录。</p>' +
        '<div class="demo-actions"><button type="button" data-action="demo-login" data-plan="pro">以会员身份体验</button><button type="button" data-action="demo-login" data-plan="free">以访客身份浏览</button></div>' +
      '</div>' +
      '<p class="fineprint">继续即表示同意《会员服务条款》与《隐私政策》。演示站点不发送真实邮件，也不产生真实扣款。</p>';
  }

  function submitAuth(form) {
    var data = new FormData(form);
    var email = String(data.get('email') || '').trim().toLowerCase();
    var password = String(data.get('password') || '');
    var name = String(data.get('name') || '').trim();
    var error = $('#auth-error');
    var showError = function (msg) {
      if (error) { error.textContent = msg; error.hidden = false; }
    };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError('请输入有效的工作邮箱。');
    if (password.length < 6) return showError('密码至少需要 6 位。');
    if (state.authMode === 'register' && !name) return showError('请填写你的称呼。');
    signIn(email, name, state.authMode === 'register');
  }

  function signIn(email, name, isRegister) {
    var profiles = state.profiles || {};
    var user = profiles[email];

    if (!user) {
      if (email === 'demo@ailink.cn') {
        user = { name: '林知夏', email: email, plan: 'pro', credits: 314, quotaBase: 500, joined: '2026.09.18', company: 'AILink 内测会员' };
      } else if (email === 'guest@ailink.cn') {
        user = { name: '访客体验', email: email, plan: 'free', credits: 0, quotaBase: 0, joined: formatDate(), company: '' };
      } else {
        user = {
          name: name || email.split('@')[0].replace(/[._-]/g, ' '),
          email: email,
          plan: 'free',
          credits: 0,
          quotaBase: 0,
          joined: formatDate(),
          company: ''
        };
      }
    } else if (isRegister && name) {
      user.name = name;
    }

    state.user = user;
    state.profiles[email] = user;
    saveUser();
    seedDemoCampaigns();
    closeModal();
    var pending = state.pendingPlan;
    state.pendingPlan = null;
    toast('欢迎，' + user.name + (user.plan === 'pro' ? ' · 专业会员已生效' : ''));
    renderHeaderAuth();
    renderRoute({ scroll: false, clearOverlays: false });
    if (pending) setTimeout(function () { openCheckout(pending); }, 220);
  }

  function seedDemoCampaigns() {
    if (!state.user || state.user.email !== 'demo@ailink.cn') return;
    var has = state.campaigns.some(function (c) { return c.owner === 'demo@ailink.cn'; });
    if (has) return;
    state.campaigns.unshift(
      { id: 'cmp-demo-1', owner: 'demo@ailink.cn', name: '杭州具身智能 · 闭门融资对接', subject: '邀请 {{company}} 参加杭州闭门资本对接', type: 'projects', audience: '杭州 · 具身智能', sent: 96, opened: 58, clicked: 19, replied: 7, date: '2026.10.30', status: '已完成' },
      { id: 'cmp-demo-2', owner: 'demo@ailink.cn', name: '深圳 AI Infra 人才邀约', subject: '一个可能适合你的 AI Infra 机会', type: 'talents', audience: '深圳 · AI Infra', sent: 90, opened: 51, clicked: 12, replied: 4, date: '2026.10.22', status: '已完成' }
    );
    writeJSON(LS.campaigns, state.campaigns);
  }

  function logout() {
    state.user = null;
    try { localStorage.removeItem(LS.user); } catch (e) { /* noop */ }
    closeUserMenu();
    renderHeaderAuth();
    renderRoute({ scroll: false });
    toast('已退出登录');
  }

  function openCheckout(planKey) {
    var plan = PLANS[planKey];
    if (!plan || planKey === 'free') return;
    if (!state.user) {
      openAuth('login', planKey);
      return;
    }
    var yearly = state.billing === 'yearly';
    var amount = plan.price * (yearly ? 10 : 1);
    openModal(
      '<div class="modal-head"><div><h3>开通' + esc(plan.name) + '</h3><p>' + (yearly ? '按年支付，赠送 2 个月。' : '按月支付，随时可取消。') + '</p></div>' + modalCloseButton() + '</div>' +
      '<div style="margin-top:16px">' +
        '<div class="checkout-line"><span>会员方案</span><strong>' + esc(plan.name) + '</strong></div>' +
        '<div class="checkout-line"><span>计费周期</span><strong>' + (yearly ? '12 个月' : '1 个月') + '</strong></div>' +
        '<div class="checkout-line"><span>邮件额度</span><strong>' + plan.credits.toLocaleString('zh-CN') + ' 封 / 月</strong></div>' +
        '<div class="checkout-line"><span>数据导出</span><strong>' + plan.exportLimit + ' 条 / 月</strong></div>' +
        '<div class="checkout-line"><span>席位</span><strong>' + plan.seats + ' 个</strong></div>' +
      '</div>' +
      '<div class="checkout-total"><span>应付金额</span><strong>¥' + amount.toLocaleString('zh-CN') + '<small> / ' + (yearly ? '年' : '月') + '</small></strong></div>' +
      '<div class="pay-methods"><button type="button" class="pay-method is-active">微信支付</button><button type="button" class="pay-method">支付宝</button><button type="button" class="pay-method">对公转账</button></div>' +
      '<div class="qr-box"></div>' +
      '<p class="qr-hint">演示二维码 · 点击下方按钮模拟支付成功</p>' +
      '<button class="btn btn-dark btn-block" type="button" data-action="confirm-payment" data-plan="' + planKey + '" style="margin-top:12px">模拟支付 ¥' + amount.toLocaleString('zh-CN') + '</button>' +
      '<p class="fineprint">演示环境不会产生真实扣款。正式上线需接入微信支付 / 支付宝 / 对公转账，并在服务端校验订单与开通权益。</p>'
    );
  }

  function confirmPayment(planKey) {
    var plan = PLANS[planKey];
    if (!plan || !state.user) return;
    var base = plan.credits;
    state.user.plan = planKey;
    state.user.credits = (state.user.credits || 0) + base;
    state.user.quotaBase = base;
    state.user.planSince = formatDate();
    saveUser();
    closeModal();
    renderHeaderAuth();
    renderRoute({ scroll: false, clearOverlays: false });
    toast(plan.name + '已开通，已到账 ' + base.toLocaleString('zh-CN') + ' 封邮件额度');
  }

  function openTopup(volume, price) {
    if (!state.user) { openAuth('login'); return; }
    if (!isMember()) {
      toast('请先开通专业会员，再购买邮件加油包');
      navigate('pricing');
      return;
    }
    var qty = Number(volume) || 500;
    var amount = Number(price) || Math.round(qty * 0.6);
    openModal(
      '<div class="modal-head"><div><h3>购买邮件额度</h3><p>额度即时到账，当前周期内有效。</p></div>' + modalCloseButton() + '</div>' +
      '<div style="margin-top:16px"><div class="checkout-line"><span>加油包</span><strong>' + qty.toLocaleString('zh-CN') + ' 封</strong></div>' +
      '<div class="checkout-line"><span>单价</span><strong>¥' + (amount / qty).toFixed(2) + ' / 封</strong></div></div>' +
      '<div class="checkout-total"><span>应付金额</span><strong>¥' + amount.toLocaleString('zh-CN') + '</strong></div>' +
      '<div class="pay-methods"><button type="button" class="pay-method is-active">微信支付</button><button type="button" class="pay-method">支付宝</button><button type="button" class="pay-method">对公转账</button></div>' +
      '<button class="btn btn-dark btn-block" type="button" data-action="confirm-topup" data-qty="' + qty + '" data-price="' + amount + '" style="margin-top:14px">模拟支付 ¥' + amount.toLocaleString('zh-CN') + '</button>' +
      '<p class="fineprint">演示环境：支付成功后额度写入本地会员状态，不产生真实扣款。</p>'
    );
  }

  function confirmTopup(qty, price) {
    if (!state.user) return;
    state.user.credits = (state.user.credits || 0) + qty;
    state.user.quotaBase = (state.user.quotaBase || planOf(state.user).credits || 0) + qty;
    saveUser();
    closeModal();
    renderHeaderAuth();
    renderRoute({ scroll: false, clearOverlays: false });
    toast('已到账 ' + qty.toLocaleString('zh-CN') + ' 封邮件额度');
  }

  function openPricing() {
    closeDrawer();
    closeModal();
    navigate('pricing');
  }

  /* ----------------------------------------------------------------------
     Pricing
     ---------------------------------------------------------------------- */

  function pricingPage() {
    var yearly = state.billing === 'yearly';
    return '' +
      '<section class="page-hero dark">' +
        '<div class="container">' +
          '<div class="pricing-top">' +
            '<div><div class="eyebrow light">MEMBERSHIP</div><h1>一张会员，<br>打通三个库。</h1><p class="lead">会员解锁完整档案与核验联系方式；邮件额度按发送量计费，用多少买多少，不绑年框。</p></div>' +
            '<div class="billing-toggle"><button type="button" class="' + (!yearly ? 'is-active' : '') + '" data-action="billing" data-mode="monthly">按月</button><button type="button" class="' + (yearly ? 'is-active' : '') + '" data-action="billing" data-mode="yearly">按年 <span class="save">省 2 个月</span></button></div>' +
          '</div>' +
        '</div>' +
      '</section>' +
      '<section style="padding:34px 0 68px">' +
        '<div class="container">' +
          '<div class="pricing-grid">' + priceCard('free') + priceCard('pro') + priceCard('team') + '</div>' +
          '<div class="enterprise-band">' +
            '<div><span class="tag green">INSTITUTIONAL</span><strong>机构版 / 数据合作</strong><p>定制字段与数据接入、API、CRM 双向同步、10,000+ 封 / 月与专属合规支持。</p></div>' +
            '<button class="btn btn-ghost btn-sm" type="button" data-action="open-contact">联系我们 ' + icon('arrow') + '</button>' +
          '</div>' +
          '<div class="pricing-note">' + icon('shield') + ' 所有方案均含来源记录、退订机制与数据合规条款 · 机构版与 API 合作请 <button type="button" class="btn-text" style="font-size:9.5px;text-decoration:underline;text-underline-offset:2px" data-action="open-contact">联系我们</button></div>' +
          '<div class="compare-section">' +
            '<h2>权益对比</h2>' +
            '<div class="compare-wrap"><table class="compare-table"><thead><tr><th>权益</th><th>访客版</th><th class="featured-col">专业会员</th><th>团队会员</th></tr></thead><tbody>' +
              compareRow('浏览三大库摘要', true, true, true) +
              compareRow('完整档案与核验联系方式', false, true, true) +
              compareRow('CSV 导出', '0 条', '200 条 / 月', '1,000 条 / 月') +
              compareRow('AI 邮件额度', '0 封', '500 封 / 月', '2,500 封 / 月') +
              compareRow('AI 起草与模板库', false, true, true) +
              compareRow('发送报告与回复追踪', false, true, true) +
              compareRow('团队席位', '1', '1', '5') +
              compareRow('专属顾问 / 对公合同', false, false, true) +
            '</tbody></table></div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="email-packs section" id="email-packs">' +
        '<div class="container">' +
          '<div class="section-head">' +
            '<div><div class="eyebrow">EMAIL CREDITS</div><h2>邮件额度，按发送量计费。</h2><p>会员方案内已含月度额度；超出后按阶梯单价加购，量越大单价越低。演示环境不会真正发信。</p></div>' +
            '<a class="btn-text" href="#/outreach">去邮件引擎 ' + icon('arrowUp') + '</a>' +
          '</div>' +
          '<div class="pack-calculator">' +
            '<div>' +
              '<div class="calc-label">预计每月发送量 <span id="calc-qty">5,000 封</span></div>' +
              '<input class="range-input" id="email-volume" type="range" min="500" max="20000" step="500" value="5000" aria-label="邮件发送量">' +
              '<div class="range-scale"><span>500 封</span><span>5,000 封</span><span>20,000 封</span></div>' +
              '<div class="pack-grid">' + PACKS.map(function (p) {
                return '<button class="pack-card" type="button" data-action="topup" data-qty="' + p.qty + '" data-price="' + p.price + '"><strong>' + p.qty.toLocaleString('zh-CN') + '</strong><span>封邮件</span><em>¥' + p.price.toLocaleString('zh-CN') + '</em></button>';
              }).join('') + '</div>' +
              '<p class="template-note">阶梯单价：500 封 ¥0.60 / 封 · 2,000 封 ¥0.50 / 封 · 5,000 封 ¥0.40 / 封 · 20,000 封 ¥0.30 / 封。额度当周期有效，不跨月结转。</p>' +
            '</div>' +
            '<div class="calc-price-box">' +
              '<div class="calc-eyebrow">ESTIMATED COST</div>' +
              '<strong id="calc-price">¥1,999<small>/ 月</small></strong>' +
              '<div class="calc-meta"><div>单价<b id="calc-unit">¥0.40 / 封</b></div><div>对比 500 封档<b id="calc-saving">省 ¥1,001</b></div></div>' +
              '<button class="btn btn-lime btn-block" type="button" id="calc-buy" data-action="buy-calc">购买这份额度</button>' +
              '<p class="fineprint" style="color:rgba(246,242,233,.32);border-color:rgba(246,242,233,.12)">额度仅用于 AILink 平台内合规触达；不含第三方邮件服务商的超额费用。</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="faq-section">' +
        '<div class="container">' +
          '<div style="text-align:center"><div class="eyebrow" style="justify-content:center">FAQ</div><h2 style="margin-top:12px;font-family:var(--serif);font-size:clamp(28px,3vw,38px);font-weight:600">关于会员与邮件额度</h2></div>' +
          '<div class="faq-list">' +
            faqItem('会员可以看到哪些信息？', '专业会员及以上可以查看项目、机构、人才三类档案的完整字段：联系人、职位、电话、邮箱、微信、融资细节、投资偏好、求职意向与核验记录。访客只能看到摘要与脱敏字段。') +
            faqItem('邮件额度如何计算？', '每成功加入发送队列 1 位收件人计 1 封。专业会员每月含 500 封，团队会员含 2,500 封；超出后按阶梯单价购买加油包。退信、重复地址与退订用户不计费。') +
            faqItem('数据来自哪里？', '演示站点使用虚构样本。正式数据采用“公开工商与官网 + 授权数据服务商 + 园区/协会合作 + 会员主动登记”四条轨道，并记录来源、授权方式与最近核验时间。详见数据方法页。') +
            faqItem('可以开发票吗？', '团队会员与机构版支持对公转账与增值税普通发票 / 专用发票。演示环境暂不产生真实订单。') +
            faqItem('年付如何优惠？', '按年支付为 10 个月价格，相当于赠送 2 个月。专业会员年付 ¥3,990，团队会员年付 ¥12,990。') +
            faqItem('如何保证邮件合规？', '平台默认开启退订链接、发送频率上限与来源记录；仅向有合法来源与联系依据的对象发送。会员需签署使用条款，禁止购买来源不明的个人数据。') +
          '</div>' +
        '</div>' +
      '</section>';
  }

  function compareRow(label, free, pro, team) {
    function cell(v) {
      if (v === true) return icon('check');
      if (v === false) return '<span class="no">—</span>';
      return esc(v);
    }
    return '<tr><td>' + esc(label) + '</td><td>' + cell(free) + '</td><td class="featured-col">' + cell(pro) + '</td><td>' + cell(team) + '</td></tr>';
  }

  function faqItem(q, a) {
    return '<details class="faq-item"><summary>' + esc(q) + '<span class="faq-plus">+</span></summary><p>' + esc(a) + '</p></details>';
  }

  function priceCard(key) {
    var p = PLANS[key];
    var yearly = state.billing === 'yearly';
    var amount = p.price * (yearly ? 10 : 1);
    var featured = key === 'pro';
    var isCurrent = state.user && state.user.plan === key;
    var cta = '';
    if (key === 'free') {
      cta = isCurrent
        ? '<button class="btn btn-ghost btn-block" type="button" disabled>当前方案</button>'
        : '<button class="btn btn-ghost btn-block" type="button" data-action="' + (state.user ? 'stay-free' : 'open-auth') + '">' + (state.user ? '继续浏览' : '免费开始') + '</button>';
    } else {
      cta = isCurrent
        ? '<button class="btn ' + (featured ? 'btn-lime' : 'btn-ghost') + ' btn-block" type="button" data-action="topup" data-qty="500" data-price="299">当前方案 · 加购额度</button>'
        : '<button class="btn ' + (featured ? 'btn-lime' : 'btn-dark') + ' btn-block" type="button" data-action="choose-plan" data-plan="' + key + '">' + (isMember() ? '切换 / 续费' : '开通' + p.name) + '</button>';
    }

    return '<article class="price-card' + (featured ? ' featured' : '') + '">' +
      (featured ? '<span class="price-badge">MOST POPULAR</span>' : '') +
      '<div class="price-name"><h3>' + p.name + '</h3><span>' + p.en + '</span></div>' +
      '<p class="price-desc">' + p.desc + '</p>' +
      '<div class="price-amount"><strong>' + (p.price === 0 ? '免费' : '¥' + amount.toLocaleString('zh-CN')) + '</strong><small>' + (p.price === 0 ? '' : yearly ? '/ 年' : '/ 月') + '</small></div>' +
      '<div class="price-billed">' + (p.price === 0 ? '无需信用卡' : yearly ? '折合 ¥' + p.price + ' / 月 · 省 ¥' + (p.price * 2).toLocaleString('zh-CN') : '按月付费 · 可随时取消') + '</div>' +
      '<ul class="plan-features">' + p.features.map(function (f) {
        var muted = key === 'free' && /不含/.test(f);
        return '<li' + (muted ? ' class="muted"' : '') + '>' + icon(muted ? 'x' : 'check') + '<span>' + esc(f) + '</span></li>';
      }).join('') + '</ul>' +
      cta +
    '</article>';
  }

  function calcPrice(volume) {
    var v = Number(volume) || 500;
    if (v <= 500) return { price: 299, unit: 0.598, saving: 1 };
    var rate = v <= 2000 ? 0.5 : v <= 5000 ? 0.4 : 0.3;
    return { price: Math.round(v * rate), unit: rate, saving: Math.max(0, Math.round(v * 0.6 - v * rate)) };
  }

  function updateCalc() {
    var slider = $('#email-volume');
    if (!slider) return;
    var v = Number(slider.value);
    var result = calcPrice(v);
    var qty = $('#calc-qty');
    var price = $('#calc-price');
    var unit = $('#calc-unit');
    var saving = $('#calc-saving');
    var buy = $('#calc-buy');
    if (qty) qty.textContent = v.toLocaleString('zh-CN') + ' 封';
    if (price) price.innerHTML = '¥' + result.price.toLocaleString('zh-CN') + '<small>/ 月</small>';
    if (unit) unit.textContent = '¥' + result.unit.toFixed(2) + ' / 封';
    if (saving) saving.textContent = result.saving > 0 ? '省 ¥' + result.saving.toLocaleString('zh-CN') : '基准价';
    if (buy) {
      buy.setAttribute('data-qty', result.price > 0 ? String(v) : '500');
      buy.setAttribute('data-price', String(result.price));
    }
  }

  function buyCalcPack() {
    var slider = $('#email-volume');
    var v = slider ? Number(slider.value) : 5000;
    var result = calcPrice(v);
    openTopup(v, result.price);
  }

  /* ----------------------------------------------------------------------
     Outreach
     ---------------------------------------------------------------------- */

  function outreachPage() {
    var gate = !isMember();
    var hero = '<section class="page-hero dark"><div class="container page-hero-grid">' +
      '<div><div class="eyebrow light">AI OUTREACH ENGINE</div>' +
      '<h1>把对的邮件，<br>发给对的人。</h1>' +
      '<p class="lead">从三大库选人，AI 按赛道与阶段起草，按发送量计费。打开、点击、回复都有记录；退订与频控默认开启。</p></div>' +
      '<div class="hero-kpis">' +
        '<div class="hero-kpi"><strong>' + (PROJECTS.length + CAPITAL.length + TALENTS.length) + '</strong><span>可筛选对象</span></div>' +
        '<div class="hero-kpi"><strong>61%</strong><span>近期平均打开率</span></div>' +
        '<div class="hero-kpi"><strong>¥0.30</strong><span>最低单封成本</span></div>' +
      '</div>' +
      '</div></section>';

    if (gate) {
      return hero + '<div class="container" style="padding:34px 0 80px">' + outreachGateHTML() + '</div>';
    }

    var tab = ['compose', 'campaigns', 'templates'].indexOf(state.outreachTab) >= 0 ? state.outreachTab : 'compose';
    var campaigns = userCampaigns();

    return hero +
      '<div class="container outreach-shell">' +
        '<div class="outreach-main">' +
          '<div class="tabbar">' +
            '<button type="button" class="' + (tab === 'compose' ? 'is-active' : '') + '" data-action="outreach-tab" data-tab="compose">新建活动</button>' +
            '<button type="button" class="' + (tab === 'campaigns' ? 'is-active' : '') + '" data-action="outreach-tab" data-tab="campaigns">活动记录 <span class="tab-count">' + campaigns.length + '</span></button>' +
            '<button type="button" class="' + (tab === 'templates' ? 'is-active' : '') + '" data-action="outreach-tab" data-tab="templates">模板库 <span class="tab-count">' + TEMPLATES.length + '</span></button>' +
          '</div>' +
          '<div id="outreach-panel">' + outreachPanelHTML(tab) + '</div>' +
        '</div>' +
        '<aside>' + quotaCardHTML() + complianceSideCard() + billingSideCard() + '</aside>' +
      '</div>';
  }

  function outreachGateHTML() {
    var logged = isLoggedIn();
    var msg = !logged ? '你还没有登录，登录后可查看当前会员权益。' : '你当前是访客版，升级专业会员即可解锁三大库联系方式与每月 500 封邮件额度。';
    return '<div class="outreach-gate">' +
      '<div><div class="eyebrow">MEMBERS ONLY</div><h2>邮件引擎只对会员开放。</h2><p>' + msg + '</p>' +
        '<div class="gate-features">' +
          '<div class="gate-feature"><strong>AI 个性化起草</strong><span>把公司、联系人、赛道自动写进正文。</span></div>' +
          '<div class="gate-feature"><strong>三大库精准筛选</strong><span>按区域、阶段、方向组合人群。</span></div>' +
          '<div class="gate-feature"><strong>按量计费</strong><span>会员含额度，加油包 500 封起。</span></div>' +
          '<div class="gate-feature"><strong>合规频控</strong><span>退订、上限与来源记录默认开启。</span></div>' +
        '</div>' +
        '<div class="gate-actions">' +
          (logged ? '<button class="btn btn-dark" type="button" data-action="choose-plan" data-plan="pro">升级专业会员 ' + icon('arrow') + '</button>' : '<button class="btn btn-dark" type="button" data-action="open-auth">登录 / 注册 ' + icon('arrow') + '</button>') +
          '<a class="btn btn-ghost" href="#/pricing">查看权益</a>' +
        '</div>' +
      '</div>' +
      '<div class="gate-visual"><div class="gv-line w-40"></div><div class="gv-line w-90"></div><div class="gv-line w-80"></div><div class="gv-line w-60"></div><div class="gv-lock">' + icon('lock') + '</div><div class="gv-line w-80"></div><div class="gv-line w-60"></div><div class="gv-line w-40"></div></div>' +
    '</div>';
  }

  function userCampaigns() {
    if (!state.user) return [];
    return state.campaigns.filter(function (c) { return c.owner === state.user.email; });
  }

  function quotaCardHTML() {
    var p = planOf(state.user);
    var credits = state.user.credits || 0;
    var base = state.user.quotaBase || p.credits || 1;
    var pct = Math.max(0, Math.min(100, (credits / base) * 100));
    return '<div class="quota-card">' +
      '<div class="quota-top"><span>MAIL CREDITS</span><span>' + esc(p.name) + '</span></div>' +
      '<div class="quota-number" id="quota-number">' + credits.toLocaleString('zh-CN') + '<small>封</small></div>' +
      '<p class="quota-sub" id="quota-sub">当前周期剩余 · 已含 ' + base.toLocaleString('zh-CN') + ' 封</p>' +
      '<div class="quota-bar"><div class="quota-fill" style="width:' + pct + '%"></div></div>' +
      '<div class="quota-actions"><button class="btn btn-lime" type="button" data-action="topup" data-qty="500" data-price="299">+ 500 封</button><a class="btn btn-ghost-light" href="#/pricing#email-packs">计费规则</a></div>' +
    '</div>';
  }

  function complianceSideCard() {
    return '<div class="side-card"><h4>' + icon('shield') + ' 发送合规</h4><p>发送前请确认你与收件人存在合法联系依据。平台默认：</p><ul class="side-list">' +
      '<li>' + icon('check') + '<span>自动附退订链接</span></li>' +
      '<li>' + icon('check') + '<span>每位收件人 30 天内最多 2 封</span></li>' +
      '<li>' + icon('check') + '<span>退信与退订地址自动排除</span></li>' +
      '<li>' + icon('check') + '<span>记录来源、发送人与时间</span></li>' +
    '</ul></div>';
  }

  function billingSideCard() {
    return '<div class="side-card"><h4>' + icon('zap') + ' 按量计费</h4><p>专业会员含 500 封 / 月，团队会员含 2,500 封 / 月。超出部分按阶梯单价加购：500 封 ¥299 起。</p><div class="side-cta"><span>单价低至 ¥0.30 / 封</span><a href="#/pricing#email-packs">查看加油包 →</a></div></div>';
  }

  function outreachPanelHTML(tab) {
    if (tab === 'campaigns') return campaignsPanelHTML();
    if (tab === 'templates') return templatesPanelHTML();
    return composerPanelHTML();
  }

  function defaultAudience() {
    return { type: 'projects', region: '全部', city: '全部', q: '' };
  }

  function composerDraft() {
    if (!state.composeDraft) {
      state.composeDraft = {
        name: '',
        subject: TEMPLATES[0].subject,
        body: TEMPLATES[0].body,
        audience: defaultAudience()
      };
    }
    if (!state.composeDraft.audience) state.composeDraft.audience = defaultAudience();
    return state.composeDraft;
  }

  function audienceRecords(aud) {
    var rows = D[aud.type] || [];
    var q = String(aud.q || '').trim().toLowerCase();
    return rows.filter(function (r) {
      if (aud.region && aud.region !== '全部' && r.region !== aud.region) return false;
      if (aud.city && aud.city !== '全部' && r.city !== aud.city) return false;
      if (q) {
        var hay = [r.name, r.city, r.desc, r.sector, r.role, r.type, r.current, r.contact && r.contact.name].join(' ').toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return !!(r.contact && r.contact.email);
    });
  }

  function audienceCities(type) {
    return ['全部'].concat(unique((D[type] || []).map(function (r) { return r.city; })));
  }

  function composerPanelHTML() {
    var d = composerDraft();
    var aud = d.audience;
    var rows = audienceRecords(aud);
    var first = rows[0] || null;
    var typeLabel = aud.type === 'projects' ? '项目方' : aud.type === 'capital' ? '资金方' : '人才';
    var previewSubject = first ? mergeText(d.subject, first, aud.type) : d.subject;
    var previewBody = first ? mergeText(d.body, first, aud.type) : d.body;

    return '<div class="composer-card">' +
      '<div class="composer-head"><div><h3>新建邮件活动</h3><p>选择人群 → AI 起草 → 预览 → 加入发送队列</p></div><span class="tag green">' + icon('sparkles') + ' AI 起草已开启</span></div>' +
      '<div class="composer-grid">' +
        '<form id="compose-form" novalidate>' +
          '<div class="form-field"><label>活动名称 <span class="optional">仅自己可见</span></label><input type="text" id="compose-name" placeholder="例如：杭州具身智能 · 11 月融资对接" value="' + esc(d.name) + '"></div>' +
          '<div class="segment-box">' +
            '<div class="segment-top"><span>收件人范围</span><span id="audience-count">' + rows.length + ' 位匹配</span></div>' +
            '<div class="segment-selects">' +
              '<select data-audience="type" aria-label="人群类型"><option value="projects"' + (aud.type === 'projects' ? ' selected' : '') + '>项目方</option><option value="capital"' + (aud.type === 'capital' ? ' selected' : '') + '>资金方</option><option value="talents"' + (aud.type === 'talents' ? ' selected' : '') + '>人才</option></select>' +
              '<select data-audience="region" aria-label="区域"><option value="全部">全部区域</option>' + ['华东', '华南', '华北', '西南'].map(function (r) {
                return '<option value="' + r + '"' + (aud.region === r ? ' selected' : '') + '>' + r + '</option>';
              }).join('') + '</select>' +
              '<select data-audience="city" aria-label="城市"><option value="全部">全部城市</option>' + audienceCities(aud.type).slice(1).map(function (c) {
                return '<option value="' + esc(c) + '"' + (aud.city === c ? ' selected' : '') + '>' + esc(c) + '</option>';
              }).join('') + '</select>' +
            '</div>' +
            '<input class="segment-search" type="text" data-audience="q" value="' + esc(aud.q || '') + '" placeholder="用关键词缩小范围，例如：具身智能 / 杭州 / 合伙人">' +
            '<div class="recipient-preview" id="recipient-preview">' + recipientPreviewHTML(rows) + '</div>' +
          '</div>' +
          '<div class="form-field"><label>快速模板</label><div class="template-chips">' + TEMPLATES.map(function (t) {
            return '<button class="template-chip" type="button" data-action="use-template" data-id="' + t.id + '">' + esc(t.name) + '</button>';
          }).join('') + '</div></div>' +
          '<div class="ai-box">' +
            '<div class="ai-head"><span>' + icon('sparkles') + ' AI 起草</span><em>基于当前人群与目标生成，不调用外部模型</em></div>' +
            '<div class="ai-prompt-row"><input type="text" id="ai-prompt" placeholder="例如：邀请杭州具身智能企业参加 12 月闭门融资对接会"><select id="ai-tone" aria-label="语气"><option value="专业">专业</option><option value="简洁">简洁</option><option value="热情">热情</option></select><button type="button" data-action="ai-generate">生成</button></div>' +
          '</div>' +
          '<div class="form-field"><label>邮件主题</label><input type="text" id="compose-subject" value="' + esc(d.subject) + '" placeholder="用 {{company}} 插入变量"></div>' +
          '<div class="form-field"><label>正文 <span class="optional">支持 {{name}} {{company}} {{city}} {{sector}}</span></label><textarea id="compose-body" rows="9">' + esc(d.body) + '</textarea></div>' +
          '<div class="composer-actions"><div class="send-cost"><strong id="send-count">' + rows.length + '</strong> 位收件人 · 消耗 ' + rows.length + ' 额度 <span class="quota-left">剩余 ' + ((state.user.credits || 0)) + ' 封</span></div><button class="btn btn-dark" type="button" data-action="send-campaign">' + icon('send') + ' 加入发送队列</button></div>' +
          '<p class="form-hint" style="margin-top:8px">演示环境：不会真正发信。正式环境将由服务端队列按频控与退订名单发送。</p>' +
        '</form>' +
        '<div class="preview-pane">' +
          '<div class="preview-label"><span>' + icon('mail') + ' 实时预览</span><span id="preview-to">收件人：' + (first ? esc(displayTargetName(first, aud.type)) : '暂无匹配') + '</span></div>' +
          '<div class="email-preview">' +
            '<div class="preview-head"><div class="ph-from"><b>AILink 智链</b><span>&lt;hello@example.com&gt;</span></div><h4 id="preview-subject">' + esc(previewSubject) + '</h4></div>' +
            '<div class="preview-body" id="preview-body">' + esc(previewBody) + '</div>' +
            '<div class="preview-foot"><span>退订链接 · 发送频控已启用</span><span>变量已按收件人替换</span></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function displayTargetName(record, type) {
    if (!record) return '—';
    if (type === 'talents') return record.name + ' · ' + record.role;
    return (contactOf(record).name || '联系人') + ' · ' + record.name;
  }

  function recipientPreviewHTML(rows) {
    if (!rows.length) return '没有符合条件的收件人，请放宽筛选。';
    return rows.slice(0, 4).map(function (r) { return '<span class="mini-face">' + esc(initials(contactOf(r).name)) + '</span>'; }).join('') +
      '<span>已选 ' + rows.length + ' 位 · ' + esc(rows.slice(0, 3).map(function (r) { return contactOf(r).name; }).join('、')) + (rows.length > 3 ? ' 等' : '') + '</span>';
  }

  function mergeText(text, record, type) {
    if (!text) return '';
    if (!record) return text;
    var sector = type === 'projects' ? record.sector : type === 'capital' ? (record.focus && record.focus[0]) : record.role;
    var stage = type === 'projects' ? record.stage : type === 'capital' ? '成长期' : '早期';
    var company = type === 'talents' ? record.current : record.name;
    var name = type === 'talents' ? record.name : contactOf(record).name;
    var map = {
      name: name || '',
      company: company || '',
      city: record.city || '',
      sector: sector || '',
      stage: stage || '',
      sender: currentUserName()
    };
    return String(text).replace(/\{\{\s*(name|company|city|sector|stage|sender)\s*\}\}/g, function (_, key) {
      return map[key] != null ? map[key] : '';
    });
  }

  function captureComposer() {
    var form = $('#compose-form');
    if (!form) return;
    var d = composerDraft();
    var name = $('#compose-name');
    var subject = $('#compose-subject');
    var body = $('#compose-body');
    if (name) d.name = name.value;
    if (subject) d.subject = subject.value;
    if (body) d.body = body.value;
    d.audience = readAudience();
  }

  function readAudience() {
    var typeEl = $('[data-audience="type"]');
    var regionEl = $('[data-audience="region"]');
    var cityEl = $('[data-audience="city"]');
    var qEl = $('[data-audience="q"]');
    return {
      type: typeEl ? typeEl.value : 'projects',
      region: regionEl ? regionEl.value : '全部',
      city: cityEl ? cityEl.value : '全部',
      q: qEl ? qEl.value : ''
    };
  }

  function refreshAudience() {
    var aud = readAudience();
    var rows = audienceRecords(aud);
    var count = $('#audience-count');
    var prev = $('#recipient-preview');
    var sendCount = $('#send-count');
    if (count) count.textContent = rows.length + ' 位匹配';
    if (prev) prev.innerHTML = recipientPreviewHTML(rows);
    if (sendCount) {
      var wrap = sendCount.parentNode;
      if (wrap) {
        wrap.innerHTML = '<strong id="send-count">' + rows.length + '</strong> 位收件人 · 消耗 ' + rows.length + ' 额度 <span class="quota-left">剩余 ' + (state.user.credits || 0) + ' 封</span>';
      }
    }
    updatePreview();
  }

  function handleAudienceChange(field) {
    captureComposer();
    if (field === 'type' || field === 'region') {
      state.composeDraft.audience.city = '全部';
      renderOutreachPanel();
    } else {
      refreshAudience();
    }
  }

  function updatePreview() {
    var aud = readAudience();
    var rows = audienceRecords(aud);
    var first = rows[0];
    var subject = $('#compose-subject');
    var body = $('#compose-body');
    var ps = $('#preview-subject');
    var pb = $('#preview-body');
    var to = $('#preview-to');
    if (ps) ps.textContent = first ? mergeText(subject ? subject.value : '', first, aud.type) : (subject ? subject.value : '');
    if (pb) pb.textContent = first ? mergeText(body ? body.value : '', first, aud.type) : (body ? body.value : '');
    if (to) to.textContent = '收件人：' + (first ? displayTargetName(first, aud.type) : '暂无匹配');
  }

  function applyTemplate(id) {
    var t = TEMPLATES.filter(function (x) { return x.id === id; })[0];
    if (!t) return;
    captureComposer();
    var d = composerDraft();
    d.subject = t.subject;
    d.body = t.body;
    d.name = d.name || t.name + ' · ' + new Date().getMonth() + 1 + ' 月';
    state.outreachTab = 'compose';
    renderOutreachPanel();
    toast('已套用「' + t.name + '」模板');
  }

  function generateEmail(goal, tone, aud) {
    var rows = audienceRecords(aud);
    var first = rows[0];
    var sector = first ? (aud.type === 'projects' ? first.sector : aud.type === 'capital' ? first.focus[0] : first.role) : 'AI';
    var city = first ? first.city : '杭州';
    var stage = first && aud.type === 'projects' ? first.stage : '早期';
    var who = first ? displayTargetName(first, aud.type) : '目标联系人';
    var g = (goal || '').trim();
    var isTalent = aud.type === 'talents' || /人才|招聘|候选人|加入|机会/.test(g);
    var isCapital = aud.type === 'capital' || /投资|资本|机构|合投|LP/.test(g);
    var isFund = /融资|资本|对接|投资人|闭门会/.test(g);
    var opening = tone === '简洁' ? '冒昧打扰，' : tone === '热情' ? '很高兴联系你！' : '你好，';
    var sender = currentUserName();

    if (isTalent) {
      return {
        subject: '{{name}}，有一个 {{sector}} 方向的合伙机会想和你聊聊',
        body: opening + '\n\n我是 AILink 智链的 ' + sender + '。看到你在{{company}}做{{sector}}方向，经历和一家正在组建核心团队的 AI 公司很匹配。\n\n对方在{{city}}，目前处在' + stage + '阶段，正在寻找能一起把产品从 0 到 1 的伙伴。' + (g ? '这次交流的重点是：' + g + '。' : '') + '\n\n如果你愿意，我可以先把团队背景、股权与薪酬区间发你，再决定要不要深入聊。\n\n' + sender + '\nAILink 智链 · 人才服务'
      };
    }

    if (isCapital) {
      return {
        subject: '{{company}} × AILink｜想和你交流一个 {{sector}} 项目',
        body: opening + '\n\n我是 AILink 智链的 ' + sender + '。我们在做' + city + '及周边的 AI 项目与资金匹配，看到{{company}}长期关注{{sector}}，想和你同步一个正在看新一轮融资的团队。\n\n项目处在' + stage + '阶段，核心团队来自产业与头部实验室，已经有首批标杆客户。' + (g ? '这次想重点聊：' + g + '。' : '') + '\n\n如果方便，我可以把脱敏材料发你，或者约 20 分钟电话。\n\n' + sender + '\nAILink 智链 · 资本服务'
      };
    }

    if (isFund) {
      return {
        subject: '邀请 {{company}} 参加 {{city}} 闭门资本对接',
        body: opening + '\n\n我是 AILink 智链的 ' + sender + '。我们正在筹备一场' + city + '的 AI 闭门资本对接会，定向邀请 8–10 位' + stage + '阶段的创始团队，以及关注{{sector}}的早期基金合伙人。\n\n看到{{company}}在{{city}}做{{sector}}，和本期机构的投资偏好比较接近。' + (g ? '这次对接会围绕「' + g + '」展开。' : '') + '\n\n如果你们正在看新一轮融资，我可以先把机构画像和往期对接情况发你参考。回复“感兴趣”即可。\n\n' + sender + '\nAILink 智链 · 会员运营'
      };
    }

    return {
      subject: '{{company}} × AILink｜想认识一下 {{city}} 的同行',
      body: opening + '\n\n我是 AILink 智链的 ' + sender + '。我们在整理{{city}}{{sector}}方向的创业者与机构网络时看到了{{company}}，你们正在做的事和我们的会员需求很匹配。\n\n' + (g ? '这次联系你，主要是想围绕「' + g + '」做一次小范围交流。' : '我们每月会组织 2–3 场小范围闭门交流，参与者主要是同赛道的创始人、投资人和产业方。') + '\n\n如果方便，回复一个你合适的时间，我们把详细材料发你。\n\n' + sender + '\nAILink 智链 · AI 创业社区'
    };
  }

  function aiGenerate() {
    captureComposer();
    var prompt = $('#ai-prompt');
    var tone = $('#ai-tone');
    var aud = readAudience();
    var out = generateEmail(prompt ? prompt.value : '', tone ? tone.value : '专业', aud);
    var subject = $('#compose-subject');
    var body = $('#compose-body');
    if (subject) subject.value = out.subject;
    if (body) body.value = out.body;
    captureComposer();
    updatePreview();
    toast('AI 草稿已生成，可继续手动修改');
  }

  function sendCampaign() {
    captureComposer();
    var d = composerDraft();
    var rows = audienceRecords(d.audience);
    if (!rows.length) { toast('当前筛选没有收件人，请调整人群范围', 'error'); return; }
    if (!d.subject || d.subject.trim().length < 4) { toast('请先填写邮件主题', 'error'); return; }
    if (!d.body || d.body.trim().length < 20) { toast('邮件正文太短，请补充内容', 'error'); return; }
    var credits = state.user.credits || 0;
    if (credits < rows.length) {
      toast('额度不足：还需要 ' + (rows.length - credits) + ' 封，请先购买加油包', 'error');
      openTopup(Math.max(500, rows.length - credits), calcPrice(Math.max(500, rows.length - credits)).price);
      return;
    }
    openSendModal(rows, d);
  }

  function openSendModal(rows, draft) {
    var total = rows.length;
    openModal(
      '<div class="modal-head"><div><h3>正在发送</h3><p>正在按收件人替换变量，并检查退订与频控。</p></div></div>' +
      '<div class="send-progress-box">' +
        '<div class="send-progress-top"><span id="send-status">准备队列…</span><strong id="send-percent">0%</strong></div>' +
        '<div class="progress-track" style="height:6px;margin-top:10px"><div class="progress-fill" id="send-fill" style="width:0"></div></div>' +
        '<div class="send-log" id="send-log"></div>' +
      '</div>' +
      '<div class="drawer-actions" style="margin-top:14px"><button class="btn btn-ghost btn-block" type="button" data-action="cancel-send">取消发送</button></div>' +
      '<p class="fineprint">演示模式：仅模拟队列与统计数据，不会连接 SMTP，也不会向 example.com 发送邮件。</p>'
    );

    var index = 0;
    var started = Date.now();
    var opened = Math.round(total * (0.52 + Math.random() * 0.1));
    var clicked = Math.round(opened * (0.25 + Math.random() * 0.14));
    var replied = Math.round(clicked * (0.28 + Math.random() * 0.16));
    var log = $('#send-log');
    var fill = $('#send-fill');
    var pct = $('#send-percent');
    var status = $('#send-status');

    function tick() {
      var step = Math.min(total, index + 1);
      index = step;
      var r = rows[step - 1];
      if (log) {
        var div = document.createElement('div');
        div.innerHTML = '<b>✓</b> ' + esc(displayTargetName(r, draft.audience.type)) + ' · ' + esc(contactOf(r).email);
        log.appendChild(div);
        log.scrollTop = log.scrollHeight;
      }
      var percent = Math.round(index / total * 100);
      if (fill) fill.style.width = percent + '%';
      if (pct) pct.textContent = percent + '%';
      if (status) status.textContent = '正在发送 ' + index + ' / ' + total;

      if (index >= total) {
        clearInterval(state.sendTimer);
        state.sendTimer = null;
        if (status) status.textContent = '发送完成 · 正在生成报告';
        setTimeout(function () { completeSend(rows, draft, opened, clicked, replied); }, 550);
      }
    }

    state.sendTimer = setInterval(tick, 55);
    tick();
  }

  function cancelSend() {
    if (state.sendTimer) {
      clearInterval(state.sendTimer);
      state.sendTimer = null;
    }
    closeModal();
    toast('已取消发送，未扣除额度');
  }

  function completeSend(rows, draft, opened, clicked, replied) {
    var total = rows.length;
    state.user.credits = Math.max(0, (state.user.credits || 0) - total);
    var campaign = {
      id: 'cmp-' + Date.now(),
      owner: state.user.email,
      name: draft.name || '未命名活动',
      subject: draft.subject,
      type: draft.audience.type,
      audience: [draft.audience.region !== '全部' ? draft.audience.region : '', draft.audience.city !== '全部' ? draft.audience.city : '', draft.audience.q || ''].filter(Boolean).join(' · ') || '全部',
      sent: total,
      opened: opened,
      clicked: clicked,
      replied: replied,
      date: formatDate(),
      status: '已完成'
    };
    state.campaigns.unshift(campaign);
    writeJSON(LS.campaigns, state.campaigns);
    saveUser();
    closeModal();
    state.outreachTab = 'campaigns';
    renderHeaderAuth();
    renderRoute({ scroll: false, clearOverlays: false });
    toast('活动已加入队列，已扣减 ' + total + ' 封额度');
  }

  function campaignsPanelHTML() {
    var campaigns = userCampaigns();
    if (!campaigns.length) {
      return '<div class="composer-card"><div class="empty-panel"><span class="empty-icon" style="margin:0 auto 10px;display:grid;place-items:center;width:46px;height:46px;border-radius:50%;background:var(--paper-2);color:var(--muted)">' + icon('mail') + '</span><h4>还没有邮件活动</h4><p>从三大库里选一群人，写一封叫得出名字的邮件。</p><button class="btn btn-dark btn-sm" type="button" data-action="outreach-tab" data-tab="compose">新建第一个活动</button></div></div>';
    }
    return '<div class="composer-card" style="padding:16px">' +
      '<div class="campaign-list">' + campaigns.map(function (c) {
        var rate = c.sent ? Math.round(c.opened / c.sent * 100) : 0;
        var replyRate = c.sent ? (c.replied / c.sent * 100).toFixed(1) : '0.0';
        return '<div class="campaign-row">' +
          '<div class="campaign-main"><div class="campaign-top"><h4>' + esc(c.name) + '</h4><span class="tag green">' + esc(c.status) + '</span><span class="tag outline">' + esc(c.date) + '</span></div>' +
            '<p>' + esc(c.subject) + '</p>' +
            '<div class="campaign-stats"><div><span>发送</span><strong>' + c.sent + '</strong></div><div><span>打开率</span><strong>' + rate + '%</strong></div><div><span>回复</span><strong>' + c.replied + '</strong></div><div><span>回复率</span><strong>' + replyRate + '%</strong></div></div>' +
          '</div>' +
          '<div class="campaign-actions"><button type="button" data-action="view-report" data-id="' + c.id + '">查看报告</button><button type="button" data-action="use-campaign" data-id="' + c.id + '">复用</button></div>' +
        '</div>';
      }).join('') + '</div>' +
    '</div>';
  }

  function viewReport(id) {
    var c = state.campaigns.filter(function (x) { return x.id === id; })[0];
    if (!c) return;
    var openRate = c.sent ? Math.round(c.opened / c.sent * 100) : 0;
    var clickRate = c.sent ? (c.clicked / c.sent * 100).toFixed(1) : '0.0';
    var replyRate = c.sent ? (c.replied / c.sent * 100).toFixed(1) : '0.0';
    openModal(
      '<div class="modal-head"><div><h3>' + esc(c.name) + '</h3><p>' + esc(c.date) + ' · ' + esc(c.audience) + ' · ' + esc(DB[c.type] ? DB[c.type].label : '') + '</p></div>' + modalCloseButton() + '</div>' +
      '<div class="report-grid"><div class="report-stat"><strong>' + c.sent + '</strong><span>发送</span></div><div class="report-stat"><strong>' + openRate + '%</strong><span>打开率</span></div><div class="report-stat"><strong>' + clickRate + '%</strong><span>点击率</span></div><div class="report-stat"><strong>' + replyRate + '%</strong><span>回复率</span></div></div>' +
      '<div class="report-note"><strong>主题：</strong>' + esc(c.subject) + '<br><br>演示报告为模拟数据。正式环境将接入邮件服务商 Webhook，记录送达、打开、点击、退信与退订，并按收件人维度去重。</div>' +
      '<div class="drawer-actions"><button class="btn btn-ghost" type="button" data-action="use-campaign" data-id="' + c.id + '">复用此活动</button><button class="btn btn-dark" type="button" data-action="close-modal">关闭</button></div>'
    );
  }

  function useCampaign(id) {
    var c = state.campaigns.filter(function (x) { return x.id === id; })[0];
    if (!c) return;
    state.composeDraft = {
      name: c.name + ' · 复用',
      subject: c.subject,
      body: (state.composeDraft && state.composeDraft.body) || TEMPLATES[0].body,
      audience: (state.composeDraft && state.composeDraft.audience) || defaultAudience()
    };
    state.outreachTab = 'compose';
    closeModal();
    renderOutreachPanel();
    toast('已载入活动，可修改后重新发送');
  }

  function templatesPanelHTML() {
    return '<div class="composer-card">' +
      '<div class="composer-head"><div><h3>模板库</h3><p>按场景选择，再用 AI 按人群微调。</p></div><span class="tag">' + TEMPLATES.length + ' 个模板</span></div>' +
      '<div class="template-grid" style="margin-top:16px">' + TEMPLATES.map(function (t) {
        return '<article class="template-card"><div class="tc-top"><h4>' + esc(t.name) + '</h4><span class="tag outline">' + esc(t.scene) + '</span></div><div class="tc-subject">' + esc(t.subject) + '</div><p>' + esc(t.body) + '</p><div class="tc-foot"><span>含变量 · 可直接使用</span><button type="button" data-action="use-template" data-id="' + t.id + '">使用模板 →</button></div></article>';
      }).join('') + '</div>' +
    '</div>';
  }

  function renderOutreachPanel() {
    var panel = $('#outreach-panel');
    if (!panel) return;
    panel.innerHTML = outreachPanelHTML(state.outreachTab);
    updatePreview();
    $$('.tabbar button').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-tab') === state.outreachTab);
    });
  }

  function switchOutreachTab(tab) {
    state.outreachTab = ['compose', 'campaigns', 'templates'].indexOf(tab) >= 0 ? tab : 'compose';
    renderOutreachPanel();
  }

  /* ----------------------------------------------------------------------
     Data method page
     ---------------------------------------------------------------------- */

  var SOURCES = [
    { n: '01', title: '工商与知识产权', tag: '公开 / 授权 API', desc: '从企业主体信息出发，建立唯一 ID、地址、参保人数、专利与软著画像。', fields: '企业名称、统一社会信用代码、地址、专利、软著', tool: '国家企业信用信息公示系统、企查查 / 天眼查 API', note: '只取企业公开字段，不采集个人敏感信息。' },
    { n: '02', title: '融资事件与机构', tag: '授权数据', desc: '用融资事件把项目、机构、阶段和金额串起来，形成可检索的资本网络。', fields: '融资轮次、金额、投资方、机构偏好', tool: 'IT 桔子、企名片、机构官网、交易所公告', note: '以公开披露为准，标注来源与可信度。' },
    { n: '03', title: '园区与行业协会', tag: '合作共建', desc: '杭州未来科技城、深圳南山、上海张江、苏州工业园区等园区与协会名录。', fields: '企业名录、入驻信息、活动与政策', tool: '园区官网、协会名录、线下合作', note: '以合作协议与公开名录为准，不用爬虫绕过权限。' },
    { n: '04', title: '招聘与人才社区', tag: '用户授权', desc: '只收录主动登记或明确授权被检索的候选人，不做简历抓取。', fields: '方向、年限、技能、求职状态、期望', tool: '自有报名表、技术社区合作、领英 / 脉脉（许可方式）', note: '候选人可随时撤回、更正或删除档案。' },
    { n: '05', title: '活动与社区', tag: '明示同意', desc: '闭门会、Demo Day、训练营的报名表，是质量最高的一手数据来源。', fields: '创始人、投资人、人才、合作意向', tool: '活动行、百格、自有落地页、企业微信', note: '报名表单独勾选“愿意被会员发现”。' },
    { n: '06', title: '企业官网与产品', tag: '公开数据', desc: '官网、GitHub、论文和专利，用来补全产品、技术栈与商务联系入口。', fields: '产品、技术栈、商务邮箱、公开电话', tool: '官网、GitHub API、专利检索、论文库', note: '遵守 robots 与平台条款，不绕过登录或付费墙。' },
    { n: '07', title: '数据服务商', tag: '采购', desc: '在明确授权与合法来源的前提下，采购企业联系方式与工商数据。', fields: '企业联系方式、经营状态、行业标签', tool: '探迹、励销云、企查查企业版等', note: '签数据处理协议，核验来源与更新频率。' },
    { n: '08', title: '会员贡献', tag: '社区共建', desc: '认领档案、推荐同行、纠错更新，让数据在使用中保持新鲜。', fields: '新增、纠错、联系方式更新', tool: '会员中心、认领表单、推荐奖励', note: '所有修改留痕，敏感字段需本人确认。' }
  ];

  var PIPELINE = [
    { label: 'STEP 01', title: '发现', desc: '工商、园区、融资事件、活动报名、会员推荐。' },
    { label: 'STEP 02', title: '结构化', desc: '统一 schema、行业标签、阶段口径与城市字段。' },
    { label: 'STEP 03', title: '去重', desc: '统一社会信用代码 + 名称相似度 + 地址指纹。' },
    { label: 'STEP 04', title: '核验', desc: '官网 / 电话 / 邮箱 / 人工抽检，标记可信度。' },
    { label: 'STEP 05', title: '更新', desc: '周级增量、季度全量、失效标记与删除通道。' }
  ];

  var TOOLS = [
    { icon: 'globe', title: '公开页面采集', desc: 'Playwright、Scrapy、Apify；只采公开页面，遵守 robots。' },
    { icon: 'database', title: '企业与融资数据', desc: '企查查 / 天眼查 / IT 桔子 API；按字段授权使用。' },
    { icon: 'pin', title: '地址与地图', desc: '高德 / 腾讯位置服务，标准化地址与园区坐标。' },
    { icon: 'at', title: '邮箱验证', desc: 'ZeroBounce、NeverBounce、阿里云邮箱验证，降低退信。' },
    { icon: 'layers', title: '存储与检索', desc: 'PostgreSQL / Supabase + Meilisearch，支持多维筛选。' },
    { icon: 'settings', title: '自动化流水线', desc: 'n8n / Airflow 做抓取、清洗、去重与质量告警。' },
    { icon: 'send', title: '邮件发送', desc: '阿里云邮件推送、腾讯云 SES、SendGrid、Resend。' },
    { icon: 'users', title: 'CRM 与协同', desc: 'HubSpot、纷享销客、销售易，承接会员跟进。' }
  ];

  var PHASES = [
    { phase: 'PHASE 0', title: '定标准，跑通 100 条', time: '第 1–2 周', status: 'done', statusLabel: '演示已完成', desc: '字段规范、去重规则、来源与核验记录、合规底线；三类 CSV 模板。', metrics: [['项目', '100'], ['资金', '30'], ['人才', '100']] },
    { phase: 'PHASE 1', title: '华东 + 华南首批', time: '第 3–8 周', status: 'live', statusLabel: '进行中', desc: '杭州、深圳优先；园区与协会合作、授权数据采购、活动报名；联系方式核验率 ≥ 60%。', metrics: [['项目', '2,000'], ['资金', '300'], ['人才', '1,000']] },
    { phase: 'PHASE 2', title: '扩展到全国重点省市', time: '第 9–20 周', status: '', statusLabel: '规划中', desc: '北京、上海、成都、武汉、西安、合肥；建立区域数据运营与机构合作网络。', metrics: [['项目', '10,000'], ['资金', '1,000'], ['人才', '5,000']] },
    { phase: 'PHASE 3', title: '持续更新与 API', time: '第 6 个月起', status: '', statusLabel: '规划中', desc: '周级增量、会员认领、开放 API、CRM 双向同步与数据质量看板。', metrics: [['项目', '30,000+'], ['资金', '3,000+'], ['人才', '20,000+']] }
  ];

  var COSTS = [
    ['企业数据 / 融资数据 API', '3–15 万元 / 年', '按调用量与字段授权，优先 2 家比价'],
    ['邮箱 / 电话核验', '3–8 元 / 条', '只核验关键联系人，不全量盲验'],
    ['数据采集与清洗', '25–40 万元 / 年', '1 名数据工程师 + 兼职标注'],
    ['邮件发送与送达率工具', '1–5 万元 / 年', '按量付费，先小规模测试域名信誉'],
    ['合规与法务', '2–5 万元 / 年', '隐私政策、数据处理协议、员工培训'],
    ['Phase 1 合计（8 周）', '15–30 万元', '不含创始团队人力与市场费用']
  ];

  var COMPLIANCE = [
    '遵守《个人信息保护法》：最小必要、明示目的、可撤回、可删除。',
    '遵守《数据安全法》《网络安全法》：数据分级、访问审计、泄露预案。',
    '遵守《互联网电子邮件服务管理办法》：订阅同意、退订入口、真实发件人。',
    '不采购来源不明的个人手机号、微信与简历；不绕过平台反爬与登录墙。',
    '人才库只做 opt-in；候选人可隐藏、更正或删除档案。',
    '会员协议禁止转售、批量爬取与骚扰式触达。'
  ];

  var CHECKLIST = [
    '确定三类 schema 与字段必填项',
    '建立来源、授权、核验时间三列',
    '接入 2 家企业数据 API 做比对',
    '拉取杭州 / 深圳园区公开名录',
    '设计活动报名表的同意勾选项',
    '完成首批 500 条人工抽检',
    '上线退订、删除与纠错入口',
    '用 20 封测试邮件跑通送达率'
  ];

  function dataPage() {
    return '' +
      '<section class="data-hero">' +
        '<div class="container data-hero-grid">' +
          '<div><div class="eyebrow">DATA METHODOLOGY</div><h1>数据不是爬来的，<br>是核验出来的。</h1><p class="lead">“杭州、深圳所有 AI 企业”与“全国所有投资人”听起来很性感，但真正能用的不是“所有”，而是“可核验、可联系、可更新”。这是我们建议的获取方式、工具与分阶段方案。</p>' +
            '<div class="hero-doc-actions"><a class="btn btn-dark btn-sm" href="docs/数据获取方案.md" download>下载完整数据方案 ' + icon('download') + '</a><a class="btn btn-ghost btn-sm" href="docs/产品与技术架构.md" download>技术架构 ' + icon('arrowUp') + '</a></div>' +
          '</div>' +
          '<div class="data-hero-stats">' +
            '<div class="data-stat"><strong>8</strong><span>类数据来源</span></div><div class="data-stat"><strong>4</strong><span>层核验流程</span></div><div class="data-stat"><strong>7 天</strong><span>增量更新周期</span></div><div class="data-stat"><strong>3 轨</strong><span>授权 / 公开 / 共建</span></div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="section">' +
        '<div class="container">' +
          '<div class="decision-box reveal">' +
            '<div><div class="eyebrow" style="color:var(--ink)">OUR DECISION</div><h3>先做 2,000 条<br>可用数据。</h3><p>而不是 20 万条脏数据。第一阶段的胜负手是核验率与可联系率，不是条目数量。</p></div>' +
            '<ul class="decision-list">' +
              '<li><span class="dc-num">1</span><span><strong>三轨并行：</strong>授权数据 40% + 公开数据 35% + 社区共建 25%，不把命运押在单一数据商或爬虫上。</span></li>' +
              '<li><span class="dc-num">2</span><span><strong>联系方式分层：</strong>企业公开总机 / 商务邮箱可收录；个人手机与微信必须来自本人授权或明确自报。</span></li>' +
              '<li><span class="dc-num">3</span><span><strong>人才库只做 opt-in：</strong>不做简历爬取，只收录愿意被看见的候选人。</span></li>' +
              '<li><span class="dc-num">4</span><span><strong>8 周打下华东华南：</strong>2,000 项目 / 300 资金 / 1,000 人才；核验率 ≥ 60% 后再扩全国。</span></li>' +
            '</ul>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="section" style="padding-top:0">' +
        '<div class="container">' +
          '<div class="section-head"><div><div class="eyebrow">DATA SOURCES</div><h2>数据从哪里来。</h2><p>每类来源都标注获取方式、字段与合规边界。灰色地带的数据，再便宜也不碰。</p></div></div>' +
          '<div class="source-grid">' + SOURCES.map(function (s) {
            return '<article class="source-card"><div class="source-card-top"><span class="source-num">' + s.n + '</span><span class="source-tag">' + esc(s.tag) + '</span></div><h4>' + esc(s.title) + '</h4><p>' + esc(s.desc) + '</p><div class="source-meta"><span><b>字段</b>' + esc(s.fields) + '</span><span><b>工具</b>' + esc(s.tool) + '</span><span><b>边界</b>' + esc(s.note) + '</span></div></article>';
          }).join('') + '</div>' +
        '</div>' +
      '</section>' +

      '<section class="section" style="background:var(--paper-2);border-top:1px solid var(--line);border-bottom:1px solid var(--line)">' +
        '<div class="container">' +
          '<div class="section-head"><div><div class="eyebrow">PIPELINE</div><h2>一条数据，五道工序。</h2><p>从发现到更新，每一步都留下来源、负责人和时间戳。</p></div></div>' +
          '<div class="pipeline">' + PIPELINE.map(function (p) {
            return '<div class="pipeline-step"><div class="ps-label">' + p.label + '</div><h4>' + p.title + '</h4><p>' + p.desc + '</p></div>';
          }).join('') + '</div>' +
          '<div class="compliance-note" style="margin-top:18px">' + icon('shield') + '<span><strong>质量门槛：</strong>企业名称 + 城市 + 赛道 + 至少一个有效联系方式，才进入可检索库；联系方式连续 2 次退信即自动降级为“待核验”。</span></div>' +
        '</div>' +
      '</section>' +

      '<section class="section">' +
        '<div class="container data-two-col" id="roadmap">' +
          '<div><div class="eyebrow">ROADMAP</div><h2 style="margin-top:12px;font-family:var(--serif);font-size:clamp(30px,3.2vw,44px);font-weight:600;line-height:1.24;letter-spacing:-.03em">从 100 条，<br>到全国网络。</h2><p style="margin-top:12px;font-size:12px;line-height:1.8;color:var(--muted)">第一阶段先把杭州、深圳打穿，再复制到华东华南，最后全国扩张。每一阶段都以核验率与可联系率为门槛，而不是单纯堆量。</p>' +
            '<div class="roadmap">' + PHASES.map(function (p) {
              return '<div class="roadmap-item ' + p.status + '"><div class="roadmap-head"><span class="rphase">' + p.phase + '</span><h4>' + p.title + '</h4><span class="rstatus ' + p.status + '">' + p.statusLabel + '</span></div><p>' + p.desc + ' <span style="color:var(--muted-2)">' + p.time + '</span></p><div class="roadmap-metrics">' + p.metrics.map(function (m) { return '<span><b>' + m[1] + '</b> ' + m[0] + '</span>'; }).join('') + '</div></div>';
            }).join('') + '</div>' +
          '</div>' +
          '<div><div class="eyebrow">TOOLBOX</div><h2 style="margin-top:12px;font-family:var(--serif);font-size:clamp(30px,3.2vw,44px);font-weight:600;line-height:1.24;letter-spacing:-.03em">推荐工具栈</h2><p style="margin-top:12px;font-size:12px;line-height:1.8;color:var(--muted)">不追求大而全，先用最小组合跑通“采集→清洗→核验→触达”。所有工具都需确认数据授权与平台条款。</p>' +
            '<div class="tools-grid" style="margin-top:18px">' + TOOLS.map(function (t) {
              return '<div class="tool-card"><div class="tool-top">' + icon(t.icon) + t.title + '</div><p>' + t.desc + '</p></div>';
            }).join('') + '</div>' +
            '<div class="side-card" style="margin-top:14px"><h4>' + icon('zap') + ' 小团队最小配置</h4><p>1 名数据工程师 + 1 名数据运营 + 1 名全栈。先用 Airtable / 飞书多维表格跑 2 周，确认字段与流程后再迁 PostgreSQL。</p></div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="section" style="padding-top:0" id="compliance">' +
        '<div class="container">' +
          '<div class="compliance-box">' +
            '<div><div class="eyebrow light">COMPLIANCE</div><h3 style="margin-top:10px">合规不是成本，<br>是数据生意的入场券。</h3><p>面向企业与个人的数据平台，必须能回答三个问题：数据从哪来、凭什么用、如何删除。</p><a class="btn btn-lime btn-sm" style="margin-top:16px" href="#/data#templates">下载字段模板 ' + icon('download') + '</a></div>' +
            '<ul class="compliance-list">' + COMPLIANCE.map(function (c) { return '<li>' + icon('checkCircle') + '<span>' + esc(c) + '</span></li>'; }).join('') + '</ul>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="section" style="padding-top:0">' +
        '<div class="container data-two-col equal">' +
          '<div><div class="eyebrow">BUDGET</div><h2 style="margin-top:12px;font-family:var(--serif);font-size:30px;font-weight:600">Phase 1 参考预算</h2><p style="margin-top:8px;font-size:11.5px;line-height:1.8;color:var(--muted)">8 周做到 2,000 / 300 / 1,000，不含创始团队工资与市场投放。实际价格以供应商报价为准。</p>' +
            '<div class="compare-wrap" style="margin-top:16px"><table class="cost-table"><thead><tr><th>项目</th><th>参考成本</th><th>说明</th></tr></thead><tbody>' + COSTS.map(function (c) {
              return '<tr><td>' + esc(c[0]) + '</td><td>' + esc(c[1]) + '</td><td>' + esc(c[2]) + '</td></tr>';
            }).join('') + '</tbody></table></div>' +
          '</div>' +
          '<div><div class="eyebrow">FIRST 30 DAYS</div><h2 style="margin-top:12px;font-family:var(--serif);font-size:30px;font-weight:600">30 天落地清单</h2><p style="margin-top:8px;font-size:11.5px;line-height:1.8;color:var(--muted)">先跑通一条最小闭环：100 条数据 → 10 个会员 → 20 封测试邮件 → 1 次真实对接。</p>' +
            '<ul class="checklist" style="margin-top:14px">' + CHECKLIST.map(function (c) { return '<li>' + icon('checkCircle') + '<span>' + esc(c) + '</span></li>'; }).join('') + '</ul>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="section" style="padding-top:0" id="batch">' +
        '<div class="container">' + batchSectionHTML() + '</div>' +
      '</section>' +

      '<section class="section" style="padding-top:0" id="templates">' +
        '<div class="container">' +
          '<div class="section-head" style="margin-bottom:16px"><div><div class="eyebrow">DATA TEMPLATES</div><h2 style="font-size:clamp(26px,2.6vw,36px)">先用模板把字段跑通。</h2><p>下载三类 CSV 模板，按列填入数据；接入后台时可直接映射到 schema。</p></div></div>' +
          '<div class="template-downloads">' +
            '<button class="download-card" type="button" data-action="download-template" data-type="projects"><span class="dc-icon">' + icon('folder') + '</span><span><strong>项目库 CSV 模板</strong><span>21 个字段 · UTF-8</span></span></button>' +
            '<button class="download-card" type="button" data-action="download-template" data-type="capital"><span class="dc-icon">' + icon('bank') + '</span><span><strong>资金库 CSV 模板</strong><span>18 个字段 · UTF-8</span></span></button>' +
            '<button class="download-card" type="button" data-action="download-template" data-type="talents"><span class="dc-icon">' + icon('users') + '</span><span><strong>人才库 CSV 模板</strong><span>19 个字段 · UTF-8</span></span></button>' +
          '</div>' +
          '<p class="template-note">模板仅含表头与字段说明，不含真实个人数据。正式导入前请完成来源、授权与删除机制设计。</p>' +
        '</div>' +
      '</section>' +

      '<section class="cta-band">' +
        '<div class="container cta-inner"><div><h2>想要这份数据方案，<br>落到你的业务里？</h2><p>我们可以一起拆字段、选数据源、设计核验流程，或直接接入 AILink 的会员网络。</p></div><button class="btn btn-dark btn-lg" type="button" data-action="open-contact">申请数据合作 ' + icon('arrow') + '</button></div>' +
      '</section>';
  }

  function batchSectionHTML() {
    var b = D.meta.batch01;
    if (!b) return '';
    var cs = b.contactSummary || {};
    var totalCandidates = b.total + ((D.meta.hzBatch02 && D.meta.hzBatch02.total) || 0);
    var targetPct = Math.min(100, Math.round(totalCandidates / (b.target || 200) * 100));
    var contactPct = Math.round((cs.withEither || 0) / (cs.total || 42) * 100);
    return '<div class="section-head" style="margin-bottom:18px">' +
        '<div><div class="eyebrow">DATA OPERATIONS</div><h2 style="font-size:clamp(26px,2.8vw,38px)">Batch 01 + 02：先导入，后核验。</h2><p>杭州第一批 100 家公开榜单候选，与现有项目库去重后 61 家新增；第二批 100 家从滨江、未来科技城、余杭、萧山园区/公开资料补入。两批合计 200 家候选，161 家新增已按“待核验”批量入库。</p></div>' +
        '<a class="btn-text" href="' + esc(b.sourceUrl) + '" target="_blank" rel="noopener">查看公开榜单 ' + icon('arrowUp') + '</a>' +
      '</div>' +
      '<div class="ops-stats">' +
        '<div class="ops-stat"><strong>' + b.total + '</strong><span>公开榜单候选</span><small>Batch 01 原始清单</small></div>' +
        '<div class="ops-stat"><strong>' + b.existing + '</strong><span>已在项目库</span><small>重名 / 同义去重</small></div>' +
        '<div class="ops-stat"><strong>' + b.new + '</strong><span>新增已导入</span><small>全部待核验</small></div>' +
        '<div class="ops-stat"><strong>' + (cs.withEither || 0) + ' / ' + (cs.total || 42) + '</strong><span>官网联系方式候选</span><small>邮箱 ' + (cs.withEmail || 0) + ' · 电话 ' + (cs.withPhone || 0) + '</small></div>' +
        '<div class="ops-stat"><strong>' + (b.verified || 0) + '</strong><span>已人工核验</span><small>通过后才转正</small></div>' +
      '</div>' +
      '<div class="ops-panel">' +
        '<div class="ops-line"><div class="ops-line-head"><strong>200 家候选目标</strong><span>' + totalCandidates + ' / ' + (b.target || 200) + '</span></div><div class="ops-track"><i style="width:' + targetPct + '%"></i></div></div>' +
        '<div class="ops-line"><div class="ops-line-head"><strong>联系方式候选覆盖</strong><span>' + contactPct + '%</span></div><div class="ops-track"><i style="width:' + contactPct + '%"></i></div></div>' +
        '<div class="ops-line"><div class="ops-line-head"><strong>人工核验通过</strong><span>0 / ' + (cs.total || 42) + '</span></div><div class="ops-track"><i style="width:0%"></i></div></div>' +
        '<div class="ops-actions">' +
          '<a class="btn btn-dark btn-sm" href="data/hangzhou-batch-01.csv" download>' + icon('download') + ' 批次 01 · 100 家 CSV</a>' +
          '<a class="btn btn-ghost btn-sm" href="data/hangzhou-contact-queue.csv" download>' + icon('download') + ' 联系方式核验队列 CSV</a>' +
          '<a class="btn btn-ghost btn-sm" href="#/projects">查看已入库项目库</a>' +
        '</div>' +
        '<p class="ops-note">' + icon('shield') + ' 核验规则：官网 / 园区 / 公开商务页交叉确认；电话可通、邮箱域名匹配、联系人角色匹配，三项至少两项通过才标记“已核验”。本批次当前 0 家通过人工核验，避免把“官网抓取候选”当成“已验证联系方式”。</p>' +
      '</div>' +
      hzBatch2BlockHTML() +
      szBatchBlockHTML() +
      szBatch2BlockHTML() +
      '<p class="ops-note">' + icon('download') + ' 当前资料下载：' +
        '<a href="data/exports/projects-all.csv" download>项目全部</a> · ' +
        '<a href="data/exports/projects-verified.csv" download>已核验</a> · ' +
        '<a href="data/exports/projects-pending.csv" download>待核验</a> · ' +
        '<a href="data/exports/capital-all.csv" download>资金库</a> · ' +
        '<a href="data/exports/talents-all.csv" download>人才库</a>' +
      '</p>';
  }

  function hzBatch2BlockHTML() {
    var b = D.meta.hzBatch02;
    if (!b) return '';
    var a = b.areas || {};
    return '<div class="ops-secondary pending-ops">' +
      '<div class="ops-secondary-head"><div><div class="eyebrow">HANGZHOU BATCH 02 · IMPORTED</div><h3>杭州 Batch 02：100 家已批量导入。</h3><p>滨江、未来科技城、余杭、萧山园区/公开资料候选；已按“先导入、后核验”进入项目库。加上 Batch 01 的 61 家新增，杭州共 161 家已导入；其中 94 家已完成官网/人工核验，其余继续待核验。</p></div>' +
        '<a class="btn btn-dark btn-sm" href="data/hangzhou-batch-02.csv" download>' + icon('download') + ' Batch 02 CSV</a></div>' +
      '<div class="ops-stats">' +
        '<div class="ops-stat"><strong>' + b.total + '</strong><span>Batch 02 导入</span><small>全部待核验</small></div>' +
        '<div class="ops-stat"><strong>' + (a['滨江'] || 0) + '</strong><span>滨江</span><small>高新区 / 物联网小镇</small></div>' +
        '<div class="ops-stat"><strong>' + (a['未来科技城'] || 0) + '</strong><span>未来科技城</span><small>余杭 / 人工智能小镇</small></div>' +
        '<div class="ops-stat"><strong>' + (a['萧山'] || 0) + '</strong><span>萧山</span><small>信息港 / 制造场景</small></div>' +
        '<div class="ops-stat"><strong>90</strong><span>已核验</span><small>官网/人工抽检</small></div>' +
      '</div>' +
      '<div class="sz-districts">' + ['滨江', '未来科技城', '萧山'].map(function (name) {
        return '<span class="district-chip"><b>' + name + '</b><em>' + (a[name] || 0) + '</em></span>';
      }).join('') + '</div>' +
      '<p class="ops-note">' + icon('clock') + ' 这批数据已进入项目库；其中 90 家已完成官网/人工核验，其余保留“待核验”，不参与邮件触达。另：本轮公开名单新增 30 条杭州候选，16 条达到评分门槛；去重后保留 9 条待核验，其中 6 条官网/联系方式齐全，工商字段待接 API 后核验。核验顺序建议：滨江 → 未来科技城 → 余杭 → 萧山。</p>' +
    '</div>';
  }

  function szBatch2BlockHTML() {
    var b = D.meta.szBatch02;
    if (!b) return '';
    var d = b.districts || {};
    return '<div class="ops-secondary pending-ops">' +
      '<div class="ops-secondary-head"><div><div class="eyebrow">SHENZHEN BATCH 02 · IMPORTED</div><h3>深圳 Batch 02：100 家已批量导入。</h3><p>按“先导入、后核验”执行：100 家待核验企业已进入项目库，但统一标记“待核验”，联系方式为空，不参与邮件触达。后续按批次逐家核验。</p></div>' +
        '<a class="btn btn-dark btn-sm" href="data/shenzhen-batch-02.csv" download>' + icon('download') + ' Batch 02 CSV</a></div>' +
      '<div class="ops-stats">' +
        '<div class="ops-stat"><strong>' + b.total + '</strong><span>已批量导入</span><small>待核验状态</small></div>' +
        '<div class="ops-stat"><strong>' + (d['南山区'] || 0) + '</strong><span>南山</span><small>粤海 / 西丽 / 蛇口 / 深圳湾</small></div>' +
        '<div class="ops-stat"><strong>' + (d['福田区'] || 0) + '</strong><span>福田</span><small>河套 / CBD / 车公庙</small></div>' +
        '<div class="ops-stat"><strong>' + ((d['宝安区'] || 0) + (d['龙岗区'] || 0) + (d['坪山区'] || 0)) + '</strong><span>宝安 + 龙岗 + 坪山</span><small>制造 / 机器人场景</small></div>' +
        '<div class="ops-stat"><strong>0</strong><span>已核验</span><small>后续逐家核验</small></div>' +
      '</div>' +
      '<div class="sz-districts">' + ['南山区', '福田区', '宝安区', '龙岗区', '坪山区'].map(function (name) {
        return '<span class="district-chip"><b>' + name + '</b><em>' + (d[name] || 0) + '</em></span>';
      }).join('') + '</div>' +
      '<p class="ops-note">' + icon('clock') + ' 这批数据的正确用法：先在项目库中按“仅看待核验”查看和补全；核验通过前不要用于邮件触达、投资判断或对外背书。官网 / 电话 / 邮箱均为空，避免把未核验信息当成可联系数据。</p>' +
    '</div>';
  }

  function szBatchBlockHTML() {
    var b = D.meta.szBatch01;
    if (!b) return '';
    var d = b.districts || {};
    var order = ['南山区', '福田区', '宝安区', '龙岗区', '坪山区', '盐田区'];
    return '<div class="ops-secondary">' +
      '<div class="ops-secondary-head"><div><div class="eyebrow">SHENZHEN BATCH 01</div><h3>深圳：100 家候选。</h3><p>现有 42 家 + 新增 58 家候选；按南山、福田、宝安、龙岗、坪山五区拆分，盐田 1 家保留。新增候选先核验，不直接进入项目库。</p></div>' +
        '<a class="btn btn-dark btn-sm" href="data/shenzhen-batch-01.csv" download>' + icon('download') + ' 深圳 Batch 01 CSV</a></div>' +
      '<div class="ops-stats">' +
        '<div class="ops-stat"><strong>' + b.total + '</strong><span>候选总量</span><small>现有 + 新增</small></div>' +
        '<div class="ops-stat"><strong>' + b.existing + '</strong><span>已在项目库</span><small>42 家深圳图谱</small></div>' +
        '<div class="ops-stat"><strong>' + b.new + '</strong><span>新增待核验</span><small>五区候选</small></div>' +
        '<div class="ops-stat"><strong>' + (d['南山区'] || 0) + '</strong><span>南山区候选</span><small>深圳 AI 最密集</small></div>' +
        '<div class="ops-stat"><strong>2,600+</strong><span>深圳总量目标</span><small>2026 目标 3,000+</small></div>' +
      '</div>' +
      '<div class="sz-districts">' + order.map(function (name) {
        return '<span class="district-chip"><b>' + name + '</b><em>' + (d[name] || 0) + '</em></span>';
      }).join('') + '</div>' +
      '<p class="ops-note">' + icon('shield') + ' 来源：南山区“模力营”入驻名单、福田 AI 产业集群公开报道、宝安“机器人+”名单、龙岗高交会报道、坪山机器人对接会报道。所有新增候选标记为“待核验”，不把园区名录等同于已验证企业。</p>' +
    '</div>';
  }

  function downloadTemplate(type) {
    var headers;
    var example;
    if (type === 'projects') {
      headers = ['企业名称', '城市', '城区', '省份', '区域', '产业链 / 赛道', '企业状态', '是否上市', '成立年份', '团队规模', '最新融资额', '企业简介', '核心亮点', '官网', '联系人', '职位', '电话', '邮箱', '微信', '数据来源', '核验日期'];
      example = ['示例科技', '杭州', '余杭区', '浙江', '华东', '具身智能与机器人', '成长型', '否', '2022', '80', '1亿元', '一句话描述公司做什么、服务谁', '亮点1 / 亮点2', 'https://example.com', '张三', '创始人', '0571-0000-1000', 'hello001@example.com', 'demo_001', '工商信息 + 官网核对', '2026-11-01'];
    } else if (type === 'capital') {
      headers = ['机构名称', '机构类型', '城市', '关注赛道', '投资阶段', '单笔金额', '管理规模', '机构简介', '联系人', '职位', '电话', '邮箱', '微信', '官网', '代表案例', '数据来源', '核验日期', '备注'];
      example = ['示例资本', '早期 VC', '深圳', 'AI Infra / 具身智能', '天使轮 / Pre-A', '500-3000万元', '20亿元', '一句话描述', '李四', '合伙人', '0755-0000-1001', 'lp001@example.com', 'demo_001', 'https://example.com', '案例A / 案例B', '机构官网 + 人工核验', '2026-11-01', ''];
    } else {
      headers = ['姓名', '方向', '城市', '工作年限', '当前公司', '学历', '求职状态', '期望年薪', '核心技能', '合作意向', '个人简介', '电话', '邮箱', '微信', '领英 / 主页', '数据来源', '授权方式', '核验日期', '备注'];
      example = ['示例人才', '大模型算法', '杭州', '6', '示例科技', '硕士', '看机会', '80-100万元', 'RAG / Agent', '技术负责人 / 合伙人', '一句话描述', '138-0000-0000', 'talent001@example.com', 'demo_001', 'https://example.com', '本人登记', '明示同意', '2026-11-01', ''];
    }
    var csv = '\ufeff' + [headers, example].map(function (line) {
      return line.map(function (cell) { return '"' + String(cell).replace(/"/g, '""') + '"'; }).join(',');
    }).join('\r\n');
    downloadBlob(csv, 'ailink-template-' + type + '.csv', 'text/csv;charset=utf-8');
    toast('CSV 模板已下载');
  }

  /* ----------------------------------------------------------------------
     Contact / legal / saved
     ---------------------------------------------------------------------- */

  function openContact() {
    openModal(
      '<div class="modal-head"><div><h3>申请数据合作</h3><p>告诉我们你的场景，我们会用 1 个工作日回复。</p></div>' + modalCloseButton() + '</div>' +
      '<form id="contact-form" novalidate>' +
        '<div class="form-row"><div class="form-field"><label>称呼</label><input type="text" name="name" placeholder="你的名字" required></div><div class="form-field"><label>机构 / 公司</label><input type="text" name="company" placeholder="公司名称"></div></div>' +
        '<div class="form-field"><label>工作邮箱</label><input type="email" name="email" placeholder="you@company.com" required></div>' +
        '<div class="form-field"><label>合作类型</label><select name="kind"><option>数据采购 / 接入</option><option>园区 / 协会合作</option><option>机构会员</option><option>媒体 / 生态合作</option><option>其他</option></select></div>' +
        '<div class="form-field"><label>简单描述你的需求</label><textarea name="message" rows="4" placeholder="例如：我们在做杭州 AI 企业服务，希望接入项目库与邮件引擎。"></textarea></div>' +
        '<button class="btn btn-dark btn-block" type="submit">提交申请</button>' +
        '<p class="fineprint">演示环境：表单不会发送到服务器，也不会存储你的输入。</p>' +
      '</form>'
    );
  }

  function openLegal(kind) {
    var privacy = kind !== 'terms';
    var title = privacy ? '隐私政策（摘要）' : '会员服务条款（摘要）';
    var content = privacy
      ? '<p>我们只收集提供服务所必需的信息，包括账号信息、会员订单、使用记录与主动提交的联系信息。演示站点不会上传或持久化你的表单输入。</p><p style="margin-top:10px"><strong>数据来源与授权：</strong>平台中的企业与人才信息应来自公开渠道、授权数据服务商或本人主动登记；个人联系方式需有合法依据。你可以申请访问、更正、删除或撤回授权。</p><p style="margin-top:10px"><strong>Cookie 与本地存储：</strong>演示站点使用 localStorage 保存登录状态、收藏、活动记录与筛选偏好，仅存在于当前浏览器。</p><p style="margin-top:10px"><strong>联系：</strong>privacy@example.com（演示邮箱）。</p>'
      : '<p>会员仅可在授权范围内使用平台数据，不得转售、批量爬取、骚扰或用于违法用途。联系方式仅供本人所在机构的业务对接使用。</p><p style="margin-top:10px"><strong>计费：</strong>会员按所选周期计费，邮件额度按成功加入发送队列的收件人数计量；退信、重复与退订地址不计费。演示环境不产生真实扣款。</p><p style="margin-top:10px"><strong>邮件合规：</strong>发送方需确保与收件人存在合法联系依据，并遵守退订与频控规则。平台可对异常发送行为暂停服务。</p><p style="margin-top:10px"><strong>数据质量：</strong>平台持续核验但不保证所有字段实时准确；发现错误可通过纠错入口提交。</p>';
    openModal('<div class="modal-head"><div><h3>' + title + '</h3><p>最后更新：2026.11.05 · 演示文本，不构成法律意见。</p></div>' + modalCloseButton() + '</div><div style="margin-top:16px;font-size:12px;line-height:1.85;color:#405048">' + content + '</div><div class="drawer-actions"><button class="btn btn-ghost btn-block" type="button" data-action="close-modal">我知道了</button></div>');
  }

  function openSaved() {
    var items = [];
    ['projects', 'capital', 'talents'].forEach(function (type) {
      (state.bookmarks[type] || []).forEach(function (id) {
        var r = getRecord(type, id);
        if (r) items.push({ type: type, record: r });
      });
    });
    var body = items.length
      ? items.map(function (x) { return searchResultHTML(x.type, x.record); }).join('')
      : '<div class="search-empty"><strong>还没有收藏</strong><p>在项目、机构或人才卡片上点击书签图标，稍后在这里集中查看。</p></div>';
    openModal('<div class="modal-head"><div><h3>我的收藏</h3><p>共 ' + items.length + ' 条 · 仅保存在当前浏览器</p></div>' + modalCloseButton() + '</div><div class="search-body" style="padding:8px 0;max-height:56vh">' + body + '</div>');
  }

  function submitContact(form) {
    var data = new FormData(form);
    if (!String(data.get('name') || '').trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.get('email') || ''))) {
      toast('请填写称呼与有效邮箱', 'error');
      return;
    }
    closeModal();
    toast('已收到你的合作申请（演示），我们会在 1 个工作日内联系你');
  }

  /* ----------------------------------------------------------------------
     Event handling
     ---------------------------------------------------------------------- */

  function bindGlobal() {
    window.addEventListener('hashchange', function () {
      renderRoute();
      closeMobileMenu();
    });

    window.addEventListener('scroll', function () {
      var header = $('#site-header');
      if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
    }, { passive: true });

    document.addEventListener('click', handleClick);
    document.addEventListener('input', handleInput);
    document.addEventListener('change', handleChange);
    document.addEventListener('submit', handleSubmit);
    document.addEventListener('keydown', handleKeydown);
  }

  function handleClick(e) {
    if (!e.target.closest('.header-auth')) closeUserMenu();

    var overlay = e.target.closest('[data-overlay]');
    if (overlay && e.target === overlay) {
      closeDrawer();
      return;
    }
    var modalOverlay = e.target.closest('[data-modal-overlay]');
    if (modalOverlay && e.target === modalOverlay) {
      closeModal();
      return;
    }

    var actionEl = e.target.closest('[data-action]');
    if (!actionEl) return;
    var action = actionEl.getAttribute('data-action');

    switch (action) {
      case 'open-search':
        e.preventDefault();
        openSearch();
        break;
      case 'toggle-mobile':
        toggleMobileMenu();
        break;
      case 'open-auth':
        e.preventDefault();
        openAuth('login');
        break;
      case 'toggle-user-menu':
        toggleUserMenu();
        break;
      case 'logout':
        logout();
        break;
      case 'demo-toggle':
        state.demoMember = actionEl.getAttribute('data-mode') === 'member';
        var demo = $('#unlock-demo');
        if (demo) demo.innerHTML = demoCardInner(state.demoMember);
        break;
      case 'set-filter':
        e.preventDefault();
        setFilter(actionEl.getAttribute('data-type'), actionEl.getAttribute('data-key'), actionEl.getAttribute('data-value'));
        if (actionEl.getAttribute('data-scroll')) {
          setTimeout(function () {
            var anchor = $('.results-head') || $('#result-grid');
            if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 60);
        }
        break;
      case 'set-city-sector':
        e.preventDefault();
        setCitySector(actionEl.getAttribute('data-city'), actionEl.getAttribute('data-sector'));
        if (actionEl.getAttribute('data-scroll')) {
          setTimeout(function () {
            var railAnchor = $('.results-head') || $('#result-grid');
            if (railAnchor) railAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 60);
        }
        break;
      case 'reset-filters':
        resetFilters(actionEl.getAttribute('data-type'));
        break;
      case 'toggle-filters':
        var panel = $('#filter-panel');
        if (panel) {
          var open = panel.classList.toggle('is-open');
          actionEl.setAttribute('aria-expanded', String(open));
          actionEl.textContent = open ? '收起' : '筛选';
        }
        break;
      case 'pending-info':
        toast('Batch 02 待核验：当前只有企业名称、城区与初分方向，联系方式尚未采集');
        break;
      case 'show-pending':
        var pb = getFilter('projects');
        pb.pendingOnly = true;
        pb.verified = false;
        pb.page = 1;
        var pPanel = $('#filter-panel');
        if (pPanel) pPanel.innerHTML = filtersHTML('projects');
        var pBanner = $('.pending-banner');
        if (pBanner) pBanner.remove();
        renderResults('projects');
        updateCategoryChips();
        setTimeout(function () {
          var anchor = $('.results-head');
          if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 40);
        break;
      case 'export':
        exportCSV(actionEl.getAttribute('data-type'));
        break;
      case 'bookmark':
        toggleBookmark(actionEl.getAttribute('data-type'), actionEl.getAttribute('data-id'), actionEl);
        break;
      case 'copy-contact':
        var rec = getRecord(actionEl.getAttribute('data-type'), actionEl.getAttribute('data-id'));
        if (rec && hasContact(rec)) copyText(contactOf(rec).email + ' / ' + contactOf(rec).phone);
        else toast('该企业联系方式待核验，请先访问官网', 'error');
        break;
      case 'copy':
        copyText(actionEl.getAttribute('data-copy') || '');
        break;
      case 'open-detail':
        openDrawer(actionEl.getAttribute('data-type'), actionEl.getAttribute('data-id'));
        break;
      case 'close-drawer':
        closeDrawer();
        break;
      case 'close-modal':
        closeModal();
        break;
      case 'open-pricing':
        openPricing();
        break;
      case 'auth-tab':
        state.authMode = actionEl.getAttribute('data-mode');
        openModal(authModalHTML());
        break;
      case 'demo-login':
        if (actionEl.getAttribute('data-plan') === 'pro') signIn('demo@ailink.cn', '林知夏', false);
        else signIn('guest@ailink.cn', '访客体验', false);
        break;
      case 'billing':
        state.billing = actionEl.getAttribute('data-mode');
        writeJSON(LS.billing, state.billing);
        renderRoute({ scroll: false });
        break;
      case 'choose-plan':
        var planKey = actionEl.getAttribute('data-plan');
        if (planKey === 'enterprise') { openContact(); break; }
        if (!isLoggedIn()) openAuth('login', planKey);
        else openCheckout(planKey);
        break;
      case 'stay-free':
        toast('你现在是访客版，可继续浏览公开摘要');
        break;
      case 'confirm-payment':
        confirmPayment(actionEl.getAttribute('data-plan'));
        break;
      case 'topup':
        openTopup(Number(actionEl.getAttribute('data-qty')), Number(actionEl.getAttribute('data-price')));
        break;
      case 'buy-calc':
        buyCalcPack();
        break;
      case 'confirm-topup':
        confirmTopup(Number(actionEl.getAttribute('data-qty')), Number(actionEl.getAttribute('data-price')));
        break;
      case 'outreach-tab':
        switchOutreachTab(actionEl.getAttribute('data-tab'));
        break;
      case 'use-template':
        applyTemplate(actionEl.getAttribute('data-id'));
        break;
      case 'ai-generate':
        aiGenerate();
        break;
      case 'send-campaign':
        sendCampaign();
        break;
      case 'cancel-send':
        cancelSend();
        break;
      case 'view-report':
        viewReport(actionEl.getAttribute('data-id'));
        break;
      case 'use-campaign':
        useCampaign(actionEl.getAttribute('data-id'));
        break;
      case 'open-contact':
        openContact();
        break;
      case 'open-legal':
        openLegal(actionEl.getAttribute('data-legal'));
        break;
      case 'download-template':
        downloadTemplate(actionEl.getAttribute('data-type'));
        break;
      case 'search-hot':
        var input = $('#global-search');
        if (input) {
          input.value = actionEl.getAttribute('data-q');
          renderSearchResults(input.value);
          input.focus();
        }
        break;
      case 'search-open':
        var stype = actionEl.getAttribute('data-type');
        var sid = actionEl.getAttribute('data-id');
        closeModal();
        setTimeout(function () { openDrawer(stype, sid); }, 20);
        break;
      case 'outreach-from-detail':
        outreachFromDetail(actionEl.getAttribute('data-type'), actionEl.getAttribute('data-id'));
        break;
      case 'open-saved':
        e.preventDefault();
        openSaved();
        break;
      default:
        break;
    }
  }

  function handleInput(e) {
    var t = e.target;
    if (t.id === 'global-search') {
      renderSearchResults(t.value);
      return;
    }
    if (t.id === 'filter-q') {
      var ft = t.getAttribute('data-type');
      var f = getFilter(ft);
      f.q = t.value;
      f.page = 1;
      renderResults(ft);
      return;
    }
    if (t.id === 'email-volume') {
      updateCalc();
      return;
    }
    if (t.closest('#compose-form')) {
      captureComposer();
      if (t.getAttribute('data-audience') === 'q') {
        refreshAudience();
      } else {
        updatePreview();
      }
    }
  }

  function handleChange(e) {
    var t = e.target;
    var selectFilter = t.getAttribute('data-select-filter');
    if (selectFilter) {
      setFilter(t.getAttribute('data-type'), selectFilter, t.value, { rerenderFilters: false });
      return;
    }
    if (t.id === 'sort-select') {
      var type = state.route;
      var f = getFilter(type);
      f.sort = t.value;
      f.page = 1;
      renderResults(type);
      return;
    }
    if (t.id === 'verified-only') {
      var vt = state.route;
      var vf = getFilter(vt);
      vf.verified = t.checked;
      vf.page = 1;
      renderResults(vt);
      return;
    }
    if (t.id === 'listed-only') {
      var lt = state.route;
      var lf = getFilter(lt);
      lf.listedOnly = t.checked;
      lf.page = 1;
      renderResults(lt);
      return;
    }
    if (t.id === 'pending-only') {
      var pt = state.route;
      var pf = getFilter(pt);
      pf.pendingOnly = t.checked;
      if (t.checked) pf.verified = false;
      pf.page = 1;
      renderResults(pt);
      return;
    }
    if (t.getAttribute('data-audience')) {
      handleAudienceChange(t.getAttribute('data-audience'));
    }
  }

  function handleSubmit(e) {
    var form = e.target;
    if (form.id === 'auth-form') {
      e.preventDefault();
      submitAuth(form);
    } else if (form.id === 'contact-form') {
      e.preventDefault();
      submitContact(form);
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      if ($('#drawer-root') && $('#drawer-root').innerHTML.trim()) {
        closeDrawer();
      } else if ($('#modal-root') && $('#modal-root').innerHTML.trim()) {
        closeModal();
      } else {
        closeMobileMenu();
      }
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if ($('#modal-root') && $('#modal-root').innerHTML.trim()) closeModal();
      openSearch();
    }
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
      e.preventDefault();
      openSearch();
    }
  }

  function toggleBookmark(type, id, btn) {
    var list = state.bookmarks[type] || (state.bookmarks[type] = []);
    var idx = list.indexOf(id);
    if (idx >= 0) {
      list.splice(idx, 1);
      toast('已取消收藏');
    } else {
      list.push(id);
      toast('已收藏');
    }
    writeJSON(LS.bookmarks, state.bookmarks);
    if (btn) btn.classList.toggle('active', idx < 0);
    $$('[data-action="bookmark"][data-type="' + type + '"][data-id="' + id + '"]').forEach(function (el) {
      el.classList.toggle('active', idx < 0);
      if (el.classList.contains('btn')) {
        var txt = el.lastChild;
        if (txt && txt.nodeType === 3) txt.nodeValue = idx < 0 ? ' 已收藏' : ' 收藏';
      }
    });
    renderHeaderAuth();
  }

  function outreachFromDetail(type, id) {
    var r = getRecord(type, id);
    if (!r) return;
    if (!hasContact(r)) {
      if (websiteOf(r)) window.open(websiteOf(r), '_blank', 'noopener');
      toast('该企业暂无邮箱，已打开官网；补全联系方式后可发信', 'error');
      return;
    }
    closeDrawer();
    if (!isMember()) { openPricing(); return; }
    var subject = type === 'talents'
      ? '{{name}}，有一个 {{sector}} 方向的机会想和你聊聊'
      : '{{company}} × AILink｜想和你聊聊合作';
    var body = type === 'talents'
      ? '{{name}}你好，\n\n我是 AILink 智链的 {{sender}}。看到你在 {{company}} 做 {{sector}}，有一个正在组建核心团队的 AI 公司想认识你。\n\n如果方便，我可以先把团队背景与薪酬区间发你。\n\n{{sender}}'
      : '{{name}}您好，\n\n我是 AILink 智链的 {{sender}}。看到{{company}}在{{city}}做{{sector}}，想和你约 20 分钟聊聊近期的合作与对接机会。\n\n如果方便，回复一个你合适的时间即可。\n\n{{sender}}\nAILink 智链';
    state.composeDraft = {
      name: (type === 'talents' ? '人才邀约 · ' : '合作触达 · ') + r.name,
      subject: subject,
      body: body,
      audience: { type: type, region: '全部', city: r.city, q: r.name }
    };
    state.outreachTab = 'compose';
    navigate('outreach');
  }

  /* ----------------------------------------------------------------------
     Start
     ---------------------------------------------------------------------- */

  boot();
})();

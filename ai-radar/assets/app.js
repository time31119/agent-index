/* ============================================================
 * AI 雷达 · 主逻辑
 * 纯浏览器端，无构建、无依赖。直接打开 index.html 即可运行。
 * ============================================================ */

(function () {
  'use strict';

  /* ---------------- 配置 ---------------- */

  var CFG = window.RADAR_CONFIG || {};
  var SOURCES = (window.SOURCES || []).filter(function (s) { return s.enabled !== false; });
  var SPOTS = window.SPOTLIGHTS || [];
  // 重点推荐位独占的 group，不进主信息流
  var SPOT_GROUPS = {};
  SPOTS.forEach(function (s) {
    (s.groups || []).forEach(function (g) { SPOT_GROUPS[g] = true; });
  });
  var PROXIES = CFG.proxies || [];
  var REFRESH_MS = Math.max(1, CFG.refreshMinutes || 5) * 60 * 1000;
  var TIMEOUT_MS = CFG.timeoutMs || 12000;
  var PER_SOURCE = CFG.perSourceLimit || 40;
  var CACHE_LIMIT = CFG.cacheLimit || 400;

  var LS = {
    seen: 'airadar.seen.v4',
    cache: 'airadar.cache.v4',
    tab: 'airadar.tab.v4'
  };

  var GROUP_LABEL = {
    app: '新应用',
    open: '开源',
    community: '社区',
    news: '资讯'
  };

  /* ---------------- 状态 ---------------- */

  var state = {
    items: [],
    health: [],
    loading: false,
    lastUpdated: 0,
    fromCache: false,
    nextAt: 0,
    tab: 'all',
    query: '',
    onlyNew: false,
    seen: readStore(LS.seen, {}),
    newIds: {},
    baseline: false,
    painted: false
  };

  /* ---------------- DOM ---------------- */

  var $ = function (id) { return document.getElementById(id); };

  var el = {
    grid: $('grid'),
    empty: $('empty'),
    stats: $('stats'),
    statusText: $('statusText'),
    dot: $('dot'),
    countdown: $('countdown'),
    refreshBtn: $('refreshBtn'),
    readBtn: $('readBtn'),
    search: $('search'),
    onlyNew: $('onlyNew'),
    tabs: $('tabs'),
    spotlight: $('spotlight'),
    healthList: $('healthList'),
    healthSummary: $('healthSummary'),
    refreshMin: $('refreshMin')
  };

  if (el.refreshMin) el.refreshMin.textContent = String(CFG.refreshMinutes || 5);

  /* ---------------- 小工具 ---------------- */

  function readStore(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var value = JSON.parse(raw);
      // 存储被外部改坏（null、类型不符）时回退，别让一条脏数据把整页搞死
      if (value === null || value === undefined) return fallback;
      if (typeof value !== typeof fallback) return fallback;
      // typeof 分不清数组和对象：seen 存成 [] 会让已读永远写不进去
      if (Array.isArray(value) !== Array.isArray(fallback)) return fallback;
      return value;
    } catch (e) {
      return fallback;
    }
  }

  function writeStore(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* 隐私模式或存储满了：静默降级 */
    }
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // 用惰性文档把 HTML 转纯文本：不执行脚本、不发起请求
  var htmlParser = new DOMParser();

  function toText(html) {
    try {
      var doc = htmlParser.parseFromString(String(html), 'text/html');
      return doc.body ? doc.body.textContent : '';
    } catch (e) {
      return String(html).replace(/<[^>]*>/g, ' ');
    }
  }

  // 块级标签先补空格，否则 "<p>a</p><p>b</p>" 会被 textContent 粘成 "ab"
  var BLOCK_BREAK = /<\/(p|div|li|h[1-6]|blockquote|tr|td|section|article)>|<br\s*\/?>/gi;

  function htmlToPlain(str) {
    return toText(String(str).replace(BLOCK_BREAK, ' '));
  }

  function stripHtml(str) {
    if (!str) return '';
    var text = htmlToPlain(str);
    // 二次转义的 feed（&lt;p&gt;…&lt;/p&gt;）：第一遍解出来的还是标签，再剥一层
    if (/<[^>]+>|&lt;|&gt;|&amp;|&#\d+;/.test(text)) text = htmlToPlain(text);
    return text.replace(/\s+/g, ' ').trim();
  }

  function clamp(str, n) {
    if (!str) return '';
    return str.length > n ? str.slice(0, n).replace(/\s+\S*$/, '') + '…' : str;
  }

  function cleanTitle(str) {
    return stripHtml(str).replace(/\s+/g, ' ').trim();
  }

  function hash(str) {
    var h = 5381;
    for (var i = 0; i < str.length; i++) {
      h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    }
    return 'i' + (h >>> 0).toString(36);
  }

  function normUrl(url) {
    if (!url) return '';
    var s = String(url)
      .split('#')[0]
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/[?&](utm_[^&]+|ref=[^&]+|source=[^&]+)/gi, '')
      .replace(/[?&]$/, '')
      .replace(/\/$/, '');

    // 只把主机名小写，路径和 query 保持原样（?id=AbC 与 ?id=abc 是两条）
    // 注意 x.com?q=1 这种没有路径的 URL，要在 '/' 或 '?' 处切开
    var cut = s.search(/[/?]/);
    if (cut === -1) return s.toLowerCase();
    return s.slice(0, cut).toLowerCase() + s.slice(cut);
  }

  function safeHref(url) {
    return /^https?:\/\//i.test(url || '') ? url : '#';
  }

  function relTime(ts) {
    if (!ts) return '';
    var diff = Date.now() - ts;
    if (diff < 0) diff = 0;
    var min = diff / 60000;
    if (min < 1) return '刚刚';
    if (min < 60) return Math.floor(min) + ' 分钟前';
    var hour = min / 60;
    if (hour < 24) return Math.floor(hour) + ' 小时前';
    var day = hour / 24;
    if (day < 7) return Math.floor(day) + ' 天前';
    var d = new Date(ts);
    return (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日';
  }

  function clock(ts) {
    var d = new Date(ts);
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  /* ---------------- 网络层 ---------------- */

  function candidates(url) {
    var list = [url];
    PROXIES.forEach(function (p) {
      if (!p) return;
      list.push(/[=?&]$/.test(p) ? p + encodeURIComponent(url) : p + url);
    });
    return list;
  }

  function fetchText(url) {
    var list = candidates(url);
    var index = 0;

    function step() {
      if (index >= list.length) {
        return Promise.reject(new Error('直连与所有代理均失败'));
      }
      var target = list[index++];
      var controller = new AbortController();
      var timer = setTimeout(function () { controller.abort(); }, TIMEOUT_MS);

      return fetch(target, { signal: controller.signal, cache: 'no-store' })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.text();
        })
        .then(function (text) {
          if (!text || text.trim().length < 40) throw new Error('响应内容为空');
          return text;
        })
        .catch(function (err) {
          if (index >= list.length) throw err;
          return step();
        })
        .finally(function () {
          clearTimeout(timer);
        });
    }

    return step();
  }

  /* ---------------- 条目构造 ---------------- */

  function mkItem(src, raw) {
    var url = (raw.url || '').trim();
    var title = cleanTitle(raw.title);
    if (!title) return null;

    var desc = clamp(stripHtml(raw.desc || ''), 210);
    if (desc === title) desc = '';

    // 同一链接无论出自哪个源都算同一条：跨源去重、已读状态、data-id 用同一个 id
    var key = normUrl(url) || title.toLowerCase();

    return {
      id: 'k' + hash(key),
      sourceId: src.id,
      sourceName: src.name,
      group: src.group,
      title: title,
      url: safeHref(url),
      desc: desc,
      time: raw.time || 0,
      score: raw.score || 0,
      metrics: (raw.metrics || []).filter(function (m) {
        return m && m.v !== null && m.v !== undefined && m.v !== 0 && m.v !== '';
      })
    };
  }

  function dedupeSort(items) {
    var seen = {};
    var out = [];
    items.forEach(function (item) {
      if (!item) return;
      if (seen[item.id]) return;
      seen[item.id] = true;
      out.push(item);
    });
    out.sort(function (a, b) {
      return (b.time || 0) - (a.time || 0);
    });
    return out;
  }

  /* ---------------- 各类型加载器 ---------------- */

  function loadHn(src) {
    var p = src.params || {};
    var params = [
      'tags=' + encodeURIComponent(p.tags || 'story'),
      'hitsPerPage=' + (p.hitsPerPage || 30)
    ];
    if (p.query) params.unshift('query=' + encodeURIComponent(p.query));

    var url = 'https://hn.algolia.com/api/v1/search_by_date?' + params.join('&');

    return fetchText(url).then(function (text) {
      var data = JSON.parse(text);
      return (data.hits || []).map(function (h) {
        var link = h.url || ('https://news.ycombinator.com/item?id=' + h.objectID);
        return mkItem(src, {
          title: h.title,
          url: link,
          desc: h.story_text || h.comment_text || '',
          time: Date.parse(h.created_at) || 0,
          metrics: [
            { label: '▲', v: h.points },
            { label: '评论', v: h.num_comments }
          ]
        });
      });
    });
  }

  function loadGithub(src) {
    var p = src.params || {};
    var days = p.days || 7;
    var since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    var query = 'topic:' + p.topic + ' created:>' + since;
    if (p.minStars) query += ' stars:>=' + p.minStars;

    var url = 'https://api.github.com/search/repositories?q=' + encodeURIComponent(query) +
      '&sort=stars&order=desc&per_page=' + (p.perPage || 25);

    return fetchText(url).then(function (text) {
      var data = JSON.parse(text);
      if (data.message && !data.items) throw new Error(data.message);
      return (data.items || []).map(function (r) {
        return mkItem(src, {
          title: r.full_name,
          url: r.html_url,
          desc: r.description || '',
          time: Date.parse(r.created_at) || 0,
          score: r.stargazers_count || 0,
          metrics: [
            { label: '★', v: r.stargazers_count },
            { label: '', v: r.language, raw: true }
          ]
        });
      });
    });
  }

  function loadHf(src) {
    var p = src.params || {};
    var type = p.type === 'spaces' ? 'spaces' : 'models';
    var url = 'https://huggingface.co/api/' + type +
      '?sort=' + encodeURIComponent(p.sort || 'createdAt') +
      '&direction=-1&limit=' + (p.limit || 30) +
      (p.pipeline ? '&pipeline_tag=' + encodeURIComponent(p.pipeline) : '');

    return fetchText(url).then(function (text) {
      var data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error('返回格式异常');

      return data.map(function (m) {
        var isSpace = type === 'spaces';
        var desc = isSpace
          ? (m.sdk ? m.sdk + ' · Space' : 'Space')
          : [m.pipeline_tag, (m.tags || []).slice(0, 3).join(', ')].filter(Boolean).join(' · ');

        return mkItem(src, {
          title: m.id || m.modelId,
          url: 'https://huggingface.co/' + (isSpace ? 'spaces/' : '') + (m.id || m.modelId),
          desc: desc,
          time: Date.parse(m.createdAt || m.lastModified || '') || 0,
          // 下载量就是"下载量最大"的排序依据
          score: m.downloads || 0,
          metrics: [
            { label: '♥', v: m.likes },
            { label: '↓', v: m.downloads }
          ]
        });
      });
    });
  }

  function childText(node, names) {
    for (var i = 0; i < names.length; i++) {
      var found = node.getElementsByTagName(names[i]);
      if (found.length && found[0].textContent) return found[0].textContent;
    }
    return '';
  }

  function parseFeed(text) {
    var doc = new DOMParser().parseFromString(text, 'text/xml');
    if (doc.getElementsByTagName('parsererror').length) {
      throw new Error('XML 解析失败（可能被代理改写）');
    }

    var nodes = doc.getElementsByTagName('item');
    if (!nodes.length) nodes = doc.getElementsByTagName('entry');

    var items = [];
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];

      var link = '';
      var linkNodes = n.getElementsByTagName('link');
      if (linkNodes.length) {
        link = linkNodes[0].getAttribute('href') || linkNodes[0].textContent || '';
        // Atom 的 <link rel="self"> 不是正文链接，优先 rel=alternate
        for (var j = 0; j < linkNodes.length; j++) {
          var rel = linkNodes[j].getAttribute('rel');
          if (!rel || rel === 'alternate') {
            link = linkNodes[j].getAttribute('href') || linkNodes[j].textContent || link;
            break;
          }
        }
      }

      var dateRaw = childText(n, ['pubDate', 'published', 'updated', 'dc:date', 'date']);
      var parsed = dateRaw ? Date.parse(dateRaw) : 0;

      items.push({
        title: childText(n, ['title']),
        url: (link || '').trim(),
        desc: childText(n, ['description', 'summary', 'content:encoded', 'content']),
        time: isNaN(parsed) ? 0 : parsed
      });
    }
    return items;
  }

  function loadRss(src) {
    return fetchText(src.url).then(function (text) {
      return parseFeed(text).map(function (raw) {
        return mkItem(src, raw);
      });
    });
  }

  function loadSource(src) {
    var started = Date.now();
    var promise;

    switch (src.kind) {
      case 'hn': promise = loadHn(src); break;
      case 'github': promise = loadGithub(src); break;
      case 'hf': promise = loadHf(src); break;
      case 'rss': promise = loadRss(src); break;
      default: promise = Promise.reject(new Error('未知来源类型: ' + src.kind));
    }

    return promise
      .then(function (items) {
        var list = (items || []).filter(Boolean).slice(0, PER_SOURCE);
        return { id: src.id, name: src.name, ok: true, count: list.length, ms: Date.now() - started, items: list };
      })
      .catch(function (err) {
        return {
          id: src.id,
          name: src.name,
          ok: false,
          count: 0,
          ms: Date.now() - started,
          error: (err && err.message) || '请求失败',
          items: []
        };
      });
  }

  /* ---------------- 刷新 ---------------- */

  function refresh() {
    if (state.loading) return;
    state.loading = true;
    state.health = [];
    state.nextAt = Date.now() + REFRESH_MS;
    setStatus('loading', '正在拉取…');
    el.refreshBtn.disabled = true;
    if (!state.painted) renderSkeleton();

    var total = SOURCES.length;
    var acc = [];
    var arrived = 0;
    var closed = false;
    // 上一轮的结果先留着，刷新过程中列表不会塌陷成"只有刚回来的那条"
    var base = state.items.slice();

    // 每个源都独立结算：谁先回来谁先上屏，不等最慢的那个
    function commit(isFinal) {
      var failedAll = isFinal && !acc.length;
      var all = dedupeSort(failedAll ? base : acc.concat(base));

      // 重点位的条目（HF 下载榜多是老模型）不能被总量上限截掉，单独拎出来保留
      var spotItems = [];
      var rest = [];
      all.forEach(function (item) {
        if (SPOT_GROUPS[item.group]) spotItems.push(item);
        else rest.push(item);
      });
      var merged = rest.slice(0, CACHE_LIMIT).concat(spotItems);

      var fresh = {};
      if (!state.baseline) {
        merged.forEach(function (item) {
          if (SPOT_GROUPS[item.group]) return;   // 重点位的条目不参与"新增"统计
          if (!state.seen[item.id]) fresh[item.id] = true;
        });
      }

      state.items = merged;
      state.newIds = fresh;
      state.painted = true;

      if (!isFinal) {
        state.lastUpdated = Date.now();
        scheduleRender();
        return;
      }

      // 一条都没抓到：时间戳保持不动，别把旧数据冒充成刚更新的
      if (!failedAll) state.lastUpdated = Date.now();

      // 首次访问：把当前这批当作基线，之后才谈得上"新增"
      if (state.baseline && merged.length) {
        merged.forEach(function (item) { state.seen[item.id] = 1; });
        saveSeen();
        state.baseline = false;
        state.newIds = {};
      }

      if (!failedAll) {
        state.fromCache = false;
        if (merged.length) {
          writeStore(LS.cache, { ts: state.lastUpdated, items: merged });
        }
      }

      state.loading = false;
      state.nextAt = Date.now() + REFRESH_MS;
      el.refreshBtn.disabled = false;

      render();
      updateStatus();
    }

    function finish() {
      if (closed) return;
      closed = true;
      clearTimeout(watchdog);
      commit(true);
    }

    // 兜底：单源最坏要跑 (代理数+1)×超时，这里再留一档余量
    var watchdog = setTimeout(finish, (PROXIES.length + 3) * TIMEOUT_MS);

    if (!total) {
      finish();
      return;
    }

    SOURCES.forEach(function (src) {
      var task;
      try {
        task = loadSource(src);
      } catch (e) {
        // 某个 loader 同步抛错，不能拖垮其余信源
        task = Promise.resolve({
          id: src.id, name: src.name, ok: false, count: 0, ms: 0,
          error: (e && e.message) || '加载器异常', items: []
        });
      }

      task.then(function (r) {
        if (closed) return;
        acc = acc.concat(r.items);
        state.health.push(r);
        arrived++;
        if (arrived >= total) finish();
        else commit(false);
      });
    });
  }

  /* ---------------- 渲染 ---------------- */

  function renderSkeleton() {
    var html = '';
    for (var i = 0; i < 6; i++) html += '<div class="skeleton"></div>';
    el.grid.innerHTML = html;
    el.empty.hidden = true;
  }

  function visibleItems() {
    var q = state.query.trim().toLowerCase();
    return state.items.filter(function (item) {
      // 重点推荐位单独渲染，不混进主信息流，避免同一张卡出现两次
      if (SPOT_GROUPS[item.group]) return false;
      if (state.tab !== 'all' && item.group !== state.tab) return false;
      if (state.onlyNew && !state.newIds[item.id]) return false;
      if (q) {
        var hay = (item.title + ' ' + item.desc + ' ' + item.sourceName).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function metricHtml(metrics) {
    if (!metrics || !metrics.length) return '';
    return metrics.map(function (m) {
      if (m.raw) {
        return '<span class="lang">' + escapeHtml(m.v) + '</span>';
      }
      var text = (m.label ? m.label + ' ' : '') + m.v;
      return '<span>' + escapeHtml(text) + '</span>';
    }).join('');
  }

  function cardHtml(item) {
    var isNew = !!state.newIds[item.id];
    var cls = 'card' + (isNew ? ' is-new' : '');
    var chipCls = 'chip chip-' + (item.group || 'news');
    var label = GROUP_LABEL[item.group] || '资讯';

    return '' +
      '<article class="' + cls + '" data-id="' + item.id + '">' +
        '<div class="card-top">' +
          '<span class="' + chipCls + '">' + escapeHtml(label) + '</span>' +
          '<span class="src">' + escapeHtml(item.sourceName) + '</span>' +
          '<span class="right">' +
            (isNew ? '<span class="newdot" title="新增"></span>' : '') +
            '<span class="time">' + escapeHtml(relTime(item.time)) + '</span>' +
          '</span>' +
        '</div>' +
        '<h3 class="title"><a href="' + escapeHtml(item.url) + '" target="_blank" rel="noopener noreferrer">' +
          escapeHtml(item.title) + '</a></h3>' +
        (item.desc ? '<p class="desc">' + escapeHtml(item.desc) + '</p>' : '') +
        (item.metrics && item.metrics.length
          ? '<div class="meta">' + metricHtml(item.metrics) + '</div>'
          : '') +
      '</article>';
  }

  // 多个源陆续到达时，把重绘合并到下一帧，避免整棵 DOM 反复重建
  var raf = window.requestAnimationFrame
    ? window.requestAnimationFrame.bind(window)
    : function (cb) { return setTimeout(cb, 16); };
  var rafId = 0;

  function scheduleRender() {
    if (rafId) return;
    rafId = raf(function () {
      rafId = 0;
      render();
      updateStatus();
    });
  }

  function render() {
    var list = visibleItems();

    if (!list.length) {
      el.grid.innerHTML = '';
      el.empty.hidden = false;
    } else {
      el.empty.hidden = true;
      el.grid.innerHTML = list.map(cardHtml).join('');
    }

    renderStats();
    renderHealth();
    renderSpotlight();
  }

  /* ---------------- 重点推荐 ---------------- */

  function fmtNum(n) {
    if (n == null) return '';
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(n);
  }

  function renderSpotlight() {
    if (!el.spotlight) return;

    if (!SPOTS.length) {
      el.spotlight.hidden = true;
      return;
    }

    el.spotlight.hidden = false;

    el.spotlight.innerHTML = SPOTS.map(function (spot) {
      var groups = spot.groups || [];
      var pool = state.items.filter(function (item) {
        return groups.indexOf(item.group) !== -1;
      });

      // 有热度值（下载量/star）的先按热度，其余按时间
      pool.sort(function (a, b) {
        var sa = a.score || 0;
        var sb = b.score || 0;
        if (sb !== sa) return sb - sa;
        return (b.time || 0) - (a.time || 0);
      });

      var list = pool.slice(0, spot.limit || 6);

      var rows = list.length
        ? list.map(function (item) {
            return '<a class="spot-item" href="' + escapeHtml(item.url) + '" target="_blank" rel="noopener noreferrer">' +
              '<span class="spot-name">' + escapeHtml(item.title) + '</span>' +
              '<span class="spot-side">' +
                (item.score ? '<span class="spot-score">' + escapeHtml(fmtNum(item.score)) + '</span>' : '') +
                '<span class="spot-time">' + escapeHtml(relTime(item.time)) + '</span>' +
              '</span>' +
            '</a>';
          }).join('')
        : '<p class="spot-empty">还没拿到内容，稍后自动重试。</p>';

      return '<article class="spot">' +
        '<div class="spot-head">' +
          '<span class="spot-title">' + escapeHtml(spot.title) + '</span>' +
          '<span class="spot-hint">' + escapeHtml(spot.hint || '') + '</span>' +
          '<span class="spot-note">' + escapeHtml(spot.note || '') + '</span>' +
        '</div>' +
        '<div class="spot-list">' + rows + '</div>' +
      '</article>';
    }).join('');
  }

  function renderStats() {
    var total = 0;
    var spotCount = 0;
    var counts = { app: 0, open: 0, community: 0, news: 0 };

    state.items.forEach(function (i) {
      if (SPOT_GROUPS[i.group]) { spotCount++; return; }
      total++;
      counts[i.group] = (counts[i.group] || 0) + 1;
    });

    var newCount = Object.keys(state.newIds).length;
    var parts = ['共 <b>' + total + '</b> 条'];
    ['app', 'open', 'community', 'news'].forEach(function (g) {
      if (counts[g]) parts.push(GROUP_LABEL[g] + ' <b>' + counts[g] + '</b>');
    });
    if (spotCount) parts.push('重点 <b>' + spotCount + '</b> 条');
    if (newCount) parts.push('新增 <span class="hl">' + newCount + '</span> 条');

    var shown = visibleItems().length;
    if (shown !== total) parts.push('当前显示 ' + shown + ' 条');

    el.stats.innerHTML = parts.join('<span class="sep">·</span>');
  }

  function renderHealth() {
    if (!state.health.length) {
      el.healthSummary.textContent = '';
      el.healthList.innerHTML = '';
      return;
    }
    var ok = state.health.filter(function (h) { return h.ok; }).length;

    el.healthSummary.textContent = ok + '/' + state.health.length + ' 正常';

    el.healthList.innerHTML = state.health.map(function (h) {
      var msg = h.ok
        ? h.count + ' 条 · ' + h.ms + 'ms'
        : h.error;
      return '<li>' +
        '<span class="name">' + escapeHtml(h.name) + '</span>' +
        '<span class="' + (h.ok ? 'ok' : 'fail') + '">' + (h.ok ? '✓' : '✕') + '</span>' +
        '<span class="msg" title="' + escapeHtml(msg) + '">' + escapeHtml(msg) + '</span>' +
        '</li>';
    }).join('');
  }

  function setStatus(kind, text) {
    el.dot.className = 'dot ' + kind;
    el.statusText.textContent = text;
  }

  function updateStatus() {
    var total = state.items.length;
    var ok = state.health.filter(function (h) { return h.ok; }).length;

    if (state.loading) {
      setStatus('loading', '拉取中… 已收到 ' + total + ' 条');
      return;
    }

    if (!state.lastUpdated) {
      setStatus('error', '暂时没拿到数据，稍后自动重试');
      return;
    }

    var kind;
    if (!state.health.length) kind = 'warn';
    else if (ok === 0) kind = 'error';
    else if (ok < state.health.length) kind = 'warn';
    else kind = 'ok';
    var prefix = state.fromCache ? '缓存 · ' : '';
    setStatus(kind, prefix + '最近更新 ' + clock(state.lastUpdated) + ' · ' + total + ' 条');
  }

  function tick() {
    if (!state.nextAt) {
      el.countdown.textContent = '—';
      return;
    }
    var left = Math.max(0, state.nextAt - Date.now());
    var sec = Math.ceil(left / 1000);
    el.countdown.textContent = state.loading
      ? '拉取中…'
      : '下次刷新 ' + String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0');

    if (!state.loading && left <= 0 && !document.hidden) {
      refresh();
    }
  }

  /* ---------------- 已读 ---------------- */

  function saveSeen() {
    var ids = Object.keys(state.seen);
    if (ids.length > 3000) {
      var trimmed = {};
      ids.slice(ids.length - 3000).forEach(function (id) { trimmed[id] = 1; });
      state.seen = trimmed;
    }
    writeStore(LS.seen, state.seen);
  }

  function markSeen(id) {
    if (!id) return;
    state.seen[id] = 1;
    delete state.newIds[id];
    saveSeen();
  }

  /* ---------------- 事件 ---------------- */

  el.refreshBtn.addEventListener('click', refresh);

  el.readBtn.addEventListener('click', function () {
    state.items.forEach(function (i) { state.seen[i.id] = 1; });
    state.newIds = {};
    saveSeen();
    render();
    updateStatus();
  });

  el.tabs.addEventListener('click', function (e) {
    var btn = e.target.closest('.tab');
    if (!btn) return;
    Array.prototype.forEach.call(el.tabs.querySelectorAll('.tab'), function (t) {
      t.classList.toggle('is-active', t === btn);
    });
    state.tab = btn.dataset.tab;
    writeStore(LS.tab, state.tab);
    render();
  });

  var searchTimer = 0;
  el.search.addEventListener('input', function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      state.query = el.search.value;
      render();
    }, 120);
  });

  el.onlyNew.addEventListener('change', function () {
    state.onlyNew = el.onlyNew.checked;
    render();
  });

  el.grid.addEventListener('click', function (e) {
    var card = e.target.closest('.card');
    if (!card) return;
    markSeen(card.dataset.id);
    if (state.onlyNew) {
      // 只看新增时，已读的卡片应当立刻从列表消失
      render();
      return;
    }
    var dot = card.querySelector('.newdot');
    if (dot) dot.remove();
    card.classList.remove('is-new');
    renderStats();
  });

  document.addEventListener('keydown', function (e) {
    // 带修饰键的是浏览器快捷键（Ctrl+R 重新加载等），不要抢
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    var tag = (e.target.tagName || '').toLowerCase();
    var typing = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;

    if (e.key === '/' && !typing) {
      e.preventDefault();
      el.search.focus();
      el.search.select();
    } else if (e.key === 'Escape' && typing) {
      el.search.blur();
    } else if ((e.key === 'r' || e.key === 'R') && !typing) {
      e.preventDefault();
      refresh();
    }
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden || state.loading) return;
    // 切回页面时，如果已经过了预定的刷新时刻，立刻补一次
    if (state.nextAt && Date.now() >= state.nextAt) refresh();
  });

  /* ---------------- 启动 ---------------- */

  function boot() {
    var cached = readStore(LS.cache, null);
    var savedTab = readStore(LS.tab, 'all');

    // 从没读过任何东西 → 首次访问，先建立基线而不是全标"新增"
    if (!Object.keys(state.seen).length) state.baseline = true;

    if (savedTab && savedTab !== 'all') {
      // 不用拼选择器：localStorage 里的脏值会让 querySelector 直接抛错
      var tabs = el.tabs.querySelectorAll('.tab');
      var target = null;
      Array.prototype.forEach.call(tabs, function (t) {
        if (t.dataset.tab === savedTab) target = t;
      });
      if (target) {
        Array.prototype.forEach.call(tabs, function (t) {
          t.classList.toggle('is-active', t === target);
        });
        state.tab = savedTab;
      }
    }

    if (cached && Array.isArray(cached.items) && cached.items.length) {
      state.items = cached.items;
      state.lastUpdated = cached.ts || 0;
      state.fromCache = true;
      state.painted = true;

      var fresh = {};
      if (!state.baseline) {
        state.items.forEach(function (item) {
          if (!state.seen[item.id]) fresh[item.id] = true;
        });
      }
      state.newIds = fresh;

      render();
      updateStatus();
    } else {
      renderSkeleton();
      setStatus('loading', '正在首次加载…');
    }

    refresh();
    setInterval(tick, 1000);
    tick();
  }

  boot();
})();

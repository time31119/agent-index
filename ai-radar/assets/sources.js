/* ============================================================
 * AI 雷达 · 配置文件
 * 想加/删信源，只改这个文件，不用动 app.js。
 *
 * group 可选值：
 *   'app'       新应用（面向"有什么新东西能直接用"）
 *   'open'      开源模型 / 开源项目
 *   'community' 社区讨论
 *   'news'      资讯 / 论文
 *
 * kind 可选值：
 *   'hn'      Hacker News（Algolia 公开 API，无需 key，支持 CORS）
 *   'github'  GitHub 搜索 API（无需 key，匿名限流 10 次/分钟）
 *   'hf'      Hugging Face 公开 API（支持 CORS）
 *   'rss'     任意 RSS / Atom，浏览器直连不通时会自动走 CORS 代理
 * ============================================================ */

window.SOURCES = [

  /* ---------- 新应用 ---------- */
  {
    id: 'hn-show',
    name: 'Show HN',
    group: 'app',
    kind: 'hn',
    // Show HN 是"我刚做出来的东西"，比首页更早、更工程向
    params: { tags: 'show_hn', hitsPerPage: 40 },
    enabled: true
  },
  {
    id: 'producthunt',
    name: 'Product Hunt',
    group: 'app',
    kind: 'rss',
    url: 'https://www.producthunt.com/feed',
    enabled: true
  },
  {
    id: 'hf-spaces',
    name: 'HF Spaces',
    group: 'app',
    kind: 'hf',
    // Spaces = 可以直接点开就用的 AI 应用 demo，是"最新应用"最直接的信号
    params: { type: 'spaces', limit: 30 },
    enabled: true
  },

  /* ---------- 开源 ---------- */
  {
    id: 'gh-llm',
    name: 'GitHub · LLM 新项目',
    group: 'open',
    kind: 'github',
    params: { topic: 'llm', days: 7, minStars: 30, perPage: 25 },
    enabled: true
  },
  {
    id: 'gh-agent',
    name: 'GitHub · Agent 新项目',
    group: 'open',
    kind: 'github',
    params: { topic: 'ai-agents', days: 7, minStars: 20, perPage: 25 },
    enabled: true
  },
  {
    id: 'hf-models',
    name: 'HF 新模型',
    group: 'open',
    kind: 'hf',
    params: { type: 'models', limit: 30 },
    enabled: true
  },

  /* ---------- 社区 ---------- */
  {
    id: 'hn-ai',
    name: 'HN · AI 讨论',
    group: 'community',
    kind: 'hn',
    params: { query: 'AI', tags: 'story', hitsPerPage: 30 },
    enabled: true
  },
  {
    id: 'reddit-local',
    name: 'r/LocalLLaMA',
    group: 'community',
    kind: 'rss',
    url: 'https://www.reddit.com/r/LocalLLaMA/top/.rss?t=day',
    enabled: true
  },

  /* ---------- 资讯 ---------- */
  {
    id: 'jiqizhixin',
    name: '机器之心',
    group: 'news',
    kind: 'rss',
    url: 'https://www.jiqizhixin.com/rss',
    enabled: true
  },
  {
    id: 'qbitai',
    name: '量子位',
    group: 'news',
    kind: 'rss',
    url: 'https://www.qbitai.com/feed',
    enabled: true
  },
  {
    id: 'hf-blog',
    name: 'Hugging Face Blog',
    group: 'news',
    kind: 'rss',
    url: 'https://huggingface.co/blog/feed.xml',
    enabled: true
  },
  {
    id: 'openai-news',
    name: 'OpenAI News',
    group: 'news',
    kind: 'rss',
    url: 'https://openai.com/news/rss.xml',
    enabled: true
  },
  {
    id: 'arxiv-ai',
    name: 'arXiv cs.AI',
    group: 'news',
    kind: 'rss',
    url: 'https://rss.arxiv.org/rss/cs.AI',
    enabled: true
  },

  /* ---------- 重点推荐：加密 / 黄金 EA ---------- */
  {
    id: 'ea-reddit',
    name: 'r/algotrading',
    group: 'ea',
    kind: 'rss',
    url: 'https://www.reddit.com/r/algotrading/top/.rss?t=week',
    enabled: true
  },
  {
    id: 'ea-hn',
    name: 'HN · MT5',
    group: 'ea',
    kind: 'hn',
    params: { query: 'MT5', tags: 'story', hitsPerPage: 15 },
    enabled: true
  },
  {
    id: 'ea-mql5',
    name: 'MQL5 官方',
    group: 'ea',
    kind: 'rss',
    url: 'https://www.mql5.com/en/rss',
    enabled: true
  },

  /* ---------- 重点推荐：短视频制作 ---------- */
  {
    id: 'vid-t2v',
    name: 'HF 文生视频',
    group: 'video',
    kind: 'hf',
    // 按下载量排序 = 真正的"下载量最大"
    params: { type: 'models', pipeline: 'text-to-video', sort: 'downloads', limit: 12 },
    enabled: true
  },
  {
    id: 'vid-i2v',
    name: 'HF 图生视频',
    group: 'video',
    kind: 'hf',
    params: { type: 'models', pipeline: 'image-to-video', sort: 'downloads', limit: 12 },
    enabled: true
  },
  {
    id: 'vid-gh',
    name: 'GitHub · video-generation',
    group: 'video',
    kind: 'github',
    params: { topic: 'video-generation', days: 14, minStars: 15, perPage: 15 },
    enabled: true
  }

];

/* ============================================================
 * 重点推荐位（页面顶部的两块固定面板）
 * 每个面板从若干 group 里取条目，按热度（score）再按时间排序。
 * ============================================================ */
window.SPOTLIGHTS = [
  {
    id: 'ea',
    title: '交易 EA · 加密 / 黄金',
    hint: '策略、回测与工具的最新动向',
    note: '按发布时间 · MQL5 无公开下载榜单',
    groups: ['ea'],
    limit: 6
  },
  {
    id: 'video',
    title: '短视频制作',
    hint: '最新应用、模型与开源项目',
    note: '模型按下载量排序，项目按时间',
    groups: ['video'],
    limit: 6
  }
];
window.RADAR_CONFIG = {

  // 自动刷新间隔（分钟）。想更"实时"就调小，但要注意各站限流。
  refreshMinutes: 5,

  // 单个请求超时（毫秒）
  timeoutMs: 12000,

  // 浏览器直连失败时的 CORS 代理，按顺序尝试。
  // 末尾是 '=' 的按 ?url=编码 拼接，否则直接拼在后面的按原样拼接。
  // 公开代理随时可能限流/失效，失败不代表代码有问题。
  proxies: [
    'https://api.allorigins.win/raw?url=',
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://corsproxy.io/?url='
  ],

  // 最多缓存多少条到本地
  cacheLimit: 400,

  // 每个源最多保留多少条
  perSourceLimit: 40

};

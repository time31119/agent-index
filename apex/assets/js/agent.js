(function () {
  'use strict';
  const A = window.APEX, U = A.ui;
  const params = new URLSearchParams(location.search);
  const a = A.AGENTS.find(x => x.id === params.get('id')) || A.AGENTS[0];
  const idx = A.AGENTS.indexOf(a);
  document.title = a.name + ' · ' + a.zh + ' — APEX';

  const VERIFIED = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-label="已认证"><circle cx="12" cy="12" r="9" fill="currentColor" stroke="none" opacity=".14"/><path d="m8 12.3 2.6 2.6L16.2 9"/></svg>';
  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>';
  const LOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10" width="15" height="10.5" rx="2.4"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';

  const riskClass = r => (r === '低' ? 'risk-low' : r === '中' ? 'risk-mid' : 'risk-high');

  /* identity */
  document.getElementById('crumbCat').innerHTML = '<a href="agents.html?cat=' + encodeURIComponent(a.cat) + '">' + a.cat + '</a>';
  document.getElementById('detailIcon').innerHTML = U.agentIcon(a);
  document.getElementById('detailName').textContent = a.name + ' · ' + a.zh;
  document.getElementById('detailBadges').innerHTML =
    (a.verified ? '<span class="badge badge-live">' + VERIFIED + ' Verified</span>' : '') +
    (a.badge ? '<span class="badge badge-gold">' + a.badge + '</span>' : '');
  document.getElementById('detailSub').innerHTML =
    '<span>' + a.maker + '</span><span class="sep"></span>' +
    '<span class="rating">' + U.STAR + a.rating.toFixed(1) + ' <span>(' + a.reviews.toLocaleString('en-US') + ' 条评价)</span></span>' +
    '<span class="sep"></span><span>' + (a.installs / 1000).toFixed(0) + 'k 次安装</span>' +
    '<span class="version-meta"><span class="sep"></span><span class="mono" style="font-size:10.5px">v3.2.0</span></span>';
  document.getElementById('detailTagline').textContent = a.tagline;
  document.getElementById('detailStats').innerHTML =
    '<div class="ds"><b>' + a.rating.toFixed(1) + '</b><span>综合评分</span></div>' +
    '<div class="ds"><b>' + a.latency + '</b><span>首 token 延迟</span></div>' +
    '<div class="ds"><b>' + a.sla + '</b><span>可用性 SLA</span></div>' +
    '<div class="ds"><b>' + a.models.length + '</b><span>可路由模型</span></div>';

  /* tabs */
  U.$$('#tabs .tab').forEach(btn => {
    btn.addEventListener('click', () => {
      U.$$('#tabs .tab').forEach(b => b.classList.remove('is-active'));
      U.$$('.tab-panel').forEach(p => p.classList.remove('is-active'));
      btn.classList.add('is-active');
      document.getElementById('panel-' + btn.getAttribute('data-tab')).classList.add('is-active');
    });
  });

  /* overview */
  const exampleAction = (a.tags[0] || '任务') + ' · ' + (a.tags[1] || '分析');
  document.getElementById('panel-overview').innerHTML =
    '<div class="prose"><p>' + a.long + '</p></div>' +
    '<div class="panel"><div class="panel-title"><span class="num">01</span> 核心能力</div>' +
      '<ul class="highlight-list">' + a.highlights.map((h) => '<li><span class="idx" style="color:var(--live)">✓</span><span>' + h + '</span></li>').join('') + '</ul></div>' +
    '<div class="panel"><div class="panel-title"><span class="num">02</span> 运行示例</div>' +
      '<div class="run-box"><div class="run-bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span>' +
        '<span class="name">apex run ' + a.id + '</span><span class="live-tag"><span class="dot-live"></span>LIVE</span></div>' +
        '<div class="run-body">' +
          '<div class="step"><i>01</i><span>加载 Agent Passport · ' + a.scopes.length + ' 项权限已授予</span></div>' +
          '<div class="step"><i>02</i><span>路由至 <span class="ok">' + a.compute.gpu + ' · 东京</span> · 排队 0.2s</span></div>' +
          '<div class="step"><i>03</i><span>' + exampleAction + ' · 调用 2 个工具</span></div>' +
          '<div class="step"><i>04</i><span class="ok">✓ 完成 · ' + a.compute.minutes + ' 分钟 · $' + a.compute.cost.toFixed(2) + '</span></div>' +
          '<div class="step dim"><i>$</i><span class="cursor"></span></div>' +
        '</div></div>' +
      '<p class="small mt-16">示例为合成数据，用于说明计量粒度：按秒计费、按工具调用留痕。</p></div>' +
    '<div class="panel"><div class="panel-title"><span class="num">03</span> 模型与运行区域</div>' +
      '<div class="chips">' + a.models.map(m => '<span class="chip" style="cursor:default">' + m + '</span>').join('') + '</div>' +
      '<p class="small mt-16">支持自动路由：按区域合规、延迟与实时价格选择模型与算力，失败自动跨区重试。</p>' +
      '<div class="chips mt-16">' + a.regions.map(r => '<span class="tag">' + r + '</span>').join('') + '</div></div>';

  /* access */
  document.getElementById('panel-access').innerHTML =
    '<div class="prose"><p>下面的权限由智能体在 manifest 中声明，部署时可以逐项收紧或直接拒绝。所有工具调用都会记录参数、结果与耗时，并可在控制台导出。</p></div>' +
    '<div class="panel"><div class="panel-title"><span class="num">01</span> 声明的权限</div>' +
      a.scopes.map(k => {
        const s = A.SCOPES[k] || { label: k, risk: '中', desc: '' };
        return '<div class="scope-row"><span class="ico">' + LOCK + '</span><div><div class="name">' + s.label + '</div><div class="desc">' + s.desc + '</div></div>' +
          '<span class="risk ' + riskClass(s.risk) + '">' + s.risk + '风险</span></div>';
      }).join('') +
      '<p class="small mt-16">最小权限原则：未声明的能力默认拒绝，运行时无法临时提权。</p></div>' +
    '<div class="panel"><div class="panel-title"><span class="num">02</span> 数据边界</div>' +
      '<ul class="highlight-list">' +
        '<li><span class="idx">A</span><span>你的输入与输出<strong>不会用于训练</strong>任何模型，默认 30 天后删除。</span></li>' +
        '<li><span class="idx">B</span><span>数据驻留可选：欧盟、美国、中国隔离域，跨区传输需显式开启。</span></li>' +
        '<li><span class="idx">C</span><span>支持客户自持密钥（BYOK）与企业 SSO，审计日志保留 400 天。</span></li>' +
      '</ul></div>' +
    '<div class="panel"><div class="panel-title"><span class="num">03</span> 上架审计</div>' +
      '<div class="stat-row"><div class="stat-box"><div class="v">42</div><div class="l">项安全与行为审计通过</div></div>' +
      '<div class="stat-box"><div class="v">2026-10-02</div><div class="l">最近一次全量复审</div></div>' +
      '<div class="stat-box"><div class="v">0</div><div class="l">未修复的高危发现</div></div></div>' +
      '<a class="link-arrow mt-24" href="#" id="auditLink">查看审计摘要' + U.ARROW + '</a></div>';

  /* pricing */
  const isEnt = a.price.model === 'enterprise';
  const stdPrice = a.price.label;
  document.getElementById('panel-pricing').innerHTML =
    '<div class="prose"><p>订阅费用只覆盖智能体本身。底层的模型与算力按实际用量单独计费，价格与算力市场实时同步，不赚暗差价。</p></div>' +
    '<div class="panel"><div class="panel-title"><span class="num">01</span> 方案对比</div>' +
      '<table class="plan-table"><thead><tr><th>方案</th><th>包含</th><th>价格</th></tr></thead><tbody>' +
        '<tr><td><span class="plan-name">试用</span><div class="small">14 天 · 500 次任务</div></td><td>全部能力、社区支持</td><td>$0</td></tr>' +
        '<tr><td><span class="plan-name">标准</span><div class="small">' + (isEnt ? '按合同周期' : '按月订阅，随时取消') + '</div></td><td>' + a.price.note + '</td><td><strong>' + stdPrice + '</strong></td></tr>' +
        '<tr><td><span class="plan-name">企业</span><div class="small">私有部署 · SSO · 审计导出</div></td><td>专属容量、99.99% SLA、TAM</td><td>定制</td></tr>' +
      '</tbody></table></div>' +
    '<div class="panel"><div class="panel-title"><span class="num">02</span> 算力估算</div>' +
      '<p class="body">按示例任务（' + a.compute.minutes + ' 分钟 · ' + a.compute.gpu + '）估算，单次运行约 <strong>$' + a.compute.cost.toFixed(2) + '</strong>。' +
      '月运行 1,000 次约 <strong>$' + (a.compute.cost * 1000).toFixed(0) + '</strong>，已包含在下方预算中。</p>' +
      '<div class="stat-row"><div class="stat-box"><div class="v">' + a.compute.minutes + ' min</div><div class="l">单次任务平均时长</div></div>' +
      '<div class="stat-box"><div class="v">$' + a.compute.cost.toFixed(2) + '</div><div class="l">单次任务算力成本</div></div>' +
      '<div class="stat-box"><div class="v">' + a.compute.gpu + '</div><div class="l">默认算力型号</div></div></div>' +
      '<a class="link-arrow mt-24" href="compute.html">查看实时算力价格' + U.ARROW + '</a></div>';

  /* eval */
  const scores = [
    { name: '任务完成率', v: Math.min(99, 79 + a.rating * 4) },
    { name: '工具调用准确率', v: Math.min(99, 75 + a.rating * 4.6) },
    { name: '长上下文保持', v: Math.min(99, 71 + a.rating * 5.1) },
    { name: '安全与合规', v: a.verified ? 96 : 86 }
  ];
  const revs = [A.REVIEWS[idx % 9], A.REVIEWS[(idx + 3) % 9], A.REVIEWS[(idx + 6) % 9]];
  document.getElementById('panel-eval').innerHTML =
    '<div class="panel" style="border-top:0;padding-top:0;margin-top:0"><div class="panel-title"><span class="num">01</span> APEX Bench · 真实任务评测</div>' +
      '<div class="bench">' + scores.map(s =>
        '<div class="bench-row"><div class="top"><span>' + s.name + '</span><b>' + s.v.toFixed(1) + ' / 100</b></div>' +
        '<div class="track"><i style="width:' + s.v + '%"></i></div></div>').join('') + '</div>' +
      '<p class="small mt-16">评测集包含 200 个脱敏真实任务，每季度轮换 30%。成绩由平台复跑，开发者无法自报。</p></div>' +
    '<div class="panel"><div class="panel-title"><span class="num">02</span> 用户评价 <span class="small" style="margin-left:auto;font-weight:400">' + a.rating.toFixed(1) + ' · ' + a.reviews.toLocaleString('en-US') + ' 条</span></div>' +
      revs.map(r =>
        '<div class="review"><div class="review-head"><span class="review-avatar">' + r.name.slice(0, 1) + '</span>' +
        '<div><div class="review-name">' + r.name + '</div><div class="review-role">' + r.role + '</div></div>' +
        U.stars(r.stars) + '</div><p>' + r.text + '</p></div>').join('') +
      '<button class="btn btn-ghost btn-sm mt-24" id="writeReview">写一条评价</button></div>';

  /* versions */
  const versions = [
    { v: '3.2.0', d: '2026-10-18', n: '新增并行检索与引用校验；长文档解析速度提升 38%；修复在 EU 区域的时区问题。' },
    { v: '3.1.4', d: '2026-08-02', n: '修复超长上下文截断；改进对扫描版 PDF 的 OCR 准确率；权限清单更细化。' },
    { v: '3.0.0', d: '2026-05-21', n: '运行时升级至 agent@2；支持按任务计费；新增 9 个区域的自动路由。' }
  ];
  document.getElementById('panel-versions').innerHTML =
    '<div class="panel" style="border-top:0;padding-top:0;margin-top:0">' +
      versions.map(v => '<div class="version"><div class="v">v' + v.v + '<span>' + v.d + '</span></div><p>' + v.n + '</p></div>').join('') +
      '<p class="small mt-16">版本回滚即时生效，进行中的任务不会被中断。企业客户可锁定主版本。</p></div>';

  /* buy card */
  document.getElementById('buyCard').innerHTML =
    '<div class="buy-price">' + stdPrice + '</div>' +
    '<div class="buy-note">' + a.price.note + '</div>' +
    '<a class="btn btn-primary btn-block mt-16" href="console.html?agent=' + a.id + '">部署到 APEX</a>' +
    '<button class="btn btn-ghost btn-block mt-8" id="trialBtn">' + (isEnt ? '预约方案演示' : '开始 14 天试用') + '</button>' +
    '<ul class="buy-list">' +
      '<li>' + CHECK + '<span>含 $10 算力额度，超出按秒计费</span></li>' +
      '<li>' + CHECK + '<span>9 个区域 · 自动扩容 · 失败重试</span></li>' +
      '<li>' + CHECK + '<span>随时取消，未用额度按比例退回</span></li>' +
    '</ul>' +
    '<div class="buy-meta">' +
      '<div><span>开发者</span><b>' + a.maker + '</b></div>' +
      '<div><span>当前版本</span><b>v3.2.0</b></div>' +
      '<div><span>可用性 SLA</span><b>' + a.sla + '</b></div>' +
      '<div><span>上架审计</span><b>42 项通过</b></div>' +
    '</div>' +
    '<div class="flex center gap-8 mt-24 verified">' + VERIFIED + ' APEX Verified · 身份与行为已核验</div>';

  document.getElementById('trialBtn').addEventListener('click', () => {
    U.toast(isEnt ? '已收到演示预约，解决方案团队将在 1 个工作日内联系你' : '试用环境已创建 · 14 天 · 含 $10 算力额度');
  });
  document.getElementById('writeReview').addEventListener('click', () => U.toast('评价入口已打开（演示环境）'));
  document.getElementById('auditLink').addEventListener('click', (e) => {
    e.preventDefault();
    U.toast('审计摘要已生成 · 42 项检查全部通过');
  });

  /* similar */
  const pool = A.AGENTS.filter(x => x.id !== a.id);
  const same = pool.filter(x => x.cat === a.cat);
  const picks = same.concat(pool.filter(x => x.cat !== a.cat)).slice(0, 3);
  document.getElementById('similarGrid').innerHTML = picks.map(x =>
    '<a class="agent-card" href="agent.html?id=' + x.id + '">' +
      '<div class="agent-head">' + U.agentIcon(x) +
        '<div><div class="agent-name">' + x.name + (x.verified ? ' <span class="verified">' + VERIFIED + '</span>' : '') + '</div>' +
        '<div class="agent-maker">' + x.maker + ' · ' + x.cat + '</div></div>' +
        (x.badge ? '<span class="badge ' + (x.badge === '编辑精选' ? 'badge-gold' : '') + ' agent-top-badge">' + x.badge + '</span>' : '') +
      '</div>' +
      '<p class="agent-tagline">' + x.tagline + '</p>' +
      '<div class="agent-tags">' + (x.tags || []).map(t => '<span class="tag">' + t + '</span>').join('') + '</div>' +
      '<div class="agent-foot"><span class="rating">' + U.STAR + x.rating.toFixed(1) + ' <span>(' + x.reviews.toLocaleString('en-US') + ')</span></span>' +
      '<span class="price">' + x.price.label + '<span class="note">' + x.price.note + '</span></span></div>' +
    '</a>').join('');
})();


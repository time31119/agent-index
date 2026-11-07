/* ============================================================
   APEX — marketplace concept data
   Concept demo. Agent, provider and benchmark names are fictional.
   ============================================================ */

const MARKS = {
  orbit: '<circle cx="12" cy="12" r="3.1"/><ellipse cx="12" cy="12" rx="9" ry="4.3" transform="rotate(-24 12 12)"/>',
  wave: '<path d="M2.5 14c2.4 0 2.4-4 4.8-4s2.4 4 4.8 4 2.4-4 4.8-4 2.4 4 4.6 4"/><path d="M2.5 8.5c2.4 0 2.4-2 4.8-2s2.4 2 4.8 2 2.4-2 4.8-2 2.4 2 4.6 2" opacity=".45"/>',
  prism: '<path d="M12 3.2 21 20H3z"/><path d="M12 3.2V20" opacity=".5"/>',
  asterisk: '<path d="M12 2.8v18.4M4 7.4l16 9.2M20 7.4 4 16.6"/>',
  grid: '<rect x="3.2" y="3.2" width="7.2" height="7.2" rx="1.4"/><rect x="13.6" y="3.2" width="7.2" height="7.2" rx="1.4"/><rect x="3.2" y="13.6" width="7.2" height="7.2" rx="1.4"/><rect x="13.6" y="13.6" width="7.2" height="7.2" rx="1.4"/>',
  arc: '<path d="M3 19a9 9 0 0 1 18 0"/><circle cx="12" cy="6" r="2.2"/>',
  bolt: '<path d="M13.5 2.5 4.8 13.4h6.1l-.4 8.1 8.7-10.9h-6.1z"/>',
  hex: '<path d="M12 2.6 20.2 7v10L12 21.4 3.8 17V7z"/><path d="M12 7.4v9.2" opacity=".5"/>',
  lens: '<circle cx="10.6" cy="10.6" r="6.6"/><path d="m15.6 15.6 4.6 4.6"/>',
  stack: '<path d="M12 3 3.4 7.4 12 11.8l8.6-4.4z"/><path d="m3.4 12.2 8.6 4.4 8.6-4.4"/><path d="m3.4 16.8 8.6 4.4 8.6-4.4"/>',
  pulse: '<path d="M2.5 12.4h4.2l2.1-6.2 4 12.2 2.6-6h6.1"/>',
  knot: '<circle cx="9" cy="12" r="5.4"/><circle cx="15" cy="12" r="5.4"/>',
  cube: '<path d="M12 2.8 20 7.2v9.6L12 21.2 4 16.8V7.2z"/><path d="m4 7.2 8 4.4 8-4.4M12 11.6v9.6"/>',
  cross: '<path d="M12 3.2v17.6M3.2 12h17.6"/>',
  shield: '<path d="M12 2.8 20 6v6.1c0 4.7-3.4 8-8 9.1-4.6-1.1-8-4.4-8-9.1V6z"/><path d="m8.6 12 2.4 2.4 4.4-4.6"/>'
};

const SCOPES = {
  web:      { label: '公开网络检索', risk: '低', desc: '读取公开网页与文档，写入前需显式授权。' },
  files:    { label: '文件读写', risk: '中', desc: '仅限用户指定的工作区目录，操作留痕可回滚。' },
  code:     { label: '代码执行', risk: '高', desc: '在无网络或白名单网络的沙箱中运行，CPU/内存硬限额。' },
  terminal: { label: '终端命令', risk: '极高', desc: '需二次确认；默认禁用，可按项目开启。' },
  memory:   { label: '长期记忆', risk: '中', desc: '跨会话记忆，用户可查看、导出与单条删除。' },
  payments: { label: '支付与转账', risk: '极高', desc: '仅支持平台托管额度；单笔与日累计双重限额。' },
  email:    { label: '邮件收发', risk: '高', desc: '以用户身份发信需审批；收件箱只读可限域。' },
  calendar: { label: '日历读写', risk: '低', desc: '读取空闲时间；创建日程需确认。' },
  crm:      { label: 'CRM 访问', risk: '中', desc: '字段级权限，敏感字段默认脱敏。' },
  db:       { label: '数据库查询', risk: '高', desc: '只读副本优先，写操作走审批工作流。' },
  browser:  { label: '浏览器控制', risk: '高', desc: '隔离浏览器实例，不共享 Cookie 与登录态。' },
  voice:    { label: '麦克风与语音', risk: '高', desc: '实时处理不上云存储；录音需单独授权。' },
  camera:   { label: '摄像头', risk: '高', desc: '仅在前台运行时可用，画面不落盘。' },
  social:   { label: '社媒发布', risk: '中', desc: '发布前生成预览，人工确认后执行。' }
};

const CATEGORIES = [
  { name: '研究', key: 'research', svg: '<circle cx="10.8" cy="10.8" r="6.4"/><path d="m15.6 15.6 4.4 4.4"/>' },
  { name: '编程', key: 'code', svg: '<path d="m9 6.8-5.2 5.2L9 17.2M15 6.8l5.2 5.2L15 17.2"/>' },
  { name: '金融', key: 'finance', svg: '<path d="M3.5 19.5h17"/><path d="M6.5 16V9.8M11 16V5.5M15.5 16v-4.2M20 16V7.4"/>' },
  { name: '设计', key: 'design', svg: '<path d="m14.2 4.4 5.4 5.4L8 21.4H2.6v-5.4z"/><path d="m11.8 6.8 5.4 5.4"/>' },
  { name: '客服', key: 'support', svg: '<path d="M4 5.2h16v11.2H9.2L4 20.6z"/><path d="M8 9.6h8M8 12.8h4.6"/>' },
  { name: '安全', key: 'security', svg: '<path d="M12 2.8 20 6v6.1c0 4.7-3.4 8-8 9.1-4.6-1.1-8-4.4-8-9.1V6z"/><path d="m8.6 12 2.4 2.4 4.4-4.6"/>' },
  { name: '法律', key: 'legal', svg: '<path d="M12 3v18M5 7h14M7 7l-3 7h6zM17 7l-3 7h6z"/><path d="M8.6 21h6.8"/>' },
  { name: '医疗', key: 'health', svg: '<rect x="3.6" y="3.6" width="16.8" height="16.8" rx="5"/><path d="M12 8v8M8 12h8"/>' },
  { name: '营销', key: 'growth', svg: '<path d="M4 10.2v3.6h3.2l9 4.6V5.6l-9 4.6z"/><path d="M16.2 8.4a4 4 0 0 1 0 7.2"/><path d="M7.2 14.2v5.4"/>' },
  { name: '生产力', key: 'productivity', svg: '<rect x="3.5" y="3.5" width="17" height="17" rx="4.2"/><path d="m7.8 12 2.7 2.7 5.7-5.8"/>' },
  { name: '数据', key: 'data', svg: '<ellipse cx="12" cy="6.2" rx="7.2" ry="3"/><path d="M4.8 6.2v5.6c0 1.7 3.2 3 7.2 3s7.2-1.3 7.2-3V6.2"/><path d="M4.8 11.8V18c0 1.6 3.2 2.9 7.2 2.9s7.2-1.3 7.2-2.9v-6.2"/>' },
  { name: '自动化', key: 'automation', svg: '<path d="M20 11.2A8 8 0 0 0 6.4 6.4M4 4.2v5h5"/><path d="M4 12.8A8 8 0 0 0 17.6 17.6M20 19.8v-5h-5"/>' }
];

const AGENTS = [
  {
    id: 'atlas-research', name: 'Atlas Research', zh: '深度研究', maker: 'Meridian Labs', cat: '研究',
    gradient: 'g1', mark: 'orbit', rating: 4.9, reviews: 1284, installs: 82000, verified: true, badge: '编辑精选',
    tagline: '把一个问题，变成一份可引用的深度报告。',
    long: 'Atlas 会像一位严谨的分析师那样工作：拆解问题、规划检索路径、交叉验证来源，最后输出带脚注的长报告。它拒绝编造引用，找不到证据时会明确标注不确定性。',
    price: { model: 'subscription', label: '$29/月', note: '含 2,000 次检索 · 超出 $0.01/次' },
    latency: '1.8s', sla: '99.95%', models: ['GPT-5', 'Claude 4.5', 'Gemini 3'],
    scopes: ['web', 'memory', 'files'],
    highlights: ['多源交叉验证，逐条给出可点击引用', '支持 200+ 页 PDF 与私有知识库', '报告可导出 Markdown / DOCX / 幻灯片'],
    tags: ['深度检索', '长报告', '引用溯源'],
    compute: { gpu: 'H200', minutes: 4.2, cost: 0.28 }
  },
  {
    id: 'codepilot-x', name: 'CodePilot X', zh: '编程', maker: 'Northstar', cat: '编程',
    gradient: 'g5', mark: 'bolt', rating: 4.9, reviews: 3240, installs: 210000, verified: true, badge: '编辑精选',
    tagline: '读懂整个代码库，然后替你把它改对。',
    long: 'CodePilot X 在隔离容器中索引仓库、复现失败用例、提交可审查的 diff。它不会直接合并 PR——每一步改动都附带原因、影响面与回滚方案。',
    price: { model: 'subscription', label: '$39/月', note: '含 1,500 次任务 · 团队版 $29/席位' },
    latency: '0.9s', sla: '99.99%', models: ['Claude 4.5', 'GPT-5 Codex', 'DeepSeek V4'],
    scopes: ['code', 'files', 'terminal'],
    highlights: ['全仓库语义索引，跨 12 种语言', '先写测试再改代码，自动验证', '每个 PR 附带风险评估与回滚脚本'],
    tags: ['代码生成', '重构', 'Code Review'],
    compute: { gpu: 'L40S', minutes: 2.6, cost: 0.09 }
  },
  {
    id: 'sentinel', name: 'Sentinel', zh: '安全运营', maker: 'Sentinel AI', cat: '安全',
    gradient: 'g4', mark: 'hex', rating: 4.9, reviews: 420, installs: 31000, verified: true, badge: '企业首选',
    tagline: '7×24 小时盯住每一个异常信号。',
    long: 'Sentinel 聚合 SIEM、云审计与终端日志，按攻击链而非告警条数排序。每一条结论都附带证据时间线与处置建议，并可直接触发隔离剧本。',
    price: { model: 'enterprise', label: '企业报价', note: '按资产数计费 · 含私有部署' },
    latency: '0.4s', sla: '99.99%', models: ['自研 Sentinel-7B', 'GPT-5'],
    scopes: ['db', 'code', 'email'],
    highlights: ['告警降噪 96%，按攻击链聚合', '内置 400+ 处置剧本', 'SOC 2 / ISO 27001 审计导出'],
    tags: ['威胁检测', '事件响应', '合规'],
    compute: { gpu: 'H100', minutes: 0.8, cost: 0.03 }
  },
  {
    id: 'ledger', name: 'Ledger', zh: '金融分析', maker: 'Finley', cat: '金融',
    gradient: 'g8', mark: 'pulse', rating: 4.8, reviews: 612, installs: 46000, verified: true, badge: '',
    tagline: '把财报、行情与新闻，读成一张决策图。',
    long: 'Ledger 面向投研与财务团队：自动抓取财报电话会、拆解三张表、对比同业，并给出可审计的计算过程。所有数字都能回溯到原始披露文件。',
    price: { model: 'usage', label: '$0.80/次', note: '含一次完整标的分析 · 企业包年更优' },
    latency: '2.4s', sla: '99.9%', models: ['GPT-5', 'Claude 4.5'],
    scopes: ['web', 'files', 'db'],
    highlights: ['三表联动，公式全透明', '电话会逐句转写与情绪标记', '导出 Excel 模型，保留数据血缘'],
    tags: ['投研', '财报', '估值'],
    compute: { gpu: 'H200', minutes: 6.1, cost: 0.41 }
  },
  {
    id: 'canvas', name: 'Canvas', zh: '设计', maker: 'Form&Co', cat: '设计',
    gradient: 'g6', mark: 'prism', rating: 4.8, reviews: 980, installs: 63000, verified: true, badge: '编辑精选',
    tagline: '从一句 brief，到一套能交付的设计系统。',
    long: 'Canvas 生成的不只是好看的画面：它会同步产出组件、栅格、交互状态与设计 token，并直接推送到 Figma。你也可以让它按品牌规范审查现有页面。',
    price: { model: 'subscription', label: '$24/月', note: '含 500 次生成 · 商用授权' },
    latency: '3.1s', sla: '99.9%', models: ['自研 Form-3', 'Gemini 3'],
    scopes: ['files', 'web', 'memory'],
    highlights: ['品牌规范学习，风格不漂移', '输出可编辑的 Figma 组件层', '自动生成响应式与无障碍标注'],
    tags: ['UI 设计', '品牌', 'Figma'],
    compute: { gpu: 'L40S', minutes: 1.4, cost: 0.05 }
  },
  {
    id: 'tempo', name: 'Tempo', zh: '会议', maker: 'Tempo', cat: '生产力',
    gradient: 'g5', mark: 'pulse', rating: 4.8, reviews: 5600, installs: 205000, verified: true, badge: '编辑精选',
    tagline: '开完会，事情已经在做了。',
    long: 'Tempo 实时转写会议，识别决策与承诺，把 action item 直接写进 Linear、Jira 或飞书任务，并在截止日前追踪。它只在你确认后才会创建任务。',
    price: { model: 'subscription', label: '$12/月', note: '含 40 小时转写 · 团队 $9/席位' },
    latency: '0.6s', sla: '99.95%', models: ['自研 Tempo-ASR', 'GPT-5 mini'],
    scopes: ['voice', 'calendar', 'email'],
    highlights: ['说话人分离准确率 97.2%', '决策 / 承诺自动抽取', '30+ 语言实时字幕'],
    tags: ['会议记录', '任务同步', '实时转写'],
    compute: { gpu: 'L40S', minutes: 0.5, cost: 0.02 }
  },
  {
    id: 'echo-support', name: 'Echo', zh: '智能客服', maker: 'Echo Labs', cat: '客服',
    gradient: 'g10', mark: 'wave', rating: 4.7, reviews: 2100, installs: 128000, verified: true, badge: '',
    tagline: '先解决问题，再谈话术。',
    long: 'Echo 接入订单、物流与知识库，端到端处理退款、改址、催发货。遇到权限之外的操作会自动升级给人工，并附上完整上下文，用户不用重复描述。',
    price: { model: 'seat', label: '$19/席位/月', note: '含 3,000 次会话 · 按坐席扩容' },
    latency: '0.7s', sla: '99.95%', models: ['GPT-5 mini', 'Qwen 4'],
    scopes: ['crm', 'email', 'db'],
    highlights: ['首次响应中位数 11 秒', '自动执行退款等 42 种操作', '情绪识别与人工无缝接管'],
    tags: ['客服', '工单', '退款'],
    compute: { gpu: 'L40S', minutes: 0.3, cost: 0.01 }
  },
  {
    id: 'lexicon', name: 'Lexicon', zh: '法律研究', maker: 'Juris AI', cat: '法律',
    gradient: 'g3', mark: 'stack', rating: 4.7, reviews: 310, installs: 22000, verified: true, badge: '',
    tagline: '判例、法条与合同，一次对齐。',
    long: 'Lexicon 覆盖中国、美国与欧盟主要法域，检索真实判例与监管处罚，输出带引用的法律备忘录。它会明确区分「法条」「判例」与「观点」，不混淆效力层级。',
    price: { model: 'subscription', label: '$45/月', note: '含 300 次检索 · 律所版按席位' },
    latency: '2.0s', sla: '99.9%', models: ['Claude 4.5', 'GPT-5'],
    scopes: ['web', 'files', 'memory'],
    highlights: ['1.2 亿份判例与监管文书', '效力层级与时效自动校验', '备忘录一键生成引用格式'],
    tags: ['判例检索', '合规', '合同'],
    compute: { gpu: 'H200', minutes: 3.4, cost: 0.23 }
  },
  {
    id: 'clinic-copilot', name: 'Clinic Copilot', zh: '临床文书', maker: 'Helio Health', cat: '医疗',
    gradient: 'g12', mark: 'cross', rating: 4.8, reviews: 180, installs: 18000, verified: true, badge: '合规认证',
    tagline: '把问诊时间，还给病人。',
    long: 'Clinic Copilot 在医生授权下生成门诊病历、医嘱与随访计划，术语遵循 ICD-11 与院内模板。它不做诊断建议，所有输出必须由执业医师签署。',
    price: { model: 'enterprise', label: '企业报价', note: '私有化部署 · 按院区授权' },
    latency: '1.2s', sla: '99.99%', models: ['自研 Helio-Med', 'GPT-5'],
    scopes: ['voice', 'files', 'memory'],
    highlights: ['符合电子病历书写规范', '数据不出院区，全链路加密', '医生签署前不可写入 HIS'],
    tags: ['病历生成', '随访', '私有化'],
    compute: { gpu: 'H100', minutes: 0.7, cost: 0.03 }
  },
  {
    id: 'lingua', name: 'Lingua', zh: '翻译', maker: 'Lingua', cat: '生产力',
    gradient: 'g7', mark: 'arc', rating: 4.8, reviews: 4200, installs: 156000, verified: true, badge: '',
    tagline: '翻译的是语气，不只是词。',
    long: 'Lingua 支持 96 种语言与 40 种文体，保留术语表、排版与品牌语气。适合合同、界面文案与文学作品——它会告诉你哪些地方存在不可译的双关。',
    price: { model: 'usage', label: '$0.02/千字', note: '术语库与记忆库免费' },
    latency: '0.4s', sla: '99.95%', models: ['自研 Lingua-70B', 'GPT-5'],
    scopes: ['files', 'web'],
    highlights: ['96 种语言，40 种文体', '术语表与翻译记忆一致', '保留原始排版与标记'],
    tags: ['多语言', '本地化', '术语库'],
    compute: { gpu: 'L40S', minutes: 0.2, cost: 0.01 }
  },
  {
    id: 'dataweaver', name: 'DataWeaver', zh: '数据分析', maker: 'Loom Data', cat: '数据',
    gradient: 'g2', mark: 'grid', rating: 4.7, reviews: 640, installs: 74000, verified: true, badge: '',
    tagline: '问一句话，得到可复现的分析。',
    long: '连接数仓后，DataWeaver 把自然语言问题翻译成 SQL，执行、校验、画图，并保留完整查询血缘。发现口径冲突时，它会先问你，而不是猜。',
    price: { model: 'subscription', label: '$59/月', note: '含 5 个数据源 · 每源 $10' },
    latency: '1.6s', sla: '99.9%', models: ['GPT-5', 'DeepSeek V4'],
    scopes: ['db', 'code', 'files'],
    highlights: ['SQL 生成 + 结果自校验', '指标口径集中管理', '看板与洞察自动生成'],
    tags: ['Text-to-SQL', 'BI', '指标'],
    compute: { gpu: 'H100', minutes: 1.1, cost: 0.04 }
  },
  {
    id: 'automata', name: 'Automata', zh: '流程自动化', maker: 'Automata', cat: '自动化',
    gradient: 'g9', mark: 'knot', rating: 4.6, reviews: 1520, installs: 91000, verified: false, badge: '',
    tagline: '把重复的 40 步，变成一句话。',
    long: 'Automata 观察你的日常操作，提出自动化建议，生成可审阅的流程图再执行。它支持 1,200+ 应用连接器，失败步骤会自动重试并通知。',
    price: { model: 'subscription', label: '$19/月', note: '含 10,000 次步骤执行' },
    latency: '0.8s', sla: '99.9%', models: ['GPT-5 mini', 'Llama 4'],
    scopes: ['browser', 'email', 'files'],
    highlights: ['1,200+ 连接器', '流程图先审后跑', '失败重试与人工兜底'],
    tags: ['RPA', '工作流', '连接器'],
    compute: { gpu: 'L40S', minutes: 0.4, cost: 0.01 }
  },
  {
    id: 'tutor', name: 'Tutor', zh: '学习教练', maker: 'Scholar', cat: '研究',
    gradient: 'g10', mark: 'lens', rating: 4.7, reviews: 2300, installs: 120000, verified: true, badge: '',
    tagline: '不给你答案，教你如何得到答案。',
    long: 'Tutor 根据你的目标拆解学习路径，用苏格拉底式提问推进，并定期用间隔重复检验掌握度。它明确拒绝代写作业，但会陪你逐段修改。',
    price: { model: 'subscription', label: '$15/月', note: '含全部学科 · 学生五折' },
    latency: '0.9s', sla: '99.9%', models: ['GPT-5', 'Gemini 3'],
    scopes: ['files', 'web', 'memory'],
    highlights: ['自适应学习路径', '间隔重复与掌握度模型', '作业辅导而非代写'],
    tags: ['教育', '辅导', '学习计划'],
    compute: { gpu: 'L40S', minutes: 0.3, cost: 0.01 }
  },
  {
    id: 'growthloop', name: 'GrowthLoop', zh: '增长营销', maker: 'GrowthLoop', cat: '营销',
    gradient: 'g11', mark: 'asterisk', rating: 4.6, reviews: 870, installs: 58000, verified: true, badge: '',
    tagline: '从洞察到投放，一个闭环。',
    long: 'GrowthLoop 分析渠道数据、生成素材变体、做小流量实验，再把胜出方案规模化。所有素材都标注 AI 生成，并避开平台禁止的宣传用语。',
    price: { model: 'subscription', label: '$49/月', note: '含 20 个实验 · 素材不限量' },
    latency: '1.4s', sla: '99.9%', models: ['GPT-5', '自研 Loop-8B'],
    scopes: ['web', 'social', 'db'],
    highlights: ['多变量素材实验', '广告合规预检', '归因与增量测算'],
    tags: ['投放', '素材', 'A/B 测试'],
    compute: { gpu: 'L40S', minutes: 0.6, cost: 0.02 }
  },
  {
    id: 'pilot', name: 'Pilot', zh: '网页操作', maker: 'Pilot', cat: '自动化',
    gradient: 'g7', mark: 'orbit', rating: 4.6, reviews: 780, installs: 67000, verified: true, badge: '',
    tagline: '替你打开浏览器，把事办完。',
    long: 'Pilot 在隔离浏览器中完成订票、报销、比价、填表等跨站任务。支付类动作一律暂停等待确认，并保留每一步截图与 DOM 证据。',
    price: { model: 'subscription', label: '$29/月', note: '含 500 次任务' },
    latency: '1.1s', sla: '99.9%', models: ['GPT-5', 'Claude 4.5'],
    scopes: ['browser', 'files', 'memory'],
    highlights: ['跨站任务编排', '支付前强制人工确认', '全步骤截图与回放'],
    tags: ['Browser Use', '订票', '填表'],
    compute: { gpu: 'L40S', minutes: 0.9, cost: 0.03 }
  },
  {
    id: 'sheetly', name: 'Sheetly', zh: '表格智能', maker: 'Grid', cat: '数据',
    gradient: 'g2', mark: 'grid', rating: 4.7, reviews: 540, installs: 44000, verified: false, badge: '',
    tagline: '让 Excel 听懂人话。',
    long: 'Sheetly 在表格内直接工作：清洗、透视、建模、写公式，并解释每一步。它兼容 Excel 与 Google Sheets，宏与公式保持原生可编辑。',
    price: { model: 'subscription', label: '$18/月', note: '含 2,000 次操作' },
    latency: '0.8s', sla: '99.9%', models: ['GPT-5 mini', 'Qwen 4'],
    scopes: ['files', 'code'],
    highlights: ['原生公式，不留黑箱', '脏数据自动识别', '透视与图表一句话生成'],
    tags: ['Excel', '清洗', '建模'],
    compute: { gpu: 'L40S', minutes: 0.2, cost: 0.01 }
  },
  {
    id: 'deck', name: 'Deck', zh: '演示文稿', maker: 'Deck', cat: '设计',
    gradient: 'g1', mark: 'prism', rating: 4.8, reviews: 1120, installs: 52000, verified: true, badge: '',
    tagline: '先想清楚，再做得好看。',
    long: 'Deck 从结论出发搭建叙事结构，再生成版式与图表。它内置 60 套投资人、销售与内部汇报模板，所有图表数据可回到源表。',
    price: { model: 'subscription', label: '$16/月', note: '含 100 份演示' },
    latency: '2.2s', sla: '99.9%', models: ['GPT-5', 'Gemini 3'],
    scopes: ['files', 'web'],
    highlights: ['金字塔叙事结构检查', '60 套专业模板', '导出 PPTX / Keynote / PDF'],
    tags: ['PPT', '叙事', '图表'],
    compute: { gpu: 'L40S', minutes: 0.7, cost: 0.02 }
  },
  {
    id: 'vox', name: 'Vox', zh: '语音交互', maker: 'Vox', cat: '生产力',
    gradient: 'g6', mark: 'wave', rating: 4.8, reviews: 1900, installs: 88000, verified: true, badge: '',
    tagline: '能打断、会等待的电话坐席。',
    long: 'Vox 提供低延迟语音对话，支持打断、方言与情绪回应，可接入电话与 SIP。通话录音与转写默认加密保存 30 天，可按合规策略关闭。',
    price: { model: 'usage', label: '$0.06/分钟', note: '含转写与号码' },
    latency: '320ms', sla: '99.95%', models: ['自研 Vox-ASR', 'GPT-5 mini'],
    scopes: ['voice', 'calendar', 'crm'],
    highlights: ['320ms 端到端延迟', '方言与中英混说', '通话摘要与质检评分'],
    tags: ['语音', '呼叫中心', '实时'],
    compute: { gpu: 'L40S', minutes: 0.1, cost: 0.005 }
  },
  {
    id: 'clause', name: 'Clause', zh: '合同审查', maker: 'Clause', cat: '法律',
    gradient: 'g3', mark: 'stack', rating: 4.7, reviews: 390, installs: 27000, verified: true, badge: '',
    tagline: '在签字之前，找到那三处风险。',
    long: 'Clause 对照你的标准条款库逐条比对，标出偏离与缺失，并按风险等级给出修改建议。它支持 28 种语言的双语合同。',
    price: { model: 'subscription', label: '$35/月', note: '含 200 份合同' },
    latency: '1.9s', sla: '99.9%', models: ['Claude 4.5', 'GPT-5'],
    scopes: ['files', 'memory'],
    highlights: ['偏离度逐条标注', '标准条款库可训练', '双语合同对照'],
    tags: ['合同', '风险', '条款库'],
    compute: { gpu: 'H100', minutes: 0.9, cost: 0.03 }
  },
  {
    id: 'vector', name: 'Vector', zh: '供应链', maker: 'Vector', cat: '数据',
    gradient: 'g8', mark: 'grid', rating: 4.5, reviews: 120, installs: 12000, verified: false, badge: '',
    tagline: '在断货之前，看见它。',
    long: 'Vector 融合订单、库存与公开物流信号，预测缺货与延误，并给出调拨方案。模型会标明预测区间，而不是只给一个漂亮数字。',
    price: { model: 'enterprise', label: '企业报价', note: '按 SKU 规模计费' },
    latency: '1.5s', sla: '99.9%', models: ['自研 Vector-TS', 'GPT-5 mini'],
    scopes: ['db', 'web', 'email'],
    highlights: ['缺货提前 14 天预警', '多仓调拨建议', '预测区间与回测报告'],
    tags: ['预测', '库存', '物流'],
    compute: { gpu: 'H100', minutes: 2.1, cost: 0.08 }
  },
  {
    id: 'regula', name: 'Regula', zh: '合规审查', maker: 'Regula', cat: '法律',
    gradient: 'g4', mark: 'shield', rating: 4.7, reviews: 95, installs: 9000, verified: true, badge: '企业首选',
    tagline: '把监管条文，变成可执行的清单。',
    long: 'Regula 跟踪 EU AI Act、GDPR、中国生成式 AI 管理办法等法规更新，将适用条款映射到产品功能，输出差距分析与整改工单。',
    price: { model: 'enterprise', label: '企业报价', note: '含法规订阅与审计支持' },
    latency: '2.6s', sla: '99.9%', models: ['Claude 4.5', 'GPT-5'],
    scopes: ['web', 'files', 'db'],
    highlights: ['12 个法域持续跟踪', '条款到功能的双向映射', '审计证据包一键导出'],
    tags: ['合规', 'AI Act', '审计'],
    compute: { gpu: 'H100', minutes: 1.8, cost: 0.07 }
  },
  {
    id: 'talent', name: 'Talent', zh: '招聘', maker: 'Talent', cat: '生产力',
    gradient: 'g11', mark: 'lens', rating: 4.5, reviews: 210, installs: 16000, verified: false, badge: '',
    tagline: '把简历变成结构化证据。',
    long: 'Talent 解析简历与作品集，按岗位能力模型打分并给出证据引用。它默认隐藏姓名、性别与年龄，降低无意识偏见。',
    price: { model: 'seat', label: '$25/席位/月', note: '含 500 份简历解析' },
    latency: '1.0s', sla: '99.9%', models: ['GPT-5 mini', 'Qwen 4'],
    scopes: ['files', 'email', 'crm'],
    highlights: ['盲筛模式默认开启', '能力项证据引用', '面试问题自动生成'],
    tags: ['招聘', '简历', '面试'],
    compute: { gpu: 'L40S', minutes: 0.3, cost: 0.01 }
  },
  {
    id: 'forge', name: 'Forge', zh: '工业仿真', maker: 'Forge', cat: '自动化',
    gradient: 'g12', mark: 'cube', rating: 4.5, reviews: 64, installs: 7000, verified: true, badge: '',
    tagline: '在数字世界里，先把零件造坏一百次。',
    long: 'Forge 用自然语言配置边界条件与材料参数，调用求解器完成结构、热与流体仿真，并生成可追溯的报告。它适合早期方案筛选，不替代最终工程校核。',
    price: { model: 'enterprise', label: '企业报价', note: '按求解核时计费' },
    latency: '4.2s', sla: '99.9%', models: ['自研 Forge-Sim', 'GPT-5'],
    scopes: ['files', 'code', 'db'],
    highlights: ['自然语言配置仿真', '求解任务自动排队', '结果与参数全血缘'],
    tags: ['仿真', 'CAE', '工业'],
    compute: { gpu: 'H100', minutes: 18.0, cost: 0.66 }
  },
  {
    id: 'persona', name: 'Persona', zh: '角色与叙事', maker: 'Story', cat: '设计',
    gradient: 'g9', mark: 'orbit', rating: 4.6, reviews: 3200, installs: 73000, verified: false, badge: '',
    tagline: '一个记得住前情的角色。',
    long: 'Persona 为游戏、品牌与教育场景创建长期一致的角色，维护人物关系与世界观记忆。支持多角色同场对话与剧情分支管理。',
    price: { model: 'subscription', label: '$9/月', note: '含 10 个角色 · 无限对话' },
    latency: '0.7s', sla: '99.9%', models: ['GPT-5 mini', 'Llama 4'],
    scopes: ['memory', 'files'],
    highlights: ['长期人设一致性', '多角色关系图谱', '剧情分支可视化'],
    tags: ['角色', '叙事', '游戏'],
    compute: { gpu: 'L40S', minutes: 0.2, cost: 0.01 }
  }
];

const GPUS = [
  {
    id: 'b200', name: 'NVIDIA B200', short: 'B200', vendor: 'NVIDIA', cat: '训练 / 旗舰',
    mem: '192 GB HBM3e', bw: '8.0 TB/s', compute: '4.5 PFLOPS FP4',
    price: 5.99, spot: 3.49, stock: 72, total: 512, badge: '旗舰',
    note: '大规模预训练与高吞吐推理的首选，NVLink 5 互联。'
  },
  {
    id: 'gb200', name: 'NVIDIA GB200 NVL72', short: 'GB200', vendor: 'NVIDIA', cat: '超节点',
    mem: '192 GB / GPU', bw: '13.4 TB/s', compute: '72 GPU 单域',
    price: 8.9, spot: 5.2, stock: 36, total: 288, badge: '超节点',
    note: '机柜级 72 GPU 单域，面向万亿参数模型与 MoE 推理。'
  },
  {
    id: 'h200', name: 'NVIDIA H200 SXM', short: 'H200', vendor: 'NVIDIA', cat: '推理 / 微调',
    mem: '141 GB HBM3e', bw: '4.8 TB/s', compute: '1.98 PFLOPS FP8',
    price: 3.49, spot: 1.99, stock: 412, total: 1024, badge: '最受欢迎',
    note: '大模型推理的性价比甜点，141GB 显存可单卡承载更长上下文。'
  },
  {
    id: 'h100', name: 'NVIDIA H100 SXM', short: 'H100', vendor: 'NVIDIA', cat: '训练 / 推理',
    mem: '80 GB HBM3', bw: '3.35 TB/s', compute: '1.98 PFLOPS FP8',
    price: 2.19, spot: 1.29, stock: 640, total: 1536, badge: '',
    note: '通用性最好的一代，适合中小规模训练与批量推理。'
  },
  {
    id: 'mi300x', name: 'AMD Instinct MI300X', short: 'MI300X', vendor: 'AMD', cat: '推理 / 大显存',
    mem: '192 GB HBM3', bw: '5.3 TB/s', compute: '1.3 PFLOPS FP16',
    price: 1.99, spot: 1.09, stock: 288, total: 768, badge: '高性价比',
    note: '192GB 单卡显存，长上下文与多模型并发的成本优势明显。'
  },
  {
    id: 'l40s', name: 'NVIDIA L40S', short: 'L40S', vendor: 'NVIDIA', cat: '推理 / 图形',
    mem: '48 GB GDDR6', bw: '864 GB/s', compute: '0.73 PFLOPS FP8',
    price: 0.89, spot: 0.49, stock: 520, total: 1200, badge: '',
    note: '视觉、语音与中小模型推理的经济型选择。'
  },
  {
    id: 'a100', name: 'NVIDIA A100 80GB', short: 'A100', vendor: 'NVIDIA', cat: '训练 / 通用',
    mem: '80 GB HBM2e', bw: '2.0 TB/s', compute: '0.31 PFLOPS FP16',
    price: 1.29, spot: 0.69, stock: 180, total: 900, badge: '',
    note: '成熟稳定，适合迁移存量工作负载与教学科研。'
  },
  {
    id: 'rtx4090', name: 'NVIDIA RTX 4090', short: '4090', vendor: 'NVIDIA', cat: '边缘推理',
    mem: '24 GB GDDR6X', bw: '1.0 TB/s', compute: '0.33 PFLOPS FP8',
    price: 0.39, spot: 0.21, stock: 240, total: 2000, badge: '边缘',
    note: '部署在 12 个边缘节点，适合低延迟的端侧智能体。'
  }
];

const REGIONS = [
  { id: 'us-east', code: 'US-E', city: '弗吉尼亚', mult: 1.0, latency: '12 ms', green: false },
  { id: 'us-west', code: 'US-W', city: '俄勒冈', mult: 0.96, latency: '18 ms', green: true },
  { id: 'eu-central', code: 'EU-C', city: '法兰克福', mult: 1.06, latency: '21 ms', green: false },
  { id: 'eu-north', code: 'EU-N', city: '斯德哥尔摩', mult: 0.92, latency: '24 ms', green: true },
  { id: 'ap-northeast', code: 'AP-NE', city: '东京', mult: 1.09, latency: '28 ms', green: false },
  { id: 'ap-southeast', code: 'AP-SE', city: '新加坡', mult: 1.07, latency: '31 ms', green: false },
  { id: 'cn-north', code: 'CN-N', city: '北京 · 隔离域', mult: 1.02, latency: '35 ms', green: false },
  { id: 'me-south', code: 'ME-S', city: '迪拜', mult: 1.11, latency: '48 ms', green: false },
  { id: 'sa-east', code: 'SA-E', city: '圣保罗', mult: 1.13, latency: '62 ms', green: false }
];

const PROVIDERS = [
  { name: 'Helios Cloud', region: 'US-E · US-W', gpus: 'B200 / H200 / H100', capacity: '42,000', sla: '99.99%' },
  { name: 'Northwind Compute', region: 'EU-C · EU-N', gpus: 'GB200 / H200', capacity: '26,500', sla: '99.99%' },
  { name: 'Vantage DC', region: 'AP-NE · AP-SE', gpus: 'H200 / MI300X', capacity: '18,200', sla: '99.95%' },
  { name: 'Meridian Compute', region: 'US-E · SA-E', gpus: 'H100 / L40S', capacity: '31,000', sla: '99.95%' },
  { name: 'EdgeGrid', region: '全球边缘 · 12 节点', gpus: '4090 / L40S', capacity: '9,600', sla: '99.9%' },
  { name: 'Sovereign Cloud', region: 'CN-N · ME-S', gpus: 'H200 / H100', capacity: '12,800', sla: '99.99%' }
];

const REVIEWS = [
  { name: '林砚', role: '券商研究总监', text: '它把三天的行业梳理压缩到 40 分钟，而且每条结论都能回到原文。团队现在把它当作初稿标配，人只做最后判断。', stars: 5 },
  { name: 'Sofia M.', role: 'Product Lead, Berlin', text: 'We shipped the migration a week early. The diffs were boringly correct — exactly what you want from an agent.', stars: 5 },
  { name: '陈默', role: '独立开发者', text: '从试用到部署只花了 6 分钟，算力和权限一次配好。以前光配环境就要半天。', stars: 5 },
  { name: 'Daniel K.', role: 'CTO, Series B SaaS', text: 'Security review was the shortest we have ever done. Every scope is documented, revocable, and logged.', stars: 4 },
  { name: '周遥', role: '消费品牌创始人', text: '客服首次响应从 9 分钟降到 11 秒，退款这种敏感操作也可以设成人工确认。', stars: 5 },
  { name: 'Priya S.', role: 'Operations Manager', text: 'By Friday the weekly report ran itself. The best part is that I can see exactly which step failed.', stars: 4 },
  { name: '高远', role: '制造业数字化负责人', text: '私有部署加数据不出境，这是我们敢把它放进生产环境的前提。', stars: 5 },
  { name: 'Marc A.', role: 'Growth Lead', text: 'The eval scores are honest, which is rare. We switched from a bigger name and never looked back.', stars: 5 },
  { name: '许清', role: '医院信息科', text: '审计日志细到每一次工具调用，合规部门一次就过了。', stars: 5 }
];

const PAGES = [
  { title: '智能体商店', desc: '按任务、行业与预算发现 12,400+ 个智能体', url: 'agents.html', kind: '页面' },
  { title: '算力市场', desc: 'B200 / H200 / MI300X 现货与预留，9 个区域', url: 'compute.html', kind: '页面' },
  { title: '部署控制台', desc: '选择智能体与算力，5 分钟上线', url: 'console.html', kind: '页面' },
  { title: '开发者中心', desc: '发布、定价、分成与算力补贴', url: 'developers.html', kind: '页面' },
  { title: '平台规划', desc: '市场、架构、商业模式与路线图', url: 'blueprint.html', kind: '页面' }
];

/* normalize optional fields used by detail & console pages */
AGENTS.forEach(a => {
  if (!a.regions) a.regions = ['全球', '欧盟', '中国'];
});

window.APEX = {
  MARKS, SCOPES, CATEGORIES, AGENTS, GPUS, REGIONS, PROVIDERS, REVIEWS, PAGES
};

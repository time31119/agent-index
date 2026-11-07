/* 短视频生成器索引 2026 — 数据层
   价格口径：公开挂牌价或测评实付价，美元按 1:7.2 粗算；版本迭代快，以官网为准。 */

window.SITE_DATA = {
  updated: "2026.11.03",
  stats: [
    { value: 33, suffix: "", label: "款工具" },
    { value: 11, suffix: "", label: "个视频模型" },
    { value: 0.09, suffix: " 元/秒", label: "最低单价", decimals: 2 },
    { value: 100, suffix: "×", label: "模型价差" }
  ],

  picks: ["seedance-25", "kling-40", "vidu-q4"],

  tools: [
    {
      id: "seedance-25", name: "即梦 Seedance 2.5", en: "Seedance 2.5", vendor: "字节跳动 · 即梦",
      cat: "model", featured: true, rating: 5.0, badge: "编辑首选", released: "2026-07-31",
      tagline: "30 秒一镜到底，4K 直出，参考素材管够",
      desc: "把单次生成拉到 30 秒，支持多轮延长与时间戳级编辑；一次可投喂 30 张图、10 段视频、10 段音频，多镜头叙事的一致性是当前第一梯队。代价是贵：4K 档约 1.8 美元/秒。",
      chips: ["4–30s", "4K", "原生音频", "30 图参考"],
      specs: [
        { k: "单次时长", v: "4–30 秒，可多轮延长" },
        { k: "最高画质", v: "4K（480p–4K）" },
        { k: "音频", v: "原生音画同步" },
        { k: "参考输入", v: "30 图 + 10 视频 + 10 音频" },
        { k: "编辑", v: "时间戳级、绿幕、运镜重写" }
      ],
      price: "¥2.6–13 / 秒", priceNote: "720p $0.36/s；4K $1.80/s",
      bestFor: "预算充足、要「一条过」的短剧与广告",
      caution: "贵，30 秒直出废片率不低；批量项目建议 5–10 秒镜头",
      url: "https://jimeng.jianying.com", tags: ["30秒", "4K", "原生音频", "短剧", "广告"]
    },
    {
      id: "kling-40", name: "可灵 Kling 4.0", en: "Kling 4.0", vendor: "快手 · 可灵",
      cat: "model", featured: true, rating: 4.9, badge: "全能主力", released: "2026-10-15",
      tagline: "4K 10bit HDR，7 个主体同框不串脸",
      desc: "10 月 15 日全量上线，支持 4K/1080p 10-bit HDR、单次 30 秒、最多 10 图 + 5 视频 + 7 主体组合；长镜头与连续叙事见长，中文口型和物理细节稳，是国内团队最稳的全能选择。",
      chips: ["3–30s", "4K HDR", "立体声", "7 主体"],
      specs: [
        { k: "单次时长", v: "3–30 秒" },
        { k: "最高画质", v: "4K / 1080p 10-bit HDR" },
        { k: "音频", v: "同步立体声" },
        { k: "参考输入", v: "10 图 + 5 视频 + 7 主体" },
        { k: "特色", v: "长镜头、连续叙事、智能分镜" }
      ],
      price: "¥1.1–1.7 / 秒", priceNote: "720p $0.157/s；1080p $0.235/s",
      bestFor: "国内团队的全能主力：短剧、广告、口播都能打",
      caution: "4K 档开放范围以官方为准；高峰期排队",
      url: "https://klingai.com", tags: ["30秒", "4K", "原生音频", "短剧", "多主体"]
    },
    {
      id: "hailuo-h3", name: "海螺 H3", en: "MiniMax H3", vendor: "MiniMax · 海螺",
      cat: "model", rating: 4.7, badge: "性价比", released: "2026-07-31",
      tagline: "画面和声音一起生，口型直接对",
      desc: "7 月 31 日发布，原生音画同步：台词、环境音、脚步声一次生成；4–15 秒、768P/2K，33B 权重开源，可私有化部署。做数字人口播和对白场景，能省掉配音与对轴两步。",
      chips: ["4–15s", "2K", "原生音画", "可私有化"],
      specs: [
        { k: "单次时长", v: "4–15 秒" },
        { k: "最高画质", v: "768P / 2K" },
        { k: "音频", v: "原生音画同步，口型对齐" },
        { k: "参考输入", v: "9 图 + 3 视频 + 3 音频" },
        { k: "开源性", v: "33B 权重，社区许可" }
      ],
      price: "¥0.6–0.9 / 秒", priceNote: "768P $0.08/s；2K $0.13/s",
      bestFor: "口播、对白、需要私有化部署的团队",
      caution: "最长 15 秒；长镜头人物会漂，必须逐条检查",
      url: "https://hailuoai.video", tags: ["15秒", "2K", "原生音频", "开源", "口播"]
    },
    {
      id: "wan-30", name: "通义万相 Wan 3.0", en: "Wan 3.0", vendor: "阿里巴巴 · 通义",
      cat: "model", rating: 4.5, badge: "低成本", released: "2026-09",
      tagline: "把试错成本打到 5 美分一秒",
      desc: "2–30 秒、480p 草稿档是全场最便宜的正式模型；1080p 也只有 0.2 美元/秒。适合大批量先跑量、再挑片精修，也是做分镜预演的性价比之选。",
      chips: ["2–30s", "480p 草稿", "原生音频", "最便宜"],
      specs: [
        { k: "单次时长", v: "2–30 秒" },
        { k: "最高画质", v: "480p / 720p / 1080p" },
        { k: "音频", v: "原生音频" },
        { k: "参考输入", v: "10 图 + 5 视频 + 5 音频" },
        { k: "特色", v: "480p 草稿档、开源生态" }
      ],
      price: "¥0.36–1.44 / 秒", priceNote: "480p $0.05/s；1080p $0.20/s",
      bestFor: "大批量、草稿预演、成本优先的项目",
      caution: "画质天花板不如 Seedance/Kling，适合草稿不适合终稿",
      url: "https://tongyi.aliyun.com/wanxiang/", tags: ["30秒", "草稿", "低成本", "开源"]
    },
    {
      id: "vidu-q4", name: "Vidu Q4", en: "Vidu Q4 Preview", vendor: "生数科技 · Vidu",
      cat: "model", featured: true, rating: 4.6, badge: "价格杀手", released: "2026-10-09",
      tagline: "0.09 元一秒，15 张参考图",
      desc: "10 月 9 日发布的预览版，15 图 + 3 段参考音频、2K/4K、10bit；表演与镜头语言提升明显，首发价把旗舰模型拉进「分」级计价区间。漫剧和广告团队的价格敏感型选择。",
      chips: ["2K/4K", "10bit", "15 图参考", "0.09 元/秒"],
      specs: [
        { k: "最高画质", v: "2K / 4K，10bit 色深" },
        { k: "音频", v: "原生音频，3 段参考音色" },
        { k: "参考输入", v: "15 图 + 3 音频" },
        { k: "特色", v: "人物演绎、复杂视效、动态运镜" },
        { k: "状态", v: "Preview，能力持续更新" }
      ],
      price: "¥0.09 / 秒起", priceNote: "首发优惠价，随时回调",
      bestFor: "漫剧、广告、低成本高清批量",
      caution: "预览版稳定性一般；优惠价是拉新手段，别写进长期成本",
      url: "https://www.vidu.cn", tags: ["4K", "低价", "漫剧", "多参考"]
    },
    {
      id: "pixverse-v6", name: "PixVerse V6", en: "PixVerse V6", vendor: "爱诗科技 · PixVerse",
      cat: "model", rating: 4.4, badge: "风格化", released: "2026-04",
      tagline: "图生视频榜首，动漫和奇幻最能打",
      desc: "SuperCLUE 4 月中文图生视频第一；物理真实感、动漫、奇幻风格突出，1–15 秒、最高 1080p，按条计费门槛低。适合风格化短片和特效镜头。",
      chips: ["1–15s", "1080p", "动漫/奇幻", "按条计费"],
      specs: [
        { k: "单次时长", v: "1–15 秒" },
        { k: "最高画质", v: "1080p" },
        { k: "音频", v: "可选生成" },
        { k: "参考输入", v: "图 / 视频" },
        { k: "强项", v: "物理真实感、动漫、奇幻" }
      ],
      price: "¥0.32 / 条起", priceNote: "$0.045/次起",
      bestFor: "动漫、特效、风格化短视频",
      caution: "写实人物一致性一般，不适合长叙事",
      url: "https://pixverse.ai", tags: ["动漫", "风格化", "低价", "图生视频"]
    },
    {
      id: "happyhorse-11", name: "HappyHorse 1.1", en: "HappyHorse 1.1", vendor: "阿里巴巴",
      cat: "model", rating: 4.4, badge: "电影感", released: "2026-10",
      tagline: "文生视频榜第一，镜头调度像导演",
      desc: "4 月登顶文生视频榜，10 月更新 1.1；文本语义、镜头调度、动态生成见长，480p–1080p，阿里云百炼可直接调 API，适合纯文生和电影感镜头。",
      chips: ["480p–1080p", "纯文生", "镜头调度", "API"],
      specs: [
        { k: "最高画质", v: "480p / 720p / 1080p" },
        { k: "输入", v: "纯文本" },
        { k: "强项", v: "语义理解、镜头调度、电影感" },
        { k: "接入", v: "阿里云百炼 API" },
        { k: "定位", v: "文生视频专用" }
      ],
      price: "¥0.45–1.19 / 秒", priceNote: "480p $0.062/s；1080p $0.165/s",
      bestFor: "纯文生、电影感镜头、API 集成",
      caution: "不支持图生/参考，控制力弱于多模态模型",
      url: "https://bailian.console.aliyun.com", tags: ["文生视频", "电影感", "API"]
    },
    {
      id: "veo-31", name: "Veo 3.1", en: "Veo 3.1", vendor: "Google DeepMind",
      cat: "model", rating: 4.5, badge: "出海首选", released: "2025-10-15",
      tagline: "原生音频 + 对象级编辑，YouTube 直通",
      desc: "8 秒片段可续接，1080p、原生音频、对象级编辑；和 Flow、YouTube Shorts 打通，是出海团队最稳的海外选项。Veo 4 至今未发布，Google 把重心转向了 Gemini Omni。",
      chips: ["8s 可续接", "1080p", "原生音频", "Shorts"],
      specs: [
        { k: "单次时长", v: "8 秒，可串联延长" },
        { k: "最高画质", v: "1080p" },
        { k: "音频", v: "原生对白 / 音效" },
        { k: "编辑", v: "对象级增删改" },
        { k: "生态", v: "Flow、YouTube Shorts" }
      ],
      price: "¥1.1–2.9 / 秒", priceNote: "API $0.15–0.40/s",
      bestFor: "出海 YouTube / TikTok、需要原生英文音频",
      caution: "国内访问与企业结算有门槛",
      url: "https://deepmind.google/models/veo/", tags: ["出海", "原生音频", "YouTube", "对象编辑"]
    },
    {
      id: "gemini-omni", name: "Gemini Omni", en: "Gemini Omni", vendor: "Google",
      cat: "model", rating: 4.3, badge: "新形态", released: "2026-05-19",
      tagline: "对话式改片，Shorts 里直接生成",
      desc: "5 月 I/O 发布，Gemini 推理层 + 生成媒体栈；Omni Flash 先上 10 秒，支持数字分身与自然语言改片，全部带 SynthID 水印。Omni Pro 面向广告与专业制作，尚未开放。",
      chips: ["10s", "多模态", "对话式编辑", "SynthID"],
      specs: [
        { k: "单次时长", v: "10 秒（Flash）" },
        { k: "输入", v: "文 / 图 / 音 / 视频" },
        { k: "编辑", v: "自然语言对话式修改" },
        { k: "安全", v: "SynthID 数字水印" },
        { k: "入口", v: "Gemini、Flow、YouTube Shorts" }
      ],
      price: "Gemini 订阅内", priceNote: "Omni Pro 未发布",
      bestFor: "普通用户、Shorts 快速创作、对话式改片",
      caution: "时长和精细控制有限，专业交付还看 Veo/Runway",
      url: "https://gemini.google.com", tags: ["海外", "对话式", "数字人", "Shorts"]
    },
    {
      id: "runway-45", name: "Runway Gen-4.5", en: "Gen-4.5", vendor: "Runway",
      cat: "model", rating: 4.2, badge: "专业工作流", released: "2026-06",
      tagline: "运动质量和运镜，专业组的老朋友",
      desc: "主打运动质量、提示词遵循和视觉保真，适合影视 previs、广告分镜；工作流和团队协作成熟，和后期管线衔接顺。",
      chips: ["短片", "1080p+", "运动质量", "团队协作"],
      specs: [
        { k: "单次时长", v: "短片（以官网为准）" },
        { k: "最高画质", v: "1080p+" },
        { k: "强项", v: "运动质量、提示词遵循" },
        { k: "工作流", v: "分镜、预演、团队协作" },
        { k: "定位", v: "专业影视 / 广告" }
      ],
      price: "订阅制", priceNote: "按套餐与积分",
      bestFor: "影视 previs、广告分镜、专业团队",
      caution: "性价比不如国产模型，中文场景支持一般",
      url: "https://runwayml.com", tags: ["专业", "运镜", "广告", "影视"]
    },
    {
      id: "grok-imagine-15", name: "Grok Imagine 1.5", en: "Grok Imagine 1.5", vendor: "xAI",
      cat: "model", rating: 4.0, badge: "社交快创", released: "2026-09",
      tagline: "在 X 里刷到就能改，声音也能克隆",
      desc: "参考图 + 声音克隆，生成快、社交属性强；适合热点跟拍和快速试错，不适合精细交付。",
      chips: ["短片段", "参考图", "声音克隆", "X 内直接用"],
      specs: [
        { k: "输入", v: "文本 / 参考图" },
        { k: "音频", v: "声音克隆" },
        { k: "入口", v: "X / Grok" },
        { k: "定位", v: "社交内容快速试错" }
      ],
      price: "X 订阅内", priceNote: "随订阅档位",
      bestFor: "热点跟拍、社交内容、快速试错",
      caution: "精细控制弱，商用授权需确认",
      url: "https://grok.com", tags: ["社交", "快速", "声音克隆"]
    },

    {
      id: "xiaoyunque", name: "小云雀 AI", en: "Xiaoyunque", vendor: "字节跳动 · 剪映",
      cat: "agent", rating: 4.2, badge: "新手友好", released: "2026-04",
      tagline: "一句话，生成一集剧",
      desc: "唯一支持一句话生成剧本的 Agent：人设、大纲、分镜、视频一条龙。39 元/月 1200 积分，Fast 模式 11 积分/秒；适合快速验证，不适合上线级精品。",
      chips: ["一句话剧本", "线性工作流", "39 元/月", "1200 积分"],
      specs: [
        { k: "入口", v: "网页 / 剪映生态" },
        { k: "能力", v: "剧本→人设→分镜→视频" },
        { k: "计费", v: "39 元/月，1200 积分" },
        { k: "视频消耗", v: "Fast 11 积分/秒；普通 14 积分/秒" },
        { k: "适合", v: "1 分钟内的快速成片" }
      ],
      price: "¥39 / 月", priceNote: "超出按积分包",
      bestFor: "新手、快速验证选题、1 分钟短内容",
      caution: "角色图和设定常对不上；做不了上线级精品",
      search: "小云雀AI 短剧 Agent 官网", tags: ["一站式", "新手", "低价", "短剧"]
    },
    {
      id: "nadou-pro", name: "纳逗 Pro", en: "Nadou Pro", vendor: "爱奇艺",
      cat: "agent", rating: 4.0, badge: "影视质感", released: "2026-03",
      tagline: "分镜提示词最像专业剧组",
      desc: "景别、构图、运镜、音效写得最专业，画面质量在线；但偏艺术短片，对强剧情短剧理解弱，积分消耗不透明。",
      chips: ["影视级分镜", "画面质量", "积分不透明", "测评 110 元"],
      specs: [
        { k: "能力", v: "剧本、分镜、生图、生视频" },
        { k: "强项", v: "景别 / 构图 / 运镜 / 音效提示词" },
        { k: "计费", v: "积分制，消耗不透明" },
        { k: "实测", v: "一集约 110 元" },
        { k: "适合", v: "艺术短片、预告片" }
      ],
      price: "按积分", priceNote: "实测一集约 ¥110",
      bestFor: "艺术短片、预告、影视质感镜头",
      caution: "黑箱、不可中断；生成顺序随机，筛选麻烦",
      search: "爱奇艺 纳逗Pro AI短剧", tags: ["一站式", "影视", "分镜"]
    },
    {
      id: "wondershare-juchang", name: "万兴剧厂", en: "Wondershare Juchang", vendor: "万兴科技",
      cat: "agent", rating: 4.1, badge: "漫剧流水线", released: "2026-01",
      tagline: "漫剧流水线，镜头衔接顺",
      desc: "剧本→角色/场景资产→智能分镜→视频，支持生成音乐音效；对 Seedance 依赖强，过审看运气。100 元/1000 积分。",
      chips: ["剧本导入", "资产库", "智能分镜", "100 元起"],
      specs: [
        { k: "能力", v: "剧本→资产→分镜→视频→音频" },
        { k: "计费", v: "100 元 / 1000 积分" },
        { k: "视频成本", v: "Seedance 2.0 最低 1.2 元/秒" },
        { k: "强项", v: "镜头衔接、分镜提示词" },
        { k: "适合", v: "漫剧 / 短剧团队" }
      ],
      price: "¥100 起", priceNote: "1000 积分",
      bestFor: "已有剧本的漫剧 / 短剧团队",
      caution: "分镜过于集中时容易崩；Seedance 失败会卡流程",
      search: "万兴剧厂 AI漫剧 官网", tags: ["一站式", "短剧", "漫剧", "资产库"]
    },
    {
      id: "tiangong", name: "天工短剧工作台", en: "Tiangong", vendor: "昆仑万维",
      cat: "agent", rating: 3.8, badge: "工作流顺", released: "2026-04",
      tagline: "工作流顺，但模型池偏窄",
      desc: "支持传统分镜与一键生成，道具识别细；2026-04 时 Agent 内不支持 Seedance 2.0，画面容易 PPT 感。200 元/1000 积分。",
      chips: ["双模式", "道具识别", "200 元起", "模型池窄"],
      specs: [
        { k: "能力", v: "剧本解析、资产、分镜、视频" },
        { k: "计费", v: "200 元 / 1000 积分" },
        { k: "强项", v: "工作流顺、道具识别细" },
        { k: "短板", v: "Agent 内模型选择少" },
        { k: "适合", v: "已有剧本、想跑通流程的团队" }
      ],
      price: "¥200 起", priceNote: "1000 积分",
      bestFor: "已有剧本、需要规范工作流的团队",
      caution: "模型池窄，成片质感可能落后一代",
      search: "昆仑万维 天工短剧工作台", tags: ["一站式", "短剧", "工作流"]
    },
    {
      id: "jurilu", name: "巨日禄", en: "Jurilu", vendor: "巨日禄",
      cat: "agent", rating: 3.7, badge: "批量漫剧", released: "2025-06",
      tagline: "漫剧批量老玩家",
      desc: "市占率高、爆款多，但需要自备剧本、角色、场景资产，适合有储备的批量团队，小白上手成本高。",
      chips: ["批量漫剧", "需自备资产", "市占率高", "团队向"],
      specs: [
        { k: "能力", v: "漫剧批量生产" },
        { k: "前置", v: "自备剧本、角色、场景资产" },
        { k: "优势", v: "市占率高、爆款经验" },
        { k: "适合", v: "有资产储备的批量团队" }
      ],
      price: "按项目", priceNote: "团队报价",
      bestFor: "有资产储备的漫剧批量团队",
      caution: "对新手不友好，试错成本高",
      search: "巨日禄 AI漫剧 官网", tags: ["一站式", "漫剧", "批量"]
    },
    {
      id: "libtv", name: "LibTV", en: "LibTV", vendor: "演语科技",
      cat: "agent", rating: 4.2, badge: "高频工作台", released: "2026-05",
      tagline: "生图 + 生视频 + Seedance 代理",
      desc: "高频创作者的工作台，代理 Seedance 2.5 补贴价 0.24–0.27 元/秒；价格随补贴波动，适合需要大量抽卡的工作室。",
      chips: ["生图+视频", "Seedance 代理", "0.24 元/秒", "补贴价"],
      specs: [
        { k: "能力", v: "生图、生视频、工作流" },
        { k: "价格", v: "Seedance 2.5 补贴价 0.24–0.27 元/秒" },
        { k: "适合", v: "高频抽卡、工作室" },
        { k: "风险", v: "补贴随时回调" }
      ],
      price: "¥0.24–0.27 / 秒", priceNote: "补贴价，非长期",
      bestFor: "高频调用、想压低 Seedance 成本的工作室",
      caution: "依赖上游补贴，长期用量建议走官方 API",
      search: "LibTV AI视频 官网", tags: ["一站式", "低价", "Seedance"]
    },
    {
      id: "seedance-studio", name: "Seedance Studio", en: "Seedance Studio", vendor: "火山引擎",
      cat: "agent", rating: 4.0, badge: "内测", released: "2026-10",
      tagline: "官方工作台，参数最全",
      desc: "字节官方 Seedance 工作台，模型最新、参数最全；目前内测，适合字节生态深度用户。",
      chips: ["官方", "内测", "参数最全", "火山引擎"],
      specs: [
        { k: "状态", v: "内测" },
        { k: "能力", v: "Seedance 全系模型" },
        { k: "入口", v: "火山引擎" },
        { k: "适合", v: "企业 / 深度用户" }
      ],
      price: "内测", priceNote: "以官方为准",
      bestFor: "字节生态企业用户、需要最新参数",
      caution: "内测资格与稳定性未知",
      search: "Seedance Studio 火山引擎 内测", tags: ["内测", "官方", "企业"]
    },
    {
      id: "huhao-ai", name: "虎鲸 AI", en: "Huhao AI", vendor: "阿里大文娱",
      cat: "agent", rating: 3.6, badge: "内测", released: "2026-10",
      tagline: "阿里系视频创作工具",
      desc: "优酷/阿里生态的 AI 视频创作工具，内测阶段，主打剧集与短剧生产。",
      chips: ["内测", "阿里生态", "剧集", "短剧"],
      specs: [
        { k: "状态", v: "内测" },
        { k: "生态", v: "优酷 / 阿里大文娱" },
        { k: "定位", v: "剧集 / 短剧生产" }
      ],
      price: "内测", priceNote: "以官方为准",
      bestFor: "阿里生态内的剧集 / 短剧团队",
      caution: "公开信息少，能力待验证",
      search: "虎鲸AI 阿里大文娱 视频", tags: ["内测", "阿里", "短剧"]
    },
    {
      id: "workrally", name: "WorkRally", en: "WorkRally", vendor: "腾讯视频",
      cat: "agent", rating: 3.6, badge: "内测", released: "2026-10",
      tagline: "腾讯系 AI 视频工具",
      desc: "腾讯视频自研，面向剧集/短剧生产，内测阶段，和腾讯视频生态打通。",
      chips: ["内测", "腾讯视频", "剧集", "短剧"],
      specs: [
        { k: "状态", v: "内测" },
        { k: "生态", v: "腾讯视频" },
        { k: "定位", v: "剧集 / 短剧" }
      ],
      price: "内测", priceNote: "以官方为准",
      bestFor: "腾讯生态内的剧集团队",
      caution: "公开信息少，能力待验证",
      search: "WorkRally 腾讯视频 AI", tags: ["内测", "腾讯", "短剧"]
    },

    {
      id: "jianying-script", name: "剪映「图文成片」", en: "CapCut Script", vendor: "字节跳动 · 剪映",
      cat: "script", rating: 4.5, badge: "免费", released: "2024-01",
      tagline: "文案进去，成片出来",
      desc: "免费、最快：输入文案自动配音、配画面、加字幕，适合口播、资讯日更。质量取决于文案和素材库匹配度。",
      chips: ["免费", "文案成片", "自动配音", "自动字幕"],
      specs: [
        { k: "输入", v: "文案 / 文章链接" },
        { k: "输出", v: "配音 + 素材 + 字幕" },
        { k: "价格", v: "免费" },
        { k: "适合", v: "口播、资讯、日更" }
      ],
      price: "免费", priceNote: "会员增强素材库",
      bestFor: "口播、资讯、日更，零成本起步",
      caution: "素材库同质化，容易撞片",
      url: "https://www.capcut.cn", tags: ["免费", "口播", "图文成片"]
    },
    {
      id: "dujia", name: "度加 AI", en: "Dujia AI", vendor: "百度",
      cat: "script", rating: 4.0, badge: "百家号生态", released: "2024-06",
      tagline: "百家号生态的图文转视频",
      desc: "文案生成视频，百家号分发顺手，适合知识分享和资讯类内容。",
      chips: ["免费/会员", "图文转视频", "百家号", "知识分享"],
      specs: [
        { k: "输入", v: "文案 / 图文" },
        { k: "生态", v: "百家号" },
        { k: "价格", v: "免费 + 会员" }
      ],
      price: "免费 / 会员", priceNote: "高级功能付费",
      bestFor: "百家号创作者、知识分享",
      caution: "成片模板感强，适合日更不适合品牌片",
      url: "https://aigc.baidu.com", tags: ["免费", "图文成片", "知识"]
    },
    {
      id: "tencent-zhiying", name: "腾讯智影", en: "Tencent Zhiying", vendor: "腾讯",
      cat: "script", rating: 4.0, badge: "数字人播报", released: "2023-09",
      tagline: "在线剪辑 + 数字人播报",
      desc: "云端剪辑、数字人、配音一体，企业口播和课程常用；无需装软件。",
      chips: ["云端剪辑", "数字人", "配音", "企业口播"],
      specs: [
        { k: "能力", v: "在线剪辑、数字人、配音" },
        { k: "价格", v: "免费 + 会员" },
        { k: "适合", v: "企业口播、课程" }
      ],
      price: "免费 / 会员", priceNote: "数字人按时长计费",
      bestFor: "企业口播、课程、新闻播报",
      caution: "数字人形象偏商务，做不了剧情内容",
      url: "https://zenvideo.qq.com", tags: ["数字人", "口播", "免费"]
    },
    {
      id: "yizhen", name: "一帧秒创", en: "Yizhen Miaochuang", vendor: "一帧秒创",
      cat: "script", rating: 3.9, badge: "批量生产", released: "2023-03",
      tagline: "图文转视频，批量生产",
      desc: "图文/文章转视频、AI 配音，营销号批量内容常用，模板多。",
      chips: ["图文转视频", "AI 配音", "模板多", "批量"],
      specs: [
        { k: "输入", v: "图文 / 文章" },
        { k: "输出", v: "配音 + 画面 + 字幕" },
        { k: "价格", v: "免费 + 会员" }
      ],
      price: "免费 / 会员", priceNote: "按条/会员",
      bestFor: "营销号、批量内容生产",
      caution: "模板化明显，原创度低",
      search: "一帧秒创 官网", tags: ["图文成片", "批量", "营销"]
    },
    {
      id: "xunfei", name: "讯飞智作", en: "iFlytek Zhizuo", vendor: "科大讯飞",
      cat: "script", rating: 4.0, badge: "多语种", released: "2023-05",
      tagline: "虚拟主播和多语种配音",
      desc: "虚拟人播报、多语种 TTS，培训和新闻播报场景稳，语音质量是强项。",
      chips: ["虚拟主播", "多语种", "TTS", "培训"],
      specs: [
        { k: "能力", v: "虚拟人播报、多语种配音" },
        { k: "强项", v: "语音合成质量" },
        { k: "价格", v: "按需 / 企业" }
      ],
      price: "按需", priceNote: "企业报价",
      bestFor: "培训、新闻播报、多语种口播",
      caution: "视频生成能力弱，偏音频+数字人",
      url: "https://peiyin.xunfei.cn", tags: ["数字人", "配音", "多语种"]
    },

    {
      id: "capcut", name: "剪映 / CapCut", en: "CapCut", vendor: "字节跳动",
      cat: "edit", rating: 4.8, badge: "必备", released: "2020-04",
      tagline: "主力剪辑，智能字幕和模板",
      desc: "免费 + 会员，智能字幕、模板、数字人、图文成片；国内和出海都好用，是绝大多数短视频的最后一站。",
      chips: ["免费/会员", "智能字幕", "模板", "数字人"],
      specs: [
        { k: "能力", v: "剪辑、字幕、模板、数字人、图文成片" },
        { k: "平台", v: "Win / Mac / iOS / Android" },
        { k: "价格", v: "免费 + 会员" }
      ],
      price: "免费 / 会员", priceNote: "会员解锁素材与功能",
      bestFor: "所有短视频的最终剪辑与包装",
      caution: "模板同质化，注意版权音乐",
      url: "https://www.capcut.cn", tags: ["免费", "剪辑", "字幕", "必备"]
    },
    {
      id: "opus-clip", name: "Opus Clip", en: "Opus Clip", vendor: "Opus",
      cat: "edit", rating: 4.4, badge: "长转短", released: "2023-04",
      tagline: "长视频切成高光短片",
      desc: "自动找高光、加字幕、排版，免费–$29/月，适合播客/访谈分发。",
      chips: ["长转短", "自动高光", "字幕", "$0–29/月"],
      specs: [
        { k: "输入", v: "长视频 / 播客" },
        { k: "输出", v: "多条竖屏短片" },
        { k: "价格", v: "免费–$29/月" }
      ],
      price: "$0–29 / 月", priceNote: "按积分",
      bestFor: "播客、访谈、直播切片分发",
      caution: "中文识别与高光判断一般",
      url: "https://www.opus.pro", tags: ["长转短", "切片", "订阅"]
    },
    {
      id: "klap", name: "Klap", en: "Klap", vendor: "Klap",
      cat: "edit", rating: 4.0, badge: "批量切片", released: "2023-06",
      tagline: "长转短，批量分发",
      desc: "TikTok/Shorts/Reels 批量切片，订阅制，适合矩阵号。",
      chips: ["批量切片", "多平台", "订阅制"],
      specs: [
        { k: "输入", v: "YouTube / 长视频" },
        { k: "输出", v: "多平台竖屏短片" },
        { k: "价格", v: "订阅制" }
      ],
      price: "订阅制", priceNote: "按月/积分",
      bestFor: "矩阵号、批量分发",
      caution: "模板化，需要二次包装",
      url: "https://klap.app", tags: ["切片", "批量", "订阅"]
    },
    {
      id: "vizard", name: "Vizard", en: "Vizard", vendor: "Vizard",
      cat: "edit", rating: 3.9, badge: "团队协作", released: "2023-03",
      tagline: "长转短 + 团队协作",
      desc: "切片、字幕、品牌模板，订阅制，适合小团队协作。",
      chips: ["长转短", "品牌模板", "团队协作"],
      specs: [
        { k: "能力", v: "切片、字幕、品牌模板" },
        { k: "价格", v: "订阅制" }
      ],
      price: "订阅制", priceNote: "按月",
      bestFor: "小团队、品牌内容分发",
      caution: "功能与 Opus 重叠，选一个即可",
      url: "https://vizard.ai", tags: ["切片", "团队", "订阅"]
    },
    {
      id: "descript", name: "Descript", en: "Descript", vendor: "Descript",
      cat: "edit", rating: 4.2, badge: "文本剪辑", released: "2017-12",
      tagline: "像改文档一样改视频",
      desc: "文本驱动剪辑、自动转录、填词补录，适合口播和教程。",
      chips: ["文本剪辑", "自动转录", "补录", "口播"],
      specs: [
        { k: "能力", v: "文本剪辑、转录、AI 补录" },
        { k: "价格", v: "订阅制" }
      ],
      price: "订阅制", priceNote: "按月",
      bestFor: "口播、教程、访谈精剪",
      caution: "中文支持一般，重剪辑不如 PR/达芬奇",
      url: "https://www.descript.com", tags: ["口播", "剪辑", "订阅"]
    },
    {
      id: "submagic", name: "Submagic", en: "Submagic", vendor: "Submagic",
      cat: "edit", rating: 4.1, badge: "字幕动效", released: "2023-02",
      tagline: "动态字幕和 B-roll",
      desc: "字幕动效、关键词高亮、音效，短视频完播率工具。",
      chips: ["动态字幕", "关键词高亮", "B-roll", "音效"],
      specs: [
        { k: "能力", v: "动态字幕、B-roll、音效" },
        { k: "价格", v: "订阅制" }
      ],
      price: "订阅制", priceNote: "按月",
      bestFor: "口播、带货的包装提效",
      caution: "只做包装，不解决内容",
      url: "https://www.submagic.co", tags: ["字幕", "包装", "订阅"]
    },
    {
      id: "heygen", name: "HeyGen", en: "HeyGen", vendor: "HeyGen",
      cat: "edit", rating: 4.5, badge: "数字人", released: "2022-11",
      tagline: "Avatar V 数字人，多语种口播",
      desc: "数字人分身、口型同步、翻译配音，出海口播常用；Avatar V 的动作和表情更自然。",
      chips: ["数字人", "口型同步", "多语种", "出海"],
      specs: [
        { k: "能力", v: "数字人、翻译配音、口型同步" },
        { k: "价格", v: "订阅制" },
        { k: "适合", v: "出海口播、批量本地化" }
      ],
      price: "订阅制", priceNote: "按分钟/套餐",
      bestFor: "出海口播、多语种本地化",
      caution: "数字人仍有恐怖谷，重要内容建议真人",
      url: "https://www.heygen.com", tags: ["数字人", "出海", "口播"]
    },
    {
      id: "synthesia", name: "Synthesia", en: "Synthesia", vendor: "Synthesia",
      cat: "edit", rating: 4.2, badge: "企业培训", released: "2017-09",
      tagline: "企业培训数字人",
      desc: "企业级数字人视频，合规和团队协作完善，适合培训和内部沟通。",
      chips: ["企业级", "数字人", "培训", "合规"],
      specs: [
        { k: "能力", v: "企业数字人视频" },
        { k: "价格", v: "企业版" }
      ],
      price: "企业版", priceNote: "按席位/分钟",
      bestFor: "企业培训、内部沟通",
      caution: "C 端创作不划算",
      url: "https://www.synthesia.io", tags: ["企业", "数字人", "培训"]
    }
  ],

  compare: [
    { id: "seedance-25", name: "Seedance 2.5", vendor: "字节", duration: "4–30s", res: "4K", audio: "原生", refs: "30图/10视频/10音频", price: "¥2.6–13/s", rating: 5.0 },
    { id: "kling-40", name: "Kling 4.0", vendor: "快手", duration: "3–30s", res: "4K HDR", audio: "立体声", refs: "10图/5视频/7主体", price: "¥1.1–1.7/s", rating: 4.9 },
    { id: "hailuo-h3", name: "Hailuo H3", vendor: "MiniMax", duration: "4–15s", res: "2K", audio: "原生", refs: "9图/3视频/3音频", price: "¥0.6–0.9/s", rating: 4.7 },
    { id: "vidu-q4", name: "Vidu Q4", vendor: "生数", duration: "—", res: "4K", audio: "原生", refs: "15图/3音频", price: "¥0.09/s 起", rating: 4.6 },
    { id: "wan-30", name: "Wan 3.0", vendor: "阿里", duration: "2–30s", res: "1080p", audio: "原生", refs: "10图/5视频/5音频", price: "¥0.36–1.44/s", rating: 4.5 },
    { id: "veo-31", name: "Veo 3.1", vendor: "Google", duration: "8s 续接", res: "1080p", audio: "原生", refs: "图/视频", price: "¥1.1–2.9/s", rating: 4.5 },
    { id: "happyhorse-11", name: "HappyHorse 1.1", vendor: "阿里", duration: "—", res: "1080p", audio: "—", refs: "纯文生", price: "¥0.45–1.19/s", rating: 4.4 },
    { id: "pixverse-v6", name: "PixVerse V6", vendor: "爱诗", duration: "1–15s", res: "1080p", audio: "可选", refs: "图/视频", price: "¥0.32/条起", rating: 4.4 }
  ],

  calc: [
    { id: "seedance-25", name: "Seedance 2.5", tiers: [{ label: "720p", price: 2.59 }, { label: "1080p", price: 6.48 }, { label: "4K", price: 12.96 }] },
    { id: "kling-40", name: "Kling 4.0", tiers: [{ label: "720p", price: 1.13 }, { label: "1080p", price: 1.69 }] },
    { id: "hailuo-h3", name: "Hailuo H3", tiers: [{ label: "768P", price: 0.58 }, { label: "2K", price: 0.94 }] },
    { id: "wan-30", name: "Wan 3.0", tiers: [{ label: "480p", price: 0.36 }, { label: "1080p", price: 1.44 }] },
    { id: "vidu-q4", name: "Vidu Q4", tiers: [{ label: "2K", price: 0.09 }] },
    { id: "happyhorse-11", name: "HappyHorse 1.1", tiers: [{ label: "1080p", price: 1.19 }] },
    { id: "veo-31", name: "Veo 3.1", tiers: [{ label: "1080p", price: 2.16 }] },
    { id: "pixverse-v6", name: "PixVerse V6", tiers: [{ label: "1080p", price: 0.07 }] }
  ],

  scenes: [
    {
      icon: "mic", title: "口播 / 知识", combo: "海螺 H3 + 剪映", budget: "¥5–30 / 条",
      why: "原生音画同步，省掉配音和对轴；日更用图文成片兜底，重要选题再上 H3。"
    },
    {
      icon: "cart", title: "带货 / 产品", combo: "Seedance 2.5 / Kling 4.0", budget: "¥50–300 / 条",
      why: "产品图直接当参考，多主体同框不串；先 480p 试节奏，定稿再出 1080p。"
    },
    {
      icon: "drama", title: "短剧 / 漫剧", combo: "小云雀 / 万兴剧厂 + Seedance", budget: "¥100–500 / 集",
      why: "Agent 串流程，剧本和抽卡仍要人盯；一集 1 分钟约 3–5 个分镜，别一次生 30 秒。"
    },
    {
      icon: "globe", title: "出海 / YouTube", combo: "Veo 3.1 / Gemini Omni + HeyGen", budget: "¥20–200 / 条",
      why: "原生英文音频 + 多语种数字人；注意 SynthID 标识与平台 AI 内容政策。"
    }
  ],

  flow: [
    { n: "01", title: "脚本分镜", desc: "先写 8–12 个镜头，标清景别、运镜、时长、台词。", tools: "GPT / Gemini / 豆包" },
    { n: "02", title: "角色资产", desc: "定妆图存资产库，后面每个镜头都引用同一张脸。", tools: "即梦 / Seedream 5 / Nano Banana 2" },
    { n: "03", title: "低成本草稿", desc: "用最便宜的档位把节奏和构图跑通。", tools: "Wan 3.0 480p / Hailuo 768P" },
    { n: "04", title: "定稿出片", desc: "只对通过的镜头出高清，别整片重生成。", tools: "Seedance 2.5 / Kling 4.0" },
    { n: "05", title: "声音对齐", desc: "优先原生音频；口型不齐再补录、对轴。", tools: "原生音频 / 火山 / ElevenLabs" },
    { n: "06", title: "剪辑发布", desc: "9:16、字幕、前 3 秒钩子，批量分发。", tools: "剪映 / CapCut / Opus Clip" }
  ],

  insights: [
    { value: "0.12%", label: "2026.02 漫剧爆款率", note: "12 万部在播，破亿不足 150 部" },
    { value: "988", label: "生成式 AI 备案数", note: "截至 2026.06，另有 598 款地方登记" },
    { value: "100×", label: "模型每秒价差", note: "0.09 元 vs 13 元，选型先算账" }
  ],

  sources: [
    { label: "ByteDance Seed · Seedance 2.5", url: "https://seed.bytedance.com/en/blog/one-take-creation-flexible-referencing-introducing-seedance-2-5" },
    { label: "界面新闻 · 可灵 4.0 全量上线", url: "https://m.jiemian.com/article/15196496_sina.html" },
    { label: "新浪财经 · Vidu Q4 Preview", url: "https://finance.sina.com.cn/jjxw/2026-10-09/doc-iniurmnm7855769.shtml" },
    { label: "c114 · SuperCLUE 图生视频榜", url: "https://www.c114.net.cn/industry/74117.html" },
    { label: "南方都市报 · Sora 停运", url: "https://www.sohu.com/a/1001068170_161795" },
    { label: "钛媒体 · 20 多个 AI 短剧 Agent 测评", url: "https://www.tmtpost.com/7956912.html" },
    { label: "界面 / Tech 星球 · Seedance 2.5 价格", url: "https://m.jiemian.com/article/15010778.html" },
    { label: "阿里云百炼 · HappyHorse 1.1", url: "https://www.alibabacloud.com/help/zh/model-studio/happyhorse-1-1-t2v" }
  ]
};

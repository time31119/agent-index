/* 杭州 AI 图谱 · 数据集
 * 维护方式：直接编辑 companies 数组；页面统计与图表会自动重算。
 * 数据口径见页面“方法与来源”。更新时间：2026-11-01
 */
window.HZ_AI_DATA = {
  meta: {
    title: "杭州 AI 图谱",
    subtitle: "42 家代表企业 × 7 条产业链",
    updated: "2026-11-01",
    city: "杭州",
    coords: "30.2741°N / 120.1551°E",
    scope:
      "收录总部或核心研发团队位于杭州、以人工智能为主要业务或关键增长引擎的代表性企业；不是杭州 AI 企业全量名录。",
    dataPolicy:
      "财务数据优先采用 2025 年年度报告或 2026 年公开季报；未上市公司估值、融资与经营数据仅采用公开报道，并在指标旁标注年份与“报道/企业口径”。"
  },

  categories: [
    {
      id: "foundation",
      name: "基础模型与算力",
      en: "FOUNDATION & COMPUTE",
      color: "#11624f",
      blurb: "模型、云与芯片，决定智能时代的算力密度和成本曲线。"
    },
    {
      id: "embodied",
      name: "具身智能与机器人",
      en: "EMBODIED AI & ROBOTICS",
      color: "#c94b32",
      blurb: "从四足、人形到脑机接口，让模型拥有身体，进入真实世界。"
    },
    {
      id: "aiot",
      name: "智能物联与机器视觉",
      en: "AIoT & VISION",
      color: "#315b7d",
      blurb: "摄像机、视觉算法与物联云平台，杭州最深的产业护城河。"
    },
    {
      id: "mobility",
      name: "智能终端与出行",
      en: "DEVICES & MOBILITY",
      color: "#a4742a",
      blurb: "AI 眼镜、智能汽车、无人机与三维视觉，离消费者最近。"
    },
    {
      id: "industry",
      name: "产业智能与金融科技",
      en: "INDUSTRY & FINTECH",
      color: "#5b4a7d",
      blurb: "工业、金融、风控、安全与数据，AI 进入生产系统。"
    },
    {
      id: "health",
      name: "医疗与生命科学",
      en: "HEALTH & LIFE SCIENCE",
      color: "#2c7a6b",
      blurb: "影像、医院 IT、互联网医院与慢病管理，技术必须穿过临床。"
    },
    {
      id: "applications",
      name: "AI 原生应用与数字内容",
      en: "AI-NATIVE & CONTENT",
      color: "#8c3a4b",
      blurb: "空间智能、游戏、RPA、电商与设计，软件正在被重新做一遍。"
    }
  ],

  companies: [
    {
      id: "deepseek",
      no: "01",
      name: "深度求索",
      en: "DEEPSEEK",
      category: "foundation",
      district: "拱墅区",
      founded: 2023,
      status: "独角兽",
      statusGroup: "unicorn",
      listed: false,
      ticker: "—",
      website: "https://www.deepseek.com/",
      websiteLabel: "deepseek.com",
      featured: true,
      badge: "六小龙",
      tagline: "用开源推理模型，改写大模型的成本曲线",
      business:
        "专注大模型基础研究与开源，推出 DeepSeek-V3、R1 等模型，并通过 API、网页版与 App 提供推理服务；以高性价比训练和推理著称。",
      ai: ["DeepSeek-V3 / R1 开源模型", "MoE 与推理增强", "API、网页版与端侧应用"],
      keywords: "大模型 开源 推理 MoE V3 R1 V4 API 深度求索",
      metrics: [
        { value: "3500亿+", label: "投后估值", note: "2026.05 报道，未获官方确认" },
        { value: "500亿", label: "首轮融资上限", note: "2026.05 报道" }
      ],
      milestones: [
        { date: "2023", text: "杭州深度求索成立" },
        { date: "2024", text: "V3 / R1 系列开源模型发布" },
        { date: "2025", text: "低成本推理路线引发全球关注" },
        { date: "2026", text: "V4.1 Flash 更新；首轮外部融资报道" }
      ],
      sources: [
        { label: "DeepSeek 官网", url: "https://www.deepseek.com/" },
        { label: "证券时报：DeepSeek 首轮融资报道", url: "https://stcn.com/article/detail/3904065.html" }
      ]
    },
    {
      id: "alibaba-cloud",
      no: "02",
      name: "阿里云",
      en: "ALIBABA CLOUD",
      category: "foundation",
      district: "余杭区",
      founded: 2009,
      status: "子公司",
      statusGroup: "other",
      listed: false,
      ticker: "阿里集团 9988.HK",
      website: "https://www.aliyun.com/",
      websiteLabel: "aliyun.com",
      tagline: "亚洲领先的云平台，把通义千问做成开源底座",
      business:
        "提供云计算、存储、数据库与 AI 平台服务；通义千问 Qwen 系列开源模型通过阿里云百炼平台向开发者和企业开放，形成“云 + 模型 + 应用”的全栈能力。",
      ai: ["通义千问 Qwen 开源模型家族", "百炼大模型服务平台", "智算集群与 AI 基础设施"],
      keywords: "阿里云 通义千问 Qwen 百炼 云计算 智算 开源 大模型",
      metrics: [
        { value: "3800亿元", label: "三年云与 AI 投入", note: "2025 年宣布" },
        { value: "2009", label: "阿里云成立", note: "杭州余杭" }
      ],
      milestones: [
        { date: "2009", text: "阿里云在杭州成立" },
        { date: "2023", text: "通义千问大模型发布" },
        { date: "2025", text: "宣布三年投入 3800 亿元建设云与 AI 基础设施" },
        { date: "2026", text: "Qwen 开源生态持续扩张" }
      ],
      sources: [
        { label: "阿里云官网", url: "https://www.aliyun.com/" },
        { label: "证券时报：阿里 3800 亿元投入", url: "https://stcn.com/article/detail/1539123.html" }
      ]
    },
    {
      id: "ant-group",
      no: "03",
      name: "蚂蚁集团",
      en: "ANT GROUP",
      category: "foundation",
      district: "西湖区",
      founded: 2014,
      status: "未上市",
      statusGroup: "other",
      listed: false,
      ticker: "—",
      website: "https://www.antgroup.com/",
      websiteLabel: "antgroup.com",
      tagline: "从支付到智能体，金融级 AI 的规模化试验场",
      business:
        "以支付宝为入口，提供数字支付、数字金融与数字生活服务；自研百灵大模型、Agentar 智能体平台，探索 AI 医疗、金融风控与智能体在真实业务中的规模化落地。",
      ai: ["百灵大模型", "Agentar 智能体平台", "AI 医疗与金融风控"],
      keywords: "蚂蚁 支付宝 百灵 智能体 Agentar 金融 AI 医疗",
      metrics: [
        { value: "2014", label: "蚂蚁集团成立", note: "支付宝业务始于 2004" }
      ],
      sources: [
        { label: "蚂蚁集团官网", url: "https://www.antgroup.com/" }
      ]
    },
    {
      id: "t-head",
      no: "04",
      name: "平头哥半导体",
      en: "T-HEAD",
      category: "foundation",
      district: "余杭区",
      founded: 2018,
      status: "子公司",
      statusGroup: "other",
      listed: false,
      ticker: "阿里集团 9988.HK",
      website: "https://www.t-head.cn/",
      websiteLabel: "t-head.cn",
      tagline: "阿里系的芯片底座，从含光到玄铁",
      business:
        "阿里巴巴旗下半导体公司，研发 AI 推理芯片含光800、RISC-V 处理器玄铁系列、服务器 CPU 倚天与智能网卡，构建云到端的自研算力体系。",
      ai: ["含光800 AI 推理芯片", "玄铁 RISC-V 处理器", "倚天 710 服务器 CPU"],
      keywords: "平头哥 含光800 玄铁 RISC-V 倚天 芯片 AI 推理",
      metrics: [
        { value: "78,563 IPS", label: "含光800 峰值性能", note: "ResNet-50 推理" },
        { value: "2018", label: "成立", note: "阿里巴巴全资" }
      ],
      sources: [
        { label: "平头哥官网", url: "https://www.t-head.cn/" }
      ]
    },
    {
      id: "zhonghao",
      no: "05",
      name: "中昊芯英",
      en: "ZHONGHAO XINYING",
      category: "foundation",
      district: "钱塘区",
      founded: 2018,
      status: "未来独角兽",
      statusGroup: "future",
      listed: false,
      ticker: "—",
      website: "http://zjsia.org.cn/detail/1983111358417408001",
      websiteLabel: "协会资料页",
      linkType: "资料页",
      websiteNote: "企业暂无独立官网，链接为浙江省半导体行业协会会员页。",
      tagline: "为万亿参数大模型造 TPU",
      business:
        "研发高性能 TPU AI 芯片“刹那”与“泰则”大规模计算集群，支持 1024 片芯片片间互联，面向智算中心提供国产 AI 算力方案。",
      ai: ["刹那 TPU 训练芯片", "泰则大规模计算集群", "千亿参数模型训练"],
      keywords: "中昊芯英 TPU 刹那 泰则 智算 芯片 国产算力",
      metrics: [
        { value: "1024片", label: "芯片片间互联", note: "泰则集群" },
        { value: "千亿级", label: "参数模型支撑", note: "企业口径" }
      ],
      sources: [
        {
          label: "浙江省半导体行业协会：中昊芯英会员页",
          url: "http://zjsia.org.cn/detail/1983111358417408001"
        }
      ]
    },
    {
      id: "spacemit",
      no: "06",
      name: "进迭时空",
      en: "SPACEMIT",
      category: "foundation",
      district: "余杭区",
      founded: 2021,
      status: "未来独角兽",
      statusGroup: "future",
      listed: false,
      ticker: "—",
      website: "https://www.spacemit.com/",
      websiteLabel: "spacemit.com",
      tagline: "RISC-V + AI，重写端侧算力",
      business:
        "以 RISC-V 架构研发 AI CPU 与计算子系统，面向机器人、边缘计算和智能终端提供开放指令集算力平台，推动 RISC-V 进入 AI 计算主赛道。",
      ai: ["SpacemiT K1 AI CPU", "RISC-V 软件栈", "机器人、边缘计算与智能终端"],
      keywords: "进迭时空 RISC-V AI CPU K1 K3 端侧 机器人",
      metrics: [
        { value: "8核", label: "K1 RISC-V AI CPU", note: "企业产品口径" },
        { value: "2021", label: "成立", note: "杭州余杭" }
      ],
      sources: [
        { label: "进迭时空官网", url: "https://www.spacemit.com/" }
      ]
    },

    {
      id: "unitree",
      no: "07",
      name: "宇树科技",
      en: "UNITREE",
      category: "embodied",
      district: "滨江区",
      founded: 2016,
      status: "上市",
      statusGroup: "listed",
      listed: true,
      ticker: "688836.SH",
      website: "https://www.unitree.com/",
      websiteLabel: "unitree.com",
      featured: true,
      badge: "六小龙",
      tagline: "让四足与人形机器人走进真实场景",
      business:
        "研发、生产和销售高性能四足机器人、人形机器人与灵巧机械臂，覆盖消费级与行业级场景；2026 年 8 月登陆科创板，成为“杭州六小龙”中率先上市的硬件公司之一。",
      ai: ["G1 / H1 人形机器人", "Go2 / B2 四足机器人", "具身智能模型与关节模组"],
      keywords: "宇树 Unitree 人形机器人 四足 G1 H1 Go2 B2 具身智能",
      metrics: [
        { value: "18.17亿元", label: "2026 前三季营收", note: "+55.71%，2026 三季报" },
        { value: "2815亿元", label: "市值", note: "2026.10.28 收盘口径" },
        { value: "688836", label: "科创板代码", note: "2026.08.19 上市" }
      ],
      milestones: [
        { date: "2016", text: "宇树科技成立" },
        { date: "2024", text: "G1 人形机器人发布，起售价 9.9 万元" },
        { date: "2025", text: "H1 人形机器人登上央视春晚" },
        { date: "2026.08", text: "登陆科创板，代码 688836" }
      ],
      sources: [
        { label: "宇树科技官网", url: "https://www.unitree.com/operate/company" },
        { label: "每日经济新闻：宇树上市后首份季报", url: "https://news.qq.com/rain/a/20261028A0DA6300" }
      ]
    },
    {
      id: "deep-robotics",
      no: "08",
      name: "云深处科技",
      en: "DEEP ROBOTICS",
      category: "embodied",
      district: "西湖区",
      founded: 2017,
      status: "独角兽",
      statusGroup: "unicorn",
      listed: false,
      ticker: "—",
      website: "https://www.deeprobotics.cn/",
      websiteLabel: "deeprobotics.cn",
      featured: true,
      badge: "六小龙",
      tagline: "工业现场的四足与人形机器人",
      business:
        "面向能源电力、应急消防、安防巡逻、工业运维等场景提供四足、轮足与人形机器人及解决方案，强调全天候、行业级落地与真实场景数据闭环。",
      ai: ["X30 工业四足机器人", "DR02 全天候人形机器人", "具身大脑与行业解决方案"],
      keywords: "云深处 DEEP Robotics 机器狗 四足 人形 DR02 X30 巡检",
      metrics: [
        { value: "DR02", label: "行业级人形机器人", note: "2026.09 发布" },
        { value: "新加坡电网", label: "隧道巡检落地", note: "海外行业场景" }
      ],
      milestones: [
        { date: "2017", text: "云深处科技成立" },
        { date: "2025", text: "X30 完成新加坡电网隧道巡检" },
        { date: "2026.09", text: "发布行业级全天候人形机器人 DR02" }
      ],
      sources: [
        { label: "云深处科技官网", url: "https://www.deeprobotics.cn/" }
      ]
    },
    {
      id: "spirit-ai",
      no: "09",
      name: "千寻智能",
      en: "SPIRIT AI",
      category: "embodied",
      district: "余杭区",
      founded: 2024,
      status: "成长型",
      statusGroup: "growth",
      listed: false,
      ticker: "—",
      website: "https://spirit-ai.com/",
      websiteLabel: "spirit-ai.com",
      tagline: "通用人形机器人的 VLA 路线",
      business:
        "研发通用人形机器人 Moz1 与视觉-语言-动作（VLA）模型 Spirit，探索机器人在家庭、商业与工业场景中的通用操作能力。",
      ai: ["Moz1 人形机器人", "Spirit VLA 模型", "端到端操作与数据闭环"],
      keywords: "千寻智能 Spirit AI 人形机器人 Moz1 VLA 具身智能",
      metrics: [
        { value: "5.28亿元", label: "Pre-A 轮融资", note: "2025.07 公开报道" },
        { value: "2024", label: "成立", note: "杭州余杭" }
      ],
      sources: [
        { label: "千寻智能官网", url: "https://spirit-ai.com/" },
        { label: "证券时报：千寻智能融资 5.28 亿元", url: "https://www.stcn.com/article/detail/1634755.html" }
      ]
    },
    {
      id: "brainco",
      no: "10",
      name: "强脑科技",
      en: "BRAINCO",
      category: "embodied",
      district: "余杭区",
      founded: 2015,
      status: "独角兽",
      statusGroup: "unicorn",
      listed: false,
      ticker: "—",
      website: "https://www.brainco-hz.com/",
      websiteLabel: "brainco-hz.com",
      featured: true,
      badge: "六小龙",
      tagline: "非侵入式脑机接口，让意念成为动作",
      business:
        "研发非侵入式脑机接口技术，产品覆盖智能仿生手、仿生腿、脑机接口康复与教育设备，推动医疗康复和人机交互的规模化落地。",
      ai: ["BrainRobotics 智能仿生手", "非侵入式脑电采集", "康复训练与教育系统"],
      keywords: "强脑 BrainCo 脑机接口 仿生手 仿生腿 康复 非侵入式",
      metrics: [
        { value: "10万台", label: "单品量产", note: "2025 报道，非侵入式脑机接口" },
        { value: "2015", label: "成立", note: "杭州余杭" }
      ],
      milestones: [
        { date: "2015", text: "强脑科技成立" },
        { date: "2023", text: "智能仿生手进入规模化康复场景" },
        { date: "2025", text: "非侵入式脑机接口单品实现 10 万台量产" }
      ],
      sources: [
        { label: "强脑科技官网", url: "https://www.brainco-hz.com/" },
        { label: "清华五道口：杭州 AI 企业观察", url: "https://ee.pbcsf.tsinghua.edu.cn/info/1003/1947.htm" }
      ]
    },
    {
      id: "guozi",
      no: "11",
      name: "国自机器人",
      en: "GUOZI ROBOTICS",
      category: "embodied",
      district: "拱墅区",
      founded: 2011,
      status: "成长型",
      statusGroup: "growth",
      listed: false,
      ticker: "—",
      website: "https://www.gzrobot.com/",
      websiteLabel: "gzrobot.com",
      tagline: "移动机器人，重构工厂物流",
      business:
        "提供智能物流、智能巡检机器人及系统，覆盖汽车、3C、电商仓储、变电站、综合管廊等场景，强调多机调度与复杂场景交付。",
      ai: ["AMR / AGV 集群调度", "轮式与挂轨巡检机器人", "仓储物流系统"],
      keywords: "国自机器人 移动机器人 AMR AGV 巡检 仓储 物流",
      metrics: [
        { value: "400+", label: "单项目拣选 AGV", note: "官网案例" },
        { value: "2011", label: "成立", note: "杭州拱墅" }
      ],
      sources: [
        { label: "国自机器人官网", url: "https://www.gzrobot.com/about" }
      ]
    },
    {
      id: "shenhao",
      no: "12",
      name: "申昊科技",
      en: "SHENHAO",
      category: "embodied",
      district: "余杭区",
      founded: 2002,
      status: "上市",
      statusGroup: "listed",
      listed: true,
      ticker: "300853.SZ",
      website: "https://www.shenhaoinfo.com/",
      websiteLabel: "shenhaoinfo.com",
      tagline: "让机器人替人巡检高危现场",
      business:
        "研发电力、轨道交通、油气化工等场景的智能巡检机器人与监测设备，提供“机器人 + AI 诊断”的运维方案。",
      ai: ["电力巡检机器人", "轨交巡检机器人", "缺陷识别与状态监测"],
      keywords: "申昊科技 巡检机器人 电力 轨交 缺陷识别 300853",
      metrics: [
        { value: "300853", label: "股票代码", note: "深交所创业板" },
        { value: "2002", label: "成立", note: "杭州余杭" }
      ],
      sources: [
        { label: "申昊科技官网", url: "https://www.shenhaoinfo.com/" }
      ]
    },
    {
      id: "jingye",
      no: "13",
      name: "景业智能",
      en: "JINGYE INTELLIGENT",
      category: "embodied",
      district: "滨江区",
      founded: 2016,
      status: "上市",
      statusGroup: "listed",
      listed: true,
      ticker: "688290.SH",
      website: "http://www.boomy.cn/",
      websiteLabel: "boomy.cn",
      tagline: "核工业与特种场景的机器人专家",
      business:
        "面向核工业、军工、新能源等特种环境提供机器人、智能装备与数字化工厂解决方案，在核工业机器人细分赛道形成差异化优势。",
      ai: ["核工业机器人", "特种环境智能装备", "数字工厂系统"],
      keywords: "景业智能 核工业 机器人 特种环境 688290",
      metrics: [
        { value: "688290", label: "股票代码", note: "上交所科创板" },
        { value: "2016", label: "成立", note: "杭州滨江" }
      ],
      sources: [
        { label: "景业智能官网", url: "http://www.boomy.cn/" }
      ]
    },

    {
      id: "hikvision",
      no: "14",
      name: "海康威视",
      en: "HIKVISION",
      category: "aiot",
      district: "滨江区",
      founded: 2001,
      status: "上市",
      statusGroup: "listed",
      listed: true,
      ticker: "002415.SZ",
      website: "https://www.hikvision.com/cn/",
      websiteLabel: "hikvision.com",
      tagline: "从视频感知到智能物联的操作系统",
      business:
        "以视频技术为起点，构建物联感知、人工智能、大数据技术体系，为安防、交通、制造、能源等行业提供软硬件产品与解决方案。",
      ai: ["观澜大模型", "AIoT 感知设备", "行业智能平台与算法仓"],
      keywords: "海康威视 智能物联 AIoT 观澜 大模型 视频 安防 002415",
      metrics: [
        { value: "925.08亿元", label: "2025 营业收入", note: "+0.01%，2025 年报" },
        { value: "141.95亿元", label: "2025 归母净利", note: "+18.52%" },
        { value: "002415", label: "股票代码", note: "深交所主板" }
      ],
      milestones: [
        { date: "2001", text: "海康威视成立" },
        { date: "2010", text: "深交所上市" },
        { date: "2025", text: "发布观澜大模型与行业智能体" }
      ],
      sources: [
        { label: "海康威视官网", url: "https://www.hikvision.com/cn/" },
        { label: "证券时报：海康威视 2025 年报", url: "https://stcn.com/article/detail/3760899.html" }
      ]
    },
    {
      id: "dahua",
      no: "15",
      name: "大华股份",
      en: "DAHUA",
      category: "aiot",
      district: "滨江区",
      founded: 2001,
      status: "上市",
      statusGroup: "listed",
      listed: true,
      ticker: "002236.SZ",
      website: "https://www.dahuatech.com/",
      websiteLabel: "dahuatech.com",
      tagline: "以视频为核心的智慧物联",
      business:
        "提供以视频为核心的智慧物联产品、解决方案与运营服务，覆盖城市、交通、企业、能源等场景，推进端侧与边侧大模型落地。",
      ai: ["星汉大模型", "端侧 / 边侧大模型", "AIoT 平台与行业方案"],
      keywords: "大华股份 智慧物联 星汉 大模型 视频 AIoT 002236",
      metrics: [
        { value: "327.44亿元", label: "2025 营业收入", note: "+1.75%，2025 年报" },
        { value: "38.58亿元", label: "2025 归母净利", note: "+32.77%" },
        { value: "002236", label: "股票代码", note: "深交所主板" }
      ],
      sources: [
        { label: "大华股份官网", url: "https://www.dahuatech.com/" },
        { label: "证券之星：大华股份 2025 年报", url: "https://wap.stockstar.com/detail/IG2026041700044230" }
      ]
    },
    {
      id: "uniview",
      no: "16",
      name: "宇视科技",
      en: "UNIVIEW",
      category: "aiot",
      district: "滨江区",
      founded: 2011,
      status: "子公司",
      statusGroup: "other",
      listed: false,
      ticker: "千方科技 002373.SZ",
      website: "https://cn.uniview.com/",
      websiteLabel: "cn.uniview.com",
      tagline: "全球 AIoT 产品与全栈方案",
      business:
        "提供视频物联、智能交通、智慧园区、充电桩等 AIoT 产品与解决方案，是千方科技旗下企业，强调“产品 + 方案 + 全栈能力”。",
      ai: ["AI 摄像机", "视图智能", "AI 体育 / 教育 / 交通"],
      keywords: "宇视科技 Uniview AIoT 视频 智能交通 千方科技",
      metrics: [
        { value: "2011", label: "成立", note: "杭州滨江" },
        { value: "002373", label: "母公司代码", note: "千方科技" }
      ],
      sources: [
        { label: "宇视科技官网", url: "https://cn.uniview.com/" }
      ]
    },
    {
      id: "arcsoft",
      no: "17",
      name: "虹软科技",
      en: "ARCSOFT",
      category: "aiot",
      district: "西湖区",
      founded: 2003,
      status: "上市",
      statusGroup: "listed",
      listed: true,
      ticker: "688088.SH",
      website: "https://www.arcsoft.com.cn/",
      websiteLabel: "arcsoft.com.cn",
      tagline: "手机影像背后的视觉算法",
      business:
        "为智能手机、智能汽车、IoT 设备提供计算摄影与计算机视觉算法，覆盖夜景、HDR、人像、DMS / ADAS 等，是手机影像算法的重要供应商。",
      ai: ["ArcSoft 计算摄影", "车载视觉 DMS / ADAS", "AI 开放平台"],
      keywords: "虹软 ArcSoft 计算摄影 视觉算法 手机 车载 DMS ADAS 688088",
      metrics: [
        { value: "9.23亿元", label: "2025 营业收入", note: "+13.22%，2025 年报" },
        { value: "1.92亿元", label: "车载视觉收入", note: "+50.94%" },
        { value: "688088", label: "股票代码", note: "上交所科创板" }
      ],
      sources: [
        { label: "虹软科技官网", url: "https://www.arcsoft.com.cn/" },
        { label: "证券时报：虹软科技 2025 年报", url: "https://stcn.com/article/detail/3767668.html" }
      ]
    },
    {
      id: "ezviz",
      no: "18",
      name: "萤石网络",
      en: "EZVIZ",
      category: "aiot",
      district: "滨江区",
      founded: 2013,
      status: "上市",
      statusGroup: "listed",
      listed: true,
      ticker: "688475.SH",
      website: "https://www.ezviz.com/cn",
      websiteLabel: "ezviz.com",
      tagline: "智能家居摄像机 + 云平台",
      business:
        "以智能家居摄像机为核心，提供智能入户、智能控制、智能服务机器人与物联网云平台服务，构建“2+5+N”智能家居生态。",
      ai: ["AI 摄像机", "萤石云", "人脸 / 视觉识别"],
      keywords: "萤石 EZVIZ 智能家居 摄像机 云平台 视觉 AI 688475",
      metrics: [
        { value: "59.01亿元", label: "2025 营业收入", note: "+8.44%，业绩快报" },
        { value: "1.57亿+", label: "全球用户", note: "官网口径" },
        { value: "688475", label: "股票代码", note: "上交所科创板" }
      ],
      sources: [
        { label: "萤石网络官网", url: "https://www.ezviz.com/cn" },
        { label: "上海证券报：萤石网络 2025 业绩快报", url: "https://paper.cnstock.com/html/2026-01/21/content_2172271.htm" }
      ]
    },
    {
      id: "tuya",
      no: "19",
      name: "涂鸦智能",
      en: "TUYA",
      category: "aiot",
      district: "滨江区",
      founded: 2014,
      status: "上市",
      statusGroup: "listed",
      listed: true,
      ticker: "NYSE: TUYA / 2391.HK",
      website: "https://www.tuya.com/cn/",
      websiteLabel: "tuya.com",
      tagline: "AI 云平台，让硬件一键智能化",
      business:
        "提供 IoT 云平台、AI 大模型与智能硬件解决方案，帮助开发者快速完成设备智能化、App 开发和全球部署，覆盖照明、家电、楼宇、酒店等场景。",
      ai: ["TuyaOS", "AI 大模型解决方案", "AI Copilot"],
      keywords: "涂鸦智能 Tuya AIoT 云平台 TuyaOS 大模型 智能硬件",
      metrics: [
        { value: "200+", label: "覆盖国家 / 地区", note: "企业口径" },
        { value: "TUYA", label: "纽交所代码", note: "港股 2391.HK" }
      ],
      sources: [
        { label: "涂鸦智能官网", url: "https://www.tuya.com/cn/" }
      ]
    },

    {
      id: "leapmotor",
      no: "20",
      name: "零跑汽车",
      en: "LEAPMOTOR",
      category: "mobility",
      district: "滨江区",
      founded: 2015,
      status: "上市",
      statusGroup: "listed",
      listed: true,
      ticker: "9863.HK",
      website: "https://www.leapmotor.com/",
      websiteLabel: "leapmotor.com",
      tagline: "全域自研，把智驾打进主流价格带",
      business:
        "智能电动汽车企业，坚持整车与核心零部件全域自研，提供纯电与增程车型，推进高阶辅助驾驶与智能座舱在主流价格带的规模化。",
      ai: ["Leapmotor Pilot 智驾", "中央集成电子电气架构", "智能座舱"],
      keywords: "零跑汽车 Leapmotor 智能驾驶 智驾 电动车 9863",
      metrics: [
        { value: "59.66万辆", label: "2025 交付", note: "+103.1%" },
        { value: "647.3亿元", label: "2025 营收", note: "+101.3%" },
        { value: "9863", label: "港股代码", note: "首次全年盈利" }
      ],
      sources: [
        { label: "零跑汽车官网", url: "https://www.leapmotor.com/" },
        { label: "证券时报：零跑 2025 年业绩", url: "https://www.stcn.com/article/detail/3684514.html" }
      ]
    },
    {
      id: "fabu",
      no: "21",
      name: "飞步科技",
      en: "FABU",
      category: "mobility",
      district: "滨江区",
      founded: 2017,
      status: "成长型",
      statusGroup: "growth",
      listed: false,
      ticker: "—",
      website: "https://www.fabu.ai/",
      websiteLabel: "fabu.ai",
      tagline: "港口无人驾驶的杭州样本",
      business:
        "面向港口、汽车、公交、航空等场景提供无人驾驶水平运输、远程控制与车队调度系统，在混行环境下推进生产级无人驾驶运营。",
      ai: ["FabuDrive 无人驾驶运输", "FabuRemote 远程控制", "FabuDispatch 车队调度"],
      keywords: "飞步科技 港口 无人驾驶 集卡 车队调度 混行",
      metrics: [
        { value: "2017", label: "成立", note: "杭州滨江" },
        { value: "专精特新", label: "国家级小巨人", note: "企业资质" }
      ],
      sources: [
        { label: "飞步科技官网", url: "https://www.fabu.ai/" }
      ]
    },
    {
      id: "rokid",
      no: "22",
      name: "Rokid 灵伴科技",
      en: "ROKID",
      category: "mobility",
      district: "西湖区",
      founded: 2014,
      status: "独角兽",
      statusGroup: "unicorn",
      listed: false,
      ticker: "—",
      website: "https://www.rokid.com/",
      websiteLabel: "rokid.com",
      tagline: "AI + AR 眼镜，下一代个人终端",
      business:
        "研发 AI 眼镜、AR 空间计算设备与 YodaOS 操作系统，产品覆盖消费、文旅、工业与教育场景，推动 AI 助手与空间交互进入日常佩戴。",
      ai: ["Rokid Glasses 2", "YodaOS", "AI 助手与空间交互"],
      keywords: "Rokid 灵伴 AI 眼镜 AR 空间计算 YodaOS Glasses",
      metrics: [
        { value: "Glasses 2", label: "2026 新一代 AI 眼镜", note: "官网" },
        { value: "2014", label: "成立", note: "杭州西湖" }
      ],
      sources: [
        { label: "Rokid 官网", url: "https://www.rokid.com/" }
      ]
    },
    {
      id: "shining3d",
      no: "23",
      name: "先临三维",
      en: "SHINING 3D",
      category: "mobility",
      district: "滨江区",
      founded: 2004,
      status: "新三板",
      statusGroup: "other",
      listed: false,
      ticker: "830978.NQ",
      website: "https://www.shining3d.cn/",
      websiteLabel: "shining3d.cn",
      tagline: "三维视觉，让机器看见并测量",
      business:
        "提供高精度工业 3D 扫描、齿科数字化与三维视觉检测方案，产品覆盖汽车、能源重工、工程机械、电子电器与齿科医疗。",
      ai: ["高精度 3D 扫描", "齿科数字化", "工业三维视觉检测"],
      keywords: "先临三维 3D扫描 三维视觉 齿科 工业检测 830978",
      metrics: [
        { value: "15亿元+", label: "2025 营业收入", note: "官网" },
        { value: "20%", label: "研发投入占比", note: "长期保持" },
        { value: "100+", label: "覆盖国家 / 地区", note: "官网" }
      ],
      sources: [
        { label: "先临三维官网", url: "https://www.shining3d.cn/" }
      ]
    },
    {
      id: "antwork",
      no: "24",
      name: "迅蚁科技",
      en: "ANTWORK",
      category: "mobility",
      district: "余杭区",
      founded: 2015,
      status: "成长型",
      statusGroup: "growth",
      listed: false,
      ticker: "—",
      website: "https://www.antwork.link/zh-cn/",
      websiteLabel: "antwork.link",
      tagline: "城市空中物流的先行者",
      business:
        "构建城市低空物流网络，提供无人机配送、自动枢纽与飞行管理平台，覆盖医疗样本、急救物资、同城即配等场景。",
      ai: ["无人机自主飞行", "集群调度", "城市空中物流网络"],
      keywords: "迅蚁 Antwork 无人机 低空物流 医疗配送 城市空中交通",
      metrics: [
        { value: "65+", label: "常态飞行城市", note: "官网" },
        { value: "75万+", label: "累计飞行架次", note: "官网" },
        { value: "300+", label: "服务医疗机构", note: "官网" }
      ],
      milestones: [
        { date: "2015", text: "迅蚁科技成立" },
        { date: "2016", text: "与中国邮政开通国内首条无人机邮路" },
        { date: "2019", text: "获全球首张城市无人机物流试运行牌照（0001）" },
        { date: "2026", text: "参与多项民航行业标准制定" }
      ],
      sources: [
        { label: "迅蚁科技官网", url: "https://www.antwork.link/zh-cn/about/" }
      ]
    },

    {
      id: "supcon",
      no: "25",
      name: "中控技术",
      en: "SUPCON",
      category: "industry",
      district: "滨江区",
      founded: 1993,
      status: "上市",
      statusGroup: "listed",
      listed: true,
      ticker: "688777.SH",
      website: "https://www.supcon.com/",
      websiteLabel: "supcon.com",
      tagline: "流程工业的工业 AI 平台",
      business:
        "为石化、化工、能源等行业提供 DCS 控制系统、工业软件与“时间序列大模型 TPT”，推进从自动化到自主运行工厂的升级。",
      ai: ["TPT 时间序列大模型", "UCS 通用控制系统", "工业智能体与机器人"],
      keywords: "中控技术 工业AI TPT 时间序列 大模型 DCS 自主运行工厂 688777",
      metrics: [
        { value: "80.51亿元", label: "2025 营业收入", note: "-11.9%，业绩快报" },
        { value: "4.5亿元", label: "2025 归母净利", note: "-59.7%" },
        { value: "688777", label: "股票代码", note: "上交所科创板" }
      ],
      sources: [
        { label: "中控技术官网", url: "https://www.supcon.com/" },
        { label: "证券时报：中控技术 2025 业绩快报", url: "https://stcn.com/article/detail/3643233.html" }
      ]
    },
    {
      id: "hithink",
      no: "26",
      name: "同花顺",
      en: "HITHINK",
      category: "industry",
      district: "余杭区",
      founded: 1995,
      status: "上市",
      statusGroup: "listed",
      listed: true,
      ticker: "300033.SZ",
      website: "https://www.10jqka.com.cn/",
      websiteLabel: "10jqka.com.cn",
      tagline: "大模型 + 金融信息服务",
      business:
        "提供金融资讯、行情交易与智能投顾服务，推动“问财”等产品与大模型结合，服务个人投资者与机构客户。",
      ai: ["问财智能投顾", "金融大模型", "智能投研 / 客服 / 代码生成"],
      keywords: "同花顺 问财 金融大模型 智能投顾 金融信息 300033",
      metrics: [
        { value: "60.29亿元", label: "2025 营业收入", note: "+44%，2025 年报" },
        { value: "90%+", label: "证券公司覆盖", note: "机构业务" },
        { value: "300033", label: "股票代码", note: "深交所创业板" }
      ],
      sources: [
        { label: "同花顺官网", url: "https://www.10jqka.com.cn/" },
        { label: "证券时报：同花顺 2025 年报", url: "https://stcn.com/article/detail/3668515.html" }
      ]
    },
    {
      id: "hundsun",
      no: "27",
      name: "恒生电子",
      en: "HUNDSUN",
      category: "industry",
      district: "滨江区",
      founded: 1995,
      status: "上市",
      statusGroup: "listed",
      listed: true,
      ticker: "600570.SH",
      website: "https://www.hundsun.com/",
      websiteLabel: "hundsun.com",
      tagline: "金融机构的 AI 交易与风控底座",
      business:
        "为证券、基金、银行、期货等金融机构提供金融科技软件与数据服务，推进大模型在投研、交易、风控、运营环节落地。",
      ai: ["金融大模型", "智能投研", "交易与风控系统"],
      keywords: "恒生电子 金融科技 大模型 智能投研 交易 风控 600570",
      metrics: [
        { value: "57.83亿元", label: "2025 营业收入", note: "-12.13%" },
        { value: "12.31亿元", label: "2025 归母净利", note: "+18.01%" },
        { value: "600570", label: "股票代码", note: "上交所主板" }
      ],
      sources: [
        { label: "恒生电子官网", url: "https://www.hundsun.com/" },
        { label: "21 财经：恒生电子 2025 年报", url: "https://m.21jingji.com/timeline/f31e5ea176505a5de27fabe2ed7b2a9d.html" }
      ]
    },
    {
      id: "tongdun",
      no: "28",
      name: "同盾科技",
      en: "TONGDUN / XIAODUN",
      category: "industry",
      district: "余杭区",
      founded: 2013,
      status: "独角兽",
      statusGroup: "unicorn",
      listed: false,
      ticker: "—",
      website: "https://www.xiaodun.com/",
      websiteLabel: "xiaodun.com",
      websiteNote: "品牌现为“小盾未来”，官网使用 xiaodun.com。",
      tagline: "决策智能，识别看不见的风险",
      business:
        "以人工智能与隐私计算为核心，提供信贷风控、交易反欺诈、合规与决策智能平台；品牌现为“小盾未来”，持续服务金融、互联网与政企客户。",
      ai: ["智策决策智能平台", "智邦隐私计算", "ApexDB 实时数据库"],
      keywords: "同盾 小盾未来 风控 反欺诈 决策智能 隐私计算 ApexDB",
      metrics: [
        { value: "10,000+", label: "企业客户", note: "官网口径" },
        { value: "2013", label: "成立", note: "杭州余杭" }
      ],
      sources: [
        { label: "小盾未来（原同盾科技）官网", url: "https://www.xiaodun.com/" }
      ]
    },
    {
      id: "bsfit",
      no: "29",
      name: "邦盛科技",
      en: "BSFIT",
      category: "industry",
      district: "西湖区",
      founded: 2010,
      status: "独角兽",
      statusGroup: "unicorn",
      listed: false,
      ticker: "—",
      website: "https://www.bsfit.com.cn/",
      websiteLabel: "bsfit.com.cn",
      tagline: "毫秒级实时智能决策",
      business:
        "以流式计算、图计算与机器学习为核心，提供金融交易反欺诈、信贷风控、反洗钱等实时智能决策产品，服务银行、证券、运营商等客户。",
      ai: ["流立方实时计算", "图立方", "三核决策平台"],
      keywords: "邦盛科技 流立方 实时风控 反欺诈 反洗钱 决策智能",
      metrics: [
        { value: "300万笔/秒", label: "流立方集群吞吐", note: "企业口径" },
        { value: "500+", label: "大中型客户", note: "官网" }
      ],
      sources: [
        { label: "邦盛科技官网", url: "https://www.bsfit.com.cn/" }
      ]
    },
    {
      id: "anheng",
      no: "30",
      name: "安恒信息",
      en: "DBAPPSECURITY",
      category: "industry",
      district: "滨江区",
      founded: 2007,
      status: "上市",
      statusGroup: "listed",
      listed: true,
      ticker: "688023.SH",
      website: "https://www.dbappsecurity.com.cn/",
      websiteLabel: "dbappsecurity.com.cn",
      tagline: "AI 驱动的数字安全",
      business:
        "提供网络信息安全产品与服务，覆盖数据安全、云安全、态势感知与安全运营，推进恒脑安全大模型与安全智能体落地。",
      ai: ["恒脑安全大模型", "数据安全", "安全智能体与运营"],
      keywords: "安恒信息 恒脑 大模型 数据安全 网络安全 智能体 688023",
      metrics: [
        { value: "21.51亿元", label: "2025 营业收入", note: "+5.32%，2025 年报" },
        { value: "-0.57亿元", label: "2025 归母净利", note: "亏损收窄" },
        { value: "688023", label: "股票代码", note: "上交所科创板" }
      ],
      sources: [
        { label: "安恒信息官网", url: "https://www.dbappsecurity.com.cn/" },
        { label: "中国经济网：安恒信息 2025 年报", url: "http://finance.ce.cn/stock/gsgdbd/202603/t20260326_2859002.shtml" }
      ]
    },
    {
      id: "merit",
      no: "31",
      name: "每日互动",
      en: "MERIT INTERACTIVE",
      category: "industry",
      district: "西湖区",
      founded: 2010,
      status: "上市",
      statusGroup: "listed",
      listed: true,
      ticker: "300766.SZ",
      website: "https://www.getui.com/",
      websiteLabel: "getui.com",
      tagline: "数据智能，让消息更懂人",
      business:
        "提供消息推送、用户运营、品牌营销与公共服务数据智能服务，推出“个知”AI 工作站等产品，把数据能力封装为可用的 AI 工具。",
      ai: ["个知智能工作站", "数据中台", "AI 营销与运营"],
      keywords: "每日互动 个推 数据智能 消息推送 个知 AI 营销 300766",
      metrics: [
        { value: "300766", label: "股票代码", note: "深交所创业板" },
        { value: "亿级", label: "设备数据", note: "企业口径" }
      ],
      sources: [
        { label: "每日互动（个推）官网", url: "https://www.getui.com/" }
      ]
    },
    {
      id: "dtstack",
      no: "32",
      name: "袋鼠云",
      en: "DTSTACK",
      category: "industry",
      district: "余杭区",
      founded: 2015,
      status: "成长型",
      statusGroup: "growth",
      listed: false,
      ticker: "—",
      website: "https://www.dtstack.com/",
      websiteLabel: "dtstack.com",
      tagline: "多模态数据底座，喂饱行业 AI",
      business:
        "提供多模态大数据基础软件、实时数据开发、元数据资产管理与 AI 应用服务，帮助企业把分散数据变成可治理、可调用的 AI 数据基础设施。",
      ai: ["DataAPI", "MetaDataAssets", "StreamWorks 实时开发"],
      keywords: "袋鼠云 DTStack 数据中台 实时计算 多模态 数据治理 AI",
      metrics: [
        { value: "2015", label: "成立", note: "杭州余杭" },
        { value: "Data + AI", label: "核心方向", note: "多模态数据基础设施" }
      ],
      sources: [
        { label: "袋鼠云官网", url: "https://www.dtstack.com/" }
      ]
    },

    {
      id: "bsoft",
      no: "33",
      name: "创业慧康",
      en: "BSOFT",
      category: "health",
      district: "滨江区",
      founded: 1997,
      status: "上市",
      statusGroup: "listed",
      listed: true,
      ticker: "300451.SZ",
      website: "https://www.bsoft.com.cn/",
      websiteLabel: "bsoft.com.cn",
      tagline: "医院信息系统走向医疗 AI",
      business:
        "提供医院信息系统、区域卫生信息化、互联网医院与医疗大数据产品，探索 AI 辅助诊断、病历质控与临床决策支持。",
      ai: ["智慧医院", "医疗大数据", "AI 辅助诊断与病历质控"],
      keywords: "创业慧康 医疗信息化 智慧医院 医疗大数据 AI 辅助诊断 300451",
      metrics: [
        { value: "300451", label: "股票代码", note: "深交所创业板" },
        { value: "1997", label: "成立", note: "杭州滨江" }
      ],
      sources: [
        { label: "创业慧康官网", url: "https://www.bsoft.com.cn/" }
      ]
    },
    {
      id: "jianpei",
      no: "34",
      name: "健培科技",
      en: "JIANPEI",
      category: "health",
      district: "萧山区",
      founded: 2012,
      status: "成长型",
      statusGroup: "growth",
      listed: false,
      ticker: "—",
      website: "https://www.jianpei.com/",
      websiteLabel: "jianpei.com",
      tagline: "医学影像 AI 的杭州老兵",
      business:
        "研发医学影像人工智能分析与辅助诊断系统“啄医生”，覆盖肺部、骨龄、心血管等影像场景，推动影像 AI 进入临床工作流。",
      ai: ["啄医生影像 AI", "肺结节筛查", "影像云平台"],
      keywords: "健培科技 啄医生 医学影像 AI 肺结节 影像云",
      metrics: [
        { value: "2012", label: "成立", note: "杭州萧山" },
        { value: "啄医生", label: "核心产品", note: "医学影像 AI" }
      ],
      sources: [
        { label: "健培科技官网", url: "https://www.jianpei.com/" }
      ]
    },
    {
      id: "wedoctor",
      no: "35",
      name: "微医",
      en: "WEDOCTOR",
      category: "health",
      district: "滨江区",
      founded: 2010,
      status: "独角兽",
      statusGroup: "unicorn",
      listed: false,
      ticker: "—",
      website: "https://www.wedoctor.com/",
      websiteLabel: "wedoctor.com",
      tagline: "互联网医院 + AI 健康管理",
      business:
        "以互联网医院和数字健康平台连接医院、医生与患者，提供在线复诊、慢病管理与 AI 辅助诊疗服务，探索分级诊疗的数字基础设施。",
      ai: ["互联网医院", "AI 辅助诊疗", "慢病与健康管理"],
      keywords: "微医 WeDoctor 互联网医院 数字健康 AI 辅助诊疗 慢病",
      metrics: [
        { value: "2010", label: "成立", note: "杭州滨江" },
        { value: "互联网医院", label: "核心场景", note: "在线复诊与慢病管理" }
      ],
      sources: [
        { label: "微医官网", url: "https://www.wedoctor.com/" }
      ]
    },
    {
      id: "cloudr",
      no: "36",
      name: "智云健康",
      en: "CLOUDR",
      category: "health",
      district: "余杭区",
      founded: 2014,
      status: "上市",
      statusGroup: "listed",
      listed: true,
      ticker: "9955.HK",
      website: "https://www.cloudr.cn/",
      websiteLabel: "cloudr.cn",
      tagline: "AI 驱动的慢病管理",
      business:
        "以医院、药店、互联网医院场景为核心，提供慢病管理 SaaS 与 AI 医疗平台，连接医生、患者与药品服务。",
      ai: ["智云医汇", "智云问诊", "AI 慢病管理"],
      keywords: "智云健康 ClouDr 慢病管理 AI 医疗 SaaS 互联网医院 9955",
      metrics: [
        { value: "9955", label: "港股代码", note: "港交所主板" },
        { value: "2014", label: "成立", note: "杭州余杭" }
      ],
      sources: [
        { label: "智云健康官网", url: "https://www.cloudr.cn/" }
      ]
    },

    {
      id: "manycore",
      no: "37",
      name: "群核科技",
      en: "MANYCORE",
      category: "applications",
      district: "拱墅区",
      founded: 2011,
      status: "上市",
      statusGroup: "listed",
      listed: true,
      ticker: "00068.HK",
      website: "https://www.kujiale.com/",
      websiteLabel: "kujiale.com",
      featured: true,
      badge: "六小龙",
      tagline: "空间智能，连接数字与物理世界",
      business:
        "以酷家乐、Coohom、SpatialVerse 等产品提供空间设计、3D 内容与空间智能解决方案，2026 年 4 月于港交所上市，成为“全球空间智能第一股”。",
      ai: ["空间大模型", "SpatialVerse", "3D 云设计与工业孪生"],
      keywords: "群核科技 酷家乐 Manycore 空间智能 3D 大模型 SpatialVerse 00068",
      metrics: [
        { value: "8.2亿元", label: "2025 营业收入", note: "2025 年报" },
        { value: "82.2%", label: "2025 毛利率", note: "2025 年报" },
        { value: "6500万", label: "平台用户", note: "2025 报道" },
        { value: "00068", label: "港股代码", note: "2026.04.17 上市" }
      ],
      milestones: [
        { date: "2011", text: "群核科技成立" },
        { date: "2013", text: "酷家乐上线" },
        { date: "2026.04", text: "港交所主板上市，代码 00068.HK" }
      ],
      sources: [
        { label: "群核科技（酷家乐）官网", url: "https://www.kujiale.com/" },
        { label: "证券时报：群核科技港股上市", url: "https://www.stcn.com/article/detail/3758628.html" }
      ]
    },
    {
      id: "gamescience",
      no: "38",
      name: "游戏科学",
      en: "GAME SCIENCE",
      category: "applications",
      district: "西湖区",
      founded: 2014,
      status: "独角兽",
      statusGroup: "unicorn",
      listed: false,
      ticker: "—",
      website: "https://gamesci.cn/",
      websiteLabel: "gamesci.cn",
      featured: true,
      badge: "六小龙",
      tagline: "用 3A 标准讲中国故事",
      business:
        "研发高品质单机游戏《黑神话：悟空》，以 UE5、动作捕捉与 AI 辅助内容生产构建中国 3A 游戏能力，并把中国神话推向全球市场。",
      ai: ["《黑神话：悟空》", "UE5 与自研内容管线", "AI 辅助内容生产"],
      keywords: "游戏科学 黑神话悟空 Game Science 3A 游戏 引擎 动作捕捉",
      metrics: [
        { value: "2000万份", label: "全球销量", note: "2025 报道" },
        { value: "11亿美元", label: "总收入", note: "2025 报道" },
        { value: "2014", label: "成立", note: "杭州西湖" }
      ],
      milestones: [
        { date: "2014", text: "游戏科学成立" },
        { date: "2024.08", text: "《黑神话：悟空》全球上线" },
        { date: "2025", text: "销量突破 2000 万份，获 Steam 年度最佳游戏" }
      ],
      sources: [
        { label: "游戏科学官网", url: "https://gamesci.cn/" },
        { label: "清华五道口：杭州 AI 企业观察", url: "https://ee.pbcsf.tsinghua.edu.cn/info/1003/1947.htm" }
      ]
    },
    {
      id: "yingdao",
      no: "39",
      name: "影刀",
      en: "YINGDAO",
      category: "applications",
      district: "余杭区",
      founded: 2019,
      status: "独角兽",
      statusGroup: "unicorn",
      listed: false,
      ticker: "—",
      website: "https://www.yingdao.com/",
      websiteLabel: "yingdao.com",
      tagline: "让 AI Agent 接管重复工作",
      business:
        "提供 RPA 与 AI Agent 产品，帮助企业自动化流程、连接业务系统，覆盖电商、制造、金融、物流等场景，向“AI 原生组织”的基础设施演进。",
      ai: ["影刀 RPA", "AI WorkOS", "企业级 AI Agent"],
      keywords: "影刀 RPA AI Agent WorkOS 自动化 流程 企业服务",
      metrics: [
        { value: "AI WorkOS", label: "2026 核心产品", note: "官网" },
        { value: "2019", label: "成立", note: "杭州余杭" }
      ],
      sources: [
        { label: "影刀官网", url: "https://www.yingdao.com/" },
        { label: "清华五道口：杭州 AI 企业观察", url: "https://ee.pbcsf.tsinghua.edu.cn/info/1003/1947.htm" }
      ]
    },
    {
      id: "youzan",
      no: "40",
      name: "有赞",
      en: "YOUZAN",
      category: "applications",
      district: "西湖区",
      founded: 2012,
      status: "上市",
      statusGroup: "listed",
      listed: true,
      ticker: "8083.HK",
      website: "https://www.youzan.com/",
      websiteLabel: "youzan.com",
      tagline: "私域电商的 AI 经营工具",
      business:
        "为商家提供私域电商 SaaS、智能 CRM、营销自动化与客户运营工具，探索 AI 在内容生成、导购、选品和经营分析中的应用。",
      ai: ["有赞 AI 数字员工", "智能 CRM", "私域运营与营销自动化"],
      keywords: "有赞 私域 电商 SaaS CRM AI 导购 数字员工 8083",
      metrics: [
        { value: "14.87亿元", label: "2025 收入", note: "+3.1%，年度业绩" },
        { value: "1,030亿元", label: "2025 全年 GMV", note: "存量付费商家 5.28 万" },
        { value: "8083", label: "港股代码", note: "港交所" }
      ],
      sources: [
        { label: "有赞官网", url: "https://www.youzan.com/" },
        { label: "证券之星：有赞 2025 年度业绩", url: "https://wap.stockstar.com/detail/AN2026031200031182" }
      ]
    },
    {
      id: "style3d",
      no: "41",
      name: "凌迪科技",
      en: "STYLE3D",
      category: "applications",
      district: "西湖区",
      founded: 2015,
      status: "成长型",
      statusGroup: "growth",
      listed: false,
      ticker: "—",
      website: "https://www.style3d.com/",
      websiteLabel: "style3d.com",
      tagline: "AI + 3D，重做服装设计",
      business:
        "提供服装 3D 数字化设计、面料仿真与 AI 生成工具，连接设计、打样、生产与电商展示，并向具身智能的物理仿真能力延伸。",
      ai: ["Style3D Studio", "AI 服装设计", "数字面料与物理仿真"],
      keywords: "凌迪 Style3D 服装 3D 设计 AI 面料 仿真 数字时尚",
      metrics: [
        { value: "2015", label: "成立", note: "杭州西湖" },
        { value: "AI + 3D", label: "核心方向", note: "数字时尚与物理 AI" }
      ],
      sources: [
        { label: "Style3D 官网", url: "https://www.style3d.com/" }
      ]
    },
    {
      id: "netease",
      no: "42",
      name: "网易",
      en: "NETEASE",
      category: "applications",
      district: "滨江区",
      founded: 1997,
      status: "上市",
      statusGroup: "listed",
      listed: true,
      ticker: "9999.HK / NTES",
      website: "https://www.netease.com/",
      websiteLabel: "netease.com",
      tagline: "游戏、音乐与 AI 的内容工厂",
      business:
        "互联网科技公司，业务覆盖游戏、音乐、教育、电商等；网易伏羲、网易有道探索 AI 在游戏、教育与内容生产中的应用。",
      ai: ["网易伏羲", "有道子曰大模型", "AI 游戏 / NPC / 内容生产"],
      keywords: "网易 NetEase 伏羲 有道 子曰 游戏 AI 音乐 教育 9999",
      metrics: [
        { value: "1126亿元", label: "2025 营收", note: "+6.9%" },
        { value: "338亿元", label: "2025 归母净利", note: "+13.8%" },
        { value: "9999", label: "港股代码", note: "纳斯达克 NTES" }
      ],
      sources: [
        { label: "网易官网", url: "https://www.netease.com/" },
        { label: "央广网：网易 2025 年业绩", url: "https://finance.cnr.cn/ycbd/20260211/t20260211_527523623.shtml" }
      ]
    }
  ],

  timeline: [
    {
      date: "2025.02",
      title: "“杭州六小龙”出圈",
      text: "DeepSeek 引发全球关注，宇树 H1 登上央视春晚；杭州的硬科技企业第一次以群体方式进入大众视野。",
      source: { label: "清华五道口", url: "https://ee.pbcsf.tsinghua.edu.cn/info/1003/1947.htm" }
    },
    {
      date: "2025.06",
      title: "AI 创新高地实施方案",
      text: "提出到 2025 年底核心产业营收超 3900 亿元、规上核心企业超 700 家、智算规模超 50 EFLOPS。",
      source: { label: "杭州市政府", url: "https://z.hangzhou.com.cn/sdx/content/content_9022081.html" }
    },
    {
      date: "2025.12",
      title: "提出“人工智能创新发展第一城”",
      text: "2025 年 1—9 月杭州 AI 核心产业营收 3179 亿元，同比增长 25.9%；利润总额增长 55.8%。",
      source: { label: "中国新闻网", url: "https://finance.eastmoney.com/a/202512183595903922.html" }
    },
    {
      date: "2026.03",
      title: "全国首部具身智能机器人地方性法规",
      text: "《杭州市促进具身智能机器人产业发展条例》出台，把具身智能从产业政策推进到法治保障。",
      source: { label: "中国新闻网", url: "https://www.chinanews.com/cj/2026/07-30/10669116.shtml" }
    },
    {
      date: "2026.04",
      title: "群核科技登陆港交所",
      text: "股票代码 00068.HK，成为“杭州六小龙”中首家上市公司，也是“全球空间智能第一股”。",
      source: { label: "证券时报", url: "https://www.stcn.com/article/detail/3758628.html" }
    },
    {
      date: "2026.05",
      title: "国家具身智能中试基地启用",
      text: "国家人工智能应用中试基地（具身智能）在滨江启用，已部署 140 多台机器人在数十个场景测试与采集数据。",
      source: { label: "中国新闻网", url: "https://www.chinanews.com/cj/2026/07-30/10669116.shtml" }
    },
    {
      date: "2026.05",
      title: "DeepSeek 首轮融资报道",
      text: "媒体称其计划首轮募资最高 500 亿元，投后估值或超 3500 亿元；该信息未获公司官方确认。",
      source: { label: "证券时报", url: "https://stcn.com/article/detail/3904065.html" }
    },
    {
      date: "2026.08",
      title: "宇树科技科创板上市",
      text: "股票代码 688836；2026 年前三季度营收 18.17 亿元，同比增长 55.71%。",
      source: { label: "每日经济新闻", url: "https://news.qq.com/rain/a/20261028A0DA6300" }
    },
    {
      date: "2026.09",
      title: "938 家核心企业，半年 2705 亿元",
      text: "杭州 AI 核心企业达 938 家，其中 6 家营收超 100 亿元、69 家超 10 亿元；2026 上半年核心产业营收 2705 亿元，同比增长 26%。",
      source: { label: "JST Science Portal China", url: "https://spap.jst.go.jp/china/news/260902/topic_5_01.html" }
    }
  ],

  stats: [
    {
      value: "938",
      suffix: "家",
      label: "AI 核心企业",
      note: "2026.09，杭州 AI 核心企业数量",
      source: { label: "JST", url: "https://spap.jst.go.jp/china/news/260902/topic_5_01.html" }
    },
    {
      value: "2705",
      suffix: "亿元",
      label: "2026 上半年核心产业营收",
      note: "同比增长 26%",
      source: { label: "JST", url: "https://spap.jst.go.jp/china/news/260902/topic_5_01.html" }
    },
    {
      value: "29.5",
      suffix: "%",
      label: "数字经济核心产业占 GDP",
      note: "2025 年，增加值 6780 亿元",
      source: { label: "杭州市统计局", url: "https://www.hangzhou.gov.cn/col/col1229063407/art/2026/art_5a98b918d54343c0bb542bd1d05f24f3.html" }
    },
    {
      value: "3900",
      suffix: "亿元+",
      label: "2025 核心产业营收目标",
      note: "2025 年版行动方案",
      source: { label: "杭州市政府", url: "https://z.hangzhou.com.cn/sdx/content/content_9022081.html" }
    },
    {
      value: "1000",
      suffix: "亿元",
      label: "AI 产业基金目标规模",
      note: "2025 年版行动方案",
      source: { label: "杭州市政府", url: "https://z.hangzhou.com.cn/sdx/content/content_9022081.html" }
    },
    {
      value: "44",
      suffix: "家",
      label: "杭州独角兽",
      note: "2025 榜单；新晋 5 家中 4 家为 AI 企业",
      source: { label: "杭州日报", url: "https://www.hangzhou.gov.cn/art/2025/4/25/art_812266_59111994.html" }
    }
  ],

  sources: [
    {
      group: "城市与产业",
      items: [
        {
          label: "杭州市《加快建设人工智能创新高地实施方案（2025年版）》",
          publisher: "杭州市人民政府",
          date: "2025-06-21",
          url: "https://z.hangzhou.com.cn/sdx/content/content_9022081.html"
        },
        {
          label: "2025 年杭州数字经济核心产业增加值增长 9.3%",
          publisher: "杭州市统计局",
          date: "2026-02-26",
          url: "https://www.hangzhou.gov.cn/col/col1229063407/art/2026/art_5a98b918d54343c0bb542bd1d05f24f3.html"
        },
        {
          label: "杭州 AI 核心企业 938 家，上半年营收 2705 亿元",
          publisher: "JST Science Portal China",
          date: "2026-09-11",
          url: "https://spap.jst.go.jp/china/news/260902/topic_5_01.html"
        },
        {
          label: "杭州提出建设“人工智能创新发展第一城”",
          publisher: "中国新闻网 / 东方财富",
          date: "2025-12-18",
          url: "https://finance.eastmoney.com/a/202512183595903922.html"
        },
        {
          label: "活力中国调研行：杭州何止“六小龙”",
          publisher: "澎湃新闻 / 中国新闻网",
          date: "2026-07-30",
          url: "https://www.chinanews.com/cj/2026/07-30/10669116.shtml"
        },
        {
          label: "从独角兽榜单看科创新生态",
          publisher: "杭州日报 / 杭州市政府",
          date: "2025-04-25",
          url: "https://www.hangzhou.gov.cn/art/2025/4/25/art_812266_59111994.html"
        }
      ]
    },
    {
      group: "企业与资本市场",
      items: [
        {
          label: "群核科技港股上市，股票代码 00068.HK",
          publisher: "证券时报",
          date: "2026-04-17",
          url: "https://www.stcn.com/article/detail/3758628.html"
        },
        {
          label: "DeepSeek 500 亿元首轮融资报道",
          publisher: "证券时报",
          date: "2026-05-12",
          url: "https://stcn.com/article/detail/3904065.html"
        },
        {
          label: "宇树科技上市后首份季报",
          publisher: "每日经济新闻",
          date: "2026-10-28",
          url: "https://news.qq.com/rain/a/20261028A0DA6300"
        },
        {
          label: "海康威视 2025 年报",
          publisher: "证券时报",
          date: "2026-04-17",
          url: "https://stcn.com/article/detail/3760899.html"
        },
        {
          label: "大华股份 2025 年报",
          publisher: "证券之星",
          date: "2026-04-17",
          url: "https://wap.stockstar.com/detail/IG2026041700044230"
        },
        {
          label: "虹软科技 2025 年报",
          publisher: "证券时报",
          date: "2026-04-20",
          url: "https://stcn.com/article/detail/3767668.html"
        },
        {
          label: "萤石网络 2025 年度业绩快报",
          publisher: "上海证券报",
          date: "2026-01-21",
          url: "https://paper.cnstock.com/html/2026-01/21/content_2172271.htm"
        },
        {
          label: "中控技术 2025 年度业绩快报",
          publisher: "证券时报",
          date: "2026-02-13",
          url: "https://stcn.com/article/detail/3643233.html"
        },
        {
          label: "同花顺 2025 年报",
          publisher: "证券时报",
          date: "2026-03-09",
          url: "https://stcn.com/article/detail/3668515.html"
        },
        {
          label: "恒生电子 2025 年报",
          publisher: "21 财经",
          date: "2026-03-27",
          url: "https://m.21jingji.com/timeline/f31e5ea176505a5de27fabe2ed7b2a9d.html"
        },
        {
          label: "安恒信息 2025 年报",
          publisher: "中国经济网",
          date: "2026-03-26",
          url: "http://finance.ce.cn/stock/gsgdbd/202603/t20260326_2859002.shtml"
        },
        {
          label: "零跑汽车 2025 年业绩",
          publisher: "证券时报",
          date: "2026-03-19",
          url: "https://www.stcn.com/article/detail/3684514.html"
        },
        {
          label: "网易 2025 年业绩",
          publisher: "央广网",
          date: "2026-02-11",
          url: "https://finance.cnr.cn/ycbd/20260211/t20260211_527523623.shtml"
        }
      ]
    },
    {
      group: "企业官网与资料页",
      items: [
        { label: "DeepSeek", publisher: "DeepSeek", url: "https://www.deepseek.com/" },
        { label: "阿里云", publisher: "阿里云", url: "https://www.aliyun.com/" },
        { label: "蚂蚁集团", publisher: "蚂蚁集团", url: "https://www.antgroup.com/" },
        { label: "宇树科技", publisher: "Unitree", url: "https://www.unitree.com/" },
        { label: "云深处科技", publisher: "DEEP Robotics", url: "https://www.deeprobotics.cn/" },
        { label: "强脑科技", publisher: "BrainCo", url: "https://www.brainco-hz.com/" },
        { label: "群核科技", publisher: "酷家乐", url: "https://www.kujiale.com/" },
        { label: "游戏科学", publisher: "Game Science", url: "https://gamesci.cn/" },
        { label: "海康威视", publisher: "Hikvision", url: "https://www.hikvision.com/cn/" },
        { label: "大华股份", publisher: "Dahua", url: "https://www.dahuatech.com/" },
        { label: "中控技术", publisher: "SUPCON", url: "https://www.supcon.com/" },
        { label: "同花顺", publisher: "同花顺", url: "https://www.10jqka.com.cn/" }
      ]
    }
  ]
};

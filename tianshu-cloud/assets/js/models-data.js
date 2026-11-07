/* ==========================================================================
   天枢云 · 模型目录数据
   价格口径：人民币 / 百万 tokens（输入、输出分开计价）
   价格系数：官方倍率 × 2 USD/百万 tokens × 6.82 汇率
   快照日期：2026-11-06，实际扣费以上游控制台实时价格与渠道折扣为准。
   ========================================================================== */
window.TIANSHU_API = {
  brand: "天枢云",
  baseUrl: "https://token.quanxiyun.cloud/v1",
  consoleUrl: "https://token.quanxiyun.cloud/console",
  registerUrl: "https://token.quanxiyun.cloud/r/HyicS5",
  upstreamUrl: "https://token.quanxiyun.cloud",
  priceSnapshot: "2026-11-06",
  fx: 6.82
};

window.TIANSHU_MODELS = [
  {
    id: "glm-5.3",
    name: "GLM-5.3",
    vendor: "智谱 AI",
    mark: "智",
    type: "text",
    tags: ["旗舰", "推理", "Agent"],
    desc: "智谱新一代旗舰，面向复杂推理与智能体任务，中文理解与工具调用能力突出。",
    inPrice: "8.00",
    outPrice: "28.00",
    hot: true
  },
  {
    id: "glm-5.3-flash",
    name: "GLM-5.3-Flash",
    vendor: "智谱 AI",
    mark: "智",
    type: "text",
    tags: ["轻量", "高并发", "低成本"],
    desc: "旗舰同源的轻量版本，适合高并发、低延迟的批量文本处理。",
    inPrice: "0.80",
    outPrice: "2.80"
  },
  {
    id: "glm-5.2",
    name: "GLM-5.2",
    vendor: "智谱 AI",
    mark: "智",
    type: "text",
    tags: ["通用", "稳定"],
    desc: "上一代旗舰快照，能力稳定、行为可预期，适合长期在线的生产业务。",
    inPrice: "8.00",
    outPrice: "28.00"
  },
  {
    id: "kimi-k3",
    name: "Kimi K3",
    vendor: "月之暗面",
    mark: "K",
    type: "text",
    tags: ["1M 上下文", "多模态", "Agent"],
    desc: "支持百万级上下文与原生多模态理解，适合长文档、代码库与深度研究。",
    inPrice: "19.98",
    outPrice: "99.97",
    hot: true
  },
  {
    id: "kimi-k3.1-pro",
    name: "Kimi K3.1 Pro",
    vendor: "月之暗面",
    mark: "K",
    type: "text",
    tags: ["推理", "长文本"],
    desc: "K3 系列增强版本，强化复杂推理、长程任务规划与多工具协同。",
    inPrice: "13.00",
    outPrice: "68.00"
  },
  {
    id: "kimi-k2.7-code",
    name: "Kimi K2.7 Code",
    vendor: "月之暗面",
    mark: "K",
    type: "text",
    tags: ["代码", "Agent"],
    desc: "面向代码工程优化，擅长仓库级理解、多文件重构与终端任务执行。",
    inPrice: "6.34",
    outPrice: "26.39"
  },
  {
    id: "qwen3.8-max",
    name: "Qwen3.8-Max",
    vendor: "阿里通义",
    mark: "Q",
    type: "text",
    tags: ["旗舰", "多模态", "1M 上下文"],
    desc: "超大规模 MoE 旗舰，原生视觉理解，覆盖办公、法律、金融等专业任务。",
    inPrice: "12.00",
    outPrice: "36.00",
    hot: true
  },
  {
    id: "qwen3.7-max",
    name: "Qwen3.7-Max",
    vendor: "阿里通义",
    mark: "Q",
    type: "text",
    tags: ["旗舰", "稳定版"],
    desc: "3.7 代旗舰的稳定快照，适合对输出一致性要求较高的业务。",
    inPrice: "12.00",
    outPrice: "36.00"
  },
  {
    id: "qwen3.6-plus",
    name: "Qwen3.6-Plus",
    vendor: "阿里通义",
    mark: "Q",
    type: "text",
    tags: ["均衡", "高性价比"],
    desc: "性能与成本均衡的主力型号，适合大规模内容生成与业务对话。",
    inPrice: "1.98",
    outPrice: "12.01"
  },
  {
    id: "qwen3.8-flash",
    name: "Qwen3.8-Flash",
    vendor: "阿里通义",
    mark: "Q",
    type: "text",
    tags: ["轻量", "低延迟"],
    desc: "极低单价的轻量模型，适合分类、抽取、客服分流等高吞吐场景。",
    inPrice: "0.80",
    outPrice: "2.70"
  },
  {
    id: "deepseek-v4-pro",
    name: "DeepSeek V4-Pro",
    vendor: "深度求索",
    mark: "D",
    type: "text",
    tags: ["推理", "代码", "中文"],
    desc: "深度求索旗舰推理模型，数学、代码与中文长文本能力均衡。",
    inPrice: "9.00",
    outPrice: "27.00",
    hot: true
  },
  {
    id: "deepseek-v4.1-flash",
    name: "DeepSeek V4.1-Flash",
    vendor: "深度求索",
    mark: "D",
    type: "text",
    tags: ["高性价比", "高并发"],
    desc: "低成本高吞吐版本，适合海量调用与在线服务的主力选择。",
    inPrice: "2.00",
    outPrice: "8.00"
  },
  {
    id: "deepseek-v3.2",
    name: "DeepSeek V3.2",
    vendor: "深度求索",
    mark: "D",
    type: "text",
    tags: ["通用", "经济型"],
    desc: "成熟稳定的通用对话模型，输出成本低，适合大批量生成任务。",
    inPrice: "2.00",
    outPrice: "3.00"
  },
  {
    id: "doubao-seed-2.1-pro",
    name: "Doubao-Seed-2.1-Pro",
    vendor: "字节豆包",
    mark: "豆",
    type: "text",
    tags: ["多模态", "Agent"],
    desc: "豆包新一代专业版，强化多模态理解、复杂指令跟随与工具调用。",
    inPrice: "6.00",
    outPrice: "30.00"
  },
  {
    id: "doubao-seed-2.1-turbo",
    name: "Doubao-Seed-2.1-Turbo",
    vendor: "字节豆包",
    mark: "豆",
    type: "text",
    tags: ["高并发", "低延迟"],
    desc: "面向在线业务的加速版本，兼顾响应速度与推理成本。",
    inPrice: "3.00",
    outPrice: "15.00"
  },
  {
    id: "hy3",
    name: "混元 Hy3",
    vendor: "腾讯混元",
    mark: "混",
    type: "text",
    tags: ["中文", "长文本", "性价比"],
    desc: "混元新一代 MoE 模型，中文理解与长文档处理能力突出。",
    inPrice: "1.00",
    outPrice: "4.01"
  },
  {
    id: "hy4-preview",
    name: "混元 Hy4 Preview",
    vendor: "腾讯混元",
    mark: "混",
    type: "text",
    tags: ["预览版", "推理"],
    desc: "混元下一代预览模型，适合提前验证新能力与效果上限。",
    inPrice: "6.00",
    outPrice: "18.00"
  },
  {
    id: "minimax-m3",
    name: "MiniMax-M3",
    vendor: "MiniMax",
    mark: "M",
    type: "text",
    tags: ["多模态", "长上下文"],
    desc: "稀疏注意力架构，支持超长上下文与图像、视频理解，推理效率高。",
    inPrice: "4.20",
    outPrice: "16.77",
    hot: true
  },
  {
    id: "minimax-m3.1-flash",
    name: "MiniMax-M3.1-Flash",
    vendor: "MiniMax",
    mark: "M",
    type: "text",
    tags: ["轻量", "多模态"],
    desc: "M3 系列轻量版本，适合高频多模态调用与实时交互。",
    inPrice: "1.00",
    outPrice: "4.00"
  },
  {
    id: "claude-opus-4-8",
    name: "Claude Opus 4.8",
    vendor: "Anthropic",
    mark: "A",
    type: "text",
    tags: ["旗舰", "推理", "代码"],
    desc: "Anthropic 旗舰模型，复杂推理、代码工程与长任务执行表现稳定。",
    inPrice: "34.10",
    outPrice: "170.50"
  },
  {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    vendor: "Anthropic",
    mark: "A",
    type: "text",
    tags: ["均衡", "代码", "Agent"],
    desc: "性能与成本均衡的主力型号，适合生产级 Agent 与编程场景。",
    inPrice: "20.46",
    outPrice: "102.30",
    hot: true
  },
  {
    id: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    vendor: "Anthropic",
    mark: "A",
    type: "text",
    tags: ["轻量", "低延迟"],
    desc: "轻量高速版本，适合实时交互、内容审核与批量预处理。",
    inPrice: "6.82",
    outPrice: "34.10"
  },
  {
    id: "gpt-5.5",
    name: "GPT-5.5",
    vendor: "OpenAI",
    mark: "O",
    type: "text",
    tags: ["旗舰", "推理", "多模态"],
    desc: "OpenAI 旗舰模型，面向高难度推理、专业交付与复杂工作流。",
    inPrice: "34.10",
    outPrice: "204.60",
    hot: true
  },
  {
    id: "gpt-5.4",
    name: "GPT-5.4",
    vendor: "OpenAI",
    mark: "O",
    type: "text",
    tags: ["通用", "Agent"],
    desc: "成熟旗舰，工具调用与多步骤任务执行力强，适合生产环境。",
    inPrice: "17.05",
    outPrice: "102.30"
  },
  {
    id: "gpt-5.4-mini",
    name: "GPT-5.4-mini",
    vendor: "OpenAI",
    mark: "O",
    type: "text",
    tags: ["轻量", "高并发"],
    desc: "小尺寸版本，成本更低，适合大规模在线业务与边缘场景。",
    inPrice: "5.12",
    outPrice: "30.69"
  },
  {
    id: "gemini-3.1-pro",
    name: "Gemini 3.1 Pro",
    vendor: "Google",
    mark: "G",
    type: "text",
    tags: ["多模态", "长上下文"],
    desc: "原生多模态与超长上下文，适合视频、文档与跨模态深度理解。",
    inPrice: "13.64",
    outPrice: "81.84"
  },
  {
    id: "gemini-3-flash",
    name: "Gemini 3 Flash",
    vendor: "Google",
    mark: "G",
    type: "text",
    tags: ["快速", "多模态"],
    desc: "低延迟多模态型号，适合实时应用、批量处理与成本敏感场景。",
    inPrice: "3.41",
    outPrice: "20.46"
  },
  {
    id: "grok-4.3",
    name: "Grok 4.3",
    vendor: "xAI",
    mark: "X",
    type: "text",
    tags: ["推理", "信息整合"],
    desc: "输入输出同价的推理模型，适合工具调用、检索整合与实时问答。",
    inPrice: "8.53",
    outPrice: "8.53"
  },
  {
    id: "qwen-image-3.0-pro",
    name: "Qwen-Image-3.0-Pro",
    vendor: "阿里通义",
    mark: "Q",
    type: "image",
    tags: ["中文渲染", "商业设计"],
    desc: "通义图像旗舰，擅长中文文字渲染、商业海报与电商视觉。",
    priceText: "按张计费"
  },
  {
    id: "z-image-turbo",
    name: "Z-Image-Turbo",
    vendor: "阿里通义",
    mark: "Z",
    type: "image",
    tags: ["极速", "低成本"],
    desc: "极速图像模型，单张成本低至约 ¥0.10，适合批量出图与草图探索。",
    priceText: "约 ¥0.10 / 张起"
  },
  {
    id: "doubao-seedream-5.0",
    name: "Doubao-Seedream 5.0",
    vendor: "字节豆包",
    mark: "豆",
    type: "image",
    tags: ["高清", "营销素材"],
    desc: "豆包图像生成模型，适合电商主图、营销素材与创意海报。",
    priceText: "按张计费"
  },
  {
    id: "kling-3.0-image",
    name: "Kling 3.0 Image",
    vendor: "可灵",
    mark: "可",
    type: "image",
    tags: ["写实", "人像"],
    desc: "可灵图像模型，写实人像与场景表现稳定，支持多风格输出。",
    priceText: "按张计费"
  },
  {
    id: "gpt-image-2",
    name: "GPT-Image-2",
    vendor: "OpenAI",
    mark: "O",
    type: "image",
    tags: ["指令遵循", "图像编辑"],
    desc: "指令理解与图像编辑能力强，适合设计工作流与素材二次创作。",
    priceText: "按张计费"
  },
  {
    id: "seedance-2.0",
    name: "Seedance 2.0",
    vendor: "字节豆包",
    mark: "豆",
    type: "video",
    tags: ["音画同步", "多镜头"],
    desc: "支持文生视频、图生视频与参考音频，适合短剧、广告与电商视频。",
    priceText: "按秒计费"
  },
  {
    id: "seedance-2.5",
    name: "Seedance 2.5",
    vendor: "字节豆包",
    mark: "豆",
    type: "video",
    tags: ["长叙事", "一致性"],
    desc: "新一代视频模型，强化长叙事、主体一致性与镜头语言控制。",
    priceText: "按秒计费"
  },
  {
    id: "happyhorse-1.1",
    name: "HappyHorse 1.1",
    vendor: "HappyHorse",
    mark: "H",
    type: "video",
    tags: ["真人感", "口播"],
    desc: "人物口播与商品视频表现自然，适合短剧、广告与带货内容。",
    priceText: "按秒计费"
  },
  {
    id: "kling-3.0",
    name: "Kling 3.0",
    vendor: "可灵",
    mark: "可",
    type: "video",
    tags: ["图生视频", "运镜"],
    desc: "图生视频与运镜控制成熟，适合创意短片与商业分镜。",
    priceText: "按秒计费"
  },
  {
    id: "sora-2",
    name: "Sora 2",
    vendor: "OpenAI",
    mark: "O",
    type: "video",
    tags: ["物理一致性", "叙事"],
    desc: "面向叙事与物理一致性的视频模型，适合概念片与高质感短片。",
    priceText: "按秒计费"
  },
  {
    id: "veo-3.1",
    name: "Veo 3.1",
    vendor: "Google",
    mark: "G",
    type: "video",
    tags: ["原生音频", "电影感"],
    desc: "原生音画同步与电影感画面，适合广告片与影视级预演。",
    priceText: "按秒计费"
  }
];

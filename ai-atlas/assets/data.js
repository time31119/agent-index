/* AI ATLAS 2026 — 100 个全球 AI 产品
 * 数据为 2025.10–2026.03 公开资料与第三方估算快照，非实时榜单。
 * 访问量单位：百万/月；下载量单位：百万/月；MAU 单位：百万。
 */
window.AI_ATLAS = {
  meta: {
    title: "AI Atlas 2026",
    subtitle: "全球 AI 产品百强",
    edition: "VOL. 01 / 2026",
    updated: "2026-11-02",
    snapshot: "2025.10 — 2026.03",
    intro:
      "把网站访问、APP 下载与月活放在同一张地图上。不是官方排名，而是一份可以继续查证、筛选和下载的 AI 产品研究底稿。",
    sources: [
      {
        label: "a16z · Top 100 Gen AI Consumer Apps",
        note: "第六版，2026 年 3 月；APP 月活与网页访问的方法论参照。",
        url: "https://www.a16z.news/p/top-100-gen-ai-consumer-apps-march"
      },
      {
        label: "AI 产品榜 · 2025 年 10 月网站榜 TOP100",
        note: "基于 Similarweb 的月度访问量，网站数据的主要来源。",
        url: "https://www.szhzxw.cn/102332.html"
      },
      {
        label: "DataEye × 点点数据 · AI APP 下载榜",
        note: "2025 年 10 月全球双端预估下载量，APP 下载数据的主要来源。",
        url: "https://www.jiemian.com/article/13608897.html"
      },
      {
        label: "Sensor Tower · State of Mobile 2026",
        note: "全球移动 AI 应用增长与下载趋势的交叉验证。",
        url: "https://9to5mac.com/2026/01/21/sensor-towers-state-of-mobile-2026-tiktok-dominates-ai-apps-surge-games-lose-ground/"
      }
    ]
  },

  categories: [
    {
      id: "assistant",
      name: "通用助手",
      en: "General assistants",
      desc: "把对话变成搜索、写作、编程与行动的统一入口。",
      color: "#D8FF3E"
    },
    {
      id: "search",
      name: "搜索与研究",
      en: "Search & research",
      desc: "从关键词到带引用的答案，再到可执行的研究工作流。",
      color: "#6EE7F9"
    },
    {
      id: "image",
      name: "图像创作",
      en: "Image generation",
      desc: "用提示词、参考图与画布生成商业级视觉。",
      color: "#FF7A45"
    },
    {
      id: "photo",
      name: "影像编辑",
      en: "Photo editing",
      desc: "修图、修复、抠图与一键美化，手机里的 AI 暗房。",
      color: "#FF9EC4"
    },
    {
      id: "video",
      name: "视频生成",
      en: "Video & avatars",
      desc: "从一句话、一张图到可发布的短片与数字人。",
      color: "#A78BFA"
    },
    {
      id: "audio",
      name: "音频与音乐",
      en: "Audio & music",
      desc: "音乐、配音、克隆与转写，声音成为可编程素材。",
      color: "#FBBF24"
    },
    {
      id: "productivity",
      name: "生产力与办公",
      en: "Productivity",
      desc: "文档、演示、会议、翻译与知识库的 AI 化。",
      color: "#93C5FD"
    },
    {
      id: "code",
      name: "编程与智能体",
      en: "Code & agents",
      desc: "从代码补全到用自然语言生成、部署完整应用。",
      color: "#34D399"
    },
    {
      id: "education",
      name: "教育学习",
      en: "Education",
      desc: "解题、语言学习、闪卡与个性化 AI 导师。",
      color: "#FDE68A"
    },
    {
      id: "companion",
      name: "情感陪伴",
      en: "Companions",
      desc: "角色、记忆与语音，满足情感与娱乐需求。",
      color: "#FB7185"
    }
  ],

  products: [
    /* ── 01–12 通用助手 ───────────────────────────── */
    {
      id: "chatgpt", name: "ChatGPT", company: "OpenAI", country: "美国", code: "US",
      year: 2022, category: "assistant", type: "both", url: "https://chatgpt.com",
      visits: 6370, downloads: 80.0, mau: 800, growth: 4.4,
      pricing: "免费 / Plus $20/月", priceType: "freemium",
      tagline: "全球使用最广的通用 AI 助手",
      desc: "从写作、分析到编程与多模态创作，ChatGPT 仍是大多数人接触生成式 AI 的第一入口。",
      long: "从对话产品扩展为超级应用：GPTs、语音、图像、视频、Deep Research 与 Agent 能力持续叠加。2026 年初周活约 9 亿，网页月访问量约为第二名的 5 倍。",
      tags: ["多模态", "智能体", "GPTs"], color: "#10A37F", est: false
    },
    {
      id: "gemini", name: "Gemini", company: "Google", country: "美国", code: "US",
      year: 2023, category: "assistant", type: "both", url: "https://gemini.google.com",
      visits: 1220, downloads: 69.4, mau: 450, growth: 11.7,
      pricing: "免费 / Google AI Pro $19.99/月", priceType: "freemium",
      tagline: "Google 生态里的全能多模态助手",
      desc: "深度整合搜索、Android 与 Workspace，Gemini 用多模态和分发优势快速缩小与 ChatGPT 的差距。",
      long: "原生支持文本、图像、音频与视频理解，集成 Imagen、Veo、Canvas、Deep Research 与个人上下文。Android 是其最关键的默认入口。",
      tags: ["多模态", "Google 生态", "Deep Research"], color: "#4285F4", est: false
    },
    {
      id: "deepseek", name: "DeepSeek", company: "DeepSeek", country: "中国", code: "CN",
      year: 2023, category: "assistant", type: "both", url: "https://chat.deepseek.com",
      visits: 356.4, downloads: 9.2, mau: 60, growth: 7.4,
      pricing: "免费 / API 按量", priceType: "freemium",
      tagline: "以开源推理模型打开全球市场",
      desc: "用高性价比的推理模型和开放权重，成为中国 AI 最具全球辨识度的产品之一。",
      long: "V3 / R1 系列以低成本推理著称，网页与 APP 提供对话、联网搜索、代码与文件解析。API 价格和开源策略持续影响全球模型市场。",
      tags: ["开源", "推理", "低成本"], color: "#4D6BFE", est: false
    },
    {
      id: "grok", name: "Grok", company: "xAI", country: "美国", code: "US",
      year: 2023, category: "assistant", type: "both", url: "https://grok.com",
      visits: 212.4, downloads: 7.1, mau: 35, growth: 15.6,
      pricing: "免费 / SuperGrok $30/月", priceType: "freemium",
      tagline: "接入 X 实时信息的 AI 助手",
      desc: "依托 X 的实时内容与鲜明个性，Grok 在通用助手之外提供图像、视频和语音体验。",
      long: "可直接读取 X 上的实时讨论，支持 Imagine 图像/视频、Voice 模式与 DeepSearch。移动端在 Grok 4 与伴侣头像上线后增长显著。",
      tags: ["实时信息", "X 生态", "语音"], color: "#111111", est: false
    },
    {
      id: "claude", name: "Claude", company: "Anthropic", country: "美国", code: "US",
      year: 2023, category: "assistant", type: "both", url: "https://claude.ai",
      visits: 200.9, downloads: 2.4, mau: 30, growth: 25.5,
      pricing: "免费 / Pro $20/月", priceType: "freemium",
      tagline: "长文本、写作与代码见长的专业助手",
      desc: "Claude 以稳健的写作、长上下文和代码能力，成为知识工作者与开发者的高频选择。",
      long: "Artifacts、Projects、Computer Use 与 Claude Code 构成从对话到执行的工作流。企业采用率和付费用户增长是 2025–2026 年的亮点。",
      tags: ["长上下文", "写作", "代码"], color: "#D97757", est: false
    },
    {
      id: "copilot", name: "Microsoft Copilot", company: "Microsoft", country: "美国", code: "US",
      year: 2023, category: "assistant", type: "both", url: "https://copilot.microsoft.com",
      visits: 109.4, downloads: 10.8, mau: 100, growth: 8.2,
      pricing: "免费 / Copilot Pro $20/月", priceType: "freemium",
      tagline: "嵌入 Windows 与 Office 的 AI 同事",
      desc: "把对话、搜索、文档与会议能力嵌入 Windows、Edge 和 Microsoft 365，是 enterprise AI 的默认入口之一。",
      long: "结合 GPT 模型与 Microsoft Graph，可读取工作邮件、日历、文件与会议记录，在 Office 应用内完成写作、总结与数据整理。",
      tags: ["Windows", "Office", "企业"], color: "#0078D4", est: false
    },
    {
      id: "doubao", name: "豆包", company: "字节跳动", country: "中国", code: "CN",
      year: 2023, category: "assistant", type: "both", url: "https://www.doubao.com",
      visits: 88.4, downloads: 17.1, mau: 315, growth: 2.8,
      pricing: "免费 / 会员订阅", priceType: "freemium",
      tagline: "中国用户规模最大的 AI 助手之一",
      desc: "背靠豆包大模型与抖音生态，覆盖聊天、语音、创作、搜索与学习场景。",
      long: "提供实时语音通话、图片生成、AI 搜索、智能体和文件处理。2026 年初移动端月活约 3.15 亿，是中国市场最重要的 AI 入口。",
      tags: ["中文", "多模态", "字节生态"], color: "#3B82F6", est: false
    },
    {
      id: "metaai", name: "Meta AI", company: "Meta", country: "美国", code: "US",
      year: 2023, category: "assistant", type: "both", url: "https://www.meta.ai",
      visits: 23.1, downloads: 5.0, mau: 600, growth: 105.2,
      pricing: "免费", priceType: "free",
      tagline: "嵌入数十亿社交用户的 AI 入口",
      desc: "直接出现在 Facebook、Instagram、WhatsApp 与 Messenger 中，Meta AI 用社交分发换取规模。",
      long: "支持对话、图像生成、名人语音与实时信息。凭借 Meta 的社交网络，它可能是全球月活最大的 AI 助手之一，但独立品牌心智弱于 ChatGPT。",
      tags: ["社交分发", "免费", "Meta"], color: "#0866FF", est: true
    },
    {
      id: "quark", name: "夸克", company: "阿里巴巴", country: "中国", code: "CN",
      year: 2016, category: "assistant", type: "both", url: "https://quark.cn",
      visits: 35.0, downloads: 6.2, mau: 150,
      pricing: "免费 / 会员", priceType: "freemium",
      tagline: "从浏览器进化为 AI 搜索与学习入口",
      desc: "以 AI 搜索、扫描、网盘和学习工具切入，夸克在中国年轻用户中拥有极高的日常使用频率。",
      long: "从工具型浏览器转型为“AI 超级入口”，覆盖搜索问答、文档扫描、写作、高考志愿与网盘。移动端与小程序协同，是国内 AI 搜索的重要玩家。",
      tags: ["AI 搜索", "浏览器", "学习"], color: "#5B5BD6", est: true
    },
    {
      id: "qwen", name: "通义千问 Qwen", company: "阿里巴巴", country: "中国", code: "CN",
      year: 2023, category: "assistant", type: "both", url: "https://chat.qwen.ai",
      visits: 33.6, downloads: 6.4, mau: 100, growth: 6.5,
      pricing: "免费 / API 按量", priceType: "freemium",
      tagline: "开源模型家族与消费级 AI 助手",
      desc: "Qwen 既是全球最活跃的开源模型家族之一，也是面向消费者的通义千问应用。",
      long: "覆盖文本、视觉、音频、代码与多语言场景，开源生态被广泛用于二次开发。消费端提供搜索、写作、文件解析、图像生成与 Agent。",
      tags: ["开源", "多模态", "阿里云"], color: "#6E56CF", est: false
    },
    {
      id: "kimi", name: "Kimi", company: "月之暗面", country: "中国", code: "CN",
      year: 2023, category: "assistant", type: "both", url: "https://kimi.moonshot.cn",
      visits: 29.6, downloads: 2.2, mau: 36, growth: -2.0,
      pricing: "免费 / 会员", priceType: "freemium",
      tagline: "以超长上下文和文档阅读起家",
      desc: "Kimi 用长文本、PDF 与网页解析建立差异化，是中文研究与知识工作者的常用助手。",
      long: "支持多文件、长文档、网页与学术资料解析，K 系列模型强化推理、代码与 Agent 任务。2025 年后增长放缓，但品牌心智仍然稳固。",
      tags: ["长文本", "中文", "研究"], color: "#111827", est: false
    },
    {
      id: "yuanbao", name: "腾讯元宝", company: "腾讯", country: "中国", code: "CN",
      year: 2024, category: "assistant", type: "both", url: "https://yuanbao.tencent.com",
      visits: 22.1, downloads: 5.3, mau: 40, growth: -1.3,
      pricing: "免费", priceType: "free",
      tagline: "深度连接微信与腾讯内容生态",
      desc: "腾讯元宝把混元与 DeepSeek 双模型、公众号内容搜索和微信生态连接在一起。",
      long: "支持公众号文章搜索、文件解析、AI 搜索、图片生成与办公文档处理。微信生态的分发能力是其最独特的护城河。",
      tags: ["微信生态", "双模型", "中文"], color: "#07C160", est: false
    },

    /* ── 13–18 搜索与研究 ─────────────────────────── */
    {
      id: "perplexity", name: "Perplexity", company: "Perplexity AI", country: "美国", code: "US",
      year: 2022, category: "search", type: "both", url: "https://www.perplexity.ai",
      visits: 228.3, downloads: 33.7, mau: 45, growth: 29.1,
      pricing: "免费 / Pro $20/月", priceType: "freemium",
      tagline: "以引用来源为核心的 AI 答案引擎",
      desc: "Perplexity 把搜索、推理与引用结合，正在把“查资料”变成可追溯的对话。",
      long: "每条答案附带来源，支持 Deep Research、文件上传、Spaces 与 Comet 浏览器。2025 年下载量高速增长，成为 AI 搜索赛道最直接的挑战者。",
      tags: ["AI 搜索", "引用", "研究"], color: "#20808D", est: false
    },
    {
      id: "poe", name: "Poe", company: "Quora", country: "美国", code: "US",
      year: 2023, category: "search", type: "both", url: "https://poe.com",
      visits: 14.7, downloads: 0.9, mau: 8, growth: -5.2,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "一个入口调用多家模型的 Bot 平台",
      desc: "Poe 把 GPT、Claude、Gemini 等模型和用户创建的 Bot 聚合在同一个界面里。",
      long: "适合比较不同模型、构建自定义 Bot 和分享提示词。随着各家助手自家入口增强，Poe 的差异化转向社区与多模型工作流。",
      tags: ["模型聚合", "Bot", "社区"], color: "#5D3FD3", est: false
    },
    {
      id: "notebooklm", name: "NotebookLM", company: "Google", country: "美国", code: "US",
      year: 2023, category: "search", type: "both", url: "https://notebooklm.google.com",
      visits: 106.9, downloads: 0.8, mau: 25, growth: 26.8,
      pricing: "免费 / Google AI Pro", priceType: "freemium",
      tagline: "基于个人资料的 AI 研究与笔记工具",
      desc: "上传资料后生成摘要、问答、思维导图，甚至把文档变成一档中文播客。",
      long: "支持 PDF、网页、YouTube、音频与 Google Docs，回答严格基于用户上传的来源。Audio Overview 让它在知识管理和教育场景破圈。",
      tags: ["知识库", "播客", "研究"], color: "#F9AB00", est: false
    },
    {
      id: "aistudio", name: "Google AI Studio", company: "Google", country: "美国", code: "US",
      year: 2023, category: "search", type: "web", url: "https://aistudio.google.com",
      visits: 163.3, mau: 12, growth: -5.2,
      pricing: "免费 / API 按量", priceType: "freemium",
      tagline: "面向开发者的 Gemini 试验场",
      desc: "在浏览器里调试提示词、比较模型、测试多模态输入，并一键生成 API 代码。",
      long: "Google AI Studio 是 Gemini 开发生态的入口，支持 Live API、结构化输出、文件搜索与模型评测。对开发者来说，它比消费级 Gemini 更接近“工作台”。",
      tags: ["开发者", "Gemini API", "多模态"], color: "#34A853", est: false
    },
    {
      id: "huggingface", name: "Hugging Face", company: "Hugging Face", country: "美国 / 法国", code: "US/FR",
      year: 2016, category: "search", type: "web", url: "https://huggingface.co",
      visits: 22.4, mau: 15, growth: -4.2,
      pricing: "免费 / 企业版", priceType: "freemium",
      tagline: "全球最大的开源模型与数据集社区",
      desc: "从模型托管、数据集到 Spaces 演示，Hugging Face 是开源 AI 的基础设施和知识库。",
      long: "托管数十万个模型与数据集，提供 Inference Endpoints、Spaces、AutoTrain 与企业级部署。几乎所有开源模型发布都会在这里同步。",
      tags: ["开源", "模型社区", "数据集"], color: "#FFD21E", est: false
    },
    {
      id: "monica", name: "Monica", company: "Monica", country: "中国 / 新加坡", code: "CN/SG",
      year: 2023, category: "search", type: "both", url: "https://monica.im",
      visits: 9.5, downloads: 1.2, mau: 4, growth: -1.3,
      pricing: "免费 / Pro", priceType: "freemium",
      tagline: "浏览器侧边栏里的多模型助手",
      desc: "网页摘要、翻译、写作、搜索与 Agent 能力集中在浏览器侧栏，适合跨站工作流。",
      long: "支持 GPT、Claude、Gemini 等模型切换，可总结网页、回复邮件、生成图片和自动执行浏览器任务。产品形态轻，但使用场景高频。",
      tags: ["浏览器插件", "多模型", "效率"], color: "#7C3AED", est: false
    },

    /* ── 19–33 图像创作 ───────────────────────────── */
    {
      id: "canva", name: "Canva", company: "Canva", country: "澳大利亚", code: "AU",
      year: 2013, category: "image", type: "both", url: "https://www.canva.com",
      visits: 946.2, downloads: 1.2, mau: 250, growth: 0.2,
      pricing: "免费 / Pro", priceType: "freemium",
      tagline: "全球最大的在线设计平台",
      desc: "Canva 把模板、图片、视频和 AI 创作工具放进同一个浏览器画布，月活超过 2 亿。",
      long: "Magic Studio 提供文生图、背景移除、魔法改写、一键演示与品牌套件。它不是纯 AI 原生公司，却是生成式 AI 触达普通用户最广的产品之一。",
      tags: ["设计", "模板", "Magic Studio"], color: "#00C4CC", est: false
    },
    {
      id: "midjourney", name: "Midjourney", company: "Midjourney", country: "美国", code: "US",
      year: 2022, category: "image", type: "web", url: "https://www.midjourney.com",
      visits: 17.2, mau: 12, growth: -3.4,
      pricing: "$10/月起", priceType: "paid",
      tagline: "以审美与画面质感著称的文生图模型",
      desc: "Midjourney 用独特的审美取向定义了 AI 图像的一代视觉语言，至今仍是创意工作者的重要工具。",
      long: "从 Discord 起步，现已提供网页生成、风格参考、角色参考与 V7 模型。它不追求最便宜，而是最稳定的“好看”。",
      tags: ["文生图", "艺术", "社区"], color: "#111111", est: false
    },
    {
      id: "leonardo", name: "Leonardo.Ai", company: "Leonardo", country: "澳大利亚", code: "AU",
      year: 2022, category: "image", type: "both", url: "https://leonardo.ai",
      visits: 10.7, downloads: 2.0, mau: 10, growth: -3.6,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "面向游戏与创意生产的图像平台",
      desc: "Leonardo 把模型训练、实时画布、3D 纹理和游戏美术资产放在一个工作流里。",
      long: "支持自定义模型、LoRA、Canvas 编辑、材质生成与 API。被 Canva 收购后，正在成为其专业创意能力的一部分。",
      tags: ["游戏美术", "模型训练", "画布"], color: "#A855F7", est: false
    },
    {
      id: "civitai", name: "Civitai", company: "Civitai", country: "美国", code: "US",
      year: 2022, category: "image", type: "web", url: "https://civitai.com",
      visits: 18.8, mau: 10, growth: -7.1,
      pricing: "免费 / 会员", priceType: "freemium",
      tagline: "开源图像模型与 LoRA 的分享社区",
      desc: "Civitai 是 Stable Diffusion 生态的素材库、模型市场和作品社区，几乎覆盖所有风格。",
      long: "汇聚检查点、LoRA、工作流与生成作品，支持在线生成和模型训练。对进阶 AI 绘画用户来说，它更像一个持续更新的“风格应用商店”。",
      tags: ["Stable Diffusion", "LoRA", "社区"], color: "#FF6B35", est: false
    },
    {
      id: "seaart", name: "SeaArt", company: "SeaArt", country: "新加坡", code: "SG",
      year: 2022, category: "image", type: "both", url: "https://www.seaart.ai",
      visits: 33.8, downloads: 3.2, mau: 15, growth: 2.9,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "面向二次元与游戏美术的 AI 社区",
      desc: "SeaArt 用角色、模型和社区内容吸引二次元创作者，是出海图像产品中的代表。",
      long: "提供文生图、图生图、角色一致性、模型训练与作品社区，移动端和网页端同步。主要用户在海外，内容生态偏 ACG。",
      tags: ["二次元", "角色", "模型"], color: "#FF4D8D", est: false
    },
    {
      id: "firefly", name: "Adobe Firefly", company: "Adobe", country: "美国", code: "US",
      year: 2023, category: "image", type: "both", url: "https://firefly.adobe.com",
      visits: 13.5, downloads: 1.4, mau: 12, growth: 27.7,
      pricing: "免费额度 / Creative Cloud", priceType: "freemium",
      tagline: "Adobe 的商用安全生成式 AI 套件",
      desc: "Firefly 深度嵌入 Photoshop、Illustrator 与 Express，主打可商用和创作流程整合。",
      long: "提供文生图、生成填充、生成扩展、矢量生成与视频生成。训练数据与商用授权是它区别于独立模型的核心卖点。",
      tags: ["商用安全", "Adobe", "生成填充"], color: "#FF3366", est: false
    },
    {
      id: "ideogram", name: "Ideogram", company: "Ideogram", country: "美国", code: "US",
      year: 2023, category: "image", type: "web", url: "https://ideogram.ai",
      visits: 9.0, mau: 5,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "擅长文字排版与海报设计的文生图工具",
      desc: "Ideogram 以准确的文字渲染见长，适合 Logo、海报、包装和社交媒体视觉。",
      long: "支持长文本排版、风格参考、Magic Prompt 与批量生成。对需要“图上有字”的设计任务，它长期是最稳定的选择之一。",
      tags: ["文字渲染", "海报", "设计"], color: "#FF5A5F", est: true
    },
    {
      id: "freepik", name: "Freepik", company: "Freepik", country: "西班牙", code: "ES",
      year: 2010, category: "image", type: "web", url: "https://www.freepik.com",
      visits: 30.0, mau: 50,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "从素材库转型为一体化 AI 创意平台",
      desc: "Freepik 把素材、模板、文生图、视频和背景移除整合成一个面向设计师的 AI 工作台。",
      long: "提供 AI 图像生成、视频生成、图标、PSD 模板、背景移除与批量编辑。它的优势不是单一模型，而是海量素材与生产流程的结合。",
      tags: ["素材库", "模板", "一体化"], color: "#1273EB", est: true
    },
    {
      id: "removebg", name: "Remove.bg", company: "Canva", country: "澳大利亚", code: "AU",
      year: 2018, category: "image", type: "web", url: "https://www.remove.bg",
      visits: 68.9, mau: 30, growth: -0.4,
      pricing: "免费额度 / 按张付费", priceType: "freemium",
      tagline: "一键去除图片背景的经典工具",
      desc: "Remove.bg 用极简的一键操作，把抠图变成任何人都能完成的日常动作。",
      long: "支持人物、产品、动物与复杂边缘，提供批量处理、API、Photoshop 插件和视频抠像。被 Canva 收购后仍是独立的高频工具。",
      tags: ["抠图", "电商", "API"], color: "#5A67D8", est: false
    },
    {
      id: "photoroom", name: "Photoroom", company: "Photoroom", country: "法国", code: "FR",
      year: 2019, category: "image", type: "both", url: "https://www.photoroom.com",
      visits: 18.6, downloads: 2.1, mau: 20, growth: 1.0,
      pricing: "免费 / Pro", priceType: "freemium",
      tagline: "面向电商卖家的 AI 产品图工具",
      desc: "Photoroom 把产品图拍摄、背景生成、批量编辑和品牌套件做成了一个移动摄影棚。",
      long: "支持 AI 背景、虚拟模特、阴影生成、批量去背景与团队模板。对中小电商卖家来说，它直接替代了部分传统摄影和修图流程。",
      tags: ["电商", "产品图", "虚拟摄影"], color: "#6C5CE7", est: false
    },
    {
      id: "pixelcut", name: "Pixelcut", company: "Pixelcut", country: "美国", code: "US",
      year: 2021, category: "image", type: "web", url: "https://www.pixelcut.ai",
      visits: 19.8, mau: 8, growth: 5.1,
      pricing: "免费 / Pro", priceType: "freemium",
      tagline: "轻量级 AI 图片编辑与商品图工具",
      desc: "Pixelcut 用一键去背景、扩图和场景生成，服务移动电商与社交媒体创作者。",
      long: "提供批量编辑、AI 背景、商品图模板、视频生成与 API。产品设计强调“几分钟出图”，适合没有设计团队的小商家。",
      tags: ["商品图", "轻量", "移动"], color: "#FF7A00", est: false
    },
    {
      id: "fotor", name: "Fotor", company: "Fotor", country: "中国", code: "CN",
      year: 2012, category: "image", type: "web", url: "https://www.fotor.com",
      visits: 15.6, mau: 25, growth: -2.5,
      pricing: "免费 / Pro", priceType: "freemium",
      tagline: "老牌在线图片编辑平台，全面接入生成式 AI",
      desc: "Fotor 从在线修图工具转型为覆盖生成、编辑、头像和批量处理的 AI 创意平台。",
      long: "提供 AI 头像、文生图、背景移除、照片修复、拼图与批量处理。全球用户基础广，在新兴市场尤其实用。",
      tags: ["在线修图", "AI 头像", "批量"], color: "#00A8E8", est: false
    },
    {
      id: "pixlr", name: "Pixlr", company: "Inmagine", country: "马来西亚", code: "MY",
      year: 2008, category: "image", type: "web", url: "https://pixlr.com",
      visits: 13.2, mau: 12, growth: -0.2,
      pricing: "免费 / Premium", priceType: "freemium",
      tagline: "浏览器里的轻量 Photoshop 替代品",
      desc: "Pixlr 支持图层、蒙版和 AI 生成填充，无需安装即可完成专业级图片编辑。",
      long: "提供 Pixlr Editor、Pixlr E 与批量工具，AI 功能包括生成填充、扩图、去背景和风格迁移。适合快速编辑与教学场景。",
      tags: ["在线 PS", "图层", "生成填充"], color: "#00C2CB", est: false
    },
    {
      id: "cutout", name: "Cutout.Pro", company: "Winroad", country: "中国香港", code: "HK",
      year: 2018, category: "image", type: "web", url: "https://www.cutout.pro",
      visits: 12.8, mau: 8, growth: -11.7,
      pricing: "免费额度 / 订阅", priceType: "freemium",
      tagline: "面向电商与设计师的视觉处理平台",
      desc: "Cutout.Pro 把去背景、图像增强、老照片修复和视频抠像打包成一套 API 友好的工具。",
      long: "支持批量抠图、照片修复、图像放大、物体移除与视频背景处理。中国香港团队开发，主要用户在海外，是典型的“工具出海”产品。",
      tags: ["抠图", "增强", "API"], color: "#2D9CDB", est: false
    },
    {
      id: "picsart", name: "Picsart", company: "Picsart", country: "美国", code: "US",
      year: 2011, category: "image", type: "both", url: "https://picsart.com",
      visits: 14.4, downloads: 3.4, mau: 80, growth: 4.2,
      pricing: "免费 / Gold", priceType: "freemium",
      tagline: "移动端创意编辑社区",
      desc: "Picsart 把 AI 生成、背景替换、视频编辑和模板社区结合，月活规模庞大。",
      long: "提供 AI 图像生成、对象移除、背景替换、视频模板与创作者社区。它的优势在于移动端编辑体验和大量可复用模板。",
      tags: ["移动修图", "社区", "模板"], color: "#C209C1", est: false
    },

    /* ── 34–45 影像编辑 ───────────────────────────── */
    {
      id: "remini", name: "Remini", company: "Bending Spoons", country: "意大利", code: "IT",
      year: 2019, category: "photo", type: "app", url: "https://remini.ai",
      downloads: 11.2, mau: 60,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "AI 照片修复与画质增强应用",
      desc: "Remini 用老照片修复、模糊变清晰和 AI 头像长期占据全球下载榜前列。",
      long: "核心能力是人脸修复、画质增强、视频修复与 AI 照片生成。订阅制和高频“前后对比”内容让它成为移动端最赚钱的 AI 应用之一。",
      tags: ["修复", "增强", "头像"], color: "#FF4F81", est: true
    },
    {
      id: "meitu", name: "美图秀秀", company: "美图公司", country: "中国", code: "CN",
      year: 2008, category: "photo", type: "app", url: "https://www.meitu.com",
      downloads: 8.6, mau: 150,
      pricing: "免费 / VIP", priceType: "freemium",
      tagline: "中国国民级修图应用",
      desc: "美图秀秀把 AI 消除、扩图、证件照、绘画和视频美化做成了一套大众化工具。",
      long: "作为美图公司的核心入口，覆盖人像美容、滤镜、拼图、AI 绘画与视频编辑。移动端月活规模使其成为全球影像类 AI 的重要玩家。",
      tags: ["修图", "人像", "中文"], color: "#FF5C8A", est: true
    },
    {
      id: "beautyplus", name: "BeautyPlus", company: "美图公司", country: "中国", code: "CN",
      year: 2013, category: "photo", type: "app", url: "https://beautyplus.com",
      downloads: 2.9, mau: 40,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "面向全球市场的 AI 自拍与美颜应用",
      desc: "BeautyPlus 用美颜、妆容、背景替换和 AI 头像服务新兴市场的年轻用户。",
      long: "主打实时美颜、滤镜、拼图与 AI 照片生成，在东南亚、南亚和拉美拥有大量用户。是美图出海矩阵中的核心产品。",
      tags: ["美颜", "自拍", "出海"], color: "#FF7EB3", est: true
    },
    {
      id: "beautycam", name: "BeautyCam", company: "美图公司", country: "中国", code: "CN",
      year: 2014, category: "photo", type: "app", url: "https://beautycam.com",
      downloads: 2.7, mau: 30,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "轻量美颜相机与 AI 自拍工具",
      desc: "BeautyCam 以实时美颜、滤镜和 AI 造型，主打东南亚与南亚的年轻用户。",
      long: "提供自拍美颜、妆容、滤镜、贴纸与 AI 头像。产品轻量、上手简单，是美图海外矩阵中覆盖下沉市场的重要应用。",
      tags: ["相机", "美颜", "出海"], color: "#FF9F43", est: true
    },
    {
      id: "wink", name: "Wink", company: "美图公司", country: "中国", code: "CN",
      year: 2021, category: "photo", type: "app", url: "https://wink.meitu.com",
      downloads: 2.5, mau: 25,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "专注视频人像美化的 AI 剪辑应用",
      desc: "Wink 把视频美颜、画质修复、AI 动效和口播剪辑做成了一款“视频版美图秀秀”。",
      long: "支持视频美颜、去噪、超分、AI 动漫化与口播字幕。随着短视频创作普及，Wink 成为美图从图片转向视频的关键产品。",
      tags: ["视频美颜", "修复", "剪辑"], color: "#7B61FF", est: true
    },
    {
      id: "hypic", name: "Hypic", company: "字节跳动", country: "中国", code: "CN",
      year: 2022, category: "photo", type: "app", url: "https://hypic.app",
      downloads: 2.3, mau: 20,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "字节跳动的海外 AI 修图与滤镜应用",
      desc: "Hypic 用 AI 头像、滤镜、背景和批量修图，在东南亚和拉美市场快速增长。",
      long: "提供一键美颜、AI 发型、背景替换、滤镜与拼图。它与 CapCut 形成“图片 + 视频”的创作者工具组合，是字节出海矩阵的一部分。",
      tags: ["出海", "滤镜", "修图"], color: "#00D2D3", est: true
    },
    {
      id: "b612", name: "B612", company: "SNOW / Naver", country: "韩国", code: "KR",
      year: 2014, category: "photo", type: "app", url: "https://b612.com",
      downloads: 2.2, mau: 35,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "全球流行的自拍相机与 AI 滤镜应用",
      desc: "B612 以实时滤镜、美颜和 AI 头像，长期是全球自拍相机赛道的头部产品。",
      long: "提供实时美颜、滤镜、贴纸、AI 头像与视频自拍。由 SNOW（Naver 旗下）开发，在亚洲和全球市场拥有广泛用户基础。",
      tags: ["自拍", "滤镜", "相机"], color: "#FFD93D", est: true
    },
    {
      id: "facemoji", name: "Facemoji Keyboard", company: "NEXILEAP", country: "新加坡", code: "SG",
      year: 2016, category: "photo", type: "app", url: "https://www.facemojikeyboard.com",
      downloads: 2.0, mau: 30,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "带 AI 表情与创作的输入法",
      desc: "Facemoji 把 AI 表情、贴纸、字体和键盘皮肤结合，是出海工具型应用的代表。",
      long: "支持 AI 表情生成、贴纸、GIF、字体与多语言输入。它把“输入”与“视觉表达”结合，在年轻用户中形成差异化。",
      tags: ["输入法", "表情", "出海"], color: "#FFB703", est: true
    },
    {
      id: "airbrush", name: "AirBrush", company: "美图公司", country: "中国", code: "CN",
      year: 2017, category: "photo", type: "app", url: "https://airbrush.com",
      downloads: 1.9, mau: 15,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "AI 人像精修与一键美颜应用",
      desc: "AirBrush 主打自然美颜、身材调整和 AI 头像，在中东与欧美市场表现突出。",
      long: "提供一键美颜、祛痘、瘦脸、身材调整、背景替换与 AI 头像。强调“自然感”和精细控制，是美图海外矩阵中的高客单产品。",
      tags: ["人像", "精修", "出海"], color: "#FF6B9D", est: true
    },
    {
      id: "lensa", name: "Lensa", company: "Prisma Labs", country: "美国", code: "US",
      year: 2013, category: "photo", type: "app", url: "https://prisma-ai.com/lensa",
      downloads: 1.8, mau: 20,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "以 Magic Avatars 爆红的 AI 头像应用",
      desc: "Lensa 用一次性生成数十张风格化头像的体验，定义了 AI 头像的消费级玩法。",
      long: "提供 Magic Avatars、人像修图、背景替换与视频增强。虽然 AI 头像热度回落，但它仍是订阅制 AI 影像产品的经典案例。",
      tags: ["AI 头像", "风格化", "订阅"], color: "#6C5CE7", est: true
    },
    {
      id: "photoleap", name: "Photoleap", company: "Lightricks", country: "以色列", code: "IL",
      year: 2018, category: "photo", type: "app", url: "https://www.photoleapapp.com",
      downloads: 1.3, mau: 8,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "面向创意用户的 AI 照片合成应用",
      desc: "Photoleap 支持生成填充、AI 扩图、图层合成和动画，适合社交媒体视觉创作。",
      long: "把专业合成工具搬到手机上，提供 AI 替换、扩图、文字效果、动画与模板。Lightricks 的影像工具矩阵覆盖修图、视频和创意表达。",
      tags: ["合成", "图层", "创意"], color: "#FFB800", est: true
    },
    {
      id: "inshot", name: "InShot", company: "InShot", country: "中国", code: "CN",
      year: 2017, category: "photo", type: "app", url: "https://inshot.cc",
      downloads: 15.0, mau: 120,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "全球流行的移动视频剪辑与 AI 特效应用",
      desc: "InShot 用剪辑、AI 抠像、字幕、滤镜和模板，成为短视频创作者的基础工具。",
      long: "支持视频剪辑、画中画、AI 背景移除、自动字幕、变速与滤镜。它在新兴市场渗透率极高，全球月活超过 1 亿，是移动影像赛道最稳的产品之一。",
      tags: ["视频剪辑", "移动端", "模板"], color: "#FF3B30", est: false
    },

    /* ── 46–58 视频生成 ───────────────────────────── */
    {
      id: "sora", name: "Sora", company: "OpenAI", country: "美国", code: "US",
      year: 2024, category: "video", type: "both", url: "https://sora.com",
      visits: 68.6, downloads: 4.5, mau: 20, growth: 93.9,
      pricing: "Plus / Pro 包含", priceType: "paid",
      tagline: "OpenAI 的文生视频与 AI 社交应用",
      desc: "Sora 把文本生成视频、Remix、故事板和社交信息流放在一个应用里，是 AI 视频消费化的标志。",
      long: "支持文本/图像生成视频、角色客串、视频重混与故事板。移动端采用邀请制迅速扩张，网页流量在 2025 年秋季单月增长近一倍。",
      tags: ["文生视频", "社交", "OpenAI"], color: "#000000", est: false
    },
    {
      id: "runway", name: "Runway", company: "Runway", country: "美国", code: "US",
      year: 2018, category: "video", type: "web", url: "https://runwayml.com",
      visits: 8.4, mau: 5,
      pricing: "免费额度 / 订阅", priceType: "freemium",
      tagline: "面向影视与广告的专业 AI 视频平台",
      desc: "Runway 用 Gen 系列模型、运动笔刷和视频编辑工具，进入广告、电影预演和后期流程。",
      long: "支持文生视频、图生视频、摄像机控制、运动笔刷、绿幕与视频修复。它更像专业制作工具，而非社交玩具，客户包括影视与品牌团队。",
      tags: ["影视", "Gen-4", "专业"], color: "#00FF87", est: true
    },
    {
      id: "kling", name: "可灵 AI", company: "快手", country: "中国", code: "CN",
      year: 2024, category: "video", type: "both", url: "https://klingai.com",
      visits: 11.0, downloads: 2.3, mau: 12, growth: -9.4,
      pricing: "免费额度 / 订阅", priceType: "freemium",
      tagline: "快手推出的高质量 AI 视频模型",
      desc: "可灵以物理真实感、人物表演和运镜控制见长，是中国视频生成出海的代表。",
      long: "支持文生视频、图生视频、首尾帧、运动笔刷与对口型。其画面稳定性和人物一致性在创作者中口碑较高，广泛应用于广告和短剧。",
      tags: ["文生视频", "快手", "物理真实"], color: "#FF6B00", est: false
    },
    {
      id: "hailuo", name: "海螺 AI", company: "MiniMax", country: "中国", code: "CN",
      year: 2024, category: "video", type: "both", url: "https://hailuoai.video",
      visits: 8.1, downloads: 1.5, mau: 6,
      pricing: "免费额度 / 订阅", priceType: "freemium",
      tagline: "MiniMax 的 AI 视频与语音创作平台",
      desc: "海螺 AI 的 Hailuo 视频模型以运镜、人物一致性和性价比获得海外创作者关注。",
      long: "提供文生视频、图生视频、导演模式、配音与音效。MiniMax 同时在语音和文本模型上布局，海螺是其面向消费者的多模态入口。",
      tags: ["视频生成", "配音", "MiniMax"], color: "#FF4D4F", est: false
    },
    {
      id: "luma", name: "Luma AI", company: "Luma AI", country: "美国", code: "US",
      year: 2021, category: "video", type: "both", url: "https://lumalabs.ai",
      visits: 4.7, downloads: 1.2, mau: 5,
      pricing: "免费额度 / 订阅", priceType: "freemium",
      tagline: "以 Dream Machine 闻名的多模态平台",
      desc: "Luma 的 Dream Machine 让文生视频进入“随手可用”阶段，同时保留 3D 捕捉能力。",
      long: "支持文生视频、图生视频、关键帧、摄像机运动与 Ray 系列模型。早期以 NeRF/3D 重建起家，在空间内容与视频生成之间形成差异。",
      tags: ["Dream Machine", "3D", "视频"], color: "#7C3AED", est: true
    },
    {
      id: "heygen", name: "HeyGen", company: "HeyGen", country: "美国", code: "US",
      year: 2020, category: "video", type: "web", url: "https://www.heygen.com",
      visits: 8.8, downloads: 1.1, mau: 5, growth: -22.8,
      pricing: "免费额度 / 订阅", priceType: "freemium",
      tagline: "AI 数字人视频与多语言配音平台",
      desc: "HeyGen 上传一段视频就能生成数字分身，并用 170+ 语言完成口型同步的营销与培训视频。",
      long: "提供 Avatar、Video Translate、Interactive Avatar 与 API。它把传统企业视频制作压缩到几分钟，是数字人赛道商业化最成熟的产品之一。",
      tags: ["数字人", "口型同步", "营销"], color: "#6C5CE7", est: false
    },
    {
      id: "synthesia", name: "Synthesia", company: "Synthesia", country: "英国", code: "GB",
      year: 2017, category: "video", type: "web", url: "https://www.synthesia.io",
      visits: 6.2, mau: 4,
      pricing: "订阅制", priceType: "paid",
      tagline: "企业级 AI 数字人视频平台",
      desc: "Synthesia 用虚拟主播、模板和多语言配音，服务企业培训、内部沟通与产品营销。",
      long: "提供 140+ 语言的数字人视频、品牌套件、团队协作与 LMS 集成。相比消费级工具，它更强调合规、品牌一致性和企业工作流。",
      tags: ["企业", "数字人", "培训"], color: "#1F8A70", est: true
    },
    {
      id: "veed", name: "VEED", company: "VEED", country: "英国", code: "GB",
      year: 2018, category: "video", type: "web", url: "https://www.veed.io",
      visits: 11.9, downloads: 1.0, mau: 8, growth: 4.4,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "浏览器里的 AI 视频剪辑与字幕工具",
      desc: "VEED 把自动字幕、翻译、去背景、数字人和屏幕录制做成一套在线工作流。",
      long: "支持自动字幕、AI 翻译、语音克隆、背景移除、录屏与团队审阅。对播客、社交媒体和课程团队来说，它比传统剪辑软件更轻。",
      tags: ["在线剪辑", "字幕", "团队"], color: "#6C5CE7", est: false
    },
    {
      id: "descript", name: "Descript", company: "Descript", country: "美国", code: "US",
      year: 2017, category: "video", type: "web", url: "https://www.descript.com",
      visits: 3.5, mau: 3,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "像编辑文档一样剪辑音视频",
      desc: "Descript 先把音视频转成文字，再让你通过删改文字来剪辑，彻底改变了播客和口播视频的工作流。",
      long: "提供自动转写、Studio Sound、AI 配音、多轨编辑、屏幕录制与协作。它把“剪辑”从时间轴操作变成文本编辑，适合内容团队。",
      tags: ["播客", "转写", "音频剪辑"], color: "#00A896", est: true
    },
    {
      id: "opus", name: "OpusClip", company: "Opus", country: "美国", code: "US",
      year: 2023, category: "video", type: "web", url: "https://www.opus.pro",
      visits: 4.8, mau: 3,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "把长视频自动切成爆款短视频",
      desc: "OpusClip 自动识别长视频中的高光片段，重新构图、加字幕并适配 TikTok、Reels 与 Shorts。",
      long: "提供 AI 切片、爆款评分、自动字幕、动态布局与品牌模板。对播客、访谈和课程创作者来说，它显著降低了短视频分发的成本。",
      tags: ["短视频", "切片", "字幕"], color: "#FF4D6D", est: true
    },
    {
      id: "invideo", name: "InVideo", company: "InVideo", country: "印度", code: "IN",
      year: 2018, category: "video", type: "web", url: "https://invideo.io",
      visits: 6.5, mau: 5,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "用提示词生成完整营销视频",
      desc: "InVideo 把脚本、素材、配音和剪辑整合成一条提示词到成片的流水线，适合批量营销内容。",
      long: "提供 AI 脚本、文生视频、素材库、配音、字幕与品牌模板。它更偏向营销和社交媒体批量生产，而非精细的影视后期。",
      tags: ["营销视频", "模板", "批量"], color: "#4F46E5", est: true
    },
    {
      id: "capcut", name: "CapCut", company: "字节跳动", country: "中国", code: "CN",
      year: 2020, category: "video", type: "both", url: "https://www.capcut.com",
      visits: 48.3, downloads: 14.5, mau: 736,
      pricing: "免费 / Pro", priceType: "freemium",
      tagline: "全球月活最高的移动视频剪辑应用",
      desc: "CapCut 用模板、自动字幕、AI 抠像和特效，成为 TikTok 创作者生态的基础设施。",
      long: "2026 年初移动端月活约 7.36 亿，是全球最大的视频创作工具之一。AI 自动剪辑、字幕、背景移除、文生视频与数字人持续叠加。",
      tags: ["剪辑", "TikTok", "AI 特效"], color: "#000000", est: true
    },
    {
      id: "pixverse", name: "PixVerse", company: "爱诗科技", country: "中国", code: "CN",
      year: 2023, category: "video", type: "both", url: "https://pixverse.ai",
      downloads: 2.4, mau: 10,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "面向社交创作者的 AI 视频特效平台",
      desc: "PixVerse 用模板化特效、角色一致性和移动端体验，在海外社交平台快速起量。",
      long: "支持文生视频、图生视频、角色参考、特效模板与视频延长。产品强调“一键出片”，在 TikTok 和 Reels 的创作者中口碑较好。",
      tags: ["视频生成", "特效", "出海"], color: "#FF6B6B", est: true
    },

    /* ── 59–64 音频与音乐 ─────────────────────────── */
    {
      id: "suno", name: "Suno", company: "Suno", country: "美国", code: "US",
      year: 2023, category: "audio", type: "both", url: "https://suno.com",
      visits: 59.9, downloads: 1.6, mau: 12, growth: 25.5,
      pricing: "免费 / Pro", priceType: "freemium",
      tagline: "用文字生成完整歌曲",
      desc: "Suno 让用户输入主题或歌词，就能生成带人声、编曲和风格的音乐，是 AI 音乐最大众化的入口。",
      long: "支持文生歌、风格参考、歌词生成、分轨与商用授权。2025 年月访问量高速增长，同时面临唱片公司的版权诉讼，是 AI 音乐最有代表性的产品。",
      tags: ["AI 音乐", "文生歌", "创作"], color: "#FF5C00", est: false
    },
    {
      id: "elevenlabs", name: "ElevenLabs", company: "ElevenLabs", country: "美国 / 英国", code: "US/GB",
      year: 2022, category: "audio", type: "both", url: "https://elevenlabs.io",
      visits: 23.1, downloads: 1.3, mau: 10, growth: 5.7,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "高质量 AI 语音合成与配音平台",
      desc: "ElevenLabs 用自然度极高的 TTS、声音克隆和多语言配音，成为创作者与企业的语音基础设施。",
      long: "提供文本转语音、声音克隆、配音、音效生成、语音 Agent 与 API。它既服务内容创作者，也进入客服、游戏和有聲书等企业场景。",
      tags: ["TTS", "声音克隆", "配音"], color: "#111111", est: false
    },
    {
      id: "udio", name: "Udio", company: "Udio", country: "美国", code: "US",
      year: 2023, category: "audio", type: "web", url: "https://www.udio.com",
      visits: 5.6, mau: 4,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "高保真 AI 音乐生成与编辑平台",
      desc: "Udio 强调编曲细节和音质，支持生成、扩展、重混与分轨下载，更贴近音乐制作流程。",
      long: "提供文生音乐、音频扩展、Remix、人声分离与高保真导出。与 Suno 相比，它更受音乐制作人和进阶创作者青睐。",
      tags: ["AI 音乐", "编曲", "Remix"], color: "#7C3AED", est: true
    },
    {
      id: "murf", name: "Murf AI", company: "Murf", country: "印度", code: "IN",
      year: 2020, category: "audio", type: "web", url: "https://murf.ai",
      visits: 3.0, mau: 2,
      pricing: "免费额度 / 订阅", priceType: "freemium",
      tagline: "面向企业培训与营销的 AI 配音工作室",
      desc: "Murf 用 120+ 语言、声音克隆和视频配音，服务企业培训、广告和在线课程。",
      long: "提供文本转语音、声音克隆、视频配音、团队协作与商用授权。它更像一个企业级配音工作室，而不是消费级玩具。",
      tags: ["配音", "企业", "多语言"], color: "#2563EB", est: true
    },
    {
      id: "speechify", name: "Speechify", company: "Speechify", country: "美国", code: "US",
      year: 2017, category: "audio", type: "both", url: "https://speechify.com",
      downloads: 4.2, mau: 25,
      pricing: "免费 / Premium", priceType: "freemium",
      tagline: "把网页、文档和书籍变成有声书",
      desc: "Speechify 用自然语音朗读网页、PDF 和电子书，是增长最快的音频生产力应用之一。",
      long: "支持跨设备同步、网页/文档/书籍朗读、AI 摘要、语音克隆与离线收听。它同时服务学习、无障碍和碎片时间消费。",
      tags: ["有声书", "朗读", "无障碍"], color: "#FF6B00", est: true
    },
    {
      id: "otter", name: "Otter.ai", company: "Otter", country: "美国", code: "US",
      year: 2016, category: "audio", type: "both", url: "https://otter.ai",
      visits: 8.9, downloads: 1.4, mau: 10,
      pricing: "免费 / Pro", priceType: "freemium",
      tagline: "AI 会议记录与实时转写助手",
      desc: "Otter 自动加入 Zoom、Meet、Teams 会议，生成实时转写、摘要和行动项。",
      long: "支持多平台会议、说话人识别、AI 摘要、行动项与团队搜索。它把会议从“记录”变成可检索的组织知识，是企业高频 AI 工具。",
      tags: ["会议", "转写", "摘要"], color: "#00A8E8", est: true
    },

    /* ── 65–74 生产力与办公 ───────────────────────── */
    {
      id: "gamma", name: "Gamma", company: "Gamma", country: "美国", code: "US",
      year: 2020, category: "productivity", type: "web", url: "https://gamma.app",
      visits: 34.7, mau: 8, growth: 21.4,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "用 AI 快速生成演示、网页与文档",
      desc: "Gamma 从提示词或文档一键生成结构化幻灯片，把“做 PPT”压缩成几分钟。",
      long: "支持 AI 生成、品牌套件、协作编辑、网页发布与分析。它的排版系统比传统 PPT 更自适应，是 AI 演示赛道增长最快的产品之一。",
      tags: ["PPT", "文档", "协作"], color: "#8B5CF6", est: false
    },
    {
      id: "tome", name: "Tome", company: "Tome", country: "美国", code: "US",
      year: 2020, category: "productivity", type: "web", url: "https://tome.app",
      visits: 4.2, mau: 3,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "AI 原生的叙事型演示工具",
      desc: "Tome 以故事线为核心生成演示、落地页和销售提案，强调动态布局与多媒体。",
      long: "从大纲生成完整叙事，支持 AI 配图、数据嵌入、交互组件与网页发布。它更适合销售和品牌叙事，而不是传统企业模板。",
      tags: ["演示", "销售", "叙事"], color: "#FF5A5F", est: true
    },
    {
      id: "beautiful", name: "Beautiful.ai", company: "Beautiful.ai", country: "美国", code: "US",
      year: 2013, category: "productivity", type: "web", url: "https://www.beautiful.ai",
      visits: 3.1, mau: 2,
      pricing: "订阅制", priceType: "paid",
      tagline: "带智能排版规则的 AI 演示工具",
      desc: "Beautiful.ai 用设计规则自动调整布局、图表和间距，让非设计师也能做出统一的演示。",
      long: "提供智能模板、品牌主题、团队库、数据图表与 AI 生成。它强调“不会排版也不会丑”，在企业团队中较受欢迎。",
      tags: ["PPT", "智能排版", "企业"], color: "#FF6B6B", est: true
    },
    {
      id: "aippt", name: "AIPPT", company: "像素绽放", country: "中国", code: "CN",
      year: 2023, category: "productivity", type: "web", url: "https://aippt.cn",
      visits: 8.6, mau: 3, growth: 0.9,
      pricing: "免费 / 会员", priceType: "freemium",
      tagline: "中文 AI 一键生成 PPT 与办公文档",
      desc: "AIPPT 输入主题或上传文档，即可生成大纲、配图和完整幻灯片，支持中文模板与导出。",
      long: "面向中文办公场景，提供 AI 大纲、模板库、文档转 PPT、智能排版与团队协作。它是国内 AI 办公工具中访问量最高的产品之一。",
      tags: ["PPT", "中文", "办公"], color: "#FF7A45", est: false
    },
    {
      id: "notionai", name: "Notion AI", company: "Notion", country: "美国", code: "US",
      year: 2016, category: "productivity", type: "both", url: "https://www.notion.so/product/ai",
      visits: 184.0, downloads: 3.1, mau: 100, growth: 0.9,
      pricing: "免费 / AI 附加", priceType: "freemium",
      tagline: "嵌入工作区的 AI 写作与知识助手",
      desc: "Notion AI 在文档、数据库和项目中直接生成、总结、翻译和检索，是企业知识管理的 AI 层。",
      long: "支持 AI 写作、会议记录、企业搜索、数据库自动填充与连接器。Notion 的 AI 附加率在 2025 年快速上升，成为其收入增长核心。",
      tags: ["知识库", "写作", "企业"], color: "#000000", est: false
    },
    {
      id: "deepl", name: "DeepL", company: "DeepL", country: "德国", code: "DE",
      year: 2017, category: "productivity", type: "both", url: "https://www.deepl.com",
      visits: 141.8, downloads: 3.0, mau: 40, growth: 1.6,
      pricing: "免费 / Pro", priceType: "freemium",
      tagline: "以自然度著称的 AI 翻译与写作平台",
      desc: "DeepL 用高质量的翻译和写作润色，成为专业翻译、跨境团队和学生的常用工具。",
      long: "支持 30+ 语言互译、文档翻译、术语表、DeepL Write 与 API。它的品牌心智是“翻得自然”，在企业本地化场景中优势明显。",
      tags: ["翻译", "写作", "企业"], color: "#0F2B46", est: false
    },
    {
      id: "quillbot", name: "QuillBot", company: "QuillBot", country: "美国", code: "US",
      year: 2017, category: "productivity", type: "web", url: "https://quillbot.com",
      visits: 63.1, mau: 10, growth: 10.0,
      pricing: "免费 / Premium", priceType: "freemium",
      tagline: "面向英文写作的改写与语法工具",
      desc: "QuillBot 提供段落改写、语法检查、摘要、引用生成和抄袭检测，是留学生与内容创作者的常用工具。",
      long: "支持多种改写模式、同义词替换、语法检查、AI 检测与引用管理。它的流量高度依赖英文写作和学术场景。",
      tags: ["改写", "语法", "学术"], color: "#00A67E", est: false
    },
    {
      id: "grammarly", name: "Grammarly", company: "Grammarly", country: "美国", code: "US",
      year: 2009, category: "productivity", type: "both", url: "https://www.grammarly.com",
      visits: 63.9, downloads: 2.8, mau: 30, growth: 5.6,
      pricing: "免费 / Premium", priceType: "freemium",
      tagline: "跨应用的 AI 写作助手",
      desc: "Grammarly 覆盖邮件、文档、浏览器和桌面应用，提供语法、改写、语气和 AI 检测。",
      long: "从语法检查器进化为生成式写作助手，支持 AI 改写、邮件回复、语气调整、企业风格指南与安全合规。它的优势是跨应用的分发。",
      tags: ["写作", "语法", "企业"], color: "#15C39A", est: false
    },
    {
      id: "fireflies", name: "Fireflies.ai", company: "Fireflies", country: "美国", code: "US",
      year: 2016, category: "productivity", type: "web", url: "https://fireflies.ai",
      visits: 5.7, mau: 3,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "自动记录、转写和总结会议的 AI 助手",
      desc: "Fireflies 支持多平台会议、CRM 同步、说话人识别和团队搜索，适合销售与招聘团队。",
      long: "自动加入会议，生成转写、摘要、行动项和话题追踪，并可同步到 Salesforce、HubSpot 等 CRM。它把会议内容变成可搜索的销售资产。",
      tags: ["会议", "CRM", "转写"], color: "#6C5CE7", est: true
    },
    {
      id: "notta", name: "Notta", company: "Notta", country: "日本", code: "JP",
      year: 2020, category: "productivity", type: "both", url: "https://www.notta.ai",
      downloads: 2.2, mau: 5,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "多语言 AI 录音转写与会议摘要",
      desc: "Notta 支持实时转写、翻译、摘要和思维导图，移动端体验突出，覆盖 50+ 语言。",
      long: "面向跨国会议、采访和课堂，提供实时转写、AI 摘要、说话人识别、翻译与导出。它在日本和亚洲市场增长较快。",
      tags: ["转写", "多语言", "移动"], color: "#FF6B00", est: true
    },

    /* ── 75–84 编程与智能体 ───────────────────────── */
    {
      id: "github", name: "GitHub Copilot", company: "GitHub / Microsoft", country: "美国", code: "US",
      year: 2021, category: "code", type: "both", url: "https://github.com/features/copilot",
      visits: 301.8, mau: 20, growth: 6.1,
      pricing: "免费额度 / $10/月起", priceType: "freemium",
      tagline: "全球采用最广的 AI 编程助手",
      desc: "GitHub Copilot 在 IDE 中提供补全、对话、代码审查和 Agent 模式，覆盖 GitHub 全流程。",
      long: "支持 VS Code、JetBrains、Visual Studio 与 GitHub 网页，提供代码补全、Copilot Chat、Pull Request 审查、Workspace 和 Coding Agent。",
      tags: ["编程", "IDE", "Agent"], color: "#24292F", est: false
    },
    {
      id: "cursor", name: "Cursor", company: "Anysphere", country: "美国", code: "US",
      year: 2023, category: "code", type: "both", url: "https://cursor.com",
      visits: 17.5, downloads: 2.0, mau: 4, growth: 14.8,
      pricing: "免费 / Pro $20/月", priceType: "freemium",
      tagline: "AI 原生的代码编辑器与 Agent 环境",
      desc: "Cursor 基于 VS Code，提供代码库理解、多文件编辑、终端 Agent 和后台任务，是 AI 编程的代表产品。",
      long: "支持 Tab 补全、Chat、Composer、Agent 模式、代码库索引与 MCP。它把 IDE 从“编辑器”变成“能理解整个项目的协作者”。",
      tags: ["AI IDE", "代码库", "Agent"], color: "#000000", est: false
    },
    {
      id: "lovable", name: "Lovable", company: "Lovable", country: "瑞典", code: "SE",
      year: 2023, category: "code", type: "web", url: "https://lovable.dev",
      visits: 20.2, mau: 3, growth: 4.4,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "用自然语言生成全栈应用",
      desc: "Lovable 从提示词生成前后端、数据库和部署，是“氛围编程”浪潮中最具代表性的产品之一。",
      long: "支持 Supabase 集成、GitHub 同步、可视化编辑与一键部署。它让非工程师也能做出可用的 Web 应用，但复杂项目仍需要开发者介入。",
      tags: ["Vibe Coding", "全栈", "无代码"], color: "#FF6B9D", est: false
    },
    {
      id: "replit", name: "Replit", company: "Replit", country: "美国", code: "US",
      year: 2016, category: "code", type: "web", url: "https://replit.com",
      visits: 10.2, mau: 2.5, growth: -6.1,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "浏览器内的 AI 编程与部署平台",
      desc: "Replit 的 Agent 可自动搭建、调试并部署应用，适合教育、原型和轻量生产。",
      long: "提供云端 IDE、多语言运行环境、数据库、部署与 Agent。它的优势是“打开浏览器就能写和上线”，对教学和快速验证尤其友好。",
      tags: ["云端 IDE", "Agent", "部署"], color: "#F26207", est: false
    },
    {
      id: "v0", name: "v0", company: "Vercel", country: "美国", code: "US",
      year: 2023, category: "code", type: "web", url: "https://v0.dev",
      visits: 6.8, mau: 2,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "用提示词生成 React / Next.js 界面",
      desc: "v0 生成可编辑的 UI 代码，并一键部署到 Vercel，适合前端原型和产品落地页。",
      long: "支持文本/图片生成界面、对话式修改、代码复制与部署。它与 Vercel 生态深度绑定，是设计师和前端快速验证想法的工具。",
      tags: ["前端", "React", "Vercel"], color: "#000000", est: true
    },
    {
      id: "bolt", name: "Bolt.new", company: "StackBlitz", country: "美国", code: "US",
      year: 2024, category: "code", type: "web", url: "https://bolt.new",
      visits: 4.9, mau: 1.5,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "在浏览器中即时生成并运行全栈应用",
      desc: "Bolt 通过 WebContainers 在浏览器内运行 Node.js，支持提示词生成、调试与一键部署。",
      long: "从自然语言生成完整项目，实时安装依赖、运行命令和预览。它把“生成代码”推进到“生成可运行环境”，是 Vibe Coding 的重要产品。",
      tags: ["全栈", "浏览器", "快速原型"], color: "#1389FD", est: true
    },
    {
      id: "vercel", name: "Vercel", company: "Vercel", country: "美国", code: "US",
      year: 2016, category: "code", type: "web", url: "https://vercel.com",
      visits: 12.7, mau: 5, growth: 7.0,
      pricing: "免费 / Pro", priceType: "freemium",
      tagline: "面向前端与 AI 应用的云部署平台",
      desc: "Vercel 提供 Next.js、边缘函数、AI SDK 和 v0 集成，是 AI 产品快速上线的基础设施。",
      long: "支持预览部署、边缘计算、AI SDK、Observability 与企业级安全。大量 AI 创业公司选择 Vercel 作为前端和 API 的默认部署层。",
      tags: ["部署", "Next.js", "AI SDK"], color: "#000000", est: false
    },
    {
      id: "supabase", name: "Supabase", company: "Supabase", country: "美国", code: "US",
      year: 2020, category: "code", type: "web", url: "https://supabase.com",
      visits: 14.8, mau: 5, growth: 3.3,
      pricing: "免费 / Pro", priceType: "freemium",
      tagline: "开源的 Postgres 后端与 AI 数据平台",
      desc: "Supabase 提供数据库、认证、存储、向量检索和 Edge Functions，常与 Lovable、Bolt 搭配。",
      long: "以开源 Postgres 为核心，提供 Auth、Storage、Realtime、Vector 与 Edge Functions。它是 Vibe Coding 应用最常见的后端选择之一。",
      tags: ["Postgres", "开源", "向量"], color: "#3ECF8E", est: false
    },
    {
      id: "manus", name: "Manus", company: "Manus", country: "中国", code: "CN",
      year: 2025, category: "code", type: "both", url: "https://manus.im",
      visits: 14.9, downloads: 1.0, mau: 5, growth: 4.5,
      pricing: "订阅制", priceType: "paid",
      tagline: "自主执行多步骤任务的通用 Agent",
      desc: "Manus 能浏览网页、操作软件、生成文档和部署网站，以“交付结果”而不是聊天为核心。",
      long: "面向研究、数据分析、内容制作和网站搭建等长任务，支持多 Agent 协作、浏览器操作与文件交付。它是 2025 年通用 Agent 热潮的代表。",
      tags: ["通用 Agent", "自动化", "多步骤"], color: "#111111", est: false
    },
    {
      id: "genspark", name: "Genspark", company: "Genspark", country: "美国", code: "US",
      year: 2024, category: "code", type: "web", url: "https://www.genspark.ai",
      visits: 9.6, mau: 3, growth: 3.8,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "AI 搜索与 Agent 工作台",
      desc: "Genspark 通过 Super Agent 完成研究、行程、数据分析和内容生成，并输出可编辑的结果。",
      long: "把搜索、浏览、编码和文档生成组合成多步骤 Agent，支持电话、PPT、表格和网页交付。它代表了“搜索即执行”的产品方向。",
      tags: ["Agent", "搜索", "工作台"], color: "#FF5C35", est: false
    },

    /* ── 85–90 教育学习 ───────────────────────────── */
    {
      id: "quizlet", name: "Quizlet", company: "Quizlet", country: "美国", code: "US",
      year: 2005, category: "education", type: "both", url: "https://quizlet.com",
      visits: 71.9, downloads: 6.0, mau: 60,
      pricing: "免费 / Plus", priceType: "freemium",
      tagline: "全球最大的学习卡片与 AI 学习平台之一",
      desc: "Quizlet 用 AI 生成闪卡、练习测试和个性化学习路径，覆盖数亿学生。",
      long: "从 UGC 闪卡社区进化为 AI 学习助手，提供 Magic Notes、AI 导师、练习测试与进度追踪。它是教育类 AI 流量最高的产品之一。",
      tags: ["闪卡", "学习", "学生"], color: "#4255FF", est: true
    },
    {
      id: "duolingo", name: "Duolingo Max", company: "Duolingo", country: "美国", code: "US",
      year: 2011, category: "education", type: "both", url: "https://www.duolingo.com",
      visits: 58.5, downloads: 5.5, mau: 100, growth: -2.8,
      pricing: "免费 / Max", priceType: "freemium",
      tagline: "游戏化语言学习平台，Max 接入生成式 AI",
      desc: "Duolingo Max 用 AI 角色扮演、Explain My Answer 和 Video Call 提供口语陪练。",
      long: "全球最成功的教育应用之一，用游戏化机制维持学习习惯。Max 层引入 GPT-4 驱动的 Roleplay、视频通话和个性化解释，是 AI 教育商业化的标杆。",
      tags: ["语言学习", "游戏化", "口语"], color: "#58CC02", est: false
    },
    {
      id: "gauth", name: "Gauth", company: "字节跳动", country: "中国", code: "CN",
      year: 2019, category: "education", type: "app", url: "https://www.gauthmath.com",
      downloads: 2.8, mau: 30,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "面向全球学生的 AI 作业辅导应用",
      desc: "Gauth 用拍照搜题、分步讲解和多学科答疑，服务北美和东南亚的学生。",
      long: "覆盖数学、物理、化学、生物等学科，支持拍照识别、AI 分步讲解、真人导师与练习。它是字节教育出海矩阵中最成功的产品之一。",
      tags: ["拍照解题", "作业", "出海"], color: "#4F46E5", est: true
    },
    {
      id: "khanmigo", name: "Khanmigo", company: "Khan Academy", country: "美国", code: "US",
      year: 2023, category: "education", type: "web", url: "https://www.khanmigo.ai",
      visits: 30.9, mau: 2, growth: -5.4,
      pricing: "$4/月起", priceType: "paid",
      tagline: "可汗学院推出的 AI 导师与教师助手",
      desc: "Khanmigo 用苏格拉底式提问引导学习，而不是直接给答案，覆盖数学、科学和写作。",
      long: "面向学生提供 AI 导师、写作辅导和考试准备，面向教师提供备课、评分和课堂活动建议。它是“AI 不替代老师”理念的代表产品。",
      tags: ["AI 导师", "K12", "教育公益"], color: "#14BF96", est: false
    },
    {
      id: "brainly", name: "Brainly", company: "Brainly", country: "波兰", code: "PL",
      year: 2009, category: "education", type: "both", url: "https://brainly.com",
      visits: 9.6, downloads: 4.0, mau: 50, growth: -9.7,
      pricing: "免费 / Plus", priceType: "freemium",
      tagline: "全球问答式学习社区",
      desc: "Brainly 把学生互助问答与 AI 解释结合，覆盖数学、科学和人文学科。",
      long: "拥有庞大的用户生成问答库，AI 用于扫描题目、匹配答案和提供解释。它在新兴市场渗透率高，但面临 AI 助手直接解题的冲击。",
      tags: ["问答", "社区", "K12"], color: "#FF6B00", est: false
    },
    {
      id: "studyfetch", name: "StudyFetch", company: "StudyFetch", country: "美国", code: "US",
      year: 2023, category: "education", type: "web", url: "https://www.studyfetch.com",
      visits: 2.0, mau: 1,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "把课程资料变成 AI 导师与练习",
      desc: "StudyFetch 上传讲义、视频或 PDF，自动生成闪卡、测验和个性化辅导。",
      long: "提供 AI 导师 Spark.E、闪卡、练习测试、笔记与学习计划。它面向大学生，把“复习”变成一套可交互的 AI 工作流。",
      tags: ["AI 导师", "闪卡", "大学生"], color: "#6C5CE7", est: true
    },

    /* ── 91–99 情感陪伴 + 100 海外助手 ────────────── */
    {
      id: "character", name: "Character.AI", company: "Character Technologies", country: "美国", code: "US",
      year: 2022, category: "companion", type: "both", url: "https://character.ai",
      visits: 212.9, downloads: 8.5, mau: 28, growth: 0.3,
      pricing: "免费 / c.ai+", priceType: "freemium",
      tagline: "全球最大的 AI 角色扮演与陪伴平台",
      desc: "Character.AI 让用户创建并与数百万个角色对话，覆盖娱乐、语言学习和情感陪伴。",
      long: "以 UGC 角色、群聊、语音和长期记忆为核心，是 AI 陪伴赛道的定义者。它面临未成年保护和内容安全的持续争议。",
      tags: ["角色扮演", "社区", "陪伴"], color: "#FF6B6B", est: false
    },
    {
      id: "janitor", name: "Janitor AI", company: "Janitor AI", country: "美国", code: "US",
      year: 2023, category: "companion", type: "web", url: "https://janitorai.com",
      visits: 106.0, mau: 12, growth: -5.5,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "高自由度的 AI 角色聊天社区",
      desc: "Janitor AI 允许用户创建高自由度角色与世界观，以 UGC 和社区驱动增长。",
      long: "支持多种模型、角色卡、长期记忆和自定义提示词。它主要面向成人用户，内容边界宽松，是 AI 陪伴流量最大的网站之一。",
      tags: ["角色", "UGC", "成人向"], color: "#7C3AED", est: false
    },
    {
      id: "spicychat", name: "SpicyChat", company: "SpicyChat", country: "美国", code: "US",
      year: 2023, category: "companion", type: "web", url: "https://spicychat.ai",
      visits: 46.9, mau: 8, growth: -3.6,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "强调沉浸感的 AI 角色聊天平台",
      desc: "SpicyChat 提供多种模型、角色卡和长期记忆，主打成人向沉浸式陪伴。",
      long: "支持角色创建、剧情分支、语音和图像生成。它通过订阅和模型升级变现，是 AI 陪伴赛道商业化较成熟的产品。",
      tags: ["角色", "沉浸", "订阅"], color: "#FF4D6D", est: false
    },
    {
      id: "polybuzz", name: "PolyBuzz", company: "PolyBuzz", country: "中国", code: "CN",
      year: 2023, category: "companion", type: "app", url: "https://www.polybuzz.ai",
      downloads: 3.6, mau: 15,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "出海 AI 角色陪伴应用，增长迅速",
      desc: "PolyBuzz 提供多角色对话、语音和剧情互动，在北美和东南亚市场表现突出。",
      long: "以角色卡、AI 语音、剧情选择和社区榜单为核心。它是 2025 年从潜力榜进入主榜的移动陪伴产品之一。",
      tags: ["角色", "出海", "语音"], color: "#FF6B9D", est: true
    },
    {
      id: "candy", name: "Candy AI", company: "Candy AI", country: "美国", code: "US",
      year: 2022, category: "companion", type: "web", url: "https://candy.ai",
      visits: 12.3, mau: 4, growth: 14.6,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "面向成人用户的 AI 伴侣平台",
      desc: "Candy AI 支持自定义外观、语音和长期关系记忆，强调个性化陪伴。",
      long: "用户可创建理想型伴侣，进行文字、语音和图像互动。产品以订阅制为主，是成人向 AI 陪伴的代表网站之一。",
      tags: ["伴侣", "成人向", "语音"], color: "#FF4D8D", est: false
    },
    {
      id: "chaton", name: "ChatOn", company: "ChatOn", country: "中国", code: "CN",
      year: 2023, category: "companion", type: "app", url: "https://chaton.ai",
      downloads: 3.1, mau: 20,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "集成多模型的 AI 聊天与写作应用",
      desc: "ChatOn 提供问答、写作、翻译和 AI 头像，在新兴市场下载量领先。",
      long: "以多模型切换、写作模板、PDF 问答和 AI 照片为核心，产品轻量、增长依赖应用商店分发。",
      tags: ["多模型", "写作", "出海"], color: "#4F46E5", est: true
    },
    {
      id: "talkie", name: "Talkie", company: "Talkie", country: "中国", code: "CN",
      year: 2023, category: "companion", type: "app", url: "https://www.talkie-ai.com",
      downloads: 2.7, mau: 20,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "AI 角色对话与虚拟社交应用",
      desc: "Talkie 以角色卡、语音和剧情互动为核心，海外用户占比高。",
      long: "用户可创建角色、编写世界观并进行沉浸式对话，支持语音、动态卡牌和社区内容。它是中国团队出海陪伴应用的代表。",
      tags: ["角色", "社交", "语音"], color: "#6C5CE7", est: true
    },
    {
      id: "chai", name: "Chai", company: "Chai Research", country: "美国", code: "US",
      year: 2023, category: "companion", type: "app", url: "https://www.chai-research.com",
      downloads: 2.1, mau: 10,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "轻量级 AI 聊天机器人与角色社区",
      desc: "Chai 提供海量用户创建的角色、排行榜和聊天功能，移动端增长快。",
      long: "以 UGC 角色和模型竞技为特色，支持创作者分成。它更像 AI 角色版的社交应用，强调发现、排行和轻量互动。",
      tags: ["角色", "社区", "移动"], color: "#FF9F1C", est: true
    },
    {
      id: "replika", name: "Replika", company: "Luka", country: "美国", code: "US",
      year: 2017, category: "companion", type: "app", url: "https://replika.com",
      downloads: 1.2, mau: 10,
      pricing: "免费 / Pro", priceType: "freemium",
      tagline: "最早的 AI 情感陪伴应用之一",
      desc: "Replika 通过长期记忆、语音通话和 3D 形象建立个性化关系，强调心理健康陪伴。",
      long: "用户可定制 AI 伴侣的外观、性格和关系类型，进行文字、语音和 AR 互动。它是最早探索 AI 情感陪伴的产品，也长期面临伦理争议。",
      tags: ["情感陪伴", "长期记忆", "语音"], color: "#FF6B9D", est: true
    },
    {
      id: "dola", name: "Dola", company: "字节跳动", country: "中国", code: "CN",
      year: 2023, category: "assistant", type: "app", url: "https://dola.ai",
      downloads: 1.8, mau: 25,
      pricing: "免费 / 订阅", priceType: "freemium",
      tagline: "Cici 更名后的海外 AI 助手",
      desc: "Dola 是字节跳动面向海外市场的通用 AI 助手，前身为 Cici，主打轻量对话与创作。",
      long: "支持问答、写作、翻译、图像生成与语音，在新兴市场通过应用商店和本地化运营增长。它是字节全球 AI 助手布局的重要棋子。",
      tags: ["出海", "通用助手", "字节"], color: "#3B82F6", est: true
    }
  ]
};

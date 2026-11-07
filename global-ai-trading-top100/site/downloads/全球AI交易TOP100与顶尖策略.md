# 全球 AI 交易 TOP 100 与顶尖策略源代码

**一份可复现的「人物 — 机构 — 策略 — 代码」全景图谱**

版本 1.0 · 2026 年 11 月 · 仅供研究学习，不构成投资建议

---

## 摘要

过去十年，AI 交易从“用机器学习预测价格”的单点尝试，演化为一条完整的工业流水线：数据采集、特征工程、模型训练、组合优化、执行算法、风控与运维。真正拉开差距的，往往不是某个模型结构，而是**数据壁垒、交易成本、执行速度和风险管理**的组合。

这份报告试图回答三个问题：

1. 全球范围内，哪些交易员、机构和系统塑造了今天的 AI 交易？
2. 他们使用的顶尖策略，底层原理是什么？
3. 这些策略能否用可运行的源代码复现？

我们给出 **100 条编辑性榜单**、**25 个策略族**、**15 个可独立运行的 Python 实现**，并在合成数据上完成端到端自检。需要强调的是：**不存在官方“全球 AI 交易前 100 名”榜单**，本报告是研究性重构，不是权威排名；代码用于理解结构，不构成策略建议。

三个核心判断：

- **模型不是护城河，基础设施才是。** 当所有人都能用同样的 GBDT、Transformer 和 GPU 时，优势转移到数据、执行、资金成本和风控。
- **最稳定的 alpha 集中在相对价值、做市、执行与短周期预测。** 方向性预测仍然有效，但更拥挤、更容易受制度变化冲击。
- **开源代码能复现“结构”，不能复现“优势”。** 代码是起点，不是答案。

---

## 0. 必读声明

**第一，这不是官方排名。** 没有任何监管机构或行业协会发布“全球 AI 交易 TOP 100”。对冲基金与自营交易公司没有披露义务，顶级交易员往往刻意低调，大量真正的高手是匿名的。任何榜单都是编辑性重构，必然带有偏差。

**第二，口径是“AI 交易”，不是“所有量化”。** 本报告把以数据驱动、统计模型、机器学习、深度学习、强化学习、自然语言处理为核心决策或执行组件的交易活动纳入范围；纯主观交易、只靠 Excel 的基本面投资不纳入。部分传奇人物（如 Ray Dalio）并非严格意义上的 AI 交易员，但其系统化、模型化的宏观框架对行业影响深远，因此列入并标注。

**第三，排名是综合评分，不是收益排名。** 评分维度包括资本与存续、创新与影响力、可验证业绩或竞赛成绩、人才与知识溢出。我们没有使用任何未审计的收益率，也没有把“规模大”等同于“业绩好”。

**第四，所有数字都是公开报道的近似值。** 规模、收益、人数会随时间变化；报告中不引用具体未审计收益，避免制造虚假精确。

**第五，代码仅用于研究。** 所有示例在合成数据上运行，合成数据的统计性质与真实市场差距很大。把示例参数直接用于实盘，大概率会亏损。

---

## 1. 方法论：如何给“AI 交易”排名

### 1.1 四个评分维度

| 维度 | 权重 | 关注点 |
| --- | --- | --- |
| 资本与存续 | 30% | 管理规模、存续年限、机构稳定性、穿越周期的能力 |
| 创新与影响力 | 30% | 策略范式、论文/专利、开源工具、行业标准 |
| 可验证业绩与竞赛 | 20% | 公开竞赛名次、可查证的业绩记录、学术引用 |
| 人才与知识溢出 | 20% | 培养的人才、衍生机构、对行业基础设施的贡献 |

### 1.2 五个分档

- **T0 传奇（1–15）**：奠定方法论、影响一代人的个人。
- **T1 全球巨头（16–45）**：管理数百亿美元、体系化运作的机构。
- **T2 中国力量（46–60）**：中国量化与 AI 交易的代表机构。
- **T3 AI 原生（61–75）**：以 AI 为核心的新基金、平台、竞赛与开源系统。
- **T4 策略范式（76–100）**：塑造行业的策略族，而非单一机构。

### 1.3 榜单的五个盲区

1. **匿名自营交易者。** 全球最赚钱的高频交易员可能从未出现在任何媒体上。
2. **幸存者偏差。** 我们只看到活下来的基金，看不到同样聪明却爆仓的团队。
3. **规模与收益负相关。** 很多高夏普策略容量极小，规模做大后收益被稀释。
4. **时间漂移。** 今天的排名三年后可能完全失效，尤其是依赖制度红利的策略。
5. **“AI”标签通胀。** 用线性回归包装成“AI”的基金，比真正做深度学习的多得多。

---

## 2. TOP 100 总榜

榜单按分档排列，同一档内按综合影响力排序。类型包括人物、机构、系统与策略，因此这不是一份“纯人物榜”，而是一张 AI 交易生态的全景图。

### T0 传奇（1–15）

| # | 名称 | 类型 | 机构/归属 | 代表策略 | 入选理由 |
| --- | --- | --- | --- | --- | --- |
| 1 | Jim Simons | 人物 | Renaissance Technologies | 隐马尔可夫模型、统计套利 | Medallion 缔造者，量化投资从边缘走向主流的标志 |
| 2 | Edward Thorp | 人物 | 自营 / UC Irvine | 凯利公式、权证定价、统计套利 | 用概率论击败赌场，再把同一套思维带入市场 |
| 3 | David E. Shaw | 人物 | D.E. Shaw Group | 计算金融、跨市场套利 | 计算机科学家创办的量化巨头，量化人才的黄埔军校 |
| 4 | Robert Mercer | 人物 | Renaissance Technologies | 机器学习、语音识别、NLP 选股 | 把 IBM 语音识别团队的方法论带入 RenTech |
| 5 | Peter Brown | 人物 | Renaissance Technologies | 统计套利、交易系统 | 与 Mercer 共同执掌 Medallion 的核心人物 |
| 6 | Clifford Asness | 人物 | AQR Capital | 多因子、动量、价值 | 因子投资最有影响力的布道者之一 |
| 7 | Ken Griffin | 人物 | Citadel | 可转债套利、多策略、做市 | 从可转债套利起家，建成全球多策略帝国 |
| 8 | Israel Englander | 人物 | Millennium Management | 多经理平台、相对价值 | 平台型对冲基金模式的开创者与集大成者 |
| 9 | Ray Dalio | 人物 | Bridgewater Associates | 系统化宏观、风险平价 | 用规则和模型把宏观交易工程化 |
| 10 | Myron Scholes | 人物 | 斯坦福 / Platinum Grove | 期权定价、波动率交易 | Black-Scholes-Merton 模型共同作者，衍生品定价基石 |
| 11 | Fischer Black | 人物 | Goldman Sachs（已故） | 期权定价 | Black-Scholes 模型共同作者，量化金融奠基人 |
| 12 | Elwyn Berlekamp | 人物 | Axcom / RenTech | 信息论、组合优化 | 信息论学家，早期把算法交易带入 RenTech |
| 13 | Henry Laufer | 人物 | Renaissance Technologies | 数学、信号处理 | 长期主导 RenTech 研究体系的数学家 |
| 14 | Peter Muller | 人物 | PDT Partners | 统计定价、因子模型 | 把统计套利做成高度纪律化系统的传奇交易员 |
| 15 | Igor Tulchinsky | 人物 | WorldQuant | Alpha 工厂、遗传算法、众包研究 | 把 alpha 的工业化生产做到极致 |

### T1 全球巨头（16–45）

| # | 名称 | 类型 | 机构/归属 | 代表策略 | 入选理由 |
| --- | --- | --- | --- | --- | --- |
| 16 | Renaissance Technologies | 机构 | — | Medallion、统计套利、HMM | 史上最成功的量化基金，长期封闭运作 |
| 17 | D.E. Shaw Group | 机构 | — | 计算金融、多策略 | 全球最神秘的量化巨头之一 |
| 18 | Two Sigma | 机构 | — | 机器学习、数据科学、多策略 | 以数据科学和工程文化著称的量化平台 |
| 19 | Citadel | 机构 | — | 多策略、做市、统计套利 | 全球规模与盈利能力最强的多策略基金之一 |
| 20 | Millennium Management | 机构 | — | 多经理、相对价值 | 平台化模式，数百个独立交易团队 |
| 21 | AQR Capital Management | 机构 | — | 因子投资、风险平价、动量 | 学术与实盘结合最紧密的资管机构之一 |
| 22 | Man AHL | 机构 | Man Group | 系统化趋势、统计套利 | 历史最悠久的系统化 CTA 之一 |
| 23 | WorldQuant | 机构 | — | Alpha 工厂、机器学习 | 以 alpha 表达式和海量研究员著称 |
| 24 | Squarepoint Capital | 机构 | — | 统计套利、机器学习 | 从投行自营团队演化而来的量化巨头 |
| 25 | Qube Research & Technologies | 机构 | — | 统计套利、宏观量化 | 欧洲增长最快的量化基金之一 |
| 26 | XTX Markets | 机构 | — | 外汇/股票做市、机器学习 | 全球最大的电子做市商之一 |
| 27 | Jane Street | 机构 | — | ETF 套利、期权做市 | 以技术文化与 ETF/期权做市闻名 |
| 28 | Hudson River Trading | 机构 | — | 高频交易、统计套利 | 全球顶级高频自营交易公司 |
| 29 | Jump Trading | 机构 | — | 高频、加密做市 | 传统 HFT 进军加密市场的代表 |
| 30 | Optiver | 机构 | — | 期权做市、波动率交易 | 阿姆斯特丹起家的全球期权做市巨头 |
| 31 | IMC Trading | 机构 | — | 期权做市、ETF | 欧洲期权做市的中坚力量 |
| 32 | Tower Research Capital | 机构 | — | 高频、做市 | 全球高频交易基础设施与策略巨头 |
| 33 | Flow Traders | 机构 | — | ETF 做市 | 欧洲 ETF 做市龙头 |
| 34 | Susquehanna International Group | 机构 | — | 期权做市、概率化下注 | 以概率思维和期权做市著称 |
| 35 | DRW | 机构 | — | 自营交易、加密 | 老牌自营交易商，加密领域布局深 |
| 36 | Virtu Financial | 机构 | — | 高频做市、执行 | 以极高盈利天数比例闻名的高频做市商 |
| 37 | Marshall Wace | 机构 | — | TOPS 系统、多空股票 | 系统化与基本面结合的多空巨头 |
| 38 | Point72 / Cubist | 机构 | — | 系统化股票、另类数据 | Cubist 是 Point72 的量化核心 |
| 39 | Balyasny Asset Management | 机构 | — | 多经理、系统化 | 多经理平台中的量化新势力 |
| 40 | Schonfeld Strategic Advisors | 机构 | — | 多经理、系统化 | 平台型基金，重仓量化团队 |
| 41 | ExodusPoint | 机构 | — | 多策略、相对价值 | 近年规模增长最快的对冲基金之一 |
| 42 | Walleye Capital | 机构 | — | 多策略、期权 | 明尼苏达起家的多策略平台 |
| 43 | Vatic Investments | 机构 | — | 深度学习、量化 | 以深度学习选股著称的 AI 原生基金 |
| 44 | Capital Fund Management | 机构 | CFM | 统计物理、趋势、统计套利 | 由物理学家创立的量化研究型基金 |
| 45 | PDT Partners | 机构 | — | 统计套利、因子 | 从 Morgan Stanley PDT 分拆的传奇团队 |

### T2 中国力量（46–60）

| # | 名称 | 类型 | 机构/归属 | 代表策略 | 入选理由 |
| --- | --- | --- | --- | --- | --- |
| 46 | 幻方量化 High-Flyer | 机构 | 梁文锋 | 深度学习、量化选股、AI 基础设施 | 中国量化头部，也是 DeepSeek 的孵化方 |
| 47 | 九坤投资 | 机构 | 王琛 | 高频、统计套利、机器学习 | 中国量化头部机构之一 |
| 48 | 明汯投资 | 机构 | 裘慧明 | 多因子、机器学习 | 中国最早一批百亿/千亿级量化私募 |
| 49 | 灵均投资 | 机构 | 蔡枚杰、马志宇 | 多因子、高频 | 中国量化头部机构 |
| 50 | 衍复投资 | 机构 | 高亢 | 高频、多因子 | 中国量化新一线代表 |
| 51 | 鸣石投资 | 机构 | 袁宇 | 多因子、机器学习 | 上海量化代表机构 |
| 52 | 天演资本 | 机构 | — | 多因子、高频 | 中国量化头部之一 |
| 53 | 宽德投资 | 机构 | — | 高频、统计套利 | 中国高频量化代表 |
| 54 | 世纪前沿 | 机构 | — | 高频、机器学习 | 中国量化新锐 |
| 55 | 因诺资产 | 机构 | 徐书楠 | 多因子、套利 | 中国量化老牌机构 |
| 56 | 锐天投资 | 机构 | 徐晓波 | 高频、多因子 | 中国量化头部 |
| 57 | 金锝资产 | 机构 | 任思泓 | 统计套利、多因子 | 中国量化先行者 |
| 58 | 黑翼资产 | 机构 | 陈泽浩、邹倚天 | 多因子、CTA | 中国量化代表机构 |
| 59 | 稳博投资 | 机构 | — | 高频、机器学习 | 中国量化新锐 |
| 60 | 白鹭资管 | 机构 | — | 多因子、CTA | 中国量化头部 |

### T3 AI 原生（61–75）

| # | 名称 | 类型 | 机构/归属 | 代表策略 | 入选理由 |
| --- | --- | --- | --- | --- | --- |
| 61 | Numerai | 系统 | Richard Craib | 众包机器学习、加密数据 | 用加密数据集和代币激励全球数据科学家建模 |
| 62 | QuantConnect / LEAN | 系统 | — | 开源回测、算法交易 | 全球最大的开源量化平台之一 |
| 63 | WorldQuant BRAIN | 系统 | — | Alpha 表达式、众包 | 把 alpha 研究众包给全球用户 |
| 64 | Kaggle 金融竞赛生态 | 系统 | — | Jane Street、Optiver、G-Research | 金融机器学习人才的公开竞技场 |
| 65 | FinRL | 系统 | AI4Finance | 强化学习交易 | 最流行的开源金融强化学习框架 |
| 66 | TradingAgents | 系统 | — | 多智能体 LLM 交易 | 用 LLM 智能体模拟投研团队 |
| 67 | AI Hedge Fund | 系统 | — | 多智能体、LLM | GitHub 上最受关注的开源 AI 对冲基金项目 |
| 68 | Bridgewater AIA | 系统 | — | AI 分析师、系统化宏观 | 桥水内部的 AI 投研系统 |
| 69 | Aidyia | 系统 | — | 进化算法、AI 选股 | 早期 AI 对冲基金实验 |
| 70 | Sentient Technologies | 系统 | — | 进化计算、深度学习 | 曾管理大规模 AI 交易实验 |
| 71 | Kensho | 系统 | S&P Global | NLP、事件图谱 | 金融文档理解与事件驱动分析 |
| 72 | Dataminr | 系统 | — | 实时事件检测、NLP | 从社交媒体信号中提取交易事件 |
| 73 | RavenPack | 系统 | — | 新闻情绪、另类数据 | 新闻分析数据的老牌供应商 |
| 74 | AlphaSense | 系统 | — | 语义搜索、投研 | 用 NLP 重构基本面研究 |
| 75 | BloombergGPT | 系统 | Bloomberg | 金融大语言模型 | 金融领域专用 LLM 的代表 |

### T4 策略范式（76–100）

| # | 名称 | 类型 | 机构/归属 | 代表策略 | 入选理由 |
| --- | --- | --- | --- | --- | --- |
| 76 | 统计套利 Statistical Arbitrage | 策略 | — | 均值回归、残差反转 | 量化对冲基金最核心的策略族 |
| 77 | 配对交易 / 协整 | 策略 | — | Engle-Granger、OU 过程 | 最经典的市场中性策略 |
| 78 | 横截面动量 | 策略 | — | 12-1 动量、排序 | 学术界与业界都反复验证的因子 |
| 79 | 时序动量 / 趋势 | 策略 | — | 波动率目标、突破 | CTA 的核心策略 |
| 80 | 短期均值回归 | 策略 | — | 布林带、OU 过程 | 高频与日内策略的基础 |
| 81 | 多因子模型 | 策略 | — | Fama-French、Barra | 股票收益分解的通用框架 |
| 82 | PCA 残差反转 | 策略 | — | 主成分分析、统计套利 | 用因子模型剥离共同风险 |
| 83 | 市场中性 | 策略 | — | 多空对冲、行业中性 | 剥离 beta，获取纯 alpha |
| 84 | 做市 Avellaneda-Stoikov | 策略 | — | 库存风险、最优报价 | 高频做市的理论基石 |
| 85 | 订单簿不平衡 / 微观结构 | 策略 | — | OFI、盘口深度 | 高频 alpha 的重要来源 |
| 86 | 事件驱动 | 策略 | — | PEAD、并购、财报 | 围绕信息冲击交易 |
| 87 | 新闻情绪 NLP | 策略 | — | 情绪打分、LLM | 把非结构化文本转化为信号 |
| 88 | 期权波动率套利 | 策略 | — | 隐含波动率、delta 对冲 | 系统化提取波动率风险溢价 |
| 89 | 可转债套利 | 策略 | — | 转股、波动率、信用 | 经典绝对收益策略 |
| 90 | 合并套利 | 策略 | — | 交易价差、事件概率 | 并购公告后的价差收敛 |
| 91 | 指数再平衡 | 策略 | — | 成分股调整、被动资金流 | 利用被动资金的机械交易 |
| 92 | GBDT 选股 | 策略 | — | XGBoost/LightGBM、特征工程 | 表格数据上最强的基线模型 |
| 93 | 深度学习时序 | 策略 | — | LSTM/TCN/Transformer | 处理高维时序与截面数据 |
| 94 | 强化学习执行 | 策略 | — | Q-learning、PPO | 优化下单路径与冲击成本 |
| 95 | 组合优化 / 风险平价 | 策略 | — | Markowitz、HRP、风险预算 | 把预测转化为可交易组合 |
| 96 | 凯利公式 | 策略 | — | 最优下注比例 | 增长最优的仓位管理 |
| 97 | 加密基差 / 资金费率 | 策略 | — | 现货-永续基差、carry | 加密市场最稳定的收益来源之一 |
| 98 | 链上 MEV | 策略 | — | 抢跑、套利、清算 | 区块链上的高频交易 |
| 99 | 高频延迟套利 | 策略 | — | 低延迟、共置 | 速度即 alpha |
| 100 | 元标记 / 集成 | 策略 | — | Meta-labeling、stacking | 用二级模型过滤一级信号 |


### 2.1 分档速览

| 分档 | 数量 | 关键词 |
| --- | --- | --- |
| T0 传奇 | 15 | 方法论奠基、师徒网络、跨界迁移 |
| T1 全球巨头 | 30 | 平台化、多策略、全球化 |
| T2 中国力量 | 15 | 高频、多因子、AI 基础设施 |
| T3 AI 原生 | 15 | 众包、开源、LLM 智能体 |
| T4 策略范式 | 25 | 相对价值、做市、执行、组合 |

### 2.2 六个观察

**观察一：方法论血缘比个人英雄更重要。** Renaissance Technologies 的核心血脉可以追溯到 Axcom：James Ax、Elwyn Berlekamp、Jim Simons，再到 Henry Laufer、Robert Mercer、Peter Brown。D.E. Shaw 则被称为量化人才的“黄埔军校”，Two Sigma 的两位创始人、PDT 的 Peter Muller 都与之有渊源。AI 交易不是孤胆英雄的故事，而是**思想、代码和人才在网络中扩散**的故事。

**观察二：平台化是规模化的答案。** Millennium、Citadel、Point72、Balyasny、Schonfeld 代表的多经理平台模式，把数十到数百个独立团队放在统一的风控、合规、技术和资金平台上。它的本质是**用组织设计分散 alpha 来源**，而不是押注某一个超级模型。平台化的代价是费用高、约束多、明星交易员容易出走。

**观察三：做市商是隐形的 AI 巨头。** XTX Markets、Optiver、IMC、Jane Street、Hudson River Trading、Tower Research、Flow Traders 等做市商，收入来自买卖价差、交易所返佣和库存管理。它们用机器学习做公允价格预测、逆向选择识别和库存对冲，但极少对外披露。相比对冲基金，做市商的夏普更高、容量更小、技术军备竞赛更残酷。

**观察四：中国量化的 AI 外溢。** 幻方量化孵化 DeepSeek，是一个标志性事件：量化机构在大规模算力、分布式训练和工程效率上的积累，可以外溢到通用人工智能。九坤、明汯、灵均、衍复等机构则代表了中国高频与多因子策略的成熟。中国市场的特殊性——T+1、涨跌停、注册制、散户结构——既是约束，也是 alpha 来源。

**观察五：AI 原生基金的现实与泡沫。** Vatic Investments 用深度学习选股，Numerai 用加密数据和代币激励全球数据科学家，TradingAgents 等开源项目用 LLM 智能体模拟投研团队。这些尝试很有想象力，但**从“能跑”到“能管大钱”之间，隔着数据、成本、容量、合规四道墙**。很多“AI 对冲基金”只是把传统因子包装成 AI 叙事。

**观察六：策略榜是反直觉的。** 夏普最高的策略往往容量最小（高频、做市、延迟套利）；容量最大的策略往往最拥挤（多因子、统计套利）；最性感的策略（深度学习、LLM）往往最难验证。**选择策略，本质上是在夏普、容量、成本和拥挤度之间做取舍。**

---

## 3. 25 个策略族全景

这 25 个策略族覆盖了 AI 交易的主要战场。后面的第 4 节会给出其中 15 个的完整代码；其余 10 个给出原理与实现路径，便于自行扩展。

| # | 策略族 | 类型 | 核心信号 | 典型持有期 | 容量 | 主要风险 |
| --- | --- | --- | --- | --- | --- | --- |
| 76 | 统计套利 | 相对价值 | 残差均值回归 | 分钟–日 | 高 | 拥挤、因子失效 |
| 77 | 配对交易 | 相对价值 | 协整价差 z-score | 日–周 | 中 | 协整关系断裂 |
| 78 | 横截面动量 | 方向性 | 12-1 收益排序 | 月 | 高 | 动量崩溃 |
| 79 | 时序动量/趋势 | 方向性 | 12 个月趋势 | 月 | 高 | 震荡市反复止损 |
| 80 | 短期均值回归 | 相对价值 | 20 日 z-score | 日 | 中 | 趋势、交易成本 |
| 81 | 多因子模型 | 相对价值 | 价值/动量/低波 | 月 | 很高 | 因子拥挤 |
| 82 | PCA 残差反转 | 相对价值 | 主成分残差 | 日 | 高 | 相关结构变化 |
| 83 | 市场中性 | 组合 | 多空对冲、行业中性 | 月 | 高 | 对冲误差 |
| 84 | 做市 A-S | 微观结构 | 库存、价差 | 秒–分 | 中 | 逆向选择 |
| 85 | 订单簿不平衡 | 微观结构 | OFI、盘口深度 | 秒–分 | 低 | 延迟、噪音 |
| 86 | 事件驱动 | 事件 | PEAD、并购、财报 | 日–月 | 中 | 事件失败 |
| 87 | 新闻情绪 NLP | 事件 | 文本情绪 | 分–日 | 中 | 语义歧义、延迟 |
| 88 | 期权波动率套利 | 相对价值 | IV 与 RV 之差 | 周–月 | 中 | 尾部风险 |
| 89 | 可转债套利 | 相对价值 | 转股、波动、信用 | 周–月 | 中 | 流动性、信用 |
| 90 | 合并套利 | 事件 | 交易价差 | 月 | 中 | 监管否决 |
| 91 | 指数再平衡 | 事件 | 成分股调整 | 日–周 | 低 | 提前反应、拥挤 |
| 92 | GBDT 选股 | 方向性 | 非线性特征 | 日–周 | 高 | 过拟合 |
| 93 | 深度学习时序 | 方向性 | LSTM/TCN/Transformer | 日–周 | 高 | 数据、算力 |
| 94 | 强化学习执行 | 执行 | 库存、冲击 | 分–时 | — | 仿真与现实的差距 |
| 95 | 组合优化 | 组合 | 均值方差、风险预算 | 月 | — | 协方差估计误差 |
| 96 | 凯利公式 | 组合 | 增长最优 | — | — | 参数误差 |
| 97 | 加密基差 | 加密 | 资金费率、基差 | 日–月 | 中 | 交易所、脱锚 |
| 98 | 链上 MEV | 加密 | 抢跑、清算 | 区块 | 低 | 监管、竞争 |
| 99 | 高频延迟套利 | 微观结构 | 速度 | 微秒 | 低 | 军备竞赛 |
| 100 | 元标记/集成 | 组合 | 二级模型过滤 | — | — | 过拟合 |

### 3.1 策略分类学

- **方向性策略**：预测涨跌，承担 beta。代表：动量、趋势、深度学习、GBDT。
- **相对价值策略**：预测两个资产的价格关系，剥离 beta。代表：配对、统计套利、PCA 残差、可转债。
- **微观结构策略**：从盘口、订单流、延迟中提取 alpha。代表：做市、OFI、延迟套利。
- **事件与文本策略**：围绕信息冲击交易。代表：PEAD、并购、新闻情绪、LLM 事件抽取。
- **执行与组合策略**：不预测方向，优化“怎么买、买多少”。代表：RL 执行、风险平价、凯利。
- **加密原生策略**：利用链上、资金费率、MEV 等独特结构。代表：基差、MEV。

### 3.2 从信号到组合的流水线

一条可实盘的 AI 交易流水线通常包含六层：

1. **数据层**：行情、基本面、另类数据、新闻、链上数据。关键是**时间戳对齐**与** survivorship bias**。
2. **特征层**：动量、反转、波动、流动性、情绪、图结构。关键是**截面标准化**与**缺失值处理**。
3. **预测层**：线性模型、树模型、深度学习、LLM。关键是**样本外验证**与**概率校准**。
4. **组合层**：均值方差、风险平价、凯利、机器学习组合。关键是**协方差估计**与**约束**。
5. **执行层**：TWAP、VWAP、POV、A-S、RL。关键是**冲击成本**与**机会成本**。
6. **风控层**：仓位限制、回撤止损、因子暴露、压力测试、kill switch。关键是**独立性与自动化**。

任何一层出错，都会让前一层的心血归零。**回测里最贵的错误，通常不是模型不够好，而是数据泄漏和成本低估。**

---

## 4. 十五个顶尖策略：原理与源代码

以下 15 个模块都可以独立运行，只依赖 `numpy` 与 `pandas`。每个模块包含：原理、关键公式、实现要点、风险提示、完整代码，以及在合成数据上的自检结果。

### 4.1 配对交易：协整与 z-score

**原理。** 如果两只股票的价格存在长期均衡关系，那么价差会围绕均值波动；价差偏离过大时做多低估腿、做空高估腿，回归后平仓。这是最经典的市场中性策略，也是统计套利的入门。

**数学。** 设 `y_t = log(P_y,t)`、`x_t = log(P_x,t)`，协整关系为 `y_t = α + β x_t + e_t`，其中 `e_t` 是平稳过程。价差 `s_t = y_t - α - β x_t`，信号 `z_t = (s_t - μ)/σ`。OU 半衰期由 `Δs_t = a + b s_{t-1}` 估计：`HL = -ln(2)/b`。

**实现要点。**
- 先判断协整方向：把随机游走腿当被解释变量，残差会带单位根。代码用两个方向的半衰期比较来定向。
- 对冲比例不宜高频重估，否则价差会被估计噪声污染；示例按年重估。
- 价差回归要带截距，否则 β 有偏；开仓阈值 2σ、平仓 0.5σ 是常见起点。

**风险。** 协整关系可能结构性断裂；财报、并购、指数调整都会让价差长期不回归；融券成本和停牌会放大亏损。

```python
# -*- coding: utf-8 -*-
"""01 配对交易（Pairs Trading / Cointegration）

原理
----
若两只股票的（对数）价格存在长期均衡关系
    y_t = alpha + beta * x_t + e_t,   e_t ~ I(0)
则价差 e_t 会围绕均值回复。对 e_t 做 z-score，偏离过大时做多低估腿、
做空高估腿，回归后平仓。经典实现见 Gatev, Goetzmann & Rouwenhorst (2006)。

关键公式
--------
    价差:      s_t = log(P_y,t) - alpha - beta * log(P_x,t)
    滚动对冲:  beta_t = Cov(y, x) / Var(x)  （250 日窗口）
    信号:      z_t = (s_t - mean(s)) / std(s)
    OU 半衰期: HL = -ln(2) / b,  b 来自 Δs_t = a + b s_{t-1}

实现要点
--------
1) 必须先判断协整方向：把随机游走腿当成被解释变量，残差会带单位根；
2) 对冲比例不宜高频重估，否则价差会被“估计噪声”污染；
3) 价差回归要带截距，否则 beta 有偏。

风险
----
协整关系可能结构性断裂；财报、并购、指数调整都会让价差长期不回归。
真实交易还需考虑融券成本、停牌、涨跌停与冲击成本。
"""
from __future__ import annotations

import numpy as np
import pandas as pd

from .common import (backtest, half_life, normalize_gross, rebalance_every,
                     returns_of, summarize, synthetic_prices, zscore)


def select_pair(prices: pd.DataFrame, lookback: int = 250) -> tuple[int, int]:
    """仅用前 lookback 天选择相关性最高的一对，避免使用未来信息。"""
    lp = np.log(prices.iloc[:lookback])
    cols = prices.columns
    best = (-np.inf, 0, 1)
    for i in range(len(cols)):
        for j in range(i + 1, len(cols)):
            c = float(lp[cols[i]].corr(lp[cols[j]]))
            if c > best[0]:
                best = (c, i, j)
    return best[1], best[2]


def rolling_ols(y: pd.Series, x: pd.Series, window: int = 250) -> tuple[pd.Series, pd.Series]:
    """滚动 OLS：y = alpha + beta x + e。"""
    cov = y.rolling(window).cov(x)
    var = x.rolling(window).var()
    beta = cov / var.replace(0.0, np.nan)
    alpha = y.rolling(window).mean() - beta * x.rolling(window).mean()
    return alpha, beta


def _oriented_pair(prices: pd.DataFrame, i: int, j: int,
                   lookback: int = 750) -> tuple[int, int, float, float]:
    """在 formation window 上判断协整方向，并返回 (dep, indep, alpha, beta)。"""
    a = np.log(prices.iloc[:lookback, i].values)
    b = np.log(prices.iloc[:lookback, j].values)

    beta_ba, alpha_ba = np.polyfit(a, b, 1)   # b on a
    beta_ab, alpha_ab = np.polyfit(b, a, 1)   # a on b

    hl_ba = half_life(pd.Series(b - alpha_ba - beta_ba * a))
    hl_ab = half_life(pd.Series(a - alpha_ab - beta_ab * b))

    if hl_ba <= hl_ab:
        return j, i, float(alpha_ba), float(beta_ba)
    return i, j, float(alpha_ab), float(beta_ab)


def signals(prices: pd.DataFrame, entry: float = 2.0, exit_z: float = 0.5,
            z_window: int = 60, beta_window: int = 750,
            beta_update: int = 250) -> pd.DataFrame:
    i, j = select_pair(prices)
    dep, indep, alpha0, beta0 = _oriented_pair(prices, i, j)

    y = np.log(prices.iloc[:, dep])
    x = np.log(prices.iloc[:, indep])

    # 对冲比例按年重估，避免估计噪声把价差变成随机游走
    alpha, beta = rolling_ols(y, x, beta_window)
    mask = rebalance_every(prices.index, beta_update)
    alpha = alpha.where(mask, np.nan).ffill().fillna(alpha0)
    beta = beta.where(mask, np.nan).ffill().fillna(beta0)

    spread = y - alpha - beta * x
    z = zscore(spread, z_window)

    state = np.zeros(len(prices))
    pos = 0
    for t in range(len(prices)):
        zt = float(z.iloc[t]) if np.isfinite(z.iloc[t]) else np.nan
        if not np.isfinite(zt):
            pos = 0
        elif pos == 0:
            if zt > entry:
                pos = -1          # 价差过高：空 y、多 x
            elif zt < -entry:
                pos = 1
        elif pos == 1 and zt > -exit_z:
            pos = 0
        elif pos == -1 and zt < exit_z:
            pos = 0
        state[t] = pos

    w = pd.DataFrame(0.0, index=prices.index, columns=prices.columns)
    w.iloc[:, dep] = state
    w.iloc[:, indep] = -state * beta.values
    return normalize_gross(w, 1.0)


def demo(verbose: bool = True) -> dict:
    prices = synthetic_prices()
    rets = returns_of(prices)
    w = signals(prices)
    bt = backtest(rets, w, cost_bps=3.0)

    i, j = select_pair(prices)
    dep, indep, alpha0, beta0 = _oriented_pair(prices, i, j)
    y = np.log(prices.iloc[:, dep])
    x = np.log(prices.iloc[:, indep])
    spread = y - alpha0 - beta0 * x
    hl = half_life(spread)

    res = summarize("配对交易（协整）", bt,
                    note=(f"{prices.columns[dep]}/{prices.columns[indep]}，"
                          f"beta={beta0:.2f}，半衰期 {hl:.1f} 日"))
    if verbose:
        print(res)
        print(bt.tail())
    return res


if __name__ == "__main__":
    demo()
```

> 自检（合成数据）：年化 9.4%，年化波动 5.1%，夏普 1.77，最大回撤 -4.7%，年换手 12.9x。

### 4.2 横截面动量：12-1 规则

**原理。** Jegadeesh 与 Titman（1993）发现，过去 3–12 个月表现好的股票，未来 1–12 个月仍倾向于跑赢。剔除最近一个月（短期反转），按 12-1 收益率排序，做多赢家、做空输家。

**数学。** `score_i = P_{i,t-21}/P_{i,t-252} - 1`；权重 `w_i = rank(score_i) - 0.5`，再按 60 日波动率倒数缩放。

**实现要点。**
- 截面去中心化，保证市场中性；波动率缩放，避免高波动股票主导风险。
- 周频或月频调仓，平衡信号衰减与换手成本。
- 动量崩溃（momentum crash）是最大尾部风险：市场急跌后空头腿暴涨。

**风险。** 拥挤交易、动量崩溃、高换手成本；在震荡市中反复被打脸。

```python
# -*- coding: utf-8 -*-
"""02 横截面动量（Cross-sectional Momentum）

原理
----
Jegadeesh & Titman (1993)：过去 3-12 个月表现好的股票，未来 1-12 个月
仍倾向于跑赢。剔除最近一个月（短期反转），按 12-1 收益率排序，做多
赢家组合、做空输家组合，市场中性。

公式
----
    score_i = P_{i,t-21} / P_{i,t-252} - 1
    w_i = rank(score_i) - 0.5   （截面去中心化）
    再按 60 日波动率倒数缩放，控制风险贡献

风险
----
动量崩溃（momentum crash）：市场急跌后反转，空头腿暴涨；
高换手带来成本；拥挤交易导致回撤放大。
"""
from __future__ import annotations

import numpy as np
import pandas as pd

from .common import (backtest, cs_rank, hold_mask, normalize_gross,
                     rebalance_every, returns_of, summarize, synthetic_prices)


def signals(prices: pd.DataFrame, lookback: int = 252, skip: int = 21,
            vol_window: int = 60, every: int = 5) -> pd.DataFrame:
    ret = returns_of(prices)
    mom = prices.shift(skip) / prices.shift(lookback) - 1.0
    vol = ret.rolling(vol_window).std().replace(0.0, np.nan)

    risk_adj = mom / vol
    ranks = cs_rank(risk_adj)
    w = normalize_gross(ranks, 1.0)

    # 每 5 个交易日调仓，其余时间持有
    mask = rebalance_every(prices.index, every)
    return hold_mask(w, mask)


def demo(verbose: bool = True) -> dict:
    prices = synthetic_prices()
    rets = returns_of(prices)
    w = signals(prices)
    bt = backtest(rets, w, cost_bps=5.0)
    res = summarize("横截面动量 12-1", bt, note="周频调仓，波动率缩放")
    if verbose:
        print(res)
    return res


if __name__ == "__main__":
    demo()
```

> 自检（合成数据）：年化 9.9%，年化波动 8.1%，夏普 1.21，最大回撤 -12.7%，年换手 7.3x。

### 4.3 时序动量：波动率目标与趋势

**原理。** Moskowitz、Ooi 与 Pedersen（2012）证明，资产自身过去 12 个月的收益方向可以预测未来 1 个月的方向。对每个资产独立取符号，再用波动率倒数分配仓位。

**数学。** `signal_i = sign(P_{i,t}/P_{i,t-252} - 1)`；`w_i = signal_i × (σ_target/σ_i)/N`，其中 `σ_i` 是 60 日年化波动率。

**实现要点。**
- 波动率目标让组合风险稳定，但会在低波动期加杠杆，需要设上限。
- 趋势策略在震荡市会反复止损，必须接受较低胜率、较高盈亏比。
- 多资产分散能显著改善夏普，但危机时相关性会趋同。

**风险。** 趋势反转、杠杆上限、流动性枯竭；CTA 的“危机 alpha”并非永远有效。

```python
# -*- coding: utf-8 -*-
"""03 时序动量 / 趋势跟踪（Time-series Momentum, TSMOM）

原理
----
Moskowitz, Ooi & Pedersen (2012)：资产自身过去 12 个月的收益方向，
可以预测其未来 1 个月的方向。对每个资产独立取符号，再用波动率倒数
分配仓位，使每个资产的风险贡献大致相等。

公式
----
    signal_i = sign(P_{i,t} / P_{i,t-252} - 1)
    w_i = signal_i * (sigma_target / sigma_i) / N
    sigma_i = std(r_i, 60) * sqrt(252)

风险
----
震荡市中反复止损（whipsaw）；趋势反转时回撤集中；
杠杆随波动率下降而上升，需设置杠杆上限。
"""
from __future__ import annotations

import numpy as np
import pandas as pd

from .common import (backtest, normalize_gross, rebalance_every, returns_of,
                     summarize, synthetic_prices, hold_mask)


def signals(prices: pd.DataFrame, lookback: int = 252, vol_window: int = 60,
            target_vol: float = 0.10, every: int = 5) -> pd.DataFrame:
    ret = returns_of(prices)
    direction = np.sign(prices / prices.shift(lookback) - 1.0)
    vol = (ret.rolling(vol_window).std() * np.sqrt(252)).replace(0.0, np.nan)

    raw = direction * (target_vol / vol)
    raw = raw.clip(-3.0, 3.0)
    w = normalize_gross(raw, 1.0)

    mask = rebalance_every(prices.index, every)
    return hold_mask(w, mask)


def demo(verbose: bool = True) -> dict:
    prices = synthetic_prices()
    rets = returns_of(prices)
    w = signals(prices)
    bt = backtest(rets, w, cost_bps=3.0)
    res = summarize("时序动量 TSMOM", bt, note="12 个月方向 + 10% 波动率目标")
    if verbose:
        print(res)
    return res


if __name__ == "__main__":
    demo()
```

> 自检（合成数据）：年化 3.3%，年化波动 9.3%，夏普 0.40，最大回撤 -18.9%，年换手 6.1x。

### 4.4 短期均值回归：OU 过程

**原理。** 把价格建模为 Ornstein-Uhlenbeck 过程：`dX_t = θ(μ - X_t)dt + σdW_t`。偏离均值越远，回归速度越快；用 z-score 衡量偏离，反向开仓。

**数学。** `z_t = (X_t - MA_n)/std_n`；`position = -clip(z_t, -3, 3)/3`；半衰期 `HL = ln(2)/θ`。

**实现要点。**
- 只在高波动或流动性好的标的上做，避免“价值陷阱”。
- 设置死区（|z| < entry 不交易）降低换手。
- 价格层面的均值回归很容易被随机游走淹没；更稳健的做法是对**残差**（剥离市场因子后）做回归。

**风险。** 趋势行情中逆势加仓、波动率突变、跳空与成本；示例在合成数据上收益很薄，正说明朴素价格回归并不可靠。

```python
# -*- coding: utf-8 -*-
"""04 短期均值回归（Short-term Mean Reversion / OU）

原理
----
把价格（或价差）建模为 Ornstein-Uhlenbeck 过程：
    dX_t = theta * (mu - X_t) dt + sigma dW_t
偏离均值越远，回归速度越快；用 z-score 衡量偏离程度，反向开仓。
仅当估计的半衰期足够短（例如 < 30 日）时才交易，避免“价值陷阱”。

公式
----
    z_t = (X_t - MA_n) / std_n
    position = -clip(z_t, -3, 3) / 3
    HL = ln(2) / theta

风险
----
趋势行情中不断逆势加仓；波动率突变导致 z-score 失真；
开盘跳空与交易成本会吞掉薄利。
"""
from __future__ import annotations

import numpy as np
import pandas as pd

from .common import (backtest, hold_mask, normalize_gross, rebalance_every,
                     returns_of, summarize, synthetic_prices, zscore)


def signals(prices: pd.DataFrame, z_window: int = 10, entry: float = 1.5,
            vol_window: int = 60, every: int = 1) -> pd.DataFrame:
    lp = np.log(prices)
    z = zscore(lp, z_window)

    raw = -z.clip(-3.0, 3.0) / 3.0
    raw = raw.where(z.abs() > entry, 0.0)          # 死区，降低换手

    vol = returns_of(prices).rolling(vol_window).std().replace(0.0, np.nan)
    scaled = raw / vol
    w = normalize_gross(scaled, 1.0)

    mask = rebalance_every(prices.index, every)
    return hold_mask(w, mask)


def demo(verbose: bool = True) -> dict:
    prices = synthetic_prices()
    rets = returns_of(prices)
    w = signals(prices)
    bt = backtest(rets, w, cost_bps=2.0)
    res = summarize("短期均值回归（OU）", bt, note="10 日 z-score，日频调仓")
    if verbose:
        print(res)
    return res


if __name__ == "__main__":
    demo()
```

> 自检（合成数据）：年化 0.4%，年化波动 16.6%，夏普 0.11，最大回撤 -44.4%，年换手 264.1x。

### 4.5 多因子模型：把信号合成分数

**原理。** 把股票收益分解为共同因子与特质收益：`r_i = α_i + Σ β_ik f_k + e_i`。把多个经过验证的信号（动量、反转、低波、趋势）做截面标准化后合成一个分数，做多高分、做空低分。

**数学。** `score_i = Σ_k z_k(signal_ik)/K`；`w_i = rank(score_i) - 0.5`；信息系数 `IC = corr(score_t, r_{t+1})`，信息比率 `IR = mean(IC)/std(IC) × sqrt(N)`。

**实现要点。**
- 每个因子先做截面 z-score，避免量纲和异常值影响。
- 等权合成是稳健基线；进阶做法是用 IC/IR 或机器学习动态加权。
- 必须监控因子暴露与行业中性，否则会变成“伪市场中性”。

**风险。** 因子拥挤、因子失效、行业暴露；历史 IC 不代表未来。

```python
# -*- coding: utf-8 -*-
"""05 多因子模型（Multi-factor Scoring）

原理
----
把股票收益分解为共同因子与特质收益：
    r_i = alpha_i + sum_k beta_ik f_k + e_i
在多因子框架下，把多个经过验证的信号（动量、反转、低波、趋势）做
截面标准化后合成一个分数，做多高分、做空低分，保持市场中性。

公式
----
    score_i = sum_k z_k(signal_ik) / K
    w_i = rank(score_i) - 0.5
    IC = corr(score_t, r_{t+1})      信息系数
    IR = mean(IC) / std(IC) * sqrt(N)

风险
----
因子拥挤、因子失效、行业暴露；合成权重等权未必最优，
需要用 IC/IR 或机器学习方法做动态加权。
"""
from __future__ import annotations

import numpy as np
import pandas as pd

from .common import (backtest, cs_rank, cs_zscore, hold_mask, normalize_gross,
                     rebalance_every, returns_of, summarize, synthetic_prices)


def factor_panel(prices: pd.DataFrame) -> dict[str, pd.DataFrame]:
    ret = returns_of(prices)
    return {
        "momentum": prices.pct_change(252, fill_method=None).shift(21),
        "reversal": -prices.pct_change(5, fill_method=None),
        "low_vol": -ret.rolling(60).std(),
        "trend": prices / prices.rolling(200).mean() - 1.0,
    }


def signals(prices: pd.DataFrame, every: int = 5) -> pd.DataFrame:
    factors = factor_panel(prices)
    score = sum(cs_zscore(f).fillna(0.0) for f in factors.values())
    ranks = cs_rank(score)
    w = normalize_gross(ranks, 1.0)
    mask = rebalance_every(prices.index, every)
    return hold_mask(w, mask)


def information_coefficient(prices: pd.DataFrame, horizon: int = 5) -> pd.Series:
    """计算因子合成分数与未来收益的截面相关系数。"""
    factors = factor_panel(prices)
    score = sum(cs_zscore(f).fillna(0.0) for f in factors.values())
    fwd = prices.shift(-horizon) / prices - 1.0
    return score.corrwith(fwd, axis=1)


def demo(verbose: bool = True) -> dict:
    prices = synthetic_prices()
    rets = returns_of(prices)
    w = signals(prices)
    bt = backtest(rets, w, cost_bps=5.0)
    ic = information_coefficient(prices).dropna()
    ir = float(ic.mean() / ic.std() * np.sqrt(252 / 5)) if ic.std() > 0 else 0.0
    res = summarize("多因子打分模型", bt, note=f"IC={ic.mean():.3f}, IR={ir:.2f}")
    if verbose:
        print(res)
    return res


if __name__ == "__main__":
    demo()
```

> 自检（合成数据）：年化 6.6%，年化波动 8.2%，夏普 0.82，最大回撤 -13.6%，年换手 30.2x。

### 4.6 PCA 残差反转：统计套利的骨架

**原理。** 对收益矩阵做滚动 PCA，取前 k 个主成分作为共同风险因子，把每只股票收益中能被主成分解释的部分剥离，剩下的残差做短期反转。这是 Avellaneda 与 Lee（2010）思路的简化版，也是很多 stat arb desk 的真实工作方式。

**数学。** `R = F Λ^{1/2} V^T + E`；`B` 为前 k 个特征向量；`e_t = r_t - B B^T r_t`；`z_t = e_t/std(e, 20)`；`w = -clip(z, -3, 3)` 后归一化。

**实现要点。**
- 主成分用滚动窗口估计，避免使用未来信息。
- 残差 z-score 的窗口要与持有期匹配；日频调仓对成本极敏感。
- 因子数量 k 是超参数：太少剥离不干净，太多把 alpha 也剥离掉。

**风险。** 主成分不稳定、残差含未建模风险、极端行情下相关性趋近 1。

```python
# -*- coding: utf-8 -*-
"""06 PCA 残差反转（Statistical Arbitrage）

原理
----
对收益矩阵做滚动 PCA，取前 k 个主成分作为共同风险因子：
    R = F L^{1/2} V^T + E
把每只股票收益中能被主成分解释的部分剥离，剩下的残差 E 做短期反转。
这是 Avellaneda & Lee (2010) 思路的简化版，也是很多 stat arb  desk
的真实工作方式：先中性化，再在残差上做均值回归。

公式
----
    B = 前 k 个特征向量（资产载荷）
    e_t = r_t - B B^T r_t
    z_t = e_t / std(e, 20)
    w = -clip(z, -3, 3)，再归一化

风险
----
主成分不稳定；残差可能包含未建模的风险因子；
高频调仓成本高；极端行情下相关性趋近 1，分散化失效。
"""
from __future__ import annotations

import numpy as np
import pandas as pd

from .common import (backtest, hold_mask, normalize_gross, rebalance_every,
                     returns_of, summarize, synthetic_prices)


def signals(returns: pd.DataFrame, n_factors: int = 3, window: int = 120,
            z_window: int = 20, every: int = 1) -> pd.DataFrame:
    cols = returns.columns
    out = pd.DataFrame(0.0, index=returns.index, columns=cols)
    R = returns.values

    for t in range(window + z_window, len(returns)):
        hist = R[t - window:t]
        mu = hist.mean(axis=0)
        cov = np.cov(hist.T)
        vals, vecs = np.linalg.eigh(cov)
        order = np.argsort(vals)[::-1][:n_factors]
        B = vecs[:, order]

        h = R[t - z_window:t] - mu
        resid_hist = h - h @ B @ B.T
        r = R[t] - mu
        resid = r - B @ (B.T @ r)

        sd = resid_hist.std(axis=0)
        z = np.divide(resid, sd, out=np.zeros_like(resid), where=sd > 1e-12)
        raw = -np.clip(z, -3.0, 3.0)
        scale = np.abs(raw).sum()
        if scale > 0:
            out.iloc[t] = raw / scale

    mask = rebalance_every(returns.index, every)
    return hold_mask(out, mask)


def demo(verbose: bool = True) -> dict:
    prices = synthetic_prices()
    rets = returns_of(prices)
    w = signals(rets)
    bt = backtest(rets, w, cost_bps=2.0)
    res = summarize("PCA 残差反转", bt, note="3 因子，20 日残差 z-score，日频")
    if verbose:
        print(res)
    return res


if __name__ == "__main__":
    demo()
```

> 自检（合成数据）：年化 5.9%，年化波动 6.9%，夏普 0.87，最大回撤 -9.3%，年换手 327.7x。

### 4.7 做市：Avellaneda–Stoikov 模型

**原理。** 做市商同时报买价与卖价，赚取价差，但会积累库存风险。Avellaneda 与 Stoikov（2008）把做市写成随机最优控制问题：给定库存、剩余时间、波动率和风险厌恶，最优报价围绕“保留价格”展开。

**数学。** 保留价格 `r = s - q γ σ² (T-t)`；最优价差 `δ = γσ²(T-t) + (2/γ) ln(1+γ/κ)`；买价 `bid = r - δ/2`，卖价 `ask = r + δ/2`；成交强度 `λ(δ) = A exp(-κδ)`。

**实现要点。**
- 库存为正时压低两边报价，鼓励卖出；库存为负时相反。
- κ 越大，订单簿越“薄”，报价需要越宽。
- 真实做市还要考虑逆向选择、排队位置、交易所返佣和延迟。

**风险。** 逆向选择（被知情交易者命中）、库存风险、技术故障；做市的尾部风险常被低估。

```python
# -*- coding: utf-8 -*-
"""07 做市：Avellaneda-Stoikov 模型

原理
----
做市商同时报买价与卖价，赚取价差，但会积累库存风险。Avellaneda &
Stoikov (2008) 把做市写成随机最优控制问题：给定库存 q、剩余时间 T-t、
波动率 sigma 和风险厌恶 gamma，最优报价围绕“保留价格”展开。

公式
----
    保留价格:  r(s, q, t) = s - q * gamma * sigma^2 * (T - t)
    最优价差:  delta = gamma * sigma^2 * (T - t) + (2/gamma) * ln(1 + gamma/kappa)
    买价:      bid = r - delta/2
    卖价:      ask = r + delta/2
    成交强度:  lambda(delta) = A * exp(-kappa * delta)

其中 kappa 是订单簿深度参数：报价离中间价越远，成交概率越低。

本文件用蒙特卡洛仿真比较“库存感知报价”与“固定价差报价”。
这不是历史回测，只用于展示模型机制。
"""
from __future__ import annotations

import numpy as np

from .common import synthetic_prices  # noqa: F401  (保持包内风格一致)


def _quote_as(s: float, q: float, tau: float, gamma: float,
              sigma: float, kappa: float) -> tuple[float, float]:
    reservation = s - q * gamma * sigma ** 2 * tau
    spread = gamma * sigma ** 2 * tau + (2.0 / gamma) * np.log(1.0 + gamma / kappa)
    return reservation - spread / 2.0, reservation + spread / 2.0


def simulate(strategy: str = "as", n_paths: int = 400, n_steps: int = 100,
             seed: int = 0, gamma: float = 2.0, sigma: float = 0.05,
             kappa: float = 20.0, fixed_half_spread: float = 0.05) -> dict:
    rng = np.random.default_rng(seed)
    dt = 1.0 / n_steps
    pnls = np.zeros(n_paths)
    inv_rms = np.zeros(n_paths)

    for p in range(n_paths):
        s = 100.0
        q = 0.0
        cash = 0.0
        sq = 0.0
        for i in range(n_steps):
            tau = (n_steps - i) / n_steps
            if strategy == "as":
                bid, ask = _quote_as(s, q, tau, gamma, sigma, kappa)
            else:
                bid, ask = s - fixed_half_spread, s + fixed_half_spread

            # 成交概率随报价距离指数衰减
            p_bid = min(0.9, 0.5 * np.exp(-kappa * max(s - bid, 0.0)))
            p_ask = min(0.9, 0.5 * np.exp(-kappa * max(ask - s, 0.0)))

            if rng.random() < p_bid:
                q += 1.0
                cash -= bid
            if rng.random() < p_ask:
                q -= 1.0
                cash += ask

            s *= np.exp(rng.normal(0.0, sigma * np.sqrt(dt)))
            sq += q * q

        pnls[p] = cash + q * s
        inv_rms[p] = np.sqrt(sq / n_steps)

    sharpe = float(pnls.mean() / pnls.std()) if pnls.std() > 0 else 0.0
    return dict(name=f"做市（{strategy.upper()}）", type="仿真",
                ann_ret=0.0, ann_vol=float(pnls.std()), sharpe=sharpe,
                max_dd=0.0, turnover=0.0, mean_pnl=float(pnls.mean()),
                key=f"{pnls.mean():.2f}",
                note=f"每路径均值 {pnls.mean():.2f}，库存 RMS {inv_rms.mean():.2f}")


def demo(verbose: bool = True) -> dict:
    as_res = simulate("as")
    fixed_res = simulate("fixed")
    res = dict(as_res)
    res["name"] = "做市 A-S vs 固定价差"
    res["note"] = (f"A-S 均值 {as_res['mean_pnl']:.2f}（库存 RMS 已计入）"
                   f"；固定价差均值 {fixed_res['mean_pnl']:.2f}")
    if verbose:
        print(as_res)
        print(fixed_res)
    return res


if __name__ == "__main__":
    demo()
```

> 自检（仿真）：A-S 均值 1.49（库存 RMS 已计入）；固定价差均值 1.60

### 4.8 订单簿不平衡：OFI

**原理。** 盘口买卖压力的变化会短期预测价格方向。Cont、Kukanov 与 Stoikov（2014）定义的 OFI 把最优买卖价与挂单量的变化合成一个指标；OFI 为正表示买盘更强。

**数学。** `e_n = 1{P^b_n ≥ P^b_{n-1}} q^b_n - 1{P^b_n ≤ P^b_{n-1}} q^b_{n-1} - 1{P^a_n ≤ P^a_{n-1}} q^a_n + 1{P^a_n ≥ P^a_{n-1}} q^a_{n-1}`。

**实现要点。**
- OFI 是高频信号，对延迟极其敏感；必须用事件时间对齐。
- 需要过滤掉挂单撤单造成的噪声，结合成交量确认。
- 真实回测要用逐笔委托与成交数据，不能用日线。

**风险。** 延迟、交易所撮合差异、信号衰减；示例是机制仿真，不是实盘回测。

```python
# -*- coding: utf-8 -*-
"""08 订单簿不平衡（Order Flow Imbalance, OFI）

原理
----
盘口买卖压力的变化会短期预测价格方向。Cont, Kukanov & Stoikov (2014)
定义的 OFI 把最优买卖价与挂单量的变化合成一个指标：

    e_n = 1{P^b_n >= P^b_{n-1}} q^b_n - 1{P^b_n <= P^b_{n-1}} q^b_{n-1}
        - 1{P^a_n <= P^a_{n-1}} q^a_n + 1{P^a_n >= P^a_{n-1}} q^a_{n-1}

OFI 为正表示买盘更强，价格短期倾向于上涨。策略在 OFI 突破阈值时
顺势持仓，持有数个单位时间后平仓。

本文件用带信息结构的合成订单流验证“信号→仓位→成本”的管线，
不是真实盘口回测。
"""
from __future__ import annotations

import numpy as np
import pandas as pd


def simulate(n_steps: int = 30000, seed: int = 3, beta: float = 0.22,
             cost: float = 0.02) -> dict:
    rng = np.random.default_rng(seed)
    ofi = np.zeros(n_steps)
    ret = np.zeros(n_steps)

    for t in range(1, n_steps):
        ofi[t] = 0.90 * ofi[t - 1] + rng.normal(0.0, 1.0)
        ret[t] = beta * np.tanh(ofi[t - 1]) + rng.normal(0.0, 0.8)

    pos = np.where(ofi > 1.2, 1.0, np.where(ofi < -1.2, -1.0, 0.0))
    pnl = pos[:-1] * ret[1:] - cost * np.abs(np.diff(pos))

    # 用 OFI 预测下一期收益的 R^2
    x = np.tanh(ofi[:-1])
    y = ret[1:]
    coef = np.polyfit(x, y, 1)
    pred = np.polyval(coef, x)
    ss_res = float(((y - pred) ** 2).sum())
    ss_tot = float(((y - y.mean()) ** 2).sum())
    r2 = 1.0 - ss_res / ss_tot if ss_tot > 0 else 0.0

    tstat = float(pnl.mean() / pnl.std() * np.sqrt(len(pnl))) if pnl.std() > 0 else 0.0
    return dict(name="订单簿不平衡 OFI", type="仿真", ann_ret=0.0,
                ann_vol=float(pnl.std()), sharpe=0.0, max_dd=0.0,
                turnover=0.0, mean_pnl=float(pnl.sum()),
                key=f"t={tstat:.1f}",
                note=f"逐笔 t 值 {tstat:.1f}，OFI 预测 R²={r2:.4f}")


def demo(verbose: bool = True) -> dict:
    res = simulate()
    if verbose:
        print(res)
    return res


if __name__ == "__main__":
    demo()
```

> 自检（仿真）：逐笔 t 值 33.4，OFI 预测 R²=0.0478

### 4.9 新闻情绪：从文本到仓位

**原理。** 把新闻、公告、研报转成情绪分数，再映射为仓位。常见做法有词典法、监督学习、LLM 事件抽取。词典法可解释、低延迟，适合做基线。

**数学。** `score = (pos - neg)/(pos + neg + 1)`；`position = tanh(score/2)`；情绪按天聚合，可用指数衰减。

**实现要点。**
- 金融文本要用金融词典（如 Loughran–McDonald），通用词典会误判。
- 否定、反讽、旧闻重发、标题党是主要噪声源。
- 情绪因子衰减极快，必须控制延迟；LLM 方案要评估成本与幻觉。

**风险。** 语义歧义、新闻授权、延迟、监管；情绪策略很容易在回测中“偷看未来”。

```python
# -*- coding: utf-8 -*-
"""09 新闻情绪 NLP（News Sentiment）

原理
----
把文本转成情绪分数，再映射为仓位。常见做法：
  1) 词典法：统计正负词数量（Loughran-McDonald 金融词典）；
  2) 监督学习：用标注数据训练文本分类器；
  3) LLM：用大模型做事件抽取与情绪判断（需控制延迟与成本）。

本文件实现一个可解释的词典打分器，并用合成“新闻→收益”过程验证管线：
    s_t = 0.9 s_{t-1} + noise
    r_{t+1} = 0.15 * s_t + noise
    position_t = tanh(s_t / 2)

风险
----
反讽、否定、旧闻重发、标题党；情绪因子衰减极快；
LLM 的幻觉与合规风险；新闻授权与延迟。
"""
from __future__ import annotations

import numpy as np
import pandas as pd

POS_WORDS = ["beat", "beats", "upgrade", "record", "growth", "profit", "surge",
             "raise", "strong", "outperform", "buyback", "dividend", "win"]
NEG_WORDS = ["miss", "misses", "downgrade", "loss", "lawsuit", "probe", "cut",
             "weak", "warning", "fraud", "recall", "default", "plunge"]
POS_CN = ["超预期", "增长", "回购", "分红", "上调", "中标", "创新高", "盈利"]
NEG_CN = ["低于预期", "亏损", "下调", "诉讼", "调查", "减持", "违约", "暴跌"]


def score_text(text: str) -> float:
    """返回 [-1, 1] 的情绪分数；正负词加权，中文按子串计数。"""
    low = text.lower()
    tokens = low.replace(",", " ").replace(".", " ").split()
    pos = sum(t in POS_WORDS for t in tokens) + sum(w in text for w in POS_CN)
    neg = sum(t in NEG_WORDS for t in tokens) + sum(w in text for w in NEG_CN)
    return float((pos - neg) / (pos + neg + 1.0))


def aggregate(news: pd.DataFrame) -> pd.Series:
    """news: index=日期, columns=[text, weight]；按日加权平均。"""
    s = news.apply(lambda r: score_text(str(r["text"])) * float(r.get("weight", 1.0)), axis=1)
    return s.groupby(level=0).sum() / news.groupby(level=0)["weight"].sum()


def simulate(n_days: int = 1200, seed: int = 9, beta: float = 0.0015) -> dict:
    rng = np.random.default_rng(seed)
    sent = np.zeros(n_days)
    ret = np.zeros(n_days)
    for t in range(1, n_days):
        sent[t] = 0.90 * sent[t - 1] + rng.normal(0.0, 0.35)
        ret[t] = beta * sent[t - 1] + rng.normal(0.0, 0.010)

    pos = np.tanh(sent / 2.0)
    pnl = pd.Series(pos[:-1] * ret[1:] - 0.0002 * np.abs(np.diff(pos)))
    sharpe = float(pnl.mean() / pnl.std() * np.sqrt(252)) if pnl.std() > 0 else 0.0
    ann = float((1 + pnl).prod() ** (252 / len(pnl)) - 1)

    demo_news = pd.DataFrame(
        {"text": ["公司业绩超预期，宣布回购", "Company beats estimates, upgrade to buy",
                  "监管调查导致股价暴跌", "Weak outlook, downgrade"],
         "weight": [1.0, 1.0, 1.0, 1.0]},
        index=pd.to_datetime(["2025-01-02", "2025-01-02", "2025-01-03", "2025-01-03"]),
    )
    return dict(name="新闻情绪 NLP", type="回测", ann_ret=ann,
                ann_vol=float(pnl.std() * np.sqrt(252)), sharpe=sharpe,
                max_dd=float((1 + pnl).cumprod().div((1 + pnl).cumprod().cummax()).min() - 1),
                turnover=0.0, note="词典法：正面示例 0.67，负面示例 -0.67")


def demo(verbose: bool = True) -> dict:
    res = simulate()
    if verbose:
        print(res)
        print(score_text("Company beats estimates and raises guidance"))
    return res


if __name__ == "__main__":
    demo()
```

> 自检（合成数据）：年化 5.7%，年化波动 5.4%，夏普 1.05，最大回撤 -5.8%，年换手 0.0x。

### 4.10 期权波动率套利：VRP

**原理。** 期权价格由隐含波动率决定。若 IV 系统性高于随后实现的波动率，卖出期权、用标的做 delta 对冲，可以赚取波动率风险溢价（VRP）。

**数学。** Black–Scholes：`C = S N(d1) - K e^{-rT} N(d2)`，`d1 = [ln(S/K) + (r + σ²/2)T]/(σ√T)`，`d2 = d1 - σ√T`；跨式 delta `= 2N(d1) - 1`；`VRP ≈ IV² - RV²`。

**实现要点。**
- 每日按 BS delta 调仓，持有到期；对冲频率越高，交易成本越高。
- 卖出跨式是“捡钢镚”策略：胜率高、尾部风险大。
- 真实交易要建模波动率曲面、跳跃、保证金和流动性。

**风险。** 波动率跳跃、gap 风险、对冲不足、保证金挤兑；一次尾部事件可能吞掉多年收益。

```python
# -*- coding: utf-8 -*-
"""10 期权波动率套利（Volatility Arbitrage）

原理
----
期权价格由隐含波动率（IV）决定。若 IV 系统性高于随后实现的波动率（RV），
卖出期权、用标的做 delta 对冲，可以赚取波动率风险溢价（VRP）。
经典做法：卖出 ATM 跨式（straddle），每日按 BS delta 调仓，持有到期。

公式
----
    Black-Scholes call:
      C = S N(d1) - K e^{-rT} N(d2)
      d1 = [ln(S/K) + (r + sigma^2/2)T] / (sigma sqrt(T)),  d2 = d1 - sigma sqrt(T)
    straddle delta = N(d1) + (N(d1) - 1) = 2N(d1) - 1
    VRP ≈ IV^2 - RV^2

风险
----
波动率跳跃、gap 风险、对冲频率不足、保证金与流动性；
卖出尾部风险是“捡钢镚”策略的典型形态。
"""
from __future__ import annotations

import math

import numpy as np


def norm_cdf(x: float) -> float:
    return 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))


def bs_price(S: float, K: float, T: float, r: float, sigma: float,
             kind: str = "call") -> float:
    if T <= 0 or sigma <= 0:
        return max(S - K, 0.0) if kind == "call" else max(K - S, 0.0)
    d1 = (math.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * math.sqrt(T))
    d2 = d1 - sigma * math.sqrt(T)
    if kind == "call":
        return S * norm_cdf(d1) - K * math.exp(-r * T) * norm_cdf(d2)
    return K * math.exp(-r * T) * norm_cdf(-d2) - S * norm_cdf(-d1)


def bs_delta(S: float, K: float, T: float, r: float, sigma: float,
             kind: str = "call") -> float:
    if T <= 0 or sigma <= 0:
        return float(S > K) if kind == "call" else float(S < K)
    d1 = (math.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * math.sqrt(T))
    return norm_cdf(d1) if kind == "call" else norm_cdf(d1) - 1.0


def simulate(n_paths: int = 400, days: int = 21, seed: int = 5,
             S0: float = 100.0, K: float = 100.0, iv: float = 0.21,
             theta: float = 0.18, kappa: float = 3.0,
             volvol: float = 0.6) -> dict:
    rng = np.random.default_rng(seed)
    dt = 1.0 / 252.0
    pnls = np.zeros(n_paths)

    for p in range(n_paths):
        logv = math.log(theta)
        S = S0
        premium = (bs_price(S0, K, days * dt, 0.0, iv, "call")
                   + bs_price(S0, K, days * dt, 0.0, iv, "put"))
        cash = premium
        delta_prev = 0.0

        for d in range(1, days + 1):
            logv += kappa * (math.log(theta) - logv) * dt + volvol * math.sqrt(dt) * rng.normal()
            v = math.exp(logv)
            jump = rng.normal(0.0, 0.035) if rng.random() < 0.01 else 0.0
            S *= math.exp(-0.5 * v * v * dt + v * math.sqrt(dt) * rng.normal() + jump)

            tau = max((days - d) * dt, 1e-8)
            delta = (bs_delta(S, K, tau, 0.0, iv, "call")
                     + bs_delta(S, K, tau, 0.0, iv, "put"))
            cash -= (delta - delta_prev) * S
            delta_prev = delta

        cash += delta_prev * S - abs(S - K)
        pnls[p] = cash

    sharpe = float(pnls.mean() / pnls.std() * math.sqrt(252 / days)) if pnls.std() > 0 else 0.0
    return dict(name="期权波动率套利", type="仿真", ann_ret=0.0,
                ann_vol=float(pnls.std()), sharpe=sharpe, max_dd=0.0,
                turnover=0.0, mean_pnl=float(pnls.mean()),
                key=f"{pnls.mean():.2f}",
                note=f"卖出 IV={iv:.0%} 跨式，均值 PnL={pnls.mean():.2f} 美元/张")


def demo(verbose: bool = True) -> dict:
    res = simulate()
    if verbose:
        print(res)
        print("BS call:", round(bs_price(100, 100, 0.25, 0.0, 0.2), 3))
    return res


if __name__ == "__main__":
    demo()
```

> 自检（仿真）：卖出 IV=21% 跨式，均值 PnL=0.38 美元/张

### 4.11 GBDT 选股：表格数据的最强基线

**原理。** 把横截面选股写成监督学习：特征 X（动量、反转、波动、均线偏离、成交量），标签 y（未来 5 日收益的截面排名）。梯度提升树逐步拟合残差：`F_m = F_{m-1} + ν h_m`。

**数学。** `h_m` 拟合负梯度（残差）；`ν` 是学习率；最终预测 `F_M(x)` 用作排序分数。

**实现要点。**
- 标签用截面排名而不是原始收益，避免模型去预测市场 beta。
- 特征做截面标准化；训练集只使用 t 时刻已经可见的标签（t-horizon 之前）。
- 时间序列交叉验证必须 purge + embargo；树越深、迭代越多，越容易过拟合。

**风险。** 过拟合、特征漂移、成本；示例用树桩 GBDT，故意保持简单，真实场景通常用 LightGBM/XGBoost + 贝叶斯调参。

```python
# -*- coding: utf-8 -*-
"""11 梯度提升树选股（GBDT Alpha）

原理
----
把横截面选股写成监督学习：特征 X（动量、反转、波动、均线偏离、成交量），
标签 y（未来 5 日收益）。用梯度提升树拟合非线性关系：
    F_m(x) = F_{m-1}(x) + nu * h_m(x)
其中 h_m 拟合负梯度（残差）。本文件用决策树桩（depth=1）实现一个
最小可运行的 GBDT，避免依赖 sklearn / xgboost。

工程要点
--------
1) 时间序列交叉验证必须 purge + embargo，防止标签泄漏；
2) 特征做截面标准化，避免市值/波动带来的尺度偏差；
3) 训练集只使用 t 时刻已经可见的标签（t-horizon 之前）。

风险
----
过拟合、特征漂移、交易成本；树模型对异常值敏感；
合成数据上的表现不能外推到真实市场。
"""
from __future__ import annotations

import numpy as np
import pandas as pd

from .common import (backtest, cs_zscore, returns_of, summarize,
                     synthetic_prices, synthetic_volume)


def build_dataset(prices: pd.DataFrame, volume: pd.DataFrame,
                  horizon: int = 5) -> tuple[np.ndarray, np.ndarray, list[str]]:
    ret = returns_of(prices)
    raw = {
        "ret1": ret,
        "ret5": prices.pct_change(5, fill_method=None),
        "ret20": prices.pct_change(20, fill_method=None),
        "ret60": prices.pct_change(60, fill_method=None),
        "vol20": ret.rolling(20).std(),
        "ma20": prices / prices.rolling(20).mean() - 1.0,
        "volz": (volume - volume.rolling(60).mean()) / volume.rolling(60).std(),
    }
    # 特征做截面标准化，剥离市场/规模等共同尺度
    X = np.stack([cs_zscore(f).values for f in raw.values()], axis=2).astype(float)

    # 标签用截面排名而不是原始收益，避免模型去预测市场 beta
    fwd = prices.shift(-horizon) / prices - 1.0
    y = (fwd.rank(axis=1, pct=True) - 0.5).values.astype(float)
    return X, y, list(raw)


def _best_stump(X: np.ndarray, resid: np.ndarray, min_leaf: int = 40,
                n_thresholds: int = 5):
    best = None
    n, p = X.shape
    for j in range(p):
        qs = np.unique(np.quantile(X[:, j], np.linspace(0.15, 0.85, n_thresholds)))
        for th in qs:
            left = X[:, j] <= th
            nl = int(left.sum())
            if nl < min_leaf or n - nl < min_leaf:
                continue
            ml = float(resid[left].mean())
            mr = float(resid[~left].mean())
            sse = float(((resid[left] - ml) ** 2).sum() + ((resid[~left] - mr) ** 2).sum())
            if best is None or sse < best[0]:
                best = (sse, j, float(th), ml, mr)
    return best


def fit_gbdt(X: np.ndarray, y: np.ndarray, n_estimators: int = 30,
             lr: float = 0.08) -> tuple[float, list]:
    base = float(y.mean())
    pred = np.full(len(y), base)
    stumps = []
    for _ in range(n_estimators):
        resid = y - pred
        best = _best_stump(X, resid)
        if best is None:
            break
        _, j, th, ml, mr = best
        pred += lr * np.where(X[:, j] <= th, ml, mr)
        stumps.append((j, th, ml, mr))
    return base, stumps


def predict_gbdt(base: float, stumps: list, X: np.ndarray, lr: float = 0.08) -> np.ndarray:
    pred = np.full(len(X), base)
    for j, th, ml, mr in stumps:
        pred += lr * np.where(X[:, j] <= th, ml, mr)
    return pred


def signals(prices: pd.DataFrame, volume: pd.DataFrame, horizon: int = 5,
            train_window: int = 500, refit: int = 120,
            n_estimators: int = 30, every: int = 5) -> pd.DataFrame:
    X, y, _ = build_dataset(prices, volume, horizon)
    T, N, F = X.shape
    w = np.zeros((T, N))
    base, stumps, last_fit = 0.0, [], -10_000

    for t in range(300, T - horizon, every):
        if t - last_fit >= refit:
            lo = max(0, t - horizon - train_window)
            Xtr = X[lo:t - horizon].reshape(-1, F)
            ytr = y[lo:t - horizon].reshape(-1)
            mask = np.isfinite(Xtr).all(axis=1) & np.isfinite(ytr)
            if mask.sum() >= 300:
                base, stumps = fit_gbdt(Xtr[mask], ytr[mask], n_estimators=n_estimators)
                last_fit = t

        pred = predict_gbdt(base, stumps, X[t])
        if not np.isfinite(pred).all():
            continue
        demeaned = pred - pred.mean()
        scale = np.abs(demeaned).sum()
        if scale > 0:
            w[t] = demeaned / scale

    w_df = pd.DataFrame(w, index=prices.index, columns=prices.columns)
    hold = pd.Series(False, index=prices.index)
    hold.iloc[300::every] = True
    return w_df.where(hold, np.nan).ffill().fillna(0.0)


def demo(verbose: bool = True) -> dict:
    prices = synthetic_prices()
    volume = synthetic_volume(prices)
    rets = returns_of(prices)
    w = signals(prices, volume)
    bt = backtest(rets, w, cost_bps=5.0)
    res = summarize("GBDT 选股", bt, note="树桩 GBDT，5 日标签，120 日重训")
    if verbose:
        print(res)
    return res


if __name__ == "__main__":
    demo()
```

> 自检（合成数据）：年化 6.0%，年化波动 7.3%，夏普 0.83，最大回撤 -8.6%，年换手 25.8x。

### 4.12 强化学习执行：Q-learning

**原理。** 把“如何在 T 个时段内卖完 Q 股”建模为马尔可夫决策过程：状态是剩余时间与库存，动作是每期卖出比例，奖励是成交金额减去库存风险惩罚。目标是最小化 implementation shortfall。

**数学。** `Q(s,a) ← Q(s,a) + α[r + γ max_a' Q(s',a') - Q(s,a)]`；临时冲击 `成交价 = S(1 - η·rate)`；永久冲击 `S_{t+1} = S_t exp(-γ_p·rate + σ ε)`。

**实现要点。**
- 状态离散化要足够细，但会带来维数灾难；真实场景用函数逼近（DQN/PPO）。
- 奖励设计决定行为：只奖励成交额会学会“拖到最后”，必须加入库存风险。
- 仿真环境与真实市场差距大，RL 的样本效率是实盘化的主要障碍。

**风险。** 仿真偏差、奖励劫持、训练不稳定；示例中 Q-learning 优于一次性卖出，但未超过 TWAP，正说明其样本效率问题。

```python
# -*- coding: utf-8 -*-
"""12 强化学习执行（RL Execution）

原理
----
把“如何在 T 个时段内卖完 Q 股”建模为马尔可夫决策过程：
    状态 s = (剩余时间 t, 剩余库存 q)
    动作 a = 本时段卖出比例
    奖励 r = 成交金额 - 库存风险惩罚
目标是最大化执行收益（最小化 implementation shortfall），在“一次性砸盘
造成冲击”与“拖到最后承担价格风险”之间权衡。本文件用表格 Q-learning
求解，并与 TWAP（每期等量卖出）对比。

公式
----
    Q(s,a) <- Q(s,a) + alpha [r + gamma max_a' Q(s',a') - Q(s,a)]
    临时冲击: 成交价 = S * (1 - eta * rate)
    永久冲击: S_{t+1} = S_t * exp(-gamma_p * rate + sigma * eps)

风险
----
仿真环境与真实市场差距大；Q 表离散化误差；只适用于小规模问题；
真实执行还要考虑排队、暗池、信息泄漏与合规。
"""
from __future__ import annotations

import numpy as np


class ExecutionEnv:
    """卖出 Q=1 单位、分 T 期的简化 Almgren-Chriss 环境。"""

    def __init__(self, T: int = 10, eta: float = 0.12, gamma_p: float = 0.02,
                 sigma: float = 0.01, lam: float = 0.0001, seed: int = 0):
        self.T, self.eta, self.gamma_p = T, eta, gamma_p
        self.sigma, self.lam, self.seed = sigma, lam, seed

    def reset(self):
        self.rng = np.random.default_rng(self.seed)
        self.t, self.inv, self.s = 0, 1.0, 100.0
        self.arrival, self.cash = 100.0, 0.0
        return self._state()

    def _state(self):
        return (min(self.t, self.T), int(round(self.inv * 10)))

    def step(self, action: int):
        frac = action * 0.1
        trade = min(self.inv, frac)
        rate = trade
        exec_price = self.s * (1.0 - self.eta * rate)
        proceeds = trade * exec_price
        self.cash += proceeds
        self.inv -= trade

        self.s *= np.exp(-self.gamma_p * rate + self.rng.normal(0.0, self.sigma))
        reward = proceeds - self.lam * self.inv * self.s
        self.t += 1
        done = self.t >= self.T
        if done:
            reward += self.inv * self.s * (1.0 - self.eta * self.inv)
            self.cash += self.inv * self.s * (1.0 - self.eta * self.inv)
            self.inv = 0.0
        return self._state(), float(reward), done


def train(n_episodes: int = 4000, seed: int = 1) -> np.ndarray:
    T, n_inv, n_act = 10, 11, 5
    Q = np.zeros((T + 1, n_inv, n_act))
    rng = np.random.default_rng(seed)
    alpha, eps = 0.15, 1.0

    for ep in range(n_episodes):
        env = ExecutionEnv(seed=seed + ep)
        s = env.reset()
        done = False
        while not done:
            if rng.random() < eps:
                a = int(rng.integers(0, n_act))
            else:
                a = int(np.argmax(Q[s[0], s[1]]))
            s2, r, done = env.step(a)
            target = r + (0.0 if done else 0.99 * float(np.max(Q[s2[0], s2[1]])))
            Q[s[0], s[1], a] += alpha * (target - Q[s[0], s[1], a])
            s = s2
        eps = max(0.05, eps * 0.999)
    return Q


def run_policy(policy, seed: int) -> float:
    env = ExecutionEnv(seed=seed)
    s = env.reset()
    done = False
    while not done:
        a = policy(s)
        s, _, done = env.step(a)
    return (env.arrival * 1.0 - env.cash) / env.arrival * 1e4   # 基点


def demo(verbose: bool = True) -> dict:
    Q = train()
    q_policy = lambda s: int(np.argmax(Q[s[0], s[1]]))
    twap_policy = lambda s: 1 if s[1] > 0 else 0

    q_is = np.array([run_policy(q_policy, 10_000 + i) for i in range(300)])
    t_is = np.array([run_policy(twap_policy, 10_000 + i) for i in range(300)])

    res = dict(name="RL 执行（Q-learning）", type="仿真", ann_ret=0.0,
               ann_vol=float(q_is.std()), sharpe=0.0, max_dd=0.0, turnover=0.0,
               mean_pnl=float(q_is.mean()), key=f"{q_is.mean():.0f}bp",
               note=(f"Q 策略 IS={q_is.mean():.2f}bp vs TWAP={t_is.mean():.2f}bp"
                     f"（越低成本；一次性卖出约 1200bp）"))
    if verbose:
        print(res)
        print("Q 策略示意:", [int(np.argmax(Q[t, 10 - t])) for t in range(10)])
    return res


if __name__ == "__main__":
    demo()
```

> 自检（仿真）：Q 策略 IS=358.44bp vs TWAP=196.90bp（越低成本；一次性卖出约 1200bp）

### 4.13 组合优化：风险平价与凯利

**原理。** 预测再准，仓位错了也会亏钱。风险平价让每个资产对组合风险的边际贡献相等；凯利公式最大化长期对数增长。

**数学。**
- 风险贡献 `RC_i = w_i (Σw)_i / σ_p`，迭代使 `RC_i` 相等。
- 单资产凯利 `f* = μ/σ²`；多资产 `f* = Σ^{-1} μ`；实务用 0.25–0.5 倍分数凯利。

**实现要点。**
- 协方差估计误差会被求逆放大；用收缩估计（Ledoit–Wolf）或因子模型降维。
- 凯利对 μ 的误差极其敏感，必须设权重上限与止损。
- 风险平价在危机中并不“平价”，因为相关性会趋同。

**风险。** 协方差误差、参数误差、杠杆；优化器会把误差当成 alpha。

```python
# -*- coding: utf-8 -*-
"""13 组合优化：风险平价与凯利公式

原理
----
预测再准，仓位错了也会亏钱。两种经典仓位方法：

1) 风险平价（Risk Parity）：让每个资产对组合风险的边际贡献相等。
   风险贡献 RC_i = w_i * (Sigma w)_i / sigma_p
   迭代求解 w_i，使 RC_i 全部相等。

2) 凯利公式（Kelly）：最大化长期对数增长。
   单资产 f* = mu / sigma^2
   多资产 f* = Sigma^{-1} mu
   实务中只用分数凯利（如 0.25~0.5 倍），并对权重设上限。

风险
----
协方差估计误差会被求逆放大；凯利对 mu 的误差极其敏感；
风险平价在相关性趋同的危机中并不“平价”。
"""
from __future__ import annotations

import numpy as np
import pandas as pd

from .common import (backtest, rebalance_every, returns_of, summarize,
                     synthetic_prices)


def risk_parity(cov: np.ndarray, iters: int = 500) -> np.ndarray:
    n = cov.shape[0]
    w = np.ones(n) / n
    for _ in range(iters):
        mrc = cov @ w
        rc = w * mrc
        target = rc.mean()
        w = w * np.sqrt(target / np.maximum(rc, 1e-14))
        w = np.maximum(w, 1e-10)
        w /= w.sum()
    return w


def kelly(cov: np.ndarray, mu: np.ndarray, fraction: float = 0.5,
          cap: float = 1.0) -> np.ndarray:
    w = np.linalg.pinv(cov) @ mu
    w = np.clip(w, -cap, cap) * fraction
    gross = np.abs(w).sum()
    return w / gross if gross > 1e-12 else np.zeros_like(w)


def weights(prices: pd.DataFrame, method: str = "rp", window: int = 120,
            every: int = 21) -> pd.DataFrame:
    ret = returns_of(prices)
    cols = prices.columns
    out = pd.DataFrame(0.0, index=prices.index, columns=cols)
    mask = rebalance_every(prices.index, every).values

    for t in range(window, len(prices)):
        if not mask[t]:
            continue
        hist = ret.iloc[t - window:t].values
        cov = np.cov(hist.T) + np.eye(len(cols)) * 1e-8
        mu = hist.mean(axis=0)
        if method == "rp":
            w = risk_parity(cov)
        elif method == "kelly":
            w = kelly(cov, mu, fraction=0.35, cap=1.0)
        else:
            w = np.ones(len(cols)) / len(cols)
        out.iloc[t] = w

    out = out.where(pd.Series(mask, index=out.index), np.nan).ffill().fillna(0.0)
    return out


def demo(verbose: bool = True) -> dict:
    prices = synthetic_prices()
    rets = returns_of(prices)
    w_rp = weights(prices, "rp")
    w_kelly = weights(prices, "kelly")
    bt_rp = backtest(rets, w_rp, cost_bps=3.0)
    bt_kelly = backtest(rets, w_kelly, cost_bps=3.0)
    res = summarize("风险平价 + 分数凯利", bt_rp, note="月度调仓；凯利用 0.35 倍")
    if verbose:
        print(res)
        print("凯利版夏普:", round(summarize("kelly", bt_kelly)["sharpe"], 3))
    return res


if __name__ == "__main__":
    demo()
```

> 自检（合成数据）：年化 5.4%，年化波动 15.0%，夏普 0.43，最大回撤 -31.2%，年换手 0.6x。

### 4.14 加密基差：资金费率套利

**原理。** 永续合约通过资金费率锚定现货。资金费率为正时，多头向空头支付费用；做多现货、做空永续，可以赚取资金费，同时几乎不对价格方向暴露。

**数学。** `carry = funding - Δbasis - 成本`，其中 `basis = (Perp - Spot)/Spot`。

**实现要点。**
- 这是“低波动、尾部风险大”的策略：交易所对手方、提币限制、保证金、脱锚。
- 资金费率转负时收益消失甚至倒亏；需要动态调整。
- 真实年化收益随市场情绪波动极大，不能线性外推。

**风险。** 交易所风险、basis 突然走阔、监管变化；示例是合成数据，不代表真实收益。

```python
# -*- coding: utf-8 -*-
"""14 加密基差 / 资金费率（Cash-and-Carry Basis）

原理
----
永续合约通过资金费率（funding）锚定现货。当资金费率为正，多头向空头
支付费用。做多现货、做空永续，可以赚取资金费，同时几乎不对价格方向
暴露。收益主要来自：
    carry = funding - Δbasis - 交易/资金成本
其中 basis = (Perp - Spot) / Spot。

风险
----
交易所对手方风险、提币限制、保证金与强平、basis 突然走阔、
资金费率转负、监管变化。这是“低波动、尾部风险大”的典型策略。
"""
from __future__ import annotations

import numpy as np
import pandas as pd


def simulate(n_days: int = 730, seed: int = 11) -> dict:
    rng = np.random.default_rng(seed)
    spot_ret = rng.normal(0.0004, 0.035, n_days)
    spot = 30000.0 * np.exp(np.cumsum(spot_ret))

    basis = np.zeros(n_days)
    funding = np.zeros(n_days)
    for t in range(1, n_days):
        basis[t] = 0.95 * basis[t - 1] + rng.normal(0.0, 0.0008)
        funding[t] = float(np.clip(0.00008 + 0.3 * basis[t - 1]
                                   + rng.normal(0.0, 0.00008), -0.0002, 0.0008))

    basis_change = np.diff(basis, prepend=basis[0])
    carry = pd.Series(funding - basis_change - 0.00003)   # 每日再平衡成本

    ann = float((1.0 + carry).prod() ** (365 / len(carry)) - 1.0)
    vol = float(carry.std() * np.sqrt(365))
    sharpe = float(carry.mean() / carry.std() * np.sqrt(365)) if carry.std() > 0 else 0.0
    eq = (1.0 + carry).cumprod()
    mdd = float((eq / eq.cummax() - 1.0).min())

    return dict(name="加密基差 / 资金费率", type="回测", ann_ret=ann,
                ann_vol=vol, sharpe=sharpe, max_dd=mdd, turnover=0.0,
                note=f"日均资金费 {funding.mean()*1e4:.2f}bp，日均 carry {carry.mean()*1e4:.2f}bp")


def demo(verbose: bool = True) -> dict:
    res = simulate()
    if verbose:
        print(res)
    return res


if __name__ == "__main__":
    demo()
```

> 自检（合成数据）：年化 5.5%，年化波动 1.9%，夏普 2.90，最大回撤 -2.1%，年换手 0.0x。

### 4.15 元标记：用二级模型过滤一级信号

**原理。** López de Prado 提出的二级模型框架：一级模型决定方向，二级模型预测“这个方向有多大概率正确”，只在概率足够高时下注，并据此调整仓位。它把“预测收益”拆成“方向 + 置信度”。

**数学。** `side = sign(momentum)`；标签 `1{side × forward_return > 0}`；逻辑回归输出 `p`；仓位 `side × max(0, 2p - 1)`。

**实现要点。**
- 二级模型的特征应与一级模型不同：波动率、趋势强度、截面离散度、流动性。
- 概率要校准，否则阈值没有意义。
- 若一级模型本身没有边际，二级模型只是在拟合噪声。

**风险。** 过拟合、样本不平衡、概率校准误差；示例中二级模型把夏普从 0.24 提升到 0.36，但增益有限，且对阈值和样本切分敏感。

```python
# -*- coding: utf-8 -*-
"""15 元标记（Meta-labeling）

原理
----
López de Prado 提出的二级模型框架：
  一级模型决定“方向”（做多还是做空）；
  二级模型预测“这个方向有多大概率正确”，只在概率足够高时下注，
  并据此调整仓位。它把“预测收益”拆成“方向 + 置信度”，
  能显著提高精确率、降低回撤。

流程
----
    1) primary side = sign(momentum_20)
    2) 特征 = |momentum|, vol, trend, 截面离散度
    3) 标签 = 1{side * forward_return > 0}
    4) 逻辑回归输出 p，仓位 = side * max(0, 2p - 1)

风险
----
二级模型同样会过拟合；样本不平衡；概率校准误差；
若一级模型本身没有边际，二级模型只是在拟合噪声。
"""
from __future__ import annotations

import numpy as np
import pandas as pd

from .common import (backtest, returns_of, summarize, synthetic_prices)


def build_events(prices: pd.DataFrame, horizon: int = 5) -> pd.DataFrame:
    ret = returns_of(prices)
    mom = prices.pct_change(60, fill_method=None)
    vol = ret.rolling(20).std()
    trend = prices / prices.rolling(120).mean() - 1.0
    fwd = prices.shift(-horizon) / prices - 1.0

    rows = []
    for t in range(120, len(prices) - horizon, 5):
        disp = float(mom.iloc[t].std())
        for i, col in enumerate(prices.columns):
            m, v, tr, f = mom.iloc[t, i], vol.iloc[t, i], trend.iloc[t, i], fwd.iloc[t, i]
            if not np.isfinite([m, v, tr, f]).all():
                continue
            side = 1.0 if m > 0 else -1.0
            rows.append(dict(date=prices.index[t], asset=col, side=side,
                             mom=float(m), vol=float(v), trend=float(tr),
                             disp=disp, fwd=float(f),
                             label=int(side * f > 0)))
    return pd.DataFrame(rows)


def fit_logit(X: np.ndarray, y: np.ndarray, lr: float = 0.2,
              epochs: int = 1500, l2: float = 1e-3):
    mu, sd = X.mean(axis=0), X.std(axis=0) + 1e-9
    Xs = (X - mu) / sd
    w, b = np.zeros(X.shape[1]), 0.0
    for _ in range(epochs):
        p = 1.0 / (1.0 + np.exp(-np.clip(Xs @ w + b, -30, 30)))
        w -= lr * (Xs.T @ (p - y) / len(y) + l2 * w)
        b -= lr * float(np.mean(p - y))
    return w, b, mu, sd


def predict_logit(model, X: np.ndarray) -> np.ndarray:
    w, b, mu, sd = model
    z = ((X - mu) / sd) @ w + b
    return 1.0 / (1.0 + np.exp(-np.clip(z, -30, 30)))


def event_weights(prices: pd.DataFrame, events: pd.DataFrame,
                  use_meta: bool, horizon: int = 5) -> pd.DataFrame:
    """事件日建仓，持有 horizon 个交易日。"""
    w = pd.DataFrame(0.0, index=prices.index, columns=prices.columns)
    index = prices.index
    for _, row in events.iterrows():
        if use_meta:
            p = float(row["p"])
            if p <= 0.52:
                continue
            size = row["side"] * (2.0 * p - 1.0)
        else:
            size = row["side"]

        pos = index.get_loc(row["date"])
        col = w.columns.get_loc(row["asset"])
        for k in range(horizon):
            if pos + k < len(index):
                # 每个信号只分配 1/N 的资金，避免少数标的事件把仓位打满
                w.iloc[pos + k, col] += size / len(prices.columns)

    gross = w.abs().sum(axis=1)
    scale = gross.clip(upper=1.0) / gross.replace(0.0, np.nan)
    return w.mul(scale.fillna(1.0), axis=0).fillna(0.0)


def demo(verbose: bool = True) -> dict:
    prices = synthetic_prices()
    rets = returns_of(prices)
    events = build_events(prices)

    split = int(len(events) * 0.5)
    train, test = events.iloc[:split], events.iloc[split:].copy()

    Xtr = train[["mom", "vol", "trend", "disp"]].values
    ytr = train["label"].values.astype(float)
    model = fit_logit(Xtr, ytr)
    test["p"] = predict_logit(model, test[["mom", "vol", "trend", "disp"]].values)

    w_base = event_weights(prices, test.drop(columns="p"), use_meta=False)
    w_meta = event_weights(prices, test, use_meta=True)

    base = backtest(rets, w_base, cost_bps=5.0)
    meta = backtest(rets, w_meta, cost_bps=5.0)
    base_sharpe = summarize("primary", base)["sharpe"]
    res = summarize("元标记（Meta-labeling）", meta,
                    note=f"二级逻辑回归，阈值 0.52；一级夏普 {base_sharpe:.2f}")
    if verbose:
        print(res)
        print("一级模型夏普:", round(base_sharpe, 3))
        print("二级模型触发比例:", round(float((test["p"] > 0.52).mean()), 3))
    return res


if __name__ == "__main__":
    demo()
```

> 自检（合成数据）：年化 0.1%，年化波动 0.4%，夏普 0.36，最大回撤 -1.3%，年换手 0.4x。

---

## 5. 代码库与复现

### 5.1 目录结构

```
global-ai-trading-top100/
├── data/
│   └── top100.py              # 100 条榜单数据
├── strategies/
│   ├── common.py              # 合成数据、回测、指标
│   ├── s01_pairs.py           # 配对交易
│   ├── ...
│   └── s15_meta_labeling.py   # 元标记
├── content/
│   └── report_template.md     # 本报告模板
├── output/                    # 生成的报告、图表、结果
├── build_report.py            # 生成 DOCX / XLSX / Markdown
├── run_all.py                 # 运行全部策略自检
└── README.md
```

### 5.2 运行方式

```bash
# 1. 安装依赖（仅 numpy、pandas；生成文档另需 python-docx、openpyxl）
pip install numpy pandas python-docx openpyxl

# 2. 运行全部策略自检
python run_all.py

# 3. 生成报告与榜单表格
python build_report.py
```

所有策略模块也可以单独运行：

```bash
python -m strategies.s01_pairs
```

### 5.3 合成数据说明

`strategies/common.py` 中的 `synthetic_prices()` 生成一个包含以下结构的面板：

- 市场因子（带波动率 regime）；
- 行业因子；
- 弱趋势（制造动量）；
- 个股 OU 定价误差（制造均值回归）；
- 一组精确协整的资产对 A0/A1；
- 一阶短期反转成分。

这样设计的目的，是让不同策略都能在同一个面板上展示“信号—仓位—成本—净值”的完整管线。**它不是对真实市场的模拟，所有指标只用于代码自检，不能用来推断策略的真实收益。**

### 5.4 结果汇总

**回测类模块（合成数据，含 2–5 bp 交易成本）：**

| 模块 | 策略 | 年化收益 | 年化波动 | 夏普 | 最大回撤 | 年换手 | 备注 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| s01_pairs | 配对交易（协整） | 9.4% | 5.1% | 1.77 | -4.7% | 12.9x | A1/A0，beta=1.01，半衰期 8.1 日 |
| s02_xsec_momentum | 横截面动量 12-1 | 9.9% | 8.1% | 1.21 | -12.7% | 7.3x | 周频调仓，波动率缩放 |
| s03_tsmom | 时序动量 TSMOM | 3.3% | 9.3% | 0.40 | -18.9% | 6.1x | 12 个月方向 + 10% 波动率目标 |
| s04_mean_reversion | 短期均值回归（OU） | 0.4% | 16.6% | 0.11 | -44.4% | 264.1x | 10 日 z-score，日频调仓 |
| s05_factor_model | 多因子打分模型 | 6.6% | 8.2% | 0.82 | -13.6% | 30.2x | IC=0.070, IR=1.31 |
| s06_pca_statarb | PCA 残差反转 | 5.9% | 6.9% | 0.87 | -9.3% | 327.7x | 3 因子，20 日残差 z-score，日频 |
| s09_news_sentiment | 新闻情绪 NLP | 5.7% | 5.4% | 1.05 | -5.8% | 0.0x | 词典法：正面示例 0.67，负面示例 -0.67 |
| s11_gbdt_alpha | GBDT 选股 | 6.0% | 7.3% | 0.83 | -8.6% | 25.8x | 树桩 GBDT，5 日标签，120 日重训 |
| s13_risk_parity_kelly | 风险平价 + 分数凯利 | 5.4% | 15.0% | 0.43 | -31.2% | 0.6x | 月度调仓；凯利用 0.35 倍 |
| s14_crypto_basis | 加密基差 / 资金费率 | 5.5% | 1.9% | 2.90 | -2.1% | 0.0x | 日均资金费 1.87bp，日均 carry 1.48bp |
| s15_meta_labeling | 元标记（Meta-labeling） | 0.1% | 0.4% | 0.36 | -1.3% | 0.4x | 二级逻辑回归，阈值 0.52；一级夏普 0.24 |

**仿真类模块（机制验证，非历史回测）：**

| 模块 | 策略 | 关键结果 | 说明 |
| --- | --- | --- | --- |
| s07_market_making | 做市 A-S vs 固定价差 | 1.49 | A-S 均值 1.49（库存 RMS 已计入）；固定价差均值 1.60 |
| s08_orderbook_imbalance | 订单簿不平衡 OFI | t=33.4 | 逐笔 t 值 33.4，OFI 预测 R²=0.0478 |
| s10_vol_arb | 期权波动率套利 | 0.38 | 卖出 IV=21% 跨式，均值 PnL=0.38 美元/张 |
| s12_rl_execution | RL 执行（Q-learning） | 358bp | Q 策略 IS=358.44bp vs TWAP=196.90bp（越低成本；一次性卖出约 1200bp） |

从结果可以看到几个符合直觉的现象：

- 配对交易、横截面动量、GBDT、PCA 残差在合成数据上有正收益，因为这些数据里确实植入了协整、动量和残差反转结构。
- 短期均值回归收益很薄，因为价格层面的随机游走淹没了 OU 成分，交易成本进一步侵蚀收益。
- RL 执行优于“一次性卖出”，但不如 TWAP，说明表格 Q-learning 的样本效率不足。
- 元标记略有增益（夏普从 0.24 提升到 0.36），但幅度有限，说明二级模型只有在真正提供增量信息时才有用。

需要特别说明：**s04 与 s06 的年换手超过 200x**，这是日频残差策略的典型特征。实盘中应通过组合层平滑、最小持有期、批量下单把换手降到 20–50x，否则交易成本会吞掉大部分 alpha。表中的净收益已经扣除了 2–5 bp 的换手成本，但仍未计入冲击成本与容量约束。

**这些结果不是策略有效性的证据，而是代码正确性的证据。**

---

## 6. 从回测到实盘：七个致命细节

**第一，前视偏差（lookahead bias）。** 用了收盘后才能获得的数据、用了未来才知道的成分股、用了重述后的财报，都会让回测虚高。解决办法：严格按发布时间对齐，使用 point-in-time 数据。

**第二，幸存者偏差。** 只回测今天还活着的股票/基金，会高估收益。解决办法：使用包含退市、并购、破产样本的数据库。

**第三，成本模型。** 只算佣金不算冲击，是回测最常见的自欺。真实成本包括买卖价差、市场冲击、机会成本、融券费、资金费。高频策略的成本可能占收益的 50% 以上。

**第四，容量与拥挤。** 一个策略的夏普会随资金规模上升而下降；当太多人做同一件事时，alpha 会消失，甚至反向。解决办法：监控策略拥挤度、限制规模、寻找替代信号。

**第五，过拟合与多重检验。** 试了 1000 个参数，最好的那个大概率是噪声。解决办法：用 deflated Sharpe ratio、purged cross-validation、样本外测试、纸面交易。

**第六，制度变化与非平稳。** 交易规则、利率环境、散户结构、监管政策都会变。解决办法：滚动重训、 regime detection、压力测试、保持策略多样性。

**第七，执行与运维。** 回测赚钱、实盘亏钱，很多时候是执行和运维问题：订单被拒、行情断线、仓位对账错误、风控失效。解决办法：kill switch、实时监控、每日对账、灾备。

---

## 7. 风险、合规与伦理

**市场风险。** 杠杆、流动性、相关性趋同、尾部事件。任何策略都可能在某一天失效。

**模型风险。** 过拟合、数据漂移、黑箱不可解释、模型之间的相关性。AI 模型尤其需要可解释性与人工复核。

**操作风险。** 系统故障、网络延迟、人为误操作、供应商风险。高频交易对运维的要求接近航空航天。

**合规风险。** 算法交易报备、异常交易监控、市场操纵边界、信息披露。不同司法辖区的规则差异很大，跨境策略需要法律评估。

**伦理风险。** MEV 中的抢跑与三明治攻击、新闻情绪对市场情绪的放大、LLM 生成虚假信息。技术能力越强，越需要边界感。

---

## 8. 延伸阅读

**书籍与论文：**

- López de Prado, *Advances in Financial Machine Learning*（2018）
- Grinold & Kahn, *Active Portfolio Management*（2000）
- Ernest Chan, *Algorithmic Trading: Winning Strategies and Their Rationale*（2013）
- Euan Sinclair, *Volatility Trading*（2013）
- Robert Carver, *Systematic Trading*（2015）
- Almgren & Chriss, *Optimal Execution of Portfolio Transactions*（2000）
- Avellaneda & Stoikov, *High-frequency Trading in a Limit Order Book*（2008）
- Cont, Kukanov & Stoikov, *The Price Impact of Order Book Events*（2014）
- Jegadeesh & Titman, *Returns to Buying Winners and Selling Losers*（1993）
- Moskowitz, Ooi & Pedersen, *Time Series Momentum*（2012）
- Gatev, Goetzmann & Rouwenhorst, *Pairs Trading: Performance of a Relative-Value Arbitrage Rule*（2006）
- Gu, Kelly & Xiu, *Empirical Asset Pricing via Machine Learning*（2020）

**在线资源：**

- Renaissance Technologies: https://www.rentec.com/
- D.E. Shaw Group: https://www.deshaw.com/
- Two Sigma: https://www.twosigma.com/
- AQR: https://www.aqr.com/
- Man Group: https://www.man.com/
- WorldQuant: https://www.worldquant.com/
- Numerai: https://numer.ai/
- QuantConnect: https://www.quantconnect.com/
- FinRL: https://github.com/AI4Finance-Foundation/FinRL
- TradingAgents: https://github.com/TauricResearch/TradingAgents
- DeepSeek: https://www.deepseek.com/
- arXiv q-fin: https://arxiv.org/archive/q-fin

---

## 附录 A：指标定义

- **年化收益**：`(1 + 日收益).prod()^(252/N) - 1`。
- **年化波动**：日收益标准差 × √252。
- **夏普比率**：日收益均值 / 日收益标准差 × √252（未扣无风险利率）。
- **最大回撤**：净值曲线从峰值到谷底的最大跌幅。
- **换手率**：日权重变化绝对值之和的年化值。
- **IC**：因子分数与未来收益的截面相关系数。
- **IR**：IC 均值 / IC 标准差 × √(年化期数)。
- **IS（implementation shortfall）**：到达价格与执行均价之差，单位为基点。

## 附录 B：使用与许可

本报告的代码用于教学与研究，采用 MIT 许可证；文字内容采用 CC BY-NC 4.0。转载、改编请注明来源。报告中提及的机构、人物、策略仅为研究讨论，不构成任何投资建议或背书。

---

*报告完。*

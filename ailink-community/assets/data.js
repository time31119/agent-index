/* AILink 智链 · 数据集
 * 杭州 42 家、深圳 42 家企业来自公开资料图谱（assets/hangzhou-ai.js、assets/shenzhen-ai.js，无电话/邮箱）；
 * 其余企业、机构、人物为虚构演示数据；虚构记录邮箱使用 example.com 保留域名，
 * 电话为不可路由的占位号码。接入授权数据源后由 ingestion 流程替换。
 */
(function () {
  'use strict';

  var CITY_META = {
    '杭州': { province: '浙江', region: '华东', area: '0571' },
    '上海': { province: '上海', region: '华东', area: '021' },
    '南京': { province: '江苏', region: '华东', area: '025' },
    '苏州': { province: '江苏', region: '华东', area: '0512' },
    '合肥': { province: '安徽', region: '华东', area: '0551' },
    '深圳': { province: '广东', region: '华南', area: '0755' },
    '广州': { province: '广东', region: '华南', area: '020' },
    '东莞': { province: '广东', region: '华南', area: '0769' },
    '珠海': { province: '广东', region: '华南', area: '0756' },
    '厦门': { province: '福建', region: '华南', area: '0592' },
    '福州': { province: '福建', region: '华南', area: '0591' },
    '北京': { province: '北京', region: '华北', area: '010' },
    '成都': { province: '四川', region: '西南', area: '028' },
    '武汉': { province: '湖北', region: '华中', area: '027' },
    '西安': { province: '陕西', region: '西北', area: '029' }
  };

  var PALETTE = [
    ['#0F5B45', '#DDF3B0'],
    ['#1B3A57', '#CFE6F5'],
    ['#5A2E1F', '#F4D6B8'],
    ['#3C2A5A', '#E2D5F5'],
    ['#254A2A', '#D7EBC8'],
    ['#5B3A0E', '#F5E3B3'],
    ['#123C3C', '#CDEDE6'],
    ['#4A1F2E', '#F3CFD9']
  ];

  var PROJECT_SOURCES = [
    '工商信息 + 官网核对',
    '园区名录 + 融资事件',
    '企业官网 + 专利检索',
    '会员推荐 + 公开报道',
    '融资事件库 + 人工核验'
  ];

  var PROJECT_SEEDS = [
    { name: '云枢智能', city: '杭州', sector: '大模型与 Agent', stage: 'A轮', founded: 2021, team: 86, funding: '1.2 亿元', desc: '面向金融与零售的企业级 Agent 编排平台，把业务流程拆成可观测、可回滚的智能体工作流。', highlights: ['服务 40+ 头部客户', '自研评测与回滚体系', '客单价 80 万起'], contactName: '周砚', contactTitle: '创始人 & CEO' },
    { name: '见山科技', city: '杭州', sector: 'AI Infra', stage: 'Pre-A', founded: 2022, team: 54, funding: '6,000 万元', desc: '异构算力调度与推理加速层，帮助中型企业把大模型推理成本降低 40% 以上。', highlights: ['兼容 6 类国产卡', '推理延迟降低 52%', '已签 12 家云服务商'], contactName: '林澈', contactTitle: '联合创始人 & CTO' },
    { name: '星穹具身', city: '杭州', sector: '具身智能', stage: 'A轮', founded: 2023, team: 112, funding: '2.5 亿元', desc: '通用人形机器人本体与操作模型，聚焦 3C 装配与实验室场景的柔性操作。', highlights: ['自研 28 自由度本体', '操作数据闭环', '2026 年小批量交付'], contactName: '顾行', contactTitle: '创始人 & CEO' },
    { name: '澄芯微电子', city: '杭州', sector: 'AI 芯片', stage: 'B轮', founded: 2019, team: 160, funding: '4 亿元', desc: '存算一体边缘推理芯片，面向智能摄像头、机器人与工业终端。', highlights: ['能效比 8 TOPS/W', '已流片两颗', '进入头部安防供应链'], contactName: '沈拓', contactTitle: '董事长 & CEO' },
    { name: '数织科技', city: '杭州', sector: '数据智能', stage: 'A轮', founded: 2021, team: 70, funding: '8,000 万元', desc: '多模态数据治理与合成数据平台，为模型团队提供可追溯的高质量数据生产线。', highlights: ['日处理 2PB 多模态数据', '合成数据合规审计', '客户续费率 91%'], contactName: '唐禾', contactTitle: '创始人 & CEO' },
    { name: '灵犀智造', city: '杭州', sector: '工业视觉', stage: 'B轮', founded: 2018, team: 210, funding: '3 亿元', desc: '工业缺陷检测大模型与软硬一体质检方案，覆盖汽车零部件与精密制造。', highlights: ['落地 300+ 产线', '小样本冷启动', '误检率低于 0.3%'], contactName: '罗铮', contactTitle: '创始人 & 董事长' },
    { name: '墨影 AIGC', city: '杭州', sector: 'AIGC', stage: '天使轮', founded: 2024, team: 28, funding: '3,000 万元', desc: '品牌营销视频生成与数字人分身，主打 48 小时完成一条品牌 TVC。', highlights: ['自研视频一致性模型', '签约 20 个新消费品牌', '团队来自头部内容平台'], contactName: '苏晚', contactTitle: '创始人 & CEO' },
    { name: '知微医疗', city: '杭州', sector: 'AI+医疗', stage: 'A轮', founded: 2020, team: 95, funding: '1.5 亿元', desc: '病理切片辅助诊断系统，覆盖胃癌、肺癌等 9 类高发病种的早筛。', highlights: ['三类证注册中', '覆盖 120 家医院', '敏感度 96.4%'], contactName: '叶青', contactTitle: '创始人 & 首席科学家' },
    { name: '青岚算法', city: '杭州', sector: '企业服务', stage: 'Pre-A', founded: 2022, team: 46, funding: '5,000 万元', desc: '合同智能审查与法律 Agent，把企业法务的重复审阅工作压缩到分钟级。', highlights: ['审查准确率 94%', '接入 30 家企业法务', '支持私有化部署'], contactName: '何川', contactTitle: '创始人 & CEO' },
    { name: '元一智联', city: '杭州', sector: '智能驾驶', stage: 'B轮', founded: 2019, team: 180, funding: '3.5 亿元', desc: '舱驾一体的感知与域控方案，服务自主品牌与新势力车企。', highlights: ['定点 6 款车型', 'BEV 感知方案', '2025 年营收翻倍'], contactName: '邵远', contactTitle: '创始人 & CEO' },
    { name: '弦歌科技', city: '杭州', sector: 'AI Infra', stage: '天使轮', founded: 2023, team: 22, funding: '2,000 万元', desc: '向量数据库与 RAG 检索加速引擎，面向知识密集型企业做私有知识接入。', highlights: ['亿级向量毫秒检索', '开源社区 4k stars', '兼容主流模型'], contactName: '程歌', contactTitle: '创始人 & CTO' },
    { name: '麦芒智能', city: '杭州', sector: '大模型与 Agent', stage: 'A轮', founded: 2021, team: 64, funding: '9,000 万元', desc: '垂直农业大模型与种植决策系统，把农艺知识变成可执行的每日农事建议。', highlights: ['覆盖 18 万亩基地', '增产 12%', '与农科院联合建模'], contactName: '徐麦', contactTitle: '创始人 & CEO' },
    { name: '栖云数据', city: '杭州', sector: '数据智能', stage: 'B轮', founded: 2018, team: 150, funding: '2.8 亿元', desc: '实时湖仓与特征平台，服务金融风控、推荐与 AI 训练场景。', highlights: ['万级 QPS 实时特征', '金融客户 60+', '混合云交付'], contactName: '江栖', contactTitle: '创始人 & CEO' },
    { name: '光屿机器人', city: '杭州', sector: '具身智能', stage: 'Pre-A', founded: 2022, team: 78, funding: '7,000 万元', desc: '仓储复合机器人，用视觉与移动操作完成拆零拣选，替代高强度人工。', highlights: ['单仓日均 1.2 万件', '回本周期 18 个月', '已进入跨境电商仓'], contactName: '韩屿', contactTitle: '创始人 & CEO' },

    { name: '深瞳智算', city: '深圳', sector: 'AI Infra', stage: 'A轮', founded: 2021, team: 130, funding: '2 亿元', desc: '智算中心运营与 GPU 云服务，为华南 AI 团队提供弹性训练与推理算力。', highlights: ['运营 3 个智算中心', 'GPU 利用率 78%', '支持国产卡混合调度'], contactName: '梁深', contactTitle: '创始人 & CEO' },
    { name: '潮生科技', city: '深圳', sector: '大模型与 Agent', stage: 'B轮', founded: 2020, team: 220, funding: '5 亿元', desc: '多模态大模型 API 与行业微调服务，主打视频理解与实时交互。', highlights: ['日均调用 8 亿次', '视频理解评测第一梯队', '出海客户占比 35%'], contactName: '陈潮', contactTitle: '创始人 & CEO' },
    { name: '行者机器人', city: '深圳', sector: '具身智能', stage: 'A轮', founded: 2022, team: 140, funding: '1.8 亿元', desc: '人形机器人关节模组与运动控制方案，向整机厂提供高扭矩密度执行器。', highlights: ['关节扭矩密度行业领先', '年产 5 万套', '客户覆盖 20 家整机厂'], contactName: '彭行', contactTitle: '创始人 & CEO' },
    { name: '芯桥半导体', city: '深圳', sector: 'AI 芯片', stage: 'C轮', founded: 2017, team: 320, funding: '8 亿元', desc: '数据中心 DPU 与 AI 加速卡，围绕云原生场景做网络、存储与推理卸载。', highlights: ['三代产品量产', '进入头部云厂商', '研发占比 62%'], contactName: '邹桥', contactTitle: '董事长 & CEO' },
    { name: '南屿医疗', city: '深圳', sector: 'AI+医疗', stage: 'A轮', founded: 2021, team: 88, funding: '1.2 亿元', desc: '医学影像大模型，覆盖胸部 CT、乳腺超声与骨龄评估。', highlights: ['合作医院 200+', '海外 CE 认证', '单月阅片 30 万例'], contactName: '白南', contactTitle: '创始人 & CEO' },
    { name: '声临科技', city: '深圳', sector: 'AIGC', stage: 'Pre-A', founded: 2022, team: 52, funding: '6,000 万元', desc: '实时语音克隆与情感配音，为短剧、游戏与出海内容提供多语种声音。', highlights: ['延迟低于 80ms', '支持 32 种语言', '版权声纹库'], contactName: '郑声', contactTitle: '创始人 & CEO' },
    { name: '矩阵工场', city: '深圳', sector: '工业视觉', stage: 'A轮', founded: 2020, team: 105, funding: '1 亿元', desc: '3D 视觉引导与机器人分拣，聚焦新能源电池与物流仓场景。', highlights: ['节拍 1,800 件/小时', '3D 识别准确率 99.2%', '部署 80 个站点'], contactName: '谢矩', contactTitle: '创始人 & CEO' },
    { name: '智途出行', city: '深圳', sector: '智能驾驶', stage: 'C轮', founded: 2018, team: 260, funding: '6 亿元', desc: 'L4 无人配送车与城市开放道路运营，已进入多个园区的常态化商业运营。', highlights: ['运营里程 800 万公里', '单城日均 6,000 单', '自建远程接管中心'], contactName: '高途', contactTitle: '创始人 & CEO' },
    { name: '云帆出海', city: '深圳', sector: '企业服务', stage: 'A轮', founded: 2021, team: 76, funding: '8,000 万元', desc: 'AI 出海营销与本地化平台，帮助中国品牌做多语种内容、投放与客服。', highlights: ['服务 500 个出海品牌', '覆盖 18 个国家', 'AI 素材生成'], contactName: '许帆', contactTitle: '创始人 & CEO' },
    { name: '极昼智能', city: '深圳', sector: 'AI Infra', stage: 'B轮', founded: 2019, team: 118, funding: '2.2 亿元', desc: '大模型推理网关与可观测性平台，解决多模型路由、成本与稳定性问题。', highlights: ['接入 40+ 模型', '推理成本下降 38%', '金融与客服场景'], contactName: '范昼', contactTitle: '创始人 & CTO' },
    { name: '森语科技', city: '深圳', sector: '大模型与 Agent', stage: '天使轮', founded: 2023, team: 24, funding: '2,500 万元', desc: '情感陪伴 AI 与角色引擎，面向年轻用户的长期记忆型对话产品。', highlights: ['次日留存 48%', '自研角色记忆', '月活 60 万'], contactName: '温森', contactTitle: '创始人 & CEO' },
    { name: '睿影半导体', city: '深圳', sector: 'AI 芯片', stage: 'B轮', founded: 2019, team: 190, funding: '3.6 亿元', desc: '端侧 NPU IP 与 Turnkey 方案，服务 AIoT、机器人与智能座舱。', highlights: ['IP 授权 30+ 客户', '支持 Transformer 加速', '车规认证中'], contactName: '杜睿', contactTitle: '创始人 & CEO' },
    { name: '链知科技', city: '深圳', sector: '数据智能', stage: 'A轮', founded: 2020, team: 92, funding: '1.1 亿元', desc: '产业知识图谱与智能投研，把非结构化公告、研报与产业链数据变成可查询的图谱。', highlights: ['覆盖 3,000 万实体', '券商客户 25 家', '图谱更新 T+1'], contactName: '袁链', contactTitle: '创始人 & CEO' },
    { name: '欧若拉机器人', city: '深圳', sector: '具身智能', stage: '战略投资', founded: 2021, team: 160, funding: '2 亿元', desc: '商用清洁与配送机器人，主打写字楼、医院与交通枢纽的无人化服务。', highlights: ['部署 1,200 台', '海外 12 个国家', '单机月收入 9,000 元'], contactName: '曾欧', contactTitle: '创始人 & CEO' },

    { name: '浦江智算', city: '上海', sector: 'AI Infra', stage: 'B轮', founded: 2019, team: 240, funding: '4.5 亿元', desc: '液冷智算集群与算力运营，面向大模型训练与科学计算提供高密度机房。', highlights: ['PUE 1.15', '运营 5 个集群', '与高校共建'], contactName: '陆浦', contactTitle: '创始人 & CEO' },
    { name: '海上算法', city: '上海', sector: '大模型与 Agent', stage: 'A轮', founded: 2021, team: 80, funding: '1.4 亿元', desc: '金融文档大模型，覆盖研报、招股书与合规材料的理解与生成。', highlights: ['准确率超通用模型 18%', '服务 30 家资管', '私有化交付'], contactName: '秦海', contactTitle: '创始人 & CEO' },
    { name: '微光医疗', city: '上海', sector: 'AI+医疗', stage: 'C轮', founded: 2017, team: 300, funding: '5.5 亿元', desc: '手术导航与术中 AI，服务骨科与神经外科的精准手术。', highlights: ['进入 500 家医院', '三类证 4 张', '术中实时分割'], contactName: '方微', contactTitle: '创始人 & CEO' },
    { name: '序章科技', city: '上海', sector: 'AIGC', stage: 'A轮', founded: 2020, team: 110, funding: '1.3 亿元', desc: '游戏资产生成引擎，从原画、模型到动作资产做工业化生产。', highlights: ['美术产能提升 5 倍', '服务 40 家游戏公司', '自研 3D 生成'], contactName: '简序', contactTitle: '创始人 & CEO' },
    { name: '合流数据', city: '上海', sector: '数据智能', stage: 'B轮', founded: 2018, team: 170, funding: '3 亿元', desc: '隐私计算与数据要素流通平台，帮助金融机构在不出域的前提下联合建模。', highlights: ['通过信通院评测', '联合建模 200+ 场景', '参与行业标准'], contactName: '卢合', contactTitle: '创始人 & CEO' },
    { name: '木马出行', city: '上海', sector: '智能驾驶', stage: 'A轮', founded: 2022, team: 96, funding: '9,000 万元', desc: '低速无人车底盘与线控方案，面向园区、景区与末端配送。', highlights: ['底盘出货 3,000 台', '线控响应 80ms', '开放工具链'], contactName: '马木', contactTitle: '创始人 & CEO' },
    { name: '象限智能', city: '上海', sector: '工业视觉', stage: 'Pre-A', founded: 2022, team: 68, funding: '7,000 万元', desc: '半导体晶圆缺陷检测，聚焦先进封装与化合物半导体的纳米级缺陷。', highlights: ['检测精度 0.3μm', '头部晶圆厂验证', '光学+算法一体'], contactName: '章象', contactTitle: '创始人 & CEO' },

    { name: '岭南智造', city: '广州', sector: '工业视觉', stage: 'B轮', founded: 2018, team: 190, funding: '2.6 亿元', desc: '纺织服装 AI 质检与排产，把面料瑕疵检测和柔性供应链连成一套系统。', highlights: ['覆盖 200 家工厂', '验布速度 60 米/分', '与产业集群共建'], contactName: '何岭', contactTitle: '创始人 & CEO' },
    { name: '云山科技', city: '广州', sector: '企业服务', stage: 'A轮', founded: 2020, team: 120, funding: '1 亿元', desc: '跨境电商 AI 客服与选品，帮助卖家做多平台、多语种的运营自动化。', highlights: ['服务 2 万店铺', '客服成本下降 45%', 'GMV 预测'], contactName: '罗云', contactTitle: '创始人 & CEO' },
    { name: '珠江具身', city: '广州', sector: '具身智能', stage: 'Pre-A', founded: 2022, team: 60, funding: '5,000 万元', desc: '水下机器人本体与感知方案，服务海洋牧场、船舶检测与水利巡检。', highlights: ['下潜 300 米', '浑浊水域感知', '已交付 60 台'], contactName: '陈珠', contactTitle: '创始人 & CEO' },
    { name: '花城算法', city: '广州', sector: '大模型与 Agent', stage: '天使轮', founded: 2023, team: 30, funding: '2,000 万元', desc: '粤语与多语种多模态模型，面向大湾区政务、媒体与客服场景。', highlights: ['粤语识别 96%', '方言数据 8 万小时', '政务试点'], contactName: '梁花', contactTitle: '创始人 & CEO' },
    { name: '穗芯科技', city: '广州', sector: 'AI 芯片', stage: 'A轮', founded: 2021, team: 84, funding: '1.2 亿元', desc: 'RISC-V AIoT 芯片，主打低功耗端侧视觉与语音推理。', highlights: ['功耗 120mW', '出货 500 万颗', 'RISC-V 生态'], contactName: '邓穗', contactTitle: '创始人 & CEO' },
    { name: '周记智能', city: '广州', sector: 'AI+医疗', stage: 'Pre-A', founded: 2022, team: 42, funding: '4,000 万元', desc: '基层医疗机构 AI 辅助诊疗与随访，覆盖慢病管理与处方审核。', highlights: ['接入 800 家基层机构', '处方拦截率 3.2%', '与医保平台对接'], contactName: '周穗', contactTitle: '创始人 & CEO' },

    { name: '金陵智算', city: '南京', sector: 'AI Infra', stage: 'A轮', founded: 2021, team: 72, funding: '8,000 万元', desc: '高校与科研院所的算力调度平台，把闲置 GPU 变成可计费的科研服务。', highlights: ['接入 12 所高校', '作业排队缩短 60%', '支持国产卡'], contactName: '蒋陵', contactTitle: '创始人 & CEO' },
    { name: '紫峰医疗', city: '南京', sector: 'AI+医疗', stage: 'Pre-A', founded: 2022, team: 48, funding: '4,500 万元', desc: '眼底筛查 AI 与糖尿病视网膜病变分级，落地社区与体检中心。', highlights: ['筛查 50 万人', '敏感度 95%', '轻量化设备'], contactName: '吴紫', contactTitle: '创始人 & CEO' },
    { name: '宁芯半导体', city: '南京', sector: 'AI 芯片', stage: '天使轮', founded: 2023, team: 26, funding: '3,000 万元', desc: '模拟存算一体芯片，面向可穿戴与边缘传感的超低功耗推理。', highlights: ['能效比 20 TOPS/W', '原型验证完成', '团队来自头部院所'], contactName: '魏宁', contactTitle: '创始人 & CEO' },

    { name: '姑苏视觉', city: '苏州', sector: '工业视觉', stage: 'B轮', founded: 2018, team: 170, funding: '2.4 亿元', desc: '光伏电池片 EL/PL 检测与整线质量追溯，服务头部组件厂。', highlights: ['检测 6,000 片/小时', '漏检率 0.05%', '海外产线交付'], contactName: '陆苏', contactTitle: '创始人 & CEO' },
    { name: '湖畔机器人', city: '苏州', sector: '具身智能', stage: 'A轮', founded: 2020, team: 130, funding: '1.5 亿元', desc: '协作机械臂与力控方案，聚焦汽车电子与医疗器械的柔性装配。', highlights: ['重复精度 0.02mm', '力控拖拽示教', '出口 20 个国家'], contactName: '沈湖', contactTitle: '创始人 & CEO' },

    { name: '鹭岛智能', city: '厦门', sector: '企业服务', stage: 'Pre-A', founded: 2022, team: 58, funding: '5,000 万元', desc: '跨境物流 AI 调度，做多式联运的路径优化与异常预警。', highlights: ['接入 40 家货代', '空驶率下降 18%', '东南亚网络'], contactName: '林鹭', contactTitle: '创始人 & CEO' },
    { name: '海丝数据', city: '厦门', sector: '数据智能', stage: 'A轮', founded: 2021, team: 76, funding: '9,000 万元', desc: '港口多模态数据平台，融合视频、雷达与船舶 AIS 做智能调度。', highlights: ['覆盖 8 个港口', '靠泊效率提升 12%', '与港务集团合作'], contactName: '黄海', contactTitle: '创始人 & CEO' },

    { name: '莞邑智造', city: '东莞', sector: '工业视觉', stage: 'A轮', founded: 2020, team: 110, funding: '1.1 亿元', desc: '3C 外观缺陷检测与智能复判，服务手机结构件与连接器工厂。', highlights: ['检测 120 种缺陷', '误判率 0.2%', '部署 150 条产线'], contactName: '谭莞', contactTitle: '创始人 & CEO' }
  ];

  var CAPITAL_SEEDS = [
    { name: '北辰创投', type: '早期 VC', city: '北京', focus: ['大模型与 Agent', 'AI Infra', '企业服务'], stages: ['天使轮', 'Pre-A'], ticket: '500–3,000 万元', aum: '30 亿元', desc: '专注技术型创始人的首轮机构，强调产品与场景验证，愿意在 0 到 1 阶段深度陪跑。', contactName: '韩松', contactTitle: '合伙人' },
    { name: '长河资本', type: '成长型 VC', city: '北京', focus: ['AI Infra', '数据智能', '企业服务'], stages: ['A轮', 'B轮'], ticket: '3,000 万–2 亿元', aum: '120 亿元', desc: '以产业数字化为主线，关注有真实收入与交付壁垒的 AI 基础设施与行业软件。', contactName: '宋澜', contactTitle: '管理合伙人' },
    { name: '灰度基金', type: 'PE', city: '北京', focus: ['AI 芯片', '智能驾驶'], stages: ['B轮', 'C轮'], ticket: '1–5 亿元', aum: '260 亿元', desc: '硬科技成长期基金，重点看半导体、智能驾驶与先进制造，单笔可领投。', contactName: '严冬', contactTitle: '投资合伙人' },
    { name: '星河产业资本', type: 'CVC', city: '北京', focus: ['具身智能', '工业视觉', '智能驾驶'], stages: ['A轮', 'B轮', '战略投资'], ticket: '2,000 万–3 亿元', aum: '80 亿元', desc: '产业集团旗下 CVC，围绕智能制造与出行生态做战略投资和订单协同。', contactName: '顾星河', contactTitle: '总经理' },
    { name: '中科启航', type: '政府基金', city: '北京', focus: ['AI 芯片', 'AI Infra', '具身智能'], stages: ['天使轮', 'Pre-A', 'A轮'], ticket: '1,000–5,000 万元', aum: '50 亿元', desc: '面向中科院体系与硬科技团队的引导基金，强调落地与国产化替代。', contactName: '魏启', contactTitle: '投资总监' },
    { name: '原点天使', type: '天使投资人', city: '北京', focus: ['大模型与 Agent', 'AIGC'], stages: ['天使轮'], ticket: '100–1,000 万元', aum: '2 亿元', desc: '连续创业者转型天使，偏好有产品审美的 AI 应用团队，可提供早期招聘与增长支持。', contactName: '王原', contactTitle: '天使投资人' },
    { name: '知远资本', type: '早期 VC', city: '北京', focus: ['AI+医疗', '数据智能'], stages: ['天使轮', 'Pre-A'], ticket: '500–3,000 万元', aum: '18 亿元', desc: '医疗与数据交叉领域早期基金，重视临床价值与合规路径。', contactName: '叶知远', contactTitle: '创始合伙人' },
    { name: '雁栖资本', type: 'PE', city: '北京', focus: ['企业服务', 'AI Infra'], stages: ['B轮', 'C轮'], ticket: '5,000 万–3 亿元', aum: '150 亿元', desc: '成长期 PE，关注 AI 软件与算力服务的规模化收入与现金流。', contactName: '程雁', contactTitle: '董事总经理' },
    { name: '微光 FA', type: 'FA', city: '北京', focus: ['全赛道'], stages: ['天使轮', 'A轮', 'B轮'], ticket: '服务费 3%–5%', aum: '—', desc: '专注 AI 与硬科技融资顾问，提供 BP 打磨、数据包与投资人匹配。', contactName: '苏微', contactTitle: '创始合伙人' },

    { name: '东岸创投', type: '早期 VC', city: '上海', focus: ['大模型与 Agent', 'AIGC', '企业服务'], stages: ['天使轮', 'Pre-A', 'A轮'], ticket: '1,000–5,000 万元', aum: '25 亿元', desc: '相信应用层机会的早期基金，重视创始人对场景的理解与增长手感。', contactName: '陆东', contactTitle: '创始合伙人' },
    { name: '海上明月资本', type: '成长型 VC', city: '上海', focus: ['AI+医疗', '数据智能'], stages: ['A轮', 'B轮'], ticket: '3,000 万–2 亿元', aum: '90 亿元', desc: '医疗与数据要素方向的成长期基金，关注合规与商业化闭环。', contactName: '明悦', contactTitle: '管理合伙人' },
    { name: '科澜资本', type: '早期 VC', city: '上海', focus: ['AI 芯片', 'AI Infra'], stages: ['天使轮', 'Pre-A'], ticket: '500–3,000 万元', aum: '20 亿元', desc: '硬科技早期基金，团队有半导体产业背景，擅长技术尽调与供应链对接。', contactName: '蓝科', contactTitle: '合伙人' },
    { name: '云间资本', type: '成长型 VC', city: '上海', focus: ['企业服务', '工业视觉'], stages: ['A轮', 'B轮'], ticket: '2,000 万–1.5 亿元', aum: '60 亿元', desc: '产业软件与智能制造基金，关注可复制的行业解决方案。', contactName: '陈云间', contactTitle: '投资合伙人' },
    { name: '拾贝天使', type: '天使投资人', city: '上海', focus: ['AIGC', '大模型与 Agent'], stages: ['天使轮'], ticket: '100–800 万元', aum: '1.5 亿元', desc: '专注于内容与生产力工具的连续天使，常以联合投资方式进入。', contactName: '顾拾', contactTitle: '天使投资人' },
    { name: '申远并购基金', type: 'PE', city: '上海', focus: ['AI+医疗', '企业服务'], stages: ['C轮', '战略投资'], ticket: '1–10 亿元', aum: '300 亿元', desc: '并购与后期基金，关注有稳定利润的医疗信息化与行业软件资产。', contactName: '申远', contactTitle: '管理合伙人' },
    { name: '六合资本', type: '早期 VC', city: '上海', focus: ['具身智能', '智能驾驶'], stages: ['Pre-A', 'A轮'], ticket: '1,000–6,000 万元', aum: '22 亿元', desc: '智能硬件与自动驾驶早期基金，强调工程化与量产能力。', contactName: '何六合', contactTitle: '创始合伙人' },
    { name: '澄明资本', type: '成长型 VC', city: '上海', focus: ['AI Infra', '数据智能', 'AI 芯片'], stages: ['A轮', 'B轮'], ticket: '3,000 万–2 亿元', aum: '75 亿元', desc: '算力与数据基础设施基金，偏好有技术护城河和头部客户的团队。', contactName: '澄明', contactTitle: '合伙人' },

    { name: '南山潮汐', type: '早期 VC', city: '深圳', focus: ['具身智能', 'AI Infra'], stages: ['天使轮', 'Pre-A', 'A轮'], ticket: '500–4,000 万元', aum: '28 亿元', desc: '扎根深圳硬件生态的早期基金，擅长帮机器人团队找供应链和首批客户。', contactName: '潮生', contactTitle: '创始合伙人' },
    { name: '湾区智造资本', type: 'CVC', city: '深圳', focus: ['工业视觉', '具身智能', '智能驾驶'], stages: ['A轮', 'B轮', '战略投资'], ticket: '2,000 万–2 亿元', aum: '65 亿元', desc: '制造业集团 CVC，围绕工厂自动化与智能物流做战略投资。', contactName: '湾智', contactTitle: '投资总经理' },
    { name: '前海启元', type: '政府基金', city: '深圳', focus: ['AI 芯片', '大模型与 Agent', 'AI Infra'], stages: ['天使轮', 'Pre-A', 'A轮'], ticket: '1,000–5,000 万元', aum: '100 亿元', desc: '前海引导基金，支持硬科技与 AI 基础设施落地，提供产业空间与政策配套。', contactName: '启元', contactTitle: '投资总监' },
    { name: '深南成长', type: '成长型 VC', city: '深圳', focus: ['企业服务', '数据智能'], stages: ['A轮', 'B轮'], ticket: '3,000 万–2 亿元', aum: '85 亿元', desc: '关注企业服务与数据智能的成长期基金，重视续费率与销售效率。', contactName: '深南', contactTitle: '管理合伙人' },
    { name: '鹏城天使', type: '天使投资人', city: '深圳', focus: ['AIGC', '大模型与 Agent'], stages: ['天使轮'], ticket: '100–1,000 万元', aum: '3 亿元', desc: '互联网连续创业者，偏好 AI 原生应用与出海产品，可提供冷启动流量。', contactName: '罗鹏', contactTitle: '天使投资人' },
    { name: '木棉资本', type: '早期 VC', city: '深圳', focus: ['AI+医疗', 'AIGC'], stages: ['天使轮', 'Pre-A'], ticket: '500–3,000 万元', aum: '16 亿元', desc: '医疗与内容科技早期基金，关注技术带来的供给端效率提升。', contactName: '木棉', contactTitle: '合伙人' },
    { name: '海岸线 FA', type: 'FA', city: '深圳', focus: ['全赛道'], stages: ['A轮', 'B轮', 'C轮'], ticket: '服务费 3%–5%', aum: '—', desc: '华南 AI 与硬科技融资顾问，覆盖美元与人民币基金。', contactName: '陈岸', contactTitle: '管理合伙人' },

    { name: '西溪创投', type: '早期 VC', city: '杭州', focus: ['大模型与 Agent', '企业服务'], stages: ['天使轮', 'Pre-A', 'A轮'], ticket: '500–3,000 万元', aum: '18 亿元', desc: '杭州本地早期基金，深耕电商、金融与企业服务场景，投后偏重招聘与客户引荐。', contactName: '西溪', contactTitle: '创始合伙人' },
    { name: '钱塘资本', type: '成长型 VC', city: '杭州', focus: ['AI Infra', '数据智能'], stages: ['A轮', 'B轮'], ticket: '2,000 万–1.5 亿元', aum: '55 亿元', desc: '关注算力、数据与云原生的成长期基金，强调单位经济模型。', contactName: '钱塘', contactTitle: '管理合伙人' },
    { name: '云栖天使', type: '天使投资人', city: '杭州', focus: ['AIGC', 'AI+医疗'], stages: ['天使轮'], ticket: '100–800 万元', aum: '1 亿元', desc: '阿里系产品人转型天使，偏好有真实用户价值的 AI 产品。', contactName: '沈云', contactTitle: '天使投资人' },
    { name: '湖畔产业基金', type: '政府基金', city: '杭州', focus: ['具身智能', '工业视觉', 'AI 芯片'], stages: ['Pre-A', 'A轮', 'B轮'], ticket: '1,000–8,000 万元', aum: '40 亿元', desc: '地方产业基金，围绕城西科创大走廊做招商与投资联动。', contactName: '湖畔', contactTitle: '投资总监' },
    { name: '青山湖资本', type: '早期 VC', city: '杭州', focus: ['AI 芯片', 'AI Infra'], stages: ['天使轮', 'Pre-A'], ticket: '500–3,000 万元', aum: '12 亿元', desc: '硬科技早期基金，关注半导体与算力基础设施的国产替代。', contactName: '青山', contactTitle: '合伙人' },

    { name: '珠江创投', type: '早期 VC', city: '广州', focus: ['企业服务', 'AIGC', '数据智能'], stages: ['天使轮', 'Pre-A'], ticket: '500–3,000 万元', aum: '15 亿元', desc: '大湾区早期基金，关注跨境电商、内容与产业数字化。', contactName: '珠江', contactTitle: '创始合伙人' },
    { name: '花城天使', type: '天使投资人', city: '广州', focus: ['AI+医疗', '大模型与 Agent'], stages: ['天使轮'], ticket: '100–500 万元', aum: '0.8 亿元', desc: '医疗产业背景的个人天使，愿意与创始团队一起打磨首批医院客户。', contactName: '梁花', contactTitle: '天使投资人' },
    { name: '南粤产业基金', type: '政府基金', city: '广州', focus: ['智能驾驶', '工业视觉', '具身智能'], stages: ['A轮', 'B轮'], ticket: '3,000 万–2 亿元', aum: '120 亿元', desc: '省级产业基金，支持智能制造与智能网联汽车产业链。', contactName: '南粤', contactTitle: '投资总监' },

    { name: '金陵科创', type: '政府基金', city: '南京', focus: ['AI Infra', 'AI 芯片', 'AI+医疗'], stages: ['天使轮', 'Pre-A', 'A轮'], ticket: '500–3,000 万元', aum: '30 亿元', desc: '南京科创引导基金，关注高校成果转化与硬科技团队。', contactName: '金陵', contactTitle: '投资总监' },
    { name: '紫金资本', type: '成长型 VC', city: '南京', focus: ['企业服务', '数据智能'], stages: ['A轮', 'B轮'], ticket: '2,000 万–1 亿元', aum: '35 亿元', desc: '江苏本地成长期基金，关注软件与数据服务。', contactName: '紫金', contactTitle: '合伙人' },

    { name: '东吴成长', type: '成长型 VC', city: '苏州', focus: ['工业视觉', '具身智能'], stages: ['A轮', 'B轮'], ticket: '2,000 万–1.5 亿元', aum: '45 亿元', desc: '苏州制造业背景基金，擅长对接工厂场景与供应链。', contactName: '东吴', contactTitle: '管理合伙人' },

    { name: '锦城天使', type: '天使投资人', city: '成都', focus: ['AIGC', 'AI+医疗'], stages: ['天使轮'], ticket: '100–600 万元', aum: '0.5 亿元', desc: '成都本地个人天使，关注内容与医疗 AI 的早期团队。', contactName: '唐锦', contactTitle: '天使投资人' }
  ];

  var TALENT_SEEDS = [
    { name: '陈知远', role: '大模型算法', city: '杭州', years: 8, current: '云枢智能', education: '博士', availability: '看机会', expect: '120–150 万元', skills: ['RLHF', 'Agent', '多模态'], openTo: ['合伙人机会', '技术负责人'], desc: '主导过两个千亿参数模型的强化学习对齐，擅长把评测、数据与训练闭环搭起来。' },
    { name: '林见微', role: 'AI Infra', city: '杭州', years: 7, current: '见山科技', education: '硕士', availability: '开放沟通', expect: '90–120 万元', skills: ['CUDA', '推理优化', 'Kubernetes'], openTo: ['技术负责人', '核心工程师'], desc: '把推理集群的 GPU 利用率从 41% 提升到 76%，熟悉国产卡适配与调度。' },
    { name: '沈星野', role: '具身智能', city: '杭州', years: 6, current: '星穹具身', education: '博士', availability: '看机会', expect: '100–140 万元', skills: ['VLA', '运动控制', '强化学习'], openTo: ['合伙人机会', '算法负责人'], desc: '做过多模态操作策略与真机强化学习，关注从 demo 到量产的工程化。' },
    { name: '唐禾', role: 'AI 产品', city: '杭州', years: 6, current: '数织科技', education: '硕士', availability: '被动关注', expect: '70–90 万元', skills: ['数据产品', '企业服务', '0→1'], openTo: ['产品合伙人'], desc: '从 0 到 1 做过数据平台产品，擅长把模糊的客户需求变成可交付的版本。' },
    { name: '苏晚', role: 'AIGC', city: '杭州', years: 5, current: '墨影 AIGC', education: '本科', availability: '看机会', expect: '60–80 万元', skills: ['视频生成', '扩散模型', '商业化'], openTo: ['核心工程师', '产品负责人'], desc: '负责过品牌视频生成产品的模型选型与商业化打包，懂内容行业的工作流。' },
    { name: '叶青', role: '医疗 AI', city: '杭州', years: 9, current: '知微医疗', education: '博士', availability: '开放沟通', expect: '110–140 万元', skills: ['病理', '医学影像', '注册'], openTo: ['合伙人机会', '首席科学家'], desc: '有完整的三类证申报经验，熟悉医院数据治理与临床验证设计。' },
    { name: '何川', role: '大模型算法', city: '杭州', years: 5, current: '青岚算法', education: '硕士', availability: '看机会', expect: '80–100 万元', skills: ['RAG', '法律', '评测'], openTo: ['核心工程师'], desc: '深耕法律场景的检索增强与长文档理解，搭过一套可复用的行业评测集。' },
    { name: '罗铮', role: 'AI Infra', city: '杭州', years: 10, current: '灵犀智造', education: '硕士', availability: '被动关注', expect: '130–160 万元', skills: ['边缘推理', '模型压缩', '芯片'], openTo: ['技术合伙人'], desc: '软硬一体背景，做过端侧模型压缩与芯片适配，能带 30 人团队。' },
    { name: '江栖', role: '数据科学', city: '杭州', years: 8, current: '栖云数据', education: '博士', availability: '开放沟通', expect: '100–130 万元', skills: ['特征平台', '实时计算', '因果'], openTo: ['数据负责人'], desc: '长期做实时特征与因果推断，服务过金融风控与推荐两条业务线。' },
    { name: '徐麦', role: 'AI 产品', city: '杭州', years: 7, current: '麦芒智能', education: '硕士', availability: '看机会', expect: '75–95 万元', skills: ['农业', 'SaaS', '商业化'], openTo: ['产品合伙人'], desc: '懂农业场景与 SaaS 定价，带过从试点到 18 万亩的规模化落地。' },
    { name: '程歌', role: '大模型算法', city: '杭州', years: 4, current: '弦歌科技', education: '硕士', availability: '看机会', expect: '60–80 万元', skills: ['向量检索', 'RAG', '评测'], openTo: ['核心工程师'], desc: '做检索增强与向量索引，喜欢把系统性能压到极限。' },
    { name: '韩屿', role: '具身智能', city: '杭州', years: 6, current: '光屿机器人', education: '本科', availability: '开放沟通', expect: '80–110 万元', skills: ['SLAM', '导航', '仓储'], openTo: ['算法负责人'], desc: '仓储机器人导航与多机调度经验，做过 1,200 台设备的现场部署。' },

    { name: '梁深', role: 'AI Infra', city: '深圳', years: 9, current: '深瞳智算', education: '硕士', availability: '看机会', expect: '120–150 万元', skills: ['GPU 集群', '调度', '液冷'], openTo: ['技术合伙人'], desc: '从机房到调度平台全栈做过，管理过 3 个智算中心的建设和运营。' },
    { name: '陈潮', role: '大模型算法', city: '深圳', years: 10, current: '潮生科技', education: '博士', availability: '被动关注', expect: '150–200 万元', skills: ['多模态', '预训练', '团队管理'], openTo: ['合伙人机会', '首席科学家'], desc: '带过 60 人算法团队，主导多模态预训练与视频理解方向。' },
    { name: '彭行', role: '具身智能', city: '深圳', years: 7, current: '行者机器人', education: '博士', availability: '看机会', expect: '110–140 万元', skills: ['关节模组', '控制', '量产'], openTo: ['技术负责人', '合伙人机会'], desc: '做过关节模组的定义、控制与量产，熟悉供应链与可靠性验证。' },
    { name: '邹桥', role: 'AI 芯片', city: '深圳', years: 12, current: '芯桥半导体', education: '硕士', availability: '被动关注', expect: '160–200 万元', skills: ['DPU', '架构', '流片'], openTo: ['首席架构师'], desc: '主导过两颗数据中心芯片的架构与流片，熟悉云厂商需求。' },
    { name: '白南', role: '医疗 AI', city: '深圳', years: 8, current: '南屿医疗', education: '博士', availability: '开放沟通', expect: '100–130 万元', skills: ['影像', 'CE 认证', '临床'], openTo: ['合伙人机会'], desc: '医学影像算法与海外注册经验兼备，做过 200 家医院的商业化落地。' },
    { name: '郑声', role: 'AIGC', city: '深圳', years: 6, current: '声临科技', education: '硕士', availability: '看机会', expect: '70–90 万元', skills: ['语音克隆', 'TTS', '实时'], openTo: ['核心工程师'], desc: '实时语音合成与情感控制，做过 32 种语言的低延迟部署。' },
    { name: '谢矩', role: '工业视觉', city: '深圳', years: 9, current: '矩阵工场', education: '本科', availability: '开放沟通', expect: '90–120 万元', skills: ['3D 视觉', '机器人', '标定'], openTo: ['技术负责人'], desc: '3D 视觉引导与机器人分拣，长期驻厂做节拍与稳定性优化。' },
    { name: '高途', role: '智能驾驶', city: '深圳', years: 11, current: '智途出行', education: '硕士', availability: '被动关注', expect: '130–170 万元', skills: ['L4', '感知', '量产'], openTo: ['技术合伙人'], desc: 'L4 感知与量产交付经验，管理过 80 人跨城团队。' },
    { name: '许帆', role: '增长运营', city: '深圳', years: 7, current: '云帆出海', education: '本科', availability: '看机会', expect: '60–80 万元', skills: ['出海', '增长', '商业化'], openTo: ['增长合伙人'], desc: '从 0 到 500 个出海品牌的增长操盘，擅长内容与渠道组合。' },
    { name: '范昼', role: 'AI Infra', city: '深圳', years: 8, current: '极昼智能', education: '硕士', availability: '开放沟通', expect: '100–130 万元', skills: ['推理网关', '可观测', 'LLMOps'], openTo: ['技术负责人'], desc: '做多模型路由与推理可观测，帮客户把推理成本降了 38%。' },
    { name: '温森', role: '大模型算法', city: '深圳', years: 4, current: '森语科技', education: '硕士', availability: '看机会', expect: '60–85 万元', skills: ['角色扮演', '情感计算', '数据'], openTo: ['核心工程师'], desc: '专注角色一致性与长期记忆，做过分层记忆与情感对话数据。' },
    { name: '杜睿', role: 'AI 芯片', city: '深圳', years: 10, current: '睿影半导体', education: '博士', availability: '被动关注', expect: '140–180 万元', skills: ['NPU', '端侧', '编译器'], openTo: ['首席架构师'], desc: '端侧 NPU 架构与编译器协同设计，授权客户超过 30 家。' },

    { name: '陆浦', role: 'AI Infra', city: '上海', years: 9, current: '浦江智算', education: '硕士', availability: '开放沟通', expect: '110–140 万元', skills: ['液冷', '智算中心', '运维'], openTo: ['技术负责人'], desc: '液冷集群与高密度机房的设计和运营，PUE 做到 1.15。' },
    { name: '秦海', role: '大模型算法', city: '上海', years: 8, current: '海上算法', education: '博士', availability: '看机会', expect: '120–160 万元', skills: ['金融', '文档', '预训练'], openTo: ['合伙人机会'], desc: '金融长文档理解与生成，服务 30 家资管机构，熟悉私有化交付。' },
    { name: '方微', role: '医疗 AI', city: '上海', years: 12, current: '微光医疗', education: '博士', availability: '被动关注', expect: '150–190 万元', skills: ['手术导航', '临床', '注册'], openTo: ['首席科学家'], desc: '手术导航与术中影像，拿过 4 张三类证，熟悉医院与监管沟通。' },
    { name: '简序', role: 'AIGC', city: '上海', years: 6, current: '序章科技', education: '硕士', availability: '看机会', expect: '80–100 万元', skills: ['3D 生成', '游戏', '管线'], openTo: ['核心工程师'], desc: '游戏资产 3D 生成与工业化管线，能把模型能力接进美术生产。' },
    { name: '卢合', role: '数据科学', city: '上海', years: 9, current: '合流数据', education: '博士', availability: '开放沟通', expect: '100–130 万元', skills: ['隐私计算', '数据要素', '架构'], openTo: ['数据负责人'], desc: '隐私计算与联合建模，参与过行业标准与信通院评测。' },
    { name: '马木', role: '智能驾驶', city: '上海', years: 6, current: '木马出行', education: '硕士', availability: '看机会', expect: '80–100 万元', skills: ['底盘', '规划', '无人车'], openTo: ['核心工程师'], desc: '低速无人车底盘与规划控制，做过 3,000 台底盘的交付。' },
    { name: '章象', role: '工业视觉', city: '上海', years: 7, current: '象限智能', education: '博士', availability: '开放沟通', expect: '90–120 万元', skills: ['半导体', '缺陷检测', '小样本'], openTo: ['算法负责人'], desc: '半导体晶圆缺陷检测，熟悉光学系统与少样本算法。' },
    { name: '顾拾', role: 'AI 投资', city: '上海', years: 8, current: '拾贝天使', education: '硕士', availability: '开放沟通', expect: '80–120 万元', skills: ['投资', '生态', 'AIGC'], openTo: ['生态合伙人'], desc: '看过多个人工智能早期项目，擅长做投后生态与后续融资。' },

    { name: '何岭', role: '工业视觉', city: '广州', years: 10, current: '岭南智造', education: '本科', availability: '被动关注', expect: '100–130 万元', skills: ['纺织', '质检', '量产'], openTo: ['技术合伙人'], desc: '纺织面料质检与柔性供应链，落地 200 家工厂。' },
    { name: '罗云', role: 'AI 产品', city: '广州', years: 7, current: '云山科技', education: '硕士', availability: '看机会', expect: '70–90 万元', skills: ['跨境', '客服', '增长'], openTo: ['产品合伙人'], desc: '跨境电商 AI 产品，从客服自动化做到选品与投放。' },
    { name: '陈珠', role: '具身智能', city: '广州', years: 6, current: '珠江具身', education: '博士', availability: '开放沟通', expect: '90–120 万元', skills: ['水下机器人', '控制', '感知'], openTo: ['算法负责人'], desc: '水下机器人控制与浑浊水域感知，交付过 60 台整机。' },
    { name: '梁花', role: '大模型算法', city: '广州', years: 5, current: '花城算法', education: '硕士', availability: '看机会', expect: '70–95 万元', skills: ['粤语', '多模态', '数据'], openTo: ['核心工程师'], desc: '粤语多模态数据与模型，做过政务与媒体场景的落地。' },
    { name: '邓穗', role: 'AI 芯片', city: '广州', years: 8, current: '穗芯科技', education: '硕士', availability: '开放沟通', expect: '90–120 万元', skills: ['RISC-V', 'AIoT', '低功耗'], openTo: ['技术负责人'], desc: 'RISC-V AIoT 芯片与低功耗设计，产品出货 500 万颗。' },
    { name: '周穗', role: '医疗 AI', city: '广州', years: 7, current: '周记智能', education: '硕士', availability: '看机会', expect: '70–90 万元', skills: ['基层医疗', '慢病', '处方审核'], openTo: ['产品负责人'], desc: '基层医疗 AI 与医保对接，做过 800 家机构的落地与运营。' },

    { name: '林鹭', role: '增长运营', city: '厦门', years: 6, current: '鹭岛智能', education: '本科', availability: '看机会', expect: '50–70 万元', skills: ['跨境', '物流', 'SaaS'], openTo: ['增长负责人'], desc: '跨境物流 SaaS 的增长与客户成功，熟悉东南亚市场。' },
    { name: '黄海', role: '数据科学', city: '厦门', years: 8, current: '海丝数据', education: '硕士', availability: '开放沟通', expect: '80–100 万元', skills: ['港口', '多模态', '数据治理'], openTo: ['数据负责人'], desc: '港口多模态数据治理与调度优化，服务 8 个港口。' },

    { name: '蒋陵', role: 'AI Infra', city: '南京', years: 7, current: '金陵智算', education: '硕士', availability: '看机会', expect: '80–100 万元', skills: ['科研算力', '调度', '平台'], openTo: ['技术负责人'], desc: '高校算力平台与作业调度，接入过 12 所高校。' },
    { name: '吴紫', role: '医疗 AI', city: '南京', years: 6, current: '紫峰医疗', education: '博士', availability: '开放沟通', expect: '80–105 万元', skills: ['眼底', '筛查', '临床'], openTo: ['算法负责人'], desc: '眼底筛查与糖网分级，完成 50 万人次的真实世界筛查。' },
    { name: '魏宁', role: 'AI 芯片', city: '南京', years: 5, current: '宁芯半导体', education: '博士', availability: '看机会', expect: '85–110 万元', skills: ['存算', '模拟', '验证'], openTo: ['核心工程师'], desc: '模拟存算一体芯片设计与验证，原型能效比 20 TOPS/W。' },
    { name: '周叙', role: 'AI 产品', city: '南京', years: 8, current: '云山科技', education: '硕士', availability: '开放沟通', expect: '70–90 万元', skills: ['SaaS', '数据产品', '商业化'], openTo: ['产品合伙人'], desc: '企业服务产品与商业化，带过从 0 到 1 的 SaaS 产品线。' },

    { name: '陆苏', role: '工业视觉', city: '苏州', years: 9, current: '姑苏视觉', education: '本科', availability: '被动关注', expect: '90–110 万元', skills: ['光伏', '检测', '量产'], openTo: ['技术负责人'], desc: '光伏电池片检测与整线追溯，做过海外产线交付。' },
    { name: '沈湖', role: '具身智能', city: '苏州', years: 7, current: '湖畔机器人', education: '硕士', availability: '看机会', expect: '90–120 万元', skills: ['协作机械臂', '控制', '安全'], openTo: ['算法负责人'], desc: '协作机械臂力控与安全策略，产品出口 20 个国家。' },
    { name: '许棠', role: '数据科学', city: '苏州', years: 6, current: '合流数据', education: '硕士', availability: '开放沟通', expect: '70–90 万元', skills: ['隐私计算', '金融', '建模'], openTo: ['核心工程师'], desc: '金融联合建模与隐私计算，做过 30 个跨机构建模项目。' },

    { name: '周予安', role: '大模型算法', city: '北京', years: 7, current: '潮生科技', education: '博士', availability: '看机会', expect: '110–140 万元', skills: ['视频理解', '多模态', '预训练'], openTo: ['算法负责人'], desc: '视频理解与多模态预训练，参与过日均 8 亿次调用的模型迭代。' }
  ];

  function makeContact(name, title, prefix, i, area) {
    var n = String(i + 1).padStart(3, '0');
    return {
      name: name,
      title: title,
      phone: area + '-0000-' + String(1000 + i),
      email: prefix + n + '@example.com',
      wechat: 'ailink_demo_' + n
    };
  }

  var HZ_ATLAS = window.HZ_AI_DATA || null;
  var SZ_ATLAS = window.SZ_AI_DATA || null;
  var HZ_BATCH = window.HZ_BATCH_DATA || null;
  var SZ_BATCH = window.SZ_BATCH_DATA || null;
  var SZ_BATCH2 = window.SZ_BATCH2_DATA || null;
  var HZ_BATCH2 = window.HZ_BATCH2_DATA || null;
  var HZ_CATEGORY_NAMES = {};
  var SZ_CATEGORY_NAMES = {};

  if (HZ_ATLAS && HZ_ATLAS.categories) {
    HZ_ATLAS.categories.forEach(function (c) { HZ_CATEGORY_NAMES[c.id] = c.name; });
  }
  if (SZ_ATLAS && SZ_ATLAS.categories) {
    SZ_ATLAS.categories.forEach(function (c) { SZ_CATEGORY_NAMES[c.id] = c.name; });
  }

  function buildAtlasProjects() {
    if (!HZ_ATLAS || !HZ_ATLAS.companies) return [];
    return HZ_ATLAS.companies.map(function (c) {
      var pal = PALETTE[(c.founded || 0) % PALETTE.length];
      var category = HZ_CATEGORY_NAMES[c.category] || 'AI 企业';
      var metricNote = (c.metrics && c.metrics[0])
        ? c.metrics[0].value + ' · ' + c.metrics[0].label
        : '—';
      return {
        id: 'hz-' + c.id,
        atlasNo: c.no,
        name: c.name,
        en: c.en,
        city: '杭州',
        district: c.district,
        province: '浙江',
        region: '华东',
        sector: category,
        categoryId: c.category,
        stage: '未披露',
        status: c.status,
        statusGroup: c.statusGroup,
        listed: !!c.listed,
        ticker: c.ticker || '—',
        founded: c.founded,
        team: 0,
        funding: '未披露',
        desc: c.business,
        tagline: c.tagline,
        highlights: c.ai || [],
        metrics: c.metrics || [],
        milestones: c.milestones || [],
        atlasSources: c.sources || [],
        keywords: c.keywords || '',
        contact: null,
        contactPending: true,
        logo: c.name.slice(0, 1),
        brand: pal[0],
        tint: pal[1],
        verified: false,
        profileVerified: true,
        confidence: 92,
        updated: HZ_ATLAS.meta.updated || '2026-11-01',
        source: '杭州 AI 图谱 · 公开资料',
        website: c.website || '',
        websiteLabel: c.websiteLabel || '',
        dataset: 'hz-atlas',
        type: 'project',
        metricNote: metricNote
      };
    });
  }

  function buildSzProjects() {
    if (!SZ_ATLAS || !SZ_ATLAS.companies) return [];
    return SZ_ATLAS.companies.map(function (c) {
      var pal = PALETTE[(c.founded || 0) % PALETTE.length];
      var category = SZ_CATEGORY_NAMES[c.category] || 'AI 企业';
      return {
        id: 'sz-' + c.id,
        atlasNo: c.no,
        name: c.name,
        en: c.en,
        city: '深圳',
        district: c.district,
        province: '广东',
        region: '华南',
        sector: category,
        categoryId: c.category,
        stage: '未披露',
        status: c.status,
        statusGroup: c.statusGroup,
        listed: !!c.listed,
        ticker: c.ticker || '—',
        founded: c.founded,
        team: 0,
        funding: '未披露',
        desc: c.business,
        tagline: c.tagline,
        highlights: c.ai || [],
        metrics: [],
        milestones: [],
        atlasSources: c.sources || [],
        keywords: c.keywords || '',
        contact: null,
        contactPending: true,
        logo: c.name.slice(0, 1),
        brand: pal[0],
        tint: pal[1],
        verified: false,
        profileVerified: true,
        confidence: 90,
        updated: SZ_ATLAS.meta.updated || '2026-11-05',
        source: '深圳 AI 企业图谱 · 公开资料',
        website: c.website || '',
        websiteLabel: c.websiteLabel || '',
        dataset: 'sz-atlas',
        type: 'project'
      };
    });
  }

  function buildProjects() {
    var atlas = buildAtlasProjects();
    var szAtlas = buildSzProjects();
    var combined = [];
    var max = Math.max(atlas.length, szAtlas.length);
    for (var i = 0; i < max; i++) {
      if (atlas[i]) combined.push(atlas[i]);
      if (szAtlas[i]) combined.push(szAtlas[i]);
    }
    var others = PROJECT_SEEDS.filter(function (s) { return s.city !== '杭州' && s.city !== '深圳'; });
    var all = combined.concat(others.map(function (s) {
      return { seed: s };
    }));

    return all.map(function (item, i) {
      var n = i + 1;
      var pal = PALETTE[i % PALETTE.length];
      if (item.seed) {
        var s = item.seed;
        var meta = CITY_META[s.city];
        return {
          id: 'p-' + String(n).padStart(3, '0'),
          name: s.name,
          city: s.city,
          province: meta.province,
          region: meta.region,
          sector: s.sector,
          stage: s.stage,
          founded: s.founded,
          team: s.team,
          funding: s.funding,
          desc: s.desc,
          highlights: s.highlights,
          contact: makeContact(s.contactName, s.contactTitle, 'hello', i, meta.area),
          logo: s.name.slice(0, 1),
          brand: pal[0],
          tint: pal[1],
          verified: i % 7 !== 5,
          confidence: 88 + (i * 3) % 11,
          updated: '2026-10-' + String(12 + (i % 17)).padStart(2, '0'),
          source: PROJECT_SOURCES[i % PROJECT_SOURCES.length],
          website: 'https://example.com/project/p-' + String(n).padStart(3, '0'),
          dataset: 'demo',
          type: 'project'
        };
      }
      return item;
    }).map(function (p, i) {
      p.id = 'p-' + String(i + 1).padStart(3, '0');
      return p;
    });
  }

  function buildCapital() {
    if (window.CAPITAL_V2 && window.CAPITAL_V2.length) return window.CAPITAL_V2;
    return CAPITAL_SEEDS.map(function (s, i) {
      var meta = CITY_META[s.city];
      var n = i + 1;
      var pal = PALETTE[(i + 2) % PALETTE.length];
      return {
        id: 'c-' + String(n).padStart(3, '0'),
        name: s.name,
        city: s.city,
        province: meta.province,
        region: meta.region,
        type: s.type,
        focus: s.focus,
        stages: s.stages,
        ticket: s.ticket,
        aum: s.aum,
        desc: s.desc,
        contact: makeContact(s.contactName, s.contactTitle, 'lp', i, meta.area),
        logo: s.name.slice(0, 1),
        brand: pal[0],
        tint: pal[1],
        verified: i % 6 !== 4,
        confidence: 90 + (i * 2) % 9,
        updated: '2026-10-' + String(10 + (i % 19)).padStart(2, '0'),
        source: i % 3 === 0 ? '机构官网 + 融资事件' : '机构官网 + 人工核验',
        website: 'https://example.com/capital/c-' + String(n).padStart(3, '0'),
        typeKey: 'capital',
        kind: s.type
      };
    });
  }

  function buildTalents() {
    return TALENT_SEEDS.map(function (s, i) {
      var meta = CITY_META[s.city];
      var n = i + 1;
      var pal = PALETTE[(i + 4) % PALETTE.length];
      return {
        id: 't-' + String(n).padStart(3, '0'),
        name: s.name,
        city: s.city,
        province: meta.province,
        region: meta.region,
        role: s.role,
        years: s.years,
        current: s.current,
        education: s.education,
        availability: s.availability,
        expect: s.expect,
        skills: s.skills,
        openTo: s.openTo,
        desc: s.desc,
        contact: makeContact(s.name, s.role + ' · ' + s.openTo[0], 'talent', i, meta.area),
        logo: s.name.slice(0, 1),
        brand: pal[0],
        tint: pal[1],
        verified: i % 5 !== 3,
        confidence: 86 + (i * 4) % 13,
        updated: '2026-10-' + String(14 + (i % 15)).padStart(2, '0'),
        source: i % 2 === 0 ? '会员登记 + 背景核验' : '活动报名 + 授权公开',
        website: '',
        typeKey: 'talent'
      };
    });
  }

  var projects = buildProjects();

  function buildSzBatch2Projects() {
    if (!SZ_BATCH2 || !SZ_BATCH2.groups) return [];
    var out = [];
    var n = 0;
    SZ_BATCH2.groups.forEach(function (g) {
      g.companies.forEach(function (item) {
        n += 1;
        var name = item[0];
        var segment = item[1] || g.defaultSegment || 'AI 原生应用与数字内容';
        var pal = PALETTE[n % PALETTE.length];
        out.push({
          id: 'p-b2-' + String(n).padStart(3, '0'),
          name: name,
          city: '深圳',
          district: g.district,
          province: '广东',
          region: '华南',
          sector: segment,
          stage: '待核验',
          status: '待核验',
          statusGroup: 'pending',
          listed: false,
          ticker: '—',
          founded: 0,
          team: 0,
          funding: '未披露',
          desc: name + '：' + (g.note || 'Batch 02 待核验候选') + '。仅完成名称、城区与初分方向登记，联系方式与业务详情尚未核验。',
          tagline: 'Batch 02 · 待核验候选',
          highlights: [segment, 'Batch 02 批量导入', '待核验'],
          metrics: [],
          milestones: [],
          atlasSources: g.sourceUrl ? [{ label: g.source, url: g.sourceUrl }] : [],
          keywords: '深圳 Batch 02 待核验 ' + segment,
          contact: null,
          contactPending: true,
          pending: true,
          batchId: SZ_BATCH2.id,
          logo: name.slice(0, 1),
          brand: pal[0],
          tint: pal[1],
          verified: false,
          confidence: 55,
          updated: SZ_BATCH2.updated || '2026-11-05',
          source: '深圳 Batch 02 · ' + g.source + '（待核验）',
          website: '',
          dataset: 'sz-batch2',
          type: 'project'
        });
      });
    });
    return out;
  }

  projects = projects.concat(buildSzBatch2Projects());

  function pendingRecord(name, city, district, area, segment, source, sourceUrl, batchId, idx) {
    var pal = PALETTE[idx % PALETTE.length];
    var batchLabel = batchId.indexOf('B01') >= 0 ? 'Batch 01' : 'Batch 02';
    return {
      id: 'p-' + batchId.toLowerCase() + '-' + String(idx).padStart(3, '0'),
      name: name,
      city: city,
      district: district || city,
      area: area || '',
      province: city === '杭州' ? '浙江' : '广东',
      region: city === '杭州' ? '华东' : '华南',
      sector: segment,
      stage: '待核验',
      status: '待核验',
      statusGroup: 'pending',
      listed: false,
      ticker: '—',
      founded: 0,
      team: 0,
      funding: '未披露',
      desc: name + '：' + (city === '杭州' ? '杭州' : '深圳') + ' ' + batchLabel + ' 待核验候选。仅完成名称、' + (area || district || '城区') + '与初分方向登记，业务、联系方式与融资信息尚未核验。',
      tagline: batchLabel + ' · 待核验候选',
      highlights: [segment, batchLabel + ' 批量导入', '待核验'],
      metrics: [],
      milestones: [],
      atlasSources: sourceUrl ? [{ label: source, url: sourceUrl }] : [],
      keywords: (city === '杭州' ? '杭州' : '深圳') + ' Batch 02 待核验 ' + segment,
      contact: null,
      contactPending: true,
      pending: true,
      batchId: batchId,
      logo: name.slice(0, 1),
      brand: pal[0],
      tint: pal[1],
      verified: false,
      confidence: 55,
      updated: '2026-11-05',
      source: source + '（待核验）',
      website: '',
      dataset: batchId.toLowerCase(),
      type: 'project'
    };
  }

  function buildHzBatch1Pending() {
    if (!HZ_BATCH) return [];
    var names = {};
    projects.forEach(function (p) { names[p.name] = true; });
    var out = [];
    HZ_BATCH.items.forEach(function (item) {
      var raw = item[0];
      var canonical = { 'DeepSeek': '深度求索', '个推（每日互动）': '每日互动', 'Rokid': 'Rokid 灵伴科技', '酷家乐': '群核科技' }[raw] || raw;
      if (names[raw] || names[canonical]) return;
      out.push(pendingRecord(raw, '杭州', '杭州', '杭州', batchCategory(item[1]), '杭州 Batch 01 · 2025 杭州 AI 企业 TOP100', HZ_BATCH.sourceUrl, 'HZ-B01', out.length + 1));
    });
    return out;
  }

  function buildHzBatch2Pending() {
    if (!HZ_BATCH2) return [];
    return HZ_BATCH2.newCompanies.map(function (c, i) {
      return pendingRecord(c.name, '杭州', c.district, c.area, c.segment, c.source, c.sourceUrl, 'HZ-B02', i + 1);
    });
  }

  projects = projects.concat(buildHzBatch1Pending()).concat(buildHzBatch2Pending());

  if (window.HZ_PUBLIC30_PENDING) {
    var publicNames = projects.map(function (p) { return p.name; });
    var publicSeen = {};
    var publicExtra = window.HZ_PUBLIC30_PENDING.filter(function (r) {
      if (/明度|群核|川核灵境/.test(r.name)) return false;
      var base = r.name.replace(/（.*?）|\(.*?\)/g, '').replace(/有限公司|股份有限公司|科技|技术|杭州|浙江/g, '');
      if (publicSeen[base]) return false;
      publicSeen[base] = true;
      if (/zhaobiao|zufe|carnoc|shuididp|qixin/.test(r.website || '')) r.website = '';
      return !publicNames.some(function (n) { return n.indexOf(r.name) >= 0 || r.name.indexOf(n) >= 0; });
    });
    projects = projects.concat(publicExtra);
  }

  if (window.REGION_FIXES) {
    projects.forEach(function (p) {
      var f = window.REGION_FIXES[p.name];
      if (!f) return;
      p.name = f.name || p.name;
      p.city = f.city;
      p.district = f.district || '';
      p.province = f.province || p.province;
      p.region = f.region || p.region;
      p.website = f.website || '';
      p.sector = f.sector || p.sector;
      p.desc = f.description || p.desc;
      p.founded = f.founded || 0;
      p.funding = f.funding || '未披露';
      p.phone = f.phone || '';
      p.email = f.email || '';
      p.address = f.address || '';
      p.contact = null;
      p.pending = true;
      p.verified = false;
      p.stage = '待核验';
      p.status = '待核验';
      p.statusGroup = 'pending';
      p.dataset = 'region-moved';
      p.source = '公开官网核验 · ' + (f.note || '主体不在杭州');
      p.updated = '2026-11-06';
    });
  }

  if (window.PENDING_ENRICHMENT) {
    projects.forEach(function (p) {
      if (!p.pending) return;
      var e = window.PENDING_ENRICHMENT[p.name];
      if (!e) return;
      if (e.website) p.website = e.website;
      if (e.description) p.desc = e.description;
      if (e.sector) p.sector = e.sector;
      if (e.founded) p.founded = e.founded;
      if (e.phone) p.phone = e.phone;
      if (e.email) p.email = e.email;
      if (e.address) p.address = e.address;
      if (e.source) p.source = e.source;
      p.updated = '2026-11-06';
    });
  }

  if (window.PILOT_VERIFIED) {
    projects.forEach(function (p) {
      if (String(p.dataset || '').indexOf('-atlas') >= 0) return;
      var v = window.PILOT_VERIFIED[p.name];
      if (!v) {
        Object.keys(window.PILOT_VERIFIED).some(function (k) {
          if (p.name.indexOf(k) >= 0 || k.indexOf(p.name) >= 0) {
            v = window.PILOT_VERIFIED[k];
            return true;
          }
          return false;
        });
      }
      if (!v) return;
      p.name = v.name || p.name;
      p.city = v.city || p.city;
      p.district = v.district || p.district;
      p.website = v.website || p.website;
      p.desc = v.description || p.desc;
      p.sector = v.sector || p.sector;
      p.founded = v.founded || 0;
      p.team = v.team || 0;
      p.funding = v.funding || '未披露';
      p.address = v.address || '';
      p.phone = v.phone || '';
      p.email = v.email || '';
      p.contact = (v.phone || v.email) ? {
        name: '商务合作',
        title: '官网公开联系方式',
        phone: v.phone || '',
        email: v.email || '',
        wechat: '—'
      } : null;
      p.pending = false;
      p.contactPending = false;
      p.verified = true;
      p.stage = '已核验';
      p.status = '已核验';
      p.statusGroup = 'verified';
      p.confidence = Math.round((v.confidence || 0.7) * 100);
      p.updated = v.verifiedAt;
      p.source = v.source;
      p.batchId = p.batchId || 'PILOT';
      p.highlights = [v.sector || p.sector, '官网公开', '人工抽检'];
      p.atlasSources = v.website ? [{ label: '官网', url: v.website }] : [];
      p.dataset = 'pilot-verified';
    });
  }

  var capital = buildCapital();
  var talents = buildTalents();
  var cities = Array.from(new Set(projects.concat(capital, talents).map(function (x) { return x.city; })));

  function batchCategory(note) {
    if (/医疗|药|健康|生物|病理|肿瘤|癌症|医学/.test(note)) return '医疗与生命科学';
    if (/短视频|特效|游戏|设计|教育|校对|虚拟场景|内容/.test(note)) return 'AI 原生应用与数字内容';
    if (/外呼|客服|营销|零售|金融|风控|数据|物流|工业|制造|企业|SaaS|财务|政务|城市|安全|威胁|投顾|交易|监测|治水|电表|运维/.test(note)) return '产业智能与金融科技';
    if (/芯片|半导体|算力|大模型|RISC-V|基础|网络|通信|多模态|模组/.test(note)) return '基础模型与算力';
    if (/机器人|具身|人形|脑机/.test(note)) return '具身智能与机器人';
    if (/驾驶|汽车|出行|眼镜|终端|智能网联|无人机|自行车/.test(note)) return '智能终端与出行';
    if (/安防|视觉|视频|影像|监控|3D|缺陷|质检/.test(note)) return '智能物联与机器视觉';
    return 'AI 原生应用与数字内容';
  }

  var batch01 = null;
  if (HZ_BATCH) {
    var batchAliases = {
      'DeepSeek': '深度求索',
      '个推（每日互动）': '每日互动',
      'Rokid': 'Rokid 灵伴科技',
      '酷家乐': '群核科技'
    };
    var names = {};
    (HZ_ATLAS ? HZ_ATLAS.companies : []).forEach(function (p) { names[p.name] = true; });
    var batchRows = HZ_BATCH.items.map(function (item) {
      var raw = item[0];
      var canonical = batchAliases[raw] || raw;
      return { name: raw, canonical: canonical, note: item[1], category: batchCategory(item[1]), existing: !!names[canonical] || !!names[raw] };
    });
    var bcats = {};
    batchRows.forEach(function (r) { bcats[r.category] = (bcats[r.category] || 0) + 1; });
    batch01 = {
      id: HZ_BATCH.id,
      title: HZ_BATCH.title,
      total: batchRows.length,
      existing: batchRows.filter(function (r) { return r.existing; }).length,
      new: batchRows.filter(function (r) { return !r.existing; }).length,
      imported: batchRows.filter(function (r) { return !r.existing; }).length,
      verified: 0,
      contactSummary: HZ_BATCH.contactSummary,
      categories: bcats,
      target: HZ_BATCH.target,
      source: HZ_BATCH.source,
      sourceUrl: HZ_BATCH.sourceUrl,
      updated: HZ_BATCH.updated
    };
  }

  var szBatch = null;
  if (SZ_BATCH) {
    var szExisting = projects.filter(function (p) { return p.dataset === 'sz-atlas'; });
    var districtCounts = {};
    szExisting.forEach(function (p) { districtCounts[p.district || '未标注'] = (districtCounts[p.district || '未标注'] || 0) + 1; });
    SZ_BATCH.newCompanies.forEach(function (c) { districtCounts[c.district] = (districtCounts[c.district] || 0) + 1; });
    szBatch = {
      id: SZ_BATCH.id,
      title: SZ_BATCH.title,
      total: szExisting.length + SZ_BATCH.newCompanies.length,
      existing: szExisting.length,
      new: SZ_BATCH.newCompanies.length,
      verified: 0,
      target: SZ_BATCH.target,
      targetNote: SZ_BATCH.targetNote,
      districts: districtCounts,
      updated: SZ_BATCH.updated,
      source: '园区名录 + 公开榜单 + 公开报道'
    };
  }

  var szBatch2 = null;
  if (SZ_BATCH2 && SZ_BATCH2.groups) {
    var db2 = {};
    var count2 = 0;
    SZ_BATCH2.groups.forEach(function (g) {
      db2[g.district] = (db2[g.district] || 0) + g.companies.length;
      count2 += g.companies.length;
    });
    szBatch2 = {
      id: SZ_BATCH2.id,
      title: SZ_BATCH2.title,
      total: count2,
      imported: count2,
      verified: 0,
      districts: db2,
      updated: SZ_BATCH2.updated,
      note: SZ_BATCH2.note
    };
  }

  window.AILINK_DATA = {
    projects: projects,
    capital: capital,
    talents: talents,
    meta: {
      generatedAt: '2026-11-05',
      cities: cities,
      hzCoreCompanies: 938,
      hzIncluded: HZ_ATLAS ? HZ_ATLAS.companies.length : 0,
      hzCategories: HZ_ATLAS ? HZ_ATLAS.categories : [],
      hzUpdated: HZ_ATLAS ? HZ_ATLAS.meta.updated : '',
      hzScope: HZ_ATLAS ? HZ_ATLAS.meta.scope : '',
      szCoreCompanies: 2600,
      szTarget2026: 3000,
      szIncluded: SZ_ATLAS ? SZ_ATLAS.companies.length : 0,
      szCategories: SZ_ATLAS ? SZ_ATLAS.categories : [],
      szUpdated: SZ_ATLAS ? SZ_ATLAS.meta.updated : '',
      szScope: SZ_ATLAS ? SZ_ATLAS.meta.scope : '',
      batch01: batch01,
      hzBatch02: HZ_BATCH2 ? {
        id: HZ_BATCH2.id,
        title: HZ_BATCH2.title,
        total: HZ_BATCH2.newCompanies.length,
        imported: HZ_BATCH2.newCompanies.length,
        verified: 0,
        areas: HZ_BATCH2.newCompanies.reduce(function (acc, c) { acc[c.area] = (acc[c.area] || 0) + 1; return acc; }, {}),
        updated: HZ_BATCH2.updated
      } : null,
      szBatch01: szBatch,
      szBatch02: szBatch2,
      disclaimer: '数据说明：杭州 42 家、深圳 42 家企业来自公开资料图谱（未提供电话/邮箱）；深圳 Batch 02 的 100 家为待核验批量导入；其余企业、机构与人物为虚构演示数据，联系方式使用 example.com 保留域名和不可路由占位号码。',
      version: '1.1.0-hz-sz-atlas'
    }
  };
})();

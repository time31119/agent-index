/* =========================================================================
   枢元智联 NEXUS EDGE — 站点数据层
   -------------------------------------------------------------------------
   ★ 这里是唯一需要经常维护的文件。
   - 新增产品：在对应 categories[i].slots 里追加一条 { name, code, status, note }
   - 新增品类：复制一个 category 对象，改 id / no / name / slots 即可
   - status 只接受：'量产' | '在研' | '规划' | '可定制'
   - 删除一个 slot 里的 empty:true 占位，即可把"开放产品位"变成真实产品
   ========================================================================= */

window.NEXUS_DATA = {
  brand: {
    zh: "枢元智联",
    en: "NEXUS EDGE",
    slogan: "让每一台设备，成为可被 AI 调用的智能体",
    domain: "nexusedge.cn",
    email: "hello@nexusedge.cn",
    phone: "+86 755 0000 0000",
    city: "深圳 · 南山"
  },

  /* 首页数字由 site.js 依据 categories 自动统计，无需手工维护 */

  chips: ["ESP32-C3", "ESP32-C6", "ESP32-S3", "ESP32-P4", "ESP32-H2"],
  maturities: ["量产级", "方案级", "在研", "规划级"],

  categories: [
    {
      id: "home",
      no: "01",
      name: "智能家居",
      en: "Smart Home",
      tagline: "从单品联网到全屋场景，Matter 让跨品牌互联成为默认能力。",
      summary: "照明、开关、传感、窗帘、家电——家居是 ESP32 最大的存量市场，也是品牌最容易建立认知的入口。我们以 Matter over Thread / Wi-Fi 双栈为底座，把配网、OTA、本地联动做成可复用模块，客户只定义外观与场景。",
      scenes: ["照明调光", "开关插座", "环境传感", "窗帘电机", "家电联网", "语音中控"],
      tech: ["Matter over Thread", "Wi-Fi 双栈配网", "差分 OTA", "本地场景引擎", "深度睡眠"],
      chips: ["ESP32-C3", "ESP32-C6", "ESP32-H2", "ESP32-S3"],
      maturity: "量产级",
      slots: [
        { name: "智能开关模组", code: "NX-HM-01", status: "量产", note: "86 底盒尺寸，单火取电，Matter 直连" },
        { name: "毫米波存在传感器", code: "NX-HM-02", status: "在研", note: "60GHz，静止人体检测，BLE 配网" },
        { name: "窗帘电机控制板", code: "NX-HM-03", status: "可定制", note: "行程自学习，静音驱动，限位保护" },
        { name: "温湿度墨水屏面板", code: "NX-HM-04", status: "规划", note: "e-ink 局部刷新，一节电池一年" },
        { empty: true },
        { empty: true }
      ]
    },
    {
      id: "security",
      no: "02",
      name: "楼宇与安防",
      en: "Building & Security",
      tagline: "把“事后录像”变成“事前预警”，门禁与传感是楼宇的神经末梢。",
      summary: "门禁、可视对讲、烟感气感、水浸门磁——安防场景对可靠性和离线能力的要求远高于消费级。我们把人脸、雷达、声光报警做成模块化前端：断网时本地决策，联网时只上传结构化事件，兼顾隐私与带宽。",
      scenes: ["人脸门禁", "可视门铃", "烟感气感", "水浸门磁", "电子巡更", "资产定位"],
      tech: ["本地人脸比对", "雷达与 PIR 融合", "断网本地录像", "加密上报", "低功耗常在线"],
      chips: ["ESP32-S3", "ESP32-C6"],
      maturity: "量产级",
      slots: [
        { name: "人脸门禁终端", code: "NX-SE-01", status: "在研", note: "S3 + 双目活体，离线 5000 人脸库" },
        { name: "无线门磁", code: "NX-SE-02", status: "量产", note: "CR2032 续航 18 个月，防拆报警" },
        { name: "可视门铃", code: "NX-SE-03", status: "规划", note: "200 万像素，PIR 唤醒，云端存证" },
        { name: "烟感联动模块", code: "NX-SE-04", status: "可定制", note: "继电器联动断气阀与排风" },
        { empty: true }
      ]
    },
    {
      id: "industry",
      no: "03",
      name: "工业与能源",
      en: "Industry & Energy",
      tagline: "用几十元的节点，把老设备的 RS485 / CAN 数据搬上云。",
      summary: "工业数字化的最后一公里，往往卡在“设备没有网口”。ESP32 以极低成本完成协议转换、边缘规则与断点续传，让电表、水泵、空压机、光伏逆变器以最小改造接入平台。",
      scenes: ["协议网关", "电参采集", "振动与温度", "光伏储能", "能耗分项", "空压机群控"],
      tech: ["Modbus RTU/TCP", "CAN", "MQTT over TLS", "边缘规则引擎", "断点续传", "宽温宽压"],
      chips: ["ESP32-S3", "ESP32-P4", "ESP32-C6"],
      maturity: "方案级",
      slots: [
        { name: "485 转 Wi-Fi 网关", code: "NX-IN-01", status: "量产", note: "2 路 RS485，Modbus 主站，导轨安装" },
        { name: "三相电参采集", code: "NX-IN-02", status: "在研", note: "0.5S 精度，开口互感器，免停电安装" },
        { name: "振动监测节点", code: "NX-IN-03", status: "规划", note: "三轴加速度，FFT 特征，电池供电" },
        { name: "边缘规则盒", code: "NX-IN-04", status: "可定制", note: "本地阈值告警，断网缓存 7 天" },
        { empty: true },
        { empty: true }
      ]
    },
    {
      id: "agri",
      no: "04",
      name: "农业与环境",
      en: "Agri & Environment",
      tagline: "太阳能 + 电池 + 自组网，覆盖没有 Wi-Fi 也没有电的田野。",
      summary: "农业物联网的难点不是传感，而是供电、覆盖与耐候。我们以太阳能 + 深度睡眠 + LoRa / ESP-MESH 组合，做出“埋下去三年不用管”的节点，并配套标定服务与远程配置能力。",
      scenes: ["土壤墒情", "小型气象站", "智能灌溉", "水质监测", "大棚控制", "畜禽环境"],
      tech: ["太阳能供电", "深度睡眠 <20µA", "LoRa 与 ESP-MESH", "传感器标定", "远程配置 OTA"],
      chips: ["ESP32-C3", "ESP32-C6", "ESP32-H2"],
      maturity: "方案级",
      slots: [
        { name: "太阳能土壤节点", code: "NX-AG-01", status: "在研", note: "三深度墒情 + 盐分，IP67，续航 3 年" },
        { name: "温室控制器", code: "NX-AG-02", status: "规划", note: "温湿光 CO₂ 联动卷帘、风机与补光" },
        { name: "小型气象站", code: "NX-AG-03", status: "可定制", note: "风速风向雨量，RS485 扩展" },
        { name: "水质监测浮标", code: "NX-AG-04", status: "规划", note: "pH / 浊度 / 溶氧，4G 回传" },
        { empty: true },
        { empty: true }
      ]
    },
    {
      id: "wearable",
      no: "05",
      name: "健康与可穿戴",
      en: "Health & Wearable",
      tagline: "低功耗 BLE 把体征连续送进手机，续航以周为单位。",
      summary: "可穿戴的胜负手是功耗与算法。ESP32-C3 的 BLE 5 + 深度睡眠组合，配合本地异常判断（心率突变、跌倒），做到“平时不打扰、异常必上报”，数据默认不出设备。",
      scenes: ["手环手表", "血氧心率", "服药提醒", "跌倒检测", "母婴监测", "康复器械"],
      tech: ["BLE 5", "低功耗调度", "传感器融合", "本地异常判断", "数据最小化上传"],
      chips: ["ESP32-C3", "ESP32-S3"],
      maturity: "规划级",
      slots: [
        { name: "BLE 健康手环方案", code: "NX-HW-01", status: "规划", note: "PPG + 加速度，7 天续航" },
        { name: "毫米波跌倒检测", code: "NX-HW-02", status: "在研", note: "客厅场景，静止人体检测，误报率 <2%" },
        { name: "服药提醒盒", code: "NX-HW-03", status: "可定制", note: "分格检测，未服提醒到家属" },
        { empty: true }
      ],
      pipelineTitle: "六款市面上还没有的健康硬件",
      pipelineIntro: "这 6 款不是现有品类的改良，而是我们判断「应该存在、但量产产品还没解决」的东西。入选标准只有三条：有真实的临床或生活痛点、ESP32 能在成本内做到、现有产品确实绕开了它。第二条尤其严格——我们不设计需要 CT 级传感器、或者必须先拿医疗器械注册证才能卖的产品。",
      pipelineNote: "以上均为健康风险提示与行为辅助类产品，不做疾病诊断、不替代就医；涉及医疗声称的功能将在取得相应资质后开放。",
      pipeline: [
        {
          code: "NX-HW-11",
          name: "糖足预警鞋垫",
          en: "SoleGuard",
          status: "企划",
          pos: "在溃疡出现前两周，先一步报警。",
          gap: "医院用红外测温仪，一年测一次；消费级鞋垫只会计步。没有人把「足底温差 + 压力 + 步态」做成每天自动运行的预警。",
          stack: ["6 点 NTC", "薄膜压力", "6 轴 IMU", "ESP32-C3 · BLE"],
          form: "鞋垫 3mm",
          price: "¥399/双",
          timing: "2027 Q2 样机",
          detail: "concept.html#soleguard"
        },
        {
          code: "NX-HW-12",
          name: "浴室安全哨兵",
          en: "BathGuard",
          status: "企划",
          pos: "浴室里最危险的三分钟，不能靠摄像头。",
          gap: "跌倒雷达几乎都装在客厅卧室：浴室有水汽、有隐私、误报多，没人愿意做；而摄像头在浴室根本没有可能。",
          stack: ["60GHz 毫米波", "声学事件（不录音）", "门磁联动", "ESP32-S3 · IPX4"],
          form: "墙面 / 吊顶",
          price: "¥299",
          timing: "2027 Q1 样机"
        },
        {
          code: "NX-HW-13",
          name: "噪声预算耳标",
          en: "SoundBudget",
          status: "企划",
          pos: "把听力当预算花，而不是等聋了再配助听器。",
          gap: "工业剂量计是几千元的专业仪器，要送检、不联网；手机 App 测不准，也不累计「每日剂量」。职业噪声的长期管理是空白。",
          stack: ["MEMS 麦克风", "NIOSH 剂量算法", "ESP32-C6 · BLE/Thread", "云报表"],
          form: "胸牌 / 耳挂",
          price: "¥399 + 年校准",
          timing: "2027 Q3"
        },
        {
          code: "NX-HW-14",
          name: "脊柱侧弯筛查背心",
          en: "SpineScout",
          status: "企划",
          pos: "把体检时「弯腰摸一下」，变成 30 天的趋势。",
          gap: "市面上的姿态产品都在做「驼背震动提醒」，没人做「躯干旋转与左右不对称」的筛查；青少年侧弯早期靠肉眼，漏检率高。",
          stack: ["胸腰双 IMU", "肩带张力", "ESP32-C3", "月度趋势报告"],
          form: "背心",
          price: "¥499",
          timing: "2027 Q4"
        },
        {
          code: "NX-HW-15",
          name: "冻结步态节拍腰带",
          en: "StepCue",
          status: "企划",
          pos: "脚被「粘」在地上的那三秒，给一个节拍。",
          gap: "冻结步态的干预设备多是实验室样机或笨重的激光拐杖，没有能日常佩戴、自动识别发作并即时提示的东西。",
          stack: ["腰部 IMU", "冻结步态识别", "骨传导节拍", "ESP32-S3"],
          form: "腰带",
          price: "¥899",
          timing: "2028 Q1"
        },
        {
          code: "NX-HW-16",
          name: "潮热日记",
          en: "FlashNote",
          status: "企划",
          pos: "让更年期第一次有「发作记录」，而不是靠回忆。",
          gap: "可穿戴只给心率和体温曲线，没有产品识别「潮热事件」并关联触发因素；临床评估至今依赖问卷回忆。",
          stack: ["胸骨皮温", "皮肤电 EDA", "PPG", "ESP32-C3 · 4 周报告"],
          form: "胸贴",
          price: "¥599 + 年服务",
          timing: "2028 Q2"
        }
      ]
    },
    {
      id: "mobility",
      no: "06",
      name: "车载与出行",
      en: "Mobility",
      tagline: "两轮车、充电桩、共享设备的联网中控与定位防盗。",
      summary: "出行场景对宽压、抗震、断网续传要求苛刻。我们把 GNSS、4G 透传、震动唤醒与防盗上报做成标准中控，适配电动车、叉车、充电桩与共享设备。",
      scenes: ["电动车中控", "OBD 车况", "胎压监测", "共享锁", "充电桩", "车队管理"],
      tech: ["CAN / 串口", "GNSS 定位", "4G 透传", "9–90V 宽压", "震动唤醒", "防盗上报"],
      chips: ["ESP32-S3", "ESP32-C3"],
      maturity: "方案级",
      slots: [
        { name: "电动车中控", code: "NX-MB-01", status: "在研", note: "仪表 + 定位 + 防盗，CAN 对接 BMS" },
        { name: "OBD 追踪器", code: "NX-MB-02", status: "可定制", note: "车况读取，驾驶行为评分" },
        { name: "充电桩通信板", code: "NX-MB-03", status: "规划", note: "OCPP over MQTT，刷卡 / 扫码" },
        { empty: true }
      ]
    },
    {
      id: "retail",
      no: "07",
      name: "商业零售",
      en: "Retail & Payment",
      tagline: "让门店的每个动作都可被度量：价签、柜锁、客流、冷链。",
      summary: "零售场景的共性是“多、散、要省电”。电子价签用墨水屏 + 批量 OTA，智能柜锁用 BLE 开锁 + 离线授权，客流盒子在本机完成计数、只上传结果——不采集人脸，也不上传视频。",
      scenes: ["电子价签", "扫码盒子", "智能柜锁", "客流统计", "冷链监控", "自助终端"],
      tech: ["墨水屏驱动", "批量 OTA", "BLE 开锁", "离线授权", "本地计数", "POS / ERP 对接"],
      chips: ["ESP32-S3", "ESP32-C6"],
      maturity: "量产级",
      slots: [
        { name: "ESL 电子价签", code: "NX-RT-01", status: "规划", note: "2.9 / 4.2 寸，5 年电池，千店级批量" },
        { name: "智能柜锁", code: "NX-RT-02", status: "量产", note: "BLE + 动态码，离线授权 500 条" },
        { name: "客流分析盒", code: "NX-RT-03", status: "在研", note: "本地人头计数，只传数字" },
        { name: "冷链温度记录仪", code: "NX-RT-04", status: "可定制", note: "−40℃ 场景，断链报警" },
        { empty: true },
        { empty: true }
      ]
    },
    {
      id: "education",
      no: "08",
      name: "教育与创客",
      en: "Education",
      tagline: "从图形化编程到边缘 AI 实验，做“能跑通”的教学套件。",
      summary: "教育硬件的核心不是参数，而是课程与容错。我们提供模块化扩展板、防反接保护、图形化 IDE 与 40+ 课例，让老师敢用、学生能出成果——这也是最好的品牌早期心智入口。",
      scenes: ["入门套件", "图形化编程", "AI 视觉实验", "竞赛平台", "教师课程包", "校园创客空间"],
      tech: ["MicroPython / Arduino", "图形化 IDE", "课程与示例库", "防反接保护", "模块化扩展"],
      chips: ["ESP32-C3", "ESP32-S3"],
      maturity: "量产级",
      slots: [
        { name: "AI 视觉教学套件", code: "NX-ED-01", status: "在研", note: "S3 + 摄像头，人脸 / 颜色 / 形状三课一项目" },
        { name: "入门套件", code: "NX-ED-02", status: "量产", note: "20 个传感器，图形化 60 课" },
        { name: "竞赛主控板", code: "NX-ED-03", status: "规划", note: "兼容积木结构，双电机驱动" },
        { empty: true }
      ]
    },
    {
      id: "display",
      no: "09",
      name: "音频与显示",
      en: "Audio & Display",
      tagline: "LVGL 触控、离线语音、墨水屏，把“设备状态”变成“人机对话”。",
      summary: "交互是产品溢价的来源。S3 的 PSRAM + 双核足以跑 LVGL 60fps 与离线唤醒词，配合 I2S 音频与 RGB 并口屏，做出不输手机的顺滑感——这是整机品牌最值得投入的地方。",
      scenes: ["智能中控屏", "蓝牙音箱", "网络收音机", "墨水屏看板", "电子铭牌", "工业 HMI"],
      tech: ["LVGL", "I2S 音频", "离线唤醒词", "蓝牙 A2DP", "RGB 并口屏", "局部刷新"],
      chips: ["ESP32-S3", "ESP32-P4"],
      maturity: "方案级",
      slots: [
        { name: "4 寸智能中控屏", code: "NX-DP-01", status: "在研", note: "480×480，LVGL，离线语音" },
        { name: "墨水屏看板", code: "NX-DP-02", status: "规划", note: "7.5 寸，日历 / 天气 / 待办" },
        { name: "语音音箱方案", code: "NX-DP-03", status: "可定制", note: "双麦降噪，A2DP + 唤醒" },
        { name: "工业 HMI 面板", code: "NX-DP-04", status: "规划", note: "4.3 寸，Modbus 组态" },
        { empty: true },
        { empty: true }
      ]
    },
    {
      id: "robotics",
      no: "10",
      name: "机器人与运动控制",
      en: "Robotics",
      tagline: "双核实时调度 + Wi-Fi 遥控，做教育机器人、云台与小臂的控制大脑。",
      summary: "运动控制看的是实时性与生态。ESP32 的双核可以把通信与控制在两个核上隔离，配合成熟的步进 / 舵机库与 micro-ROS 桥接，快速搭出可演示、可量产的原型。",
      scenes: ["教育小车", "机械臂", "云台", "3D 打印", "平衡车", "AGV 原型"],
      tech: ["PWM / 步进闭环", "IMU 姿态解算", "PID", "双核任务隔离", "micro-ROS", "上位机协议"],
      chips: ["ESP32-S3", "ESP32-P4"],
      maturity: "方案级",
      slots: [
        { name: "双轮平衡底盘", code: "NX-RB-01", status: "在研", note: "MPU6050 + 编码器，串级 PID" },
        { name: "六轴机械臂控制板", code: "NX-RB-02", status: "规划", note: "6 路舵机，轨迹插补" },
        { name: "3D 打印主板", code: "NX-RB-03", status: "可定制", note: "Marlin 移植，Wi-Fi 打印" },
        { empty: true }
      ]
    },
    {
      id: "edgeai",
      no: "11",
      name: "边缘 AI",
      en: "Edge AI Vision & Voice",
      tagline: "不算大模型，只做“最后一米”的判断：有没有人、是不是次品、谁在说话。",
      summary: "云端大模型负责理解，端侧负责即时判断。我们用 ESP-DL / ESP-SR 把量化模型压进 8MB PSRAM，在 100ms 内完成人脸、手势、异常声音与缺陷检测，只把结论上传——快、省、且隐私可控。",
      scenes: ["离线唤醒", "人脸与手势", "缺陷检测", "姿态与跌倒", "声音事件", "计数与占位"],
      tech: ["ESP-DL", "ESP-SR", "INT8 量化", "摄像头 ISP", "本地推理 <100ms", "云端复核"],
      chips: ["ESP32-S3", "ESP32-P4"],
      maturity: "在研",
      slots: [
        { name: "离线语音模组", code: "NX-AI-01", status: "量产", note: "200 条命令词，5 米拾音，<300ms 响应" },
        { name: "缺陷检测盒", code: "NX-AI-02", status: "在研", note: "小样本训练，产线节拍 60ppm" },
        { name: "手势识别模组", code: "NX-AI-03", status: "规划", note: "隔空翻页 / 调光，无需接触" },
        { name: "声音事件检测", code: "NX-AI-04", status: "规划", note: "玻璃破碎 / 呼救 / 异常噪音" },
        { empty: true },
        { empty: true }
      ]
    },
    {
      id: "gateway",
      no: "12",
      name: "网关与通信",
      en: "Gateway & Connectivity",
      tagline: "多协议融合与边缘计算入口，是“设备智能体”的路由器。",
      summary: "当设备数量上来，网关决定系统上限。我们把 BLE Mesh、Thread、Matter Controller、LoRa 与本地规则引擎做进同一块板：断网时场景照常运行，联网时只同步状态。",
      scenes: ["BLE 网关", "Thread 边界路由", "LoRa 网关", "多协议融合", "本地自动化", "断网自治"],
      tech: ["BLE Mesh", "Thread", "Matter Controller", "本地 MQTT 与规则", "边缘缓存", "安全启动"],
      chips: ["ESP32-C6", "ESP32-H2", "ESP32-P4"],
      maturity: "在研",
      slots: [
        { name: "多协议边缘网关", code: "NX-GW-01", status: "在研", note: "BLE + Thread + Wi-Fi，本地规则 200 条" },
        { name: "Thread 边界路由器", code: "NX-GW-02", status: "规划", note: "Matter 认证，PoE 供电" },
        { name: "LoRa 网关", code: "NX-GW-03", status: "可定制", note: "8 信道，空旷覆盖 3km" },
        { empty: true }
      ]
    }
  ]
};

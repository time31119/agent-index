/* EDGE32 — curated ESP32 application atlas
   Data snapshot: 2026-10-31
   All product names and trademarks belong to their respective owners. */

window.ATLAS = {
  meta: {
    updated: "2026-10-31",
    edition: "2026 Q4",
    totalCases: 26,
    totalTracks: 7,
    chipFamilies: 6
  },

  tracks: [
    {
      id: "ai",
      name: "AI 交互",
      en: "AI INTERACTION",
      color: "#c8ff3d",
      short: "语音、视觉与陪伴",
      desc: "把大模型的能力拆成端侧唤醒、云端推理与工具调用，装进玩具、音箱、眼镜和桌面终端。"
    },
    {
      id: "robotics",
      name: "机器人与运动",
      en: "ROBOTICS & MOTION",
      color: "#ff6a3d",
      short: "实时控制与双脑架构",
      desc: "ESP32 不做“大脑”，而是做确定性的小脑：电机、传感器、安全联锁与毫秒级响应。"
    },
    {
      id: "home",
      name: "智能空间",
      en: "SMART SPACES",
      color: "#59e3d3",
      short: "Matter、本地与能源",
      desc: "从继电器到存在感知，把房子变成可编程、可离线、可组合的物理接口。"
    },
    {
      id: "wearable",
      name: "穿戴与随身",
      en: "WEARABLE & PERSONAL",
      color: "#b8a1ff",
      short: "眼镜、手表与记录器",
      desc: "用手机做算力中继，用 ESP32 做传感器与连接，绕开穿戴设备的功耗和散热死结。"
    },
    {
      id: "industry",
      name: "工业与能源",
      en: "INDUSTRY & ENERGY",
      color: "#ffc94d",
      short: "充电、光伏与车辆",
      desc: "强电、协议与合规是门槛；一旦跨过去，ESP32 就是高价值设备里最便宜的智能层。"
    },
    {
      id: "field",
      name: "田野与环境",
      en: "FIELD & ENVIRONMENT",
      color: "#7ee787",
      short: "空气、土壤与离线通信",
      desc: "在没有稳定电源和网络的地方，低功耗、长续航与自组网比算力更重要。"
    },
    {
      id: "creative",
      name: "创意与工具",
      en: "CREATIVE & TOOLS",
      color: "#ff8ab3",
      short: "光、声音与生产力",
      desc: "当硬件成为内容入口，效果库、模板和社区预设会比 PCB 更能决定产品寿命。"
    }
  ],

  cases: [
    {
      id: "xiaozhi",
      name: "小智 AI",
      en: "XIAOZHI",
      org: "开源社区 / 虾哥",
      year: "2024",
      track: "ai",
      stage: "开源",
      chip: "ESP32-S3 / C3",
      tagline: "把大模型变成一只会说话的桌面伙伴",
      summary: "端侧唤醒 + 云端 LLM + MCP 工具调用的开源语音助手固件，催生了一整条 AI 玩具与陪伴硬件供应链。",
      why: "它证明消费级 AI 硬件的瓶颈不在模型，而在麦克风、回声消除、网络抖动和 2 秒内的反馈节奏。开源固件把“做一个 AI 玩具”的试错成本压到几百元。",
      specs: [
        ["交互", "1–2 秒端到端"],
        ["硬件", "¥100–200 量级"],
        ["生态", "多开发板适配"]
      ],
      stack: ["ESP-IDF", "ESP-SR", "Opus", "WebSocket", "MCP", "LVGL"],
      reuse: ["端云任务分工", "唤醒词与打断逻辑", "MCP 工具调用协议"],
      tags: ["语音陪伴", "AI 玩具", "开源"],
      image: "https://opengraph.githubassets.com/1/78/xiaozhi-esp32",
      imageAlt: "小智 AI 开源项目封面",
      imageCredit: "GitHub / 78/xiaozhi-esp32",
      imageKind: "project",
      source: "https://github.com/78/xiaozhi-esp32",
      sourceName: "GitHub · xiaozhi-esp32"
    },
    {
      id: "sparkbot",
      name: "ESP-SparkBot",
      en: "ESP-SPARKBOT",
      org: "Espressif",
      year: "2025",
      track: "ai",
      stage: "参考",
      chip: "ESP32-S3-WROOM-1",
      tagline: "一只会看、会听、会走的桌面机器人",
      summary: "乐鑫用 1.54 英寸屏、OV2640、麦克风与轮组，把多模态交互做成可复制的开源硬件 reference。",
      why: "关键不是“机器人”，而是把语音、视觉、运动、USB 副屏四种外设负载压在一颗 S3 上，并给出完整电源与结构设计。",
      specs: [
        ["视觉", "OV2640 摄像头"],
        ["运动", "BMI270 + 轮组"],
        ["续航", "2000mAh 电池"]
      ],
      stack: ["ESP-IDF", "ESP-WHO", "ESP-SR", "ESP-NOW", "USB"],
      reuse: ["多外设电源域", "折叠摄像头结构", "语音控制运动"],
      tags: ["多模态", "桌面机器人", "开源硬件"],
      image: "https://developer.espressif.com/blog/2025/04/esp32-s3-sparkbot/ESP-SparkBot-featured_hu_e6674f327dbaa8b1.webp",
      imageAlt: "ESP-SparkBot 桌面机器人",
      imageCredit: "Espressif Developer Portal",
      imageKind: "photo",
      video: { type: "bilibili", id: "av113565696727533", title: "ESP-SparkBot：ESP32 大模型桌面机器人" },
      source: "https://developer.espressif.com/blog/2025/04/esp32-s3-sparkbot/",
      sourceName: "Espressif · ESP-SparkBot"
    },
    {
      id: "stackchan",
      name: "Stack-chan",
      en: "STACK-CHAN",
      org: "Shinya Ishikawa / M5Stack",
      year: "2021",
      track: "ai",
      stage: "量产",
      chip: "M5Stack CoreS3",
      tagline: "开源的“表情包机器人”，可爱是交互协议",
      summary: "JavaScript 驱动的桌面小机器人，用 3D 打印外壳、舵机和 MOD 应用生态，把硬件变成内容平台。",
      why: "它把“情感表达”拆成可编程的眼球、嘴型和头部动作，开发者不需要训练模型就能做出有生命感的反馈。",
      specs: [
        ["主控", "M5Stack CoreS3"],
        ["固件", "Moddable JS"],
        ["结构", "3D 打印 + 舵机"]
      ],
      stack: ["Moddable SDK", "JavaScript", "Servo", "BLE / Wi-Fi"],
      reuse: ["表情状态机", "MOD 插件体系", "低成本舵机云台"],
      tags: ["情感交互", "开源 IP", "桌面机器人"],
      image: "https://raw.githubusercontent.com/stack-chan/stack-chan/main/docs/images/stackchan.gif",
      imageAlt: "Stack-chan 桌面机器人动画",
      imageCredit: "GitHub / stack-chan",
      imageKind: "photo",
      video: { type: "youtube", id: "fZb_mF08xV0", title: "Stack-chan official demo" },
      source: "https://github.com/stack-chan/stack-chan",
      sourceName: "GitHub · stack-chan"
    },
    {
      id: "ha-voice",
      name: "Home Assistant Voice PE",
      en: "VOICE PE",
      org: "Nabu Casa",
      year: "2024",
      track: "ai",
      stage: "量产",
      chip: "ESP32-S3",
      tagline: "一个物理开关，把隐私做成卖点",
      summary: "为 Home Assistant 打造的开源语音终端：双麦 + XMOS XU316 音频前端 + ESP32-S3，支持本地唤醒与云端/本地语音。",
      why: "它把“语音硬件”拆成音频前端、网络 MCU、主机编排三段，并用物理 mute 开关解决用户最深的隐私焦虑。",
      specs: [
        ["音频", "XMOS XU316"],
        ["存储", "16MB Flash / 8MB PSRAM"],
        ["价格", "$69 建议零售价"]
      ],
      stack: ["ESPHome", "XMOS", "I2S", "microWakeWord", "Home Assistant"],
      reuse: ["音频前端独立", "物理隐私开关", "完全开源固件"],
      tags: ["本地语音", "隐私", "Home Assistant"],
      image: "https://www.home-assistant.io/images/voice-pe/vpe-top.webp",
      imageAlt: "Home Assistant Voice Preview Edition 产品图",
      imageCredit: "Home Assistant / Nabu Casa",
      imageKind: "photo",
      video: { type: "youtube", id: "Jtxw6cWn2eg", title: "Home Assistant Voice PE setup" },
      source: "https://www.home-assistant.io/voice-pe/",
      sourceName: "Home Assistant · Voice PE"
    },
    {
      id: "tab5",
      name: "M5Stack Tab5",
      en: "TAB5",
      org: "M5Stack",
      year: "2025",
      track: "ai",
      stage: "开发板",
      chip: "ESP32-P4 + C6",
      tagline: "P4 把“边缘 HMI”做成一块平板",
      summary: "P4 负责 MIPI 显示、摄像头与实时 UI，C6 负责 Wi-Fi 6 / Thread，是“主控 + 连接”双芯架构的典型样板。",
      why: "当产品需要高分辨率 UI、视频与多摄像头，ESP32-S3 的算力和总线开始吃紧；P4+C6 给出了无需 Linux 的中高端方案。",
      specs: [
        ["显示", "MIPI DSI 触屏"],
        ["连接", "Wi-Fi 6 + 802.15.4"],
        ["扩展", "RS485 / CAN"]
      ],
      stack: ["ESP-IDF", "LVGL", "MIPI CSI / DSI", "ESP-Hosted"],
      reuse: ["P4 + C6 双芯分工", "MIPI 显示链路", "工业接口"],
      tags: ["边缘 HMI", "P4", "双芯"],
      image: "https://i1.hdslb.com/bfs/archive/8a21ac08c7a00824867a76f7fe6fb41e96f1bdc4.jpg",
      imageAlt: "M5Stack Tab5 运行 LVGL 全高清 UI 演示",
      imageCredit: "Bilibili / RoCry 的小号",
      imageKind: "photo",
      video: { type: "bilibili", id: "BV1XfjGzEED1", title: "M5Stack Tab5 LVGL UI demo" },
      source: "https://docs.m5stack.com/en/core/Tab5",
      sourceName: "M5Stack Docs · Tab5"
    },
    {
      id: "box3",
      name: "ESP32-S3-BOX-3",
      en: "BOX-3",
      org: "Espressif",
      year: "2023",
      track: "ai",
      stage: "开发板",
      chip: "ESP32-S3",
      tagline: "语音助手的“参考答案”",
      summary: "2.4 英寸触屏、双麦、扬声器、PCIe 扩展底座，官方开源硬件与 ESP-BOX 固件，是很多语音产品的起点。",
      why: "它把远场拾音、唤醒、命令词、屏幕反馈和 Matter / Home Assistant 接入打包成一套可跑的 demo，降低定义阶段的试错。",
      specs: [
        ["屏幕", "2.4\" 320×240"],
        ["存储", "16MB Flash + 16MB PSRAM"],
        ["扩展", "PCIe 底座"]
      ],
      stack: ["ESP-BOX", "ESP-SR", "LVGL", "Matter"],
      reuse: ["远场语音参考", "扩展底座", "UI 状态机"],
      tags: ["语音开发板", "参考设计", "Matter"],
      image: "https://docs.espressif.com/projects/esp-board-manager/zh_CN/latest/_images/esp32_s3_box_3.png",
      imageAlt: "ESP32-S3-BOX-3 开发板",
      imageCredit: "Espressif Docs",
      imageKind: "photo",
      source: "https://www.espressif.com/en/products/devkits/esp32-s3-box-3",
      sourceName: "Espressif · ESP32-S3-BOX-3"
    },
    {
      id: "eye",
      name: "ESP32-S3-EYE",
      en: "S3-EYE",
      org: "Espressif",
      year: "2021",
      track: "ai",
      stage: "开发板",
      chip: "ESP32-S3",
      tagline: "200 万像素的本地视觉入口",
      summary: "摄像头 + LCD + 数字麦 + 8MB PSRAM 的 AI 视觉开发板，官方 ESP-WHO 支持人脸检测、识别与运动侦测。",
      why: "对多数产品来说，视觉不需要“理解世界”，只需要在本地判断“有没有人、是不是熟人、有没有动”，这颗板子刚好覆盖。",
      specs: [
        ["摄像头", "OV2640 2MP"],
        ["存储", "8MB Flash + 8MB PSRAM"],
        ["显示", "1.3\" LCD"]
      ],
      stack: ["ESP-WHO", "ESP-DL", "ESP-IDF"],
      reuse: ["本地人脸门禁", "低功耗唤醒", "摄像头供电隔离"],
      tags: ["视觉 AI", "人脸识别", "开发板"],
      image: "https://docs.espressif.com/projects/esp-board-manager/zh_CN/latest/_images/ESP32-S3-EYE-isometric.png",
      imageAlt: "ESP32-S3-EYE 开发板",
      imageCredit: "Espressif Docs",
      imageKind: "photo",
      source: "https://docs.espressif.com/projects/esp-board-manager/zh_CN/latest/references/boards/esp32_s3_eye.html",
      sourceName: "Espressif Docs · ESP32-S3-EYE"
    },
    {
      id: "xiao-sense",
      name: "Seeed XIAO ESP32S3 Sense",
      en: "XIAO SENSE",
      org: "Seeed Studio",
      year: "2023",
      track: "wearable",
      stage: "开发板",
      chip: "ESP32-S3",
      tagline: "拇指大小的 AI 相机",
      summary: "21×17.5mm 的 S3 模组，板载 OV2640、数字麦克风、SD 卡槽与天线，适合穿戴与空间受限的视觉/语音原型。",
      why: "它把“摄像头 + 麦克风 + 存储 + 无线”压缩到一枚硬币大小，让 AI 眼镜、胸牌、宠物追踪等形态可以先做出来再谈定制 PCB。",
      specs: [
        ["尺寸", "21×17.5mm"],
        ["摄像头", "OV2640"],
        ["存储", "8MB PSRAM + microSD"]
      ],
      stack: ["Arduino", "ESP-IDF", "Edge Impulse", "TinyML"],
      reuse: ["极小尺寸堆叠", "摄像头排线", "电池供电"],
      tags: ["微型视觉", "穿戴原型", "TinyML"],
      image: "",
      imageAlt: "Seeed XIAO ESP32S3 Sense 编辑图形",
      imageCredit: "EDGE32 编辑图形 / 非产品照片",
      imageKind: "poster",
      source: "https://wiki.seeedstudio.com/xiao_esp32s3_getting_started/",
      sourceName: "Seeed Wiki · XIAO ESP32S3"
    },
    {
      id: "esp-drone",
      name: "ESP-Drone",
      en: "ESP-DRONE",
      org: "Espressif",
      year: "2019",
      track: "robotics",
      stage: "开源",
      chip: "ESP32",
      tagline: "用 Wi-Fi 控制的四轴飞行器",
      summary: "基于 ESP32 的开源无人机，手机/手柄通过 Wi-Fi 发指令，板载 IMU、气压计与可选光流，是“无线 MCU 做实时控制”的极限案例。",
      why: "飞控对时序、功耗和无线共存极其苛刻；它能飞，说明 ESP32 的 PWM、I2C 与 FreeRTOS 调度足以承担中等实时性控制。",
      specs: [
        ["控制", "Wi-Fi UDP"],
        ["传感", "IMU + 气压计"],
        ["扩展", "光流 / 测距"]
      ],
      stack: ["ESP-IDF", "FreeRTOS", "PID", "Wi-Fi"],
      reuse: ["实时控制环", "无线调参", "失控保护"],
      tags: ["无人机", "实时控制", "开源"],
      image: "https://opengraph.githubassets.com/1/espressif/esp-drone",
      imageAlt: "ESP-Drone 开源项目封面",
      imageCredit: "GitHub / espressif/esp-drone",
      imageKind: "project",
      source: "https://github.com/espressif/esp-drone",
      sourceName: "GitHub · esp-drone"
    },
    {
      id: "fofoca",
      name: "FOFOCA",
      en: "FOFOCA",
      org: "ThinkNEO / Espressif community",
      year: "2026",
      track: "robotics",
      stage: "参考",
      chip: "ESP32 + ESP32-C3",
      tagline: "机器人“双脑”：Linux 决策，MCU 执行",
      summary: "Pi 5 负责视觉/语音/LLM，ESP32 负责电机与传感器，C3 负责状态屏；一套四层、可审计的家庭机器人参考架构。",
      why: "它明确回答了“ESP32 能不能做机器人大脑”：不能，也不该；它应该做实时小脑，把不确定的 AI 留给 Linux 与边缘服务器。",
      specs: [
        ["分层", "4 层架构"],
        ["控制", "PWM + 传感器"],
        ["通信", "BLE + MQTT"]
      ],
      stack: ["Arduino", "MQTT", "BLE", "Raspberry Pi", "Ollama"],
      reuse: ["双脑分工", "状态可视化", "失效降级"],
      tags: ["家庭机器人", "双脑", "参考架构"],
      image: "https://developer.espressif.com/blog/2026/05/fofoca-esp32-ai-robot/featured_hu_6e81726ae79eeb0a.webp",
      imageAlt: "FOFOCA 机器人参考架构",
      imageCredit: "Espressif Developer Portal",
      imageKind: "photo",
      source: "https://developer.espressif.com/blog/2026/05/fofoca-esp32-ai-robot/",
      sourceName: "Espressif · FOFOCA"
    },
    {
      id: "roarm",
      name: "RoArm-M2-S",
      en: "ROARM",
      org: "Waveshare",
      year: "2023",
      track: "robotics",
      stage: "量产",
      chip: "ESP32",
      tagline: "桌面级机械臂的“开箱即用”",
      summary: "ESP32 驱动的多自由度桌面机械臂，支持 Wi-Fi/HTTP 控制、图形化上位机与 ROS 2 接入，面向教育与轻量自动化。",
      why: "它把机械臂从“工业设备”变成“桌面外设”，用 Web 工具和 JSON 协议降低二次开发门槛，适合作为机器人产品的运动控制底座。",
      specs: [
        ["控制", "Wi-Fi + HTTP"],
        ["结构", "多自由度"],
        ["生态", "ROS 2 / Python"]
      ],
      stack: ["ESP32", "Arduino", "HTTP", "ROS 2"],
      reuse: ["关节校准", "运动学封装", "Web 控制台"],
      tags: ["机械臂", "教育", "ROS 2"],
      image: "",
      imageAlt: "RoArm-M2-S 编辑图形",
      imageCredit: "EDGE32 编辑图形 / 非产品照片",
      imageKind: "poster",
      source: "https://www.waveshare.com/wiki/RoArm-M2-S",
      sourceName: "Waveshare Wiki · RoArm-M2-S"
    },
    {
      id: "grbl",
      name: "grbl_ESP32",
      en: "GRBL_ESP32",
      org: "Bart Dring / open source",
      year: "2019",
      track: "robotics",
      stage: "开源",
      chip: "ESP32",
      tagline: "让 ESP32 控制机床",
      summary: "把 Grbl 的 G-code 运动控制移植到 ESP32，支持多轴、主轴 PWM、限位、探针与 Web UI，广泛用于 CNC、激光与绘图机。",
      why: "它证明了 ESP32 不只能“联网”，还能承担硬实时步进脉冲；对想做桌面制造设备的团队，这是最短的固件路径。",
      specs: [
        ["控制", "多轴步进"],
        ["接口", "限位 / 探针 / 主轴"],
        ["生态", "CNC / Laser"]
      ],
      stack: ["Grbl", "ESP-IDF", "Web UI", "Stepper"],
      reuse: ["步进时序", "G-code 解释", "安全限位"],
      tags: ["CNC", "运动控制", "开源固件"],
      image: "https://opengraph.githubassets.com/1/bdring/Grbl_Esp32",
      imageAlt: "grbl_ESP32 项目封面",
      imageCredit: "GitHub / bdring/Grbl_Esp32",
      imageKind: "project",
      source: "https://github.com/bdring/Grbl_Esp32",
      sourceName: "GitHub · Grbl_Esp32"
    },
    {
      id: "air1",
      name: "Apollo AIR-1",
      en: "AIR-1",
      org: "Apollo Automation",
      year: "2024",
      track: "home",
      stage: "量产",
      chip: "ESP32-C3",
      tagline: "为 Home Assistant 而生的空气站",
      summary: "ESPHome 原生、PM2.5 / VOC / 温湿度多传感器融合的小型空气质量监测器，支持本地自动化与蓝牙代理。",
      why: "它把“传感器堆叠”做成可维护的产品：统一供电、风道、校准与 OTA，而不是把开发板塞进盒子。",
      specs: [
        ["主控", "ESP32-C3"],
        ["传感", "PM2.5 + VOC + 温湿"],
        ["生态", "ESPHome 原生"]
      ],
      stack: ["ESPHome", "I2C / UART", "Home Assistant"],
      reuse: ["风道与校准", "多传感器融合", "本地自动化"],
      tags: ["空气质量", "ESPHome", "本地优先"],
      image: "",
      imageAlt: "Apollo AIR-1 编辑图形",
      imageCredit: "EDGE32 编辑图形 / 非产品照片",
      imageKind: "poster",
      source: "https://apolloautomation.com/products/air-1",
      sourceName: "Apollo Automation · AIR-1"
    },
    {
      id: "shelly",
      name: "Shelly Plus 1PM",
      en: "SHELLY 1PM",
      org: "Shelly",
      year: "2021",
      track: "home",
      stage: "量产",
      chip: "ESP32",
      tagline: "把继电器做成可编程能源节点",
      summary: "16A 继电器 + 功率计量 + Wi-Fi/BLE + 本地 API，全球出货量级的智能开关，也是 ESP32 商业化最成熟的形态之一。",
      why: "用户不为“芯片”买单，而为“能装进底盒、能计量、能离线工作、能接入任何平台”买单；这是 ESP32 产品化的基准线。",
      specs: [
        ["负载", "16A 继电器"],
        ["计量", "功率 / 电量"],
        ["协议", "Wi-Fi + BLE + 本地 API"]
      ],
      stack: ["Shelly firmware", "MQTT", "HTTP", "BLE"],
      reuse: ["强弱电隔离", "计量校准", "本地 fallback"],
      tags: ["智能开关", "能源计量", "量产"],
      image: "",
      imageAlt: "Shelly Plus 1PM 编辑图形",
      imageCredit: "EDGE32 编辑图形 / 非产品照片",
      imageKind: "poster",
      source: "https://www.shelly.com/products/shelly-plus-1-pm",
      sourceName: "Shelly · Plus 1PM"
    },
    {
      id: "ratgdo",
      name: "ratgdo",
      en: "RATGDO",
      org: "ratgdo / community",
      year: "2023",
      track: "home",
      stage: "小批量",
      chip: "ESP32 系列",
      tagline: "用一个盒子接管车库门",
      summary: "通过逆向 Security+ 2.0 协议控制主流车库门电机，本地接入 Home Assistant，不依赖云。",
      why: "这是“单点痛点 + 极窄场景 + 社区分发”的典型：硬件不复杂，价值在于协议知识、安装体验与对云依赖的反抗。",
      specs: [
        ["兼容", "Security+ 2.0"],
        ["接入", "本地 Home Assistant"],
        ["形态", "小批量套件"]
      ],
      stack: ["ESPHome", "MQTT", "Home Assistant"],
      reuse: ["协议逆向", "安装指南", "社区固件"],
      tags: ["车库门", "协议逆向", "本地控制"],
      image: "https://opengraph.githubassets.com/1/ratgdo/esphome-ratgdo",
      imageAlt: "ratgdo 项目封面",
      imageCredit: "GitHub / ratgdo",
      imageKind: "project",
      source: "https://ratgdo.com/",
      sourceName: "ratgdo.com"
    },
    {
      id: "esp-csi",
      name: "ESP-CSI",
      en: "ESP-CSI",
      org: "Espressif",
      year: "2021",
      track: "home",
      stage: "参考",
      chip: "ESP32 / C3 / C6",
      tagline: "用 Wi-Fi 信号“看见”人",
      summary: "利用信道状态信息（CSI）做存在检测、呼吸/跌倒与手势识别，不需要摄像头，成本接近一颗普通 Wi-Fi MCU。",
      why: "隐私友好、可穿墙、无佩戴，是养老与酒店场景的潜在杀手级感知；难点在标注、环境泛化与误报控制。",
      specs: [
        ["感知", "CSI 幅相"],
        ["优势", "无摄像头 / 无穿戴"],
        ["难点", "环境泛化"]
      ],
      stack: ["ESP-IDF", "CSI", "DSP", "TinyML"],
      reuse: ["数据采集", "特征工程", "场景校准"],
      tags: ["Wi-Fi 感知", "养老", "无摄像头"],
      image: "https://opengraph.githubassets.com/1/espressif/esp-csi",
      imageAlt: "ESP-CSI 项目封面",
      imageCredit: "GitHub / espressif/esp-csi",
      imageKind: "project",
      source: "https://github.com/espressif/esp-csi",
      sourceName: "GitHub · esp-csi"
    },
    {
      id: "openglass",
      name: "OpenGlass",
      en: "OPENGLASS",
      org: "Based Hardware",
      year: "2024",
      track: "wearable",
      stage: "开源",
      chip: "ESP32-S3",
      tagline: "把任何眼镜变成 AI 眼镜",
      summary: "摄像头 + 电池 + S3 的开源 AI 眼镜方案，通过手机转发视觉请求，项目后续并入 Omi 生态。",
      why: "它用“手机作为算力中继”绕开眼镜的功耗/散热死结，证明可穿戴 AI 的第一阶段不是独立计算，而是传感器 + 连接。",
      specs: [
        ["主控", "ESP32-S3"],
        ["形态", "夹式 / 镜腿"],
        ["交互", "语音 + 拍照"]
      ],
      stack: ["Arduino", "Camera", "BLE", "Phone relay"],
      reuse: ["手机中继", "低功耗唤醒", "模块化镜腿"],
      tags: ["AI 眼镜", "穿戴", "开源"],
      image: "https://opengraph.githubassets.com/1/BasedHardware/OpenGlass",
      imageAlt: "OpenGlass 开源 AI 眼镜项目封面",
      imageCredit: "GitHub / OpenGlass",
      imageKind: "project",
      source: "https://github.com/BasedHardware/OpenGlass",
      sourceName: "GitHub · OpenGlass"
    },
    {
      id: "twatch",
      name: "LILYGO T-Watch S3",
      en: "T-WATCH S3",
      org: "LILYGO",
      year: "2022",
      track: "wearable",
      stage: "开发板",
      chip: "ESP32-S3",
      tagline: "一块可以改固件的手表",
      summary: "1.54 英寸触屏、IMU、RTC、麦克风/扬声器与丰富 GPIO 的开源手表开发板，适合穿戴交互与健康传感原型。",
      why: "手表形态把“屏幕、电池、佩戴、天线”四个工程难题打包，适合验证通知、语音、运动识别等场景，而不是从零做结构。",
      specs: [
        ["屏幕", "1.54\" 240×240"],
        ["主控", "ESP32-S3"],
        ["扩展", "LoRa / GPS 版本"]
      ],
      stack: ["Arduino", "LVGL", "Wi-Fi / BLE"],
      reuse: ["穿戴电源", "屏幕常亮", "表带天线"],
      tags: ["智能手表", "穿戴原型", "开源"],
      image: "",
      imageAlt: "LILYGO T-Watch S3 编辑图形",
      imageCredit: "EDGE32 编辑图形 / 非产品照片",
      imageKind: "poster",
      source: "https://www.lilygo.cc/products/t-watch-s3",
      sourceName: "LILYGO · T-Watch S3"
    },
    {
      id: "opendtu",
      name: "OpenDTU",
      en: "OPENDTU",
      org: "OpenDTU community",
      year: "2022",
      track: "industry",
      stage: "开源",
      chip: "ESP32",
      tagline: "把太阳能逆变器接进 Home Assistant",
      summary: "用 ESP32 + 2.4GHz 射频模块读取 Hoymiles 等微型逆变器数据，提供 Web UI、MQTT 与 Home Assistant 自动发现。",
      why: "能源监测的痛点是“协议封闭 + 安装复杂”；OpenDTU 用一个 10 美元级的盒子替代厂商网关，是社区硬件替代商业网关的范本。",
      specs: [
        ["主控", "ESP32"],
        ["射频", "nRF24 / CMT2300A"],
        ["接入", "MQTT + HA"]
      ],
      stack: ["ESP-IDF", "Arduino", "MQTT", "Home Assistant"],
      reuse: ["无线协议解析", "即插即用配网", "能源面板"],
      tags: ["光伏", "能源监测", "社区硬件"],
      image: "https://opengraph.githubassets.com/1/tbnobody/OpenDTU",
      imageAlt: "OpenDTU 项目封面",
      imageCredit: "GitHub / tbnobody/OpenDTU",
      imageKind: "project",
      source: "https://github.com/tbnobody/OpenDTU",
      sourceName: "GitHub · OpenDTU"
    },
    {
      id: "openevse",
      name: "OpenEVSE",
      en: "OPENEVSE",
      org: "OpenEVSE",
      year: "2011 / ESP32 网关 2019",
      track: "industry",
      stage: "量产",
      chip: "ESP32",
      tagline: "开源电动车充电桩的“大脑”",
      summary: "开源 EVSE 控制器与 ESP32 Wi-Fi 网关，支持预约充电、电流调节、太阳能余电充电与 OCPP 后端。",
      why: "它把强电安全、计量、协议与云连接分层，证明 ESP32 可以在高价值、强合规的基础设施里承担连接与策略层。",
      specs: [
        ["主控", "ESP32 网关"],
        ["功率", "AC Level 2"],
        ["协议", "OCPP / MQTT"]
      ],
      stack: ["ESP32", "OpenEVSE", "OCPP", "MQTT"],
      reuse: ["强电隔离", "充电状态机", "太阳能联动"],
      tags: ["电动车", "充电桩", "开源"],
      image: "",
      imageAlt: "OpenEVSE 编辑图形",
      imageCredit: "EDGE32 编辑图形 / 非产品照片",
      imageKind: "poster",
      source: "https://openevse.com/",
      sourceName: "OpenEVSE"
    },
    {
      id: "freematics",
      name: "Freematics ONE+",
      en: "FREEMATICS ONE+",
      org: "Freematics",
      year: "2018",
      track: "industry",
      stage: "量产",
      chip: "ESP32",
      tagline: "插进 OBD 口的数据记录器",
      summary: "ESP32 车载 telematics 硬件，读取 OBD-II / CAN、GPS、IMU，支持 4G/LTE 与 SD 存储，用于车队管理与保险 telematics。",
      why: "车辆是极端电磁与电源环境；能在这里稳定工作，说明 ESP32 的 CAN 控制器、宽压电源与休眠策略足以支撑工业级产品。",
      specs: [
        ["接口", "OBD-II / CAN"],
        ["定位", "GPS"],
        ["通信", "4G 可选"]
      ],
      stack: ["Arduino", "CAN", "GPS", "MQTT"],
      reuse: ["宽压与抛负载", "车辆休眠", "数据补传"],
      tags: ["车联网", "OBD", "telematics"],
      image: "",
      imageAlt: "Freematics ONE+ 编辑图形",
      imageCredit: "EDGE32 编辑图形 / 非产品照片",
      imageKind: "poster",
      source: "https://freematics.com/products/freematics-one-plus-model-b/",
      sourceName: "Freematics · ONE+"
    },
    {
      id: "airgradient",
      name: "AirGradient Open Air",
      en: "OPEN AIR",
      org: "AirGradient",
      year: "2021",
      track: "field",
      stage: "量产",
      chip: "ESP32-C3",
      tagline: "开源的户外空气质量站",
      summary: "开源硬件 + 开源固件的户外空气质量监测器，测量 PM2.5 / PM10、温湿度，部分版本支持 CO₂，支持本地/云端与开放数据地图。",
      why: "它把“传感器精度、防风雨结构、长期漂移、数据校准”做成完整产品，而不是一块开发板；这是环境类硬件的真正门槛。",
      specs: [
        ["主控", "ESP32-C3"],
        ["传感", "PM2.5 / PM10 / 温湿"],
        ["形态", "户外防护"]
      ],
      stack: ["ESPHome / Arduino", "LoRa / Wi-Fi", "Open data"],
      reuse: ["防风雨结构", "长期校准", "开放数据"],
      tags: ["空气质量", "户外", "开放硬件"],
      image: "",
      imageAlt: "AirGradient Open Air 编辑图形",
      imageCredit: "EDGE32 编辑图形 / 非产品照片",
      imageKind: "poster",
      source: "https://www.airgradient.com/open-air/",
      sourceName: "AirGradient · Open Air"
    },
    {
      id: "meshtastic",
      name: "Meshtastic",
      en: "MESHTASTIC",
      org: "Meshtastic",
      year: "2020",
      track: "field",
      stage: "生态",
      chip: "ESP32 + LoRa",
      tagline: "没有基站，也能发消息",
      summary: "基于 LoRa 的去中心化 mesh 通信生态，ESP32 负责协议、蓝牙配网与 GPS，设备可在无蜂窝网络时中继消息。",
      why: "它把“通信”从运营商手里拿走，形成硬件、固件、地图与社区的正循环；对户外、应急与农场场景极具吸引力。",
      specs: [
        ["通信", "LoRa mesh"],
        ["配网", "BLE"],
        ["续航", "数天–数周"]
      ],
      stack: ["LoRa", "BLE", "MQTT", "GPS"],
      reuse: ["低功耗中继", "蓝牙配网", "社区地图"],
      tags: ["LoRa", "离线通信", "应急"],
      image: "https://opengraph.githubassets.com/1/meshtastic/meshtastic",
      imageAlt: "Meshtastic 项目封面",
      imageCredit: "GitHub / meshtastic",
      imageKind: "project",
      source: "https://meshtastic.org/",
      sourceName: "Meshtastic"
    },
    {
      id: "wled",
      name: "WLED",
      en: "WLED",
      org: "WLED community",
      year: "2019",
      track: "creative",
      stage: "开源",
      chip: "ESP32 / ESP8266",
      tagline: "让每一颗 LED 都可编程",
      summary: "现象级开源 LED 控制固件，支持 WS2812B、多段灯带、2D 矩阵、音乐律动与 Home Assistant，装机量以百万计。",
      why: "它的护城河不是代码，而是“效果库 + 配置界面 + 社区预设”的内容生态；硬件只是入口，效果才是复购理由。",
      specs: [
        ["灯带", "WS2812B / 多协议"],
        ["控制", "Web / API / MQTT"],
        ["生态", "预设与 2D 矩阵"]
      ],
      stack: ["Arduino", "FastLED", "MQTT", "Home Assistant"],
      reuse: ["效果引擎", "配网界面", "社区内容"],
      tags: ["LED", "氛围灯", "开源"],
      image: "https://opengraph.githubassets.com/1/wled/WLED",
      imageAlt: "WLED 项目封面",
      imageCredit: "GitHub / wled/WLED",
      imageKind: "project",
      source: "https://kno.wled.ge/",
      sourceName: "WLED Docs"
    },
    {
      id: "cardputer",
      name: "M5Stack Cardputer",
      en: "CARDPUTER",
      org: "M5Stack",
      year: "2024",
      track: "creative",
      stage: "开发板",
      chip: "ESP32-S3",
      tagline: "口袋里的键盘电脑",
      summary: "带 QWERTY 键盘、1.14 英寸屏、麦克风、扬声器与 Grove 扩展的 S3 掌上终端，适合做便携工具、遥控器与 AI 输入设备。",
      why: "它把“输入”重新带回硬件：在语音之外，键盘仍然是效率场景最可靠的交互；Cardputer 是 AI 硬件的“输入侧”答案。",
      specs: [
        ["屏幕", "1.14\" 240×135"],
        ["输入", "QWERTY + IMU"],
        ["扩展", "Grove + microSD"]
      ],
      stack: ["Arduino", "LVGL", "BLE / Wi-Fi"],
      reuse: ["键盘矩阵", "便携电源", "快捷指令"],
      tags: ["掌上终端", "AI 输入", "开发板"],
      image: "",
      imageAlt: "M5Stack Cardputer 编辑图形",
      imageCredit: "EDGE32 编辑图形 / 非产品照片",
      imageKind: "poster",
      source: "https://docs.m5stack.com/en/core/Cardputer",
      sourceName: "M5Stack Docs · Cardputer"
    },
    {
      id: "trmnl",
      name: "TRMNL",
      en: "TRMNL",
      org: "TRMNL",
      year: "2024",
      track: "creative",
      stage: "量产",
      chip: "ESP32-C3",
      tagline: "一块只显示“重要信息”的墨水屏",
      summary: "7.5 英寸 e-ink 仪表盘，电池供电、Wi-Fi 同步，用极低功耗把日历、天气、指标从手机里“拿出来”。",
      why: "它反其道而行：不追求彩色高刷，而是用墨水屏的“限制”换续航与专注，是反注意力经济的产品定义。",
      specs: [
        ["屏幕", "7.5\" e-ink"],
        ["主控", "ESP32-C3"],
        ["续航", "数月级"]
      ],
      stack: ["ESP32-C3", "E-ink", "Wi-Fi", "Web dashboard"],
      reuse: ["低功耗刷新", "内容模板", "电池管理"],
      tags: ["墨水屏", "专注", "低功耗"],
      image: "",
      imageAlt: "TRMNL 编辑图形",
      imageCredit: "EDGE32 编辑图形 / 非产品照片",
      imageKind: "poster",
      source: "https://usetrmnl.com/",
      sourceName: "TRMNL"
    }
  ],

  videos: [
    {
      id: "ha-voice",
      title: "Home Assistant Voice PE：开箱与设置",
      source: "YouTube",
      type: "youtube",
      videoId: "Jtxw6cWn2eg",
      duration: "WATCH",
      cover: "https://www.home-assistant.io/images/voice-pe/features/controls.webp",
      caseId: "ha-voice",
      note: "双麦、旋钮与物理静音开关，是这款产品最值得学的三个细节。"
    },
    {
      id: "stackchan",
      title: "Stack-chan：一只开源机器人的生命感",
      source: "YouTube",
      type: "youtube",
      videoId: "fZb_mF08xV0",
      duration: "WATCH",
      cover: "https://raw.githubusercontent.com/stack-chan/stack-chan/main/docs/images/stackchan.gif",
      caseId: "stackchan",
      note: "表情、舵机与声音的同步，比“更聪明的模型”更快建立情感连接。"
    },
    {
      id: "sparkbot",
      title: "ESP-SparkBot：ESP32 大模型桌面机器人",
      source: "Bilibili",
      type: "bilibili",
      videoId: "av113565696727533",
      duration: "WATCH",
      cover: "https://i1.hdslb.com/bfs/archive/fc8b8268c0f60ea6825eff655a49c3d37b8158c6.jpg",
      caseId: "sparkbot",
      note: "乐鑫社区演示：语音、视觉、轮组与 USB 副屏在一颗 S3 上跑通。"
    },
    {
      id: "tab5",
      title: "M5Stack Tab5：P4 上的 LVGL 界面",
      source: "Bilibili",
      type: "bilibili",
      videoId: "BV1XfjGzEED1",
      duration: "WATCH",
      cover: "https://i1.hdslb.com/bfs/archive/8a21ac08c7a00824867a76f7fe6fb41e96f1bdc4.jpg",
      caseId: "tab5",
      note: "当 UI 需要 60fps 与高分辨率，双芯架构开始变得合理。"
    }
  ],

  featured: [
    {
      id: "ha-voice",
      kicker: "CASE 01 / LOCAL VOICE",
      title: "把“隐私”做成一个可以摸到的开关",
      subtitle: "Home Assistant Voice PE · Nabu Casa · 2024",
      lede: "在一众“更聪明”的语音助手之间，Voice PE 用最工程化的方式赢了信任：双麦阵列、专用音频前端、物理 mute、完全开源的固件，以及一个 69 美元的诚实价格。",
      decisions: [
        ["把音频前端交给 XMOS", "回声消除、降噪、自动增益不占用 ESP32-S3 的算力，S3 只负责网络、唤醒词与设备编排。"],
        ["隐私必须是物理的", "mute 开关直接切断麦克风供电，而不是软件静音；这个细节比任何隐私政策都更有说服力。"],
        ["把固件和硬件都开源", "ESPHome + 开源 PCB，让社区可以修、可以改、可以延长产品寿命，也把支持成本外包给了生态。"]
      ],
      architecture: [
        ["双麦阵列", "模拟 / I2S"],
        ["XMOS XU316", "AEC / NS / AGC"],
        ["ESP32-S3", "唤醒 / 网络 / 编排"],
        ["Home Assistant", "STT / LLM / TTS"]
      ],
      reuse: ["音频前端独立", "物理 mute", "ESPHome 开源固件", "Grove 扩展"],
      source: "https://www.home-assistant.io/voice-pe/",
      sourceName: "Home Assistant · Voice PE",
      image: "https://www.home-assistant.io/images/voice-pe/vpe-top.webp",
      imageAlt: "Home Assistant Voice Preview Edition",
      imageCredit: "Home Assistant / Nabu Casa",
      price: "$69",
      chip: "ESP32-S3 + XMOS XU316",
      video: { type: "youtube", id: "Jtxw6cWn2eg", title: "Home Assistant Voice PE setup" }
    },
    {
      id: "xiaozhi",
      kicker: "CASE 02 / AI COMPANION",
      title: "20 美元的硬件，如何卖出“陪伴感”",
      subtitle: "小智 AI · 开源社区 · 2024–2026",
      lede: "小智没有发明新的模型，也没有发明新的芯片。它做对的是把“唤醒词、流式语音、LLM、TTS、MCP 工具、OTA”串成一条能在廉价硬件上稳定运行的链路，然后把整条链路开源。",
      decisions: [
        ["端侧只做确定的事", "唤醒词、VAD、Opus 编解码留在本地；语义理解交给云端 LLM，避免在 MCU 上硬跑大模型。"],
        ["用 MCP 把“动作”标准化", "天气、音乐、智能家居、表情动作都变成工具调用，硬件能力可以随服务端升级，而不是每次刷固件。"],
        ["把 BOM 压到极限", "S3/C3 + 麦克风 + 小屏 + 喇叭即可起步，让硬件团队先验证交互，再迭代外观与结构。"]
      ],
      architecture: [
        ["麦克风", "VAD / 唤醒"],
        ["ESP32-S3", "Opus / WebSocket"],
        ["云端 LLM", "意图 / 工具调用"],
        ["TTS + 舵机", "声音 / 表情"]
      ],
      reuse: ["端云分工", "流式语音", "MCP 工具调用", "低成本 BOM"],
      source: "https://github.com/78/xiaozhi-esp32",
      sourceName: "GitHub · xiaozhi-esp32",
      image: "https://opengraph.githubassets.com/1/78/xiaozhi-esp32",
      imageAlt: "小智 AI 开源项目",
      imageCredit: "GitHub / 78/xiaozhi-esp32",
      price: "¥100–200 BOM",
      chip: "ESP32-S3 / C3"
    },
    {
      id: "tab5",
      kicker: "CASE 03 / EDGE HMI",
      title: "当 UI 变成产品的主界面",
      subtitle: "M5Stack Tab5 · ESP32-P4 + C6 · 2025",
      lede: "P4 的出现，让“没有 Linux 的高端 HMI”第一次变得合理：MIPI DSI、摄像头、H.264、双核 RISC-V，再用 C6 补上 Wi-Fi 6 与 Thread。它不是在替代树莓派，而是在替代“树莓派 + 太多外围”的方案。",
      decisions: [
        ["主控与连接分家", "P4 专注显示、视觉与实时 UI；C6 通过 ESP-Hosted 提供 Wi-Fi 6 / BLE / 802.15.4，射频与协议栈解耦。"],
        ["用 MIPI 换体验", "高分辨率、高刷新率的 UI 需要 MIPI DSI；SPI 屏在中高端产品上会越来越吃力。"],
        ["保留工业接口", "RS485、CAN、Grove 与 USB 让 Tab5 不只是一块平板，而是设备的主控面板。"]
      ],
      architecture: [
        ["摄像头", "MIPI CSI"],
        ["ESP32-P4", "ISP / UI / H.264"],
        ["ESP32-C6", "Wi-Fi 6 / Thread"],
        ["显示与扩展", "MIPI DSI / RS485"]
      ],
      reuse: ["P4 + C6 双芯", "MIPI 显示", "ESP-Hosted", "工业接口"],
      source: "https://docs.m5stack.com/en/core/Tab5",
      sourceName: "M5Stack Docs · Tab5",
      image: "https://i1.hdslb.com/bfs/archive/8a21ac08c7a00824867a76f7fe6fb41e96f1bdc4.jpg",
      imageAlt: "M5Stack Tab5 运行 LVGL 全高清 UI 演示",
      imageCredit: "Bilibili / RoCry 的小号",
      price: "开发板级",
      chip: "ESP32-P4 + ESP32-C6",
      video: { type: "bilibili", id: "BV1XfjGzEED1", title: "M5Stack Tab5 LVGL demo" }
    }
  ],

  playbook: [
    {
      no: "01",
      id: "wedge",
      kicker: "DEFINE THE WEDGE",
      title: "先找“不可替代的一秒”",
      lede: "不要从“我要做一个 ESP32 产品”开始，从“用户在什么瞬间，非它不可”开始。",
      body: "物理 AI 的价值不在“能联网”，而在“把某个动作变简单”。这个动作必须高频、可感知、现有方案足够烂，而且能被一个 10 美元级的控制器显著改善。",
      actions: [
        "写下一句用户故事：当 ______ 时，我希望 ______，以便 ______。",
        "只选一个核心动作，砍掉所有“顺便也能做”的功能。",
        "用手机 + 开发板做一次 48 小时可用性测试，而不是先画 PCB。"
      ],
      deliverables: ["一页纸产品简报", "3 个用户访谈", "1 个可演示的粗糙原型"],
      pitfalls: ["用技术能力反推需求", "第一版就想做平台", "把“智能”当成卖点而不是结果"],
      tool: "一页纸产品简报"
    },
    {
      no: "02",
      id: "split",
      kicker: "SPLIT THE COMPUTE",
      title: "把“实时”和“智能”分开",
      lede: "ESP32 负责确定性的世界，Linux / 云端负责不确定的世界。",
      body: "电机控制、传感器采样、安全联锁必须在本地毫秒级完成；语音识别、视觉理解、LLM 推理则放在手机、边缘盒子或云端。双脑架构不是妥协，而是可靠性设计。",
      actions: [
        "画一张三层图：物理层（MCU）→ 编排层（Hub / Phone）→ 认知层（Cloud / Edge AI）。",
        "列出所有“断网也必须工作”的功能，把它们留在 MCU。",
        "为每条跨层链路定义超时、重试与降级策略。"
      ],
      deliverables: ["系统分层图", "数据流与失败模式表", "延迟预算（P50 / P95）"],
      pitfalls: ["在 MCU 上跑 LLM", "把安全逻辑放到云端", "忽略 Wi-Fi 断连时的状态机"],
      tool: "三层架构图"
    },
    {
      no: "03",
      id: "select",
      kicker: "CHOOSE THE SILICON",
      title: "选型不是选“最强”，是选“刚好”",
      lede: "C3 做成本，C6 做 Matter，S3 做语音视觉，P4 做高端 HMI，H2 做 Thread 终端。",
      body: "先确定产品必须有的外设与协议，再倒推芯片。不要为了“以后可能用得上”的 AI 算力，让整个 BOM 多出 3 美元——在百万台规模上，这是一辆车的钱。",
      actions: [
        "把需求分成 must-have / nice-to-have / never。",
        "用官方 devkit 验证 Wi-Fi 天线、摄像头、屏幕与功耗，不要只看 datasheet。",
        "为量产版本预留 pin-to-pin 兼容的第二供应商。"
      ],
      deliverables: ["选型矩阵", "外设带宽预算", "RF / 功耗实测报告"],
      pitfalls: ["只看主频不看总线", "忽略 PSRAM 带宽", "低估天线净空与外壳影响"],
      tool: "选型罗盘"
    },
    {
      no: "04",
      id: "prototype",
      kicker: "PROTOTYPE IN 6 WEEKS",
      title: "六周，把“能跑”变成“能演示”",
      lede: "原型的目标不是稳定，而是回答三个问题：有没有人想要、能不能做出来、成本是否成立。",
      body: "第 1 周定场景与 BOM；第 2–3 周打通核心链路；第 4 周做结构与电源；第 5 周做 5 台样机；第 6 周让真实用户在没有工程师陪同的情况下使用。",
      actions: [
        "第 1 周：一页纸规格 + 关键器件采购 + 风险清单。",
        "第 2–3 周：核心功能闭环，允许飞线，不允许“演示时手动干预”。",
        "第 4–6 周：5 台样机、真实场景、记录每一次失败。"
      ],
      deliverables: ["5 台可独立运行的样机", "测试脚本", "BOM 与成本表"],
      pitfalls: ["用实验室环境代替真实环境", "只做一台“黄金样机”", "没有记录失败率"],
      tool: "六周冲刺表"
    },
    {
      no: "05",
      id: "dfm",
      kicker: "DFM & COMPLIANCE",
      title: "量产的门槛，藏在看不见的地方",
      lede: "RF 认证、安规、ESD、热、电源余量、可测试性——这些才是从 demo 到产品的分水岭。",
      body: "模块方案能缩短开发周期，但天线净空、电源纹波、摄像头干扰、外壳阻燃与电池认证仍然要自己负责。越早把认证与测试计划放进排期，后面越少返工。",
      actions: [
        "做一次 pre-scan：辐射、传导、ESD、浪涌，尽早暴露问题。",
        "为产线设计测试点：RF 校准、电流、传感器自检、OTA 回滚。",
        "列出目标市场的认证清单：FCC / CE-RED / UKCA / SRRC / MIC / RoHS / UN38.3。"
      ],
      deliverables: ["DFM 检查表", "认证排期", "产线测试规范"],
      pitfalls: ["天线贴金属外壳", "电池没有温度保护", "忘记做 OTA 回滚"],
      tool: "量产检查表"
    },
    {
      no: "06",
      id: "scale",
      kicker: "SHIP & LEARN",
      title: "把一次性硬件，变成可持续的服务",
      lede: "OTA、设备管理、内容与社区，决定产品在第 12 个月还有没有价值。",
      body: "硬件卖出只是开始。通过 OTA 增加技能、通过模板降低使用门槛、通过社区延长内容寿命，才能把“卖板子”变成“卖持续体验”。同时，安全更新与隐私承诺必须写进产品路线图。",
      actions: [
        "第一版就上安全启动、Flash 加密与签名 OTA。",
        "建立设备遥测与崩溃上报，但默认最小化采集。",
        "设计一个“用户可感知”的月度更新，而不是只修 bug。"
      ],
      deliverables: ["OTA 与回滚方案", "设备管理后台", "12 个月内容路线图"],
      pitfalls: ["没有回滚", "遥测收集过多", "把社区当客服"],
      tool: "OTA 与设备管理清单"
    }
  ],

  selector: {
    useCases: [
      {
        id: "voice",
        label: "AI 语音 / 陪伴",
        chip: "ESP32-S3",
        companion: "ESP32-C6（可选 Wi-Fi 6 / Thread）",
        why: "S3 的向量指令、PSRAM 和 I2S 外设最适合做唤醒、降噪、音频缓冲与表情驱动；C3 可以作为极致成本版本。",
        metrics: { ai: 82, connect: 68, realtime: 70, cost: 58 },
        risk: "回声消除与麦克风一致性决定体验上限，建议音频前端独立评估。",
        examples: ["小智 AI", "Stack-chan", "Voice PE"]
      },
      {
        id: "vision",
        label: "视觉 HMI / 边缘屏",
        chip: "ESP32-P4 + C6",
        companion: "ESP32-C6（Wi-Fi 6 / Thread）",
        why: "P4 提供 MIPI CSI/DSI、双核 RISC-V 与 H.264，能扛高分辨率 UI 和多摄像头；C6 补上无线与 Matter。",
        metrics: { ai: 88, connect: 86, realtime: 76, cost: 38 },
        risk: "P4 无 Wi-Fi，必须做双芯；开发复杂度与散热要求明显高于 S3。",
        examples: ["M5Stack Tab5", "智能家电面板", "机器人头显"]
      },
      {
        id: "robot",
        label: "机器人 / 运动控制",
        chip: "ESP32-S3",
        companion: "Linux 主控（Pi / Jetson）",
        why: "S3 的双核、PWM、PCNT、CAN/TWAI 与 USB 适合做实时小脑；复杂视觉与规划交给 Linux 大脑。",
        metrics: { ai: 62, connect: 72, realtime: 90, cost: 60 },
        risk: "不要试图在 MCU 上做 SLAM 或 VLA；定义好安全边界与失联动作。",
        examples: ["FOFOCA", "ESP-Drone", "RoArm"]
      },
      {
        id: "matter",
        label: "Matter / 传感网关",
        chip: "ESP32-C6",
        companion: "ESP32-H2（Thread 终端）",
        why: "C6 同时具备 Wi-Fi 6、BLE 5 与 802.15.4，是 Matter over Wi-Fi / Thread 的甜点；H2 适合纯 Thread 终端。",
        metrics: { ai: 30, connect: 94, realtime: 58, cost: 76 },
        risk: "Matter 认证与生态兼容是主要成本，射频共存与低功耗要早测。",
        examples: ["Apollo AIR-1", "Matter 传感器", "Thread 边界路由"]
      },
      {
        id: "wearable",
        label: "穿戴 / 随身 AI",
        chip: "ESP32-S3",
        companion: "手机（算力中继）",
        why: "S3 的摄像头、PSRAM 与低功耗模式适合做记录、语音与视觉触发；手机承担识别与 LLM。",
        metrics: { ai: 70, connect: 64, realtime: 54, cost: 48 },
        risk: "电池、散热、天线与佩戴舒适度是四座大山，先做模块化镜腿/胸牌。",
        examples: ["OpenGlass", "XIAO Sense", "T-Watch S3"]
      },
      {
        id: "energy",
        label: "能源 / 工业网关",
        chip: "ESP32-C6",
        companion: "ESP32-P4（本地 HMI 可选）",
        why: "C6 的 Wi-Fi 6、Thread 与丰富 UART/SPI 适合做多协议网关；强电与隔离另行设计。",
        metrics: { ai: 28, connect: 90, realtime: 74, cost: 70 },
        risk: "安规、EMC、宽温与长期供货比功能更重要；不要用开发板直接进强电箱。",
        examples: ["OpenDTU", "OpenEVSE", "Freematics"]
      }
    ],
    chips: [
      {
        name: "ESP32-C3",
        cpu: "1× RISC-V 160MHz",
        radio: "Wi-Fi 4 + BLE 5",
        thread: "—",
        media: "SPI 屏 / 无摄像头",
        ai: "基础",
        best: "成本敏感的传感器、开关、语音降级版",
        price: "$1–2"
      },
      {
        name: "ESP32-C6",
        cpu: "1× RISC-V 160MHz",
        radio: "Wi-Fi 6 + BLE 5",
        thread: "802.15.4",
        media: "SPI 屏 / 有限视觉",
        ai: "基础",
        best: "Matter、Thread 网关、能源与工业连接",
        price: "$1.5–2.5"
      },
      {
        name: "ESP32-S3",
        cpu: "2× Xtensa LX7 240MHz",
        radio: "Wi-Fi 4 + BLE 5",
        thread: "—",
        media: "DVP 摄像头 / SPI RGB 屏",
        ai: "向量指令，强",
        best: "语音、视觉、机器人实时控制",
        price: "$2.5–5"
      },
      {
        name: "ESP32-P4",
        cpu: "2× RISC-V 400MHz",
        radio: "无（需搭配 C6/C5）",
        thread: "通过伴生芯片",
        media: "MIPI CSI / DSI，H.264",
        ai: "强",
        best: "高端 HMI、边缘视觉、多摄像头",
        price: "$5–8 + 伴生"
      },
      {
        name: "ESP32-H2",
        cpu: "1× RISC-V 96MHz",
        radio: "BLE 5",
        thread: "802.15.4",
        media: "SPI / I2C",
        ai: "基础",
        best: "Thread 终端、低功耗传感",
        price: "$1–2"
      },
      {
        name: "ESP32-C5",
        cpu: "1× RISC-V 240MHz",
        radio: "双频 Wi-Fi 6 + BLE 5",
        thread: "802.15.4",
        media: "SPI / 有限视觉",
        ai: "基础",
        best: "5GHz 高吞吐、双频 Matter 设备",
        price: "$2–3"
      }
    ]
  },

  matrix: [
    { id: "voice", label: "AI 语音陪伴", x: 82, y: 80, size: 66, track: "ai", window: "现在", note: "需求已被验证，差异化在人格、内容与渠道，而不是语音链路本身。" },
    { id: "toy", label: "AI 玩具", x: 92, y: 56, size: 54, track: "ai", window: "现在", note: "供应链成熟、决策链短；最大的风险是安全、隐私与同质化。" },
    { id: "desktop-robot", label: "桌面机器人", x: 68, y: 74, size: 56, track: "robotics", window: "12–18 个月", note: "情绪价值 + 轻运动；难点是可靠性、噪音与“买回家三天后吃灰”。" },
    { id: "p4-hmi", label: "P4 视觉 HMI", x: 58, y: 86, size: 52, track: "ai", window: "12–18 个月", note: "家电、医疗、工业面板的高端替代；软件体验与散热是分水岭。" },
    { id: "energy-gateway", label: "能源数据网关", x: 76, y: 62, size: 46, track: "industry", window: "现在", note: "光伏、充电、储能的协议碎片化，给了小团队“做胶水”的机会。" },
    { id: "csi-care", label: "CSI 养老监护", x: 38, y: 88, size: 40, track: "home", window: "24–36 个月", note: "无摄像头、无穿戴，但误报与环境泛化仍是商业化门槛。" },
    { id: "ai-glasses", label: "AI 眼镜", x: 34, y: 76, size: 44, track: "wearable", window: "18–30 个月", note: "先做“手机配件”，不要做独立计算机；重量与续航决定留存。" },
    { id: "humanoid", label: "通用人形", x: 20, y: 94, size: 38, track: "robotics", window: "观察", note: "ESP32 只能做关节/传感器节点，不是主控；不要被叙事带偏。" },
    { id: "speaker", label: "通用智能音箱", x: 92, y: 26, size: 42, track: "home", window: "谨慎", note: "巨头补贴 + 内容生态，硬件团队很难建立壁垒。" },
    { id: "meter", label: "智能电表模组", x: 88, y: 38, size: 34, track: "industry", window: "谨慎", note: "认证与电网准入极高，适合做方案商而不是品牌商。" }
  ],

  forecasts: [
    {
      year: "2027",
      horizon: "12–18 个月",
      title: "无屏语音，先赢在细分场景",
      confidence: 78,
      thesis: "AI 陪伴、老人看护、儿童玩具、酒店客房会率先跑出“没有屏幕”的语音终端。竞争点从“唤醒率”转向人格、内容与隐私。",
      signals: ["端侧唤醒 + 云端 LLM 成为默认架构", "麦克风阵列与音频前端开始标准化", "物理 mute 从卖点变成合规项"],
      opportunity: "做垂直场景的“语音 + 服务”整机，而不是通用音箱。"
    },
    {
      year: "2027–28",
      horizon: "18–24 个月",
      title: "P4 把边缘视觉打到 199 美元",
      confidence: 72,
      thesis: "MIPI 屏、摄像头与 H.264 的成本下探，会让“没有 Linux 的高端 HMI”进入家电、医疗与工业面板。P4 + C6 成为中高端标配。",
      signals: ["P4 开发板与模组价格下探", "LVGL / 视频管线成熟", "家电厂商开始替换 Linux + 外置 MCU"],
      opportunity: "做“显示 + 视觉 + 无线”的一体化控制板，绑定 2–3 个垂直行业。"
    },
    {
      year: "2028",
      horizon: "24–30 个月",
      title: "Matter / Thread 成为出海默认项",
      confidence: 80,
      thesis: "海外渠道与平台把 Matter 作为准入门槛；C6/H2 的组合会把 Thread 终端成本压到与传统 Zigbee 持平。",
      signals: ["Matter 认证周期缩短", "Thread 边界路由进入路由器/音箱", "Home Assistant 成为事实上的本地中枢"],
      opportunity: "做“传统设备 Matter 化”的桥接模组与交钥匙方案。"
    },
    {
      year: "2028–29",
      horizon: "30–36 个月",
      title: "机器人固化“双脑架构”",
      confidence: 85,
      thesis: "Linux / Jetson 做认知，ESP32 做实时小脑，会成为消费机器人与桌面机器人的主流分层。单芯片方案只存在于极简产品。",
      signals: ["ROS 2 + MCU 桥接标准化", "功能安全与失联降级被写进产品定义", "ESP32 成为关节/传感器节点"],
      opportunity: "做机器人“小脑板”：多轴 PWM、CAN、IMU 同步、安全联锁。"
    },
    {
      year: "2029",
      horizon: "36–48 个月",
      title: "Wi-Fi CSI 从 Demo 走向商业",
      confidence: 55,
      thesis: "无摄像头、无穿戴的存在/跌倒检测会在养老与酒店先落地；能否解决环境泛化与误报，决定它是不是一个品类。",
      signals: ["CSI 数据集与标注工具出现", "保险/养老机构开始试点", "与毫米波形成互补而非替代"],
      opportunity: "做“安装即校准”的感知模组 + 云端标注服务。"
    },
    {
      year: "2030",
      horizon: "48–60 个月",
      title: "可穿戴 AI 副驾，手机仍是算力中心",
      confidence: 60,
      thesis: "眼镜、胸牌、耳机形态会先成为手机的传感器外设；独立计算、显示与全天候续航仍需等待电池与散热突破。",
      signals: ["手机侧 AI 推理能力增强", "低功耗摄像头与 Always-on 传感", "隐私法规推动“本地优先”"],
      opportunity: "做模块化“镜腿/胸牌”参考设计，帮品牌把上市周期压到 6 个月。"
    }
  ],

  recipes: [
    {
      no: "A",
      title: "旧设备 AI 语音模块",
      chip: "ESP32-S3 / C3",
      time: "3–4 周",
      bom: "$12–20",
      retail: "$39–69",
      difficulty: "低",
      validate: "用户是否愿意为“不用打开 App”多付 30%？",
      stack: ["ESP-SR", "WebSocket", "LLM", "继电器"],
      note: "最适合先做配件，而不是整机：一个带麦克风、喇叭和继电器的盒子，插进旧音箱/旧家电。"
    },
    {
      no: "B",
      title: "桌面 AI 伙伴",
      chip: "ESP32-S3",
      time: "6–8 周",
      bom: "$28–40",
      retail: "$99–149",
      difficulty: "中",
      validate: "三天后，用户还会主动和它说话吗？",
      stack: ["ESP-SR", "LVGL", "舵机", "云端 TTS"],
      note: "表情与动作的“生命感”比多一轮对话更重要；先做 3 个高辨识度动作。"
    },
    {
      no: "C",
      title: "边缘视觉 HMI",
      chip: "ESP32-P4 + C6",
      time: "10–14 周",
      bom: "$45–65",
      retail: "$199–299",
      difficulty: "高",
      validate: "客户是否愿意为“没有 Linux 的稳定面板”替换现有方案？",
      stack: ["MIPI DSI", "LVGL", "H.264", "ESP-Hosted"],
      note: "先锁定一个行业（家电/医疗/工业），不要做通用平板。"
    },
    {
      no: "D",
      title: "能源数据网关",
      chip: "ESP32-C6",
      time: "6–8 周",
      bom: "$18–30",
      retail: "$99–179",
      difficulty: "中",
      validate: "安装是否需要电工？数据是否真的能促成节能动作？",
      stack: ["RS485", "MQTT", "Matter", "本地 Web"],
      note: "协议适配是护城河；把“安装 10 分钟、手机可见”做成核心体验。"
    },
    {
      no: "E",
      title: "穿戴 AI 记录器",
      chip: "ESP32-S3",
      time: "8–10 周",
      bom: "$35–50",
      retail: "$129–199",
      difficulty: "高",
      validate: "用户是否愿意每天充电，并接受“手机中继”的延迟？",
      stack: ["Camera", "BLE", "低功耗", "手机 App"],
      note: "先做胸牌/夹扣，不要一上来做眼镜；结构和电池可以复用。"
    }
  ],

  resources: [
    ["ESP-IDF", "官方开发框架，量产项目的默认选择", "https://docs.espressif.com/projects/esp-idf/"],
    ["ESP-Matter", "Matter 设备端 SDK 与示例", "https://docs.espressif.com/projects/esp-matter/"],
    ["ESP-SR", "唤醒词、命令词、降噪与回声消除", "https://github.com/espressif/esp-sr"],
    ["ESP-WHO", "人脸检测、识别与视觉参考", "https://github.com/espressif/esp-who"],
    ["ESP-DL", "面向 ESP32-S3/P4 的深度学习库", "https://github.com/espressif/esp-dl"],
    ["ESPHome", "YAML 驱动的固件与 Home Assistant 生态", "https://esphome.io/"],
    ["Edge Impulse", "TinyML 数据采集、训练与部署", "https://www.edgeimpulse.com/"],
    ["PlatformIO", "跨平台嵌入式构建与库管理", "https://platformio.org/"]
  ]
};

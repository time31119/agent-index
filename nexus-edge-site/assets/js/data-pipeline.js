/* =========================================================================
   枢元智联 NEXUS EDGE — 新品企划数据（11 个领域 × 6 款）
   -------------------------------------------------------------------------
   与 data.js 分离：data.js 管「在售 / 在研产品位」，本文件管「还没上市的企划」。
   健康与可穿戴的 6 款作为示例写在 data.js 内，其余 11 个领域在这里。
   加载顺序：data.js → data-pipeline.js → site.js
   ========================================================================= */

(function () {
  "use strict";

  var P = {
    /* ---------------- 01 智能家居 ---------------- */
    home: {
      title: "六款还没人做的家居硬件",
      intro: "家居是红海，但红海里全是「同一个开关换个壳」。这 6 款盯的是没人愿意做的脏活：暗漏、干烧、滤网、电气安全。",
      items: [
        { code: "NX-HM-11", name: "用电指纹插座", en: "WattPrint", status: "企划", pos: "让插座认出每台电器，算出谁在偷电。", gap: "计量插座只报总功率，不做设备识别；电费异常只能靠猜。", stack: ["电流谐波", "边缘 NILM", "ESP32-C6"], form: "86 插座", price: "¥129", timing: "2027 Q2" },
        { code: "NX-HM-12", name: "暗漏关阀套装", en: "LeakGuard", status: "企划", pos: "每天漏几升的暗漏，自动关阀。", gap: "水浸报警器只在已经淹了才响，微流量暗漏没人管。", stack: ["微流量计", "水浸绳", "电动球阀"], form: "管道套装", price: "¥399", timing: "2027 Q1" },
        { code: "NX-HM-13", name: "空调滤网哨兵", en: "FilterSense", status: "企划", pos: "滤网堵了，电费先知道。", gap: "空调用电量上升没人归因，滤网全靠人记。", stack: ["回风温差", "电流特征", "ESP32-C3"], form: "贴装", price: "¥99", timing: "2027 Q3" },
        { code: "NX-HM-14", name: "夜间路径地脚灯", en: "PathLight", status: "企划", pos: "跟着脚步逐段亮，不刺眼。", gap: "感应夜灯一亮全亮，起夜仍晃眼、仍会绊倒。", stack: ["毫米波", "分段 LED", "ESP32-C6"], form: "踢脚线", price: "¥199", timing: "2027 Q2" },
        { code: "NX-HM-15", name: "燃气干烧哨兵", en: "DryFire", status: "企划", pos: "锅烧干了，先关阀再报警。", gap: "防干烧是灶具出厂功能，老厨房没法后装。", stack: ["灶台振动", "温度", "ESP32-C3"], form: "灶下", price: "¥249", timing: "2027 Q3" },
        { code: "NX-HM-16", name: "门锁健康监测", en: "LockDoc", status: "企划", pos: "在锁彻底坏掉之前提醒你。", gap: "智能锁只报电量低，不报电机老化与锁舌卡滞。", stack: ["电机电流", "开合时间", "ESP32-C3"], form: "锁内模组", price: "模组 ¥39", timing: "2027 Q4" }
      ]
    },

    /* ---------------- 02 楼宇与安防 ---------------- */
    security: {
      title: "六款藏在盲区里的安防硬件",
      intro: "安防的空白不在「看得见」，而在「看不见的地方」：消防通道、配电箱、无障碍卫生间、墙里的水。",
      items: [
        { code: "NX-SE-11", name: "消防通道占用哨兵", en: "ExitGuard", status: "企划", pos: "通道被堵十分钟，自动找到负责人。", gap: "视频分析贵且涉隐私，日常巡查靠人。", stack: ["ToF 阵列", "声光劝离", "ESP32-C6"], form: "吊顶", price: "¥299", timing: "2027 Q2" },
        { code: "NX-SE-12", name: "充电热失控插座", en: "ChargeSafe", status: "企划", pos: "电池还没烧，插座先断电。", gap: "充电火灾靠烟感事后发现，充电曲线异常没人看。", stack: ["充电曲线", "温升", "ESP32-C3"], form: "插座", price: "¥159", timing: "2027 Q1" },
        { code: "NX-SE-13", name: "配电箱火灾哨兵", en: "ArcSense", status: "企划", pos: "电弧还没起火，先报警。", gap: "电气火灾监测是大厂系统，老楼装不起。", stack: ["CT 采样", "电弧特征", "ESP32-S3"], form: "导轨", price: "¥499", timing: "2027 Q3" },
        { code: "NX-SE-14", name: "无障碍卫生间哨兵", en: "CareDoor", status: "企划", pos: "门反锁二十分钟没动静，自动呼人。", gap: "无障碍卫生间是跌倒高发地，却几乎没有监测。", stack: ["毫米波", "门磁", "ESP32-C3"], form: "门侧", price: "¥299", timing: "2027 Q2" },
        { code: "NX-SE-15", name: "渗漏定位绳", en: "LeakMap", status: "企划", pos: "不只报漏水，还告诉你在第几米。", gap: "漏水绳只报有漏，查漏点靠砸墙。", stack: ["分区水浸", "阻抗定位", "LoRa"], form: "线缆", price: "¥399/10m", timing: "2027 Q4" },
        { code: "NX-SE-16", name: "宿舍恶性负载识别", en: "DormGuard", status: "企划", pos: "热得快一插就断电，不误伤电脑。", gap: "高校限电靠总功率，经常误伤合规电器。", stack: ["负载指纹", "谐波", "ESP32-C6"], form: "导轨", price: "¥299", timing: "2027 Q3" }
      ]
    },

    /* ---------------- 03 工业与能源 ---------------- */
    industry: {
      title: "六款替老师傅听诊的工业硬件",
      intro: "工业的空白不在「采数据」，而在「听声音、找微漏」——这些靠老师傅经验的事，还没有便宜的量产设备。",
      items: [
        { code: "NX-IN-11", name: "空压机泄漏听诊器", en: "AirEar", status: "企划", pos: "一个夜班，找出全厂的漏气点。", gap: "超声检漏仪几千元一台，巡检靠人、靠记忆。", stack: ["超声麦克风", "声源定位", "ESP32-C3"], form: "手持 + 磁吸", price: "¥1299", timing: "2027 Q2" },
        { code: "NX-IN-12", name: "疏水阀监测", en: "SteamTrap", status: "企划", pos: "疏水阀失效，一年白烧几十万。", gap: "蒸汽系统最容易被忽略的耗能点，没有便宜监测。", stack: ["超声", "温差", "ESP32-C6"], form: "卡箍", price: "¥399", timing: "2027 Q3" },
        { code: "NX-IN-13", name: "配电柜局放哨兵", en: "PDWatch", status: "企划", pos: "绝缘还没击穿，先听见。", gap: "局放检测是专业仪器，巡检周期长。", stack: ["超声 + TEV", "特征提取", "ESP32-S3"], form: "柜内", price: "¥899", timing: "2027 Q4" },
        { code: "NX-IN-14", name: "卷帘门卡阻预测", en: "DoorSense", status: "企划", pos: "门卡住之前，先换轴承。", gap: "工业门都是突然坏，没有预警。", stack: ["电流", "振动", "ESP32-C3"], form: "电机端", price: "¥299", timing: "2027 Q2" },
        { code: "NX-IN-15", name: "车间环境合规盒", en: "AirProof", status: "企划", pos: "粉尘噪声超标，自动留证。", gap: "职业卫生检测一年一次，取证靠第三方。", stack: ["PM2.5", "噪声", "ESP32-C6"], form: "壁挂", price: "¥699", timing: "2027 Q3" },
        { code: "NX-IN-16", name: "机床开机率盒子", en: "OEELite", status: "企划", pos: "老机床不联网，也能算 OEE。", gap: "机床监控是大厂 MES 的生意，单机版贵。", stack: ["电流", "振动", "ESP32-C3"], form: "磁吸", price: "¥399", timing: "2027 Q1" }
      ]
    },

    /* ---------------- 04 农业与环境 ---------------- */
    agri: {
      title: "六款直接测作物的农业硬件",
      intro: "农业的空白不在「测环境」，而在「测作物本身」——茎秆、果面、蜂群，这些直接决定收成的信号没人测。",
      items: [
        { code: "NX-AG-11", name: "茎秆微生长计", en: "StemSense", status: "企划", pos: "果实长没长，茎秆先知道。", gap: "茎流计是科研设备，几千元；种植户只能靠眼看。", stack: ["线性位移", "温湿度", "ESP32-C3"], form: "夹装", price: "¥499", timing: "2027 Q2" },
        { code: "NX-AG-12", name: "畜禽咳嗽哨兵", en: "BarnEar", status: "企划", pos: "猪开始咳，比人早三天发现。", gap: "呼吸道病靠饲养员听，发现时已扩散。", stack: ["声学事件", "咳嗽模型", "ESP32-C6"], form: "吊装", price: "¥899", timing: "2027 Q3" },
        { code: "NX-AG-13", name: "果实日灼预警贴", en: "SunSpot", status: "企划", pos: "果面到四十五度前，提醒遮阳。", gap: "气象站测的是空气温度，不是果面温度。", stack: ["红外测温", "光照", "ESP32-C3"], form: "果面贴", price: "¥39/个", timing: "2027 Q2" },
        { code: "NX-AG-14", name: "灌溉爆管哨兵", en: "PipeBurst", status: "企划", pos: "爆管三分钟关阀，不冲垮整片地。", gap: "灌溉靠人巡渠，压力突变没人监测。", stack: ["压力", "流量", "ESP32-C6"], form: "首部", price: "¥599", timing: "2027 Q1" },
        { code: "NX-AG-15", name: "盐碱剖面探针", en: "SoilProfile", status: "企划", pos: "一次插入，看到四层盐分。", gap: "取土化验慢且贵，单点 EC 探头看不出分层。", stack: ["多深度 EC", "温度", "ESP32-C3"], form: "探针", price: "¥899", timing: "2027 Q4" },
        { code: "NX-AG-16", name: "蜂箱分蜂预测", en: "HiveMind", status: "企划", pos: "分蜂前七天，重量和声音会变。", gap: "蜂箱监测多为温湿度，不预测分蜂。", stack: ["称重", "声学", "ESP32-C6"], form: "箱底", price: "¥399", timing: "2027 Q3" }
      ]
    },

    /* ---------------- 06 车载与出行 ---------------- */
    mobility: {
      title: "六款补上事后遗憾的出行硬件",
      intro: "出行的空白集中在「事后才想起」：孩子忘在车里、货歪了、电池鼓了、水淹了。",
      items: [
        { code: "NX-MB-11", name: "儿童遗留哨兵", en: "ChildGuard", status: "企划", pos: "锁车三十秒，后排还有人就叫。", gap: "儿童遗留靠车机选配，老车无法后装。", stack: ["毫米波", "CO₂", "ESP32-C3"], form: "座椅下", price: "¥199", timing: "2027 Q1" },
        { code: "NX-MB-12", name: "货物倾斜哨兵", en: "LoadTilt", status: "企划", pos: "弯道之前，货已经歪了。", gap: "货车超载靠地磅，途中倾斜没人管。", stack: ["6 轴", "载重", "ESP32-C6"], form: "磁吸", price: "¥499", timing: "2027 Q2" },
        { code: "NX-MB-13", name: "两轮充电火灾预警", en: "ScootSafe", status: "企划", pos: "电池鼓包前，充电器先停。", gap: "入户充电火灾靠楼道烟感，发现太晚。", stack: ["充电曲线", "温升", "ESP32-C3"], form: "充电器", price: "¥129", timing: "2027 Q1" },
        { code: "NX-MB-14", name: "涉水深度哨兵", en: "FloodLine", status: "企划", pos: "前方三十厘米积水，提前改道。", gap: "导航不报实时积水深度，涉水熄火靠运气。", stack: ["超声", "IMU", "4G"], form: "保险杠", price: "¥399", timing: "2027 Q3" },
        { code: "NX-MB-15", name: "头盔佩戴检测", en: "HelmetCheck", status: "企划", pos: "没戴头盔，车不走。", gap: "共享两轮靠人工巡检，头盔丢失率高。", stack: ["电容", "红外", "ESP32-C3"], form: "头盔扣", price: "¥59", timing: "2027 Q2" },
        { code: "NX-MB-16", name: "房车水电管家", en: "VanGauge", status: "企划", pos: "灰水满了、电还剩多少，一眼看到。", gap: "房车仪表分散，改装件各管一摊。", stack: ["液位", "库仑计", "ESP32-C6"], form: "面板", price: "¥899", timing: "2027 Q4" }
      ]
    },

    /* ---------------- 07 商业零售 ---------------- */
    retail: {
      title: "六款看见「没买」的零售硬件",
      intro: "零售的空白是「看了没买」和「拿了没结」——销量数据看不见的那一半。",
      items: [
        { code: "NX-RT-11", name: "货架拿取热力条", en: "ShelfSense", status: "企划", pos: "哪层被拿起又放回，比销量更早说真话。", gap: "视觉客流贵且涉隐私，销量看不出「看了没买」。", stack: ["重量阵列", "红外", "ESP32-C6"], form: "层板", price: "¥299/层", timing: "2027 Q2" },
        { code: "NX-RT-12", name: "试衣间防损门", en: "MirroGate", status: "企划", pos: "衣服进了试衣间，没出来。", gap: "试衣间是损耗黑洞，全场 RFID 方案太贵。", stack: ["RFID 计数", "门磁", "ESP32-C3"], form: "门框", price: "¥599", timing: "2027 Q3" },
        { code: "NX-RT-13", name: "临期动态价签", en: "FreshTag", status: "企划", pos: "越接近保质期，价格自己降。", gap: "电子价签只改价，不与保质期联动。", stack: ["墨水屏", "保质期引擎", "ESP32-C6"], form: "价签", price: "¥49", timing: "2027 Q1" },
        { code: "NX-RT-14", name: "后厨油温合规盒", en: "FryGuard", status: "企划", pos: "油温超标、油烟过载，自动留证。", gap: "食安检查靠记录本，油温没人连续监测。", stack: ["红外测温", "油烟", "ESP32-C3"], form: "壁挂", price: "¥399", timing: "2027 Q2" },
        { code: "NX-RT-15", name: "门店能耗分项表", en: "StoreMeter", status: "企划", pos: "知道钱花在空调还是冰柜。", gap: "门店只有一个总表，分项改造要动线。", stack: ["多路 CT", "边缘分摊", "ESP32-C6"], form: "配电箱", price: "¥699", timing: "2027 Q3" },
        { code: "NX-RT-16", name: "收银排队预测", en: "QueueSense", status: "企划", pos: "队要排八分钟，提前开第二台收银。", gap: "排队靠店长目测，高峰总是慢半拍。", stack: ["毫米波计数", "边缘预测", "ESP32-C3"], form: "吊顶", price: "¥399", timing: "2027 Q4" }
      ]
    },

    /* ---------------- 08 教育与创客 ---------------- */
    education: {
      title: "六款会诊断错误的教具",
      intro: "教育的空白是「错误诊断」：学生会接线，但不知道为什么不通；老师会讲，但没法给每个焊点打分。",
      items: [
        { code: "NX-ED-11", name: "诊断面包板", en: "DebugBoard", status: "企划", pos: "接错线，板子告诉你是哪一根。", gap: "教学面包板只保护不诊断，学生卡在「为什么不通」。", stack: ["逐孔电流", "电压扫描", "ESP32-C6"], form: "面包板", price: "¥199", timing: "2027 Q2" },
        { code: "NX-ED-12", name: "故障注入实训板", en: "FaultLab", status: "企划", pos: "老师远程埋故障，学生现场排。", gap: "实训靠老师手动拔线，无法批量、无法评分。", stack: ["继电器矩阵", "远程控制", "ESP32-C6"], form: "实训台", price: "¥1299", timing: "2027 Q3" },
        { code: "NX-ED-13", name: "元器件识别笔", en: "PartPen", status: "企划", pos: "色环、丝印、极性，一笔认出来。", gap: "识别 App 要拍照对焦，学生仍会认错。", stack: ["微距相机", "离线模型", "ESP32-S3"], form: "笔", price: "¥299", timing: "2027 Q1" },
        { code: "NX-ED-14", name: "多通道实验记录仪", en: "LabLog", status: "企划", pos: "物理化学实验，自动出图。", gap: "数字化实验设备被进口品牌垄断，贵。", stack: ["4 通道 ADC", "蓝牙", "ESP32-C3"], form: "手持", price: "¥399", timing: "2027 Q2" },
        { code: "NX-ED-15", name: "焊接训练台", en: "SolCraft", status: "企划", pos: "每个焊点打分，不用老师盯。", gap: "焊接教学靠肉眼，评价没有标准。", stack: ["电流", "温度", "ESP32-C3"], form: "烙铁台", price: "¥899", timing: "2027 Q4" },
        { code: "NX-ED-16", name: "危化品柜哨兵", en: "ChemGuard", status: "企划", pos: "柜内温湿度、开门、泄漏，一眼看到。", gap: "学校危化品柜大多只有一把锁。", stack: ["温湿度", "VOC", "ESP32-C6"], form: "柜内", price: "¥499", timing: "2027 Q3" }
      ]
    },

    /* ---------------- 09 音频与显示 ---------------- */
    display: {
      title: "六款更懂场景的音频显示硬件",
      intro: "音频与显示的空白不是「更清晰」，而是「更懂场景」：方言、门牌、输液、叫号。",
      items: [
        { code: "NX-DP-11", name: "方言离线语音面板", en: "DialectPanel", status: "企划", pos: "不会普通话的老人，也能语音开灯。", gap: "离线语音只支持标准普通话，方言几乎空白。", stack: ["方言声学模型", "离线", "ESP32-C3"], form: "86 面板", price: "¥199", timing: "2027 Q4" },
        { code: "NX-DP-12", name: "家庭留言墙", en: "NoteWall", status: "企划", pos: "语音留言自动变文字，贴在墙上。", gap: "冰箱贴白板要手写，墨水屏不接语音。", stack: ["离线转写", "墨水屏", "ESP32-C3"], form: "7.5 寸", price: "¥399", timing: "2027 Q2" },
        { code: "NX-DP-13", name: "会议室空气门牌", en: "RoomAir", status: "企划", pos: "门牌告诉你，这屋闷了。", gap: "占用牌只管预订，不管空气质量。", stack: ["CO₂", "温湿度", "ESP32-C6"], form: "门牌", price: "¥299", timing: "2027 Q1" },
        { code: "NX-DP-14", name: "输液进度屏", en: "DripView", status: "企划", pos: "还剩多少，护士站一眼看到。", gap: "输液靠人看、靠按铃，夜班压力大。", stack: ["称重", "低功耗", "ESP32-C3"], form: "挂架", price: "¥199", timing: "2027 Q3" },
        { code: "NX-DP-15", name: "取餐震动牌", en: "MealCall", status: "企划", pos: "餐好了，牌子震，不用喊号。", gap: "餐厅叫号靠喇叭，嘈杂环境听不见。", stack: ["LoRa", "震动", "ESP32-C3"], form: "桌面", price: "¥59", timing: "2027 Q2" },
        { code: "NX-DP-16", name: "无线安灯", en: "AndonLite", status: "企划", pos: "工位一按，全车间知道哪条线停了。", gap: "安灯是有线系统，老车间改造要布线。", stack: ["无线", "电池", "ESP32-C6"], form: "工位", price: "¥199", timing: "2027 Q1" }
      ]
    },

    /* ---------------- 10 机器人与运动控制 ---------------- */
    robotics: {
      title: "六款补上「力」与「安全」的机器人硬件",
      intro: "机器人的空白在「力」和「安全」：能动的便宜，能感知力、能保证安全的贵一个数量级。",
      items: [
        { code: "NX-RB-11", name: "力觉机械臂", en: "ForceMini", status: "企划", pos: "没有力矩传感器，也能摸到力。", gap: "力控机械臂价格高一个数量级。", stack: ["电流估计", "IMU", "ESP32-S3"], form: "桌面 6 轴", price: "¥3999", timing: "2027 Q3" },
        { code: "NX-RB-12", name: "五轴 CNC 控制板", en: "FiveAxis", status: "企划", pos: "桌面五轴，一块板搞定。", gap: "五轴控制器是工业级价格。", stack: ["步进闭环", "RTOS", "ESP32-C6"], form: "控制板", price: "¥899", timing: "2027 Q2" },
        { code: "NX-RB-13", name: "3D 打印断料哨兵", en: "PrintGuard", status: "企划", pos: "缠料、断料，十秒内暂停。", gap: "打印失败靠人守，视觉方案贵。", stack: ["挤出电流", "视觉", "ESP32-C3"], form: "喷头", price: "¥199", timing: "2027 Q1" },
        { code: "NX-RB-14", name: "机械臂安全区扫描", en: "SafeZone", status: "企划", pos: "人一伸手，臂先减速。", gap: "安全光幕贵，只有协作臂才有安全功能。", stack: ["ToF 阵列", "区域判定", "ESP32-C3"], form: "底座", price: "¥599", timing: "2027 Q3" },
        { code: "NX-RB-15", name: "轮足底盘", en: "WheelLeg", status: "企划", pos: "能上台阶的桌面底盘。", gap: "轮式上不了台阶，足式跑不稳。", stack: ["轮毂电机", "IMU", "ESP32-C6"], form: "底盘", price: "¥1299", timing: "2027 Q4" },
        { code: "NX-RB-16", name: "轨道巡检云台", en: "RailEye", status: "企划", pos: "一条轨道，替人爬一次管廊。", gap: "巡检机器人是整机生意，改造门槛高。", stack: ["轨道供电", "云台", "ESP32-S3"], form: "轨道", price: "¥2999", timing: "2027 Q2" }
      ]
    },

    /* ---------------- 11 边缘 AI ---------------- */
    edgeai: {
      title: "六款在嘈杂现场听异常的边缘 AI 硬件",
      intro: "边缘 AI 的空白不是「识别万物」，而是「在嘈杂现场，稳定地听出一种异常」。",
      items: [
        { code: "NX-AI-11", name: "电梯异响哨兵", en: "LiftEar", status: "企划", pos: "钢丝绳还没断，声音先变。", gap: "电梯维保靠十五天一次，异响无人连续听。", stack: ["声学特征", "振动", "ESP32-S3"], form: "机房", price: "¥899", timing: "2027 Q2", detail: "concept.html#liftar" },
        { code: "NX-AI-12", name: "管道漏水听诊", en: "PipeEar", status: "企划", pos: "夜里两点，它听见墙里的漏。", gap: "漏水检测靠人耳、靠挖，相关仪是专业设备。", stack: ["超声", "互相关", "ESP32-C6"], form: "管道夹", price: "¥599", timing: "2027 Q1" },
        { code: "NX-AI-13", name: "注塑周期哨兵", en: "MoldSense", status: "企划", pos: "一模慢了两秒，它就报警。", gap: "注塑机数据封闭，老机没有 OPC-UA。", stack: ["振动", "电流", "ESP32-C3"], form: "磁吸", price: "¥699", timing: "2027 Q3" },
        { code: "NX-AI-14", name: "螺丝漏打检测", en: "ScrewEye", status: "企划", pos: "一颗没打，整台返工。", gap: "视觉检测要工位改造，小厂用不起。", stack: ["视觉", "扭矩", "ESP32-S3"], form: "工位", price: "¥1999", timing: "2027 Q4" },
        { code: "NX-AI-15", name: "药片缺陷检测", en: "PillScan", status: "企划", pos: "缺角、色差，一片都不放过。", gap: "药厂灯检靠人，AI 设备百万级。", stack: ["视觉", "小样本", "ESP32-S3"], form: "桌面", price: "¥4999", timing: "2027 Q3" },
        { code: "NX-AI-16", name: "托辊异响哨兵", en: "RollerEar", status: "企划", pos: "皮带机哪根托辊坏了，听出来。", gap: "托辊是输送机主要停机源，靠人巡检。", stack: ["声学", "振动", "ESP32-C3"], form: "磁吸", price: "¥399", timing: "2027 Q2" }
      ]
    },

    /* ---------------- 12 网关与通信 ---------------- */
    gateway: {
      title: "六款装完之后用得上的网关工具",
      intro: "网关的空白不在「连得上」，而在「装完之后怎么排查」——现场工程师手里的工具还停留在万用表。",
      items: [
        { code: "NX-GW-11", name: "现场网络体检仪", en: "NetCheck", status: "企划", pos: "装完网关，先测一遍信号。", gap: "工程师靠手机看格数，测不出干扰与漫游。", stack: ["Wi-Fi 扫描", "BLE", "ESP32-C6"], form: "手持", price: "¥899", timing: "2027 Q2" },
        { code: "NX-GW-12", name: "485 接线助手", en: "BusMate", status: "企划", pos: "A/B 接反了，它直接告诉你。", gap: "现场排查靠万用表，新人上手慢。", stack: ["差分采样", "极性识别", "ESP32-C3"], form: "笔式", price: "¥299", timing: "2027 Q1" },
        { code: "NX-GW-13", name: "机柜环境哨兵", en: "RackSense", status: "企划", pos: "机柜过热、门没关，先知道。", gap: "机房监控是大系统，弱电间没人管。", stack: ["温湿度", "门磁", "ESP32-C6"], form: "导轨", price: "¥399", timing: "2027 Q3" },
        { code: "NX-GW-14", name: "PoE 供电监测", en: "PoeWatch", status: "企划", pos: "哪个口在偷电，哪个摄像头快掉线。", gap: "PoE 交换机不报单口功耗趋势。", stack: ["电流采样", "边缘统计", "ESP32-C3"], form: "串接", price: "¥599", timing: "2027 Q4" },
        { code: "NX-GW-15", name: "网关看门狗", en: "GateKeeper", status: "企划", pos: "网关死了，十秒内自己重启。", gap: "现场断网靠人跑一趟，恢复慢。", stack: ["看门狗", "4G 备份", "ESP32-C3"], form: "导轨", price: "¥299", timing: "2027 Q1" },
        { code: "NX-GW-16", name: "协议诊断仪", en: "ProtoScope", status: "企划", pos: "一根线，认出 485/422/Modbus。", gap: "协议分析仪贵且重，现场用不上。", stack: ["多协议解析", "屏幕", "ESP32-C6"], form: "手持", price: "¥1299", timing: "2027 Q3" }
      ]
    }
  };

  var cats = (window.NEXUS_DATA && window.NEXUS_DATA.categories) || [];
  cats.forEach(function (c) {
    var p = P[c.id];
    if (!p) return;
    c.pipelineTitle = p.title;
    c.pipelineIntro = p.intro;
    c.pipeline = p.items;
  });

  window.NEXUS_PIPELINE = P;
})();

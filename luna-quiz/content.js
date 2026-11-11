/*!
 * 星语测试 · 内容层
 * 只放文案与映射，不放任何逻辑。改这里不需要碰 JS 逻辑。
 * 结构：
 *   ARCHETYPES 五种原型（图标 / 名称 / 一句话 / 长文）
 *   PAIRS      主原型 × 次原型 的 10 种组合文案（决定结果标题与点睛句）
 *   QUESTIONS  8 道题（每选项 → 原型权重）
 *   SIGNS      12 星座与元素
 */
(function (root, factory) {
  var content = factory();
  if (typeof module === 'object' && module.exports) module.exports = content;
  else root.LunaContent = content;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------- 五种原型 ---------- */
  var ARCHETYPES = {
    moon: {
      icon: '☾',
      name: '月之直觉者',
      en: 'The Moon',
      element: '水',
      line: '你不是在猜测未来，你是在提前感受它。',
      desc: [
        '你的感知系统比大多数人多开了一扇窗。别人还在整理信息，你已经先一步接收到了空气里那点微妙的变化——谁在强撑、哪句话背后还有话、这件事值不值得继续。你很难解释自己为什么知道，但那些判断后来往往被证明是对的。',
        '这种天赋有一个代价：你的边界很薄。别人的情绪会像潮水一样漫进来，你分不清哪些是他们的，哪些是自己的。所以你常常需要一个人待着，不是因为冷淡，而是因为需要把身上的水拧干。',
        '你真正需要的，不是更敏锐，而是更稳定。一个能让你安放的锚点——一段关系、一个习惯、一处空间——比任何预测都更能托住你。'
      ],
      gift: '共情力、直觉判断、读懂未说出口的部分',
      shadow: '过度吸收他人情绪；用“我早就知道”回避行动',
      practice: '每天睡前写下一件“今天放下的事”，把不属于你的情绪留在纸上。'
    },
    mercury: {
      icon: '☿',
      name: '水星解读者',
      en: 'The Mercury',
      element: '风',
      line: '你要的不是答案，是能自洽的解释。',
      desc: [
        '你对含糊的东西有一种生理上的不耐受。一件事只要说不通，你就会一直想它，直到找到那条把所有碎片串起来的线。你擅长把复杂的东西拆开、重组、讲给别人听——很多人觉得你聪明，其实你只是受不了一团乱麻。',
        '你的头脑是你的主场，也是你的牢笼。当情绪出现时，你习惯先去分析它，而不是感受它。有些问题不属于逻辑范畴，你越用力，它越像一道解不开的题。',
        '真正的清晰，有时候不是把问题想明白，而是承认“这件事我暂时不必想明白”。你不需要每时每刻都保持正确。'
      ],
      gift: '结构化思维、表达与转译、快速学习',
      shadow: '分析瘫痪；用讲道理代替表达感受',
      practice: '下一次心里堵住时，先不找原因，只说一句“我现在有点难受”，然后停在那里。'
    },
    venus: {
      icon: '♀',
      name: '金星联结者',
      en: 'The Venus',
      element: '土',
      line: '你走到哪里，哪里就变得更愿意靠近。',
      desc: [
        '你天生知道怎么让人放松。一个眼神、一句恰到好处的玩笑、记得对方随口提过的小事——这些你都不用学。你在关系里像一块温热的磁石，人们愿意把私密的话讲给你听，愿意在你面前卸下防备。',
        '但这并不意味着你不累。你太擅长照顾气氛，以至于常常在别人开口之前就把自己的需要咽了回去。你害怕冲突，害怕让谁失望，于是把自己活成了一个所有人都满意、却有点模糊的版本。',
        '你值得被爱，不是因为你让一切变得舒服，而是因为你就是你。练习先说“我想要什么”，这句话不会毁掉任何一段真正的关系。'
      ],
      gift: '审美、亲和力、修复关系的能力',
      shadow: '讨好与回避冲突；用被需要来确认自己的价值',
      practice: '这周拒绝一件你其实不想做的小事，然后观察：天并没有塌。'
    },
    mars: {
      icon: '♂',
      name: '火星行动者',
      en: 'The Mars',
      element: '火',
      line: '你想清楚之前，脚已经迈出去了。',
      desc: [
        '你身上有种不太安分的热。想到就去做，遇到阻碍先撞一下再说——这股劲儿让你在很多还在犹豫的人面前，显得特别鲜活。你不是不怕，你只是觉得停下来更可怕。',
        '你的能量来得快，去得也快。开局的时候你像一支箭，但长跑需要的是另一种东西：节奏、等待、在看不到结果的时候继续。你最容易在“还没看到反馈”的那段路上泄气。',
        '你不需要磨平自己的锋芒，只需要给它一个方向。当你的冲动服务于一个你真正在乎的目标时，它会变成别人很难复制的推进力。'
      ],
      gift: '行动力、勇气、把事情从零推到一',
      shadow: '急于开始、难以坚持；把疲惫误当成能力不足',
      practice: '挑一件你起了个头的事，这周只做它，不开始任何新的。'
    },
    saturn: {
      icon: '♄',
      name: '土星守夜人',
      en: 'The Saturn',
      element: '土',
      line: '你在为很久以后的那个自己做准备。',
      desc: [
        '你比同龄人更早地学会了忍耐和负责。你不太相信天上掉下来的东西，你相信时间、秩序和一点点攒起来的东西。别人看到的是你稳，看不到的是你独自消化了多少不确定性。',
        '你对失控有很深的警惕，所以你会提前规划、反复检查、把最坏的情况都想一遍。这保护过你，也让你错过了一些本可以轻松享受的时刻。你把“准备好”当成入场券，但有些事永远不会等你准备好。',
        '你欠自己一点松弛。不是放弃责任，而是承认：有些时刻可以被浪费，有些人值得你先相信、再验证。'
      ],
      gift: '耐力、可靠、长期主义',
      shadow: '过度自我要求；用“还没准备好”推迟想要的生活',
      practice: '允许自己这个周末有一件毫无产出的事，并且不为它感到愧疚。'
    }
  };

  /* ---------- 组合文案：主 × 次 ---------- */
  var PAIRS = {
    'moon|mercury': { title: '深海里的解读者', tagline: '一手直觉，一手逻辑，你在别人的故事里看见结构。' },
    'moon|venus': { title: '替人保管心事的人', tagline: '你给人的不是建议，是“被看见”的感觉。' },
    'moon|mars': { title: '凭直觉先跳的人', tagline: '你的勇气来自身体，而非计算。' },
    'moon|saturn': { title: '安静的守夜人', tagline: '你比谁都敏感，却比谁都克制。' },
    'mercury|moon': { title: '把感受翻译成话的人', tagline: '你能说出别人卡在喉咙里的那句。' },
    'mercury|venus': { title: '让人舒服的清醒者', tagline: '你看得清，却不说破。' },
    'mercury|mars': { title: '先分析再出手的谋士', tagline: '你的速度藏在准备里。' },
    'mercury|saturn': { title: '长期主义的构建者', tagline: '你相信能被验证的东西，也愿意等它被验证。' },
    'venus|moon': { title: '会发光的容器', tagline: '你容纳情绪，也悄悄照亮它。' },
    'venus|mercury': { title: '关系里的翻译官', tagline: '你能听见两个人没说出口的同一件事。' },
    'venus|mars': { title: '温柔而坚定的推进者', tagline: '你不吵，但你从不真正退让。' },
    'venus|saturn': { title: '慢慢变甜的酿造者', tagline: '你不急，好东西值得用时间换。' },
    'mars|moon': { title: '跟着心跳走的人', tagline: '你的方向感，来自身体深处的潮汐。' },
    'mars|mercury': { title: '边跑边想的破局者', tagline: '你在行动中完成思考。' },
    'mars|venus': { title: '有温度的冲锋者', tagline: '你争的不是输赢，是在乎的东西。' },
    'mars|saturn': { title: '把火炼成钢的人', tagline: '你学会用耐心，替冲动兜底。' },
    'saturn|moon': { title: '把柔软藏起来的人', tagline: '你的稳定，是很多次独自消化换来的。' },
    'saturn|mercury': { title: '冷静的长期主义者', tagline: '你在别人追逐风口时，默默打地基。' },
    'saturn|venus': { title: '慢热但长情的人', tagline: '你的爱不张扬，却经得起时间。' },
    'saturn|mars': { title: '把野心放进日程表的人', tagline: '你把想要的生活，拆成了可执行的步骤。' }
  };

  /* ---------- 星座 ---------- */
  // [起始月, 起始日, 名称, 元素]
  var SIGNS = [
    [1, 20, '水瓶座', '风'], [2, 19, '双鱼座', '水'], [3, 21, '白羊座', '火'],
    [4, 20, '金牛座', '土'], [5, 21, '双子座', '风'], [6, 22, '巨蟹座', '水'],
    [7, 23, '狮子座', '火'], [8, 23, '处女座', '土'], [9, 23, '天秤座', '风'],
    [10, 24, '天蝎座', '水'], [11, 22, '射手座', '火'], [12, 22, '摩羯座', '土']
  ];

  var ELEMENT_NOTE = {
    '火': '火元素让你在想要的东西面前很难装作无动于衷，你的热情是真实的燃料，只是需要出口。',
    '土': '土元素让你相信积累胜过运气，你不太会被漂亮话打动，但会被“做得到”说服。',
    '风': '风元素让你需要空间和对话，被困住的关系和环境，会比孤独更让你窒息。',
    '水': '水元素让你的感受比表达更深，你常常在事情过去之后，才真正明白自己经历了什么。'
  };

  var SIGNS_BY_NAME = {};
  SIGNS.forEach(function (s) { SIGNS_BY_NAME[s[2]] = { name: s[2], element: s[3] }; });

  /* ---------- 题目 ----------
   * key     原型
   * label   选项文案
   * note    用户选中后，结果页“我们注意到”的细节
   * weight  { 原型: 分值 }，主选项 2 分、副选项 1 分
   */
  var QUESTIONS = [
    {
      q: '如果今晚能让你知道一件事，你最想知道什么？',
      sub: '别想太久，第一反应往往最诚实。',
      options: [
        { label: '我正在做的这个选择，最后会把我带去哪里', key: 'moon', note: '你需要的是方向感，而不是细节。', weight: { moon: 2, saturn: 1 } },
        { label: '那个我一直没想通的问题，到底卡在哪一环', key: 'mercury', note: '不把逻辑理顺，你很难真正往前走。', weight: { mercury: 2, mars: 1 } },
        { label: '我在意的那个人，心里到底怎么看我', key: 'venus', note: '关系里的不确定，比事情本身更磨人。', weight: { venus: 2, moon: 1 } },
        { label: '我到底该不该现在就走', key: 'mars', note: '你已经想动了，只差一个允许。', weight: { mars: 2, venus: 1 } },
        { label: '未来一年，我该把力气下在哪里', key: 'saturn', note: '你不想浪费力气，你想用在刀刃上。', weight: { saturn: 2, mercury: 1 } }
      ]
    },
    {
      q: '朋友深夜打来电话，说“我没事”，但你听出不对劲。你会——',
      options: [
        { label: '不追问，先陪着，等他自己开口', key: 'moon', note: '你相信有些话只能在安静里浮上来。', weight: { moon: 2, venus: 1 } },
        { label: '换个角度问他一个具体的问题，帮他把事情说清楚', key: 'mercury', note: '你习惯用理解来安抚，而不是用安慰。', weight: { mercury: 2, mars: 1 } },
        { label: '直接说“我在，你现在过来也行”', key: 'venus', note: '你给的是确定的存在感。', weight: { venus: 2, moon: 1 } },
        { label: '问清楚发生了什么，然后陪他一起想办法', key: 'mars', note: '你不忍心看他一直困在里面。', weight: { mars: 2, saturn: 1 } },
        { label: '先不打扰，明天找个合适的时间认真聊', key: 'saturn', note: '你相信合时机比及时更重要。', weight: { saturn: 2, mercury: 1 } }
      ]
    },
    {
      q: '回想你做过的重大决定，更接近哪一种？',
      options: [
        { label: '某个瞬间突然就知道了，后来越来越确定', key: 'moon', note: '你的决定往往先于解释发生。', weight: { moon: 2, mars: 1 } },
        { label: '列过利弊、问过建议，最后才拍板', key: 'mercury', note: '你需要它经得起推敲。', weight: { mercury: 2, saturn: 1 } },
        { label: '和重要的人聊过之后，心里才落地', key: 'venus', note: '关系的回应是你判断的重要坐标。', weight: { venus: 2, moon: 1 } },
        { label: '先做了再说，做错再调整', key: 'mars', note: '你在行动里校正方向。', weight: { mars: 2, mercury: 1 } },
        { label: '拖了很久，直到不得不选', key: 'saturn', note: '你在等一个足够稳妥的时机。', weight: { saturn: 2, venus: 1 } }
      ]
    },
    {
      q: '最近一次让你真正失眠的，是什么？',
      options: [
        { label: '一种说不清的不安，像有什么事要发生', key: 'moon', note: '你的身体比你的头脑先预警。', weight: { moon: 2, saturn: 1 } },
        { label: '一件事反复在脑子里转，找不到出口', key: 'mercury', note: '未完成的问题最占你的内存。', weight: { mercury: 2, moon: 1 } },
        { label: '和某个人的关系变得不确定了', key: 'venus', note: '你在意的是“我们还好吗”。', weight: { venus: 2, moon: 1 } },
        { label: '憋着一股劲，觉得再不动就要错过什么', key: 'mars', note: '停滞比失败更让你焦虑。', weight: { mars: 2, mercury: 1 } },
        { label: '担心自己做得不够好，或者来不及', key: 'saturn', note: '你对自己的要求，常常高于事情本身。', weight: { saturn: 2, mercury: 1 } }
      ]
    },
    {
      q: '在一场聚会里，你最常处于什么位置？',
      options: [
        { label: '安静地观察，默默感受整体的气氛', key: 'moon', note: '你在人群里读的从来不只是话。', weight: { moon: 2, saturn: 1 } },
        { label: '和某个人聊到深处，忘了时间', key: 'mercury', note: '你更在意一次真正的对话。', weight: { mercury: 2, venus: 1 } },
        { label: '照顾大家，让每个人都舒服一点', key: 'venus', note: '你自然地把场子接在了手里。', weight: { venus: 2, moon: 1 } },
        { label: '张罗、带节奏，把冷场救回来', key: 'mars', note: '你不太能忍受事情停在那里。', weight: { mars: 2, venus: 1 } },
        { label: '待一会儿就想走，回到自己的节奏里', key: 'saturn', note: '独处是你恢复能量的方式，不是逃避。', weight: { saturn: 2, moon: 1 } }
      ]
    },
    {
      q: '当你的想法和身边人不一样时，你通常——',
      options: [
        { label: '先不说，看看事情会往哪里走', key: 'moon', note: '你相信时间会替你说明。', weight: { moon: 2, venus: 1 } },
        { label: '试着解释清楚自己的理由', key: 'mercury', note: '你希望被理解，而不是被同意。', weight: { mercury: 2, mars: 1 } },
        { label: '尽量找到双方都能接受的说法', key: 'venus', note: '你不喜欢把关系推到对立面。', weight: { venus: 2, saturn: 1 } },
        { label: '说出来，哪怕会有点冲突', key: 'mars', note: '你觉得憋着才是更大的问题。', weight: { mars: 2, mercury: 1 } },
        { label: '保留意见，按自己的标准做', key: 'saturn', note: '你不太需要外部的许可。', weight: { saturn: 2, moon: 1 } }
      ]
    },
    {
      q: '你手机里最舍不得删的，是哪种东西？',
      options: [
        { label: '某段时期反复听的歌，一听就回到当时', key: 'moon', note: '你用感受给时间做标记。', weight: { moon: 2, venus: 1 } },
        { label: '截图、笔记、收藏的文章和清单', key: 'mercury', note: '你怕丢的不是文件，是那些想法。', weight: { mercury: 2, saturn: 1 } },
        { label: '和朋友、家人的聊天记录', key: 'venus', note: '关系是你存在的证据。', weight: { venus: 2, moon: 1 } },
        { label: '没做完的计划和待办', key: 'mars', note: '你心里总有一件还没开始的事。', weight: { mars: 2, saturn: 1 } },
        { label: '几乎不删，也很少回头看', key: 'saturn', note: '你更愿意往前走，而不是整理过去。', weight: { saturn: 2, mercury: 1 } }
      ]
    },
    {
      q: '如果未来一年只能做好一件事，你会选——',
      options: [
        { label: '找回内心那种安静、确定的感觉', key: 'moon', note: '你想要的不是更多，是更稳。', weight: { moon: 2, saturn: 1 } },
        { label: '把一个真正感兴趣的领域学透', key: 'mercury', note: '你需要一件能让脑子沉进去的事。', weight: { mercury: 2, saturn: 1 } },
        { label: '修复或建立一段真正重要的关系', key: 'venus', note: '你愿意为在乎的人重新投入。', weight: { venus: 2, moon: 1 } },
        { label: '把一件想了很久的事真正做出来', key: 'mars', note: '你不想再只是“准备”了。', weight: { mars: 2, mercury: 1 } },
        { label: '搭好一个更稳的生活结构，让以后更轻松', key: 'saturn', note: '你在为未来的自己铺路。', weight: { saturn: 2, mercury: 1 } }
      ]
    }
  ];

  return {
    ARCHETYPES: ARCHETYPES,
    PAIRS: PAIRS,
    QUESTIONS: QUESTIONS,
    SIGNS: SIGNS,
    SIGNS_BY_NAME: SIGNS_BY_NAME,
    ELEMENT_NOTE: ELEMENT_NOTE
  };
});

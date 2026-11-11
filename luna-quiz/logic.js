/*!
 * 星语测试 · 逻辑层（纯函数，不碰 DOM）
 * 显式接收 content，浏览器 / Node 行为一致。
 * 浏览器：window.LunaLogic
 * Node：  module.exports（供 selftest.js 使用）
 */
(function (root, factory) {
  var logic = factory();
  if (typeof module === 'object' && module.exports) module.exports = logic;
  else root.LunaLogic = logic;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['moon', 'mercury', 'venus', 'mars', 'saturn'];

  function need(content) {
    if (!content || !content.QUESTIONS) throw new Error('缺少 content 数据');
    return content;
  }

  /** 生日 → 星座。非法输入返回 null。 */
  function getSign(month, day, content) {
    var C = need(content);
    month = Number(month);
    day = Number(day);
    if (!isFinite(month) || !isFinite(day)) return null;
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;

    // 纯算术校验，不依赖 Date（避免历史时区/夏令时把日期挪走）
    var maxDay = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
    if (day > maxDay) return null;
    if (month === 2 && day === 29) return C.SIGNS_BY_NAME['双鱼座']; // 不收集年份，2/29 按双鱼算

    var signs = C.SIGNS;
    for (var i = 0; i < signs.length; i++) {
      var s = signs[i];
      if (month === s[0] && day >= s[1]) return C.SIGNS_BY_NAME[s[2]];
    }
    return C.SIGNS_BY_NAME['摩羯座']; // 1/1–1/19
  }

  /**
   * 计分。
   * answers: [{ questionIndex, optionIndex }]
   */
  function scoreAnswers(answers, content) {
    var C = need(content);
    var scores = { moon: 0, mercury: 0, venus: 0, mars: 0, saturn: 0 };
    var notes = [];
    var matched = [];

    (answers || []).forEach(function (a) {
      var q = C.QUESTIONS[a.questionIndex];
      if (!q) return;
      var opt = q.options[a.optionIndex];
      if (!opt) return;

      Object.keys(opt.weight).forEach(function (k) {
        if (typeof scores[k] === 'number') scores[k] += opt.weight[k];
      });

      matched.push({ q: q.q, label: opt.label, key: opt.key });
      if (opt.note) notes.push(opt.note);
    });

    var ranked = ORDER.slice().sort(function (x, y) {
      if (scores[y] !== scores[x]) return scores[y] - scores[x];
      return ORDER.indexOf(x) - ORDER.indexOf(y); // 同分稳定排序
    });

    return {
      scores: scores,
      ranked: ranked,
      primary: ranked[0],
      secondary: ranked[1],
      matched: matched,
      answerNotes: notes.slice(0, 2)
    };
  }

  /** 生成完整结果对象，供渲染层直接使用。 */
  function buildReport(input, content) {
    var C = need(content);
    var name = (input.name || '').trim().slice(0, 12) || '你';
    var sign = input.month && input.day ? getSign(input.month, input.day, C) : null;
    var scored = scoreAnswers(input.answers, C);

    var primary = C.ARCHETYPES[scored.primary];
    var secondary = C.ARCHETYPES[scored.secondary];
    var pair = C.PAIRS[scored.primary + '|' + scored.secondary] ||
               { title: primary.name, tagline: primary.line };

    var blend = '你的底色是' + primary.name + '，但' + secondary.name + '的部分也在你身上——' +
      secondary.gift.split('、')[0] + '是你不太主动展示、却一直在用的能力。';

    return {
      name: name,
      sign: sign,
      primaryKey: scored.primary,
      secondaryKey: scored.secondary,
      archetype: primary,
      secondary: secondary,
      pairTitle: pair.title,
      tagline: pair.tagline,
      blend: blend,
      elementNote: sign ? (C.ELEMENT_NOTE[sign.element] || '') : '',
      notes: scored.answerNotes,
      matched: scored.matched,
      scores: scored.scores,
      ranked: scored.ranked
    };
  }

  /** 分享/复制用的纯文本摘要 */
  function toShareText(report) {
    var lines = [
      '我的星语人格：' + report.pairTitle,
      '（' + report.archetype.name + ' × ' + report.secondary.name + '）',
      report.tagline
    ];
    if (report.sign) lines.push('太阳' + report.sign.name + ' · ' + report.sign.element + '元素');
    lines.push('—— 星语测试 · 仅供自我探索');
    return lines.join('\n');
  }

  return {
    ORDER: ORDER,
    getSign: getSign,
    scoreAnswers: scoreAnswers,
    buildReport: buildReport,
    toShareText: toShareText
  };
});

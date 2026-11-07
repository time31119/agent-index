/* TRACE compliance page — region pre-check demo */
(function () {
  "use strict";

  var $ = function (selector) {
    return document.querySelector(selector);
  };

  var regionSelect = $("#regionSelect");
  var investorSelect = $("#investorSelect");
  var checkButton = $("#checkRegion");
  var result = $("#regionResult");

  if (!regionSelect || !investorSelect || !checkButton || !result) return;

  var valueEl = result.querySelector(".result-value");
  var descEl = result.querySelector(".result-desc");

  var regions = {
    sg: {
      label: "新加坡",
      status: "open",
      title: "可进入 KYC 预审",
      desc: "仍需完成身份核验、衍生品适当性问卷与风险披露；最终准入以当地法律意见与平台审核为准。"
    },
    jp: {
      label: "日本",
      status: "open",
      title: "可进入 KYC 预审",
      desc: "需额外核验当地衍生品交易相关限制；预检不等于准入，正式流程可能要求补充材料。"
    },
    ae: {
      label: "阿联酋",
      status: "open",
      title: "可进入 KYC 预审",
      desc: "按所在酋长国与监管辖区逐项评估；仍需完成 KYC、适当性与风险披露。"
    },
    eu: {
      label: "欧盟",
      status: "open",
      title: "可进入 KYC 预审",
      desc: "需按成员国规则核验；杠杆、营销与适当性要求可能高于平台默认设置。"
    },
    hk: {
      label: "香港",
      status: "limited",
      title: "仅专业投资者单独审核",
      desc: "香港零售用户不开放。专业投资者需提交资质证明，并满足当地保证金、销售与披露要求后方可进入人工审核。"
    },
    us: {
      label: "美国",
      status: "blocked",
      title: "暂不开放",
      desc: "初期地域策略不面向美国用户。即使以专业投资者或机构身份申请，也不进入自动准入流程。"
    },
    ca: {
      label: "加拿大",
      status: "blocked",
      title: "暂不开放",
      desc: "初期地域策略不面向加拿大用户。请勿通过 VPN 或代理规避地域校验。"
    },
    gb: {
      label: "英国",
      status: "blocked",
      title: "暂不开放",
      desc: "初期地域策略不面向英国用户。正式展业前须完成当地监管评估。"
    },
    cn: {
      label: "中国大陆",
      status: "blocked",
      title: "暂不开放",
      desc: "初期地域策略不面向中国大陆用户。平台不针对该地区进行营销或招募。"
    },
    other: {
      label: "其他司法辖区",
      status: "limited",
      title: "需逐项法律评估",
      desc: "技术可访问不等于合规可服务。请提交居住地信息，由合规团队评估后再决定是否开放。"
    }
  };

  function paint(status) {
    result.classList.remove("blocked", "limited", "open");
    result.classList.add(status);
  }

  function runCheck() {
    var region = regionSelect.value;
    var investor = investorSelect.value;

    if (!region) {
      paint("limited");
      if (valueEl) valueEl.textContent = "请选择居住地";
      if (descEl) descEl.textContent = "地域预检需要居住地或证件签发地。未选择时不会给出准入结论。";
      regionSelect.focus();
      return;
    }

    var data = regions[region];

    if (region === "hk") {
      if (investor === "retail") {
        paint("blocked");
        if (valueEl) valueEl.textContent = "香港零售用户暂不开放";
        if (descEl) descEl.textContent = "香港证监会框架下，永续合约仅应向专业投资者提供。零售用户无法进入 KYC 流程。";
      } else {
        paint("limited");
        if (valueEl) valueEl.textContent = data.title;
        if (descEl) descEl.textContent = data.desc;
      }
      return;
    }

    paint(data.status);
    if (valueEl) valueEl.textContent = data.title;
    if (descEl) descEl.textContent = data.desc;
  }

  checkButton.addEventListener("click", runCheck);

  [regionSelect, investorSelect].forEach(function (select) {
    select.addEventListener("change", function () {
      if (regionSelect.value) runCheck();
    });
  });
})();

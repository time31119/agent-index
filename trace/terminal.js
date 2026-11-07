/* TRACE terminal demo interactions */
(function () {
  "use strict";

  var $ = function (selector, scope) {
    return (scope || document).querySelector(selector);
  };
  var $$ = function (selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  };

  /* ---------------------------------------------------------------- clock */
  var clock = $("#termClock");
  var greeting = $("#greeting");
  var timeFormatter = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  function tickClock() {
    var value = timeFormatter.format(new Date());
    if (clock) clock.textContent = value;
    if (greeting) {
      var hour = parseInt(value.slice(0, 2), 10) % 24;
      greeting.textContent = hour < 6 ? "凌晨好" : hour < 12 ? "上午好" : hour < 14 ? "中午好" : hour < 18 ? "下午好" : "晚上好";
    }
  }
  tickClock();
  window.setInterval(tickClock, 1000);

  /* ------------------------------------------------------ settlement ring */
  var settleIn = $("#settleIn");
  var settleRing = $("#settleRing");

  function updateSettlement() {
    if (!settleIn) return;
    var now = new Date();
    var utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    var cst = new Date(utcMs + 8 * 3600000);
    var nextMidnight = Date.UTC(cst.getUTCFullYear(), cst.getUTCMonth(), cst.getUTCDate() + 1, 0, 0, 0);
    var hours = Math.max(0, nextMidnight - cst.getTime()) / 3600000;

    settleIn.textContent = hours < 1 ? "<1h" : Math.round(hours) + "h";
    if (settleRing) {
      var fraction = Math.max(0, Math.min(1, hours / 24));
      settleRing.setAttribute("stroke-dashoffset", String((113 * (1 - fraction)).toFixed(1)));
    }
  }
  updateSettlement();
  window.setInterval(updateSettlement, 60000);

  /* --------------------------------------------------------- toast helper */
  var toast = $("#toast");
  var toastTimer = null;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("show");
    }, 3400);
  }

  /* ---------------------------------------------------------- equity chart */
  var chart = $("#equityChart");
  var tooltip = $("#chartTooltip");

  var SERIES = {
    "7D": makeSeries(24, 12010, 12846.2, 210, 1.7),
    "30D": makeSeries(30, 11240, 12846.2, 260, 4.2),
    "90D": makeSeries(45, 9860, 12846.2, 300, 8.6)
  };

  var currentRange = "7D";
  var currentPoints = [];
  var chartGeometry = { padL: 46, padR: 14, padT: 18, padB: 28, w: 760, h: 280 };

  function makeSeries(count, start, end, amp, seed) {
    var values = [];
    var noise = 0.37;
    for (var i = 0; i < count; i++) {
      var t = i / (count - 1);
      var base = start + (end - start) * t;
      var wave =
        Math.sin(i * 0.72 + seed) * amp * 0.55 +
        Math.sin(i * 1.63 + seed * 2.1) * amp * 0.25 +
        Math.sin(i * 0.31 + seed * 0.7) * amp * 0.3;
      noise = (noise * 9301 + 49297) % 233280;
      var jitter = (noise / 233280 - 0.5) * amp * 0.55;
      values.push(Math.max(start * 0.9, base + wave + jitter));
    }
    values[count - 1] = end;
    return values;
  }

  function dateLabel(index, total, range) {
    var days = range === "7D" ? 7 : range === "30D" ? 30 : 90;
    var step = range === "90D" ? 2 : 1;
    var offset = (total - 1 - index) * step;
    var d = new Date();
    d.setDate(d.getDate() - offset);
    return String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function smoothPath(points) {
    if (!points.length) return "";
    var d = "M" + points[0].x.toFixed(2) + " " + points[0].y.toFixed(2);
    for (var i = 0; i < points.length - 1; i++) {
      var p0 = points[i];
      var p1 = points[i + 1];
      var midX = (p0.x + p1.x) / 2;
      d += " C" + midX.toFixed(2) + " " + p0.y.toFixed(2) + ", " + midX.toFixed(2) + " " + p1.y.toFixed(2) + ", " + p1.x.toFixed(2) + " " + p1.y.toFixed(2);
    }
    return d;
  }

  function renderChart(range) {
    if (!chart) return;
    currentRange = range;
    if (tooltip) {
      tooltip.classList.remove("show");
      tooltip.setAttribute("aria-hidden", "true");
    }
    var values = SERIES[range];
    var g = chartGeometry;
    var plotW = g.w - g.padL - g.padR;
    var plotH = g.h - g.padT - g.padB;
    var min = Math.min.apply(null, values);
    var max = Math.max.apply(null, values);
    var span = Math.max(max - min, 1);
    min = Math.floor((min - span * 0.18) / 100) * 100;
    max = Math.ceil((max + span * 0.12) / 100) * 100;

    var points = values.map(function (value, index) {
      return {
        value: value,
        x: g.padL + (index / (values.length - 1)) * plotW,
        y: g.padT + (1 - (value - min) / (max - min)) * plotH,
        label: dateLabel(index, values.length, range)
      };
    });
    currentPoints = points;

    var gridMarkup = "";
    for (var i = 0; i <= 4; i++) {
      var gy = g.padT + (i / 4) * plotH;
      var gv = max - (i / 4) * (max - min);
      gridMarkup += '<line class="chart-gridline" x1="' + g.padL + '" y1="' + gy + '" x2="' + (g.w - g.padR) + '" y2="' + gy + '"/>';
      gridMarkup += '<text class="chart-axis" x="' + (g.padL - 8) + '" y="' + (gy + 3) + '" text-anchor="end">' + Math.round(gv).toLocaleString("en-US") + "</text>";
    }

    var xLabels = "";
    [0, 0.25, 0.5, 0.75, 1].forEach(function (ratio) {
      var index = Math.round(ratio * (values.length - 1));
      var p = points[index];
      xLabels += '<text class="chart-axis" x="' + p.x + '" y="' + (g.h - 8) + '" text-anchor="middle">' + p.label + "</text>";
    });

    var linePath = smoothPath(points);
    var areaPath = linePath + " L" + points[points.length - 1].x.toFixed(2) + " " + (g.padT + plotH) + " L" + points[0].x.toFixed(2) + " " + (g.padT + plotH) + " Z";

    chart.innerHTML =
      '<defs><linearGradient id="equityArea" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#c6f75a" stop-opacity=".17"/>' +
      '<stop offset="1" stop-color="#c6f75a" stop-opacity="0"/>' +
      "</linearGradient></defs>" +
      gridMarkup +
      xLabels +
      '<path class="chart-area-main" d="' + areaPath + '"/>' +
      '<path class="chart-line-main" d="' + linePath + '"/>' +
      '<line id="chartCrosshair" class="chart-crosshair" x1="0" y1="' + g.padT + '" x2="0" y2="' + (g.padT + plotH) + '"/>' +
      '<circle id="chartDot" class="chart-dot" cx="0" cy="0" r="3.5"/>' +
      '<rect id="chartHit" x="' + g.padL + '" y="' + g.padT + '" width="' + plotW + '" height="' + plotH + '" fill="transparent" pointer-events="all" style="cursor:crosshair"/>';

    chart.setAttribute("aria-label", "账户权益曲线，周期 " + range + "，当前 " + values[values.length - 1].toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " USDT");

    $$("[data-range]").forEach(function (button) {
      var active = button.getAttribute("data-range") === range;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    bindChartHover();
  }

  function bindChartHover() {
    var hit = $("#chartHit");
    var crosshair = $("#chartCrosshair");
    var dot = $("#chartDot");
    if (!hit || !chart || !tooltip) return;

    function move(event) {
      var rect = chart.getBoundingClientRect();
      var viewX = ((event.clientX - rect.left) / rect.width) * chartGeometry.w;
      var nearest = currentPoints[0];
      var best = Infinity;
      currentPoints.forEach(function (point) {
        var distance = Math.abs(point.x - viewX);
        if (distance < best) {
          best = distance;
          nearest = point;
        }
      });

      if (crosshair) {
        crosshair.setAttribute("x1", nearest.x);
        crosshair.setAttribute("x2", nearest.x);
        crosshair.style.opacity = "1";
      }
      if (dot) {
        dot.setAttribute("cx", nearest.x);
        dot.setAttribute("cy", nearest.y);
        dot.style.opacity = "1";
      }

      var ttDate = $(".tt-date", tooltip);
      var ttValue = $(".tt-value", tooltip);
      if (ttDate) ttDate.textContent = nearest.label + " · " + currentRange;
      if (ttValue) ttValue.textContent = "$" + nearest.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      var left = (nearest.x / chartGeometry.w) * rect.width + 14;
      var top = (nearest.y / chartGeometry.h) * rect.height + 6;
      tooltip.style.left = Math.max(60, Math.min(left, rect.width - 54)) + "px";
      tooltip.style.top = Math.max(46, top) + "px";
      tooltip.classList.add("show");
      tooltip.setAttribute("aria-hidden", "false");
    }

    function leave() {
      tooltip.classList.remove("show");
      tooltip.setAttribute("aria-hidden", "true");
      if (crosshair) crosshair.style.opacity = "0";
      if (dot) dot.style.opacity = "0";
    }

    hit.addEventListener("pointermove", move);
    hit.addEventListener("pointerleave", leave);
    hit.addEventListener("pointercancel", leave);
  }

  if (chart) {
    renderChart("7D");
    $$("[data-range]").forEach(function (button) {
      button.addEventListener("click", function () {
        renderChart(button.getAttribute("data-range"));
      });
    });
  }

  /* ------------------------------------------------------- copy on / off */
  var copyToggle = $("#copyToggle");
  var copyRunning = true;

  function setCopyRunning(running) {
    copyRunning = running;
    if (!copyToggle) return;
    copyToggle.setAttribute("data-running", String(running));
    copyToggle.setAttribute("aria-pressed", String(running));
    var label = $("span", copyToggle);
    if (label) label.textContent = running ? "跟单运行中" : "跟单已暂停";
    showToast(running ? "跟单已恢复。新信号将重新进入风控队列。" : "跟单已暂停。已有仓位保留，新信号不再执行。");
  }

  if (copyToggle) {
    copyToggle.addEventListener("click", function () {
      setCopyRunning(!copyRunning);
    });
  }

  /* --------------------------------------------------------- risk valves */
  var equity = 12846.20;
  var notionalTotal = 9091.52;
  var dailyLossUsed = 0;

  var slipT = $("#slipRangeT");
  var levT = $("#levRangeT");
  var lossT = $("#lossRangeT");
  var slipValueT = $("#slipValueT");
  var levValueT = $("#levValueT");
  var lossValueT = $("#lossValueT");
  var dailyRemaining = $("#dailyRemaining");
  var marginUsage = $("#marginUsage");

  function money(value) {
    return "$" + value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function setFill(input) {
    if (!input) return;
    var min = parseFloat(input.min);
    var max = parseFloat(input.max);
    var value = parseFloat(input.value);
    input.style.setProperty("--fill", ((value - min) / (max - min)) * 100 + "%");
  }

  function updateRisk() {
    if (!slipT || !levT || !lossT) return;

    var slip = parseFloat(slipT.value);
    var lev = parseFloat(levT.value);
    var loss = parseFloat(lossT.value);

    if (slipValueT) slipValueT.textContent = slip.toFixed(2) + "%";
    if (levValueT) levValueT.textContent = lev.toFixed(1) + "x";
    if (lossValueT) lossValueT.textContent = loss.toFixed(0) + "%";

    var limit = equity * (loss / 100);
    var remaining = Math.max(0, limit - dailyLossUsed);
    var margin = notionalTotal / lev;
    var usage = (margin / equity) * 100;

    if (dailyRemaining) dailyRemaining.textContent = money(remaining);
    if (marginUsage) marginUsage.textContent = usage.toFixed(1) + "%";

    [slipT, levT, lossT].forEach(setFill);
  }

  if (slipT && levT && lossT) {
    [slipT, levT, lossT].forEach(function (input) {
      input.addEventListener("input", updateRisk);
    });
    updateRisk();
  }

  var applyRisk = $("#applyRisk");
  if (applyRisk) {
    applyRisk.addEventListener("click", function () {
      updateRisk();
      var slip = slipT ? parseFloat(slipT.value).toFixed(2) : "0.30";
      showToast("风控参数已应用（演示）：滑点上限 " + slip + "%，仅影响新信号。");
    });
  }

  var resetRisk = $("#resetRisk");
  if (resetRisk) {
    resetRisk.addEventListener("click", function () {
      if (slipT) slipT.value = "0.30";
      if (levT) levT.value = "3";
      if (lossT) lossT.value = "8";
      updateRisk();
      showToast("风控参数已恢复默认值。");
    });
  }

  /* ---------------------------------------------------------- close trade */
  var posBody = $("#posBody");
  var positionCount = $("#positionCount");
  var positionsTag = $("#positions .tag");
  var closeAll = $("#closeAll");
  var closeAllConfirm = false;
  var closeAllTimer = null;

  function updatePositionMeta() {
    if (!posBody) return;
    var rows = $$("tr:not(.empty-row)", posBody);
    var count = rows.length;
    if (positionCount) positionCount.innerHTML = count + "<small> 个</small>";
    if (positionsTag) positionsTag.textContent = count + " / 3";

    notionalTotal = rows.reduce(function (sum, row) {
      return sum + (parseFloat(row.getAttribute("data-notional")) || 0);
    }, 0);
    updateRisk();

    if (!count) {
      if (posBody.querySelector(".empty-row")) return;
      var empty = document.createElement("tr");
      empty.className = "empty-row";
      empty.innerHTML = '<td colspan="8">当前无跟单仓位。暂停或平仓不会影响信号源本身。</td>';
      posBody.appendChild(empty);
    }
  }

  function removeRow(row, announce) {
    if (!row || row.classList.contains("empty-row")) return;
    row.style.opacity = "0";
    row.style.transform = "translateX(4px)";
    window.setTimeout(function () {
      row.remove();
      updatePositionMeta();
    }, 240);
    if (announce) showToast("平仓指令已提交（演示），不会发送到交易所。");
  }

  if (posBody) {
    posBody.addEventListener("click", function (event) {
      var button = event.target.closest(".pos-close");
      if (!button) return;
      var row = button.closest("tr");
      removeRow(row, true);
    });
  }

  if (closeAll) {
    closeAll.addEventListener("click", function () {
      var rows = posBody ? $$("tr:not(.empty-row)", posBody) : [];
      if (!rows.length) {
        showToast("当前没有可平仓位。");
        return;
      }
      if (!closeAllConfirm) {
        closeAllConfirm = true;
        closeAll.textContent = "确认全部平仓";
        closeAll.style.color = "var(--orange)";
        window.clearTimeout(closeAllTimer);
        closeAllTimer = window.setTimeout(function () {
          closeAllConfirm = false;
          closeAll.textContent = "全部平仓";
          closeAll.style.color = "";
        }, 3200);
        showToast("再次点击确认全部平仓（演示操作）。");
        return;
      }

      closeAllConfirm = false;
      closeAll.textContent = "全部平仓";
      closeAll.style.color = "";
      rows.forEach(function (row, index) {
        window.setTimeout(function () {
          removeRow(row, false);
          if (index === rows.length - 1) {
            updatePositionMeta();
            showToast("全部仓位已模拟平仓，未连接交易所。");
          }
        }, index * 110);
      });
    });
  }

  /* ----------------------------------------------------------- signal feed */
  var feed = $("#signalFeed");
  var feedPause = $("#feedPause");
  var simulateSignal = $("#simulateSignal");
  var feedPaused = false;

  var SIGNALS = [
    { symbol: "BTC-PERP", side: "OPEN LONG", color: "var(--lime)", qty: "0.0400 BTC", source: "HL", latency: 178, note: "ATLAS-07 · 定比换算" },
    { symbol: "ETH-PERP", side: "REDUCE 20%", color: "var(--orange)", qty: "0.1600 ETH", source: "HL", latency: 192, note: "ATLAS-07 · 部分平仓镜像" },
    { symbol: "SOL-PERP", side: "OPEN SHORT", color: "var(--orange)", qty: "18.00 SOL", source: "OKX", latency: 1020, note: "NOVA-03 · 快照增量" },
    { symbol: "BTC-PERP", side: "CLOSE LONG", color: "var(--orange)", qty: "0.0200 BTC", source: "HL", latency: 164, note: "ATLAS-07 · 全平" },
    { symbol: "DOGE-PERP", side: "OPEN LONG", color: "var(--lime)", qty: "2,400 DOGE", source: "OKX", latency: 980, note: "NOVA-03 · 快照增量" }
  ];

  function nowTime() {
    return timeFormatter.format(new Date());
  }

  function formatLatency(value, source) {
    return source === "OKX" ? (value / 1000).toFixed(2) + "s" : value + "ms";
  }

  function prependLog(signal) {
    var list = $(".log-list");
    if (!list) return;
    var row = document.createElement("div");
    row.className = "log-row";
    row.innerHTML =
      '<span class="log-tag">' + nowTime() + "</span>" +
      '<span class="log-msg">SIGNAL INGESTED · ' + signal.source + " · " + signal.symbol + " · " + signal.side + "</span>" +
      '<span class="log-ok">OK</span>';
    list.insertBefore(row, list.firstChild);
    while (list.children.length > 5 && list.lastElementChild) list.removeChild(list.lastElementChild);
  }

  function addSignal() {
    if (!feed) return;
    if (!copyRunning) {
      showToast("跟单已暂停，信号不会执行。请先恢复跟单。");
      return;
    }
    if (feedPaused) {
      showToast("信号流已暂停，点击“继续”后再模拟。");
      return;
    }

    var signal = SIGNALS[Math.floor(Math.random() * SIGNALS.length)];
    var latency = signal.source === "OKX" ? 900 + Math.floor(Math.random() * 180) : 150 + Math.floor(Math.random() * 70);
    var row = document.createElement("div");
    row.className = "signal-row";
    row.innerHTML =
      '<span class="signal-time">' + nowTime() + "</span>" +
      '<div class="signal-main">' +
      '<div class="signal-title">' + signal.symbol + ' <span style="color:' + signal.color + '">' + signal.side + '</span> <span class="source">· ' + signal.source + "</span></div>" +
      '<div class="signal-meta">' + signal.note + " · " + signal.qty + "</div>" +
      "</div>" +
      '<span class="signal-latency">' + formatLatency(latency, signal.source) + "<small>LATENCY</small></span>";

    feed.insertBefore(row, feed.firstChild);
    while (feed.children.length > 6 && feed.lastElementChild) feed.removeChild(feed.lastElementChild);
    prependLog(signal);
    showToast(signal.symbol + " " + signal.side + " 信号已进入队列（演示），延迟 " + formatLatency(latency, signal.source) + "。");
  }

  if (simulateSignal) simulateSignal.addEventListener("click", addSignal);

  if (feedPause) {
    feedPause.addEventListener("click", function () {
      feedPaused = !feedPaused;
      feedPause.textContent = feedPaused ? "继续" : "暂停";
      feedPause.setAttribute("aria-pressed", String(feedPaused));
      feedPause.classList.toggle("active", feedPaused);
      showToast(feedPaused ? "信号流显示已暂停，模拟信号暂不写入。" : "信号流已继续。");
    });
  }

  /* ------------------------------------------------------------ reconcile */
  var lastReconcile = Date.now() - 12000;
  var reconcileAge = $("#reconcileAge");

  function updateReconcileAge() {
    if (!reconcileAge) return;
    var seconds = Math.max(0, Math.floor((Date.now() - lastReconcile) / 1000));
    reconcileAge.textContent = seconds < 2 ? "刚刚完成" : seconds + " 秒前完成";
  }
  updateReconcileAge();
  window.setInterval(updateReconcileAge, 1000);
  window.setInterval(function () {
    lastReconcile = Date.now();
  }, 30000);

  var reconcileRefresh = $("#reconcileRefresh");
  if (reconcileRefresh) {
    reconcileRefresh.addEventListener("click", function () {
      lastReconcile = Date.now();
      updateReconcileAge();
      showToast("对账完成：仓位偏差 0.31%，低于 5.00% 阈值。");
    });
  }
})();

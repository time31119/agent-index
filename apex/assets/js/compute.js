(function () {
  'use strict';
  const A = window.APEX, U = A.ui;
  const grid = document.getElementById('gpuGrid');
  const chips = document.getElementById('regionChips');
  if (!grid) return;

  let region = A.REGIONS[0];
  let spot = false;

  const fmt = n => '$' + Math.round(n).toLocaleString('en-US');
  const shortMem = g => g.mem.split(' ').slice(0, 2).join(' ');
  const shortCompute = g => g.compute.split(' ').slice(0, 2).join(' ');

  function renderRegions() {
    chips.innerHTML = A.REGIONS.map(r =>
      '<button class="chip' + (r.id === region.id ? ' is-active' : '') + '" data-region="' + r.id + '">' +
      '<span class="mono" style="font-size:9.5px">' + r.code + '</span>' + r.city + '</button>').join('');
  }

  function renderGpus() {
    grid.innerHTML = A.GPUS.map(g => {
      const price = g.price * region.mult;
      const spotPrice = g.spot * region.mult;
      const pct = Math.min(100, Math.round(g.stock / g.total * 100));
      const badge = g.badge ? '<span class="badge' + (g.badge === '最受欢迎' || g.badge === '旗舰' ? ' badge-gold' : '') + '">' + g.badge + '</span>' : '';
      return '<article class="gpu-card' + (g.id === 'h200' ? ' is-featured' : '') + '" id="gpu-' + g.id + '">' + badge +
        '<div class="gpu-card-top"><div><div class="gpu-card-name">' + g.name + '</div>' +
          '<div class="gpu-card-vendor">' + g.vendor + ' · ' + g.cat + '</div></div></div>' +
        '<p class="gpu-card-note">' + g.note + '</p>' +
        '<div class="gpu-spec-grid">' +
          '<div><b>' + shortMem(g) + '</b><span>显存</span></div>' +
          '<div><b>' + g.bw + '</b><span>带宽</span></div>' +
          '<div><b>' + shortCompute(g) + '</b><span>算力</span></div>' +
        '</div>' +
        '<div class="gpu-card-bottom">' +
          '<div class="gpu-card-price">$' + price.toFixed(2) + '<span> / GPU·h</span>' +
            '<span class="spot">现货 $' + spotPrice.toFixed(2) + '</span></div>' +
          '<div class="gpu-card-stock"><b>' + g.stock + ' 卡</b>' + pct + '% 余量</div>' +
        '</div>' +
        '<a class="btn btn-light btn-sm btn-block mt-16" href="console.html?gpu=' + g.id + '">部署此型号</a>' +
      '</article>';
    }).join('');
  }

  chips.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-region]');
    if (!btn) return;
    region = A.REGIONS.find(r => r.id === btn.getAttribute('data-region')) || region;
    renderRegions();
    renderGpus();
    document.getElementById('calcRegion').value = region.id;
    calc();
  });

  /* calculator */
  const calcGpu = document.getElementById('calcGpu');
  const calcRegion = document.getElementById('calcRegion');
  const calcCount = document.getElementById('calcCount');
  const calcHours = document.getElementById('calcHours');
  const calcSpot = document.getElementById('calcSpot');
  const elCount = document.getElementById('calcCountVal');
  const elHours = document.getElementById('calcHoursVal');
  const elTotal = document.getElementById('calcTotal');
  const elLines = document.getElementById('calcLines');
  const elSave = document.getElementById('calcSave');

  calcGpu.innerHTML = A.GPUS.map(g => '<option value="' + g.id + '">' + g.name + ' · $' + g.price.toFixed(2) + '/h</option>').join('');
  calcGpu.value = 'h200';
  calcRegion.innerHTML = A.REGIONS.map(r => '<option value="' + r.id + '">' + r.city + ' · ' + r.code + '</option>').join('');
  calcRegion.value = region.id;

  function calc() {
    const g = A.GPUS.find(x => x.id === calcGpu.value) || A.GPUS[0];
    const r = A.REGIONS.find(x => x.id === calcRegion.value) || A.REGIONS[0];
    const count = parseInt(calcCount.value, 10);
    const hours = parseInt(calcHours.value, 10);
    spot = calcSpot.checked;

    const onDemandUnit = g.price * r.mult;
    const unit = onDemandUnit * (spot ? 0.58 : 1);
    const monthly = unit * count * hours * 30;
    const base = onDemandUnit * count * hours * 30;

    elCount.textContent = count + ' 卡';
    elHours.textContent = hours + ' 小时 / 天';
    elTotal.innerHTML = fmt(monthly) + '<small> / 月</small>';
    elLines.innerHTML =
      '<div><span>按需单价 · ' + g.short + '</span><b>$' + onDemandUnit.toFixed(2) + ' /h</b></div>' +
      '<div><span>数量 × 月时长</span><b>' + count + ' × ' + (hours * 30) + ' h</b></div>' +
      '<div><span>区域系数 · ' + r.code + '</span><b>× ' + r.mult.toFixed(2) + '</b></div>' +
      '<div><span>现货折扣</span><b>' + (spot ? '−42%' : '—') + '</b></div>' +
      '<div><span>网络与存储</span><b>已包含</b></div>';

    if (spot) {
      elSave.textContent = '较按需节省 ' + fmt(base - monthly) + ' / 月（42%）';
    } else {
      const save = base * 0.42;
      elSave.textContent = '切换现货可省 ' + fmt(save) + ' / 月';
    }
  }

  [calcGpu, calcRegion, calcCount, calcHours, calcSpot].forEach(el => {
    el.addEventListener('input', calc);
    el.addEventListener('change', calc);
  });

  /* providers */
  const rows = document.getElementById('providerRows');
  if (rows) {
    rows.innerHTML = A.PROVIDERS.map(p =>
      '<tr><td>' + p.name + '</td><td class="num">' + p.region + '</td><td>' + p.gpus + '</td>' +
      '<td class="num">' + p.capacity + ' GPU</td><td class="num">' + p.sla + '</td></tr>').join('');
  }

  renderRegions();
  renderGpus();
  calc();

  if (location.hash.indexOf('#gpu-') === 0) {
    const el = document.querySelector(location.hash);
    if (el) setTimeout(() => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 90), 60);
  }
})();

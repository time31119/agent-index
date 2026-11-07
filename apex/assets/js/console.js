(function () {
  'use strict';
  const A = window.APEX, U = A.ui;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- spend chart ---------- */
  const chartHost = document.getElementById('spendChart');
  if (chartHost) {
    const data = [118, 132, 126, 148, 141, 162, 155, 171, 166, 184, 178, 196, 188, 204];
    const max = 220;
    const labels = ['10/25', '26', '27', '28', '29', '30', '31', '11/01', '02', '03', '04', '05', '06', '今'];
    chartHost.innerHTML =
      '<div class="chart">' + data.map((v, i) =>
        '<div class="bar' + (i === data.length - 1 ? ' is-today' : '') + '" style="height:' + Math.round(v / max * 100) + '%" title="$' + v + '"></div>'
      ).join('') + '</div>' +
      '<div class="chart-x">' + labels.map(l => '<span>' + l + '</span>').join('') + '</div>';
  }

  /* ---------- deployments ---------- */
  const depRows = document.getElementById('deploymentRows');
  const DEPLOYMENTS = [
    { id: 'atlas-research', region: 'US-E · H200', cost: '$412.80' },
    { id: 'echo-support', region: 'US-E · L40S', cost: '$186.40' },
    { id: 'codepilot-x', region: 'EU-N · L40S', cost: '$243.10' },
    { id: 'tempo', region: 'AP-NE · L40S', cost: '$98.20' },
    { id: 'sentinel', region: 'US-E · H100', cost: '$1,024.60' }
  ];
  if (depRows) {
    depRows.innerHTML = DEPLOYMENTS.map(d => {
      const a = A.AGENTS.find(x => x.id === d.id) || A.AGENTS[0];
      return '<div class="dep-row">' +
        '<span class="dep-name">' + U.agentIcon(a, 'sm') + '<span>' + a.name + '<span class="dep-meta" style="display:block">' + a.cat + '</span></span></span>' +
        '<span class="dep-status"><span class="dot-live"></span>运行中</span>' +
        '<span class="dep-meta">' + d.region + '</span>' +
        '<span class="dep-cost">' + d.cost + '</span>' +
        '<a href="agent.html?id=' + a.id + '" aria-label="查看详情"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="color:var(--muted)"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>' +
        '</div>';
    }).join('');
  }

  /* ---------- wizard ---------- */
  const stepTabs = U.$$('#stepper .step-tab');
  const panels = U.$$('.wizard-step');
  const nextBtn = document.getElementById('wizNext');
  const backBtn = document.getElementById('wizBack');
  const agentOpts = document.getElementById('agentOptions');
  const gpuOpts = document.getElementById('gpuOptions');
  const regionSel = document.getElementById('wizRegion');
  const replicasSel = document.getElementById('wizReplicas');
  if (!agentOpts) return;

  const state = { agent: A.AGENTS[0], gpu: A.GPUS.find(g => g.id === 'h200') || A.GPUS[0], region: A.REGIONS[0], replicas: 2, perms: 3 };
  const chosen = (A.GPUS.find(g => g.id === paramsGpu()) || state.gpu);
  function paramsGpu() {
    const p = new URLSearchParams(location.search).get('gpu');
    return p || '';
  }
  state.gpu = chosen;
  const pAgent = new URLSearchParams(location.search).get('agent');
  const found = A.AGENTS.find(x => x.id === pAgent);
  if (found) state.agent = found;

  const pickAgents = ['atlas-research', 'codepilot-x', 'echo-support', 'tempo', 'ledger', 'sentinel']
    .map(id => A.AGENTS.find(x => x.id === id)).filter(Boolean);

  agentOpts.innerHTML = pickAgents.map(a =>
    '<div class="opt' + (a.id === state.agent.id ? ' is-selected' : '') + '" data-agent="' + a.id + '">' +
      '<div class="t"><span class="oi ' + a.gradient + '">' + U.markSVG(a.mark) + '</span>' + a.name + '</div>' +
      '<div class="s">' + a.zh + ' · ' + a.rating.toFixed(1) + ' ★</div>' +
      '<div class="p">' + a.price.label + '</div>' +
    '</div>').join('');

  const pickGpus = ['h200', 'b200', 'l40s', 'mi300x'].map(id => A.GPUS.find(g => g.id === id)).filter(Boolean);
  gpuOpts.innerHTML = pickGpus.map(g =>
    '<div class="opt' + (g.id === state.gpu.id ? ' is-selected' : '') + '" data-gpu="' + g.id + '">' +
      '<div class="t">' + g.short + '</div>' +
      '<div class="s">' + g.mem + ' · ' + g.cat + '</div>' +
      '<div class="p">$' + g.price.toFixed(2) + ' / GPU·h</div>' +
    '</div>').join('');

  regionSel.innerHTML = A.REGIONS.map(r => '<option value="' + r.id + '">' + r.city + ' · ' + r.code + '</option>').join('');
  regionSel.value = state.region.id;
  replicasSel.value = String(state.replicas);

  function updateSummary() {
    const perms = U.$$('[data-perm]').filter(i => i.checked).length;
    state.perms = perms;
    const gpuCount = state.replicas * 0.2;
    const cost = state.gpu.price * state.region.mult * gpuCount * 730;
    document.getElementById('sumAgent').textContent = state.agent.name;
    document.getElementById('sumGpu').textContent = state.gpu.short + ' · ' + gpuCount.toFixed(1) + ' GPU';
    document.getElementById('sumRegion').textContent = state.region.code + ' · ' + state.region.city;
    document.getElementById('sumReplicas').textContent = state.replicas;
    document.getElementById('sumPerms').textContent = perms + ' 项' + (perms === 0 ? '（无工具）' : '');
    document.getElementById('sumCost').textContent = '$' + Math.round(cost).toLocaleString('en-US');
    document.getElementById('sumUnit').textContent = '$' + (state.gpu.price * state.region.mult).toFixed(2) + ' / GPU·h';
  }

  function goto(step) {
    step = Math.max(0, Math.min(3, step));
    stepTabs.forEach((t, i) => {
      t.classList.toggle('is-active', i === step);
      t.classList.toggle('is-done', i < step);
    });
    panels.forEach((p, i) => p.classList.toggle('is-active', i === step));
    backBtn.disabled = step === 0;
    nextBtn.style.display = step === 3 ? 'none' : '';
    nextBtn.textContent = step === 2 ? '检查配置' : '下一步';
  }

  stepTabs.forEach(t => t.addEventListener('click', () => goto(parseInt(t.getAttribute('data-step'), 10))));
  nextBtn.addEventListener('click', () => {
    const cur = panels.findIndex(p => p.classList.contains('is-active'));
    goto(cur + 1);
  });
  backBtn.addEventListener('click', () => {
    const cur = panels.findIndex(p => p.classList.contains('is-active'));
    goto(cur - 1);
  });

  agentOpts.addEventListener('click', (e) => {
    const el = e.target.closest('[data-agent]');
    if (!el) return;
    state.agent = A.AGENTS.find(x => x.id === el.getAttribute('data-agent')) || state.agent;
    U.$$('[data-agent]', agentOpts).forEach(o => o.classList.toggle('is-selected', o === el));
    updateSummary();
  });

  gpuOpts.addEventListener('click', (e) => {
    const el = e.target.closest('[data-gpu]');
    if (!el) return;
    state.gpu = A.GPUS.find(x => x.id === el.getAttribute('data-gpu')) || state.gpu;
    U.$$('[data-gpu]', gpuOpts).forEach(o => o.classList.toggle('is-selected', o === el));
    updateSummary();
  });

  regionSel.addEventListener('change', () => {
    state.region = A.REGIONS.find(r => r.id === regionSel.value) || state.region;
    updateSummary();
  });
  replicasSel.addEventListener('change', () => {
    state.replicas = parseInt(replicasSel.value, 10) || 1;
    updateSummary();
  });
  U.$$('[data-perm]').forEach(i => i.addEventListener('change', updateSummary));

  const deployBtn = document.getElementById('deployBtn');
  const logBox = document.querySelector('.wizard-step[data-panel="3"] .run-body');
  deployBtn.addEventListener('click', () => {
    if (deployBtn.disabled) return;
    deployBtn.disabled = true;
    deployBtn.textContent = '部署中…';
    const lines = [
      ['01', '创建命名空间 apex-prod/' + state.agent.id, ''],
      ['02', '拉取镜像 registry.apex.run/' + state.agent.id + ':3.2.0', ''],
      ['03', '挂载 Agent Passport · ' + state.perms + ' 个权限', ''],
      ['04', '调度至 ' + state.region.code + ' · ' + state.gpu.short + ' × ' + (state.replicas * 0.2).toFixed(1), ''],
      ['05', '健康检查通过 · ' + state.replicas + '/' + state.replicas + ' 副本就绪', 'ok'],
      ['06', '✓ 已上线 · https://' + state.agent.id + '.apex.run', 'ok']
    ];
    logBox.innerHTML = '';
    lines.forEach((l, i) => {
      setTimeout(() => {
        logBox.insertAdjacentHTML('beforeend', '<div class="step"><i>' + l[0] + '</i><span class="' + l[2] + '">' + l[1] + '</span></div>');
        if (i === lines.length - 1) {
          deployBtn.disabled = false;
          deployBtn.textContent = '查看运行实例';
          U.toast(state.agent.name + ' 已部署到 ' + state.region.code);
        }
      }, 420 * (i + 1));
    });
  });

  updateSummary();
  goto(0);
})();


/* Headless interaction QA via the Chrome DevTools Protocol.
   Usage: node scripts/qa-cdp.cjs
   Requires Microsoft Edge installed at the default Windows path. */
const { spawn } = require('child_process');
const http = require('http');

const EDGE = process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9333;
const BASE = 'file:///C:/Users/Administrator/Documents/deepseek-harness/default-workspace/botique/';
const profile = 'C:\\Users\\Administrator\\Documents\\deepseek-harness\\default-workspace\\botique\\.edge-qa';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getJSON(path) {
  return new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port: PORT, path }, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => { try { resolve(JSON.parse(body)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

async function main() {
  const edge = spawn(EDGE, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars',
    '--allow-file-access-from-files', '--remote-debugging-port=' + PORT,
    '--user-data-dir=' + profile, 'about:blank'
  ], { stdio: 'ignore', detached: true });
  edge.unref();

  let version = null;
  for (let i = 0; i < 40; i++) {
    try { version = await getJSON('/json/version'); break; } catch (e) { await sleep(250); }
  }
  if (!version) throw new Error('Edge did not open the debugging port');

  const tabs = await getJSON('/json/list');
  const tab = tabs.filter(function (t) { return t.type === 'page'; })[0] || tabs[0];
  if (!tab) throw new Error('No debuggable page found');
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });

  let id = 0;
  const pending = new Map();
  const errors = [];
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id) {
      const p = pending.get(msg.id);
      if (!p) return;
      pending.delete(msg.id);
      if (msg.error) p.reject(new Error(JSON.stringify(msg.error)));
      else p.resolve(msg.result);
      return;
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails;
      errors.push('exception: ' + (d.exception && d.exception.description || d.text));
    }
    if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
      errors.push('log: ' + msg.params.entry.text);
    }
  };
  const send = (method, params) => new Promise((resolve, reject) => {
    const i = ++id;
    pending.set(i, { resolve, reject });
    ws.send(JSON.stringify({ id: i, method, params: params || {} }));
  });
  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
    return r.result.value;
  };
  const nav = async (url) => {
    await send('Page.navigate', { url });
    await sleep(1200);
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Log.enable');

  const out = {};

  await nav(BASE + 'index.html');
  out.home = await evaluate(`({title:document.title, cards:document.querySelectorAll('.product-card').length, cats:document.querySelectorAll('.cat-card').length, hero:document.querySelector('.hero h1').innerText})`);
  await evaluate(`document.querySelector('[data-add]').click()`);
  await sleep(350);
  out.add = await evaluate(`({cart:document.querySelector('[data-cart-count]').textContent, drawer:document.querySelector('#cart-drawer').classList.contains('is-open'), lines:document.querySelectorAll('.cart-line').length})`);
  await evaluate(`document.querySelector('[data-close-drawer]').click()`);
  await evaluate(`document.querySelector('[data-open-search]').click()`);
  await evaluate(`(()=>{const i=document.querySelector('#search-input'); i.value='loona'; i.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  await sleep(250);
  out.search = await evaluate(`({open:document.querySelector('#search-overlay').classList.contains('is-open'), results:document.querySelectorAll('.search-row').length})`);
  await evaluate(`document.querySelector('[data-close-search]').click()`);

  await nav(BASE + 'shop.html');
  out.shop = await evaluate(`({cards:document.querySelectorAll('.shop-grid .product-card').length, count:document.querySelector('#result-count').innerText})`);
  await evaluate(`document.querySelector('[data-cat="dogs"]').click()`);
  await sleep(300);
  out.shopFilter = await evaluate(`({cards:document.querySelectorAll('.shop-grid .product-card').length, url:location.search})`);

  await nav(BASE + 'shop.html?launch=1');
  out.launch = await evaluate(`({cards:document.querySelectorAll('.shop-grid .product-card').length, adds:document.querySelectorAll('.shop-grid [data-add]').length, h1:document.querySelector('.page-hero h1').innerText})`);

  await nav(BASE + 'product.html?id=yonbo-y1');
  out.indexOnly = await evaluate(`({add:!!document.querySelector('[data-add-product]'), notify:!!document.querySelector('[data-notify]'), notice:!!document.querySelector('.index-notice')})`);

  await nav(BASE + 'product.html?id=loona');
  out.product = await evaluate(`({h1:document.querySelector('.product-title').innerText, acc:document.querySelector('.acc-body').innerText.slice(0,120), title:document.title})`);
  await evaluate(`document.querySelector('[data-add-product]').click()`);
  await sleep(300);
  out.productAdd = await evaluate(`document.querySelector('[data-cart-count]').textContent`);

  await nav(BASE + 'checkout.html');
  out.checkout = await evaluate(`({lines:document.querySelectorAll('.summary-line').length, total:document.querySelector('.summary-totals .total span:last-child').innerText})`);
  await evaluate(`document.querySelector('#discount-input').value='WELCOME10'; document.querySelector('[data-apply-discount]').click()`);
  await sleep(200);
  out.discount = await evaluate(`({msg:document.querySelector('#discount-msg').innerText, total:document.querySelector('.summary-totals .total span:last-child').innerText})`);
  await evaluate(`(()=>{const c=document.querySelector('#f-country'); c.value='DE'; c.dispatchEvent(new Event('change',{bubbles:true}));})()`);
  await sleep(200);
  out.country = await evaluate(`({eta:document.querySelector('#eta-standard').innerText, total:document.querySelector('.summary-totals .total span:last-child').innerText})`);
  await evaluate(`(()=>{const set=(k,v)=>{const el=document.querySelector('[data-form="'+k+'"]'); el.value=v; el.dispatchEvent(new Event('input',{bubbles:true}));}; set('email','qa@example.com'); set('first','Q'); set('last','A'); set('address','1 Test Street'); set('city','Testville'); set('postal','10001'); document.querySelector('#pay-btn').click();})()`);
  await sleep(1500);
  out.success = await evaluate(`({ok:!!document.querySelector('.success'), order:(document.querySelector('.success-card b')||{}).textContent||'', cart:document.querySelector('[data-cart-count]').textContent})`);

  await nav(BASE + 'ranking.html');
  out.ranking = await evaluate(`({rows:document.querySelectorAll('#rank-body tr').length, kpi:document.querySelector('#kpi-brands').innerText})`);
  await evaluate(`document.querySelector('.data-table th[data-sort="price"]').click()`);
  await sleep(200);
  out.rankingSort = await evaluate(`document.querySelector('#rank-body tr td:nth-child(4)').innerText`);

  await nav(BASE + 'policies.html?p=track');
  out.policies = await evaluate(`({title:document.querySelector('#doc-title').innerText, hasForm:!!document.querySelector('#track-form')})`);

  await nav(BASE + 'index.html');
  await evaluate(`document.querySelector('[data-wish]').click()`);
  await sleep(250);
  out.wish = await evaluate(`({count:document.querySelector('[data-wish-count]').textContent, saved:document.querySelector('[data-wish]').classList.contains('is-on')})`);
  await evaluate(`document.querySelector('[data-open-wishlist]').click()`);
  await sleep(250);
  out.wishDrawer = await evaluate(`({open:document.querySelector('#wish-drawer').classList.contains('is-open'), lines:document.querySelectorAll('.wish-line').length})`);
  await evaluate(`document.querySelector('[data-close-drawer]').click()`);

  await evaluate(`(()=>{const s=document.querySelector('[data-currency-select]'); s.value='EUR'; s.dispatchEvent(new Event('change',{bubbles:true}));})()`);
  await sleep(300);
  out.currency = await evaluate(`document.querySelector('.card-price .price').innerText`);

  await nav(BASE + 'index.html?gift=1');
  await evaluate(`document.querySelector('[data-gift="who"]').click()`);
  await sleep(200);
  await evaluate(`document.querySelector('[data-gift="budget"]').click()`);
  await sleep(200);
  await evaluate(`document.querySelector('[data-gift="vibe"]').click()`);
  await sleep(250);
  out.gift = await evaluate(`({open:document.querySelector('#gift-modal').classList.contains('is-open'), picks:document.querySelectorAll('.gift-results .product-card').length})`);
  await evaluate(`document.querySelector('[data-close-gift]').click()`);

  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await nav(BASE + 'index.html');
  out.mobile = await evaluate(`({scrollWidth:document.documentElement.scrollWidth, innerWidth:window.innerWidth, menu:getComputedStyle(document.querySelector('.menu-btn')).display})`);

  await evaluate(`document.querySelector('[data-toggle-lang]').click()`);
  await sleep(400);
  out.lang = await evaluate(`({lang:document.documentElement.lang, nav:document.querySelector('.main-nav a').innerText})`);

  out.errors = errors;
  console.log(JSON.stringify(out, null, 2));
  ws.close();
  try { require('child_process').execFileSync('taskkill', ['/PID', String(edge.pid), '/T', '/F'], { stdio: 'ignore' }); } catch (e) {}
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });

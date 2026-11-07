/* Export photo coverage for the 100-product catalogue. */
const fs = require('fs');
const path = require('path');
const D = require('../assets/js/data.js');

const rows = [['rank', 'id', 'product', 'brand', 'has_photo', 'layout', 'files', 'source', 'credit', 'rights']];
D.products.forEach(function (p) {
  const m = (D.images && D.images[p.id]) || null;
  rows.push([
    p.rank,
    p.id,
    p.name,
    p.brand,
    m ? 'yes' : 'no',
    m ? (m.layout || 'cutout') : '',
    m ? m.files.join('|') : '',
    m ? m.source : '',
    m ? m.credit : '',
    m ? m.rights : 'needs-asset'
  ]);
});

const csv = rows.map(function (r) {
  return r.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(',');
}).join('\r\n');
fs.mkdirSync(path.join(__dirname, '..', 'data'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '..', 'data', 'image-status.csv'), '\uFEFF' + csv, 'utf8');
const have = rows.slice(1).filter(function (r) { return r[4] === 'yes'; }).length;
console.log('Photo coverage: ' + have + '/' + D.products.length);

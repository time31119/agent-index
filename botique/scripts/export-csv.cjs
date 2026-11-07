/* Export the BOTIQUE 100 to a UTF-8 CSV (Excel-friendly). */
const fs = require('fs');
const path = require('path');
const D = require('../assets/js/data.js');

const rows = [['rank', 'product', 'brand', 'category', 'price_usd', 'rating', 'public_reviews', 'est_units_30d', 'platforms', 'product_url']];
D.products.forEach(function (p) {
  const cat = D.categories.find(function (c) { return c.id === p.cat; });
  rows.push([
    p.rank,
    p.name,
    p.brand,
    cat ? cat.name : p.cat,
    p.price.toFixed(2),
    p.rating,
    p.reviews,
    p.units,
    p.platforms.join('|'),
    'https://botique.shop/product.html?id=' + p.id
  ]);
});

const csv = rows.map(function (r) {
  return r.map(function (v) {
    return '"' + String(v).replace(/"/g, '""') + '"';
  }).join(',');
}).join('\r\n');

const dir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dir, { recursive: true });
const out = path.join(dir, 'top100.csv');
fs.writeFileSync(out, '\uFEFF' + csv, 'utf8');
console.log('Wrote ' + (rows.length - 1) + ' rows to ' + out);

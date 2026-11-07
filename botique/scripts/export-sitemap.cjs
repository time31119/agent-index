/* Generate sitemap.xml + robots.txt for the static store. */
const fs = require('fs');
const path = require('path');
const D = require('../assets/js/data.js');

const base = 'https://botique.shop';
const today = '2026-11-01';
const pages = [
  ['/', '1.0', 'weekly'],
  ['/shop.html', '0.9', 'daily'],
  ['/shop.html?launch=1', '0.9', 'daily'],
  ['/ranking.html', '0.8', 'monthly'],
  ['/guide.html', '0.7', 'monthly'],
  ['/policies.html?p=shipping', '0.3', 'yearly'],
  ['/policies.html?p=returns', '0.3', 'yearly'],
  ['/policies.html?p=warranty', '0.3', 'yearly'],
  ['/policies.html?p=privacy', '0.3', 'yearly'],
  ['/policies.html?p=terms', '0.3', 'yearly']
];

const urls = pages.map(function (p) {
  return '  <url><loc>' + base + p[0] + '</loc><lastmod>' + today + '</lastmod><changefreq>' + p[2] + '</changefreq><priority>' + p[1] + '</priority></url>';
}).concat(D.products.map(function (p) {
  return '  <url><loc>' + base + '/product.html?id=' + p.id + '</loc><lastmod>' + today + '</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>';
}));

const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.join('\n') + '\n</urlset>\n';
fs.writeFileSync(path.join(__dirname, '..', 'sitemap.xml'), xml, 'utf8');

const robots = '# BOTIQUE\nUser-agent: *\nAllow: /\n\nSitemap: ' + base + '/sitemap.xml\n';
fs.writeFileSync(path.join(__dirname, '..', 'robots.txt'), robots, 'utf8');
console.log('Wrote sitemap.xml (' + urls.length + ' urls) and robots.txt');

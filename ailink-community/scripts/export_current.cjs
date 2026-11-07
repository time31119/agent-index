const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
global.window = {};
['hangzhou-ai','hangzhou-batch','hangzhou-batch2','shenzhen-ai','shenzhen-batch','shenzhen-batch2','pilot-verified','batch100-verified','sz100-verified','hzrest68-verified','rest-hz-verified','rest-sz-verified','sz-key-verified','region-fixes','pending-enrichment','hz-public30-pending','data'].forEach(f => require(path.join(ROOT, 'assets', f + '.js')));
const D = window.AILINK_DATA;
const out = path.join(ROOT, 'data/exports');
fs.mkdirSync(out, { recursive: true });
function csv(rows, fields) {
  const esc = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  return '\ufeff' + [fields.map(esc).join(',')].concat(rows.map(r => fields.map(f => esc(r[f])).join(','))).join('\r\n');
}
const p = D.projects.map(x => ({
  ID: x.id, 名称: x.name, 城市: x.city, 区县: x.district || '', 省份: x.province || '', 区域: x.region || '',
  赛道: x.sector, 阶段: x.stage, 状态: x.status, 官网: x.website || '', 电话: x.phone || '', 邮箱: x.email || '',
  描述: x.desc || '', 是否已核验: x.verified ? '是' : '否', 是否待核验: x.pending ? '是' : '否', 来源: x.source || '', 更新时间: x.updated || ''
}));
fs.writeFileSync(path.join(out, 'projects-all.csv'), csv(p, Object.keys(p[0])), 'utf8');
fs.writeFileSync(path.join(out, 'projects-verified.csv'), csv(p.filter(x => x.是否已核验 === '是'), Object.keys(p[0])), 'utf8');
fs.writeFileSync(path.join(out, 'projects-pending.csv'), csv(p.filter(x => x.是否待核验 === '是'), Object.keys(p[0])), 'utf8');
const c = D.capital.map(x => ({ 名称: x.name, 城市: x.city, 类型: x.type, 规模: x.aum, 单笔: x.ticket, 阶段: (x.stages || []).join('/'), 关注: (x.focus || []).join('/') }));
fs.writeFileSync(path.join(out, 'capital-all.csv'), csv(c, Object.keys(c[0])), 'utf8');
const t = D.talents.map(x => ({ 姓名: x.name, 城市: x.city, 方向: x.role, 年限: x.years, 公司: x.current, 学历: x.education, 状态: x.availability }));
fs.writeFileSync(path.join(out, 'talents-all.csv'), csv(t, Object.keys(t[0])), 'utf8');
console.log('projects', p.length, 'verified', p.filter(x => x.是否已核验 === '是').length, 'pending', p.filter(x => x.是否待核验 === '是').length);

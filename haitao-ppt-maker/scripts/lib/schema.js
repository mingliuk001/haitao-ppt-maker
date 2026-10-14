// 内容文件的格式检查。报错要写成模型看得懂、能照着改的话。
'use strict';

const TYPES = {
  cover: [], toc: [], section: ['title'], points: ['title', 'items'], kpi: ['title', 'items'],
  chart: ['title', 'chart'], compare: ['title', 'left', 'right'], timeline: ['title', 'items'],
  process: ['title', 'items'], statement: ['text'], table: ['title', 'header', 'rows'], ending: [],
};
const RANGE = { points: [2, 6], kpi: [2, 4], timeline: [3, 6], process: [3, 5] };

function validate(deck) {
  const e = [];
  if (!deck || typeof deck !== 'object') return ['内容必须是一个 JSON 对象'];
  if (!deck.title) e.push('缺少全稿标题 title');
  if (!Array.isArray(deck.slides) || !deck.slides.length) return [...e, 'slides 必须是非空数组'];
  deck.slides.forEach((s, k) => {
    const p = `第${k + 1}页`;
    if (!TYPES[s.type]) { e.push(`${p}：type「${s.type}」不认识，只能用 ${Object.keys(TYPES).join(' / ')}`); return; }
    for (const f of TYPES[s.type]) if (s[f] == null || s[f] === '') e.push(`${p}(${s.type})：缺少 ${f}`);
    const r = RANGE[s.type];
    if (r && Array.isArray(s.items) && (s.items.length < r[0] || s.items.length > r[1])) e.push(`${p}(${s.type})：items 要 ${r[0]}～${r[1]} 条，现在 ${s.items.length} 条（多了就拆成两页）`);
    if (s.type === 'chart' && s.chart) {
      const ch = s.chart, cats = ch.categories || [];
      const ser = ch.series || (ch.values ? [{ values: ch.values }] : []);
      if (!cats.length || !ser.length) e.push(`${p}(chart)：chart 需要 categories 和 series`);
      ser.forEach((x, j) => {
        if (!Array.isArray(x.values) || x.values.length !== cats.length) e.push(`${p}(chart)：第${j + 1}组数据个数(${(x.values || []).length})和分类个数(${cats.length})不一致`);
        else if (x.values.some((v) => typeof v !== 'number')) e.push(`${p}(chart)：values 里只能是数字，不能带单位或引号`);
      });
      if (!['bar', 'line', 'pie', 'doughnut'].includes(ch.kind || 'bar')) e.push(`${p}(chart)：kind 只能是 bar / line / pie / doughnut`);
      if (ser.length > 3) e.push(`${p}(chart)：最多 3 组数据`);
      if (['pie', 'doughnut'].includes(ch.kind) && ser.length > 1) e.push(`${p}(chart)：饼图只能有 1 组数据`);
    }
    if (s.type === 'table' && Array.isArray(s.rows) && Array.isArray(s.header)) {
      if (s.rows.length > 7) e.push(`${p}(table)：表格最多 7 行，现在 ${s.rows.length} 行，请拆成两页`);
      if (s.header.length > 5) e.push(`${p}(table)：表格最多 5 列`);
      s.rows.forEach((r, j) => { if (r.length !== s.header.length) e.push(`${p}(table)：第${j + 1}行有 ${r.length} 格，表头有 ${s.header.length} 列`); });
    }
  });
  return e;
}

module.exports = { validate, TYPES, RANGE };

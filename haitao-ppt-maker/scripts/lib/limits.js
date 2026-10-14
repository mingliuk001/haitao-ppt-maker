// 每种页型的字数上限（汉字数，英文单词/数字按半个字估）。在六套风格上都实测放得下。
// 写进 references/content-guide.md 给模型看；改这里要重跑 dev/capacity.js。
'use strict';
module.exports = {
  title: 22,                                   // 正文页标题（一句结论）
  deck: { title: 24, subtitle: 26, org: 18, author: 12 },
  toc: { max: 6 },
  section: { title: 12, sub: 24 },
  points: { itemTitle: 10, text: (n) => (n <= 2 ? 70 : n <= 4 ? 44 : 30) },
  kpi: { value: 6, unit: 3, label: 8, note: 14 },
  chart: { categories: 8, category: 5, takeaways: 3, takeaway: 30 },
  compare: { title: 10, items: 5, item: 22 },
  timeline: { time: 7, itemTitle: 7, text: (n) => (n <= 4 ? 26 : 16) },
  process: { itemTitle: (n) => (n <= 4 ? 8 : 6), text: (n) => (n <= 4 ? 30 : 22) },
  table: { cols: 5, rows: 7, cell: 8 },
  statement: { text: 40, source: 16 },
  ending: { title: 8, sub: 20 },
};

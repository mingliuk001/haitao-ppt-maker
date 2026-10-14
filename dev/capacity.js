// 字数上限压力测试：按 LIMITS 生成顶格内容，六套风格都跑，任何一套报问题就打印出来
const { render, getStyle, loadStyles } = require('../haitao-ppt-maker/scripts/build.js');
const L = require('../haitao-ppt-maker/scripts/lib/limits.js');
const T = (n, seed = '数字化转型让基层工作更省力更规范更透明效率明显提升') => { let s = ''; while ([...s].length < n) s += seed; return [...s].slice(0, n).join(''); };
const deck = { title: T(L.deck.title), subtitle: T(L.deck.subtitle), org: T(L.deck.org), author: T(L.deck.author), date: '2026年10月', slides: [] };
const S = deck.slides;
S.push({ type: 'cover' }, { type: 'toc' });
for (let k = 0; k < L.toc.max; k++) S.push({ type: 'section', title: T(L.section.title), sub: T(L.section.sub) });
for (const n of [2, 3, 4, 5, 6]) S.push({ type: 'points', title: T(L.title), items: Array.from({ length: n }, () => ({ title: T(L.points.itemTitle), text: T(L.points.text(n)) })) });
for (const n of [2, 3, 4]) S.push({ type: 'kpi', title: T(L.title), items: Array.from({ length: n }, () => ({ value: '12,345.6'.slice(0, L.kpi.value), unit: T(L.kpi.unit), label: T(L.kpi.label), note: T(L.kpi.note) })) });
S.push({ type: 'chart', title: T(L.title), chart: { kind: 'bar', categories: Array.from({ length: L.chart.categories }, (_, k) => T(L.chart.category) ), series: [{ name: 'a', values: Array.from({ length: L.chart.categories }, (_, k) => 100 + k) }], unit: '万元' }, takeaways: Array.from({ length: L.chart.takeaways }, () => T(L.chart.takeaway)) });
S.push({ type: 'compare', title: T(L.title), left: { title: T(L.compare.title), items: Array.from({ length: L.compare.items }, () => T(L.compare.item)) }, right: { title: T(L.compare.title), items: Array.from({ length: L.compare.items }, () => T(L.compare.item)) } });
for (const n of [3, 6]) S.push({ type: 'timeline', title: T(L.title), items: Array.from({ length: n }, () => ({ time: T(L.timeline.time, '2026年Q1'), title: T(L.timeline.itemTitle), text: T(L.timeline.text(n)) })) });
for (const n of [3, 5]) S.push({ type: 'process', title: T(L.title), items: Array.from({ length: n }, () => ({ title: T(L.process.itemTitle(n)), text: T(L.process.text(n)) })) });
S.push({ type: 'table', title: T(L.title), header: Array(L.table.cols).fill(T(L.table.cell)), rows: Array.from({ length: L.table.rows }, () => Array(L.table.cols).fill(T(L.table.cell))) });
S.push({ type: 'statement', text: T(L.statement.text), source: T(L.statement.source) });
S.push({ type: 'ending', title: T(L.ending.title), sub: T(L.ending.sub) });
let bad = 0;
for (const st of loadStyles()) {
  const { issues } = render(JSON.parse(JSON.stringify(deck)), getStyle(st.id));
  if (issues.length) { bad += issues.length; console.log(`【${st.name}】\n  ` + issues.join('\n  ')); }
}
console.log(bad ? `共 ${bad} 处放不下` : '六套风格全部放得下');
process.exit(bad ? 2 : 0);

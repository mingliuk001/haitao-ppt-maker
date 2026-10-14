#!/usr/bin/env node
// 用法：
//   node build.js 内容.json                      按内容里写的 style 出 pptx + html
//   node build.js 内容.json --style keji         指定风格
//   node build.js 内容.json --format pptx        只出 pptx（可选 pptx / html / pptx,html）
//   node build.js 内容.json --out 输出目录
//   node build.js 内容.json --check              只检查，不出文件
//   node build.js --styles                       列出全部风格
// 退出码：0 成功；2 有文字放不下等问题（文件照样生成，但应按提示改内容后重跑）；1 内容格式错误。
'use strict';

const fs = require('fs');
const path = require('path');
const { Canvas } = require('./lib/canvas');
const { L, parts } = require('./lib/layouts');
const { writePptx } = require('./lib/pptx');
const { writeHtml } = require('./lib/html');
const { validate } = require('./lib/schema');

const STYLE_DIR = path.join(__dirname, 'styles');

function loadStyles() {
  return fs.readdirSync(STYLE_DIR).filter((f) => f.endsWith('.js')).map((f) => require(path.join(STYLE_DIR, f))).sort((a, b) => (a.order || 99) - (b.order || 99));
}

function getStyle(id) {
  const all = loadStyles();
  const st = all.find((s) => s.id === id) || all.find((s) => s.name === id);
  if (!st) throw new Error(`没有叫「${id}」的风格。可选：${all.map((s) => `${s.id}(${s.name})`).join('、')}`);
  return { ...st, parts: { ...parts, ...(st.parts || {}) }, L: { ...L, ...(st.L || {}) } };
}

// 补全：自动编章节号、自动生成目录
function prepare(deck) {
  const slides = deck.slides.map((s) => ({ ...s }));
  let no = 0;
  slides.forEach((s) => { if (s.type === 'section') s.no = s.no || ++no; });
  const sections = slides.filter((s) => s.type === 'section').map((s) => ({ title: s.title, sub: s.sub }));
  slides.forEach((s) => { if (s.type === 'toc' && !s.items) s.items = sections; });
  // 每页记住自己属于哪一章，页眉要用
  let cur = null;
  slides.forEach((s) => { if (s.type === 'section') cur = { no: s.no, title: s.title }; s._sec = cur; });
  deck._sections = sections;
  return slides;
}

function render(deck, st) {
  const slides = prepare(deck);
  const pages = [], issues = [];
  slides.forEach((s, k) => {
    const c = new Canvas(st.theme, { index: k + 1, type: s.type, total: slides.length, slide: s });
    const fn = st.L[s.type];
    if (!fn) { issues.push(`第${k + 1}页：不认识的页型「${s.type}」`); return; }
    st.parts.frame(c, st, s.type, deck);
    c.next();
    fn(c, s, st, deck);
    if (!(st.bare || []).includes(s.type)) st.parts.footer(c, st, deck);
    pages.push({ els: c.els, bg: c.bg, bgCss: c.bgCss, notes: s.notes });
    issues.push(...c.issues);
  });
  return { pages, issues };
}

async function main() {
  const args = process.argv.slice(2);
  const flag = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
  if (args.includes('--styles')) {
    for (const s of loadStyles()) console.log(`${s.id}\t${s.name}\t${s.desc}\t适合：${s.fits}`);
    return;
  }
  const file = args.find((a) => !a.startsWith('--') && a.endsWith('.json'));
  if (!file) { console.error('请给出内容文件，例如：node build.js 内容.json'); process.exit(1); }
  let deck;
  try { deck = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { console.error(`内容文件不是合法的 JSON：${e.message}`); process.exit(1); }
  const errs = validate(deck);
  if (errs.length) { console.error('内容格式有错，请改完再跑：\n- ' + errs.join('\n- ')); process.exit(1); }

  const st = getStyle(flag('--style') || deck.style || 'zhengwu');
  const { pages, issues } = render(deck, st);
  const meta = { ...deck, title: String(deck.title || '').replace(/\n/g, '') };
  if (args.includes('--check')) {
    console.log(issues.length ? '需要修改：\n- ' + issues.join('\n- ') : '检查通过');
    process.exit(issues.length ? 2 : 0);
  }
  const out = flag('--out') || path.dirname(path.resolve(file));
  fs.mkdirSync(out, { recursive: true });
  const base = (flag('--name') || deck.title || '演示文稿').replace(/\n/g, '').replace(/[\\/:*?"<>|\s]+/g, '_').slice(0, 40) + (flag('--suffix') || '');
  const formats = (flag('--format') || 'pptx,html').split(',');
  const made = [];
  const only = flag('--page'); // 调试用：只导出某一页
  const pp = only ? [pages[+only - 1]] : pages;
  if (formats.includes('pptx')) made.push(await writePptx(pp, meta, path.join(out, `${base}.pptx`)));
  if (formats.includes('html')) { const f = path.join(out, `${base}.html`); fs.writeFileSync(f, writeHtml(pages, meta, st.theme)); made.push(f); }
  console.log(`风格：${st.name}（${st.id}），共 ${pages.length} 页`);
  made.forEach((f) => console.log('已生成：' + f));
  if (issues.length) { console.log('\n以下地方需要改内容后重跑（文件已生成，但这些位置排版不理想）：\n- ' + issues.join('\n- ')); process.exit(2); }
}

if (require.main === module) main().catch((e) => { console.error(e.message); process.exit(1); });

module.exports = { render, getStyle, loadStyles };

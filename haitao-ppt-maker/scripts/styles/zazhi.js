// 杂志墨水：米色纸张、黑色粗细线、宋体大标题、Georgia 大号数字、一个朱红强调色，几乎不用装饰，
// 靠字号对比和留白撑画面。适合观点分享、读书会、品牌故事、内刊。
'use strict';

const { W, H } = require('../lib/canvas');
const { grid, chartEl } = require('../lib/layouts');

const c0 = {
  bg: '#F3EFE6', text: '#141414', sub: '#5E584D', primary: '#D7261E', ink: '#141414',
  line: '#141414', hair: '#CBC3B3', card: '#EAE4D7', onPrimary: '#FFFFFF', mute: '#BDB6A8',
  chart: ['#141414', '#D7261E', '#8C867A', '#BDB6A8'],
};

const theme = {
  bg: c0.bg, stage: '#1A1814', c: { ...c0, line: c0.hair }, barRadius: 0,
  font: { title: '宋体', body: '微软雅黑', num: 'Georgia' },
  motion: { default: 'up', base: 0.08, stagger: 0.14, dur: 0.9 },
};
const X = 80;

const parts = {
  header(c, st, title) {
    c.rect(X, 40, W - X * 2, 3, { fill: c0.ink, anim: 'draw' });
    const sec = c.info.slide._sec;
    c.text(sec ? `${String(sec.no).padStart(2, '0')} — ${sec.title}` : '', X, 50, 600, 20, { size: 11, color: c0.sub, ls: 2, anim: 'fade' });
    c.text(`P.${String(c.info.index).padStart(2, '0')}`, W - X - 100, 50, 100, 20, { size: 11, color: c0.sub, align: 'right', font: theme.font.num, italic: true, anim: 'fade' });
    c.fitText(title, X, 78, W - X * 2, 60, { max: 32, min: 24, bold: true, font: theme.font.title, color: c0.ink, field: '标题', maxLines: 1, anim: 'up' });
    c.line(X, 148, W - X, 148, { color: c0.hair, w: 0.75 });
    c.next();
    return { x: X, y: 176, w: W - X * 2, h: H - 176 - 60 };
  },
  footer(c, st, deck) {
    c.line(X, H - 44, W - X, H - 44, { color: c0.hair, w: 0.75, anim: 'fade' });
    c.text(deck.title || '', X, H - 36, 700, 18, { size: 10, color: c0.sub, anim: 'fade' });
  },
  // 无底色，左侧一根细竖线分栏
  card(c, st, b, k) {
    if (k % 3) c.line(b.x - 12, b.y, b.x - 12, b.y + b.h, { color: c0.hair, w: 0.75 });
    return { x: b.x + 6, y: b.y, w: b.w - 18, h: b.h };
  },
  badge(c, st, x, y, k) {
    c.text(String(k + 1), x, y - 6, 80, 76, { size: 54, color: c0.primary, font: theme.font.num, italic: true });
    return { w: 80, h: 70 };
  },
};

const L = {
  cover(c, s, st, deck) {
    c.rect(X, 60, W - X * 2, 6, { fill: c0.ink, anim: 'draw' });
    c.text('VOL.', X, 80, 60, 24, { size: 13, color: c0.sub, font: theme.font.num, italic: true });
    c.text(deck.date || '', X + 50, 80, 400, 24, { size: 13, bold: true, color: c0.ink });
    if (deck.org) c.text(deck.org, W - X - 500, 80, 500, 24, { size: 13, color: c0.sub, align: 'right' });
    c.line(X, 112, W - X, 112, { color: c0.ink, w: 0.75 });
    c.next();
    c.fitText(s.title || deck.title, X, 150, 760, 300, { max: 66, min: 40, bold: true, font: theme.font.title, color: c0.ink, lh: 1.08, field: '封面标题', maxLines: 3, anim: 'up' });
    c.rect(X, 470, 56, 8, { fill: c0.primary, anim: 'draw' });
    c.next();
    if (s.subtitle || deck.subtitle) c.fitText(s.subtitle || deck.subtitle, X, 500, 720, 70, { max: 22, min: 16, color: c0.sub, field: '副标题', maxLines: 2 });
    // 右栏：本期目录
    const secs = (deck._sections || []).slice(0, 5);
    if (secs.length) {
      const x = 920, w = W - X - x;
      c.line(x - 30, 150, x - 30, 600, { color: c0.hair, w: 0.75 });
      c.text('本期要点', x, 150, w, 24, { size: 13, bold: true, color: c0.primary, ls: 2 });
      secs.forEach((sc, k) => {
        const y = 196 + k * 78;
        c.text(String(k + 1).padStart(2, '0'), x, y, 50, 30, { size: 22, color: c0.ink, font: theme.font.num, italic: true });
        c.fitText(sc.title, x + 48, y + 2, w - 48, 54, { max: 17, min: 14, bold: true, color: c0.ink, field: '要点', maxLines: 2 });
        c.next();
      });
    }
    c.rect(X, H - 66, W - X * 2, 2, { fill: c0.ink });
    c.text(deck.author || '', X, H - 56, 600, 22, { size: 13, color: c0.ink });
  },

  section(c, s, st, deck) {
    c.text(String(s.no), X - 10, 70, 520, 560, { size: 380, color: c0.primary, font: theme.font.num, italic: true, anim: 'up', lh: 0.9 });
    c.next();
    c.rect(600, 300, W - 600 - X, 3, { fill: c0.ink, anim: 'draw' });
    c.text(`CHAPTER ${String(s.no).padStart(2, '0')}`, 600, 270, 400, 22, { size: 12, color: c0.sub, ls: 4, font: theme.font.num });
    c.fitText(s.title, 600, 318, W - 600 - X, 140, { max: 48, min: 30, bold: true, color: c0.ink, font: theme.font.title, lh: 1.1, field: '章节标题', maxLines: 2, anim: 'up' });
    c.next();
    if (s.sub) c.fitText(s.sub, 600, 470, W - 600 - X, 60, { max: 20, min: 16, color: c0.sub, field: '章节说明', maxLines: 2 });
  },

  // 编号竖排在左，内容按栏排；5～6 条时两行三栏
  points(c, s, st, deck) {
    const area = st.parts.header(c, st, s.title);
    const items = (s.items || []).slice(0, 6);
    const cols = items.length <= 3 ? items.length : items.length === 4 ? 4 : 3;
    grid(area, items.length, cols, 36, 30).forEach((b, k) => {
      const it = items[k];
      if (k % cols) c.line(b.x - 18, b.y, b.x - 18, b.y + b.h, { color: c0.hair, w: 0.75 });
      c.text(String(k + 1), b.x, b.y - 8, 80, 80, { size: cols === 4 ? 48 : 56, color: c0.primary, font: theme.font.num, italic: true });
      c.line(b.x, b.y + 80, b.x + 40, b.y + 80, { color: c0.ink, w: 2 });
      const t = c.fitText(it.title || '', b.x, b.y + 96, b.w - 6, 60, { max: 22, min: 17, bold: true, font: theme.font.title, color: c0.ink, field: `第${k + 1}条小标题`, maxLines: 2 });
      if (it.text) c.fitText(it.text, b.x, b.y + 106 + (t.usedH || 30), b.w - 6, b.h - 116 - (t.usedH || 30), { max: 17, min: 14, color: c0.sub, lh: 1.25, field: `第${k + 1}条正文` });
      c.next();
    });
  },

  kpi(c, s, st, deck) {
    const area = st.parts.header(c, st, s.title);
    const items = (s.items || []).slice(0, 4);
    const M = require('../lib/measure');
    const boxes = grid({ ...area, y: area.y + 50, h: area.h - 70 }, items.length, items.length, 36);
    // 所有数字用同一个字号，基线才齐
    let size = 72;
    while (size > 36 && items.some((it) => M.textW(String(it.value), size, { font: 'Georgia' }) + (it.unit ? 40 : 0) > boxes[0].w - 10)) size -= 4;
    boxes.forEach((b, k) => {
      const it = items[k];
      if (k) c.line(b.x - 18, b.y, b.x - 18, b.y + b.h, { color: c0.hair, w: 0.75 });
      const num = String(it.value);
      c.text(num, b.x, b.y + 30, b.w, size * 1.5, { size, color: k === 0 ? c0.primary : c0.ink, font: theme.font.num, anim: /^[\d.,]+$/.test(num) ? 'count' : 'up' });
      const nw = M.textW(num, size, { font: 'Georgia' });
      if (it.unit) c.text(it.unit, b.x + Math.min(nw + 6, b.w - 50), b.y + 30 + size * 0.75, 60, 30, { size: 16, bold: true, color: c0.sub });
      c.line(b.x, b.y + 70 + size * 1.5, b.x + 40, b.y + 70 + size * 1.5, { color: c0.ink, w: 2 });
      c.fitText(it.label || '', b.x, b.y + 84 + size * 1.5, b.w - 6, 56, { max: 19, min: 15, bold: true, font: theme.font.title, color: c0.ink, field: `第${k + 1}个指标名`, maxLines: 2 });
      if (it.note) c.fitText(it.note, b.x, b.y + 144 + size * 1.5, b.w - 6, 50, { max: 15, min: 13, color: c0.sub, field: `第${k + 1}个指标说明` });
      c.next();
    });
  },

  statement(c, s, st, deck) {
    c.text('“', X, 60, 300, 300, { size: 300, color: c0.primary, font: theme.font.num, anim: 'up' });
    c.next();
    c.fitText(s.text, 200, 200, W - 360, 300, { max: 46, min: 28, bold: true, color: c0.ink, font: theme.font.title, valign: 'middle', lh: 1.25, field: '金句', anim: 'up' });
    c.next();
    c.rect(200, 530, 40, 3, { fill: c0.ink });
    if (s.source) c.text(s.source, 260, 518, 800, 30, { size: 15, color: c0.sub, italic: true });
  },

  ending(c, s, st, deck) {
    c.rect(X, 60, W - X * 2, 6, { fill: c0.ink, anim: 'draw' });
    c.next();
    c.fitText(s.title || '谢谢', X, 230, W - X * 2, 160, { max: 110, min: 60, bold: true, color: c0.ink, font: theme.font.title, field: '结束语', maxLines: 1, anim: 'up' });
    c.rect(X, 410, 56, 8, { fill: c0.primary, anim: 'draw' });
    c.next();
    if (s.sub) c.fitText(s.sub, X, 440, W - X * 2, 40, { max: 22, min: 16, color: c0.sub, field: '结束页副标题', maxLines: 1 });
    c.rect(X, H - 66, W - X * 2, 2, { fill: c0.ink });
    c.text(deck.org || '', X, H - 56, 800, 22, { size: 13, color: c0.ink });
  },
};

module.exports = {
  id: 'zazhi', name: '杂志墨水', order: 4,
  desc: '米色纸张、黑色粗细线、宋体大标题、斜体大号数字，一个朱红强调色，靠留白取胜',
  fits: '观点分享、读书会、品牌故事、内刊、个人演讲',
  theme, parts, L, bare: ['cover', 'section', 'statement', 'ending'],
};

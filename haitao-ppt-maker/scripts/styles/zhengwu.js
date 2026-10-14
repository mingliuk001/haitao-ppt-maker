// 政务红：庄重、对称、方角。红为主、金线点缀。适合机关单位、国企、党建工作汇报。
'use strict';

const { W, H } = require('../lib/canvas');
const { grid, itemBlock } = require('../lib/layouts');

const c0 = {
  bg: '#FFFFFF', text: '#1F1F1F', sub: '#5A5A5A', primary: '#B4181D', deep: '#8E1015', gold: '#C9A063',
  line: '#E7DFD3', card: '#F8F4EE', onPrimary: '#FFFFFF', mute: '#D9CFC4',
  chart: ['#B4181D', '#C9A063', '#7D7D7D', '#E0B9A6'],
};

const theme = {
  bg: c0.bg, stage: '#2A0E0E', c: c0, barRadius: 0,
  font: { title: '微软雅黑', body: '微软雅黑', num: 'Arial' },
  motion: { default: 'up', base: 0.1, stagger: 0.12, dur: 0.7 },
};

function rays(c, cx, cy, r, alpha) {
  // 金色同心弧，取「光芒」意象，只用线不填色
  [1, 1.32, 1.7].forEach((k, j) => c.ellipse(cx - r * k, cy - r * k, r * k * 2, r * k * 2, { fill: 'none', stroke: c0.gold, sw: 1.2, salpha: alpha - j * 0.05, anim: 'fade' }));
}

const parts = {
  header(c, st, title) {
    c.rect(64, 50, 8, 38, { fill: c0.primary, anim: 'wipe' });
    c.fitText(title, 88, 46, W - 88 - 64, 46, { max: 28, min: 22, bold: true, font: theme.font.title, color: c0.text, valign: 'middle', field: '标题', maxLines: 1, anim: 'left' });
    c.line(64, 112, W - 64, 112, { color: c0.line, w: 1 });
    c.rect(64, 110, 140, 4, { fill: c0.primary, anim: 'draw' });
    c.rect(204, 110, 40, 4, { fill: c0.gold, anim: 'draw' });
    c.next();
    return { x: 64, y: 140, w: W - 128, h: H - 140 - 64 };
  },
  footer(c, st, deck) {
    c.line(64, H - 44, W - 64, H - 44, { color: c0.line, w: 0.75, anim: 'fade' });
    if (deck.org) c.text(deck.org, 64, H - 36, 600, 20, { size: 11, color: c0.sub, anim: 'fade' });
    c.rect(W - 64 - 34, H - 38, 34, 22, { fill: c0.primary, anim: 'fade' });
    c.text(String(c.info.index).padStart(2, '0'), W - 64 - 34, H - 38, 34, 22, { size: 11, bold: true, color: '#FFFFFF', align: 'center', valign: 'middle', font: theme.font.num, anim: 'fade' });
  },
  card(c, st, b) {
    c.rect(b.x, b.y, b.w, b.h, { fill: c0.card });
    c.rect(b.x, b.y, b.w, 4, { fill: c0.primary, anim: 'draw' });
    return { x: b.x + 26, y: b.y + 26, w: b.w - 52, h: b.h - 48 };
  },
  badge(c, st, x, y, k) {
    c.rect(x, y, 40, 40, { fill: c0.primary, anim: 'zoom' });
    c.text(String(k + 1).padStart(2, '0'), x, y, 40, 40, { size: 17, bold: true, color: '#FFFFFF', align: 'center', valign: 'middle', font: theme.font.num, anim: 'zoom' });
    return { w: 40, h: 40 };
  },
};

const L = {
  cover(c, s, st, deck) {
    c.rect(0, 0, W, 452, { fill: c0.primary, anim: 'fade' });
    c.rect(0, 452, W, 6, { fill: c0.gold, anim: 'draw' });
    rays(c, W - 120, 120, 150, 0.35);
    rays(c, 110, 420, 90, 0.25);
    c.next();
    if (deck.org) c.text(deck.org, 120, 92, W - 240, 30, { size: 16, color: c0.gold, align: 'center', ls: 4, bold: true });
    c.line(W / 2 - 60, 140, W / 2 + 60, 140, { color: c0.gold, w: 1.5 });
    c.next();
    c.fitText(s.title || deck.title, 120, 176, W - 240, 160, { max: 48, min: 34, bold: true, font: theme.font.title, color: '#FFFFFF', align: 'center', valign: 'middle', lh: 1.1, field: '封面标题', maxLines: 2, anim: 'up' });
    c.next();
    if (s.subtitle || deck.subtitle) c.fitText(s.subtitle || deck.subtitle, 120, 350, W - 240, 40, { max: 22, min: 16, color: '#FFFFFF', align: 'center', field: '副标题', maxLines: 1 });
    c.next();
    const meta = [deck.author, deck.date].filter(Boolean).join('    ');
    if (meta) c.text(meta, 120, 540, W - 240, 30, { size: 18, color: c0.text, align: 'center', ls: 2 });
    c.rect(W / 2 - 4, 600, 8, 8, { fill: c0.primary, rot: 45 });
  },

  section(c, s, st, deck) {
    c.rect(0, 0, 500, H, { fill: c0.primary, anim: 'fade' });
    rays(c, 250, H / 2, 120, 0.3);
    c.next();
    c.text('PART', 0, 220, 500, 30, { size: 18, color: c0.gold, align: 'center', ls: 8, bold: true, font: theme.font.num });
    c.text(String(s.no).padStart(2, '0'), 0, 250, 500, 180, { size: 120, bold: true, color: '#FFFFFF', align: 'center', valign: 'middle', font: theme.font.num, anim: 'zoom' });
    c.next();
    c.fitText(s.title, 580, 290, W - 580 - 80, 70, { max: 40, min: 28, bold: true, color: c0.text, font: theme.font.title, field: '章节标题', maxLines: 1, anim: 'left' });
    c.rect(580, 376, 90, 4, { fill: c0.gold, anim: 'draw' });
    c.next();
    if (s.sub) c.fitText(s.sub, 580, 400, W - 580 - 80, 60, { max: 20, min: 16, color: c0.sub, field: '章节说明', maxLines: 2 });
  },

  // 政务汇报常见的「一条一行」：方块编号 + 粗体小标题 + 说明，横线分隔；5～6 条分两栏
  points(c, s, st, deck) {
    const area = st.parts.header(c, st, s.title);
    const items = (s.items || []).slice(0, 6);
    const cols = items.length > 4 ? 2 : 1;
    const boxes = grid(area, items.length, cols, 48, 0);
    boxes.forEach((b, k) => {
      const it = items[k];
      st.parts.badge(c, st, b.x, b.y + 16, k);
      const tw = cols === 1 ? 300 : b.w - 64;
      c.fitText(it.title || '', b.x + 64, b.y + 14, tw, 44, { max: 22, min: 18, bold: true, color: c0.text, valign: 'middle', field: `第${k + 1}条小标题`, maxLines: cols === 1 ? 2 : 1 });
      if (it.text) {
        if (cols === 1) c.fitText(it.text, b.x + 64 + tw + 24, b.y + 14, b.w - tw - 88, b.h - 26, { max: 18, min: 14, color: c0.sub, lh: 1.15, field: `第${k + 1}条正文` });
        else c.fitText(it.text, b.x + 64, b.y + 62, b.w - 64, b.h - 74, { max: 17, min: 14, color: c0.sub, lh: 1.15, field: `第${k + 1}条正文` });
      }
      if (k + cols < items.length) c.line(b.x, b.y + b.h, b.x + b.w, b.y + b.h, { color: c0.line, w: 1 });
      c.next();
    });
  },

  statement(c, s, st, deck) {
    c.rect(0, 0, W, H, { fill: c0.card });
    c.text('“', 140, 110, 160, 160, { size: 160, bold: true, color: c0.gold, font: 'Georgia', anim: 'zoom' });
    c.next();
    c.fitText(s.text, 200, 230, W - 400, 220, { max: 38, min: 26, bold: true, color: c0.primary, font: theme.font.title, align: 'center', valign: 'middle', lh: 1.25, field: '金句', anim: 'blur' });
    c.next();
    c.line(W / 2 - 40, 480, W / 2 + 40, 480, { color: c0.gold, w: 2 });
    if (s.source) c.text(s.source, 200, 496, W - 400, 30, { size: 16, color: c0.sub, align: 'center' });
  },

  ending(c, s, st, deck) {
    c.rect(0, 0, W, H, { fill: c0.primary });
    rays(c, W / 2, H / 2, 210, 0.3);
    c.next();
    c.fitText(s.title || '谢谢', 120, 260, W - 240, 110, { max: 60, min: 40, bold: true, color: '#FFFFFF', font: theme.font.title, align: 'center', valign: 'middle', field: '结束语', maxLines: 1, anim: 'zoom', ls: 6 });
    c.next();
    c.line(W / 2 - 80, 392, W / 2 + 80, 392, { color: c0.gold, w: 2 });
    if (s.sub || deck.org) c.fitText(s.sub || deck.org, 120, 412, W - 240, 40, { max: 20, min: 16, color: '#FFFFFF', align: 'center', field: '结束页副标题', maxLines: 1 });
  },
};

module.exports = {
  id: 'zhengwu', name: '政务红', order: 1,
  desc: '庄重对称，红色主色、金线点缀、方角卡片，一条一行的汇报版式',
  fits: '机关单位、国企、党建、年度工作汇报、述职',
  theme, parts, L, bare: ['cover', 'section', 'statement', 'ending'],
};

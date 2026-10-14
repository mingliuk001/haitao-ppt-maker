// 清新活力：白底、四色马卡龙、大圆角卡片、彩色圆形编号、角落柔光色块。
// 适合培训课件、团建与活动策划、HR 与校园主题、面向年轻人的分享。
'use strict';

const { W, H } = require('../lib/canvas');
const { grid, itemBlock, kpiNumber, kpiSize } = require('../lib/layouts');

const P = ['#14B8A6', '#FF9F2E', '#FF6B8A', '#5B7CFF'];     // 主色四种
const T = ['#E3F7F4', '#FFF1DE', '#FFE8EE', '#E8EDFF'];     // 对应浅底
const c0 = {
  bg: '#FFFFFF', text: '#1F2A44', sub: '#5D6B82', primary: P[0], accent: P[1],
  line: '#E4E9F0', card: '#F4F7FA', onPrimary: '#FFFFFF', mute: '#D5DEE8',
  chart: P,
};

const theme = {
  bg: c0.bg, stage: '#E9F3F1', c: c0, barRadius: 8,
  font: { title: '微软雅黑', body: '微软雅黑', num: 'Arial' },
  motion: { default: 'zoom', base: 0.08, stagger: 0.1, dur: 0.6 },
};
const X = 72;

function blobs(c, big = false) {
  c.glow(W - 40, 30, big ? 260 : 170, P[0], 0.28, { fx: 'float' });
  c.glow(30, H - 20, big ? 240 : 150, P[1], 0.26, { fx: 'float' });
  if (big) c.glow(W - 160, H - 60, 160, P[2], 0.2, { fx: 'float' });
}

const parts = {
  frame(c, st, type) { if (!['cover', 'section', 'ending'].includes(type)) blobs(c); },
  header(c, st, title) {
    c.fitText(title, X, 52, W - X * 2, 52, { max: 30, min: 22, bold: true, font: theme.font.title, color: c0.text, field: '标题', maxLines: 1, anim: 'up' });
    c.rect(X, 112, 44, 8, { fill: P[0], r: 4, anim: 'draw' });
    c.rect(X + 52, 112, 12, 8, { fill: P[1], r: 4, anim: 'draw' });
    c.rect(X + 72, 112, 8, 8, { fill: P[2], r: 4, anim: 'draw' });
    c.next();
    return { x: X, y: 148, w: W - X * 2, h: H - 148 - 60 };
  },
  footer(c, st, deck) {
    c.rect(W - X - 44, H - 46, 44, 24, { fill: c0.card, r: 12, anim: 'fade' });
    c.text(String(c.info.index), W - X - 44, H - 46, 44, 24, { size: 11, bold: true, color: c0.sub, align: 'center', valign: 'middle', anim: 'fade' });
    if (deck.org) c.text(deck.org, X, H - 42, 600, 18, { size: 11, color: c0.sub, anim: 'fade' });
  },
  card(c, st, b, k) {
    c.rect(b.x, b.y, b.w, b.h, { fill: T[k % 4], r: 20 });
    return { x: b.x + 28, y: b.y + 26, w: b.w - 56, h: b.h - 50 };
  },
  badge(c, st, x, y, k) {
    c.ellipse(x, y, 46, 46, { fill: P[k % 4], anim: 'zoom' });
    c.text(String(k + 1), x, y, 46, 46, { size: 20, bold: true, color: '#FFFFFF', align: 'center', valign: 'middle', font: theme.font.num, anim: 'zoom' });
    return { w: 46, h: 46 };
  },
};

const L = {
  cover(c, s, st, deck) {
    blobs(c, true);
    // 散落的小几何
    c.ellipse(170, 150, 26, 26, { fill: P[1], anim: 'zoom', fx: 'float' });
    c.rect(1060, 470, 34, 34, { fill: P[3], r: 9, rot: 18, anim: 'zoom', fx: 'float' });
    c.poly([[1010, 170], [1046, 232], [974, 232]], { fill: P[2], anim: 'zoom' });
    c.ellipse(240, 520, 14, 14, { fill: P[0], anim: 'zoom' });
    c.ellipse(1150, 140, 60, 60, { fill: 'none', stroke: P[0], sw: 4, anim: 'zoom' });
    c.next();
    const tag = deck.tag || deck.date || '';
    if (tag) {
      const tw = require('../lib/measure').textW(tag, 14, { bold: true }) + 44;
      c.rect(W / 2 - tw / 2, 190, tw, 36, { fill: T[0], r: 18 });
      c.text(tag, W / 2 - tw / 2, 190, tw, 36, { size: 14, bold: true, color: P[0], align: 'center', valign: 'middle' });
    }
    c.next();
    c.fitText(s.title || deck.title, 160, 250, W - 320, 160, { max: 50, min: 34, bold: true, font: theme.font.title, color: c0.text, align: 'center', valign: 'middle', lh: 1.15, field: '封面标题', maxLines: 2, anim: 'up' });
    c.next();
    if (s.subtitle || deck.subtitle) c.fitText(s.subtitle || deck.subtitle, 200, 420, W - 400, 40, { max: 22, min: 16, color: c0.sub, align: 'center', field: '副标题', maxLines: 1 });
    c.next();
    c.text([deck.org, deck.author].filter(Boolean).join('  ·  '), 200, 560, W - 400, 26, { size: 15, color: c0.sub, align: 'center' });
  },

  section(c, s, st, deck) {
    const col = P[(s.no - 1) % 4], tint = T[(s.no - 1) % 4];
    c.rect(0, 0, W, H, { fill: tint });
    c.glow(320, 360, 300, col, 0.25, { fx: 'float' });
    c.ellipse(170, 210, 300, 300, { fill: col, anim: 'zoom' });
    c.text(String(s.no).padStart(2, '0'), 170, 210, 300, 300, { size: 110, bold: true, color: '#FFFFFF', align: 'center', valign: 'middle', font: theme.font.num, anim: 'zoom' });
    c.ellipse(430, 190, 40, 40, { fill: '#FFFFFF', alpha: 0.8, anim: 'zoom', fx: 'float' });
    c.next();
    c.text(`PART ${s.no}`, 580, 280, 400, 26, { size: 15, bold: true, color: col, ls: 3, font: theme.font.num });
    c.fitText(s.title, 580, 312, W - 580 - X, 110, { max: 46, min: 30, bold: true, color: c0.text, font: theme.font.title, field: '章节标题', maxLines: 2, anim: 'right' });
    c.next();
    if (s.sub) c.fitText(s.sub, 580, 430, W - 580 - X, 60, { max: 20, min: 16, color: c0.sub, field: '章节说明', maxLines: 2 });
  },

  toc(c, s, st, deck) {
    const area = st.parts.header(c, st, s.title || '目录');
    const items = (s.items || []).slice(0, 6);
    const cols = items.length <= 3 ? items.length : items.length === 4 ? 2 : 3;
    const h = items.length <= 3 ? 260 : area.h;
    grid({ ...area, y: area.y + (area.h - h) / 2, h }, items.length, cols, 24).forEach((b, k) => {
      c.rect(b.x, b.y, b.w, b.h, { fill: T[k % 4], r: 20 });
      c.text(String(k + 1).padStart(2, '0'), b.x + 28, b.y + 24, 120, 60, { size: 40, bold: true, color: P[k % 4], font: theme.font.num });
      const showSub = items[k].sub && cols <= 2;
      c.fitText(items[k].title, b.x + 28, b.y + b.h - (showSub ? 118 : 88), b.w - 56, 64, { max: 24, min: 16, bold: true, color: c0.text, valign: 'bottom', field: `目录第${k + 1}项`, maxLines: 2 });
      if (showSub) c.fitText(items[k].sub, b.x + 28, b.y + b.h - 50, b.w - 56, 28, { max: 15, min: 12, color: c0.sub, field: `目录第${k + 1}项说明`, maxLines: 1 });
      c.next();
    });
  },

  kpi(c, s, st, deck) {
    const area = st.parts.header(c, st, s.title);
    const items = (s.items || []).slice(0, 4);
    const boxes = grid({ ...area, y: area.y + (area.h - 300) / 2, h: 300 }, items.length, items.length, 20);
    const size = kpiSize(st, items, boxes[0].w - 52);
    boxes.forEach((b, k) => {
      c.rect(b.x, b.y, b.w, b.h, { fill: T[k % 4], r: 24 });
      c.ellipse(b.x + b.w - 70, b.y - 14, 56, 56, { fill: P[k % 4], alpha: 0.9, anim: 'zoom' });
      kpiNumber(c, st, { x: b.x + 26, y: b.y + 70, w: b.w - 52, h: b.h - 90 }, items[k], k, { color: P[k % 4], size });
      c.next();
    });
  },

  statement(c, s, st, deck) {
    blobs(c, true);
    c.rect(160, 170, W - 320, 380, { fill: '#FFFFFF', r: 32, stroke: c0.line, sw: 1, anim: 'zoom' });
    c.ellipse(W / 2 - 34, 136, 68, 68, { fill: P[0], anim: 'zoom' });
    c.text('“', W / 2 - 34, 136, 68, 68, { size: 54, bold: true, color: '#FFFFFF', align: 'center', valign: 'middle', font: 'Georgia', anim: 'zoom' });
    c.next();
    c.fitText(s.text, 230, 230, W - 460, 220, { max: 36, min: 24, bold: true, color: c0.text, font: theme.font.title, align: 'center', valign: 'middle', lh: 1.3, field: '金句', anim: 'up' });
    c.next();
    if (s.source) c.text(s.source, 230, 470, W - 460, 30, { size: 15, color: P[0], align: 'center', bold: true });
  },

  ending(c, s, st, deck) {
    blobs(c, true);
    c.ellipse(260, 200, 22, 22, { fill: P[1], anim: 'zoom', fx: 'float' });
    c.rect(990, 480, 30, 30, { fill: P[3], r: 8, rot: 20, anim: 'zoom', fx: 'float' });
    c.next();
    c.fitText(s.title || '谢谢', 120, 270, W - 240, 110, { max: 64, min: 40, bold: true, color: c0.text, font: theme.font.title, align: 'center', valign: 'middle', field: '结束语', maxLines: 1, anim: 'zoom' });
    c.rect(W / 2 - 40, 392, 80, 8, { fill: P[0], r: 4, anim: 'draw' });
    c.next();
    if (s.sub) c.fitText(s.sub, 120, 420, W - 240, 40, { max: 20, min: 16, color: c0.sub, align: 'center', field: '结束页副标题', maxLines: 1 });
  },
};

module.exports = {
  id: 'qingxin', name: '清新活力', order: 5,
  desc: '白底马卡龙四色、大圆角卡片、彩色圆形编号、角落柔光色块',
  fits: '培训课件、活动策划、HR 与校园主题、面向年轻人的分享',
  theme, parts, L, bare: ['cover', 'section', 'statement', 'ending'],
};

// 商务咨询蓝：咨询公司报告的语言。白底、左对齐、标题写成结论句、细线分区、一个强调色，
// 图表只高亮要说的那一根。适合方案汇报、经营分析、项目提案。
'use strict';

const { W, H } = require('../lib/canvas');
const { grid, itemBlock, chartEl, takeaways } = require('../lib/layouts');

const c0 = {
  bg: '#FFFFFF', text: '#0F1F3A', sub: '#56627A', primary: '#0B3C7D', accent: '#00A0DF',
  line: '#D3D9E2', card: '#F2F5F9', onPrimary: '#FFFFFF', mute: '#C5CEDB',
  chart: ['#0B3C7D', '#00A0DF', '#8E9BB0', '#C5CEDB'],
};

const theme = {
  bg: c0.bg, stage: '#0A1628', c: c0, barRadius: 0,
  font: { title: '微软雅黑', body: '微软雅黑', num: 'Arial' },
  motion: { default: 'fade', base: 0.05, stagger: 0.1, dur: 0.6 },
};
const X = 72;

const parts = {
  header(c, st, title) {
    const sec = c.info.slide._sec;
    if (sec) c.text(`${String(sec.no).padStart(2, '0')}  |  ${sec.title}`, X, 34, 600, 20, { size: 11, bold: true, color: c0.accent, ls: 1, anim: 'fade' });
    const t = c.fitText(title, X, 58, W - X * 2, 76, { max: 26, min: 20, bold: true, font: theme.font.title, color: c0.text, valign: 'bottom', field: '标题', maxLines: 2, lh: 1.05, anim: 'up' });
    c.line(X, 146, W - X, 146, { color: c0.primary, w: 1.25 });
    c.next();
    return { x: X, y: 172, w: W - X * 2, h: H - 172 - 64 };
  },
  footer(c, st, deck) {
    const s = c.info.slide;
    if (s.source) c.text(`资料来源：${s.source}`, X, H - 42, 800, 18, { size: 10, color: c0.sub, anim: 'fade' });
    c.text(String(c.info.index), W - X - 40, H - 42, 40, 18, { size: 10, color: c0.sub, align: 'right', font: theme.font.num, anim: 'fade' });
    if (deck.org) c.text(deck.org, W - X - 460, H - 42, 400, 18, { size: 10, color: c0.mute, align: 'right', anim: 'fade' });
  },
  // 无底色：顶部一道粗线
  card(c, st, b) {
    c.rect(b.x, b.y, b.w, 3, { fill: c0.primary, anim: 'draw' });
    return { x: b.x, y: b.y + 22, w: b.w, h: b.h - 22 };
  },
  badge(c, st, x, y, k) {
    c.text(String(k + 1).padStart(2, '0'), x, y, 80, 40, { size: 30, bold: true, color: c0.accent, font: theme.font.num });
    return { w: 80, h: 42 };
  },
};

const L = {
  cover(c, s, st, deck) {
    // 右侧深蓝块 + 细网格，左侧大标题
    const px = 800;
    c.rect(px, 0, W - px, H, { fill: c0.primary, anim: 'fade' });
    for (let k = 1; k < 9; k++) c.line(px, k * 80, W, k * 80, { color: '#FFFFFF', w: 0.5, alpha: 0.12, anim: 'fade' });
    for (let k = 1; k < 6; k++) c.line(px + k * 80, 0, px + k * 80, H, { color: '#FFFFFF', w: 0.5, alpha: 0.12, anim: 'fade' });
    c.rect(px, 400, 160, 160, { fill: c0.accent, alpha: 0.9, anim: 'zoom' });
    c.rect(px + 160, 320, 80, 80, { fill: '#FFFFFF', alpha: 0.18, anim: 'zoom' });
    c.next();
    c.rect(X, 196, 56, 6, { fill: c0.accent, anim: 'draw' });
    if (deck.org) c.text(deck.org, X, 160, px - X - 60, 24, { size: 14, bold: true, color: c0.sub, ls: 1 });
    c.next();
    c.fitText(s.title || deck.title, X, 226, px - X - 60, 180, { max: 40, min: 28, bold: true, font: theme.font.title, color: c0.text, lh: 1.15, field: '封面标题', maxLines: 3, anim: 'up' });
    c.next();
    if (s.subtitle || deck.subtitle) c.fitText(s.subtitle || deck.subtitle, X, 420, px - X - 60, 60, { max: 20, min: 16, color: c0.sub, field: '副标题', maxLines: 2 });
    c.next();
    c.line(X, 590, px - 60, 590, { color: c0.line, w: 1 });
    c.text([deck.author, deck.date].filter(Boolean).join('    '), X, 604, px - X - 60, 24, { size: 14, color: c0.text });
  },

  toc(c, s, st, deck) {
    c.rect(0, 0, 420, H, { fill: c0.primary });
    c.text('目录', 72, 96, 300, 60, { size: 40, bold: true, color: '#FFFFFF', anim: 'up' });
    c.text('CONTENTS', 72, 160, 300, 24, { size: 14, bold: true, color: c0.accent, ls: 4, font: theme.font.num });
    c.next();
    const items = s.items || [];
    const rowH = Math.min(96, (H - 160) / Math.max(items.length, 1));
    const y0 = (H - rowH * items.length) / 2;
    items.forEach((it, k) => {
      const y = y0 + k * rowH;
      c.text(String(k + 1).padStart(2, '0'), 500, y, 90, rowH, { size: 36, bold: true, color: c0.accent, font: theme.font.num, valign: 'middle' });
      c.fitText(it.title, 600, y + 8, W - 600 - 72, rowH / 2, { max: 24, min: 18, bold: true, color: c0.text, valign: 'bottom', field: `目录第${k + 1}项`, maxLines: 1 });
      if (it.sub) c.fitText(it.sub, 600, y + rowH / 2 + 6, W - 600 - 72, rowH / 2 - 14, { max: 15, min: 13, color: c0.sub, field: `目录第${k + 1}项说明`, maxLines: 1 });
      c.line(500, y + rowH - 1, W - 72, y + rowH - 1, { color: c0.line, w: 0.75 });
      c.next();
    });
  },

  section(c, s, st, deck) {
    c.rect(0, 0, W, H, { fill: c0.primary });
    for (let k = 1; k < 16; k++) c.line(k * 80, 0, k * 80, H, { color: '#FFFFFF', w: 0.5, alpha: 0.07 });
    c.rect(X, 250, 8, 220, { fill: c0.accent, anim: 'wipe' });
    c.next();
    c.text(`第 ${s.no} 部分`, X + 40, 258, 600, 30, { size: 18, bold: true, color: c0.accent, ls: 2 });
    c.fitText(s.title, X + 40, 300, W - X * 2 - 40, 110, { max: 48, min: 32, bold: true, color: '#FFFFFF', font: theme.font.title, field: '章节标题', maxLines: 2, anim: 'up' });
    c.next();
    if (s.sub) c.fitText(s.sub, X + 40, 420, W - X * 2 - 40, 50, { max: 20, min: 16, color: '#C9D6EA', field: '章节说明', maxLines: 2 });
    c.text(String(s.no).padStart(2, '0'), W - 680, 250, 620, 420, { size: 240, bold: true, color: '#FFFFFF', alpha: 0.08, align: 'right', font: theme.font.num, anim: 'fade' });
  },

  // 柱状图默认只高亮最后一根（或指定的一根），其余灰
  chart(c, s, st, deck) {
    const area = st.parts.header(c, st, s.title);
    const tk = s.takeaways || [];
    const cw = tk.length ? area.w * 0.62 : area.w;
    const ch = { ...s.chart };
    if ((ch.kind || 'bar') === 'bar' && (ch.series || []).length <= 1 && ch.highlight == null) ch.highlight = (ch.categories || []).length - 1;
    chartEl(c, st, { x: area.x, y: area.y + 6, w: cw - 40, h: area.h - 30 }, ch, { colors: [c0.primary, c0.mute, c0.accent, '#8E9BB0'] });
    c.next();
    if (tk.length) {
      const x = area.x + cw, w = area.w - cw;
      c.rect(x, area.y, w, area.h - 10, { fill: c0.card });
      c.text('要点', x + 28, area.y + 22, 200, 24, { size: 14, bold: true, color: c0.accent, ls: 2 });
      tk.slice(0, 4).forEach((t, k) => {
        const h = (area.h - 90) / Math.min(tk.length, 4), y = area.y + 64 + k * h;
        c.text(String(k + 1), x + 28, y, 30, 30, { size: 20, bold: true, color: c0.primary, font: theme.font.num });
        c.fitText(t, x + 60, y + 2, w - 88, h - 14, { max: 17, min: 14, color: c0.text, lh: 1.15, field: `第${k + 1}条结论` });
        c.next();
      });
    }
  },

  statement(c, s, st, deck) {
    c.rect(X, 200, 8, 300, { fill: c0.accent, anim: 'wipe' });
    c.next();
    c.fitText(s.text, X + 50, 200, W - X * 2 - 120, 240, { max: 36, min: 24, bold: true, color: c0.primary, font: theme.font.title, valign: 'middle', lh: 1.25, field: '金句', anim: 'up' });
    c.next();
    if (s.source) c.text('— ' + s.source, X + 50, 460, 800, 30, { size: 16, color: c0.sub });
  },

  ending(c, s, st, deck) {
    c.rect(0, 0, W, H, { fill: c0.primary });
    for (let k = 1; k < 16; k++) c.line(k * 80, 0, k * 80, H, { color: '#FFFFFF', w: 0.5, alpha: 0.07 });
    c.rect(X, 300, 56, 6, { fill: c0.accent, anim: 'draw' });
    c.next();
    c.fitText(s.title || '谢谢', X, 320, W - X * 2, 90, { max: 54, min: 36, bold: true, color: '#FFFFFF', font: theme.font.title, field: '结束语', maxLines: 1, anim: 'up' });
    c.next();
    if (s.sub) c.fitText(s.sub, X, 420, W - X * 2, 40, { max: 20, min: 16, color: '#C9D6EA', field: '结束页副标题', maxLines: 1 });
    if (deck.org) c.text(deck.org, X, 620, 800, 24, { size: 14, color: '#C9D6EA' });
  },
};

module.exports = {
  id: 'zixun', name: '商务咨询蓝', order: 2,
  desc: '咨询报告风：白底左对齐、标题写结论、细线分区、图表只高亮重点',
  fits: '方案汇报、经营分析、项目提案、给领导的决策材料',
  theme, parts, L, bare: ['cover', 'toc', 'section', 'ending'], kpiH: 200,
};

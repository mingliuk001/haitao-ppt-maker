// 通用版式。每个风格可以整页覆盖，也可以只换「零件」（页眉、卡片、编号、背景）。
// 版式函数签名：(c: Canvas, s: 本页内容, st: 风格, deck: 全稿) → void
'use strict';

const { W, H } = require('./canvas');

const PAD = 80; // 默认左右边距

// —— 默认零件 —— 风格可以覆盖
const parts = {
  // 背景与外框
  frame(c, st) {},
  // 页眉：画标题，返回正文区 {x, y, w, h}
  header(c, st, title) {
    const th = st.theme;
    c.fitText(title, PAD, 48, W - PAD * 2, 50, { max: 28, min: 22, bold: true, font: th.font.title, color: th.c.text, field: '标题', maxLines: 1, anim: 'left' });
    c.rect(PAD, 108, 48, 4, { fill: th.c.primary, anim: 'draw' });
    c.next();
    return { x: PAD, y: 140, w: W - PAD * 2, h: H - 140 - 56 };
  },
  footer(c, st, deck) {
    const th = st.theme;
    if (c.info.index > 1) c.text(String(c.info.index).padStart(2, '0'), W - PAD - 60, H - 40, 60, 20, { size: 11, color: th.c.sub, align: 'right', anim: 'fade', font: th.font.num });
  },
  // 卡片底，返回内框
  card(c, st, b, k) {
    const th = st.theme;
    c.rect(b.x, b.y, b.w, b.h, { fill: th.c.card, r: 10 });
    return { x: b.x + 24, y: b.y + 22, w: b.w - 48, h: b.h - 44 };
  },
  // 序号标记，返回占用宽高
  badge(c, st, x, y, k) {
    const th = st.theme;
    c.text(String(k + 1).padStart(2, '0'), x, y, 60, 34, { size: 24, bold: true, color: th.c.primary, font: th.font.num });
    return { w: 60, h: 40 };
  },
};

// 网格切分：n 个格子，cols 列
function grid(area, n, cols, gap = 24, rowGap = gap) {
  const rows = Math.ceil(n / cols);
  const w = (area.w - gap * (cols - 1)) / cols;
  const h = (area.h - rowGap * (rows - 1)) / rows;
  return Array.from({ length: n }, (_, k) => ({ x: area.x + (k % cols) * (w + gap), y: area.y + Math.floor(k / cols) * (h + rowGap), w, h }));
}

// 内容不多时别把卡片拉满整页：按需要的高度收窄，并在正文区垂直居中
function shrink(area, need, min = 0) {
  const h = Math.min(area.h, Math.max(need, min));
  return { ...area, y: area.y + (area.h - h) / 2, h };
}

function colsFor(n) { return n <= 3 ? n : n === 4 ? 2 : 3; }

// 卡片内：编号 + 小标题 + 正文
function itemBlock(c, st, inner, it, k, o = {}) {
  const th = st.theme;
  let y = inner.y;
  if (o.badge !== false) { const b = st.parts.badge(c, st, inner.x, y, k); y += b.h + 8; }
  if (it.title) {
    const t = c.fitText(it.title, inner.x, y, inner.w, o.titleH || 34, { max: o.titleMax || 22, min: 18, bold: true, color: o.titleColor || th.c.text, font: th.font.title, field: `第${k + 1}条小标题`, maxLines: 2 });
    y += (t.usedH || 30) + 10;
  }
  if (it.text) c.fitText(it.text, inner.x, y, inner.w, inner.y + inner.h - y, { max: o.textMax || 18, min: 14, color: o.textColor || th.c.sub, lh: 1.15, field: `第${k + 1}条正文` });
}

const L = {
  cover(c, s, st, deck) {
    const th = st.theme;
    c.fitText(s.title || deck.title, PAD, 250, W - PAD * 2, 140, { max: 48, min: 32, bold: true, font: th.font.title, color: th.c.text, field: '封面标题', maxLines: 2, anim: 'up' });
    c.next();
    if (s.subtitle || deck.subtitle) c.fitText(s.subtitle || deck.subtitle, PAD, 400, W - PAD * 2, 40, { max: 22, min: 16, color: th.c.sub, field: '副标题', maxLines: 1 });
    c.next();
    c.text([deck.org, deck.author, deck.date].filter(Boolean).join('  ·  '), PAD, 600, W - PAD * 2, 30, { size: 14, color: th.c.sub });
  },

  toc(c, s, st, deck) {
    const th = st.theme;
    const area = st.parts.header(c, st, s.title || '目录');
    const items = s.items || [];
    const rowH = Math.min(92, area.h / Math.max(items.length, 1));
    const y0 = area.y + (area.h - rowH * items.length) / 2 - 10;
    items.forEach((it, k) => {
      const y = y0 + k * rowH;
      c.text(String(k + 1).padStart(2, '0'), area.x, y, 80, rowH, { size: 34, bold: true, color: th.c.primary, font: th.font.num, valign: 'middle' });
      c.fitText(typeof it === 'string' ? it : it.title, area.x + 100, y + rowH / 2 - 18, area.w - 100, 40, { max: 26, min: 18, color: th.c.text, field: `目录第${k + 1}项`, maxLines: 1, valign: 'middle' });
      c.line(area.x + 100, y + rowH - 1, area.x + area.w, y + rowH - 1, { color: th.c.line, w: 0.75 });
      c.next();
    });
  },

  section(c, s, st, deck) {
    const th = st.theme;
    c.text(String(s.no || '').padStart(2, '0'), PAD, 200, 300, 140, { size: 96, bold: true, color: th.c.primary, font: th.font.num, anim: 'up' });
    c.next();
    c.fitText(s.title, PAD, 360, W - PAD * 2, 70, { max: 40, min: 28, bold: true, color: th.c.text, font: th.font.title, field: '章节标题', maxLines: 1 });
    if (s.sub) c.fitText(s.sub, PAD, 440, W - PAD * 2, 36, { max: 20, min: 16, color: th.c.sub, field: '章节说明', maxLines: 1 });
  },

  points(c, s, st, deck) {
    const area = st.parts.header(c, st, s.title);
    const items = (s.items || []).slice(0, 6);
    const cols = colsFor(items.length);
    const rows = Math.ceil(items.length / cols);
    // 估一张卡片要多高：上下留白 + 编号 + 小标题 + 正文行数
    const M = require('./measure');
    const cw = (area.w - 24 * (cols - 1)) / cols - 56;
    const need = Math.max(...items.map((it) => 48 + 54 + (it.title ? 44 : 0) + M.wrap(it.text || '', 18, cw).length * M.lineH(18, 1.15)));
    const box = shrink(area, rows * (need + 20) + 24 * (rows - 1), rows * 200);
    grid(box, items.length, cols).forEach((b, k) => {
      const inner = st.parts.card(c, st, b, k);
      itemBlock(c, st, inner, items[k], k);
      c.next();
    });
  },

  kpi(c, s, st, deck) {
    const th = st.theme;
    const area = st.parts.header(c, st, s.title);
    const items = (s.items || []).slice(0, 4);
    const bh = Math.min(area.h - (s.note ? 56 : 0), st.kpiH || 280);
    const boxes = grid({ ...area, h: bh, y: area.y + (area.h - (s.note ? 56 : 0) - bh) / 2 }, items.length, items.length);
    const size = kpiSize(st, items, boxes[0].w - 60);
    boxes.forEach((b, k) => {
      const it = items[k];
      const inner = st.parts.card(c, st, b, k);
      const ch = 190; // 数字+指标名+说明 的大致高度，居中摆
      kpiNumber(c, st, { ...inner, y: inner.y + Math.max(0, (inner.h - ch) / 2), h: Math.min(inner.h, ch) }, it, k, { size });
      c.next();
    });
    if (s.note) c.fitText(s.note, area.x, area.y + area.h - 40, area.w, 40, { max: 16, min: 14, color: th.c.sub, field: '注释' });
  },

  chart(c, s, st, deck) {
    const th = st.theme;
    const area = st.parts.header(c, st, s.title);
    const tk = s.takeaways || [];
    const cw = tk.length ? area.w * 0.6 : area.w;
    chartEl(c, st, { x: area.x, y: area.y + 6, w: cw - 30, h: area.h - 34 }, s.chart);
    c.next();
    if (tk.length) {
      const x = area.x + cw + 10, w = area.w - cw - 10;
      takeaways(c, st, { x, y: area.y + 10, w, h: area.h - 20 }, tk);
    }
  },

  compare(c, s, st, deck) {
    const th = st.theme;
    const area = st.parts.header(c, st, s.title);
    const sides = [s.left, s.right].filter(Boolean);
    const n = Math.max(...sides.map((sd) => (sd.items || []).length), 1);
    grid(shrink(area, 96 + n * 76, 300), 2, 2, 40).forEach((b, k) => {
      const sd = sides[k] || {};
      const col = k === 0 ? th.c.sub : th.c.primary;
      c.rect(b.x, b.y, b.w, b.h, { fill: th.c.card, r: 6, alpha: k === 0 ? 0.6 : 1 });
      c.rect(b.x, b.y, b.w, 56, { fill: k === 0 ? th.c.mute : th.c.primary, r: 6 });
      c.fitText(sd.title || '', b.x + 24, b.y + 10, b.w - 48, 36, { max: 22, min: 18, bold: true, color: k === 0 ? th.c.text : th.c.onPrimary, valign: 'middle', field: '对比标题', maxLines: 1 });
      bulletList(c, st, { x: b.x + 12, y: b.y + 84, w: b.w - 28, h: b.h - 96 }, sd.items || [], col);
      c.next();
    });
  },

  timeline(c, s, st, deck) {
    const th = st.theme;
    const area = st.parts.header(c, st, s.title);
    const items = (s.items || []).slice(0, 6);
    const n = items.length, y0 = area.y + (area.h - 240) / 2 + 80;
    c.line(area.x, y0, area.x + area.w, y0, { color: th.c.line, w: 2 });
    const slot = area.w / n;
    items.forEach((it, k) => {
      const cx = area.x + slot * k + slot / 2;
      c.ellipse(cx - 9, y0 - 9, 18, 18, { fill: th.c.primary, anim: 'zoom' });
      c.fitText(it.time || '', cx - slot / 2 + 8, y0 - 70, slot - 16, 40, { max: 28, min: 16, bold: true, color: th.c.primary, align: 'center', font: th.font.num, field: `第${k + 1}个时间`, maxLines: 1 });
      c.fitText(it.title || '', cx - slot / 2 + 8, y0 + 26, slot - 16, 56, { max: 20, min: 16, bold: true, color: th.c.text, align: 'center', field: `第${k + 1}个节点标题`, maxLines: 2 });
      if (it.text) c.fitText(it.text, cx - slot / 2 + 12, y0 + 90, slot - 24, Math.min(120, area.y + area.h - y0 - 90), { max: 17, min: 14, color: th.c.sub, align: 'center', lh: 1.1, field: `第${k + 1}个节点说明` });
      c.next();
    });
  },

  process(c, s, st, deck) {
    const th = st.theme;
    const area = st.parts.header(c, st, s.title);
    const items = (s.items || []).slice(0, 5);
    const n = items.length, gap = 28, w = (area.w - gap * (n - 1)) / n;
    items.forEach((it, k) => {
      const x = area.x + k * (w + gap), y = area.y + Math.max(20, (area.h - 300) / 2);
      c.poly([[x, y], [x + w - 18, y], [x + w + 4, y + 36], [x + w - 18, y + 72], [x, y + 72], [x + (k ? 22 : 0), y + 36]], { fill: k === n - 1 ? th.c.primary : th.c.card, anim: 'left' });
      c.fitText(it.title || '', x + 22, y + 14, w - 40, 44, { max: 20, min: 16, bold: true, color: k === n - 1 ? th.c.onPrimary : th.c.text, valign: 'middle', align: 'center', field: `第${k + 1}步标题`, maxLines: 2 });
      c.text(`STEP ${k + 1}`, x, y + 96, w, 24, { size: 12, bold: true, color: th.c.primary, font: th.font.num, ls: 2 });
      if (it.text) c.fitText(it.text, x, y + 128, w, 150, { max: 18, min: 14, color: th.c.sub, lh: 1.15, field: `第${k + 1}步说明` });
      c.next();
    });
  },

  statement(c, s, st, deck) {
    const th = st.theme;
    c.fitText(s.text, 160, 220, W - 320, 220, { max: 40, min: 26, bold: true, color: th.c.text, font: th.font.title, align: 'center', valign: 'middle', lh: 1.2, field: '金句', anim: 'blur' });
    c.next();
    if (s.source) c.text('—— ' + s.source, 160, 470, W - 320, 30, { size: 16, color: th.c.sub, align: 'center' });
  },

  table(c, s, st, deck) {
    const th = st.theme;
    const area = st.parts.header(c, st, s.title);
    const rows = (s.rows || []).slice(0, 8);
    const rowH = Math.min(rows.length <= 5 ? 64 : 52, area.h / (rows.length + 1));
    const cols = (s.header || []).length || 1;
    const tw = cols <= 3 ? Math.min(area.w, cols * 300) : area.w; // 列少时别拉满整页
    const M = require('./measure');
    const fs = rows.length > 6 ? 14 : rows.length <= 5 ? 18 : 16;
    [s.header || [], ...rows].forEach((r, ri) => r.forEach((cell, ci) => {
      if (M.wrap(String(cell ?? ''), fs, tw / cols - 24, { bold: ri === 0 || ci === 0 }).length > 1) c.issue(`表格第${ri === 0 ? '表头' : ri + '行'}第${ci + 1}格「${String(cell).slice(0, 12)}」一行放不下，请缩短到约 ${Math.max(2, Math.floor((tw / cols - 24) / (fs * 4 / 3) * 0.9))} 字`);
    }));
    c.table(area.x, area.y, tw, rowH * (rows.length + 1), {
      header: s.header || [], rows, rowH, font: th.font.body, size: fs,
      headFill: th.c.primary, headColor: th.c.onPrimary, fill: th.c.bg === '#FFFFFF' ? '#FFFFFF' : th.c.bg, stripe: th.c.card, color: th.c.text, border: th.c.line, firstColBold: true, anim: 'fade',
    });
  },

  ending(c, s, st, deck) {
    const th = st.theme;
    c.fitText(s.title || '谢谢', PAD, 270, W - PAD * 2, 100, { max: 54, min: 36, bold: true, color: th.c.text, font: th.font.title, align: 'center', field: '结束语', maxLines: 1, anim: 'zoom' });
    c.next();
    if (s.sub) c.fitText(s.sub, PAD, 390, W - PAD * 2, 40, { max: 20, min: 16, color: th.c.sub, align: 'center', field: '结束页副标题', maxLines: 1 });
  },
};

// —— 可复用的小构件 ——

// 一组指标共用一个数字字号（取最长那个能放下的字号），各卡片基线才齐
function kpiSize(st, items, w, max = 60) {
  const M = require('./measure');
  let size = max;
  const fits = (sz) => items.every((it) => M.textW(String(it.value ?? ''), sz, { font: st.theme.font.num, bold: true }) + (it.unit ? M.textW(it.unit, 18, { bold: true }) + 10 : 0) <= w);
  while (size > 30 && !fits(size)) size -= 2;
  return size;
}


function kpiNumber(c, st, inner, it, k, o = {}) {
  const th = st.theme;
  const num = String(it.value ?? '');
  const M = require('./measure');
  const unitW = it.unit ? M.textW(it.unit, 18, { bold: true }) + 10 : 0;
  let size = o.size || 60;
  if (!o.size) while (size > 30 && M.textW(num, size, { font: th.font.num, bold: true }) + unitW > inner.w) size -= 2;
  c.text(num, inner.x, inner.y, inner.w, size * 1.6, { size, bold: true, color: o.color || th.c.primary, font: th.font.num, anim: /^[\d.,]+$/.test(num) ? 'count' : 'up', align: o.align });
  const nw = M.textW(num, size, { font: th.font.num, bold: true });
  if (it.unit) c.text(it.unit, o.align === 'center' ? inner.x + inner.w / 2 + nw / 2 + 4 : inner.x + nw + 6, inner.y + size * 1.6 * 0.42, 100, 30, { size: 18, bold: true, color: o.color || th.c.primary });
  c.fitText(it.label || '', inner.x, inner.y + size * 1.6 + 6, inner.w, 30, { max: 18, min: 15, bold: true, color: th.c.text, field: `第${k + 1}个指标名`, maxLines: 1, align: o.align });
  if (it.note) c.fitText(it.note, inner.x, inner.y + size * 1.6 + 42, inner.w, inner.h - size * 1.6 - 42, { max: 15, min: 13, color: th.c.sub, field: `第${k + 1}个指标说明`, align: o.align });
}

function chartEl(c, st, b, ch, o = {}) {
  const th = st.theme;
  if (!ch) return;
  const series = ch.series || [{ name: ch.name || '', values: ch.values || [] }];
  c.chart(b.x, b.y, b.w, b.h, {
    kind: ch.kind || 'bar', categories: ch.categories || ch.labels || [], series,
    colors: o.colors || th.c.chart, font: th.font.body, labelColor: th.c.sub, valueColor: th.c.text, gridColor: th.c.line, bg: th.c.bg,
    highlight: ch.highlight, mute: th.c.mute, barRadius: o.barRadius ?? th.barRadius ?? 0, anim: 'fade', hideValAxis: o.hideValAxis,
  });
  if (ch.unit) c.text(`单位：${ch.unit}`, b.x, b.y + b.h + 2, 200, 20, { size: 11, color: th.c.sub });
}

function takeaways(c, st, b, list) {
  const th = st.theme;
  const n = Math.min(list.length, 4), h = b.h / n;
  list.slice(0, 4).forEach((t, k) => {
    const y = b.y + k * h;
    c.rect(b.x, y + 4, 4, h - 24, { fill: k === 0 ? th.c.primary : th.c.line, anim: 'wipe' });
    c.fitText(t, b.x + 22, y, b.w - 22, h - 16, { max: k === 0 ? 20 : 17, min: 14, bold: k === 0, color: k === 0 ? th.c.text : th.c.sub, lh: 1.15, field: `第${k + 1}条结论` });
    c.next();
  });
}

function bulletList(c, st, b, items, color) {
  const th = st.theme;
  const n = Math.max(items.length, 1), h = Math.min(84, b.h / n);
  items.forEach((t, k) => {
    const y = b.y + k * h;
    c.ellipse(b.x + 16, y + 12, 9, 9, { fill: color });
    c.fitText(typeof t === 'string' ? t : t.text, b.x + 38, y, b.w - 42, h - 10, { max: 20, min: 14, color: th.c.text, lh: 1.1, field: `第${k + 1}条要点` });
  });
}

module.exports = { L, parts, grid, shrink, colsFor, itemBlock, kpiNumber, kpiSize, chartEl, takeaways, bulletList, PAD };

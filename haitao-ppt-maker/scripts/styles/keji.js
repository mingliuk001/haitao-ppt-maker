// 科技暗黑：深色底、网格、青紫发光线条、等宽编号。HTML 版带扫描线、光晕呼吸、轨道旋转。
// 适合 AI/数字化/产品发布、技术分享。
'use strict';

const { W, H } = require('../lib/canvas');
const { grid, itemBlock, chartEl, kpiNumber, kpiSize } = require('../lib/layouts');

const c0 = {
  bg: '#060A14', text: '#EAF2FF', sub: '#8FA3C2', primary: '#22D3EE', accent: '#A78BFA',
  line: '#1C2842', card: '#0D1526', onPrimary: '#03131A', mute: '#2A3A5A',
  chart: ['#22D3EE', '#A78BFA', '#3B82F6', '#64748B'],
};

const theme = {
  bg: c0.bg, stage: '#000000', c: c0, barRadius: 3,
  font: { title: '微软雅黑', body: '微软雅黑', num: 'Bahnschrift' },
  motion: { default: 'blur', base: 0.1, stagger: 0.1, dur: 0.8 },
};
const X = 72;

function gridBg(c, alpha = 0.06) {
  for (let x = 80; x < W; x += 80) c.line(x, 0, x, H, { color: c0.primary, w: 0.5, alpha, anim: 'none' });
  for (let y = 80; y < H; y += 80) c.line(0, y, W, y, { color: c0.primary, w: 0.5, alpha, anim: 'none' });
}
function glow(c, cx, cy, r, color, a = 0.16) {
  c.glow(cx, cy, r, color, a * 3, { fx: 'pulse' });
}
function corners(c, x, y, w, h, len = 18, color = c0.primary, a = 0.8) {
  const o = { stroke: color, sw: 1.5, salpha: a, closed: false, anim: 'fade' };
  c.poly([[x, y + len], [x, y], [x + len, y]], o);
  c.poly([[x + w - len, y], [x + w, y], [x + w, y + len]], o);
  c.poly([[x, y + h - len], [x, y + h], [x + len, y + h]], o);
  c.poly([[x + w - len, y + h], [x + w, y + h], [x + w, y + h - len]], o);
}
function scan(c) {
  c.rect(0, -100, W, 90, { grad: ['rgba(34,211,238,0)', 'rgba(34,211,238,0.07)', 180], fill: 'none', htmlOnly: true, fx: 'scan', anim: 'none' });
}

const parts = {
  frame(c, st, type) {
    gridBg(c);
    scan(c);
    if (!['cover', 'section', 'ending'].includes(type)) {
      glow(c, W - 60, 40, 180, c0.accent, 0.1);
      corners(c, 28, 28, W - 56, H - 56, 22, c0.primary, 0.5);
    }
  },
  header(c, st, title) {
    c.text(`// ${String(c.info.index).padStart(2, '0')}`, X, 50, 200, 22, { size: 13, color: c0.primary, font: 'Consolas', anim: 'fade' });
    const sec = c.info.slide._sec;
    if (sec) c.text(sec.title.toUpperCase(), X + 70, 50, 500, 22, { size: 12, color: c0.sub, ls: 2, anim: 'fade' });
    c.fitText(title, X, 76, W - X * 2, 52, { max: 30, min: 22, bold: true, font: theme.font.title, color: c0.text, field: '标题', maxLines: 1, anim: 'blur' });
    c.rect(X, 136, 64, 3, { fill: c0.primary, grad: [c0.primary, c0.accent, 90], anim: 'draw' });
    c.rect(X + 68, 136, 8, 3, { fill: c0.accent, anim: 'draw' });
    c.next();
    return { x: X, y: 166, w: W - X * 2, h: H - 166 - 70 };
  },
  footer(c, st, deck) {
    c.text(`${String(c.info.index).padStart(2, '0')} / ${String(c.info.total).padStart(2, '0')}`, W - X - 100, H - 58, 100, 18, { size: 11, color: c0.sub, align: 'right', font: 'Consolas', anim: 'fade' });
    c.ellipse(X, H - 52, 6, 6, { fill: c0.primary, anim: 'fade', fx: 'pulse' });
    if (deck.org) c.text(deck.org, X + 16, H - 58, 600, 18, { size: 11, color: c0.sub, anim: 'fade' });
  },
  card(c, st, b, k) {
    c.rect(b.x, b.y, b.w, b.h, { fill: '#FFFFFF', alpha: 0.035, stroke: k % 2 ? c0.accent : c0.primary, sw: 1, salpha: 0.28, r: 8, anim: 'zoom' });
    c.rect(b.x + 24, b.y, 36, 3, { fill: k % 2 ? c0.accent : c0.primary, anim: 'draw', glow: 8 });
    return { x: b.x + 24, y: b.y + 26, w: b.w - 48, h: b.h - 48 };
  },
  badge(c, st, x, y, k) {
    c.text(String(k + 1).padStart(2, '0'), x, y, 60, 36, { size: 26, bold: true, color: k % 2 ? c0.accent : c0.primary, font: theme.font.num });
    c.line(x + 46, y + 18, x + 90, y + 18, { color: c0.line, w: 1 });
    return { w: 60, h: 38 };
  },
};

const L = {
  cover(c, s, st, deck) {
    // 右侧轨道环 + 中心发光球
    const cx = 960, cy = 360;
    glow(c, cx, cy, 260, c0.primary, 0.12);
    [300, 220, 140].forEach((r, j) => c.ellipse(cx - r, cy - r, r * 2, r * 2, { fill: 'none', stroke: j === 1 ? c0.accent : c0.primary, sw: 1, salpha: 0.35 - j * 0.05, dash: j === 0, anim: 'zoom', fx: j === 0 ? 'spin' : undefined }));
    c.glow(cx, cy, 120, c0.primary, 0.7, { anim: 'zoom' });
    c.ellipse(cx - 40, cy - 40, 80, 80, { fill: c0.primary, alpha: 0.95, anim: 'zoom' });
    [[cx + 300, cy, c0.primary], [cx - 156, cy - 156, c0.accent], [cx + 99, cy + 99, '#FFFFFF']].forEach(([x, y, col]) => c.ellipse(x - 6, y - 6, 12, 12, { fill: col, glow: 12, anim: 'zoom', fx: 'pulse' }));
    corners(c, 28, 28, W - 56, H - 56, 26, c0.primary, 0.6);
    c.next();
    const tag = deck.tag || deck.date || '';
    if (tag) {
      c.rect(X, 196, 40 + require('../lib/measure').textW(tag, 13) , 30, { fill: 'none', stroke: c0.primary, sw: 1, salpha: 0.7, r: 15 });
      c.text(tag, X, 196, 40 + require('../lib/measure').textW(tag, 13), 30, { size: 13, color: c0.primary, align: 'center', valign: 'middle' });
    }
    c.next();
    c.fitText(s.title || deck.title, X, 244, 720, 170, { max: 52, min: 34, bold: true, font: theme.font.title, color: c0.text, lh: 1.1, field: '封面标题', maxLines: 2, anim: 'blur' });
    c.next();
    if (s.subtitle || deck.subtitle) c.fitText(s.subtitle || deck.subtitle, X, 430, 680, 60, { max: 20, min: 16, color: c0.sub, field: '副标题', maxLines: 2 });
    c.next();
    c.rect(X, 560, 120, 2, { fill: c0.primary, grad: [c0.primary, c0.accent, 90], anim: 'draw' });
    c.text([deck.org, deck.author].filter(Boolean).join('  ·  '), X, 576, 700, 24, { size: 14, color: c0.sub });
  },

  section(c, s, st, deck) {
    glow(c, 300, 360, 300, c0.accent, 0.1);
    c.text(String(s.no).padStart(2, '0'), X, 170, 500, 300, { size: 200, bold: true, color: c0.primary, font: theme.font.num, anim: 'blur', alpha: 0.95 });
    c.line(560, 200, 560, 520, { color: c0.line, w: 1 });
    c.next();
    c.text(`CHAPTER ${String(s.no).padStart(2, '0')}`, 610, 270, 500, 24, { size: 14, color: c0.accent, ls: 4, font: 'Consolas' });
    c.fitText(s.title, 610, 304, W - 610 - X, 110, { max: 44, min: 30, bold: true, color: c0.text, font: theme.font.title, field: '章节标题', maxLines: 2, anim: 'right' });
    c.next();
    if (s.sub) c.fitText(s.sub, 610, 420, W - 610 - X, 60, { max: 20, min: 16, color: c0.sub, field: '章节说明', maxLines: 2 });
  },

  kpi(c, s, st, deck) {
    const area = st.parts.header(c, st, s.title);
    const items = (s.items || []).slice(0, 4);
    const boxes = grid({ ...area, y: area.y + (area.h - 300) / 2, h: 300 }, items.length, items.length, 20);
    const size = kpiSize(st, items, boxes[0].w - 48);
    boxes.forEach((b, k) => {
      const inner = st.parts.card(c, st, b, k);
      corners(c, b.x + 8, b.y + 8, b.w - 16, b.h - 16, 10, k % 2 ? c0.accent : c0.primary, 0.5);
      kpiNumber(c, st, { ...inner, y: inner.y + 40, h: inner.h - 40 }, items[k], k, { color: k % 2 ? c0.accent : c0.primary, size });
      c.next();
    });
  },

  statement(c, s, st, deck) {
    glow(c, W / 2, H / 2, 280, c0.primary, 0.1);
    corners(c, 180, 170, W - 360, 380, 30, c0.primary, 0.7);
    c.next();
    c.fitText(s.text, 240, 220, W - 480, 240, { max: 38, min: 26, bold: true, color: c0.text, font: theme.font.title, align: 'center', valign: 'middle', lh: 1.25, field: '金句', anim: 'blur' });
    c.next();
    if (s.source) c.text(`// ${s.source}`, 240, 478, W - 480, 30, { size: 15, color: c0.primary, align: 'center', font: 'Consolas' });
  },

  ending(c, s, st, deck) {
    glow(c, W / 2, H / 2, 320, c0.primary, 0.12);
    [260, 190].forEach((r, j) => c.ellipse(W / 2 - r, H / 2 - r, r * 2, r * 2, { fill: 'none', stroke: j ? c0.accent : c0.primary, sw: 1, salpha: 0.3, dash: !j, anim: 'zoom', fx: !j ? 'spin' : undefined }));
    c.next();
    c.fitText(s.title || '谢谢', 120, 290, W - 240, 100, { max: 60, min: 40, bold: true, color: c0.text, font: theme.font.title, align: 'center', valign: 'middle', field: '结束语', maxLines: 1, anim: 'blur', ls: 4 });
    c.next();
    if (s.sub) c.fitText(s.sub, 120, 400, W - 240, 40, { max: 20, min: 16, color: c0.sub, align: 'center', field: '结束页副标题', maxLines: 1 });
  },
};

module.exports = {
  id: 'keji', name: '科技暗黑', order: 3,
  desc: '深色网格底、青紫发光线、等宽编号；HTML 版有扫描线、光晕呼吸、轨道旋转',
  fits: 'AI 与数字化主题、产品发布、技术分享、创新大赛路演',
  theme, parts, L, bare: ['cover', 'section', 'statement', 'ending'],
};

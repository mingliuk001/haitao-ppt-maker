// 新中式：宣纸底、朱砂红与黛蓝、楷体标题、双线边框、印章式编号、层叠远山。
// 适合文化宣传、文旅、传统节日、非遗与地方特色主题，也适合党政文化类活动。
'use strict';

const { W, H } = require('../lib/canvas');
const { grid, kpiNumber } = require('../lib/layouts');

const c0 = {
  bg: '#F4EEE1', text: '#2A2420', sub: '#6B5E52', primary: '#A8322D', accent: '#2E4A62', gold: '#B08D57',
  line: '#D8CDB8', card: '#EDE4D2', onPrimary: '#FFFFFF', mute: '#D3C6AE',
  chart: ['#A8322D', '#2E4A62', '#B08D57', '#7E9484'],
};

const theme = {
  bg: c0.bg, stage: '#2A2420', c: c0, barRadius: 0,
  font: { title: '楷体', body: '微软雅黑', num: '宋体' },
  motion: { default: 'fade', base: 0.15, stagger: 0.16, dur: 1.1 },
};
const X = 96;
const CN = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
function cn(n) { if (n <= 10) return CN[n - 1]; if (n < 20) return '十' + (n % 10 ? CN[n % 10 - 1] : ''); return CN[Math.floor(n / 10) - 1] + '十' + (n % 10 ? CN[n % 10 - 1] : ''); }
const GAN = '甲乙丙丁戊己庚辛壬癸', ZHI = '子丑寅卯辰巳午未申酉戌亥';

function ganzhi(date) {
  const m = String(date || '').match(/(19|20)\d{2}/);
  if (!m) return '';
  const y = +m[0];
  return GAN[(y - 4) % 10] + ZHI[(y - 4) % 12];
}

function border(c) {
  c.rect(28, 28, W - 56, H - 56, { fill: 'none', stroke: c0.gold, sw: 1.5, anim: 'fade' });
  c.rect(36, 36, W - 72, H - 72, { fill: 'none', stroke: c0.gold, sw: 0.5, salpha: 0.8, anim: 'fade' });
  [[28, 28], [W - 40, 28], [28, H - 40], [W - 40, H - 40]].forEach(([x, y]) => c.rect(x, y, 12, 12, { fill: c0.primary, anim: 'fade' }));
}

// 远山：几层起伏的折线面，越远越淡
function mountains(c, baseY = H, alpha = 1) {
  const layers = [
    { y: baseY - 150, amp: 60, col: c0.accent, a: 0.10, seed: 1 },
    { y: baseY - 100, amp: 70, col: c0.accent, a: 0.16, seed: 2 },
    { y: baseY - 50, amp: 50, col: c0.accent, a: 0.26, seed: 3 },
  ];
  layers.forEach((L) => {
    const pts = [[36, baseY - 36]];
    for (let x = 36; x <= W - 36; x += 40) {
      const t = x / W;
      const y = L.y - L.amp * (0.55 * Math.sin(t * Math.PI * (2 + L.seed) + L.seed) + 0.45 * Math.sin(t * Math.PI * (5 + L.seed * 1.7)));
      pts.push([x, Math.min(baseY - 36, y)]);
    }
    pts.push([W - 36, baseY - 36]);
    c.poly(pts, { fill: L.col, alpha: L.a * alpha, anim: 'up' });
  });
}

function seal(c, x, y, size, text) {
  c.rect(x, y, size, size, { fill: c0.primary, r: 4, anim: 'zoom' });
  c.rect(x + 4, y + 4, size - 8, size - 8, { fill: 'none', stroke: '#F4EEE1', sw: 1, salpha: 0.7, r: 2, anim: 'zoom' });
  c.text(text, x, y, size, size, { size: Math.round(size * (text.length > 2 ? 0.26 : 0.36)), color: '#FFFFFF', align: 'center', valign: 'middle', font: '楷体', anim: 'zoom' });
}

const parts = {
  frame(c, st, type) { border(c); },
  header(c, st, title) {
    c.rect(X, 64, 24, 24, { fill: c0.primary, r: 3, anim: 'zoom' });
    c.text(CN[(c.info.slide._sec?.no || 1) - 1] || '', X, 64, 24, 24, { size: 13, color: '#FFFFFF', align: 'center', valign: 'middle', font: '楷体', anim: 'zoom' });
    c.fitText(title, X + 40, 54, W - X * 2 - 40, 46, { max: 32, min: 24, font: theme.font.title, color: c0.text, field: '标题', maxLines: 1, anim: 'fade', bold: true });
    c.line(X, 116, W - X, 116, { color: c0.gold, w: 1 });
    c.line(X, 121, W - X, 121, { color: c0.gold, w: 0.5, alpha: 0.6 });
    c.rect(W / 2 - 5, 113, 10, 10, { fill: c0.primary, rot: 45 });
    c.next();
    return { x: X, y: 150, w: W - X * 2, h: H - 150 - 76 };
  },
  footer(c, st, deck) {
    c.text(cn(c.info.index), W / 2 - 20, H - 66, 40, 22, { size: 13, color: c0.gold, align: 'center', font: '宋体', anim: 'fade' });
    if (deck.org) c.text(deck.org, X, H - 66, 500, 22, { size: 11, color: c0.sub, anim: 'fade' });
  },
  card(c, st, b, k) {
    c.rect(b.x, b.y, b.w, b.h, { fill: c0.card, alpha: 0.7 });
    c.line(b.x + 10, b.y + 10, b.x + b.w - 10, b.y + 10, { color: c0.gold, w: 0.5 });
    c.line(b.x + 10, b.y + b.h - 10, b.x + b.w - 10, b.y + b.h - 10, { color: c0.gold, w: 0.5 });
    return { x: b.x + 24, y: b.y + 24, w: b.w - 48, h: b.h - 44 };
  },
  badge(c, st, x, y, k) {
    seal(c, x, y, 42, cn(k + 1));
    return { w: 42, h: 44 };
  },
};

const L = {
  cover(c, s, st, deck) {
    mountains(c);
    c.glow(960, 250, 200, c0.primary, 0.18);
    c.ellipse(890, 180, 140, 140, { fill: c0.primary, alpha: 0.92, anim: 'zoom' });
    c.next();
    const gz = ganzhi(deck.date);
    if (gz) seal(c, X + 6, 120, 64, gz);
    c.fitText(s.title || deck.title, X, 230, 760, 160, { max: 54, min: 36, bold: true, font: theme.font.title, color: c0.text, lh: 1.15, field: '封面标题', maxLines: 2, anim: 'fade' });
    c.next();
    c.line(X, 404, X + 120, 404, { color: c0.primary, w: 2 });
    if (s.subtitle || deck.subtitle) c.fitText(s.subtitle || deck.subtitle, X, 418, 720, 40, { max: 22, min: 16, color: c0.sub, field: '副标题', maxLines: 1, font: '楷体' });
    c.next();
    c.text([deck.org, deck.author, deck.date].filter(Boolean).join('  ·  '), X, 470, 800, 26, { size: 15, color: c0.sub });
  },

  section(c, s, st, deck) {
    mountains(c, H, 0.7);
    c.next();
    c.text(`第${cn(s.no)}章`, W / 2 - 300, 180, 600, 40, { size: 22, color: c0.primary, align: 'center', font: '楷体', ls: 6 });
    c.fitText(s.title, 200, 230, W - 400, 100, { max: 54, min: 34, bold: true, color: c0.text, font: theme.font.title, align: 'center', field: '章节标题', maxLines: 1, anim: 'fade', ls: 4 });
    c.line(W / 2 - 90, 346, W / 2 + 90, 346, { color: c0.gold, w: 1 });
    c.rect(W / 2 - 5, 341, 10, 10, { fill: c0.primary, rot: 45 });
    c.next();
    if (s.sub) c.fitText(s.sub, 200, 368, W - 400, 40, { max: 20, min: 16, color: c0.sub, align: 'center', field: '章节说明', maxLines: 1 });
  },

  // 竖排卷轴式：每条一栏，竖线隔开
  points(c, s, st, deck) {
    const area = st.parts.header(c, st, s.title);
    const items = (s.items || []).slice(0, 6);
    if (items.length > 4) return require('../lib/layouts').L.points(c, s, st, deck);
    grid({ ...area, y: area.y + 10, h: area.h - 10 }, items.length, items.length, 0).forEach((b, k) => {
      const it = items[k];
      if (k) c.line(b.x, b.y + 20, b.x, b.y + b.h - 20, { color: c0.gold, w: 0.75 });
      seal(c, b.x + b.w / 2 - 24, b.y + 16, 48, CN[k]);
      c.fitText(it.title || '', b.x + 24, b.y + 84, b.w - 48, 70, { max: 24, min: 18, bold: true, font: theme.font.title, color: c0.text, align: 'center', field: `第${k + 1}条小标题`, maxLines: 2 });
      c.line(b.x + b.w / 2 - 16, b.y + 162, b.x + b.w / 2 + 16, b.y + 162, { color: c0.primary, w: 2 });
      if (it.text) c.fitText(it.text, b.x + 30, b.y + 182, b.w - 60, b.h - 196, { max: 17, min: 14, color: c0.sub, align: 'center', lh: 1.3, field: `第${k + 1}条正文` });
      c.next();
    });
  },

  statement(c, s, st, deck) {
    mountains(c, H, 0.5);
    c.next();
    c.fitText(s.text, 180, 170, W - 360, 240, { max: 42, min: 28, bold: true, color: c0.text, font: theme.font.title, align: 'center', valign: 'middle', lh: 1.35, field: '金句', anim: 'fade' });
    c.next();
    if (s.source) {
      c.text(s.source, 180, 430, W - 360, 30, { size: 16, color: c0.sub, align: 'center', font: '楷体' });
    }
  },

  ending(c, s, st, deck) {
    mountains(c);
    c.ellipse(W / 2 - 70, 120, 140, 140, { fill: c0.primary, alpha: 0.9, anim: 'zoom' });
    c.next();
    c.fitText(s.title || '谢谢', 120, 290, W - 240, 100, { max: 64, min: 40, bold: true, color: c0.text, font: theme.font.title, align: 'center', valign: 'middle', field: '结束语', maxLines: 1, anim: 'fade', ls: 10 });
    c.next();
    if (s.sub) c.fitText(s.sub, 120, 396, W - 240, 40, { max: 20, min: 16, color: c0.sub, align: 'center', field: '结束页副标题', maxLines: 1, font: '楷体' });
  },
};

module.exports = {
  id: 'guochao', name: '新中式', order: 6,
  desc: '宣纸底、朱砂与黛蓝、楷体标题、双线边框、印章编号、层叠远山',
  fits: '文化宣传、文旅、传统节日、非遗与地方特色、文化类活动',
  theme, parts, L, bare: ['cover', 'section', 'statement', 'ending'],
};

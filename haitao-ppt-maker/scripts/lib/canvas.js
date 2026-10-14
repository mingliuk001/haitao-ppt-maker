// 一页幻灯片的「元素清单」。版式函数只往这里画，不碰 pptx/html；
// 同一份清单再分别交给 pptx.js 和 html.js 输出，两种格式长得一样。
// 坐标单位：像素，画布 1280x720。字号单位：磅。
'use strict';

const M = require('./measure');

const W = 1280, H = 720;

class Canvas {
  constructor(theme, info = {}) {
    this.theme = theme;
    this.els = [];
    this.issues = [];
    this.info = info; // { index, type, title }
    this.bg = theme.bg;
    this.step = 0; // 动画分组：同组同时出现
  }

  // 下一组动画
  next() { this.step += 1; return this; }

  push(el) { el.step = el.step ?? this.step; this.els.push(el); return el; }

  rect(x, y, w, h, o = {}) { return this.push({ t: 'rect', x, y, w, h, ...o }); }
  ellipse(x, y, w, h, o = {}) { return this.push({ t: 'ellipse', x, y, w, h, ...o }); }
  line(x1, y1, x2, y2, o = {}) { return this.push({ t: 'line', x1, y1, x2, y2, ...o }); }
  poly(points, o = {}) { return this.push({ t: 'poly', points, ...o }); }
  chart(x, y, w, h, o = {}) { return this.push({ t: 'chart', x, y, w, h, ...o }); }
  table(x, y, w, h, o = {}) { return this.push({ t: 'table', x, y, w, h, ...o }); }
  // 柔边光晕（pptx 里是一张透明 PNG，HTML 里是径向渐变）
  glow(cx, cy, r, color, alpha = 0.4, o = {}) { return this.push({ t: 'glow', x: cx - r, y: cy - r, w: r * 2, h: r * 2, color, alpha, anim: 'none', ...o }); }

  // 原样写一段字（字号固定，不自动缩放）
  text(s, x, y, w, h, o = {}) {
    const th = this.theme;
    return this.push({
      t: 'text', text: String(s ?? ''), x, y, w, h,
      font: o.font || th.font.body, size: o.size || 16, color: o.color || th.c.text,
      bold: !!o.bold, align: o.align || 'left', valign: o.valign || 'top',
      lh: o.lh || 1, ls: o.ls || 0, italic: !!o.italic, vert: o.vert, anim: o.anim, step: o.step, alpha: o.alpha, fx: o.fx, htmlOnly: o.htmlOnly,
    });
  }

  // 在框里放一段字：在 max..min 之间取能装下的最大字号；装不下就记一条问题（不缩到 min 以下）
  fitText(s, x, y, w, h, o = {}) {
    const str = String(s ?? '');
    const r = M.fit(str, { w, h }, { max: o.max || o.size || 20, min: o.min || 14, lh: o.lh || 1, bold: o.bold, font: o.font, ls: o.ls, maxLines: o.maxLines });
    if (!r.ok) this.issue(`${o.field || '文字'}放不下：「${str.slice(0, 18)}${str.length > 18 ? '…' : ''}」需要约 ${Math.ceil(r.h)}px 高，只有 ${Math.floor(h)}px，请缩短到约 ${Math.max(4, Math.floor(str.length * h / r.h * 0.9))} 字`);
    let out = str;
    if (!str.includes('\n') && o.balance !== false && ((o.maxLines || 99) <= 3 || o.align === 'center' || o.balance) && r.lines.length > 1 && r.lines.length <= 4) {
      let best = r.lines;
      for (let bw = w; bw >= w * 0.5; bw -= 8) {
        const ls = M.wrap(str, r.size, bw, { bold: o.bold, font: o.font, ls: o.ls });
        if (ls.length !== r.lines.length) break;
        best = ls;
      }
      // 两行时优先断在逗号、顿号后（离中点不远、两半都放得下）
      if (best.length === 2) {
        const chars = [...str], mid = chars.length / 2;
        let cut = -1;
        chars.forEach((ch, k) => { if ('，、；：,'.includes(ch) && Math.abs(k + 1 - mid) < chars.length * 0.3 && (cut < 0 || Math.abs(k + 1 - mid) < Math.abs(cut - mid))) cut = k + 1; });
        if (cut > 0) {
          const a = chars.slice(0, cut).join(''), b = chars.slice(cut).join('');
          // 为了断在标点，允许字号最多再降 8 磅（不低于下限）
          for (let sz = r.size; sz >= Math.max(o.min || 14, r.size - 8); sz--) {
            if (M.textW(a, sz, o) <= w * 0.94 && M.textW(b, sz, o) <= w * 0.94) { best = [a, b]; r.size = sz; break; }
          }
        }
      }
      out = best.join('\n');
    }
    const el = this.text(out, x, y, w, h, { ...o, size: r.size });
    el.lines = r.lines.length;
    el.usedH = Math.min(r.h, h);
    return el;
  }

  issue(msg) { this.issues.push(`第${this.info.index}页(${this.info.type})：${msg}`); }
}

module.exports = { Canvas, W, H };

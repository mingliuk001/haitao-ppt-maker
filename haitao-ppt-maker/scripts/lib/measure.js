// 文字测宽与折行。画布 1280x720 像素，字号用磅(pt)，1pt = 4/3 px。
// 没有字体文件可读，按字符类别估宽；留 6% 余量吸收不同字体的差异。
'use strict';

const PT = 4 / 3;
const LINE = 1.3; // 单倍行距约等于 1.3 倍字号（雅黑、宋体在 PowerPoint/WPS 里的实际行高）

// 行首不能出现的标点
const NO_START = new Set('，。、；：！？）》」』】〕…—,.;:!?)]}%'.split(''));
// 行尾不能出现的标点
const NO_END = new Set('（《「『【〔([{'.split(''));

function charW(ch, font) {
  const c = ch.codePointAt(0);
  if (c >= 0x2e80 && c <= 0x9fff) return 1; // 中日韩
  if (c >= 0xff00 && c <= 0xffef) return 1; // 全角
  if (c >= 0x3000 && c <= 0x303f) return 1; // 中文标点
  if (ch === '—' || ch === '…' || ch === '“' || ch === '”' || ch === '‘' || ch === '’') return 1;
  if (ch === ' ') return 0.3;
  const mono = font && /Consolas|Mono|Courier/i.test(font);
  if (mono) return 0.55;
  if (/[0-9]/.test(ch)) return 0.56;
  if (/[A-Z]/.test(ch)) return 0.66;
  if (/[iljtfI.,:;'!|]/.test(ch)) return 0.3;
  if (/[mwMW]/.test(ch)) return 0.85;
  return 0.54;
}

// 文字在给定字号下的宽度(px)
function textW(s, size, opt = {}) {
  let em = 0;
  for (const ch of String(s)) em += charW(ch, opt.font);
  em += (opt.ls || 0) / size * [...String(s)].length; // 字距(pt)
  return em * size * PT * (opt.bold ? 1.04 : 1);
}

// 切成不可分的小段：中文按字，英文按词
function tokens(s) {
  const out = [];
  const re = /[A-Za-z0-9][A-Za-z0-9.\-_%/+]*|\s+|./gsu;
  let m;
  while ((m = re.exec(s))) out.push(m[0]);
  return out;
}

// 折行，返回行数组。宽度按 94% 计算留余量。
function wrap(s, size, width, opt = {}) {
  const lines = [];
  const max = width * 0.94;
  for (const para of String(s).split('\n')) {
    let cur = '';
    for (const tk of tokens(para)) {
      const next = cur + tk;
      if (cur && textW(next, size, opt) > max && !/^\s+$/.test(tk)) {
        // 行首禁则：标点挤到上一行
        if (tk.length === 1 && NO_START.has(tk)) { cur = next; continue; }
        // 行尾禁则：左括号带到下一行
        let carry = '';
        while (cur.length > 1 && NO_END.has(cur[cur.length - 1])) { carry = cur[cur.length - 1] + carry; cur = cur.slice(0, -1); }
        lines.push(cur.trimEnd());
        cur = carry + tk.trimStart();
      } else cur = next;
    }
    lines.push(cur.trimEnd());
  }
  // 避免最后一行只剩一个字（孤字）
  if (lines.length > 1) {
    const last = lines[lines.length - 1];
    if ([...last].length === 1 && [...lines[lines.length - 2]].length > 3) {
      const prev = [...lines[lines.length - 2]];
      lines[lines.length - 1] = prev.pop() + last;
      lines[lines.length - 2] = prev.join('');
    }
  }
  return lines;
}

function lineH(size, lh = 1) { return size * PT * LINE * lh; }

// 在 [min, max] 之间找能装下的最大字号。装不下返回 ok:false（绝不低于 min）。
function fit(s, box, opt = {}) {
  const { max = 24, min = 14, lh = 1, maxLines = 99 } = opt;
  for (let size = max; size >= min; size -= 1) {
    const lines = wrap(s, size, box.w, opt);
    const h = lines.length * lineH(size, lh);
    if (h <= box.h && lines.length <= maxLines) return { ok: true, size, lines, h };
  }
  const lines = wrap(s, min, box.w, opt);
  return { ok: false, size: min, lines, h: lines.length * lineH(min, lh) };
}

module.exports = { PT, LINE, textW, wrap, lineH, fit };

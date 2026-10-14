// 元素清单 → 单文件 HTML 演示稿（带进场动效，键盘/翻页笔/点击/滑动翻页，F 全屏）
'use strict';

const PT = 4 / 3;
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const rgba = (c, a) => {
  if (a == null || a >= 1) return c;
  const h = c.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((x) => x + x).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
const fontStack = (f) => {
  const map = {
    "微软雅黑": "'Microsoft YaHei','PingFang SC','Hiragino Sans GB','Noto Sans CJK SC',sans-serif",
    "黑体": "SimHei,'Heiti SC','PingFang SC',sans-serif",
    "宋体": "SimSun,'Songti SC','Noto Serif CJK SC',serif",
    "楷体": "KaiTi,'Kaiti SC',STKaiti,serif",
    "仿宋": "FangSong,'FangSong_GB2312',STFangsong,serif",
    "等线": "DengXian,'PingFang SC','Microsoft YaHei',sans-serif",
  };
  if (map[f]) return map[f];
  return `'${f}','Microsoft YaHei','PingFang SC',sans-serif`;
};

function animAttr(el, theme) {
  const a = el.anim || (el.t === 'line' ? 'draw' : theme.motion.default);
  if (a === 'none') return '';
  const d = (theme.motion.base + el.step * theme.motion.stagger).toFixed(2);
  return ` data-a="${a}" style-delay="${d}"`;
}

function box(el, extra = '') {
  return `left:${el.x}px;top:${el.y}px;width:${el.w}px;height:${el.h}px;${extra}`;
}

function renderEl(el, theme, idx) {
  const anim = animAttr(el, theme);
  const delay = anim ? (anim.match(/style-delay="([\d.]+)"/) || [])[1] : null;
  const dstyle = delay ? `animation-delay:${delay}s;` : '';
  const a = anim.replace(/ style-delay="[\d.]+"/, '');
  const fx = el.fx ? ` fx-${el.fx}` : '';
  switch (el.t) {
    case 'rect':
    case 'ellipse': {
      let bg = el.fill && el.fill !== 'none' ? rgba(el.fill, el.alpha) : 'transparent';
      if (el.grad) bg = `linear-gradient(${el.grad[2] ?? 90}deg,${el.grad[0]},${el.grad[1]})`;
      const bd = el.stroke ? `border:${el.sw || 1}px ${el.dash ? 'dashed' : 'solid'} ${rgba(el.stroke, el.salpha)};` : '';
      const rad = el.t === 'ellipse' ? 'border-radius:50%;' : el.r ? `border-radius:${el.r}px;` : '';
      const rot = el.rot ? `transform:rotate(${el.rot}deg);` : '';
      const blur = el.glow ? `box-shadow:0 0 ${el.glow}px ${rgba(el.stroke || el.fill, 0.55)};` : '';
      return `<div class="e${fx}"${a} style="${box(el)}background:${bg};${bd}${rad}${rot}${blur}${dstyle}"></div>`;
    }
    case 'line': {
      const x = Math.min(el.x1, el.x2) - 4, y = Math.min(el.y1, el.y2) - 4;
      const w = Math.abs(el.x2 - el.x1) + 8, h = Math.abs(el.y2 - el.y1) + 8;
      const dash = el.dash ? ` stroke-dasharray="${(el.w || 1) * 4} ${(el.w || 1) * 3}"` : '';
      const mk = el.arrow ? ` marker-end="url(#ar${idx})"` : '';
      const marker = el.arrow ? `<defs><marker id="ar${idx}" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="${el.color}"/></marker></defs>` : '';
      return `<svg class="e${fx}"${a} style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;overflow:visible;${dstyle}" viewBox="${x} ${y} ${w} ${h}">${marker}<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.color}" stroke-opacity="${el.alpha ?? 1}" stroke-width="${el.w || 1}"${dash}${mk}/></svg>`;
    }
    case 'poly': {
      const xs = el.points.map((p) => p[0]), ys = el.points.map((p) => p[1]);
      const x = Math.min(...xs) - 2, y = Math.min(...ys) - 2, w = Math.max(...xs) - x + 4, h = Math.max(...ys) - y + 4;
      const pts = el.points.map((p) => p.join(',')).join(' ');
      const tag = el.closed === false ? 'polyline' : 'polygon';
      const fill = el.closed === false || !el.fill || el.fill === 'none' ? 'none' : el.fill;
      return `<svg class="e${fx}"${a} style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;overflow:visible;${dstyle}" viewBox="${x} ${y} ${w} ${h}"><${tag} points="${pts}" fill="${fill}" fill-opacity="${el.alpha ?? 1}" stroke="${el.stroke || 'none'}" stroke-width="${el.sw || 1}" stroke-opacity="${el.salpha ?? 1}" stroke-linejoin="round"/></svg>`;
    }
    case 'text': {
      if (!el.text) return '';
      const jc = { top: 'flex-start', middle: 'center', bottom: 'flex-end' }[el.valign] || 'flex-start';
      const vert = el.vert ? 'writing-mode:vertical-rl;' : '';
      const count = /^\s*[\d.,]+\s*$/.test(el.text) && el.anim === 'count' ? ` data-count="${esc(el.text.trim())}"` : '';
      return `<div class="e t${fx}"${a}${count} style="${box(el)}display:flex;flex-direction:column;justify-content:${jc};${vert}${dstyle}"><div style="font-family:${fontStack(el.font)};font-size:${(el.size * PT).toFixed(1)}px;line-height:${(1.3 * (el.lh || 1)).toFixed(2)};color:${rgba(el.color, el.alpha)};font-weight:${el.bold ? 700 : 400};${el.italic ? 'font-style:italic;' : ''}letter-spacing:${((el.ls || 0) * PT).toFixed(1)}px;text-align:${el.align === 'center' ? 'center' : el.align === 'right' ? 'right' : 'left'};white-space:pre-wrap;word-break:normal;overflow-wrap:break-word;line-break:strict;text-wrap:pretty">${esc(el.text)}</div></div>`;
    }
    case 'glow': return `<div class="e${fx}"${a} style="${box(el)}background:radial-gradient(circle closest-side,${rgba(el.color, el.alpha)},${rgba(el.color, el.alpha * 0.45)} 40%,${rgba(el.color, 0)});${dstyle}"></div>`;
    case 'chart': return renderChart(el, a, dstyle);
    case 'table': return renderTable(el, a, dstyle);
    default: return '';
  }
}

// 坐标轴取整：刻度步长取 1/2/5×10^n，刻度 4～6 格
function niceScale(v) {
  if (v <= 0) return { max: 1, step: 0.25 };
  const raw = v * 1.1 / 5, p = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 5, 10].map((m) => m * p).find((x) => x >= raw);
  return { max: Math.ceil(v * 1.05 / step) * step, step };
}
const fmt = (v) => (Math.round(v * 100) / 100).toLocaleString('zh-CN');

function renderChart(el, a, dstyle) {
  const W = el.w, H = el.h, F = fontStack(el.font), lc = el.labelColor, gc = el.gridColor;
  const cats = el.categories, ser = el.series;
  let svg = '';
  const legend = ser.length > 1 ? ser.map((s, k) => `<span style="display:inline-flex;align-items:center;margin-right:18px"><i style="width:12px;height:12px;background:${el.colors[k % el.colors.length]};display:inline-block;margin-right:6px;border-radius:2px"></i>${esc(s.name)}</span>`).join('') : '';
  if (el.kind === 'pie' || el.kind === 'doughnut') {
    const vals = ser[0].values, sum = vals.reduce((x, y) => x + y, 0) || 1;
    const R = Math.min(H, W * 0.55) / 2 - 10, cx = R + 10, cy = H / 2, sw = el.kind === 'doughnut' ? R * 0.38 : R;
    const rr = el.kind === 'doughnut' ? R - sw / 2 : R / 2, C = 2 * Math.PI * rr;
    let acc = 0;
    vals.forEach((v, k) => {
      const len = (v / sum) * C;
      svg += `<circle class="pie" cx="${cx}" cy="${cy}" r="${rr}" fill="none" stroke="${el.colors[k % el.colors.length]}" stroke-width="${sw}" stroke-dasharray="${len} ${C}" stroke-dashoffset="${-acc}" transform="rotate(-90 ${cx} ${cy})" style="--len:${len};animation-delay:${0.25 + k * 0.12}s"/>`;
      acc += len;
    });
    const lx = cx + R + 40;
    vals.forEach((v, k) => {
      const y = cy - (vals.length * 44) / 2 + k * 44 + 22;
      svg += `<rect x="${lx}" y="${y - 9}" width="18" height="18" rx="4" fill="${el.colors[k % el.colors.length]}"/><text x="${lx + 30}" y="${y + 7}" font-size="20" fill="${lc}" font-family="${F}">${esc(cats[k])}  <tspan font-weight="700" fill="${el.valueColor || lc}">${Math.round((v / sum) * 100)}%</tspan></text>`;
    });
    return `<svg class="e chart"${a} style="${box(el)}${dstyle}overflow:visible" viewBox="0 0 ${W} ${H}">${svg}</svg>`;
  }
  const top = legend ? 34 : 10, bottom = 34, left = el.hideValAxis ? 10 : 56, right = 10;
  const pw = W - left - right, ph = H - top - bottom;
  const { max, step } = niceScale(Math.max(...ser.flatMap((s) => s.values)));
  const ticks = Math.round(max / step);
  for (let g = 0; g <= ticks; g++) {
    const y = top + ph - (ph * g) / ticks;
    svg += `<line x1="${left}" y1="${y}" x2="${W - right}" y2="${y}" stroke="${gc}" stroke-width="${g === 0 ? 1.2 : 0.6}"/>`;
    if (!el.hideValAxis) svg += `<text x="${left - 10}" y="${y + 5}" text-anchor="end" font-size="14" fill="${lc}" font-family="${F}">${fmt(step * g)}</text>`;
  }
  const n = cats.length, slot = pw / n;
  cats.forEach((c, k) => { svg += `<text x="${left + slot * k + slot / 2}" y="${H - 8}" text-anchor="middle" font-size="15" fill="${lc}" font-family="${F}">${esc(c)}</text>`; });
  if (el.kind === 'line') {
    ser.forEach((s, si) => {
      const col = el.colors[si % el.colors.length];
      const pts = s.values.map((v, k) => [left + slot * k + slot / 2, top + ph - (v / max) * ph]);
      const d = pts.map((p, k) => (k ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
      svg += `<path class="ln" d="${d}" fill="none" stroke="${col}" stroke-width="3.5" stroke-linejoin="round" pathLength="1" style="animation-delay:${0.3 + si * 0.2}s"/>`;
      pts.forEach((p, k) => {
        svg += `<circle class="dot" cx="${p[0]}" cy="${p[1]}" r="5.5" fill="${el.bg || '#fff'}" stroke="${col}" stroke-width="3" style="animation-delay:${0.8 + k * 0.06}s"/>`;
        if (el.showValue !== false && ser.length === 1) svg += `<text class="val" x="${p[0]}" y="${p[1] - 14}" text-anchor="middle" font-size="15" font-weight="700" fill="${el.valueColor || lc}" font-family="${F}" style="animation-delay:${0.9 + k * 0.06}s">${fmt(s.values[k])}</text>`;
      });
    });
  } else {
    const m = ser.length, bw = Math.min(64, (slot * 0.62) / m);
    ser.forEach((s, si) => {
      s.values.forEach((v, k) => {
        const h = (v / max) * ph, x = left + slot * k + slot / 2 - (bw * m) / 2 + si * bw, y = top + ph - h;
        const col = el.highlight != null && m === 1 ? (k === el.highlight ? el.colors[0] : el.mute || el.colors[1]) : el.colors[si % el.colors.length];
        svg += `<rect class="bar" x="${x + 2}" y="${y}" width="${bw - 4}" height="${h}" fill="${col}" rx="${el.barRadius || 0}" style="transform-origin:0 ${top + ph}px;animation-delay:${0.25 + k * 0.07 + si * 0.05}s"/>`;
        if (el.showValue !== false) svg += `<text class="val" x="${x + bw / 2}" y="${y - 8}" text-anchor="middle" font-size="15" font-weight="700" fill="${el.valueColor || lc}" font-family="${F}" style="animation-delay:${0.6 + k * 0.07}s">${fmt(v)}</text>`;
      });
    });
  }
  const lg = legend ? `<div style="position:absolute;left:${left}px;top:0;font:14px ${F};color:${lc}">${legend}</div>` : '';
  return `<div class="e chart"${a} style="${box(el)}${dstyle}">${lg}<svg style="position:absolute;inset:0;overflow:visible" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${svg}</svg></div>`;
}

function renderTable(el, a, dstyle) {
  const F = fontStack(el.font), fs = (el.size * PT).toFixed(1);
  const cw = el.colW ? el.colW.map((w) => `<col style="width:${w}px">`).join('') : '';
  const cell = `height:${el.rowH}px;padding:0 12px;border:1px solid ${el.border};text-align:left;`;
  const th = el.header.map((h) => `<th style="${cell}font-weight:700;background:${el.headFill};color:${el.headColor}">${esc(h)}</th>`).join('');
  const tr = el.rows.map((r, ri) => `<tr>${r.map((c, ci) => `<td style="${cell}font-weight:${ci === 0 && el.firstColBold ? 700 : 400};background:${ri % 2 ? el.stripe : el.fill}">${esc(c)}</td>`).join('')}</tr>`).join('');
  return `<div class="e"${a} style="${box(el)}${dstyle}"><table style="width:100%;border-collapse:collapse;table-layout:fixed;font-family:${F};font-size:${fs}px;color:${el.color}">${cw}<thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>`;
}

function writeHtml(pages, meta, theme) {
  const slides = pages.map((pg, n) => `<section class="s" data-i="${n}" style="background:${pg.bgCss || pg.bg}">${pg.els.filter((e) => !e.pptOnly).map((e, k) => renderEl(e, theme, `${n}_${k}`)).join('')}</section>`).join('\n');
  const notes = JSON.stringify(pages.map((p) => p.notes || ''));
  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(meta.title || '演示文稿')}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;background:${theme.stage || '#111'};overflow:hidden}
#deck{position:absolute;left:50%;top:50%;width:1280px;height:720px;transform-origin:0 0}
.s{position:absolute;inset:0;overflow:hidden;opacity:0;pointer-events:none;transition:opacity .45s ease}
.s.on{opacity:1;pointer-events:auto}
.e{position:absolute}
.s [data-a]{opacity:0}
.s.on [data-a]{animation-duration:${theme.motion.dur}s;animation-fill-mode:both;animation-timing-function:cubic-bezier(.2,.7,.2,1)}
.s.on [data-a=up]{animation-name:up}.s.on [data-a=fade]{animation-name:fade}.s.on [data-a=left]{animation-name:left}
.s.on [data-a=right]{animation-name:right}.s.on [data-a=zoom]{animation-name:zoom}.s.on [data-a=draw]{animation-name:draw}
.s.on [data-a=grow]{animation-name:grow}.s.on [data-a=wipe]{animation-name:wipe}.s.on [data-a=count]{animation-name:fade}
.s.on [data-a=blur]{animation-name:blur}
@keyframes up{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:none}}
@keyframes fade{from{opacity:0}to{opacity:1}}
@keyframes left{from{opacity:0;transform:translateX(-40px)}to{opacity:1;transform:none}}
@keyframes right{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}
@keyframes zoom{from{opacity:0;transform:scale(.86)}to{opacity:1;transform:none}}
@keyframes blur{from{opacity:0;filter:blur(14px);transform:scale(1.04)}to{opacity:1;filter:none;transform:none}}
@keyframes draw{from{opacity:1;clip-path:inset(0 100% 0 0)}to{opacity:1;clip-path:inset(0 0 0 0)}}
@keyframes wipe{from{opacity:1;clip-path:inset(0 0 100% 0)}to{opacity:1;clip-path:inset(0 0 0 0)}}
@keyframes grow{from{opacity:0;transform:scaleY(0)}to{opacity:1;transform:none}}
.chart .bar{transform:scaleY(0)}.s.on .chart .bar{animation:bar .9s cubic-bezier(.2,.8,.2,1) both}
@keyframes bar{from{transform:scaleY(0)}to{transform:scaleY(1)}}
.chart .val,.chart .dot{opacity:0}.s.on .chart .val,.s.on .chart .dot{animation:fade .5s both}
.chart .ln{stroke-dasharray:1;stroke-dashoffset:1}.s.on .chart .ln{animation:ln 1.2s ease-out both}
@keyframes ln{to{stroke-dashoffset:0}}
.chart .pie{opacity:0}.s.on .chart .pie{animation:pie .9s ease-out both}
@keyframes pie{from{opacity:0;stroke-dasharray:0 9999}to{opacity:1}}
.s.on .fx-float{animation:float 6s ease-in-out infinite alternate}
@keyframes float{from{transform:translateY(-8px)}to{transform:translateY(8px)}}
.s.on .fx-spin{animation:spin 40s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.s.on .fx-pulse{animation:pulse 2.6s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:.35}50%{opacity:1}}
.s.on .fx-scan{animation:scan 5s linear infinite}
@keyframes scan{from{transform:translateY(-120px)}to{transform:translateY(840px)}}
#bar{position:fixed;left:0;bottom:0;height:3px;background:${theme.c.primary};transition:width .3s;z-index:9}
body.all{overflow:auto;background:#3a3a3a}body.all #deck{position:static;transform:none!important;width:auto;height:auto;display:grid;grid-template-columns:repeat(3,404px);gap:12px;padding:12px}body.all .s{position:relative;opacity:1;width:1280px;height:720px;zoom:.315}body.still .s,body.still .s [data-a],body.still .s *{opacity:1!important;animation:none!important;transition:none!important}body.still:not(.all) .s:not(.on){visibility:hidden}body.still #bar,body.still #pg{display:none}body.still .chart .bar{transform:none!important}body.still .chart .ln{stroke-dashoffset:0!important}body.all #bar,body.all #pg{display:none}
#pg{position:fixed;right:14px;bottom:10px;font:12px/1 system-ui;color:#888;z-index:9;opacity:.6}
@media print{html,body{overflow:visible;background:none}#deck{position:static;transform:none!important}.s{position:relative;opacity:1;page-break-after:always;width:1280px;height:720px}.s [data-a]{opacity:1!important;animation:none!important}#bar,#pg{display:none}@page{size:1280px 720px;margin:0}}
</style></head><body>
<div id="deck">
${slides}
</div><div id="bar"></div><div id="pg"></div>
<script>
(function(){
var S=[].slice.call(document.querySelectorAll('.s')),cur=0,deck=document.getElementById('deck');
var notes=${notes};
function fit(){var k=Math.min(innerWidth/1280,innerHeight/720);deck.style.transform='scale('+k+') translate(-50%,-50%)';deck.style.left='50%';deck.style.top='50%';deck.style.transform='translate(-50%,-50%) scale('+k+')';deck.style.transformOrigin='50% 50%';}
function count(s){if(document.body.classList.contains('still'))return;[].forEach.call(s.querySelectorAll('[data-count]'),function(el){var t=el.getAttribute('data-count'),n=parseFloat(t.replace(/,/g,'')),dp=(t.split('.')[1]||'').length,box=el.firstChild,t0=null,d=parseFloat(getComputedStyle(el).animationDelay)*1000||0;
function f(ts){if(!t0)t0=ts;var p=Math.min(1,Math.max(0,(ts-t0-d)/1100));p=1-Math.pow(1-p,3);box.textContent=(n*p).toFixed(dp).replace(/\\B(?=(\\d{3})+(?!\\d))/g,t.indexOf(',')>=0?',':'');if(p<1)requestAnimationFrame(f);else box.textContent=t;}requestAnimationFrame(f);});}
function go(n){n=Math.max(0,Math.min(S.length-1,n));S[cur].classList.remove('on');void S[n].offsetWidth;S[n].classList.add('on');cur=n;count(S[n]);
document.getElementById('bar').style.width=((n+1)/S.length*100)+'%';document.getElementById('pg').textContent=(n+1)+' / '+S.length;try{history.replaceState(null,'','#'+(n+1))}catch(e){}}
addEventListener('keydown',function(e){var k=e.key;if(k==='ArrowRight'||k==='ArrowDown'||k==='PageDown'||k===' '||k==='Enter')go(cur+1);else if(k==='ArrowLeft'||k==='ArrowUp'||k==='PageUp')go(cur-1);else if(k==='Home')go(0);else if(k==='End')go(S.length-1);else if(k==='f'||k==='F'){if(!document.fullscreenElement)document.documentElement.requestFullscreen();else document.exitFullscreen();}});
addEventListener('click',function(e){if(e.clientX<innerWidth/3)go(cur-1);else go(cur+1);});
var tx=null;addEventListener('touchstart',function(e){tx=e.touches[0].clientX});addEventListener('touchend',function(e){if(tx==null)return;var d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>40)go(cur+(d<0?1:-1));tx=null});
addEventListener('resize',fit);fit();if(/still/.test(location.search))document.body.classList.add('still');if(location.hash==='#all'){document.body.classList.add('all','still');return;}var h=parseInt(location.hash.slice(1));go(h>0?h-1:0);
})();
</script></body></html>`;
}

module.exports = { writeHtml };

// 元素清单 → 原生 .pptx（文字是文本框、图表是可双击改数据的原生图表、表格是真表格）
'use strict';

const path = require('path');
const PptxGenJS = require('../vendor/pptxgen.js');
const { glowPng } = require('./png');

const IN = 96; // 1 英寸 = 96px（1280px 宽 = 13.333 英寸，正好是 16:9 宽屏）
const i = (px) => +(px / IN).toFixed(4);
const hex = (c) => String(c || '000000').replace('#', '').toUpperCase();
const transp = (a) => (a == null ? 0 : Math.round((1 - a) * 100));

function fillOf(el) {
  if (!el.fill || el.fill === 'none') return { type: 'none' };
  return { color: hex(el.fill), transparency: transp(el.alpha) };
}
function lineOf(el) {
  if (!el.stroke) return { type: 'none' };
  const o = { color: hex(el.stroke), width: el.sw || 1, transparency: transp(el.salpha) };
  if (el.dash) o.dashType = el.dash === true ? 'dash' : el.dash;
  return o;
}

function addEl(pres, slide, el) {
  const S = pres.shapes;
  switch (el.t) {
    case 'rect': {
      const opt = { x: i(el.x), y: i(el.y), w: i(el.w), h: i(el.h), fill: fillOf(el), line: lineOf(el), rotate: el.rot };
      if (el.r) opt.rectRadius = i(el.r);
      slide.addShape(el.r ? S.ROUNDED_RECTANGLE : S.RECTANGLE, opt);
      break;
    }
    case 'ellipse':
      slide.addShape(S.OVAL, { x: i(el.x), y: i(el.y), w: i(el.w), h: i(el.h), fill: fillOf(el), line: lineOf(el) });
      break;
    case 'line': {
      const x = Math.min(el.x1, el.x2), y = Math.min(el.y1, el.y2);
      const w = Math.abs(el.x2 - el.x1), h = Math.abs(el.y2 - el.y1);
      const flip = (el.x2 - el.x1) * (el.y2 - el.y1) < 0;
      const ln = { color: hex(el.color), width: el.w || 1, transparency: transp(el.alpha) };
      if (el.dash) ln.dashType = el.dash === true ? 'dash' : el.dash;
      if (el.arrow) ln.endArrowType = 'triangle';
      slide.addShape(S.LINE, { x: i(x), y: i(y), w: i(w), h: i(h), line: ln, flipV: flip });
      break;
    }
    case 'poly': {
      const xs = el.points.map((p) => p[0]), ys = el.points.map((p) => p[1]);
      const x0 = Math.min(...xs), y0 = Math.min(...ys);
      const w = Math.max(1, Math.max(...xs) - x0), h = Math.max(1, Math.max(...ys) - y0);
      const pts = el.points.map((p) => ({ x: i(p[0] - x0), y: i(p[1] - y0) }));
      if (el.closed !== false) pts.push({ close: true });
      slide.addShape(S.CUSTOM_GEOMETRY, {
        x: i(x0), y: i(y0), w: i(w), h: i(h), points: pts,
        fill: el.closed === false ? { type: 'none' } : fillOf(el), line: lineOf(el),
      });
      break;
    }
    case 'text': {
      if (!el.text) break;
      slide.addText(el.text, {
        x: i(el.x), y: i(el.y), w: i(el.w), h: i(el.h), margin: 0,
        fontFace: el.font, fontSize: el.size, color: hex(el.color), bold: el.bold, italic: el.italic,
        align: el.align, valign: el.valign === 'middle' ? 'middle' : el.valign, lineSpacingMultiple: el.lh || 1,
        charSpacing: el.ls || undefined, vert: el.vert ? 'eaVert' : undefined, fit: 'none', wrap: true,
        transparency: transp(el.alpha) || undefined,
      });
      break;
    }
    case 'glow':
      slide.addImage({ data: glowPng(el.color, el.alpha), x: i(el.x), y: i(el.y), w: i(el.w), h: i(el.h) });
      break;
    case 'chart': addChart(pres, slide, el); break;
    case 'table': addTable(slide, el); break;
    default: break;
  }
}

function addChart(pres, slide, el) {
  const C = pres.charts;
  const kind = { bar: C.BAR, hbar: C.BAR, line: C.LINE, pie: C.PIE, doughnut: C.DOUGHNUT }[el.kind] || C.BAR;
  const data = el.series.map((s) => ({ name: s.name || '', labels: el.categories, values: s.values }));
  const ax = { fontFace: el.font, color: hex(el.labelColor) };
  const pieLike = el.kind === 'pie' || el.kind === 'doughnut';
  const opt = {
    x: i(el.x), y: i(el.y), w: i(el.w), h: i(el.h),
    chartColors: (pieLike ? el.colors : el.colors.slice(0, data.length)).map(hex),
    showLegend: data.length > 1 || pieLike, legendPos: pieLike ? 'r' : 't', legendFontFace: el.font, legendFontSize: 14, legendColor: hex(el.labelColor),
    showValue: el.showValue !== false && !(el.kind === 'line' && data.length > 1), dataLabelColor: hex(el.valueColor || el.labelColor), dataLabelFontSize: 12, dataLabelFontFace: el.font,
    dataLabelFormatCode: pieLike ? '0%' : (el.format || '#,##0.##'),
    chartArea: { roundedCorners: false, fill: { color: hex(el.bg || 'FFFFFF'), transparency: 100 }, border: { color: hex(el.bg || 'FFFFFF'), pt: 0.25 } },
    plotArea: { fill: { color: hex(el.bg || 'FFFFFF'), transparency: 100 } },
  };
  // 单组柱状图高亮某一根：逐根给色
  if ((el.kind === 'bar' || el.kind === 'hbar') && data.length === 1 && el.highlight != null) {
    opt.chartColors = el.categories.map((_, k) => hex(k === el.highlight ? el.colors[0] : (el.mute || el.colors[1])));
  }
  if (!pieLike) {
    Object.assign(opt, {
      barDir: el.kind === 'hbar' ? 'bar' : 'col', barGapWidthPct: 70,
      catAxisLabelColor: ax.color, valAxisLabelColor: ax.color, catAxisLabelFontFace: ax.fontFace, valAxisLabelFontFace: ax.fontFace,
      catAxisLabelFontSize: 12, valAxisLabelFontSize: 11,
      valGridLine: { color: hex(el.gridColor), style: 'solid', size: 0.5 }, catGridLine: { style: 'none' },
      catAxisLineShow: true, catAxisLineColor: hex(el.gridColor), valAxisLineShow: false,
      valAxisHidden: !!el.hideValAxis,
      lineSize: 3, lineDataSymbol: 'circle', lineDataSymbolSize: 8,
    });
    if (el.kind === 'bar' || el.kind === 'hbar') opt.dataLabelPosition = 'outEnd';
  } else {
    opt.showPercent = true; opt.showValue = false; opt.holeSize = 62; opt.dataLabelColor = hex(el.pieLabelColor || 'FFFFFF');
    opt.dataBorder = { pt: 1.5, color: hex(el.bg || 'FFFFFF') };
  }
  slide.addChart(kind, data, opt);
}

function addTable(slide, el) {
  const rows = [];
  const cols = el.header.length;
  rows.push(el.header.map((h) => ({ text: String(h), options: { bold: true, color: hex(el.headColor), fill: { color: hex(el.headFill) }, fontSize: el.size } })));
  el.rows.forEach((r, ri) => rows.push(r.map((c, ci) => ({
    text: String(c ?? ''),
    options: { color: hex(el.color), fill: { color: hex(ri % 2 ? el.stripe : el.fill) }, bold: ci === 0 && el.firstColBold, fontSize: el.size },
  }))));
  const colW = el.colW ? el.colW.map(i) : Array(cols).fill(i(el.w / cols));
  slide.addTable(rows, {
    x: i(el.x), y: i(el.y), w: i(el.w), colW, rowH: Array(rows.length).fill(i(el.rowH)), fontFace: el.font, fontSize: el.size,
    valign: 'middle', align: 'left', margin: [0, 0.12, 0, 0.12],
    border: { type: 'solid', pt: 0.75, color: hex(el.border) },
  });
}

async function writePptx(pages, meta, outFile) {
  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_WIDE';
  pres.title = meta.title || '';
  pres.author = meta.author || '';
  for (const pg of pages) {
    const slide = pres.addSlide();
    slide.background = { color: hex(pg.bg) };
    for (const el of pg.els) {
      if (el.htmlOnly) continue;
      addEl(pres, slide, el);
    }
    if (pg.notes) slide.addNotes(pg.notes);
  }
  await pres.writeFile({ fileName: path.resolve(outFile) });
  return outFile;
}

module.exports = { writePptx };

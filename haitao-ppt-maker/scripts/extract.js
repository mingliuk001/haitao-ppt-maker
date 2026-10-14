#!/usr/bin/env node
// 从 Word(.docx) 或 PPT(.pptx) 里提取文字，供写内容文件时参考。不需要安装任何东西。
// 用法：node extract.js 材料.docx      node extract.js 旧课件.pptx
// Word：标题段落前加 # / ## / ###，表格按行输出（单元格用 | 分隔）。
// PPT：按页输出「=== 第N页 ===」，每页的文字和备注。
'use strict';

const fs = require('fs');
const path = require('path');
const JSZip = require('./vendor/jszip.js');

const unesc = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
const texts = (xml, tag) => [...xml.matchAll(new RegExp(`<${tag}(?: [^>]*)?>([^<]*)</${tag}>`, 'g'))].map((m) => unesc(m[1])).join('');

async function docx(zip) {
  const xml = await zip.file('word/document.xml').async('string');
  const out = [];
  const body = xml.replace(/<w:tbl>[\s\S]*?<\/w:tbl>/g, (tbl) => {
    const rows = [...tbl.matchAll(/<w:tr[ >][\s\S]*?<\/w:tr>/g)].map((r) => [...r[0].matchAll(/<w:tc>[\s\S]*?<\/w:tc>/g)].map((c) => texts(c[0], 'w:t').trim()).join(' | '));
    return `<w:p><w:r><w:t>${rows.join('\n').replace(/&/g, '&amp;').replace(/</g, '&lt;')}</w:t></w:r></w:p>`;
  });
  for (const m of body.matchAll(/<w:p[ >][\s\S]*?<\/w:p>/g)) {
    const p = m[0];
    const t = texts(p, 'w:t').trim();
    if (!t) continue;
    const st = (p.match(/<w:pStyle w:val="([^"]+)"/) || [])[1] || '';
    const lv = (st.match(/(?:Heading|heading|标题)\s*(\d)/) || [])[1];
    out.push(lv ? '#'.repeat(+lv) + ' ' + t : t);
  }
  return out.join('\n');
}

async function pptx(zip) {
  const files = Object.keys(zip.files).filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f)).sort((a, b) => +a.match(/\d+/)[0] - +b.match(/\d+/)[0]);
  const out = [];
  for (const [k, f] of files.entries()) {
    const xml = await zip.file(f).async('string');
    const paras = [...xml.matchAll(/<a:p>[\s\S]*?<\/a:p>/g)].map((m) => texts(m[0], 'a:t').trim()).filter(Boolean);
    out.push(`=== 第${k + 1}页 ===`, ...paras);
    const rel = await zip.file(f.replace('slides/', 'slides/_rels/') + '.rels')?.async('string');
    const note = rel && (rel.match(/Target="\.\.\/notesSlides\/(notesSlide\d+\.xml)"/) || [])[1];
    if (note && zip.file('ppt/notesSlides/' + note)) {
      const nx = await zip.file('ppt/notesSlides/' + note).async('string');
      const nt = [...nx.matchAll(/<a:p>[\s\S]*?<\/a:p>/g)].map((m) => texts(m[0], 'a:t').trim()).filter((t) => t && !/^\d+$/.test(t));
      if (nt.length) out.push('【备注】' + nt.join(' '));
    }
  }
  return out.join('\n');
}

async function main() {
  const file = process.argv[2];
  if (!file) { console.error('用法：node extract.js 文件.docx 或 文件.pptx'); process.exit(1); }
  const ext = path.extname(file).toLowerCase();
  if (!['.docx', '.pptx'].includes(ext)) { console.error('只支持 .docx 和 .pptx。旧版 .doc/.ppt 请先在 WPS 里另存为 .docx/.pptx'); process.exit(1); }
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  console.log(ext === '.docx' ? await docx(zip) : await pptx(zip));
}

main().catch((e) => { console.error('读取失败：' + e.message); process.exit(1); });

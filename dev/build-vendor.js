// 打包 vendor/pptxgen.js：给 pptxgenjs 4.0.1 打两处补丁后用 esbuild 打成单文件。
// 补丁 1（上游 issue #1531 / PR #1537）：图表内嵌表格 ref 末尾多一个撇号 → Keynote 报「文件格式无效」、Keynote/预览丢图表。
// 补丁 2（同一 issue 附带）：数值 0 被写成空的 <v></v>。
const fs = require('fs');
const { execSync } = require('child_process');
const src = 'node_modules/pptxgenjs/dist/pptxgen.cjs.js';
let s = fs.readFileSync(src, 'utf8');
const n0 = s.length;
const a = "${data[0].labels[0].length + 1}'\" totalsRowShown";
if (!s.includes(a)) throw new Error('补丁1 位置没找到，pptxgenjs 版本变了？');
s = s.replace(a, "${data[0].labels[0].length + 1}\" totalsRowShown");
const zero = /<v>\$\{(data\[idy\]\.(?:values|sizes)\[idx\]) \|\| ''\}<\/v>/g;
const hits = (s.match(zero) || []).length;
if (hits < 2) throw new Error('补丁2 位置没找到');
s = s.replace(zero, (m, v) => `<v>\${${v} === 0 ? 0 : (${v} || '')}</v>`);
fs.writeFileSync('pptxgen.patched.cjs.js', s);
fs.writeFileSync('entry.js', "module.exports=require('./pptxgen.patched.cjs.js');");
const banner = '/*! PptxGenJS 4.0.1 (c) Brent Ely, MIT License, https://github.com/gitbrent/PptxGenJS | bundled with JSZip (c) Stuart Knightley et al., MIT License | patched for Keynote compatibility (upstream PR #1537) */';
execSync(`npx esbuild entry.js --bundle --platform=node --format=cjs --minify --legal-comments=eof --banner:js="${banner}" --outfile=../haitao-ppt-maker/scripts/vendor/pptxgen.js`, { stdio: 'inherit' });
fs.writeFileSync('entry-zip.js', "module.exports=require('jszip');");
execSync(`npx esbuild entry-zip.js --bundle --platform=node --format=cjs --minify --legal-comments=eof --banner:js="/*! JSZip 3.10 (c) Stuart Knightley et al., used under the MIT License, https://github.com/Stuk/jszip */" --outfile=../haitao-ppt-maker/scripts/vendor/jszip.js`, { stdio: 'inherit' });
console.log(`补丁完成：撇号 1 处，零值 ${hits} 处`);

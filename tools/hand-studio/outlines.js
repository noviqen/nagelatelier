const pw = require('/home/roy/projects/app-development/insta-tech-news/recorder/node_modules/playwright');
(async()=>{const b=await pw.chromium.launch();const p=await b.newPage();
await p.goto('http://localhost:8795/nagelatelier-test/proef.html');
const out=await p.evaluate(()=>{const r={};const pa=document.createElementNS('http://www.w3.org/2000/svg','path');document.querySelector('svg').appendChild(pa);
for(const [v] of VORMEN) for(const [l] of LENGTES){const L=nailLen(v,l);pa.setAttribute('d',nailPath(v,L));const t=pa.getTotalLength();const pts=[];for(let i=0;i<300;i++){const q=pa.getPointAtLength(i/300*t);pts.push([+q.x.toFixed(2),+q.y.toFixed(2)])}r[v+'_'+l]={L,pts}}return r;});
require('fs').writeFileSync('outlines.json',JSON.stringify(out));console.log(Object.keys(out).length);await b.close();})();

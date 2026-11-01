const { chromium } = require('playwright');
const fs = require('fs');
(async()=>{
 const [a,b,step] = process.argv.slice(2).map(Number); const FPS=30;
 const br=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await br.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
 p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.goto('http://127.0.0.1:8765/index.html'); await p.waitForFunction(()=>window.init); await p.evaluate(()=>window.init());
 fs.mkdirSync('frames',{recursive:true});
 const t0=Date.now();
 for(let f=a; f<b; f+=(step||1)){
   const out=`frames/${String(f).padStart(5,'0')}.jpg`; if(fs.existsSync(out)) continue;
   await p.evaluate(t=>window.renderAt(t), f/FPS);
   await p.screenshot({path:out+'.tmp',type:'jpeg',quality:93}); fs.renameSync(out+'.tmp',out);
   if(f%50===0) console.log('frame',f,((Date.now()-t0)/1000).toFixed(0)+'s');
 }
 await br.close(); console.log('done',a,b,((Date.now()-t0)/1000).toFixed(0));
})();

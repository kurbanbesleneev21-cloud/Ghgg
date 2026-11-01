const { chromium } = require('playwright');
(async()=>{
 const times = process.argv.slice(2).map(Number);
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
 p.on('console',m=>{ if(m.type()==='error'||m.type()==='warning') console.log('PAGE',m.type(),m.text().slice(0,300)); });
 p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.goto('http://127.0.0.1:8765/index.html');
 await p.waitForFunction(()=>window.init);
 let t0=Date.now(); console.log(await p.evaluate(()=>window.init())); console.log('init ms',Date.now()-t0);
 for(const t of times){ t0=Date.now(); await p.evaluate(t=>window.renderAt(t),t); const ms=Date.now()-t0; await p.screenshot({path:`prev/f_${t.toFixed(2)}.jpg`,type:'jpeg',quality:85}); console.log(t,'render ms',ms,'total',Date.now()-t0); }
 await b.close();
})();

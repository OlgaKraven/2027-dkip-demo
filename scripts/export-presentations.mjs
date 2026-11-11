import {createServer} from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import {extname,resolve,sep} from 'node:path';
import {chromium} from 'playwright';
import {pdfFiles,pdfManifest,presentationFingerprint,sha256} from './presentation-pdf.mjs';
import '../site/deck-data.js';

const root=resolve('site');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8',
  '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=createServer(async (request,response)=>{
  try {
    const url=new URL(request.url,'http://localhost');
    const file=resolve(root,'.'+decodeURIComponent(url.pathname));
    if(!file.startsWith(root+sep))return response.writeHead(403).end();
    const bytes=await readFile(file);
    response.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');
    response.end(bytes);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((ready,fail)=>{server.once('error',fail);server.listen(0,'127.0.0.1',ready);});
const base='http://127.0.0.1:'+server.address().port;
const outputs=[];
try {
  const executablePath=process.env.DKIP_CHROME;
  const browser=await chromium.launch(executablePath?{executablePath}:{});
  try {
    for(const [stack,file] of Object.entries(pdfFiles)){
      const deck=globalThis.TEACHER_DECKS[stack];
      const page=await browser.newPage({viewport:{width:1280,height:720}});
      try {
        await page.emulateMedia({media:'print'});
        const response=await page.goto(base+'/deck.html?stack='+stack+'&print=1');
        if(!response.ok())throw new Error('Could not load deck for '+stack);
        const layout=await page.evaluate(async ()=>{
          await document.fonts.ready;
          const root=document.querySelector('#print-pages');
          await Promise.all([...root.querySelectorAll('img')].map(image=>image.decode()));
          const slides=[...root.querySelectorAll('.slide-content, .cover-content')];
          return {count:slides.length,overflow:slides.flatMap((slide,i)=>
            slide.scrollHeight>slide.clientHeight+2||slide.scrollWidth>slide.clientWidth+2?[i+1]:[])};
        });
        if(layout.count!==deck.slides.length||layout.overflow.length)throw new Error(stack+': '+JSON.stringify(layout));
        const pdf=await page.pdf({preferCSSPageSize:true,printBackground:true});
        outputs.push({file,pdf,stack,record:{presentation:presentationFingerprint(deck),pdf:sha256(pdf)}});
        console.log(stack+': '+layout.count+' slides');
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
  for(const {file,pdf} of outputs)await writeFile(file,pdf);
  const manifest=Object.fromEntries(outputs.map(({stack,record})=>[stack,record]));
  await writeFile(pdfManifest,JSON.stringify(manifest,null,2)+'\n');
} finally {
  server.close();
}

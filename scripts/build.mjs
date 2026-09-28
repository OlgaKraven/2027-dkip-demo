import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
import {stagesFor,tasks,criteria} from '../content/course.mjs';import {buildErLayouts} from './er-layout.mjs';import '../src/core.js';
const out='site';fs.mkdirSync(out,{recursive:true});
for(const f of fs.readdirSync('src'))fs.copyFileSync('src/'+f,out+'/'+f);
fs.cpSync('materials',out+'/materials',{recursive:true});fs.cpSync('docs',out+'/docs',{recursive:true});fs.mkdirSync(out+'/downloads',{recursive:true});
for(const stack of ['mysql','postgresql'])fs.cpSync('examples/'+stack+'/Sql',out+'/code/examples/'+stack+'/Sql',{recursive:true});
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));const er=read('content/model.json');er.layouts=await buildErLayouts(er);fs.writeFileSync(out+'/er-data.js','globalThis.ER_GUIDE='+JSON.stringify(er)+';');
const code={};function walk(dir,fn,rel=dir+'/'){for(const f of fs.readdirSync(dir,{withFileTypes:true})){if(['bin','obj','wwwroot','.vs','.runtime'].includes(f.name))continue;const p=path.join(dir,f.name).replaceAll('\\','/');if(f.isDirectory())walk(p,fn);else fn(p,fs.readFileSync(p));}}
for(const dir of ['examples','docs'])walk(dir,(p,b)=>{if(/\.(cs|csproj|xaml|sql|json|md|ps1)$/.test(p))code[p]=b.toString('utf8');});
const screens=fs.existsSync('content/screens.json')?read('content/screens.json'):{};
for(const entries of Object.values(screens))for(const screen of Object.values(entries))screen.file+='?v='+createHash('sha256').update(fs.readFileSync(screen.file)).digest('hex').slice(0,12);
const variants=read('content/variants.json');const sources=[];walk('materials',(p,b)=>{if(/\.(pdf|docx|xlsx|json|rar)$/.test(p))sources.push({file:p,sha256:createHash('sha256').update(b).digest('hex')});});
for(const stack of ['mysql','postgresql']){
 const files={};walk('examples',(p,b)=>{if(!p.startsWith('examples/'+(stack==='mysql'?'postgresql':'mysql')+'/'))files[p]=b;});walk('docs',(p,b)=>{files[p]=b;});walk('materials/basic',(p,b)=>{files[p]=b;});
 for(const f of fs.readdirSync('examples/Api/wwwroot'))files['examples/Api/wwwroot/'+f]=fs.readFileSync('examples/Api/wwwroot/'+f);
 fs.writeFileSync(`${out}/downloads/dkip2027-${stack}.zip`,ExamCore.zip(files));
}
const all={};for(const v of variants){const files={};walk('content/variants/'+v.id,(p,b)=>{const n=path.basename(p);files[n]=b;all[v.id+'/'+n]=b;});for(const task of ['Задание 4','Задание 5','Задание 6'])walk('materials/basic/'+task,(p,b)=>{if(!p.endsWith('.rar')){files['Приложения/'+task+'/'+path.basename(p)]=b;all[v.id+'/Приложения/'+task+'/'+path.basename(p)]=b;}});fs.writeFileSync(out+'/downloads/exam-'+v.id+'.zip',ExamCore.zip(files));}fs.writeFileSync(out+'/downloads/exam-30-variants.zip',ExamCore.zip(all));
const basic={};walk('materials/basic',(p,b)=>basic[p.slice('materials/basic/'.length)]=b);fs.writeFileSync(out+'/downloads/basic-inputs.zip',ExamCore.zip(basic));
const data={stages:{mysql:stagesFor('mysql'),postgresql:stagesFor('postgresql')},tasks,criteria,code,variants,official:read('content/official.json'),previews:read('content/previews.json'),sources,screens};
fs.writeFileSync(out+'/content.js','globalThis.COURSE='+JSON.stringify(data)+';');fs.writeFileSync(out+'/downloads/source-manifest.json',JSON.stringify(sources,null,2));fs.writeFileSync(out+'/.nojekyll','');
console.log('Built 2027-dkip-demo: both routes, 6 modules, '+data.stages.mysql.reduce((n,s)=>n+s.steps.length,0)+' microsteps per route.');
// A browser may retain an earlier GitHub Pages asset after a new deployment.
const index=fs.readFileSync(out+'/index.html','utf8').replace(/\b(src|href)="([^"?]+\.(?:js|css))"/g,(_,attribute,file)=>`${attribute}="${file}?v=${createHash('sha256').update(fs.readFileSync(out+'/'+file)).digest('hex').slice(0,12)}"`);
fs.writeFileSync(out+'/index.html',index);

import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
import {stagesFor,tasks,criteria} from '../content/course.mjs';import {buildErLayouts} from './er-layout.mjs';import '../src/core.js';
import {describeExampleFile} from '../content/example-files.mjs';
import {exampleAccounts,exampleLaunch} from '../content/example-launch.mjs';
import {teacherDeck} from '../content/teacher-deck.mjs';
const out='site';fs.mkdirSync(out,{recursive:true});
for(const f of fs.readdirSync('src'))fs.copyFileSync('src/'+f,out+'/'+f);
fs.cpSync('materials',out+'/materials',{recursive:true});fs.mkdirSync(out+'/docs',{recursive:true});
const teachingDoc=f=>/^(DECISIONS\.md|api-(mysql|postgresql)\.(md|pdf|docx)|openapi\.json|postman-(mysql|postgresql)\.json)$/.test(f);
for(const f of fs.readdirSync(out+'/docs'))if(!teachingDoc(f))fs.rmSync(out+'/docs/'+f,{recursive:true,force:true});
for(const f of fs.readdirSync('docs'))if(teachingDoc(f))fs.copyFileSync('docs/'+f,out+'/docs/'+f);fs.mkdirSync(out+'/downloads',{recursive:true});
for(const stack of ['mysql','postgresql']){
 fs.cpSync('examples/'+stack+'/Sql',out+'/code/examples/'+stack+'/Sql',{recursive:true});
 const starter='examples/starter/'+stack+'/Database.cs';
 fs.cpSync(starter,out+'/code/'+starter);
}
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const kimPreviewDir='materials/kim-preview';
const kimPreviewPages=fs.readdirSync(kimPreviewDir)
 .filter(file=>/^page-\d+\.png$/.test(file)).sort()
 .map(file=>kimPreviewDir+'/'+file);
if(!kimPreviewPages.length)throw new Error('Missing preview pages for the official KIM');
const er=read('content/model.json');
const relationshipExplanations=read('content/er-relationships.json');
for(const [stack,{links}] of Object.entries(er.stacks)){
 for(const link of links){
  const key=`${link.from}.${link.field} → ${link.to}.${link.target}`;
  const explanation=relationshipExplanations[key];
  if(!explanation?.trim())throw new Error(`Missing ER explanation for ${stack}: ${key}`);
  link.explanation=explanation;
 }
}
er.layouts=await buildErLayouts(er);fs.writeFileSync(out+'/er-data.js','globalThis.ER_GUIDE='+JSON.stringify(er)+';');
const code={};function walk(dir,fn,rel=dir+'/'){for(const f of fs.readdirSync(dir,{withFileTypes:true})){if(['bin','obj','wwwroot','.vs','.runtime'].includes(f.name))continue;const p=path.join(dir,f.name).replaceAll('\\','/');if(f.isDirectory())walk(p,fn);else fn(p,fs.readFileSync(p));}}
for(const dir of ['examples','docs'])walk(dir,(p,b)=>{if(/\.(cs|csproj|xaml|sql|json|md|ps1)$/.test(p)&&(!p.startsWith('docs/')||teachingDoc(path.basename(p))))code[p]=b.toString('utf8');});
const screens=fs.existsSync('content/screens.json')?read('content/screens.json'):{};
for(const entries of Object.values(screens))for(const screen of Object.values(entries))screen.file+='?v='+createHash('sha256').update(fs.readFileSync(screen.file)).digest('hex').slice(0,12);
const variants=read('content/variants.json');const sources=[];walk('materials',(p,b)=>{if(/\.(pdf|docx|xlsx|json|rar)$/.test(p))sources.push({file:p,sha256:createHash('sha256').update(b).digest('hex')});});
for(const stack of ['mysql','postgresql']){
 const files={};
 const otherStack=stack==='mysql'?'postgresql':'mysql';
 walk('examples',(p,b)=>{
  if(!p.startsWith('examples/'+otherStack+'/')&&!p.startsWith('examples/starter/'+otherStack+'/'))files[p]=b;
 });
 walk('docs',(p,b)=>{
  const name=path.basename(p);
  if(teachingDoc(name)&&!name.startsWith('api-'+otherStack+'.')&& !name.startsWith('postman-'+otherStack+'.'))files[p]=b;
 });
 walk('materials/basic',(p,b)=>{files[p]=b;});
 files['examples/README.md']=exampleLaunch[stack].readme;
 for(const f of fs.readdirSync('examples/Api/wwwroot'))files['examples/Api/wwwroot/'+f]=fs.readFileSync('examples/Api/wwwroot/'+f);
 fs.writeFileSync(`${out}/downloads/dkip2027-${stack}.zip`,ExamCore.zip(files));
}
const variantPreviews=read('content/variant-previews.json');
const variantFiles={};
const all={};
const workbooks=['Заказ покупателя.xlsx','Спецификация.xlsx','Цены.xlsx','Заказ на производство.xlsx'];
const sharedAttachments=[
 ['Задание 4','Приложение 1.pdf'],
 ['Задание 5','Прил_5_ОЗ_КИМ_09.02.07-5-2027.pdf'],
 ['Задание 6','Прил_6_ОЗ_КИМ_09.02.07-5-2027.docx']
];
for(const {id} of variants){
 const folder=`content/variants/${id}`;
 const publicFolder=`variant-files/${id}`;
 fs.mkdirSync(`${out}/${publicFolder}/Пазл`,{recursive:true});
 const brief=fs.readFileSync(`${folder}/Задание.md`,'utf8').replaceAll('\r\n','\n').replace(/^#{1,3} /gm,'');
 const files={'Задание.txt':'\ufeff'+brief};
 const publish=(name,relative=name,archive=relative)=>{
  const bytes=fs.readFileSync(`${folder}/${relative}`);
  const file=`${publicFolder}/${relative}`;
  fs.writeFileSync(`${out}/${file}`,bytes);
  files[archive]=bytes;
  return {name,path:file};
 };
 const books=workbooks.map(name=>{
  const sheets=variantPreviews[id]?.[name];
  if(!sheets?.length)throw new Error(`Missing workbook preview: ${id}/${name}`);
  return {...publish(name),sheets};
 });
 const jsonFiles=['Заказчики.json','Заметки.json'].map(name=>({
  ...publish(name),text:files[name].toString('utf8')
 }));
 const puzzle=[1,2,3,4].map(number=>{
  const name=`${number}.png`;
  const archivePath=`Приложения/Задание 4/${name}`;
  const tile=publish(name,`Пазл/${name}`,archivePath);
  const version=createHash('sha256').update(files[archivePath]).digest('hex').slice(0,12);
  return {...tile,path:`${tile.path}?v=${version}`};
 });
 const [task4,task5,task6]=sharedAttachments.map(([task,name])=>{
  const file=`materials/basic/${task}/${name}`;
  files[`Приложения/${task}/${name}`]=fs.readFileSync(file);
  return {name,path:file};
 });
 variantFiles[id]={books,jsonFiles,puzzle,attachments:[task4,task5,task6]};
 for(const [name,bytes] of Object.entries(files))all[`${id}/${name}`]=bytes;
 fs.writeFileSync(`${out}/downloads/exam-${id}.zip`,ExamCore.zip(files));
}
fs.writeFileSync(out+'/downloads/exam-30-variants.zip',ExamCore.zip(all));
const basic={};walk('materials/basic',(p,b)=>basic[p.slice('materials/basic/'.length)]=b);fs.writeFileSync(out+'/downloads/basic-inputs.zip',ExamCore.zip(basic));
const codeDescriptions=Object.fromEntries(Object.keys(code).map(file=>[file,describeExampleFile(file)]));
const data={stages:{mysql:stagesFor('mysql'),postgresql:stagesFor('postgresql')},tasks,criteria,code,codeDescriptions,exampleAccounts,exampleLaunch,variants,variantFiles,official:read('content/official.json'),kimAssignments:read('content/kim-assignments.json'),kimPreviewPages,previews:read('content/previews.json'),sources,screens};
fs.writeFileSync(out+'/content.js','globalThis.COURSE='+JSON.stringify(data)+';');fs.writeFileSync(out+'/downloads/source-manifest.json',JSON.stringify(sources,null,2));fs.writeFileSync(out+'/.nojekyll','');
const decks=Object.fromEntries(Object.keys(data.stages).map(stack=>[stack,teacherDeck(data,stack)]));
fs.writeFileSync(out+'/deck-data.js','globalThis.TEACHER_DECKS='+JSON.stringify(decks)+';');
console.log('Built 2027-dkip-demo: both routes, 6 modules, '+data.stages.mysql.reduce((n,s)=>n+s.steps.length,0)+' microsteps per route.');
// A browser may retain an earlier GitHub Pages asset after a new deployment.
for(const page of ['index.html','deck.html']){
 const index=fs.readFileSync(out+'/'+page,'utf8').replace(/\b(src|href)="([^"?]+\.(?:js|css))"/g,(_,attribute,file)=>`${attribute}="${file}?v=${createHash('sha256').update(fs.readFileSync(out+'/'+file)).digest('hex').slice(0,12)}"`);
 fs.writeFileSync(out+'/'+page,index);
}

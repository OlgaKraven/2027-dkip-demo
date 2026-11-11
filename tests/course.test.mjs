import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import {stagesFor,tasks,criteria} from '../content/course.mjs';import '../src/core.js';
import {createHash} from 'node:crypto';
test('mock variants have thirty domains and matching authored six-task briefs',()=>{const variants=JSON.parse(fs.readFileSync('content/variants.json'));assert.equal(new Set(variants.map(v=>v.domain)).size,30);assert.equal(new Set(variants.map(v=>v.resources.map(r=>r.name).join('|'))).size,30);for(const v of variants){assert.equal(v.tasks.length,6);assert.ok(v.process.length>30);assert.ok(v.rules.length>100);assert.equal(v.customers.length,6);assert.equal(v.notes.length,5);const brief=fs.readFileSync(`content/variants/${v.id}/Задание.md`,'utf8');for(const task of v.tasks){assert.ok(task.text.includes(v.brand));assert.ok(brief.includes(task.text));}assert.ok(v.resources.some(r=>r.kind==='operation'));assert.ok(v.resources.some(r=>r.kind==='material'));assert.equal(new Set(v.customers.map(c=>c.id)).size,6);}});
test('deployed scripts and styles use content versions to invalidate browser cache',()=>{const html=fs.readFileSync('site/index.html','utf8');for(const file of ['app.js','er-guide.js','er-data.js','content.js','style.css']){const hash=createHash('sha256').update(fs.readFileSync('site/'+file)).digest('hex').slice(0,12);assert.ok(html.includes(file+'?v='+hash),file);}});
test('ER sources are the six unchanged attachments from the supplied 2027 basic archive',()=>{const audit=JSON.parse(fs.readFileSync('docs/source-audit.json'));const model=JSON.parse(fs.readFileSync('content/model.json'));assert.equal(model.source.code,'09.02.07-5-2027');assert.equal(model.source.section,'БУ / Задание 1');assert.deepEqual([...model.source.files].sort(),audit.files.map(f=>f.file).sort());for(const f of audit.files)assert.equal(createHash('sha256').update(fs.readFileSync('materials/basic/Задание 1/'+f.file)).digest('hex'),f.sha256,f.file);});
test('six official tasks total 210 minutes and 75 criteria points',()=>{assert.equal(tasks.length,6);assert.equal(tasks.reduce((n,t)=>n+t.minutes,0),210);assert.equal(criteria.reduce((n,c)=>n+c[1],0),75);});
test('both routes have complete matching microstep structure and existing source files',()=>{const a=stagesFor('mysql'),b=stagesFor('postgresql');assert.deepEqual(a.map(s=>s.steps.length),b.map(s=>s.steps.length));for(const stack of ['mysql','postgresql'])for(const stage of stagesFor(stack))for(const step of stage.steps){assert.ok(step.why.length>30);assert.ok(step.actions.length>=1);assert.ok(step.check.length>20);if(step.file)assert.ok(fs.existsSync(step.file),step.file);}});
test('each learning card has a distinct address within its stack and stage',()=>{
 for(const stack of ['mysql','postgresql'])for(const stage of stagesFor(stack)){
   const ids=stage.steps.map(step=>step.linkId??step.title);
   assert.equal(new Set([...ids,'result']).size,ids.length+1,stack+' '+stage.id);
 }
});
test('diagram field origins cover every SQL field and every reference',()=>{const m=JSON.parse(fs.readFileSync('content/model.json'));for(const stack of ['mysql','postgresql']){const sql=fs.readFileSync(`examples/${stack}/Sql/01-schema.sql`,'utf8');assert.equal(m.stacks[stack].tables.length,12);for(const t of m.stacks[stack].tables){assert.ok(sql.includes('CREATE TABLE '+t.id+' ('));for(const f of t.fields){assert.ok(f.why.length>10);assert.ok(sql.includes(' '+f.id+' '));}}for(const l of m.stacks[stack].links)assert.ok(sql.includes(`FOREIGN KEY (${l.field}) REFERENCES ${l.to}(${l.target})`));}});
test('training pause persists, mock continues with elapsed wall time',()=>{let t=ExamCore.freshTimer(12600,'training',0);t=ExamCore.transition(t,'start',100);t=ExamCore.transition(t,'pause',10100);assert.equal(ExamCore.timerView(t,90000).used,10000);const restored=ExamCore.restoreTimer(JSON.stringify(t),12600,'training');assert.equal(restored.status,'paused');let m=ExamCore.transition(ExamCore.freshTimer(12600,'mock',0),'start',100);assert.throws(()=>ExamCore.transition(m,'pause',1000));assert.equal(ExamCore.timerView(m,10100).used,10000);});
test('built site has thirty distinct variants and launchable projects in ZIP',()=>{const context={};vm.runInNewContext(fs.readFileSync('site/content.js','utf8'),context);const d=context.COURSE;assert.equal(d.variants.length,30);assert.equal(new Set(d.variants.map(v=>v.brand)).size,30);for(const stack of ['mysql','postgresql'])assert.ok(fs.statSync('site/downloads/dkip2027-'+stack+'.zip').size>100000);});
test('OpenAPI defines actual response fields and both endpoint paths',()=>{const spec=JSON.parse(fs.readFileSync('docs/openapi.json'));assert.deepEqual(Object.keys(spec.paths),['/notes','/api/notes']);assert.deepEqual(spec.components.schemas.Note.required,['id','title_user','content','formatted_date']);for(const p of Object.values(spec.paths))assert.deepEqual(Object.keys(p.get.responses),['200','400','500']);});
test('referenced screenshots exist and have descriptive captions',()=>{
 const screens=JSON.parse(fs.readFileSync('content/screens.json'));
 for(const stack of ['mysql','postgresql'])for(const stage of stagesFor(stack)){
  const refs=stage.steps.flatMap(step=>[step.shot,...(step.actionGroups||[]).map(group=>group.shot)]);
  for(const [, ,shot] of stage.foundation.guide.csvExport?.importSteps||[]) refs.push(shot);
  for(const ref of refs.filter(Boolean)){
   const image=screens[stack][ref];
   assert.ok(image,stack+' '+ref);
   assert.ok(fs.statSync(image.file).size>1000,image.file);
   assert.ok(image.caption.length>30);
  }
 }
});
test('deployed ER SQL links and downloadable PDF and DOCX files exist',()=>{for(const stack of ['mysql','postgresql'])assert.ok(fs.existsSync(`site/code/examples/${stack}/Sql/01-schema.sql`));assert.ok(fs.statSync('site/materials/er.pdf').size>10000);for(const stack of ['mysql','postgresql'])assert.ok(fs.statSync(`site/docs/api-${stack}.docx`).size>10000);});

test('finished attempts stop and cap time at the limit',()=>{
 let t=ExamCore.transition(ExamCore.freshTimer(60,'training',0),'start',100);
 t=ExamCore.transition(t,'finish',75100);
 assert.equal(t.status,'finished');
 assert.equal(ExamCore.timerView(t,900000).used,60000);
 assert.equal(ExamCore.timerView(t,900000).left,0);
 assert.equal(ExamCore.transition(t,'start',900001).status,'finished');
 const fresh=ExamCore.freshTimer(60,'training',900001);
 assert.equal(fresh.status,'idle');assert.equal(ExamCore.timerView(fresh).used,0);
});
test('every stage has novice preparation and diagnostics in both routes',()=>{
 for(const stack of ['mysql','postgresql']){
  const stages=stagesFor(stack);
  assert.equal(new Set(stages.map(stage=>stage.foundation.guide.title)).size,stages.length);
  for(const stage of stages){
   const f=stage.foundation;assert.ok(f.intro);assert.ok(f.terms.length>=3);assert.ok(f.steps.length>=4);assert.ok(f.errors.length>=2);
   if(stage.id==='M2') assert.equal(f.question,undefined);
   else assert.ok(f.question&&f.answer);
   for(const field of ['title','summary','exampleTitle','example','termsTitle','diagnosticsTitle']){
    assert.ok(f.guide[field]?.trim(),`${stack}/${stage.id} needs help ${field}`);
   }
  }
 }
});

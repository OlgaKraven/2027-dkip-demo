import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {test} from 'node:test';
import {stagesFor} from '../content/course.mjs';
import {pdfFiles,pdfManifest,isCurrentPresentationPdf} from '../scripts/presentation-pdf.mjs';
import '../site/deck-data.js';

const decks=globalThis.TEACHER_DECKS;

test('teacher decks include the official conditions and all steps for both routes',()=>{
  const official=JSON.parse(readFileSync('content/kim-assignments.json','utf8'));
  for(const stack of ['mysql','postgresql']){
    const deck=decks[stack];
    const steps=deck.slides.filter(slide=>slide.stepKey&&slide.kind==='step');
    for(const stage of stagesFor(stack)){
      const paragraphs=deck.slides.filter(x=>x.chapter===stage.id).flatMap(x=>x.paragraphs||[]);
      assert.deepEqual(paragraphs,official[stage.id]?.paragraphs||[]);
      stage.steps.forEach((source,i)=>{
        const stepKey=stage.id+':'+(i+1);
        const slides=steps.filter(slide=>slide.stepKey===stepKey);
        assert.ok(slides.some(slide=>slide.title===source.title));
        assert.deepEqual(slides.flatMap(slide=>slide.actions||[]),source.actions);
        assert.ok(slides.some(slide=>slide.check===source.check));
        for(const block of source.codeBlocks||[]){
          assert.ok(deck.slides.some(slide=>slide.stepKey===stepKey&&slide.kind==='code'&&slide.eyebrow.includes(block.label)));
        }
      });
    }
  }
});

test('teacher decks include their own downloads and desktop states',()=>{
  for(const stack of Object.keys(pdfFiles)){
    const deck=decks[stack];
    const example=deck.slides.filter(slide=>slide.chapter==='example');
    const desktopFiles=example.flatMap(x=>x.image?.file||[]).filter(file=>file.includes('/m4-'));
    assert.deepEqual(desktopFiles.map(file=>file.split('?')[0]),['m4-student.png','m4-admin.png'].map(name=>'materials/screenshots/'+stack+'/'+name));
    const links=deck.slides.flatMap(slide=>(slide.links||[]).map(([,href])=>href));
    assert.deepEqual([...new Set(links.filter(href=>href.startsWith('downloads/dkip2027-')))],['downloads/dkip2027-'+stack+'.zip']);
    for(const slide of deck.slides){
      if(slide.image)assert.ok(existsSync('site/'+slide.image.file.split('?')[0]),slide.image.file);
    }
    for(const href of links)assert.ok(existsSync('site/'+href.split('#')[0]),href);
    const puzzle=stagesFor(stack).find(stage=>stage.id==='M4').steps.findIndex(step=>step.linkId==='puzzle-swap');
    const states=deck.slides.filter(slide=>slide.stepKey==='M4:'+(puzzle+1)&&slide.image);
    assert.deepEqual(states.map(slide=>slide.image.file.split('?')[0]),['first','second'].map(click=>
      'materials/screenshots/'+stack+'/puzzle-'+click+'-click.png'));
  }
});

test('section links land on the first actual M4 slide of their group',()=>{
  for(const stack of Object.keys(pdfFiles)){
    const deck=decks[stack];
    const steps=stagesFor(stack).find(stage=>stage.id==='M4').steps;
    const chapter=deck.chapters.find(chapter=>chapter.id==='M4');
    assert.ok(chapter.sections.some(section=>section.label==='SQL-запросы'));
    for(const {label,index} of chapter.sections){
      const step=steps.findIndex(step=>step.group===label);
      assert.equal(deck.slides[index].stepKey,'M4:'+(step+1));
      assert.equal(deck.slides.findIndex(slide=>slide.stepKey==='M4:'+(step+1)),index);
      assert.ok(deck.slides.some(slide=>slide.rows?.some(row=>row[0]===label&&row[2]===index)));
    }
  }
});

test('both published PDFs match their presentation and reject stale or swapped files',()=>{
  const records=JSON.parse(readFileSync(pdfManifest,'utf8'));
  const files=Object.entries(pdfFiles).map(([stack,file])=>[stack,readFileSync('site/'+file)]);
  for(const [stack,pdf] of files){
    const deck=decks[stack], record=records[stack];
    assert.ok(isCurrentPresentationPdf({deck,pdf,record}),`Stale PDF for ${stack}; run npm run export:pdf, then npm run build`);
    const changed={...deck,slides:deck.slides.map((slide,i)=>i===0?{...slide,title:slide.title+'!'}:slide)};
    assert.equal(isCurrentPresentationPdf({deck:changed,pdf,record}),false);
    assert.equal(isCurrentPresentationPdf({deck,pdf:files.find(([other])=>other!==stack)[1],record}),false);
  }
});

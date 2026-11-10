import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {test} from 'node:test';
import {stagesFor} from '../content/course.mjs';
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
  for(const [stack,pdf] of [['mysql','winforms'],['postgresql','wpf']]){
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
    assert.match(readFileSync('site/materials/presentation-dkip2027-'+pdf+'.pdf').subarray(0,5).toString(),/^%PDF-/);
  }
});

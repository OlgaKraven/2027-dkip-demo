import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {test} from 'node:test';
import {stagesFor} from '../content/course.mjs';
import '../site/deck-data.js';

const deck=globalThis.TEACHER_DECK;

test('teacher deck includes the official conditions and every Windows Forms route step',()=>{
  const official=JSON.parse(readFileSync('content/kim-assignments.json','utf8'));
  const steps=deck.slides.filter(slide=>slide.stepKey&&slide.kind==='step');
  for(const stage of stagesFor('mysql')){
    const paragraphs=deck.slides.filter(x=>x.chapter===stage.id).flatMap(x=>x.paragraphs||[]);
    assert.deepEqual(paragraphs,official[stage.id]?.paragraphs||[]);
    stage.steps.forEach((source,i)=>{
      const slides=steps.filter(slide=>slide.stepKey===stage.id+':'+(i+1));
      assert.ok(slides.some(slide=>slide.title===source.title));
      assert.deepEqual(slides.flatMap(slide=>slide.actions||[]),source.actions);
      assert.ok(slides.some(slide=>slide.check===source.check));
    });
  }
});

test('teacher deck includes runnable-example downloads and the actual desktop states',()=>{
  const example=deck.slides.filter(slide=>slide.chapter==='example');
  assert.deepEqual(example.flatMap(x=>x.image?.file||[]).filter(file=>file.includes('/m4-')).map(file=>file.split('/').at(-1).split('?')[0]),['m4-student.png','m4-admin.png']);
  for(const slide of deck.slides){
    if(slide.image)assert.ok(existsSync('site/'+slide.image.file.split('?')[0]),slide.image.file);
    for(const [,href] of slide.links||[])assert.ok(existsSync('site/'+href.split('#')[0]),href);
  }
  assert.match(readFileSync('site/materials/presentation-dkip2027-winforms.pdf').subarray(0,5).toString(),/^%PDF-/);
});

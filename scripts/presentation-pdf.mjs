import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

export const pdfFiles={
  mysql:'materials/presentation-dkip2027-winforms.pdf',
  postgresql:'materials/presentation-dkip2027-wpf.pdf',
};
export const pdfManifest='content/presentation-pdfs.json';
export const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const normalize=value=>value.replaceAll('\r\n','\n');
const textInputs=['core.js','deck.html','deck.js','deck.css'];
const visualInputs=['deck-raleway.woff2','deck-wordmark.jpg','deck-mark.png','mascot-exam.png'];

function printSource(site,file) {
  const text=normalize(readFileSync(resolve(site,file),'utf8'));
  return file==='deck.html'?text.replace(/\?v=[0-9a-f]{12}(?=")/g,''):text;
}

export function presentationFingerprint(deck,site='site') {
  const {slides,...metadata}=deck;
  const publicSlides=slides.map(({note,...slide})=>slide);
  const content=JSON.stringify({...metadata,slides:publicSlides},(_,value)=>typeof value==='string'?normalize(value):value);
  const images=[...new Set(slides.flatMap(slide=>slide.image?[slide.image.file.split('?')[0]]:[]))].sort();
  const inputs=[
    ...textInputs.map(file=>[file,sha256(printSource(site,file))]),
    ...[...visualInputs,...images].map(file=>[file,sha256(readFileSync(resolve(site,file)))]),
  ];
  return sha256(JSON.stringify({content,inputs}));
}

export function isCurrentPresentationPdf({deck,pdf,record,site}) {
  return pdf.subarray(0,5).toString()==='%PDF-'
    && record?.presentation===presentationFingerprint(deck,site)
    && record.pdf===sha256(pdf);
}

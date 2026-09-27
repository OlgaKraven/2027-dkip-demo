import assert from 'node:assert/strict';import fs from 'node:fs';const results=[];
for(const [stack,port] of [['mysql',5271],['postgresql',5272]]){
 for(const [path,status] of [['/notes',200],['/api/notes',200],['/notes?user_id=2',200],['/notes?user_id=abc',400],['/notes?user_id=0',400],['/notes?user_id=1&user_id=2',400],['/notes?extra=x',400],['/notes?user_id=2147483647',200]]){
  const r=await fetch(`http://127.0.0.1:${port}${path}`);assert.equal(r.status,status,path);assert.match(r.headers.get('content-type'),/application\/json/);const data=await r.json();
  if(path==='/notes'){assert.equal(data.length,5);assert.deepEqual(Object.keys(data[0]),['id','title_user','content','formatted_date']);assert.equal(data[0].title_user,'Заметка 1 - student');assert.equal(data[0].content,'Содержание заметки 1');assert.equal(data[0].formatted_date,'15.03.2027');}
  if(path.endsWith('2147483647'))assert.deepEqual(data,[]);if(path==='/notes?user_id=2')assert.equal(data.length,3);
  results.push({stack,path,status:r.status,passed:true});
 }
 const bad=await fetch(`http://127.0.0.1:${port+10}/notes`);assert.equal(bad.status,500);assert.ok((await bad.json()).error);results.push({stack,path:'separate failing DB /notes',status:500,passed:true});
 const swagger=await fetch(`http://127.0.0.1:${port}/swagger/`);assert.equal(swagger.status,200);assert.match(await swagger.text(),/SwaggerUIBundle/);
 const spec=await (await fetch(`http://127.0.0.1:${port}/openapi.json`)).json();assert.equal(spec.openapi,'3.0.3');
}
fs.writeFileSync('docs/api-results.json',JSON.stringify(results,null,2));console.log('Passed',results.length,'real HTTP scenarios across both databases.');



from pathlib import Path
import json,zipfile
from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime
from hashlib import sha256
import argparse
import re
import runpy
from PIL import Image
parser=argparse.ArgumentParser()
parser.add_argument("--report",type=Path)
args=parser.parse_args()
results=[]
import openpyxl
root=Path(__file__).resolve().parents[1]
variants=json.loads((root/'content/variants.json').read_text(encoding='utf8'))
previews=json.loads((root/'content/variant-previews.json').read_text(encoding='utf8'))
site_data=json.loads((root/'site/content.js').read_text(encoding='utf8').removeprefix('globalThis.COURSE=').removesuffix(';'))
assert site_data['variants']==variants
assert len({variant['id'] for variant in variants})==30
workbook_preview=runpy.run_path(str(root/'scripts/prepare-materials.py'))['workbook_preview']
tile_hashes=set()
for v in variants:
 p=root/'content/variants'/v['id']
 order=openpyxl.load_workbook(p/'Заказ покупателя.xlsx',data_only=True).active
 spec=openpyxl.load_workbook(p/'Спецификация.xlsx',data_only=True).active
 prices=openpyxl.load_workbook(p/'Цены.xlsx',data_only=True).active
 production=openpyxl.load_workbook(p/'Заказ на производство.xlsx',data_only=True).active
 customers=json.loads((p/'Заказчики.json').read_text(encoding='utf8'))
 assert customers==v['customers'],v['id']+' customers'
 assert len({c['id'] for c in customers})==6
 for c in customers:
  assert all(isinstance(c[k],str) for k in ['id','name','inn','addres','phone','type'])
  assert c['id'].startswith('0') and c['name'] and c['addres'] and c['phone']
 assert order['A3'].value==v['id']+'-01'
 assert order['A5'].value==v['brand'] and order['B5'].value==customers[0]['name']
 assert production['A3'].value==v['id']+'-P01' and production['B3'].value==order['A3'].value
 assert production['A5'].value==v['product'] and production['B5'].value==v['qty']
 assert spec['B2'].value==v['product']
 assert spec.max_row==len(v['resources'])+3
 assert prices.max_row==len(v['resources'])+2
 assert production.max_row==len(v['resources'])+6
 assert len({r['name'] for r in v['resources']})==len(v['resources'])
 assert order['D3'].value==v['customers'][0]['id']
 assert order['A7'].value==v['product'] and order['C7'].value==v['qty']
 for index,r in enumerate(v['resources']):
  assert spec.cell(index+4,1).value==r['name']
  assert spec.cell(index+4,2).value==r['kind']
  assert spec.cell(index+4,3).value==r['unit']
  assert spec.cell(index+4,4).value==r['norm']
  assert spec.cell(index+4,5).value==(r['time'] if r['kind']=='operation' else None)
  assert prices.cell(index+3,3).value==r['unit']
  assert prices.cell(index+3,4).value<=order['B3'].value
  assert production.cell(index+7,1).value==r['name']
  assert production.cell(index+7,3).value==r['unit']
  assert r['kind'] in ['material','operation'] and r['norm']>0 and r['price']>0 and r['time']>0
  assert prices.cell(index+3,1).value==r['name']
  assert prices.cell(index+3,2).value==r['price']
  expected=Decimal(str(v['qty']))*Decimal(str(r['norm']))*Decimal(str(r['time'] if r['kind']=='operation' else 1))
  assert abs(Decimal(str(production.cell(index+7,2).value))-expected)<Decimal('0.0000001')
 assert json.loads((p/'Заметки.json').read_text(encoding='utf8'))==v['notes']
 assert len(v['notes'])==5
 assert len(v['tasks'])==6
 _, database_task, cost_task, app_task, api_task, docs_task=(task['text'] for task in v['tasks'])
 assert order['A3'].value in database_task and production['A3'].value in database_task
 assert order['A3'].value in cost_task and v['product'] in cost_task
 assert '1.png–4.png' in app_task
 assert all(login in app_task for login in {note['login'] for note in v['notes']})
 assert all(name in api_task for name in ['Заметки.json','users.id','created_date','created_at','user_id=abc'])
 assert all(name in docs_task for name in ['DOCX','OpenAPI','user_id'])
 for note in v['notes']:
  assert set(note)=={'title','login','content','created_date'}
  assert note['login'] in {'manager','technologist','master'}
  assert note['title'] and note['content']
  datetime.strptime(note['created_date'],'%Y-%m-%d')
 total=sum(Decimal(str(production.cell(i+7,2).value))*Decimal(str(prices.cell(i+3,2).value)) for i in range(len(v['resources'])))
 formula=sum(Decimal(str(v['qty']))*Decimal(str(r['norm']))*Decimal(str(r['time'] if r['kind']=='operation' else 1))*Decimal(str(r['price'])) for r in v['resources'])
 assert abs(total-formula)<Decimal('0.000001')
 results.append({'variant':v['id'],'customers':len(customers),'resources':len(v['resources']),'notes':len(v['notes']),'cost':str(formula.quantize(Decimal('.01'),rounding=ROUND_HALF_UP))})
 public=root/'site/variant-files'/v['id']
 expected_files={}
 for file in p.iterdir():
  if file.suffix not in {'.xlsx','.json'}:
   continue
  expected_files[file.name]=file.read_bytes()
  assert (public/file.name).read_bytes()==expected_files[file.name]
  if file.suffix=='.xlsx':
   assert previews[v['id']][file.name]==workbook_preview(file),f'{v["id"]}/{file.name} preview'
 for number in range(1,5):
  name=f'{number}.png'
  tile=p/'Пазл'/name
  with Image.open(tile) as image:
   assert image.format=='PNG' and image.size==(702,702)
   assert len(image.getcolors(maxcolors=10) or ())!=1, f'{v["id"]}/{name} blank puzzle tile'
   digest=sha256(image.tobytes()).digest()
   assert digest not in tile_hashes, f'{v["id"]}/{name} duplicate puzzle tile'
   tile_hashes.add(digest)
  assert (public/'Пазл'/name).read_bytes()==tile.read_bytes()
  site_tile=site_data['variantFiles'][v['id']]['puzzle'][number-1]
  assert site_tile=={'name':name,'path':f'variant-files/{v["id"]}/Пазл/{name}?v={sha256(tile.read_bytes()).hexdigest()[:12]}'}
  expected_files[f'Приложения/Задание 4/{name}']=tile.read_bytes()
 for task in ['Задание 4','Задание 5','Задание 6']:
  for file in (root/'materials/basic'/task).glob('*'):
   if file.suffix in {'.pdf','.docx'}:
    expected_files[f'Приложения/{task}/{file.name}']=file.read_bytes()
 brief=re.sub(r'^#{1,3} ', '', (p/'Задание.md').read_text(encoding='utf8'), flags=re.MULTILINE)
 for number,task in enumerate(v['tasks'],1):
  assert f'Задание {number}\n\n{task["text"]}\n' in brief,(v['id'],number)
 expected_files['Задание.txt']=brief.encode('utf-8-sig')
 with zipfile.ZipFile(root/f'site/downloads/exam-{v["id"]}.zip') as archive:
  assert set(archive.namelist())==expected_files.keys()
  for name, data in expected_files.items():
   assert archive.read(name)==data,(v['id'],name)
 with zipfile.ZipFile(root/'site/downloads/exam-30-variants.zip') as archive:
  variant_names={name.removeprefix(v['id']+'/') for name in archive.namelist() if name.startswith(v['id']+'/')}
  assert variant_names==expected_files.keys()
  for name,data in expected_files.items():
   assert archive.read(v['id']+'/'+name)==data,(v['id'],name)
assert len(tile_hashes)==120
print('Verified 180 task texts, 30 variant archives and the combined archive, 120 workbooks and previews, 60 JSON inputs, and 120 distinct puzzle tiles.')

if args.report:
 args.report.parent.mkdir(parents=True,exist_ok=True)
 args.report.write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n',encoding='utf8')

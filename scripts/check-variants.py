from pathlib import Path
import json,zipfile
from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime
import argparse
parser=argparse.ArgumentParser()
parser.add_argument("--report",type=Path)
args=parser.parse_args()
results=[]
import openpyxl
root=Path(__file__).resolve().parents[1]
variants=json.loads((root/'content/variants.json').read_text(encoding='utf8'))
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
 for note in v['notes']:
  assert set(note)=={'title','login','content','created_date'}
  assert note['login'] in {'manager','technologist','master'}
  assert note['title'] and note['content']
  datetime.strptime(note['created_date'],'%Y-%m-%d')
 total=sum(Decimal(str(production.cell(i+7,2).value))*Decimal(str(prices.cell(i+3,2).value)) for i in range(len(v['resources'])))
 formula=sum(Decimal(str(v['qty']))*Decimal(str(r['norm']))*Decimal(str(r['time'] if r['kind']=='operation' else 1))*Decimal(str(r['price'])) for r in v['resources'])
 assert abs(total-formula)<Decimal('0.000001')
 results.append({'variant':v['id'],'customers':len(customers),'resources':len(v['resources']),'notes':len(v['notes']),'cost':str(formula.quantize(Decimal('.01'),rounding=ROUND_HALF_UP))})
 with zipfile.ZipFile(root/f'site/downloads/exam-{v["id"]}.zip') as z:
  for file in p.iterdir(): assert z.read(file.name)==file.read_bytes()
  for task in ['Задание 4','Задание 5','Задание 6']:
   for f in (root/'materials/basic'/task).rglob('*'):
    if f.is_file() and f.suffix!='.rar':assert z.read('Приложения/'+task+'/'+f.name)==f.read_bytes()
 with zipfile.ZipFile(root/'site/downloads/exam-30-variants.zip') as z:
  for file in p.iterdir():assert z.read(v['id']+'/'+file.name)==file.read_bytes()
print('Verified 30 archives, 120 workbooks, customer IDs, resource units/prices, production quantities and 5 notes per domain.')

if args.report:
 args.report.parent.mkdir(parents=True,exist_ok=True)
 args.report.write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n',encoding='utf8')

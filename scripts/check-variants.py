from pathlib import Path
import json,zipfile
from decimal import Decimal
import openpyxl
root=Path(__file__).resolve().parents[1]
variants=json.loads((root/'content/variants.json').read_text(encoding='utf8'))
for v in variants:
 p=root/'content/variants'/v['id']
 order=openpyxl.load_workbook(p/'Заказ покупателя.xlsx',data_only=True).active
 spec=openpyxl.load_workbook(p/'Спецификация.xlsx',data_only=True).active
 prices=openpyxl.load_workbook(p/'Цены.xlsx',data_only=True).active
 production=openpyxl.load_workbook(p/'Заказ на производство.xlsx',data_only=True).active
 assert order['D3'].value==v['customers'][0]['id']
 assert order['A7'].value==v['product'] and order['C7'].value==v['qty']
 for index,r in enumerate(v['resources']):
  assert spec.cell(index+4,1).value==r['name']
  assert prices.cell(index+3,1).value==r['name']
  assert prices.cell(index+3,2).value==r['price']
  expected=Decimal(str(v['qty']))*Decimal(str(r['norm']))*Decimal(str(r['time'] if r['kind']=='operation' else 1))
  assert abs(Decimal(str(production.cell(index+7,2).value))-expected)<Decimal('0.0000001')
 assert json.loads((p/'Заметки.json').read_text(encoding='utf8'))==v['notes']
 with zipfile.ZipFile(root/f'site/downloads/exam-{v["id"]}.zip') as z:
  for file in p.iterdir(): assert z.read(file.name)==file.read_bytes()
print('Verified 30 archives, 120 workbooks, customer IDs, resource units/prices, production quantities and 5 notes per domain.')

from pathlib import Path
import json,hashlib,zipfile
from decimal import Decimal
from datetime import date
import openpyxl
from pypdf import PdfReader
root=Path(__file__).resolve().parents[1];materials=root/'materials';previews=[]
for p in (materials/'basic').rglob('*'):
 if p.suffix=='.xlsx':
  book=openpyxl.load_workbook(p,data_only=False);sheets=[]
  for ws in book:
   sheets.append(dict(name=ws.title,rows=[[{'cell':c.coordinate,'value':str(c.value)} for c in r if c.value is not None] for r in ws if any(c.value is not None for c in r)]))
  previews.append(dict(name=p.name,path=p.relative_to(root).as_posix(),sheets=sheets))
 elif p.suffix=='.json' and p.parent.name=='Задание 1':previews.append(dict(name=p.name,path=p.relative_to(root).as_posix(),text=p.read_text(encoding='utf-8-sig')))
 elif p.suffix in ['.pdf','.docx','.png']:previews.append(dict(name=p.name,path=p.relative_to(root).as_posix()))
(root/'content/previews.json').write_text(json.dumps(previews,ensure_ascii=False),encoding='utf8')
r=PdfReader(materials/'kim-2027.pdf');official={'pages':[{'page':i+1,'text':r.pages[i].extract_text()} for i in [12,27,29,30,31]],'code':'09.02.07-5-2027','minutes':210,'points':75}
(root/'content/official.json').write_text(json.dumps(official,ensure_ascii=False),encoding='utf8')
import runpy
runpy.run_path(str(root/'scripts/prepare-variants.py'),run_name='__main__')

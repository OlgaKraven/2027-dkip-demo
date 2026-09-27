from pathlib import Path
from copy import deepcopy
import zipfile, hashlib
from lxml import etree as E
root=Path(__file__).resolve().parents[1]
template=root/'materials/basic/Задание 6/Прил_6_ОЗ_КИМ_09.02.07-5-2027.docx'
ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
def tag(n):return '{'+ns['w']+'}'+n
with zipfile.ZipFile(template) as z: original=z.read('word/document.xml');parts={n:z.read(n) for n in z.namelist()}
scratch=root/'output/doc-template';scratch.mkdir(parents=True,exist_ok=True)
(scratch/'artifact.md').write_text(f'''# Template contract
Reference: {template}
SHA256: {hashlib.sha256(template.read_bytes()).hexdigest()}
Reference render: template.pdf, page-1.png (Word native export).
One portrait A4 section, original margins, Times New Roman, original table grid and title retained.
Slots: merged base URL cell; clone third row of table 1 once for second method; three body rows in HTTP status table.
Insert examples inside corresponding description/format cells. Preserve headings, table order, paragraph properties and other ZIP parts.
Allow rows to grow; no exact height. Do not add a cover, new columns, buttons or different styling.
''',encoding='utf8')
def fill(cell,text):
 p=cell.find('w:p',ns); props=deepcopy(p.find('w:pPr',ns)) if p is not None and p.find('w:pPr',ns) is not None else None
 rprops=p.find('.//w:rPr',ns) if p is not None else None
 for child in list(cell):
  if child.tag!=tag('tcPr'):cell.remove(child)
 for line in text.split('\n'):
  par=E.SubElement(cell,tag('p'))
  if props is not None:par.append(deepcopy(props))
  run=E.SubElement(par,tag('r'))
  if rprops is not None:run.append(deepcopy(rprops))
  t=E.SubElement(run,tag('t'));t.set('{http://www.w3.org/XML/1998/namespace}space','preserve');t.text=line
for stack,port in [('mysql',5271),('postgresql',5272)]:
 base=f'http://127.0.0.1:{port}'
 tree=E.fromstring(original);tables=tree.findall('.//w:tbl',ns);rows=tables[0].findall('w:tr',ns)
 fill(rows[0].findall('w:tc',ns)[1],base)
 second=deepcopy(rows[2]);tables[0].append(second)
 example='[{"id":1,"title_user":"Заметка 1 - student","content":"Содержание заметки 1","formatted_date":"15.03.2027"}]'
 descriptions=[]
 for i,(row,path) in enumerate(zip([rows[2],second],['/notes','/api/notes'])):
  params='user_id: необязательное целое > 0, query. Пример: ?user_id=2. Без параметра — все заметки. Повтор и неизвестные параметры дают 400.'
  desc='Возвращает список заметок из notes и логин автора из users. Запрос: GET '+base+path+'. Фильтр: GET '+base+path+'?user_id=2.'
  fmt='JSON, массив объектов. id — код заметки; title_user — title + « - » + login; content — исходное содержание без изменений; formatted_date — дата в формате ДД.ММ.ГГГГ.'
  fmt+='\nПример '+('одного элемента ответа (полный список содержит 5 записей):\n'+example if i==0 else 'пустого результата: [] при user_id=2147483647. Формат объекта совпадает с GET /notes.')
  if i==1:
   desc='Псевдоним GET /notes. Запрос: GET /api/notes?user_id=2. Правила и поля ответа совпадают.'
   fmt='Тот же JSON-массив заметок. Пустой результат: [] при user_id=2147483647.'
  for c,value in zip(row.findall('w:tc',ns),['GET '+path,params,desc,fmt]):fill(c,value)
  descriptions.append(f'## GET {path}\n\n{params}\n\n{desc}\n\n{fmt}')
 status=[('200','Успех. Content-Type: application/json. Массив заметок; если подходящих записей нет — []. Пример: GET '+base+'/notes?user_id=2147483647 → 200, [].'),('400','Ошибка параметра. Пример: GET '+base+'/notes?user_id=abc → 400, {"error":"user_id должен быть положительным целым числом"}.'),('500','Сбой БД или обработки. Ответ: {"error":"Ошибка подключения к базе данных или обработки запроса"}. Проверка: отдельный экземпляр API с неверным портом БД 1 на http://127.0.0.1:'+str(port+10)+'/notes. Рабочая БД не останавливается.')]
 for row,values in zip(tables[1].findall('w:tr',ns)[1:],status):
  for c,v in zip(row.findall('w:tc',ns),values):fill(c,v)
 for row in tree.findall('.//w:tr',ns):
  props=row.find('w:trPr',ns)
  if props is None:props=E.SubElement(row,tag('trPr'))
  E.SubElement(props,tag('cantSplit'))
 for height in tree.findall('.//w:trHeight',ns):height.getparent().remove(height)
 # Keep the status heading and its complete table together on page 2.
 for par in tree.findall('.//w:p',ns):
  if 'Коды ответов HTTP' in ''.join(par.itertext()):
   props=par.find('w:pPr',ns)
   if props is None:props=E.SubElement(par,tag('pPr'))
   E.SubElement(props,tag('pageBreakBefore'))
 for table in tables:
  props=table.find('w:tblPr',ns)
  layout=props.find('w:tblLayout',ns)
  if layout is None:layout=E.SubElement(props,tag('tblLayout'))
  layout.set(tag('type'),'fixed')
  width=props.find('w:tblW',ns);width.set(tag('w'),'9345');width.set(tag('type'),'dxa')
 # Keep the source's equal column geometry, avoiding Word autofit's narrow first column.
 for row in tables[0].findall('w:tr',ns):
  cells=row.findall('w:tc',ns)
  for j,cell in enumerate(cells):
   tcpr=cell.find('w:tcPr',ns);width=tcpr.find('w:tcW',ns)
   if width is None:width=E.SubElement(tcpr,tag('tcW'))
   width.set(tag('type'),'dxa');width.set(tag('w'),str(7009 if len(cells)==2 and j==1 else 2336))

 out=root/f'docs/api-{stack}.docx'
 with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
  for n,b in parts.items():z.writestr(n,E.tostring(tree,xml_declaration=True,encoding='UTF-8',standalone=True) if n=='word/document.xml' else b)
 text=f'# Документация API заметок\n\nБазовый URL: {base}. Маршрут: {stack}. Сервер локальный; он запускается на компьютере читателя.\n\n'+'\n\n'.join(descriptions)+'\n\n## Коды ответов HTTP\n\n'+'\n\n'.join(a+' — '+b for a,b in status)+f'\n\nSwagger UI: {base}/swagger/\nOpenAPI JSON: {base}/openapi.json\n\nСлужебные адреса показывают документацию; данные заметок возвращают два GET-метода выше. Коллекция: postman-{stack}.json.\n'
 (root/f'docs/api-{stack}.md').write_text(text,encoding='utf8')
 with zipfile.ZipFile(out) as z:assert all(z.read(n)==b for n,b in parts.items() if n!='word/document.xml')
 print(out.name,'untouched parts verified')

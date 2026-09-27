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
names=['Стол «Берёза»','Стул «Ладога»','Комод «Север»','Полка «Вектор»','Тумба «Линия»','Шкаф «Кедр»','Стеллаж «Ритм»','Банкетка «Лён»','Стол «Квартал»','Стул «Парус»','Комод «Контур»','Полка «Арка»','Тумба «Орион»','Шкаф «Сосна»','Стеллаж «Модуль»','Банкетка «Волна»','Стол «Грань»','Стул «Лист»','Комод «Плато»','Полка «Каскад»','Тумба «Атлас»','Шкаф «Роща»','Стеллаж «Сетка»','Банкетка «Точка»','Стол «Круг»','Стул «Маяк»','Комод «Фасет»','Полка «Кромка»','Тумба «Такт»','Шкаф «Горизонт»']
variants=[];vf=root/'content/variants';vf.mkdir(exist_ok=True)
for i,name in enumerate(names,1):
 vid=f'V{i:02}';p=vf/vid;p.mkdir(exist_ok=True);qty=i%7+2
 resources=[{'name':n,'kind':k,'unit':u,'norm':norm,'time':time,'price':float(Decimal(str(price))+i*3)} for n,k,u,norm,time,price in [('Панель','material','шт',2,1,240),('Крепёж','material','упак',0.25,1,180),('Опора','material','шт',4,1,95),('Сборка','operation','ч',1,0.75,900),('Обработка','operation','ч',1,1.25,620)]]
 customers=[{'id':f'{i:03}{j:06}','name':f'Заказчик {vid}-{j}','inn':'','addres':f'Учебный город {i}, улица Мебельная, {j}','phone':f'+7999{i:03}{j:04}','type':'Покупатель'} for j in range(1,7)]
 (p/'Заказчики.json').write_text(json.dumps(customers,ensure_ascii=False,indent=2),encoding='utf8')
 def book(filename,rows):
  w=openpyxl.Workbook();ws=w.active;ws.title='Данные'
  for row in rows:ws.append(row)
  for col in ws.columns:ws.column_dimensions[col[0].column_letter].width=30
  for c in ws[1]:c.font=openpyxl.styles.Font(bold=True)
  w.save(p/filename)
 book('Заказ покупателя.xlsx',[['Авторский учебный вариант',vid],['Изделие','Количество','Заказчик','Дата'],[name,qty,customers[0]['name'],'2027-03-15']])
 book('Спецификация.xlsx',[['Продукция',name,'Норма на 1 изделие'],['Ресурс','Вид','Единица','Количество','Норма времени']]+[[x['name'],x['kind'],x['unit'],x['norm'],x['time']] for x in resources])
 book('Цены.xlsx',[['Ресурс','Цена за единицу','Действует с']]+[[x['name'],x['price'],'2027-03-01'] for x in resources])
 book('Заказ на производство.xlsx',[['Продукт','Количество','Дата запуска'],[name,qty,'2027-03-16'],['Ресурс','Количество','Единица']]+[[x['name'],qty*x['norm']*(x['time'] if x['kind']=='operation' else 1),x['unit']] for x in resources])
 common=f'Авторский учебный вариант {vid}. Мебельная мастерская производит {name}. Заказ: {qty} изделий. Нормы даны на 1 изделие, тарифы операций — за час. Используйте приложенные документы и JSON. Задания: 1) ER в 3НФ и PDF; 2) БД и импорт; 3) нормативная стоимость; 4) вход с пазлом, роли, блокировка и управление пользователями; 5) API заметок и тестовая коллекция; 6) документация по шаблону. Требования к 4–6 соответствуют приложениям БУ. 210 минут. Не официальный вариант экзамена.'
 (p/'Задание.md').write_text('# '+vid+' · '+name+'\n\n'+common,encoding='utf8')
 variants.append(dict(id=vid,number=i,brand=name,common=common,qty=qty,resources=resources,customers=customers))
(root/'content/variants.json').write_text(json.dumps(variants,ensure_ascii=False),encoding='utf8')
print('Source previews and 30 complete document sets prepared.')

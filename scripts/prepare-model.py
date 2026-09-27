"""Generate both SQL dialects and field-level teaching data from one declared model."""
from pathlib import Path
import json, re
root=Path(__file__).resolve().parents[1]
tables=[]
def table(id,title,why,source,fields):
    out=[]
    for line in fields.strip().split('\n'):
        name,typ,caption,origin=line.split('|')
        pk=name=='id' or '*' in typ
        fk=re.search(r'REF ([a-z_]+)',typ)
        out.append(dict(id=name,type=typ.replace('*',''),title=caption,pk=pk,fk=bool(fk),nullable='NULLABLE' in typ,unique='UNIQUE' in typ,kind='Решение модели' if origin.startswith('Техническое') else 'Источник',why=origin,file=source if not origin.startswith('Техническое') else None,location=origin,value=caption))
    tables.append(dict(id=id,title=title,why=why,fields=out))
table('counterparty','Контрагенты','Контакты и тип организации хранятся один раз, независимо от числа заказов.','Заказчики.json','''
id|VARCHAR(32)|Код контрагента|JSON: id; сохраняем ведущие нули. DOC-CUSTOMER и DOC-MAKER — отдельные дополнения по документам.
name|VARCHAR(255)|Наименование|JSON: name; наименование организации.
inn|VARCHAR(20)|ИНН|JSON: inn; текст, пустое значение сохраняется.
address|VARCHAR(500)|Адрес|JSON: addres → address; исходное написание значения сохраняется.
phone|VARCHAR(64)|Телефон|JSON: phone; знак + не теряется.
party_type|VARCHAR(24)|Тип контрагента|JSON: type; Покупатель или Поставщик. Для изготовителя — дополнительное значение Производитель.
''')
table('item','Номенклатура','Продукт, материал и операция имеют название, единицу и цену. Вид отличает их назначение.','Заказ на производство.xlsx','''
id|IDENTITY|Код записи|Техническое: внутренний числовой ключ не зависит от кода в документе.
code|VARCHAR(64) UNIQUE|Код номенклатуры|S11, S17:S21, S27:S29: коды изделия, материалов и операций.
name|VARCHAR(255)|Наименование|D11, D17:D21, D27:D29: названия из строк документа.
kind|VARCHAR(16)|Вид|Разделы B7, B13, B23 → product, material, operation; коды значений выбраны разработчиком.
unit|VARCHAR(16)|Единица измерения|AD11, AD17:AD29; расхождения для евровинта и опоры согласованы со Спецификацией, см. допущения.
''')
table('price','Цены','Стоимость ресурса отделена от количества и нормы расхода.','Цены.xlsx','''
item_id|INT* REF item|Номенклатура|A2:A9: находим ресурс по наименованию и сохраняем FK → item.id.
valid_from|DATE*|Действует с|Техническое: даты цены в файле нет; дата 2026-04-01 — учебное допущение. Составной PK с item_id.
amount|DECIMAL(14,2)|Цена|D2:D9: 595; 95; 140; 245; 450; 1400; 3250; 950. Для операций тариф принят за час.
''')
table('specification','Спецификации','Одна действующая спецификация описывает состав одной единицы продукта.','Спецификация.xlsx','''
id|IDENTITY|Код записи|Техническое: первичный ключ спецификации.
product_id|INT UNIQUE REF item|Продукция|D4: Стол кухонный Самобранка → item.id; UNIQUE — одна спецификация в учебной модели.
name|VARCHAR(255)|Название|B2: название спецификации.
output_qty|DECIMAL(14,3)|Выход продукции|Техническое: принимаем нормы на одну единицу изделия, output_qty=1.
manufacturer_id|VARCHAR(32) REF counterparty|Изготовитель|D6: ООО ТД Вершина; отдельная запись DOC-MAKER, поскольку в JSON её нет.
''')
table('specification_component','Состав спецификации','Связующая таблица хранит нормы материалов и операций без повторения их цен.','Спецификация.xlsx','''
specification_id|INT* REF specification|Спецификация|Техническое: FK на шапку; вместе с item_id образует составной первичный ключ.
item_id|INT* REF item|Материал / операция|B10:B14, B19:B21: ссылка на номенклатуру из строки состава.
qty|DECIMAL(14,3)|Количество|L10:L14 и L19:L21: норма количества на единицу выпуска.
time_norm|DECIMAL(14,3)|Норма времени|J19:J21: 0,75; 1,5; 0,5. Для материалов множитель 1 — техническая нейтральная величина.
''')
table('customer_order','Заказы покупателей','Реквизиты шапки относятся ко всему заказу, строки хранятся отдельно.','Заказ покупателя.xlsx','''
id|IDENTITY|Код записи|Техническое: внутренний идентификатор заказа.
doc_no|VARCHAR(64) UNIQUE|Номер|B3: номер 1 из заголовка документа.
doc_date|DATE|Дата|B3: 22.04.2026; это исходная дата в комплекте 2027.
customer_id|VARCHAR(32) REF counterparty|Заказчик|F7: ИП Томилин Александр Сергеевич; запись DOC-CUSTOMER дополняет JSON.
executor_id|VARCHAR(32) REF counterparty|Исполнитель|F5: ООО ТД Вершина → контрагент DOC-MAKER.
''')
table('customer_order_line','Строки заказа','Повторяющиеся позиции документа становятся отдельными записями, без списков в одной ячейке.','Заказ покупателя.xlsx','''
id|IDENTITY|Код строки|Техническое: уникальный идентификатор строки.
order_id|INT REF customer_order|Заказ|Техническое: FK связывает строку со шапкой документа.
product_id|INT REF item|Продукция|D11: Стол кухонный Самобранка → item.id; согласование двух кодов объяснено в допущениях.
source_code|VARCHAR(64)|Код в заказе|P11: ФР-00000034; сохраняем код именно этого документа.
qty|DECIMAL(14,3)|Количество|S11: 2 единицы продукции.
sale_price|DECIMAL(14,2)|Цена продажи|X11: 14120; это продажная цена, а не себестоимость.
discount|DECIMAL(14,2)|Скидка строки|AA11: 1412; в примере скидка на всю строку: 2×14120−1412=26828.
''')
table('production_order','Заказы на производство','Документ фиксирует план производства; не выдаём план за фактический выпуск.','Заказ на производство.xlsx','''
id|IDENTITY|Код записи|Техническое: ключ заказа на производство.
doc_no|VARCHAR(64) UNIQUE|Номер|B3: номер 1.
doc_date|DATE|Дата документа|B3: 23.04.2026.
launch_date|DATE|Дата запуска|G5: 23.04.2026.
department|VARCHAR(255)|Подразделение|W5: Основное подразделение; других атрибутов подразделения источник не содержит.
''')
table('production_product','Продукция к выпуску','План выпуска связывает документ с продуктами и количеством.','Заказ на производство.xlsx','''
production_id|INT* REF production_order|Заказ на производство|Техническое: FK на шапку; часть составного PK.
product_id|INT* REF item|Продукт|D11 и S11: Самобранка, НФ-00000006 → item.id.
qty|DECIMAL(14,3)|Количество|X11: 2; плановый выпуск.
''')
table('production_resource','План ресурсов','Сохраняем строки плана, включая исходные единицы, отдельно от нормативного расчёта.','Заказ на производство.xlsx','''
production_id|INT* REF production_order|Заказ на производство|Техническое: FK на шапку плана.
item_id|INT* REF item|Ресурс|S17:S21, S27:S29: материал или операция из справочника.
qty|DECIMAL(14,3)|Количество по документу|X17:X21, X27:X29: плановое количество, не подмена норм спецификации.
source_unit|VARCHAR(16)|Единица в документе|AD17:AD21, AD27:AD29: сохраняем исходные единицы даже при расхождении со спецификацией.
''')
table('users','Пользователи','Учётные записи и блокировки из задания 4 не являются заказчиками производства.','Приложение 1.pdf','''
id|IDENTITY|Код пользователя|Техническое: стабильный первичный ключ учётной записи.
login|VARCHAR(64) UNIQUE|Логин|Задание 4: логин обязателен, дубликаты запрещены.
password_hash|VARCHAR(255)|Хеш пароля|Техническое: PBKDF2 с солью вместо открытого пароля.
role|VARCHAR(16)|Роль|Задание 4: Администратор и Пользователь → admin/user.
failed_attempts|INT|Неудачные попытки|Задание 4: три неверных пароля или пазла подряд вызывают блокировку.
is_locked|BOOLEAN|Блокировка|Задание 4: блокировку снимает администратор.
''')
table('notes','Заметки','Задание 5: каждая заметка относится к пользователю; API получает логин через JOIN.','Прил_5_ОЗ_КИМ_09.02.07-5-2027.pdf','''
id|IDENTITY|Код заметки|Приложение 2, стр. 1: Id — первичный ключ.
title|VARCHAR(255)|Заголовок|Приложение 2: Title; title_user вычисляется только в ответе API.
content|TEXT|Содержание|Приложение 2: Content передаётся без изменений.
id_user|INT REF users|Автор|Приложение 2: Id_user — внешний ключ на users.id.
created_at|DATE|Дата создания|Приложение 2: created_at; формат ДД.ММ.ГГГГ создаётся при выдаче JSON.
''')
links=[]
for t in tables:
 for f in t['fields']:
  m=re.search(r'REF ([a-z_]+)',f['type'])
  if m:links.append(dict(**{'from':t['id']},field=f['id'],to=m[1],target='id',cardinality='1 : 0..1' if f['unique'] else '1 : N'))
for stack in ['mysql','postgresql']:
 folder=root/'examples'/stack/'Sql';folder.mkdir(parents=True,exist_ok=True)
 statements=['-- Новая пустая база dkip2027_course. Только ГИА БУ 09.02.07-5-2027.']
 for t in tables:
  rows=[]
  for f in t['fields']:
   typ=re.sub(r' REF \w+','',f['type']).replace('NULLABLE','').replace('IDENTITY','INT AUTO_INCREMENT' if stack=='mysql' else 'INT GENERATED BY DEFAULT AS IDENTITY')
   rows.append(' '+f['id']+' '+typ+' NOT NULL')
  rows.append(' PRIMARY KEY ('+','.join(f['id'] for f in t['fields'] if f['pk'])+')')
  for l in links:
   if l['from']==t['id']:rows.append(f" FOREIGN KEY ({l['field']}) REFERENCES {l['to']}({l['target']})")
  for f in t['fields']:
   if f['id'] in ['qty','time_norm','output_qty']:rows.append(f" CHECK ({f['id']}>0)")
   if f['id'] in ['amount','sale_price','discount','failed_attempts']:rows.append(f" CHECK ({f['id']}>=0)")
  if t['id']=='item':rows.append(" CHECK (kind IN ('product','material','operation'))")
  if t['id']=='users':rows.append(" CHECK (role IN ('admin','user'))")
  statements.append('CREATE TABLE '+t['id']+' (\n'+',\n'.join(rows)+'\n)'+(' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4' if stack=='mysql' else '')+';')
 query='''CREATE VIEW order_cost AS
SELECT o.id AS order_id,
 ROUND(SUM(l.qty / s.output_qty * c.qty * c.time_norm * p.amount),2) AS total_cost
FROM customer_order o
JOIN customer_order_line l ON l.order_id=o.id
JOIN specification s ON s.product_id=l.product_id
JOIN specification_component c ON c.specification_id=s.id
JOIN price p ON p.item_id=c.item_id
 AND p.valid_from=(SELECT MAX(p2.valid_from) FROM price p2
                  WHERE p2.item_id=c.item_id AND p2.valid_from<=o.doc_date)
GROUP BY o.id;
-- До расчёта проверяйте полноту норм и наличие цены каждого ресурса на дату заказа.
'''
 (folder/'01-schema.sql').write_text('\n\n'.join(statements)+'\n\n'+query,encoding='utf8')
 (folder/'03-cost.sql').write_text('SELECT * FROM order_cost WHERE order_id=1;\n-- Ожидается 14374.28 при допущениях docs/DECISIONS.md.\n',encoding='utf8')
data=dict(order=[t['id'] for t in tables],stacks={s:dict(tables=tables,links=links) for s in ['mysql','postgresql']},report=dict(why='Итог вычисляется по нормам, действующим ценам и количеству. Файл расчёта содержит расхождения; см. допущения. Нормативный итог двух столов в примере — 14 374,28.',file='Расчет стоимости.xlsx',location='D13; сравнить со Спецификацией и Ценами'))
(root/'content/model.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf8')
print('12 tables,',len(links),'relations; both SQL dialects generated.')

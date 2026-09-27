"""Vector PDF from the same verified tables and ELK routes as the course."""
from pathlib import Path
import json,math
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
root=Path(__file__).resolve().parents[1]
model=json.loads((root/'content/model.json').read_text(encoding='utf8'))['stacks']['postgresql']
layout=json.loads((root/'output/er-layout.json').read_text(encoding='utf8'))
pdfmetrics.registerFont(TTFont('Arial','C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('ArialBold','C:/Windows/Fonts/arialbd.ttf'))
W,H=layout['width']+80,layout['height']+130
c=canvas.Canvas(str(root/'materials/er.pdf'),pagesize=(W,H));c.setTitle('ДЭ 2027 — ER-схема информационной системы')
c.setFont('ArialBold',24);c.drawString(40,H-38,'ДЭ 2027 · ER-схема информационной системы')
c.setFont('Arial',13);c.drawString(40,H-64,'12 таблиц · 14 связей · PK — первичный ключ · FK — внешний ключ · стрелка FK → PK')
c.drawString(40,25,'КИМ 09.02.07-5-2027, ГИА БУ. Происхождение каждого поля и допущения — в интерактивном разборе и docs/DECISIONS.md.')
def xy(p):return p['x']+40,H-90-p['y']
# Edges are under the table fields. Arrow tips point to the referenced primary key.
c.setStrokeColorRGB(.72,.07,.16);c.setFillColorRGB(.72,.07,.16)
for edge in layout['edges']:
 link=next(l for l in model['links'] if edge['id']==l['from']+'.'+l['field'])
 for s in edge['sections']:
  pts=[xy(p) for p in [s['startPoint'],*s.get('bendPoints',[]),s['endPoint']]][::-1]
  path=c.beginPath();path.moveTo(*pts[0])
  for x,y in pts[1:]:path.lineTo(x,y)
  c.drawPath(path)
  x,y=pts[-1];a=math.atan2(y-pts[-2][1],x-pts[-2][0]);p=c.beginPath();p.moveTo(x,y)
  for delta in [-.45,.45]:p.lineTo(x-9*math.cos(a+delta),y-9*math.sin(a+delta))
  p.close();c.drawPath(p,fill=1)
  c.setFont('ArialBold',10);c.drawString(pts[0][0]-24,pts[0][1]+8,'0..1' if link['cardinality']=='1 : 0..1' else 'N');c.drawString(x+7,y+8,'1')
for node in layout['nodes']:
 table=next(t for t in model['tables'] if t['id']==node['id']);x,y=xy(node);w=node['width'];h=node['height']
 c.setFillColorRGB(1,1,1);c.setStrokeColorRGB(.65,.67,.70);c.rect(x,y-h,w,h,fill=1)
 c.setFillColorRGB(.13,.15,.19);c.rect(x,y-66,w,66,fill=1,stroke=0)
 c.setFillColorRGB(1,1,1);c.setFont('ArialBold',13);c.drawString(x+10,y-25,table['title']);c.setFont('Arial',11);c.drawString(x+10,y-46,table['id'])
 for i,f in enumerate(table['fields']):
  fy=y-66-i*44;c.setStrokeColorRGB(.88,.89,.91);c.line(x,fy-44,x+w,fy-44)
  c.setFillColorRGB(.15,.17,.2);c.setFont('ArialBold',11);c.drawString(x+9,fy-17,('PK ' if f.get('pk') else '')+('FK ' if f.get('fk') else '')+f['title'])
  c.setFont('Arial',9);c.drawString(x+9,fy-34,f['id']+' · '+f['type'])
c.showPage();c.save();print('Vector ER PDF:',W,H)

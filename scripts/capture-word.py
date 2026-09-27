from pathlib import Path
import win32com.client,win32gui,win32api,win32con,time
from PIL import ImageGrab
r=Path('.').resolve();word=win32com.client.dynamic.Dispatch('Word.Application');word.Visible=True
entries=[('materials/basic/Задание 6/Прил_6_ОЗ_КИМ_09.02.07-5-2027.docx','doc-template',None),('docs/api-mysql.docx','doc-filled','mysql'),('docs/api-postgresql.docx','doc-filled','postgresql')]
for path,name,stack in entries:
 d=word.Documents.Open(str(r/path),ReadOnly=True)
 word.ActiveWindow.View.Type=3;word.ActiveWindow.View.Zoom.Percentage=70;word.ActiveWindow.View.ShowAll=False
 h=int(word.ActiveWindow.Hwnd);win32api.keybd_event(18,0,0,0);win32api.keybd_event(18,0,2,0);win32gui.ShowWindow(h,win32con.SW_RESTORE);win32gui.MoveWindow(h,30,30,1400,940,True);win32gui.SetForegroundWindow(h);win32api.keybd_event(27,0,0,0);win32api.keybd_event(27,0,2,0);time.sleep(.7)
 for s in ([stack] if stack else ['mysql','postgresql']):ImageGrab.grab(bbox=win32gui.GetWindowRect(h)).save(str(r/'materials/screenshots'/s/(name+'.png')))
 if stack:d.ExportAsFixedFormat(str(r/f'docs/api-{stack}.pdf'),17)
 d.Close(False)
word.Quit();print('Word native pages and screenshots verified/exported')


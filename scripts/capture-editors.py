from pathlib import Path
import win32com.client,pythoncom,win32gui,win32api,win32con,time
from PIL import ImageGrab
root=Path(__file__).resolve().parents[1]
def front(hwnd):
 win32api.keybd_event(18,0,0,0);win32api.keybd_event(18,0,2,0);win32gui.ShowWindow(hwnd,win32con.SW_RESTORE);win32gui.MoveWindow(hwnd,30,30,1400,940,True);win32gui.SetForegroundWindow(hwnd);time.sleep(.45)
def capture(hwnd,path):front(hwnd);ImageGrab.grab(bbox=win32gui.GetWindowRect(hwnd)).save(str(path))
rot=pythoncom.GetRunningObjectTable();ctx=pythoncom.CreateBindCtx(0)
dte=None
for m in rot:
 if 'VisualStudio.DTE.18.0' in m.GetDisplayName(ctx,None):dte=win32com.client.dynamic.Dispatch(rot.GetObject(m).QueryInterface(pythoncom.IID_IDispatch));break
if dte is None:raise RuntimeError('Open the course project in Visual Studio first')
def retry(fn):
 for n in range(15):
  try:return fn()
  except pythoncom.com_error:time.sleep(1)
 raise RuntimeError('COM remained busy')
for stack in ['mysql','postgresql']:
 output=root/'materials/screenshots'/stack
 entries={'project':f'examples/{stack}/'+('LoginForm.cs' if stack=='mysql' else 'LoginWindow.xaml'),'connection':'examples/Shared/Database.cs','notes-code':'examples/Shared/Notes.cs','api-code':'examples/Api/Program.cs','import':'examples/Tools/Program.cs','json-source':'materials/basic/Задание 1/Заказчики.json','decisions':'docs/DECISIONS.md','db-schema':f'examples/{stack}/Sql/01-schema.sql','openapi-paths':'docs/openapi.json','openapi-schemas':'docs/openapi.json'}
 for name,file in entries.items():
  retry(lambda:dte.ItemOperations.OpenFile(str(root/file)));time.sleep(.8);capture(retry(lambda:int(dte.MainWindow.HWnd)),output/(name+'.png'));print(stack,name,flush=True)
excel=win32com.client.dynamic.Dispatch('Excel.Application');excel.Visible=True;excel.DisplayAlerts=False
for file,name in [('Заказ покупателя.xlsx','order-source'),('Спецификация.xlsx','spec-source')]:
 book=excel.Workbooks.Open(str(root/'materials/basic/Задание 1'/file),ReadOnly=True);excel.ActiveWindow.Zoom=85;excel.Range('A1').Select();time.sleep(.5)
 for stack in ['mysql','postgresql']:capture(int(excel.Hwnd),root/'materials/screenshots'/stack/(name+'.png'))
 book.Close(False)
excel.Quit()
print('Actual Visual Studio and Excel screenshots saved.')

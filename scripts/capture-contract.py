from pathlib import Path
import win32com.client,pythoncom,win32gui,win32api,time,json
from PIL import ImageGrab
r=Path('.').resolve();rot=pythoncom.GetRunningObjectTable();ctx=pythoncom.CreateBindCtx(0)
for m in rot:
 if 'VisualStudio.DTE.18.0' in m.GetDisplayName(ctx,None):dte=win32com.client.dynamic.Dispatch(rot.GetObject(m).QueryInterface(pythoncom.IID_IDispatch));break
for s in ['mysql','postgresql']:
 for name,file,needle in [('openapi-paths','docs/openapi.json','"paths"'),('openapi-schemas','docs/openapi.json','"schemas"'),('postman-import','docs/postman-'+s+'.json','"variable"')]:
  dte.ItemOperations.OpenFile(str(r/file));line=next(i+1 for i,l in enumerate((r/file).read_text(encoding='utf8').splitlines()) if needle in l);dte.ActiveDocument.Selection.GotoLine(line);dte.ActiveDocument.Selection.SelectLine();h=int(dte.MainWindow.HWnd);win32api.keybd_event(18,0,0,0);win32api.keybd_event(18,0,2,0);win32gui.SetForegroundWindow(h);win32api.keybd_event(27,0,0,0);win32api.keybd_event(27,0,2,0);time.sleep(.4);ImageGrab.grab(bbox=win32gui.GetWindowRect(h)).save(str(r/'materials/screenshots'/s/(name+'.png')))
print('Focused OpenAPI and Postman source captured')

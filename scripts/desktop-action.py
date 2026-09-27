"""Local QA helper: act on an inspected task-owned window and capture it."""
import sys,time,win32gui,win32api,win32con,win32clipboard
from PIL import ImageGrab
h=int(sys.argv[1]);action=sys.argv[2]
win32api.keybd_event(18,0,0,0);win32api.keybd_event(18,0,2,0)
win32gui.ShowWindow(h,win32con.SW_RESTORE);win32gui.SetForegroundWindow(h)
l,t,r,b=win32gui.GetWindowRect(h)
if action=='click':
 win32api.SetCursorPos((l+int(sys.argv[3]),t+int(sys.argv[4])))
 win32api.mouse_event(2,0,0,0,0);win32api.mouse_event(4,0,0,0,0)
elif action=='paste':
 win32clipboard.OpenClipboard();win32clipboard.EmptyClipboard();win32clipboard.SetClipboardText(sys.argv[3],win32con.CF_UNICODETEXT);win32clipboard.CloseClipboard()
 for key in [17,86]:win32api.keybd_event(key,0,0,0)
 for key in [86,17]:win32api.keybd_event(key,0,2,0)
elif action=='key':
 keys=[int(x) for x in sys.argv[3].split(',')]
 for key in keys:win32api.keybd_event(key,0,0,0)
 for key in keys[::-1]:win32api.keybd_event(key,0,2,0)
time.sleep(.7)
ImageGrab.grab(bbox=win32gui.GetWindowRect(h)).save(sys.argv[-1])

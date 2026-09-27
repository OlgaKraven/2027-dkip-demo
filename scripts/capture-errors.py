from pathlib import Path
from pywinauto import Desktop
from PIL import ImageGrab
import win32gui,win32api,win32con,time,sys
stack=sys.argv[1];suffix='Windows Forms / MySQL' if stack=='mysql' else 'WPF / PostgreSQL'
out=Path('materials/screenshots')/stack
w=Desktop(backend='uia').window(title='ДЭ 2027 · Авторизация · '+suffix,visible_only=True)
w.wait('visible',timeout=15);h=w.handle
win32api.keybd_event(18,0,0,0);win32api.keybd_event(18,0,2,0);win32gui.SetForegroundWindow(h)
w.child_window(auto_id='LoginInput',control_type='Edit').set_edit_text('student')
p=w.child_window(auto_id='PasswordInput',control_type='Edit');p.set_focus();p.type_keys('wrong-password',with_spaces=True)
b=w.child_window(title='Войти',control_type='Button').rectangle()
for i in range(3):
 win32api.SetCursorPos(((b.left+b.right)//2,(b.top+b.bottom)//2));win32api.mouse_event(2,0,0,0,0);win32api.mouse_event(4,0,0,0,0)
 for n in range(30):
  dialog=win32gui.FindWindow(None,'Ошибка входа')
  if dialog:break
  time.sleep(.1)
 if not dialog:raise RuntimeError('Expected login error')
 time.sleep(.25);ImageGrab.grab(bbox=win32gui.GetWindowRect(h)).save(str(out/('locked.png' if i==2 else 'login-error.png')))
 win32gui.PostMessage(dialog,win32con.WM_COMMAND,1,0);time.sleep(.3)
print(stack,'real wrong-password and persistent lock captured')

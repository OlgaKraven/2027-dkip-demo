"""Capture actual task-owned Windows application windows through UI Automation."""
from pywinauto import Desktop
from pathlib import Path
import sys,time,win32api,win32gui,win32con
stack=sys.argv[1];out=Path('materials/screenshots')/stack;out.mkdir(parents=True,exist_ok=True)
suffix='Windows Forms / MySQL' if stack=='mysql' else 'WPF / PostgreSQL'
desktop=Desktop(backend='uia');w=desktop.window(title='ДЭ 2027 · Авторизация · '+suffix);w.wait('visible',timeout=20);w.set_focus()
def snap(window,name):
 time.sleep(.35);window.capture_as_image().save(str(out/(name+'.png')))
snap(w,'login');snap(w,'puzzle')
w.child_window(auto_id='LoginInput',control_type='Edit').set_edit_text('admin')
password=w.child_window(auto_id='PasswordInput',control_type='Edit');password.set_focus();password.type_keys('Demo2027!',with_spaces=True)
for i in range(1,5):w.child_window(title='Фрагмент '+str(i),control_type='Button').invoke()
snap(w,'puzzle-solved')
b=w.child_window(title='Войти',control_type='Button').rectangle();win32api.SetCursorPos(((b.left+b.right)//2,(b.top+b.bottom)//2));win32api.mouse_event(2,0,0,0,0);win32api.mouse_event(4,0,0,0,0);info=desktop.window(title='Информация');info.wait('visible',timeout=10);snap(info,'success');win32gui.PostMessage(info.handle,win32con.WM_COMMAND,1,0)
main=desktop.window(title='ДЭ 2027 · admin · '+suffix);main.wait('visible',timeout=10);main.set_focus();main.child_window(title='Рассчитать заказ № 1',control_type='Button').invoke();snap(main,'main')
main.child_window(title='Заказчики',control_type='TabItem').select();snap(main,'customers')
main.child_window(title='Пользователи',control_type='TabItem').select();snap(main,'users')
print('Captured real login, puzzle, order, customers and users for',stack)

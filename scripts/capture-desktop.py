"""Capture actual task-owned Windows interfaces, including modal outcomes."""
from pywinauto import Desktop
from pathlib import Path
import sys,time,win32api,win32gui,win32con
stack=sys.argv[1];out=Path('materials/screenshots')/stack
suffix='Windows Forms / MySQL' if stack=='mysql' else 'WPF / PostgreSQL'
desktop=Desktop(backend='uia');w=desktop.window(title='ДЭ 2027 · Авторизация · '+suffix,visible_only=True);w.wait('visible',timeout=15);w.set_focus()
def snap(window,name):time.sleep(.3);window.capture_as_image().save(str(out/(name+'.png')))
def click(button):
 b=button.rectangle();win32api.SetCursorPos(((b.left+b.right)//2,(b.top+b.bottom)//2));win32api.mouse_event(2,0,0,0,0);win32api.mouse_event(4,0,0,0,0)
def message(expected):
 for i in range(50):
  h=win32gui.FindWindow(None,'Информация')
  if h:break
  time.sleep(.1)
 if not h:raise RuntimeError('Information dialog not shown')
 strings=[];win32gui.EnumChildWindows(h,lambda c,a:strings.append(win32gui.GetWindowText(c)),None)
 if not any(expected in s for s in strings):raise RuntimeError(str(strings))
 return h
snap(w,'login');snap(w,'puzzle')
w.child_window(auto_id='LoginInput',control_type='Edit').set_edit_text('admin')
p=w.child_window(auto_id='PasswordInput',control_type='Edit');p.set_focus();p.type_keys('Demo2027!',with_spaces=True)
for i in range(1,5):w.child_window(title='Фрагмент '+str(i),control_type='Button').invoke()
snap(w,'puzzle-solved');click(w.child_window(title='Войти',control_type='Button'));h=message('успешно авторизовались');snap(w,'success');win32gui.PostMessage(h,win32con.WM_CLOSE,0,0)
main=desktop.window(title='ДЭ 2027 · admin · '+suffix,visible_only=True);main.wait('visible',timeout=15);main.set_focus();main.child_window(title='Рассчитать заказ № 1',control_type='Button').invoke();snap(main,'main')
main.child_window(title='Заказчики',control_type='TabItem').select();snap(main,'customers')
main.child_window(title='Пользователи',control_type='TabItem').select();snap(main,'users')
main.descendants(control_type='DataItem')[5 if stack=='mysql' else 1].click_input();main.child_window(title='Снять блокировку',control_type='CheckBox').toggle();snap(main,'unlock');click(main.child_window(title='Сохранить',control_type='Button'));h=message('Данные сохранены');win32gui.PostMessage(h,win32con.WM_CLOSE,0,0);time.sleep(.4);snap(main,'users')
main.child_window(title='Заказ и себестоимость',control_type='TabItem').select()
print(stack,'actual login, successful sign-in, calculation, persistent lock removal captured')

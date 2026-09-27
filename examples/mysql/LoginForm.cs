namespace Dkip;
public class LoginForm : Form
{
    readonly TextBox login = new() { Name="LoginInput", AccessibleName="Логин", Width=440 };
    readonly TextBox password = new() { Name="PasswordInput", AccessibleName="Пароль", UseSystemPasswordChar=true,Width=440 };
    readonly PuzzleControl puzzle = new();
    public LoginForm()
    {
        Text="ДЭ 2027 · Авторизация · Windows Forms / MySQL";ClientSize=new Size(550,580);StartPosition=FormStartPosition.CenterScreen;Font=new Font("Segoe UI",11);BackColor=Color.White;MinimumSize=Size;
        var panel=new FlowLayoutPanel{Dock=DockStyle.Fill,FlowDirection=FlowDirection.TopDown,WrapContents=false,Padding=new Padding(36),AutoScroll=true};Controls.Add(panel);
        panel.Controls.Add(new Label{Text="Информационная система",Font=new Font(Font.FontFamily,21,FontStyle.Bold),AutoSize=true,Margin=new Padding(0,0,0,18)});
        panel.Controls.Add(new Label{Text="Логин",AutoSize=true});panel.Controls.Add(login);panel.Controls.Add(new Label{Text="Пароль",AutoSize=true,Margin=new Padding(0,12,0,0)});panel.Controls.Add(password);
        panel.Controls.Add(new Label{Text="Соберите изображение: выберите два фрагмента",AutoSize=true,Margin=new Padding(0,18,0,8)});panel.Controls.Add(puzzle);
        var enter=new Button{Text="Войти",Name="SignIn",AccessibleName="Войти",Width=440,Height=44,BackColor=Color.FromArgb(220,25,40),ForeColor=Color.White,FlatStyle=FlatStyle.Flat,Margin=new Padding(0,18,0,0)};panel.Controls.Add(enter);AcceptButton=enter;
        enter.Click+=(_,_)=>{try{var user=Accounts.SignIn(login.Text,password.Text,puzzle.IsSolved());MessageBox.Show("Вы успешно авторизовались","Информация",MessageBoxButtons.OK,MessageBoxIcon.Information);Hide();using var main=new MainForm(user);main.ShowDialog();password.Clear();puzzle.Shuffle();Show();}catch(InvalidOperationException ex){MessageBox.Show(ex.Message,"Ошибка входа",MessageBoxButtons.OK,MessageBoxIcon.Warning);puzzle.Shuffle();}catch(Exception){MessageBox.Show("Не удалось подключиться к базе данных. Проверьте запуск MySQL в XAMPP и DKIP_CONNECTION.","Ошибка подключения",MessageBoxButtons.OK,MessageBoxIcon.Error);}};
    }
}

using System.Data.Common;

namespace Dkip;

public partial class LoginForm : Form
{
    public LoginForm()
    {
        InitializeComponent();
    }

    private void SignIn(object? sender, EventArgs e)
    {
        try
        {
            // Проверяем всё в одном месте. При ошибке рабочее окно не откроется.
            var user = Accounts.SignIn(LoginInput.Text, PasswordInput.Text, Puzzle.IsSolved());
            MessageBox.Show("Вы успешно авторизовались", "Информация", MessageBoxButtons.OK, MessageBoxIcon.Information);

            using var main = new MainForm(user);
            main.ShowDialog(this);
            PasswordInput.Clear();
            Puzzle.Shuffle();
        }
        catch (InvalidOperationException ex)
        {
            MessageBox.Show(ex.Message, "Ошибка входа", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            Puzzle.Shuffle();
        }
        catch (DbException)
        {
            MessageBox.Show("Проверьте запуск MySQL в XAMPP и настройки DKIP_CONNECTION.",
                "Ошибка подключения", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }
}

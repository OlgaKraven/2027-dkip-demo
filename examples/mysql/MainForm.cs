using System.Data;
using System.Data.Common;

namespace Dkip;

public partial class MainForm : Form
{
    private readonly Account actor = null!;
    private int? editingId;

    public MainForm()
    {
        InitializeComponent();
    }

    public MainForm(Account user) : this()
    {
        actor = user;
        RoleLabel.Text = user.Login + " · " + (user.Role == "admin" ? "Администратор" : "Пользователь");
        AdminPanel.Visible = user.Role == "admin";
        if (user.Role == "admin")
            LoadUsers();
    }

    private void LoadUsers()
    {
        try
        {
            Accounts.RequireAdmin(actor);
            UsersGrid.DataSource = Database.Query(
                "SELECT id, login, role, failed_attempts, is_locked FROM users ORDER BY id");
        }
        catch (InvalidOperationException ex)
        {
            ShowWarning(ex.Message);
        }
        catch (DbException)
        {
            ShowDatabaseError();
        }
    }

    private void SelectUser(object? sender, DataGridViewCellEventArgs e)
    {
        if (e.RowIndex < 0 || UsersGrid.Rows[e.RowIndex].DataBoundItem is not DataRowView row)
            return;

        editingId = Convert.ToInt32(row["id"]);
        UserLogin.Text = (string)row["login"];
        UserRole.SelectedIndex = (string)row["role"] == "admin" ? 1 : 0;
        NewPassword.Clear();
        Unlock.Checked = false;
    }

    private void NewUser(object? sender, EventArgs e)
    {
        // Без выбранного id кнопка «Сохранить» добавит новую запись.
        editingId = null;
        UsersGrid.ClearSelection();
        UserLogin.Clear();
        NewPassword.Clear();
        UserRole.SelectedIndex = 0;
        Unlock.Checked = false;
    }

    private void SaveUser(object? sender, EventArgs e)
    {
        try
        {
            string role = UserRole.SelectedIndex == 1 ? "admin" : "user";
            Accounts.Save(actor, editingId, UserLogin.Text, NewPassword.Text, role, Unlock.Checked);
            NewUser(sender, e);
            LoadUsers();
            MessageBox.Show("Данные сохранены", "Информация", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }
        catch (InvalidOperationException ex)
        {
            ShowWarning(ex.Message);
        }
        catch (DbException)
        {
            ShowDatabaseError();
        }
    }

    private void ShowWarning(string message) =>
        MessageBox.Show(message, "Проверьте данные", MessageBoxButtons.OK, MessageBoxIcon.Warning);

    private void ShowDatabaseError() =>
        MessageBox.Show("Проверьте подключение к базе данных и повторите действие.",
            "Ошибка базы данных", MessageBoxButtons.OK, MessageBoxIcon.Error);
}

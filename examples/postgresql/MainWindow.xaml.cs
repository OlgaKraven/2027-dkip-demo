using System.Data;
using System.Data.Common;
using System.Windows;
using System.Windows.Controls;

namespace Dkip;

public partial class MainWindow : Window
{
    private readonly Account actor = null!;
    private int? editingId;

    public MainWindow()
    {
        InitializeComponent();
    }

    public MainWindow(Account user) : this()
    {
        actor = user;
        RoleLabel.Text = user.Login + " · " + (user.Role == "admin" ? "Администратор" : "Пользователь");
        AdminPanel.Visibility = user.Role == "admin" ? Visibility.Visible : Visibility.Collapsed;
        if (user.Role == "admin")
            LoadUsers();
    }

    private void LoadUsers()
    {
        try
        {
            Accounts.RequireAdmin(actor);
            UsersGrid.ItemsSource = Database.Query(
                "SELECT id, login, role, failed_attempts, is_locked FROM users ORDER BY id").DefaultView;
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

    private void SelectUser(object sender, SelectionChangedEventArgs e)
    {
        if (UsersGrid.SelectedItem is not DataRowView row)
            return;

        editingId = Convert.ToInt32(row["id"]);
        UserLogin.Text = (string)row["login"];
        UserRole.SelectedIndex = (string)row["role"] == "admin" ? 1 : 0;
        NewPassword.Clear();
        Unlock.IsChecked = false;
    }

    private void NewUser(object sender, RoutedEventArgs e)
    {
        // Без выбранного id кнопка «Сохранить» добавит новую запись.
        editingId = null;
        UsersGrid.UnselectAll();
        UserLogin.Clear();
        NewPassword.Clear();
        UserRole.SelectedIndex = 0;
        Unlock.IsChecked = false;
    }

    private void SaveUser(object sender, RoutedEventArgs e)
    {
        try
        {
            string role = UserRole.SelectedIndex == 1 ? "admin" : "user";
            Accounts.Save(actor, editingId, UserLogin.Text, NewPassword.Password, role, Unlock.IsChecked == true);
            NewUser(sender, e);
            LoadUsers();
            MessageBox.Show("Данные сохранены", "Информация", MessageBoxButton.OK, MessageBoxImage.Information);
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
        MessageBox.Show(message, "Проверьте данные", MessageBoxButton.OK, MessageBoxImage.Warning);

    private void ShowDatabaseError() =>
        MessageBox.Show("Проверьте подключение к базе данных и повторите действие.",
            "Ошибка базы данных", MessageBoxButton.OK, MessageBoxImage.Error);
}

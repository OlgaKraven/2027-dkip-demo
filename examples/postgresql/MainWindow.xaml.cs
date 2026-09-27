using System.Data;
using System.Windows;
using System.Windows.Controls;
namespace Dkip;
public partial class MainWindow:Window
{
    readonly Account actor;int? editingId;
    public MainWindow(Account user){InitializeComponent();actor=user;Title="ДЭ 2027 · "+user.Login+" · WPF / PostgreSQL";Guard(()=>{OrdersGrid.ItemsSource=Database.Query("SELECT i.name AS product,l.qty AS quantity,l.sale_price,l.discount FROM customer_order_line l JOIN item i ON i.id=l.product_id ORDER BY l.id").DefaultView;PartiesGrid.ItemsSource=Database.Query("SELECT * FROM counterparty ORDER BY id").DefaultView;});UsersTab.Visibility=actor.Role=="admin"?Visibility.Visible:Visibility.Collapsed;if(actor.Role=="admin")LoadUsers();}
    void Calculate(object sender,RoutedEventArgs e)=>Guard(()=>Total.Text="Себестоимость: "+Database.OrderCost(1).ToString("N2")+" ₽");
    void LoadUsers()=>Guard(()=>{Accounts.RequireAdmin(actor);UsersGrid.ItemsSource=Database.Query("SELECT id,login,role,failed_attempts,is_locked FROM users ORDER BY id").DefaultView;});
    void SelectUser(object sender,SelectionChangedEventArgs e){if(UsersGrid.SelectedItem is not DataRowView row)return;editingId=Convert.ToInt32(row["id"]);UserLogin.Text=(string)row["login"];UserRole.SelectedIndex=(string)row["role"]=="admin"?1:0;NewPassword.Clear();Unlock.IsChecked=false;}
    void NewUser(object sender,RoutedEventArgs e){editingId=null;UsersGrid.UnselectAll();UserLogin.Clear();NewPassword.Clear();UserRole.SelectedIndex=0;Unlock.IsChecked=false;}
    void SaveUser(object sender,RoutedEventArgs e)=>Guard(()=>{Accounts.Save(actor,editingId,UserLogin.Text,NewPassword.Password,UserRole.SelectedIndex==1?"admin":"user",Unlock.IsChecked==true);LoadUsers();NewPassword.Clear();MessageBox.Show("Данные сохранены","Информация",MessageBoxButton.OK,MessageBoxImage.Information);});
    void Guard(Action action){try{action();}catch(InvalidOperationException ex){MessageBox.Show(ex.Message,"Проверьте данные",MessageBoxButton.OK,MessageBoxImage.Warning);}catch(Exception){MessageBox.Show("Операция не выполнена. Проверьте подключение и ограничения базы данных.","Ошибка",MessageBoxButton.OK,MessageBoxImage.Error);}}
}

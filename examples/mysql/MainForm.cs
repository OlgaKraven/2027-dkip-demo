using System.Data;
namespace Dkip;
public class MainForm : Form
{
    readonly Account actor; readonly DataGridView users=new(){Dock=DockStyle.Fill,ReadOnly=true,AllowUserToAddRows=false,SelectionMode=DataGridViewSelectionMode.FullRowSelect,MultiSelect=false,ColumnHeadersHeightSizeMode=DataGridViewColumnHeadersHeightSizeMode.AutoSize,AutoSizeColumnsMode=DataGridViewAutoSizeColumnsMode.Fill};
    readonly TextBox login=new(){Width=145,AccessibleName="Логин пользователя"},password=new(){Width=145,UseSystemPasswordChar=true,AccessibleName="Новый пароль"};readonly ComboBox role=new(){Width=110,DropDownStyle=ComboBoxStyle.DropDownList,AccessibleName="Роль"};readonly CheckBox unlock=new(){Text="Снять блокировку",AutoSize=true};int? editingId;
    public MainForm(Account user)
    {
        actor=user;Text="ДЭ 2027 · "+user.Login+" · Windows Forms / MySQL";ClientSize=new Size(1100,650);MinimumSize=new Size(960,600);StartPosition=FormStartPosition.CenterScreen;Font=new Font("Segoe UI",11);
        var tabs=new TabControl{Dock=DockStyle.Fill};Controls.Add(tabs);var orders=new TabPage("Заказ и себестоимость");tabs.TabPages.Add(orders);
        var grid=new DataGridView{Dock=DockStyle.Fill,ReadOnly=true,AllowUserToAddRows=false,ColumnHeadersHeightSizeMode=DataGridViewColumnHeadersHeightSizeMode.AutoSize,AutoSizeColumnsMode=DataGridViewAutoSizeColumnsMode.Fill};orders.Controls.Add(grid);
        var bar=new FlowLayoutPanel{Dock=DockStyle.Top,Height=70,Padding=new Padding(12)};var calculate=new Button{Text="Рассчитать заказ № 1",AutoSize=true};var total=new Label{AutoSize=true,Padding=new Padding(18,8,0,0)};bar.Controls.Add(calculate);bar.Controls.Add(total);orders.Controls.Add(bar);
        calculate.Click+=(_,_)=>Guard(()=>total.Text="Себестоимость: "+Database.OrderCost(1).ToString("N2")+" ₽");
        Guard(()=>grid.DataSource=Database.Query("SELECT i.name AS product,l.qty AS quantity,l.sale_price,l.discount FROM customer_order_line l JOIN item i ON i.id=l.product_id ORDER BY l.id"));
        var parties=new TabPage("Заказчики");tabs.TabPages.Add(parties);var partyGrid=new DataGridView{Dock=DockStyle.Fill,ReadOnly=true,AllowUserToAddRows=false,ColumnHeadersHeightSizeMode=DataGridViewColumnHeadersHeightSizeMode.AutoSize,AutoSizeColumnsMode=DataGridViewAutoSizeColumnsMode.Fill};parties.Controls.Add(partyGrid);Guard(()=>partyGrid.DataSource=Database.Query("SELECT * FROM counterparty ORDER BY id"));
        if(user.Role=="admin"){
            var page=new TabPage("Пользователи");tabs.TabPages.Add(page);page.Controls.Add(users);role.Items.AddRange(["user","admin"]);role.SelectedIndex=0;
            var edit=new FlowLayoutPanel{Dock=DockStyle.Bottom,Height=150,Padding=new Padding(12),AutoScroll=true};edit.Controls.Add(new Label{Text="Логин",AutoSize=true});edit.Controls.Add(login);edit.Controls.Add(new Label{Text="Новый пароль",AutoSize=true});edit.Controls.Add(password);edit.Controls.Add(role);edit.Controls.Add(unlock);
            var fresh=new Button{Text="Новый",AutoSize=true};var save=new Button{Text="Сохранить",AutoSize=true};edit.Controls.Add(fresh);edit.Controls.Add(save);edit.Controls.Add(new Label{Text="Выберите строку для изменения. Пустой пароль при изменении сохраняет прежний.",AutoSize=true});page.Controls.Add(edit);
            fresh.Click+=(_,_)=>{editingId=null;login.Clear();password.Clear();role.SelectedIndex=0;unlock.Checked=false;users.ClearSelection();};
            users.CellClick+=(_,e)=>{if(e.RowIndex<0 || users.Rows[e.RowIndex].DataBoundItem is not DataRowView row)return;var r=row.Row;editingId=Convert.ToInt32(r["id"]);login.Text=(string)r["login"];role.SelectedItem=(string)r["role"];password.Clear();unlock.Checked=false;};
            save.Click+=(_,_)=>Guard(()=>{Accounts.Save(actor,editingId,login.Text,password.Text,role.Text,unlock.Checked);LoadUsers();password.Clear();MessageBox.Show("Данные сохранены","Информация",MessageBoxButtons.OK,MessageBoxIcon.Information);});LoadUsers();
        }
    }
    void LoadUsers()=>Guard(()=>{Accounts.RequireAdmin(actor);users.DataSource=Database.Query("SELECT id,login,role,failed_attempts,is_locked FROM users ORDER BY id");});
    void Guard(Action action){try{action();}catch(InvalidOperationException ex){MessageBox.Show(ex.Message,"Проверьте данные",MessageBoxButtons.OK,MessageBoxIcon.Warning);}catch(Exception){MessageBox.Show("Операция не выполнена. Проверьте подключение и ограничения базы данных.","Ошибка",MessageBoxButtons.OK,MessageBoxIcon.Error);}}
}

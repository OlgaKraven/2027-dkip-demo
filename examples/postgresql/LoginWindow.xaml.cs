using System.IO;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Imaging;
namespace Dkip;
public partial class LoginWindow:Window
{
    readonly int[] order=[1,0,3,2];readonly BitmapSource[] pieces=new BitmapSource[4];readonly Button[] tiles=new Button[4];int selected=-1;
    public LoginWindow(){InitializeComponent();var image=new BitmapImage(new Uri(Path.Combine(AppContext.BaseDirectory,"Assets","1.png")));Original.Source=image;int w=image.PixelWidth/2,h=image.PixelHeight/2;for(int i=0;i<4;i++){pieces[i]=new CroppedBitmap(image,new Int32Rect(i%2*w,i/2*h,w,h));int pos=i;tiles[i]=new Button{Padding=new Thickness(0),Margin=new Thickness(1)};System.Windows.Automation.AutomationProperties.SetName(tiles[i],"Фрагмент "+(i+1));tiles[i].Click+=(_,_)=>{if(selected<0)selected=pos;else{(order[selected],order[pos])=(order[pos],order[selected]);selected=-1;}RenderPuzzle();};Puzzle.Children.Add(tiles[i]);}RenderPuzzle();}
    void RenderPuzzle(){for(int i=0;i<4;i++){tiles[i].Content=new Image{Source=pieces[order[i]],Stretch=Stretch.Fill};tiles[i].BorderBrush=selected==i?Brushes.Red:Brushes.Gray;tiles[i].BorderThickness=new Thickness(selected==i?3:1);}}
    void Shuffle(){do{Random.Shared.Shuffle(order);}while(order.SequenceEqual(new[]{0,1,2,3}));selected=-1;RenderPuzzle();}
    void SignIn(object sender,RoutedEventArgs e){try{var actor=Accounts.SignIn(LoginInput.Text,PasswordInput.Password,order.SequenceEqual(new[]{0,1,2,3}));MessageBox.Show("Вы успешно авторизовались","Информация",MessageBoxButton.OK,MessageBoxImage.Information);Hide();new MainWindow(actor).ShowDialog();PasswordInput.Clear();Shuffle();Show();}catch(InvalidOperationException ex){MessageBox.Show(ex.Message,"Ошибка входа",MessageBoxButton.OK,MessageBoxImage.Warning);Shuffle();}catch(Exception){MessageBox.Show("Не удалось подключиться к PostgreSQL. Проверьте службу и DKIP_CONNECTION.","Ошибка подключения",MessageBoxButton.OK,MessageBoxImage.Error);}}
}

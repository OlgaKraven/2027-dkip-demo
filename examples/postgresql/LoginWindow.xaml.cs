using System.Data.Common;
using System.IO;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Imaging;
namespace Dkip;

public partial class LoginWindow : Window
{
    readonly int[] order = [1, 0, 3, 2];
    readonly BitmapSource[] pieces = new BitmapSource[4];
    readonly Button[] tiles = new Button[4];
    int selected = -1;
    public LoginWindow()
    {
        InitializeComponent();
        try
        {
            LoadPuzzle();
        }
        catch (Exception ex) when (ex is IOException or NotSupportedException)
        {
            SignInButton.IsEnabled = false;
            MessageBox.Show("Проверьте четыре PNG в папке Assets рядом с приложением.",
                "Не удалось открыть пазл", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    void LoadPuzzle()
    {
        // Четыре PNG уже идут в правильном порядке. Сначала показываем образец.
        var visual = new DrawingVisual();
        using (var drawing = visual.RenderOpen())
        {
            for (int i = 0; i < 4; i++)
            {
                var image = new BitmapImage();
                image.BeginInit();
                image.CacheOption = BitmapCacheOption.OnLoad;
                image.UriSource = new Uri(Path.Combine(AppContext.BaseDirectory, "Assets", (i + 1) + ".png"));
                image.EndInit();
                image.Freeze();
                pieces[i] = image;
                drawing.DrawImage(image, new Rect(i % 2 * 200, i / 2 * 200, 200, 200));
            }
        }
        var preview = new RenderTargetBitmap(400, 400, 96, 96, PixelFormats.Pbgra32);
        preview.Render(visual);
        preview.Freeze();
        Original.Source = preview;
        for (int i = 0; i < 4; i++)
        {
            tiles[i] = new Button { Padding = new Thickness(0), Margin = new Thickness(1) };
            System.Windows.Automation.AutomationProperties.SetName(tiles[i], "Фрагмент " + (i + 1));
            tiles[i].Click += SelectTile;
            Puzzle.Children.Add(tiles[i]);
        }
        RenderPuzzle();
    }
    void SelectTile(object sender, RoutedEventArgs e)
    {
        int position = Array.IndexOf(tiles, (Button)sender);
        if (selected == -1)
        {
            selected = position;
        }
        else
        {
            // Второе нажатие меняет местами два номера в массиве.
            int fragment = order[selected];
            order[selected] = order[position];
            order[position] = fragment;
            selected = -1;
        }
        RenderPuzzle();
    }

    bool IsSolved() => order.SequenceEqual(new[] { 0, 1, 2, 3 });

    void RenderPuzzle()
    {
        for (int i = 0; i < 4; i++)
        {
            tiles[i].Content = new Image { Source = pieces[order[i]], Stretch = Stretch.Fill };
            tiles[i].BorderBrush = selected == i ? Brushes.Red : Brushes.Gray;
            tiles[i].BorderThickness = new Thickness(selected == i ? 3 : 1);
        }
    }
    void Shuffle()
    {
        do
        {
            Random.Shared.Shuffle(order);
        } while (IsSolved());
        selected = -1;
        RenderPuzzle();
    }
    void SignIn(object sender, RoutedEventArgs e)
    {
        try
        {
            // Проверяем всё в одном месте. При ошибке рабочее окно не откроется.
            var user = Accounts.SignIn(LoginInput.Text, PasswordInput.Password, IsSolved());
            MessageBox.Show("Вы успешно авторизовались", "Информация", MessageBoxButton.OK, MessageBoxImage.Information);

            var main = new MainWindow(user) { Owner = this };
            main.ShowDialog();
            PasswordInput.Clear();
            Shuffle();
        }
        catch (InvalidOperationException ex)
        {
            MessageBox.Show(ex.Message, "Ошибка входа", MessageBoxButton.OK, MessageBoxImage.Warning);
            Shuffle();
        }
        catch (DbException)
        {
            MessageBox.Show("Проверьте запуск PostgreSQL и настройки DKIP_CONNECTION.",
                "Ошибка подключения", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }
}

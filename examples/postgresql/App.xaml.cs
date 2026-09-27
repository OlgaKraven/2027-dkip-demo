using System.Windows;
namespace Dkip;
public partial class App:Application { protected override void OnStartup(StartupEventArgs e){Environment.SetEnvironmentVariable("DKIP_STACK","postgresql");base.OnStartup(e);} }

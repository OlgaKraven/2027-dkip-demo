namespace Dkip;
internal static class Program
{
    [STAThread] static void Main() { Environment.SetEnvironmentVariable("DKIP_STACK","mysql");ApplicationConfiguration.Initialize();Application.Run(new LoginForm()); }
}

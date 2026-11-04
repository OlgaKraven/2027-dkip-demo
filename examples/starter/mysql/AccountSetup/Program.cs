using MySqlConnector;
using System.Security.Cryptography;

// Educational accounts only. Do not run against a populated users table.
var connectionString = Environment.GetEnvironmentVariable("DKIP_CONNECTION");
if (string.IsNullOrWhiteSpace(connectionString)) { Console.WriteLine("Задайте DKIP_CONNECTION."); return 1; }
try
{
    using var connection = new MySqlConnection(connectionString);
    connection.Open();
    using var transaction = connection.BeginTransaction();
    using var count = connection.CreateCommand();
    count.Transaction = transaction;
    count.CommandText = "SELECT COUNT(*) FROM users";
    if (Convert.ToInt32(count.ExecuteScalar()) != 0)
    {
        Console.WriteLine("users уже содержит записи. Изменения не внесены; используйте администратора приложения.");
        return 1;
    }
    foreach (var (login, role) in new[] { ("admin", "admin"), ("student", "user") })
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = Convert.ToBase64String(salt) + ":" + Convert.ToBase64String(Rfc2898DeriveBytes.Pbkdf2("Demo2027!", salt, 100000, HashAlgorithmName.SHA256, 32));
        using var command = connection.CreateCommand();
        command.Transaction = transaction;
        command.CommandText = "INSERT INTO users(login,password_hash,role,failed_attempts,is_locked) VALUES(@login,@hash,@role,0,FALSE)";
        command.Parameters.AddWithValue("login", login);
        command.Parameters.AddWithValue("hash", hash);
        command.Parameters.AddWithValue("role", role);
        command.ExecuteNonQuery();
    }
    transaction.Commit();
    Console.WriteLine("Созданы учебные admin и student с паролем Demo2027!. В базе сохранён хеш с солью.");
    return 0;
}
catch (Exception exception)
{
    Console.WriteLine("Начальная загрузка отменена. Проверьте подключение и структуру users. Тип: " + exception.GetType().Name);
    return 1;
}

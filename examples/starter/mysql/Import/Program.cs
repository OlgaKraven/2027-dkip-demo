using MySqlConnector;
using System.Text.Json;

// One-time import into your own existing counterparty table.
// Configure the provider package and launch arguments in Visual Studio.
if (args.Length != 1 || !File.Exists(args[0]))
{
    Console.WriteLine("Укажите полный путь к Заказчики.json в аргументах запуска проекта.");
    return 1;
}
var connectionString = Environment.GetEnvironmentVariable("DKIP_CONNECTION");
if (string.IsNullOrWhiteSpace(connectionString))
{
    Console.WriteLine("Задайте DKIP_CONNECTION в переменных среды профиля запуска проекта.");
    return 1;
}
try
{
    using var data = JsonDocument.Parse(File.ReadAllText(args[0]));
    using var connection = new MySqlConnection(connectionString);
    connection.Open();
    using var transaction = connection.BeginTransaction();
    int count = 0;
    foreach (var customer in data.RootElement.EnumerateArray())
    {
        using var command = connection.CreateCommand();
        command.Transaction = transaction;
        command.CommandText = "INSERT INTO counterparty(id,name,inn,address,phone,party_type) VALUES(@id,@name,@inn,@address,@phone,@type)";
        foreach (var (parameter, source) in new[] { ("id", "id"), ("name", "name"), ("inn", "inn"), ("address", "addres"), ("phone", "phone"), ("type", "type") })
            command.Parameters.AddWithValue(parameter, customer.GetProperty(source).GetString() ?? throw new FormatException("Поле должно быть строкой: " + source));
        command.ExecuteNonQuery();
        count++;
    }
    transaction.Commit();
    Console.WriteLine($"Импортировано записей: {count}. Сверьте значения с JSON в редакторе БД.");
    return 0;
}
catch (Exception exception)
{
    // Do not print connection strings or passwords.
    Console.WriteLine("Импорт отменён целиком. Проверьте таблицу, подключение, типы полей и повторяющиеся id.");
    Console.WriteLine("Тип ошибки: " + exception.GetType().Name);
    return 1;
}

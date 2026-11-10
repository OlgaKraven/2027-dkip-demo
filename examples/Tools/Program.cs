using Dkip;
using System.Text.Json;

var command = args.FirstOrDefault() ?? "check";
if (command == "test") IntegrationChecks.Run();
if (command == "seed")
{
    if (args.Length != 2)
        throw new ArgumentException("Укажите путь к файлу Заказчики.json после аргумента seed.");
    DemoSeed.Run(args[1]);
}
if (command == "seed" || command == "check")
{
    Console.WriteLine("СУБД: " + Database.Stack);
    Console.WriteLine("Исходные заказчики: " + Database.Scalar("SELECT COUNT(*) FROM counterparty WHERE id NOT LIKE 'DOC-%'"));
    Console.WriteLine("Себестоимость: " + Database.OrderCost(1));
    Console.WriteLine(JsonSerializer.Serialize(Notes.Read(), new JsonSerializerOptions { WriteIndented = true, Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping }));
}

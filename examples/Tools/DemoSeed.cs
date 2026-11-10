#nullable enable

using Dkip;
using System.Data;
using System.Text.Json;

internal static class DemoSeed
{
    internal static void Run(string input)
    {
        using var customers = JsonDocument.Parse(File.ReadAllText(input));
        using var connection = Database.Open();
        using var transaction = connection.BeginTransaction(IsolationLevel.ReadCommitted);
        var isMySql = Database.Stack == "mysql";
        string[] identityTables = ["item", "specification", "customer_order", "customer_order_line", "production_order"];

        // Serialize seed runs on this row, including the first run into an empty database.
        var lockRow = isMySql ? "ON DUPLICATE KEY UPDATE id=id" : "ON CONFLICT (id) DO UPDATE SET id=EXCLUDED.id";
        Execute("INSERT INTO counterparty(id,name,inn,address,phone,party_type) " +
            "VALUES('DOC-CUSTOMER','ИП Томилин Александр Сергеевич','','','','Покупатель') " + lockRow);
        if (!isMySql)
            Execute($"LOCK TABLE {string.Join(", ", identityTables)} IN SHARE ROW EXCLUSIVE MODE");

        foreach (var customer in customers.RootElement.EnumerateArray())
        {
            Add("counterparty", "id,name,inn,address,phone,party_type", "id=@p0",
                customer.GetProperty("id").GetString(), customer.GetProperty("name").GetString(),
                customer.GetProperty("inn").GetString(), customer.GetProperty("addres").GetString(),
                customer.GetProperty("phone").GetString(), customer.GetProperty("type").GetString());
        }
        Add("counterparty", "id,name,inn,address,phone,party_type", "id=@p0",
            "DOC-MAKER", "ООО ТД «Вершина»", "", "", "", "Производитель");

        AddItem(1, "НФ-00000006", "Стол кухонный «Самобранка»", "product", "шт");
        AddItem(2, "ФР-00000009", "Столешница круглая", "material", "шт");
        AddItem(3, "ФР-00000013", "Мебельная деталь 500х800", "material", "шт");
        AddItem(4, "ФР-00000016", "Мебельная деталь 600х800", "material", "шт");
        AddItem(5, "ФР-00000027", "Евровинт 6,5х5", "material", "тыс. шт");
        AddItem(6, "ФР-00000026", "Опора", "material", "шт");
        AddItem(7, "ФР-00000053", "Сборка модулей", "operation", "ч");
        AddItem(8, "ФР-00000052", "Распил ДСП, МДФ и листового материала", "operation", "ч");
        AddItem(9, "ФР-00000494", "Упаковка", "operation", "ч");
        int[] amounts = [3250, 95, 140, 595, 245, 1400, 450, 950];
        for (int i = 0; i < amounts.Length; i++)
            Add("price", "item_id,valid_from,amount", "item_id=@p0 AND valid_from=@p1", i + 2, new DateOnly(2026, 4, 1), amounts[i]);

        Add("specification", "id,product_id,name,output_qty,manufacturer_id", "id=@p0 AND product_id=@p1",
            1, 1, "Стол кухонный Самобранка", 1, "DOC-MAKER");
        (int ItemId, decimal Quantity, decimal Time)[] components =
            [(2, 1, 1), (3, 2, 1), (4, 4, 1), (5, 0.012m, 1), (6, 4, 1), (7, 1, 0.75m), (8, 1, 1.5m), (9, 1, 0.5m)];
        foreach (var (itemId, quantity, time) in components)
            Add("specification_component", "specification_id,item_id,qty,time_norm",
                "specification_id=@p0 AND item_id=@p1", 1, itemId, quantity, time);

        Add("customer_order", "id,doc_no,doc_date,customer_id,executor_id", "id=@p0 AND doc_no=@p1",
            1, "1", new DateOnly(2026, 4, 22), "DOC-CUSTOMER", "DOC-MAKER");
        Add("customer_order_line", "id,order_id,product_id,source_code,qty,sale_price,discount",
            "id=@p0 AND order_id=@p1 AND product_id=@p2 AND source_code=@p3", 1, 1, 1, "ФР-00000034", 2, 14120, 1412);
        Add("production_order", "id,doc_no,doc_date,launch_date,department", "id=@p0 AND doc_no=@p1",
            1, "1", new DateOnly(2026, 4, 23), new DateOnly(2026, 4, 23), "Основное подразделение");
        Add("production_product", "production_id,product_id,qty", "production_id=@p0 AND product_id=@p1", 1, 1, 2);
        (int ItemId, decimal Quantity, string Unit)[] resources =
            [(2, 2, "шт"), (3, 4, "шт"), (4, 8, "шт"), (5, 0.024m, "шт"), (6, 8, "тыс. шт"), (7, 2, "ч"), (8, 2, "ч"), (9, 2, "шт")];
        foreach (var (itemId, quantity, unit) in resources)
            Add("production_resource", "production_id,item_id,qty,source_unit",
                "production_id=@p0 AND item_id=@p1", 1, itemId, quantity, unit);

        var adminId = UserId("admin", "admin");
        var studentId = UserId("student", "user");
        for (int i = 1; i <= 5; i++)
            Add("notes", "title,content,id_user,created_at", "title=@p0 AND id_user=@p2 AND created_at=@p3",
                "Заметка " + i, "Содержание заметки " + i, i % 2 == 0 ? adminId : studentId, new DateOnly(2027, 3, 14 + i));

        // Explicit IDs do not advance PostgreSQL identity sequences. Restart only when necessary.
        if (!isMySql)
            foreach (var table in identityTables)
            {
                var nextId = Convert.ToInt64(Scalar($"SELECT MAX(id)::bigint + 1 FROM {table}"));
                var sequenceNext = Convert.ToInt64(Scalar($"SELECT last_value + CASE WHEN is_called THEN 1 ELSE 0 END FROM {table}_id_seq"));
                if (nextId > sequenceNext)
                    Execute($"ALTER TABLE {table} ALTER COLUMN id RESTART WITH {nextId}");
            }

        transaction.Commit();
        Console.WriteLine("Учебные данные готовы. Существующие записи сохранены.");

        void AddItem(int id, string code, string name, string kind, string unit) =>
            Add("item", "id,code,name,kind,unit", "id=@p0 AND code=@p1", id, code, name, kind, unit);

        int UserId(string login, string role)
        {
            const string findUser = "SELECT id FROM users WHERE login=@p0";
            var id = Scalar(findUser, login);
            if (id is not null) return Convert.ToInt32(id);
            Execute("INSERT INTO users(login,password_hash,role,failed_attempts,is_locked) VALUES(@p0,@p1,@p2,0,FALSE)",
                login, Accounts.Hash("Demo2027!"), role);
            return Convert.ToInt32(Scalar(findUser, login));
        }

        void Add(string table, string columns, string key, params object?[] values)
        {
            if (Scalar($"SELECT 1 FROM {table} WHERE {key} LIMIT 1", values) is not null) return;
            // A different record occupying a fixture ID triggers a constraint error and rolls back the seed.
            var parameters = string.Join(",", values.Select((_, index) => $"@p{index}"));
            Execute($"INSERT INTO {table}({columns}) VALUES({parameters})", values);
        }

        object? Scalar(string sql, params object?[] values)
        {
            using var command = Database.Command(connection, sql, values);
            command.Transaction = transaction;
            return command.ExecuteScalar();
        }

        void Execute(string sql, params object?[] values)
        {
            using var command = Database.Command(connection, sql, values);
            command.Transaction = transaction;
            command.ExecuteNonQuery();
        }
    }
}

using System.Data;
using System.Data.Common;
using MySqlConnector;
using Npgsql;
namespace Dkip;

public static class Database
{
    public static string Stack => Environment.GetEnvironmentVariable("DKIP_STACK") ?? "mysql";
    public static DbConnection Open()
    {
        var connectionString = Environment.GetEnvironmentVariable("DKIP_CONNECTION")
            ?? (Stack == "mysql" ? "Server=127.0.0.1;Database=dkip2027_course;User ID=root;Password=;Character Set=utf8mb4" : "Host=127.0.0.1;Port=5432;Database=dkip2027_course;Username=postgres");
        DbConnection connection = Stack == "mysql" ? new MySqlConnection(connectionString) : new NpgsqlConnection(connectionString);
        try { connection.Open(); return connection; } catch { connection.Dispose(); throw; }
    }
    public static DbCommand Command(DbConnection connection, string sql, params object?[] values)
    {
        var cmd = connection.CreateCommand(); cmd.CommandText = sql;
        for (int i = 0; i < values.Length; i++) { var p = cmd.CreateParameter(); p.ParameterName = "p" + i; p.Value = values[i] ?? DBNull.Value; cmd.Parameters.Add(p); }
        return cmd;
    }
    public static int Execute(string sql, params object?[] values) { using var c = Open(); using var cmd = Command(c, sql, values); return cmd.ExecuteNonQuery(); }
    public static DataTable Query(string sql, params object?[] values) { using var c = Open(); using var cmd = Command(c, sql, values); using var reader = cmd.ExecuteReader(); var result = new DataTable(); result.Load(reader); return result; }
    public static object? Scalar(string sql, params object?[] values) { using var c = Open(); using var cmd = Command(c, sql, values); return cmd.ExecuteScalar(); }
    public static decimal OrderCost(int id)
    {
        // Missing prices must not silently produce an understated SUM.
        var incomplete = Convert.ToInt32(Scalar("SELECT COUNT(*) FROM customer_order_line l LEFT JOIN specification s ON s.product_id=l.product_id WHERE l.order_id=@p0 AND (s.id IS NULL OR NOT EXISTS (SELECT 1 FROM specification_component c WHERE c.specification_id=s.id))", id));
        incomplete += Convert.ToInt32(Scalar("SELECT COUNT(*) FROM customer_order o JOIN customer_order_line l ON l.order_id=o.id JOIN specification s ON s.product_id=l.product_id JOIN specification_component c ON c.specification_id=s.id WHERE o.id=@p0 AND NOT EXISTS(SELECT 1 FROM price p WHERE p.item_id=c.item_id AND p.valid_from<=o.doc_date)", id));
        if (incomplete != 0) throw new InvalidOperationException("Недостаточно норм или цен для полного расчёта. Заполните спецификацию и цены на дату заказа.");
        var value = Scalar("SELECT total_cost FROM order_cost WHERE order_id=@p0", id);
        if (value is null || value == DBNull.Value) throw new InvalidOperationException("Заказ не найден или не содержит строк.");
        return Convert.ToDecimal(value);
    }
}

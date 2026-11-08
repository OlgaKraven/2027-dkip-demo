using System.Data;
using System.Data.Common;
using MySqlConnector;
namespace MyApp;

public static class Database
{
    public static DbConnection Open()
    {
        // Профиль запуска передаёт строку подключения при запуске приложения.
        var connectionString = Environment.GetEnvironmentVariable("DKIP_CONNECTION");
        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException("Укажите DKIP_CONNECTION в профиле запуска.");

        var connection = new MySqlConnection(connectionString);
        try
        {
            connection.Open();
            return connection;
        }
        catch { connection.Dispose(); throw; }
    }
    public static DbCommand Command(DbConnection connection, string sql, params object?[] values)
    {
        var cmd = connection.CreateCommand();
        cmd.CommandText = sql;
        for (int i = 0; i < values.Length; i++)
        {
            var p = cmd.CreateParameter();
            p.ParameterName = "p" + i;
            p.Value = values[i] ?? DBNull.Value;
            cmd.Parameters.Add(p);
        }
        return cmd;
    }
    public static int Execute(string sql, params object?[] values)
    {
        using var c = Open();
        using var cmd = Command(c, sql, values);
        return cmd.ExecuteNonQuery();
    }
    public static DataTable Query(string sql, params object?[] values)
    {
        using var c = Open();
        using var cmd = Command(c, sql, values);
        using var reader = cmd.ExecuteReader();
        var result = new DataTable();
        result.Load(reader);
        return result;
    }
    public static object? Scalar(string sql, params object?[] values)
    {
        using var c = Open();
        using var cmd = Command(c, sql, values);
        return cmd.ExecuteScalar();
    }
}

using System.Globalization;
using System.Text.Json.Serialization;
namespace Dkip;
public record Note([property: JsonPropertyName("id")] int Id, [property: JsonPropertyName("title_user")] string TitleUser, [property: JsonPropertyName("content")] string Content, [property: JsonPropertyName("formatted_date")] string FormattedDate);
public static class Notes
{
    public static List<Note> Read(int? userId = null)
    {
        using var c = Database.Open();
        using var cmd = Database.Command(c, "SELECT n.id,n.title,u.login,n.content,n.created_at FROM notes n JOIN users u ON u.id=n.id_user" + (userId.HasValue ? " WHERE n.id_user=@p0" : "") + " ORDER BY n.id", userId.HasValue ? new object?[] { userId.Value } : []);
        using var r = cmd.ExecuteReader(); var result = new List<Note>();
        while (r.Read()) { var date = r[4] is DateOnly day ? day : DateOnly.FromDateTime(Convert.ToDateTime(r[4], CultureInfo.InvariantCulture)); result.Add(new Note(Convert.ToInt32(r[0]), r.GetString(1) + " - " + r.GetString(2), r.GetString(3), date.ToString("dd.MM.yyyy", CultureInfo.InvariantCulture))); }
        return result;
    }
}

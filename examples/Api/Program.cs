using Dkip;
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
app.UseStaticFiles();
IResult ReadNotes(HttpRequest request)
{
    int? userId = null;
    if (request.Query.Keys.Any(k => k != "user_id"))
        return Results.BadRequest(new
        {
            error = "Неизвестный параметр. Допустим user_id."
        });
    if (request.Query.ContainsKey("user_id"))
    {
        if (request.Query["user_id"].Count != 1 || !int.TryParse(request.Query["user_id"], out var parsed) || parsed <= 0)
            return Results.BadRequest(new
            {
                error = "user_id должен быть положительным целым числом"
            });
        userId = parsed;
    }
    try
    {
        return Results.Ok(Notes.Read(userId));
    }
    catch (Exception ex)
    {
        // Подробности остаются в журнале сервера. Клиент получает только сообщение.
        app.Logger.LogError(ex, "Ошибка обработки API");
        return Results.Json(
            new { error = "Ошибка подключения к базе данных или обработки запроса" },
            statusCode: StatusCodes.Status500InternalServerError);
    }
}
app.MapGet("/notes", ReadNotes);
app.MapGet("/api/notes", ReadNotes);
app.MapGet("/", () => Results.Redirect("/notes"));
app.Run();

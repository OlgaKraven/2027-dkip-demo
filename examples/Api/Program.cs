using Dkip;
var builder=WebApplication.CreateBuilder(args);
var app=builder.Build();
app.UseStaticFiles();
app.Use(async (context,next)=>{try{await next();}catch(Exception ex){app.Logger.LogError(ex,"Ошибка обработки API");context.Response.StatusCode=500;await context.Response.WriteAsJsonAsync(new {error="Ошибка подключения к базе данных или обработки запроса"});}});
IResult ReadNotes(HttpRequest request)
{
    int? userId=null;
    if(request.Query.Keys.Any(k=>k!="user_id"))return Results.BadRequest(new{error="Неизвестный параметр. Допустим user_id."});
    if(request.Query.ContainsKey("user_id")){if(request.Query["user_id"].Count!=1||!int.TryParse(request.Query["user_id"],out var parsed)||parsed<=0)return Results.BadRequest(new{error="user_id должен быть положительным целым числом"});userId=parsed;}
    return Results.Ok(Notes.Read(userId));
}
app.MapGet("/notes",ReadNotes);app.MapGet("/api/notes",ReadNotes);
app.MapGet("/",()=>Results.Redirect("/swagger/"));
app.MapGet("/swagger/",()=>Results.Content("""
<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ДЭ 2027 · API заметок</title><link rel="stylesheet" href="/swagger-ui.css"></head><body><div id="swagger-ui"></div><script src="/swagger-ui-bundle.js"></script><script>SwaggerUIBundle({url:'/openapi.json',dom_id:'#swagger-ui',deepLinking:true});</script></body></html>
""","text/html; charset=utf-8"));
app.Run();

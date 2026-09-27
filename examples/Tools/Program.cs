using Dkip;
using System.Text.Json;
var command=args.FirstOrDefault() ?? "check";
if(command=="test") IntegrationChecks.Run();
if (command=="seed") {
    // Run once, after applying 01-schema.sql to a new empty database.
    if(Convert.ToInt32(Database.Scalar("SELECT COUNT(*) FROM users"))!=0) throw new InvalidOperationException("База уже заполнена. Повторная начальная загрузка не выполняется.");
    var input=args[1]; var customers=JsonDocument.Parse(File.ReadAllText(input));
    using var c=Database.Open(); using var tx=c.BeginTransaction();
    foreach(var x in customers.RootElement.EnumerateArray()) { using var q=Database.Command(c,"INSERT INTO counterparty(id,name,inn,address,phone,party_type) VALUES(@p0,@p1,@p2,@p3,@p4,@p5)",x.GetProperty("id").GetString(),x.GetProperty("name").GetString(),x.GetProperty("inn").GetString(),x.GetProperty("addres").GetString(),x.GetProperty("phone").GetString(),x.GetProperty("type").GetString());q.Transaction=tx;q.ExecuteNonQuery(); }
    tx.Commit();
    Database.Execute("INSERT INTO counterparty VALUES('DOC-CUSTOMER','ИП Томилин Александр Сергеевич','','','','Покупатель'),('DOC-MAKER','ООО ТД «Вершина»','','','','Производитель')");
    Database.Execute("INSERT INTO item(id,code,name,kind,unit) VALUES (1,'НФ-00000006','Стол кухонный «Самобранка»','product','шт'),(2,'ФР-00000009','Столешница круглая','material','шт'),(3,'ФР-00000013','Мебельная деталь 500х800','material','шт'),(4,'ФР-00000016','Мебельная деталь 600х800','material','шт'),(5,'ФР-00000027','Евровинт 6,5х5','material','тыс. шт'),(6,'ФР-00000026','Опора','material','шт'),(7,'ФР-00000053','Сборка модулей','operation','ч'),(8,'ФР-00000052','Распил ДСП, МДФ и листового материала','operation','ч'),(9,'ФР-00000494','Упаковка','operation','ч')");
    Database.Execute("INSERT INTO price VALUES (2,'2026-04-01',3250),(3,'2026-04-01',95),(4,'2026-04-01',140),(5,'2026-04-01',595),(6,'2026-04-01',245),(7,'2026-04-01',1400),(8,'2026-04-01',450),(9,'2026-04-01',950)");
    Database.Execute("INSERT INTO specification VALUES(1,1,'Стол кухонный Самобранка',1,'DOC-MAKER')");
    Database.Execute("INSERT INTO specification_component VALUES(1,2,1,1),(1,3,2,1),(1,4,4,1),(1,5,0.012,1),(1,6,4,1),(1,7,1,0.75),(1,8,1,1.5),(1,9,1,0.5)");
    Database.Execute("INSERT INTO customer_order VALUES(1,'1','2026-04-22','DOC-CUSTOMER','DOC-MAKER')");
    Database.Execute("INSERT INTO customer_order_line VALUES(1,1,1,'ФР-00000034',2,14120,1412)");
    Database.Execute("INSERT INTO production_order VALUES(1,'1','2026-04-23','2026-04-23','Основное подразделение')");
    Database.Execute("INSERT INTO production_product VALUES(1,1,2)");
    Database.Execute("INSERT INTO production_resource VALUES(1,2,2,'шт'),(1,3,4,'шт'),(1,4,8,'шт'),(1,5,0.024,'шт'),(1,6,8,'тыс. шт'),(1,7,2,'ч'),(1,8,2,'ч'),(1,9,2,'шт')");
    foreach (var (login,role) in new[]{("admin","admin"),("student","user")}) Database.Execute("INSERT INTO users(login,password_hash,role,failed_attempts,is_locked) VALUES(@p0,@p1,@p2,0,FALSE)",login,Accounts.Hash("Demo2027!"),role);
    for(int i=1;i<=5;i++) Database.Execute("INSERT INTO notes(title,content,id_user,created_at) VALUES(@p0,@p1,@p2,@p3)","Заметка "+i,"Содержание заметки "+i,i%2+1,new DateTime(2027,3,14+i));
    if(Database.Stack=="postgresql") foreach(var t in new[]{"item","specification","customer_order","customer_order_line","production_order"}) Database.Execute($"SELECT setval(pg_get_serial_sequence('{t}','id'),(SELECT MAX(id) FROM {t}))");
    Console.WriteLine("Импортированы 6 заказчиков, 2 дополнения по документам, производство, пользователи и 5 заметок.");
}
if(command=="seed"||command=="check") {
    Console.WriteLine("СУБД: "+Database.Stack);Console.WriteLine("Исходные заказчики: "+Database.Scalar("SELECT COUNT(*) FROM counterparty WHERE id NOT LIKE 'DOC-%'"));Console.WriteLine("Себестоимость: "+Database.OrderCost(1));Console.WriteLine(JsonSerializer.Serialize(Notes.Read(),new JsonSerializerOptions{WriteIndented=true,Encoder=System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping}));
}

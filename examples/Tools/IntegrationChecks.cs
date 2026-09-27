using Dkip;
public static class IntegrationChecks
{
 public static void Run(){
  int passed=0;void Check(bool ok,string name){if(!ok)throw new Exception(name);Console.WriteLine("PASS "+name);passed++;}
  void Reject(Action action,string message){try{action();throw new Exception("Expected rejection: "+message);}catch(InvalidOperationException e){Check(e.Message.Contains(message),message);}}
  Check(Database.OrderCost(1)==14374.28m,"Cost includes all resources and operation norms");
  Check(Convert.ToInt32(Database.Scalar("SELECT COUNT(*) FROM counterparty WHERE id NOT LIKE 'DOC-%'"))==6,"Six original customers");
  var name="qa_"+Guid.NewGuid().ToString("N")[..12];
  var admin=Accounts.SignIn("admin","Demo2027!",true);int id=0;
  try{
   Accounts.Save(admin,null,name,"Test2027!","user",false);id=Convert.ToInt32(Database.Scalar("SELECT id FROM users WHERE login=@p0",name));Check(id>0,"Create user");
   Reject(()=>Accounts.Save(admin,null,name,"Test2027!","user",false),"уже существует");
   Reject(()=>Accounts.SignIn(name,"bad",true),"неверный логин");
   Reject(()=>Accounts.SignIn(name,"Test2027!",false),"Пазл собран неверно");
   Reject(()=>Accounts.SignIn(name,"bad",true),"Вы заблокированы");
   Reject(()=>Accounts.SignIn(name,"Test2027!",true),"Вы заблокированы");
   Accounts.Save(admin,id,name,"","user",true);var user=Accounts.SignIn(name,"Test2027!",true);Check(user.Role=="user","Admin unlock and successful sign in");
   Reject(()=>Accounts.Save(user,null,"forbidden","Test2027!","admin",false),"только администратору");
   Reject(()=>Accounts.SignIn(name,"bad",true),"неверный логин");Accounts.SignIn(name,"Test2027!",true);Check(Convert.ToInt32(Database.Scalar("SELECT failed_attempts FROM users WHERE id=@p0",id))==0,"Successful login resets counter");
   Accounts.Save(admin,id,name,"Changed2027!","user",false);Check(Accounts.SignIn(name,"Changed2027!",true).Id==id,"Password change");
   Check(Notes.Read().Count==5&&Notes.Read(2147483647).Count==0,"Notes and empty result");
   Check(Notes.Read()[0].TitleUser=="Заметка 1 - student"&&Notes.Read()[0].FormattedDate=="15.03.2027","Response transformations");
  }finally{if(id>0)Database.Execute("DELETE FROM users WHERE id=@p0",id);}
  Console.WriteLine($"{Database.Stack}: {passed} checks passed; synthetic account removed.");
 }
}

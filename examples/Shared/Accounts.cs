using System.Security.Cryptography;
namespace Dkip;
public record Account(int Id, string Login, string Role);
public static class Accounts
{
    public const string Wrong = "Вы ввели неверный логин или пароль. Пожалуйста проверьте ещё раз введенные данные";
    public const string Locked = "Вы заблокированы. Обратитесь к администратору";
    public static string Hash(string password) { var salt = RandomNumberGenerator.GetBytes(16); return Convert.ToBase64String(salt) + ":" + Convert.ToBase64String(Rfc2898DeriveBytes.Pbkdf2(password, salt, 100000, HashAlgorithmName.SHA256, 32)); }
    public static bool Verify(string password, string hash) { try { var p = hash.Split(':'); return p.Length == 2 && CryptographicOperations.FixedTimeEquals(Convert.FromBase64String(p[1]), Rfc2898DeriveBytes.Pbkdf2(password, Convert.FromBase64String(p[0]), 100000, HashAlgorithmName.SHA256, 32)); } catch (FormatException) { return false; } }
    public static Account SignIn(string login, string password, bool puzzleSolved)
    {
        login = login.Trim().ToLowerInvariant();
        if (login.Length == 0 || password.Length == 0) throw new InvalidOperationException("Заполните логин и пароль.");
        using var c = Database.Open(); using var tx = c.BeginTransaction();
        using var command = Database.Command(c, "SELECT id,login,password_hash,role,failed_attempts,is_locked FROM users WHERE login=@p0 FOR UPDATE", login); command.Transaction = tx;
        int id, attempts; string stored, role;
        using (var reader = command.ExecuteReader()) { if (!reader.Read()) throw new InvalidOperationException(Wrong); if (Convert.ToBoolean(reader[5])) throw new InvalidOperationException(Locked); id = Convert.ToInt32(reader[0]); stored = (string)reader[2]; role = (string)reader[3]; attempts = Convert.ToInt32(reader[4]); }
        var passwordCorrect = Verify(password, stored); var accepted = passwordCorrect && puzzleSolved;
        attempts = accepted ? 0 : attempts + 1;
        using var update = Database.Command(c, "UPDATE users SET failed_attempts=@p0,is_locked=@p1 WHERE id=@p2", attempts, attempts >= 3, id); update.Transaction = tx; update.ExecuteNonQuery(); tx.Commit();
        if (attempts >= 3) throw new InvalidOperationException(Locked);
        if (!passwordCorrect) throw new InvalidOperationException(Wrong);
        if (!puzzleSolved) throw new InvalidOperationException("Пазл собран неверно. Переставьте фрагменты. Осталось попыток: " + (3 - attempts));
        return new Account(id, login, role);
    }
    public static void RequireAdmin(Account actor) { if (!Equals(Database.Scalar("SELECT role FROM users WHERE id=@p0 AND is_locked=FALSE", actor.Id), "admin")) throw new InvalidOperationException("Действие доступно только администратору."); }
    public static void Save(Account actor, int? id, string login, string password, string role, bool unlock)
    {
        RequireAdmin(actor); login = login.Trim().ToLowerInvariant();
        if (login.Length is < 1 or > 64 || role is not ("admin" or "user")) throw new InvalidOperationException("Введите логин до 64 символов и выберите роль.");
        if ((!id.HasValue || password.Length > 0) && password.Length < 6) throw new InvalidOperationException("Для нового пароля нужно не менее 6 символов.");
        if (id == actor.Id && role != "admin") throw new InvalidOperationException("Нельзя снять собственную роль администратора.");
        if (Convert.ToInt32(Database.Scalar("SELECT COUNT(*) FROM users WHERE login=@p0 AND id<>@p1", login, id ?? -1)) > 0) throw new InvalidOperationException("Пользователь с указанным логином уже существует.");
        if (!id.HasValue) Database.Execute("INSERT INTO users(login,password_hash,role,failed_attempts,is_locked) VALUES(@p0,@p1,@p2,0,FALSE)", login, Hash(password), role);
        else { Database.Execute("UPDATE users SET login=@p0,role=@p1 WHERE id=@p2", login, role, id); if (password.Length > 0) Database.Execute("UPDATE users SET password_hash=@p0 WHERE id=@p1", Hash(password), id); if (unlock) Database.Execute("UPDATE users SET failed_attempts=0,is_locked=FALSE WHERE id=@p0", id); }
    }
}

using System.Security.Cryptography;
namespace Dkip;

public record Account(int Id, string Login, string Role);
public static class Accounts
{
    public const string Wrong = "Вы ввели неверный логин или пароль. Пожалуйста проверьте ещё раз введенные данные";
    public const string Locked = "Вы заблокированы. Обратитесь к администратору";
    const int MaxAttempts = 3;

    // Соль хранится рядом с хешем. Сам пароль в БД не записываем.
    public static string Hash(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = DeriveHash(password, salt);
        return Convert.ToBase64String(salt) + ":" + Convert.ToBase64String(hash);
    }
    public static bool Verify(string password, string hash)
    {
        try
        {
            var parts = hash.Split(':');
            if (parts.Length != 2)
                return false;

            var salt = Convert.FromBase64String(parts[0]);
            var savedHash = Convert.FromBase64String(parts[1]);
            return CryptographicOperations.FixedTimeEquals(savedHash, DeriveHash(password, salt));
        }
        catch (FormatException)
        {
            return false;
        }
    }

    static byte[] DeriveHash(string password, byte[] salt) =>
        Rfc2898DeriveBytes.Pbkdf2(password, salt, 100000, HashAlgorithmName.SHA256, 32);

    public static Account SignIn(string login, string password, bool puzzleSolved)
    {
        login = login.Trim().ToLowerInvariant();
        if (login.Length == 0 || password.Length == 0)
            throw new InvalidOperationException("Заполните логин и пароль.");
        // Пока проверяем вход, другая попытка не может изменить эту строку.
        using var connection = Database.Open();
        using var transaction = connection.BeginTransaction();
        using var findUser = Database.Command(connection,
            "SELECT id, password_hash, role, failed_attempts, is_locked FROM users WHERE login=@p0 FOR UPDATE", login);
        findUser.Transaction = transaction;

        int id;
        int attempts;
        string savedHash;
        string role;
        using (var reader = findUser.ExecuteReader())
        {
            if (!reader.Read())
                throw new InvalidOperationException(Wrong);
            if (Convert.ToBoolean(reader["is_locked"]))
                throw new InvalidOperationException(Locked);

            id = Convert.ToInt32(reader["id"]);
            savedHash = (string)reader["password_hash"];
            role = (string)reader["role"];
            attempts = Convert.ToInt32(reader["failed_attempts"]);
        }

        bool passwordCorrect = Verify(password, savedHash);
        bool accepted = passwordCorrect && puzzleSolved;

        // Пароль и пазл делят один счётчик. Успешный вход его обнуляет.
        if (accepted)
            attempts = 0;
        else
            attempts++;

        bool blocked = attempts >= MaxAttempts;
        using var update = Database.Command(connection,
            "UPDATE users SET failed_attempts=@p0, is_locked=@p1 WHERE id=@p2", attempts, blocked, id);
        update.Transaction = transaction;
        update.ExecuteNonQuery();
        // Сохраняем результат даже при ошибке, иначе попытка потеряется.
        transaction.Commit();

        if (blocked)
            throw new InvalidOperationException(Locked);
        if (!passwordCorrect)
            throw new InvalidOperationException(Wrong);
        if (!puzzleSolved)
            throw new InvalidOperationException("Пазл собран неверно. Осталось попыток: " + (MaxAttempts - attempts));

        return new Account(id, login, role);
    }

    public static void RequireAdmin(Account actor)
    {
        if (!Equals(Database.Scalar("SELECT role FROM users WHERE id=@p0 AND is_locked=FALSE", actor.Id), "admin"))
            throw new InvalidOperationException("Действие доступно только администратору.");
    }
    public static void Save(Account actor, int? id, string login, string password, string role, bool unlock)
    {
        RequireAdmin(actor);
        login = login.Trim().ToLowerInvariant();
        if (login.Length is < 1 or > 64 || role is not ("admin" or "user"))
            throw new InvalidOperationException("Введите логин до 64 символов и выберите роль.");
        if (id is null && password.Length == 0)
            throw new InvalidOperationException("Введите пароль нового пользователя.");
        if (id == actor.Id && role != "admin")
            throw new InvalidOperationException("Нельзя снять собственную роль администратора.");
        if (Convert.ToInt32(Database.Scalar("SELECT COUNT(*) FROM users WHERE login=@p0 AND id<>@p1", login, id ?? -1)) > 0)
            throw new InvalidOperationException("Пользователь с указанным логином уже существует.");
        if (id is null)
        {
            Database.Execute(
                "INSERT INTO users(login, password_hash, role, failed_attempts, is_locked) VALUES(@p0,@p1,@p2,0,FALSE)",
                login, Hash(password), role);
            return;
        }

        // Пустой новый пароль сохраняет старый хеш. При разблокировке сбрасываем оба поля.
        string? newHash = password.Length > 0 ? Hash(password) : null;
        Database.Execute("""
            UPDATE users SET login=@p0, role=@p1, password_hash=COALESCE(@p2, password_hash),
                failed_attempts=CASE WHEN @p3 THEN 0 ELSE failed_attempts END,
                is_locked=CASE WHEN @p3 THEN FALSE ELSE is_locked END
            WHERE id=@p4
            """, login, role, newHash, unlock, id);
    }
}

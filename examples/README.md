# ДЭ 2027 — два запускаемых решения

Windows 10/11, .NET SDK 10; Visual Studio с разработкой классических приложений .NET. Учебный сайт не запускает EXE и не подключается к вашей БД.

1. Создайте **новую пустую** базу `dkip2027_course` в выбранной СУБД. MySQL: XAMPP → Start MySQL → phpMyAdmin → Создать БД, utf8mb4. PostgreSQL: pgAdmin → Databases → Create → Database.
2. Выполните `mysql/Sql/01-schema.sql` или `postgresql/Sql/01-schema.sql` в SQL / Query Tool. Схема не удаляет существующие таблицы.
3. Откройте PowerShell в корне распакованного проекта (где папка examples). Задайте подключение только на своём компьютере. Примеры:

```powershell
$env:DKIP_STACK='mysql'
$env:DKIP_CONNECTION='Server=127.0.0.1;Database=dkip2027_course;User ID=root;Password=;Character Set=utf8mb4'
# Для PostgreSQL вместо двух строк выше:
# $env:DKIP_STACK='postgresql'
# $env:DKIP_CONNECTION='Host=127.0.0.1;Port=5432;Database=dkip2027_course;Username=postgres;Password=ВАШ_ПАРОЛЬ'
dotnet run --project examples/Tools -- seed 'materials/basic/Задание 1/Заказчики.json'
```

Загрузка выполняется один раз в пустой базе. `check` вместо `seed` только проверяет результат.

4. Запустите выбранное приложение в том же PowerShell:

```powershell
dotnet run --project examples/mysql/Dkip.WinForms.csproj
# Или:
dotnet run --project examples/postgresql/Dkip.Wpf.csproj
```

Вход: `admin / Demo2027!` или `student / Demo2027!`. Это созданные разработчиком учебные записи. Соберите пазл, обменяв местами фрагменты. После трёх подряд ошибок учётная запись блокируется. Администратор выбирает пользователя, отмечает снятие блокировки и сохраняет. Приложения используют ту же базу, что и API выбранного маршрута.

5. В отдельном PowerShell задайте те же переменные подключения и запустите API:

```powershell
dotnet run --project examples/Api --urls http://127.0.0.1:5271
# Для PostgreSQL используйте 5272 и DKIP_STACK=postgresql.
```

Откройте `/swagger/`, выполните GET /notes. OpenAPI: `/openapi.json`. Swagger работает с локальными файлами, без CDN. Скопируйте `docs/postman-mysql.json` или `docs/postman-postgresql.json` в Postman через Import.

6. Для теста 500 запустите **отдельный** экземпляр API с заведомо неработающим подключением, не останавливая рабочую СУБД:

```powershell
# В отдельном окне, MySQL:
$env:DKIP_STACK='mysql'
$env:DKIP_CONNECTION='Server=127.0.0.1;Port=1;Database=dkip2027_course;User ID=demo;Connection Timeout=1'
dotnet run --project examples/Api --urls http://127.0.0.1:5281
# PostgreSQL: DKIP_STACK=postgresql, Host=127.0.0.1;Port=1;Database=dkip2027_course;Username=demo;Timeout=1
# Адрес второго экземпляра для этого маршрута: http://127.0.0.1:5282
```

Запрос к рабочему экземпляру даёт 200; к отдельному экземпляру с неверным подключением — 500 и JSON error. Подробности исключения остаются в консоли сервера. Тестовая неисправность не включается через публичный URL.

SQL, обработка JSON и авторизация расположены в Shared; UI Windows Forms — mysql; XAML и UI WPF — postgresql; HTTP — Api. Полные файлы видны в разделе «Примеры» курса. `docs/DECISIONS.md` фиксирует неоднозначности первичных документов.

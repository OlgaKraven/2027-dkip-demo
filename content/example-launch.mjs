const stacks = {
  mysql: {
    name: 'Windows Forms + XAMPP',
    database: 'MySQL / MariaDB',
    project: 'examples/mysql/Dkip.WinForms.csproj',
    application: 'Dkip.WinForms',
    port: 5271,
    errorPort: 5281,
    connection: 'Server=127.0.0.1;Port=3306;Database=dkip2027_course;User ID=root;Password=;Character Set=utf8mb4',
    prepare: [
      'В панели XAMPP нажмите Start у MySQL и Apache. Нажмите Admin в строке MySQL, чтобы открыть phpMyAdmin.',
      'В phpMyAdmin создайте пустую базу `dkip2027_course` с кодировкой `utf8mb4`. Выберите её, откройте «Импорт» и загрузите `examples/mysql/Sql/01-schema.sql`. После импорта обновите список таблиц.'
    ]
  },
  postgresql: {
    name: 'WPF + PostgreSQL',
    database: 'PostgreSQL',
    project: 'examples/postgresql/Dkip.Wpf.csproj',
    application: 'Dkip.Wpf',
    port: 5272,
    errorPort: 5282,
    connection: 'Host=127.0.0.1;Port=5432;Database=dkip2027_course;Username=postgres;Password=ВАШ_ПАРОЛЬ',
    prepare: [
      'Откройте pgAdmin и подключитесь к своему серверу PostgreSQL. Правой кнопкой по Databases → Create → Database. Создайте пустую базу `dkip2027_course`.',
      'Выберите новую базу и откройте Query Tool. Нажмите Open File, выберите `examples/postgresql/Sql/01-schema.sql` и выполните скрипт. После выполнения обновите список таблиц.'
    ]
  }
};

const code = value => '`'+value+'`';

export const exampleAccounts = {
  note: 'Введите эти данные в окне «Вход» настольного приложения.',
  headings: ['Роль', 'Логин', 'Пароль'],
  rows: [
    ['Администратор', 'admin', 'Demo2027!'],
    ['Пользователь', 'student', 'Demo2027!']
  ]
};

function archiveReadme(stack, setup, connectionHint) {
  return [
    `# Запуск примера · ${setup.name}`,
    '',
    'Распакуйте весь ZIP через «Извлечь всё». Открывайте файлы из распакованной папки. Все пути ниже идут от корня этой папки.',
    '',
    `Заранее установите ${setup.database} и клиент для импорта. Для готового EXE нужен .NET Desktop Runtime 10 x64. Для работы с кодом заранее установите Visual Studio 2026, нагрузку «Разработка классических приложений .NET» и .NET 10 SDK x64. Для отладки API также нужна нагрузка «ASP.NET и разработка веб-приложений». Ссылки на установщики есть в файле ${code('preparation.html')} в этом ZIP.`,
    '',
    '## 1. Импортируйте заполненную базу',
    '',
    ...setup.prepare.map((step,i)=>`${i+1}. ${step}`),
    `3. В той же базе выполните ${code(`examples/${stack}/Sql/02-demo-data.sql`)}. Обновите список таблиц. В ${code('users')} должны быть две записи, в ${code('notes')} — пять. Для повторной проверки импорта используйте новую пустую базу.`,
    `4. Запишите адрес, порт, имя и пароль пользователя СУБД. ${connectionHint}`,
    '',
    '## 2. Запустите готовый EXE',
    '',
    'Откройте PowerShell в распакованной папке. В первой строке выберите СУБД. Во второй подставьте свои реквизиты подключения. Если пароль содержит апостроф, запишите его в PowerShell как два подряд. Файлы DLL и папку Assets оставьте рядом с EXE.',
    '',
    '```powershell',
    `$env:DKIP_STACK='${stack}'`,
    `$env:DKIP_CONNECTION='${setup.connection}'`,
    `Start-Process ./Windows/Desktop/${setup.application}.exe`,
    '```',
    '',
    '## 3. Проверьте обе роли',
    '',
    '| Роль | Логин | Пароль | Что увидеть после входа |',
    '| --- | --- | --- | --- |',
    ...exampleAccounts.rows.toReversed().map(([role, login, password])=>{
      const visible = role==='Администратор' ? 'со списком учётных записей' : 'без панели учётных записей';
      return `| ${role} | ${code(login)} | ${code(password)} | ${code(`${login} · ${role}`)}, ${visible} |`;
    }),
    '',
    'Для каждой роли введите логин и пароль. Соберите изображение из четырёх частей. Два последовательных щелчка по фрагментам меняют их местами. Нажмите «Войти» → «ОК». Чтобы сменить роль, закройте рабочее окно. В форме входа замените логин, введите пароль и соберите новый пазл.',
    '',
    '## 4. Запустите исходники через F5 без интернета',
    '',
    'Закройте готовый EXE. В том же PowerShell сохранены переменные подключения. Запустите восстановление из папки `nuget-packages`, указанной в `NuGet.Config`. Выполните команды из корня архива.',
    '',
    '```powershell',
    'dotnet --version',
    'dotnet restore ./Dkip.Example.slnx --configfile ./NuGet.Config --no-http-cache',
    '$vswhere = Join-Path ${env:ProgramFiles(x86)} \'Microsoft Visual Studio/Installer/vswhere.exe\'',
    '$ide = & $vswhere -products \'*\' -version \'[18.0,19.0)\' -latest -property productPath',
    'Start-Process -FilePath $ide -ArgumentList (\'"{0}"\' -f (Resolve-Path ./Dkip.Example.slnx).Path)',
    '```',
    '',
    `В «Обозревателе решений» щёлкните правой кнопкой по ${code(setup.application)} → «Назначить в качестве запускаемого проекта». Проверьте имя проекта у зелёной кнопки запуска. Нажмите F5 и повторите проверку обеих ролей. Для повторного запуска закройте приложение или остановите отладку и снова нажмите F5. Если появляется ошибка подключения, проверьте запуск СУБД и переменные из шага 2.`,
    '',
    '## 5. Если нужно собрать исходники под .NET 9',
    '',
    'Распакуйте ZIP отдельно. Выберите установленный SDK 9 через `global.json`. В строке ниже замените `9.0.321` своей версией 9.0.3xx из `dotnet --list-sdks`. Проверьте, что `dotnet --version` показывает SDK 9.',
    '',
    '```powershell',
    'dotnet new globaljson --sdk-version 9.0.321 --roll-forward latestPatch',
    'dotnet --version',
    '```',
    '',
    `В ${code(setup.project)} замените ${code('net10.0-windows')} на ${code('net9.0-windows')}. В проектах ${code('examples/Shared')}, ${code('examples/Api')} и ${code('examples/Tools')} смените ${code('net10.0')} на ${code('net9.0')}. Затем выполните восстановление и F5 по шагу 4. Драйверы и их зависимости для обеих версий уже в ZIP. Папка ${code('Windows/Desktop')} содержит готовую сборку .NET 10.`,
    '',
  ].join('\n');
}

export const exampleLaunch = Object.fromEntries(Object.entries(stacks).map(([stack, setup])=>{
  const baseUrl = `http://127.0.0.1:${setup.port}`;
  const connectionHint = stack==='mysql'
    ? 'Укажите порт и учётные данные своей СУБД. Если у пользователя MySQL есть пароль, заполните `Password`.'
    : 'Подставьте пароль пользователя PostgreSQL. Если у вашей установки другие имя пользователя или порт, замените их в строке подключения.';
  const sections = [
    {title:'Распакуйте ZIP и создайте базу', steps:[
      'В Проводнике нажмите правой кнопкой по ZIP → «Извлечь всё». Откройте получившуюся папку. Внутри должны быть `examples`, `docs` и `materials`.',
      ...setup.prepare
    ]},
    {title:'Импортируйте учебные данные', steps:[
      `В той же базе выполните ${code('examples/'+stack+'/Sql/02-demo-data.sql')}. В базе появятся шесть заказчиков из исходного JSON, данные для расчёта, два пользователя и пять заметок.`,
      'В корне ZIP откройте `preparation.html`. Команды для EXE даны в разделе «Проверьте запуск готового примера», восстановление NuGet и сборка — в разделе разработки.',
      `Для отладки в Visual Studio восстановите пакеты из ZIP, откройте ${code('Dkip.Example.slnx')} и задайте ${code('DKIP_STACK')} со значением ${code(stack)} и ${code('DKIP_CONNECTION')} со строкой ниже.\n${code(setup.connection)}\n${connectionHint}`
    ]},
    {title:'Запустите настольное приложение', steps:[
      `В Visual Studio откройте ${code(setup.project)}. В свойствах отладки этого проекта задайте те же ${code('DKIP_STACK')} и ${code('DKIP_CONNECTION')}, затем нажмите Ctrl+F5.`,
      {afterAccounts:'По очереди нажимайте на два фрагмента, чтобы поменять их местами и собрать изображение. Нажмите «Войти».'},
      'В рабочем окне видны логин и роль. Администратор может добавить пользователя, изменить данные или снять блокировку.'
    ]},
    {title:'Откройте API и проверьте запросы', steps:[
      `Откройте ${code('examples/Api/Dkip.Api.csproj')} в другом окне Visual Studio. В свойствах отладки выберите или создайте профиль запуска проекта, добавьте ${code('DKIP_STACK')} и ${code('DKIP_CONNECTION')}. В поле App URL укажите ${code(baseUrl)} и нажмите Ctrl+F5.`,
      `В браузере откройте ${code(baseUrl+'/notes')}. При успешном запуске появится JSON с заметками. В Postman отправьте GET /notes и сверьте статус 200 и содержимое Body.`,
      `В Postman нажмите Import, выберите ${code('docs/postman-'+stack+'.json')} и запустите запросы коллекции. Для проверки HTTP 500 используйте отдельную копию API с нерабочим портом базы и адресом ${code('http://127.0.0.1:'+setup.errorPort)}. Запрос к этому адресу указан в переменной error_url коллекции.`
    ]}
  ];
  const requirements = 'Windows 10/11, .NET 10 и Visual Studio с компонентами для классических приложений .NET и ASP.NET.';
  const readme = archiveReadme(stack, setup, connectionHint);
  return [stack,{name:setup.name,database:setup.database,baseUrl,requirements,sections,readme}];
}));

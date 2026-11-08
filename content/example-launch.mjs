const stacks = {
  mysql: {
    name: 'Windows Forms + XAMPP',
    database: 'MySQL / MariaDB',
    project: 'examples/mysql/Dkip.WinForms.csproj',
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

function readmeStep(step, index) {
  const text = typeof step==='string' ? step : [
    exampleAccounts.note, '',
    `| ${exampleAccounts.headings.join(' | ')} |`,
    '| --- | --- | --- |',
    ...exampleAccounts.rows.map(([role, login, password])=>`| ${role} | ${code(login)} | ${code(password)} |`),
    '', step.afterAccounts
  ].join('\n');
  const prefix = `${index+1}. `;
  const [first, ...remaining] = text.split('\n');
  return [prefix+first, ...remaining.map(line=>line && ' '.repeat(prefix.length)+line)].join('\n');
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
    {title:'Загрузите данные в Visual Studio', steps:[
      'Откройте «Файл» → «Открыть» → «Проект или решение». Выберите `examples/Tools/Dkip.Tools.csproj` и дождитесь загрузки зависимостей.',
      `В Обозревателе решений выделите проект. Откройте «Отладка» → «Свойства отладки Dkip.Tools». В разделе Environment variables задайте ${code('DKIP_STACK')} со значением ${code(stack)} и ${code('DKIP_CONNECTION')} со строкой подключения ниже.\n${code(setup.connection)}\n${connectionHint}`,
      'В поле «Аргументы командной строки» введите `seed`, затем пробел и полный путь к `materials/basic/Задание 1/Заказчики.json` в двойных кавычках. Нажмите Ctrl+F5 и дождитесь сообщения о загрузке. Выполняйте `seed` один раз в пустой базе. Для контрольной проверки замените аргументы запуска на `check` и снова нажмите Ctrl+F5.'
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
  const readme = [`# Запуск примера · ${setup.name}`, requirements, ...sections.map(({title,steps})=>
    `## ${title}\n\n${steps.map(readmeStep).join('\n')}`)
  ].join('\n\n')+'\n';
  return [stack,{name:setup.name,database:setup.database,baseUrl,requirements,sections,readme}];
}));

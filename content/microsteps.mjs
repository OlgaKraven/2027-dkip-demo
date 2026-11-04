// Concrete UI actions are placed at the point where the student needs them.
// Preparation must not execute the same CREATE/INSERT twice.
export function expandMicrosteps(stage, foundation){
 const checks={
  'Проверьте Windows и программы':'В Windows открывается Visual Studio; доступны нужные шаблоны и .NET 10. СУБД и Postman установлены.',
  'Подготовьте собственное место работы':'В адресной строке Проводника показана ваша рабочая папка. Прежние работы сохранены.',
  'Сохраните исходные документы':'Архив распакован. В Проводнике открываются папки приложений к шести заданиям.',
  'Разделите свою работу и готовый пример':'Собственные исходники и распакованный пример находятся в разных папках.',
  'Выберите редактор':'Открыт пустой документ ER; доступны фигуры сущностей и соединители.',
  'Откройте файл импорта':'В Program.cs находится код чтения JSON и параметризованного INSERT в транзакции; файл сохранён.',
  'Передайте путь к исходному JSON':'В аргументах запуска указан полный путь к существующему Заказчики.json в двойных кавычках.',
  'Запустите и проверьте импорт':'Программа сообщает о шести импортированных заказчиках. SELECT показывает шесть исходных записей.',
  'Подготовьте строки для расчёта':'В своих таблицах присутствуют заказ, продукция, спецификация, ресурсы и цены из исходных Excel.',
  'Проверьте пустое окно':'Своё пустое окно открылось без ошибок и закрылось крестиком.',
  'Подключите первую кнопку':'Нажатие кнопки показывает «Кнопка работает». Значит, событие Click связано с обработчиком.',
  'Добавьте файл доступа к базе':'В проекте появились Database.cs и Accounts.cs; пространство имён согласовано с остальными файлами.',
  'Создайте первые учебные записи':'В users появились admin и student с хешами и солью. Повторный запуск отказывается менять непустую таблицу.',
  'Запустите первый HTTP-проект':'Браузер показывает Hello World! от своего API; после проверки процесс остановлен.',
  'Добавьте чтение заметок':'В Api добавлены классы доступа к базе и чтения заметок; проект собирается без ошибок.',
  'Настройте HTTP-адрес Api':'Выбран профиль проекта http. App URL содержит адрес текущего учебного маршрута.',
  'Откройте работающий метод':'По адресу /notes получен настоящий JSON из своей базы, приложение продолжает работать.'
 };
 function prepare(item){
  let check=checks[item.title];
  if(item.title.startsWith('Откройте создание проекта '))check='Открылось окно Create a new project с полем поиска шаблонов.';
  if(item.title.startsWith('Выберите шаблон '))check='Выбран нужный шаблон C# современного .NET; открыта настройка имени проекта.';
  if(item.title.startsWith('Задайте имя и папку '))check='В Обозревателе решений появился проект с заданным именем и выбранной платформой .NET 10.';
  if(item.title.startsWith('Откройте пакеты '))check='Открыт NuGet → Browse; найден пакет провайдера с точным названием.';
  if(item.title.startsWith('Выберите версию '))check='В Version выбрана нужная версия; кнопка Install доступна.';
  if(item.title.startsWith('Установите провайдер '))check='Установка завершилась; в карточке пакета показана установленная версия.';
  if(item.title.startsWith('Проверьте провайдер '))check='Провайдер появился в Dependencies → Packages; сборка решения завершилась без ошибок.';
  if(item.title.startsWith('Откройте профиль подключения '))check='Открыто окно профилей запуска именно нужного проекта; видна таблица Environment variables.';
  if(item.title.startsWith('Введите параметры подключения '))check='В DKIP_CONNECTION указаны параметры своей учебной базы, без незаменённых заглушек.';
  if(item.title.startsWith('Задайте маршрут и сохраните '))check='В профиле сохранён DKIP_STACK выбранной СУБД; файл с настоящим паролем исключён из Git.';
  if(!check)throw new Error('Missing observable result: '+item.title);
  let why=foundation.intro;
  if(item.title.startsWith('Откройте создание проекта '))why='Проект объединяет исходные файлы и настройки сборки. Сначала откройте мастер создания нового проекта в Visual Studio.';
  if(item.title.startsWith('Выберите шаблон '))why='Шаблон определяет тип приложения и начальные файлы. Названия современного .NET и .NET Framework похожи, но это разные платформы.';
  if(item.title.startsWith('Задайте имя и папку '))why='Имя отличает проект в Обозревателе решений, расположение определяет папку исходников на диске, платформа — способ сборки.';
  if(item.title.startsWith('Откройте пакеты ')||item.title.startsWith('Установите провайдер ')||item.title.startsWith('Выберите версию ')||item.title.startsWith('Проверьте провайдер '))why='Провайдер — библиотека, через которую C# подключается к выбранной СУБД. NuGet устанавливает её зависимость в конкретный проект.';
  if(item.title.includes('подключения ')||item.title.startsWith('Задайте маршрут и сохраните '))why='Профиль запуска передаёт настройки программе. Адрес сервера и пароль БД отличаются от логина и пароля пользователя приложения.';
  let screenshot=item.shot;
  if(item.title.startsWith('Откройте создание проекта '))screenshot='vs-start';
  if(item.title==='Выберите шаблон MyApp')screenshot='vs-template';
  if(['Откройте пакеты ','Выберите версию ','Установите провайдер ','Проверьте провайдер '].some(p=>item.title.startsWith(p)))screenshot='vs-packages';
  if(['Откройте профиль подключения ','Введите параметры подключения ','Задайте маршрут и сохраните '].some(p=>item.title.startsWith(p))||item.title==='Передайте путь к исходному JSON')screenshot='connection';
  return {title:item.title,why,actions:[item.text],check,...(item.code?{code:item.code}:{}),...(item.file?{file:item.file}:{}),...(screenshot?{shot:screenshot}:{}),preparation:true};
 }
 const byTitle=title=>{const x=foundation.steps.find(x=>x.title===title);if(!x)throw new Error(title);return x;};
 const group=predicate=>foundation.steps.filter(predicate).map(x=>prepare(x));
 const named=(...names)=>names.map(n=>prepare(byTitle(n)));
 const project=name=>group(x=>['Откройте создание проекта ','Выберите шаблон ','Задайте имя и папку ','Откройте пакеты ','Установите провайдер ','Выберите версию ','Проверьте провайдер '].some(p=>x.title===p+name));
 const connection=name=>group(x=>['Откройте профиль подключения ','Введите параметры подключения ','Задайте маршрут и сохраните '].some(p=>x.title===p+name));
 const result=[];
 for(const [i,step] of stage.steps.entries()){
  if(stage.id==='documents'&&i===0)result.push(...named('Проверьте Windows и программы'));
  if(stage.id==='documents'&&i===1){result.push(...named('Подготовьте собственное место работы','Сохраните исходные документы','Разделите свою работу и готовый пример'));continue;}
  if(stage.id==='M1'&&i===0)result.push(...named('Выберите редактор'));
  if(stage.id==='M2'&&i===5){result.push(...project('Import'),...connection('Import'));continue;}
  if(stage.id==='M2'&&i===6){result.push(...named('Откройте файл импорта','Передайте путь к исходному JSON','Запустите и проверьте импорт'));continue;}
  if(stage.id==='M3'&&i===0)result.push(...named('Подготовьте строки для расчёта'));
  if(stage.id==='M4'&&i===0){result.push(...project('MyApp'),...named('Проверьте пустое окно','Добавьте файл доступа к базе'));continue;}
  if(stage.id==='M4'&&i===1){result.push(...connection('MyApp'));continue;}
  if(stage.id==='M4'&&i===3)result.push(...named('Подключите первую кнопку'));
  if(stage.id==='M4'&&i===5)result.push(...project('AccountSetup'),...connection('AccountSetup'),...named('Создайте первые учебные записи'));
  if(stage.id==='M5'&&i===4)result.push(...project('Api'),...connection('Api'),...named('Настройте HTTP-адрес Api','Запустите первый HTTP-проект','Добавьте чтение заметок'));
  result.push(step);
 }
 return result;
}

// Concrete UI actions are placed at the point where the student needs them.
// Preparation must not execute the same CREATE/INSERT twice.
export function expandMicrosteps(stage, foundation){
 const checks={
  'Проверьте Windows и программы':'В Visual Studio доступен нужный шаблон C# и .NET 10. Postman открывается. Сервер базы данных отвечает в phpMyAdmin или pgAdmin, в зависимости от выбранного стека.',
  'Подготовьте собственное место работы':'На рабочем столе Windows есть папка, названная по шаблону Surname + Subject Area.',
  'Сохраните исходные документы':'В папке «Исходные данные» видны папки «Задание 1» — «Задание 6». Внутри «Задание 1» открывается «Заказ покупателя.xlsx».',
  'Подготовьте папку для результатов':'В рабочей папке рядом лежат «Исходные данные» с материалами КИМ и пустая папка «Результаты».',
  'Откройте draw.io':'Открыт редактор draw.io. На холсте пока нет фигур, слева видна панель фигур.',
  'Подключите библиотеку ER':'В левой панели раскрыт раздел «Отношения сущностей». В нём видны фигуры таблиц и линий связи.',
  'Добавьте фигуру таблицы':'На холсте появилась фигура Table с заголовком и строками, включая строку PK.',
  'Подготовьте строки для расчёта':'В заказе № 1 одна строка на два стола. В спецификации этого стола восемь строк состава. Для каждого из восьми ресурсов внесена цена с датой 01.04.2026.',
  'Проверьте пустое окно':'Своё пустое окно открылось без ошибок и закрылось крестиком.',
  'Запустите первый HTTP-проект':'Браузер показывает Hello World! от своего API; после проверки процесс остановлен.',
  'Настройте HTTP-адрес Api':'Выбран профиль проекта http. App URL содержит адрес текущего учебного маршрута.',
  'Откройте работающий метод':'По адресу /notes получен настоящий JSON из своей базы, приложение продолжает работать.'
 };
 const preparationNotes={
  'Проверьте Windows и программы':'Проверка среды заранее помогает понять, можно ли на этом компьютере собрать приложение и проверить API.',
  'Подготовьте собственное место работы':'В одной рабочей папке проще найти все файлы, которые вы создадите на следующих этапах.',
  'Сохраните исходные документы':'Эти документы понадобятся для схемы, импорта заказчиков и расчёта стоимости.',
  'Подготовьте папку для результатов':'Готовые файлы будет проще найти, если хранить их отдельно от исходных документов.'
 };
 const preparationResources={
  'Сохраните исходные документы':['archive'],
  'Откройте draw.io':['drawio']
 };
 const preparationScreens={
  'Откройте draw.io':'drawio-editor',
  'Подключите библиотеку ER':'drawio-library',
  'Добавьте фигуру таблицы':'drawio-table'
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
  let why=preparationNotes[item.title]||foundation.intro;
  if(item.title.startsWith('Откройте создание проекта '))why='Проект объединяет исходные файлы и настройки сборки. Сначала откройте мастер создания нового проекта в Visual Studio.';
  if(item.title.startsWith('Выберите шаблон '))why='Шаблон определяет тип приложения и начальные файлы. Названия современного .NET и .NET Framework похожи, но это разные платформы.';
  if(item.title.startsWith('Задайте имя и папку '))why='Имя отличает проект в Обозревателе решений, расположение определяет папку исходников на диске, платформа — способ сборки.';
  if(item.title.startsWith('Откройте пакеты ')||item.title.startsWith('Установите провайдер ')||item.title.startsWith('Выберите версию ')||item.title.startsWith('Проверьте провайдер '))why='Провайдер — библиотека, через которую C# подключается к выбранной СУБД. NuGet устанавливает её зависимость в конкретный проект.';
  if(item.title.includes('подключения ')||item.title.startsWith('Задайте маршрут и сохраните '))why='Профиль запуска передаёт настройки программе. Адрес сервера и пароль БД отличаются от логина и пароля пользователя приложения.';
  let screenshot=item.shot||preparationScreens[item.title];
  if(item.title.startsWith('Откройте создание проекта '))screenshot='vs-start';
  if(item.title==='Выберите шаблон MyApp')screenshot='vs-template';
  if(['Откройте пакеты ','Выберите версию ','Установите провайдер ','Проверьте провайдер '].some(p=>item.title.startsWith(p)))screenshot='vs-packages';
  if(['Откройте профиль подключения ','Введите параметры подключения ','Задайте маршрут и сохраните '].some(p=>item.title.startsWith(p)))screenshot='connection';
  const actions=item.actionGroups?.flatMap(group=>group.actions)??[item.text].flat();
  return {title:item.title,why,actions,check,resources:item.resources||preparationResources[item.title],...(item.actionGroups?{actionGroups:item.actionGroups}:{}),...(item.codeBlocks?{codeBlocks:item.codeBlocks}:{}),...(item.code?{code:item.code}:{}),...(item.file?{file:item.file}:{}),...(screenshot?{shot:screenshot}:{}),preparation:true};
 }
 const byTitle=title=>{const x=foundation.steps.find(x=>x.title===title);if(!x)throw new Error(title);return x;};
 const group=predicate=>foundation.steps.filter(predicate).map(x=>prepare(x));
 const named=(...names)=>names.map(n=>prepare(byTitle(n)));
 const project=name=>group(x=>['Откройте создание проекта ','Выберите шаблон ','Задайте имя и папку ','Откройте пакеты ','Установите провайдер ','Выберите версию ','Проверьте провайдер '].some(p=>x.title===p+name));
 const connection=name=>group(x=>['Откройте профиль подключения ','Введите параметры подключения ','Задайте маршрут и сохраните '].some(p=>x.title===p+name));
 if(stage.id==='M4'){
  const projectSteps=project('MyApp');
  const tag=(steps,name)=>steps.map(step=>({...step,group:name}));
  return [
   ...tag([...projectSteps.slice(0,3),...named('Проверьте пустое окно')],'Окно входа'),
   ...stage.steps.filter(step=>step.group==='Окно входа'),
   ...tag([...projectSteps.slice(3),...connection('MyApp')],'Учётные записи'),
   ...stage.steps.filter(step=>step.group!=='Окно входа')
  ];
 }
 const result=[];
 for(const [i,step] of stage.steps.entries()){
  if(stage.id==='documents'&&i===0)result.push(...named('Проверьте Windows и программы'));
  if(stage.id==='documents'&&i===1){result.push(...named('Подготовьте собственное место работы','Сохраните исходные документы','Подготовьте папку для результатов'));continue;}
  if(stage.id==='M1'&&i===0)result.push(...named('Откройте draw.io','Подключите библиотеку ER','Добавьте фигуру таблицы'));
  if(stage.id==='M3'&&i===0)result.push(...named('Подготовьте строки для расчёта'));
  if(stage.id==='M5'&&i===2)result.push(...project('Api'),...connection('Api'),...named('Настройте HTTP-адрес Api','Запустите первый HTTP-проект'));
  result.push(step);
 }
 return result;
}

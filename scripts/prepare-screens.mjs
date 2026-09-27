import fs from 'node:fs';
import {stagesFor} from '../content/course.mjs';
const captions={
kim:'КИМ 09.02.07-5-2027, страница 30: начало заданий ГИА БУ. Изображение оригинальной страницы PDF.',
project:'Исходный файл интерфейса в Visual Studio.',
'order-source':'Заказ покупателя из приложения открыт в Excel.',
'spec-source':'Спецификация: материалы, количества и нормы технологических операций в Excel.',
'json-source':'Исходный Заказчики.json открыт в редакторе без изменения значений.',
decisions:'Записанные допущения по неоднозначным данным исходных документов.',
er:'Поэтапный разбор ER: отдельное поле, исходный документ и объяснение справа.',
'db-start':'XAMPP Control Panel: запущены Apache и MySQL (MariaDB).',
'db-create':'Поля создания отдельной учебной базы данных.',
'db-schema':'SQL создания таблиц и ограничений в редакторе.',
'db-tables':'Созданные таблицы учебной базы в редакторе СУБД.',
import:'Код загрузки исходного JSON и демонстрационных данных.',
'db-import':'Импортированные исходные контрагенты и две явно обозначенные записи из документов.',
'db-keys':'Внешние ключи учебной базы данных.',
'db-export':'Настройка SQL-выгрузки в редакторе СУБД.',
'db-restore':'Запрос к отдельной восстановленной базе dkip2027_restore.',
'cost-lines':'Проверка двух строк материалов через SQL: 6500 и 14,28.',
'cost-query':'Выполнение запроса к представлению order_cost.',
'cost-result':'Результат расчёта в СУБД: 14 374,28.',
connection:'Выбор провайдера и чтение локальных переменных подключения в Database.cs.',
login:'Настоящее окно авторизации приложения.',
puzzle:'Исходное изображение и четыре переставляемых фрагмента в работающем приложении.',
'login-error':'Сообщение работающего приложения при неверном вводе.',
locked:'Работающее приложение сообщает о блокировке после трёх неудачных попыток.',
success:'Подтверждение успешной авторизации.',
main:'Рабочая форма заказа и результат расчёта себестоимости.',
users:'Рабочее место администратора с записями пользователей.',
unlock:'Выбор пользователя и отметка снятия блокировки в работающем приложении.',
'notes-table':'Пять исходных записей notes в редакторе СУБД.',
'notes-code':'Код JOIN и преобразования полей ответа в Notes.cs.',
'api-code':'Код HTTP-маршрутов и обработки ошибок в Program.cs.',
'api-400':'Настоящий JSON-ответ на user_id=abc. Статус 400 отдельно подтверждён HTTP-тестами.',
'api-empty':'Swagger UI: настоящий ответ 200 с пустым массивом [].',
'api-start':'Консоль запущенного локального API с адресом прослушивания.',
postman:'Postman Lightweight: настоящий ответ локального API. Коллекция отдельно проверена Newman.',
'postman-import':'Файл коллекции Postman: адреса base_url и error_url перед импортом.',
'postman-tests':'Postman: выполненные проверки HTTP 200, JSON и преобразованных полей.',
'api-500':'Swagger UI отдельного тестового процесса: настоящий ответ 500 при отказе подключения к БД.',
'doc-template':'Исходный шаблон Приложения 3 открыт в Microsoft Word.',
'doc-filled':'Заполненный исходный шаблон документации API в Microsoft Word.',
swagger:'Swagger UI запущенного API: два доступных GET-пути.',
'swagger-expanded':'Раскрытое описание GET /notes в Swagger UI.',
'swagger-parameter':'Try it out: необязательный параметр user_id в Swagger UI.',
'swagger-200':'Swagger UI: фактический HTTP 200 и список обработанных заметок.',
'swagger-filter':'Swagger UI: запрос user_id=2 и заметки выбранного автора.',
'swagger-empty':'Swagger UI: отсутствующий автор, HTTP 200 и [].',
openapi:'Файл OpenAPI JSON, полученный с работающего сервера.',
'openapi-paths':'Раздел paths в OpenAPI: путь, GET и параметры запроса.',
'openapi-schemas':'Раздел components.schemas: обязательные поля Note и схема ошибки.'
};
const screens={};
for(const stack of ['mysql','postgresql']){
 screens[stack]={};
 for(const name of new Set(stagesFor(stack).flatMap(s=>s.steps.map(x=>x.shot)).concat(['main','users','login','swagger-200']))){
  const target=name==='api-empty'?'swagger-empty':name;
  const file=name==='kim'?'materials/screenshots/common/kim.png':`materials/screenshots/${stack}/${target}.png`;
  if(!fs.existsSync(file))throw Error('Missing screenshot '+file);
  if(!captions[name])throw Error('Missing caption '+name);
  screens[stack][name]={file,caption:captions[name]+(name==='kim'?'':` Маршрут: ${stack==='mysql'?'Windows Forms / XAMPP MySQL':'WPF / PostgreSQL'}.`)};
 }
}
fs.writeFileSync('content/screens.json',JSON.stringify(screens,null,2));
console.log('All 144 microsteps reference existing evidence images.');

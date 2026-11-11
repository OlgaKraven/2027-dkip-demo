const guidance = {
  documents: {
    say:'Перед вами пример про мебельное производство. Мы начнём с заказа на два стола «Самобранка» и дойдём до приложения, сервиса и документации.',
    show:'Разложите КИМ и приложения по папкам. Откройте заказ покупателя, спецификацию и цены. Покажите, где искать количество, норму и цену.',
    result:'На рабочем столе есть папка Surname + Subject Area. Исходные файлы остаются отдельно от результатов.'
  },
  M1:{
    say:'Из документов выделим сущности — то, о чём надо хранить отдельные записи. Затем свяжем их ключами.',
    show:'Начните с контрагента. Покажите, как строка заказа ссылается на заказ, а заказ — на покупателя. Затем откройте готовую схему и сопоставьте её с документами.',
    result:'ER-диаграмма.pdf открывается и читается. ER-диаграмма.drawio остаётся для правок.'
  },
  M2:{
    say:'Схема из задания 1 становится таблицами в MySQL / MariaDB. Импортируем клиентов только после того, как создали для них таблицу.',
    show:'В XAMPP запустите Apache и MySQL, затем откройте phpMyAdmin. Покажите создание таблицы и связей в конструкторе, импорт в counterparty, «Обзор» и экспорт базы.',
    result:'В counterparty шесть строк. Первый id — 000000001, ведущие нули сохранены. Есть файл выгрузки dkip2027-mysql.sql.'
  },
  M3:{
    say:'Рассчитаем затраты на изготовление двух столов. Скидка и итог к оплате берутся из другого расчёта.',
    show:'Сначала вручную посчитайте столешницы, евровинты и операции. Потом выполните запрос и сопоставьте его результат с ручным итогом.',
    result:'03-cost.sql даёт 14 374,28: материалы 9 974,28 и операции 4 400.'
  },
  M4:{
    say:'Сначала собираем форму в конструкторе, затем связываем кнопки с кодом. После входа пользователь и администратор увидят разные возможности.',
    show:'Откройте Toolbox в Visual Studio. Покажите поля, подключение Click, сборку пазла и вход под обеими ролями. На отдельной тестовой записи проверьте блокировку.',
    result:'Есть проект MyApp с исходниками и снимки входа, администрирования и проверки блокировки.'
  },
  M5:{
    say:'Создадим отдельный HTTP-сервис на ASP.NET Core Minimal APIs. Он читает ту же базу, что и настольное приложение.',
    show:'Запустите API, отправьте GET /notes в Postman и сравните ответ с данными в базе. Запустите коллекцию тестов целиком.',
    result:'Сохранены проект Api, коллекция Postman и результаты тестов. Сервис возвращает поля и формат из приложения к КИМ.'
  },
  M6:{
    say:'Документацию пишем по работающему сервису. Точный запрос и фактический ответ берём из Postman.',
    show:'Откройте приложение 3. Сопоставьте разделы шаблона с запросом, параметрами и ответом. Откройте заполненный DOCX и проверьте его по запущенному API.',
    result:'Готов документ Прил_6_ОЗ_КИМ_09.02.07-5-2027.docx, заполненный по шаблону КИМ.'
  }
};

function blocks(items,maxLength=610,maxItems=4) {
  const result=[];
  for (const item of items.filter(Boolean)) {
    let group=result.at(-1);
    if(!group||group.length>=maxItems||group.join(' ').length+item.length>maxLength) result.push(group=[]);
    group.push(item);
  }
  return result.length?result:[[]];
}

function codePages(code) {
  const lines=code.trimEnd().split('\n'),pages=[];
  let part=[],rows=0;
  for(const line of lines){
    const height=Math.max(1,Math.ceil(line.length/95));
    if(part.length&&rows+height>16){pages.push(part.join('\n'));part=[];rows=0;}
    part.push(line);rows+=height;
  }
  if(part.length)pages.push(part.join('\n'));
  return pages;
}

export function teacherDeck(data,stack) {
  const mysql=stack==='mysql';
  const stackName=mysql?'Windows Forms + MySQL / MariaDB':'WPF + PostgreSQL';
  const desktop=mysql?'Windows Forms':'WPF',editor=mysql?'phpMyAdmin':'pgAdmin';
  const exampleZip='downloads/dkip2027-'+stack+'.zip';
  const stages=data.stages[stack],screens=data.screens[stack],slides=[],chapters=[];
  const databaseGuidance=mysql?guidance.M2:{
    say:'Схема из задания 1 становится таблицами в PostgreSQL. Импортируем клиентов после создания таблицы.',
    show:'В pgAdmin откройте Query Tool. Покажите создание таблиц, импорт в counterparty, просмотр строк и выгрузку базы.',
    result:'В counterparty шесть строк. Первый id — 000000001, ведущие нули сохранены. Есть файл выгрузки dkip2027-postgresql.sql.'
  };
  const image=key=>key?screens[key]:undefined;
  const add=(kind,chapter,title,props={})=>slides.push({kind,chapter,title,...props});
  const start=(id,label)=>chapters.push({id,label,index:slides.length});
  start('intro','Введение');
  add('cover','intro','Демонстрационный экзамен 2027');
  const duration=data.official.minutes, points=data.official.points;
  add('facts','intro','Как устроен экзамен',{
    facts:[[Math.floor(duration/60)+' ч '+duration%60+' мин',duration+' минут на выполнение'],['Базовый','Уровень ГИА ДЭ'],[String(points),'Максимум баллов']],
    body:'Разбираем официальный образец КИМ '+data.official.code+'. Предприятие выпускает мебель по спецификациям. Нужно связать исходные документы, базу данных, программу для пользователей и сервис.',
    note:'Объясните группе, что 3 ч 30 мин — время экзамена. Разбор на занятиях можно разбить по заданиям.'
  });
  add('table','intro','Шесть заданий и время',{
    columns:['Задание','Время'],
    rows:data.tasks.map((t,i)=>[(i+1)+'. '+t.title,t.minutes+' мин']),
    note:'Стек примера: '+stackName+'. Для API используем ASP.NET Core Minimal APIs, для запросов и тестов — Postman.'
  });
  const contentsPage=slides.length;
  add('table','intro','Содержание',{columns:['Раздел','Слайд']});
  add('text','intro','Что открыть перед занятием',{
    actions:[
      'Откройте КИМ на страницах 30–32 и скачайте приложения к официальному образцу. Проверьте, что открываются Excel, JSON, PDF и шаблон DOCX.',
      'Проверьте Visual Studio с поддержкой .NET, '+(mysql?'XAMPP с phpMyAdmin':'PostgreSQL с pgAdmin')+', draw.io и Postman.',
      'Распакуйте готовый пример отдельно от рабочей папки. В Visual Studio откройте решение или файл проекта. Перед входом подготовьте базу и учебные записи по инструкции запуска.'
    ],
    links:[['КИМ · PDF','materials/kim-2027.pdf#page=30'],['Исходные файлы · ZIP','downloads/basic-inputs.zip'],['Готовый пример · ZIP',exampleZip]],
    check:'Исходные документы и готовый пример открываются с одного учебного компьютера.'
  });
  for(const s of stages){
    const t=data.tasks.find(t=>t.id===s.id),g=s.id==='M2'?databaseGuidance:guidance[s.id];
    const order=t?Number(s.id.slice(1)):0;
    start(s.id,order?order+'. '+s.title:'Подготовка');
    add('section',s.id,s.title,{
      eyebrow:order?'Задание '+order+' · '+t.minutes+' мин':'Перед началом',
      body:g.say,note:g.show,check:g.result
    });
    const kim=data.kimAssignments[s.id];
    if(kim){
      const pages=blocks(kim.paragraphs,540,3);
      pages.forEach((text,i)=>add('text',s.id,kim.title,{
        eyebrow:'Условие из КИМ'+(pages.length>1?' · '+(i+1)+'/'+pages.length:''),
        paragraphs:text,
        source:i===pages.length-1?'Приложение: '+kim.attachment:undefined,
        links:i===pages.length-1?[['КИМ · стр. '+t.pages,'materials/kim-2027.pdf#page='+String(t.pages).match(/\d+/)?.[0]],['Исходные файлы · ZIP','downloads/basic-inputs.zip']]:undefined
      }));
    }
    s.steps.forEach((step,i)=>{
      const stepKey=s.id+':'+(i+1);
      const segments=(step.actionGroups||[{actions:step.actions,shot:step.shot}]).flatMap(group=>{
        const shot=image(group.shot);
        return blocks(group.actions,shot?520:550,shot?3:4).map((actions,j)=>({actions,heading:group.title,image:j===0?shot:undefined}));
      });
      const mainImage=image(step.shot);
      if(mainImage&&!segments.some(s=>s.image?.file===mainImage.file)){
        if(segments.length===1&&segments[0].actions.join(' ').length<=520) segments[0].image=mainImage;
        else segments.push({actions:[],image:mainImage,heading:'Покажите результат на экране'});
      }
      const details=segments.map((segment,j)=>({
        ...segment,body:j===0?step.why:undefined,
        check:j===segments.length-1?step.check:undefined,source:step.source,
        resources:j===segments.length-1?step.resources?.filter(s=>s!=='kim'):undefined,
        links:j===segments.length-1?step.links:undefined
      })).flatMap(detail=>{
        const size=[...(detail.actions||[]),detail.body,detail.check,detail.source,...(detail.resources||[])].filter(Boolean).join(' ').length;
        if(!detail.image||size<=480||!detail.actions.length)return [detail];
        return [{...detail,image:undefined},{image:detail.image,heading:detail.heading||'Покажите на экране',source:detail.source}];
      });
      details.forEach((detail,j)=>add('step',s.id,step.title,{
        stepKey,eyebrow:'Шаг '+(i+1)+' из '+s.steps.length+(details.length>1?' · '+(j+1)+'/'+details.length:''),
        ...detail
      }));
      const sources=[...(step.codeBlocks??(step.code?[{label:step.codeLabel||'Код для этого шага',code:step.code}]:[]))];
      if(step.referenceFile&&data.code[step.referenceFile])sources.push({label:step.referenceFile.split('/').at(-1),code:data.code[step.referenceFile]});
      for(const {label,code} of sources){
        const pages=codePages(code);
        pages.forEach((text,j)=>add('code',s.id,step.title,{eyebrow:'Шаг '+(i+1)+' · '+label+(pages.length>1?' · '+(j+1)+'/'+pages.length:''),code:text,stepKey}));
      }
      if(step.erWorkspace)add('step',s.id,'Общая ER-диаграмма',{
        eyebrow:'Шаг '+(i+1)+' · схема',stepKey,
        image:image('er'),
        links:[['ER-диаграмма · PDF','materials/er.pdf']]
      });
    });
    add('text',s.id,'Что должно остаться после этапа',{
      eyebrow:'Результат этапа',body:g.result,
      check:s.output,note:'Попросите открыть сохранённый результат, а не только назвать файл.'
    });
  }
  start('example','Готовый пример');
  add('section','example','От исходных файлов до работающей системы',{
    eyebrow:'Готовый пример',body:stackName,
    note:'Откройте готовый комплект отдельно и пройдите по тому же порядку, что и студенты.',
    links:[['Готовый пример · ZIP',exampleZip]]
  });
  add('step','example','База и расчёт заказа',{
    actions:['В '+editor+' откройте counterparty и сравните первую запись с «Заказчики.json».','Откройте представление order_cost и найдите заказ с order_id = 1.'],
    image:image('cost-result'),check:'Первый код 000000001 сохранился. Нормативная стоимость — 14 374,28.'
  });
  add('step','example','Вход в настольное приложение',{
    actions:['Запустите '+desktop+'. В окне «Вход» введите логин и пароль, затем соберите пазл.','Покажите по очереди вход пользователя и администратора. Учебный пароль обеих записей: Demo2027!.'],
    image:image('login'),check:'Логин student открывает окно пользователя. Логин admin — управление учётными записями.'
  });
  add('step','example','Что видит пользователь',{
    actions:['Войдите как student. Найдите имя и роль в рабочем окне.'],image:image('m4-student'),
    check:'Есть роль «Пользователь». Управление учётными записями недоступно.'
  });
  add('step','example','Что видит администратор',{
    actions:['Войдите как admin. Покажите список, поля учётной записи, флажок блокировки и кнопки.','Создайте тестовую запись, проверьте блокировку и снимите её из окна администратора.'],
    image:image('m4-admin'),check:'Администратор может добавить, изменить и разблокировать учётную запись.'
  });
  add('step','example','Запрос, тесты и документ Word',{
    actions:['В Postman отправьте GET /notes. Покажите обработанный ответ и запустите тесты коллекции.','Сравните пример ответа в заполненном DOCX с результатом этого запроса.'],
    image:image('postman-tests'),links:[['Коллекция Postman','docs/postman-'+stack+'.json'],['Заполненный DOCX','docs/api-'+stack+'.docx']]
  });
  add('table','example','За что начисляют баллы',{
    eyebrow:'КИМ · таблица 7',columns:['Критерий','Баллы'],rows:data.criteria.map(([label,n])=>[label,String(n)]),
    note:'Итого '+points+' баллов. Формулировки и распределение сверяйте по таблице 7 КИМ.',
    links:[['Открыть КИМ · стр. 13','materials/kim-2027.pdf#page=13']]
  });
  slides[contentsPage].rows=chapters.slice(1).map(({label,index})=>[label,String(index+1)]);
  return {stackName,code:data.official.code,duration,points,slides,chapters};
}

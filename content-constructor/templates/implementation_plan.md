# Внедрение библиотеки шаблонов (Template Library)

Добавление в конструктор библиотеки готовых шаблонов, которые пользователи могут загружать при старте работы над новой статьей.

## User Review Required

> [!IMPORTANT]
> Мы разместим библиотеку шаблонов прямо на стартовом экране приветствия (Onboarding Overlay) в виде новой секции или переключателя вкладок. Пользователь сможет выбрать один из готовых шаблонов (например, «Обзор телевизоров TCL» или «Обзор Apple Watch»), который автоматически импортируется и заполнит рабочую область.

## Proposed Changes

### 1. Каталог и файлы шаблонов

Мы создаем новую директорию `/templates/` в корне проекта. В ней будут храниться:
- **`list.json`** — индекс доступных шаблонов с метаданными.
- **`tcl-televizory-obzor.json`** — шаблон обзора телевизоров.
- **`constructor-apple-watch-obzor.json`** — шаблон обзора умных часов.

#### [NEW] [list.json](file:///c:/Users/tomop/Downloads/opencart-content-constructor/templates/list.json)
Индексный JSON-файл следующего формата:
```json
[
  {
    "id": "tcl-televizory-obzor",
    "name": "Обзор телевизоров TCL",
    "description": "Готовый макет обзора телевизоров с таблицей характеристик, FAQ и сравнением линеек.",
    "file": "templates/tcl-televizory-obzor.json"
  },
  {
    "id": "constructor-apple-watch-obzor",
    "name": "Обзор Apple Watch",
    "description": "Стартовый обзор умных часов Apple Watch со списками, заголовками и таблицами.",
    "file": "templates/constructor-apple-watch-obzor.json"
  }
]
```

#### [NEW] [tcl-televizory-obzor.json](file:///c:/Users/tomop/Downloads/opencart-content-constructor/templates/tcl-televizory-obzor.json)
Копия файла `tcl-televizory-obzor.json`.

#### [NEW] [constructor-apple-watch-obzor.json](file:///c:/Users/tomop/Downloads/opencart-content-constructor/templates/constructor-apple-watch-obzor.json)
Копия файла `constructor-apple-watch-obzor.json`.

### 2. Доработки интерфейса (UI)

#### [MODIFY] [index.html](file:///c:/Users/tomop/Downloads/opencart-content-constructor/index.html)
- Добавим в контейнер стартового окна приветствия `#startScreen` блок с готовыми шаблонами (например, после выбора цветовой темы).
- Шаблоны будут отображаться в виде списка карточек с названиями и краткими описаниями.

#### [MODIFY] [app-entry.js](file:///c:/Users/tomop/Downloads/opencart-content-constructor/js/app/app-entry.js)
- Добавим логику загрузки шаблонов через асинхронный запрос (`fetch` к `templates/list.json` и выбранному `.json` файлу).
- При клике на карточку шаблона на стартовом окне будет вызываться `importJSONContent` с мягким staggered-эффектом анимации появления карточек.

## Verification Plan

### Manual Verification
1. Открыть конструктор. При отсутствии начатой сессии (или после очистки кеша) должен открыться стартовый экран.
2. Проверить отображение списка готовых шаблонов из `templates/list.json`.
3. Нажать на «Обзор телевизоров TCL» и убедиться, что:
   - Шаблон успешно импортировался.
   - Метаданные (название, слаг, тема) применились.
   - Карточки блоков появились с плавной staggered-анимацией.
   - Ошибок в консоли нет.

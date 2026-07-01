# Спецификация: Рефакторинг opencartforum.com.ru

**Дата:** 2026-06-30
**Стиль:** Современный дизайн (Tom Modern Design)
**Объём:** Контентные страницы (7 шт), инструменты — отдельно

---

## 1. Цель

Полный рефакторинг сайта opencartforum.com.ru с сохранением всей функциональности:
- Устранить дублирование HTML (header, footer, nav, head)
- Вынести общие компоненты в отдельные файлы с JS fetch-include
- Применить дизайн-систему «современный дизайн» (tom-modern.css)
- Убрать Bootstrap 5, перейти на собственную CSS-систему
- Сохранить PHP-парсеры и их интеграцию

---

## 2. Архитектура

### 2.1 Структура файлов после рефакторинга

```
opencartforum.com.ru/
├── index.html                    # Главная
├── checker.html                  # Проверка на варез
├── info.html                     # SSL руководство
├── warning.html                  # Предупреждение о мошенниках
├── opencart_club.html            # Расширения OpenCart Club
├── liveopencart_news.html        # Новости LiveOpencart
├── opencart-russia.html          # Новости Opencart-Russia
│
├── css/
│   ├── tom-modern.css            # Дизайн-система (токены + компоненты)
│   └── site.css                  # Стили специфичные для сайта (header, footer, страницы)
│
├── js/
│   ├── include.js                # fetch-загрузка компонентов
│   ├── checker.js                # Логика checker (вынесена из script.js)
│   └── count-up.js               # Анимация счётчиков (вынесена из script.js)
│
├── components/
│   ├── header.html               # Навбар (fetch-include)
│   ├── footer.html               # Футер (fetch-include)
│   └── seo-head.html             # Общий <head> блок (meta шаблон, fonts, CSS)
│
├── src/                          # Оставить как есть (module_generator.js)
├── StandAlone/                   # Оставить как есть
├── content-constructor/          # Оставить как есть
├── legal-pages-constructor/      # Оставить как есть
├── output/                       # Оставить как есть
├── cache/                        # Оставить как есть
├── *.php                         # Парсеры — оставить как есть
├── robots.txt
├── sitemap.xml
└── favicon.ico
```

### 2.2 Механизм fetch-include

**js/include.js** — загрузчик компонентов:

```javascript
async function loadComponents() {
    const placeholders = document.querySelectorAll('[data-include]');
    for (const el of placeholders) {
        const file = el.getAttribute('data-include');
        try {
            const resp = await fetch(file);
            if (resp.ok) {
                el.innerHTML = await resp.text();
            }
        } catch (e) {
            console.warn(`Failed to load: ${file}`, e);
        }
    }
}
document.addEventListener('DOMContentLoaded', loadComponents);
```

**Использование в HTML:**
```html
<div data-include="components/header.html"></div>
<!-- уникальный контент страницы -->
<div data-include="components/footer.html"></div>
<script src="js/include.js"></script>
```

### 2.3 SEO-подход

Meta-теги (title, description, OG, canonical, JSON-LD) остаются в каждом HTML-файле — нужны для парсеров и поисковиков. Общий шаблон `<head>` с подключением шрифтов и CSS выносить НЕ нужно — проще оставить в каждом файле, т.к. meta-теги уникальны.

---

## 3. Дизайн-система

### 3.1 Источник

- **CSS:** `C:\Users\tomop\.codex\skills\tom-modern-design\tom-modern.css`
- **Шрифты:** Geist Sans + Geist Mono (CDN)
- **Токены:** см. tom-modern.css `:root`

### 3.2 Ключевые токены

```css
--tm-bg: #fafafa;
--tm-surface: #ffffff;
--tm-surface-alt: #f4f4f5;
--tm-text: #27272a;
--tm-text-secondary: #52525b;
--tm-muted: #71717a;
--tm-line: #969696;
--tm-line-muted: #d4d4d8;
--tm-accent: #ff5a00;
--tm-accent-soft: rgba(255, 90, 0, 0.08);
--tm-shadow-hard: 8px 8px 0 rgba(150, 150, 150, 0.12);
--tm-shadow-soft: 4px 4px 0 rgba(150, 150, 150, 0.1);
--tm-font-sans: 'Geist Sans', system-ui, -apple-system, sans-serif;
--tm-font-mono: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
--tm-radius: 0px;
--tm-container: 1240px;
```

### 3.3 Визуальные правила

- **0px border-radius** везде (сохранить из текущего дизайна)
- **Accent color** `#ff5a00` — один на сайт, сдержанно
- **Grid background** 30px — `rgba(150, 150, 150, 0.04)`
- **Typography:** Geist Sans для body, Geist Mono для labels/code/microcopy
- **Accent word pattern** — одно акцентное слово в заголовке hero
- **Shadows:** soft для default, hard для hover
- **Нейтральный фон** — `#fafafa`, НЕ бежевый/кремовый
- **Structured layout** — асимметрия где уместно, не одинаковые стеки

---

## 4. Страницы и их специфика

### 4.1 index.html — Главная

**Секции:**
1. **Hero** — split layout: слева заголовок + CTA, справа Telegram-превью + статистика
2. **Stats bar** — полоса метрик (800+ участников, 2020, 6 инструментов, 24/7)
3. **Benefits** — 6 карточек преимуществ (иконки + текст)
4. **Resources** — ссылки на новости-ленты (3 карточки)
5. **Tools** — инструменты сообщества (6 карточек: checker, module generator, content constructor, legal constructor, TPL→Twig, SSL guide)
6. **Join** — CTA-секция (Telegram + badge)

**Особенности:**
- Анимация счётчиков (data-count-to)
- Telegram-превью с имитацией чата
- Карточки инструментов ведут на внутренние страницы

### 4.2 checker.html — Проверка на варез

**Секции:**
1. Hero-заголовок с описанием
2. Форма ввода URL + кнопка проверки
3. Результат проверки (модальное окно или inline)
4. Info о базе данных warez.rip

**Особенности:**
- Загрузка базы с GitHub (warez.rip)
- Нормализация URL, проверка hostname
- Модальное окно с результатом

### 4.3 info.html — SSL руководство

**Секции:**
1. Заголовок статьи
2. Содержание (TOC)
3. Пошаговое руководство по SSL/HTTPS
4. Код-блоки с инструкциями

**Особенности:**
- Длинная статья (~2000 строк)
- Код-блоки с подсветкой
- Навигация по разделам

### 4.4 warning.html — Предупреждение

**Секции:**
1. Hero-заголовок
2. Список мошеннических сайтов
3. Рекомендации по безопасности
4. Ссылки на проверенные ресурсы

### 4.5 opencart_club.html — Расширения

**Секции:**
1. Заголовок
2. Лента расширений (рендерится из PHP-парсера)

**Особенности:**
- Зависит от PHP-парсера `opencart_club_parser.php`
- Данные подставляются серверно

### 4.6 liveopencart_news.html — Новости LiveOpencart

**Секции:**
1. Заголовок
2. Лента новостей (рендерится из PHP-парсера)

**Особенности:**
- Зависит от PHP-парсера `parser_live.php`

### 4.7 opencart-russia.html — Новости Opencart-Russia

**Секции:**
1. Заголовок
2. Лента обсуждений и файлов (рендерится из PHP-парсера)

**Особенности:**
- Зависит от PHP-парсера `parser_opencart_russia.php`

---

## 5. Компоненты (fetch-include)

### 5.1 components/header.html

- Навбар с логотипом «Opencart Клуб»
- Ссылки: О группе, Преимущества, Ресурсы, Инструменты, Вступить
- Кнопка «Проверить сайт»
- Sticky, с backdrop-blur
- Адаптивное мобильное меню (hamburger)

### 5.2 components/footer.html

- Логотип + описание
- Ссылки на страницы
- Telegram-ссылка
- Копирайт

---

## 6. Что НЕ входит в рефакторинг

- `module_generator.html` — SPA-приложение, отдельно
- `content_constructor.html` — SPA-приложение, отдельно
- `legal_constructor.html` — SPA-приложение, отдельно
- `tpl_to_twigconverter.html` — SPA-приложение, отдельно
- PHP-парсеры — оставить как есть
- `StandAlone/`, `content-constructor/`, `legal-pages-constructor/` — оставить
- `src/module_generator.js` — оставить

---

## 7. Порядок реализации

1. Создать `css/tom-modern.css` (скопировать из skill)
2. Создать `js/include.js` (fetch-загрузчик)
3. Создать `components/header.html` и `components/footer.html`
4. Рефакторить `index.html` (главная страница — эталон)
5. Рефакторить `checker.html` (вынести JS в `js/checker.js`)
6. Рефакторить `info.html`
7. Рефакторить `warning.html`
8. Рефакторить 3 новостных ленты (с учётом PHP-парсеров)
9. Удалить старый `style.css` и `script.js`
10. Проверить все страницы desktop + mobile

---

## 8. Критерии успеха

- Все 7 страниц работают с fetch-include (header/footer)
- Дизайн принадлежит к семейству «современный дизайн»
- Нет дублирования навбара и футера
- Desktop и mobile версии работают корректно
- PHP-парсеры продолжают работать
- Нет сломанных ссылок или функциональности
- Файлы инструментов не затронуты

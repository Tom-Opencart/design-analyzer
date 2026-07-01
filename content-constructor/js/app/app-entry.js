

    // ── Helpers ──────────────────────────────────────────────
    
    // Removed uuid (moved to modules)


    
    // Removed slugify (moved to modules)


    
    // Removed escapeHtml (moved to modules)


    
    // Removed safeSvgPlaceholder (moved to modules)


    
    // Removed PRESET_THEMES (moved to theme-service.js)


    
    // Removed hexToRgb (moved to modules)


    
    // Removed rgbToHex (moved to modules)


    
    // Removed customThemes load (moved to theme-service.js)


    // ── Project Settings Storage ─────────────────────────────────
    
    // Removed session/url storage keys (moved to session-store.js)

    
    // Removed loadProjectSession (moved to modules)


    
    // Removed saveProjectSession (moved to modules)


    
    // Removed loadSavedUrl (moved to modules)


    
    // Removed saveSiteUrl (moved to modules)


    function applyProjectToHeader(project) {
        const titleEl = document.getElementById('articleTitle');
        const domainEl = document.getElementById('articleDomain');
        const slugEl = document.getElementById('articleSlug');
        if (titleEl && project.title !== undefined) titleEl.value = project.title;
        if (domainEl && project.siteUrl !== undefined) domainEl.value = project.siteUrl;
        if (slugEl && project.slug !== undefined) slugEl.value = project.slug;
        if (project.theme) {
            updateThemeSelectOptions(project.theme);
            updateThemeUI();
            applyThemeToPreview();
        }
    }


    
    // Removed getClosestColorEmoji (moved to modules)


    
    // Removed formatOptionText (moved to modules)


    
    // Removed updateThemeSelectOptions (moved to modules)


    
    // Removed updateThemeUI (moved to modules)


    
    // Removed getCurrentThemeColors (moved to modules)


    
    // Removed applyThemeToPreview (moved to modules)


    const GRID_PC_PRESETS = {
        2: [[6, 6], [4, 8], [8, 4], [3, 9], [9, 3]],
        3: [[4, 4, 4], [3, 6, 3], [6, 3, 3], [3, 3, 6]],
        4: [[3, 3, 3, 3]]
    };


    function parseGridPattern(value) {
        return value.split('+').map(v => parseInt(v, 10)).filter(Boolean);
    }

    function getGridPattern(sectionCount) {
        return GRID_PC_PRESETS[sectionCount][0].slice();
    }

    function createGridColumn() {
        return { id: uuid(), blocks: [] };
    }

    function refreshBlockIds(block) {
        block.id = uuid();

        if (block.type === 'grid') {
            block.data.columns.forEach(column => {
                column.id = uuid();
                column.blocks.forEach(child => refreshBlockIds(child));
            });
        }
    }

    // ── State ────────────────────────────────────────────────
    let blocks = [
        {
            id: uuid(),
            type: 'heading',
            data: { level: 2, text: 'Apple Watch: Полный обзор умных часов' }
        },
        {
            id: uuid(),
            type: 'toc',
            data: {}
        },
        {
            id: uuid(),
            type: 'heading',
            data: { level: 2, text: 'История развития и модельный ряд' }
        },
        {
            id: uuid(),
            type: 'paragraph',
            data: { text: 'Умные часы **Apple Watch** были впервые представлены в 2014 году и с тех пор стали самым популярным носимым устройством в мире. Они прошли путь от простого аксессуара-компаньона для iPhone до полноценного медицинского гаджета и незаменимого помощника при тренировках.\n\nСегодня модельный ряд разделен на три ключевые категории:\n* **Apple Watch SE** — сбалансированное бюджетное решение.\n* **Apple Watch Series** — классические флагманские часы с передовыми датчиками.\n* **Apple Watch Ultra** — защищенная модель для экстремального спорта с увеличенной автономностью.' }
        },
        {
            id: uuid(),
            type: 'heading',
            data: { level: 3, text: 'Сравнение актуальных моделей' }
        },
        {
            id: uuid(),
            type: 'table',
            data: {
                headers: ['Характеристика', 'Apple Watch SE 2', 'Apple Watch Series 10', 'Apple Watch Ultra 2'],
                rows: [
                    ['Материал корпуса', 'Алюминий', 'Алюминий / Титан', 'Титан аэрокосмический'],
                    ['Размер дисплея', '40 / 44 мм', '42 / 46 мм (тонкие рамки)', '49 мм (плоский экран, 3000 нит)'],
                    ['Датчик кислорода (SpO2)', 'Нет', 'Да', 'Да'],
                    ['ЭКГ (ECG)', 'Нет', 'Да', 'Да'],
                    ['Время работы', 'До 18 часов', 'До 18 часов (быстрая зарядка)', 'До 36 часов']
                ]
            }
        },
        {
            id: uuid(),
            type: 'heading',
            data: { level: 2, text: 'Ключевые функции для здоровья и спорта' }
        },
        {
            id: uuid(),
            type: 'paragraph',
            data: { text: 'Основной акцент Apple делает на **мониторинге здоровья** и безопасности пользователя. Часы способны предупреждать о критических изменениях пульса, распознавать падения и даже вызывать службу спасения при автомобильных авариях.' }
        },
        {
            id: uuid(),
            type: 'heading',
            data: { level: 2, text: 'Примеры Bootstrap-сетки внутри статьи' }
        },
        {
            id: uuid(),
            type: 'paragraph',
            data: { text: 'Ниже показаны два множественных блока. Это обычная Bootstrap 3 сетка: секции используют `col-xs-* col-md-*`, а внутрь можно перетаскивать стандартные блоки конструктора.' }
        },
        {
            id: uuid(),
            type: 'grid',
            data: {
                pcPattern: [6, 6],
                mobilePerRow: 1,
                columns: [
                    {
                        id: uuid(),
                        blocks: [
                            {
                                id: uuid(),
                                type: 'image',
                                data: {
                                    srcType: 'path',
                                    src: 'https://placehold.co/900x600/e8f0fe/334155?text=Apple+Watch',
                                    localSrc: '',
                                    alt: 'Apple Watch на руке',
                                    caption: 'Пример: изображение слева'
                                }
                            }
                        ]
                    },
                    {
                        id: uuid(),
                        blocks: [
                            {
                                id: uuid(),
                                type: 'paragraph',
                                data: { text: '**Схема 6+6:** слева размещена картинка, справа текстовый блок. На мобильной версии выбран режим 1 в ряд, поэтому секции аккуратно складываются друг под другом.' }
                            }
                        ]
                    }
                ]
            }
        },
        {
            id: uuid(),
            type: 'grid',
            data: {
                pcPattern: [4, 4, 4],
                mobilePerRow: 2,
                columns: [
                    {
                        id: uuid(),
                        blocks: [
                            {
                                id: uuid(),
                                type: 'image',
                                data: {
                                    srcType: 'path',
                                    src: 'https://placehold.co/600x420/f0fdf4/166534?text=Activity',
                                    localSrc: '',
                                    alt: 'Активность Apple Watch',
                                    caption: 'Активность'
                                }
                            }
                        ]
                    },
                    {
                        id: uuid(),
                        blocks: [
                            {
                                id: uuid(),
                                type: 'image',
                                data: {
                                    srcType: 'path',
                                    src: 'https://placehold.co/600x420/fef2f2/991b1b?text=Health',
                                    localSrc: '',
                                    alt: 'Здоровье Apple Watch',
                                    caption: 'Здоровье'
                                }
                            }
                        ]
                    },
                    {
                        id: uuid(),
                        blocks: [
                            {
                                id: uuid(),
                                type: 'image',
                                data: {
                                    srcType: 'path',
                                    src: 'https://placehold.co/600x420/fff7ed/9a3412?text=Notifications',
                                    localSrc: '',
                                    alt: 'Уведомления Apple Watch',
                                    caption: 'Уведомления'
                                }
                            }
                        ]
                    }
                ]
            }
        },
        {
            id: uuid(),
            type: 'quote',
            data: { text: 'Технологии в сфере здоровья должны быть доступны каждому. Наша цель с Apple Watch — создать устройство, которое незаметно оберегает вашу жизнь и мотивирует двигаться вперед.', author: 'Тим Кук, CEO Apple' }
        },
        {
            id: uuid(),
            type: 'link',
            data: { text: 'Пользовательское соглашение и условия гарантии Apple', href: '', title: '', isPopup: true, infoId: '5', linkType: 'popup' }
        },
        {
            id: uuid(),
            type: 'heading',
            data: { level: 2, text: 'Пример заголовка' }
        },
        {
            id: uuid(),
            type: 'faq',
            data: {
                title: 'Часто задаваемые вопросы',
                items: [
                    { question: 'Можно ли использовать Apple Watch с Android?', answer: 'К сожалению, нет. Apple Watch жестко привязаны к экосистеме Apple. Для их первоначальной активации и полноценного использования требуется iPhone (модель 6s или новее).' },
                    { question: 'Можно ли плавать в часах Apple Watch?', answer: 'Да, все актуальные модели имеют влагозащиту.\n* SE и Series выдерживают погружение до 50 метров (подходят для бассейна).\n* Ultra поддерживают погружение до 100 метров и сертифицированы для рекреационного дайвинга на глубину до 40 метров.' },
                    { question: 'Какое время работы от батареи?', answer: 'Все актуальные модели работают до 18 часов в обычном режиме. Apple Watch Ultra 2 — до 36 часов. Быстрая зарядка позволяет полностью зарядить их за 1.5 часа.' },
                    { question: 'Есть ли в часах ЭКГ и измерение кислорода?', answer: 'Да, функции ЭКГ (ECG) и измерения уровня кислорода в крови (SpO2) доступны в моделях Series и Ultra. В модели SE эти функции отсутствуют.' },
                    { question: 'Какой размер дисплея лучше выбрать?', answer: 'Зависит от запястья:\n* 40/42 мм — для тонких запястий (от 130 мм)\n* 44/46 мм — средние и крупные запястья\n* 49 мм (Ultra) — для активного спорта и крупных запястий' }
                ]
            }
        },
        {
            id: uuid(),
            type: 'callout',
            data: {
                style: 'success',
                title: 'Руководство пользователя Apple Watch.pdf',
                text: 'Официальная полная инструкция по эксплуатации со всеми техническими характеристиками и описанием скрытых функций.',
                btnText: 'Скачать PDF',
                btnLink: '#',
                btnIcon: 'fa-file-pdf-o'
            }
        },
        {
            id: uuid(),
            type: 'callout',
            data: {
                style: 'info',
                title: 'Обратите внимание',
                text: 'Для работы функции ЭКГ необходимо, чтобы на вашем сопряженном iPhone была установлена последняя версия iOS.',
                btnText: 'Подробнее на Apple Support',
                btnLink: 'https://support.apple.com',
                btnIcon: 'fa-info-circle'
            }
        },
        {
            id: uuid(),
            type: 'callout',
            data: {
                style: 'warning',
                title: 'Важная рекомендация по эксплуатации',
                text: 'Не используйте неофициальные зарядные устройства во избежание перегрева аккумулятора и повреждения датчиков.',
                btnText: 'Оригинальные аксессуары',
                btnLink: '#',
                btnIcon: 'fa-exclamation-triangle'
            }
        }
    ];
    let dragState = { dragging: null, over: null };
    let appShell = null;

    // ── DOM refs ─────────────────────────────────────────────
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const blocksContainer = $('#blocksContainer');
    const workspaceEmpty = $('#workspaceEmpty');
    const previewContent = $('#previewContent');
    const titleInput = $('#articleTitle');
    const slugInput = $('#articleSlug');

    // ── Block Type Definitions ───────────────────────────────
    const LEGACY_BLOCK_TYPES = {
        quote: {
            label: 'Цитата',
            defaults: () => ({ text: 'Текст цитаты...', author: '' }),
            editForm(block) {
                return `
                    <div class="form-group"><label>Текст цитаты</label>${agreeToolbarHtml()}<textarea data-field="text" rows="3">${escapeHtml(block.data.text)}</textarea></div>
                    <div class="form-group"><label>Автор (необязательно)</label><input type="text" data-field="author" value="${escapeHtml(block.data.author)}"></div>`;
            },
            toHTML(block, isPreview = false) {
                let html = `<blockquote><p>${inlineFormat(block.data.text, isPreview)}</p>`;
                if (block.data.author) html += `<i>— ${escapeHtml(block.data.author)}</i>`;
                html += `</blockquote>`;
                return html;
            },
            preview(block) { return this.toHTML(block, true); },
        },

        table: {
            label: 'Таблица',
            defaults: () => ({
                headers: ['Заголовок 1', 'Заголовок 2'],
                rows: [['Ячейка 1', 'Ячейка 2'], ['Ячейка 3', 'Ячейка 4']],
                striped: false,
                bordered: false,
                hover: false,
                condensed: false
            }),
            editForm(block) {
                const classes = [];
                if (block.data.striped) classes.push('table-striped');
                if (block.data.bordered) classes.push('table-bordered');
                if (block.data.hover) classes.push('table-hover');
                if (block.data.condensed) classes.push('table-condensed');
                const classStr = classes.join(' ');

                let html = `<div class="table-editor"><table class="${classStr}"><thead><tr>`;
                block.data.headers.forEach((h, i) => {
                    html += `<th><input class="th-input" data-col="${i}" value="${escapeHtml(h)}"></th>`;
                });
                html += `</tr></thead><tbody>`;
                block.data.rows.forEach((row, ri) => {
                    html += `<tr>`;
                    row.forEach((cell, ci) => {
                        html += `<td><input data-row="${ri}" data-col="${ci}" value="${escapeHtml(cell)}"></td>`;
                    });
                    html += `</tr>`;
                });
                html += `</tbody></table>`;
                html += `<div class="table-editor-actions">
                    <button class="btn btn-sm btn-ghost" data-action="add-col">+ Столбец</button>
                    <button class="btn btn-sm btn-ghost" data-action="add-row">+ Строка</button>
                    <button class="btn btn-sm btn-ghost" data-action="remove-col">− Столбец</button>
                    <button class="btn btn-sm btn-ghost" data-action="remove-row">− Строка</button>
                </div>`;

                // Add Bootstrap 3 style option checkboxes
                html += `<div class="table-styles-options" style="margin-top: 12px; display: flex; flex-wrap: wrap; gap: 12px; border-top: 1px dashed #eee; padding-top: 10px;">
                    <label style="display: flex; align-items: center; gap: 6px; font-weight: normal; cursor: pointer; font-size: 12px; margin: 0; user-select: none;">
                        <input type="checkbox" data-field="striped" ${block.data.striped ? 'checked' : ''}> Zebra (striped)
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px; font-weight: normal; cursor: pointer; font-size: 12px; margin: 0; user-select: none;">
                        <input type="checkbox" data-field="bordered" ${block.data.bordered ? 'checked' : ''}> Сетка (bordered)
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px; font-weight: normal; cursor: pointer; font-size: 12px; margin: 0; user-select: none;">
                        <input type="checkbox" data-field="hover" ${block.data.hover ? 'checked' : ''}> Подсветка (hover)
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px; font-weight: normal; cursor: pointer; font-size: 12px; margin: 0; user-select: none;">
                        <input type="checkbox" data-field="condensed" ${block.data.condensed ? 'checked' : ''}> Компактная (condensed)
                    </label>
                </div></div>`;

                return html;
            },
            toHTML(block) {
                const classes = ['table'];
                if (block.data.striped) classes.push('table-striped');
                if (block.data.bordered) classes.push('table-bordered');
                if (block.data.hover) classes.push('table-hover');
                if (block.data.condensed) classes.push('table-condensed');

                const classStr = classes.join(' ');

                let html = `<div class="table-responsive"><table class="${classStr}"><thead><tr>`;
                block.data.headers.forEach(h => { html += `<th>${escapeHtml(h)}</th>`; });
                html += `</tr></thead><tbody>`;
                block.data.rows.forEach(row => {
                    html += `<tr>`;
                    row.forEach(cell => { html += `<td>${escapeHtml(cell)}</td>`; });
                    html += `</tr>`;
                });
                html += `</tbody></table></div>`;
                return html;
            },
            preview(block) {
                return this.toHTML(block);
            },
        },

        comparison: {
            label: 'Сравнение характеристик',
            defaults: () => ({
                title: 'Сравнение характеристик',
                headers: ['Характеристика', 'Модель A', 'Модель B'],
                rows: [
                    ['Мощность', '1000 Вт', '1200 Вт'],
                    ['Вес', '5 кг', '5 кг'],
                    ['Цена', '5000 руб', '6000 руб']
                ]
            }),
            editForm(block) {
                let html = `<div class="form-group">
                    <label>Заголовок блока сравнения</label>
                    <input type="text" data-field="title" value="${escapeHtml(block.data.title || '')}">
                </div>`;

                html += `<div class="table-editor"><table class="table table-bordered"><thead><tr>`;
                block.data.headers.forEach((h, i) => {
                    html += `<th><input class="th-input" data-col="${i}" value="${escapeHtml(h)}"></th>`;
                });
                html += `</tr></thead><tbody>`;
                block.data.rows.forEach((row, ri) => {
                    html += `<tr>`;
                    row.forEach((cell, ci) => {
                        html += `<td><input data-row="${ri}" data-col="${ci}" value="${escapeHtml(cell)}"></td>`;
                    });
                    html += `</tr>`;
                });
                html += `</tbody></table>`;
                html += `<div class="table-editor-actions">
                    <button class="btn btn-sm btn-ghost" data-action="add-col">+ Столбец</button>
                    <button class="btn btn-sm btn-ghost" data-action="add-row">+ Строка</button>
                    <button class="btn btn-sm btn-ghost" data-action="remove-col">− Столбец</button>
                    <button class="btn btn-sm btn-ghost" data-action="remove-row">− Строка</button>
                </div></div>`;

                return html;
            },
            toHTML(block) {
                let html = `<div class="article-comparison-wrapper">`;
                if (block.data.title) {
                    html += `<div class="article-comparison-title">${escapeHtml(block.data.title)}</div>`;
                }
                
                html += `<div class="compare-diff-toggle-wrapper">
                    <label>
                        <input type="checkbox" class="compare-diff-toggle"> Подсветить различия
                    </label>
                </div>`;
                
                html += `<div class="table-responsive">
                    <table class="table table-bordered">
                        <thead>
                            <tr>`;
                block.data.headers.forEach(h => {
                    html += `<th>${escapeHtml(h)}</th>`;
                });
                html += `    </tr>
                        </thead>
                        <tbody>`;
                block.data.rows.forEach(row => {
                    html += `<tr>`;
                    row.forEach(cell => {
                        html += `<td>${escapeHtml(cell)}</td>`;
                    });
                    html += `</tr>`;
                });
                html += `</tbody>
                    </table>
                </div>
                </div>`;
                return html;
            },
            preview(block) {
                return this.toHTML(block);
            }
        },

        'ordered-list': {
            label: 'Нумерованный список',
            defaults: () => ({ items: ['Пункт 1', 'Пункт 2', 'Пункт 3'] }),
            editForm(block) {
                let html = `<div class="form-group"><label>Пункты</label>`;
                block.data.items.forEach((item, i) => {
                    html += `<div class="form-row" style="margin-bottom:4px">
                        <input type="text" data-item="${i}" value="${escapeHtml(item)}" style="flex:1">
                        <button class="btn btn-sm btn-ghost" data-action="remove-item" data-index="${i}">&times;</button>
                    </div>`;
                });
                html += `</div><button class="btn btn-sm btn-ghost" data-action="add-item">+ Добавить пункт</button>`;
                return html;
            },
            toHTML(block, isPreview = false) {
                return `<ol>${block.data.items.map(i => `<li>${inlineFormat(i, isPreview)}</li>`).join('')}</ol>`;
            },
            preview(block) { return this.toHTML(block, true); },
        },

        'unordered-list': {
            label: 'Маркированный список',
            defaults: () => ({ items: ['Пункт 1', 'Пункт 2', 'Пункт 3'] }),
            editForm(block) {
                let html = `<div class="form-group"><label>Пункты</label>`;
                block.data.items.forEach((item, i) => {
                    html += `<div class="form-row" style="margin-bottom:4px">
                        <input type="text" data-item="${i}" value="${escapeHtml(item)}" style="flex:1">
                        <button class="btn btn-sm btn-ghost" data-action="remove-item" data-index="${i}">&times;</button>
                    </div>`;
                });
                html += `</div><button class="btn btn-sm btn-ghost" data-action="add-item">+ Добавить пункт</button>`;
                return html;
            },
            toHTML(block, isPreview = false) {
                return `<ul>${block.data.items.map(i => `<li>${inlineFormat(i, isPreview)}</li>`).join('')}</ul>`;
            },
            preview(block) { return this.toHTML(block, true); },
        },

        image: {
            label: 'Изображение',
            defaults: () => ({ srcType: 'path', src: '', localSrc: '', alt: 'Изображение', caption: '' }),
            editForm(block) {
                const domainInputEl = document.getElementById('articleDomain');
                const domainVal = domainInputEl ? domainInputEl.value.trim() : '';
                return `
                    <div class="form-group">
                        <label>Источник изображения</label>
                        <select data-field="srcType" class="img-src-type-select">
                            <option value="path" ${block.data.srcType==='path'?'selected':''}>Путь в OpenCart / Ссылка</option>
                            <option value="local" ${block.data.srcType==='local'?'selected':''}>Загрузить локальный файл (для превью)</option>
                        </select>
                    </div>
                    
                    <div class="img-src-path-group" style="display: ${block.data.srcType==='local'?'none':'block'}">
                        <div class="form-group">
                            <label>Путь к изображению в OpenCart</label>
                            <input type="text" data-field="src" value="${escapeHtml(block.data.src)}" placeholder="image/catalog/folder/image.jpg">
                            <small style="color:#777;font-size:11px;margin-top:2px;display:block;">
                                В превью отобразится с использованием домена из шапки: <b>${domainVal || 'не указан'}</b>
                            </small>
                        </div>
                    </div>
                    
                    <div class="img-src-local-group" style="display: ${block.data.srcType==='local'?'block':'none'}">
                        <div class="form-group">
                            <label>Выберите локальный файл</label>
                            <input type="file" class="img-local-file-input" accept="image/*">
                            <input type="hidden" data-field="localSrc" value="${escapeHtml(block.data.localSrc || '')}">
                            <div class="img-local-thumb" style="margin-top:6px;">
                                ${block.data.localSrc ? `<img src="${block.data.localSrc}" style="max-height:80px;border-radius:4px;display:block;">` : ''}
                            </div>
                        </div>
                    </div>

                    <div class="form-row" style="margin-top:8px;">
                        <div class="form-group"><label>Alt текст</label><input type="text" data-field="alt" value="${escapeHtml(block.data.alt)}"></div>
                        <div class="form-group"><label>Подпись (необязательно)</label><input type="text" data-field="caption" value="${escapeHtml(block.data.caption)}"></div>
                    </div>`;
            },
            toHTML(block) {
                let imgUrl = '';
                if (block.data.srcType === 'local') {
                    imgUrl = block.data.localSrc || '';
                } else {
                    imgUrl = block.data.src || '';
                }
                
                // If both are empty, use SVG placeholder
                if (!imgUrl) {
                    imgUrl = safeSvgPlaceholder(800, 400, '#f5f5f5', '#888', 'Изображение OpenCart (' + (block.data.alt || 'Заглушка') + ')');
                }
                
                let html = `<img alt="${escapeHtml(block.data.alt || 'Изображение')}" class="img-responsive" style="width: 100%;" src="${imgUrl}" loading="lazy">`;
                if (block.data.caption) {
                    html += `<p style="text-align:center;font-size:13px;color:#888;margin-top:5px;text-indent:0!important;">${escapeHtml(block.data.caption)}</p>`;
                }
                return html;
            },
            preview(block) {
                let imgUrl = '';
                if (block.data.srcType === 'local') {
                    imgUrl = block.data.localSrc || '';
                } else {
                    imgUrl = block.data.src || '';
                    if (imgUrl && !imgUrl.startsWith('http://') && !imgUrl.startsWith('https://') && !imgUrl.startsWith('data:')) {
                        const domainInputEl = document.getElementById('articleDomain');
                        const domainVal = domainInputEl ? domainInputEl.value.trim() : '';
                        if (domainVal) {
                            const base = domainVal.endsWith('/') ? domainVal : domainVal + '/';
                            const path = imgUrl.startsWith('/') ? imgUrl.substring(1) : imgUrl;
                            imgUrl = base + path;
                        }
                    }
                }
                
                if (!imgUrl) {
                    // Inline SVG placeholder
                    const theme = getCurrentThemeColors();
                    imgUrl = safeSvgPlaceholder(800, 400, theme.bg, theme.accent, 'Заглушка: ' + (block.data.src || 'файл не выбран'));
                }
                
                let html = `<img alt="${escapeHtml(block.data.alt || 'Изображение')}" class="img-responsive" style="width: 100%;" src="${imgUrl}" loading="lazy">`;
                if (block.data.caption) {
                    html += `<p style="text-align:center;font-size:13px;color:#888;margin-top:5px;text-indent:0!important;">${escapeHtml(block.data.caption)}</p>`;
                }
                return html;
            },
        },

        grid: {
            label: 'Bootstrap сетка',
            defaults: () => {
                const pcPattern = getGridPattern(2);

                return {
                    pcPattern,
                    mobilePerRow: 1,
                    columns: pcPattern.map(() => createGridColumn())
                };
            },
            editForm(block) {
                const sectionCount = block.data.columns.length;
                const patternOptions = GRID_PC_PRESETS[sectionCount].map(pattern => {
                    const value = formatGridPattern(pattern);
                    const selected = formatGridPattern(block.data.pcPattern) === value ? 'selected' : '';

                    return `<option value="${value}" ${selected}>${value}</option>`;
                }).join('');

                return `
                    <div class="grid-help">Это Bootstrap 3 row. Перетаскивайте обычные блоки в нужную секцию. PC-схема всегда суммируется в 12, mobile ограничен 1 или 2 блоками в ряд.</div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Секций</label>
                            <select data-grid-field="sectionCount">
                                <option value="2" ${sectionCount===2?'selected':''}>2</option>
                                <option value="3" ${sectionCount===3?'selected':''}>3</option>
                                <option value="4" ${sectionCount===4?'selected':''}>4</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>PC схема md</label>
                            <select data-grid-field="pcPattern">${patternOptions}</select>
                        </div>
                        <div class="form-group">
                            <label>Mobile</label>
                            <select data-grid-field="mobilePerRow">
                                <option value="1" ${block.data.mobilePerRow===1?'selected':''}>1 в ряд</option>
                                <option value="2" ${block.data.mobilePerRow===2?'selected':''}>2 в ряд</option>
                            </select>
                        </div>
                    </div>`;
            },
            toHTML(block) {
                return renderGridHtml(block, 'toHTML');
            },
            preview(block) {
                return renderGridHtml(block, 'preview');
            },
        },

        link: {
            label: 'Ссылка',
            defaults: () => ({ text: 'Текст ссылки', href: 'https://', title: '', isPopup: false, infoId: '5', linkType: 'regular' }),
            editForm(block) {
                const isPopup = block.data.isPopup || block.data.linkType === 'popup';
                const infoId = block.data.infoId || '5';
                return `
                    <div class="form-group">
                        <label>Текст ссылки</label>
                        <input type="text" data-field="text" value="${escapeHtml(block.data.text)}">
                    </div>
                    <div class="form-row" style="margin-bottom: 8px;">
                        <div class="form-group">
                            <label>Тип ссылки</label>
                            <select data-field="linkType" class="link-type-select">
                                <option value="regular" ${!isPopup ? 'selected' : ''}>Обычная ссылка</option>
                                <option value="popup" ${isPopup ? 'selected' : ''}>Всплывающая статья OpenCart (класс agree)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="regular-link-group" style="display: ${isPopup ? 'none' : 'block'}; margin-bottom: 8px;">
                        <div class="form-row">
                            <div class="form-group">
                                <label>URL (Адрес ссылки)</label>
                                <input type="text" data-field="href" value="${escapeHtml(block.data.href || 'https://')}">
                            </div>
                            <div class="form-group">
                                <label>Title подсказка (необязательно)</label>
                                <input type="text" data-field="title" value="${escapeHtml(block.data.title || '')}">
                            </div>
                        </div>
                    </div>
                    
                    <div class="popup-link-group" style="display: ${isPopup ? 'block' : 'none'}; margin-bottom: 8px;">
                        <div class="form-row">
                            <div class="form-group">
                                <label>ID статьи OpenCart (information_id)</label>
                                <input type="number" data-field="infoId" value="${escapeHtml(infoId)}" placeholder="Например: 5">
                                <small style="color: #666; font-size: 11px; margin-top: 4px; display: block;">
                                    Ссылка для OpenCart: <code class="generated-popup-link">/index.php?route=information/information/agree&information_id=${infoId}</code>
                                </small>
                            </div>
                        </div>
                    </div>`;
            },
            toHTML(block) {
                const isPopup = block.data.isPopup || block.data.linkType === 'popup';
                if (isPopup) {
                    const infoId = block.data.infoId || '5';
                    const href = `/index.php?route=information/information/agree&information_id=${infoId}`;
                    return `<p><a class="agree" href="${href}"><b>${escapeHtml(block.data.text)}</b></a></p>`;
                } else {
                    const title = block.data.title ? ` title="${escapeHtml(block.data.title)}"` : '';
                    const href = block.data.href || 'https://';
                    return `<p><a href="${escapeHtml(href)}"${title}>${escapeHtml(block.data.text)}</a></p>`;
                }
            },
            preview(block) {
                const isPopup = block.data.isPopup || block.data.linkType === 'popup';
                if (isPopup) {
                    const infoId = block.data.infoId || '5';
                    const href = `/index.php?route=information/information/agree&information_id=${infoId}`;
                    return `<p><a class="agree" href="${href}" onclick="alert('Эмуляция OpenCart: Открытие статьи с ID = ${infoId} в модальном окне (через AJAX/Bootstrap modal). В реальности сработает автоматически благодаря встроенному скрипту OpenCart.'); return false;"><b>${escapeHtml(block.data.text)}</b></a></p>`;
                }
                return this.toHTML(block);
            },
        },

        popup: {
            label: 'Попап окно',
            defaults: () => ({ text: 'Условия соглашения', infoId: '5', styleType: 'button', btnClass: 'btn-primary', btnSize: '' }),
            editForm(block) {
                const infoId = block.data.infoId || '5';
                const styleType = block.data.styleType || 'button';
                const btnClass = block.data.btnClass || 'btn-primary';
                const btnSize = block.data.btnSize || '';
                return `
                    <div class="form-group">
                        <label>Текст ссылки/кнопки</label>
                        <input type="text" data-field="text" value="${escapeHtml(block.data.text)}">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>ID статьи OpenCart (information_id)</label>
                            <input type="number" data-field="infoId" value="${escapeHtml(infoId)}">
                        </div>
                        <div class="form-group">
                            <label>Тип элемента</label>
                            <select data-field="styleType" class="popup-style-select">
                                <option value="link" ${styleType==='link'?'selected':''}>Текстовая ссылка с иконкой</option>
                                <option value="button" ${styleType==='button'?'selected':''}>Кнопка Bootstrap 3</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="popup-btn-options" style="display: ${styleType === 'button' ? 'block' : 'none'}; margin-top: 8px;">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Цвет кнопки (Bootstrap Class)</label>
                                <select data-field="btnClass">
                                    <option value="btn-default" ${btnClass==='btn-default'?'selected':''}>Default (Серый)</option>
                                    <option value="btn-primary" ${btnClass==='btn-primary'?'selected':''}>Primary (Синий)</option>
                                    <option value="btn-success" ${btnClass==='btn-success'?'selected':''}>Success (Зеленый)</option>
                                    <option value="btn-info" ${btnClass==='btn-info'?'selected':''}>Info (Голубой)</option>
                                    <option value="btn-warning" ${btnClass==='btn-warning'?'selected':''}>Warning (Оранжевый)</option>
                                    <option value="btn-danger" ${btnClass==='btn-danger'?'selected':''}>Danger (Красный)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Размер кнопки</label>
                                <select data-field="btnSize">
                                    <option value="btn-sm" ${btnSize==='btn-sm'?'selected':''}>Маленькая</option>
                                    <option value="" ${btnSize===''?'selected':''}>Обычная</option>
                                    <option value="btn-lg" ${btnSize==='btn-lg'?'selected':''}>Большая</option>
                                    <option value="btn-block" ${btnSize==='btn-block'?'selected':''}>На всю ширину</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group" style="margin-top: 8px;">
                        <small style="color: #666; font-size: 11px;">
                            Ссылка для OpenCart (agree): <code class="generated-popup-link">/index.php?route=information/information/agree&information_id=${infoId}</code>
                        </small>
                    </div>`;
            },
            toHTML(block) {
                const infoId = block.data.infoId || '5';
                const href = `/index.php?route=information/information/agree&information_id=${infoId}`;
                const styleType = block.data.styleType || 'link';
                if (styleType === 'button') {
                    const btnClass = block.data.btnClass || 'btn-primary';
                    const btnSize = block.data.btnSize || '';
                    const fullClass = `btn ${btnClass} ${btnSize} agree`.trim().replace(/\s+/g, ' ');
                    return `<p style="text-align: center; text-indent: 0 !important;"><a class="${fullClass}" href="${href}">${escapeHtml(block.data.text)}</a></p>`;
                } else {
                    return `<p style="text-indent: 0 !important;"><a class="agree link-popup-action" href="${href}"><i class="fa fa-info-circle" style="margin-right: 6px;"></i><b>${escapeHtml(block.data.text)}</b></a></p>`;
                }
            },
            preview(block) {
                const infoId = block.data.infoId || '5';
                const href = `/index.php?route=information/information/agree&information_id=${infoId}`;
                const styleType = block.data.styleType || 'link';
                const onclick = `onclick="alert('Эмуляция OpenCart: Открытие статьи с ID = ${infoId} в модальном окне (через AJAX/Bootstrap modal). В реальности сработает автоматически благодаря встроенному скрипту OpenCart.'); return false;"`;
                if (styleType === 'button') {
                    const btnClass = block.data.btnClass || 'btn-primary';
                    const btnSize = block.data.btnSize || '';
                    const fullClass = `btn ${btnClass} ${btnSize} agree`.trim().replace(/\s+/g, ' ');
                    return `<p style="text-align: center; text-indent: 0 !important;"><a class="${fullClass}" href="${href}" ${onclick}>${escapeHtml(block.data.text)}</a></p>`;
                } else {
                    return `<p style="text-indent: 0 !important;"><a class="agree link-popup-action" href="${href}" ${onclick}><i class="fa fa-info-circle" style="margin-right: 6px;"></i><b>${escapeHtml(block.data.text)}</b></a></p>`;
                }
            },
        },

        spoiler: {
            label: 'Спойлер',
            defaults: () => ({ title: 'Нажмите чтобы развернуть', text: 'Скрытый контент...' }),
            editForm(block) {
                return `
                    <div class="form-group"><label>Заголовок спойлера</label><input type="text" data-field="title" value="${escapeHtml(block.data.title)}"></div>
                    <div class="form-group"><label>Текст (поддерживает Markdown: списки, абзацы, "Ключ :: Описание")</label>${agreeToolbarHtml()}<textarea data-field="text" rows="5">${escapeHtml(block.data.text)}</textarea></div>`;
            },
            toHTML(block) {
                return `<details><summary>${escapeHtml(block.data.title)}</summary>${markdownToHtml(block.data.text, false)}</details>`;
            },
            preview(block) {
                return `<details><summary>${escapeHtml(block.data.title)}</summary>${markdownToHtml(block.data.text, true)}</details>`;
            },
        },

        callout: {
            label: 'Инфо-блок',
            defaults: () => ({
                style: 'well',
                title: 'Шаблон статьи.zip',
                text: 'Описание файла или полезные инструкции к действию.',
                btnText: 'Скачать',
                btnLink: '#',
                btnIcon: 'fa-download',
                btnLinkType: 'regular',
                infoId: '5'
            }),
            editForm(block) {
                const btnLinkType = block.data.btnLinkType || 'regular';
                const infoId = block.data.infoId || '5';
                return `
                    <div class="form-row">
                        <div class="form-group" style="flex:0 0 150px">
                            <label>Стиль оформления</label>
                            <select data-field="style">
                                <option value="well" ${block.data.style === 'well' ? 'selected' : ''}>Серый (Well)</option>
                                <option value="info" ${block.data.style === 'info' ? 'selected' : ''}>Синий (Info)</option>
                                <option value="success" ${block.data.style === 'success' ? 'selected' : ''}>Зеленый (Success)</option>
                                <option value="warning" ${block.data.style === 'warning' ? 'selected' : ''}>Желтый (Warning)</option>
                            </select>
                        </div>
                        <div class="form-group" style="flex:0 0 150px">
                            <label>Иконка</label>
                            <select data-field="btnIcon">
                                <option value="fa-download" ${block.data.btnIcon === 'fa-download' ? 'selected' : ''}>Скачать (fa-download)</option>
                                <option value="fa-link" ${block.data.btnIcon === 'fa-link' ? 'selected' : ''}>Ссылка (fa-link)</option>
                                <option value="fa-file-pdf-o" ${block.data.btnIcon === 'fa-file-pdf-o' ? 'selected' : ''}>PDF (fa-file-pdf-o)</option>
                                <option value="fa-info-circle" ${block.data.btnIcon === 'fa-info-circle' ? 'selected' : ''}>Инфо (fa-info-circle)</option>
                                <option value="fa-exclamation-triangle" ${block.data.btnIcon === 'fa-exclamation-triangle' ? 'selected' : ''}>Внимание (fa-exclamation-triangle)</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Заголовок плашки</label>
                        <input type="text" data-field="title" value="${escapeHtml(block.data.title)}">
                    </div>
                    <div class="form-group">
                        <label>Текст описания</label>
                        <textarea data-field="text" rows="3">${escapeHtml(block.data.text)}</textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Текст кнопки</label>
                            <input type="text" data-field="btnText" value="${escapeHtml(block.data.btnText)}">
                        </div>
                        <div class="form-group">
                            <label>Тип действия кнопки</label>
                            <select data-field="btnLinkType" class="callout-link-type-select">
                                <option value="regular" ${btnLinkType === 'regular' ? 'selected' : ''}>Обычная ссылка</option>
                                <option value="popup" ${btnLinkType === 'popup' ? 'selected' : ''}>Всплывающее окно OpenCart (agree)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="callout-regular-link-group" style="display: ${btnLinkType === 'regular' ? 'block' : 'none'}; margin-bottom: 8px;">
                        <div class="form-group">
                            <label>Ссылка кнопки (URL)</label>
                            <input type="text" data-field="btnLink" value="${escapeHtml(block.data.btnLink || '#')}">
                        </div>
                    </div>
                    
                    <div class="callout-popup-link-group" style="display: ${btnLinkType === 'popup' ? 'block' : 'none'}; margin-bottom: 8px;">
                        <div class="form-row">
                            <div class="form-group">
                                <label>ID статьи OpenCart (information_id)</label>
                                <input type="number" data-field="infoId" value="${escapeHtml(infoId)}" placeholder="Например: 5">
                                <small style="color: #666; font-size: 11px; margin-top: 4px; display: block;">
                                    Ссылка для OpenCart: <code class="generated-callout-popup-link">/index.php?route=information/information/agree&information_id=${infoId}</code>
                                </small>
                            </div>
                        </div>
                    </div>`;
            },
            toHTML(block) {
                const styleClass = block.data.style || 'well';
                const btnIcon = block.data.btnIcon || 'fa-download';
                const hasBtn = block.data.btnText ? true : false;
                
                let iconHTML = '';
                let btnIconHTML = '';
                
                if (styleClass === 'well') {
                    btnIconHTML = `<i class="fa ${escapeHtml(btnIcon)}"></i> `;
                } else {
                    iconHTML = `<i class="fa ${escapeHtml(btnIcon)}"></i> `;
                }

                let href = block.data.btnLink || '#';
                let classList = 'article-callout-btn';
                let target = ' target="_blank"';
                
                const btnLinkType = block.data.btnLinkType || 'regular';
                if (btnLinkType === 'popup') {
                    const infoId = block.data.infoId || '5';
                    href = `/index.php?route=information/information/agree&information_id=${infoId}`;
                    classList += ' agree';
                    target = '';
                }

                return `<div class="article-callout style-${escapeHtml(styleClass)}">
    <div class="article-callout-row">
        <div class="article-callout-text-col">
            <h4 class="article-callout-title">${iconHTML}${escapeHtml(block.data.title)}</h4>
            <p class="article-callout-desc">${escapeHtml(block.data.text)}</p>
        </div>
        ${hasBtn ? `<div class="article-callout-btn-col">
            <a href="${escapeHtml(href)}" class="${classList}"${target}>${btnIconHTML}${escapeHtml(block.data.btnText)}</a>
        </div>` : ''}
    </div>
</div>`;
            },
            preview(block) {
                const styleClass = block.data.style || 'well';
                const btnIcon = block.data.btnIcon || 'fa-download';
                const hasBtn = block.data.btnText ? true : false;
                
                let iconHTML = '';
                let btnIconHTML = '';
                
                if (styleClass === 'well') {
                    btnIconHTML = `<i class="fa ${escapeHtml(btnIcon)}"></i> `;
                } else {
                    iconHTML = `<i class="fa ${escapeHtml(btnIcon)}"></i> `;
                }

                let href = block.data.btnLink || '#';
                let classList = 'article-callout-btn';
                let target = ' target="_blank"';
                let onclick = '';
                
                const btnLinkType = block.data.btnLinkType || 'regular';
                if (btnLinkType === 'popup') {
                    const infoId = block.data.infoId || '5';
                    href = `/index.php?route=information/information/agree&information_id=${infoId}`;
                    classList += ' agree';
                    target = '';
                    onclick = ` onclick="alert('Эмуляция OpenCart: Открытие статьи с ID = ${infoId} в модальном окне (через AJAX/Bootstrap modal). В реальности сработает автоматически благодаря встроенному скрипту OpenCart.'); return false;"`;
                }

                return `<div class="article-callout style-${escapeHtml(styleClass)}">
    <div class="article-callout-row">
        <div class="article-callout-text-col">
            <h4 class="article-callout-title">${iconHTML}${escapeHtml(block.data.title)}</h4>
            <p class="article-callout-desc">${escapeHtml(block.data.text)}</p>
        </div>
        ${hasBtn ? `<div class="article-callout-btn-col">
            <a href="${escapeHtml(href)}" class="${classList}"${target}${onclick}>${btnIconHTML}${escapeHtml(block.data.btnText)}</a>
        </div>` : ''}
    </div>
</div>`;
            }
        },

        toc: {
            label: 'Оглавление',
            defaults: () => ({}),
            editForm() {
                return `<p style="color:#888;font-size:12px">Оглавление генерируется автоматически из заголовков H2 и H3.</p>`;
            },
            toHTML(block, allBlocks) { return generateTOC(allBlocks); },
            preview(block, allBlocks) { return generateTOC(allBlocks); },
        },

        alert: {
            label: 'Alert уведомление',
            defaults: () => ({
                style: 'info',
                text: 'Полезное примечание или совет...'
            }),
            editForm(block) {
                return `
                    <div class="form-row">
                        <div class="form-group" style="flex: 1;">
                            <label>Тип предупреждения</label>
                            <select data-field="style">
                                <option value="info" ${block.data.style === 'info' ? 'selected' : ''}>Синий (Info)</option>
                                <option value="success" ${block.data.style === 'success' ? 'selected' : ''}>Зеленый (Success)</option>
                                <option value="warning" ${block.data.style === 'warning' ? 'selected' : ''}>Желтый (Warning)</option>
                                <option value="danger" ${block.data.style === 'danger' ? 'selected' : ''}>Красный (Danger)</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Текст сообщения (поддерживает Markdown: **жирный**, *курсив*, [ссылка](url))</label>
                        <textarea data-field="text" rows="3">${escapeHtml(block.data.text)}</textarea>
                    </div>`;
            },
            toHTML(block) {
                const style = block.data.style || 'info';
                return `<div class="alert alert-${escapeHtml(style)}">${inlineFormat(block.data.text)}</div>`;
            },
            preview(block) {
                const style = block.data.style || 'info';
                return `<div class="alert alert-${escapeHtml(style)}">${inlineFormat(block.data.text, true)}</div>`;
            }
        },

        video: {
            label: 'Адаптивное видео',
            defaults: () => ({
                type: 'youtube',
                videoId: 'dQw4w9WgXcQ',
                url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
            }),
            editForm(block) {
                return `
                    <div class="form-group">
                        <label>Ссылка на видео (YouTube / RuTube / VK / Vimeo / Kinescope)</label>
                        <input type="text" class="video-url-input" data-field="url" value="${escapeHtml(block.data.url || '')}" placeholder="Например: https://rutube.ru/video/... или https://vk.com/video...">
                        <small style="color: #666; font-size: 11px;">Поддерживаются: YouTube, Vimeo, RuTube, Kinescope, VK Видео</small>
                    </div>
                    <div class="form-row">
                        <div class="form-group" style="flex: 1;">
                            <label>Платформа</label>
                            <select class="video-type-select" data-field="type">
                                <option value="youtube" ${block.data.type === 'youtube' ? 'selected' : ''}>YouTube</option>
                                <option value="rutube" ${block.data.type === 'rutube' ? 'selected' : ''}>RuTube</option>
                                <option value="vk" ${block.data.type === 'vk' ? 'selected' : ''}>VK Видео</option>
                                <option value="kinescope" ${block.data.type === 'kinescope' ? 'selected' : ''}>Kinescope</option>
                                <option value="vimeo" ${block.data.type === 'vimeo' ? 'selected' : ''}>Vimeo</option>
                            </select>
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label>ID видео / Параметры</label>
                            <input type="text" class="video-id-input" data-field="videoId" value="${escapeHtml(block.data.videoId || '')}">
                        </div>
                    </div>`;
            },
            toHTML(block) {
                const type = block.data.type || 'youtube';
                const videoId = block.data.videoId || '';
                let embedUrl = '';
                if (type === 'youtube') {
                    embedUrl = `https://www.youtube.com/embed/${escapeHtml(videoId)}`;
                } else if (type === 'vimeo') {
                    embedUrl = `https://player.vimeo.com/video/${escapeHtml(videoId)}`;
                } else if (type === 'rutube') {
                    embedUrl = `https://rutube.ru/play/embed/${escapeHtml(videoId)}`;
                } else if (type === 'kinescope') {
                    embedUrl = `https://kinescope.io/embed/${escapeHtml(videoId)}`;
                } else if (type === 'vk') {
                    embedUrl = `https://vk.com/video_ext.php?${escapeHtml(videoId)}`;
                }
                
                return `<div class="article-video-wrapper">
    <div class="embed-responsive embed-responsive-16by9">
        <iframe class="embed-responsive-item" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    </div>
</div>`;
            },
            preview(block) {
                return this.toHTML(block);
            }
        },

        carousel: {
            label: 'Слайдер изображений',
            defaults: () => ({
                items: [
                    { src: '', alt: 'Слайд 1', caption: 'Заголовок первого слайда' }
                ]
            }),
            editForm(block) {
                let html = `<div class="carousel-editor">`;
                const items = block.data.items || [];
                items.forEach((item, i) => {
                    html += `<div class="carousel-editor-item" style="border: 1px solid #ddd; padding: 10px; border-radius: 6px; margin-bottom: 10px; background: #fafafa; position: relative;">
                        <div style="position: absolute; right: 8px; top: 8px;">
                            <button class="btn btn-sm btn-danger" data-action="remove-carousel-item" data-index="${i}">&times;</button>
                        </div>
                        <div style="font-weight: bold; margin-bottom: 6px;">Слайд ${i + 1}</div>
                        <div class="form-group">
                            <label>Путь к картинке</label>
                            <input type="text" data-carousel-src="${i}" value="${escapeHtml(item.src)}" placeholder="image/catalog/folder/image.jpg">
                        </div>
                        <div class="form-group">
                            <label>Alt текст (для SEO)</label>
                            <input type="text" data-carousel-alt="${i}" value="${escapeHtml(item.alt)}" placeholder="Описание картинки">
                        </div>
                        <div class="form-group">
                            <label>Подпись / Описание</label>
                            <input type="text" data-carousel-caption="${i}" value="${escapeHtml(item.caption)}" placeholder="Текст на слайде">
                        </div>
                    </div>`;
                });
                html += `</div><button class="btn btn-sm btn-ghost" data-action="add-carousel-item">+ Добавить слайд</button>`;
                return html;
            },
            toHTML(block) {
                return this.renderCarousel(block, false);
            },
            preview(block) {
                return this.renderCarousel(block, true);
            },
            renderCarousel(block, isPreview) {
                const id = 'carousel-' + block.id;
                const items = block.data.items || [];
                if (items.length === 0) {
                    return `<div class="alert alert-warning">Слайдер пуст. Добавьте изображения в редакторе.</div>`;
                }
                
                let indicators = '';
                let slides = '';
                
                items.forEach((item, i) => {
                    let imgUrl = item.src || '';
                    if (isPreview) {
                        if (imgUrl && !imgUrl.startsWith('http://') && !imgUrl.startsWith('https://') && !imgUrl.startsWith('data:')) {
                            const domainInputEl = document.getElementById('articleDomain');
                            const domainVal = domainInputEl ? domainInputEl.value.trim() : '';
                            if (domainVal) {
                                const base = domainVal.endsWith('/') ? domainVal : domainVal + '/';
                                const path = imgUrl.startsWith('/') ? imgUrl.substring(1) : imgUrl;
                                imgUrl = base + path;
                            }
                        }
                    }
                    
                    if (!imgUrl) {
                        const theme = getCurrentThemeColors();
                        imgUrl = safeSvgPlaceholder(800, 400, theme.bg, theme.accent, 'Слайд ' + (i + 1) + ' (' + (item.alt || 'Заглушка') + ')');
                    }
                    
                    indicators += `<li data-target="#${id}" data-slide-to="${i}" class="${i === 0 ? 'active' : ''}"></li>`;
                    slides += `<div class="item ${i === 0 ? 'active' : ''}">
                        <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(item.alt || '')}" style="width:100%; max-height:450px; object-fit:cover;">
                        ${item.caption ? `<div class="carousel-caption"><h3>${escapeHtml(item.caption)}</h3></div>` : ''}
                    </div>`;
                });
                
                return `<div id="${id}" class="carousel slide" data-ride="carousel">
    <ol class="carousel-indicators">
        ${indicators}
    </ol>
    <div class="carousel-inner" role="listbox">
        ${slides}
    </div>
    <a class="left carousel-control" href="#${id}" role="button" data-slide="prev">
        <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
        <span class="sr-only">Предыдущий</span>
    </a>
    <a class="right carousel-control" href="#${id}" role="button" data-slide="next">
        <span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
        <span class="sr-only">Следующий</span>
    </a>
</div>`;
            }
        },

        'before-after': {
            label: 'Слайдер До/После',
            defaults: () => ({
                beforeImg: '',
                afterImg: '',
                beforeLabel: 'До',
                afterLabel: 'После'
            }),
            editForm(block) {
                return `
                    <div class="form-group">
                        <label>Изображение ДО</label>
                        <input type="text" data-field="beforeImg" value="${escapeHtml(block.data.beforeImg || '')}" placeholder="image/catalog/folder/before.jpg">
                    </div>
                    <div class="form-group">
                        <label>Изображение ПОСЛЕ</label>
                        <input type="text" data-field="afterImg" value="${escapeHtml(block.data.afterImg || '')}" placeholder="image/catalog/folder/after.jpg">
                    </div>
                    <div class="form-row">
                        <div class="form-group" style="flex: 1;">
                            <label>Ярлык ДО</label>
                            <input type="text" data-field="beforeLabel" value="${escapeHtml(block.data.beforeLabel || 'До')}">
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label>Ярлык ПОСЛЕ</label>
                            <input type="text" data-field="afterLabel" value="${escapeHtml(block.data.afterLabel || 'После')}">
                        </div>
                    </div>`;
            },
            toHTML(block) {
                return this.renderBA(block, false);
            },
            preview(block) {
                return this.renderBA(block, true);
            },
            renderBA(block, isPreview) {
                const id = 'ba-' + block.id;
                let beforeImg = block.data.beforeImg || '';
                let afterImg = block.data.afterImg || '';
                
                if (isPreview) {
                    const domainInputEl = document.getElementById('articleDomain');
                    const domainVal = domainInputEl ? domainInputEl.value.trim() : '';
                    const prependDomain = (url) => {
                        if (url && !url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:')) {
                            if (domainVal) {
                                const base = domainVal.endsWith('/') ? domainVal : domainVal + '/';
                                const path = url.startsWith('/') ? url.substring(1) : url;
                                return base + path;
                            }
                        }
                        return url;
                    };
                    beforeImg = prependDomain(beforeImg);
                    afterImg = prependDomain(afterImg);
                }
                
                const beforeLabel = escapeHtml(block.data.beforeLabel || 'До');
                const afterLabel = escapeHtml(block.data.afterLabel || 'После');
                
                if (!beforeImg) {
                    const theme = getCurrentThemeColors();
                    beforeImg = safeSvgPlaceholder(800, 400, theme.bg, theme.accent, 'Изображение ДО (Заглушка)');
                }
                if (!afterImg) {
                    const theme = getCurrentThemeColors();
                    afterImg = safeSvgPlaceholder(800, 400, theme.bg, theme.accent, 'Изображение ПОСЛЕ (Заглушка)');
                }
                
                const onInputJs = `var c=this.closest('.article-ba-slider'); if(c){ var b=c.querySelector('.ba-before-img'); var h=c.querySelector('.ba-handle-bar'); if(b)b.style.width=this.value+'%'; if(h)h.style.left=this.value+'%'; }`;
                return `<div class="article-ba-slider" id="${id}">
    <div class="ba-image ba-after-img" style="background-image: url('${escapeHtml(afterImg)}');"></div>
    <div class="ba-image ba-before-img" style="background-image: url('${escapeHtml(beforeImg)}');"></div>
    <div class="ba-label ba-label-before">${beforeLabel}</div>
    <div class="ba-label ba-label-after">${afterLabel}</div>
    <input type="range" min="0" max="100" value="50" class="ba-handle-slider" oninput="${escapeHtml(onInputJs)}" onchange="${escapeHtml(onInputJs)}">
    <div class="ba-handle-bar"></div>
</div>`;
            }
        },

        messengers: {
            label: 'Мессенджеры',
            defaults: () => ({
                whatsapp: '',
                telegram: '',
                viber: '',
                phone: ''
            }),
            editForm(block) {
                return `
                    <div class="form-group">
                        <label>WhatsApp (номер телефона в формате 79991234567)</label>
                        <input type="text" data-field="whatsapp" value="${escapeHtml(block.data.whatsapp || '')}" placeholder="Например: 79991234567">
                    </div>
                    <div class="form-group">
                        <label>Telegram (имя пользователя без @ или ссылка)</label>
                        <input type="text" data-field="telegram" value="${escapeHtml(block.data.telegram || '')}" placeholder="Например: username">
                    </div>
                    <div class="form-group">
                        <label>Viber (номер телефона в формате 79991234567 или ссылка)</label>
                        <input type="text" data-field="viber" value="${escapeHtml(block.data.viber || '')}" placeholder="Например: 79991234567">
                    </div>
                    <div class="form-group">
                        <label>Телефон для прямого вызова (в формате +79991234567)</label>
                        <input type="text" data-field="phone" value="${escapeHtml(block.data.phone || '')}" placeholder="Например: +79991234567">
                    </div>`;
            },
            toHTML(block) {
                let html = `<div class="article-messengers-row">`;
                
                if (block.data.whatsapp) {
                    const waClean = block.data.whatsapp.replace(/[^\d]/g, '');
                    html += `<a href="https://wa.me/${waClean}" class="messenger-btn messenger-wa" target="_blank" rel="noopener">
                        <i class="fa fa-whatsapp"></i> WhatsApp
                    </a>`;
                }
                
                if (block.data.telegram) {
                    let tgLink = block.data.telegram;
                    if (!tgLink.startsWith('http')) {
                        tgLink = `https://t.me/${tgLink.replace(/^@/, '')}`;
                    }
                    html += `<a href="${tgLink}" class="messenger-btn messenger-tg" target="_blank" rel="noopener">
                        <i class="fa fa-paper-plane"></i> Telegram
                    </a>`;
                }
                
                if (block.data.viber) {
                    let viberLink = block.data.viber;
                    if (!viberLink.startsWith('viber://') && !viberLink.startsWith('http')) {
                        const vibClean = viberLink.replace(/[^\d]/g, '');
                        viberLink = `viber://chat?number=%2B${vibClean}`;
                    }
                    html += `<a href="${viberLink}" class="messenger-btn messenger-viber" target="_blank" rel="noopener">
                        <i class="fa fa-comments"></i> Viber
                    </a>`;
                }
                
                if (block.data.phone) {
                    html += `<a href="tel:${block.data.phone}" class="messenger-btn messenger-phone">
                        <i class="fa fa-phone"></i> Позвонить
                    </a>`;
                }
                
                html += `</div>`;
                return html;
            },
            preview(block) {
                return this.toHTML(block);
            }
        },

        'product-card': {
            label: 'Карточка товара',
            defaults: () => ({
                name: 'Название товара',
                price: '7 500.00р.',
                img: '',
                link: '#',
                btnText: 'Купить'
            }),
            editForm(block) {
                return `
                    <div class="form-group">
                        <label>Название товара</label>
                        <input type="text" data-field="name" value="${escapeHtml(block.data.name || '')}">
                    </div>
                    <div class="form-row">
                        <div class="form-group" style="flex: 1;">
                            <label>Цена</label>
                            <input type="text" data-field="price" value="${escapeHtml(block.data.price || '')}">
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label>Текст кнопки</label>
                            <input type="text" data-field="btnText" value="${escapeHtml(block.data.btnText || 'Купить')}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Путь к картинке товара</label>
                        <input type="text" data-field="img" value="${escapeHtml(block.data.img || '')}" placeholder="image/catalog/folder/product.jpg">
                    </div>
                    <div class="form-group">
                        <label>Ссылка на страницу товара (URL)</label>
                        <div style="display:flex; gap: 8px;">
                            <input type="text" data-field="link" value="${escapeHtml(block.data.link || '#')}" style="flex: 1; margin-bottom: 0;">
                            <button class="btn btn-sm btn-ghost" data-action="parse-product-link" type="button" style="white-space: nowrap; height: 36px; display: inline-flex; align-items: center; justify-content: center; gap: 4px; padding: 6px 12px; border: 1px solid #ccc; border-radius: 4px; background: #fff;" title="Получить название, цену и фото автоматически">
                                <i class="fa fa-refresh"></i> Автозаполнение
                            </button>
                        </div>
                    </div>
                    <div class="form-group" style="margin-top: 10px; padding: 10px; background: #fcf8e3; border: 1px solid #faebcc; border-radius: 4px; color: #8a6d3b; font-size: 11px; line-height: 1.4;">
                        <i class="fa fa-info-circle" style="font-size: 13px; margin-right: 6px; float: left; margin-top: 2px;"></i>
                        <strong>Подсказка:</strong> Для корректной работы автозаполнения укажите адрес вашего сайта в поле «Домен» (вверху страницы). 
                        Путь к картинке автоматически очищается от кэша OpenCart (<code>/image/cache/...</code>) и приводится к оригиналу. После импорта статьи картинка отобразится на вашем сайте автоматически.
                    </div>`;
            },
            toHTML(block) {
                return this.renderCard(block, false);
            },
            preview(block) {
                return this.renderCard(block, true);
            },
            renderCard(block, isPreview) {
                const name = escapeHtml(block.data.name || '');
                const price = escapeHtml(block.data.price || '');
                let img = block.data.img || '';
                const link = escapeHtml(block.data.link || '#');
                const btnText = escapeHtml(block.data.btnText || 'Купить');
                
                if (isPreview) {
                    if (img && !img.startsWith('http://') && !img.startsWith('https://') && !img.startsWith('data:')) {
                        const domainInputEl = document.getElementById('articleDomain');
                        const domainVal = domainInputEl ? domainInputEl.value.trim() : '';
                        if (domainVal) {
                            const base = domainVal.endsWith('/') ? domainVal : domainVal + '/';
                            const path = img.startsWith('/') ? img.substring(1) : img;
                            img = base + path;
                        }
                    }
                }
                
                if (!img) {
                    const theme = getCurrentThemeColors();
                    img = safeSvgPlaceholder(200, 200, theme.bg, theme.accent, 'Товар');
                }
                
                return `<div class="article-product-card">
    <div class="product-card-img-wrap">
        <a href="${link}"><img src="${escapeHtml(img)}" alt="${name}"></a>
    </div>
    <div class="product-card-info">
        <h4 class="product-card-title"><a href="${link}">${name}</a></h4>
        <div class="product-card-footer">
            <div class="product-card-price">${price}</div>
            <a href="${link}" class="product-card-btn">${btnText}</a>
        </div>
    </div>
</div>`;
            }
        },
    };

    // Регистрация legacy-блоков в общем реестре
    Object.keys(LEGACY_BLOCK_TYPES).forEach(type => {
        BlockRegistry.register(Object.assign({ type }, LEGACY_BLOCK_TYPES[type]));
    });

    const BLOCK_TYPES = BlockRegistry.getAll();

    // ── Inline formatting ────────────────────────────────────
    function inlineFormat(text, isPreview = false) {
        let s = escapeHtml(text);
        s = s.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
        s = s.replace(/\*(.+?)\*/g, '<i>$1</i>');
        s = s.replace(/`(.+?)`/g, '<code>$1</code>');
        
        s = s.replace(/\[(.+?)\]\((.+?)\)/g, (match, linkText, url) => {
            let isAgree = false;
            let infoId = '';
            
            if (url.startsWith('agree:') || url.startsWith('popup:')) {
                isAgree = true;
                infoId = url.split(':')[1];
            } else {
                const matchAgree = url.match(/information\/information\/agree.*[?&]information_id=(\d+)/);
                if (matchAgree) {
                    isAgree = true;
                    infoId = matchAgree[1];
                }
            }
            
            if (isAgree) {
                const href = `index.php?route=information/information/agree&information_id=${infoId}`;
                if (isPreview) {
                    return `<a class="agree" href="${href}" onclick="alert('\u0412 OpenCart: \u041e\u0442\u043a\u0440\u044b\u0442\u0438\u0435 \u043c\u043e\u0434\u0430\u043b\u044c\u043dого \u043e\u043a\u043d\u0430 \u0441 ID = ${infoId} (\u0447\u0435\u0440ез AJAX/Bootstrap modal). \u0412 \u0440\u0435\u0430\u043bьно\u0439 \u0441\u0438\u0441теме \u0441\u0440аботает \u0430в\u0442оматич\u0435ски \u0431лагодаря agree...'); return false;">${linkText}</a>`;
                } else {
                    return `<a class="agree" href="${href}">${linkText}</a>`;
                }
            }
            return `<a href="${url}">${linkText}</a>`;
        });
        return s;
    }

    function agreeToolbarHtml() {
        return `<div class="textarea-tools">
            <input type="number" min="1" value="5" data-agree-info-id title="ID информационной статьи OpenCart">
            <button type="button" class="btn btn-sm btn-ghost" data-action="insert-agree-link" title="Обернуть выделенный текст в OpenCart agree-ссылку">agree</button>
            <span class="textarea-tools-hint">Выделите текст и нажмите agree</span>
        </div>`;
    }

    function insertAgreeLinkFromSelection(block, form, trigger) {
        const textareas = Array.from(form.querySelectorAll('textarea'));
        const activeTextarea = textareas.includes(document.activeElement) ? document.activeElement : null;
        const textarea = activeTextarea && activeTextarea.selectionStart !== activeTextarea.selectionEnd
            ? activeTextarea
            : textareas.find(el => el.selectionStart !== el.selectionEnd);

        if (!textarea) {
            alert('Выделите текст в поле редактора, который нужно открыть через agree-попап.');
            return;
        }

        const infoInput = trigger.closest('.textarea-tools').querySelector('[data-agree-info-id]');
        const cleanInfoId = infoInput ? infoInput.value.trim() : '';

        if (!/^\d+$/.test(cleanInfoId)) {
            alert('ID статьи должен быть числом.');
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.slice(start, end);

        textarea.setRangeText(`[${selectedText}](agree:${cleanInfoId})`, start, end, 'end');
        syncTextareaData(block, textarea);
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        updatePreview();
    }

    function syncTextareaData(block, textarea) {
        if (textarea.dataset.field) {
            block.data[textarea.dataset.field] = textarea.value;
        } else if (textarea.dataset.tabText !== undefined) {
            const idx = parseInt(textarea.dataset.tabText);
            block.data.tabs[idx].text = textarea.value;
        }
    }

    // ── Markdown to HTML parser ──────────────────────────────
    function markdownToHtml(text, isPreview = false) {
        if (!text) return '';
        const lines = text.split(/\r?\n/);
        let html = '';
        let listType = null; // 'ul', 'ol', 'dl', or null
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (!line) {
                if (listType) {
                    html += `</${listType}>\n`;
                    listType = null;
                }
                continue;
            }
            
            // Check if it's an unordered list item
            if (line.startsWith('* ') || line.startsWith('- ') || line.startsWith('• ')) {
                if (listType && listType !== 'ul') {
                    html += `</${listType}>\n`;
                    listType = null;
                }
                if (!listType) {
                    html += '<ul>\n';
                    listType = 'ul';
                }
                const cleanLine = line.replace(/^[\*\-\•]\s+/, '');
                html += `<li>${inlineFormat(cleanLine, isPreview)}</li>\n`;
                continue;
            }
            
            // Check if it's an ordered list item
            if (/^\d+\.\s+/.test(line)) {
                if (listType && listType !== 'ol') {
                    html += `</${listType}>\n`;
                    listType = null;
                }
                if (!listType) {
                    html += '<ol>\n';
                    listType = 'ol';
                }
                const cleanLine = line.replace(/^\d+\.\s+/, '');
                html += `<li>${inlineFormat(cleanLine, isPreview)}</li>\n`;
                continue;
            }
            
            // Check if it's a description list item (dt :: dd)
            if (line.includes('::')) {
                if (listType && listType !== 'dl') {
                    html += `</${listType}>\n`;
                    listType = null;
                }
                if (!listType) {
                    html += '<dl>\n';
                    listType = 'dl';
                }
                const parts = line.split('::');
                const dt = parts[0].trim();
                const dd = parts.slice(1).join('::').trim();
                html += `<dt>${inlineFormat(dt, isPreview)}</dt><dd>${inlineFormat(dd, isPreview)}</dd>\n`;
                continue;
            }
            
            // Default line is a paragraph
            if (listType) {
                html += `</${listType}>\n`;
                listType = null;
            }
            html += `<p>${inlineFormat(line, isPreview)}</p>\n`;
        }
        
        if (listType) {
            html += `</${listType}>\n`;
        }
        
        return html;
    }

    // ── TOC generator ────────────────────────────────────────
    function generateTOC(allBlocks) {
        const headings = allBlocks ? allBlocks.filter(b => b.type === 'heading') : [];
        if (headings.length === 0) return '<p style="color:#aaa;font-style:italic">Добавьте заголовки H2/H3 для генерации оглавления</p>';
        
        const theme = getCurrentThemeColors();
        const styleAttr = `style="--accent_background_color: ${theme.accent}; --background_main_color: ${theme.bg}; --background_additional_color: ${theme.bgAdditional}; --main_color: ${theme.text}; --additional_color: ${theme.textAdditional};"`;
        
        let html = `<div class="blog-content" ${styleAttr}>`;
        html += `<div class="bold menu-content-title">Содержание<i class="fa fa-chevron-down"></i></div>`;
        html += `<ul>`;
        headings.forEach((h, idx) => {
            const isSub = h.data.level === 3;
            const targetId = `heading${idx + 1}`;
            if (isSub) {
                html += `<li style="list-style: none;"><ul class="ogli3"><li><a class="anchor" href="#${targetId}" data-destination="#${targetId}">${escapeHtml(h.data.text)}</a></li></ul></li>`;
            } else {
                html += `<li><a class="anchor" href="#${targetId}" data-destination="#${targetId}">${escapeHtml(h.data.text)}</a></li>`;
            }
        });
        html += `</ul>`;
        html += `</div>`;
        return html;
    }

    // ── Block CRUD ───────────────────────────────────────────
    function scrollToBlock(blockId) {
        setTimeout(() => {
            const ws = document.getElementById('workspace');
            const card = ws ? ws.querySelector(`.block-card[data-id="${blockId}"]`) : null;
            if (ws && card) {
                const wsRect = ws.getBoundingClientRect();
                const cardRect = card.getBoundingClientRect();
                const targetScrollTop = cardRect.top + ws.scrollTop - wsRect.top;
                
                ws.scrollTo({
                    top: targetScrollTop - 20,
                    behavior: 'smooth'
                });
                
                card.style.transition = 'background-color 0.4s';
                card.style.backgroundColor = '#fff9db';
                setTimeout(() => card.style.backgroundColor = '', 1000);
            }
            
            const preview = document.getElementById('previewPanel');
            const previewEl = preview ? preview.querySelector(`[data-preview-id="${blockId}"]`) : null;
            if (preview && previewEl) {
                const previewRect = preview.getBoundingClientRect();
                const previewElRect = previewEl.getBoundingClientRect();
                const targetPreviewScrollTop = previewElRect.top + preview.scrollTop - previewRect.top;
                
                preview.scrollTo({
                    top: targetPreviewScrollTop - 20,
                    behavior: 'smooth'
                });
                
                previewEl.style.transition = 'background-color 0.4s, box-shadow 0.4s';
                previewEl.style.backgroundColor = '#fff9db';
                previewEl.style.boxShadow = '0 0 10px rgba(241, 196, 15, 0.4)';
                setTimeout(() => {
                    previewEl.style.backgroundColor = '';
                    previewEl.style.boxShadow = '';
                }, 1000);
            }
        }, 250);
    }

    function addBlock(type) {
        const def = BLOCK_TYPES[type];
        if (!def) return;
        const block = { id: uuid(), type, data: def.defaults() };
        blocks.push(block);
        renderBlocks();
        updatePreview();
        scrollToBlock(block.id);
    }

    function removeBlock(id) {
        const idx = blocks.findIndex(b => b.id === id);

        if (idx === -1) {
            return;
        }

        const block = blocks[idx];
        const returnedBlocks = block.type === 'grid' ? getGridChildren(block) : [];
        blocks.splice(idx, 1, ...returnedBlocks);
        renderBlocks();
        updatePreview();
    }

    function duplicateBlock(id) {
        const idx = blocks.findIndex(b => b.id === id);
        if (idx === -1) return;
        const clone = JSON.parse(JSON.stringify(blocks[idx]));
        refreshBlockIds(clone);
        blocks.splice(idx + 1, 0, clone);
        renderBlocks();
        updatePreview();
    }

    function moveBlock(fromIdx, toIdx) {
        if (fromIdx === toIdx) return;
        const [moved] = blocks.splice(fromIdx, 1);
        blocks.splice(toIdx > fromIdx ? toIdx - 1 : toIdx, 0, moved);
        renderBlocks();
        updatePreview();
    }

    function getGridChildren(block) {
        if (!block || block.type !== 'grid') {
            return [];
        }

        return block.data.columns.flatMap(column => column.blocks);
    }

    function findGridColumn(gridBlock, columnId) {
        return gridBlock.data.columns.find(column => column.id === columnId);
    }

    function findNestedBlock(childId) {
        for (const gridBlock of blocks) {
            if (gridBlock.type !== 'grid') continue;

            for (const column of gridBlock.data.columns) {
                const idx = column.blocks.findIndex(child => child.id === childId);

                if (idx !== -1) {
                    return { gridBlock, column, idx, block: column.blocks[idx] };
                }
            }
        }

        return null;
    }

    function moveBlockIntoGrid(blockId, gridBlock, columnId) {
        if (!gridBlock || gridBlock.type !== 'grid' || blockId === gridBlock.id) {
            return;
        }

        const column = findGridColumn(gridBlock, columnId);

        if (!column) {
            return;
        }

        let movedBlock = null;
        const topIdx = blocks.findIndex(block => block.id === blockId);

        if (topIdx !== -1) {
            movedBlock = blocks[topIdx];

            if (movedBlock.type === 'grid') {
                return;
            }

            blocks.splice(topIdx, 1);
        } else {
            const nested = findNestedBlock(blockId);

            if (!nested) {
                return;
            }

            movedBlock = nested.block;
            nested.column.blocks.splice(nested.idx, 1);
        }

        column.blocks.push(movedBlock);
        renderBlocks();
        updatePreview();
    }

    function removeGridChild(columnId, childId) {
        const nested = findNestedBlock(childId);

        if (!nested || nested.column.id !== columnId) {
            return;
        }

        nested.column.blocks.splice(nested.idx, 1);
        renderBlocks();
        updatePreview();
    }

    function removeGridColumn(gridBlock, columnId) {
        const gridIdx = blocks.findIndex(block => block.id === gridBlock.id);
        const columnIdx = gridBlock.data.columns.findIndex(column => column.id === columnId);

        if (gridIdx === -1 || columnIdx === -1 || gridBlock.data.columns.length <= 1) {
            return;
        }

        const [removedColumn] = gridBlock.data.columns.splice(columnIdx, 1);
        const count = gridBlock.data.columns.length;
        gridBlock.data.pcPattern = getGridPattern(count);

        if (gridBlock.data.mobilePerRow > count) {
            gridBlock.data.mobilePerRow = 1;
        }

        blocks.splice(gridIdx + 1, 0, ...removedColumn.blocks);
        renderBlocks();
        updatePreview();
    }

    function updateGridSectionCount(gridBlock, count) {
        const gridIdx = blocks.findIndex(block => block.id === gridBlock.id);
        const currentCount = gridBlock.data.columns.length;

        if (gridIdx === -1 || count === currentCount || !GRID_PC_PRESETS[count]) {
            return;
        }

        if (count > currentCount) {
            while (gridBlock.data.columns.length < count) {
                gridBlock.data.columns.push(createGridColumn());
            }
        } else {
            const removedColumns = gridBlock.data.columns.splice(count);
            const returnedBlocks = removedColumns.flatMap(column => column.blocks);
            blocks.splice(gridIdx + 1, 0, ...returnedBlocks);
        }

        gridBlock.data.pcPattern = getGridPattern(count);

        if (gridBlock.data.mobilePerRow > count) {
            gridBlock.data.mobilePerRow = 1;
        }

        renderBlocks();
        updatePreview();
    }

    function updateGridPcPattern(gridBlock, value) {
        const pattern = parseGridPattern(value);

        if (pattern.length !== gridBlock.data.columns.length || pattern.reduce((sum, col) => sum + col, 0) !== 12) {
            return;
        }

        gridBlock.data.pcPattern = pattern;
        renderBlocks();
        updatePreview();
    }

    function updateGridMobilePerRow(gridBlock, value) {
        const mobilePerRow = parseInt(value, 10);

        if (![1, 2].includes(mobilePerRow)) {
            return;
        }

        gridBlock.data.mobilePerRow = mobilePerRow;
        renderBlocks();
        updatePreview();
    }

    // ── Render blocks in workspace ───────────────────────────
    function renderBlocks() {
        workspaceEmpty.style.display = blocks.length === 0 ? 'flex' : 'none';
        blocksContainer.innerHTML = '';

        blocks.forEach((block, idx) => {
            const card = createBlockCard(block, idx, blocks);

            // DnD events
            card.addEventListener('dragstart', (e) => {
                dragState.dragging = block.id;
                card.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', block.id);
            });
            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
                dragState.dragging = null;
                $$('.block-card').forEach(c => c.classList.remove('drag-over'));
            });
            card.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                $$('.block-card').forEach(c => c.classList.remove('drag-over'));
                card.classList.add('drag-over');
            });
            card.addEventListener('drop', (e) => {
                e.preventDefault();
                card.classList.remove('drag-over');
                const fromId = e.dataTransfer.getData('text/plain');
                if (fromId === block.id) return;

                let movedBlock = null;
                const topIdx = blocks.findIndex(b => b.id === fromId);
                if (topIdx !== -1) {
                    movedBlock = blocks[topIdx];
                    blocks.splice(topIdx, 1);
                } else {
                    const nested = findNestedBlock(fromId);
                    if (nested) {
                        movedBlock = nested.block;
                        nested.column.blocks.splice(nested.idx, 1);
                    }
                }

                if (movedBlock) {
                    const toIdx = blocks.indexOf(block);
                    blocks.splice(toIdx, 0, movedBlock);
                    renderBlocks();
                    updatePreview();
                }
            });

            // Action buttons
            card.querySelector('[data-action="delete"]').addEventListener('click', () => removeBlock(block.id));
            card.querySelector('[data-action="duplicate"]').addEventListener('click', () => duplicateBlock(block.id));
            card.querySelector('[data-action="edit"]').addEventListener('click', () => toggleEdit(block, card));

            if (block.type === 'grid') {
                bindGridWorkspaceEvents(block, card);
            }

            blocksContainer.appendChild(card);
        });
    }

    function renderBlocksWithAnimation() {
        blocksContainer.classList.add('animate-fade');
        renderBlocks();
        setTimeout(() => {
            blocksContainer.classList.remove('animate-fade');
        }, 1000);
    }

    function bindGridWorkspaceEvents(gridBlock, card) {
        card.querySelectorAll('.grid-column-drop').forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = 'move';
                zone.classList.add('grid-column-over');
            });
            zone.addEventListener('dragleave', () => {
                zone.classList.remove('grid-column-over');
            });
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                zone.classList.remove('grid-column-over');
                moveBlockIntoGrid(e.dataTransfer.getData('text/plain'), gridBlock, zone.dataset.gridColumn);
            });
        });

        card.querySelectorAll('.grid-child-card').forEach(childCard => {
            childCard.addEventListener('dragstart', (e) => {
                dragState.dragging = childCard.dataset.childId;
                e.stopPropagation();
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', childCard.dataset.childId);
                childCard.classList.add('dragging');
            });
            childCard.addEventListener('dragend', () => {
                childCard.classList.remove('dragging');
                dragState.dragging = null;
            });
        });

        card.querySelectorAll('[data-action="remove-grid-child"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeGridChild(btn.dataset.columnId, btn.dataset.childId);
            });
        });

        card.querySelectorAll('[data-action="remove-grid-column"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeGridColumn(gridBlock, btn.dataset.columnId);
            });
        });
    }

    // ── Edit mode ────────────────────────────────────────────
    function toggleEdit(block, card) {
        const body = card.querySelector('.block-body');

        // If already editing, close
        if (body.querySelector('.edit-form')) {
            renderBlocks();
            return;
        }

        openEditForm(block, body);
    }

    function openEditForm(block, body) {
        body.innerHTML = renderEditForm(block);

        const form = body.querySelector('.edit-form');
        bindFormEvents(block, form, body);

        body.querySelector('[data-action="save"]').addEventListener('click', () => {
            readFormData(block, form);
            renderBlocks();
            updatePreview();
        });
        body.querySelector('[data-action="cancel"]').addEventListener('click', () => renderBlocks());
    }

    function refreshEditForm(block, card) {
        const body = card.querySelector('.block-body');
        if (body && body.querySelector('.edit-form')) {
            openEditForm(block, body);
        }
    }

    function bindFormEvents(block, form, body) {
        const card = body.closest('.block-card');
        // Generic field bindings
        form.querySelectorAll('[data-field]').forEach(el => {
            const updateField = () => {
                const field = el.dataset.field;
                if (el.type === 'checkbox') {
                    block.data[field] = el.checked;
                    
                    // Special behavior for table editor classes
                    if (block.type === 'table') {
                        const editorTable = form.querySelector('.table-editor table');
                        if (editorTable) {
                            const className = `table-${field}`;
                            if (el.checked) {
                                editorTable.classList.add(className);
                            } else {
                                editorTable.classList.remove(className);
                            }
                        }
                    }
                } else if (el.tagName === 'SELECT' && field === 'level') {
                    block.data[field] = parseInt(el.value);
                } else {
                    block.data[field] = el.value;
                }
                updatePreview();
            };
            el.addEventListener('input', updateField);
            el.addEventListener('change', updateField);
        });

        form.querySelectorAll('[data-action="insert-agree-link"]').forEach(btn => {
            btn.addEventListener('click', () => insertAgreeLinkFromSelection(block, form, btn));
        });

        form.querySelectorAll('[data-grid-field]').forEach(select => {
            select.addEventListener('change', () => {
                if (block.type !== 'grid') {
                    return;
                }

                if (select.dataset.gridField === 'sectionCount') {
                    updateGridSectionCount(block, parseInt(select.value, 10));
                } else if (select.dataset.gridField === 'pcPattern') {
                    updateGridPcPattern(block, select.value);
                } else if (select.dataset.gridField === 'mobilePerRow') {
                    updateGridMobilePerRow(block, select.value);
                }
            });
        });

        // List add/remove items
        form.querySelectorAll('[data-action="add-item"]').forEach(btn => {
            btn.addEventListener('click', () => {
                block.data.items.push('Новый пункт');
                refreshEditForm(block, card);
            });
        });
        form.querySelectorAll('[data-action="remove-item"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.index);
                block.data.items.splice(idx, 1);
                refreshEditForm(block, card);
            });
        });

        // Table actions
        form.querySelectorAll('[data-action="add-col"]').forEach(btn => {
            btn.addEventListener('click', () => {
                block.data.headers.push('Новый столбец');
                block.data.rows.forEach(row => row.push(''));
                refreshEditForm(block, card);
            });
        });
        form.querySelectorAll('[data-action="add-row"]').forEach(btn => {
            btn.addEventListener('click', () => {
                block.data.rows.push(new Array(block.data.headers.length).fill(''));
                refreshEditForm(block, card);
            });
        });
        form.querySelectorAll('[data-action="remove-col"]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (block.data.headers.length <= 1) return;
                block.data.headers.pop();
                block.data.rows.forEach(row => row.pop());
                refreshEditForm(block, card);
            });
        });
        form.querySelectorAll('[data-action="remove-row"]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (block.data.rows.length <= 1) return;
                block.data.rows.pop();
                refreshEditForm(block, card);
            });
        });

        // Tabs actions
        form.querySelectorAll('[data-action="add-tab"]').forEach(btn => {
            btn.addEventListener('click', () => {
                block.data.tabs.push({ title: 'Новая вкладка', text: '' });
                refreshEditForm(block, card);
            });
        });
        form.querySelectorAll('[data-action="remove-tab"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.index);
                block.data.tabs.splice(idx, 1);
                refreshEditForm(block, card);
            });
        });

        // FAQ actions
        form.querySelectorAll('[data-action="add-faq-item"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const newIdx = block.data.items.length;
                block.data.items.push({ question: 'Новый вопрос?', answer: 'Ответ...' });
                const faqEditor = form.querySelector('.faq-editor');
                const itemHtml = `<div class="faq-editor-item">
                    <div class="faq-editor-header">
                        <span class="faq-editor-num">${newIdx + 1}</span>
                        <input type="text" data-faq-question="${newIdx}" value="Новый вопрос?" placeholder="Вопрос">
                        <button class="btn btn-sm btn-ghost" data-action="remove-faq-item" data-index="${newIdx}">&times;</button>
                    </div>
                    <textarea data-faq-answer="${newIdx}" rows="3" placeholder="Ответ">Ответ...</textarea>
                    ${agreeToolbarHtml()}
                </div>`;
                faqEditor.insertAdjacentHTML('beforeend', itemHtml);
                const newItem = faqEditor.lastElementChild;
                newItem.querySelector('[data-action="remove-faq-item"]').addEventListener('click', (e) => {
                    e.stopPropagation();
                    const idx = parseInt(newItem.querySelector('[data-action="remove-faq-item"]').dataset.index);
                    block.data.items.splice(idx, 1);
                    newItem.remove();
                    updatePreview();
                });
                newItem.querySelector('[data-faq-question]').addEventListener('input', (e) => {
                    const idx = parseInt(e.target.dataset.faqQuestion);
                    block.data.items[idx].question = e.target.value;
                });
                newItem.querySelector('[data-faq-answer]').addEventListener('input', (e) => {
                    const idx = parseInt(e.target.dataset.faqAnswer);
                    block.data.items[idx].answer = e.target.value;
                });
                updatePreview();
            });
        });
        form.querySelectorAll('[data-action="remove-faq-item"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.index);
                block.data.items.splice(idx, 1);
                btn.closest('.faq-editor-item').remove();
                updatePreview();
            });
        });
        form.querySelectorAll('[data-faq-question]').forEach(input => {
            input.addEventListener('input', () => {
                const idx = parseInt(input.dataset.faqQuestion);
                block.data.items[idx].question = input.value;
            });
        });
        form.querySelectorAll('[data-faq-answer]').forEach(textarea => {
            textarea.addEventListener('input', () => {
                const idx = parseInt(textarea.dataset.faqAnswer);
                block.data.items[idx].answer = textarea.value;
            });
        });

        // Table cell inputs
        form.querySelectorAll('.table-editor input').forEach(input => {
            input.addEventListener('input', () => {
                const ri = input.dataset.row;
                const ci = input.dataset.col;
                if (ri !== undefined && ci !== undefined) {
                    block.data.rows[parseInt(ri)][parseInt(ci)] = input.value;
                } else if (ci !== undefined) {
                    block.data.headers[parseInt(ci)] = input.value;
                }
                updatePreview();
            });
        });

        // Tab title/text inputs
        form.querySelectorAll('[data-tab-title]').forEach(input => {
            input.addEventListener('input', () => {
                const idx = parseInt(input.dataset.tabTitle);
                block.data.tabs[idx].title = input.value;
            });
        });
        form.querySelectorAll('[data-tab-text]').forEach(textarea => {
            textarea.addEventListener('input', () => {
                const idx = parseInt(textarea.dataset.tabText);
                block.data.tabs[idx].text = textarea.value;
            });
        });

        // Image local file input handler
        form.querySelectorAll('.img-local-file-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = function(evt) {
                    const base64 = evt.target.result;
                    block.data.localSrc = base64;
                    
                    const hiddenInput = form.querySelector('[data-field="localSrc"]');
                    if (hiddenInput) {
                        hiddenInput.value = base64;
                    }
                    
                    let thumb = form.querySelector('.img-local-thumb');
                    if (!thumb) {
                        thumb = document.createElement('div');
                        thumb.className = 'img-local-thumb';
                        thumb.style.marginTop = '6px';
                        input.parentNode.appendChild(thumb);
                    }
                    thumb.innerHTML = `<img src="${base64}" style="max-height:80px;border-radius:4px;display:block;">`;
                    updatePreview();
                };
                reader.readAsDataURL(file);
            });
        });

        // Image source type change handler
        form.querySelectorAll('.img-src-type-select').forEach(select => {
            select.addEventListener('change', () => {
                const type = select.value;
                block.data.srcType = type;
                
                const pathGroup = form.querySelector('.img-src-path-group');
                const localGroup = form.querySelector('.img-src-local-group');
                
                if (pathGroup && localGroup) {
                    pathGroup.style.display = type === 'path' ? 'block' : 'none';
                    localGroup.style.display = type === 'local' ? 'block' : 'none';
                }
                updatePreview();
            });
        });

        // Link type change handler
        form.querySelectorAll('.link-type-select').forEach(select => {
            select.addEventListener('change', () => {
                const type = select.value;
                block.data.linkType = type;
                block.data.isPopup = (type === 'popup');
                
                const regularGroup = form.querySelector('.regular-link-group');
                const popupGroup = form.querySelector('.popup-link-group');
                
                if (regularGroup && popupGroup) {
                    regularGroup.style.display = type === 'regular' ? 'block' : 'none';
                    popupGroup.style.display = type === 'popup' ? 'block' : 'none';
                }
                
                if (type === 'popup' && !block.data.infoId) {
                    block.data.infoId = '5';
                    const infoInput = form.querySelector('[data-field="infoId"]');
                    if (infoInput) infoInput.value = '5';
                }
                updatePreview();
            });
        });

        // Callout button action type change handler
        form.querySelectorAll('.callout-link-type-select').forEach(select => {
            select.addEventListener('change', () => {
                const type = select.value;
                block.data.btnLinkType = type;
                
                const regularGroup = form.querySelector('.callout-regular-link-group');
                const popupGroup = form.querySelector('.callout-popup-link-group');
                
                if (regularGroup && popupGroup) {
                    regularGroup.style.display = type === 'regular' ? 'block' : 'none';
                    popupGroup.style.display = type === 'popup' ? 'block' : 'none';
                }
                
                if (type === 'popup' && !block.data.infoId) {
                    block.data.infoId = '5';
                    const infoInput = form.querySelector('[data-field="infoId"]');
                    if (infoInput) infoInput.value = '5';
                }
                updatePreview();
            });
        });

        // Popup ID input live link preview generator helper
        form.querySelectorAll('[data-field="infoId"]').forEach(input => {
            input.addEventListener('input', () => {
                const codeEl = form.querySelector('.generated-popup-link');
                if (codeEl) {
                    codeEl.textContent = `/index.php?route=information/information/agree&information_id=${input.value || 'ID'}`;
                }
                const calloutCodeEl = form.querySelector('.generated-callout-popup-link');
                if (calloutCodeEl) {
                    calloutCodeEl.textContent = `/index.php?route=information/information/agree&information_id=${input.value || 'ID'}`;
                }
            });
        });

        // Popup block style change handler (button options toggle)
        form.querySelectorAll('.popup-style-select').forEach(select => {
            select.addEventListener('change', () => {
                const type = select.value;
                const optionsGroup = form.querySelector('.popup-btn-options');
                if (optionsGroup) {
                    optionsGroup.style.display = type === 'button' ? 'block' : 'none';
                }
                updatePreview();
            });
        });

        // Video URL auto-parsing
        form.querySelectorAll('.video-url-input').forEach(input => {
            const handleVideoChange = () => {
                const parsed = parseVideoUrl(input.value);
                block.data.type = parsed.type;
                block.data.videoId = parsed.videoId;
                
                const typeSelect = form.querySelector('.video-type-select');
                const idInput = form.querySelector('.video-id-input');
                if (typeSelect) typeSelect.value = parsed.type;
                if (idInput) idInput.value = parsed.videoId;
                
                updatePreview();
            };
            input.addEventListener('input', handleVideoChange);
            input.addEventListener('change', handleVideoChange);
        });

        // Carousel Actions
        form.querySelectorAll('[data-action="add-carousel-item"]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!block.data.items) block.data.items = [];
                const newIdx = block.data.items.length;
                block.data.items.push({ src: '', alt: `Слайд ${newIdx + 1}`, caption: '' });
                refreshEditForm(block, card);
            });
        });
        form.querySelectorAll('[data-action="remove-carousel-item"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.index);
                if (block.data.items) {
                    block.data.items.splice(idx, 1);
                }
                refreshEditForm(block, card);
            });
        });
        form.querySelectorAll('[data-carousel-src]').forEach(input => {
            input.addEventListener('input', () => {
                const idx = parseInt(input.dataset.carouselSrc);
                if (block.data.items && block.data.items[idx]) {
                    block.data.items[idx].src = input.value;
                }
            });
        });
        form.querySelectorAll('[data-carousel-alt]').forEach(input => {
            input.addEventListener('input', () => {
                const idx = parseInt(input.dataset.carouselAlt);
                if (block.data.items && block.data.items[idx]) {
                    block.data.items[idx].alt = input.value;
                }
            });
        });
        form.querySelectorAll('[data-carousel-caption]').forEach(input => {
            input.addEventListener('input', () => {
                const idx = parseInt(input.dataset.carouselCaption);
                if (block.data.items && block.data.items[idx]) {
                    block.data.items[idx].caption = input.value;
                }
            });
        });

        // Product Card Auto-parsing
        const btnParse = form.querySelector('[data-action="parse-product-link"]');
        if (btnParse) {
            btnParse.addEventListener('click', async () => {
                const linkInput = form.querySelector('[data-field="link"]');
                const url = linkInput ? linkInput.value.trim() : '';
                if (!url || url === '#' || !url.startsWith('http')) {
                    alert('Пожалуйста, укажите корректную ссылку на страницу товара (начиная с http:// или https://).');
                    return;
                }
                
                const originalText = btnParse.innerHTML;
                btnParse.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Загрузка...';
                btnParse.disabled = true;
                
                let htmlText = '';
                try {
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    htmlText = await response.text();
                } catch (err) {
                    console.log('Direct fetch failed (likely CORS). Trying CORS proxy...');
                    try {
                        const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(url);
                        const response = await fetch(proxyUrl);
                        if (!response.ok) {
                            throw new Error(`Proxy HTTP error! status: ${response.status}`);
                        }
                        htmlText = await response.text();
                    } catch (proxyErr) {
                        console.error('CORS proxy also failed:', proxyErr);
                        throw err; // throw original fetch error to trigger the CORS alert
                    }
                }
                try {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlText, 'text/html');
                    
                    // 1. Extract Name
                    let name = '';
                    const ogTitle = doc.querySelector('meta[property="og:title"]');
                    if (ogTitle) name = ogTitle.getAttribute('content');
                    if (!name) {
                        const h1 = doc.querySelector('h1');
                        if (h1) name = h1.textContent.trim();
                    }
                    
                    // 2. Extract Price
                    let price = '';
                    const ogPrice = doc.querySelector('meta[property="og:price:amount"]') || doc.querySelector('meta[property="product:price:amount"]') || doc.querySelector('meta[itemprop="price"]');
                    if (ogPrice) {
                        const amount = ogPrice.getAttribute('content') || ogPrice.getAttribute('value');
                        if (amount) {
                            const currency = doc.querySelector('meta[property="og:price:currency"]') || doc.querySelector('meta[property="product:price:currency"]') || doc.querySelector('meta[itemprop="priceCurrency"]');
                            const curSymbol = currency ? (currency.getAttribute('content') || '') : '';
                            let displayCurrency = ' руб.';
                            if (curSymbol === 'RUB' || curSymbol === 'руб') displayCurrency = ' руб.';
                            else if (curSymbol === 'USD' || curSymbol === '$') displayCurrency = ' $';
                            else if (curSymbol === 'EUR' || curSymbol === '€') displayCurrency = ' €';
                            else if (curSymbol) displayCurrency = ' ' + curSymbol;
                            
                            price = parseFloat(amount).toLocaleString('ru-RU') + displayCurrency;
                        }
                    }
                    if (!price) {
                        const priceSelectors = [
                            '.product-info .price-new', 
                            '.product-price .price-new',
                            '.price-new',
                            '.product-info .price',
                            '.product-price .price',
                            '.price',
                            '[itemprop="price"]'
                        ];
                        for (const selector of priceSelectors) {
                            const priceEl = doc.querySelector(selector);
                            if (priceEl) {
                                price = priceEl.textContent.trim().replace(/\s+/g, ' ');
                                break;
                            }
                        }
                    }
                    
                    // 3. Extract Image
                    let img = '';
                    const ogImage = doc.querySelector('meta[property="og:image"]');
                    if (ogImage) img = ogImage.getAttribute('content');
                    if (!img) {
                        const imgSelectors = [
                            '.thumbnails a img',
                            '.thumbnails img',
                            '#image',
                            '.product-info img',
                            '.product-image img'
                        ];
                        for (const selector of imgSelectors) {
                            const imgEl = doc.querySelector(selector);
                            if (imgEl) {
                                img = imgEl.getAttribute('src') || imgEl.getAttribute('data-src');
                                break;
                            }
                        }
                    }
                    
                    if (img) {
                        try {
                            const urlObj = new URL(url);
                            const imgUrlObj = new URL(img, url);
                            if (imgUrlObj.origin === urlObj.origin) {
                                let relPath = imgUrlObj.pathname + imgUrlObj.search;
                                if (relPath.startsWith('/')) {
                                    relPath = relPath.substring(1);
                                }
                                img = relPath;
                            } else {
                                img = imgUrlObj.href;
                            }
                        } catch (e) {}
                        
                        // Clean OpenCart cache path to get the original image path
                        img = img.replace(/image\/cache\//g, 'image/');
                        img = img.replace(/-(\d+)x(\d+)\.([a-zA-Z0-9]+)$/i, '.$3');
                    }
                    
                    let updatedAny = false;
                    if (name) {
                        const nameInput = form.querySelector('[data-field="name"]');
                        if (nameInput) {
                            nameInput.value = name;
                            block.data.name = name;
                            updatedAny = true;
                        }
                    }
                    if (price) {
                        const priceInput = form.querySelector('[data-field="price"]');
                        if (priceInput) {
                            priceInput.value = price;
                            block.data.price = price;
                            updatedAny = true;
                        }
                    }
                    if (img) {
                        const imgInput = form.querySelector('[data-field="img"]');
                        if (imgInput) {
                            imgInput.value = img;
                            block.data.img = img;
                            updatedAny = true;
                        }
                    }
                    
                    if (updatedAny) {
                        updatePreview();
                        alert('Данные товара успешно импортированы!');
                    } else {
                        alert('Не удалось автоматически распознать данные на этой странице. Проверьте правильность ссылки.');
                    }
                    
                } catch (err) {
                    console.error(err);
                    alert('Не удалось загрузить данные по ссылке.\n\nВозможные причины:\n1. Ограничение CORS (если конструктор запущен не на том же домене, что и сайт магазина).\n2. Страница недоступна или ссылка неверна.');
                } finally {
                    btnParse.innerHTML = originalText;
                    btnParse.disabled = false;
                }
            });
        }
    }

    function parseVideoUrl(url) {
        let type = 'youtube';
        let videoId = '';
        if (!url) return { type, videoId };
        
        // YouTube
        const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const ytMatch = url.match(ytRegex);
        if (ytMatch) {
            return { type: 'youtube', videoId: ytMatch[1] };
        }
        
        // Vimeo
        const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/i;
        const vimeoMatch = url.match(vimeoRegex);
        if (vimeoMatch) {
            return { type: 'vimeo', videoId: vimeoMatch[1] };
        }
        
        // RuTube
        const rutubeRegex = /(?:rutube\.ru\/(?:video|play\/embed)\/)([a-zA-Z0-9]{32})/i;
        const rutubeMatch = url.match(rutubeRegex);
        if (rutubeMatch) {
            return { type: 'rutube', videoId: rutubeMatch[1] };
        }
        
        // Kinescope
        const kinescopeRegex = /(?:kinescope\.(?:ru|io)\/(?:embed\/)?)([a-zA-Z0-9-]+)/i;
        const kinescopeMatch = url.match(kinescopeRegex);
        if (kinescopeMatch) {
            return { type: 'kinescope', videoId: kinescopeMatch[1] };
        }
        
        // VK Video (ext player)
        const vkExtMatch = url.match(/vk\.com\/video_ext\.php\?([^"\s>]+)/i);
        if (vkExtMatch) {
            const query = vkExtMatch[1].replace(/&amp;/g, '&');
            return { type: 'vk', videoId: query };
        }
        
        // VK Video (page link)
        const vkPageMatch = url.match(/vk\.com\/video([0-9_-]+)/i);
        if (vkPageMatch) {
            const parts = vkPageMatch[1].split('_');
            return { type: 'vk', videoId: `oid=${parts[0]}&id=${parts[1]}` };
        }
        
        // Fallbacks
        if (url.length === 11) {
            return { type: 'youtube', videoId: url };
        } else if (/^\d+$/.test(url)) {
            return { type: 'vimeo', videoId: url };
        } else if (/^[a-zA-Z0-9]{32}$/.test(url)) {
            return { type: 'rutube', videoId: url };
        } else if (url.includes('oid=') && url.includes('id=')) {
            return { type: 'vk', videoId: url };
        }
        
        return { type: 'youtube', videoId: url };
    }

    function readFormData(block, form) {
        form.querySelectorAll('[data-field]').forEach(el => {
            const field = el.dataset.field;
            if (el.type === 'checkbox') {
                block.data[field] = el.checked;
            } else if (el.tagName === 'SELECT' && field === 'level') {
                block.data[field] = parseInt(el.value);
            } else {
                block.data[field] = el.value;
            }
        });
        form.querySelectorAll('[data-item]').forEach(el => {
            block.data.items[parseInt(el.dataset.item)] = el.value;
        });
        
        if (block.type === 'carousel') {
            block.data.items = [];
            form.querySelectorAll('.carousel-editor-item').forEach((itemEl, idx) => {
                const src = itemEl.querySelector('[data-carousel-src]').value;
                const alt = itemEl.querySelector('[data-carousel-alt]').value;
                const caption = itemEl.querySelector('[data-carousel-caption]').value;
                block.data.items.push({ src, alt, caption });
            });
        }
    }

    // ── Live preview ─────────────────────────────────────────
    let previewTimer = null;
    let previewWindow = null;

    function updateNewWindowContent() {
        if (!previewWindow || previewWindow.closed) return;
        
        const title = titleInput.value || 'Превью статьи';
        const { tocHTML, contentHTML } = renderArticleParts('preview');
        const theme = getCurrentThemeColors();
        const styleAttr = `style="--accent_background_color: ${theme.accent}; --background_main_color: ${theme.bg}; --background_additional_color: ${theme.bgAdditional}; --main_color: ${theme.text}; --additional_color: ${theme.textAdditional};"`;

        const html = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)} — Превью</title>
    <base href="${window.location.href}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="css/constructor.css">
    <style>
        body { background: #fff; padding: 40px 20px; overflow-y: auto; height: auto; }
        .new-window-preview-container { max-width: 900px; margin: 0 auto; width: 100%; }
    </style>
</head>
<body>
    <div class="preview-content new-window-preview-container" ${styleAttr}>
        ${tocHTML}
        <div class="description">
            ${contentHTML}
        </div>
    </div>
</body>
</html>`;

        try {
            previewWindow.document.open();
            previewWindow.document.write(html);
            previewWindow.document.close();
        } catch (e) {
            console.error('Ошибка обновления нового окна:', e);
        }
    }

    function updatePreview() {
        clearTimeout(previewTimer);
        previewTimer = setTimeout(() => {
            renderPreview(previewContent, blocks);
            applyThemeToPreview();
            
            if (previewWindow && !previewWindow.closed) {
                updateNewWindowContent();
            }
            triggerAutosave();
        }, 200);
    }

    // ── Slug auto-update & Domain changes & Session Sync ─────
    function syncHeaderToSession() {
        const session = loadProjectSession() || {};
        const domainEl = document.getElementById('articleDomain');
        session.title = titleInput ? titleInput.value : session.title;
        session.slug = slugInput ? slugInput.value : session.slug;
        session.siteUrl = domainEl ? domainEl.value : session.siteUrl;
        saveProjectSession(session);
        triggerAutosave();
    }

    // Header fields, preview panel controls and mobile shell
    // are initialized via bootstrap/ui modules.

    // ── Block palette clicks ─────────────────────────────────
    $$('.block-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            addBlock(btn.dataset.blockType);

            if ((window.innerWidth <= 991 || window.innerHeight <= 520) && appShell && appShell.mobileLayout && typeof appShell.mobileLayout.closePalette === 'function') {
                appShell.mobileLayout.closePalette();
            }
        });
    });

    // ── Tab switching (event delegation) ─────────────────────
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('.article-tabs-nav [data-tab]');
        if (!btn) return;
        e.preventDefault();
        const nav = btn.parentNode;
        const wrapper = nav.parentNode;
        const panels = wrapper.querySelector('.article-tabs-panels');
        if (!panels) return;
        const idx = btn.dataset.tab;
        // deactivate all
        nav.querySelectorAll('[data-tab]').forEach(b => b.classList.remove('active'));
        panels.querySelectorAll('.article-tabs-panel').forEach(p => p.style.display = 'none');
        // activate clicked
        btn.classList.add('active');
        const panel = panels.children[parseInt(idx, 10)];
        if (panel) {
            panel.style.display = 'block';
        }
    });

    // ── FAQ collapse toggle (event delegation for preview) ────
    document.addEventListener('click', function (e) {
        const question = e.target.closest('.article-faq-question');
        if (!question) return;
        
        const item = question.closest('.article-faq-item');
        if (!item) return;
        
        const targetEl = item.querySelector('.article-faq-collapse');
        if (!targetEl) return;
        
        const isCollapsed = targetEl.classList.contains('in');
        if (isCollapsed) {
            targetEl.classList.remove('in');
            question.classList.add('collapsed');
        } else {
            targetEl.classList.add('in');
            question.classList.remove('collapsed');
        }
    });

    // ── Before/After Slider range listener in editor preview ─
    document.addEventListener('input', (event) => {
        const slider = event.target;
        if (slider && slider.classList.contains('ba-handle-slider')) {
            const container = slider.closest('.article-ba-slider');
            if (container) {
                const val = slider.value;
                const beforeImg = container.querySelector('.ba-before-img');
                const handleBar = container.querySelector('.ba-handle-bar');
                if (beforeImg) beforeImg.style.width = val + '%';
                if (handleBar) handleBar.style.left = val + '%';
            }
        }
    });

    // ── Comparison Diff Toggle listener in editor preview ─────
    document.addEventListener('change', (event) => {
        const toggle = event.target.closest('.compare-diff-toggle');
        if (toggle) {
            const wrapper = toggle.closest('.article-comparison-wrapper');
            if (wrapper) {
                const table = wrapper.querySelector('table');
                if (table) {
                    const rows = table.querySelectorAll('tbody tr');
                    rows.forEach(row => {
                        if (toggle.checked) {
                            const cells = Array.from(row.querySelectorAll('td'));
                            let isDifferent = false;
                            if (cells.length > 2) {
                                const firstVal = cells[1].textContent.trim();
                                for (let i = 2; i < cells.length; i++) {
                                    if (cells[i].textContent.trim() !== firstVal) {
                                        isDifferent = true;
                                        break;
                                    }
                                }
                            }
                            if (isDifferent) {
                                row.classList.add('row-different');
                            } else {
                                row.classList.remove('row-different');
                            }
                        } else {
                            row.classList.remove('row-different');
                        }
                    });
                }
            }
        }
    });

    // Header export/import/copy actions are initialized via ui/header-actions.js.

    
    // Removed getCurrentProjectJSON (moved to modules)


    
    // Removed extractJSONFromString (moved to modules)


    function normalizeProjectForComparison(project) {
        return JSON.stringify({
            title: project && project.title ? project.title : '',
            slug: project && project.slug ? project.slug : '',
            siteUrl: project && project.siteUrl !== undefined
                ? project.siteUrl
                : ((project && project.project && project.project.siteUrl !== undefined) ? project.project.siteUrl : ''),
            theme: {
                preset: (project && project.theme && project.theme.preset) || 'default',
                accent: (project && project.theme && project.theme.accent) || '#27272a',
                bg: (project && project.theme && project.theme.bg) || '#f4f4f5',
                text: (project && project.theme && project.theme.text) || '#1A1A1A'
            },
            blocks: Array.isArray(project && project.blocks) ? project.blocks : []
        });
    }

    function importJSONContent(jsonText, isFromClipboard = false) {
        try {
            hydrateStoreFromDom();
            const currentStateFingerprint = normalizeProjectForComparison(projectStore.getState());
            const parsed = extractJSONFromString(jsonText);
            if (!parsed || !Array.isArray(parsed.blocks)) {
                throw new Error('Неверный формат JSON. Должно быть поле blocks в виде массива.');
            }
            const importedStateFingerprint = normalizeProjectForComparison(parsed);
            const isIdenticalProject = currentStateFingerprint === importedStateFingerprint;
            if (confirm('Импортировать шаблон? Текущие блоки будут полностью заменены.')) {
                projectStore.setState(parsed);
                applyStoreToDom();

                // Mark session as started on import so that startScreen is bypassed
                const importedSession = {
                    started: true,
                    title: parsed.title || '',
                    slug: parsed.slug || '',
                    siteUrl: parsed.siteUrl !== undefined ? parsed.siteUrl : ((parsed.project && parsed.project.siteUrl) || ''),
                    theme: (parsed.theme && parsed.theme.preset) || 'default'
                };
                saveProjectSession(importedSession);

                // Bypass start screen UI
                const startScreen = document.getElementById('startScreen');
                if (startScreen) startScreen.style.display = 'none';
                const workspaceEmpty = document.getElementById('workspaceEmpty');
                if (workspaceEmpty) {
                    workspaceEmpty.innerHTML = '<p>Добавьте блоки из панели слева</p>';
                }
                
                // Ensure default theme settings are applied if parsed has no theme
                if (!parsed.theme) {
                    const themeSelectEl = $('#themeSelect');
                    if (themeSelectEl) {
                        themeSelectEl.value = 'default';
                        updateThemeUI();
                    }
                }

                blocks.forEach(b => {
                    if (b.type === 'grid' && b.data.columns) {
                        b.data.columns.forEach(col => {
                            if (!col.id) col.id = uuid();
                        });
                    }
                    refreshBlockIds(b);
                });
                
                renderBlocksWithAnimation();
                updatePreview();
                
                if (isIdenticalProject) {
                    showToast('Шаблон импортирован, но он совпадает с текущим проектом');
                } else if (isFromClipboard) {
                    showToast('Шаблон успешно вставлен из буфера обмена');
                } else {
                    showToast('Шаблон успешно импортирован из файла');
                }
                return true;
            }
        } catch (err) {
            alert('Ошибка при импорте JSON: ' + err.message);
        }
        return false;
    }

    function importJSONFromClipboard() {
        if (navigator.clipboard && navigator.clipboard.readText) {
            navigator.clipboard.readText().then(text => {
                if (text && text.trim()) {
                    importJSONContent(text.trim(), true);
                } else {
                    showToast('Буфер обмена пуст');
                }
            }).catch(err => {
                console.warn('Navigator clipboard access denied or failed, falling back to prompt:', err);
                const fallbackText = prompt('Вставьте JSON-код шаблона:');
                if (fallbackText && fallbackText.trim()) {
                    importJSONContent(fallbackText.trim(), true);
                }
            });
        } else {
            const fallbackText = prompt('Вставьте JSON-код шаблона:');
            if (fallbackText && fallbackText.trim()) {
                importJSONContent(fallbackText.trim(), true);
            }
        }
    }

    function exportJSONToClipboard() {
        hydrateStoreFromDom();
        const artifact = compileExportJson(projectStore.getState());
        const jsonStr = artifact.content;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(jsonStr).then(() => {
                showToast('JSON скопирован в буфер обмена');
            }).catch(err => {
                console.error('Failed to copy JSON to clipboard:', err);
                alert('Не удалось скопировать. Вы можете скачать JSON файлом.');
            });
        } else {
            alert('Буфер обмена недоступен в этом браузере. Вы можете скачать JSON файлом.');
        }
    }

    // Import, clipboard and AI modal shell are initialized via ui modules.

    // ── DOM-dependent Theme Helpers ──────────────────────────
    function readThemeFromDom() {
        const themeSelectEl = document.getElementById('themeSelect');
        const colorAccentEl = document.getElementById('colorAccent');
        const colorBgEl = document.getElementById('colorBg');
        const colorTextEl = document.getElementById('colorText');
        
        return {
            preset: themeSelectEl ? themeSelectEl.value : 'default',
            accent: colorAccentEl ? colorAccentEl.value : '#27272a',
            bg: colorBgEl ? colorBgEl.value : '#f4f4f5',
            text: colorTextEl ? colorTextEl.value : '#1A1A1A'
        };
    }

    function getCurrentThemeColors() {
        const themeState = readThemeFromDom();
        return getCurrentThemeColorsFromState(themeState);
    }

    function applyThemeToDom(themeState) {
        if (!themeState) return;
        const themeSelectEl = document.getElementById('themeSelect');
        const colorAccentEl = document.getElementById('colorAccent');
        const colorBgEl = document.getElementById('colorBg');
        const colorTextEl = document.getElementById('colorText');
        
        if (themeSelectEl && themeState.preset !== undefined) themeSelectEl.value = themeState.preset;
        if (colorAccentEl && themeState.accent !== undefined) colorAccentEl.value = themeState.accent;
        if (colorBgEl && themeState.bg !== undefined) colorBgEl.value = themeState.bg;
        if (colorTextEl && themeState.text !== undefined) colorTextEl.value = themeState.text;
        
        updateThemeSelectOptions(themeState.preset);
        updateThemeUI();
    }

    function updateThemeSelectOptions(selectedVal) {
        const themeSelect = document.getElementById('themeSelect');
        if (!themeSelect) return;
        
        const activeVal = selectedVal || themeSelect.value || 'default';
        
        const basePresets = [
            { val: 'default', text: 'Фиолетовая (базовая)', emoji: '🟪' },
            { val: 'blue', text: 'Синяя классика', emoji: '🟦' },
            { val: 'emerald', text: 'Изумрудный зеленый', emoji: '🟩' },
            { val: 'orange', text: 'Теплый оранжевый', emoji: '🟧' },
            { val: 'red', text: 'Свежий красный', emoji: '🟥' },
            { val: 'dark', text: 'Темная тема', emoji: '⬛' }
        ];
        
        themeSelect.innerHTML = '';
        
        basePresets.forEach(preset => {
            const opt = document.createElement('option');
            opt.value = preset.val;
            opt.textContent = formatOptionText(preset.text, preset.emoji);
            themeSelect.appendChild(opt);
        });
        
        const customKeys = Object.keys(customThemes);
        if (customKeys.length > 0) {
            const groupOpt = document.createElement('optgroup');
            groupOpt.label = 'Пользовательские темы';
            customKeys.forEach(key => {
                const opt = document.createElement('option');
                opt.value = key;
                const themeData = customThemes[key];
                const emoji = themeData ? getClosestColorEmoji(themeData.accent) : '🎨';
                opt.textContent = formatOptionText(key, emoji);
                groupOpt.appendChild(opt);
            });
            themeSelect.appendChild(groupOpt);
        }
        
        const customOpt = document.createElement('option');
        customOpt.value = 'custom';
        customOpt.textContent = formatOptionText('Пользовательская...', '🎨');
        themeSelect.appendChild(customOpt);
        
        themeSelect.value = activeVal;
        
        if (themeSelect.value !== activeVal) {
            themeSelect.value = 'default';
        }
    }

    function updateThemeUI() {
        const themeSelect = document.getElementById('themeSelect');
        if (!themeSelect) return;
        
        const themeVal = themeSelect.value;
        const themeCustomColors = document.getElementById('themeCustomColors');
        const btnDeleteTheme = document.getElementById('btnDeleteTheme');
        
        const isCustomPickerVisible = (themeVal === 'custom' || customThemes[themeVal] !== undefined);
        
        if (themeCustomColors) {
            themeCustomColors.style.display = isCustomPickerVisible ? 'block' : 'none';
        }
        
        if (btnDeleteTheme) {
            btnDeleteTheme.style.display = (customThemes[themeVal] !== undefined) ? 'flex' : 'none';
        }
        
        if (themeVal !== 'custom') {
            const colors = customThemes[themeVal] || PRESET_THEMES[themeVal] || PRESET_THEMES.default;
            const colorAccent = document.getElementById('colorAccent');
            const colorBg = document.getElementById('colorBg');
            const colorText = document.getElementById('colorText');
            if (colorAccent) colorAccent.value = colors.accent;
            if (colorBg) colorBg.value = colors.bg;
            if (colorText) colorText.value = colors.text;
        }
        
        applyThemeToPreview();
    }

    function applyThemeToPreview() {
        const themeState = readThemeFromDom();
        const theme = getCurrentThemeColorsFromState(themeState);
        const targets = ['previewContent', 'helpTabsPreview'];
        targets.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.setProperty('--accent_background_color', theme.accent);
                el.style.setProperty('--background_main_color', theme.bg);
                el.style.setProperty('--background_additional_color', theme.bgAdditional);
                el.style.setProperty('--main_color', theme.text);
                el.style.setProperty('--additional_color', theme.textAdditional);
            }
        });
    }

    // ── Theme Control Listeners ──────────────────────────────
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.addEventListener('change', () => {
            updateThemeUI();
            updatePreview();
            const session = loadProjectSession() || {};
            session.theme = themeSelect.value;
            saveProjectSession(session);
        });
    }
    
    const colorAccent = document.getElementById('colorAccent');
    const colorBg = document.getElementById('colorBg');
    const colorText = document.getElementById('colorText');
    
    const onColorInputChange = () => {
        applyThemeToPreview();
        updatePreview();
    };
    
    if (colorAccent) colorAccent.addEventListener('input', onColorInputChange);
    if (colorBg) colorBg.addEventListener('input', onColorInputChange);
    if (colorText) colorText.addEventListener('input', onColorInputChange);
    
    // Save theme button
    const btnSaveTheme = document.getElementById('btnSaveTheme');
    if (btnSaveTheme) {
        btnSaveTheme.addEventListener('click', () => {
            const accent = colorAccent ? colorAccent.value : '#27272a';
            const bg = colorBg ? colorBg.value : '#f4f4f5';
            const text = colorText ? colorText.value : '#1A1A1A';
            
            const themeName = prompt('Введите название вашей темы:', 'Моя тема');
            if (themeName === null) return;
            const trimmedName = themeName.trim();
            if (!trimmedName) {
                alert('Название темы не может быть пустым.');
                return;
            }
            
            if (trimmedName === 'custom' || PRESET_THEMES[trimmedName]) {
                alert('Нельзя использовать это имя, так как оно совпадает с системным пресетом.');
                return;
            }
            
            // Calculate additional colors
            let bgAdditional = bg;
            const bgRgb = hexToRgb(bg);
            if (bgRgb) {
                const brightness = (bgRgb.r * 299 + bgRgb.g * 587 + bgRgb.b * 114) / 1000;
                if (brightness > 128) {
                    bgAdditional = rgbToHex(Math.max(0, bgRgb.r - 8), Math.max(0, bgRgb.g - 8), Math.max(0, bgRgb.b - 8));
                } else {
                    bgAdditional = rgbToHex(Math.min(255, bgRgb.r + 15), Math.min(255, bgRgb.g + 15), Math.min(255, bgRgb.b + 15));
                }
            }
            
            let textAdditional = text;
            const textRgb = hexToRgb(text);
            if (textRgb) {
                const brightness = (textRgb.r * 299 + textRgb.g * 587 + textRgb.b * 114) / 1000;
                if (brightness > 128) {
                    textAdditional = rgbToHex(Math.max(0, textRgb.r - 20), Math.max(0, textRgb.g - 20), Math.max(0, textRgb.b - 20));
                } else {
                    textAdditional = rgbToHex(Math.min(255, textRgb.r + 30), Math.min(255, textRgb.g + 30), Math.min(255, textRgb.b + 30));
                }
            }
            
            customThemes[trimmedName] = {
                accent,
                bg,
                text,
                bgAdditional,
                textAdditional
            };
            
            try {
                localStorage.setItem('constructor_custom_themes', JSON.stringify(customThemes));
            } catch (e) {
                console.error(e);
            }
            
            updateThemeSelectOptions(trimmedName);
            updateThemeUI();
            updatePreview();
        });
    }
    
    // Delete theme button
    const btnDeleteTheme = document.getElementById('btnDeleteTheme');
    if (btnDeleteTheme) {
        btnDeleteTheme.addEventListener('click', () => {
            const currentTheme = themeSelect ? themeSelect.value : '';
            if (customThemes[currentTheme] === undefined) return;
            
            if (confirm(`Вы уверены, что хотите удалить тему "${currentTheme}"?`)) {
                delete customThemes[currentTheme];
                try {
                    localStorage.setItem('constructor_custom_themes', JSON.stringify(customThemes));
                } catch (e) {
                    console.error(e);
                }
                updateThemeSelectOptions('default');
                updateThemeUI();
                updatePreview();
            }
        });
    }

    // ── Download helper ──────────────────────────────────────
    function downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType + ';charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Dynamic downloads of OCMOD files
    const btnDownloadZip = $('#btnDownloadZip');
    const btnDownloadZipDropdown = $('#btnDownloadZipDropdown');

    const updateZipButtonsState = (disabled, loading) => {
        [btnDownloadZip, btnDownloadZipDropdown].forEach(btn => {
            if (btn) {
                btn.disabled = disabled;
                if (btn === btnDownloadZipDropdown) {
                    const title = btn.querySelector('.item-title');
                    const icon = btn.querySelector('i');
                    if (title && icon) {
                        if (loading) {
                            icon.className = 'fa fa-spinner fa-spin';
                            title.textContent = 'Сборка архива...';
                        } else {
                            icon.className = 'fa fa-cloud-download';
                            title.textContent = 'Скачать ZIP-модификатор стилей';
                        }
                    }
                } else {
                    if (loading) {
                        btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Сборка...';
                    } else {
                        btn.innerHTML = '<i class="fa fa-file-archive-o"></i> Скачать .ocmod.zip';
                    }
                }
            }
        });
    };

    const handleZipDownload = () => {
        hydrateStoreFromDom();
        updateZipButtonsState(true, true);

        compileExportOcmodZip(projectStore.getState())
            .then((artifact) => {
                const url = URL.createObjectURL(artifact.blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = artifact.filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                updateZipButtonsState(false, false);
            })
            .catch((err) => {
                console.error('Ошибка генерации архива:', err);
                alert('Не удалось сгенерировать ZIP-архив.');
                updateZipButtonsState(false, false);
            });
    };

    // ── Article ZIP Exporter ──────────────────────────────────
    const updateZipExportBtnState = (loading) => {
        const btn = $('#btnExportZIP');
        if (btn) {
            btn.disabled = loading;
            const icon = btn.querySelector('i');
            const titleText = btn.querySelector('.item-title');
            if (icon && titleText) {
                if (loading) {
                    icon.className = 'fa fa-spinner fa-spin';
                    titleText.textContent = 'Экспорт архива...';
                } else {
                    icon.className = 'fa fa-file-archive-o';
                    titleText.textContent = 'Скачать ZIP-архив статьи';
                }
            } else {
                if (loading) {
                    btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Экспорт...';
                } else {
                    btn.innerHTML = '<span class="btn-icon"><i class="fa fa-file-archive-o"></i></span> Скачать ZIP статьи';
                }
            }
        }
    };

    const handleArticleZipDownload = () => {
        updateZipExportBtnState(true);

        hydrateStoreFromDom();
        compileExportArticleZip(projectStore.getState())
            .then(artifact => {
                const url = URL.createObjectURL(artifact.blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = artifact.filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                updateZipExportBtnState(false);
            })
            .catch(err => {
                console.error('Ошибка при экспорте ZIP статьи:', err);
                alert('Не удалось экспортировать статью в ZIP-архив.');
                updateZipExportBtnState(false);
            });
    };

    // ── Toast Notifications ──────────────────────────────────
    function showToast(message) {
        let toast = document.querySelector('.custom-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'custom-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        // force reflow
        toast.offsetHeight;
        toast.classList.add('show');
        
        if (toast.timeoutId) {
            clearTimeout(toast.timeoutId);
        }
        
        toast.timeoutId = setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }

    function triggerAutosave() {
        hydrateStoreFromDom();
        const stateToSave = projectStore.getState();
        stateToSave.timestamp = Date.now();
        saveAutosave(stateToSave);
    }
    function initAutosaveRecovery() {
        const recoveryBanner = document.getElementById('recoveryBanner');
        const recoveryTime = document.getElementById('recoveryTime');
        const btnRestore = document.getElementById('btnRestoreAutosave');
        const btnDiscard = document.getElementById('btnDiscardAutosave');
        
        if (!recoveryBanner) return;
        
        try {
            const saved = loadAutosave();
            if (saved) {
                
                if (saved && saved.timestamp && Array.isArray(saved.blocks) && saved.blocks.length > 0) {
                    const date = new Date(saved.timestamp);
                    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString();
                    if (recoveryTime) {
                        recoveryTime.textContent = timeStr;
                    }
                    recoveryBanner.style.display = 'flex';
                    
                    if (btnRestore) {
                        btnRestore.onclick = () => {
                            projectStore.setState(saved);
                            applyStoreToDom();
                            
                            const session = {
                                started: true,
                                title: saved.title || '',
                                slug: saved.slug || '',
                                siteUrl: saved.siteUrl || '',
                                theme: (saved.theme && saved.theme.preset) || 'default'
                            };
                            saveProjectSession(session);
                            
                            const startScreen = document.getElementById('startScreen');
                            if (startScreen) startScreen.style.display = 'none';
                            
                            blocks.forEach(b => {
                                if (b.type === 'grid' && b.data.columns) {
                                    b.data.columns.forEach(col => {
                                        if (!col.id) col.id = uuid();
                                    });
                                }
                                refreshBlockIds(b);
                            });
                            
                            hydrateStoreFromDom();
                            
                            renderBlocksWithAnimation();
                            updatePreview();
                            recoveryBanner.style.display = 'none';
                            showToast('Проект успешно восстановлен из автосохранения');
                        };
                    }
                    
                    if (btnDiscard) {
                        btnDiscard.onclick = () => {
                            clearAutosave();
                            recoveryBanner.style.display = 'none';
                        };
                    }
                }
            }
        } catch (e) {
            console.error('Failed to init autosave recovery:', e);
        }
    }

    // ── Start Screen Onboarding ──────────────────────────────
    (function initStartScreen() {
        const startScreen = document.getElementById('startScreen');
        if (!startScreen) return;

        // Theme definitions for start screen preview cards
        const themeCardsDef = [
            { key: 'default', name: 'Фиолетовая', accent: '#27272a', bg: '#f4f4f5' },
            { key: 'blue',    name: 'Синяя',       accent: '#2e86de', bg: '#f0f6fc' },
            { key: 'emerald', name: 'Изумрудная',  accent: '#10ac84', bg: '#e6f4ea' },
            { key: 'orange',  name: 'Оранжевая',   accent: '#ff9f43', bg: '#fff9f2' },
            { key: 'red',     name: 'Красная',      accent: '#ee5253', bg: '#fff5f5' },
            { key: 'dark',    name: 'Тёмная',       accent: '#00d2d3', bg: '#1e272e' }
        ];
        let selectedTheme = 'default';

        const cardsContainer = document.getElementById('startThemeCards');
        if (cardsContainer) {
            themeCardsDef.forEach(t => {
                const card = document.createElement('div');
                card.className = 'start-theme-card' + (t.key === 'default' ? ' active' : '');
                card.style.setProperty('--card-accent', t.accent);
                card.dataset.theme = t.key;
                card.innerHTML = `
                    <div class="start-theme-card-preview" style="background:${t.bg};">
                        <div class="start-theme-card-btn" style="background:${t.accent};"></div>
                    </div>
                    <div class="start-theme-card-name">${t.name}</div>
                `;
                card.addEventListener('click', () => {
                    cardsContainer.querySelectorAll('.start-theme-card').forEach(c => c.classList.remove('active'));
                    card.classList.add('active');
                    selectedTheme = t.key;
                });
                cardsContainer.appendChild(card);
            });
        }

        function applyAndHide(title, siteUrl, theme, slug) {
            const session = {
                started: true,
                title: title,
                slug: slug || slugify(title) || 'article',
                siteUrl: siteUrl,
                theme: theme
            };
            saveProjectSession(session);
            applyProjectToHeader(session);
            hydrateStoreFromDom();
            
            // Re-render blocks and sync preview
            renderBlocks();
            updatePreview();

            // Hide start screen overlay
            startScreen.style.display = 'none';
        }

        // Check session first
        const session = loadProjectSession();
        if (session && session.started) {
            applyProjectToHeader(session);
            return;
        }

        // Fresh session - show start screen overlay and fill saved URL from localStorage if any
        startScreen.style.display = 'flex';
        const savedUrl = loadSavedUrl();
        const startSiteUrl = document.getElementById('startSiteUrl');
        if (startSiteUrl && savedUrl) {
            startSiteUrl.value = savedUrl;
        }

        // Start Creation button
        const btnStart = document.getElementById('btnStartProject');
        if (btnStart) {
            btnStart.addEventListener('click', () => {
                const startTitleEl = document.getElementById('startTitle');
                const startSiteUrlEl = document.getElementById('startSiteUrl');
                const rememberUrlEl = document.getElementById('startRememberUrl');
                
                const title = (startTitleEl ? startTitleEl.value.trim() : '') || 'Новая статья';
                const siteUrl = startSiteUrlEl ? startSiteUrlEl.value.trim() : '';
                
                if (rememberUrlEl && rememberUrlEl.checked && siteUrl) {
                    saveSiteUrl(siteUrl);
                } else if (rememberUrlEl && !rememberUrlEl.checked) {
                    saveSiteUrl('');
                }
                
                applyAndHide(title, siteUrl, selectedTheme, slugify(title));
            });
        }

        // Skip onboarding button
        const btnSkip = document.getElementById('btnSkipStart');
        if (btnSkip) {
            btnSkip.addEventListener('click', () => {
                const curTitle = titleInput ? titleInput.value : '';
                const domainEl = document.getElementById('articleDomain');
                const curSiteUrl = domainEl ? domainEl.value : '';
                const curSlug = slugInput ? slugInput.value : '';
                applyAndHide(curTitle, curSiteUrl, selectedTheme, curSlug);
            });
        }
    })();

    // ── Initial Render ───────────────────────────────────────
    appShell = bootstrapAppShell({
        titleInput,
        slugInput,
        updatePreview,
        syncHeaderToSession,
        importJSONContent,
        importJSONFromClipboard,
        exportJSONToClipboard,
        showToast,
        hydrateStoreFromDom,
        downloadFile,
        getState: () => projectStore.getState(),
        handleZipDownload,
        handleArticleZipDownload,
        updateZipButtonsState,
        updateZipExportBtnState,
        applyThemeToPreview,
        openPreviewWindow: () => {
            if (previewWindow && !previewWindow.closed) {
                previewWindow.focus();
                updateNewWindowContent();
                return;
            }

            previewWindow = window.open('', '_blank');
            setTimeout(updateNewWindowContent, 50);
        },
        blocksContainer,
        workspaceEmpty,
        dragState,
        getBlocks: () => blocks,
        setBlocks: (nextBlocks) => {
            blocks = nextBlocks;
        },
        findNestedBlock,
        renderBlocks,
        updatePreview
    });

    hydrateStoreFromDom();
    renderBlocks();
    updatePreview();
    initAutosaveRecovery();
    document.body.classList.add('app-ready');

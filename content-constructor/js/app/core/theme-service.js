/* ============================================================
   Content Constructor — core/theme-service.js
   Сервис управления цветовыми темами оформления
   ============================================================ */

const PRESET_THEMES = {
    default: {
        accent: '#27272a',
        bg: '#f4f4f5',
        text: '#1A1A1A',
        bgAdditional: '#fafafa',
        textAdditional: '#3e3e3e'
    },
    blue: {
        accent: '#2e86de',
        bg: '#f0f6fc',
        text: '#1f2328',
        bgAdditional: '#f6f8fa',
        textAdditional: '#57606a'
    },
    emerald: {
        accent: '#10ac84',
        bg: '#e6f4ea',
        text: '#202124',
        bgAdditional: '#f1f8f5',
        textAdditional: '#5f6368'
    },
    orange: {
        accent: '#ff9f43',
        bg: '#fff9f2',
        text: '#2d3436',
        bgAdditional: '#fffefb',
        textAdditional: '#525252'
    },
    red: {
        accent: '#ee5253',
        bg: '#fff5f5',
        text: '#2d3748',
        bgAdditional: '#fffafa',
        textAdditional: '#4a5568'
    },
    dark: {
        accent: '#00d2d3',
        bg: '#1e272e',
        text: '#f5f6fa',
        bgAdditional: '#2f3640',
        textAdditional: '#dcdde1'
    }
};

let customThemes = {};
try {
    const stored = localStorage.getItem('constructor_custom_themes');
    if (stored) {
        customThemes = JSON.parse(stored);
    }
} catch (e) {
    console.error('Failed to load custom themes:', e);
}

function saveCustomThemes() {
    try {
        localStorage.setItem('constructor_custom_themes', JSON.stringify(customThemes));
    } catch (e) {
        console.error('Failed to save custom themes:', e);
    }
}

function getClosestColorEmoji(hex) {
    if (!hex) return '🎨';
    const rgb = hexToRgb(hex);
    if (!rgb) return '🎨';
    
    const presets = [
        { emoji: '🟪', r: 84,  g: 70,  b: 248 },
        { emoji: '🟦', r: 46,  g: 134, b: 222 },
        { emoji: '🟩', r: 16,  g: 172, b: 132 },
        { emoji: '🟧', r: 255, g: 159, b: 67  },
        { emoji: '🟥', r: 238, g: 82,  b: 83  },
        { emoji: '⬛', r: 30,  g: 39,  b: 46  },
        { emoji: '⬜', r: 255, g: 255, b: 255 }
    ];
    
    let minDiff = Infinity;
    let bestEmoji = '🎨';
    presets.forEach(p => {
        const diff = Math.sqrt(
            Math.pow(rgb.r - p.r, 2) +
            Math.pow(rgb.g - p.g, 2) +
            Math.pow(rgb.b - p.b, 2)
        );
        if (diff < minDiff) {
            minDiff = diff;
            bestEmoji = p.emoji;
        }
    });
    return bestEmoji;
}

function formatOptionText(text, emoji) {
    const targetLen = 28;
    const padLen = targetLen - text.length;
    const spaces = padLen > 0 ? '\u00A0'.repeat(padLen) : '\u00A0\u00A0';
    return `${text}${spaces}${emoji}`;
}

function getCurrentThemeColorsFromState(themeState) {
    if (!themeState) {
        return PRESET_THEMES.default;
    }
    
    const preset = themeState.preset || 'default';
    if (preset !== 'custom') {
        return customThemes[preset] || PRESET_THEMES[preset] || PRESET_THEMES.default;
    }
    
    const accent = themeState.accent || '#27272a';
    const bg = themeState.bg || '#f4f4f5';
    const text = themeState.text || '#1A1A1A';
    
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
    
    return {
        accent,
        bg,
        text,
        bgAdditional,
        textAdditional
    };
}


function getExportedCSS(themeState) {
    const theme = getCurrentThemeColorsFromState(themeState);
        return `/* content-constructor.css — Стили для разметки */
/* Генерировано OpenCart Content Constructor */

:root {
    --description-font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --description-font-bold: 'Inter Bold', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --background_main_color: ${theme.bg};
    --background_additional_color: ${theme.bgAdditional};
    --accent_background_color: ${theme.accent};
    --main_color: ${theme.text};
    --additional_color: ${theme.textAdditional};
}

@font-face {
    font-family: 'Inter';
    src: url('fonts/InterSans-Regular.woff?v=1.0.3') format('woff');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
}
@font-face {
    font-family: 'Inter Bold';
    src: url('fonts/InterSans-SemiBold.woff?v=1.0.3') format('woff');
    font-weight: 500;
    font-style: normal;
    font-display: swap;
}

/* --- Оглавление (TOC) --- */
.blog-content {
    background-color: var(--background_main_color, #f4f4f5);
    padding: 20px;
    border-radius: 5px;
    margin-bottom: 25px;
}
.blog-content .menu-content-title {
    font-family: var(--description-font-bold), sans-serif;
    font-size: 16px;
    font-weight: 500;
    color: var(--main_color, #1A1A1A);
    margin: 0px;
    padding: 0px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.blog-content ul {
    list-style-type: disc;
    padding: 0px 0px 0px 25px;
    margin: 15px 0px 10px;
}
.blog-content ul li {
    margin-bottom: 5px;
}
.blog-content ul li a.anchor {
    color: var(--main_color, #1A1A1A);
    text-decoration: none;
    font-family: var(--description-font), sans-serif;
    font-size: 14px;
    transition: color 0.2s;
}
.blog-content ul li a.anchor:hover {
    color: var(--accent_background_color, #27272a);
    text-decoration: underline;
}
.blog-content .ogli3 {
    list-style-type: circle;
    padding: 0px 0px 0px 25px;
    margin: 15px 0px 0px;
}

/* --- Базовые стили контента --- */
.description {
    font-family: var(--description-font), sans-serif;
    font-size: 16px;
    line-height: 1.5;
    color: var(--main_color, #1A1A1A);
    text-align: justify;
    word-wrap: break-word;
}

.description h1 {
    font-family: var(--description-font-bold), sans-serif;
    font-size: 32px;
    font-weight: 500;
    margin: 0 0 20px 0;
    color: #2c2c2c;
    line-height: 1.2;
}

.description h2 {
    font-family: var(--description-font-bold), sans-serif;
    font-size: 27px;
    font-weight: 500;
    margin: 20px 0px 25px;
    color: #2c2c2c;
    line-height: 1.2;
    padding-bottom: 0;
    border-bottom: none;
    text-align: left;
}

.description h3 {
    font-family: var(--description-font-bold), sans-serif;
    font-size: 21px;
    font-weight: 500;
    margin: 20px 0px 10px;
    color: #2c2c2c;
    line-height: 1.2;
    text-align: left;
}

.description p {
    margin: 0 0 10px 0;
    text-indent: 15px;
    line-height: 1.5;
}

.description .article-grid-row {
    margin-top: 20px;
    margin-bottom: 20px;
}

.description .article-grid-row p:first-child {
    margin-top: 0;
}

.description .row {
    margin-left: -15px;
    margin-right: -15px;
}

.description .row:before,
.description .row:after {
    content: " ";
    display: table;
}

.description .row:after {
    clear: both;
}

.description [class*="col-xs-"],
.description [class*="col-md-"] {
    position: relative;
    min-height: 1px;
    padding-left: 15px;
    padding-right: 15px;
}

.description .col-xs-6,
.description .col-xs-12 {
    float: left;
}

.description .col-xs-6 {
    width: 50%;
}

.description .col-xs-12 {
    width: 100%;
}

@media (min-width: 992px) {
    .description .col-md-3,
    .description .col-md-4,
    .description .col-md-6,
    .description .col-md-8,
    .description .col-md-9,
    .description .col-md-12 {
        float: left;
    }

    .description .col-md-3 {
        width: 25%;
    }

    .description .col-md-4 {
        width: 33.33333333%;
    }

    .description .col-md-6 {
        width: 50%;
    }

    .description .col-md-8 {
        width: 66.66666667%;
    }

    .description .col-md-9 {
        width: 75%;
    }

    .description .col-md-12 {
        width: 100%;
    }
}

.description b,
.description strong {
    font-family: var(--description-font-bold), sans-serif;
    font-weight: 500;
}

.description a {
    color: var(--accent_background_color, #27272a);
    text-decoration: underline;
}

.description a:hover {
    color: var(--accent_background_color, #27272a);
    text-decoration: underline;
}

.description .btn-popup-action {
    display: inline-block;
    background: var(--accent_background_color, #27272a);
    color: #fff;
    padding: 10px 24px;
    border-radius: 5px;
    text-decoration: none;
    font-family: var(--description-font-bold), sans-serif;
    font-weight: 500;
    transition: background 0.2s;
}
.description .btn-popup-action:hover {
    background: #18181b !important;
    color: #fff !important;
    text-decoration: none !important;
}
.description .link-popup-action {
    color: var(--accent_background_color, #27272a);
    text-decoration: underline;
    font-family: var(--description-font-bold), sans-serif;
    font-weight: 500;
}

/* --- Цитаты (blockquote) --- */
.description blockquote {
    font-family: var(--description-font), sans-serif;
    font-size: 16px;
    margin: 30px 0px;
    padding: 10px 20px;
    border-left: 5px solid var(--accent_background_color, #27272a);
    background: transparent;
    border-top: none;
    border-right: none;
    border-bottom: none;
    border-radius: 0;
    font-style: normal;
    color: var(--main_color, #1A1A1A);
}

.description blockquote p {
    margin: 0;
}

/* --- Таблицы --- */
.table-responsive {
    width: 100%;
    overflow-x: auto;
    margin: 20px 0;
}

.description table {
    width: 100%;
    border-collapse: collapse;
    font-size: 16px;
    text-align: left;
    line-height: 1.3;
    margin-bottom: 30px;
}

.description table th,
.description table td {
    border: 1px solid var(--background_main_color, #f4f4f5);
    padding: 8px 10px;
    text-align: left;
    font-size: 16px;
}

.description table th {
    background: var(--background_main_color, #f4f4f5);
    font-family: var(--description-font-bold), sans-serif;
    font-weight: 500;
}

.description table tbody tr td {
    background: #ffffff;
}

/* Bootstrap 3 Table Styles */
.description table.table-striped tbody tr:nth-of-type(odd) td {
    background-color: #f9f9f9;
}
.description table.table-bordered {
    border: 1px solid #ddd;
}
.description table.table-bordered th,
.description table.table-bordered td {
    border: 1px solid #ddd;
}
.description table.table-hover tbody tr:hover td {
    background-color: #f5f5f5;
}
.description table.table-condensed th,
.description table.table-condensed td {
    padding: 5px;
}

/* --- Списки --- */
.description ul,
.description ol {
    margin: 0 0 10px 0;
    padding-left: 40px;
}

.description li {
    margin-bottom: 0px;
    text-indent: 0px;
}

/* --- Спойлеры / Аккордеоны (details/summary) --- */
.description details {
    margin: 16px 0;
    border: 1px solid var(--background_main_color, #f4f4f5);
    border-radius: 5px;
    background: var(--background_additional_color, #fafafa);
}

.description details summary {
    font-family: var(--description-font-bold), sans-serif;
    font-weight: 500;
    cursor: pointer;
    outline: none;
    padding: 10px 30px;
    transition: color 0.2s;
    position: relative;
    list-style: none;
}

.description details summary::-webkit-details-marker {
    display: none;
}

.description details summary::after {
    content: "▶";
    font-size: 0.8em;
    left: 10px;
    color: var(--accent_background_color, #27272a);
    transition: transform 0.2s;
    position: absolute;
    top: 13px;
}

.description details[open] summary::after {
    content: "▼";
}

.description details summary + p,
.description details > *:not(summary) {
    padding: 5px 30px;
    background: rgb(255, 255, 255);
    margin: 0px;
    text-indent: 0px !important;
}

.description details > p:last-child,
.description details > ul:last-child,
.description details > ol:last-child,
.description details > dl:last-child {
    padding-bottom: 10px;
}

/* --- FAQ --- */
.article-faq {
    margin: 20px 0;
}

.article-faq-title {
    font-family: var(--description-font-bold), sans-serif;
    font-size: 27px;
    font-weight: 500;
    margin: 20px 0px 15px;
    color: #2c2c2c;
    line-height: 1.2;
}

.article-faq-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.article-faq-item {
    border: none;
    border-bottom: 1px solid #eaeaea;
    overflow: visible;
    transition: border-color 0.2s;
}

.article-faq-item:hover {
    border-color: #cfd8dc;
}

.article-faq-question {
    font-family: var(--description-font-bold), sans-serif;
    font-weight: 500;
    font-size: 16px !important;
    padding: 10px 40px 10px 12px !important;
    cursor: pointer;
    outline: none;
    display: flex !important;
    align-items: center !important;
    gap: 12px;
    transition: color 0.2s;
    background: transparent;
    position: relative !important;
    color: #2c2c2c;
    width: 100% !important;
    box-sizing: border-box !important;
    text-align: left;
}

.article-faq-question:hover {
    background: transparent;
    color: #1a1a1a;
}

.article-faq-question::before {
    content: "?";
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 1px solid #cfd8dc;
    color: #78909c;
    font-size: 12px;
    font-weight: 400;
    flex-shrink: 0;
    box-sizing: border-box;
}

.article-faq-question::after {
    content: "" !important;
    position: absolute !important;
    right: 20px !important;
    left: auto !important;
    top: 50% !important;
    width: 8px !important;
    height: 8px !important;
    border-right: 1.5px solid #a0aab2 !important;
    border-bottom: 1.5px solid #a0aab2 !important;
    transform: translateY(-50%) rotate(45deg) !important;
    transition: transform 0.2s, border-color 0.2s;
}

.article-faq-question:not(.collapsed)::after {
    transform: translateY(-50%) rotate(-135deg) !important;
}

.collapse {
    display: none;
}

.collapse.in {
    display: block !important;
}

.article-faq-answer {
    padding: 0px 12px 12px 50px;
    background: transparent;
    font-size: 16px !important;
    line-height: 1.6;
    color: #555;
    border-top: none;
}

.article-faq-answer p {
    margin: 0 0 8px 0;
    text-indent: 0 !important;
}

.article-faq-answer p:last-child {
    margin-bottom: 0;
}

/* --- Вкладки (Tabs) --- */
.description .article-tabs {
    margin: 20px 0;
}

.description .article-tabs-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    border-bottom: 2px solid #eee;
}

.description .article-tabs-nav [data-tab] {
    appearance: none;
    -webkit-appearance: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 20px;
    margin: 0;
    border: 1px solid transparent;
    border-bottom: none;
    border-radius: 6px 6px 0 0;
    background: #f5f5f5;
    cursor: pointer;
    text-decoration: none;
    font-family: inherit;
    line-height: 1.35;
    font-size: 14px;
    font-weight: 500;
    color: #666;
    box-shadow: none;
    transition: all .15s;
}

.description .article-tabs-nav [data-tab].active {
    background: #fff;
    color: #4a90d9;
    border-color: #ddd;
    border-bottom-color: #fff;
    margin-bottom: -2px;
}

.description .article-tabs-panels {
    border: 1px solid #ddd;
    border-top: none;
    border-radius: 0 0 6px 6px;
}

.description .article-tabs-panel {
    padding: 16px 20px;
}

/* --- Изображения --- */
.description img.img-responsive {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 0 auto;
    border-radius: 4px;
}

/* --- Код --- */
.description code {
    background: #f5f5f5;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 0.9em;
    color: #c7254e;
}

/* --- Инфо-блок (Callout) --- */
.description .article-callout {
    padding: 15px 20px;
    margin: 20px 0;
    border-radius: 6px;
    box-sizing: border-box;
}
.description .article-callout.style-well {
    background: #f8f9fa;
    border: 1px solid #e2e8f0;
}
.description .article-callout.style-info {
    background: #f0f7ff;
    border: 1px solid #d0e7ff;
    border-left: 5px solid #3182ce;
}
.description .article-callout.style-success {
    background: #f0fff4;
    border: 1px solid #c6f6d5;
    border-left: 5px solid #38a169;
}
.description .article-callout.style-warning {
    background: #fffaf0;
    border: 1px solid #feebc8;
    border-left: 5px solid #dd6b20;
}
.description .article-callout-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
}
.description .article-callout-text-col {
    flex: 1;
    min-width: 250px;
}
.description .article-callout-btn-col {
    flex-shrink: 0;
}
.description .article-callout-title {
    font-family: var(--description-font-bold), sans-serif;
    font-size: 16px;
    font-weight: 700;
    margin: 0 0 6px 0;
    line-height: 1.3;
    text-align: left;
}
.description .article-callout.style-well .article-callout-title { color: #2c3e50; }
.description .article-callout.style-info .article-callout-title { color: #2b6cb0; }
.description .article-callout.style-success .article-callout-title { color: #2f855a; }
.description .article-callout.style-warning .article-callout-title { color: #c05621; }

.description .article-callout-desc {
    margin: 0 !important;
    font-size: 13px;
    line-height: 1.45;
    color: #4a5568;
    text-indent: 0 !important;
    text-align: left;
}
.description .article-callout-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 6px;
    font-family: var(--description-font-bold), sans-serif;
    font-weight: 600;
    font-size: 13px;
    text-decoration: none !important;
    transition: background 0.2s, transform 0.1s;
    cursor: pointer;
}
.description .article-callout.style-well .article-callout-btn { background: #4a90d9; color: #fff; }
.description .article-callout.style-well .article-callout-btn:hover { background: #3a7bc8; }
.description .article-callout.style-info .article-callout-btn { background: #3182ce; color: #fff; }
.description .article-callout.style-info .article-callout-btn:hover { background: #2b6cb0; }
.description .article-callout.style-success .article-callout-btn { background: #38a169; color: #fff; }
.description .article-callout.style-success .article-callout-btn:hover { background: #2f855a; }
.description .article-callout.style-warning .article-callout-btn { background: #dd6b20; color: #fff; }
.description .article-callout.style-warning .article-callout-btn:hover { background: #c05621; }

/* --- Адаптивность --- */
@media (max-width: 768px) {
    .description {
        font-size: 15px;
    }

    .description h1 { font-size: 24px; }
    .description h2 { font-size: 20px; }
    .description h3 { font-size: 17px; }

    .description table {
        font-size: 13px;
        min-width: 300px;
    }

    .description table th,
    .description table td {
        padding: 8px 10px;
    }

    .description table.table-condensed th,
    .description table.table-condensed td {
        padding: 5px;
    }

    .description .article-tabs-nav [data-tab] {
        padding: 8px 14px;
        font-size: 13px;
    }

    .description .article-tabs-panel {
        padding: 12px 14px;
    }

    .description .article-callout-row {
        display: block !important;
    }
    .description .article-callout-btn-col {
        margin-top: 15px;
    }
    .description .article-callout-btn {
        display: flex;
        justify-content: center;
        width: 100%;
    }
}

/* --- Alert Box Block --- */
.description .alert {
    padding: 15px 20px;
    margin-bottom: 22px;
    border: 1px solid transparent;
    border-radius: 6px;
    font-family: var(--description-font), sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: #333;
    border-left: 4px solid transparent;
}
.description .alert-info {
    background-color: #ebf5ff;
    border-color: #d0e7ff;
    border-left-color: #3182ce;
    color: #2b6cb0;
}
.description .alert-success {
    background-color: #f0fdf4;
    border-color: #dcfce7;
    border-left-color: #22c55e;
    color: #15803d;
}
.description .alert-warning {
    background-color: #fffbeb;
    border-color: #fef3c7;
    border-left-color: #f59e0b;
    color: #b45309;
}
.description .alert-danger {
    background-color: #fef2f2;
    border-color: #fee2e2;
    border-left-color: #ef4444;
    color: #b91c1c;
}

/* --- Responsive Video Block --- */
.description .article-video-wrapper {
    margin-bottom: 25px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.description .embed-responsive {
    position: relative;
    display: block;
    height: 0;
    padding: 0;
    overflow: hidden;
}
.description .embed-responsive-16by9 {
    padding-bottom: 56.25%;
}
.description .embed-responsive .embed-responsive-item,
.description .embed-responsive iframe,
.description .embed-responsive embed,
.description .embed-responsive object,
.description .embed-responsive video {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0;
}

/* --- Image Gallery Carousel Block --- */
.description .carousel {
    position: relative;
    margin-bottom: 25px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
.description .carousel-inner {
    position: relative;
    width: 100%;
    overflow: hidden;
}
.description .carousel-inner > .item {
    position: relative;
    display: none;
    transition: .6s ease-in-out left;
}
.description .carousel-inner > .item > img {
    line-height: 1;
}
.description .carousel-inner > .active {
    display: block;
}
.description .carousel-indicators {
    position: absolute;
    bottom: 10px;
    left: 50%;
    z-index: 15;
    width: 60%;
    padding-left: 0;
    margin-left: -30%;
    text-align: center;
    list-style: none;
    margin-bottom: 0;
}
.description .carousel-indicators li {
    display: inline-block;
    width: 10px;
    height: 10px;
    margin: 1px;
    text-indent: -999px;
    cursor: pointer;
    background-color: rgba(0,0,0,0);
    border: 1px solid #fff;
    border-radius: 10px;
    transition: background-color .15s;
}
.description .carousel-indicators .active {
    width: 12px;
    height: 12px;
    margin: 0;
    background-color: #fff;
}
.description .carousel-control {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 15%;
    font-size: 20px;
    color: #fff;
    text-align: center;
    text-shadow: 0 1px 2px rgba(0,0,0,.6);
    background-color: rgba(0,0,0,0);
    filter: alpha(opacity=50);
    opacity: .5;
    transition: opacity .15s;
    cursor: pointer;
}
.description .carousel-control:hover {
    color: #fff;
    text-decoration: none;
    filter: alpha(opacity=90);
    opacity: .9;
}
.description .carousel-control .glyphicon-chevron-left,
.description .carousel-control .glyphicon-chevron-right {
    display: none !important;
}
.description .carousel-control::before {
    content: '';
    position: absolute;
    top: 50%;
    margin-top: -10px;
    width: 20px;
    height: 20px;
    border-top: 3px solid #fff;
    border-left: 3px solid #fff;
}
.description .carousel-control.left::before {
    left: 50%;
    margin-left: -10px;
    transform: rotate(-45deg);
}
.description .carousel-control.right::before {
    right: 50%;
    margin-right: -10px;
    transform: rotate(135deg);
}
.description .carousel-control.right {
    right: 0;
    left: auto;
}
.description .carousel-caption {
    position: absolute;
    right: 15%;
    bottom: 20px;
    left: 15%;
    z-index: 10;
    padding-top: 20px;
    padding-bottom: 20px;
    color: #fff;
    text-align: center;
    text-shadow: 0 1px 2px rgba(0,0,0,.6);
}
.description .carousel-caption h3 {
    margin: 0;
    font-size: 18px;
    font-weight: bold;
    background: rgba(0, 0, 0, 0.4);
    display: inline-block;
    padding: 6px 14px;
    border-radius: 4px;
}

/* --- Interactive Before/After Image Slider Block --- */
.description .article-ba-slider {
    position: relative;
    width: 100%;
    height: 380px;
    margin-bottom: 25px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    user-select: none;
}
.description .ba-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
}
.description .ba-before-img {
    width: 50%;
    border-right: 1px solid rgba(255, 255, 255, 0.2);
    z-index: 2;
}
.description .ba-after-img {
    z-index: 1;
}
.description .ba-label {
    position: absolute;
    bottom: 12px;
    padding: 4px 8px;
    background: rgba(0,0,0,0.6);
    color: #fff;
    font-size: 11px;
    font-weight: bold;
    border-radius: 3px;
    text-transform: uppercase;
    letter-spacing: 1px;
    z-index: 4;
}
.description .ba-label-before {
    left: 12px;
}
.description .ba-label-after {
    right: 12px;
}
.description .ba-handle-slider {
    position: absolute;
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 100%;
    background: transparent;
    outline: none;
    margin: 0;
    z-index: 5;
    cursor: ew-resize;
}
.description .ba-handle-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #fff;
    border: 3px solid var(--accent_background_color, #27272a);
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    cursor: ew-resize;
    background-image: url("data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'><path fill=\'' + theme.accent + '\' d=\'M16 17.01V14h-8v3.01L4 13l4-4.01V12h8V8.99L20 13l-4 4.01z\'/></svg>')}");
    background-position: center;
    background-repeat: no-repeat;
    background-size: 20px;
}
.description .ba-handle-slider::-moz-range-thumb {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #fff;
    border: 3px solid var(--accent_background_color, #27272a);
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    cursor: ew-resize;
    background-image: url("data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'><path fill=\'' + theme.accent + '\' d=\'M16 17.01V14h-8v3.01L4 13l4-4.01V12h8V8.99L20 13l-4 4.01z\'/></svg>')}");
    background-position: center;
    background-repeat: no-repeat;
    background-size: 20px;
}
.description .ba-handle-bar {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 2px;
    background: #fff;
    margin-left: -1px;
    z-index: 3;
    pointer-events: none;
    box-shadow: 0 0 8px rgba(0,0,0,0.3);
}

/* --- Messenger Quick Buttons Block --- */
.description .article-messengers-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 25px;
    font-family: var(--description-font), sans-serif;
}
.description .messenger-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 18px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    color: #fff !important;
    text-decoration: none !important;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    min-width: 130px;
    cursor: pointer;
}
.description .messenger-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
    color: #fff !important;
}
.description .messenger-btn:active {
    transform: translateY(0);
}
.description .messenger-btn i {
    font-size: 16px;
}
.description .messenger-wa {
    background: #25d366;
}
.description .messenger-wa:hover {
    background: #20ba5a;
}
.description .messenger-tg {
    background: #0088cc;
}
.description .messenger-tg:hover {
    background: #0077b5;
}
.description .messenger-viber {
    background: #71717a;
}
.description .messenger-viber:hover {
    background: #27272a;
}
.description .messenger-phone {
    background: #2d3e50;
}
.description .messenger-phone:hover {
    background: #212f3d;
}

/* --- OpenCart Product Card Block --- */
.description .article-product-card {
    display: flex;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #fff;
    padding: 16px;
    margin-bottom: 25px;
    gap: 16px;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    transition: box-shadow 0.25s;
    font-family: var(--description-font), sans-serif;
}
.description .article-product-card:hover {
    box-shadow: 0 6px 16px rgba(0,0,0,0.08);
}
.description .product-card-img-wrap {
    width: 100px;
    height: 100px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}
.description .product-card-img-wrap img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}
.description .product-card-info {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.description .product-card-title {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    line-height: 1.4;
    font-family: var(--description-font-bold), sans-serif;
}
.description .product-card-title a {
    color: #1a1a1a;
    text-decoration: none;
}
.description .product-card-title a:hover {
    color: var(--accent_background_color, #27272a);
}
.description .product-card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
}
.description .product-card-price {
    font-size: 18px;
    font-weight: bold;
    color: #1a1a1a;
}
.description .product-card-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--accent_background_color, #27272a);
    color: #fff !important;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    text-decoration: none !important;
    transition: background 0.15s, filter 0.15s;
    cursor: pointer;
}
.description .product-card-btn:hover {
    filter: brightness(0.88);
}

@media (max-width: 767px) {
    .description .article-product-card {
        flex-direction: column;
        align-items: stretch;
    }
    .description .product-card-img-wrap {
        width: 100%;
        height: 140px;
    }
    .description .product-card-footer {
        flex-direction: row;
        width: 100%;
    }
}
}`;
}


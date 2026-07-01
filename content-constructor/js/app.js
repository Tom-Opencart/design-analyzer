(function () {
    'use strict';

    window.CONTENT_CONSTRUCTOR_BUILD = {
        version: '1.6.7',
        builtAt: '2026-06-14 09:19:25 UTC'
    };

/* ============================================================
   Content Constructor — core/utils.js
   Чистые хелперы общего назначения (без побочных эффектов)
   ============================================================ */

function uuid() {
    return 'b' + Math.random().toString(36).slice(2, 10);
}

function slugify(text) {
    const map = { 'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'e','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya' };
    return text.toLowerCase().replace(/[а-яё]/g, c => map[c] || c).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function safeSvgPlaceholder(width, height, bg, fg, text) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${bg}"/><text x="50%" y="50%" font-family="sans-serif" font-size="${width > 300 ? 24 : 14}" fill="${fg}" dominant-baseline="middle" text-anchor="middle">${text}</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}


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



/* ============================================================
   Content Constructor — core/schema.js
   JSON Спецификация блоков и настроек проекта
   ============================================================ */

const CC_SCHEMA_SPEC = {
    description: "This JSON defines the layout and content of a web page constructor. You can modify the title, slug, theme, and blocks. When adding or editing blocks, follow the types and data schemas below.",
    supported_theme_presets: ["default", "blue", "emerald", "orange", "red", "dark"],
    supported_blocks: [
        {
            type: "heading",
            description: "Article headings (H1, H2, H3, H4, H5, H6)",
            data_schema: { level: "Integer (1-6)", text: "String (supports markdown)" }
        },
        {
            type: "paragraph",
            description: "Standard paragraphs of text",
            data_schema: { text: "String (supports markdown formatting like **bold**, *italic*, list items like * item, and links like [text](url))" }
        },
        {
            type: "list",
            description: "Bullet or numbered lists",
            data_schema: { ordered: "Boolean (true/false)", items: "Array of Strings" }
        },
        {
            type: "quote",
            description: "Blockquote element",
            data_schema: { text: "String", author: "String (optional)" }
        },
        {
            type: "table",
            description: "Data table",
            data_schema: { headers: "Array of Strings", rows: "Array of Arrays of Strings" }
        },
        {
            type: "toc",
            description: "Table of Contents (autogenerated, place once near the top)",
            data_schema: {}
        },
        {
            type: "image",
            description: "Single image block",
            data_schema: { path: "String (relative path like image/catalog/photo.jpg or absolute URL)", caption: "String (optional)" }
        },
        {
            type: "video",
            description: "Responsive video embed (YouTube, Vimeo, VK, RuTube, Kinescope)",
            data_schema: { url: "String (valid video page URL)" }
        },
        {
            type: "carousel",
            description: "Image gallery slider carousel",
            data_schema: { images: "Array of Objects: [ { \"path\": \"url\", \"alt\": \"text\", \"caption\": \"text\" } ]" }
        },
        {
            type: "before-after",
            description: "Before/After image slider",
            data_schema: { beforeImg: "String (image path)", afterImg: "String (image path)", beforeLabel: "String (default 'До')", afterLabel: "String (default 'После')" }
        },
        {
            type: "grid",
            description: "Bootstrap 3 grid layout with columns holding nested blocks",
            data_schema: {
                pcPattern: "Array of Integers (column widths summing up to 12, e.g. [6, 6] or [4, 4, 4] or [8, 4])",
                mobilePerRow: "Integer (columns per row on mobile, e.g. 1 or 2)",
                columns: "Array of Objects: [ { \"blocks\": [ { ...nested blocks... } ] } ]"
            }
        },
        {
            type: "spoiler",
            description: "Accordion FAQ block",
            data_schema: { title: "String (Question)", text: "String (Answer, supports markdown)", opened: "Boolean (false by default)" }
        },
        {
            type: "tabs",
            description: "Responsive tabs switcher",
            data_schema: { tabs: "Array of Objects: [ { \"title\": \"Tab Title\", \"content\": \"Tab text content (supports markdown)\" } ]" }
        },
        {
            type: "alert",
            description: "Styled alert message boxes",
            data_schema: { style: "String (choose from 'info', 'success', 'warning', 'danger')", text: "String" }
        },
        {
            type: "messengers",
            description: "Chat buttons block for messengers",
            data_schema: { whatsapp: "String (phone number)", telegram: "String (username)", viber: "String (phone or username)", phone: "String (phone number)" }
        },
        {
            type: "product-card",
            description: "Shop product card with title, image, price and buy button",
            data_schema: { url: "String (product URL link)", image: "String (image URL path)", name: "String (product name)", price: "String (product price)", buttonText: "String (default 'Купить')" }
        },
        {
            type: "comparison",
            description: "Interactive comparison of characteristics table",
            data_schema: { title: "String", headers: "Array of Strings", rows: "Array of Arrays of Strings" }
        }
    ]
};


/* ============================================================
   Content Constructor — state/session-store.js
   Хранение сессионного состояния (sessionStorage/localStorage сайта)
   ============================================================ */

const PROJECT_SESSION_KEY = 'constructor_session';
const PROJECT_URL_KEY = 'constructor_site_url';

function loadProjectSession() {
    try {
        const raw = sessionStorage.getItem(PROJECT_SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
}

function saveProjectSession(data) {
    try {
        sessionStorage.setItem(PROJECT_SESSION_KEY, JSON.stringify(data));
    } catch (e) {}
}

function loadSavedUrl() {
    try { return localStorage.getItem(PROJECT_URL_KEY) || ''; } catch (e) { return ''; }
}

function saveSiteUrl(url) {
    try { localStorage.setItem(PROJECT_URL_KEY, url); } catch (e) {}
}


/* ============================================================
   Content Constructor — state/autosave.js
   Сервис автосохранения проекта в localStorage
   ============================================================ */

const AUTOSAVE_KEY = 'constructor_autosave';

function saveAutosave(state) {
    try {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error('Failed to save autosave:', e);
    }
}

function loadAutosave() {
    try {
        const raw = localStorage.getItem(AUTOSAVE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function hasAutosave() {
    try {
        const raw = localStorage.getItem(AUTOSAVE_KEY);
        if (!raw) return false;
        const saved = JSON.parse(raw);
        return !!(saved && saved.timestamp && Array.isArray(saved.blocks) && saved.blocks.length > 0);
    } catch (e) {
        return false;
    }
}

function clearAutosave() {
    try {
        localStorage.removeItem(AUTOSAVE_KEY);
    } catch (e) {}
}


/* ============================================================
   Content Constructor — core/project-serializer.js
   Сериализация и десериализация проекта (JSON <-> Object)
   ============================================================ */

function serializeProject(projectState, schemaSpec) {
    if (!projectState) return null;
    return {
        title: projectState.title || '',
        slug: projectState.slug || '',
        siteUrl: projectState.siteUrl || '',
        project: {
            siteUrl: projectState.siteUrl || ''
        },
        theme: {
            preset: (projectState.theme && projectState.theme.preset) || 'default',
            accent: (projectState.theme && projectState.theme.accent) || '#27272a',
            bg: (projectState.theme && projectState.theme.bg) || '#f4f4f5',
            text: (projectState.theme && projectState.theme.text) || '#1A1A1A'
        },
        ai_specification: schemaSpec || {},
        blocks: projectState.blocks || []
    };
}

function extractJSONFromString(text) {
    text = text.trim();
    // 1. Try direct JSON parse
    try {
        return JSON.parse(text);
    } catch (e) {
        // Direct parse failed, continue extraction
    }

    // 2. Try to match comment CONSTRUCTOR_JSON (if embedded in HTML)
    const commentRegex = /<!--\s*CONSTRUCTOR_JSON:\s*([\s\S]*?)\s*-->/i;
    const commentMatch = text.match(commentRegex);
    if (commentMatch && commentMatch[1]) {
        try {
            return JSON.parse(commentMatch[1].trim());
        } catch (e) {
            // Ignore comment parse failure, try other matches
        }
    }

    // 3. Try to match hidden div class="constructor-json-container"
    const divRegex = /<div\s+class="constructor-json-container"[^>]*>([\s\S]*?)<\/div>/i;
    const divMatch = text.match(divRegex);
    if (divMatch && divMatch[1]) {
        try {
            let decoded = divMatch[1].trim()
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&#39;/g, "'")
                .replace(/&#039;/g, "'")
                .replace(/&apos;/g, "'");
            return JSON.parse(decoded);
        } catch (e) {
            // Ignore div parse failure, try other matches
        }
    }

    // 3. Try to match markdown code block
    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
    const match = text.match(codeBlockRegex);
    if (match && match[1]) {
        try {
            return JSON.parse(match[1].trim());
        } catch (e) {
            // If markdown parsing failed, try extracting from that match below
            text = match[1].trim();
        }
    }

    // 4. Fallback to extracting everything between the first { and the last }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const extracted = text.substring(firstBrace, lastBrace + 1);
        try {
            return JSON.parse(extracted);
        } catch (e) {
            // Ignore failure, throw custom error below
        }
    }

    throw new Error('Не удалось извлечь корректный JSON из текста.');
}


/* ============================================================
   Content Constructor — state/project-store.js
   Центральное хранилище состояния (Store Facade)
   ============================================================ */

let state = {
    title: '',
    slug: '',
    siteUrl: '',
    theme: {
        preset: 'default',
        accent: '#27272a',
        bg: '#f4f4f5',
        text: '#1A1A1A'
    },
    blocks: []
};

const projectStore = {
    getState() {
        return JSON.parse(JSON.stringify(state));
    },
    
    setState(nextState) {
        if (!nextState) return;
        
        state.title = nextState.title || '';
        state.slug = nextState.slug || '';
        
        if (nextState.siteUrl !== undefined) {
            state.siteUrl = nextState.siteUrl;
        } else if (nextState.project && nextState.project.siteUrl !== undefined) {
            state.siteUrl = nextState.project.siteUrl;
        } else {
            state.siteUrl = '';
        }
        
        if (nextState.theme) {
            state.theme.preset = nextState.theme.preset || 'default';
            state.theme.accent = nextState.theme.accent || '#27272a';
            state.theme.bg = nextState.theme.bg || '#f4f4f5';
            state.theme.text = nextState.theme.text || '#1A1A1A';
        }
        
        if (Array.isArray(nextState.blocks)) {
            state.blocks = JSON.parse(JSON.stringify(nextState.blocks));
        }
    },
    
    updateProjectMeta(patch) {
        if (patch.title !== undefined) state.title = patch.title;
        if (patch.slug !== undefined) state.slug = patch.slug;
        if (patch.siteUrl !== undefined) state.siteUrl = patch.siteUrl;
    },
    
    setBlocks(newBlocks) {
        if (Array.isArray(newBlocks)) {
            state.blocks = JSON.parse(JSON.stringify(newBlocks));
        }
    },
    
    getBlocks() {
        return state.blocks;
    }
};

function hydrateStoreFromDom() {
    const titleEl = document.getElementById('articleTitle');
    const domainEl = document.getElementById('articleDomain');
    const slugEl = document.getElementById('articleSlug');
    const themeSelectEl = document.getElementById('themeSelect');
    const colorAccentEl = document.getElementById('colorAccent');
    const colorBgEl = document.getElementById('colorBg');
    const colorTextEl = document.getElementById('colorText');
    
    const loadedState = {
        title: titleEl ? titleEl.value : '',
        slug: slugEl ? slugEl.value : '',
        siteUrl: domainEl ? domainEl.value : '',
        theme: {
            preset: themeSelectEl ? themeSelectEl.value : 'default',
            accent: colorAccentEl ? colorAccentEl.value : '#27272a',
            bg: colorBgEl ? colorBgEl.value : '#f4f4f5',
            text: colorTextEl ? colorTextEl.value : '#1A1A1A'
        },
        blocks: typeof blocks !== 'undefined' ? blocks : []
    };
    projectStore.setState(loadedState);
}

function applyStoreToDom() {
    const storeState = projectStore.getState();
    
    const titleEl = document.getElementById('articleTitle');
    const domainEl = document.getElementById('articleDomain');
    const slugEl = document.getElementById('articleSlug');
    
    if (titleEl) titleEl.value = storeState.title;
    if (domainEl) domainEl.value = storeState.siteUrl;
    if (slugEl) slugEl.value = storeState.slug;
    
    const themeSelectEl = document.getElementById('themeSelect');
    const colorAccentEl = document.getElementById('colorAccent');
    const colorBgEl = document.getElementById('colorBg');
    const colorTextEl = document.getElementById('colorText');
    
    if (themeSelectEl && storeState.theme.preset) themeSelectEl.value = storeState.theme.preset;
    if (colorAccentEl && storeState.theme.accent) colorAccentEl.value = storeState.theme.accent;
    if (colorBgEl && storeState.theme.bg) colorBgEl.value = storeState.theme.bg;
    if (colorTextEl && storeState.theme.text) colorTextEl.value = storeState.theme.text;
    
    // Keep legacy global blocks in sync
    if (typeof blocks !== 'undefined') {
        blocks = storeState.blocks;
    }
    
    // Apply theme UI
    if (typeof updateThemeSelectOptions === 'function') {
        updateThemeSelectOptions(storeState.theme.preset);
    }
    if (typeof updateThemeUI === 'function') {
        updateThemeUI();
    }
}


/* ============================================================
   Content Constructor — blocks/registry.js
   Реестр типов блоков с поддержкой совместимости контрактов
   ============================================================ */

const BlockRegistry = {
    _blocks: {},
    
    register(blockDef) {
        if (!blockDef || !blockDef.type) {
            console.error("Invalid block definition registered", blockDef);
            return;
        }
        
        // Двусторонняя совместимость имен методов:
        // 1. Из нового контракта в старый (для legacy вызовов в app-entry.js)
        if (blockDef.renderEditor && !blockDef.editForm) {
            blockDef.editForm = blockDef.renderEditor;
        }
        if (blockDef.renderPreview && !blockDef.preview) {
            blockDef.preview = blockDef.renderPreview;
        }
        if (blockDef.renderHTML && !blockDef.toHTML) {
            blockDef.toHTML = blockDef.renderHTML;
        }
        
        // 2. Из старого контракта в новый (на будущее)
        if (blockDef.editForm && !blockDef.renderEditor) {
            blockDef.renderEditor = blockDef.editForm;
        }
        if (blockDef.preview && !blockDef.renderPreview) {
            blockDef.renderPreview = blockDef.preview;
        }
        if (blockDef.toHTML && !blockDef.renderHTML) {
            blockDef.renderHTML = blockDef.toHTML;
        }
        
        this._blocks[blockDef.type] = blockDef;
    },
    
    get(type) {
        return this._blocks[type];
    },
    
    getAll() {
        return this._blocks;
    }
};


/* ============================================================
   Content Constructor — blocks/types/heading.js
   Блок: Заголовок
   ============================================================ */

BlockRegistry.register({
    type: 'heading',
    label: 'Заголовок',
    defaults: () => ({ level: 2, text: 'Заголовок' }),
    
    renderEditor(block, ctx) {
        return `
            <div class="form-row">
                <div class="form-group" style="flex:0 0 100px">
                    <label>Уровень</label>
                    <select data-field="level">
                        <option value="1" ${block.data.level===1?'selected':''}>H1</option>
                        <option value="2" ${block.data.level===2?'selected':''}>H2</option>
                        <option value="3" ${block.data.level===3?'selected':''}>H3</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Текст</label>
                    <input type="text" data-field="text" value="${escapeHtml(block.data.text)}">
                </div>
            </div>`;
    },
    
    renderHTML(block, allBlocks) {
        const headings = allBlocks ? allBlocks.filter(b => b.type === 'heading') : [];
        const idx = headings.findIndex(h => h.id === block.id);
        const idAttr = idx !== -1 ? ` id="heading${idx + 1}"` : '';
        return `<h${block.data.level}${idAttr}>${escapeHtml(block.data.text)}</h${block.data.level}>`;
    },
    
    renderPreview(block, allBlocks) {
        return this.renderHTML(block, allBlocks);
    }
});


/* ============================================================
   Content Constructor — blocks/types/paragraph.js
   Блок: Параграф
   ============================================================ */

BlockRegistry.register({
    type: 'paragraph',
    label: 'Параграф',
    defaults: () => ({ text: 'Текст абзаца...' }),
    
    renderEditor(block, ctx) {
        return `<div class="form-group"><label>Текст (поддержка Markdown: **жирный**, *курсив*, [ссылка](url), списки, новые строки)</label>${agreeToolbarHtml()}<textarea data-field="text" rows="6">${escapeHtml(block.data.text)}</textarea></div>`;
    },
    
    renderHTML(block) {
        return markdownToHtml(block.data.text, false);
    },
    
    renderPreview(block) {
        return markdownToHtml(block.data.text, true);
    }
});


/* ============================================================
   Content Constructor — blocks/types/faq.js
   Блок: FAQ
   ============================================================ */

BlockRegistry.register({
    type: 'faq',
    label: 'FAQ',
    defaults: () => ({
        title: 'Часто задаваемые вопросы',
        items: [
            { question: 'Сколько времени занимает замена линз?', answer: 'В среднем процедура установки линз занимает от 6 до 12 часов. В некоторых случаях срок может увеличиться до 2–3 дней.' },
            { question: 'Какие линзы лучше выбрать: галоген, ксенон или Bi-LED?', answer: 'Bi-LED линзы — самый современный вариант. Они потребляют меньше энергии, работают до 50 000 часов, включаются мгновенно и не требуют блоков розжига. Ксенон требует времени для разогрева, а галоген уступает по яркости и долговечности.' },
            { question: 'Что такое Bi-LED линзы?', answer: 'Bi-LED линзы — это оптические устройства, которые используют светодиоды (LED) в качестве источника света. Приставка «Bi» означает, что одна линза выполняет функции как ближнего, так и дальнего света.' },
            { question: 'Какой световой поток у Bi-LED линз?', answer: 'Световой поток составляет от 3 000 до 4 000 лм на ближнем свете и от 5 000 до 8 000 лм на дальнем свете. Точные характеристики зависят от конкретной модели и производителя.' },
            { question: 'Предоставляется ли гарантия на работу?', answer: 'Да, на работу и компоненты предоставляется гарантия до 2-х лет. После замены линз регулировка света проверяется и корректируется на стенде по ГОСТ.' },
            { question: 'Нужно ли менять лампы после замены линз?', answer: 'Нет, при установке Bi-LED линз отдельные лампы не требуются — светодиоды уже встроены в модуль. Вы получаете полностью готовую к работе оптику.' },
            { question: 'Сохраняется ли штатный функционал фар после замены?', answer: 'Да, все процедуры проводятся согласно техническому регламенту с полным сохранением функционала фар. Адаптивное освещение (AFS, AFLS, DLA, ILS) продолжает работать.' }
        ]
    }),
    
    renderEditor(block, ctx) {
        let html = `<div class="form-group"><label>Заголовок секции</label><input type="text" data-field="title" value="${escapeHtml(block.data.title)}"></div>`;
        html += `<div class="faq-editor">`;
        block.data.items.forEach((item, i) => {
            html += `<div class="faq-editor-item">
                <div class="faq-editor-header">
                    <span class="faq-editor-num">${i + 1}</span>
                    <input type="text" data-faq-question="${i}" value="${escapeHtml(item.question)}" placeholder="Вопрос">
                    <button class="btn btn-sm btn-ghost" data-action="remove-faq-item" data-index="${i}">&times;</button>
                </div>
                <textarea data-faq-answer="${i}" rows="3" placeholder="Ответ">${escapeHtml(item.answer)}</textarea>
                ${agreeToolbarHtml()}
            </div>`;
        });
        html += `</div><button class="btn btn-sm btn-ghost" data-action="add-faq-item">+ Добавить вопрос</button>`;
        return html;
    },
    
    renderHTML(block, ctx) {
        const id = 'faq-' + block.id;
        let html = `<div class="article-faq" id="${id}">`;
        if (block.data.title) {
            html += `<h2 class="article-faq-title">${escapeHtml(block.data.title)}</h2>`;
        }
        html += `<div class="article-faq-list">`;
        block.data.items.forEach((item, i) => {
            html += `<div class="article-faq-item">
                <div class="article-faq-question collapsed">${escapeHtml(item.question)}</div>
                <div class="article-faq-collapse collapse">
                    <div class="article-faq-answer">${markdownToHtml(item.answer, false)}</div>
                </div>
            </div>`;
        });
        html += `</div></div>`;
        return html;
    },
    
    renderPreview(block, ctx) {
        const id = 'preview-faq-' + block.id;
        let html = `<div class="article-faq" id="${id}">`;
        if (block.data.title) {
            html += `<h2 class="article-faq-title">${escapeHtml(block.data.title)}</h2>`;
        }
        html += `<div class="article-faq-list">`;
        block.data.items.forEach((item, i) => {
            html += `<div class="article-faq-item">
                <div class="article-faq-question collapsed">${escapeHtml(item.question)}</div>
                <div class="article-faq-collapse collapse">
                    <div class="article-faq-answer">${markdownToHtml(item.answer, true)}</div>
                </div>
            </div>`;
        });
        html += `</div></div>`;
        return html;
    }
});


/* ============================================================
   Content Constructor — blocks/types/tabs.js
   Блок: Вкладки
   ============================================================ */

BlockRegistry.register({
    type: 'tabs',
    label: 'Вкладки',
    defaults: () => ({ tabs: [{ title: 'Вкладка 1', text: 'Содержимое вкладки 1' }, { title: 'Вкладка 2', text: 'Содержимое вкладки 2' }] }),
    
    renderEditor(block, ctx) {
        let html = `<div class="tabs-editor">`;
        block.data.tabs.forEach((tab, i) => {
            html += `<div class="tab-editor-item">
                <div class="tab-editor-header">
                    <input type="text" data-tab-title="${i}" value="${escapeHtml(tab.title)}" placeholder="Заголовок вкладки">
                    <button class="btn btn-sm btn-ghost" data-action="remove-tab" data-index="${i}">&times;</button>
                </div>
                ${agreeToolbarHtml()}
                <textarea data-tab-text="${i}" rows="3" placeholder="Содержимое">${escapeHtml(tab.text)}</textarea>
            </div>`;
        });
        html += `</div><button class="btn btn-sm btn-ghost" data-action="add-tab">+ Добавить вкладку</button>`;
        return html;
    },
    
    renderHTML(block, ctx) {
        const id = 'tabs-' + block.id;
        let html = `<div class="article-tabs" id="${id}"><div class="article-tabs-nav">`;
        block.data.tabs.forEach((tab, i) => {
            html += `<button type="button" class="article-tabs-btn ${i===0?'active':''}" data-tab="${i}">${escapeHtml(tab.title)}</button>`;
        });
        html += `</div><div class="article-tabs-panels">`;
        block.data.tabs.forEach((tab, i) => {
            html += `<div class="article-tabs-panel" style="${i===0?'':'display:none'}">${markdownToHtml(tab.text, false)}</div>`;
        });
        html += `</div></div>`;
        return html;
    },
    
    renderPreview(block, ctx) {
        const id = 'preview-' + block.id;
        let html = `<div class="article-tabs" id="${id}"><div class="article-tabs-nav">`;
        block.data.tabs.forEach((tab, i) => {
            html += `<button type="button" class="article-tabs-btn ${i===0?'active':''}" data-tab="${i}">${escapeHtml(tab.title)}</button>`;
        });
        html += `</div><div class="article-tabs-panels">`;
        block.data.tabs.forEach((tab, i) => {
            html += `<div class="article-tabs-panel" style="${i===0?'':'display:none'}">${markdownToHtml(tab.text, true)}</div>`;
        });
        html += `</div></div>`;
        return html;
    }
});


/* ============================================================
   Content Constructor — render/render-article.js
   Низкоуровневый рендеринг блоков и сборка итоговой статьи
   ============================================================ */

function getGridColumnClasses(block, idx) {
    const pc = block.data.pcPattern[idx] || 12;
    const mobilePerRow = parseInt(block.data.mobilePerRow, 10) || 1;
    const xs = mobilePerRow === 2 ? 6 : 12;

    return `col-xs-${xs} col-md-${pc}`;
}

function formatGridPattern(pattern) {
    return pattern.join('+');
}

function renderBlockContent(block, mode, allBlocks) {
    const def = BlockRegistry.get(block.type);

    if (!def) {
        return '';
    }

    // Совместимость вызовов preview/toHTML или renderPreview/renderHTML
    const html = mode === 'preview' ? def.preview(block, allBlocks) : def.toHTML(block, allBlocks);

    if (mode === 'preview' && html.trim()) {
        return `<div class="preview-block-wrap" data-preview-id="${block.id}">${html}</div>`;
    }

    return html;
}

function renderContentBlocks(contentBlocks, mode) {
    let html = '';

    contentBlocks.forEach(block => {
        html += renderBlockContent(block, mode, projectStore.getBlocks()) + '\n';
    });

    return html;
}

function renderGridHtml(block, mode) {
    let html = '<div class="row article-grid-row">\n';

    block.data.columns.forEach((column, idx) => {
        html += `  <div class="${getGridColumnClasses(block, idx)}">\n`;
        html += renderContentBlocks(column.blocks, mode);
        html += '  </div>\n';
    });

    html += '</div>';

    return html;
}

function renderArticlePartsForBlocks(blocksList, mode) {
    let tocHTML = '';
    let contentHTML = '';

    blocksList.forEach(block => {
        const html = renderBlockContent(block, mode, blocksList);

        if (block.type === 'toc') {
            tocHTML += html + '\n';
        } else {
            contentHTML += '    ' + html + '\n';
        }
    });

    return { tocHTML, contentHTML };
}

function renderArticleParts(mode) {
    return renderArticlePartsForBlocks(projectStore.getBlocks(), mode);
}


/* ============================================================
   Content Constructor — render/render-preview.js
   Управление правой панелью живого предпросмотра
   ============================================================ */

function renderPreview(previewContentEl, blocksList) {
    if (!previewContentEl) return;
    
    if (!blocksList || blocksList.length === 0) {
        previewContentEl.innerHTML = '<p class="preview-empty">Превью появится после добавления блоков</p>';
        return;
    }
    
    const { tocHTML, contentHTML } = renderArticlePartsForBlocks(blocksList, 'preview');
    previewContentEl.innerHTML = tocHTML + '<div class="description">\n' + contentHTML + '</div>';
}


/* ============================================================
   Content Constructor — render/render-workspace.js
   Управление левой рабочей областью конструктора (карточки)
   ============================================================ */

function createBlockCard(block, idx, blocksList) {
    const def = BlockRegistry.get(block.type);
    const card = document.createElement('div');
    card.className = 'block-card';
    card.dataset.id = block.id;
    card.dataset.idx = idx;
    card.draggable = true;

    const preview = block.type === 'grid' ? renderGridWorkspace(block) : def.preview(block, blocksList);

    card.innerHTML = `
        <div class="block-header">
            <span class="drag-handle" title="Перетащить">&#9776;</span>
            <span class="block-type-label">${def.label}</span>
            <div class="block-actions">
                <button class="block-action-btn" data-action="edit" title="Редактировать">&#9998;</button>
                <button class="block-action-btn" data-action="duplicate" title="Дублировать">&#10697;</button>
                <button class="block-action-btn delete" data-action="delete" title="Удалить">&#10005;</button>
            </div>
        </div>
        <div class="block-body">
            <div class="block-preview">${preview}</div>
        </div>`;
    return card;
}

function renderEditForm(block) {
    const def = BlockRegistry.get(block.type);
    return `<div class="edit-form">${def.editForm(block)}</div><div class="form-actions"><button class="btn btn-sm btn-primary" data-action="save">Сохранить</button><button class="btn btn-sm btn-ghost" data-action="cancel">Отмена</button></div>`;
}

function renderGridWorkspace(block) {
    const pattern = formatGridPattern(block.data.pcPattern);
    let html = `<div class="grid-workspace">
        <div class="grid-workspace-help">Bootstrap 3 row: PC ${pattern}, mobile ${block.data.mobilePerRow} в ряд. Перетащите блоки в нужную секцию.</div>
        <div class="row grid-workspace-row">`;

    block.data.columns.forEach((column, idx) => {
        html += `<div class="${getGridColumnClasses(block, idx)}">
            <div class="grid-column-drop" data-grid-column="${column.id}">
                <div class="grid-column-head">
                    <span>md-${block.data.pcPattern[idx]}</span>
                    <button type="button" class="grid-column-remove" data-action="remove-grid-column" data-column-id="${column.id}" title="Удалить секцию и вернуть блоки вниз">&times;</button>
                </div>`;

        if (column.blocks.length) {
            column.blocks.forEach(child => {
                const childDef = BlockRegistry.get(child.type);
                html += `<div class="grid-child-card" draggable="true" data-child-id="${child.id}" data-column-id="${column.id}">
                    <div class="grid-child-head">
                        <span>${childDef ? childDef.label : child.type}</span>
                        <button type="button" class="grid-child-remove" data-action="remove-grid-child" data-child-id="${child.id}" data-column-id="${column.id}" title="Удалить вложенный блок">&times;</button>
                    </div>
                    <div class="grid-child-preview">${renderBlockContent(child, 'preview', projectStore.getBlocks())}</div>
                </div>`;
            });
        } else {
            html += '<div class="grid-column-empty">Пусто</div>';
        }

        html += '</div></div>';
    });

    html += '</div></div>';

    return html;
}


/* ============================================================
   Content Constructor — export/export-json.js
   Адаптер экспорта данных проекта в формате JSON
   ============================================================ */

function compileExportJson(projectState, ctx) {
    const schemaSpec = (ctx && ctx.schemaSpec) || CC_SCHEMA_SPEC;
    const dataToExport = serializeProject(projectState, schemaSpec);
    const jsonStr = JSON.stringify(dataToExport, null, 2);
    const slug = projectState.slug || 'content-template';

    return {
        filename: `constructor-${slug}.json`,
        mimeType: 'application/json',
        content: jsonStr
    };
}


/* ============================================================
   Content Constructor — export/export-css.js
   Адаптер экспорта стилей CSS для статьи
   ============================================================ */

function compileExportCss(projectState, ctx) {
    const themeState = projectState.theme;
    const content = getExportedCSS(themeState);

    return {
        filename: 'content-constructor.css',
        mimeType: 'text/css',
        content: content
    };
}


/* ============================================================
   Content Constructor — export/export-html.js
   Адаптер экспорта статьи в формате HTML
   ============================================================ */

function compileExportHtml(projectState, ctx) {
    const { tocHTML, contentHTML } = renderArticlePartsForBlocks(projectState.blocks, 'toHTML');
    
    const theme = getCurrentThemeColorsFromState(projectState.theme);
    const styleAttr = `style="--accent_background_color: ${theme.accent}; --background_main_color: ${theme.bg}; --background_additional_color: ${theme.bgAdditional}; --main_color: ${theme.text}; --additional_color: ${theme.textAdditional};"`;
    
    const schemaSpec = (ctx && ctx.schemaSpec) || CC_SCHEMA_SPEC;
    const projectJSON = JSON.stringify(serializeProject(projectState, schemaSpec));
    
    const cleanHTML = `${tocHTML}<div class="description" ${styleAttr}>\n${contentHTML}</div>\n<!-- CONSTRUCTOR_JSON:\n${projectJSON}\n-->`;
    
    const slug = projectState.slug || 'article';

    return {
        filename: `content-${slug}.html`,
        mimeType: 'text/html',
        content: cleanHTML
    };
}


/* ============================================================
   Content Constructor — export/export-ocmod-xml.js
   Адаптер экспорта XML-модификаторов OpenCart (ocmod)
   ============================================================ */

function compileExportOcmodImportXml(projectState) {
    const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<modification>
    <name>OpenCart Content Constructor - Summernote Import</name>
    <code>content_constructor_import</code>
    <version>1.0</version>
    <author>Tom</author>
    <link>https://opencartforum.com.ru/</link>
    <file path="admin/view/template/common/footer.twig">
        <operation>
            <search><![CDATA[</body>]]></search>
            <add position="before"><![CDATA[
<script type="text/javascript"><!--
(function($) {
  if (typeof $.fn.summernote !== 'undefined') {
    var originalSummernote = $.fn.summernote;
    $.fn.summernote = function(options) {
      if (typeof options === 'object') {
        options.buttons = options.buttons || {};
        options.buttons.import_constructor = function(context) {
          var ui = $.summernote.ui;
          var $note = context.$note;
          var button = ui.button({
            contents: '<i class="fa fa-file-text-o" style="color: #27272a; font-weight: bold;" />',
            tooltip: 'Импортировать из Конструктора (.txt / .html)',
            click: function () {
              var fileInput = $('<input type="file" accept=".txt,.html" style="display:none">');
              $('body').append(fileInput);
              fileInput.click();
              fileInput.on('change', function(e) {
                var file = e.target.files[0];
                if (!file) return;
                var reader = new FileReader();
                reader.onload = function(evt) {
                  var contents = evt.target.result;
                  if (contents.indexOf('<body') !== -1) {
                    var match = contents.match(/<body[^>]*>([\\s\\S]*?)<\\/body>/i);
                    if (match && match[1]) {
                      contents = match[1];
                    }
                  }
                  contents = contents.trim();
                  if (confirm('Очистить редактор перед импортом?\\nНажмите "ОК" для полной замены текста.\\nНажмите "Отмена" для вставки в текущую позицию курсора.')) {
                    $note.summernote('code', contents);
                  } else {
                    $note.summernote('pasteHTML', contents);
                  }
                };
                reader.readAsText(file);
                fileInput.remove();
              });
            }
          });
          return button.render();
        };
        if (options.toolbar) {
          for (var i = 0; i < options.toolbar.length; i++) {
            if (options.toolbar[i][0] === 'insert') {
              if (options.toolbar[i][1].indexOf('import_constructor') === -1) {
                options.toolbar[i][1].push('import_constructor');
              }
              break;
            }
          }
        }
      }
      return originalSummernote.apply(this, arguments);
    };
  }
})(jQuery);
//--></script>
            ]]></add>
        </operation>
    </file>
</modification>`;

    return {
        filename: 'content_constructor.ocmod.xml',
        mimeType: 'text/xml',
        content: xmlContent
    };
}

function compileExportOcmodStylesXml(projectState) {
    const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<modification>
    <name>OpenCart Content Constructor - Global Stylesheet</name>
    <code>content_constructor_styles</code>
    <version>1.1</version>
    <author>Tom</author>
    <link>https://opencartforum.com.ru/</link>
    <file path="catalog/view/theme/*/template/common/header.twig">
        <operation>
            <search><![CDATA[</head>]]></search>
            <add position="before"><![CDATA[
<link href="catalog/view/theme/default/stylesheet/content-constructor.css" rel="stylesheet" />
            ]]></add>
        </operation>
    </file>
    <file path="catalog/view/theme/*/template/common/footer.twig">
        <operation>
            <search><![CDATA[</body>]]></search>
            <add position="before"><![CDATA[
<script type="text/javascript"><!--
document.addEventListener('click', function(event) {
  // 1. Smooth Scroll for anchors
  var link = event.target.closest('a.anchor[data-destination]');
  if (link) {
    var selector = link.getAttribute('data-destination');
    if (selector && selector.charAt(0) === '#') {
      var target = document.querySelector(selector);
      if (target) {
        event.preventDefault();
        if (window.history && window.history.pushState) {
          window.history.pushState(null, '', selector);
        } else {
          window.location.hash = selector;
        }
        var targetTop = target.getBoundingClientRect().top + window.pageYOffset - 20;
        try {
          window.scrollTo({ top: targetTop, behavior: 'smooth' });
        } catch (e) {
          window.scrollTo(0, targetTop);
        }
      }
    }
  }

  // 2. FAQ Accordion Toggle
  var question = event.target.closest('.article-faq-question');
  if (question) {
    var item = question.closest('.article-faq-item');
    if (item) {
      var targetEl = item.querySelector('.article-faq-collapse');
      if (targetEl) {
        var isCollapsed = targetEl.classList.contains('in');
        if (isCollapsed) {
          targetEl.classList.remove('in');
          question.classList.add('collapsed');
        } else {
          targetEl.classList.add('in');
          question.classList.remove('collapsed');
        }
      }
    }
  }

  // 3. Tabs Switcher
  var tabBtn = event.target.closest('.article-tabs-nav button');
  if (tabBtn) {
    var nav = tabBtn.parentNode;
    var wrapper = nav.parentNode;
    var panels = wrapper.querySelector('.article-tabs-panels');
    if (nav && panels) {
      var idx = tabBtn.getAttribute('data-tab');
      var buttons = nav.querySelectorAll('[data-tab]');
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('active');
      }
      for (var j = 0; j < panels.children.length; j++) {
        panels.children[j].style.display = 'none';
      }
      tabBtn.classList.add('active');
      var panel = panels.children[parseInt(idx, 10)];
      if (panel) {
        panel.style.display = 'block';
      }
    }
  }
});
//--></script>
            ]]></add>
        </operation>
    </file>
</modification>`;

    return {
        filename: 'content_styles.ocmod.xml',
        mimeType: 'text/xml',
        content: xmlContent
    };
}

function compileExportOcmodInstallXml(projectState) {
    const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<modification>
    <name>OpenCart Content Constructor - Integration Package</name>
    <code>content_constructor_integration</code>
    <version>1.0</version>
    <author>Tom</author>
    <link>https://opencartforum.com.ru/</link>

    <!-- 1. Summernote Import Button in Admin Panel Footer -->
    <file path="admin/view/template/common/footer.twig">
        <operation>
            <search><![CDATA[</body>]]></search>
            <add position="before"><![CDATA[
<script type="text/javascript"><!--
(function($) {
  if (typeof $.fn.summernote !== 'undefined') {
    var originalSummernote = $.fn.summernote;
    $.fn.summernote = function(options) {
      if (typeof options === 'object') {
        options.buttons = options.buttons || {};
        options.buttons.import_constructor = function(context) {
          var ui = $.summernote.ui;
          var $note = context.$note;
          var button = ui.button({
            contents: '<i class="fa fa-file-text-o" style="color: #27272a; font-weight: bold;" />',
            tooltip: 'Импортировать из Конструктора (.txt / .html)',
            click: function () {
              var fileInput = $('<input type="file" accept=".txt,.html" style="display:none">');
              $('body').append(fileInput);
              fileInput.click();
              fileInput.on('change', function(e) {
                var file = e.target.files[0];
                if (!file) return;
                var reader = new FileReader();
                reader.onload = function(evt) {
                  var contents = evt.target.result;
                  if (contents.indexOf('<body') !== -1) {
                    var match = contents.match(/<body[^>]*>([\\s\\S]*?)<\\/body>/i);
                    if (match && match[1]) {
                      contents = match[1];
                    }
                  }
                  contents = contents.trim();
                  if (confirm('Очистить редактор перед импортом?\\nНажмите "ОК" для полной замены текста.\\nНажмите "Отмена" для вставки в текущую позицию курсора.')) {
                    $note.summernote('code', contents);
                  } else {
                    $note.summernote('pasteHTML', contents);
                  }
                };
                reader.readAsText(file);
                fileInput.remove();
              });
            }
          });
          return button.render();
        };
        if (options.toolbar) {
          for (var i = 0; i < options.toolbar.length; i++) {
            if (options.toolbar[i][0] === 'insert') {
              if (options.toolbar[i][1].indexOf('import_constructor') === -1) {
                options.toolbar[i][1].push('import_constructor');
              }
              break;
            }
          }
        }
      }
      return originalSummernote.apply(this, arguments);
    };
  }
})(jQuery);
//--></script>
            ]]></add>
        </operation>
    </file>

    <!-- 2. Storefront Stylesheet Link Injection -->
    <file path="catalog/view/theme/*/template/common/header.twig">
        <operation>
            <search><![CDATA[</head>]]></search>
            <add position="before"><![CDATA[
<link href="catalog/view/theme/default/stylesheet/content-constructor.css" rel="stylesheet" />
            ]]></add>
        </operation>
    </file>

    <!-- 3. Storefront Anchor Scroll Handler, FAQ & Tabs -->
    <file path="catalog/view/theme/*/template/common/footer.twig">
        <operation>
            <search><![CDATA[</body>]]></search>
            <add position="before"><![CDATA[
<script type="text/javascript"><!--
document.addEventListener('click', function(event) {
  // 1. Smooth Scroll for anchors
  var link = event.target.closest('a.anchor[data-destination]');
  if (link) {
    var selector = link.getAttribute('data-destination');
    if (selector && selector.charAt(0) === '#') {
      var target = document.querySelector(selector);
      if (target) {
        event.preventDefault();
        if (window.history && window.history.pushState) {
          window.history.pushState(null, '', selector);
        } else {
          window.location.hash = selector;
        }
        var targetTop = target.getBoundingClientRect().top + window.pageYOffset - 20;
        try {
          window.scrollTo({ top: targetTop, behavior: 'smooth' });
        } catch (e) {
          window.scrollTo(0, targetTop);
        }
      }
    }
  }

  // 2. FAQ Accordion Toggle
  var question = event.target.closest('.article-faq-question');
  if (question) {
    var item = question.closest('.article-faq-item');
    if (item) {
      var targetEl = item.querySelector('.article-faq-collapse');
      if (targetEl) {
        var isCollapsed = targetEl.classList.contains('in');
        if (isCollapsed) {
          targetEl.classList.remove('in');
          question.classList.add('collapsed');
        } else {
          targetEl.classList.add('in');
          question.classList.remove('collapsed');
        }
      }
    }
  }

  // 3. Tabs Switcher
  var tabBtn = event.target.closest('.article-tabs-nav button');
  if (tabBtn) {
    var nav = tabBtn.parentNode;
    var wrapper = nav.parentNode;
    var panels = wrapper.querySelector('.article-tabs-panels');
    if (nav && panels) {
      var idx = tabBtn.getAttribute('data-tab');
      var buttons = nav.querySelectorAll('[data-tab]');
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('active');
      }
      for (var j = 0; j < panels.children.length; j++) {
        panels.children[j].style.display = 'none';
      }
      tabBtn.classList.add('active');
      var panel = panels.children[parseInt(idx, 10)];
      if (panel) {
        panel.style.display = 'block';
      }
    }
  }
});
//--></script>
            ]]></add>
        </operation>
    </file>
</modification>`;

    return {
        filename: 'install.xml',
        mimeType: 'text/xml',
        content: xmlContent
    };
}


/* ============================================================
   Content Constructor — export/export-ocmod-zip.js
   Адаптер экспорта ZIP-архива модификатора для OpenCart
   ============================================================ */

async function compileExportOcmodZip(projectState, ctx) {
    if (typeof JSZip === 'undefined') {
        throw new Error('JSZip is not defined');
    }

    const zip = new JSZip();

    // 1. Get install.xml and content-constructor.css content
    const installXml = compileExportOcmodInstallXml(projectState);
    const cssContent = compileExportCss(projectState);

    zip.file("install.xml", installXml.content);
    zip.file("upload/catalog/view/theme/default/stylesheet/content-constructor.css", cssContent.content);

    const fontPaths = [
        { zip: "upload/catalog/view/theme/default/stylesheet/fonts/InterSans-Regular.woff", local: "css/InterSans-Regular.woff?v=1.0.3" },
        { zip: "upload/catalog/view/theme/default/stylesheet/fonts/InterSans-SemiBold.woff", local: "css/InterSans-SemiBold.woff?v=1.0.3" }
    ];

    const isLocal = location.protocol === 'file:';

    const loadFonts = isLocal
        ? Promise.all(fontPaths.map(fp => {
            return new Promise((resolve) => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', fp.local, true);
                xhr.responseType = 'arraybuffer';
                xhr.onload = () => resolve(xhr.status === 200 ? { data: xhr.response, path: fp.zip } : null);
                xhr.onerror = () => resolve(null);
                xhr.send();
            });
        }))
        : Promise.all(fontPaths.map(fp =>
            fetch(fp.local).then(res => res.ok ? res.arrayBuffer().then(d => ({ data: d, path: fp.zip })) : null).catch(() => null)
        ));

    const results = await loadFonts;
    results.forEach(item => {
        if (item) zip.file(item.path, item.data);
    });

    const blob = await zip.generateAsync({ type: "blob" });

    return {
        filename: 'content_constructor.ocmod.zip',
        mimeType: 'application/zip',
        blob: blob
    };
}


/* ============================================================
   Content Constructor — export/export-article-zip.js
   Адаптер экспорта ZIP-архива статьи с HTML и ресурсами
   ============================================================ */

async function compileExportArticleZip(projectState, ctx) {
    if (typeof JSZip === 'undefined') {
        throw new Error('JSZip is not defined');
    }

    const title = projectState.title || 'Статья';
    const slug = projectState.slug || 'article';

    const copiedBlocks = JSON.parse(JSON.stringify(projectState.blocks));
    const imagesToPack = [];

    function collectAllImages(blocksList) {
        blocksList.forEach(block => {
            if (block.type === 'image') {
                if (block.data.srcType === 'local' && block.data.localSrc) {
                    imagesToPack.push({
                        src: block.data.localSrc,
                        isLocal: true,
                        update: (newUrl) => {
                            block.data.src = newUrl;
                            block.data.srcType = 'path';
                        }
                    });
                } else if (block.data.src) {
                    imagesToPack.push({
                        src: block.data.src,
                        isLocal: false,
                        update: (newUrl) => {
                            block.data.src = newUrl;
                            block.data.srcType = 'path';
                        }
                    });
                }
            } else if (block.type === 'carousel' && block.data.items) {
                block.data.items.forEach(item => {
                    if (item.src && !item.src.startsWith('data:')) {
                        imagesToPack.push({
                            src: item.src,
                            isLocal: false,
                            update: (newUrl) => {
                                item.src = newUrl;
                            }
                        });
                    }
                });
            } else if (block.type === 'before-after') {
                if (block.data.beforeImg && !block.data.beforeImg.startsWith('data:')) {
                    imagesToPack.push({
                        src: block.data.beforeImg,
                        isLocal: false,
                        update: (newUrl) => {
                            block.data.beforeImg = newUrl;
                        }
                    });
                }
                if (block.data.afterImg && !block.data.afterImg.startsWith('data:')) {
                    imagesToPack.push({
                        src: block.data.afterImg,
                        isLocal: false,
                        update: (newUrl) => {
                            block.data.afterImg = newUrl;
                        }
                    });
                }
            } else if (block.type === 'product-card') {
                if (block.data.img && !block.data.img.startsWith('data:')) {
                    imagesToPack.push({
                        src: block.data.img,
                        isLocal: false,
                        update: (newUrl) => {
                            block.data.img = newUrl;
                        }
                    });
                }
            } else if (block.type === 'grid' && block.data && block.data.columns) {
                block.data.columns.forEach(col => {
                    if (col.blocks) {
                        collectAllImages(col.blocks);
                    }
                });
            }
        });
    }

    function getExtensionFromMime(mime) {
        if (mime.includes('png')) return 'png';
        if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
        if (mime.includes('gif')) return 'gif';
        if (mime.includes('webp')) return 'webp';
        if (mime.includes('svg')) return 'svg';
        return 'png';
    }

    function getExtensionFromPath(path) {
        const parts = path.split('.');
        if (parts.length > 1) {
            const ext = parts.pop().toLowerCase();
            if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) {
                return ext === 'jpeg' ? 'jpg' : ext;
            }
        }
        return 'png';
    }

    collectAllImages(copiedBlocks);
    const zipPromises = [];
    const zip = new JSZip();

    imagesToPack.forEach((imgItem, idx) => {
        let imgPromise = null;
        let ext = 'png';
        
        if (imgItem.isLocal) {
            const b64Data = imgItem.src;
            if (b64Data && b64Data.startsWith('data:')) {
                const mimeMatch = b64Data.match(/^data:(image\/[a-z+]+);base64,/);
                if (mimeMatch) {
                    ext = getExtensionFromMime(mimeMatch[1]);
                }
                const rawB64 = b64Data.substring(b64Data.indexOf(';base64,') + 8);
                imgPromise = Promise.resolve({
                    data: rawB64,
                    isBase64: true,
                    ext: ext
                });
            }
        } else if (imgItem.src) {
            const srcPath = imgItem.src;
            ext = getExtensionFromPath(srcPath);
            
            let url = srcPath;
            if (url.startsWith('image/catalog/content-constructor/')) {
                const filename = url.substring('image/catalog/content-constructor/'.length);
                url = 'image/' + filename;
            }
            
            imgPromise = fetch(url)
                .then(res => {
                    if (!res.ok) throw new Error('Fetch failed');
                    return res.arrayBuffer();
                })
                .then(buf => {
                    return {
                        data: buf,
                        isBase64: false,
                        ext: ext
                    };
                })
                .catch(err => {
                    console.warn('Could not fetch image for ZIP packaging:', url, err);
                    return null;
                });
        }
        
        if (imgPromise) {
            const newFilename = `${slug}-img-${idx + 1}`;
            zipPromises.push(
                imgPromise.then(res => {
                    if (res) {
                        const finalExt = res.ext || ext;
                        const zipPath = `image/catalog/content-constructor/${slug}/${newFilename}.${finalExt}`;
                        
                        imgItem.update(zipPath);
                        
                        return {
                            path: zipPath,
                            data: res.data,
                            isBase64: res.isBase64
                        };
                    }
                    return null;
                })
            );
        }
    });

    const imagesToAdd = await Promise.all(zipPromises);
    imagesToAdd.forEach(img => {
        if (img) {
            if (img.isBase64) {
                zip.file(img.path, img.data, { base64: true });
            } else {
                zip.file(img.path, img.data);
            }
        }
    });

    // Generate clean HTML using the HTML export adapter on the temporary state with updated blocks
    const tempState = {
        ...projectState,
        blocks: copiedBlocks
    };
    const htmlArtifact = compileExportHtml(tempState, ctx);
    
    zip.file(htmlArtifact.filename, htmlArtifact.content);

    const zipBlob = await zip.generateAsync({ type: "blob" });

    return {
        filename: `article-${slug}.zip`,
        mimeType: 'application/zip',
        blob: zipBlob
    };
}


/* ============================================================
   Content Constructor — ui/modals.js
   Базовые UI-хелперы для модальных окон и копирования
   ============================================================ */

function bindBasicModal(modal, closeButtons, onOpen) {
    if (!modal) {
        return null;
    }

    function openModal() {
        modal.style.display = 'flex';
        if (typeof onOpen === 'function') {
            onOpen();
        }
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    (closeButtons || []).forEach((button) => {
        if (button) {
            button.addEventListener('click', closeModal);
        }
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    return {
        open: openModal,
        close: closeModal
    };
}

function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return Promise.resolve();
    } catch (error) {
        document.body.removeChild(textarea);
        return Promise.reject(error);
    }
}


/* ============================================================
   Content Constructor — ui/dropdowns.js
   Логика выпадающих меню в шапке
   ============================================================ */

function initHeaderDropdowns() {
    const dropdowns = [
        { el: document.querySelector('#importAiDropdown'), btn: document.querySelector('#importAiDropdown .btn') },
        { el: document.querySelector('#downloadDropdown'), btn: document.querySelector('#downloadDropdown .btn') }
    ];

    dropdowns.forEach((dropdown) => {
        if (!dropdown.el || !dropdown.btn) {
            return;
        }

        dropdown.btn.addEventListener('click', () => {
            dropdowns.forEach((other) => {
                if (other.el && other.el !== dropdown.el) {
                    other.el.classList.remove('active');
                }
            });

            dropdown.el.classList.toggle('active');
        });

        dropdown.el.addEventListener('click', (event) => {
            event.stopPropagation();
        });

        dropdown.el.querySelectorAll('.header-dropdown-item').forEach((item) => {
            item.addEventListener('click', () => {
                dropdown.el.classList.remove('active');
            });
        });
    });

    document.addEventListener('click', () => {
        dropdowns.forEach((dropdown) => {
            if (dropdown.el) {
                dropdown.el.classList.remove('active');
            }
        });
    });
}


/* ============================================================
   Content Constructor — ui/header-actions.js
   Логика действий шапки и файловых операций пользователя
   ============================================================ */

function initHeaderActions(options) {
    const {
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
        getState,
        handleZipDownload,
        handleArticleZipDownload,
        updateZipButtonsState,
        updateZipExportBtnState
    } = options;

    const btnCopyHTML = document.querySelector('#btnCopyHTML');
    if (btnCopyHTML) {
        btnCopyHTML.addEventListener('click', () => {
            hydrateStoreFromDom();
            const artifact = compileExportHtml(getState());
            const cleanHTML = artifact.content.split('\n<!-- CONSTRUCTOR_JSON')[0];

            navigator.clipboard.writeText(cleanHTML).then(() => {
                showToast('HTML-код статьи скопирован!');
                const icon = btnCopyHTML.querySelector('i');
                const title = btnCopyHTML.querySelector('.item-title');
                if (icon && title) {
                    const originalIconClass = icon.className;
                    const originalTitle = title.textContent;
                    icon.className = 'fa fa-check';
                    icon.style.color = '#27272a';
                    title.textContent = 'Скопировано!';
                    setTimeout(() => {
                        icon.className = originalIconClass;
                        icon.style.color = '#27272a';
                        title.textContent = originalTitle;
                    }, 2000);
                }
            }).catch((error) => {
                console.error('Не удалось скопировать текст: ', error);
                alert('Не удалось скопировать автоматически. Скопируйте код из экспортированного файла.');
            });
        });
    }

    const btnCopySlug = document.querySelector('#btnCopySlug');
    if (btnCopySlug && slugInput) {
        btnCopySlug.addEventListener('click', () => {
            const slug = slugInput.value.trim();
            if (!slug) {
                return;
            }
            navigator.clipboard.writeText(slug).then(() => {
                btnCopySlug.classList.add('copied');
                btnCopySlug.innerHTML = '<i class="fa fa-check"></i>';
                setTimeout(() => {
                    btnCopySlug.classList.remove('copied');
                    btnCopySlug.innerHTML = '<i class="fa fa-clone"></i>';
                }, 2000);
            }).catch(() => {
                alert('Не удалось скопировать slug.');
            });
        });
    }

    if (titleInput) {
        titleInput.addEventListener('input', () => {
            if (slugInput) {
                slugInput.value = slugify(titleInput.value);
            }
            syncHeaderToSession();
        });
    }

    if (slugInput) {
        slugInput.addEventListener('input', syncHeaderToSession);
    }

    const domainInput = document.querySelector('#articleDomain');
    if (domainInput) {
        domainInput.addEventListener('input', () => {
            updatePreview();
            syncHeaderToSession();
        });
    }

    const btnExportTXT = document.querySelector('#btnExportTXT');
    if (btnExportTXT) {
        btnExportTXT.addEventListener('click', () => {
            hydrateStoreFromDom();
            const artifact = compileExportHtml(getState());
            downloadFile(artifact.content, artifact.filename, artifact.mimeType);
        });
    }

    const btnExportCSS = document.querySelector('#btnExportCSS');
    if (btnExportCSS) {
        btnExportCSS.addEventListener('click', () => {
            hydrateStoreFromDom();
            const artifact = compileExportCss(getState());
            downloadFile(artifact.content, artifact.filename, artifact.mimeType);
        });
    }

    const btnExportJSON = document.querySelector('#btnExportJSON');
    if (btnExportJSON) {
        btnExportJSON.addEventListener('click', () => {
            hydrateStoreFromDom();
            const artifact = compileExportJson(getState());
            downloadFile(artifact.content, artifact.filename, artifact.mimeType);
        });
    }

    const btnImportJSON = document.querySelector('#btnImportJSON');
    const importFileInput = document.querySelector('#importFile');
    if (btnImportJSON && importFileInput) {
        btnImportJSON.addEventListener('click', () => {
            importFileInput.click();
        });

        importFileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) {
                return;
            }

            const reader = new FileReader();
            reader.onload = function(fileEvent) {
                importJSONContent(fileEvent.target.result, false);
                event.target.value = '';
            };
            reader.readAsText(file);
        });
    }

    const btnClipboardCopyJSON = document.querySelector('#btnClipboardCopyJSON');
    if (btnClipboardCopyJSON) {
        btnClipboardCopyJSON.addEventListener('click', exportJSONToClipboard);
    }

    const btnClipboardPasteJSON = document.querySelector('#btnClipboardPasteJSON');
    if (btnClipboardPasteJSON) {
        btnClipboardPasteJSON.addEventListener('click', importJSONFromClipboard);
    }

    const btnAiImport = document.querySelector('#btnAiImport');
    if (btnAiImport) {
        btnAiImport.addEventListener('click', importJSONFromClipboard);
    }

    const btnDownloadZip = document.querySelector('#btnDownloadZip');
    const btnDownloadZipDropdown = document.querySelector('#btnDownloadZipDropdown');
    if (btnDownloadZip) {
        btnDownloadZip.addEventListener('click', handleZipDownload);
    }
    if (btnDownloadZipDropdown) {
        btnDownloadZipDropdown.addEventListener('click', handleZipDownload);
    }

    const btnDownloadImportXml = document.querySelector('#btnDownloadImportXml');
    if (btnDownloadImportXml) {
        btnDownloadImportXml.addEventListener('click', () => {
            hydrateStoreFromDom();
            const artifact = compileExportOcmodImportXml(getState());
            downloadFile(artifact.content, artifact.filename, artifact.mimeType);
        });
    }

    const btnDownloadStylesXml = document.querySelector('#btnDownloadStylesXml');
    if (btnDownloadStylesXml) {
        btnDownloadStylesXml.addEventListener('click', () => {
            hydrateStoreFromDom();
            const artifact = compileExportOcmodStylesXml(getState());
            downloadFile(artifact.content, artifact.filename, artifact.mimeType);
        });
    }

    const btnExportZIP = document.querySelector('#btnExportZIP');
    if (btnExportZIP) {
        btnExportZIP.addEventListener('click', handleArticleZipDownload);
    }

    return {
        updateZipButtonsState,
        updateZipExportBtnState
    };
}


/* ============================================================
   Content Constructor — ui/mobile-layout.js
   Логика мобильного интерфейса, превью и палитры
   ============================================================ */

function initMobileLayout(options) {
    const updatePreview = options.updatePreview;

    const btnToggleFullscreen = document.querySelector('#btnToggleFullscreen');
    const btnHidePreview = document.querySelector('#btnHidePreview');
    const btnShowPreview = document.querySelector('#btnShowPreview');
    const previewPanel = document.querySelector('#previewPanel');
    const headerEl = document.querySelector('.header');
    const btnOpenNewWindow = document.querySelector('#btnOpenNewWindow');
    const btnTogglePalette = document.querySelector('#btnTogglePalette');
    const blockPalette = document.querySelector('#blockPalette');
    const btnToggleHeaderFields = document.querySelector('#btnToggleHeaderFields');
    const mobileActions = document.querySelector('.mobile-actions');
    const btnToggleActions = document.querySelector('#btnToggleActions');
    const mobileActionsMenu = document.querySelector('#mobileActionsMenu');

    const paletteOverlay = document.createElement('div');
    paletteOverlay.className = 'palette-overlay';
    document.body.appendChild(paletteOverlay);

    function syncMobileHeaderHeight() {
        if (!headerEl) {
            return;
        }

        document.documentElement.style.setProperty('--mobile-header-height', `${headerEl.offsetHeight}px`);
    }

    function resetPreviewFullscreen() {
        if (!previewPanel || !btnToggleFullscreen) {
            return;
        }

        previewPanel.classList.remove('fullscreen');
        const icon = btnToggleFullscreen.querySelector('i');
        if (icon) {
            icon.classList.replace('fa-compress', 'fa-expand');
        }
        btnToggleFullscreen.title = 'Развернуть на весь экран';
    }

    function setPreviewHidden(hidden) {
        document.body.classList.toggle('preview-hidden', hidden);

        if (window.innerWidth <= 991 || window.innerHeight <= 520) {
            document.body.classList.toggle('preview-mobile-open', !hidden);
        }

        if (btnHidePreview) {
            const icon = btnHidePreview.querySelector('i');
            const label = btnHidePreview.querySelector('.preview-toggle-label');

            if (hidden) {
                if (icon) {
                    icon.className = 'fa fa-eye';
                }
                if (label) {
                    label.textContent = 'Показать';
                }
                btnHidePreview.classList.add('is-hidden');
                btnHidePreview.title = 'Показать превью';
            } else {
                if (window.innerWidth <= 991 || window.innerHeight <= 520) {
                    if (icon) {
                        icon.className = 'fa fa-arrow-left';
                    }
                    if (label) {
                        label.textContent = 'В конструктор';
                    }
                } else {
                    if (icon) {
                        icon.className = 'fa fa-eye-slash';
                    }
                    if (label) {
                        label.textContent = 'Скрыть';
                    }
                }
                btnHidePreview.classList.remove('is-hidden');
                btnHidePreview.title = 'Скрыть превью';
            }
        }

        if (hidden) {
            resetPreviewFullscreen();
        } else if (typeof updatePreview === 'function') {
            updatePreview();
        }
    }

    if (btnToggleFullscreen && previewPanel) {
        btnToggleFullscreen.addEventListener('click', () => {
            const isFullscreen = previewPanel.classList.toggle('fullscreen');
            const icon = btnToggleFullscreen.querySelector('i');
            if (icon) {
                if (isFullscreen) {
                    icon.classList.replace('fa-expand', 'fa-compress');
                    btnToggleFullscreen.title = 'Свернуть превью';
                } else {
                    icon.classList.replace('fa-compress', 'fa-expand');
                    btnToggleFullscreen.title = 'Развернуть на весь экран';
                }
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && previewPanel.classList.contains('fullscreen')) {
                previewPanel.classList.remove('fullscreen');
                const icon = btnToggleFullscreen.querySelector('i');
                if (icon) {
                    icon.classList.replace('fa-compress', 'fa-expand');
                    btnToggleFullscreen.title = 'Развернуть на весь экран';
                }
            }
        });
    }

    if (btnHidePreview) {
        btnHidePreview.addEventListener('click', () => {
            setPreviewHidden(document.body.classList.contains('preview-hidden') === false);
        });
    }

    if (btnShowPreview) {
        btnShowPreview.addEventListener('click', () => {
            setPreviewHidden(document.body.classList.contains('preview-hidden') === false);
        });
    }

    if (btnOpenNewWindow) {
        btnOpenNewWindow.addEventListener('click', () => {
            if (typeof options.openPreviewWindow === 'function') {
                options.openPreviewWindow();
            }
        });
    }

    function closePalette() {
        if (blockPalette) {
            blockPalette.classList.remove('open');
        }
        paletteOverlay.classList.remove('open');
    }

    if (btnTogglePalette && blockPalette) {
        btnTogglePalette.addEventListener('click', () => {
            blockPalette.classList.toggle('open');
            paletteOverlay.classList.toggle('open');
        });

        paletteOverlay.addEventListener('click', closePalette);
    }

    function closeMobileActions() {
        if (mobileActions) {
            mobileActions.classList.remove('open');
        }
    }

    if (btnToggleActions && mobileActions) {
        btnToggleActions.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            mobileActions.classList.toggle('open');
        });
    }

    if (btnToggleHeaderFields) {
        btnToggleHeaderFields.addEventListener('click', (event) => {
            event.preventDefault();
            document.body.classList.toggle('mobile-header-fields-open');
            syncMobileHeaderHeight();
        });
    }

    if (mobileActionsMenu) {
        mobileActionsMenu.querySelectorAll('[data-forward-click]').forEach((item) => {
            item.addEventListener('click', () => {
                const target = document.querySelector(item.dataset.forwardClick);
                closeMobileActions();
                if (target) {
                    target.click();
                }
            });
        });
    }

    document.addEventListener('click', (event) => {
        if (mobileActions && !mobileActions.contains(event.target)) {
            closeMobileActions();
        }

        if (window.innerWidth <= 991 && blockPalette && blockPalette.classList.contains('open')) {
            if (!blockPalette.contains(event.target) && event.target !== btnTogglePalette && !btnTogglePalette.contains(event.target)) {
                closePalette();
            }
        }
    });

    syncMobileHeaderHeight();
    window.addEventListener('resize', syncMobileHeaderHeight);

    if (window.innerWidth <= 991 || window.innerHeight <= 520) {
        setPreviewHidden(true);
    }

    return {
        syncMobileHeaderHeight,
        setPreviewHidden,
        closePalette
    };
}


/* ============================================================
   Content Constructor — ui/help-modal.js
   Логика модального окна справки
   ============================================================ */

function initHelpModal(options) {
    const btnHelp = document.querySelector('#btnHelp');
    const helpModal = document.querySelector('#helpModal');
    const btnCloseHelp = document.querySelector('#btnCloseHelp');

    if (!btnHelp || !helpModal || !btnCloseHelp) {
        return;
    }

    const modalApi = bindBasicModal(helpModal, [btnCloseHelp], () => {
        if (options && typeof options.applyThemeToPreview === 'function') {
            options.applyThemeToPreview();
        }
    });

    btnHelp.addEventListener('click', modalApi.open);

    const helpTabsNav = helpModal.querySelector('.help-tabs-nav');
    if (helpTabsNav) {
        const tabBtns = helpTabsNav.querySelectorAll('.help-tab-btn');
        const tabContents = helpModal.querySelectorAll('.help-tab-content');

        tabBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-help-tab');

                tabBtns.forEach((item) => item.classList.remove('active'));
                btn.classList.add('active');

                tabContents.forEach((content) => {
                    content.style.display = content.id === targetTab ? 'block' : 'none';
                });
            });
        });
    }

    helpModal.addEventListener('click', (event) => {
        const tabBtn = event.target.closest('.help-example-box .article-tabs-nav [data-tab]');
        if (!tabBtn) {
            return;
        }

        const nav = tabBtn.parentNode;
        const wrapper = nav.parentNode;
        const panels = wrapper.querySelector('.article-tabs-panels');

        if (!nav || !panels) {
            return;
        }

        const idx = parseInt(tabBtn.getAttribute('data-tab'), 10);
        nav.querySelectorAll('[data-tab]').forEach((button) => button.classList.remove('active'));
        tabBtn.classList.add('active');

        Array.from(panels.children).forEach((panel, panelIndex) => {
            panel.style.display = panelIndex === idx ? 'block' : 'none';
        });
    });
}


/* ============================================================
   Content Constructor — ui/ai-assistant.js
   Логика AI Assistant modal
   ============================================================ */

function initAiAssistant(options) {
    const btnAiAssistant = document.querySelector('#btnAiAssistant');
    const aiAssistantModal = document.querySelector('#aiAssistantModal');
    const btnCloseAiAssistant = document.querySelector('#btnCloseAiAssistant');
    const btnCancelAiAssistant = document.querySelector('#btnCancelAiAssistant');
    const btnCopyAiPrompt = document.querySelector('#btnCopyAiPrompt');
    const aiInstructionInput = document.querySelector('#aiInstructionInput');

    if (!btnAiAssistant || !aiAssistantModal) {
        return;
    }

    const modalApi = bindBasicModal(aiAssistantModal, [btnCloseAiAssistant, btnCancelAiAssistant], () => {
        if (aiInstructionInput) {
            aiInstructionInput.value = '';
            aiInstructionInput.focus();
        }
    });

    btnAiAssistant.addEventListener('click', modalApi.open);

    if (!btnCopyAiPrompt || !aiInstructionInput) {
        return;
    }

    btnCopyAiPrompt.addEventListener('click', () => {
        const userInstruction = aiInstructionInput.value.trim();
        if (!userInstruction) {
            alert('Пожалуйста, введите инструкцию для AI');
            return;
        }

        if (options && typeof options.hydrateStoreFromDom === 'function') {
            options.hydrateStoreFromDom();
        }

        const currentJSON = JSON.stringify(
            serializeProject(projectStore.getState(), CC_SCHEMA_SPEC),
            null,
            2
        );

        const promptText = `Роль: Вы — профессиональный ассистент по подготовке контента и эксперт по работе с JSON-конструкторами страниц.
Ваша задача — обработать JSON-структуру страницы согласно инструкции пользователя.

Инструкция пользователя:
"${userInstruction}"

Правила для ответа:
1. Вы должны вернуть измененную JSON-структуру страницы.
2. Строго соблюдайте схему данных, описанную в объекте "ai_specification".
3. Не удаляйте существующие блоки, если этого прямо не требует инструкция пользователя.
4. Вы можете изменять тексты, добавлять новые блоки (heading, paragraph, list, quote, table, image, before-after, spoiler, tabs, product-card, grid) в массив "blocks".
5. У новых блоков поле "id" генерировать не нужно (или оставьте его пустым/пропустите), конструктор присвоит их автоматически при импорте.
6. В полях текстов вы можете использовать Markdown-разметку (жирный, курсив, ссылки).
7. Верните ТОЛЬКО валидный JSON-код в вашем ответе (желательно обернуть в \`\`\`json ... \`\`\`). Не добавляйте лишнего текста вне JSON, если это не требуется, но если добавите, конструктор всё равно попробует его отфильтровать.

Исходный JSON страницы для изменения:
\`\`\`json
${currentJSON}
\`\`\`
`;

        copyTextToClipboard(promptText).then(() => {
            if (options && typeof options.showToast === 'function') {
                options.showToast('Промпт скопирован для ChatGPT!');
            }
            modalApi.close();
        }).catch((error) => {
            console.error('Ошибка при копировании промпта:', error);
            alert('Не удалось скопировать промпт автоматически. Вы можете скопировать его вручную.');
        });
    });
}


/* ============================================================
   Content Constructor — ui/dragdrop.js
   Глобальные drag-and-drop цели рабочей области
   ============================================================ */

function initGlobalDragDrop(options) {
    const {
        blocksContainer,
        workspaceEmpty,
        dragState,
        getBlocks,
        setBlocks,
        findNestedBlock,
        renderBlocks,
        updatePreview
    } = options;

    if (!blocksContainer) {
        return;
    }

    blocksContainer.addEventListener('dragover', (event) => {
        if (dragState.dragging) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
        }
    });

    blocksContainer.addEventListener('drop', (event) => {
        if (event.target === blocksContainer || event.target === workspaceEmpty || event.target.classList.contains('blocks-container')) {
            event.preventDefault();
            const fromId = event.dataTransfer.getData('text/plain');
            const blocks = getBlocks();

            let movedBlock = null;
            const topIdx = blocks.findIndex((block) => block.id === fromId);
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
                blocks.push(movedBlock);
                setBlocks(blocks);
                renderBlocks();
                updatePreview();
            }
        }
    });
}


/* ============================================================
   Content Constructor — bootstrap.js
   Центр инициализации shell-логики приложения
   ============================================================ */

function initBuildIndicator() {
    const indicator = document.getElementById('buildIndicator');

    if (!indicator) {
        return;
    }

    const buildMeta = window.CONTENT_CONSTRUCTOR_BUILD || {};
    const version = buildMeta.version || 'unknown';
    const builtAt = buildMeta.builtAt || 'unknown';

    indicator.textContent = 'build: ' + version;
    indicator.title = 'Версия: ' + version + '\nСобрано: ' + builtAt;
}

function bootstrapAppShell(options) {
    initBuildIndicator();
    initHeaderDropdowns();

    const mobileLayout = initMobileLayout({
        updatePreview: options.updatePreview,
        openPreviewWindow: options.openPreviewWindow
    });

    initHelpModal({
        applyThemeToPreview: options.applyThemeToPreview
    });

    initAiAssistant({
        hydrateStoreFromDom: options.hydrateStoreFromDom,
        showToast: options.showToast
    });

    initDonateModalShell();

    initHeaderActions({
        titleInput: options.titleInput,
        slugInput: options.slugInput,
        updatePreview: options.updatePreview,
        syncHeaderToSession: options.syncHeaderToSession,
        importJSONContent: options.importJSONContent,
        importJSONFromClipboard: options.importJSONFromClipboard,
        exportJSONToClipboard: options.exportJSONToClipboard,
        showToast: options.showToast,
        hydrateStoreFromDom: options.hydrateStoreFromDom,
        downloadFile: options.downloadFile,
        getState: options.getState,
        handleZipDownload: options.handleZipDownload,
        handleArticleZipDownload: options.handleArticleZipDownload,
        updateZipButtonsState: options.updateZipButtonsState,
        updateZipExportBtnState: options.updateZipExportBtnState
    });

    initGlobalDragDrop({
        blocksContainer: options.blocksContainer,
        workspaceEmpty: options.workspaceEmpty,
        dragState: options.dragState,
        getBlocks: options.getBlocks,
        setBlocks: options.setBlocks,
        findNestedBlock: options.findNestedBlock,
        renderBlocks: options.renderBlocks,
        updatePreview: options.updatePreview
    });

    return {
        mobileLayout
    };
}

function initDonateModalShell() {
    const btnDonate = document.querySelector('#btnDonate');
    const donateModal = document.querySelector('#donateModal');
    const btnCloseDonate = document.querySelector('#btnCloseDonate');

    if (!btnDonate || !donateModal || !btnCloseDonate) {
        return;
    }

    const modalApi = bindBasicModal(donateModal, [btnCloseDonate]);
    btnDonate.addEventListener('click', modalApi.open);

    donateModal.querySelectorAll('.btn-copy-payment').forEach((btn) => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-copy-target');
            const targetEl = document.querySelector('#' + targetId);

            if (!targetEl) {
                return;
            }

            let text = targetEl.textContent.trim();
            if (targetId === 'valYoomoneyCard') {
                text = text.replace(/\s+/g, '');
            }

            copyTextToClipboard(text).then(() => {
                const icon = btn.querySelector('i');
                btn.classList.add('copied');
                if (icon) {
                    icon.className = 'fa fa-check';
                }

                setTimeout(() => {
                    btn.classList.remove('copied');
                    if (icon) {
                        icon.className = 'fa fa-clone';
                    }
                }, 2000);
            }).catch((error) => {
                console.error('Failed to copy: ', error);
            });
        });
    });
}




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


})();

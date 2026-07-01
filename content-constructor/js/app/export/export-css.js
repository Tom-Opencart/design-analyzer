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

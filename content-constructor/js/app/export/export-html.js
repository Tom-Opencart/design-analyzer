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

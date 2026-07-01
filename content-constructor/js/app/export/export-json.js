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

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

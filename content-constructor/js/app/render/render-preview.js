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

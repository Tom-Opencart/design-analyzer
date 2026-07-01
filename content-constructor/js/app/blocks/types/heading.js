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

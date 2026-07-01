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

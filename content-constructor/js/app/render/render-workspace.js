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

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

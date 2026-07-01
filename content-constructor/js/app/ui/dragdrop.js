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

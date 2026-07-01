/* ============================================================
   Content Constructor — blocks/registry.js
   Реестр типов блоков с поддержкой совместимости контрактов
   ============================================================ */

const BlockRegistry = {
    _blocks: {},
    
    register(blockDef) {
        if (!blockDef || !blockDef.type) {
            console.error("Invalid block definition registered", blockDef);
            return;
        }
        
        // Двусторонняя совместимость имен методов:
        // 1. Из нового контракта в старый (для legacy вызовов в app-entry.js)
        if (blockDef.renderEditor && !blockDef.editForm) {
            blockDef.editForm = blockDef.renderEditor;
        }
        if (blockDef.renderPreview && !blockDef.preview) {
            blockDef.preview = blockDef.renderPreview;
        }
        if (blockDef.renderHTML && !blockDef.toHTML) {
            blockDef.toHTML = blockDef.renderHTML;
        }
        
        // 2. Из старого контракта в новый (на будущее)
        if (blockDef.editForm && !blockDef.renderEditor) {
            blockDef.renderEditor = blockDef.editForm;
        }
        if (blockDef.preview && !blockDef.renderPreview) {
            blockDef.renderPreview = blockDef.preview;
        }
        if (blockDef.toHTML && !blockDef.renderHTML) {
            blockDef.renderHTML = blockDef.toHTML;
        }
        
        this._blocks[blockDef.type] = blockDef;
    },
    
    get(type) {
        return this._blocks[type];
    },
    
    getAll() {
        return this._blocks;
    }
};

/* ============================================================
   Content Constructor — state/autosave.js
   Сервис автосохранения проекта в localStorage
   ============================================================ */

const AUTOSAVE_KEY = 'constructor_autosave';

function saveAutosave(state) {
    try {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error('Failed to save autosave:', e);
    }
}

function loadAutosave() {
    try {
        const raw = localStorage.getItem(AUTOSAVE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function hasAutosave() {
    try {
        const raw = localStorage.getItem(AUTOSAVE_KEY);
        if (!raw) return false;
        const saved = JSON.parse(raw);
        return !!(saved && saved.timestamp && Array.isArray(saved.blocks) && saved.blocks.length > 0);
    } catch (e) {
        return false;
    }
}

function clearAutosave() {
    try {
        localStorage.removeItem(AUTOSAVE_KEY);
    } catch (e) {}
}

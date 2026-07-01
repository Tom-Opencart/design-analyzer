/* ============================================================
   Content Constructor — state/session-store.js
   Хранение сессионного состояния (sessionStorage/localStorage сайта)
   ============================================================ */

const PROJECT_SESSION_KEY = 'constructor_session';
const PROJECT_URL_KEY = 'constructor_site_url';

function loadProjectSession() {
    try {
        const raw = sessionStorage.getItem(PROJECT_SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
}

function saveProjectSession(data) {
    try {
        sessionStorage.setItem(PROJECT_SESSION_KEY, JSON.stringify(data));
    } catch (e) {}
}

function loadSavedUrl() {
    try { return localStorage.getItem(PROJECT_URL_KEY) || ''; } catch (e) { return ''; }
}

function saveSiteUrl(url) {
    try { localStorage.setItem(PROJECT_URL_KEY, url); } catch (e) {}
}

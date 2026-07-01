/**
 * localStorage wrapper module for Legal Pages Constructor.
 * @module storage
 */
const Storage = {
    /**
     * LocalStorage key constants.
     * @readonly
     * @enum {string}
     */
    KEYS: {
        SETTINGS: 'legal_constructor_settings',
        DOCUMENTS: 'legal_constructor_documents'
    },

    /**
     * Retrieve and parse a JSON value from localStorage.
     * @param {string} key - The localStorage key.
     * @returns {*} Parsed value or null if missing / unparseable.
     */
    get(key) {
        try {
            return JSON.parse(localStorage.getItem(key));
        } catch {
            return null;
        }
    },

    /**
     * Serialize a value to JSON and store it in localStorage.
     * @param {string} key - The localStorage key.
     * @param {*} value - Any JSON-serializable value.
     * @returns {boolean} True on success, false on failure.
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Remove an item from localStorage.
     * @param {string} key - The localStorage key.
     * @returns {boolean} True on success, false on failure.
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Get synchronized site URL from localStorage.
     * @returns {string|null}
     */
    getSiteUrl() {
        return localStorage.getItem('constructor_site_url');
    },

    /**
     * Save site URL to localStorage.
     * @param {string} url
     */
    saveSiteUrl(url) {
        if (url) {
            localStorage.setItem('constructor_site_url', url);
        } else {
            localStorage.removeItem('constructor_site_url');
        }
    },

    /**
     * Get saved constructor settings.
     * @returns {Object} Settings object or empty object if none exist.
     */
    getSettings() {
        const settings = this.get(this.KEYS.SETTINGS) || {};
        const siteUrl = this.getSiteUrl();
        if (siteUrl) {
            settings.site_name = siteUrl;
        }
        return settings;
    },

    /**
     * Persist constructor settings.
     * @param {Object} settings - Settings to save.
     * @returns {boolean} True on success, false on failure.
     */
    saveSettings(settings) {
        return this.set(this.KEYS.SETTINGS, settings);
    },

    /**
     * Get all saved documents.
     * @returns {Object} Documents map or empty object if none exist.
     */
    getDocuments() {
        return this.get(this.KEYS.DOCUMENTS) || {};
    },

    /**
     * Save a single document by id.
     * @param {string} docId - Document identifier.
     * @param {*} content - Document content to persist.
     * @returns {boolean} True on success, false on failure.
     */
    saveDocument(docId, content) {
        const docs = this.getDocuments();
        docs[docId] = content;
        return this.set(this.KEYS.DOCUMENTS, docs);
    },

    /**
     * Retrieve a single document by id.
     * @param {string} docId - Document identifier.
     * @returns {*|null} Document content or null if not found.
     */
    getDocument(docId) {
        const docs = this.getDocuments();
        return docs[docId] || null;
    },

    /**
     * Remove all constructor data from localStorage.
     */
    clear() {
        this.remove(this.KEYS.SETTINGS);
        this.remove(this.KEYS.DOCUMENTS);
    }
};

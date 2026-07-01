/* ============================================================
   Content Constructor — state/project-store.js
   Центральное хранилище состояния (Store Facade)
   ============================================================ */

let state = {
    title: '',
    slug: '',
    siteUrl: '',
    theme: {
        preset: 'default',
        accent: '#27272a',
        bg: '#f4f4f5',
        text: '#1A1A1A'
    },
    blocks: []
};

const projectStore = {
    getState() {
        return JSON.parse(JSON.stringify(state));
    },
    
    setState(nextState) {
        if (!nextState) return;
        
        state.title = nextState.title || '';
        state.slug = nextState.slug || '';
        
        if (nextState.siteUrl !== undefined) {
            state.siteUrl = nextState.siteUrl;
        } else if (nextState.project && nextState.project.siteUrl !== undefined) {
            state.siteUrl = nextState.project.siteUrl;
        } else {
            state.siteUrl = '';
        }
        
        if (nextState.theme) {
            state.theme.preset = nextState.theme.preset || 'default';
            state.theme.accent = nextState.theme.accent || '#27272a';
            state.theme.bg = nextState.theme.bg || '#f4f4f5';
            state.theme.text = nextState.theme.text || '#1A1A1A';
        }
        
        if (Array.isArray(nextState.blocks)) {
            state.blocks = JSON.parse(JSON.stringify(nextState.blocks));
        }
    },
    
    updateProjectMeta(patch) {
        if (patch.title !== undefined) state.title = patch.title;
        if (patch.slug !== undefined) state.slug = patch.slug;
        if (patch.siteUrl !== undefined) state.siteUrl = patch.siteUrl;
    },
    
    setBlocks(newBlocks) {
        if (Array.isArray(newBlocks)) {
            state.blocks = JSON.parse(JSON.stringify(newBlocks));
        }
    },
    
    getBlocks() {
        return state.blocks;
    }
};

function hydrateStoreFromDom() {
    const titleEl = document.getElementById('articleTitle');
    const domainEl = document.getElementById('articleDomain');
    const slugEl = document.getElementById('articleSlug');
    const themeSelectEl = document.getElementById('themeSelect');
    const colorAccentEl = document.getElementById('colorAccent');
    const colorBgEl = document.getElementById('colorBg');
    const colorTextEl = document.getElementById('colorText');
    
    const loadedState = {
        title: titleEl ? titleEl.value : '',
        slug: slugEl ? slugEl.value : '',
        siteUrl: domainEl ? domainEl.value : '',
        theme: {
            preset: themeSelectEl ? themeSelectEl.value : 'default',
            accent: colorAccentEl ? colorAccentEl.value : '#27272a',
            bg: colorBgEl ? colorBgEl.value : '#f4f4f5',
            text: colorTextEl ? colorTextEl.value : '#1A1A1A'
        },
        blocks: typeof blocks !== 'undefined' ? blocks : []
    };
    projectStore.setState(loadedState);
}

function applyStoreToDom() {
    const storeState = projectStore.getState();
    
    const titleEl = document.getElementById('articleTitle');
    const domainEl = document.getElementById('articleDomain');
    const slugEl = document.getElementById('articleSlug');
    
    if (titleEl) titleEl.value = storeState.title;
    if (domainEl) domainEl.value = storeState.siteUrl;
    if (slugEl) slugEl.value = storeState.slug;
    
    const themeSelectEl = document.getElementById('themeSelect');
    const colorAccentEl = document.getElementById('colorAccent');
    const colorBgEl = document.getElementById('colorBg');
    const colorTextEl = document.getElementById('colorText');
    
    if (themeSelectEl && storeState.theme.preset) themeSelectEl.value = storeState.theme.preset;
    if (colorAccentEl && storeState.theme.accent) colorAccentEl.value = storeState.theme.accent;
    if (colorBgEl && storeState.theme.bg) colorBgEl.value = storeState.theme.bg;
    if (colorTextEl && storeState.theme.text) colorTextEl.value = storeState.theme.text;
    
    // Keep legacy global blocks in sync
    if (typeof blocks !== 'undefined') {
        blocks = storeState.blocks;
    }
    
    // Apply theme UI
    if (typeof updateThemeSelectOptions === 'function') {
        updateThemeSelectOptions(storeState.theme.preset);
    }
    if (typeof updateThemeUI === 'function') {
        updateThemeUI();
    }
}

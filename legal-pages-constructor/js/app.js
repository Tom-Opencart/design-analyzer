/**
 * Main application logic for Legal Pages Constructor.
 * Manages UI interactions, settings updates, and constructor sync.
 * @module app
 */
const App = {
    /**
     * Initialize application
     */
    init() {
        UI.init();
        Editor.init();
        this.bindEvents();
        this.checkFirstVisit();
        this.updateAllDocuments();
    },

    /**
     * Bind all event handlers
     */
    bindEvents() {
        // Mobile hamburger menu
        this.initMobileSidebar();

        // Header Input Syncing (Instant update)
        const headerFullName = document.getElementById('headerFullName');
        if (headerFullName) {
            headerFullName.addEventListener('input', (e) => {
                const settings = Storage.getSettings();
                settings.full_name = e.target.value;
                Storage.saveSettings(settings);
                this.updateAllDocuments();
            });
        }

        const headerSiteName = document.getElementById('headerSiteName');
        if (headerSiteName) {
            headerSiteName.addEventListener('input', (e) => {
                const settings = Storage.getSettings();
                settings.site_name = e.target.value;
                Storage.saveSettings(settings);
                Storage.saveSiteUrl(e.target.value); // Cross-constructor sync!
                this.updateAllDocuments();
            });
        }

        // Settings modal triggers
        const openSettings = () => {
            UI.modal.show('settingsModal');
            this.populateSettingsForm();
        };

        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', openSettings);
        }

        const sidebarSettingsBtn = document.getElementById('sidebarSettingsBtn');
        if (sidebarSettingsBtn) {
            sidebarSettingsBtn.addEventListener('click', openSettings);
        }

        const settingsSave = document.getElementById('settingsSave');
        if (settingsSave) {
            settingsSave.addEventListener('click', () => {
                this.saveSettings();
            });
        }

        const settingsClose = document.getElementById('settingsClose');
        if (settingsClose) {
            settingsClose.addEventListener('click', () => {
                UI.modal.hide('settingsModal');
            });
        }

        // Donate buttons
        const donateBtn = document.getElementById('donateBtn');
        if (donateBtn) {
            donateBtn.addEventListener('click', () => {
                UI.modal.show('donateModal');
            });
        }

        const donateClose = document.getElementById('donateClose');
        if (donateClose) {
            donateClose.addEventListener('click', () => {
                UI.modal.hide('donateModal');
            });
        }

        const donateCloseBtn = document.getElementById('donateCloseBtn');
        if (donateCloseBtn) {
            donateCloseBtn.addEventListener('click', () => {
                UI.modal.hide('donateModal');
            });
        }

        // Copy HTML action
        const copyBtn = document.getElementById('copyBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                this.copyHtml();
            });
        }

        const sheetCopyBtn = document.getElementById('sheetCopyBtn');
        if (sheetCopyBtn) {
            sheetCopyBtn.addEventListener('click', () => {
                this.copyHtml();
            });
        }

        // Help notification (Help modal)
        const helpBtn = document.getElementById('helpBtn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                UI.modal.show('helpModal');
            });
        }

        const helpClose = document.getElementById('helpClose');
        if (helpClose) {
            helpClose.addEventListener('click', () => {
                UI.modal.hide('helpModal');
            });
        }

        const helpCloseBtn = document.getElementById('helpCloseBtn');
        if (helpCloseBtn) {
            helpCloseBtn.addEventListener('click', () => {
                UI.modal.hide('helpModal');
            });
        }

        // Navigation button to Content Constructor
        const btnNavArticle = document.getElementById('btnNavArticle');
        if (btnNavArticle) {
            btnNavArticle.addEventListener('click', () => {
                window.location.href = 'content_constructor.html';
            });
        }

        // Clipboard Copy buttons in Donate Modal
        document.querySelectorAll('.btn-copy-payment').forEach(btn => {
            btn.addEventListener('click', () => {
                const value = btn.getAttribute('data-value');
                navigator.clipboard.writeText(value).then(() => {
                    btn.classList.add('copied');
                    btn.innerHTML = '<i class="fa fa-check"></i>';
                    UI.toast.show('Реквизиты скопированы');
                    setTimeout(() => {
                        btn.classList.remove('copied');
                        btn.innerHTML = '<i class="fa fa-clone"></i>';
                    }, 2000);
                });
            });
        });
    },

    /**
     * Initialize mobile sidebar overlay
     */
    initMobileSidebar() {
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const overlay = document.getElementById('mobileSidebarOverlay');
        const sidebar = document.getElementById('mobileSidebar');
        const sidebarContent = document.getElementById('mobileSidebarContent');
        const sidebarClose = document.getElementById('mobileSidebarClose');

        if (!hamburgerBtn || !overlay || !sidebar || !sidebarContent) return;

        // Clone sidebar buttons into mobile overlay
        const desktopButtons = document.getElementById('docTabs');
        const desktopDonate = document.querySelector('.panel-support');
        if (desktopButtons) {
            sidebarContent.innerHTML = desktopButtons.innerHTML;
            // Remove duplicate IDs from cloned elements
            sidebarContent.querySelectorAll('[id]').forEach(el => {
                el.removeAttribute('id');
            });
            // Hide "Заполнить реквизиты" — settings accessible via header gear icon
            const settingsBtn = sidebarContent.querySelector('.block-btn:first-child');
            if (settingsBtn) {
                settingsBtn.style.display = 'none';
            }
            // Hide group titles for cleaner look
            sidebarContent.querySelectorAll('.palette-group-title').forEach(el => {
                el.style.display = 'none';
            });
            // Add donate button at the bottom
            if (desktopDonate) {
                const donateClone = desktopDonate.querySelector('.donate-btn');
                if (donateClone) {
                    const donateBtn = donateClone.cloneNode(true);
                    donateBtn.removeAttribute('id');
                    donateBtn.style.marginTop = 'auto';
                    donateBtn.style.flexShrink = '0';
                    sidebarContent.appendChild(donateBtn);
                    donateBtn.addEventListener('click', () => {
                        this.closeMobileSidebar();
                        UI.modal.show('donateModal');
                    });
                }
            }
            // Rebind click events for mobile buttons
            sidebarContent.querySelectorAll('.block-btn[data-doc]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const docId = btn.getAttribute('data-doc');
                    Editor.loadDocument(docId);
                    this.closeMobileSidebar();
                });
            });
            // Rebind nav button
            const mobileNavBtn = sidebarContent.querySelector('.block-btn--nav');
            if (mobileNavBtn) {
                mobileNavBtn.addEventListener('click', () => {
                    window.open('https://tom-opencart.github.io/opencart-content-constructor/', '_blank');
                });
            }
        }

        // Open sidebar
        hamburgerBtn.addEventListener('click', () => {
            this.openMobileSidebar();
        });

        // Close sidebar
        if (sidebarClose) {
            sidebarClose.addEventListener('click', () => {
                this.closeMobileSidebar();
            });
        }

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeMobileSidebar();
            }
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) {
                this.closeMobileSidebar();
            }
        });
    },

    openMobileSidebar() {
        const overlay = document.getElementById('mobileSidebarOverlay');
        if (overlay) {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    closeMobileSidebar() {
        const overlay = document.getElementById('mobileSidebarOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    /**
     * Check if settings exist, show modal if first visit
     */
    checkFirstVisit() {
        const settings = Storage.getSettings();
        if (!settings.full_name) {
            UI.modal.show('settingsModal');
        } else {
            this.populateHeaderInputs();
        }
    },

    /**
     * Populate inputs in the header directly from Storage
     */
    populateHeaderInputs() {
        const settings = Storage.getSettings();
        const headerFullName = document.getElementById('headerFullName');
        const headerSiteName = document.getElementById('headerSiteName');

        if (headerFullName) {
            headerFullName.value = settings.full_name || '';
        }
        if (headerSiteName) {
            headerSiteName.value = settings.site_name || '';
        }
    },

    /**
     * Populate settings form inside modal with saved data
     */
    populateSettingsForm() {
        const settings = Storage.getSettings();
        const form = document.getElementById('settingsForm');

        if (!form) return;

        // Populate all fields cleanly (works for inputs and selects)
        Object.keys(settings).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = settings[key];
            }
        });
    },

    /**
     * Save settings from form, sync header and update docs
     */
    saveSettings() {
        const form = document.getElementById('settingsForm');
        if (!form) return;

        const formData = new FormData(form);
        const settings = {};

        formData.forEach((value, key) => {
            settings[key] = value;
        });

        // Save settings
        Storage.saveSettings(settings);
        Storage.saveSiteUrl(settings.site_name); // Sync with other constructor!

        // Update header fields
        this.populateHeaderInputs();

        // Update active editor document & preview
        this.updateAllDocuments();

        // Hide settings modal
        UI.modal.hide('settingsModal');
        UI.toast.show('Настройки сохранены');
    },

    /**
     * Update dynamic contents in the editor
     */
    updateAllDocuments() {
        const settings = Storage.getSettings();
        if (typeof Editor !== 'undefined' && Editor.element) {
            Editor.updateSettingsInEditor(settings);
        }
    },

    /**
     * Copy rendered HTML to clipboard
     */
    async copyHtml() {
        const html = Editor.getRenderedHtml();
        try {
            await navigator.clipboard.writeText(html);
            UI.toast.show('HTML-код успешно скопирован');
            this.showCopyFeedback();
        } catch {
            try {
                const textarea = document.createElement('textarea');
                textarea.value = html;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                UI.toast.show('HTML-код успешно скопирован');
                this.showCopyFeedback();
            } catch {
                UI.toast.show('Ошибка копирования кода');
            }
        }
    },

    /**
     * Show temporary copy feedback on copy buttons
     */
    showCopyFeedback() {
        const copyBtn = document.getElementById('copyBtn');
        if (copyBtn) {
            const originalHtml = copyBtn.innerHTML;
            copyBtn.classList.add('btn-copied');
            copyBtn.innerHTML = '<i class="fa fa-check"></i> Скопировано!';
            setTimeout(() => {
                copyBtn.classList.remove('btn-copied');
                copyBtn.innerHTML = originalHtml;
            }, 2000);
        }

        const sheetCopyBtn = document.getElementById('sheetCopyBtn');
        if (sheetCopyBtn) {
            sheetCopyBtn.classList.add('btn-copied');
            sheetCopyBtn.innerHTML = '<i class="fa fa-check"></i>';
            setTimeout(() => {
                sheetCopyBtn.classList.remove('btn-copied');
                sheetCopyBtn.innerHTML = '<i class="fa fa-clone"></i>';
            }, 2000);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());

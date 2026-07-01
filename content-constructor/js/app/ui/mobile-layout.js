/* ============================================================
   Content Constructor — ui/mobile-layout.js
   Логика мобильного интерфейса, превью и палитры
   ============================================================ */

function initMobileLayout(options) {
    const updatePreview = options.updatePreview;

    const btnToggleFullscreen = document.querySelector('#btnToggleFullscreen');
    const btnHidePreview = document.querySelector('#btnHidePreview');
    const btnShowPreview = document.querySelector('#btnShowPreview');
    const previewPanel = document.querySelector('#previewPanel');
    const headerEl = document.querySelector('.header');
    const btnOpenNewWindow = document.querySelector('#btnOpenNewWindow');
    const btnTogglePalette = document.querySelector('#btnTogglePalette');
    const blockPalette = document.querySelector('#blockPalette');
    const btnToggleHeaderFields = document.querySelector('#btnToggleHeaderFields');
    const mobileActions = document.querySelector('.mobile-actions');
    const btnToggleActions = document.querySelector('#btnToggleActions');
    const mobileActionsMenu = document.querySelector('#mobileActionsMenu');

    const paletteOverlay = document.createElement('div');
    paletteOverlay.className = 'palette-overlay';
    document.body.appendChild(paletteOverlay);

    function syncMobileHeaderHeight() {
        if (!headerEl) {
            return;
        }

        document.documentElement.style.setProperty('--mobile-header-height', `${headerEl.offsetHeight}px`);
    }

    function resetPreviewFullscreen() {
        if (!previewPanel || !btnToggleFullscreen) {
            return;
        }

        previewPanel.classList.remove('fullscreen');
        const icon = btnToggleFullscreen.querySelector('i');
        if (icon) {
            icon.classList.replace('fa-compress', 'fa-expand');
        }
        btnToggleFullscreen.title = 'Развернуть на весь экран';
    }

    function setPreviewHidden(hidden) {
        document.body.classList.toggle('preview-hidden', hidden);

        if (window.innerWidth <= 991 || window.innerHeight <= 520) {
            document.body.classList.toggle('preview-mobile-open', !hidden);
        }

        if (btnHidePreview) {
            const icon = btnHidePreview.querySelector('i');
            const label = btnHidePreview.querySelector('.preview-toggle-label');

            if (hidden) {
                if (icon) {
                    icon.className = 'fa fa-eye';
                }
                if (label) {
                    label.textContent = 'Показать';
                }
                btnHidePreview.classList.add('is-hidden');
                btnHidePreview.title = 'Показать превью';
            } else {
                if (window.innerWidth <= 991 || window.innerHeight <= 520) {
                    if (icon) {
                        icon.className = 'fa fa-arrow-left';
                    }
                    if (label) {
                        label.textContent = 'В конструктор';
                    }
                } else {
                    if (icon) {
                        icon.className = 'fa fa-eye-slash';
                    }
                    if (label) {
                        label.textContent = 'Скрыть';
                    }
                }
                btnHidePreview.classList.remove('is-hidden');
                btnHidePreview.title = 'Скрыть превью';
            }
        }

        if (hidden) {
            resetPreviewFullscreen();
        } else if (typeof updatePreview === 'function') {
            updatePreview();
        }
    }

    if (btnToggleFullscreen && previewPanel) {
        btnToggleFullscreen.addEventListener('click', () => {
            const isFullscreen = previewPanel.classList.toggle('fullscreen');
            const icon = btnToggleFullscreen.querySelector('i');
            if (icon) {
                if (isFullscreen) {
                    icon.classList.replace('fa-expand', 'fa-compress');
                    btnToggleFullscreen.title = 'Свернуть превью';
                } else {
                    icon.classList.replace('fa-compress', 'fa-expand');
                    btnToggleFullscreen.title = 'Развернуть на весь экран';
                }
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && previewPanel.classList.contains('fullscreen')) {
                previewPanel.classList.remove('fullscreen');
                const icon = btnToggleFullscreen.querySelector('i');
                if (icon) {
                    icon.classList.replace('fa-compress', 'fa-expand');
                    btnToggleFullscreen.title = 'Развернуть на весь экран';
                }
            }
        });
    }

    if (btnHidePreview) {
        btnHidePreview.addEventListener('click', () => {
            setPreviewHidden(document.body.classList.contains('preview-hidden') === false);
        });
    }

    if (btnShowPreview) {
        btnShowPreview.addEventListener('click', () => {
            setPreviewHidden(document.body.classList.contains('preview-hidden') === false);
        });
    }

    if (btnOpenNewWindow) {
        btnOpenNewWindow.addEventListener('click', () => {
            if (typeof options.openPreviewWindow === 'function') {
                options.openPreviewWindow();
            }
        });
    }

    function closePalette() {
        if (blockPalette) {
            blockPalette.classList.remove('open');
        }
        paletteOverlay.classList.remove('open');
    }

    if (btnTogglePalette && blockPalette) {
        btnTogglePalette.addEventListener('click', () => {
            blockPalette.classList.toggle('open');
            paletteOverlay.classList.toggle('open');
        });

        paletteOverlay.addEventListener('click', closePalette);
    }

    function closeMobileActions() {
        if (mobileActions) {
            mobileActions.classList.remove('open');
        }
    }

    if (btnToggleActions && mobileActions) {
        btnToggleActions.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            mobileActions.classList.toggle('open');
        });
    }

    if (btnToggleHeaderFields) {
        btnToggleHeaderFields.addEventListener('click', (event) => {
            event.preventDefault();
            document.body.classList.toggle('mobile-header-fields-open');
            syncMobileHeaderHeight();
        });
    }

    if (mobileActionsMenu) {
        mobileActionsMenu.querySelectorAll('[data-forward-click]').forEach((item) => {
            item.addEventListener('click', () => {
                const target = document.querySelector(item.dataset.forwardClick);
                closeMobileActions();
                if (target) {
                    target.click();
                }
            });
        });
    }

    document.addEventListener('click', (event) => {
        if (mobileActions && !mobileActions.contains(event.target)) {
            closeMobileActions();
        }

        if (window.innerWidth <= 991 && blockPalette && blockPalette.classList.contains('open')) {
            if (!blockPalette.contains(event.target) && event.target !== btnTogglePalette && !btnTogglePalette.contains(event.target)) {
                closePalette();
            }
        }
    });

    syncMobileHeaderHeight();
    window.addEventListener('resize', syncMobileHeaderHeight);

    if (window.innerWidth <= 991 || window.innerHeight <= 520) {
        setPreviewHidden(true);
    }

    return {
        syncMobileHeaderHeight,
        setPreviewHidden,
        closePalette
    };
}

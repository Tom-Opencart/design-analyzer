/* ============================================================
   Content Constructor — bootstrap.js
   Центр инициализации shell-логики приложения
   ============================================================ */

function initBuildIndicator() {
    const indicator = document.getElementById('buildIndicator');

    if (!indicator) {
        return;
    }

    const buildMeta = window.CONTENT_CONSTRUCTOR_BUILD || {};
    const version = buildMeta.version || 'unknown';
    const builtAt = buildMeta.builtAt || 'unknown';

    indicator.textContent = 'build: ' + version;
    indicator.title = 'Версия: ' + version + '\nСобрано: ' + builtAt;
}

function bootstrapAppShell(options) {
    initBuildIndicator();
    initHeaderDropdowns();

    const mobileLayout = initMobileLayout({
        updatePreview: options.updatePreview,
        openPreviewWindow: options.openPreviewWindow
    });

    initHelpModal({
        applyThemeToPreview: options.applyThemeToPreview
    });

    initAiAssistant({
        hydrateStoreFromDom: options.hydrateStoreFromDom,
        showToast: options.showToast
    });

    initDonateModalShell();

    initHeaderActions({
        titleInput: options.titleInput,
        slugInput: options.slugInput,
        updatePreview: options.updatePreview,
        syncHeaderToSession: options.syncHeaderToSession,
        importJSONContent: options.importJSONContent,
        importJSONFromClipboard: options.importJSONFromClipboard,
        exportJSONToClipboard: options.exportJSONToClipboard,
        showToast: options.showToast,
        hydrateStoreFromDom: options.hydrateStoreFromDom,
        downloadFile: options.downloadFile,
        getState: options.getState,
        handleZipDownload: options.handleZipDownload,
        handleArticleZipDownload: options.handleArticleZipDownload,
        updateZipButtonsState: options.updateZipButtonsState,
        updateZipExportBtnState: options.updateZipExportBtnState
    });

    initGlobalDragDrop({
        blocksContainer: options.blocksContainer,
        workspaceEmpty: options.workspaceEmpty,
        dragState: options.dragState,
        getBlocks: options.getBlocks,
        setBlocks: options.setBlocks,
        findNestedBlock: options.findNestedBlock,
        renderBlocks: options.renderBlocks,
        updatePreview: options.updatePreview
    });

    return {
        mobileLayout
    };
}

function initDonateModalShell() {
    const btnDonate = document.querySelector('#btnDonate');
    const donateModal = document.querySelector('#donateModal');
    const btnCloseDonate = document.querySelector('#btnCloseDonate');

    if (!btnDonate || !donateModal || !btnCloseDonate) {
        return;
    }

    const modalApi = bindBasicModal(donateModal, [btnCloseDonate]);
    btnDonate.addEventListener('click', modalApi.open);

    donateModal.querySelectorAll('.btn-copy-payment').forEach((btn) => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-copy-target');
            const targetEl = document.querySelector('#' + targetId);

            if (!targetEl) {
                return;
            }

            let text = targetEl.textContent.trim();
            if (targetId === 'valYoomoneyCard') {
                text = text.replace(/\s+/g, '');
            }

            copyTextToClipboard(text).then(() => {
                const icon = btn.querySelector('i');
                btn.classList.add('copied');
                if (icon) {
                    icon.className = 'fa fa-check';
                }

                setTimeout(() => {
                    btn.classList.remove('copied');
                    if (icon) {
                        icon.className = 'fa fa-clone';
                    }
                }, 2000);
            }).catch((error) => {
                console.error('Failed to copy: ', error);
            });
        });
    });
}

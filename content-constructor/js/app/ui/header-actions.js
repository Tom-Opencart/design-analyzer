/* ============================================================
   Content Constructor — ui/header-actions.js
   Логика действий шапки и файловых операций пользователя
   ============================================================ */

function initHeaderActions(options) {
    const {
        titleInput,
        slugInput,
        updatePreview,
        syncHeaderToSession,
        importJSONContent,
        importJSONFromClipboard,
        exportJSONToClipboard,
        showToast,
        hydrateStoreFromDom,
        downloadFile,
        getState,
        handleZipDownload,
        handleArticleZipDownload,
        updateZipButtonsState,
        updateZipExportBtnState
    } = options;

    const btnCopyHTML = document.querySelector('#btnCopyHTML');
    if (btnCopyHTML) {
        btnCopyHTML.addEventListener('click', () => {
            hydrateStoreFromDom();
            const artifact = compileExportHtml(getState());
            const cleanHTML = artifact.content.split('\n<!-- CONSTRUCTOR_JSON')[0];

            navigator.clipboard.writeText(cleanHTML).then(() => {
                showToast('HTML-код статьи скопирован!');
                const icon = btnCopyHTML.querySelector('i');
                const title = btnCopyHTML.querySelector('.item-title');
                if (icon && title) {
                    const originalIconClass = icon.className;
                    const originalTitle = title.textContent;
                    icon.className = 'fa fa-check';
                    icon.style.color = '#27272a';
                    title.textContent = 'Скопировано!';
                    setTimeout(() => {
                        icon.className = originalIconClass;
                        icon.style.color = '#27272a';
                        title.textContent = originalTitle;
                    }, 2000);
                }
            }).catch((error) => {
                console.error('Не удалось скопировать текст: ', error);
                alert('Не удалось скопировать автоматически. Скопируйте код из экспортированного файла.');
            });
        });
    }

    const btnCopySlug = document.querySelector('#btnCopySlug');
    if (btnCopySlug && slugInput) {
        btnCopySlug.addEventListener('click', () => {
            const slug = slugInput.value.trim();
            if (!slug) {
                return;
            }
            navigator.clipboard.writeText(slug).then(() => {
                btnCopySlug.classList.add('copied');
                btnCopySlug.innerHTML = '<i class="fa fa-check"></i>';
                setTimeout(() => {
                    btnCopySlug.classList.remove('copied');
                    btnCopySlug.innerHTML = '<i class="fa fa-clone"></i>';
                }, 2000);
            }).catch(() => {
                alert('Не удалось скопировать slug.');
            });
        });
    }

    if (titleInput) {
        titleInput.addEventListener('input', () => {
            if (slugInput) {
                slugInput.value = slugify(titleInput.value);
            }
            syncHeaderToSession();
        });
    }

    if (slugInput) {
        slugInput.addEventListener('input', syncHeaderToSession);
    }

    const domainInput = document.querySelector('#articleDomain');
    if (domainInput) {
        domainInput.addEventListener('input', () => {
            updatePreview();
            syncHeaderToSession();
        });
    }

    const btnExportTXT = document.querySelector('#btnExportTXT');
    if (btnExportTXT) {
        btnExportTXT.addEventListener('click', () => {
            hydrateStoreFromDom();
            const artifact = compileExportHtml(getState());
            downloadFile(artifact.content, artifact.filename, artifact.mimeType);
        });
    }

    const btnExportCSS = document.querySelector('#btnExportCSS');
    if (btnExportCSS) {
        btnExportCSS.addEventListener('click', () => {
            hydrateStoreFromDom();
            const artifact = compileExportCss(getState());
            downloadFile(artifact.content, artifact.filename, artifact.mimeType);
        });
    }

    const btnExportJSON = document.querySelector('#btnExportJSON');
    if (btnExportJSON) {
        btnExportJSON.addEventListener('click', () => {
            hydrateStoreFromDom();
            const artifact = compileExportJson(getState());
            downloadFile(artifact.content, artifact.filename, artifact.mimeType);
        });
    }

    const btnImportJSON = document.querySelector('#btnImportJSON');
    const importFileInput = document.querySelector('#importFile');
    if (btnImportJSON && importFileInput) {
        btnImportJSON.addEventListener('click', () => {
            importFileInput.click();
        });

        importFileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) {
                return;
            }

            const reader = new FileReader();
            reader.onload = function(fileEvent) {
                importJSONContent(fileEvent.target.result, false);
                event.target.value = '';
            };
            reader.readAsText(file);
        });
    }

    const btnClipboardCopyJSON = document.querySelector('#btnClipboardCopyJSON');
    if (btnClipboardCopyJSON) {
        btnClipboardCopyJSON.addEventListener('click', exportJSONToClipboard);
    }

    const btnClipboardPasteJSON = document.querySelector('#btnClipboardPasteJSON');
    if (btnClipboardPasteJSON) {
        btnClipboardPasteJSON.addEventListener('click', importJSONFromClipboard);
    }

    const btnAiImport = document.querySelector('#btnAiImport');
    if (btnAiImport) {
        btnAiImport.addEventListener('click', importJSONFromClipboard);
    }

    const btnDownloadZip = document.querySelector('#btnDownloadZip');
    const btnDownloadZipDropdown = document.querySelector('#btnDownloadZipDropdown');
    if (btnDownloadZip) {
        btnDownloadZip.addEventListener('click', handleZipDownload);
    }
    if (btnDownloadZipDropdown) {
        btnDownloadZipDropdown.addEventListener('click', handleZipDownload);
    }

    const btnDownloadImportXml = document.querySelector('#btnDownloadImportXml');
    if (btnDownloadImportXml) {
        btnDownloadImportXml.addEventListener('click', () => {
            hydrateStoreFromDom();
            const artifact = compileExportOcmodImportXml(getState());
            downloadFile(artifact.content, artifact.filename, artifact.mimeType);
        });
    }

    const btnDownloadStylesXml = document.querySelector('#btnDownloadStylesXml');
    if (btnDownloadStylesXml) {
        btnDownloadStylesXml.addEventListener('click', () => {
            hydrateStoreFromDom();
            const artifact = compileExportOcmodStylesXml(getState());
            downloadFile(artifact.content, artifact.filename, artifact.mimeType);
        });
    }

    const btnExportZIP = document.querySelector('#btnExportZIP');
    if (btnExportZIP) {
        btnExportZIP.addEventListener('click', handleArticleZipDownload);
    }

    return {
        updateZipButtonsState,
        updateZipExportBtnState
    };
}

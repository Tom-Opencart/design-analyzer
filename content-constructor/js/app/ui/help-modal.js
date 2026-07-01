/* ============================================================
   Content Constructor — ui/help-modal.js
   Логика модального окна справки
   ============================================================ */

function initHelpModal(options) {
    const btnHelp = document.querySelector('#btnHelp');
    const helpModal = document.querySelector('#helpModal');
    const btnCloseHelp = document.querySelector('#btnCloseHelp');

    if (!btnHelp || !helpModal || !btnCloseHelp) {
        return;
    }

    const modalApi = bindBasicModal(helpModal, [btnCloseHelp], () => {
        if (options && typeof options.applyThemeToPreview === 'function') {
            options.applyThemeToPreview();
        }
    });

    btnHelp.addEventListener('click', modalApi.open);

    const helpTabsNav = helpModal.querySelector('.help-tabs-nav');
    if (helpTabsNav) {
        const tabBtns = helpTabsNav.querySelectorAll('.help-tab-btn');
        const tabContents = helpModal.querySelectorAll('.help-tab-content');

        tabBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-help-tab');

                tabBtns.forEach((item) => item.classList.remove('active'));
                btn.classList.add('active');

                tabContents.forEach((content) => {
                    content.style.display = content.id === targetTab ? 'block' : 'none';
                });
            });
        });
    }

    helpModal.addEventListener('click', (event) => {
        const tabBtn = event.target.closest('.help-example-box .article-tabs-nav [data-tab]');
        if (!tabBtn) {
            return;
        }

        const nav = tabBtn.parentNode;
        const wrapper = nav.parentNode;
        const panels = wrapper.querySelector('.article-tabs-panels');

        if (!nav || !panels) {
            return;
        }

        const idx = parseInt(tabBtn.getAttribute('data-tab'), 10);
        nav.querySelectorAll('[data-tab]').forEach((button) => button.classList.remove('active'));
        tabBtn.classList.add('active');

        Array.from(panels.children).forEach((panel, panelIndex) => {
            panel.style.display = panelIndex === idx ? 'block' : 'none';
        });
    });
}

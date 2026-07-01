/* ============================================================
   Content Constructor — ui/modals.js
   Базовые UI-хелперы для модальных окон и копирования
   ============================================================ */

function bindBasicModal(modal, closeButtons, onOpen) {
    if (!modal) {
        return null;
    }

    function openModal() {
        modal.style.display = 'flex';
        if (typeof onOpen === 'function') {
            onOpen();
        }
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    (closeButtons || []).forEach((button) => {
        if (button) {
            button.addEventListener('click', closeModal);
        }
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    return {
        open: openModal,
        close: closeModal
    };
}

function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return Promise.resolve();
    } catch (error) {
        document.body.removeChild(textarea);
        return Promise.reject(error);
    }
}

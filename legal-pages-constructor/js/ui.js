const UI = {
  modal: {
    show(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('modal--active');
        document.body.style.overflow = 'hidden';
      }
    },
    hide(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove('modal--active');
        document.body.style.overflow = '';
      }
    },
    toggle(modalId) {
      const modal = document.getElementById(modalId);
      if (modal && modal.classList.contains('modal--active')) {
        this.hide(modalId);
      } else {
        this.show(modalId);
      }
    },
    init() {
      document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) {
            overlay.classList.remove('modal--active');
            document.body.style.overflow = '';
          }
        });
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const activeModal = document.querySelector('.modal-overlay.modal--active');
          if (activeModal) {
            activeModal.classList.remove('modal--active');
            document.body.style.overflow = '';
          }
        }
      });
    }
  },

  tabs: {
    currentTab: 'offer',

    switchTo(tabId) {
      document.querySelectorAll('.block-btn[data-doc]').forEach(btn => {
        btn.classList.toggle('block-btn--active', btn.dataset.doc === tabId);
      });

      this.currentTab = tabId;

      const titleEl = document.getElementById('editorTitle');
      if (titleEl && typeof Documents !== 'undefined' && Documents.get) {
        const doc = Documents.get(tabId);
        if (doc) {
          titleEl.textContent = doc.title;
        }
      }

      if (typeof Editor !== 'undefined' && Editor.loadDocument) {
        Editor.loadDocument(tabId);
      }
    },

    init() {
      document.querySelectorAll('.block-btn[data-doc]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.switchTo(btn.dataset.doc);
        });
      });
    }
  },

  toast: {
    timeout: null,

    show(message, duration = 3000) {
      const toastText = document.getElementById('toastText');
      const toast = document.getElementById('toast');
      if (!toastText || !toast) return;

      toastText.textContent = message;
      toast.classList.add('toast--active');

      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      this.timeout = setTimeout(() => {
        toast.classList.remove('toast--active');
      }, duration);
    },

    hide() {
      const toast = document.getElementById('toast');
      if (toast) {
        toast.classList.remove('toast--active');
      }
    }
  },

  init() {
    this.modal.init();
    this.tabs.init();
  }
};

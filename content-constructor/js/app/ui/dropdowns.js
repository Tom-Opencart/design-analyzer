/* ============================================================
   Content Constructor — ui/dropdowns.js
   Логика выпадающих меню в шапке
   ============================================================ */

function initHeaderDropdowns() {
    const dropdowns = [
        { el: document.querySelector('#importAiDropdown'), btn: document.querySelector('#importAiDropdown .btn') },
        { el: document.querySelector('#downloadDropdown'), btn: document.querySelector('#downloadDropdown .btn') }
    ];

    dropdowns.forEach((dropdown) => {
        if (!dropdown.el || !dropdown.btn) {
            return;
        }

        dropdown.btn.addEventListener('click', () => {
            dropdowns.forEach((other) => {
                if (other.el && other.el !== dropdown.el) {
                    other.el.classList.remove('active');
                }
            });

            dropdown.el.classList.toggle('active');
        });

        dropdown.el.addEventListener('click', (event) => {
            event.stopPropagation();
        });

        dropdown.el.querySelectorAll('.header-dropdown-item').forEach((item) => {
            item.addEventListener('click', () => {
                dropdown.el.classList.remove('active');
            });
        });
    });

    document.addEventListener('click', () => {
        dropdowns.forEach((dropdown) => {
            if (dropdown.el) {
                dropdown.el.classList.remove('active');
            }
        });
    });
}

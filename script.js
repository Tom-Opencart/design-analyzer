document.addEventListener('DOMContentLoaded', function() {
    const websiteInput = document.getElementById('websiteInput');
    const checkButton = document.getElementById('checkButton');
    const resultMessage = document.getElementById('resultMessage');
    const checkerModal = document.getElementById('checkerModal');

    const SITES_JSON_URL = 'https://raw.githubusercontent.com/beschasny/warez.rip/main/data/sites.json';

    let db = { pirated: [], safe: [], known: [], dataUpdated: '' };
    let dbLoaded = false;

    // Загружаем базу из warez.rip GitHub
    fetch(SITES_JSON_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            db.pirated = (data.pirated || []).map(s => s.toLowerCase().trim());
            db.safe    = (data.safe    || []).map(s => s.toLowerCase().trim());
            db.known   = (data.known   || []).map(s => s.toLowerCase().trim());
            db.dataUpdated = data.dataUpdated || '';
            dbLoaded = true;
            console.log(`База warez.rip загружена (обновлена: ${db.dataUpdated}). Пиратских сайтов: ${db.pirated.length}`);

            // Показываем дату обновления базы под кнопкой
            const dbInfo = document.getElementById('dbInfo');
            if (dbInfo && db.dataUpdated) {
                dbInfo.textContent = `База warez.rip обновлена: ${db.dataUpdated} · Пиратских сайтов: ${db.pirated.length}`;
                dbInfo.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Ошибка при загрузке базы warez.rip:', error);
            resultMessage.innerHTML = '<div class="alert alert-danger">Не удалось загрузить базу данных. Проверьте соединение с интернетом.</div>';
            checkButton.disabled = true;
        });

    checkButton.addEventListener('click', function() {
        if (!dbLoaded) {
            resultMessage.innerHTML = '<div class="alert alert-warning">База данных ещё загружается. Подождите секунду.</div>';
            return;
        }

        const url = websiteInput.value.trim();
        if (url === '') {
            resultMessage.innerHTML = '<div class="alert alert-warning">Пожалуйста, введите URL.</div>';
            return;
        }

        try {
            // Парсим URL и нормализуем hostname
            const parsedUrl = new URL(url.startsWith('http://') || url.startsWith('https://') ? url : `http://${url}`);
            let hostname = parsedUrl.hostname.toLowerCase();

            // Убираем www.
            if (hostname.startsWith('www.')) {
                hostname = hostname.substring(4);
            }

            console.log('Проверяем:', hostname);

            if (db.pirated.includes(hostname)) {
                // ⛔ Найден в списке варезных сайтов
                resultMessage.innerHTML = `
                    <div class="alert alert-danger">
                        <strong><i class="fas fa-ban me-2"></i>${hostname}</strong> — обнаружен в базе пиратских сайтов warez.rip.<br>
                        <small class="opacity-75">Этот ресурс распространяет нелицензионные расширения и шаблоны OpenCart.</small>
                    </div>`;
            } else if (db.safe.includes(hostname)) {
                // ✅ Проверенный безопасный ресурс
                resultMessage.innerHTML = `
                    <div class="alert alert-success">
                        <strong><i class="fas fa-check-circle me-2"></i>${hostname}</strong> — проверенный ресурс.<br>
                        <small class="opacity-75">Этот сайт входит в список надёжных OpenCart-площадок.</small>
                    </div>`;
            } else if (db.known.includes(hostname)) {
                // ✅ Известный сайт (не OpenCart-специфичный)
                resultMessage.innerHTML = `
                    <div class="alert alert-success">
                        <strong><i class="fas fa-check-circle me-2"></i>${hostname}</strong> — известный сайт, не замечен в пиратстве.
                    </div>`;
            } else {
                // ⚠️ Не найден в базе
                resultMessage.innerHTML = `
                    <div class="alert alert-warning">
                        <strong><i class="fas fa-question-circle me-2"></i>${hostname}</strong> — не найден в базе warez.rip.<br>
                        <small class="opacity-75">Это не означает, что сайт безопасен — его просто нет в базе данных.</small>
                    </div>`;
            }

        } catch (e) {
            resultMessage.innerHTML = '<div class="alert alert-danger">Неверный формат URL. Пожалуйста, введите корректный URL.</div>';
            console.error('Ошибка парсинга URL:', e);
        }
    });

    // Enter для проверки
    websiteInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') checkButton.click();
    });

    // Очищаем при закрытии модального окна
    if (checkerModal) {
        checkerModal.addEventListener('hidden.bs.modal', function () {
            websiteInput.value = '';
            resultMessage.innerHTML = '';
        });
    }
});
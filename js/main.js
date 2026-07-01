/* ============================================================
   Main JS — opencartforum.com.ru
   ============================================================ */

/* ---- Component Loader ---- */
async function loadComponents() {
    var placeholders = document.querySelectorAll('[data-include]');
    var promises = Array.from(placeholders).map(async function (el) {
        var file = el.getAttribute('data-include');
        try {
            var resp = await fetch(file);
            if (resp.ok) {
                el.innerHTML = await resp.text();
            } else {
                console.warn('Component load failed:', file, resp.status);
            }
        } catch (e) {
            console.warn('Component load error:', file, e);
        }
    });
    await Promise.all(promises);

    // Highlight active nav link
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.site-nav a[data-page]').forEach(function (link) {
        if (link.getAttribute('data-page') === currentPage) {
            link.classList.add('is-active');
        }
    });

    // Mobile nav toggle
    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('siteNav');
    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            toggle.classList.toggle('is-open');
            nav.classList.toggle('is-open');
        });
        nav.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', function () {
                toggle.classList.remove('is-open');
                nav.classList.remove('is-open');
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', loadComponents);

/* ---- Count-Up Animation ---- */
(function () {
    var animated = new WeakSet();

    function animateCounter(counter) {
        if (animated.has(counter)) return;
        var target = parseInt(counter.dataset.countTo || '0', 10);
        var prefix = counter.dataset.prefix || '';
        var suffix = counter.dataset.suffix || '';
        var duration = 1400;
        var startTime = performance.now();
        animated.add(counter);

        function tick(now) {
            var progress = Math.min((now - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            counter.textContent = prefix + Math.round(target * eased).toLocaleString('ru-RU') + suffix;
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    var observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.35 });

    function initCounters() {
        document.querySelectorAll('[data-count-to]').forEach(function (el) {
            observer.observe(el);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCounters);
    } else {
        initCounters();
    }
})();

/* ---- Scroll Nav ---- */
document.addEventListener('click', function (e) {
    if (e.target.closest('#scrollUp')) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (e.target.closest('#scrollDown')) {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
});

/* ---- Smooth Scroll ---- */
document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var target = document.querySelector(link.getAttribute('href'));
    if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});

/* ---- Help FAB Toggle ---- */
document.addEventListener('click', function (e) {
    var toggle = e.target.closest('#helpFabToggle');
    var card = document.getElementById('helpFabCard');
    if (!toggle || !card) return;
    card.classList.toggle('is-open');
});
document.addEventListener('click', function (e) {
    var fab = document.getElementById('helpFab');
    var card = document.getElementById('helpFabCard');
    if (!fab || !card) return;
    if (!fab.contains(e.target)) card.classList.remove('is-open');
});

/* ---- Checker (warez.rip) ---- */
(function () {
    var websiteInput = document.getElementById('websiteInput');
    var checkButton = document.getElementById('checkButton');
    var resultMessage = document.getElementById('resultMessage');
    var dbInfo = document.getElementById('dbInfo');

    // Exit if checker elements not on this page
    if (!websiteInput || !checkButton || !resultMessage) return;

    var SITES_JSON_URL = 'https://raw.githubusercontent.com/beschasny/warez.rip/main/data/sites.json';
    var db = { pirated: [], safe: [], known: [], dataUpdated: '' };
    var dbLoaded = false;

    function alertBox(type, html) {
        var colors = {
            danger: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b' },
            success: { bg: '#f0fdf4', border: '#22c55e', text: '#166534' },
            warning: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e' }
        };
        var c = colors[type] || colors.warning;
        return '<div style="padding:16px 20px;border:1px solid ' + c.border + ';background:' + c.bg + ';color:' + c.text + ';font-size:14px;line-height:1.6;margin-top:16px;">' + html + '</div>';
    }

    fetch(SITES_JSON_URL)
        .then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        })
        .then(function (data) {
            db.pirated = (data.pirated || []).map(function (s) { return s.toLowerCase().trim(); });
            db.safe = (data.safe || []).map(function (s) { return s.toLowerCase().trim(); });
            db.known = (data.known || []).map(function (s) { return s.toLowerCase().trim(); });
            db.dataUpdated = data.dataUpdated || '';
            dbLoaded = true;
            if (dbInfo && db.dataUpdated) {
                dbInfo.textContent = 'База warez.rip обновлена: ' + db.dataUpdated + ' \u00b7 Пиратских сайтов: ' + db.pirated.length;
                dbInfo.style.display = 'block';
            }
        })
        .catch(function () {
            resultMessage.innerHTML = alertBox('danger', 'Не удалось загрузить базу данных. Проверьте соединение с интернетом.');
            checkButton.disabled = true;
        });

    function check() {
        if (!dbLoaded) {
            resultMessage.innerHTML = alertBox('warning', 'База данных ещё загружается. Подождите секунду.');
            return;
        }
        var url = websiteInput.value.trim();
        if (!url) {
            resultMessage.innerHTML = alertBox('warning', 'Пожалуйста, введите URL.');
            return;
        }
        try {
            var parsedUrl = new URL(url.indexOf('http') === 0 ? url : 'http://' + url);
            var hostname = parsedUrl.hostname.toLowerCase();
            if (hostname.indexOf('www.') === 0) hostname = hostname.substring(4);

            if (db.pirated.indexOf(hostname) !== -1) {
                resultMessage.innerHTML = alertBox('danger', '<strong>' + hostname + '</strong> \u2014 обнаружен в базе пиратских сайтов warez.rip.<br><small>Этот ресурс распространяет нелицензионные расширения и шаблоны OpenCart.</small>');
            } else if (db.safe.indexOf(hostname) !== -1) {
                resultMessage.innerHTML = alertBox('success', '<strong>' + hostname + '</strong> \u2014 проверенный ресурс.<br><small>Этот сайт входит в список надёжных OpenCart-площадок.</small>');
            } else if (db.known.indexOf(hostname) !== -1) {
                resultMessage.innerHTML = alertBox('success', '<strong>' + hostname + '</strong> \u2014 известный сайт, не замечен в пиратстве.');
            } else {
                resultMessage.innerHTML = alertBox('warning', '<strong>' + hostname + '</strong> \u2014 не найден в базе warez.rip.<br><small>Это не означает, что сайт безопасен \u2014 его просто нет в базе данных.</small>');
            }
        } catch (e) {
            resultMessage.innerHTML = alertBox('danger', 'Неверный формат URL. Пожалуйста, введите корректный URL.');
        }
    }

    checkButton.addEventListener('click', check);
    websiteInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') check();
    });
})();

/* ---- Accordion ---- */
document.querySelectorAll('[data-accordion] .accordion-trigger').forEach(function (btn) {
    btn.addEventListener('click', function () {
        btn.closest('.accordion-item').classList.toggle('is-open');
    });
});

/* ---- Spoiler ---- */
document.querySelectorAll('[data-spoiler] .spoiler-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
        btn.closest('.spoiler').classList.toggle('is-open');
    });
});

/* ---- Code Copy ---- */
(function () {
    var toast = document.getElementById('toast');
    if (!toast) return;
    document.querySelectorAll('.tm-code-copy').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var container = btn.closest('.tm-code-window') || btn.closest('.tree-container');
            if (!container) return;
            var code = container.querySelector('code') || container.querySelector('pre');
            if (code) {
                navigator.clipboard.writeText(code.textContent).then(function () {
                    toast.textContent = 'Код скопирован!';
                    toast.classList.add('is-visible');
                    setTimeout(function () { toast.classList.remove('is-visible'); }, 2000);
                });
            }
        });
    });
})();

/* ---- Coupon Copy ---- */
document.addEventListener('click', function (e) {
    var btn = e.target.closest('#copyCoupon');
    if (!btn) return;
    navigator.clipboard.writeText('3834-uni-opencartclub').then(function () {
        btn.classList.add('copied');
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Купон скопирован!';
        setTimeout(function () {
            btn.classList.remove('copied');
            btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Скопировать купон';
        }, 2500);
    });
});

/* ---- FAQ Accordion (homepage) ---- */
document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-faq] .faq-question');
    if (!btn) return;
    var item = btn.closest('[data-faq]');
    var isOpen = item.classList.contains('is-open');
    document.querySelectorAll('[data-faq].is-open').forEach(function (el) {
        el.classList.remove('is-open');
    });
    if (!isOpen) item.classList.add('is-open');
});

/* ---- Homepage News Feed ---- */
(function () {
    var liveContainer = document.getElementById('news-liveopencart');
    var russiaContainer = document.getElementById('news-opencart-russia');
    if (!liveContainer && !russiaContainer) return;

    function cleanHtml(str) {
        var tmp = document.createElement('div');
        tmp.innerHTML = str;
        // Remove images
        tmp.querySelectorAll('img').forEach(function (img) { img.remove(); });
        return tmp.textContent || tmp.innerText || '';
    }

    function renderNews(container, items, maxItems) {
        if (!container) return;
        var html = '';
        var count = Math.min(items.length, maxItems || 4);
        for (var i = 0; i < count; i++) {
            var item = items[i];
            var date = item.pubDate ? new Date(item.pubDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) : '';
            var desc = item.description ? cleanHtml(item.description).trim() : '';
            if (desc.length > 120) desc = desc.substring(0, 120).replace(/\s+\S*$/, '') + '...';
            if (!desc && item.category) desc = item.category;
            if (!desc) desc = 'Перейти к обсуждению →';
            html += '<div class="news-feed-item">';
            html += '<a href="' + (item.link || '#') + '" target="_blank">';
            html += '<h4>' + cleanHtml(item.title || 'Без заголовка') + '</h4>';
            if (desc) html += '<p>' + desc + '</p>';
            if (date) html += '<div class="news-date">' + date + '</div>';
            html += '</a></div>';
        }
        container.innerHTML = html || '<div class="news-feed-loading">Нет новостей</div>';
    }

    if (liveContainer) {
        fetch('get_rss_feed.php?url=' + encodeURIComponent('https://liveopencart.ru/news_site/?rss=2.0'))
            .then(function (r) { return r.json(); })
            .then(function (data) {
                if (data.status === 'ok' && data.items) renderNews(liveContainer, data.items, 4);
                else liveContainer.innerHTML = '<div class="news-feed-loading">Не удалось загрузить</div>';
            })
            .catch(function () { liveContainer.innerHTML = '<div class="news-feed-loading">Ошибка загрузки</div>'; });
    }

    if (russiaContainer) {
        fetch('get_rss_feed.php?url=' + encodeURIComponent('https://forum.opencart-russia.ru/forums/news/index.rss'))
            .then(function (r) { return r.json(); })
            .then(function (data) {
                if (data.status === 'ok' && data.items) renderNews(russiaContainer, data.items, 4);
                else russiaContainer.innerHTML = '<div class="news-feed-loading">Не удалось загрузить</div>';
            })
            .catch(function () { russiaContainer.innerHTML = '<div class="news-feed-loading">Ошибка загрузки</div>'; });
    }
})();

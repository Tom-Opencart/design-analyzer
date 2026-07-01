/* ============================================================
   Content Constructor — blocks/types/faq.js
   Блок: FAQ
   ============================================================ */

BlockRegistry.register({
    type: 'faq',
    label: 'FAQ',
    defaults: () => ({
        title: 'Часто задаваемые вопросы',
        items: [
            { question: 'Сколько времени занимает замена линз?', answer: 'В среднем процедура установки линз занимает от 6 до 12 часов. В некоторых случаях срок может увеличиться до 2–3 дней.' },
            { question: 'Какие линзы лучше выбрать: галоген, ксенон или Bi-LED?', answer: 'Bi-LED линзы — самый современный вариант. Они потребляют меньше энергии, работают до 50 000 часов, включаются мгновенно и не требуют блоков розжига. Ксенон требует времени для разогрева, а галоген уступает по яркости и долговечности.' },
            { question: 'Что такое Bi-LED линзы?', answer: 'Bi-LED линзы — это оптические устройства, которые используют светодиоды (LED) в качестве источника света. Приставка «Bi» означает, что одна линза выполняет функции как ближнего, так и дальнего света.' },
            { question: 'Какой световой поток у Bi-LED линз?', answer: 'Световой поток составляет от 3 000 до 4 000 лм на ближнем свете и от 5 000 до 8 000 лм на дальнем свете. Точные характеристики зависят от конкретной модели и производителя.' },
            { question: 'Предоставляется ли гарантия на работу?', answer: 'Да, на работу и компоненты предоставляется гарантия до 2-х лет. После замены линз регулировка света проверяется и корректируется на стенде по ГОСТ.' },
            { question: 'Нужно ли менять лампы после замены линз?', answer: 'Нет, при установке Bi-LED линз отдельные лампы не требуются — светодиоды уже встроены в модуль. Вы получаете полностью готовую к работе оптику.' },
            { question: 'Сохраняется ли штатный функционал фар после замены?', answer: 'Да, все процедуры проводятся согласно техническому регламенту с полным сохранением функционала фар. Адаптивное освещение (AFS, AFLS, DLA, ILS) продолжает работать.' }
        ]
    }),
    
    renderEditor(block, ctx) {
        let html = `<div class="form-group"><label>Заголовок секции</label><input type="text" data-field="title" value="${escapeHtml(block.data.title)}"></div>`;
        html += `<div class="faq-editor">`;
        block.data.items.forEach((item, i) => {
            html += `<div class="faq-editor-item">
                <div class="faq-editor-header">
                    <span class="faq-editor-num">${i + 1}</span>
                    <input type="text" data-faq-question="${i}" value="${escapeHtml(item.question)}" placeholder="Вопрос">
                    <button class="btn btn-sm btn-ghost" data-action="remove-faq-item" data-index="${i}">&times;</button>
                </div>
                <textarea data-faq-answer="${i}" rows="3" placeholder="Ответ">${escapeHtml(item.answer)}</textarea>
                ${agreeToolbarHtml()}
            </div>`;
        });
        html += `</div><button class="btn btn-sm btn-ghost" data-action="add-faq-item">+ Добавить вопрос</button>`;
        return html;
    },
    
    renderHTML(block, ctx) {
        const id = 'faq-' + block.id;
        let html = `<div class="article-faq" id="${id}">`;
        if (block.data.title) {
            html += `<h2 class="article-faq-title">${escapeHtml(block.data.title)}</h2>`;
        }
        html += `<div class="article-faq-list">`;
        block.data.items.forEach((item, i) => {
            html += `<div class="article-faq-item">
                <div class="article-faq-question collapsed">${escapeHtml(item.question)}</div>
                <div class="article-faq-collapse collapse">
                    <div class="article-faq-answer">${markdownToHtml(item.answer, false)}</div>
                </div>
            </div>`;
        });
        html += `</div></div>`;
        return html;
    },
    
    renderPreview(block, ctx) {
        const id = 'preview-faq-' + block.id;
        let html = `<div class="article-faq" id="${id}">`;
        if (block.data.title) {
            html += `<h2 class="article-faq-title">${escapeHtml(block.data.title)}</h2>`;
        }
        html += `<div class="article-faq-list">`;
        block.data.items.forEach((item, i) => {
            html += `<div class="article-faq-item">
                <div class="article-faq-question collapsed">${escapeHtml(item.question)}</div>
                <div class="article-faq-collapse collapse">
                    <div class="article-faq-answer">${markdownToHtml(item.answer, true)}</div>
                </div>
            </div>`;
        });
        html += `</div></div>`;
        return html;
    }
});

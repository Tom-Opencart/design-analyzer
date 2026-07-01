/* ============================================================
   Content Constructor — ui/ai-assistant.js
   Логика AI Assistant modal
   ============================================================ */

function initAiAssistant(options) {
    const btnAiAssistant = document.querySelector('#btnAiAssistant');
    const aiAssistantModal = document.querySelector('#aiAssistantModal');
    const btnCloseAiAssistant = document.querySelector('#btnCloseAiAssistant');
    const btnCancelAiAssistant = document.querySelector('#btnCancelAiAssistant');
    const btnCopyAiPrompt = document.querySelector('#btnCopyAiPrompt');
    const aiInstructionInput = document.querySelector('#aiInstructionInput');

    if (!btnAiAssistant || !aiAssistantModal) {
        return;
    }

    const modalApi = bindBasicModal(aiAssistantModal, [btnCloseAiAssistant, btnCancelAiAssistant], () => {
        if (aiInstructionInput) {
            aiInstructionInput.value = '';
            aiInstructionInput.focus();
        }
    });

    btnAiAssistant.addEventListener('click', modalApi.open);

    if (!btnCopyAiPrompt || !aiInstructionInput) {
        return;
    }

    btnCopyAiPrompt.addEventListener('click', () => {
        const userInstruction = aiInstructionInput.value.trim();
        if (!userInstruction) {
            alert('Пожалуйста, введите инструкцию для AI');
            return;
        }

        if (options && typeof options.hydrateStoreFromDom === 'function') {
            options.hydrateStoreFromDom();
        }

        const currentJSON = JSON.stringify(
            serializeProject(projectStore.getState(), CC_SCHEMA_SPEC),
            null,
            2
        );

        const promptText = `Роль: Вы — профессиональный ассистент по подготовке контента и эксперт по работе с JSON-конструкторами страниц.
Ваша задача — обработать JSON-структуру страницы согласно инструкции пользователя.

Инструкция пользователя:
"${userInstruction}"

Правила для ответа:
1. Вы должны вернуть измененную JSON-структуру страницы.
2. Строго соблюдайте схему данных, описанную в объекте "ai_specification".
3. Не удаляйте существующие блоки, если этого прямо не требует инструкция пользователя.
4. Вы можете изменять тексты, добавлять новые блоки (heading, paragraph, list, quote, table, image, before-after, spoiler, tabs, product-card, grid) в массив "blocks".
5. У новых блоков поле "id" генерировать не нужно (или оставьте его пустым/пропустите), конструктор присвоит их автоматически при импорте.
6. В полях текстов вы можете использовать Markdown-разметку (жирный, курсив, ссылки).
7. Верните ТОЛЬКО валидный JSON-код в вашем ответе (желательно обернуть в \`\`\`json ... \`\`\`). Не добавляйте лишнего текста вне JSON, если это не требуется, но если добавите, конструктор всё равно попробует его отфильтровать.

Исходный JSON страницы для изменения:
\`\`\`json
${currentJSON}
\`\`\`
`;

        copyTextToClipboard(promptText).then(() => {
            if (options && typeof options.showToast === 'function') {
                options.showToast('Промпт скопирован для ChatGPT!');
            }
            modalApi.close();
        }).catch((error) => {
            console.error('Ошибка при копировании промпта:', error);
            alert('Не удалось скопировать промпт автоматически. Вы можете скопировать его вручную.');
        });
    });
}

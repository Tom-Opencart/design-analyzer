/* ============================================================
   Content Constructor — core/project-serializer.js
   Сериализация и десериализация проекта (JSON <-> Object)
   ============================================================ */

function serializeProject(projectState, schemaSpec) {
    if (!projectState) return null;
    return {
        title: projectState.title || '',
        slug: projectState.slug || '',
        siteUrl: projectState.siteUrl || '',
        project: {
            siteUrl: projectState.siteUrl || ''
        },
        theme: {
            preset: (projectState.theme && projectState.theme.preset) || 'default',
            accent: (projectState.theme && projectState.theme.accent) || '#27272a',
            bg: (projectState.theme && projectState.theme.bg) || '#f4f4f5',
            text: (projectState.theme && projectState.theme.text) || '#1A1A1A'
        },
        ai_specification: schemaSpec || {},
        blocks: projectState.blocks || []
    };
}

function extractJSONFromString(text) {
    text = text.trim();
    // 1. Try direct JSON parse
    try {
        return JSON.parse(text);
    } catch (e) {
        // Direct parse failed, continue extraction
    }

    // 2. Try to match comment CONSTRUCTOR_JSON (if embedded in HTML)
    const commentRegex = /<!--\s*CONSTRUCTOR_JSON:\s*([\s\S]*?)\s*-->/i;
    const commentMatch = text.match(commentRegex);
    if (commentMatch && commentMatch[1]) {
        try {
            return JSON.parse(commentMatch[1].trim());
        } catch (e) {
            // Ignore comment parse failure, try other matches
        }
    }

    // 3. Try to match hidden div class="constructor-json-container"
    const divRegex = /<div\s+class="constructor-json-container"[^>]*>([\s\S]*?)<\/div>/i;
    const divMatch = text.match(divRegex);
    if (divMatch && divMatch[1]) {
        try {
            let decoded = divMatch[1].trim()
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&#39;/g, "'")
                .replace(/&#039;/g, "'")
                .replace(/&apos;/g, "'");
            return JSON.parse(decoded);
        } catch (e) {
            // Ignore div parse failure, try other matches
        }
    }

    // 3. Try to match markdown code block
    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
    const match = text.match(codeBlockRegex);
    if (match && match[1]) {
        try {
            return JSON.parse(match[1].trim());
        } catch (e) {
            // If markdown parsing failed, try extracting from that match below
            text = match[1].trim();
        }
    }

    // 4. Fallback to extracting everything between the first { and the last }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const extracted = text.substring(firstBrace, lastBrace + 1);
        try {
            return JSON.parse(extracted);
        } catch (e) {
            // Ignore failure, throw custom error below
        }
    }

    throw new Error('Не удалось извлечь корректный JSON из текста.');
}

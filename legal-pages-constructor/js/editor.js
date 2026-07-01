const Editor = {
    element: null,
    currentDoc: null,

    init() {
        this.element = document.getElementById('editor');
        this.loadDocument('offer');
        this.element.addEventListener('input', () => this.autoSave());
        this.element.addEventListener('keydown', (e) => this.handleKeyboard(e));
    },

    loadDocument(docId) {
        const doc = Documents.get(docId);
        this.currentDoc = docId;
        let saved = Storage.getDocument(docId);
        if (saved) {
            // Migrate saved content: convert h3 to p, and correct strong tag wrapping
            const _tmp = document.createElement('div');
            _tmp.innerHTML = saved;
            
            // Convert any remaining h3 to plain p wrapped in strong (so next pass corrects them)
            _tmp.querySelectorAll('h3').forEach(h3 => {
                const p = document.createElement('p');
                p.innerHTML = '<strong>' + h3.innerHTML + '</strong>';
                h3.parentNode.replaceChild(p, h3);
            });
            
            // Fix strong wrapping in paragraphs
            _tmp.querySelectorAll('p').forEach(p => {
                const s = p.querySelector(':scope > strong');
                if (!s) return;
                
                // Only migrate if the strong tag is the only content-carrying child of the paragraph
                const isEntirelyStrong = Array.from(p.childNodes).every(node => 
                    node === s || (node.nodeType === 3 && !node.textContent.trim())
                );
                if (!isEntirelyStrong) return;
                
                const strongContent = s.innerHTML;
                const parts = strongContent.split(/<br\s*\/?>/i);
                const firstLine = parts[0].trim();
                
                const isTopLevelHeader = /^\d+\.\s/.test(firstLine) && !/^\d+\.\d/.test(firstLine);
                const isSubLevelHeader = /^\d+\.\d/.test(firstLine);
                
                if (isTopLevelHeader) {
                    const match = firstLine.match(/^(\d+\.)\s*(.*)$/);
                    if (match) {
                        let newHtml = '<strong>' + match[1] + '</strong> ' + match[2];
                        if (parts.length > 1) {
                            newHtml += '<br>\n' + parts.slice(1).join('<br>\n');
                        }
                        p.innerHTML = newHtml;
                    }
                } else if (isSubLevelHeader) {
                    if (parts.length > 1) {
                        let newHtml = '<strong>' + firstLine + '</strong><br>\n' + parts.slice(1).join('<br>\n');
                        p.innerHTML = newHtml;
                    } else {
                        p.innerHTML = strongContent;
                    }
                }
            });
            this.element.innerHTML = _tmp.innerHTML;
            // Always sync placeholders with the latest settings on load
            this.updateSettingsInEditor(Storage.getSettings());
        } else {
            const settings = Storage.getSettings();
            const rendered = Documents.render(docId, settings);
            this.element.innerHTML = this.textToHtml(rendered);
        }
        if (UI.tabs) {
            UI.tabs.currentTab = docId;
        }
    },

    textToHtml(text) {
        if (!text) return '';
        return text.split(/\n\n+/).map(paragraph => {
            const trimmed = paragraph.trim();
            const lines = trimmed.split('\n');
            const firstLine = lines[0];

            // Top-level section header only: "N. Title"
            const isSectionHeader = /^\d+\.\s/.test(firstLine) && !/^\d+\.\d/.test(firstLine);
            
            // Sub-section header with list items: "N.N. Title" and lines.length > 1
            const isSubSectionHeader = /^\d+(\.\d+)+\.?\s/.test(firstLine) && lines.length > 1;

            if (isSectionHeader) {
                const match = firstLine.match(/^(\d+\.)\s*(.*)$/);
                let heading;
                if (match) {
                    heading = '<strong>' + match[1] + '</strong> ' + match[2];
                } else {
                    heading = '<strong>' + firstLine + '</strong>';
                }
                if (lines.length === 1) {
                     return '<p>' + heading + '</p>';
                }
                const rest = lines.slice(1).join('<br>\n');
                return '<p>' + heading + '<br>\n' + rest + '</p>';
            }

            if (isSubSectionHeader) {
                const heading = '<strong>' + firstLine + '</strong>';
                const rest = lines.slice(1).join('<br>\n');
                return '<p>' + heading + '<br>\n' + rest + '</p>';
            }

            // Everything else — plain paragraph
            const formatted = trimmed.replace(/\n/g, '<br>\n');
            return '<p>' + formatted + '</p>';
        }).join('\n');
    },

    autoSave() {
        if (this.currentDoc && this.element) {
            Storage.saveDocument(this.currentDoc, this.element.innerHTML);
        }
    },

    getContent() {
        return this.element ? this.element.innerHTML : '';
    },

    setContent(html) {
        this.element.innerHTML = html;
    },

    handleKeyboard(e) {
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            document.execCommand('bold');
        }
        if (e.ctrlKey && e.key === 'i') {
            e.preventDefault();
            document.execCommand('italic');
        }
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            document.execCommand('underline');
        }
    },

    updateSettingsInEditor(settings) {
        if (!this.element) return;

        // Find simple placeholders
        const placeholders = this.element.querySelectorAll('span.placeholder[data-placeholder]');
        placeholders.forEach(span => {
            const key = span.getAttribute('data-placeholder');
            const value = (settings[key] !== undefined && settings[key] !== '')
                ? settings[key]
                : Documents.getPlaceholderLabel(key);
            if (span.textContent !== value) {
                span.textContent = value;
            }
        });

        // Find expression placeholders
        const exprPlaceholders = this.element.querySelectorAll('span.placeholder[data-expr]');
        exprPlaceholders.forEach(span => {
            const expr = span.getAttribute('data-expr');
            const val = Documents.evaluateExpression(expr, settings);
            if (span.textContent !== val) {
                span.textContent = val;
            }
        });

        this.autoSave();
    },

    getRenderedHtml() {
        const temp = document.createElement('div');
        temp.innerHTML = this.getContent();

        // Replace all span.placeholder elements with their text contents
        const spans = temp.querySelectorAll('span.placeholder');
        spans.forEach(span => {
            const textNode = document.createTextNode(span.textContent);
            span.parentNode.replaceChild(textNode, span);
        });

        return temp.innerHTML;
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());

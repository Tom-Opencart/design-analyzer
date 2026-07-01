/**
 * OpenCart 3 Module Generator
 * Logic for generating OpenCart 3 module skeletons
 */

const Generator = {
    mode: 'simple',
    config: {
        type: 'module',
        isMultiModule: false,
        name: 'My Module',
        codename: 'my_module',
        version: '1.0.0',
        author: 'Opencart Club',
        files: {
            ocmod: false,
            admin_model: true,
            catalog_controller: true,
            catalog_model: true,
            catalog_view: true,
            catalog_language: true,
            js: false,
            css: false
        }
    },
    fields: [],
    codenameManuallyEdited: false, // Track if user manually edited codename

    // Cyrillic to Latin transliteration map
    translitMap: {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
        'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
        'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
        'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
        'я': 'ya'
    },

    // Transliterate text to snake_case codename
    transliterate(text) {
        if (!text) return '';
        let result = text.toLowerCase();

        // Replace Cyrillic chars with Latin equivalents
        for (const [cyr, lat] of Object.entries(this.translitMap)) {
            result = result.replace(new RegExp(cyr, 'g'), lat);
        }

        // Replace spaces and dashes with underscores
        result = result.replace(/[\s\-]+/g, '_');

        // Remove any non-alphanumeric characters except underscore
        result = result.replace(/[^a-z0-9_]/g, '');

        // Remove multiple underscores
        result = result.replace(/_+/g, '_');

        // Trim underscores from start/end
        result = result.replace(/^_+|_+$/g, '');

        return result;
    },

    // Handle module name input - auto-generate codename if not manually edited
    onModuleNameInput() {
        if (!this.codenameManuallyEdited) {
            const nameInput = document.getElementById('moduleName');
            const codeInput = document.getElementById('moduleCode');
            if (nameInput && codeInput) {
                codeInput.value = this.transliterate(nameInput.value);
            }
        }
        this.updateUI();
    },

    // Mark codename as manually edited
    onCodenameInput() {
        this.codenameManuallyEdited = true;
        this.updateUI();
    },

    init() {
        this.updateUI();
        this.updateFieldsUI();
        this.toggleDevVisuals(); // Initialize dev visuals based on current mode
    },

    switchMode(mode) {
        this.mode = mode;
        const simpleBtn = document.getElementById('simpleModeBtn');
        const devBtn = document.getElementById('devModeBtn');
        const devSections = document.querySelectorAll('.dev-only');
        const badge = document.getElementById('modeBadge');
        badge.innerText = mode === 'simple' ? 'ПРОСТОЙ' : 'DEV';
        badge.className = `badge ${mode === 'simple' ? 'bg-secondary' : 'bg-warning text-dark'} ms-2`;

        if (mode === 'dev') {
            simpleBtn.classList.remove('active');
            devBtn.classList.add('active');
            devSections.forEach(s => {
                s.style.display = 'block';
                s.classList.add('animate-in');
            });
            // Hide simple-only elements
            document.querySelectorAll('.simple-only').forEach(el => el.style.display = 'none');
        } else {
            simpleBtn.classList.add('active');
            devBtn.classList.remove('active');
            devSections.forEach(s => {
                s.style.display = 'none';
                s.classList.remove('animate-in');
            });
            // Show simple-only elements
            document.querySelectorAll('.simple-only').forEach(el => el.style.display = 'block');
        }

        this.toggleDevVisuals();
        this.renderCodePreview();
        this.renderFileTree();
    },

    loadDemoFields() {
        this.fields = [
            { id: 1, type: 'text', name: 'Заголовок баннера', key: 'banner_title' },
            { id: 2, type: 'toggle', name: 'Показывать в мобилке', key: 'show_mobile' },
            { id: 3, type: 'image', name: 'Изображение', key: 'banner_image' }
        ];
        this.updateFieldsUI();
        this.updateUI();

        // Show success micro-interaction
        const btn = document.querySelector('.btn-demo');
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check me-2"></i>Демо загружено';
            btn.classList.replace('btn-outline-primary', 'btn-success');

            // Scroll to constructor
            const fieldsContainer = document.getElementById('fieldsContainer');
            if (fieldsContainer) {
                fieldsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.replace('btn-success', 'btn-outline-primary');
            }, 2000);
        }
    },

    toggleDevVisuals() {
        const body = document.body;
        const badge = document.getElementById('modeBadge');

        if (this.mode === 'dev') {
            body.classList.add('dev-mode-active');
            if (badge) {
                // badge.textContent = 'DEV MODE'; // Handled in switchMode
                // badge.className = 'badge bg-warning text-dark ms-2 pulse-animation'; // Handled in switchMode
                badge.style.display = 'inline-block';
            }
        } else {
            body.classList.remove('dev-mode-active');
            if (badge) {
                // badge.textContent = 'SIMPLE'; // Handled in switchMode
                // badge.className = 'badge bg-secondary ms-2'; // Handled in switchMode
                badge.style.display = 'inline-block';
            }
        }
    },

    addField(type) {
        const id = Date.now();
        const field = {
            id: id,
            type: type,
            name: `Field ${this.fields.length + 1}`,
            key: `field_${this.fields.length + 1}`
        };
        this.fields.push(field);
        this.updateFieldsUI();
        this.updateUI();
    },

    removeField(id) {
        this.fields = this.fields.filter(f => f.id !== id);
        this.updateFieldsUI();
        this.updateUI();
    },

    updateFieldsUI() {
        const container = document.getElementById('fieldsContainer');
        const alert = document.getElementById('noFieldsAlert');

        if (!container || !alert) return;

        if (this.fields.length === 0) {
            alert.style.display = 'block';
            container.innerHTML = '';
            return;
        }

        alert.style.display = 'none';
        container.innerHTML = '';

        this.fields.forEach(field => {
            const div = document.createElement('div');
            div.className = 'field-card animate-in';

            let description = '';
            switch (field.type) {
                case 'text': description = 'Короткое текстовое поле для заголовков или имен.'; break;
                case 'textarea': description = 'Многострочное поле для описаний или HTML кода.'; break;
                case 'select': description = 'Выпадающий список с заранее заданными значениями.'; break;
                case 'toggle': description = 'Переключатель Да/Нет (булево значение).'; break;
                case 'image': description = 'Интеграция со стандартным менеджером изображений OpenCart.'; break;
            }

            div.innerHTML = `
                <div class="field-card-remove" onclick="removeField(${field.id})">
                    <i class="fas fa-times"></i>
                </div>
                <div class="row g-3">
                    <div class="col-md-5">
                        <label class="form-label-custom">Название (Label)</label>
                        <input type="text" class="form-control form-control-custom" value="${field.name}" 
                            oninput="updateField(${field.id}, 'name', this.value)">
                        <small class="text-muted">${description}</small>
                    </div>
                    <div class="col-md-5">
                        <label class="form-label-custom">Ключ (Key)</label>
                        <input type="text" class="form-control form-control-custom" value="${field.key}" 
                            oninput="updateField(${field.id}, 'key', this.value)">
                        <small class="text-muted">Используется в коде как <code>$${field.key}</code></small>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label-custom">Тип</label>
                        <div class="pt-2"><strong>${field.type.toUpperCase()}</strong></div>
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
    },

    updateField(id, key, value) {
        const field = this.fields.find(f => f.id === id);
        if (field) {
            field[key] = value;
            this.updateUI();
        }
    },

    getFormValues() {
        this.config.type = document.getElementById('moduleType').value;
        this.config.isMultiModule = document.getElementById('isMultiModule').checked;
        this.config.name = document.getElementById('moduleName').value || 'My Module';
        this.config.codename = (document.getElementById('moduleCode').value || 'my_module')
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '')  // Remove non-allowed characters
            .replace(/_+/g, '_')          // Collapse multiple underscores
            .replace(/^_+|_+$/g, '');     // Trim leading/trailing underscores
        this.config.version = document.getElementById('moduleVersion').value || '1.0.0';
        this.config.author = document.getElementById('moduleAuthor').value || 'Opencart Club';

        this.config.files.ocmod = document.getElementById('createOcmod').checked;
        this.config.files.admin_model = document.getElementById('createAdminModel').checked;
        this.config.files.catalog_controller = document.getElementById('createCatalogController').checked;
        this.config.files.catalog_model = document.getElementById('createCatalogModel').checked;
        this.config.files.catalog_view = document.getElementById('createCatalogView').checked;
        this.config.files.catalog_language = document.getElementById('createCatalogLanguage').checked;
        this.config.files.js = document.getElementById('createJs').checked;
        this.config.files.css = document.getElementById('createCss').checked;

        // Dev options
        this.config.generateEvents = document.getElementById('generateEvents') ? document.getElementById('generateEvents').checked : false;
        this.config.generateAjax = document.getElementById('generateAjax') ? document.getElementById('generateAjax').checked : false;

        this.config.theme = (document.getElementById('themeName') ? document.getElementById('themeName').value : 'default') || 'default';
        this.config.jsName = (document.getElementById('customJsName') ? document.getElementById('customJsName').value : '') || this.config.codename;
        this.config.cssName = (document.getElementById('customCssName') ? document.getElementById('customCssName').value : '') || this.config.codename;

        // Description for payment/shipping
        this.config.description = (document.getElementById('moduleDescription') ? document.getElementById('moduleDescription').value : '') || '';
    },

    updateUI() {
        this.getFormValues();

        // Toggle Multi-module visibility
        const multiModuleGroup = document.getElementById('multiModuleGroup');
        if (this.config.type === 'module') {
            multiModuleGroup.style.display = 'block';
        } else {
            multiModuleGroup.style.display = 'none';
            this.config.isMultiModule = false;
        }

        // Toggle Description field visibility for payment/shipping
        const descGroup = document.getElementById('moduleDescriptionGroup');
        if (descGroup) {
            if (this.config.type === 'payment' || this.config.type === 'shipping') {
                descGroup.style.display = 'block';
            } else {
                descGroup.style.display = 'none';
            }
        }

        this.renderFileTree();
        this.renderCodePreview();
    },

    previewFile: 'controller',

    renderCodePreview() {
        if (this.mode !== 'dev') return;

        const previewElement = document.getElementById('codePreview');
        const codename = this.config.codename;
        const type = this.config.type;
        const controllerClassName = this.getControllerClassName(codename, type);

        let code = '';
        if (this.previewFile === 'controller') {
            code = this.getAdminControllerTemplate(controllerClassName);
        } else if (this.previewFile === 'view') {
            code = this.getAdminViewTemplate();
        } else if (this.previewFile === 'ocmod') {
            code = this.getOcmodTemplate();
        }

        previewElement.textContent = code;
    },

    selectPreviewFile(file, btn) {
        this.previewFile = file;

        // Update active class on buttons
        const buttons = btn.parentElement.querySelectorAll('button');
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.renderCodePreview();
    },

    renderFileTree() {
        const treeContainer = document.getElementById('fileTree');
        const codename = this.config.codename;
        const type = this.config.type;
        const themeName = this.config.theme;
        const hasCustomTheme = themeName && themeName !== 'default';

        let html = `<div class="tree-zip"><i class="fas fa-file-archive me-2"></i>${codename}.ocmod.zip</div>`;
        html += `<div class="tree-item"><span class="tree-folder">upload/</span>`;

        // Admin section (for all extension types including theme)
        html += `<div class="tree-item"><span class="tree-folder">admin/</span>`;

        // Controller
        html += `<div class="tree-item"><span class="tree-folder">controller/extension/${type}/</span>`;
        html += `<div class="tree-item"><span class="tree-file">${codename}.php</span></div></div>`;

        // Language
        html += `<div class="tree-item"><span class="tree-folder">language/</span>`;
        html += `<div class="tree-item"><span class="tree-folder">en-gb/extension/${type}/</span>`;
        html += `<div class="tree-item"><span class="tree-file">${codename}.php</span></div></div>`;
        html += `<div class="tree-item"><span class="tree-folder">ru-ru/extension/${type}/</span>`;
        html += `<div class="tree-item"><span class="tree-file">${codename}.php</span></div></div></div>`;

        // Model
        if (this.config.files.admin_model) {
            html += `<div class="tree-item"><span class="tree-folder">model/extension/${type}/</span>`;
            html += `<div class="tree-item"><span class="tree-file">${codename}.php</span></div></div>`;
        }

        // View
        html += `<div class="tree-item"><span class="tree-folder">view/template/extension/${type}/</span>`;
        html += `<div class="tree-item"><span class="tree-file">${codename}.twig</span></div></div>`;

        html += `</div>`; // End admin

        // Catalog
        if (this.config.files.catalog_controller || this.config.files.catalog_model || this.config.files.catalog_view || this.config.files.catalog_language || this.config.generateEvents || this.config.generateAjax || this.config.files.js || this.config.files.css) {
            html += `<div class="tree-item"><span class="tree-folder">catalog/</span>`;

            // Controller
            if (this.config.files.catalog_controller || this.config.generateAjax || this.config.generateEvents) {
                html += `<div class="tree-item"><span class="tree-folder">controller/extension/${type}/</span>`;
                if (this.config.files.catalog_controller) {
                    html += `<div class="tree-item"><span class="tree-file">${codename}.php</span></div>`;
                }
                if (this.config.generateAjax) {
                    html += `<div class="tree-item"><span class="tree-file">${codename}_api.php</span></div>`;
                }
                if (this.config.generateEvents) {
                    html += `<div class="tree-item"><span class="tree-file">${codename}_event.php</span></div>`;
                }
                html += `</div>`;
            }

            // Language
            if (this.config.files.catalog_language) {
                html += `<div class="tree-item"><span class="tree-folder">language/</span>`;
                html += `<div class="tree-item"><span class="tree-folder">en-gb/extension/${type}/</span>`;
                html += `<div class="tree-item"><span class="tree-file">${codename}.php</span></div></div>`;
                html += `<div class="tree-item"><span class="tree-folder">ru-ru/extension/${type}/</span>`;
                html += `<div class="tree-item"><span class="tree-file">${codename}.php</span></div></div></div>`;
            }

            // Model
            if (this.config.files.catalog_model) {
                html += `<div class="tree-item"><span class="tree-folder">model/extension/${type}/</span>`;
                html += `<div class="tree-item"><span class="tree-file">${codename}.php</span></div></div>`;
            }

            // View & Assets
            if (this.config.files.catalog_view || this.config.files.js || this.config.files.css) {
                html += `<div class="tree-item"><span class="tree-folder">view/</span>`;

                if (this.config.files.catalog_view) {
                    // Always show default theme
                    html += `<div class="tree-item"><span class="tree-folder">theme/default/template/extension/${type}/</span>`;
                    html += `<div class="tree-item"><span class="tree-file">${codename}.twig</span></div></div>`;

                    // If custom theme specified, also show custom theme folder
                    if (hasCustomTheme) {
                        html += `<div class="tree-item"><span class="tree-folder">theme/${themeName}/template/extension/${type}/</span>`;
                        html += `<div class="tree-item"><span class="tree-file">${codename}.twig</span></div></div>`;
                    }
                }

                // For theme type: CSS in theme/default/stylesheet/, JS in javascript/
                if (type === 'theme') {
                    if (this.config.files.css) {
                        html += `<div class="tree-item"><span class="tree-folder">theme/default/stylesheet/</span>`;
                        html += `<div class="tree-item"><span class="tree-file">${codename}.css</span></div></div>`;
                    }
                    if (this.config.files.js) {
                        html += `<div class="tree-item"><span class="tree-folder">javascript/</span>`;
                        html += `<div class="tree-item"><span class="tree-file">${codename}.js</span></div></div>`;
                    }
                } else {
                    // For other types: JS and CSS in javascript/{codename}/
                    if (this.config.files.js || this.config.files.css) {
                        html += `<div class="tree-item"><span class="tree-folder">javascript/${codename}/</span>`;
                        if (this.config.files.js) html += `<div class="tree-item"><span class="tree-file">${this.config.jsName}.js</span></div>`;
                        if (this.config.files.css) html += `<div class="tree-item"><span class="tree-file">${this.config.cssName}.css</span></div>`;
                        html += `</div>`;
                    }
                }

                html += `</div>`; // End view
            }

            html += `</div>`; // End catalog
        }

        html += `</div>`; // End upload

        // OCMOD
        if (this.config.files.ocmod) {
            html += `<div class="tree-item"><span class="tree-file">install.xml</span></div>`;
        }

        treeContainer.innerHTML = html;
    },

    async generateModule() {
        this.getFormValues();
        const zip = new JSZip();
        const codename = this.config.codename;
        const type = this.config.type;
        const themeName = this.config.theme;
        const hasCustomTheme = themeName && themeName !== 'default';

        const upload = zip.folder("upload");

        // All extension types (including theme) have admin section
        const admin = upload.folder("admin");

        // Helper to format class names (same for admin and catalog in OpenCart 3)
        const controllerClassName = this.getControllerClassName(codename, type);
        const modelClassName = this.getModelClassName(codename, type);

        // Admin Controller
        admin.file(`controller/extension/${type}/${codename}.php`, this.getAdminControllerTemplate(controllerClassName));

        // Admin Language
        admin.file(`language/en-gb/extension/${type}/${codename}.php`, this.getLanguageTemplate(this.config.name));
        admin.file(`language/ru-ru/extension/${type}/${codename}.php`, this.getLanguageTemplate(this.config.name, 'ru'));

        // Admin Model
        if (this.config.files.admin_model) {
            admin.file(`model/extension/${type}/${codename}.php`, this.getAdminModelTemplate(modelClassName));
        }

        // Admin View
        admin.file(`view/template/extension/${type}/${codename}.twig`, this.getAdminViewTemplate());

        // Catalog
        if (this.config.files.catalog_controller || this.config.files.catalog_model || this.config.files.catalog_view || this.config.files.catalog_language || this.config.generateEvents || this.config.generateAjax || this.config.files.js || this.config.files.css) {
            const catalog = upload.folder("catalog");

            // Catalog Controller
            if (this.config.files.catalog_controller || this.config.generateAjax || this.config.generateEvents) {
                if (this.config.files.catalog_controller) {
                    catalog.file(`controller/extension/${type}/${codename}.php`, this.getCatalogControllerTemplate(controllerClassName));
                }
                if (this.config.generateAjax) {
                    catalog.file(`controller/extension/${type}/${codename}_api.php`, this.getAjaxControllerTemplate());
                }
                if (this.config.generateEvents) {
                    catalog.file(`controller/extension/${type}/${codename}_event.php`, this.getEventControllerTemplate());
                }
            }

            // Catalog Language
            if (this.config.files.catalog_language) {
                catalog.file(`language/en-gb/extension/${type}/${codename}.php`, this.getLanguageTemplate(this.config.name, 'en', 'catalog'));
                catalog.file(`language/ru-ru/extension/${type}/${codename}.php`, this.getLanguageTemplate(this.config.name, 'ru', 'catalog'));
            }

            // Catalog Model
            if (this.config.files.catalog_model) {
                catalog.file(`model/extension/${type}/${codename}.php`, this.getCatalogModelTemplate(modelClassName));
            }

            // Catalog View & Assets
            if (this.config.files.catalog_view || this.config.files.js || this.config.files.css) {
                if (this.config.files.catalog_view) {
                    // Always create default theme file
                    catalog.file(`view/theme/default/template/extension/${type}/${codename}.twig`, this.getCatalogViewTemplate());

                    // If custom theme specified, also create file for custom theme
                    if (hasCustomTheme) {
                        catalog.file(`view/theme/${themeName}/template/extension/${type}/${codename}.twig`, this.getCatalogViewTemplate());
                    }
                }

                // Theme type: CSS in view/theme/default/stylesheet/, JS in view/javascript/
                if (type === 'theme') {
                    if (this.config.files.css) {
                        catalog.file(`view/theme/default/stylesheet/${codename}.css`, this.getThemeStylesheetTemplate());
                    }
                    if (this.config.files.js) {
                        catalog.file(`view/javascript/${codename}.js`, `/* ${this.config.name} JS */`);
                    }
                } else {
                    // Other types: JS and CSS in view/javascript/{codename}/
                    if (this.config.files.js) {
                        catalog.file(`view/javascript/${codename}/${this.config.jsName}.js`, `/* ${this.config.name} JS */`);
                    }
                    if (this.config.files.css) {
                        catalog.file(`view/javascript/${codename}/${this.config.cssName}.css`, `/* ${this.config.name} CSS */`);
                    }
                }
            }
        }

        // install.xml
        if (this.config.files.ocmod) {
            zip.file("install.xml", this.getOcmodTemplate());
        }

        const content = await zip.generateAsync({
            type: "blob",
            mimeType: "application/zip",
            compression: "DEFLATE",
            compressionOptions: {
                level: 9
            }
        });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${codename}.ocmod.zip`;
        link.click();

        // Cleanup after a delay
        setTimeout(() => {
            URL.revokeObjectURL(link.href);
        }, 100);
    },

    // Generate class name for controller: ControllerExtension{Type}{Name}
    getControllerClassName(codename, type) {
        let parts = codename.split('_').filter(p => p.length > 0).map(p => p.charAt(0).toUpperCase() + p.slice(1));
        let typePart = type.charAt(0).toUpperCase() + type.slice(1);
        return `ControllerExtension${typePart}${parts.join('')}`;
    },

    // Generate class name for model: ModelExtension{Type}{Name}
    getModelClassName(codename, type) {
        let parts = codename.split('_').filter(p => p.length > 0).map(p => p.charAt(0).toUpperCase() + p.slice(1));
        let typePart = type.charAt(0).toUpperCase() + type.slice(1);
        return `ModelExtension${typePart}${parts.join('')}`;
    },

    // Templates
    getEventControllerTemplate() {
        const codename = this.config.codename;
        const type = this.config.type;
        // For event controllers: ControllerExtension{Type}{Name}Event
        let parts = codename.split('_').filter(p => p.length > 0).map(p => p.charAt(0).toUpperCase() + p.slice(1));
        let typePart = type.charAt(0).toUpperCase() + type.slice(1);
        const className = `ControllerExtension${typePart}${parts.join('')}Event`;

        return `<?php
class ${className} extends Controller {
	public function onBeforeHeader(&$route, &$args) {
		// Event handler logic before header
	}

	public function onAfterHeader(&$route, &$args, &$output) {
		// Event handler logic after header
	}
}`;
    },

    getAjaxControllerTemplate() {
        const codename = this.config.codename;
        const type = this.config.type;
        // For API controllers: ControllerExtension{Type}{Name}Api
        let parts = codename.split('_').filter(p => p.length > 0).map(p => p.charAt(0).toUpperCase() + p.slice(1));
        let typePart = type.charAt(0).toUpperCase() + type.slice(1);
        const className = `ControllerExtension${typePart}${parts.join('')}Api`;

        return `<?php
class ${className} extends Controller {
	public function index() {
		$this->load->language('extension/${type}/${codename}');

		$json = array();

		if (isset($this->request->post['data'])) {
			$json['success'] = true;
			$json['message'] = 'Success';
		} else {
			$json['error'] = 'No data';
		}

		$this->response->addHeader('Content-Type: application/json');
		$this->response->setOutput(json_encode($json));
	}
}`;
    },

    getAdminControllerTemplate(className) {
        const type = this.config.type;
        const codename = this.config.codename;
        const isMulti = this.config.isMultiModule;

        // Prefix for settings based on type (payment_, shipping_, module_, etc.)
        const settingPrefix = type + '_' + codename;

        // Type-specific templates
        if (type === 'payment') {
            return this.getPaymentAdminControllerTemplate(className, codename, settingPrefix);
        }
        if (type === 'shipping') {
            return this.getShippingAdminControllerTemplate(className, codename, settingPrefix);
        }
        if (type === 'total') {
            return this.getTotalAdminControllerTemplate(className, codename, settingPrefix);
        }
        if (type === 'module') {
            return this.getModuleAdminControllerTemplate(className, codename, isMulti);
        }

        // Default template for other types
        return this.getDefaultAdminControllerTemplate(className, type, codename, settingPrefix, isMulti);
    },

    getPaymentAdminControllerTemplate(className, codename, prefix) {
        const customFields = this.fields.map(field => {
            return `		if (isset($this->request->post['${prefix}_${field.key}'])) {
			$data['${prefix}_${field.key}'] = $this->request->post['${prefix}_${field.key}'];
		} else {
			$data['${prefix}_${field.key}'] = $this->config->get('${prefix}_${field.key}');
		}`;
        }).join('\n\n');

        return `<?php
class ${className} extends Controller {
	private $error = array();

	public function index() {
		$this->load->language('extension/payment/${codename}');

		$this->document->setTitle($this->language->get('heading_title'));

		$this->load->model('setting/setting');

		if (($this->request->server['REQUEST_METHOD'] == 'POST') && $this->validate()) {
			$this->model_setting_setting->editSetting('${prefix}', $this->request->post);

			$this->session->data['success'] = $this->language->get('text_success');

			$this->response->redirect($this->url->link('marketplace/extension', 'user_token=' . $this->session->data['user_token'] . '&type=payment', true));
		}

		if (isset($this->error['warning'])) {
			$data['error_warning'] = $this->error['warning'];
		} else {
			$data['error_warning'] = '';
		}

		$data['breadcrumbs'] = array();

		$data['breadcrumbs'][] = array(
			'text' => $this->language->get('text_home'),
			'href' => $this->url->link('common/dashboard', 'user_token=' . $this->session->data['user_token'], true)
		);

		$data['breadcrumbs'][] = array(
			'text' => $this->language->get('text_extension'),
			'href' => $this->url->link('marketplace/extension', 'user_token=' . $this->session->data['user_token'] . '&type=payment', true)
		);

		$data['breadcrumbs'][] = array(
			'text' => $this->language->get('heading_title'),
			'href' => $this->url->link('extension/payment/${codename}', 'user_token=' . $this->session->data['user_token'], true)
		);

		$data['action'] = $this->url->link('extension/payment/${codename}', 'user_token=' . $this->session->data['user_token'], true);

		$data['cancel'] = $this->url->link('marketplace/extension', 'user_token=' . $this->session->data['user_token'] . '&type=payment', true);

		// Total (minimum order amount)
		if (isset($this->request->post['${prefix}_total'])) {
			$data['${prefix}_total'] = $this->request->post['${prefix}_total'];
		} else {
			$data['${prefix}_total'] = $this->config->get('${prefix}_total');
		}

		// Order Status
		if (isset($this->request->post['${prefix}_order_status_id'])) {
			$data['${prefix}_order_status_id'] = $this->request->post['${prefix}_order_status_id'];
		} else {
			$data['${prefix}_order_status_id'] = $this->config->get('${prefix}_order_status_id');
		}

		$this->load->model('localisation/order_status');

		$data['order_statuses'] = $this->model_localisation_order_status->getOrderStatuses();

		// Geo Zone
		if (isset($this->request->post['${prefix}_geo_zone_id'])) {
			$data['${prefix}_geo_zone_id'] = $this->request->post['${prefix}_geo_zone_id'];
		} else {
			$data['${prefix}_geo_zone_id'] = $this->config->get('${prefix}_geo_zone_id');
		}

		$this->load->model('localisation/geo_zone');

		$data['geo_zones'] = $this->model_localisation_geo_zone->getGeoZones();

		// Status
		if (isset($this->request->post['${prefix}_status'])) {
			$data['${prefix}_status'] = $this->request->post['${prefix}_status'];
		} else {
			$data['${prefix}_status'] = $this->config->get('${prefix}_status');
		}

		// Sort Order
		if (isset($this->request->post['${prefix}_sort_order'])) {
			$data['${prefix}_sort_order'] = $this->request->post['${prefix}_sort_order'];
		} else {
			$data['${prefix}_sort_order'] = $this->config->get('${prefix}_sort_order');
		}

${customFields ? customFields + '\n' : ''}
		$data['header'] = $this->load->controller('common/header');
		$data['column_left'] = $this->load->controller('common/column_left');
		$data['footer'] = $this->load->controller('common/footer');

		$this->response->setOutput($this->load->view('extension/payment/${codename}', $data));
	}

	protected function validate() {
		if (!$this->user->hasPermission('modify', 'extension/payment/${codename}')) {
			$this->error['warning'] = $this->language->get('error_permission');
		}

		return !$this->error;
	}
}
`;
    },

    getShippingAdminControllerTemplate(className, codename, prefix) {
        const customFields = this.fields.map(field => {
            return `		if (isset($this->request->post['${prefix}_${field.key}'])) {
			$data['${prefix}_${field.key}'] = $this->request->post['${prefix}_${field.key}'];
		} else {
			$data['${prefix}_${field.key}'] = $this->config->get('${prefix}_${field.key}');
		}`;
        }).join('\n\n');

        return `<?php
class ${className} extends Controller {
	private $error = array();

	public function index() {
		$this->load->language('extension/shipping/${codename}');

		$this->document->setTitle($this->language->get('heading_title'));

		$this->load->model('setting/setting');

		if (($this->request->server['REQUEST_METHOD'] == 'POST') && $this->validate()) {
			$this->model_setting_setting->editSetting('${prefix}', $this->request->post);

			$this->session->data['success'] = $this->language->get('text_success');

			$this->response->redirect($this->url->link('marketplace/extension', 'user_token=' . $this->session->data['user_token'] . '&type=shipping', true));
		}

		if (isset($this->error['warning'])) {
			$data['error_warning'] = $this->error['warning'];
		} else {
			$data['error_warning'] = '';
		}

		$data['breadcrumbs'] = array();

		$data['breadcrumbs'][] = array(
			'text' => $this->language->get('text_home'),
			'href' => $this->url->link('common/dashboard', 'user_token=' . $this->session->data['user_token'], true)
		);

		$data['breadcrumbs'][] = array(
			'text' => $this->language->get('text_extension'),
			'href' => $this->url->link('marketplace/extension', 'user_token=' . $this->session->data['user_token'] . '&type=shipping', true)
		);

		$data['breadcrumbs'][] = array(
			'text' => $this->language->get('heading_title'),
			'href' => $this->url->link('extension/shipping/${codename}', 'user_token=' . $this->session->data['user_token'], true)
		);

		$data['action'] = $this->url->link('extension/shipping/${codename}', 'user_token=' . $this->session->data['user_token'], true);

		$data['cancel'] = $this->url->link('marketplace/extension', 'user_token=' . $this->session->data['user_token'] . '&type=shipping', true);

		// Cost
		if (isset($this->request->post['${prefix}_cost'])) {
			$data['${prefix}_cost'] = $this->request->post['${prefix}_cost'];
		} else {
			$data['${prefix}_cost'] = $this->config->get('${prefix}_cost');
		}

		// Tax Class
		if (isset($this->request->post['${prefix}_tax_class_id'])) {
			$data['${prefix}_tax_class_id'] = $this->request->post['${prefix}_tax_class_id'];
		} else {
			$data['${prefix}_tax_class_id'] = $this->config->get('${prefix}_tax_class_id');
		}

		$this->load->model('localisation/tax_class');

		$data['tax_classes'] = $this->model_localisation_tax_class->getTaxClasses();

		// Geo Zone
		if (isset($this->request->post['${prefix}_geo_zone_id'])) {
			$data['${prefix}_geo_zone_id'] = $this->request->post['${prefix}_geo_zone_id'];
		} else {
			$data['${prefix}_geo_zone_id'] = $this->config->get('${prefix}_geo_zone_id');
		}

		$this->load->model('localisation/geo_zone');

		$data['geo_zones'] = $this->model_localisation_geo_zone->getGeoZones();

		// Status
		if (isset($this->request->post['${prefix}_status'])) {
			$data['${prefix}_status'] = $this->request->post['${prefix}_status'];
		} else {
			$data['${prefix}_status'] = $this->config->get('${prefix}_status');
		}

		// Sort Order
		if (isset($this->request->post['${prefix}_sort_order'])) {
			$data['${prefix}_sort_order'] = $this->request->post['${prefix}_sort_order'];
		} else {
			$data['${prefix}_sort_order'] = $this->config->get('${prefix}_sort_order');
		}

${customFields ? customFields + '\n' : ''}
		$data['header'] = $this->load->controller('common/header');
		$data['column_left'] = $this->load->controller('common/column_left');
		$data['footer'] = $this->load->controller('common/footer');

		$this->response->setOutput($this->load->view('extension/shipping/${codename}', $data));
	}

	protected function validate() {
		if (!$this->user->hasPermission('modify', 'extension/shipping/${codename}')) {
			$this->error['warning'] = $this->language->get('error_permission');
		}

		return !$this->error;
	}
}
`;
    },

    getTotalAdminControllerTemplate(className, codename, prefix) {
        const customFields = this.fields.map(field => {
            return `		if (isset($this->request->post['${prefix}_${field.key}'])) {
			$data['${prefix}_${field.key}'] = $this->request->post['${prefix}_${field.key}'];
		} else {
			$data['${prefix}_${field.key}'] = $this->config->get('${prefix}_${field.key}');
		}`;
        }).join('\n\n');

        return `<?php
class ${className} extends Controller {
	private $error = array();

	public function index() {
		$this->load->language('extension/total/${codename}');

		$this->document->setTitle($this->language->get('heading_title'));

		$this->load->model('setting/setting');

		if (($this->request->server['REQUEST_METHOD'] == 'POST') && $this->validate()) {
			$this->model_setting_setting->editSetting('${prefix}', $this->request->post);

			$this->session->data['success'] = $this->language->get('text_success');

			$this->response->redirect($this->url->link('marketplace/extension', 'user_token=' . $this->session->data['user_token'] . '&type=total', true));
		}

		if (isset($this->error['warning'])) {
			$data['error_warning'] = $this->error['warning'];
		} else {
			$data['error_warning'] = '';
		}

		$data['breadcrumbs'] = array();

		$data['breadcrumbs'][] = array(
			'text' => $this->language->get('text_home'),
			'href' => $this->url->link('common/dashboard', 'user_token=' . $this->session->data['user_token'], true)
		);

		$data['breadcrumbs'][] = array(
			'text' => $this->language->get('text_extension'),
			'href' => $this->url->link('marketplace/extension', 'user_token=' . $this->session->data['user_token'] . '&type=total', true)
		);

		$data['breadcrumbs'][] = array(
			'text' => $this->language->get('heading_title'),
			'href' => $this->url->link('extension/total/${codename}', 'user_token=' . $this->session->data['user_token'], true)
		);

		$data['action'] = $this->url->link('extension/total/${codename}', 'user_token=' . $this->session->data['user_token'], true);

		$data['cancel'] = $this->url->link('marketplace/extension', 'user_token=' . $this->session->data['user_token'] . '&type=total', true);

		// Total (minimum order amount to apply)
		if (isset($this->request->post['${prefix}_total'])) {
			$data['${prefix}_total'] = $this->request->post['${prefix}_total'];
		} else {
			$data['${prefix}_total'] = $this->config->get('${prefix}_total');
		}

		// Fee amount
		if (isset($this->request->post['${prefix}_fee'])) {
			$data['${prefix}_fee'] = $this->request->post['${prefix}_fee'];
		} else {
			$data['${prefix}_fee'] = $this->config->get('${prefix}_fee');
		}

		// Tax Class
		if (isset($this->request->post['${prefix}_tax_class_id'])) {
			$data['${prefix}_tax_class_id'] = $this->request->post['${prefix}_tax_class_id'];
		} else {
			$data['${prefix}_tax_class_id'] = $this->config->get('${prefix}_tax_class_id');
		}

		$this->load->model('localisation/tax_class');

		$data['tax_classes'] = $this->model_localisation_tax_class->getTaxClasses();

		// Status
		if (isset($this->request->post['${prefix}_status'])) {
			$data['${prefix}_status'] = $this->request->post['${prefix}_status'];
		} else {
			$data['${prefix}_status'] = $this->config->get('${prefix}_status');
		}

		// Sort Order
		if (isset($this->request->post['${prefix}_sort_order'])) {
			$data['${prefix}_sort_order'] = $this->request->post['${prefix}_sort_order'];
		} else {
			$data['${prefix}_sort_order'] = $this->config->get('${prefix}_sort_order');
		}

${customFields ? customFields + '\n' : ''}
		$data['header'] = $this->load->controller('common/header');
		$data['column_left'] = $this->load->controller('common/column_left');
		$data['footer'] = $this->load->controller('common/footer');

		$this->response->setOutput($this->load->view('extension/total/${codename}', $data));
	}

	protected function validate() {
		if (!$this->user->hasPermission('modify', 'extension/total/${codename}')) {
			$this->error['warning'] = $this->language->get('error_permission');
		}

		return !$this->error;
	}
}
`;
    },

    getModuleAdminControllerTemplate(className, codename, isMulti) {
        // Custom fields for module - stored in module settings
        const customFieldsPost = this.fields.map(field => {
            return `		if (isset($this->request->post['${field.key}'])) {
			$data['${field.key}'] = $this->request->post['${field.key}'];
		} elseif (!empty($module_info)) {
			$data['${field.key}'] = $module_info['${field.key}'];
		} else {
			$data['${field.key}'] = '';
		}`;
        }).join('\n\n');

        return `<?php
class ${className} extends Controller {
	private $error = array();

	public function index() {
		$this->load->language('extension/module/${codename}');

		$this->document->setTitle($this->language->get('heading_title'));

		$this->load->model('setting/module');

		if (($this->request->server['REQUEST_METHOD'] == 'POST') && $this->validate()) {
			if (!isset($this->request->get['module_id'])) {
				$this->model_setting_module->addModule('${codename}', $this->request->post);
			} else {
				$this->model_setting_module->editModule($this->request->get['module_id'], $this->request->post);
			}

			$this->session->data['success'] = $this->language->get('text_success');

			$this->response->redirect($this->url->link('marketplace/extension', 'user_token=' . $this->session->data['user_token'] . '&type=module', true));
		}

		if (isset($this->error['warning'])) {
			$data['error_warning'] = $this->error['warning'];
		} else {
			$data['error_warning'] = '';
		}

		if (isset($this->error['name'])) {
			$data['error_name'] = $this->error['name'];
		} else {
			$data['error_name'] = '';
		}

		$data['breadcrumbs'] = array();

		$data['breadcrumbs'][] = array(
			'text' => $this->language->get('text_home'),
			'href' => $this->url->link('common/dashboard', 'user_token=' . $this->session->data['user_token'], true)
		);

		$data['breadcrumbs'][] = array(
			'text' => $this->language->get('text_extension'),
			'href' => $this->url->link('marketplace/extension', 'user_token=' . $this->session->data['user_token'] . '&type=module', true)
		);

		if (!isset($this->request->get['module_id'])) {
			$data['breadcrumbs'][] = array(
				'text' => $this->language->get('heading_title'),
				'href' => $this->url->link('extension/module/${codename}', 'user_token=' . $this->session->data['user_token'], true)
			);
		} else {
			$data['breadcrumbs'][] = array(
				'text' => $this->language->get('heading_title'),
				'href' => $this->url->link('extension/module/${codename}', 'user_token=' . $this->session->data['user_token'] . '&module_id=' . $this->request->get['module_id'], true)
			);
		}

		if (!isset($this->request->get['module_id'])) {
			$data['action'] = $this->url->link('extension/module/${codename}', 'user_token=' . $this->session->data['user_token'], true);
		} else {
			$data['action'] = $this->url->link('extension/module/${codename}', 'user_token=' . $this->session->data['user_token'] . '&module_id=' . $this->request->get['module_id'], true);
		}

		$data['cancel'] = $this->url->link('marketplace/extension', 'user_token=' . $this->session->data['user_token'] . '&type=module', true);

		if (isset($this->request->get['module_id']) && ($this->request->server['REQUEST_METHOD'] != 'POST')) {
			$module_info = $this->model_setting_module->getModule($this->request->get['module_id']);
		}

		// Module name
		if (isset($this->request->post['name'])) {
			$data['name'] = $this->request->post['name'];
		} elseif (!empty($module_info)) {
			$data['name'] = $module_info['name'];
		} else {
			$data['name'] = '';
		}

		// Width
		if (isset($this->request->post['width'])) {
			$data['width'] = $this->request->post['width'];
		} elseif (!empty($module_info)) {
			$data['width'] = $module_info['width'];
		} else {
			$data['width'] = '';
		}

		// Height
		if (isset($this->request->post['height'])) {
			$data['height'] = $this->request->post['height'];
		} elseif (!empty($module_info)) {
			$data['height'] = $module_info['height'];
		} else {
			$data['height'] = '';
		}

		// Status
		if (isset($this->request->post['status'])) {
			$data['status'] = $this->request->post['status'];
		} elseif (!empty($module_info)) {
			$data['status'] = $module_info['status'];
		} else {
			$data['status'] = '';
		}

${customFieldsPost}

		$data['header'] = $this->load->controller('common/header');
		$data['column_left'] = $this->load->controller('common/column_left');
		$data['footer'] = $this->load->controller('common/footer');

		$this->response->setOutput($this->load->view('extension/module/${codename}', $data));
	}

	protected function validate() {
		if (!$this->user->hasPermission('modify', 'extension/module/${codename}')) {
			$this->error['warning'] = $this->language->get('error_permission');
		}

		if ((utf8_strlen($this->request->post['name']) < 3) || (utf8_strlen($this->request->post['name']) > 64)) {
			$this->error['name'] = $this->language->get('error_name');
		}

		return !$this->error;
	}
}
`;
    },

    getDefaultAdminControllerTemplate(className, type, codename, settingPrefix, isMulti) {
        const customFields = this.fields.map(field => {
            return `		if (isset($this->request->post['${settingPrefix}_${field.key}'])) {
			$data['${settingPrefix}_${field.key}'] = $this->request->post['${settingPrefix}_${field.key}'];
		} else {
			$data['${settingPrefix}_${field.key}'] = $this->config->get('${settingPrefix}_${field.key}');
		}`;
        }).join('\n\n');

        return `<?php
class ${className} extends Controller {
	private $error = array();

	public function index() {
		$this->load->language('extension/${type}/${codename}');

		$this->document->setTitle($this->language->get('heading_title'));

		$this->load->model('setting/setting');
${isMulti ? `		$this->load->model('setting/module');\n` : ''}
		if (($this->request->server['REQUEST_METHOD'] == 'POST') && $this->validate()) {
			${isMulti ? `if (!isset($this->request->get['module_id'])) {
				$this->model_setting_module->addModule('${codename}', $this->request->post);
			} else {
				$this->model_setting_module->editModule($this->request->get['module_id'], $this->request->post);
			}` : `$this->model_setting_setting->editSetting('${settingPrefix}', $this->request->post);`}

			$this->session->data['success'] = $this->language->get('text_success');

			$this->response->redirect($this->url->link('marketplace/extension', 'user_token=' . $this->session->data['user_token'] . '&type=${type}', true));
		}

		if (isset($this->error['warning'])) {
			$data['error_warning'] = $this->error['warning'];
		} else {
			$data['error_warning'] = '';
		}

		$data['breadcrumbs'] = array();

		$data['breadcrumbs'][] = array(
			'text' => $this->language->get('text_home'),
			'href' => $this->url->link('common/dashboard', 'user_token=' . $this->session->data['user_token'], true)
		);

		$data['breadcrumbs'][] = array(
			'text' => $this->language->get('text_extension'),
			'href' => $this->url->link('marketplace/extension', 'user_token=' . $this->session->data['user_token'] . '&type=${type}', true)
		);

		$data['breadcrumbs'][] = array(
			'text' => $this->language->get('heading_title'),
			'href' => $this->url->link('extension/${type}/${codename}', 'user_token=' . $this->session->data['user_token'], true)
		);

		$data['action'] = $this->url->link('extension/${type}/${codename}', 'user_token=' . $this->session->data['user_token'], true);

		$data['cancel'] = $this->url->link('marketplace/extension', 'user_token=' . $this->session->data['user_token'] . '&type=${type}', true);

		// Status
		if (isset($this->request->post['${settingPrefix}_status'])) {
			$data['${settingPrefix}_status'] = $this->request->post['${settingPrefix}_status'];
		} else {
			$data['${settingPrefix}_status'] = $this->config->get('${settingPrefix}_status');
		}

${customFields ? customFields + '\n' : ''}
		$data['header'] = $this->load->controller('common/header');
		$data['column_left'] = $this->load->controller('common/column_left');
		$data['footer'] = $this->load->controller('common/footer');

		$this->response->setOutput($this->load->view('extension/${type}/${codename}', $data));
	}

	protected function validate() {
		if (!$this->user->hasPermission('modify', 'extension/${type}/${codename}')) {
			$this->error['warning'] = $this->language->get('error_permission');
		}

		return !$this->error;
	}
}
`;
    },

    getAdminModelTemplate(className) {
        return `<?php
class ${className} extends Model {
	public function install() {
		// install logic
	}

	public function uninstall() {
		// uninstall logic
	}
}
`;
    },

    getCatalogModelTemplate(className) {
        const codename = this.config.codename;
        const type = this.config.type;
        const name = this.config.name;

        if (type === 'payment') {
            return `<?php
class ${className} extends Model {
	public function getMethod($address, $total) {
		$this->load->language('extension/payment/${codename}');

		$query = $this->db->query("SELECT * FROM " . DB_PREFIX . "zone_to_geo_zone WHERE geo_zone_id = '" . (int)$this->config->get('payment_${codename}_geo_zone_id') . "' AND country_id = '" . (int)$address['country_id'] . "' AND (zone_id = '" . (int)$address['zone_id'] . "' OR zone_id = '0')");

		if ($this->config->get('payment_${codename}_total') > 0 && $this->config->get('payment_${codename}_total') > $total) {
			$status = false;
		} elseif (!$this->config->get('payment_${codename}_geo_zone_id')) {
			$status = true;
		} elseif ($query->num_rows) {
			$status = true;
		} else {
			$status = false;
		}

		$method_data = array();

		if ($status) {
			$method_data = array(
				'code'       => '${codename}',
				'title'      => $this->language->get('text_title'),
				'terms'      => '',
				'sort_order' => $this->config->get('payment_${codename}_sort_order')
			);
		}

		return $method_data;
	}
}`;
        }

        if (type === 'shipping') {
            return `<?php
class ${className} extends Model {
	function getQuote($address) {
		$this->load->language('extension/shipping/${codename}');

		$query = $this->db->query("SELECT * FROM " . DB_PREFIX . "zone_to_geo_zone WHERE geo_zone_id = '" . (int)$this->config->get('shipping_${codename}_geo_zone_id') . "' AND country_id = '" . (int)$address['country_id'] . "' AND (zone_id = '" . (int)$address['zone_id'] . "' OR zone_id = '0')");

		if (!$this->config->get('shipping_${codename}_geo_zone_id')) {
			$status = true;
		} elseif ($query->num_rows) {
			$status = true;
		} else {
			$status = false;
		}

		$method_data = array();

		if ($status) {
			$quote_data = array();

			$quote_data['${codename}'] = array(
				'code'         => '${codename}.${codename}',
				'title'        => $this->language->get('text_title'),
				'cost'         => $this->config->get('shipping_${codename}_cost'),
				'tax_class_id' => $this->config->get('shipping_${codename}_tax_class_id'),
				'text'         => $this->currency->format($this->tax->calculate($this->config->get('shipping_${codename}_cost'), $this->config->get('shipping_${codename}_tax_class_id'), $this->config->get('config_tax')), $this->session->data['currency'])
			);

			$method_data = array(
				'code'       => '${codename}',
				'title'      => $this->language->get('text_title'),
				'quote'      => $quote_data,
				'sort_order' => $this->config->get('shipping_${codename}_sort_order'),
				'error'      => false
			);
		}

		return $method_data;
	}
}`;
        }

        if (type === 'total') {
            return `<?php
class ${className} extends Model {
	public function getTotal($total) {
		if ($this->cart->getSubTotal() > 0) {
			$this->load->language('extension/total/${codename}');

			// Check if order subtotal is above threshold
			if (($this->config->get('total_${codename}_total') > 0) && ($this->cart->getSubTotal() < $this->config->get('total_${codename}_total'))) {
				return;
			}

			$total['totals'][] = array(
				'code'       => '${codename}',
				'title'      => $this->language->get('text_${codename}'),
				'value'      => $this->config->get('total_${codename}_fee'),
				'sort_order' => $this->config->get('total_${codename}_sort_order')
			);

			if ($this->config->get('total_${codename}_tax_class_id')) {
				$tax_rates = $this->tax->getRates($this->config->get('total_${codename}_fee'), $this->config->get('total_${codename}_tax_class_id'));

				foreach ($tax_rates as $tax_rate) {
					if (!isset($total['taxes'][$tax_rate['tax_rate_id']])) {
						$total['taxes'][$tax_rate['tax_rate_id']] = $tax_rate['amount'];
					} else {
						$total['taxes'][$tax_rate['tax_rate_id']] += $tax_rate['amount'];
					}
				}
			}

			$total['total'] += $this->config->get('total_${codename}_fee');
		}
	}
}`;
        }

        return `<?php
class ${className} extends Model {
	public function getExampleData() {
		return array();
	}
}
`;
    },

    getLanguageTemplate(name, lang = 'en', side = 'admin') {
        const type = this.config.type;
        const isRu = lang === 'ru';

        // Catalog side language - simpler, with text_title and text_description for payment/shipping
        if (side === 'catalog') {
            return this.getCatalogLanguageTemplate(name, lang);
        }

        // Admin side language
        const success = isRu ? 'Настройки успешно обновлены!' : 'Success: You have modified the settings!';
        const error = isRu ? 'У вас нет прав для изменения настроек!' : 'Warning: You do not have permission to modify settings!';

        // Type-specific entries and text
        let typeEntries = '';
        let typeTexts = '';

        if (type === 'payment') {
            typeTexts = isRu
                ? `$_['text_all_zones']   = 'Все зоны';`
                : `$_['text_all_zones']   = 'All Zones';`;
            typeEntries = isRu
                ? `$_['entry_total']        = 'Минимальная сумма заказа';
$_['entry_order_status'] = 'Статус заказа';
$_['entry_geo_zone']     = 'Географическая зона';
$_['entry_sort_order']   = 'Порядок сортировки';

// Help
$_['help_total']         = 'Минимальная сумма заказа для активации метода оплаты.';`
                : `$_['entry_total']        = 'Total';
$_['entry_order_status'] = 'Order Status';
$_['entry_geo_zone']     = 'Geo Zone';
$_['entry_sort_order']   = 'Sort Order';

// Help
$_['help_total']         = 'The checkout total the order must reach before this payment method becomes active.';`;
        } else if (type === 'shipping') {
            typeTexts = isRu
                ? `$_['text_all_zones']   = 'Все зоны';
$_['text_none']        = 'Нет';`
                : `$_['text_all_zones']   = 'All Zones';
$_['text_none']        = 'None';`;
            typeEntries = isRu
                ? `$_['entry_cost']       = 'Стоимость';
$_['entry_tax_class']  = 'Класс налога';
$_['entry_geo_zone']   = 'Географическая зона';
$_['entry_sort_order'] = 'Порядок сортировки';`
                : `$_['entry_cost']       = 'Cost';
$_['entry_tax_class']  = 'Tax Class';
$_['entry_geo_zone']   = 'Geo Zone';
$_['entry_sort_order'] = 'Sort Order';`;
        } else if (type === 'total') {
            typeTexts = isRu
                ? `$_['text_none']        = 'Нет';`
                : `$_['text_none']        = 'None';`;
            typeEntries = isRu
                ? `$_['entry_total']      = 'Порог суммы заказа';
$_['entry_fee']        = 'Сумма';
$_['entry_tax_class']  = 'Класс налога';
$_['entry_sort_order'] = 'Порядок сортировки';

// Help
$_['help_total']       = 'Минимальная сумма заказа для применения.';`
                : `$_['entry_total']      = 'Order Total';
$_['entry_fee']        = 'Fee';
$_['entry_tax_class']  = 'Tax Class';
$_['entry_sort_order'] = 'Sort Order';

// Help
$_['help_total']       = 'Minimum order total required before this order total is applied.';`;
        } else if (type === 'module') {
            typeEntries = isRu
                ? `$_['entry_name']       = 'Название модуля';
$_['entry_width']      = 'Ширина';
$_['entry_height']     = 'Высота';

// Error
$_['error_name']       = 'Название должно быть от 3 до 64 символов!';`
                : `$_['entry_name']       = 'Module Name';
$_['entry_width']      = 'Width';
$_['entry_height']     = 'Height';

// Error
$_['error_name']       = 'Module Name must be between 3 and 64 characters!';`;
        }

        return `<?php
// Heading
$_['heading_title']    = '${name}';

// Text
$_['text_extension']   = '${isRu ? 'Расширения' : 'Extensions'}';
$_['text_success']     = '${success}';
$_['text_edit']        = '${isRu ? 'Редактировать' : 'Edit'} ${name}';
${typeTexts}

// Entry
$_['entry_status']     = '${isRu ? 'Статус' : 'Status'}';
${typeEntries}
${this.fields.map(field => {
            return `$_['entry_${field.key}'] = '${field.name}';`;
        }).join('\n')}

// Error
$_['error_permission'] = '${error}';
`;
    },

    getCatalogLanguageTemplate(name, lang = 'en') {
        const type = this.config.type;
        const codename = this.config.codename;
        const isRu = lang === 'ru';

        // Payment and Shipping need text_title and text_description
        if (type === 'payment' || type === 'shipping') {
            const titleLabel = name;
            // Use user-provided description or default placeholder
            const userDesc = this.config.description;
            const defaultDesc = isRu
                ? (type === 'payment' ? 'Безопасная оплата заказа' : 'Надёжная доставка заказа')
                : (type === 'payment' ? 'Secure payment method' : 'Reliable shipping method');
            const descLabel = userDesc || defaultDesc;

            return `<?php
// Text
$_['text_title']       = '${titleLabel}';
$_['text_description'] = '${descLabel}';
${type === 'payment' ? `$_['button_confirm']   = '${isRu ? 'Подтверждение заказа' : 'Confirm Order'}';
$_['text_loading']     = '${isRu ? 'Загрузка...' : 'Loading...'}';` : ''}
`;
        }

        // Order Total needs text_codename for display in checkout totals
        if (type === 'total') {
            return `<?php
// Text
$_['text_${codename}'] = '${name}';
`;
        }

        // Default catalog language for other types
        return `<?php
// Text
$_['heading_title'] = '${name}';
`;
    },

    getAdminViewTemplate() {
        const type = this.config.type;
        const codename = this.config.codename;
        const prefix = type + '_' + codename;

        if (type === 'payment') {
            return this.getPaymentAdminViewTemplate(codename, prefix);
        }
        if (type === 'shipping') {
            return this.getShippingAdminViewTemplate(codename, prefix);
        }
        if (type === 'total') {
            return this.getTotalAdminViewTemplate(codename, prefix);
        }
        if (type === 'module') {
            return this.getModuleAdminViewTemplate(codename);
        }

        return this.getDefaultAdminViewTemplate(type, codename, prefix);
    },

    getPaymentAdminViewTemplate(codename, prefix) {
        const customFields = this.fields.map(field => {
            const fullKey = prefix + '_' + field.key;
            let input = '';
            if (field.type === 'textarea') {
                input = `<textarea name="${fullKey}" id="input-${field.key}" class="form-control">{{ ${fullKey} }}</textarea>`;
            } else if (field.type === 'toggle') {
                input = `<select name="${fullKey}" id="input-${field.key}" class="form-control">
                {% if ${fullKey} %}
                <option value="1" selected="selected">{{ text_enabled }}</option>
                <option value="0">{{ text_disabled }}</option>
                {% else %}
                <option value="1">{{ text_enabled }}</option>
                <option value="0" selected="selected">{{ text_disabled }}</option>
                {% endif %}
              </select>`;
            } else {
                input = `<input type="text" name="${fullKey}" value="{{ ${fullKey} }}" placeholder="{{ entry_${field.key} }}" id="input-${field.key}" class="form-control" />`;
            }
            return `          <div class="form-group">
            <label class="col-sm-2 control-label" for="input-${field.key}">{{ entry_${field.key} }}</label>
            <div class="col-sm-10">
              ${input}
            </div>
          </div>`;
        }).join('\n');

        return `{{ header }}{{ column_left }}
<div id="content">
  <div class="page-header">
    <div class="container-fluid">
      <div class="pull-right">
        <button type="submit" form="form-payment" data-toggle="tooltip" title="{{ button_save }}" class="btn btn-primary"><i class="fa fa-save"></i></button>
        <a href="{{ cancel }}" data-toggle="tooltip" title="{{ button_cancel }}" class="btn btn-default"><i class="fa fa-reply"></i></a></div>
      <h1>{{ heading_title }}</h1>
      <ul class="breadcrumb">
        {% for breadcrumb in breadcrumbs %}
        <li><a href="{{ breadcrumb.href }}">{{ breadcrumb.text }}</a></li>
        {% endfor %}
      </ul>
    </div>
  </div>
  <div class="container-fluid">
    {% if error_warning %}
    <div class="alert alert-danger alert-dismissible"><i class="fa fa-exclamation-circle"></i> {{ error_warning }}
      <button type="button" class="close" data-dismiss="alert">&times;</button>
    </div>
    {% endif %}
    <div class="panel panel-default">
      <div class="panel-heading">
        <h3 class="panel-title"><i class="fa fa-pencil"></i> {{ text_edit }}</h3>
      </div>
      <div class="panel-body">
        <form action="{{ action }}" method="post" enctype="multipart/form-data" id="form-payment" class="form-horizontal">
          <div class="form-group">
            <label class="col-sm-2 control-label" for="input-total"><span data-toggle="tooltip" title="{{ help_total }}">{{ entry_total }}</span></label>
            <div class="col-sm-10">
              <input type="text" name="${prefix}_total" value="{{ ${prefix}_total }}" placeholder="{{ entry_total }}" id="input-total" class="form-control" />
            </div>
          </div>
          <div class="form-group">
            <label class="col-sm-2 control-label" for="input-order-status">{{ entry_order_status }}</label>
            <div class="col-sm-10">
              <select name="${prefix}_order_status_id" id="input-order-status" class="form-control">
                {% for order_status in order_statuses %}
                {% if order_status.order_status_id == ${prefix}_order_status_id %}
                <option value="{{ order_status.order_status_id }}" selected="selected">{{ order_status.name }}</option>
                {% else %}
                <option value="{{ order_status.order_status_id }}">{{ order_status.name }}</option>
                {% endif %}
                {% endfor %}
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="col-sm-2 control-label" for="input-geo-zone">{{ entry_geo_zone }}</label>
            <div class="col-sm-10">
              <select name="${prefix}_geo_zone_id" id="input-geo-zone" class="form-control">
                <option value="0">{{ text_all_zones }}</option>
                {% for geo_zone in geo_zones %}
                {% if geo_zone.geo_zone_id == ${prefix}_geo_zone_id %}
                <option value="{{ geo_zone.geo_zone_id }}" selected="selected">{{ geo_zone.name }}</option>
                {% else %}
                <option value="{{ geo_zone.geo_zone_id }}">{{ geo_zone.name }}</option>
                {% endif %}
                {% endfor %}
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="col-sm-2 control-label" for="input-status">{{ entry_status }}</label>
            <div class="col-sm-10">
              <select name="${prefix}_status" id="input-status" class="form-control">
                {% if ${prefix}_status %}
                <option value="1" selected="selected">{{ text_enabled }}</option>
                <option value="0">{{ text_disabled }}</option>
                {% else %}
                <option value="1">{{ text_enabled }}</option>
                <option value="0" selected="selected">{{ text_disabled }}</option>
                {% endif %}
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="col-sm-2 control-label" for="input-sort-order">{{ entry_sort_order }}</label>
            <div class="col-sm-10">
              <input type="text" name="${prefix}_sort_order" value="{{ ${prefix}_sort_order }}" placeholder="{{ entry_sort_order }}" id="input-sort-order" class="form-control" />
            </div>
          </div>
${customFields}
        </form>
      </div>
    </div>
  </div>
</div>
{{ footer }}`;
    },

    getShippingAdminViewTemplate(codename, prefix) {
        const customFields = this.fields.map(field => {
            const fullKey = prefix + '_' + field.key;
            let input = '';
            if (field.type === 'textarea') {
                input = `<textarea name="${fullKey}" id="input-${field.key}" class="form-control">{{ ${fullKey} }}</textarea>`;
            } else if (field.type === 'toggle') {
                input = `<select name="${fullKey}" id="input-${field.key}" class="form-control">
                {% if ${fullKey} %}
                <option value="1" selected="selected">{{ text_enabled }}</option>
                <option value="0">{{ text_disabled }}</option>
                {% else %}
                <option value="1">{{ text_enabled }}</option>
                <option value="0" selected="selected">{{ text_disabled }}</option>
                {% endif %}
              </select>`;
            } else {
                input = `<input type="text" name="${fullKey}" value="{{ ${fullKey} }}" placeholder="{{ entry_${field.key} }}" id="input-${field.key}" class="form-control" />`;
            }
            return `          <div class="form-group">
            <label class="col-sm-2 control-label" for="input-${field.key}">{{ entry_${field.key} }}</label>
            <div class="col-sm-10">
              ${input}
            </div>
          </div>`;
        }).join('\n');

        return `{{ header }}{{ column_left }}
<div id="content">
  <div class="page-header">
    <div class="container-fluid">
      <div class="pull-right">
        <button type="submit" form="form-shipping" data-toggle="tooltip" title="{{ button_save }}" class="btn btn-primary"><i class="fa fa-save"></i></button>
        <a href="{{ cancel }}" data-toggle="tooltip" title="{{ button_cancel }}" class="btn btn-default"><i class="fa fa-reply"></i></a></div>
      <h1>{{ heading_title }}</h1>
      <ul class="breadcrumb">
        {% for breadcrumb in breadcrumbs %}
        <li><a href="{{ breadcrumb.href }}">{{ breadcrumb.text }}</a></li>
        {% endfor %}
      </ul>
    </div>
  </div>
  <div class="container-fluid">
    {% if error_warning %}
    <div class="alert alert-danger alert-dismissible"><i class="fa fa-exclamation-circle"></i> {{ error_warning }}
      <button type="button" class="close" data-dismiss="alert">&times;</button>
    </div>
    {% endif %}
    <div class="panel panel-default">
      <div class="panel-heading">
        <h3 class="panel-title"><i class="fa fa-pencil"></i> {{ text_edit }}</h3>
      </div>
      <div class="panel-body">
        <form action="{{ action }}" method="post" enctype="multipart/form-data" id="form-shipping" class="form-horizontal">
          <div class="form-group">
            <label class="col-sm-2 control-label" for="input-cost">{{ entry_cost }}</label>
            <div class="col-sm-10">
              <input type="text" name="${prefix}_cost" value="{{ ${prefix}_cost }}" placeholder="{{ entry_cost }}" id="input-cost" class="form-control" />
            </div>
          </div>
          <div class="form-group">
            <label class="col-sm-2 control-label" for="input-tax-class">{{ entry_tax_class }}</label>
            <div class="col-sm-10">
              <select name="${prefix}_tax_class_id" id="input-tax-class" class="form-control">
                <option value="0">{{ text_none }}</option>
                {% for tax_class in tax_classes %}
                {% if tax_class.tax_class_id == ${prefix}_tax_class_id %}
                <option value="{{ tax_class.tax_class_id }}" selected="selected">{{ tax_class.title }}</option>
                {% else %}
                <option value="{{ tax_class.tax_class_id }}">{{ tax_class.title }}</option>
                {% endif %}
                {% endfor %}
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="col-sm-2 control-label" for="input-geo-zone">{{ entry_geo_zone }}</label>
            <div class="col-sm-10">
              <select name="${prefix}_geo_zone_id" id="input-geo-zone" class="form-control">
                <option value="0">{{ text_all_zones }}</option>
                {% for geo_zone in geo_zones %}
                {% if geo_zone.geo_zone_id == ${prefix}_geo_zone_id %}
                <option value="{{ geo_zone.geo_zone_id }}" selected="selected">{{ geo_zone.name }}</option>
                {% else %}
                <option value="{{ geo_zone.geo_zone_id }}">{{ geo_zone.name }}</option>
                {% endif %}
                {% endfor %}
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="col-sm-2 control-label" for="input-status">{{ entry_status }}</label>
            <div class="col-sm-10">
              <select name="${prefix}_status" id="input-status" class="form-control">
                {% if ${prefix}_status %}
                <option value="1" selected="selected">{{ text_enabled }}</option>
                <option value="0">{{ text_disabled }}</option>
                {% else %}
                <option value="1">{{ text_enabled }}</option>
                <option value="0" selected="selected">{{ text_disabled }}</option>
                {% endif %}
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="col-sm-2 control-label" for="input-sort-order">{{ entry_sort_order }}</label>
            <div class="col-sm-10">
              <input type="text" name="${prefix}_sort_order" value="{{ ${prefix}_sort_order }}" placeholder="{{ entry_sort_order }}" id="input-sort-order" class="form-control" />
            </div>
          </div>
${customFields}
        </form>
      </div>
    </div>
  </div>
</div>
{{ footer }}`;
    },

    getTotalAdminViewTemplate(codename, prefix) {
        const customFields = this.fields.map(field => {
            const fullKey = prefix + '_' + field.key;
            let input = '';
            if (field.type === 'textarea') {
                input = `<textarea name="${fullKey}" id="input-${field.key}" class="form-control">{{ ${fullKey} }}</textarea>`;
            } else if (field.type === 'toggle') {
                input = `<select name="${fullKey}" id="input-${field.key}" class="form-control">
                {% if ${fullKey} %}
                <option value="1" selected="selected">{{ text_enabled }}</option>
                <option value="0">{{ text_disabled }}</option>
                {% else %}
                <option value="1">{{ text_enabled }}</option>
                <option value="0" selected="selected">{{ text_disabled }}</option>
                {% endif %}
              </select>`;
            } else {
                input = `<input type="text" name="${fullKey}" value="{{ ${fullKey} }}" placeholder="{{ entry_${field.key} }}" id="input-${field.key}" class="form-control" />`;
            }
            return `          <div class="form-group">
            <label class="col-sm-2 control-label" for="input-${field.key}">{{ entry_${field.key} }}</label>
            <div class="col-sm-10">
              ${input}
            </div>
          </div>`;
        }).join('\n');

        return `{{ header }}{{ column_left }}
<div id="content">
  <div class="page-header">
    <div class="container-fluid">
      <div class="pull-right">
        <button type="submit" form="form-total" data-toggle="tooltip" title="{{ button_save }}" class="btn btn-primary"><i class="fa fa-save"></i></button>
        <a href="{{ cancel }}" data-toggle="tooltip" title="{{ button_cancel }}" class="btn btn-default"><i class="fa fa-reply"></i></a></div>
      <h1>{{ heading_title }}</h1>
      <ul class="breadcrumb">
        {% for breadcrumb in breadcrumbs %}
        <li><a href="{{ breadcrumb.href }}">{{ breadcrumb.text }}</a></li>
        {% endfor %}
      </ul>
    </div>
  </div>
  <div class="container-fluid">
    {% if error_warning %}
    <div class="alert alert-danger alert-dismissible"><i class="fa fa-exclamation-circle"></i> {{ error_warning }}
      <button type="button" class="close" data-dismiss="alert">&times;</button>
    </div>
    {% endif %}
    <div class="panel panel-default">
      <div class="panel-heading">
        <h3 class="panel-title"><i class="fa fa-pencil"></i> {{ text_edit }}</h3>
      </div>
      <div class="panel-body">
        <form action="{{ action }}" method="post" enctype="multipart/form-data" id="form-total" class="form-horizontal">
          <div class="form-group">
            <label class="col-sm-2 control-label" for="input-total"><span data-toggle="tooltip" title="{{ help_total }}">{{ entry_total }}</span></label>
            <div class="col-sm-10">
              <input type="text" name="${prefix}_total" value="{{ ${prefix}_total }}" placeholder="{{ entry_total }}" id="input-total" class="form-control" />
            </div>
          </div>
          <div class="form-group">
            <label class="col-sm-2 control-label" for="input-fee">{{ entry_fee }}</label>
            <div class="col-sm-10">
              <input type="text" name="${prefix}_fee" value="{{ ${prefix}_fee }}" placeholder="{{ entry_fee }}" id="input-fee" class="form-control" />
            </div>
          </div>
          <div class="form-group">
            <label class="col-sm-2 control-label" for="input-tax-class">{{ entry_tax_class }}</label>
            <div class="col-sm-10">
              <select name="${prefix}_tax_class_id" id="input-tax-class" class="form-control">
                <option value="0">{{ text_none }}</option>
                {% for tax_class in tax_classes %}
                {% if tax_class.tax_class_id == ${prefix}_tax_class_id %}
                <option value="{{ tax_class.tax_class_id }}" selected="selected">{{ tax_class.title }}</option>
                {% else %}
                <option value="{{ tax_class.tax_class_id }}">{{ tax_class.title }}</option>
                {% endif %}
                {% endfor %}
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="col-sm-2 control-label" for="input-status">{{ entry_status }}</label>
            <div class="col-sm-10">
              <select name="${prefix}_status" id="input-status" class="form-control">
                {% if ${prefix}_status %}
                <option value="1" selected="selected">{{ text_enabled }}</option>
                <option value="0">{{ text_disabled }}</option>
                {% else %}
                <option value="1">{{ text_enabled }}</option>
                <option value="0" selected="selected">{{ text_disabled }}</option>
                {% endif %}
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="col-sm-2 control-label" for="input-sort-order">{{ entry_sort_order }}</label>
            <div class="col-sm-10">
              <input type="text" name="${prefix}_sort_order" value="{{ ${prefix}_sort_order }}" placeholder="{{ entry_sort_order }}" id="input-sort-order" class="form-control" />
            </div>
          </div>
${customFields}
        </form>
      </div>
    </div>
  </div>
</div>
{{ footer }}`;
    },

    getModuleAdminViewTemplate(codename) {
        const customFields = this.fields.map(field => {
            let input = '';
            if (field.type === 'textarea') {
                input = `<textarea name="${field.key}" id="input-${field.key}" class="form-control">{{ ${field.key} }}</textarea>`;
            } else if (field.type === 'toggle') {
                input = `<select name="${field.key}" id="input-${field.key}" class="form-control">
                {% if ${field.key} %}
                <option value="1" selected="selected">{{ text_enabled }}</option>
                <option value="0">{{ text_disabled }}</option>
                {% else %}
                <option value="1">{{ text_enabled }}</option>
                <option value="0" selected="selected">{{ text_disabled }}</option>
                {% endif %}
              </select>`;
            } else {
                input = `<input type="text" name="${field.key}" value="{{ ${field.key} }}" placeholder="{{ entry_${field.key} }}" id="input-${field.key}" class="form-control" />`;
            }
            return `          <div class="form-group">
            <label class="col-sm-2 control-label" for="input-${field.key}">{{ entry_${field.key} }}</label>
            <div class="col-sm-10">
              ${input}
            </div>
          </div>`;
        }).join('\n');

        return `{{ header }}{{ column_left }}
<div id="content">
  <div class="page-header">
    <div class="container-fluid">
      <div class="pull-right">
        <button type="submit" form="form-module" data-toggle="tooltip" title="{{ button_save }}" class="btn btn-primary"><i class="fa fa-save"></i></button>
        <a href="{{ cancel }}" data-toggle="tooltip" title="{{ button_cancel }}" class="btn btn-default"><i class="fa fa-reply"></i></a></div>
      <h1>{{ heading_title }}</h1>
      <ul class="breadcrumb">
        {% for breadcrumb in breadcrumbs %}
        <li><a href="{{ breadcrumb.href }}">{{ breadcrumb.text }}</a></li>
        {% endfor %}
      </ul>
    </div>
  </div>
  <div class="container-fluid">
    {% if error_warning %}
    <div class="alert alert-danger alert-dismissible"><i class="fa fa-exclamation-circle"></i> {{ error_warning }}
      <button type="button" class="close" data-dismiss="alert">&times;</button>
    </div>
    {% endif %}
    <div class="panel panel-default">
      <div class="panel-heading">
        <h3 class="panel-title"><i class="fa fa-pencil"></i> {{ text_edit }}</h3>
      </div>
      <div class="panel-body">
        <form action="{{ action }}" method="post" enctype="multipart/form-data" id="form-module" class="form-horizontal">
          <div class="form-group">
            <label class="col-sm-2 control-label" for="input-name">{{ entry_name }}</label>
            <div class="col-sm-10">
              <input type="text" name="name" value="{{ name }}" placeholder="{{ entry_name }}" id="input-name" class="form-control" />
              {% if error_name %}
              <div class="text-danger">{{ error_name }}</div>
              {% endif %}
            </div>
          </div>
          <div class="form-group">
            <label class="col-sm-2 control-label" for="input-width">{{ entry_width }}</label>
            <div class="col-sm-10">
              <input type="text" name="width" value="{{ width }}" placeholder="{{ entry_width }}" id="input-width" class="form-control" />
            </div>
          </div>
          <div class="form-group">
            <label class="col-sm-2 control-label" for="input-height">{{ entry_height }}</label>
            <div class="col-sm-10">
              <input type="text" name="height" value="{{ height }}" placeholder="{{ entry_height }}" id="input-height" class="form-control" />
            </div>
          </div>
          <div class="form-group">
            <label class="col-sm-2 control-label" for="input-status">{{ entry_status }}</label>
            <div class="col-sm-10">
              <select name="status" id="input-status" class="form-control">
                {% if status %}
                <option value="1" selected="selected">{{ text_enabled }}</option>
                <option value="0">{{ text_disabled }}</option>
                {% else %}
                <option value="1">{{ text_enabled }}</option>
                <option value="0" selected="selected">{{ text_disabled }}</option>
                {% endif %}
              </select>
            </div>
          </div>
${customFields}
        </form>
      </div>
    </div>
  </div>
</div>
{{ footer }}`;
    },

    getDefaultAdminViewTemplate(type, codename, prefix) {
        const customFields = this.fields.map(field => {
            const fullKey = prefix + '_' + field.key;
            let input = '';
            if (field.type === 'textarea') {
                input = `<textarea name="${fullKey}" id="input-${field.key}" class="form-control">{{ ${fullKey} }}</textarea>`;
            } else if (field.type === 'select') {
                input = `<select name="${fullKey}" id="input-${field.key}" class="form-control">
                <option value="1">Option 1</option>
                <option value="0">Option 2</option>
              </select>`;
            } else if (field.type === 'toggle') {
                input = `<select name="${fullKey}" id="input-${field.key}" class="form-control">
                {% if ${fullKey} %}
                <option value="1" selected="selected">{{ text_enabled }}</option>
                <option value="0">{{ text_disabled }}</option>
                {% else %}
                <option value="1">{{ text_enabled }}</option>
                <option value="0" selected="selected">{{ text_disabled }}</option>
                {% endif %}
              </select>`;
            } else {
                input = `<input type="text" name="${fullKey}" value="{{ ${fullKey} }}" id="input-${field.key}" class="form-control" />`;
            }

            return `          <div class="form-group">
            <label class="col-sm-2 control-label" for="input-${field.key}">{{ entry_${field.key} }}</label>
            <div class="col-sm-10">
              ${input}
            </div>
          </div>`;
        }).join('\n');

        return `{{ header }}{{ column_left }}
<div id="content">
  <div class="page-header">
    <div class="container-fluid">
      <div class="pull-right">
        <button type="submit" form="form-module" data-toggle="tooltip" title="{{ button_save }}" class="btn btn-primary"><i class="fa fa-save"></i></button>
        <a href="{{ cancel }}" data-toggle="tooltip" title="{{ button_cancel }}" class="btn btn-default"><i class="fa fa-reply"></i></a></div>
      <h1>{{ heading_title }}</h1>
      <ul class="breadcrumb">
        {% for breadcrumb in breadcrumbs %}
        <li><a href="{{ breadcrumb.href }}">{{ breadcrumb.text }}</a></li>
        {% endfor %}
      </ul>
    </div>
  </div>
  <div class="container-fluid">
    {% if error_warning %}
    <div class="alert alert-danger alert-dismissible"><i class="fa fa-exclamation-circle"></i> {{ error_warning }}
      <button type="button" class="close" data-dismiss="alert">&times;</button>
    </div>
    {% endif %}
    <div class="panel panel-default">
      <div class="panel-heading">
        <h3 class="panel-title"><i class="fa fa-pencil"></i> {{ text_edit }}</h3>
      </div>
      <div class="panel-body">
        <form action="{{ action }}" method="post" enctype="multipart/form-data" id="form-module" class="form-horizontal">
${customFields}
          <div class="form-group">
            <label class="col-sm-2 control-label" for="input-status">{{ entry_status }}</label>
            <div class="col-sm-10">
              <select name="${prefix}_status" id="input-status" class="form-control">
                {% if ${prefix}_status %}
                <option value="1" selected="selected">{{ text_enabled }}</option>
                <option value="0">{{ text_disabled }}</option>
                {% else %}
                <option value="1">{{ text_enabled }}</option>
                <option value="0" selected="selected">{{ text_disabled }}</option>
                {% endif %}
              </select>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>
{{ footer }}`;
    },

    getCatalogControllerTemplate(className) {
        const codename = this.config.codename;
        const type = this.config.type;
        const jsName = this.config.jsName;
        const cssName = this.config.cssName;

        let assets = '';
        // Theme type: different asset paths
        if (type === 'theme') {
            if (this.config.files.css) {
                assets += `\t\t$this->document->addStyle('catalog/view/theme/default/stylesheet/${codename}.css'); \n`;
            }
            if (this.config.files.js) {
                assets += `\t\t$this->document->addScript('catalog/view/javascript/${codename}.js'); \n`;
            }
        } else {
            if (this.config.files.css) {
                assets += `		$this->document->addStyle('catalog/view/javascript/${codename}/${cssName}.css'); \n`;
            }
            if (this.config.files.js) {
                assets += `		$this->document->addScript('catalog/view/javascript/${codename}/${jsName}.js'); \n`;
            }
        }

        if (type === 'payment') {
            return `<?php
class ${className} extends Controller {
	public function index() {
${assets}
		$data['continue'] = $this->url->link('checkout/success');

		return $this->load->view('extension/payment/${codename}', $data);
	}

	public function confirm() {
		$json = array();

		if ($this->session->data['payment_method']['code'] == '${codename}') {
			$this->load->model('checkout/order');

			$this->model_checkout_order->addOrderHistory($this->session->data['order_id'], $this->config->get('payment_${codename}_order_status_id'));

			$json['redirect'] = $this->url->link('checkout/success');
		}

		$this->response->addHeader('Content-Type: application/json');
		$this->response->setOutput(json_encode($json));
	}
}
`;
        }

        if (type === 'module') {
            return `<?php
class ${className} extends Controller {
	public function index($setting) {
		$this->load->language('extension/module/${codename}');
${assets}
		$data['heading_title'] = $this->language->get('heading_title');

		// Module settings from admin
		if (isset($setting['width'])) {
			$data['width'] = $setting['width'];
		} else {
			$data['width'] = '';
		}

		if (isset($setting['height'])) {
			$data['height'] = $setting['height'];
		} else {
			$data['height'] = '';
		}

		return $this->load->view('extension/module/${codename}', $data);
	}
}
`;
        }

        return `<?php
class ${className} extends Controller {
	public function index() {
${assets}
		$data = array();

		return $this->load->view('extension/${type}/${codename}', $data);
	}
}
`;
    },

    getCatalogViewTemplate() {
        const codename = this.config.codename;
        const type = this.config.type;

        if (type === 'payment') {
            return `<div class="buttons">
  <div class="pull-right">
    <input type="button" value="{{ button_confirm }}" id="button-confirm" data-loading-text="{{ text_loading }}" class="btn btn-primary" />
  </div>
</div>
<script type="text/javascript"><!--
$('#button-confirm').on('click', function() {
	$.ajax({
		url: 'index.php?route=extension/payment/${codename}/confirm',
		dataType: 'json',
		beforeSend: function() {
			$('#button-confirm').button('loading');
		},
		complete: function() {
			$('#button-confirm').button('reset');
		},
		success: function(json) {
			if (json['redirect']) {
				location = json['redirect'];
			}
		},
		error: function(xhr, ajaxOptions, thrownError) {
			alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
		}
	});
});
//--></script>`;
        }

        if (type === 'module') {
            return `<div class="${codename}-module"{% if width %} style="width: {{ width }}; height: {{ height }};"{% endif %}>
  <h3 class="${codename}-title">{{ heading_title }}</h3>
  <div class="${codename}-content">
    <!-- Ваш контент модуля -->
    <p>Это содержимое модуля "${this.config.name}".</p>
  </div>
</div>`;
        }

        return `<!-- ${this.config.name} catalog view -->
<div class="${codename}-container">
	<h3>{{ heading_title }}</h3>
	<p>This is a generated view for the ${this.config.name} module.</p>
</div>`;
    },

    getOcmodTemplate() {
        return `<?xml version="1.0" encoding="utf-8"?>
<modification>
	<name>${this.config.name}</name>
	<code>${this.config.codename}</code>
	<version>${this.config.version}</version>
	<author>${this.config.author}</author>
	<link>https://opencartforum.com.ru/</link>

	<!--
	Пример модификации:
	<file path="catalog/controller/common/home.php">
		<operation>
			<search><![CDATA[$this->document->setTitle(]]></search>
			<add position="after"><![CDATA[
			// Ваш код здесь
			]]></add>
		</operation>
	</file>
	-->
</modification>`;
    },

    // Theme-specific templates
    getThemeStylesheetTemplate() {
        return `/**
 * ${this.config.name} Theme Stylesheet
 * Version: ${this.config.version}
 * Author: ${this.config.author}
 */

/* ============================================
   BASE STYLES
   ============================================ */

:root {
	--theme-primary: #2563eb;
	--theme-secondary: #64748b;
	--theme-success: #22c55e;
	--theme-danger: #ef4444;
	--theme-warning: #f59e0b;
	--theme-info: #0ea5e9;
	--theme-light: #f8fafc;
	--theme-dark: #1e293b;
}

body {
	font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	color: var(--theme-dark);
	background-color: #ffffff;
}

/* ============================================
   HEADER STYLES
   ============================================ */

#header {
    background: #ffffff;
    border - bottom: 1px solid #e2e8f0;
}

/* ============================================
   FOOTER STYLES
   ============================================ */

footer {
    background: var(--theme - dark);
    color: #ffffff;
    padding: 40px 0;
}

/* ============================================
   PRODUCT STYLES
   ============================================ */

.product-thumb {
	border: 1px solid #e2e8f0;
	border-radius: 8px;
	transition: all 0.3s ease;
}

.product-thumb:hover {
	box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* Add your custom styles below */
`;
    },

    getThemeHeaderTemplate() {
        const name = this.config.name;
        return `{# ${name} - Header Template #}
<!DOCTYPE html>
    <html dir="{{ direction }}" lang="{{ lang }}">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <title>{{ title }}</title>
                    <base href="{{ base }}" />
                    {% if description %}
                    <meta name="description" content="{{ description }}" />
                    {% endif %}
                    {% if keywords %}
                    <meta name="keywords" content="{{ keywords }}" />
                    {% endif %}
                    {% for link in links %}
                    <link href="{{ link.href }}" rel="{{ link.rel }}" />
                    {% endfor %}
                    {% for style in styles %}
                    <link href="{{ style.href }}" type="text/css" rel="{{ style.rel }}" media="{{ style.media }}" />
                    {% endfor %}
                    {% for script in scripts %}
                    <script src="{{ script }}" type="text/javascript"></script>
                    {% endfor %}
                    {{ analytics }}
                </head>
                <body class="{{ class }}">
                    <nav id="top">
                        <div class="container">
                            {{ currency }}
                            {{ language }}
                            <div id="top-links" class="nav pull-right">
                                <ul class="list-inline">
                                    <li><a href="{{ contact }}"><i class="fa fa-phone"></i></a> <span class="hidden-xs hidden-sm hidden-md">{{ telephone }}</span></li>
                                    <li class="dropdown"><a href="{{ account }}" title="{{ text_account }}" class="dropdown-toggle" data-toggle="dropdown"><i class="fa fa-user"></i> <span class="hidden-xs hidden-sm hidden-md">{{ text_account }}</span> <span class="caret"></span></a>
                                        <ul class="dropdown-menu dropdown-menu-right">
                                            {% if logged %}
                                            <li><a href="{{ account }}">{{ text_account }}</a></li>
                                            <li><a href="{{ order }}">{{ text_order }}</a></li>
                                            <li><a href="{{ transaction }}">{{ text_transaction }}</a></li>
                                            <li><a href="{{ download }}">{{ text_download }}</a></li>
                                            <li><a href="{{ logout }}">{{ text_logout }}</a></li>
                                            {% else %}
                                            <li><a href="{{ register }}">{{ text_register }}</a></li>
                                            <li><a href="{{ login }}">{{ text_login }}</a></li>
                                            {% endif %}
                                        </ul>
                                    </li>
                                    <li><a href="{{ wishlist }}" id="wishlist-total" title="{{ text_wishlist }}"><i class="fa fa-heart"></i> <span class="hidden-xs hidden-sm hidden-md">{{ text_wishlist }}</span></a></li>
                                    <li><a href="{{ shopping_cart }}" title="{{ text_shopping_cart }}"><i class="fa fa-shopping-cart"></i> <span class="hidden-xs hidden-sm hidden-md">{{ text_shopping_cart }}</span></a></li>
                                    <li><a href="{{ checkout }}" title="{{ text_checkout }}"><i class="fa fa-share"></i> <span class="hidden-xs hidden-sm hidden-md">{{ text_checkout }}</span></a></li>
                                </ul>
                            </div>
                        </div>
                    </nav>
                    <header>
                        <div class="container">
                            <div class="row">
                                <div class="col-sm-4">
                                    <div id="logo">
                                        {% if logo %}
                                        <a href="{{ home }}"><img src="{{ logo }}" title="{{ name }}" alt="{{ name }}" class="img-responsive" /></a>
                                        {% else %}
                                        <h1><a href="{{ home }}">{{ name }}</a></h1>
                                        {% endif %}
                                    </div>
                                </div>
                                <div class="col-sm-5">{{ search }}</div>
                                <div class="col-sm-3">{{ cart }}</div>
                            </div>
                        </div>
                    </header>
                    {{ menu }}`;
    },

    getThemeFooterTemplate() {
        const name = this.config.name;
        return `{# ${name} - Footer Template #}
                    <footer>
                        <div class="container">
                            <div class="row">
                                {% for information in informations %}
                                <div class="col-sm-3">
                                    <h5>{{ information.title }}</h5>
                                    <ul class="list-unstyled">
                                        {% for info in information.info %}
                                        <li><a href="{{ info.href }}">{{ info.title }}</a></li>
                                        {% endfor %}
                                    </ul>
                                </div>
                                {% endfor %}
                                <div class="col-sm-3">
                                    <h5>{{ text_contact }}</h5>
                                    <ul class="list-unstyled">
                                        <li><i class="fa fa-map-marker"></i> {{ address }}</li>
                                        <li><i class="fa fa-phone"></i> {{ telephone }}</li>
                                        {% if fax %}
                                        <li><i class="fa fa-fax"></i> {{ fax }}</li>
                                        {% endif %}
                                    </ul>
                                </div>
                            </div>
                            <hr />
                            <p>{{ powered }}</p>
                        </div>
                    </footer>
                </body>
            </html>`;
    },

    getThemeHomeTemplate() {
        const name = this.config.name;
        return `{# ${name} - Home Page Template #}
            {{ header }}
            <div id="common-home" class="container">
                <div class="row">{{ column_left }}
                    {% if column_left and column_right %}
                    {% set class = 'col-sm-6' %}
                    {% elseif column_left or column_right %}
                    {% set class = 'col-sm-9' %}
                    {% else %}
                    {% set class = 'col-sm-12' %}
                    {% endif %}
                    <div id="content" class="{{ class }}">{{ content_top }}{{ content_bottom }}</div>
                    {{ column_right }}
                </div>
            </div>
            {{ footer }}`;
    }
};

// Initialize after DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    Generator.init();
});

// Expose to window
window.switchMode = (mode) => Generator.switchMode(mode);
window.updateUI = () => Generator.updateUI();
window.generateModule = () => Generator.generateModule();
window.addField = (type) => Generator.addField(type);
window.removeField = (id) => Generator.removeField(id);
window.updateField = (id, key, value) => Generator.updateField(id, key, value);
window.selectPreviewFile = (file, btn) => Generator.selectPreviewFile(file, btn);
window.loadDemoFields = () => Generator.loadDemoFields();
window.onModuleNameInput = () => Generator.onModuleNameInput();
window.onCodenameInput = () => Generator.onCodenameInput();

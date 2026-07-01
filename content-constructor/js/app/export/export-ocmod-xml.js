/* ============================================================
   Content Constructor — export/export-ocmod-xml.js
   Адаптер экспорта XML-модификаторов OpenCart (ocmod)
   ============================================================ */

function compileExportOcmodImportXml(projectState) {
    const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<modification>
    <name>OpenCart Content Constructor - Summernote Import</name>
    <code>content_constructor_import</code>
    <version>1.0</version>
    <author>Tom</author>
    <link>https://opencartforum.com.ru/</link>
    <file path="admin/view/template/common/footer.twig">
        <operation>
            <search><![CDATA[</body>]]></search>
            <add position="before"><![CDATA[
<script type="text/javascript"><!--
(function($) {
  if (typeof $.fn.summernote !== 'undefined') {
    var originalSummernote = $.fn.summernote;
    $.fn.summernote = function(options) {
      if (typeof options === 'object') {
        options.buttons = options.buttons || {};
        options.buttons.import_constructor = function(context) {
          var ui = $.summernote.ui;
          var $note = context.$note;
          var button = ui.button({
            contents: '<i class="fa fa-file-text-o" style="color: #27272a; font-weight: bold;" />',
            tooltip: 'Импортировать из Конструктора (.txt / .html)',
            click: function () {
              var fileInput = $('<input type="file" accept=".txt,.html" style="display:none">');
              $('body').append(fileInput);
              fileInput.click();
              fileInput.on('change', function(e) {
                var file = e.target.files[0];
                if (!file) return;
                var reader = new FileReader();
                reader.onload = function(evt) {
                  var contents = evt.target.result;
                  if (contents.indexOf('<body') !== -1) {
                    var match = contents.match(/<body[^>]*>([\\s\\S]*?)<\\/body>/i);
                    if (match && match[1]) {
                      contents = match[1];
                    }
                  }
                  contents = contents.trim();
                  if (confirm('Очистить редактор перед импортом?\\nНажмите "ОК" для полной замены текста.\\nНажмите "Отмена" для вставки в текущую позицию курсора.')) {
                    $note.summernote('code', contents);
                  } else {
                    $note.summernote('pasteHTML', contents);
                  }
                };
                reader.readAsText(file);
                fileInput.remove();
              });
            }
          });
          return button.render();
        };
        if (options.toolbar) {
          for (var i = 0; i < options.toolbar.length; i++) {
            if (options.toolbar[i][0] === 'insert') {
              if (options.toolbar[i][1].indexOf('import_constructor') === -1) {
                options.toolbar[i][1].push('import_constructor');
              }
              break;
            }
          }
        }
      }
      return originalSummernote.apply(this, arguments);
    };
  }
})(jQuery);
//--></script>
            ]]></add>
        </operation>
    </file>
</modification>`;

    return {
        filename: 'content_constructor.ocmod.xml',
        mimeType: 'text/xml',
        content: xmlContent
    };
}

function compileExportOcmodStylesXml(projectState) {
    const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<modification>
    <name>OpenCart Content Constructor - Global Stylesheet</name>
    <code>content_constructor_styles</code>
    <version>1.1</version>
    <author>Tom</author>
    <link>https://opencartforum.com.ru/</link>
    <file path="catalog/view/theme/*/template/common/header.twig">
        <operation>
            <search><![CDATA[</head>]]></search>
            <add position="before"><![CDATA[
<link href="catalog/view/theme/default/stylesheet/content-constructor.css" rel="stylesheet" />
            ]]></add>
        </operation>
    </file>
    <file path="catalog/view/theme/*/template/common/footer.twig">
        <operation>
            <search><![CDATA[</body>]]></search>
            <add position="before"><![CDATA[
<script type="text/javascript"><!--
document.addEventListener('click', function(event) {
  // 1. Smooth Scroll for anchors
  var link = event.target.closest('a.anchor[data-destination]');
  if (link) {
    var selector = link.getAttribute('data-destination');
    if (selector && selector.charAt(0) === '#') {
      var target = document.querySelector(selector);
      if (target) {
        event.preventDefault();
        if (window.history && window.history.pushState) {
          window.history.pushState(null, '', selector);
        } else {
          window.location.hash = selector;
        }
        var targetTop = target.getBoundingClientRect().top + window.pageYOffset - 20;
        try {
          window.scrollTo({ top: targetTop, behavior: 'smooth' });
        } catch (e) {
          window.scrollTo(0, targetTop);
        }
      }
    }
  }

  // 2. FAQ Accordion Toggle
  var question = event.target.closest('.article-faq-question');
  if (question) {
    var item = question.closest('.article-faq-item');
    if (item) {
      var targetEl = item.querySelector('.article-faq-collapse');
      if (targetEl) {
        var isCollapsed = targetEl.classList.contains('in');
        if (isCollapsed) {
          targetEl.classList.remove('in');
          question.classList.add('collapsed');
        } else {
          targetEl.classList.add('in');
          question.classList.remove('collapsed');
        }
      }
    }
  }

  // 3. Tabs Switcher
  var tabBtn = event.target.closest('.article-tabs-nav button');
  if (tabBtn) {
    var nav = tabBtn.parentNode;
    var wrapper = nav.parentNode;
    var panels = wrapper.querySelector('.article-tabs-panels');
    if (nav && panels) {
      var idx = tabBtn.getAttribute('data-tab');
      var buttons = nav.querySelectorAll('[data-tab]');
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('active');
      }
      for (var j = 0; j < panels.children.length; j++) {
        panels.children[j].style.display = 'none';
      }
      tabBtn.classList.add('active');
      var panel = panels.children[parseInt(idx, 10)];
      if (panel) {
        panel.style.display = 'block';
      }
    }
  }
});
//--></script>
            ]]></add>
        </operation>
    </file>
</modification>`;

    return {
        filename: 'content_styles.ocmod.xml',
        mimeType: 'text/xml',
        content: xmlContent
    };
}

function compileExportOcmodInstallXml(projectState) {
    const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<modification>
    <name>OpenCart Content Constructor - Integration Package</name>
    <code>content_constructor_integration</code>
    <version>1.0</version>
    <author>Tom</author>
    <link>https://opencartforum.com.ru/</link>

    <!-- 1. Summernote Import Button in Admin Panel Footer -->
    <file path="admin/view/template/common/footer.twig">
        <operation>
            <search><![CDATA[</body>]]></search>
            <add position="before"><![CDATA[
<script type="text/javascript"><!--
(function($) {
  if (typeof $.fn.summernote !== 'undefined') {
    var originalSummernote = $.fn.summernote;
    $.fn.summernote = function(options) {
      if (typeof options === 'object') {
        options.buttons = options.buttons || {};
        options.buttons.import_constructor = function(context) {
          var ui = $.summernote.ui;
          var $note = context.$note;
          var button = ui.button({
            contents: '<i class="fa fa-file-text-o" style="color: #27272a; font-weight: bold;" />',
            tooltip: 'Импортировать из Конструктора (.txt / .html)',
            click: function () {
              var fileInput = $('<input type="file" accept=".txt,.html" style="display:none">');
              $('body').append(fileInput);
              fileInput.click();
              fileInput.on('change', function(e) {
                var file = e.target.files[0];
                if (!file) return;
                var reader = new FileReader();
                reader.onload = function(evt) {
                  var contents = evt.target.result;
                  if (contents.indexOf('<body') !== -1) {
                    var match = contents.match(/<body[^>]*>([\\s\\S]*?)<\\/body>/i);
                    if (match && match[1]) {
                      contents = match[1];
                    }
                  }
                  contents = contents.trim();
                  if (confirm('Очистить редактор перед импортом?\\nНажмите "ОК" для полной замены текста.\\nНажмите "Отмена" для вставки в текущую позицию курсора.')) {
                    $note.summernote('code', contents);
                  } else {
                    $note.summernote('pasteHTML', contents);
                  }
                };
                reader.readAsText(file);
                fileInput.remove();
              });
            }
          });
          return button.render();
        };
        if (options.toolbar) {
          for (var i = 0; i < options.toolbar.length; i++) {
            if (options.toolbar[i][0] === 'insert') {
              if (options.toolbar[i][1].indexOf('import_constructor') === -1) {
                options.toolbar[i][1].push('import_constructor');
              }
              break;
            }
          }
        }
      }
      return originalSummernote.apply(this, arguments);
    };
  }
})(jQuery);
//--></script>
            ]]></add>
        </operation>
    </file>

    <!-- 2. Storefront Stylesheet Link Injection -->
    <file path="catalog/view/theme/*/template/common/header.twig">
        <operation>
            <search><![CDATA[</head>]]></search>
            <add position="before"><![CDATA[
<link href="catalog/view/theme/default/stylesheet/content-constructor.css" rel="stylesheet" />
            ]]></add>
        </operation>
    </file>

    <!-- 3. Storefront Anchor Scroll Handler, FAQ & Tabs -->
    <file path="catalog/view/theme/*/template/common/footer.twig">
        <operation>
            <search><![CDATA[</body>]]></search>
            <add position="before"><![CDATA[
<script type="text/javascript"><!--
document.addEventListener('click', function(event) {
  // 1. Smooth Scroll for anchors
  var link = event.target.closest('a.anchor[data-destination]');
  if (link) {
    var selector = link.getAttribute('data-destination');
    if (selector && selector.charAt(0) === '#') {
      var target = document.querySelector(selector);
      if (target) {
        event.preventDefault();
        if (window.history && window.history.pushState) {
          window.history.pushState(null, '', selector);
        } else {
          window.location.hash = selector;
        }
        var targetTop = target.getBoundingClientRect().top + window.pageYOffset - 20;
        try {
          window.scrollTo({ top: targetTop, behavior: 'smooth' });
        } catch (e) {
          window.scrollTo(0, targetTop);
        }
      }
    }
  }

  // 2. FAQ Accordion Toggle
  var question = event.target.closest('.article-faq-question');
  if (question) {
    var item = question.closest('.article-faq-item');
    if (item) {
      var targetEl = item.querySelector('.article-faq-collapse');
      if (targetEl) {
        var isCollapsed = targetEl.classList.contains('in');
        if (isCollapsed) {
          targetEl.classList.remove('in');
          question.classList.add('collapsed');
        } else {
          targetEl.classList.add('in');
          question.classList.remove('collapsed');
        }
      }
    }
  }

  // 3. Tabs Switcher
  var tabBtn = event.target.closest('.article-tabs-nav button');
  if (tabBtn) {
    var nav = tabBtn.parentNode;
    var wrapper = nav.parentNode;
    var panels = wrapper.querySelector('.article-tabs-panels');
    if (nav && panels) {
      var idx = tabBtn.getAttribute('data-tab');
      var buttons = nav.querySelectorAll('[data-tab]');
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('active');
      }
      for (var j = 0; j < panels.children.length; j++) {
        panels.children[j].style.display = 'none';
      }
      tabBtn.classList.add('active');
      var panel = panels.children[parseInt(idx, 10)];
      if (panel) {
        panel.style.display = 'block';
      }
    }
  }
});
//--></script>
            ]]></add>
        </operation>
    </file>
</modification>`;

    return {
        filename: 'install.xml',
        mimeType: 'text/xml',
        content: xmlContent
    };
}

/* ============================================================
   Content Constructor — export/export-ocmod-zip.js
   Адаптер экспорта ZIP-архива модификатора для OpenCart
   ============================================================ */

async function compileExportOcmodZip(projectState, ctx) {
    if (typeof JSZip === 'undefined') {
        throw new Error('JSZip is not defined');
    }

    const zip = new JSZip();

    // 1. Get install.xml and content-constructor.css content
    const installXml = compileExportOcmodInstallXml(projectState);
    const cssContent = compileExportCss(projectState);

    zip.file("install.xml", installXml.content);
    zip.file("upload/catalog/view/theme/default/stylesheet/content-constructor.css", cssContent.content);

    const fontPaths = [
        { zip: "upload/catalog/view/theme/default/stylesheet/fonts/InterSans-Regular.woff", local: "css/InterSans-Regular.woff?v=1.0.3" },
        { zip: "upload/catalog/view/theme/default/stylesheet/fonts/InterSans-SemiBold.woff", local: "css/InterSans-SemiBold.woff?v=1.0.3" }
    ];

    const isLocal = location.protocol === 'file:';

    const loadFonts = isLocal
        ? Promise.all(fontPaths.map(fp => {
            return new Promise((resolve) => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', fp.local, true);
                xhr.responseType = 'arraybuffer';
                xhr.onload = () => resolve(xhr.status === 200 ? { data: xhr.response, path: fp.zip } : null);
                xhr.onerror = () => resolve(null);
                xhr.send();
            });
        }))
        : Promise.all(fontPaths.map(fp =>
            fetch(fp.local).then(res => res.ok ? res.arrayBuffer().then(d => ({ data: d, path: fp.zip })) : null).catch(() => null)
        ));

    const results = await loadFonts;
    results.forEach(item => {
        if (item) zip.file(item.path, item.data);
    });

    const blob = await zip.generateAsync({ type: "blob" });

    return {
        filename: 'content_constructor.ocmod.zip',
        mimeType: 'application/zip',
        blob: blob
    };
}

/* ============================================================
   Content Constructor — export/export-article-zip.js
   Адаптер экспорта ZIP-архива статьи с HTML и ресурсами
   ============================================================ */

async function compileExportArticleZip(projectState, ctx) {
    if (typeof JSZip === 'undefined') {
        throw new Error('JSZip is not defined');
    }

    const title = projectState.title || 'Статья';
    const slug = projectState.slug || 'article';

    const copiedBlocks = JSON.parse(JSON.stringify(projectState.blocks));
    const imagesToPack = [];

    function collectAllImages(blocksList) {
        blocksList.forEach(block => {
            if (block.type === 'image') {
                if (block.data.srcType === 'local' && block.data.localSrc) {
                    imagesToPack.push({
                        src: block.data.localSrc,
                        isLocal: true,
                        update: (newUrl) => {
                            block.data.src = newUrl;
                            block.data.srcType = 'path';
                        }
                    });
                } else if (block.data.src) {
                    imagesToPack.push({
                        src: block.data.src,
                        isLocal: false,
                        update: (newUrl) => {
                            block.data.src = newUrl;
                            block.data.srcType = 'path';
                        }
                    });
                }
            } else if (block.type === 'carousel' && block.data.items) {
                block.data.items.forEach(item => {
                    if (item.src && !item.src.startsWith('data:')) {
                        imagesToPack.push({
                            src: item.src,
                            isLocal: false,
                            update: (newUrl) => {
                                item.src = newUrl;
                            }
                        });
                    }
                });
            } else if (block.type === 'before-after') {
                if (block.data.beforeImg && !block.data.beforeImg.startsWith('data:')) {
                    imagesToPack.push({
                        src: block.data.beforeImg,
                        isLocal: false,
                        update: (newUrl) => {
                            block.data.beforeImg = newUrl;
                        }
                    });
                }
                if (block.data.afterImg && !block.data.afterImg.startsWith('data:')) {
                    imagesToPack.push({
                        src: block.data.afterImg,
                        isLocal: false,
                        update: (newUrl) => {
                            block.data.afterImg = newUrl;
                        }
                    });
                }
            } else if (block.type === 'product-card') {
                if (block.data.img && !block.data.img.startsWith('data:')) {
                    imagesToPack.push({
                        src: block.data.img,
                        isLocal: false,
                        update: (newUrl) => {
                            block.data.img = newUrl;
                        }
                    });
                }
            } else if (block.type === 'grid' && block.data && block.data.columns) {
                block.data.columns.forEach(col => {
                    if (col.blocks) {
                        collectAllImages(col.blocks);
                    }
                });
            }
        });
    }

    function getExtensionFromMime(mime) {
        if (mime.includes('png')) return 'png';
        if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
        if (mime.includes('gif')) return 'gif';
        if (mime.includes('webp')) return 'webp';
        if (mime.includes('svg')) return 'svg';
        return 'png';
    }

    function getExtensionFromPath(path) {
        const parts = path.split('.');
        if (parts.length > 1) {
            const ext = parts.pop().toLowerCase();
            if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) {
                return ext === 'jpeg' ? 'jpg' : ext;
            }
        }
        return 'png';
    }

    collectAllImages(copiedBlocks);
    const zipPromises = [];
    const zip = new JSZip();

    imagesToPack.forEach((imgItem, idx) => {
        let imgPromise = null;
        let ext = 'png';
        
        if (imgItem.isLocal) {
            const b64Data = imgItem.src;
            if (b64Data && b64Data.startsWith('data:')) {
                const mimeMatch = b64Data.match(/^data:(image\/[a-z+]+);base64,/);
                if (mimeMatch) {
                    ext = getExtensionFromMime(mimeMatch[1]);
                }
                const rawB64 = b64Data.substring(b64Data.indexOf(';base64,') + 8);
                imgPromise = Promise.resolve({
                    data: rawB64,
                    isBase64: true,
                    ext: ext
                });
            }
        } else if (imgItem.src) {
            const srcPath = imgItem.src;
            ext = getExtensionFromPath(srcPath);
            
            let url = srcPath;
            if (url.startsWith('image/catalog/content-constructor/')) {
                const filename = url.substring('image/catalog/content-constructor/'.length);
                url = 'image/' + filename;
            }
            
            imgPromise = fetch(url)
                .then(res => {
                    if (!res.ok) throw new Error('Fetch failed');
                    return res.arrayBuffer();
                })
                .then(buf => {
                    return {
                        data: buf,
                        isBase64: false,
                        ext: ext
                    };
                })
                .catch(err => {
                    console.warn('Could not fetch image for ZIP packaging:', url, err);
                    return null;
                });
        }
        
        if (imgPromise) {
            const newFilename = `${slug}-img-${idx + 1}`;
            zipPromises.push(
                imgPromise.then(res => {
                    if (res) {
                        const finalExt = res.ext || ext;
                        const zipPath = `image/catalog/content-constructor/${slug}/${newFilename}.${finalExt}`;
                        
                        imgItem.update(zipPath);
                        
                        return {
                            path: zipPath,
                            data: res.data,
                            isBase64: res.isBase64
                        };
                    }
                    return null;
                })
            );
        }
    });

    const imagesToAdd = await Promise.all(zipPromises);
    imagesToAdd.forEach(img => {
        if (img) {
            if (img.isBase64) {
                zip.file(img.path, img.data, { base64: true });
            } else {
                zip.file(img.path, img.data);
            }
        }
    });

    // Generate clean HTML using the HTML export adapter on the temporary state with updated blocks
    const tempState = {
        ...projectState,
        blocks: copiedBlocks
    };
    const htmlArtifact = compileExportHtml(tempState, ctx);
    
    zip.file(htmlArtifact.filename, htmlArtifact.content);

    const zipBlob = await zip.generateAsync({ type: "blob" });

    return {
        filename: `article-${slug}.zip`,
        mimeType: 'application/zip',
        blob: zipBlob
    };
}

function OCRDashboardView({ user, onBack }) {
    const [status, setStatus] = React.useState("idle");
    const [selectedDocs, setSelectedDocs] = React.useState([]);
    const [results, setResults] = React.useState([]);
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [searchList, setSearchList] = React.useState([]);
    const [newClave, setNewClave] = React.useState("");
    const [newValor, setNewValor] = React.useState("");
    const [userPresets, setUserPresets] = React.useState({});

    const imgRef = React.useRef(null);
    const overlayRef = React.useRef(null);

    const [contadorDiario, setContadorDiario] = React.useState(user.subscription.usageToday);

    const updateOverlays = () => {
        if (!imgRef.current || !overlayRef.current || !results[currentIndex]) return;

        const img = imgRef.current;
        const container = overlayRef.current;
        const result = results[currentIndex];

        // Dimensiones reales vs naturales
        const rect = img.getBoundingClientRect();
        const naturalW = img.naturalWidth || img.width;
        const naturalH = img.naturalHeight || img.height;

        container.style.width = rect.width + "px";
        container.style.height = rect.height + "px";
        container.innerHTML = '';

        const scaleX = rect.width / naturalW;
        const scaleY = rect.height / naturalH;

        const fields = window.InvoiceProcessor.extractOcrFields(result.data, naturalW, naturalH);

        fields.forEach(f => {
            const div = document.createElement('div');
            div.className = 'ocr-box';
            div.style.left = (f.bbox.x * scaleX) + "px";
            div.style.top = (f.bbox.y * scaleY) + "px";
            div.style.width = (f.bbox.width * scaleX) + "px";
            div.style.height = (f.bbox.height * scaleY) + "px";
            div.title = f.value;
            div.innerText = ""; // Podríamos poner f.value si cabe, pero ocr-box suele ser pequeño
            div.draggable = true;

            div.ondragstart = (e) => {
                e.dataTransfer.setData("text/plain", f.value);
            };

            div.onclick = () => {
                const focused = document.activeElement;
                if (focused && (focused.tagName === 'INPUT' || focused.tagName === 'TEXTAREA')) {
                    focused.value = f.value;
                    const event = new Event('input', { bubbles: true });
                    focused.dispatchEvent(event);
                }
            };
            container.appendChild(div);
        });
    };

    React.useEffect(() => {
        if (status === "done" && imgRef.current) {
            const observer = new ResizeObserver(() => updateOverlays());
            const wrapper = imgRef.current.closest('.ocr-document-wrapper');
            if (wrapper) observer.observe(wrapper);

            setTimeout(updateOverlays, 300);
            return () => observer.disconnect();
        }
    }, [status, currentIndex]);

    const cargarPresets = async () => {
        if (user && !user.isGuest) {
            const presets = await window.UserService.getPresets(user.uid);
            setUserPresets(presets);
        }
    };

    React.useEffect(() => {
        cargarPresets();
    }, [user]);
    const guardarPresetActual = async () => {
        if (user.isGuest) {
            Swal.fire({
                icon: 'info',
                title: window.t('ocr_title_unauthorized'),
                text: window.t('ocr_msg_unauthorized'),
                toast: true,
                position: 'top-end',
                timer: 3000,
                showConfirmButton: false
            });
            return;
        }

        if (!searchList.length) {
            Swal.fire({
                icon: 'warning',
                title: window.t('ocr_title_error'),
                text: window.t('ocr_msg_empty_list'),
                toast: true, position: 'top-end', timer: 3000, showConfirmButton: false
            });
            return;
        }

        const { value: name } = await Swal.fire({
            title: window.t('ocr_prompt_preset_name'),
            input: 'text',
            inputPlaceholder: window.t('ocr_placeholder_preset_name'),
            showCancelButton: true,
            confirmButtonText: window.t('ocr_btn_save'),
            confirmButtonColor: '#0052FF',
            inputValidator: (value) => {
                if (!value) return window.t('ocr_validation_preset_name_required');
            }
        });

        if (name) {
            await window.UserService.savePreset(user.uid, name, searchList);
            await cargarPresets();
            setSearchList([]);
            setNewClave("");
            setNewValor("");
            Swal.fire({
                icon: 'success',
                title: window.t('ocr_msg_preset_saved'),
                toast: true,
                position: 'top-end',
                timer: 3000,
                showConfirmButton: false
            });
        }
    };

    const [dragging, setDragging] = React.useState(false);

    const handleFiles = async (filesOrEvent) => {
        let files;
        if (filesOrEvent.target && filesOrEvent.target.files) {
            files = Array.from(filesOrEvent.target.files);
        } else {
            files = Array.from(filesOrEvent);
        }

        if (!files.length) return;
        let queue = [];
        const pdfs = files.filter(f => f.type === "application/pdf");
        const images = files.filter(f => f.type.startsWith("image/"));
        if (pdfs.length > 0) {
            const selections = await selecionaPaginasPdf(pdfs);
            if (!selections) return;
            for (const sel of selections) {
                const imgData = await window.InvoiceProcessor.pdfToImage(pdfs[sel.fileIdx], sel.pageIdx);
                const res = await fetch(imgData);
                queue.push({ blob: await res.blob(), name: pdfs[sel.fileIdx].name + " (Pag " + (sel.pageIdx + 1) + ")" });
            }
        }
        images.forEach(img => queue.push({ blob: img, name: img.name }));
        const docsWithPreview = queue.map(item => ({ ...item, preview: URL.createObjectURL(item.blob) }));
        setSelectedDocs(docsWithPreview);
        setStatus("ready");
    };

    const onDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    const onDragLeave = () => {
        setDragging(false);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const files = e.dataTransfer.files;
        handleFiles(files);
    };

    const startProcessing = async () => {
        if (!searchList.length) {
            Swal.fire("Aviso", "Añade al menos un campo a buscar", "warning");
            return;
        }
        setStatus("processing");
        const newResults = [];
        for (const doc of selectedDocs) {
            try {
                if (user.subscription.usageToday >= user.subscription.maxFactPerDays) {
                    Swal.fire("Límite", "Máximo diario alcanzado", "warning"); break;
                }
                const response = await window.InvoiceProcessor.processDocument(doc.blob, doc.name, searchList);

                let nuevoUso;
                if (user.isGuest) {
                    nuevoUso = user.subscription.usageToday + 1;
                    const today = new Date().toISOString().split('T')[0];
                    localStorage.setItem("guest_usage", JSON.stringify({ usageToday: nuevoUso, dateUsageToday: today }));
                } else {
                    nuevoUso = await SubscriptionController.usoGratuito(user.subscriptionId);
                }

                if (nuevoUso) {
                    user.subscription.usageToday = nuevoUso;
                    setContadorDiario(nuevoUso);
                }
                newResults.push({ name: doc.name, data: response, image: doc.preview });
            } catch (err) { console.error(err); }
        }
        setResults(newResults);
        setCurrentIndex(0);
        setStatus("done");
    };

    return (
        <div className="ocr-dashboard" style={{ paddingTop: '5.5rem' }}>
            <div className="ocr-header">
                <button onClick={onBack} className="btn-secondary">← {window.t('ocr_btn_back_short')}</button>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#6366f1', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                        {window.t('plan_type', { tipo: user.subscription.tipo === 'gratis' ? window.t('sub_type_free') : user.subscription.tipo })}
                    </p>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                        {window.t('usage_daily', { count: contadorDiario, max: user.subscription.maxFactPerDays })}
                    </p>
                </div>
                <div className="ocr-config-panel">
                    <button onClick={() => {
                        const systemConfigs = window.InvoiceProcessor.CONFIGS;
                        const allConfigs = user.uid ? { ...systemConfigs, ...userPresets } : { ...systemConfigs };

                        const htmlList = Object.keys(allConfigs).map(name => {
                            const isSystem = systemConfigs[name] !== undefined;
                            return `
                                <div class="config-item">
                                    <div class="config-info">
                                        <div class="config-name">${name}</div>
                                        <div class="config-type">${isSystem ? '📍 Sistema' : '👤 Personal'}</div>
                                    </div>
                                    <div class="config-actions">
                                        <button class="btn-preview-item" data-name="${name}" title="Ver campos">👁️</button>
                                        <button class="btn-load-item" data-name="${name}" title="Usar">▶</button>
                                        ${!isSystem ? `<button class="btn-delete-item" data-name="${name}" title="Eliminar">🗑️</button>` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('');

                        Swal.fire({
                            title: 'Tus Configuraciones',
                            html: `<div class="config-list-swal">${htmlList}</div>`,
                            showConfirmButton: false,
                            showCloseButton: true,
                            width: '500px',
                            didOpen: () => {
                                const container = Swal.getHtmlContainer();

                                // Cargar
                                container.querySelectorAll('.btn-load-item').forEach(btn => {
                                    btn.onclick = () => {
                                        const name = btn.dataset.name;
                                        setSearchList(allConfigs[name] || []);
                                        Swal.close();
                                        Swal.fire({
                                            icon: 'success',
                                            title: window.t('ocr_msg_preset_loaded', { name }),
                                            toast: true,
                                            position: 'top-end',
                                            timer: 3000,
                                            showConfirmButton: false
                                        });
                                    };
                                });

                                // Vista Previa
                                container.querySelectorAll('.btn-preview-item').forEach(btn => {
                                    btn.onclick = () => {
                                        const name = btn.dataset.name;
                                        const fields = allConfigs[name] || [];
                                        const fieldsHtml = fields.map(f => `<div class="preview-tag"><b>${f.clave}:</b> ${f.valor}</div>`).join('');

                                        Swal.fire({
                                            title: `Campos de "${name}"`,
                                            html: `<div class="preview-grid">${fieldsHtml}</div>`,
                                            icon: 'info',
                                            confirmButtonText: window.t('ocr_btn_back_short'),
                                            width: '450px'
                                        }).then(() => {
                                            // Reabrir el selector principal (opcional pero cómodo)
                                            document.querySelector('.ocr-config-panel button').click();
                                        });
                                    };
                                });

                                // Eliminar
                                container.querySelectorAll('.btn-delete-item').forEach(btn => {
                                    btn.onclick = async () => {
                                        const name = btn.dataset.name;
                                        const result = await Swal.fire({
                                            title: window.t('ocr_confirm_delete_title'),
                                            text: window.t('ocr_confirm_delete_text', { name }),
                                            icon: 'warning',
                                            showCancelButton: true,
                                            confirmButtonColor: '#ef4444',
                                            confirmButtonText: window.t('ocr_btn_delete_confirm'),
                                            cancelButtonText: window.t('ocr_btn_cancel')
                                        });

                                        if (result.isConfirmed) {
                                            await window.UserService.deletePreset(user.uid, name);
                                            await cargarPresets();
                                            document.querySelector('.ocr-config-panel button').click();
                                            Swal.fire({
                                                icon: 'success',
                                                title: window.t('ocr_msg_deleted_title'),
                                                text: window.t('ocr_msg_deleted_text'),
                                                toast: true,
                                                position: 'top-end',
                                                timer: 2000,
                                                showConfirmButton: false
                                            });
                                        }
                                    };
                                });
                            }
                        });
                    }}>⚙️ {window.t('ocr_btn_configs')}</button>
                    <button className="btn-save-preset" onClick={guardarPresetActual} title={window.t('ocr_btn_save_config')}>💾</button>
                    <button className="btn-save-preset" title={window.t('ocr_help_title')} onClick={() => {
                        Swal.fire({
                            title: window.t('ocr_help_title'),
                            html: window.t('ocr_help_html'),
                            icon: 'info',
                            confirmButtonText: window.t('ocr_btn_understand')
                        });
                    }}>ℹ️</button>
                    {user.uid ? (
                        <div className="add-field">
                            <input
                                placeholder="Clave"
                                value={newClave}
                                onChange={e => setNewClave(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                            />
                            <input placeholder="Descripción" value={newValor} onChange={e => setNewValor(e.target.value)} />
                            <button onClick={() => {
                                if (newClave && newValor) {
                                    const normalizedKey = newClave.trim().toLowerCase().replace(/\s+/g, '_');
                                    if (searchList.some(item => item.clave === normalizedKey)) {
                                        Swal.fire({
                                            icon: 'warning',
                                            title: window.t('ocr_msg_duplicate_key_title'),
                                            text: window.t('ocr_msg_duplicate_key_text'),
                                            toast: true,
                                            position: 'top-end',
                                            timer: 3000,
                                            showConfirmButton: false
                                        });
                                        return;
                                    }
                                    setSearchList([...searchList, { clave: normalizedKey, valor: newValor }]);
                                    setNewClave(""); setNewValor("");
                                }
                            }}>+</button>
                        </div>
                    ) : (
                        <p style={{ color: '#0052FF', fontSize: '0.9rem', fontWeight: 600, margin: 0, display: 'none' }}>
                            {window.t('ocr_msg_unauthorized')}
                        </p>
                    )}
                </div>
            </div>

            {status === "idle" && (
                <div className="centered-layout">
                    <div
                        className={`container drop-zone ${dragging ? 'dragging' : ''}`}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        style={{ textAlign: 'center', cursor: 'pointer' }}
                        onClick={() => document.getElementById('up-v5').click()}
                    >
                        <i style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📥</i>
                        <h2>{window.t('ocr_dropzone_title')}</h2>
                        <p>{window.t('ocr_dropzone_subtitle')}</p>
                        <input type="file" id="up-v5" multiple hidden onChange={handleFiles} accept=".pdf,image/*" />
                        <label htmlFor="up-v5" className="button" onClick={e => e.stopPropagation()}>{window.t('ocr_btn_select_docs')}</label>
                    </div>
                </div>
            )}

            {status === "ready" && (
                <div className="centered-layout"><div className="container" style={{ textAlign: 'center' }}>
                    <h3>{window.t('ocr_ready_title', { count: selectedDocs.length })}</h3>
                    {searchList.length === 0 ? (
                        <p style={{ color: '#ef4444', fontWeight: 600 }}>{window.t('ocr_msg_no_fields_error')}</p>
                    ) : (
                        <p>{window.t('ocr_msg_searching_fields', { count: searchList.length })}</p>
                    )}
                    <button
                        onClick={startProcessing}
                        className="btn-indigo"
                        style={{ width: '100%', marginTop: '1rem', opacity: searchList.length === 0 ? 0.6 : 1 }}
                        disabled={searchList.length === 0}
                    >🚀 {window.t('ocr_btn_start_processing')}</button>
                    <p style={{ marginTop: '10px', cursor: 'pointer' }} onClick={() => setStatus("idle")}>{window.t('ocr_btn_cancel_ready')}</p>
                </div></div>
            )}

            {status === "processing" && (
                <div className="centered-layout"><div className="container" style={{ textAlign: 'center' }}>
                    <div className="spinner"></div><p>{window.t('ocr_msg_extracting')}</p>
                </div></div>
            )}

            {status === "done" && (
                <div className="ocr-main-view">
                    <div className="ocr-sidebar-left">
                        <div className="ocr-document-wrapper" style={{ overflow: 'auto', height: '100%', position: 'relative', background: '#334155', textAlign: 'center' }}>
                            <div style={{ display: 'inline-block', position: 'relative', margin: '20px auto' }}>
                                <img ref={imgRef} src={results[currentIndex].image} alt="DOC" onLoad={updateOverlays} style={{ display: 'block', maxWidth: '100%', height: 'auto', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }} />
                                <div ref={overlayRef} className="ocr-overlay-container"></div>
                            </div>
                        </div>
                    </div>

                    <div className="ocr-sidebar-right">
                        <div className="viewer-controls" style={{ background: '#f8fafc', borderBottom: '1px solid #eee', marginBottom: '1rem', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button disabled={currentIndex === 0} onClick={() => setCurrentIndex(currentIndex - 1)}>←</button>
                            <span style={{ fontWeight: 600 }}>{currentIndex + 1} / {results.length}</span>
                            <button disabled={currentIndex === results.length - 1} onClick={() => setCurrentIndex(currentIndex + 1)}>→</button>
                        </div>

                        <h3>{results[currentIndex].name}</h3>
                        <h4 style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>{window.t('ocr_label_extracted_data')}</h4>
                        {/* Usamos Key para forzar el reset de los inputs al cambiar de documento */}
                        <div className="ocr-form" key={currentIndex}>
                            {searchList.map(field => {
                                const doc = results[currentIndex].data;
                                // Prioridad: buscarCampos[0][clave] (estilo n8n antiguo) o mapped[clave]
                                const val = (doc.buscarCampos && doc.buscarCampos[0] && doc.buscarCampos[0][field.clave] !== undefined)
                                    ? doc.buscarCampos[0][field.clave]
                                    : (doc.mapped && doc.mapped[field.clave] !== undefined ? doc.mapped[field.clave] : "");

                                return (
                                    <div key={field.clave} className="form-group">
                                        <label>{field.clave}</label>
                                        <input
                                            type="text"
                                            defaultValue={val}
                                            onDragOver={e => { e.preventDefault(); e.target.classList.add('drag-over'); }}
                                            onDragLeave={e => e.target.classList.remove('drag-over')}
                                            onDrop={e => {
                                                e.preventDefault();
                                                e.target.classList.remove('drag-over');
                                                e.target.value = e.dataTransfer.getData("text/plain");
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                        <div className="ocr-actions">
                            <button onClick={() => window.InvoiceProcessor.exportToCSV(results)} className="btn-success" style={{ flex: 1 }}>{window.t('ocr_btn_download_csv')}</button>
                            <button onClick={() => setStatus("idle")} style={{ flex: 1 }}>{window.t('ocr_btn_new')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

async function selecionaPaginasPdf(filesPdf) {
    Swal.fire({ title: window.t('ocr_msg_preparing_pdf'), didOpen: () => Swal.showLoading() });
    try {
        const container = document.createElement("div");
        container.className = "pdf-picker-swal";
        for (let fIdx = 0; fIdx < filesPdf.length; fIdx++) {
            const file = filesPdf[fIdx];
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const h = document.createElement("h4"); h.innerText = file.name; container.appendChild(h);
            const grid = document.createElement("div"); grid.style.display = "flex"; grid.style.flexWrap = "wrap"; grid.style.gap = "10px";
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const vp = page.getViewport({ scale: 0.2 });
                const canvas = document.createElement("canvas"); canvas.width = vp.width; canvas.height = vp.height;
                await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise;
                const item = document.createElement("div"); item.className = "pdf-thumb-item";
                item.innerHTML = `<p>Pag ${i}</p><input type="checkbox" data-fidx="${fIdx}" data-pidx="${i - 1}" style="display:none">`;
                item.prepend(canvas);
                item.onclick = () => {
                    const cb = item.querySelector('input'); cb.checked = !cb.checked;
                    item.style.border = cb.checked ? "2px solid #6366f1" : "1px solid #ddd";
                };
                grid.appendChild(item);
            }
            container.appendChild(grid);
        }
        const { value } = await Swal.fire({
            title: window.t('ocr_title_pages'), html: container, width: '80%', showCancelButton: true,
            preConfirm: () => {
                const checked = container.querySelectorAll('input:checked');
                return Array.from(checked).map(c => ({ fileIdx: parseInt(c.dataset.fidx), pageIdx: parseInt(c.dataset.pidx) }));
            }
        });
        return value;
    } catch (e) { console.error(e); return null; }
}

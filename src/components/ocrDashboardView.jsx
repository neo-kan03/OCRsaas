import React from 'react';
import Swal from 'sweetalert2';
import * as pdfjsLib from 'pdfjs-dist';
import { t } from '../services/translations';
import { Alerts } from '../services/uiService';
import InvoiceProcessor from '../services/invoiceProcessor';
import UserService from '../services/userService';
import SubscriptionController from '../controllers/subscriptionController';

export default function OCRDashboardView({ user, onBack }) {
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

    const [contadorDiario, setContadorDiario] = React.useState(user?.subscription?.usageToday || 0);
    const [statusLabel, setStatusLabel] = React.useState("");

    React.useEffect(() => {
        if (status === "processing") {
            const labels = [
                t('ocr_status_transmuting'),
                t('ocr_status_synthesizing'),
                t('ocr_status_calibrating')
            ];
            setStatusLabel(labels[0]);
            let i = 0;
            const timer = setInterval(() => {
                i = (i + 1) % labels.length;
                setStatusLabel(labels[i]);
            }, 3000);
            return () => clearInterval(timer);
        }
    }, [status]);

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

        const fields = InvoiceProcessor.extractOcrFields(result.data, naturalW, naturalH);

        fields.forEach(f => {
            const div = document.createElement('div');
            div.className = 'aeon-ocr-box';
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
            const wrapper = imgRef.current.closest('.aeon-ocr-doc-wrapper');
            if (wrapper) observer.observe(wrapper);

            setTimeout(updateOverlays, 300);
            return () => observer.disconnect();
        }
    }, [status, currentIndex]);

    const cargarPresets = async () => {
        if (user && !user.isGuest) {
            const presets = await UserService.getPresets(user.uid);
            setUserPresets(presets);
        }
    };

    React.useEffect(() => {
        cargarPresets();
    }, [user]);
    const guardarPresetActual = async () => {
        if (user.isGuest) {
            Alerts.info(t('ocr_msg_unauthorized'));
            return;
        }

        if (!searchList.length) {
            Alerts.info(t('ocr_msg_empty_list'));
            return;
        }

        const { value: name } = await Swal.fire({
            title: t('ocr_prompt_preset_name'),
            input: 'text',
            inputPlaceholder: t('ocr_placeholder_preset_name'),
            showCancelButton: true,
            confirmButtonText: t('ocr_btn_save'),
            confirmButtonColor: '#0052FF',
            inputValidator: (value) => {
                if (!value) return t('ocr_validation_preset_name_required');
            }
        });

        if (name) {
            await UserService.savePreset(user.uid, name, searchList);
            await cargarPresets();
            setSearchList([]);
            setNewClave("");
            setNewValor("");
            Alerts.success(t('ocr_msg_preset_saved'));
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
                const imgData = await InvoiceProcessor.pdfToImage(pdfs[sel.fileIdx], sel.pageIdx);
                const res = await fetch(imgData);
                queue.push({ blob: await res.blob(), name: pdfs[sel.fileIdx].name + " (" + t('ocr_pdf_page_label') + " " + (sel.pageIdx + 1) + ")" });
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
            Alerts.warning(t('ocr_msg_add_at_least_one'));
            return;
        }
        setStatus("processing");
        const newResults = [];
        for (const doc of selectedDocs) {
            try {
                const maxDiario = user?.subscription?.maxFactPerDays || 10;
                const usoActual = user?.subscription?.usageToday || 0;
                if (usoActual >= maxDiario) {
                    Alerts.warning(t('ocr_msg_limit_reached')); break;
                }
                const response = await InvoiceProcessor.processDocument(doc.blob, doc.name, searchList);

                let nuevoUso;
                if (user.isGuest) {
                    nuevoUso = user.subscription.usageToday + 1;
                    const today = getLocalToday();
                    localStorage.setItem("guest_usage", JSON.stringify({ usageToday: nuevoUso, dateUsageToday: today }));
                } else {
                    nuevoUso = await SubscriptionController.usoGratuito(user.subscriptionId);
                }

                if (nuevoUso !== false) {
                    if (user.subscription) {
                        user.subscription.usageToday = nuevoUso;
                    }
                    setContadorDiario(nuevoUso);
                }
                newResults.push({ name: doc.name, data: response, image: doc.preview });
            } catch (err) {
                console.error("Error en documento", doc.name, err);
                // Usamos Alerts.error (persistente) para que el usuario no se pierda el fallo crítico
                await Alerts.error(
                    t('ocr_msg_preset_error'), // "Hubo un error al procesar..."
                    `${doc.name}: ${err.message || t('ocr_msg_error_unknown')}`
                );
            }
        }

        if (newResults.length > 0) {
            setResults(newResults);
            setCurrentIndex(0);
            setStatus("done");
        } else {
            // Si todo falló, no intentamos renderizar la vista de resultados
            setStatus("idle");
        }
    };

    return (
        <div className="aeon-ocr-main">
            <div className="aeon-ocr-header-strip">
                <button onClick={onBack} className="aeon-btn-back">
                    <span className="material-symbols-outlined">arrow_back</span> {t('ocr_btn_back_short')}
                </button>
                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                    <div className="aeon-ocr-usage-pill">
                        <span style={{ color: '#4648d4', fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {t('plan_type', { tipo: (user?.subscription?.tipo === 'gratis' ? t('sub_type_free') : user?.subscription?.tipo) || '...' })}
                        </span>
                        <div style={{ height: '0.75rem', width: '1px', backgroundColor: 'rgba(199, 196, 216, 0.4)' }}></div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#464555' }}>
                            {contadorDiario} / {user?.subscription?.maxFactPerDays || 10}
                        </span>
                        <div style={{ width: '4rem', height: '0.375rem', backgroundColor: '#e6e8ea', borderRadius: '9999px', overflow: 'hidden' }}>
                            <div style={{ backgroundColor: '#4648d4', height: '100%', width: `${Math.min(100, (contadorDiario / Math.max(1, user?.subscription?.maxFactPerDays || 10)) * 100)}%`, borderRadius: '9999px' }}></div>
                        </div>
                    </div>
                </div>

                <div className="aeon-ocr-actions-header">
                    {/* NEW Button (Always available to reset or start over) */}
                    <button onClick={() => setStatus("idle")} className="aeon-btn-back" title={t('ocr_btn_new_short')}>
                        <span className="material-symbols-outlined">add_circle</span>
                        <span>{t('ocr_btn_new_short')}</span>
                    </button>

                    {/* EXPORT Dropdown (Only in DONE state) */}
                    {status === "done" && (
                        <div className="aeon-export-dropdown">
                            <button className="aeon-btn-success" style={{ padding: '0.5rem 1rem' }}>
                                <span className="material-symbols-outlined">download</span>
                                <span>{t('ocr_btn_export_dropdown')}</span>
                                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>expand_more</span>
                            </button>
                            <div className="aeon-export-menu">
                                <button className="aeon-export-item" onClick={() => InvoiceProcessor.exportToCSV(results)}>
                                    <span className="material-symbols-outlined">grid_on</span>
                                    <span>{t('ocr_btn_export_csv')}</span>
                                </button>
                                <button className="aeon-export-item" onClick={() => {
                                    // Basic JSON export for demo
                                    const jsonString = JSON.stringify(results.map(r => r.data), null, 2);
                                    const blob = new Blob([jsonString], { type: 'application/json' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `extraction_${new Date().getTime()}.json`;
                                    a.click();
                                }}>
                                    <span className="material-symbols-outlined">data_object</span>
                                    <span>{t('ocr_btn_export_json')}</span>
                                </button>
                            </div>
                        </div>
                    )}

                    <div style={{ width: '1px', height: '1.5rem', backgroundColor: 'rgba(224, 227, 229, 0.6)', margin: '0 0.25rem' }}></div>

                    <button id="aeon-ocr-settings-btn" onClick={() => {
                        const systemConfigs = InvoiceProcessor.configs;
                        const allConfigs = user.uid ? { ...systemConfigs, ...userPresets } : { ...systemConfigs };

                        const htmlList = Object.keys(allConfigs).map(name => {
                            const isSystem = systemConfigs[name] !== undefined;
                            return `
                                <div class="config-item">
                                    <div class="config-info">
                                        <div class="config-name">${name}</div>
                                        <div class="config-type">${isSystem ? t('ocr_config_type_system') : t('ocr_config_type_personal')}</div>
                                    </div>
                                    <div class="config-actions">
                                        <button class="btn-preview-item" data-name="${name}" title="${t('ocr_btn_view_fields')}">👁️</button>
                                        <button class="btn-load-item" data-name="${name}" title="${t('ocr_btn_use_config')}">▶</button>
                                        ${!isSystem ? `<button class="btn-delete-item" data-name="${name}" title="${t('ocr_btn_delete_config')}">🗑️</button>` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('');

                        Swal.fire({
                            title: t('ocr_title_configs'),
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
                                        Alerts.success(t('ocr_msg_preset_loaded', { name }));
                                    };
                                });

                                // Vista Previa
                                container.querySelectorAll('.btn-preview-item').forEach(btn => {
                                    btn.onclick = () => {
                                        const name = btn.dataset.name;
                                        const fields = allConfigs[name] || [];
                                        const fieldsHtml = fields.map(f => `<div class="preview-tag"><b>${f.clave}:</b> ${f.valor}</div>`).join('');

                                        Swal.fire({
                                            title: t('ocr_title_preview_fields', { name }),
                                            html: `<div class="preview-grid">${fieldsHtml}</div>`,
                                            icon: 'info',
                                            confirmButtonText: t('ocr_btn_back_short'),
                                            width: '450px'
                                        }).then(() => {
                                            // Reabrir el selector principal de forma segura usando ID
                                            document.getElementById('aeon-ocr-settings-btn').click();
                                        });
                                    };
                                });

                                // Eliminar
                                container.querySelectorAll('.btn-delete-item').forEach(btn => {
                                    btn.onclick = async () => {
                                        const name = btn.dataset.name;
                                        const confirmed = await Alerts.confirm(
                                            t('ocr_confirm_delete_title'),
                                            t('ocr_confirm_delete_text', { name })
                                        );
 
                                         if (confirmed.isConfirmed) {
                                            await UserService.deletePreset(user.uid, name);
                                            await cargarPresets();
                                            // document.getElementById('aeon-ocr-settings-btn').click();
                                            Alerts.success(t('ocr_msg_deleted_title'));
                                        }
                                    };
                                });
                            }
                        });
                    }} className="aeon-header-icon-btn" title={t('ocr_btn_configs')}>
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                    <button className="aeon-header-icon-btn" onClick={guardarPresetActual} title={t('ocr_btn_save_config')}>
                        <span className="material-symbols-outlined">save</span>
                    </button>
                    <button className="aeon-header-icon-btn" title={t('ocr_help_title')} onClick={() => {
                        Swal.fire({
                            title: t('ocr_help_title'),
                            html: t('ocr_help_html'),
                            icon: 'info',
                            confirmButtonText: t('ocr_btn_understand')
                        });
                    }}>
                        <span className="material-symbols-outlined">info</span>
                    </button>
                    {user.uid ? (
                        <div className="add-field">
                            <input
                                placeholder={t('ocr_placeholder_key')}
                                value={newClave}
                                onChange={e => setNewClave(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                            />
                            <input 
                                placeholder={t('ocr_placeholder_value')} 
                                value={newValor} 
                                onChange={e => setNewValor(e.target.value)} 
                            />
                            <button className="btn-add-field" title={t('ocr_btn_add_field')} onClick={() => {
                                if (newClave && newValor) {
                                    const normalizedKey = newClave.trim().toLowerCase().replace(/\s+/g, '_');
                                    if (searchList.some(item => item.clave === normalizedKey)) {
                                        Alerts.warning(t('ocr_msg_duplicate_key_text'));
                                        return;
                                    }
                                    setSearchList([...searchList, { clave: normalizedKey, valor: newValor }]);
                                    setNewClave(""); setNewValor("");
                                } else {
                                    Alerts.warning(t('ocr_msg_fields_required'));
                                }
                            }}>
                                <span className="material-symbols-outlined">add</span>
                            </button>
                        </div>
                    ) : (
                        <p style={{ color: '#0052FF', fontSize: '0.9rem', fontWeight: 600, margin: 0, display: 'none' }}>
                            {t('ocr_msg_unauthorized')}
                        </p>
                    )}
                </div>
            </div>

            {status === "idle" && (
                <div className="aeon-ocr-workspace">
                    <div className="aeon-ocr-dropzone-wrapper">
                        <div
                            className={`aeon-ocr-glass-dropzone ${dragging ? 'dragging' : ''}`}
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                            onClick={() => document.getElementById('up-v5').click()}
                        >
                            <div className="aeon-ocr-icon-circle">
                                <div className="bg-pulse"></div>
                                <div className="icon-inner">
                                    <span className="material-symbols-outlined">cloud_upload</span>
                                </div>
                            </div>
                            <h2 className="aeon-ocr-title">{t('ocr_dropzone_title')}</h2>
                            <p className="aeon-ocr-subtitle">{t('ocr_dropzone_subtitle')}</p>
                            <input type="file" id="up-v5" multiple hidden onChange={handleFiles} accept=".pdf,image/*" />
                            <button className="aeon-btn-success" onClick={e => { e.stopPropagation(); document.getElementById('up-v5').click(); }}>
                                <span className="material-symbols-outlined">add_circle</span> {t('ocr_btn_select_docs')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {status === "ready" && (
                <div className="aeon-ocr-workspace">
                    <div className="aeon-ocr-glass-dropzone" style={{ padding: '3rem', maxWidth: '32rem', cursor: 'default' }}>
                        <div className="aeon-ocr-icon-circle" style={{ marginBottom: '1rem', width: '4rem', height: '4rem' }}>
                            <div className="icon-inner">
                                <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>task</span>
                            </div>
                        </div>
                        <h3 className="aeon-ocr-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{t('ocr_ready_title', { count: selectedDocs.length })}</h3>

                        {searchList.length === 0 ? (
                            <p style={{ color: '#ef4444', fontWeight: 600, margin: '1rem 0' }}>{t('ocr_msg_no_fields_error')}</p>
                        ) : (
                            <p className="aeon-ocr-subtitle" style={{ margin: '1rem 0', padding: 0 }}>{t('ocr_msg_searching_fields', { count: searchList.length })}</p>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem', width: '100%' }}>
                            <button
                                onClick={startProcessing}
                                className="aeon-btn-success"
                                style={{ width: '100%', opacity: searchList.length === 0 ? 0.6 : 1 }}
                                disabled={searchList.length === 0}
                            >
                                <span className="material-symbols-outlined">bolt</span> {t('ocr_btn_start_processing')}
                            </button>
                            <button className="aeon-btn-ghost" style={{ width: '100%', border: 'none' }} onClick={() => setStatus("idle")}>
                                {t('ocr_btn_cancel_ready')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {status === "processing" && (
                <div className="aeon-ocr-workspace">
                    <div className="aeon-premium-scanner">
                        <div className="aeon-scanner-wand">
                            <div className="aeon-scanner-glow"></div>
                            <span>✨</span>
                        </div>
                        
                        <div className="aeon-scanner-doc">
                            <div className="aeon-doc-line"></div>
                            <div className="aeon-doc-line short"></div>
                            <div className="aeon-doc-line"></div>
                            <div className="aeon-doc-line medium"></div>
                            <div className="aeon-doc-line"></div>
                            <div className="aeon-scan-beam"></div>
                        </div>

                        <div className="aeon-scanner-labels">
                            <h2 className="aeon-status-title">{statusLabel}</h2>
                            <p className="aeon-status-subtitle">{t('ocr_status_analyzing')}</p>
                        </div>
                    </div>
                </div>
            )}

            {status === "done" && (
                <div className="aeon-ocr-layout">
                    {/* Left Panel: Document Viewer */}
                    <div className="aeon-ocr-canvas">
                        <div className="aeon-ocr-doc-wrapper">
                            <img ref={imgRef} src={results[currentIndex].image} alt="DOC" onLoad={updateOverlays} style={{ display: 'block', maxWidth: '100%', borderRadius: '0.5rem' }} />
                            <div ref={overlayRef} style={{ position: 'absolute', top: 0, left: 0 }}></div>
                        </div>
                    </div>

                    {/* Right Panel: Extraction Sidebar */}
                    <div className="aeon-ocr-sidebar">
                        <div className="aeon-ocr-sidebar-header">
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#191c1e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }} title={results[currentIndex].name}>
                                {results[currentIndex].name}
                            </h3>
                            <div className="aeon-ocr-pagination">
                                <button disabled={currentIndex === 0} onClick={() => setCurrentIndex(currentIndex - 1)}>&lt;</button>
                                <span>{currentIndex + 1} / {results.length}</span>
                                <button disabled={currentIndex === results.length - 1} onClick={() => setCurrentIndex(currentIndex + 1)}>&gt;</button>
                            </div>
                        </div>

                        <div className="aeon-ocr-form" key={currentIndex}>
                            {searchList.map(field => {
                                const doc = results[currentIndex].data;
                                const val = (doc.buscarCampos && doc.buscarCampos[0] && doc.buscarCampos[0][field.clave] !== undefined)
                                    ? doc.buscarCampos[0][field.clave]
                                    : (doc.mapped && doc.mapped[field.clave] !== undefined ? doc.mapped[field.clave] : "");

                                return (
                                    <div key={field.clave} className="aeon-ocr-form-group">
                                        <label className="aeon-ocr-label">{field.clave.replace(/_/g, ' ')}</label>
                                        <input
                                            type="text"
                                            className="aeon-ocr-input"
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

                        <div className="aeon-ocr-actions">
                            <p style={{ fontSize: '0.75rem', color: '#464555', textAlign: 'center', margin: 0, opacity: 0.7 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1rem', verticalAlign: 'middle' }}>info</span>
                                {" " + t('ocr_msg_export_hint')}
                            </p>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Returns today's date in YYYY-MM-DD format using local time
 */
function getLocalToday() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
}

async function selecionaPaginasPdf(filesPdf) {
    Swal.fire({ title: t('ocr_msg_preparing_pdf'), didOpen: () => Swal.showLoading() });
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
                item.innerHTML = `<p>${t('ocr_pdf_page')} ${i}</p><input type="checkbox" data-fidx="${fIdx}" data-pidx="${i - 1}" style="display:none">`;
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
            title: t('ocr_title_pages'), html: container, width: '80%', showCancelButton: true,
            preConfirm: () => {
                const checked = container.querySelectorAll('input:checked');
                return Array.from(checked).map(c => ({ fileIdx: parseInt(c.dataset.fidx), pageIdx: parseInt(c.dataset.pidx) }));
            }
        });
        return value;
    } catch (e) { console.error(e); return null; }
}

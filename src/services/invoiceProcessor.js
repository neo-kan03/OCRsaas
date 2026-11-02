import * as pdfjsLib from 'pdfjs-dist';
import { t } from './translations';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const InvoiceProcessor = {
    get configs() {
        return {
            [t('ocr_config_standard')]: [
                { clave: "invoice_number", valor: t('field_desc_factura_id') },
                { clave: "date", valor: t('field_desc_factura_date') },
                { clave: "total", valor: t('field_desc_factura_total') },
                { clave: "vendor_name", valor: t('field_desc_factura_provider') },
                { clave: "vat_number", valor: t('field_desc_factura_nif') }
            ],
            [t('ocr_config_receipts')]: [
                { clave: "date", valor: t('field_desc_factura_date') },
                { clave: "total", valor: t('field_desc_factura_total') },
                { clave: "vendor", valor: t('field_desc_factura_provider') }
            ]
        };
    },

    // Webhook de n8n que hace el OCR. Se configura con VITE_OCR_WEBHOOK_URL (ver .env.example).
    OCR_WEBHOOK_URL: import.meta.env.VITE_OCR_WEBHOOK_URL || "https://n8n.neo-n8n.com/webhook/ocr-vision",

    async processDocument(blob, name, searchList) {
        const targetWebhook = this.OCR_WEBHOOK_URL;

        const formData = new FormData();
        formData.append('file', blob, name);

        // Lista de campos como JSON: [{ clave, valor }]
        formData.append('campos', JSON.stringify(searchList.map(({ clave, valor }) => ({ clave, valor }))));
        // Formato antiguo ('"clave":"valor"' separados por comas), por compatibilidad con flujos anteriores
        const searchStrings = searchList.map(item => `"${item.clave}":"${item.valor}"`);
        formData.append('listaContenidoBuscar', searchStrings);

        const response = await fetch(targetWebhook, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            let detalle = "";
            try {
                const err = await response.json();
                detalle = [err.nodo, err.error, err.detalle].filter(Boolean).join(" · ");
            } catch (e) { /* respuesta sin JSON */ }
            throw new Error(`Error del servidor (${response.status}) en n8n${detalle ? ": " + detalle : ""}`);
        }

        const data = await response.json();
        return Array.isArray(data) ? data[0] : data;
    },

    async pdfToImage(file, pageIdx) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(pageIdx + 1);
        const viewport = page.getViewport({ scale: 4.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport: viewport }).promise;
        return canvas.toDataURL('image/png');
    },

    extractOcrFields(fData, naturalW, naturalH) {
        const out = [];
        if (!fData || !Array.isArray(fData.pages)) return out;

        fData.pages.forEach((page) => {
            if (!Array.isArray(page.blocks)) return;

            page.blocks.forEach((block) => {
                const text = (block.text || "").trim();
                if (!text) return;

                const poly = block.boundingPoly || block.bbox;
                if (!poly) return;

                let vertices = [];
                if (Array.isArray(poly.vertices)) {
                    vertices = poly.vertices;
                } else if (Array.isArray(poly.normalizedVertices)) {
                    vertices = poly.normalizedVertices.map(v => ({ x: (v.x || 0) * naturalW, y: (v.y || 0) * naturalH }));
                } else if (Array.isArray(poly)) {
                    vertices = poly;
                }

                if (!vertices.length) return;

                const xs = vertices.map(v => v.x || 0);
                const ys = vertices.map(v => v.y || 0);
                const left = Math.min(...xs);
                const top = Math.min(...ys);
                const w = Math.max(...xs) - left;
                const h = Math.max(...ys) - top;

                if (block.type && block.type !== 'PARAGRAPH') return;

                out.push({
                    key: block.type || "block",
                    value: text,
                    bbox: { x: left, y: top, width: w, height: h }
                });
            });
        });

        return out;
    },

    // Valor que devolvió el OCR para una clave (buscarCampos tiene prioridad sobre mapped).
    getOcrValue(doc, key) {
        if (!doc) return "";
        const found = doc.buscarCampos && doc.buscarCampos[0];
        if (found && found[key] !== undefined && found[key] !== null) return found[key];
        if (doc.mapped && doc.mapped[key] !== undefined && doc.mapped[key] !== null) return doc.mapped[key];
        return "";
    },

    // Campos finales de un documento: lo que devolvió el OCR con las correcciones del usuario encima.
    getDocumentFields(result, edits = {}) {
        const doc = result.data || {};
        const keys = new Set();
        if (doc.buscarCampos && doc.buscarCampos[0]) Object.keys(doc.buscarCampos[0]).forEach(k => keys.add(k));
        if (doc.mapped) Object.keys(doc.mapped).forEach(k => keys.add(k));
        Object.keys(edits).forEach(k => keys.add(k));

        const fields = {};
        keys.forEach(k => {
            fields[k] = edits[k] !== undefined ? edits[k] : this.getOcrValue(doc, k);
        });
        return fields;
    },

    // edits: { [índiceDelResultado]: { clave: valorCorregido } }
    exportToCSV(results, edits = {}) {
        if (!results || results.length === 0) return;

        const rows = results.map((res, i) => this.getDocumentFields(res, edits[i]));
        const allKeys = new Set();
        rows.forEach(fields => Object.keys(fields).forEach(k => allKeys.add(k)));
        const keys = Array.from(allKeys);

        const cell = (v) => {
            const str = v === null || v === undefined ? "" : String(v);
            return /[";\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
        };

        let csvContent = "\uFEFF" + [t('csv_header_file'), ...keys].map(cell).join(";") + "\n";
        results.forEach((res, i) => {
            csvContent += [res.name, ...keys.map(k => rows[i][k])].map(cell).join(";") + "\n";
        });

        this.downloadBlob(
            new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }),
            `${t('csv_filename')}_${new Date().getTime()}.csv`
        );
    },

    exportToJSON(results, edits = {}) {
        if (!results || results.length === 0) return;

        const out = results.map((res, i) => ({
            file: res.name,
            fields: this.getDocumentFields(res, edits[i])
        }));

        this.downloadBlob(
            new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' }),
            `extraction_${new Date().getTime()}.json`
        );
    },

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
};

window.InvoiceProcessor = InvoiceProcessor;
export default InvoiceProcessor;

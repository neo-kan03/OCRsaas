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

    // URLs de n8n
    N8N_URL: "https://n8n.neo-n8n.com/webhook/google-doc-ai",
    N8N_LOCAL: "http://localhost:5678/webhook-test/google-doc-ai",

    async processDocument(blob, name, searchList) {
        const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        const targetWebhook = isLocal ? this.N8N_LOCAL : this.N8N_URL;

        const formData = new FormData();
        formData.append('file', blob, name);
        
        // Formato que espera el n8n del usuario: listado de strings '"clave":"valor"'
        const searchStrings = searchList.map(item => `"${item.clave}":"${item.valor}"`);
        formData.append('listaContenidoBuscar', searchStrings);

        const response = await fetch(targetWebhook, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Error del servidor (${response.status}) en n8n`);
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

    exportToCSV(results) {
        if (!results || results.length === 0) return;

        let allKeys = new Set([t('csv_header_file')]);
        results.forEach(res => {
            const doc = res.data;
            if (doc.buscarCampos && doc.buscarCampos[0]) {
                Object.keys(doc.buscarCampos[0]).forEach(k => allKeys.add(k));
            }
            if (doc.mapped) {
                Object.keys(doc.mapped).forEach(k => allKeys.add(k));
            }
        });

        const headers = Array.from(allKeys);
        let csvContent = "\uFEFF" + headers.join(";") + "\n";

        results.forEach(res => {
            const doc = res.data;
            let row = [res.name];
            headers.slice(1).forEach(h => {
                let val = "";
                if (doc.buscarCampos && doc.buscarCampos[0] && doc.buscarCampos[0][h] !== undefined) {
                    val = doc.buscarCampos[0][h];
                } else if (doc.mapped && doc.mapped[h] !== undefined) {
                    val = doc.mapped[h];
                }
                row.push(String(val).replace(/;/g, ","));
            });
            csvContent += row.join(";") + "\n";
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${t('csv_filename')}_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

window.InvoiceProcessor = InvoiceProcessor;
export default InvoiceProcessor;

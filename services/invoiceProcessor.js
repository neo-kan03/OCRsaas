window.InvoiceProcessor = {
    // Configuraciones predefinidas de búsqueda
    CONFIGS: {
        factura: [
            { clave: 'id_factura', valor: window.t('field_desc_factura_id') },
            { clave: 'base_imponible', valor: window.t('field_desc_factura_base') },
            { clave: 'iban_pago', valor: window.t('field_desc_factura_iban') },
            { clave: 'proveedor_nombre', valor: window.t('field_desc_factura_provider') },
            { clave: 'nif', valor: window.t('field_desc_factura_nif') },
            { clave: 'fecha', valor: window.t('field_desc_factura_date') },
            { clave: 'total', valor: window.t('field_desc_factura_total') }
        ],
        contrato: [
            { clave: 'nombre', valor: window.t('field_desc_contrato_name') },
            { clave: 'dni', valor: window.t('field_desc_contrato_dni') },
            { clave: 'empresa', valor: window.t('field_desc_contrato_company') },
            { clave: 'remuneracion', valor: window.t('field_desc_contrato_salary') },
            { clave: 'puesto_trabajo', valor: window.t('field_desc_contrato_job_title') },
            { clave: 'num_ss', valor: window.t('field_desc_contrato_ssn') },
            { clave: 'fecha_inicio', valor: window.t('field_desc_contrato_start') },
            { clave: 'fecha_fin', valor: window.t('field_desc_contrato_end') }
        ]
    },

    // URL de n8n
    N8N_URL: "https://n8n.neo-n8n.com/webhook/google-doc-ai",
    N8N_LOCAL: "http://localhost:5678/webhook-test/google-doc-ai",

    async pdfToImage(file, pageIndex = 0) {
        if (!window.pdfjsLib) throw new Error("pdf.js no cargado");
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(pageIndex + 1);

        const scale = 4; // Escala alta para OCR de calidad
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        return canvas.toDataURL("image/png");
    },

    async processDocument(blob, name, searchList, meta = {}) {
        const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        const targetWebhook = isLocal ? this.N8N_LOCAL : this.N8N_URL;

        const formData = new FormData();
        formData.append('file', blob, name);
        formData.append('originalName', meta.originalName || '');
        formData.append('pageIndex', (meta.pageIndex || ''));

        // Formato que espera el n8n del usuario: listado de strings '"clave":"valor"'
        const searchStrings = searchList.map(item => `"${item.clave}":"${item.valor}"`);
        formData.append('listaContenidoBuscar', searchStrings);

        const response = await fetch(targetWebhook, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Error del servidor (${response.status})`);
        }

        const data = await response.json();
        // n8n suele devolver un array, extraemos el primer elemento que es el objeto de la factura
        return Array.isArray(data) ? data[0] : data;
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
                    vertices = poly.normalizedVertices.map(v => ({ x: v.x * naturalW, y: v.y * naturalH }));
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

    async exportToCSV(results) {
        if (!results.length) return;

        // Aplanamos los resultados para el CSV
        let csvContent = "\ufeff"; // BOM para Excel
        
        // Obtener todas las claves posibles
        const allKeys = new Set();
        results.forEach(r => {
            const doc = r.data;
            if (doc.mapped) Object.keys(doc.mapped).forEach(k => allKeys.add(k));
            if (doc.buscarCampos && doc.buscarCampos[0]) {
                Object.keys(doc.buscarCampos[0]).forEach(k => allKeys.add(k));
            }
        });

        const headers = [window.t('csv_header_file'), ...Array.from(allKeys)];
        csvContent += headers.join(";") + "\n";

        results.forEach(res => {
            const doc = res.data;
            const row = [res.name];
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
        link.setAttribute("download", `${window.t('csv_filename')}_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

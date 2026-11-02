# Flujo de OCR en n8n (Gemini)

`ocr-gemini.workflow.json` sustituye al flujo de Google Document AI. Recibe la imagen
de la página y la lista de campos, se la pasa a Gemini Flash y devuelve la respuesta
en el mismo formato que daba Document AI, así que el panel de revisión (cajas
arrastrables) y el export funcionan sin tocar nada más.

```
Webhook (POST /webhook/ocr-vision) → Preparar petición → Gemini → Formato Document AI → Responder
```

## Instalarlo

1. Saca una API key en https://aistudio.google.com/apikey (tiene capa gratuita).
2. En n8n: **Workflows → Import from File** y elige `ocr-gemini.workflow.json`.
3. Abre el nodo **Gemini** → *Credential* → *Create new* → **Google Gemini(PaLM) Api**
   y pega la API key. El host se deja como está.
4. Prueba: pulsa *Listen for test event* en el webhook y lanza un documento desde la
   app apuntando a `https://n8n.neo-n8n.com/webhook-test/ocr-vision`
   (`VITE_OCR_WEBHOOK_URL` en `.env`).
5. Activa el workflow. La URL de producción es `https://n8n.neo-n8n.com/webhook/ocr-vision`,
   que es la que usa la app por defecto.

## Qué recibe y qué devuelve

Entrada (multipart/form-data):

- `file`: imagen de la página (PNG/JPG). Los PDF ya llegan rasterizados desde el navegador.
- `campos`: JSON `[{ "clave": "total", "valor": "Importe total con IVA" }, ...]`.
  También acepta el formato antiguo `listaContenidoBuscar`.

Salida:

```json
{
  "buscarCampos": [{ "total": "121,00 €", "date": "31/08/2026" }],
  "pages": [{ "blocks": [{ "type": "PARAGRAPH", "text": "...", "boundingPoly": { "normalizedVertices": [...] } }] }],
  "modelo": "gemini-2.5-flash",
  "uso": { "promptTokenCount": 0, "candidatesTokenCount": 0 }
}
```

## Cambiar de modelo

El modelo está en la primera línea del nodo **Preparar petición** (`const MODEL = ...`).
`gemini-2.5-flash-lite` es más barato si la calidad te basta. Si pasas a un modelo que no
admite `thinkingConfig`, quita esa línea del mismo nodo.

## Ojo

El webhook sigue siendo público: cualquiera con la URL puede gastar tu cuota de Gemini.
Esto se arregla con el backend con validación de token que está pendiente.

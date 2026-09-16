# Audit — Print page 2 leaks CSS comment as text (2026-09-15)

## Symptom
PO: после печати документа на 2-й странице виден текст вроде  
`(multi-page/table-overflow path) never gets that class … */ table { font-size: 9px; } th, td { … }`

## Root cause

1. В `buildDocumentContentStyles` (studioCanvas) CSS-комментарий TZ-NX-PO-SWEEP-06 содержит литерал **`<body>`**.
2. `renderHtmlPages` для каждой страницы вызывает `renderHtml`, затем:

```ts
const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
return match?.[1] ?? '';
```

3. Regex находит **первое** `<body` в строке — это вхождение **внутри `<style>…/* … <body> … */`**, не настоящий body.
4. В «тело страницы» попадает хвост комментария + CSS rules как **видимый текст** (часто на 2-й странице multi-page/table-overflow).

## Fix
- Убрать любые `<`/`</` HTML-теги из CSS-комментариев (переписать comment без слова `<body>`).
- Harden extract: брать body **только после `</head>`** (или DOM parse), + regress spec что studio CSS comment не содержит `<body` и multi-page HTML не содержит сырой `multi-page/table-overflow` в text nodes / page sections.

## Files
`backend/src/modules/document-render/document-render.service.ts`  
`backend/src/modules/document-render/document-render.studio-canvas.spec.ts`

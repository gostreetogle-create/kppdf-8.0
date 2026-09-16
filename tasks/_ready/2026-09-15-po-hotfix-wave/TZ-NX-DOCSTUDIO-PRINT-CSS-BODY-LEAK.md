# TZ-NX-DOCSTUDIO-PRINT-CSS-BODY-LEAK: CSS comment не должен попадать в печать

> **SIZE:** S · **PAGES:** studio (print/PDF) · **PAGE_DOCS:** `docs/pages/document-studio.page.md`  
> **РОЛЬ:** Executor · **LAYER:** 4 (backend)  
> **CONFLICT KEYS:** `backend/src/modules/document-render/document-render.service.ts`; `document-render.studio-canvas.spec.ts`; `docs/audits/2026-09-15-docstudio-print-css-body-leak.md`  
> **НЕТ** frontend-nx product UI — можно параллельно с Claude drag-fix / Freebuff chrome **если** не трогают backend

### Preflight
Audit: `docs/audits/2026-09-15-docstudio-print-css-body-leak.md`  
Root cause confirmed: CSS comment contains `<body>` → `renderHtmlPages` regex grabs wrong slice.

## ЧТО ДЕЛАТЬ

### 1. Sanitize comment
В `buildDocumentContentStyles` studio block: переписать комментарий SWEEP-06 **без** HTML-тегов (`<body>`, `</style>`, и т.п.). Достаточно: «multi-page path has no doc-body--studio class; bare table selectors OK».

### 2. Harden body extract in `renderHtmlPages`
```ts
// After </head> only — never match <body inside <style>
const afterHead = html.split(/<\/head>/i)[1] ?? html;
const match = afterHead.match(/<body[^>]*>([\s\S]*)<\/body>/i);
```
(или эквивалент устойчивее)

### 3. Specs
- `buildDocumentContentStyles` / renderHtml studio CSS **must not** match `/<body/i` inside the style payload (or full html style section before head close).
- `renderHtmlPages` with `studioCanvas:true` + pageNumbering + ≥2 pages: joined page HTML must **not** contain `multi-page/table-overflow` or `never gets that class` as visible body text.
- Existing SWEEP-06 table 9px contract tests remain green.

## НЕ
- Менять visual table CSS contract (9px/padding/nowrap) — только comment + extract
- Deploy
- FE drag TZ

## AC
1. Печать/preview multi-page не показывает CSS-комментарий на страницах.
2. Specs PASS; `cd backend && pnpm test -- --testPathPattern=document-render`.
3. Archive + commit.

### Gates
```bash
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd backend && pnpm test -- --testPathPattern=document-render
```

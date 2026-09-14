# TZ-NX-DOCSTUDIO-PREVIEW-UPLOADS-INLINE: Просмотр — фото как в PDF

**РОЛЬ АГЕНТА:** Executor (backend studio-output + optional FE smoke) — claude  
**ЗАВИСИМОСТИ:** PDF already inlines via `inlineLocalUploadsForPdf`  
**LAYER:** 4 · **SIZE:** S  
**PAGES:** `/studio/:id` режим Просмотр  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`

**CONFLICT KEYS:**  
`backend/src/modules/studio-document/studio-output.service.ts` ;  
`backend/src/modules/studio-document/studio-output.service.spec.ts` ;  
`backend/src/modules/document-render/document-render.utils.ts` (rename/export helper if needed) ;  
`docs/pages/document-studio.page.md`

IMPLICIT CONFLICT: nx build only if FE touched (prefer BE-only)

### Symptom (PO)
Скачанный **PDF — фото видны**. Режим **Просмотр — broken img / «Нет фото»**. Значит disk+resolver+PDF OK; ломается **доставка URL в srcdoc iframe**.

### Root cause
- Preview: `POST …/preview` → HTML с `<img src="/uploads/…">` + `<base href="http://127.0.0.1:3000/">` → iframe `sandbox="allow-same-origin"` `[srcdoc]`.
- PDF: тот же HTML прогоняется через `inlineLocalUploadsForPdf` → `data:` URI (Puppeteer не зависит от HTTP).
- Path-absolute `/uploads/…` в srcdoc часто **не** стабильно резолвится к backend (origin `about:srcdoc` / base / proxy :4201 vs :3000) → broken icon. «Нет фото» = пустой url после orphan-check (отдельный кейс).

### ЧТО ДЕЛАТЬ

1. В `StudioOutputService.preview()` после `renderStudioDocument`:  
   `html = await inlineLocalUploadsForPdf(html)` (или переименовать helper в нейтральное `inlineLocalUploadsForEmbeddedHtml` — оба call site).
2. Spec: preview result contains `data:image` (or `data:`) for a fixture upload path that exists; does not leave that fixture as bare `/uploads/…` src when file exists.
3. page.md: Просмотр = те же inlined uploads, что PDF (не рассчитывать на live `/uploads` внутри srcdoc).
4. Live: документ где PDF уже показывает фото → Просмотр показывает те же миниатюры (не broken).

### НЕ

- Менять canvas editor path  
- Требовать KPPDF_PUBLIC_ORIGIN как единственный фикс (inline надёжнее)  
- UNSCOPED-ORG / PHOTO-EMPTY blank text (можно follow-up; empty cell без «Нет фото» — уже отдельный TZ)

### AC

1. PDF и Просмотр на одном документе с реальными каталожными фото — оба показывают картинки.  
2. Unit/spec на preview inlining.  
3. Gates: `pnpm test` studio-output (+ utils if renamed) ; BE tsc.

### Claim
```
agent_id: claude
claimed_at: 2026-09-14T04:12:01Z
branch: main
baseline_sha: 6c2f2cd8539209e67575dff6718c63b8f49813ca
```

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-14
closed_by: Claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: PASS
  - checklist: ADDED (docs/agent-checklists/TZ-NX-DOCSTUDIO-PREVIEW-UPLOADS-INLINE.md)
  - progress.md: N/A (redirected to docs/agent-checklists/_NOW.md per repo convention)
  - status synchronization: PASS

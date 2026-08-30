# WAVE-DOC-STUDIO — Документ-студия

> **Status:** Waves **0–19 DONE** (2026-08-29)  
> **ADR:** [`docs/architecture/document-studio.md`](../docs/architecture/document-studio.md) v1.2

## Очередь

| Wave | Scope | Status |
|------|-------|--------|
| **0–11** | Core editor, preview, archive API, FIC | **DONE** |
| **12–15** | Ribbon PDF/archive, from-template, data rail, save-as-template | **DONE** |
| **16** | ERP live rows + bakeSnapshot | **DONE** |
| **17** | Multipage, auto-overflow, page numbering, letterhead | **DONE** |
| **18** | Orphan sweep, SD numbering, PDF semaphore | **DONE** |
| **19** | 409 save-copy, deep links, blank archive, docTypeId, full-page | **DONE** |
| **UI-301/302** | Chrome rail, Pi ribbon, panel extraction, editor facade | **DONE** |

Archives: [`401`](_archive/2026-08/TZ-DOC-STUDIO-401-canvas-blocks.done.md) · [`501–1101`](_archive/2026-08/TZ-DOC-STUDIO-501-1101-waves.done.md) · [`1201–1501`](_archive/2026-08/TZ-DOC-STUDIO-1201-1501-waves.done.md) · [`1601`](_archive/2026-08/TZ-DOC-STUDIO-1601-erp-live-rows.done.md) · [`1701`](_archive/2026-08/TZ-DOC-STUDIO-1701-multipage.done.md) · [`1801`](_archive/2026-08/TZ-DOC-STUDIO-1801-ops-closeout.done.md) · [`1901`](_archive/2026-08/TZ-DOC-STUDIO-1901-ux-gaps.done.md) · [`2001–2004`](_archive/2026-08/) inspection closeout · [`UI-301/302`](_archive/2026-08/TZ-STUDIO-UI-301-302-workspace-shell.done.md)

**Checklist policy:** волны **401**, **501–1101**, **1201–1501** — batch-close одним `.done.md` + gates в архиве; per-wave `docs/agent-checklists/TZ-DOC-STUDIO-*.md` **не восстанавливаем** (осознанное исключение, см. TZ-2005). Единичные волны (101, 1601–2004) — checklist или archive note по факту.

## PO path

**Документы → Студия документов → Из шаблона** → привязать КП/заказ в **Данные** → таблица live → **PDF** / **В архив**.

## Successor (cleanup)

- `template_blocks` cutover step 5–6 (studio-only parent write)
- Inspection closeout **2001–2004 DONE** · backlog `2005`/`2006` optional

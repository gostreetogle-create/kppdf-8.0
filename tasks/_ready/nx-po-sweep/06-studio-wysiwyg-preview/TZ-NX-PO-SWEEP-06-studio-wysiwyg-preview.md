# TZ-NX-PO-SWEEP-06: studio WYSIWYG — editor === preview === PDF (таблицы)

**РОЛЬ АГЕНТА:** Executor (frontend-nx + document-render / studio-output) — claude  
**ЗАВИСИМОСТИ:** audit `docs/audits/2026-09-12-studio-editor-preview-wysiwyg.md`  
**LAYER:** 3 · **SIZE:** L (можно 2 коммита: CSS contract → iframe zoom)  
**PAGES:** `/studio` editor + preview + PDF  

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.ts` (table CSS) ;  
`backend/src/modules/studio-document/studio-data-resolver.ts` (`renderStudioTableHtml`) ;  
`backend/src/modules/document-render/document-render.service.ts` (`buildDocumentContentStyles` / table rules) ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` (preview iframe scale / zoom parity) ;  
specs: canvas, studio-data-resolver, document-render, optional visual/contract test

IMPLICIT CONFLICT: nx build kppdf-web

### Preflight Check Output
- **Context read:** audit 2026-09-12; canvas `font-size:9px`+nowrap; BE table без font-size + cellpadding 6 + wrap
- **Key Constraints:** A4 geometry law; print = preview; не ломать multipage table split
- **Planned Deliverable:** shared table style contract + iframe zoom parity
- **Validation Path:** jest BE+FE; ручной AC в TZ; nx build

**Проверено:** два независимых style path → визуальный дрейф.

---

## РЕШЕНИЕ (PO)

Что вижу в редакторе (габариты блока, масштаб текста таблицы, плотность ячеек) = глаз = печать/PDF.

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Контракт стилей таблицы (SoT)
Зафиксировать один набор (числа в одном месте — shared const/CSS string или документированный dual-copy с тестом на равенство):
- `font-size` (сейчас editor 9px — решить **print-realistic** значение: либо подтянуть preview к 9px, либо поднять canvas к print-pt и сохранить относительный масштаб блока; **предпочтение PO: как в редакторе, что он настроил** → preview/PDF → к canvas-контракту, не наоборот);
- cell padding;
- `white-space` / ellipsis vs wrap — **один** режим для всех трёх;
- photo thumb max size (согласовать с #05 если параллельно).

Применить в: canvas `.table-preview table|th|td`, `renderStudioTableHtml` (убрать конфликтующий cellpadding или выровнять), `buildDocumentContentStyles` th/td для studio.

### ШАГ 2 — Layout блоков
Убедиться preview/PDF для studio canvas использует **positioned** layout тех же % что editor (уже studioCanvas path) — регрессия если table теряет `block--positioned`.

### ШАГ 3 — Zoom preview
Iframe просмотра: тот же визуальный масштаб листа, что `zoomMode` редактора (`fit`/`100`), чтобы мм-страница не выглядела «другой».

### ШАГ 4 — Specs
- Contract test: ключевые CSS declarations совпадают (или snapshot shared CSS).  
- Resolver HTML содержит ожидаемый font-size/padding class.  
- Не ломать multipage overflow specs.

## НЕ ИЗМЕНЯТЬ

`kp-workspace-geometry` law без нужды; Create-КП rewrite; orphan photos; #02 click behavior (кроме если zoom затронут).

## КРИТЕРИИ ПРИЁМКИ

1. Один документ: editor vs eye — таблицы **визуально сопоставимы** (кегль, плотность, переносы, ширина колонок в рамках того же layout box).  
2. PDF/print path использует тот же table CSS contract.  
3. Specs green; `nx build kppdf-web` last.  
4. Closeout в audit: before/after note.

# WAVE: Единая пагинация (PiPagination canon)

**Статус:** #1 DONE → next #2 (TZ-UX-341)  
**Аудит:** `docs/audits/2026-08-16-pagination-unification-audit.md`  
**Канон UI:** range `N–M из T` + ‹ › + номера (≥5 стр.) + select 10/25/50; default **10**

## Queue

| # | TZ | Файл | DEPENDS | Status |
|---|-----|------|---------|--------|
| 1 | TZ-UX-340 | `tasks/_archive/2026-08/TZ-UX-340.done.md` | — | **DONE** (`a36120d4`) |
| 2 | TZ-UX-341 | `tasks/TZ-UX-341-catalog-grid-pager-unify.md` | 340; желательно после UX-326 (оба `products.page`) | NEXT |
| 3 | TZ-UX-342 | `tasks/TZ-UX-342-pager-dead-totals-and-rail.md` | 340 | IN WORK |

## Правила

- Один агент на TZ; serial 340→341→342.  
- Не трогать deploy.  
- Не invent second pager component name if `pi-pagination` can absorb features.  
- Commit per TZ.

## Prompt

См. `tasks/_backlog/PROMPT-TZ-UX-340.md` (старт волны).

# TZ-SALES-375 DONE — remove «Позиции КП» draft-lines from products flyout

```
ARCHIVE_MARKER
task: TZ-SALES-375
outcome: DONE
closed_at: 2026-08-15T07:13:00Z
closed_by: Buffy (closeout)
workspace: D:\kppdf-8.0
implementation_sha: d75e1f08c10e76077e94beb27ea5b919e5bc9d93
closeout_sha: f24400d0
verification:
  - acceptance criteria: PASS (см. checklist docs/agent-checklists/TZ-SALES-375.md)
  - frontend tsc: PASS
  - proposal-product-rail Jest: PASS (11 tests)
  - proposal-create Jest: PASS (61 tests)
  - Cursor verdict: PASS (cross-check d75e1f08 — no kp-rail-draft-lines; draftLines/inKpQty kept; dead quantityChange removed)
  - checklist: DONE
  - progress.md: UPDATED
  - active marker: removed after archive
  - deploy: NOT EXECUTED
protected:
  - frontend/src/app/pages/commercial/proposals/proposal-product-rail.component.ts
  - frontend/src/app/pages/commercial/proposals/proposal-product-rail.component.spec.ts
  - frontend/src/app/pages/commercial/proposals/proposal-create.page.ts
  - frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts
  - docs/pages/proposals-create.page.md
  - docs/pages/PAGE-TZ-INDEX.md
```

## Delivered

- Removed `rail__draft-lines` section (`kp-rail-draft-lines`, eyebrow «Позиции КП») from products flyout; cards start directly under filters.
- Kept `draftLines` input for `inKpQty()` / «В КП» / «Ещё +N» on catalog cards.
- Removed dead `quantityChange` output + page `onQuantityChange`; qty edits via table editor `onCompositionLineChange`.
- Specs: rail asserts no draft-lines list; page spec migrated qty test to composition path.
- Docs: `proposals-create.page.md` note **375**; PAGE-TZ-INDEX already listed 375.

## НЕ

- Deploy / wipe
- Removing `draftLines` input or card add-qty / «В КП» badges
- BE, schema, AUTH-305

---

# TZ-SALES-375: Убрать «Позиции КП» из панели Товары

РОЛЬ АГЕНТА: Frontend UI (Create КП products rail)

ЗАВИСИМОСТИ: SALES-374 DONE; AUTH-305 keys не пересекаются

LAYER: 2

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md

CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposal-product-rail.component.ts ; frontend/src/app/pages/commercial/proposals/proposal-product-rail.component.spec.ts ; frontend/src/app/pages/commercial/proposals/proposal-create.page.ts ; frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts ; docs/pages/proposals-create.page.md ; docs/pages/PAGE-TZ-INDEX.md

Spec: `tasks/TZ-SALES-375-remove-products-rail-draft-lines.md`

## КРИТЕРИИ ПРИЁМКИ (met)

1. Create КП → Товары при строках в КП: **нет** блока «Позиции КП» / `kp-rail-draft-lines`.
2. Карточки сразу под фильтрами; «В КП: N» и add работают.
3. Qty меняется в «Редакторе таблицы» как раньше.
4. Gates: tsc + rail 11 + create 61 PASS.
5. Docs + PAGE-TZ-INDEX обновлены.
6. Cursor PASS → archive/lock/closeout.

## known_limitation

- Custom lines без карточки каталога по-прежнему видны только в редакторе таблицы (это ок — не возвращать список в Товары).

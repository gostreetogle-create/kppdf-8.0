# TZ-DOC-TABLES-310: Убрать help-простыню + развести две кнопки

РОЛЬ АГЕНТА: Frontend UI Engineer

ЗАВИСИМОСТИ: TZ-DOC-TABLES-309 DONE (PO rejected on-page help; keep taller fields + RU button names)

LAYER: 3

PAGES: /doc-constructor/tables
PAGE_DOCS: tables.page.md

CONFLICT KEYS: frontend/src/app/pages/doc-constructor/tables/table-template-dialog.component.ts ; frontend/src/app/pages/doc-constructor/tables/table-template-dialog.component.spec.ts ; docs/pages/tables.page.md ; docs/pages/PAGE-TZ-INDEX.md

Проверено: PO скрин 2026-08-15 — две оранжевые ссылки слиплись («+ ДОБАВИТЬ СТОЛБЕЦ КОЛОНКИ КАК В КП»); серый абзац `ttd-column-help` = объяснение для чата, не для UI. PO: «в чате мог объяснить», help на сайте = дичь.

## ИСХОДНОЕ СОСТОЯНИЕ

1. После 309 в тулбаре: `+ Добавить столбец` + `Колонки как в КП` без явного разделителя → визуально одна фраза.
2. Абзац `data-test="add-column-help"` занимает место и раздражает.
3. Taller inputs / «Колонки как в КП» / confirm RU — оставить (это ок).
4. fontSize колонок — **не** в этой TZ.

## ЧТО ДЕЛАТЬ

### ШАГ 1. Удалить help с UI

1. Убрать `<p class="ttd-column-help" …>` целиком.
2. Убрать CSS `.ttd-column-help` если больше нигде не нужен.
3. Убрать/поправить spec asserts на `add-column-help`, если есть.

### ШАГ 2. Развести две кнопки

1. Между «+ Добавить столбец» и «Колонки как в КП» — явный визуальный разделитель (sep `|` / gap ≥12–16px / вторая кнопка не как соседний ttd-link вплотную).
2. На скрине не должно читаться одной строкой «ДОБАВИТЬ СТОЛБЕЦ КОЛОНКИ КАК В КП».
3. data-test `add-column-button` / `apply-kp-preset` сохранить.

### ШАГ 3. Docs

1. `tables.page.md` — поправить note 309/310: help снят; кнопки разведены.
2. `PAGE-TZ-INDEX.md` — строка 310.

## НЕ ИЗМЕНЯТЬ

- Backend / fontSize / Create КП / taller field sizes from 309 (оставить)
- Deploy

## КРИТЕРИИ ПРИЁМКИ

1. На диалоге нет абзаца-справки про ключ/название.
2. Две кнопки визуально разделены (не сливаются в одну фразу).
3. Gates:

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- table-template-dialog.component.spec
```

## Финализация

checklist `docs/agent-checklists/TZ-DOC-TABLES-310.md` → READY FOR REVIEW → archive после Cursor PASS.
Deploy НЕ.

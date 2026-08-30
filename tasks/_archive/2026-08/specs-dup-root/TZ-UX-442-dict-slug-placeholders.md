# TZ-UX-442: dictionaries — RU placeholders для slug

PAGES: `/categories` ; `/dictionaries/*` (forms)
PAGE_DOCS: categories.page.md (1 строка если есть)
РОЛЬ АГЕНТА: Frontend UI Engineer (Freebuff)
ЗАВИСИМОСТИ: Нет (∥ UX-441 — разные keys)
LAYER: 3
CONFLICT KEYS: `frontend/src/app/pages/dictionaries/category-form-dialog.component.ts`; `frontend/src/app/pages/dictionaries/text-block-category-form-dialog.component.ts`; `frontend/src/app/pages/dictionaries/document-template-category-form-dialog.component.ts`; `frontend/src/app/pages/dictionaries/color-reference-form-dialog.component.ts`

## Domain preflight

- **Проверено:** PO-CANON — UI на русском; slug = технический ключ, placeholder не обязан быть EN-tech jargon в лицо.
- **Проверено placeholders:** `category-slug`, `rekvizity-kontragenta`, `commercial-proposals`, `ral-9003-signalny-belyy`.
- Search «Поиск по названию или slug…» — **оставить** (уже RU + термин slug ок в admin).
- CATALOG-377 DONE — name-path; slug field остаётся для URL.

## ИСХОДНОЕ СОСТОЯНИЕ

Формы словарей показывают EN/транслит примеры как placeholder — выглядит «недоделано» на демо.

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Placeholders → RU примеры

| Файл | Было (примерно) | Стало |
|------|-----------------|-------|
| category-form-dialog | `category-slug` | `например: metally` **или** пустой placeholder + hint уже есть («Строчные латинские… Например: metals») → **предпочтение: убрать EN placeholder**, оставить hint |
| text-block-category-form | `rekvizity-kontragenta` | убрать / `например: rekvizity` только если hint нет — иначе пусто + RU hint |
| document-template-category-form | `commercial-proposals` | убрать EN; hint RU если нужно |
| color-reference-form | `ral-9003-…` | `например: ral-9003` или пусто + hint «латиница, дефис» |

Правило: **не** показывать длинный EN slug как единственный «пример в поле». Hint на русском — ок; поле может быть без placeholder.

### ШАГ 2 — Labels

- Если label уже «Slug (URL-ключ)» — ок (есть RU пояснение). Не переименовывать formControlName.

### ШАГ 3 — Grep AC

- В CONFLICT KEYS нет `placeholder="category-slug"`, `placeholder="commercial-proposals"`, `placeholder="rekvizity-kontragenta"`, длинного `ral-9003-signalny-belyy`.

## ИЗМЕНЯТЬ

- 4 dialog файла из CONFLICT KEYS (+ specs только если assert на placeholder)

## НЕ ИЗМЕНЯТЬ

- `app-pi-form-field` (→ UX-441)
- category.service / seed / CATALOG-377 paths
- Search placeholders «Поиск по названию или slug…»

## КРИТЕРИИ ПРИЁМКИ

1. Grep AC выше — PASS.
2. Gates:

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- category-form-dialog
cd frontend && pnpm lint
```

(нет spec → skip + tsc/lint)

## known_limitation

- Автогенерация slug из name — не этот TZ.
- DESK-441 / Gantt / Z-BE — не здесь.

## Proof of adoption

- Routed dictionary forms.
- Grep clean.

## Archive

`tasks/_archive/2026-08/TZ-UX-442.done.md` + `docs/agent-checklists/TZ-UX-442.md`.

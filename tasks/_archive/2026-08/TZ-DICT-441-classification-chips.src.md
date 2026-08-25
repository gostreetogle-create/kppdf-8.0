# TZ-DICT-441: Классификация — оба chip всегда видны

PAGES: `/categories` ; `/dictionaries/kind-labels`
PAGE_DOCS: dictionaries.page.md ; categories.page.md
РОЛЬ АГЕНТА: executor (Freebuff / Cursor Task / Claude CLI)
ЗАВИСИМОСТИ: Нет (hotfix; параллельно CATALOG-377 OK — разные keys)
LAYER: 3
CONFLICT KEYS: `frontend/src/app/pages/dictionaries/kind-labels.page.ts`; `frontend/src/app/pages/dictionaries/kind-labels.page.spec.ts`; `docs/pages/dictionaries.page.md`; `docs/pages/PAGE-TZ-INDEX.md`

## Domain preflight

- **Проверено:** `docs/pages/dictionaries.page.md` — группа «Классификация» = chips **Категории** + **Виды изделий и материалов**.
- **Проверено:** `categories.page.ts:136` → `chips = CLASSIFICATION_CHIPS` (оба chip).
- **Проверено:** `kind-labels.page.ts:114-116` → локальный массив **из одного** chip — баг.
- **Проверено:** SoT chips = `dictionary-group-chips.ts` → `CLASSIFICATION_CHIPS`.
- N/A entity/unique (nav-only UI).
- Coupling map: N/A (не трогаем статусы/поля).

## ИСХОДНОЕ СОСТОЯНИЕ

PO smoke: Справ. → Классификация → Категории → клик «Виды изделий и материалов» → chip «Категории» **пропадает**. Ожидание: оба chip остаются (как TOC «Классификация / Измерения / …»).

Факт:

```114:116:frontend/src/app/pages/dictionaries/kind-labels.page.ts
  protected readonly chips: readonly GroupChip[] = [
    { id: 'kind-labels', label: 'Виды изделий и материалов', route: '/dictionaries/kind-labels' },
  ];
```

`categories.page.ts` уже правильно использует shared `CLASSIFICATION_CHIPS`.

## ЧТО ДЕЛАТЬ

1. В `kind-labels.page.ts`: импорт `CLASSIFICATION_CHIPS` из `./dictionary-group-chips`; заменить локальный `chips` на `CLASSIFICATION_CHIPS`. Убрать неиспользуемый локальный литерал. `activeId="kind-labels"` оставить.
2. Regression в `kind-labels.page.spec.ts`: assert `component.chips` содержит оба id `categories` и `kind-labels` (и/или labels «Категории» + «Виды изделий и материалов»).
3. Docs: одна строка в `dictionaries.page.md` (оба leaf chip обязательны на `/categories` и `/kind-labels`); строка в `PAGE-TZ-INDEX.md` для DICT-441.

## ИЗМЕНЯТЬ

- `kind-labels.page.ts`
- `kind-labels.page.spec.ts`
- `docs/pages/dictionaries.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`
- checklist / `_active` / archive / progress (closeout)

## НЕ ИЗМЕНЯТЬ

- `categories.page.ts`, `dictionary-group-chips.ts` (уже канон)
- `app-layout.component.ts`, routes, backend
- CATALOG-377 files (`category.service`, supply pickers, category form)
- Deploy / wipe

## КРИТЕРИИ ПРИЁМКИ

- [ ] На `/dictionaries/kind-labels` видны **оба** chip; клик «Категории» → `/categories`; обратно — оба на месте.
- [ ] На `/categories` поведение chips без регрессии.
- [ ] Spec: chips regression PASS.
- [ ] Gates:

```bash
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- kind-labels.page.spec.ts
cd frontend && pnpm exec eslint src/app/pages/dictionaries/kind-labels.page.ts src/app/pages/dictionaries/kind-labels.page.spec.ts
pnpm architecture:check
```

- [ ] FIC §A: group chips — N/A new route; Integrity: page.md + PAGE-TZ-INDEX.
- [ ] Archive `tasks/_archive/2026-08/TZ-DICT-441.done.md` + commit/push по GIT-POLICY.
- [ ] `## Executor report (auto)` в checklist.

## known_limitation

Одиночные chips на measurements / form-profiles — out of scope (там одна leaf-страница в группе).

## Промпт исполнителю

`tasks/PROMPT-FREEBUFF-DICT-441.md` · `GEMINI.md` · claim до кода · skill `systematic-debugging` не нужен (root cause в TZ).

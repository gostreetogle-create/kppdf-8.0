# TZD-49: Desktop Import Studio — CAD follow-ups + journal (DONE)

> Successor **TZD-48** + excel rework audit follow-ups.
> Источник: `docs/audits/2026-08-16-desktop-excel-import-rework.md` § follow-up

РОЛЬ АГЕНТА: Desktop

LAYER: 3

CONFLICT KEYS: `desktop/src/App.svelte` ; `desktop/src/core/specification-import.ts`

CHECKLIST: `docs/agent-checklists/TZD-49.md`

---

## Что сделано

1. **Имена модулей CAD:** пустой `name` + есть `article` → `name = article`, issue `name_from_article` (warning, не блокирует confirm). `specificationBlockingIssues()` отделяет warnings от errors.
2. **Габариты/вес:** `parseSpecificationPhysical()` — Длина→depth, Ширина→width, Толщина→height, Масса→weight; передаётся в `specificationCreateBody()` при POST module/product.
3. **Spec confirm lookup:** `lookupSpecificationCatalog()` — products/materials через `?limit=20&search=<article>` + exact match; modules — кэш `/api/modules`.
4. **Journal hint (thin):** hint в панели спецификации — confirm пишет в каталог сразу, не через журнал.

## Verification

- `cd desktop && npx tsc --noEmit` → **PASS**
- `cd desktop && npx svelte-check --threshold error` → **PASS** (0/0)
- `cd desktop && npx tsx --test …` → **PASS 75/75** (+4 specification-import tests)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-18T22:15:00+03:00
closed_by: subagent (desktop executor)
TZ: TZD-49
DEP: TZD-48 DONE; TZD-58 parallel (publish-installer — не трогали)

verification:
  - acceptance criteria: PASS (код + unit tests; PO smoke CAD xlsx — ручной)
  - typecheck: PASS
  - svelte-check: PASS 0/0
  - desktop tests: PASS 75/75
  - checklist: DONE

## Files

- `desktop/src/core/specification-import.ts` — name fallback, physical parse, issue severity
- `desktop/src/core/specification-import.test.ts` — +4 tests
- `desktop/src/App.svelte` — lookup by article, create body dims/weight, UI warnings
- `docs/agent-checklists/TZD-49.md`

## Known limits

- Inline edit имён в превью — не реализовано
- Journal unify для всех сущностей spec — отдельный TZ
- Modules: нет paginated search API — full list OK для типичного каталога

## Smoke PO

1. Desktop v0.5.6 → Импорт → `6104 test Tigran с картинками (1).xlsx` → Предложить сопоставление → confirm состав (ожидание: warnings «имя из артикула», не 83 blocking missing_name)

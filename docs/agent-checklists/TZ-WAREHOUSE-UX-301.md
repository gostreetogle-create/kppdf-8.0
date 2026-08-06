# TZ-WAREHOUSE-UX-301 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-WAREHOUSE-UX-301.md`
> Commit/push: scoped commit + push (PO instructed) — allowlist only, never `git add .`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: Buffy (deepseek-v4-flash, Freebuff executor worktree)
- claimed_at: 2026-08-06T22:05:00Z
- workspace: D:\kppdf-8.0\.freebuff\worktrees\aaee4fca-25ad-4284-9116-fc85e85d2ed1 (branch freebuff/executor-d-...; canonical repo D:\kppdf-8.0)
- team_room_claim: unavailable (Freebuff worktree; no team-room claim needed for this TZ)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → worktree root verified
- [x] Прочитал `_active-map.md` + `tasks/_active/` — нет чужого CLAIM на те же keys (каталог 320/311, admin 306, desktop TZD-14 — другие зоны)
- [x] TZ / канон / deps прочитаны (спека, GEMINI.md, executor skill, page docs, backend controller)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-WAREHOUSE-UX-301.md` на месте

## Baseline (до кода)

- FE tsc: red. Причины (обе НЕ от этой TZ-правки, зафиксированы до изменений):
  1. `warehouse-group-chips.ts` — `queryParams` не объявлен в `GroupChip` (DICT-312 chrome refactor убрал поле; ошибки TS2353 на строках 18–54). **Этот файл — конфликт-ключ данной TZ → исправляется здесь.**
  2. `materials.page.ts` — импортирует `CATALOG_ENTITY_SECTION_CHIPS`/`CATALOG_TOC_CHIPS`, которых нет в `catalog-group-chips.ts` (TS2724). **Catalog-зона, параллельный поток 320/311 → НЕ трогаю, disclosing в отчёте.**
- git status: clean на старте (HEAD 88df9f7; origin/main на 2 коммита впереди — admin 306, зоны не пересекаются).

## Acceptance

- [ ] На `/inventory` нет кнопок-дублей TOC в tools
- [ ] На `/stock-movements` можно отфильтровать по складу (Все / конкретный); API получает warehouseId (+ type сохраняется)
- [ ] Create warehouse default type=main; под полем type есть понятная RU-подсказка
- [ ] Остатки filter не сломан
- [ ] FE tsc (без catalog-зоны) + focused tests PASS; scoped commit

## Gates (факт)

| Gate | Результат |
|------|-----------|
| `frontend tsc -p tsconfig.app.json --noEmit` | PASS по зоне TZ (остаются только pre-existing catalog-дрейф `materials.page.ts` ← `catalog-group-chips.ts`, зона параллельного потока 320/311 — не трогаю) |
| `jest --testPathPattern="inventory|storage-items|stock-movement|warehouse"` | 5 suites / 25 tests PASS (включая новый `warehouse-group-chips.spec.ts`) |
| `inventory-dashboard.page.spec` (после удаления кнопок) | 1/1 PASS |
| `git diff --check` | pending |

## Executor report

- status: DONE
- commit: 65a936f (feat) + 6d085cb (merge origin/main)
- files: 11 (code+docs commit 1) + 5 closeout (archive/lock/progress/map/checklist)
- gates: FE tsc=PASS по зоне TZ; jest=25/25 PASS (5 suites); diff-check=clean
- known_issues:
  - pre-existing catalog tsc-дрейф `materials.page.ts` ← `catalog-group-chips.ts` на origin/main — зона параллельного потока CATALOG-320/311, НЕ тронут (disclose)
  - storage-items chips (≤8) не передают queryParams при клике (shared workspace рендерит только route) — pre-existing, вне scope; на Движениях type chips подключены через chipClick
- ask_architect: 320/311 — починить materials.page.ts импорт (CATALOG_SECTION_CHIPS) или явно верифицировать tsc-waive

## Review handoff

- [x] READY FOR REVIEW в checkpoint (`_active-map.md`) — выполнено
- [x] Архивация по прямой инструкции PO (archive + scoped commit/push)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-06T23:10:00Z

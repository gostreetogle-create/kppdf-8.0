# TZ-NX-REGISTRY-FORMS-TO-FEATURES checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-REGISTRY-FORMS-TO-FEATURES.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T06:07:23Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто до claim (F1 archived `20ae8800`/`c8fb840a`)
- [x] TZ / канон / deps прочитаны (`TZ-NX-REGISTRY-FORMS-TO-FEATURES.md`, `WAVE-MAP.md`, depends on F1 archived)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-REGISTRY-FORMS-TO-FEATURES.md` на месте

## Investigation — no move; both layers independently hard-blocked

Checked every relative import of all three facades + all three dialogs
before moving anything (same discipline as every prior features-move TZ
this program).

**Dialogs (`material/module/product-form-dialog.component.ts`)** all
import `CompositionPanelComponent` (`../../composition/composition-panel.component`,
416 LOC) into their templates. That component itself imports
`CompositionTreeComponent` — the exact same real, actively-shared,
non-duplicable Angular component that already blocked
`TZ-NX-ORDER-HUB-UI-FEATURES` (B1) and the supply/warehouse features-move
TZs (B2) from moving their own dialog UIs. The TZ text anticipated exactly
this ("if CompositionPanel blocks full move — same deviation class as
B1/B2").

**Facades (`material/module/product-form.facade.ts`)** all call
`this.dialog.open(CategoryFormDialogComponent, …)` inside
`openCreateCategory()` — a **value** import of
`./category-form-dialog.component` (233 LOC, a real `@Component` with its
own reactive form/template, not pure data). That file is also used by
`doc-studio/dialogs/text-block-form-dialog.component.ts` and three
registries-data files (`categories.registry.ts`,
`category-registry-dialog-host.ts`, `doc-studio-registry-actions.ts`) —
genuinely shared across domains, and deliberately **not** in this TZ's
conflict keys (the TZ author already scoped it to stay in `apps/`).
Same non-duplicable-real-component class as `CompositionPanelComponent`
above (real Angular Components with templates/DI are never duplicated in
this program — only small pure data/utility files are, e.g.
`on-dialog-close-once.ts`, `permission-labels.ru.ts`).

This is a **stronger** block than every prior scoped-down features-move
TZs (order-hub/supply/warehouse) hit: in those, the *dialog UI* was
blocked while the *facade* was clean and moved alone. Here **both**
layers are independently blocked by different real components, so there
is no self-contained subset left to relocate — moving only the parts that
*are* clean (e.g. duplicating `on-dialog-close-once.ts` and
`dirty-dialog.guard.ts`, both small non-Component helpers, or the pure
`material-formatters.ts`) would produce an empty/near-empty
`registry-forms` lib holding no actual form logic, which is not a
meaningful decomposition and would just add an import indirection with
no benefit — rejected as churn, consistent with this program's "no
premature abstraction" rule.

**Decision: no relocation.** All three facades + dialogs stay in
`apps/kppdf-web/src/app/pages/registries/dialogs/` exactly as F1 left
them. No `libs/features/src/lib/registry-forms/` directory or
`@kppdf/features/registry-forms` tsconfig path was created — an empty lib
with nothing to export would be worse than no lib. This matches the TZ's
own escape hatch ("facade in features or dialogs stay in app with
documented note") taken to its full extent (both stay, documented here).

## Acceptance

- [x] Specs green — no files touched, so this is a no-op verification: material/module/product dialog specs (3/3 suites, 41/41), registries pattern (36/36 suites, 236/243, 7 skipped)
- [x] nx build last 0 (bundle unchanged, 503.38 kB — no code moved, nothing to regress)
- [x] B4 DONE — chain complete (R1→R2→F1→F2), STOP as instructed

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (investigation-only, no code change)
- [x] FIC §A–E — N/A (no code/behavior/route change at all)
- [x] page.md / PAGE-TZ-INDEX — N/A
- [x] DOMAIN-MAP — N/A (no module boundary moved — investigated and rejected)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (no product files touched; only this checklist/tracker/task marker)
- [x] Coupling map — N/A
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: build green from F1 closure (`20ae8800`)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0, bundle unchanged (503.38 kB) — no-op, no files touched

## Gates (факт)

- No product/lib files changed — gates re-verified as a closing sanity check, not because anything could have regressed:
- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; bundle 503.38 kB, unchanged)

## Executor report

Что сделано: расследование без переноса кода. Обе стороны декомпозиции
независимо заблокированы реальными интерактивными Angular-компонентами:
диалоги — `CompositionPanelComponent` (та же связка с
`CompositionTreeComponent`, что уже блокировала order-hub/supply/
warehouse в B1/B2), facade — `CategoryFormDialogComponent` (233 строки,
свой reactive-form/template, общий с doc-studio и registries-data,
намеренно вне conflict keys этого TZ). Ни то ни другое не подлежит
дублированию (правило программы: дублируются только чистые
data/utility-файлы, не реальные компоненты с шаблоном). Перенос только
чистых кусочков (`on-dialog-close-once.ts`, `dirty-dialog.guard.ts`,
`material-formatters.ts`) создал бы пустую по сути `registry-forms`
lib без единой формы внутри — отклонено как бесполезная индирекция.
Решение: ничего не переносить, задокументировать здесь. B4 закрыта
полностью (R1→R2→F1→F2).

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
(studio/docs/audits/data) не трогал. Продуктовый код не менял.

Known limits: если в будущем `CategoryFormDialogComponent` или
`CompositionPanelComponent`/`CompositionTreeComponent` сами получат
domain-lib дом (не в рамках этой волны), этот вывод стоит пересмотреть —
он специфичен для текущего расположения обоих файлов в `apps/`.

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15

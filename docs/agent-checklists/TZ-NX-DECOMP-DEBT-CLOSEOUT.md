# TZ-NX-DECOMP-DEBT-CLOSEOUT checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DECOMP-DEBT-CLOSEOUT.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T06:23:52Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто до claim (C1 archived `daa66698`)
- [x] TZ / канон / deps прочитаны (`TZ-NX-DECOMP-DEBT-CLOSEOUT.md`, `WAVE-MAP.md`, depends on C1 archived)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DECOMP-DEBT-CLOSEOUT.md` на месте

## Part 1 — registry form dialogs → `@kppdf/features/registry-forms`

**Correction to the B4 F2 investigation:** re-grepped from scratch before
moving anything. My own F2 checklist (archived) claimed
`CategoryFormDialogComponent` was "also used by
`doc-studio/dialogs/text-block-form-dialog.component.ts`" — that was a
**substring false-positive**: the grep pattern
`"category-form-dialog.component"` also matches the unrelated
`text-block-category-form-dialog.component.ts` (a completely different
dialog, for doc-studio's text-block categories). `registries/dialogs/category-form-dialog.component.ts`
has **zero** real doc-studio consumers — only `registries/data/categories.registry.ts`,
`registries/data/category-registry-dialog-host.ts` (+spec), and the 3
registry-form facades. Documenting this correction here since it changes
the picture from F2's "hard blocker, nothing moves" conclusion.

With `CompositionPanelComponent` now a lib import (C1) and
`CategoryFormDialogComponent` having no real external blocker, moved the
entire complex: `material/module/product-form.facade.ts` (lib root),
`material/module/product-form-dialog.component.ts` + `category-form-dialog.component.ts`
(`ui/`) — all with their specs. Duplicated 3 small support files into
`ui/`: `on-dialog-close-once.ts` (established pattern), `material-formatters.ts`
(29 LOC pure), and — **new judgment call** — `registry-create-button.component.ts`
(45 LOC): technically a real `@Component`, but a stateless, zero-service,
zero-business-logic icon-button atom (`input`/`output` + template only).
Duplicating it carries the same near-zero drift risk as duplicating pure
data, unlike every real blocker this program has hit
(`MaterialFormDialogComponent`, `CompositionPanelComponent`,
`CategoryFormDialogComponent` itself) which all had service injections
and real business logic. Flagging this as a deliberate, narrow exception
to "never duplicate real components" rather than applying it silently.

Fixed 6 external consumers + 3 specs: `material-registry-dialog-host.ts`,
`catalog-registry-dialog-host.ts`, `categories.registry.ts`,
`category-registry-dialog-host.ts` (+spec), `supply-request-form-dialog.component.ts`
(+spec), `storage-put-on-stock-dialog.component.ts` (+spec) — all now
import from `@kppdf/features/registry-forms` instead of relative
`registries/dialogs/*` paths.

## Part 2 — order-hub-tray + `OrderHubFacade` → `@kppdf/features/order-hub`

B1's `TZ-NX-ORDER-HUB-UI-FEATURES` moved only `kit-reserve-confirm-dialog`/
`ship-confirm-dialog` (already lib-hosted) and kept
`order-hub-tray.component.ts`/`order-hub.facade.ts` in the app because both
needed the real `CompositionTreeComponent`. With that resolved by C1, the
only remaining relative imports were `./order-status` (15 LOC pure RU
labels, also used by 3 unrelated order-domain files that stay in the app)
and `../on-dialog-close-once` — both duplicated into `ui/` per
established pattern. Moved `order-hub.facade.ts` (lib root) +
`order-hub-tray.component.ts` (`ui/`, into the *existing*
`@kppdf/features/order-hub` lib alongside the two dialogs) in full.
Fixed the one external consumer: `orders-list.page.ts`.

## Part 3 — supply-requests / storage-items leftovers from B2

Same shape as parts 1–2: both were blocked transitively by
`MaterialFormDialogComponent`, now resolved by part 1.

- **warehouse:** `storage-items.facade.ts` (lib root) +
  `storage-adjust-dialog.component.ts` + `storage-put-on-stock-dialog.component.ts`
  (`ui/`, into the *existing* `@kppdf/features/warehouse` lib) moved in
  full, including their shared `storage-dialogs.spec.ts`. Reused the
  lib's existing `on-dialog-close-once.ts`; duplicated a second
  `registry-create-button.component.ts` copy (same judgment call as part
  1 — this dialog uses the same tiny button). `storage-items.page.ts`
  stays in the app as the lazy route host (same pattern as
  `stock-movements.page.ts`/`warehouses.page.ts`, already-established
  precedent in this same lib).
- **supply:** `supply-requests.facade.ts` (lib root) +
  `supply-request-form-dialog.component.ts` (`ui/`, into the *existing*
  `@kppdf/features/supply` lib) moved in full. Duplicated
  `supply-request-formatters.ts` (29 LOC pure, also used by
  `product-passports.registry.ts` and `supply-requests.page.ts`, both
  staying in the app) into `ui/`. Also fixed a redundant self-import
  found while moving: `supply-requests.facade.ts` was importing its
  sibling `SupplyRequestReceiveDialogComponent` via the `@kppdf/features/supply`
  barrel instead of a relative path — harmless before the move (cross-lib),
  but circular/self-referential once `supply-requests.facade.ts` joined
  the same lib, so switched it to `./ui/supply-request-receive-dialog.component`.
  `supply-requests.page.ts` stays in the app as the lazy route host.

## What changed (file summary)

- New: `libs/features/src/lib/registry-forms/**` (facades + ui/, 8 files + support dupes)
- `libs/features/src/lib/order-hub/`: + `order-hub.facade.ts`, `ui/order-hub-tray.component.ts` (+spec), `ui/order-status.ts`, `ui/on-dialog-close-once.ts`
- `libs/features/src/lib/warehouse/`: + `storage-items.facade.ts`, `ui/storage-adjust-dialog.component.ts`, `ui/storage-put-on-stock-dialog.component.ts`, `ui/storage-dialogs.spec.ts`, `ui/registry-create-button.component.ts`
- `libs/features/src/lib/supply/`: + `supply-requests.facade.ts`, `ui/supply-request-form-dialog.component.ts` (+spec), `ui/supply-request-formatters.ts`
- `tsconfig.base.json`: new `@kppdf/features/registry-forms` path
- ~14 app-level consumer files (import paths only)
- All 4 touched libs' `index.ts`/`ui/index.ts` barrels updated

## Acceptance

- [x] Affected specs green (all 3 parts, see Gates)
- [x] nx build last 0

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (internal relocation, no behavior change)
- [x] FIC §A–E — N/A (no new page/permission/module/MCP surface, no route change)
- [x] page.md / PAGE-TZ-INDEX — N/A
- [x] DOMAIN-MAP — N/A (module boundaries moved only)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged only: the moves + consumer import fixes + tsconfig.base.json + this checklist/tracker/task marker; unrelated studio/docs/audits/data WIP left untouched)
- [x] Coupling map — N/A
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: build green from C1 closure (`daa66698`)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0, bundle unchanged (503.38 kB)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors, clean after each of the 3 parts)
- `cd frontend-nx && pnpm exec tsc -p libs/features/tsconfig.lib.json --noEmit` → PASS (0 errors, clean after each part)
- `cd frontend-nx && pnpm exec nx test features` → PASS (39/39 suites, 369/369 tests, final run)
- `cd frontend-nx && pnpm exec nx test kppdf-web` (full suite) → PASS (92/92 suites, 623/630 passed, 7 skipped, 0 failed, final run)
- `pnpm architecture:check` → PASS (1536 files; baseline 17; 2 resolved since baseline)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; bundle 503.38 kB, unchanged; confirmed no eager route provider)

## Executor report

Что сделано: закрыл весь декомп-долг, разблокированный C1. Часть 1 —
material/module/product form dialogs + facades + `CategoryFormDialogComponent`
в `@kppdf/features/registry-forms` (с попутной коррекцией моей же ошибки
в архиве F2 — false-positive grep про doc-studio). Часть 2 —
`order-hub-tray`/`OrderHubFacade` в существующий `@kppdf/features/order-hub`.
Часть 3 — `storage-items`/`supply-requests` остатки B2 в существующие
`@kppdf/features/warehouse`/`supply`. Везде: страница-хост (route entry)
остаётся в app, facade+диалоги уезжают в lib — паттерн уже установлен
предыдущими TZ этой программы. Один новый осознанный прецедент:
дублировал крошечный `RegistryCreateButtonComponent` (реальный
`@Component`, но без сервисов и бизнес-логики) дважды — решение
зафиксировано явно, не молча.

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
(studio/docs/audits/data) не трогал. Также заметил и восстановил
`docs/agent-checklists/_NOW.md` и `WAVE-DECOMP-B5.md`, которые на диске
откатились к устаревшему содержимому (до B4/B5) при возобновлении сессии
после лимита — git-история моих коммитов через это не пострадала,
восстановил трекеры до актуального состояния.

Known limits: нет.

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15

# TZ-NX-DESKTOP-PAIRING-FACADE checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DESKTOP-PAIRING-FACADE.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T11:29:07Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто до claim (TZ2 archived `d69543bc`)
- [x] TZ / канон / deps прочитаны (`TZ-NX-DESKTOP-PAIRING-FACADE.md`, `WAVE-MAP.md`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DESKTOP-PAIRING-FACADE.md` на месте

## What changed

Created `pairing-dialog.facade.ts` (`@Injectable()`, component-scoped via
`providers: [PairingDialogFacade]`). Unlike `RegistryDetailPanelFacade`
(TZ1), `PairingDialogComponent` has no `input.required<T>()` — `PI_DIALOG_DATA`/
`PI_DIALOG_REF` are real DI tokens, injectable directly in the facade's own
constructor — so no `bind(host)` indirection was needed, same shape as
`ShippingFacade`.

Moved as-is: every signal (`pairingJson`, `copied`, `copyError`, `issuing`,
`keys`, `compat`, `compatStatus`), plain `ttl`/`label` fields (kept as plain
mutable properties, not signals — bound via `[(ngModel)]`, same as the
original), the module-level pure helpers (`normalizeDownloadUrl`,
`parseSemverFromDownloadUrl`, `formatVersionLabel`, `looksLikeBuildDate`,
`openDownload`), and every method (`init` — was `ngOnInit`'s body, `onIssue`,
`onRevoke`, `formatDate`, `onCopy`, `effectiveDownloadUrl`,
`desktopVersionLabel`, `downloadButtonLabel`, `versionSubtitle`, `onDownload`,
`onClose`, `reloadKeys`, `reloadCompat`). No pairing/API rule change.

The `PairingDialogData` interface moved to the facade file and is
re-exported (`export type { PairingDialogData } from './pairing-dialog.facade'`)
from the component file, so `app-shell.component.ts`'s existing
`import { PairingDialogComponent, type PairingDialogData } from '../pages/desktop/pairing-dialog.component'`
needed no change.

Checked `pairing-dialog.component.spec.ts` (315 LOC) before touching
anything: zero `fixture.componentInstance['xxx']` access — purely DOM-based.
`ttl`/`label` are exposed on the thin component via a getter/setter pair
delegating to the facade's plain properties (ngModel needs a settable
property; can't alias a plain field the way signals alias by reference).
Every other member aliased/delegated under its original name, consistent
with every prior facade TZ this program.

Dialog: 421 → 260 LOC. New facade: 221 LOC.

## Acceptance

- [x] desktop/pairing specs green (pairing-dialog.component.spec.ts confirmed PASS explicitly)
- [x] nx build last 0

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (internal refactor, no pairing/API rule change)
- [x] FIC §A–E — N/A (no new page/permission/module/MCP surface, template unchanged)
- [x] page.md / PAGE-TZ-INDEX — N/A (no route/UI change)
- [x] DOMAIN-MAP — N/A (no module/route/page contour change)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged only: pairing-dialog.component.ts, pairing-dialog.facade.ts (new) + this checklist/tracker/task marker)
- [x] Coupling map — N/A (issue/revoke/compat semantics unchanged)
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: build green from TZ2 closure (`d69543bc`, no-op)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0, bundle unchanged (503.38 kB)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors, clean on first run)
- `cd frontend-nx && pnpm exec nx test kppdf-web` (full suite) → PASS (84/84 suites, 573/580 passed, 7 skipped, 0 failed) — `pairing-dialog.component.spec.ts` explicitly confirmed PASS
- `pnpm architecture:check` → PASS (1548 files; baseline 17; 2 resolved since baseline)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; bundle 503.38 kB, unchanged)

## Executor report

Что сделано: механически вынес весь domain-state (Signals + `ttl`/`label`)
и все issue/revoke/compat/copy/download методы `PairingDialogComponent` в
новый `PairingDialogFacade` — без изменения бизнес-правил паринга. `data`/
`ref` — реальные DI-токены, поэтому `bind(host)` паттерн не понадобился
(в отличие от TZ1). `PairingDialogData` интерфейс переехал в facade-файл с
ре-экспортом из компонента для обратной совместимости с `app-shell.component.ts`.
Спека чисто DOM-based, поэтому все члены алиасированы/делегированы под
оригинальными именами на тонком хосте.

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
(studio/docs/audits/data) не трогал.

Known limits: нет.

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15

# TZ-NX-REGISTRIES-FULL-CLOSEOUT — DONE

ARCHIVE_MARKER
outcome: PASS
closed_at: 2026-08-29T20:12:12Z
closed_by: claude
mode: implementation review + gap closure (G3 browser smoke) — resumed from PARTIAL

## Resumption context

Prior attempt: `tasks/_archive/2026-08/TZ-NX-REGISTRIES-FULL-CLOSEOUT.partial.md` (cursor,
2026-08-29T20:02:00Z) closed G1 (icon-only Lucide actions) and G2 (real click-effect tests) as
DONE, but G3 (browser smoke) was BLOCKED — `:4201` unreachable at that time — and G4 (Units
DELETE) correctly deferred pending a backend fix. This session verified G1/G2 are still intact,
re-attempted G3 for real, and confirms G4 stays deferred. No regression to the prior PARTIAL work.

## Closed

| Gap | Status |
|-----|--------|
| G1 icon-only Lucide row actions + create | **DONE** (verified intact, unchanged from PARTIAL) |
| G2 click-effect tests (not DOM-only) | **DONE** (verified intact, 253 kppdf-web tests green) |
| G3 browser smoke + screenshots | **DONE** — real headless-Chrome run, see Evidence below |
| G4 Units delete FE | **DEFERRED (unchanged)** — backend fix not confirmed; remediation stays `tasks/_backlog/TZ-NX-REGISTRY-UNITS-DELETE-FE.md` |

## How G3 was unblocked

Root cause of the prior BLOCKED state was environmental, not a code defect: `node start.mjs --nx
--no-browser`'s own readiness orchestrator reported both backend and frontend "exited before
ready" (exit code 1), but the underlying `nest start --watch` and `nx serve kppdf-web --port=4201`
processes had in fact bound their ports successfully and kept serving — confirmed by `curl` 200s on
both `:3000/api/health` and `:4201/` immediately after the orchestrator's own failure message, and
by their real logs (`.logs/launcher-frontend.log`) showing a clean Vite build and `Local:
http://localhost:4201/`. This matches the Windows-specific detachment gotcha already documented in
`start.mjs` (parent wrapper process exits while the actual spawned dev-server survives as an
orphan) — a launcher/process-tracking quirk, not a `frontend-nx` app defect. Once confirmed
reachable, browser smoke was performed directly against the live ports with `puppeteer-core`
(already a transitive dependency under `backend/node_modules`) driving the system-installed Chrome,
since `chromium-cli` is not available in this Windows environment. Both dev-server processes were
stopped afterward (`taskkill` by PID, since `start.mjs --stop`/`--nx --stop` could not find a
matching PID file for the same reason) — ports `:3000`/`:4201` confirmed free again.

## Browser smoke — evidence

Evidence dir: `docs/agent-checklists/evidence/TZ-NX-REGISTRIES-FULL-CLOSEOUT/` (14 screenshots +
2 JSON reports, `smoke-report.json` + `smoke-dialog-report.json`).

Flow: `/login` → clicked the dev-only "Заполнить демо-данные" helper → submitted → landed on
`/admin/devices` (authenticated) → then drove every registry route directly.

| Route / check | Observed | Screenshot |
|---|---|---|
| `/login` | Editorial Paper&Ink card, demo-fill helper works | `00-login.png` |
| post-login | authenticated, redirected | `01-post-login.png` |
| `/registries` (master table) | all 6 rows render, API/ДЕМО source badges correct | `02-registries-master.png` |
| `/registries/units` | icon-only copy-key/activate/deactivate, **no delete action present** (confirms G4) | `03-registry-units.png` |
| `/registries/materials` | icon-only edit/copy/archive/constructor + gold "+" create | `03-registry-materials.png` |
| `/registries/details` | same icon set as materials, filtered view | `03-registry-details.png` |
| `/registries/modules` | icon-only edit/composition/archive | `03-registry-modules.png` |
| `/registries/products` | icon-only edit/composition/copy/archive/constructor | `03-registry-products.png` |
| `/registries/departments` | fixture registry, expand-only (no create/row actions, as documented) | `03-registry-departments.png` |
| Materials "Создать материал" dialog | opens correctly, Editorial form, sections rendered | `04-materials-create-dialog.png` |
| Materials edit dialog (row action) | opens with row data | `05-materials-edit-dialog.png` |
| Materials archive (destructive) | **confirm dialog required** ("Архивировать запись?" / Отмена / Архивировать) — not silent | `06-materials-archive-confirm.png` |
| Modules row-action keyboard `.focus()` | screenshot taken; note below on limits | `07-modules-focus-ring.png` |

**DOM-level accessibility check** (`smoke-report.json`, all 6 registries): every row action and
toolbar create button was enumerated live from the rendered DOM — 100% have non-empty `data-test`,
a Russian `aria-label`, and a matching `title`; **`text` is empty string on every single row action
and create button** (icon-only, no leaked text labels) — this is the concrete evidence for G1
beyond static code reading.

**Console errors:** zero, across all 6 registry routes and all dialog interactions
(`page.on('console'/'pageerror')` captured nothing in either smoke run).

## Known limitation (honest, not swept under PASS)

- The `.focus()`-triggered screenshot (`07-modules-focus-ring.png`) programmatically focuses the
  element via Puppeteer's `elementHandle.focus()`, which does not reliably trigger the same
  `:focus-visible` heuristic a real Tab-key press does in Chromium headless — so this screenshot is
  **not** conclusive visual proof of the `.pi-focus-ring` style rendering. The `.pi-focus-ring`
  class itself is present in the component source (`registry-action-icons.ts`) and was not touched
  this session; a real Tab-key-driven check is recorded here as still open if a future session
  wants stronger evidence, but it does not block this PASS — keyboard operability (the button is a
  real focusable `<button>`, not a div) is confirmed, only the visual ring's exact rendering under
  a synthetic focus is the unverified part.
- `node start.mjs --nx`'s own readiness/PID-tracking is unreliable on this Windows environment
  (see "How G3 was unblocked" above) — this is a pre-existing launcher issue, out of scope for this
  UI-only TZ (constraint: do not touch `backend/**`/root scripts), but worth flagging for whoever
  next needs local browser smoke: don't trust the launcher's own "exited before ready" message
  without first checking `curl`/`netstat` — the servers may already be up.

## Changed files (this session)

```
docs/pages/PAGE-TZ-INDEX.md          (status line: PARTIAL → DONE, evidence path)
docs/agent-checklists/TZ-NX-REGISTRIES-FULL-CLOSEOUT.md   (Integrity slot + Executor report)
docs/agent-checklists/evidence/TZ-NX-REGISTRIES-FULL-CLOSEOUT/   (14 screenshots + 2 JSON, NEW)
```

No `frontend-nx/**` source, `backend/**`, `frontend/**`, `libs/ui/**`, shell/rails, or API/DTO
files were changed this session — G1/G2 code from the PARTIAL attempt was verified, not modified.
No new entities, permissions, or endpoints added.

## Gates (факт) — re-run this session

| Gate | Result |
|------|--------|
| `nx build kppdf-web --skip-nx-cache` | PASS |
| `nx test kppdf-web --skip-nx-cache` | PASS (253 tests) |
| `nx test data-access --skip-nx-cache` | PASS (30 tests) |
| `nx run-many -t lint --all --skip-nx-cache` | PASS (0 errors, 48 pre-existing style warnings) |
| `architecture:check:nx` | PASS (252 files, 0 violations) |
| `ui:tokens:nx` | PASS (53 baseline occurrences) |
| Browser smoke (this session, new) | PASS — see Evidence above |

Backend gates omitted (no backend changes per TZ).

## Executor report

- G1/G2: re-verified against live `frontend-nx/apps/kppdf-web/src/app/pages/registries/**` source
  (`registry-action-icons.ts`, `registry-row-action-button.component.ts`,
  `data/registry-action-matrix.spec.ts`) — unchanged from the PARTIAL attempt, still correct.
- G3: performed for real this session — headless Chrome via `puppeteer-core` (system Chrome
  executable), all 6 registries + 3 dialog interactions, zero console errors, evidence saved.
- G4: confirmed absent from the live UI (`units` registry has no delete/destructive row action) —
  stays deferred per instruction; not added.
- Constraints honored: no edits to `backend/**`, `frontend/**`, `libs/ui/**` source, shell/rails,
  API/DTO; no new entities/permissions/endpoints; dev servers started for smoke were stopped after
  evidence collection, ports confirmed free.
- Outcome: **PASS** — all four gaps from the Cursor Architect audit (G1–G4) are now in their
  correct terminal state (G1/G2/G3 done, G4 deliberately deferred with a filed remediation task).

## Closeout

- [x] Archive DONE (this file); prior `.partial.md` kept as historical record of the resumption
      point, not deleted.
- [x] `docs/pages/PAGE-TZ-INDEX.md` updated to DONE with evidence path.
- [x] Remove `_active` marker.
- closed_at: 2026-08-29T20:12:12Z

# NX UX smell audit — `/admin/roles`

**TZ:** `TZ-NX-UX-17-admin-roles-AUDIT` · **Wave:** `WAVE-NX-UX-PAGE-SWEEP` row 17 (**final stage**)
**Canon:** `docs/audits/2026-09-09-nx-ux-page-sweep-canon.md`
**Gold reference:** `/registries` (expand + `pi-button`); already-fixed sibling pages this wave
**Page source (single-file conflict key):** `admin-roles.page.ts` (now ~305 lines after fix).
**Route:** `/admin/roles` — **owner-only** (`ownerOnlyRouteGuard`, `app.routes.ts:9-13`; non-owner
users are redirected to `/forbidden` before the component even loads, per `admin-roles.page.md:18,24-28`).

## Что это за страница

`RolesAdminPage` — the role/permission CRUD console, already the cleanest page audited this wave:
built on `TableComponent` + `PiRowActionsComponent` (a real gold component using genuine
`.pi-icon-btn-*` classes, not a hand-rolled underline pattern — confirmed by reading
`pi-row-actions.component.ts` in full), server-side search + pagination, destructive-confirm on
delete, and a documented system-role policy (`admin-roles.page.md` §"Политика системных ролей").

## Чеклист T1–C1

| # | Зона | Вердикт | Факт · path:line |
|---|------|---------|-------------------|
| **T1** | **Действия: dead-end for one permission combination** | **FAIL — P2** (downgraded from an initial P1 read — see note below) | For a **custom** (non-system) role, `[showEdit]="caps.hasAny(['role:write'])"` and `[showDelete]="caps.hasAny(['role:admin'])"` (`:106-107` pre-fix) — if a viewer has *neither* key, `PiRowActionsComponent` renders an empty cluster: no edit, no delete, no way to even *see* the role's description/pages. The parallel system-role branch (`:117-146`) already has a read-only «Смотреть» fallback for exactly this case; the custom-role branch didn't. **Reachability note:** this route is owner-only, and the owner's `user.role` is virtually always `'admin'` (§capabilities.service.ts admin-shortcut, confirmed by reading `capabilities.service.ts` in full) — in practice this makes the gap very unlikely to actually occur today. Fixed anyway as cheap, safe, zero-risk defensive-UX parity with the sibling system-role branch, not because it's a live production complaint |
| T2 | Таблица: пустые/сдвинутые колонки; нет loading/empty/error | **OK** | `TableComponent`'s own loading skeleton, two-variant honest empty (search-aware: «Ничего не найдено.» vs «Роли не найдены.»), inline `role="alert"` error banner |
| A1 | Действия: `<a class="underline">` / мёртвый `pi-button-*` вместо `app-pi-button` | **OK** | All actions already `<app-pi-button>` or `<app-pi-row-actions>` (a real gold component, verified by reading its source — genuine `.pi-icon-btn-*` classes, SVG icons, not underline text) |
| A2 | Destructive без confirm | **OK** | «Удалить» opens `AlertDialogComponent` (`variant: 'destructive'`) with a clear description before the remove call |
| F1 | Фильтры: поле без `label` / голый native select | **OK** | Search input carries `aria-label="Поиск ролей"` — same valid pattern as `/studio` and `/admin/devices` this wave |
| F2 | Фильтры: нет сброса чипа deep-link | **OK / N/A** | No deep-link query param |
| D1 | Dropdown: не Pi/канон; ObjectId руками | **OK** | No raw ObjectId anywhere; permissions rendered via `permissionsSummary()` |
| L1 | Layout: контент липнет к рамке | **OK** | `app-pi-group-workspace`'s own inset, `gap-form-field` toolbar |
| L2 | Layout: прыгающие ошибки валидации | **OK / N/A** | No inline forms in this file (create/edit live in `RoleFormDialogComponent`, out of this TZ's single-file conflict key) |
| **C1** | **Copy/infra: broken `data-test` convention** | **FAIL — P2 (no exact canon row, fixed as a found-while-auditing item)** | The error banner used `data-testid="roles-admin-error"` (`:72` pre-fix) — the **only** `data-testid` anywhere on this page or, as far as this audit checked, the wave — every other selector on this exact page uses `data-test` (`roles-admin-search`, `roles-admin-create`, `roles-admin-edit`, …). A future test targeting the established convention would silently fail to find this element |

## Что уже ок (не чинить)

- `PiRowActionsComponent` — genuinely gold, not a page-level anti-pattern to fix (read its full
  source: real `.pi-icon-btn-*` semantic-color classes, SVG icons, proper `aria-label`/`data-test`
  contract, `loading` state that swaps actions for a status span).
- Destructive-confirm and the documented system-role policy (site-admin *can* edit a system role's
  permissions/pages, just never delete it) both match their own docs exactly — no drift found here,
  unlike `/proposals`.
- Server-side search + pagination (`PAGE_SIZE=10`, `[total]`/`[page]`/`[pageSize]` wired to
  `TableComponent`'s own pager) is a clean, complete implementation — nothing to change.

## Verdict

**PASS-FIX** — found 2×P2 (T1: empty row-actions dead-end for one — likely unreachable in
practice given the owner-only route — permission combination on custom roles; a found-while-
auditing `data-testid`→`data-test` convention break). No P0/P1. FIX TZ
(`TZ-NX-UX-17-admin-roles-FIX`) — **claim**: add a read-only «Смотреть» fallback for custom roles
mirroring the existing system-role branch; fix the `data-testid` typo.

## Closeout (FIX applied)

- **P2 (T1) — fixed.** Custom-role row actions now branch on
  `caps.hasAny(['role:write']) || caps.hasAny(['role:admin'])`: when true, unchanged
  `<app-pi-row-actions>` behavior; when false, a `<app-pi-button variant="ghost">` «Смотреть»
  fallback reusing the exact same `onView()` method the system-role branch already calls
  (`data-test="roles-admin-view"`, same selector as the system-role fallback — the two branches
  are mutually exclusive on `r.isSystem`, so sharing the selector is correct, not a collision).
- **Found-while-fixing correctness bug, fixed:** `onView()` hardcoded `isSystem: true` regardless
  of the actual role — harmless *today* (the dialog component never reads `data.role.isSystem`,
  confirmed by reading `role-form-dialog.component.ts` in full), but calling `onView()` from the
  new custom-role branch would have passed a wrong value for a field that could matter later.
  Changed to `isSystem: r.isSystem` (the real value).
- **P2 (C1-adjacent) — fixed.** `data-testid="roles-admin-error"` → `data-test="roles-admin-error"`.
- **Test coverage added (new file, none existed before — same gap `/admin/devices` had):**
  `admin-roles.page.spec.ts` — 4 tests: columns render; edit/delete show when the viewer can
  manage; the new «Смотреть» fallback renders for both branches (system + custom) when the viewer
  can manage neither, and opens the view dialog with the correct `isSystem` value for a custom
  role; the fixed `data-test` selector resolves.
- Gates: `nx build kppdf-web` PASS; `nx test kppdf-web` PASS, 0 regressions (704/711, +4 new — 1 in
  an all-new suite).
- `docs/pages/admin-roles.page.md` — NX UX sweep note added.

## Wave closeout

This is **stage 17, the last stage of the continuous UX sweep queue** (08b, 09, 10, 12–17; 11
SKIP). See `docs/agent-checklists/UX-SWEEP-CONTINUOUS-CHECKLIST.md` for the full stage→SHA index.

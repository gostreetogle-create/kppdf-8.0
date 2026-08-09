# TZ-SALES-336 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-SALES-336.md` (removed at closeout)
> Source: `tasks/_backlog/kp-vitrine/TZ-SALES-336-kp-lock-paid-copy.md`
> Scope: accepted/«Оплачена» hard-lock, saved template snapshot lock/unlock, and copy-to-new-draft only.

## Claim slot

- agent_id: `buffy`
- claimed_at: `2026-08-09T19:40:00Z`
- workspace: `D:\kppdf-8.0`
- only active TZ: TZ-SALES-336
- team_room_claim: unavailable; local `_active` scan was authoritative

## Acceptance

- [x] Status `accepted` is shown as «Оплачена» and hard-locks products, quantity, template, parameters, and table edits.
- [x] «Снять «Оплачена»» returns the draft to editable state; backend rejects content PATCHes while accepted.
- [x] Saved `templateSnapshot.html` remains the A4 source while locked; reopening an accepted КП does not call live template build.
- [x] «Копировать» calls duplicate and opens the new draft in Create КП.

## Gates (fact)

- [x] Frontend TypeScript: `pnpm --dir frontend exec tsc -p tsconfig.app.json --noEmit` PASS.
- [x] Backend TypeScript: `pnpm --dir backend exec tsc -p tsconfig.build.json --noEmit` PASS.
- [x] Focused frontend Jest: proposal-create + proposals, **44/44 PASS**.
- [x] Focused backend Jest: quotation service, **27/27 PASS**.
- [x] Frontend ESLint PASS.
- [x] Prettier PASS for changed frontend/backend files.
- [x] `git diff --check` PASS.

## Browser self-verify

- [x] Login once, then `Сделки → Создать КП`: selected template and «Наша фирма (бланк)», autosave showed «Сохранено» and created one draft.
- [x] Clicked «Отметить как «Оплачена»»: UI showed «Оплачена · бланк заблокирован»; firm/client selectors and edit controls were disabled; backend PATCH returned 200.
- [x] Clicked «Снять «Оплачена»»: controls became editable again; backend PATCH returned 200.
- [x] `Сделки → КП → Копировать`: duplicate POST returned 201 and navigated to `/proposals/create?id=…` with Russian toast «Создана копия …».
- [x] No browser console/page errors or failed API responses observed in the scenario; Deploy was not run.

## Integrity and scope

- [x] `system-role.guard*`, `roles-admin*`, DOC-343/344 WIP and frozen 317/320 scope were excluded.
- [x] Only TZ-SALES-336 source, tests, docs, checklist/archive/lock/progress files are intended for closeout.

## Closeout

- [x] Archive: `tasks/_archive/2026-08/TZ-SALES-336.done.md`
- [x] Lock: `.mimocode/locks/TZ-SALES-336-kp-lock-paid-copy.lock`
- [x] `tasks/_active/TZ-SALES-336.md` removed.
- [x] Commit and push completed after gates and browser self-verify.
- closed_at: `2026-08-09T19:44:49Z`

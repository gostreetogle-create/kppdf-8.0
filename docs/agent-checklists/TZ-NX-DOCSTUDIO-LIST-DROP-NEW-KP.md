# TZ-NX-DOCSTUDIO-LIST-DROP-NEW-KP checklist

> Status: **DONE**
> Wave: `docs/agent-checklists/WAVE-NX-DOCSTUDIO-LIST-TEMPLATES-CLEAN.md` (#1/2)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-12T20:37:19Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Architect gate

`studio-list.page.ts` L37 button + L189-199 `createKp()` — only caller of
`findKpDocType` in this file. `/proposals`'s `createInStudio()` has its own
independent call to the same shared helper (`studio-kp-doc-type.ts`) — safe
to remove the list-page button/method without touching proposals or the
helper file itself.

## Acceptance (из TZ)

- [x] На `/studio` нет «Новое КП»
- [x] Create + Из шаблона + Шаблоны работают (unchanged code paths, specs pass)
- [x] `/proposals` CTA студии жив (не тронут, отдельная реализация `createInStudio()`)
- [x] Specs + nx build green

## Gates (факт)

- `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → exit 0
- `pnpm exec nx test kppdf-web` → 122 suites / 849 tests PASS
- `pnpm exec nx build kppdf-web` → exit 0, same pre-existing budget warnings as baseline

## Executor report

- `studio-list.page.ts`: removed «Новое КП» button, `createKp()` method, unused `findKpDocType` import.
- `studio-list.page.spec.ts`: replaced the two КП-button tests with one asserting the button is absent and the other 3 CTAs remain; renamed describe block (was S33-scoped, now generic).
- `docs/pages/document-studio.page.md`: one-liner under the routes table naming the 3 remaining CTAs + where КП now lives.
- `docs/agent-checklists/TZ-NX-DOCSTUDIO-S33-CREATE-KP-PATH.md`: supersede note (S33 added the button this TZ removes; `/proposals` path from S33 is untouched).
- Did not touch docType КП itself, quotation bridge, or the «Создать документ» dialog.

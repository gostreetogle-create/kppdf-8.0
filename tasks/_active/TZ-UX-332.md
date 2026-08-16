# TZ-UX-332 — CLAIMED / IN PROGRESS

> Status: **READY FOR REVIEW**
> Spec: `tasks/TZ-UX-332-product-edit-undefined-ru-errors.md`
> Checklist: `docs/agent-checklists/TZ-UX-332.md`

## Claim slot

- agent_id: cursor-grok-4.6 (TZ-UX-332 frontend/BE executor)
- claimed_at: 2026-08-16T12:05:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: no (join ok; claim «Unknown task: TZ-UX-332; sync tasks first» — слот в checklist = SoT)

## Conflict keys (проверено vs TZD-48)

TZD-48 занимает только `desktop/**` + `backend/src/modules/import-mapping-profile/**`.
Пересечения нет — продолжаем.

- `frontend/src/app/shared/services/dashboard-dialog.service.ts`
- `frontend/src/app/pages/products/product-form-dialog.component.ts`
- `frontend/src/app/core/silent-http.ts`
- `backend/src/common/filters/http-exception.filter.ts`
- `backend/src/modules/photos/image-upload.options.ts`
- `backend/src/modules/photos/photos.service.ts`
- specs рядом

## Note

Не трогать desktop / TZD-48 WIP. Deploy/wipe запрещены. Archive только после Cursor/PO PASS.

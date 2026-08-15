# NOW — единственная короткая карта текущей работы

> Читать при старте/resume. Не читать целиком `_active-map.md`, `progress.md`
> или root `STATUS.md`: это исторические журналы.
>
> Обновлять существующие секции in-place. Лимит файла: 120 строк.

updated_at: 2026-08-15T14:58:00Z
hygiene: `docs/audits/2026-08-15-tasks-queue-hygiene.md`

## ACTIVE

### TZ-UX-324 — CLAIMED / IN PROGRESS

- Marker: `tasks/_active/TZ-UX-324.md`
- Spec: `tasks/TZ-UX-324-chrome-history-page-tools-gap.md`
- Checklist: `docs/agent-checklists/TZ-UX-324.md`
- Goal: spacer ~1 btn между history ←→ и page-tools + muted page-tool visual
- NOT: production flyout registration / PiChromeToolsService API

### TZ-AUTH-308 — READY / live claim

- Marker: `tasks/_active/TZ-AUTH-308.md`
- Spec: `tasks/TZ-AUTH-308-device-only-admin-ux.md`
- Checklist: `docs/agent-checklists/TZ-AUTH-308.md`
- Goal: один UI-вход через Устройства; users redirect; register off; owner login KEEP
- NOT: full AUTH-307 Bearer/Basic wipe

## Queue hygiene (not live)

- **TZ-AUTH-307** → `tasks/_park/` (глубокий cleanup после 308)
- **TZ-FRONTEND-304** → backlog
- Backlog: SALES-377 — не брать без PO.
- **WAVE-UX-CHROME-PAGE-TOOLS-MIGRATE** → backlog (FE 326… после executable TZ)

## DONE / LANDED (recent)

### TZ-UX-325 — DONE 2026-08-15 (docs-only)

- Archive: `tasks/_archive/2026-08/TZ-UX-325.done.md`
- Audit: `docs/audits/2026-08-15-chrome-page-tools-migration-audit.md`

### TZ-AUTH-305 — DONE / CUTOVER 2026-08-15

- Archive: `tasks/_archive/2026-08/TZ-AUTH-305.done.md`

### WAVE-UX-CHROME-GANTT-TOOLS — DONE (100)

### TZ-UX-PHOTO-301 / UX-321-FIX / ORDERS-HUB / CATALOG / SALES — DONE

## NEXT

1. Finish TZ-UX-324 → AUTH-308
2. AUTH-307 park — только после 308 + PO
3. App warm deploy — только по «деплой»
4. Chrome migrate WAVE (326+) — только после executable TZ + PO

## HEAD / queue

- Active CLAIM: TZ-UX-324 (+ TZ-AUTH-308 parallel, other keys)
- Deploy app: НЕ
- `_active/`: `TZ-UX-324.md`, `TZ-AUTH-308.md`

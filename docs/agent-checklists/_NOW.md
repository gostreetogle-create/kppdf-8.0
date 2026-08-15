# NOW — единственная короткая карта текущей работы

> Читать при старте/resume. Не читать целиком `_active-map.md`, `progress.md`
> или root `STATUS.md`: это исторические журналы.
>
> Обновлять существующие секции in-place. Лимит файла: 120 строк.

updated_at: 2026-08-15T16:30:00Z
hygiene: `docs/audits/2026-08-15-tasks-queue-hygiene.md`

## ACTIVE

### TZ-UX-322 — IN WORK (WAVE-UX-CHROME-GANTT-TOOLS)

- Marker: `tasks/_active/TZ-UX-322.md`
- Spec: `tasks/TZ-UX-322-chrome-page-tools-api.md`
- Checklist: `docs/agent-checklists/TZ-UX-322.md`
- Master: `docs/agent-checklists/WAVE-UX-CHROME-GANTT-TOOLS.md`
- Owner: Buffy continuous executor
- State: PiChromeToolsService + app-layout render; production → 323.
- Conflict keys: app-layout + `shared/chrome/pi-chrome-tools.*` + page-chrome docs.

### TZ-AUTH-305 — PREP / PO deploy only

- Marker: `tasks/_active/TZ-AUTH-305.md`
- Spec: `tasks/TZ-AUTH-305-device-access-rollout.md` (root KEEP)
- Checklist: `docs/agent-checklists/TZ-AUTH-305.md`
- Owner: Buffy prep; rollout executor TBD
- State: nginx/runbook prep допустим; переключение запрещено.
- Blockers:
  - PO ещё не дал явную команду `деплой`;
  - нужен Cursor/PO browser PASS;
  - rollout требует SSH/VPS и evidence без secrets.
- Conflict keys: deploy/synology docs/preflight + `docs/ops/home-host-access.md`.

## Queue hygiene (not live)

- Root spent specs → archive (sibling / prior waves; не claim).
- **TZ-FRONTEND-304** → `tasks/_backlog/` (READY, not claimed).
- **TZ-AUTH-307** → `tasks/_park/` (PARKED; blocked on 305 cutover + PO).
- Backlog keep: SALES-377 — не брать без PO.
- **UX-323** next after 322 archive (same wave).

## DONE / LANDED (recent)

### TZ-UX-PHOTO-301 — DONE

- Archive: `tasks/_archive/2026-08/TZ-UX-PHOTO-301.done.md`
- State: visible upload progress bar + RU status; deploy НЕ.

### TZ-UX-321-FIX — DONE / LANDED

- Archive: `tasks/_archive/2026-08/TZ-UX-321-FIX.done.md`
- State: Cursor PASS **98/100**; frame-relative ←/→ rails; deploy НЕ.

### TZ-ORDERS-HUB-304 — DONE / LANDED

- Archive: `tasks/_archive/2026-08/TZ-ORDERS-HUB-304.done.md`
- State: готовность + склад + shipping stub; deploy НЕ.

### TZ-ORDERS-HUB-303 / 302 / 301 — DONE

- Wave 302–304 landed; 301 docs contract.

### TZ-CATALOG-372 / 373 — DONE / LANDED

- Modules/materials vitrine parity; deploy НЕ.

### TZ-SALES-378 / 376 — DONE / LANDED

- Successor **TZ-SALES-377** только backlog.

### TZ-UX-321 — DONE (geometry superseded by FIX)

## NEXT

1. Finish TZ-UX-322 → archive → CLAIM TZ-UX-323.
2. AUTH-305 — только после явного `деплой` + browser PASS.
3. FRONTEND-304 / AUTH-307 — park/backlog; не live.

## HEAD / queue

- Active product CLAIM: TZ-UX-322 (+ AUTH-305 prep).
- Deploy: НЕ.
- `_active/`: `TZ-UX-322.md`, `TZ-AUTH-305.md`.

# NOW — единственная короткая карта текущей работы

> Читать при старте/resume. Не читать целиком `_active-map.md`, `progress.md`
> или root `STATUS.md`: это исторические журналы.
>
> Обновлять существующие секции in-place. Лимит файла: 120 строк.

updated_at: 2026-08-15T14:55:00Z
main_head: `d27c928ff18d246e3c23d3fe131eee8af522610e`

## ACTIVE

### TZ-AUTH-305 — PREP ONLY

- Marker: `tasks/_active/TZ-AUTH-305.md`
- Checklist: `docs/agent-checklists/TZ-AUTH-305.md`
- Owner: Buffy prep; rollout executor TBD
- State: nginx policy/runbook prep допустим; переключение запрещено.
- Blockers:
  - PO ещё не дал явную команду `деплой`;
  - нужен Cursor/PO browser PASS;
  - rollout требует SSH/VPS и evidence без secrets.
- Conflict keys: deploy/synology docs/preflight + `docs/ops/home-host-access.md`.

## DONE / LANDED (recent)

### TZ-ORDERS-HUB-304 — DONE / LANDED

- Checklist: `docs/agent-checklists/TZ-ORDERS-HUB-304.md`
- Archive: `tasks/_archive/2026-08/TZ-ORDERS-HUB-304.done.md`
- Lock: `.mimocode/locks/TZ-ORDERS-HUB-304-readiness-warehouse-shipping.lock`
- Implementation: `cd0cd867554a4b7621dc6b0f5b56fdcb5124bab1`
- Closeout: `d08f61f4f2126228d8ae6384b48e052c78cfc200`
- State: Cursor PASS **98/100**; готовность + склад (`Order.number`) + shipping stub; deploy НЕ.

### TZ-ORDERS-HUB-303 — DONE / LANDED

- Checklist: `docs/agent-checklists/TZ-ORDERS-HUB-303.md`
- Archive: `tasks/_archive/2026-08/TZ-ORDERS-HUB-303.done.md`
- Lock: `.mimocode/locks/TZ-ORDERS-HUB-303-supply-production-docs.lock`
- Implementation: `9eed2860ddadbc4b1daf8d8176dd7345784f3faf`
- Closeout: `eaef43024978b0e1b9d27493e37e3d3977fa9ab5`
- State: Cursor PASS **98/100**; снабжение lazy + `/supply|production?orderId=` + docs link; deploy НЕ.

### TZ-ORDERS-HUB-302 — DONE / LANDED

- Checklist: `docs/agent-checklists/TZ-ORDERS-HUB-302.md`
- Archive: `tasks/_archive/2026-08/TZ-ORDERS-HUB-302.done.md`
- Lock: `.mimocode/locks/TZ-ORDERS-HUB-302-orders-expand-columns.lock`
- Implementation: `71446d6bfb37434913450449678ce4b78e26be37`
- Closeout: `f8b96d4e9b386802c42b002b60edfb619ce709d6`
- State: Cursor PASS **98/100**; колонки без Суммы + expand Сделка/Состав; deploy НЕ.

### TZ-ORDERS-HUB-301 — DONE (docs contract)

- Spec: `tasks/TZ-ORDERS-HUB-301-order-hub-contract.md`
- Audit: `docs/audits/2026-08-15-order-lifecycle-hub.md`
- Checklist: `docs/agent-checklists/TZ-ORDERS-HUB-301.md`
- State: контракт хаба зафиксирован; wave 302–304 выполнена.

### TZ-UX-321 — DONE / LANDED

- Checklist: `docs/agent-checklists/TZ-UX-321.md`
- Archive: `tasks/_archive/2026-08/TZ-UX-321.done.md`
- См. git log / archive для SHA.

### TZ-CATALOG-372 / 373 — DONE / LANDED

- Archives: `tasks/_archive/2026-08/TZ-CATALOG-372.done.md`, `…373.done.md`
- Modules/materials vitrine parity; deploy НЕ.

### TZ-SALES-378 / 376 — DONE / LANDED

- Successor park: **TZ-SALES-377** backlog only, не брать.

## NEXT

1. AUTH-305 — только после явного `деплой` + browser PASS.
2. Очередь ORDERS-HUB пуста (305 BE summary — optional, по evidence N+1).
3. Визуальный smoke `/orders` expand (PO/browser) — желателен, не блокер archive.

## HEAD / queue

- ORDERS-HUB wave **complete** (301–304).
- Active product CLAIM: нет (только AUTH-305 prep).
- Deploy: НЕ предлагать автоматом; ждать явную команду PO.

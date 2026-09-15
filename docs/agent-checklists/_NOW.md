updated_at: 2026-09-15T20:15:00+03:00

## ACTIVE / LIVE

- **VERIFY+FIX Order Workspace — DONE.** Все gates PASS (см.
  `docs/audits/2026-09-15-order-workspace-verify.md`), live API-smoke
  17/17 PASS, 2 реальных фикса (`PiOrdersService.ship()` тип +
  cancel/setLineReady тесты). `_active` пуст. Локальный стенд оставлен
  поднятым для визуальной проверки PO на `/orders/:id`. Не deploy.
  - Найдено вне scope (не трогали): `app-shell.component.spec.ts`
    regression от `WAVE-NX-HOME` (commit `33e06c08`, chip-count),
    `kppdf-web:lint` 83 pre-existing errors от registries-области
    (commit `6495bc54`). См. audit «Вне scope».
- Freebuff IDLE · B9/B10/Order-WS code waves CLOSED · Home-CTA DONE

## PARK

forms/foundations · Deploy/Wipe/SSH · order-workspace PARK.md

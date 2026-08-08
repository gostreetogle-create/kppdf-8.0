═══════════════════════════════════════════════════════════════
TZ-UX-FORM-305: Sweep — все form-dialogs → единые секции (Material style)
═══════════════════════════════════════════════════════════════

STATUS: READY (стартовать **после** FORM-302 primitive стабилен)

РОЛЬ: Frontend

ЗАВИСИМОСТИ: TZ-UX-FORM-302 DONE

LAYER: 2–3 (много файлов — можно резать волнами в executor report)

CONFLICT KEYS:
frontend/src/app/shared/ui/form-section/**;
frontend/src/app/pages/**/**form*dialog*.ts;
docs/audits/2026-08-08-dialog-layout-canon.md;
docs/pages/ui-form-sections-canon.md;
docs/agent-checklists/TZ-UX-FORM-305.md;
docs/agent-checklists/_active-map.md;

НЕ: менять payload/API; kind A confirms; deploy; переписывать business logic

---

## ЧТО ДЕЛАТЬ

1. Grep form-dialogs / PiDialog variant=form|content с полями.
2. Каждый: обернуть логические группы в `PiFormSection` с канон-заголовками где уместно.
3. Outliers table в audit (уже сделано / не трогали / known_limitation).
4. Волны ок (products/modules/orders/…); не один 50-file dump без отчёта по волнам.
5. tsc + точечные jest; archive; push.

## AC

- [ ] ≥ основные catalog/sales/inventory form-dialogs на секциях
- [ ] таблица outliers обновлена
- [ ] gates PASS; push

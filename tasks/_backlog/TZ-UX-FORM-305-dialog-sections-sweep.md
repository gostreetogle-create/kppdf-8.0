═══════════════════════════════════════════════════════════════
TZ-UX-FORM-305: Sweep — все form-dialogs → единые секции (Material style)
═══════════════════════════════════════════════════════════════

STATUS: PENDING MERGE � code on freebuff/executor-� branch; see TZ-GIT-301 (стартовать **после** FORM-302 primitive стабилен)

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

## ЧТО ДЕЛАТЬ (волны — отдельный commit на волну ОК)

**Волна A (обязательна в этом TZ):**
- product-form-dialog
- product-module form dialog (если есть form-dialog)
- color-references-form-dialog
- category / document-template-category / text-block-category form dialogs
- order-form-dialog, proposal form dialog (если form), people-form-dialog
- warehouse / stock-movement form dialogs (если простые)

**Волна B (если время после A + gates):** остальные `*form*dialog*.ts` из grep — только visual wrap секциями.

На каждую волну: commit+push с message `feat(ux): TZ-UX-FORM-305 wave A|B …`.

Правила безопасности:
1. Только обернуть группы в `PiFormSection` / канон-классы — **не** менять FormControl names, submit payload, API calls.
2. Kind A (confirm/delete) — пропуск.
3. Если диалог уже на секциях Material-style — skip + строка в outliers.
4. Сомнительный рефактор «заодно» — **запрещён**; known_limitation в archive.
5. Grep inventory → таблица в `docs/audits/2026-08-08-dialog-layout-canon.md` или отдельный outliers appendix.

## AC

- [ ] Волна A закрыта (файлы выше на секциях или обоснованный skip)
- [ ] outliers table обновлена
- [ ] jest точечно + `tsc -p tsconfig.app.json --noEmit` PASS
- [ ] archive + push; deploy нет

═══════════════════════════════════════════════════════════════
TZ-SALES-313: Все КП — семья в expand (supersede SALES-304)
═══════════════════════════════════════════════════════════════

STATUS: READY · WAVE-KP-VITRINE #4
DEPENDS ON: TZ-SALES-310 DONE
LAYER: 3
PAGES: /proposals
PAGE_DOCS: proposals.page.md
CHECKLIST: docs/agent-checklists/TZ-SALES-313.md

РОЛЬ: Frontend (+ тонкий FE service)

CONFLICT KEYS:
frontend/src/app/pages/commercial/proposals/proposals.page.ts;
frontend/src/app/pages/commercial/proposals/proposals.page.spec.ts;
frontend/src/app/pages/commercial/proposals/proposal-form-dialog.component.ts;
frontend/src/app/shared/services/pi-proposals.service.ts;
docs/pages/proposals.page.md;
docs/agent-checklists/TZ-SALES-313.md;

Проверено: SALES-303 DONE — family API; FE service без family; list expand = freeze
versions; PO: семья как состав изделия; сумма attach = **подсказка**; variant
read-only; sync+confirm. SUPERSEDES `TZ-SALES-304-kp-family-ui.md`.

---

## ЧТО ДЕЛАТЬ

1. `pi-proposals.service`: GET family, attach-organizations, sync-from-master.
2. Список: master/solo строки; у master — **отдельный** Family expand (не смешивать с Versions).
3. Диалог «Несколько фирм»: org + editable % + колонка суммы-**оценки** (подпись «оценка»); attach API.
4. Клик variant → ProposalFormDialog **read-only** (строки не edit).
5. Sync с master — confirm (перезапись строк + familyVersion).
6. Solo поведение create/list не ломать.
7. Тесты + page doc.

---

## НЕ

- Не менять quotation schema / convert variant.
- Не печать (320). Не писать total с наценкой в BE (оценка только UI).
- Не экран Создать КП (312+). Не deploy.

## AC

1. Family expand показывает variants по фирмам.
2. Attach сохраняет %; UI сумма = preview.
3. Variant dialog read-only.
4. Sync confirm + API.
5. FE tsc + jest proposals*.
6. Archive + push.

ARCHIVE: `tasks/_archive/2026-08/TZ-SALES-313.done.md`

KNOWN: saved total с наценкой / org default markup → successor; печать → 320.

# TZD-73: Smoke Excel + NX Desktop download + CAPABILITY-LEDGER

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: freebuff
lock_file: `.mimocode/locks/TZD-73.lock` (local; ignored by Git)

## Verification

- acceptance criteria: PASS — ledger + page pointer + README + WAVE DoD; smoke list в checklist (5 сценариев, unit-level PASS; live browser — SKIP: deploy за PO).
- gates: N/A (docs-only; кодовые тесты не применимы — причина зафиксирована в checklist Gates).

## Delivered

- `docs/CAPABILITY-LEDGER.md`: +строка «Desktop app + MCP pairing → included» (NX pairing/download, RBAC desktop:admin, compat public, meta URL) +строка «Desktop Excel Form Studio → included» (TZD-50/51+68–70, pilot материалы/виды работ, workers align, «кнопок Excel в registries нет»); история 2026-09-05.
- `docs/pages/registries.page.md`: секция «Массовый Excel = Desktop» — явно: на NX registries Excel-кнопок нет.
- `desktop/README.md`: таблица 3 кнопок Form Studio (Скачать Excel-форму / Скачать с данными / импорт+валидация) + RBAC-блок скачивания на сайте NX (desktop:admin; meta инжект в обе SPA; legacy known-limitation).
- `docs/agent-checklists/WAVE-DESKTOP-EXCEL-NX-ALIGN.md`: Status DONE, chain 68–73 archived, DoD отмечен.
- `tasks/_backlog/desktop/WAVE-DESKTOP-EXCEL-NX-ALIGN.md`: DoD волны отмечен; статус заголовка → 68–73 DONE.

## Smoke (evidence summary)

1. Desktop template → 2 rows (ok+dup) → reject dup: PASS (unit, TZD-69/70 suites).
2. Desktop export materials → edit → re-import: PASS (unit, excel-form-template export mode).
3. Desktop worker form 1 row: PASS (unit, TZD-69 workers validation).
4. NX admin: кнопка + скачивание + выпуск ключа: PASS (unit, app-shell + pairing-dialog + BE controller specs).
5. NX user без desktop:admin: кнопки нет / API 403: PASS (unit).

Live browser smoke — после deploy (слово PO); в checklist отмечен SKIP (deploy-dependent).
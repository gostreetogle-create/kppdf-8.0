# WAVE — Dictionaries / demo smells (2026-08-10)

**PO dictation → audit:** `docs/audits/2026-08-10-dictionaries-demo-audit.md`  
**Continuous prompt:** `tasks/_backlog/dictionaries/PROMPT-DICT-DEMO-WAVE.md`

## Order (strict)

| # | TZ | Layer | Notes |
|---|-----|-------|-------|
| 0 | [TZ-PRODUCTS-310](../../TZ-PRODUCTS-310-formdialog-bompanel-circular-cmp.md) | 3 | **P0** edit изделие `ɵcmp` circular |
| 1 | [TZ-DICT-317](../../TZ-DICT-317-units-crud-edit-roles.md) | 3 | Units add/edit |
| 2 | [TZ-DICT-318](../../TZ-DICT-318-ral-auto-prefix.md) | 3 | RAL digits + prefix |
| 3 | [TZ-MATERIALS-312](../../TZ-MATERIALS-312-supplier-empty-dims-half.md) | 3 | Supplier empty + dims ½ |
| 4 | [TZ-CATALOG-338](../../TZ-CATALOG-338-article-required-unique.md) | 3+4 | Article required/unique; product name optional |
| 5 | [TZ-DICT-319](../../TZ-DICT-319-kind-labels-dictionary-be.md) | 4 | Kind labels API |
| 6 | [TZ-DICT-320](../../TZ-DICT-320-kind-labels-fe-nav.md) | 3 | Wire dropdowns + nav |
| 7 | [TZ-UX-DIALOG-306](../../TZ-UX-DIALOG-306-composition-picker-qty.md) | 3 | Picker qty |
| 8 | [TZ-UX-DIALOG-307](../../TZ-UX-DIALOG-307-save-and-continue-hotkey.md) | 2–3 | Ctrl+Enter |
| 9 | SUPPLY-303 | — | **PARK** (`tasks/_park/`) — PO deferred |

## BAN

- Product code outside CONFLICT KEYS of current TZ  
- Auto `deploy.ps1`  
- WAVE-KP-COMPLETE / SALES-340+  
- EAV «поля из воздуха»; merge FSM statuses into dictionaries  
- Restore retired dictionaries hub cards (DICT-311) unless PO asks  

## Done when

All 0–8 archived with `## Executor report (auto)` + push; queue empty → «готово предложить деплой».

# Doc Studio honesty audit — 2026-09-03

**Verdict:** S15–S26 на бумаге закрыты; операторский контур **не готов**. FINISH pack S27–S37 подготовлен.

### Preflight Check Output
- **Context read:** roadmap v2, document-studio.page.md, WAVE-S16-CHAIN, studio-editor/data/showcase, putDataSet, explore audit
- **Key Constraints:** Mode A · thin sequential TZ · no parallel kppdf-web
- **Planned Deliverable:** `tasks/_ready/docstudio-finish/` + 11 TZ + PROMPTs
- **Validation Path:** WAVE FINISH + S37 smoke

## Критические дыры (код)

| # | Факт | TZ |
|---|------|-----|
| 1 | Нет витрины в Данные; showcase orphan | S27 |
| 2 | putDataSet без resolve rows | S28 |
| 3 | FE table source игнорит response; load без liveRows | S29 |
| 4 | Save = toast only | S30 |
| 5 | fetchPreview не вызывается; refreshPreview пустой | S31 |
| 6 | Имя read-only | S32 |
| 7 | Create без типа КП | S33 |
| 8 | Два select Формула / один data-test | S34 |
| 9 | Orphans shell + table-editor | S35 |
| 10 | Docs врут | S36 |
| 11 | Нет финального smoke evidence | S37 |

## Модульность (кратко)

Editor = толстый orchestrator (ok для ERP), панели в отдельных файлах. Каша: мёртвые компоненты, dual rails, dual formula, docs≠code. Не рефакторить «ради модульности» сверх S35 — сначала рабочий контур A→B.

## Pack

`tasks/_ready/docstudio-finish/INDEX.md` — следующий PROMPT-01.

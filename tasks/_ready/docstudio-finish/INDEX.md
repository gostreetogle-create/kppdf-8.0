# Doc Studio FINISH pack — индекс для Cursor → Freebuff

**Статус:** READY TO ISSUE · 2026-09-03  
**Аудит:** `docs/audits/2026-09-03-docstudio-honesty-audit.md`  
**Operator bar (за что отвечаю):** `docs/architecture/nx-doc-studio-operator-bar.md`  
**Волны:** `docs/agent-checklists/WAVE-DOCSTUDIO-FINISH-S27.md`

## Как выдавать

PO: «дай промпт» → следующий `prompts/PROMPT-NN-*.md`.  
PO: «выполнено» → следующий. **Не** параллелить studio TZ.

## Очередь (13 TZ)

### Волна A — стержень данных

| # | ID | PROMPT | TZ |
|---|-----|--------|-----|
| 01 | S27 | `PROMPT-01-S27.md` | VITRINA |
| 02 | S28 | `PROMPT-02-S28.md` | HYDRATE BE |
| 03 | S29 | `PROMPT-03-S29.md` | FE LIVEROWS |
| 04 | S30 | `PROMPT-04-S30.md` | SAVE HONEST |

### Волна B — просмотр и сценарии

| # | ID | PROMPT | TZ |
|---|-----|--------|-----|
| 05 | S31 | `PROMPT-05-S31.md` | SERVER PREVIEW |
| 06 | S32 | `PROMPT-06-S32.md` | RENAME |
| 07 | S33 | `PROMPT-07-S33.md` | НОВОЕ КП |
| 08 | S34 | `PROMPT-08-S34.md` | FORMULA DEDUP |

### Волна C — гигиена + полнота «любой документ»

| # | ID | PROMPT | TZ |
|---|-----|--------|-----|
| 09 | S35 | `PROMPT-09-S35.md` | ORPHAN PURGE |
| 10 | S38 | `PROMPT-12-S38.md` | UNSAVED GUARD |
| 11 | S39 | `PROMPT-13-S39.md` | CREATE DOCTYPE |
| 12 | S40 | `PROMPT-14-S40.md` | FLEX DATA BINDINGS |
| 13 | S36 | `PROMPT-10-S36.md` | DOCS TRUTH |
| 14 | S37 | `PROMPT-11-S37.md` | OPERATOR SMOKE |

> Порядок C: orphans → guard → doctype → **flex bindings** → docs → **smoke последним**.

## Следующий к выдаче

**PROMPT-01** (S27).

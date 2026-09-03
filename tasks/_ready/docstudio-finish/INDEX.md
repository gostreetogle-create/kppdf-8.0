# Doc Studio FINISH pack — индекс для Cursor → Freebuff

**Статус:** READY TO ISSUE · 2026-09-03  
**Аудит:** `docs/audits/2026-09-03-docstudio-honesty-audit.md`  
**Волны:** `docs/agent-checklists/WAVE-DOCSTUDIO-FINISH-S27.md`

## Как выдавать завтра

1. PO: «дай промпт» → Cursor копирует **следующий** файл из `prompts/PROMPT-NN-*.md` целиком в чат Freebuff.  
2. PO: «выполнено» → Cursor сверяет archive/SHA → выдаёт **следующий** PROMPT.  
3. **Не** выдавать два PROMPT параллельно (все на `kppdf-web` / studio).  
4. Между волнами A→B→C — пауза только если build красный или PO остановил.

## Очередь (11 TZ, 3 короткие волны)

### Волна A — данные и запись (обязательный стержень)

| # | ID | PROMPT | TZ |
|---|-----|--------|-----|
| 01 | S27 | `prompts/PROMPT-01-S27.md` | `../TZ-NX-DOCSTUDIO-S27-DATA-VITRINA-RESTORE.md` |
| 02 | S28 | `prompts/PROMPT-02-S28.md` | `../TZ-NX-DOCSTUDIO-S28-PUT-DATASET-HYDRATE.md` |
| 03 | S29 | `prompts/PROMPT-03-S29.md` | `../TZ-NX-DOCSTUDIO-S29-FE-LIVEROWS.md` |
| 04 | S30 | `prompts/PROMPT-04-S30.md` | `../TZ-NX-DOCSTUDIO-S30-SAVE-HONEST.md` |

### Волна B — просмотр и сценарии менеджера

| # | ID | PROMPT | TZ |
|---|-----|--------|-----|
| 05 | S31 | `prompts/PROMPT-05-S31.md` | `../TZ-NX-DOCSTUDIO-S31-SERVER-PREVIEW.md` |
| 06 | S32 | `prompts/PROMPT-06-S32.md` | `../TZ-NX-DOCSTUDIO-S32-DOC-RENAME.md` |
| 07 | S33 | `prompts/PROMPT-07-S33.md` | `../TZ-NX-DOCSTUDIO-S33-CREATE-KP-PATH.md` |
| 08 | S34 | `prompts/PROMPT-08-S34.md` | `../TZ-NX-DOCSTUDIO-S34-FORMULA-DEDUP.md` |

### Волна C — гигиена и правда docs

| # | ID | PROMPT | TZ |
|---|-----|--------|-----|
| 09 | S35 | `prompts/PROMPT-09-S35.md` | `../TZ-NX-DOCSTUDIO-S35-ORPHAN-PURGE.md` |
| 10 | S36 | `prompts/PROMPT-10-S36.md` | `../TZ-NX-DOCSTUDIO-S36-DOCS-TRUTH.md` |
| 11 | S37 | `prompts/PROMPT-11-S37.md` | `../TZ-NX-DOCSTUDIO-S37-OPERATOR-SMOKE.md` |

## Уже известно (не спорить с фактами)

- Витрина UI отсутствует; showcase orphan  
- `saveDocument` = fake toast  
- `putDataSet` без hydrate  
- `fetchPreview` есть, **не вызывается**; `refreshPreviewIfActive` пустой; Preview = canvas readOnly  
- Два select «Формула» с одним `data-test`  
- Orphans: `studio-shell.page.ts`, `studio-table-editor.component.ts`

## Следующий к выдаче

**PROMPT-01** (S27), пока PO не сказал иначе.

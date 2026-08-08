# WAVE-CATALOG-UX-C — каталог / формы / список (длинная FE-волна)

**STATUS:** READY · для свободного агента (часы–сутки)  
**SoT:** `D:\kppdf-8.0` на `main`  
**Параллель OK с:** Shop-north FACT-304 / FORM-307 (другие keys); Desktop IDLE  
**Deploy:** только по команде PO

## Порядок (строго)

| # | ID | Файл | Оценка |
|---|-----|------|--------|
| 1 | **TZ-CATALOG-DEDUP-301** | `tasks/_backlog/TZ-CATALOG-DEDUP-301-strip-fulleditor-composition.md` | ~1–2 ч |
| 2 | **TZ-UI-SELECT-301** | `tasks/TZ-UI-SELECT-301-catalog-overflow-search-migrate.md` | ~3–6 ч (много форм) |
| 3 | **TZ-PRODUCTS-307** | `tasks/TZ-PRODUCTS-307-products-list-hierarchy-preview.md` | ~2–4 ч |
| 4 | **TZ-UX-DIALOG-304** | `tasks/TZ-UX-DIALOG-304-photo-add-and-continue.md` | ~1–3 ч |

Цикл на каждый TZ: claim → code → gates → archive → **commit+push** → next.  
Без стопов «ок / поехали». Пустая волна → отчёт «готово предложить деплой», **не** `deploy.ps1`.

## BAN (этот агент)

- `desktop/**`, `desktop/mcp/**`, TZD-*  
- `backend/src/modules/supply/**`, import-task, mutation-journal  
- Shop-north остаток: **FACT-304**, **FORM-307** (peer в `_active` / очередь B)  
- SALES-304 · SHIPPING · Gantt 308–310  
- Не коммитить чужой dirty WIP вне CONFLICT KEYS  

## DoD волны

1. FullEditor продукта без BOM-секции (состав на карточке / QC L).  
2. Длинные catalog `<select>` в формах → overflow-select + `searchable="auto"`.  
3. Expand списка `/products` — иерархия module→children (не плоская сетка).  
4. Фото: add-and-continue или обоснованный N/A.  

## Checkpoint

- [ ] DEDUP-301 DONE  
- [ ] SELECT-301 DONE  
- [ ] PRODUCTS-307 DONE  
- [ ] DIALOG-304 DONE  

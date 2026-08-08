# WAVE-CATALOG-UX-C — каталог: состав + диалоги + карточки (PO P0)

**STATUS:** DONE — не воскрешать (COMPOSE/DIALOG/337/PRODUCTS/DIALOG-304 в archive)  
**SoT:** `D:\kppdf-8.0` на `main`  
**Параллель:** idle; следующий executor = Shop-north FORM-307  
**Deploy:** только по команде PO

## Зачем (одним абзацем)

PO устал лазить по страницам: модуль «Редактировать» без состава; пикер на вкладке
«Модуль» скрывает материалы; большие диалоги разной ширины; карточка материала ≠ A+.
Волна закрывает **discoverability состава + kind-C ширина + material A+**, без возврата
второго редактора состава.

## Канон включённости

| Родитель | В состав |
|----------|----------|
| Модуль | модуль **или** материал |
| Изделие | изделие **или** модуль (материал/«деталь» в UI — не убирать) |

Письмо состава = BomPanel на карточке / QC L.

## Порядок (строго)

| # | ID | Файл | Оценка |
|---|-----|------|--------|
| 1 | **TZ-UX-COMPOSE-301** | `tasks/TZ-UX-COMPOSE-301-module-composition-discoverability.md` | ~2–3 ч · **P0** |
| 2 | **TZ-UX-DIALOG-305** | `tasks/TZ-UX-DIALOG-305-catalog-kind-c-width-parity.md` | ~1–2 ч |
| 3 | **TZ-CATALOG-337** | `tasks/TZ-CATALOG-337-material-detail-a-plus.md` | ~2–4 ч · после FACT-304 |
| 4 | **TZ-PRODUCTS-307** | `tasks/TZ-PRODUCTS-307-products-list-hierarchy-preview.md` | ~2–4 ч |
| 5 | **TZ-UX-DIALOG-304** | `tasks/TZ-UX-DIALOG-304-photo-add-and-continue.md` | ~1–3 ч |

~~DEDUP-301~~ · ~~SELECT-301~~ — DONE (не брать).

Цикл: claim → code → gates → archive → **commit+push** → next.  
Без «ок / поехали». Пустая волна → «готово предложить деплой», **не** `deploy.ps1`.

## BAN

- `desktop/**`, TZD-*, supply/import-task/mutation-journal  
- FACT-304 пока IN WORK (блокер 337); не перехватывать materials/**  
- Не воскрешать ModuleMaterials / второй write-path состава  
- SALES-304 · SHIPPING · Gantt · deploy без команды PO  

## DoD волны

1. Из ModuleForm ясно: состав на карточке; пикер модуля сразу показывает материалы.  
2. Module FullEditor + composition picker = ширина эталона 1120.  
3. `/materials/:id` = A+ shell как изделие/модуль (без fake BOM).  
4. Products hierarchy preview + photo add-and-continue (хвост).  

## Checkpoint

- [x] COMPOSE-301 DONE (61975a99)  
- [x] DIALOG-305 DONE (f49e80c9)  
- [ ] CATALOG-337 — SKIP: FACT-304 ещё IN WORK (`tasks/_active/TZ-UX-FACT-304.md`)  
- [x] PRODUCTS-307 DONE (d6ddd19a)  
- [x] DIALOG-304 DONE (0b692559)  

# TZ-MIG-302: КП3 → КП8 load via MCP

> Зависимость: **TZ-MIG-301 PASS** + явный вердикт PO по `gap-block` в  
> `docs/audits/2026-08-12-kp3-to-kp8-field-map.md`.  
> Волна: `WAVE-KP3-DATA-MIGRATE.md`

РОЛЬ АГЕНТА: MCP data loader (HITL propose→confirm где journal; commercial tools по whitelist)

ЗАВИСИМОСТИ: TZ-MIG-301 DONE; MCP `user-kppdf` **online** (если down — STOP, попросить PO подключить)

LAYER: 4

CONFLICT KEYS: `data/from-kp3/id-map.json` ; `docs/agent-checklists/TZ-MIG-302.md` ; `docs/audits/2026-08-12-kp3-mcp-load-report.md`

PAGES: N/A  
PAGE_DOCS: N/A

Проверено: MCP tools `kppdf_list_*`, `kppdf_propose_product_create` + `kppdf_confirm_*`, `kppdf_counterparty_create`, `kppdf_quotation_create_draft` (см. desktop/mcp). Photo tools — нет.

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. Staging заполнен MIG-301; mapping audit существует.
2. Цель: залить **map + rename-synonym** данные в SoT КП8 через MCP (проверка связки), целевой бэкенд = тот, к которому подключён MCP (обычно local/dev; **prod Synology только если PO явно сказал**).
3. `gap-block` сущности/поля — **пропуск** до successor schema-TZ.

---

## ЧТО ДЕЛАТЬ

### ШАГ 1: Claim + MCP health

- Checklist TZ-MIG-302; active marker.
- `kppdf_ping` (или list tools) — FAIL → **STOP**, текст PO: «подключи MCP user-kppdf».
- Прочитать mapping audit; зафиксировать в checklist какие оси **разрешены** к заливу.

### ШАГ 2: Порядок залива (строго)

1. **Counterparties** (кроме `isOurCompany=true` — skip + note) через `kppdf_counterparty_create` (whitelist полей).  
   INN stub: если пустой INN в источнике — **не выдумывать**; skip row + log (или innIsStub только если tool/API явно позволяет — иначе skip).
2. **Products** через `kppdf_propose_product_create` → после выборки плана явный confirm (`kppdf_confirm_proposal` / batch).  
   `sku` ← `code`; `listPrice` ← `price`; name/unit/description/notes по mapping.
3. **Quotations (КП)** через `kppdf_quotation_create_draft` (+ линии, если tool позволяет; иначе draft header + report gap по items).  
   Remap `counterpartyId` / `productId` через `id-map.json`.
4. **Photos** — если MCP upload нет: **не** ломать SoT; оставить media в staging + раздел в load-report «нужен photo REST/MCP successor». Не silent-drop без записи.

### ШАГ 3: Id-map + отчёт

- Заполнить `data/from-kp3/id-map.json` (kp3→kp8 ids).
- `docs/audits/2026-08-12-kp3-mcp-load-report.md`: counts created/skipped/failed; MCP errors; photo gap; sample 3 URLs/ids в UI.
- Дубликаты (тот же INN/sku уже в SoT): **не** wipe; skip или update-propose только если PO разрешил update в Ask; дефолт = skip+log.

### ШАГ 4: Gates + archive

- Read-back: `kppdf_list_products` / counterparties / quotations counts выросли ожидаемо.
- Executor report; archive TZ-MIG-302.done.

---

## ИЗМЕНЯТЬ

- `data/from-kp3/id-map.json` (gitignore ok)
- `docs/audits/2026-08-12-kp3-mcp-load-report.md`
- checklist / archive / active-map

## НЕ ИЗМЕНЯТЬ

- schema FE/BE без отдельной TZ на gap-поля
- direct Mongo insert / mongorestore в КП8
- deploy/wipe
- залив gap-block полей «в notes свалкой» без записи в report

---

## КРИТЕРИИ ПРИЁМКИ

- [ ] MCP ping OK перед write
- [ ] Порядок CP → Product → Quotation соблюдён
- [ ] id-map заполнен для успешно созданных
- [ ] load-report в docs/audits
- [ ] gap-block / photos — явно в report, не молча
- [ ] Нет deploy; нет wipe
- [ ] Verification: MCP list counts + diff-check на закоммиченных docs

known_limitation: photos; composition; prod Synology без явного PO; commercial quotation lines may be partial per tool surface.

---

## Финализация

Как MIG-301; lock `TZ-MIG-302-kp3-mcp-load.lock`.

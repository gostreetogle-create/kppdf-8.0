# TZ-MIG-302: КП3 → КП8 load via MCP (scoped)

> **Вердикт PO 2026-08-12:** ДА — грузить map/rename; фото / email / брендинг — successors.  
> Deps: TZ-MIG-301 DONE (`e264ff4c`). Audit: `docs/audits/2026-08-12-kp3-to-kp8-field-map.md` §6.  
> Волна: `WAVE-KP3-DATA-MIGRATE.md`

РОЛЬ АГЕНТА: MCP data loader (HITL propose→confirm где journal; commercial tools по whitelist)

ЗАВИСИМОСТИ: TZ-MIG-301 DONE; MCP `user-kppdf` **online** (если down — STOP, попросить PO подключить Desktop/MCP)

LAYER: 4

CONFLICT KEYS: `data/from-kp3/id-map.json` ; `docs/agent-checklists/TZ-MIG-302.md` ; `docs/audits/2026-08-12-kp3-mcp-load-report.md`

PAGES: N/A  
PAGE_DOCS: N/A

Проверено: MCP `kppdf_propose_product_create` / confirm, `kppdf_counterparty_create`, `kppdf_quotation_create_draft`, `kppdf_list_categories` / category create if exists; **нет** photo upload.

---

## Scope LOCK (PO)

**В scope:** Categories (14) → Counterparties (без email/photo, skip isOurCompany) → Products (без photoIds) → Quotations+items (remap ids).  
**Вне scope:** photoIds; Counterparty.email; branding/kpPage1/2; wipe; deploy; Synology prod без слова PO; schema patches.

---

## ЧТО ДЕЛАТЬ

### ШАГ 1: Claim + MCP health

- Checklist + `tasks/_active/TZ-MIG-302.md`.
- `kppdf_ping` FAIL → STOP: «подключи MCP user-kppdf (Desktop)».
- Зафиксировать в checklist: target = MCP-connected SoT (local unless PO said prod).

### ШАГ 2: Categories pre-step

- Из products уникальные непустые `category` (14) → найти/создать `Category` type=product (или канон каталога) через MCP/API whitelist.
- Пустые category (29) → product без categoryId + log.

### ШАГ 3: Залив порядок

1. **Counterparties** — map/rename only; **не** писать email; skip `isOurCompany=true` (+ note Organization candidate); пустой INN → skip+log.
2. **Products** — `sku`←`code`, `listPrice`←`price`, …; **не** photoIds; categoryId из шага 2.
3. **Quotations** — draft + lines если tool позволяет; remap CP/product через id-map; statuses по mapping; branding snapshot **не** восстанавливать.
4. Photos — только строка в load-report «ожидает TZD-47 + MIG-303».

Дубликаты sku/INN в SoT: **skip+log** (не wipe, не silent overwrite).

### ШАГ 4: Id-map + load-report

- `data/from-kp3/id-map.json` (gitignore ok).
- `docs/audits/2026-08-12-kp3-mcp-load-report.md`: created/skipped/failed; MCP errors; явный список deferred gaps; 3 sample ids.

### ШАГ 5: Archive

Gates: list counts выросли; diff-check docs; Executor report; `TZ-MIG-302.done.md` + lock.

---

## ИЗМЕНЯТЬ

- `data/from-kp3/id-map.json`
- `docs/audits/2026-08-12-kp3-mcp-load-report.md`
- checklist / archive / `_active-map`

## НЕ ИЗМЕНЯТЬ

- FE/BE schema; photo binary upload; branding assets
- direct mongorestore; deploy.ps1; wipe
- TZD-46 / MIG-301 dumps

## AC

- [ ] MCP ping OK
- [ ] Categories pre-step done or documented skip with reason
- [ ] CP → Product → Quotation order
- [ ] No photoIds / email / branding written
- [ ] id-map + load-report committed (docs); dumps not committed
- [ ] No deploy / wipe

known_limitation: фото/email/брендинг = successors; quotation lines partial if tool thin.

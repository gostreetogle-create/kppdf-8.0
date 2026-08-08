# Очередь

## Параллель

| Агент | Волна | Статус |
|-------|--------|--------|
| **A — Desktop** | ~~WAVE-DESKTOP-BULK-IMPORT~~ | **IDLE** |
| **B — Shop north** | `shop-north-b/WAVE-SHOP-NORTH-B.md` | FACT-304 → FORM-307 (не перехватывать) |
| **C — Catalog UX** | `catalog-ux-c/WAVE-CATALOG-UX-C.md` | **READY** DEDUP-301 → SELECT-301 → PRODUCTS-307 → DIALOG-304 |

Все только из `D:\kppdf-8.0` на `main`. Не пересекать CONFLICT KEYS.

## Idle / park

| TZ | Заметка |
|----|---------|
| ~~TYPE-303~~ · ~~DIALOG-303~~ · ~~UX-313~~ | DONE |
| SALES-304 | RESERVED |
| SHIPPING / Gantt 308–310 | park |

## Не брать

- TZ-GIT-302 CANCELLED  
- чужой desktop / journal / import-task  
- deploy без команды PO  
- FACT-304 / FORM-307 если агент B жив  

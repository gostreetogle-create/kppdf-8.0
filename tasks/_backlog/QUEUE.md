# Очередь

## Параллель

| Агент | Волна | Статус |
|-------|--------|--------|
| **A — Desktop** | `desktop/WAVE-DESKTOP-DOC-TEXTS.md` | **READY** TZD-30 (промпт `PROMPT-TZD-30.md`) |
| **B — Shop north** | `shop-north-b/WAVE-SHOP-NORTH-B.md` | FACT-304 → FORM-307 (не перехватывать) |
| **C — Catalog UX** | `catalog-ux-c/WAVE-CATALOG-UX-C.md` | **READY** COMPOSE-301 → DIALOG-305 → 337 → 307 → 304 |

Все только из `D:\kppdf-8.0` на `main`. Не пересекать CONFLICT KEYS.

## Idle / park

| TZ | Заметка |
|----|---------|
| ~~TYPE-303~~ · ~~DIALOG-303~~ · ~~UX-313~~ · ~~DEDUP-301~~ · ~~SELECT-301~~ | DONE |
| SALES-304 | RESERVED |
| SHIPPING / Gantt 308–310 | park |

## Не брать

- TZ-GIT-302 CANCELLED  
- чужой desktop / journal / import-task  
- deploy без команды PO  
- FACT-304 / FORM-307 если агент B жив  
- воскрешение ModuleMaterials  

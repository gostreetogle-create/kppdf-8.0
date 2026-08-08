# Очередь

## Параллель

| Агент | Волна | Статус |
|-------|--------|--------|
| **A — Party-docs** | `party-docs/WAVE-PARTY-DOCS.md` | **READY** #1 PARTY-301 → … → #7 DESKTOP-SOT · промпт `PROMPT-CONTINUOUS.md` · **INN-301 PARKED** |
| **B — Shop north** | `shop-north-b/WAVE-SHOP-NORTH-B.md` | проверить живость; не перехватывать FACT/FORM если агент жив |
| **C — Catalog UX** | `catalog-ux-c/WAVE-CATALOG-UX-C.md` | COMPOSE/DIALOG/337/307/304 — вероятно DONE; не воскрешать |

Все только из `D:\kppdf-8.0` на `main`. Не пересекать CONFLICT KEYS.

## Idle / park / done

| TZ / wave | Заметка |
|-----------|---------|
| ~~WAVE-DESKTOP-DOC-TEXTS / TZD-30~~ | DONE |
| ~~TYPE-303~~ · ~~DIALOG-303~~ · ~~UX-313~~ · ~~DEDUP-301~~ · ~~SELECT-301~~ | DONE |
| TZ-INN-301 | PARKED (нужен ключ PO) |
| SALES-304 | RESERVED |
| SHIPPING / Gantt 308–310 | park |

## Не брать

- TZ-GIT-302 CANCELLED  
- чужой journal / import-task без wave  
- deploy без команды PO  
- claim INN-301 пока PARKED  
- commit `desktop/mcp-runtime` до DESKTOP-SOT-301  
- воскрешение ModuleMaterials  

# QUEUE-LIVE

| Slot | Волна | Статус | START |
|------|-------|--------|-------|
| **#1** | NX KP Family S40→S48 | IN PROGRESS (~S44) | `PROMPT-FREEBUFF-KP-FAMILY-RESUME.md` |
| **#2** | — | **free** (Contract C1–C5 **DONE**) | — |
| **HOLD** | QA Gates Q1→Q4b | READY, **не стартовать** пока #1 жив (или стартовать в #2) | `PROMPT-FREEBUFF-QA-GATES-START.md` |

**Параллель:** #2 свободен — можно QA Gates (BE/legacy FE) параллельно с KP Family, **без** `kppdf-web/src/**`.  
**Запрет:** второй агент на `kppdf-web/src/**` пока #1.

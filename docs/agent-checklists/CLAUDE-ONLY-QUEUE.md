# CLAUDE-ONLY QUEUE — волны после DocStudio / Photos

> Живой слот: `docs/agent-checklists/_NOW.md`.  
> Deploy stamp: `BLOCKED` until NX prep closes.

## Порядок

| # | Волна | Промпт | Статус |
|---|--------|--------|--------|
| 0 | Photos P3 | `tasks/PROMPT-CLAUDE-FINISH-PHOTO-P3.md` | **DONE** |
| 1 | Supply OPS | `tasks/PROMPT-CLAUDE-NX-SUPPLY-OPS.md` | **DONE** 7/7 |
| 2 | TZD-78 | `tasks/PROMPT-CLAUDE-TZD-78-CHAT-MAPPING.md` | **DONE** `7a3e576e` |
| 3 | Orders tray inset | `tasks/PROMPT-CLAUDE-ORDERS-TRAY-INSET.md` | **DONE** `b770e802` |
| 4 | **NX deploy prep** (не деплой) | `tasks/PROMPT-CLAUDE-DEPLOY-PREP-NX.md` | **NEXT** |
| 5 | TZD-76 | — | PARK |
| 6 | G12 | — | PARK |

## После READY

Любому агенту: «сделай деплой по документации» → `deploy/synology/README.md` + warm (Mongo keep).

## Правило

Не стартовать wipe / LM Studio BYOK без команды PO.

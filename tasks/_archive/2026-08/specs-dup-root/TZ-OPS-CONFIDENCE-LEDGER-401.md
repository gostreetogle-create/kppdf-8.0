# TZ-OPS-CONFIDENCE-LEDGER-401: Confidence ledger (Flash queue)

> Umbrella для очереди LEDGER-01…12.  
> Промпт: `tasks/_backlog/PROMPT-CONFIDENCE-LEDGER-FLASH.md`  
> Волна: `tasks/_backlog/WAVE-CONFIDENCE-LEDGER-FLASH.md`

РОЛЬ АГЕНТА: Docs/audit executor (Flash)

LAYER: 2

CONFLICT KEYS: `docs/audits/confidence/**` ; `docs/agent-checklists/TZ-OPS-CONFIDENCE-LEDGER-401.md` ; опц. точечные FE fixes только если lane разрешил

PAGES: N/A  
PAGE_DOCS: N/A

CHECKLIST: `docs/agent-checklists/TZ-OPS-CONFIDENCE-LEDGER-401.md`  
REVIEW: required (после LEDGER-12)

## Цель

12 scorecards + rollup → база для Cursor confidence 98–99.

## НЕ

- Site-wide browser walk (это DeepC Pro)  
- Deploy / wipe  
- Большой Angular rewrite  

## Финализация

READY FOR REVIEW после LEDGER-12 → Cursor читает `00-ROLLUP.md` → archive.

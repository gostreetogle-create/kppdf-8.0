═══════════════════════════════════════════════════════════════
TZ-SALES-320: Печать нескольких бланков КП — PARKED
═══════════════════════════════════════════════════════════════

STATUS: PARKED · WAVE-KP-VITRINE #8
DEPENDS ON: TZ-SALES-316 DONE + PO «витрина собирает»
LAYER: 3
PAGES: /proposals ; /proposals/create
CHECKLIST: docs/agent-checklists/TZ-SALES-320.md

РОЛЬ: Frontend (+ print pipeline)

## ПОЧЕМУ PARKED

Печать пачкой / превью / галочки фирм — после рабочей сборки КП (310–316).

## ЧТО ДЕЛАТЬ ПРИ UNPARK

Диалог: выбрать variants/orgs, preview, print one-or-many; deep-link org+template;
не дублировать страницы.

## НЕ ДО UNPARK

Код печати семьи; deploy как часть unpark без команды PO.

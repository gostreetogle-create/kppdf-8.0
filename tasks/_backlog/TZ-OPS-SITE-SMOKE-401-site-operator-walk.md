# TZ-OPS-SITE-SMOKE-401: Site operator walk (continuous)

> Маркер для DeepC Pro continuous walk. Агент создаёт checklist при CLAIM.
> Полный промпт: `tasks/_backlog/PROMPT-SITE-OPERATOR-WALK-DEEPC.md`

РОЛЬ АГЕНТА: Full-stack executor (browser + FE fixes + TZ authoring)

LAYER: 2–3 (меняется по странице)

CONFLICT KEYS: динамические — только файлы текущей страницы/диалога; не держать весь frontend

PAGES: (all from PAGE-TZ-INDEX walk order)  
PAGE_DOCS: update only pages you change

CHECKLIST: `docs/agent-checklists/TZ-OPS-SITE-SMOKE-401.md`  
REVIEW: required (итог audit)

AUDIT: `docs/audits/2026-08-16-site-operator-walk.md`

## Цель

Пройти сайт как оператор; локальные баги чинить; глобальные → TZ; не останавливаться до конца чеклиста routes.

## НЕ

- Deploy / wipe  
- Дублировать WAVE-HOME-STATS / PHOTO-FRAME  
- Freebuff Flash как исполнитель этого TZ  

## Финализация

READY FOR REVIEW + audit complete → Cursor PASS → archive `TZ-OPS-SITE-SMOKE-401.done.md` (журнал findings остаётся в docs/audits).

═══════════════════════════════════════════════════════════════
TZ-SALES-354: Self-pass менеджера Create КП — дожим стыда
═══════════════════════════════════════════════════════════════

PAGES: /proposals ; /proposals/create
PAGE_DOCS: proposals.page.md ; proposals-create.page.md
WAVE: WAVE-KP-SHAME-POLISH

РОЛЬ АГЕНТА: Frontend (self-verify + thin fixes)
ЗАВИСИМОСТИ: TZ-SALES-350…353 DONE
LAYER: 3
PRIORITY: high (закрытие волны)
CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposals.page.ts; frontend/src/app/pages/commercial/proposals/proposals.page.html; frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.html; frontend/src/app/pages/commercial/proposals/proposal-product-rail.component.ts; docs/pages/proposals.page.md; docs/pages/proposals-create.page.md; docs/agent-checklists/_active-map.md

Проверено: волна стыда 350–353 закрыла известные слои. 354 = один проход
«как менеджер перед коллегами» и только точечные фиксы в уже открытых keys.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. Пройти сценарий (браузер или DOM+компонент self-check, если стек недоступен —
   честно в checklist):
   Basic/login (не путать пароли) → Все КП → Создать КП → шаблон → витрина
   (изделие+модуль) → состав qty → своя строка → условия → смена статуса →
   F5 → превью страниц → копировать/редакт из списка.
2. Зафиксировать найденный стыд списком в checklist (≤10 пунктов).
3. Починить **только** то, что в CONFLICT KEYS этой TZ; остальное → known_limitation
   / successor note в `_active-map`, **не** раздувать scope.
4. Обновить WAVE статус → DONE в `WAVE-KP-SHAME-POLISH.md` + Checkpoint idle.
5. Gates на затронутых файлах; commit+push.

ИЗМЕНЯТЬ: только listed keys + wave/checkpoint docs.
НЕ ИЗМЕНЯТЬ: backend schema; Desktop; park; deploy; новые экраны.

known_limitation: всё, что требует BE/PDF/infra — в Checkpoint NOT DONE с путём,
без скрытого WIP.

КРИТЕРИИ ПРИЁМКИ:
1. Checklist содержит evidence прохода + список найденного / починенного.
2. Нет нового EN/пустого стыда на пройденном happy-path.
3. WAVE-KP-SHAME-POLISH помечен DONE; QUEUE → idle или «готово предложить деплой».
4. Gates: FE tsc + релевантные jest; Prettier/ESLint/diff-check; Deploy НЕ запускался.

Финализация: `tasks/_archive/2026-08/TZ-SALES-354.done.md` + lock
`.mimocode/locks/TZ-SALES-354-kp-manager-selfpass.lock`.

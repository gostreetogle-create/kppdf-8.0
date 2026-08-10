═══════════════════════════════════════════════════════════════
TZ-SALES-336: КП — замок бланка, «Оплачена» hard-lock, копировать
═══════════════════════════════════════════════════════════════

PAGES: /proposals/create ; /proposals
PAGE_DOCS: proposals-create.page.md ; proposals.page.md
NOTE: tasks/_backlog/kp-vitrine/NOTE-KP-template-snapshot-lock.md

РОЛЬ АГЕНТА: fullstack
ЗАВИСИМОСТИ: TZ-SALES-333 DONE (Save+snapshot)
LAYER: 3
CONFLICT KEYS: backend/src/modules/quotation/quotation.schema.ts; backend/src/modules/quotation/quotation.service.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; frontend/src/app/pages/commercial/proposals/proposals.page.ts; docs/pages/proposals-create.page.md

Проверено: statuses draft|sent|accepted|rejected|converted|cancelled — **paid нет**; duplicate() в service частично есть; 322 PARK.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **UI «Оплачена»** = статус `accepted` (код-канон; не плодить paid без нужды). Hard-lock: нельзя править items/template/pull; можно снять → снова draft/sent editable.
2. **Замок бланка** после Save: default locked к snapshot; в Параметрах «Обновить из шаблона» только если замок открыт (подтянуть 322 PARK в эту TZ тонко **или** оставить кнопку stub — предпочтение: реализовать refresh из NOTE).
3. **Копировать КП** в списке/Create: API duplicate → новый draft; открыть Create с копией.
4. Docs + tests.

НЕ: print pipeline 320; convert order rewrite; deploy.

AC: оплачена → edit blocked; снять → можно; copy → новый draft; snapshot не пляшет от builder без «Обновить».
Archive после visual PASS.

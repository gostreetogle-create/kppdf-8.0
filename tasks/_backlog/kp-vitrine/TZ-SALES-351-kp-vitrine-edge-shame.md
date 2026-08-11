═══════════════════════════════════════════════════════════════
TZ-SALES-351: Витрина Create КП — краевые кейсы после 348
═══════════════════════════════════════════════════════════════

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md
WAVE: WAVE-KP-SHAME-POLISH

РОЛЬ АГЕНТА: Frontend
ЗАВИСИМОСТИ: TZ-SALES-348 DONE; TZ-SALES-350 DONE (порядок волны)
LAYER: 3
PRIORITY: high
CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposal-product-rail.component.ts; frontend/src/app/pages/commercial/proposals/proposal-product-rail.component.spec.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; docs/pages/proposals-create.page.md

Проверено: 348 добавил chips Изделия/Модули/Материалы, «В КП: N», qty + Add & continue.
Краевые кейсы (пустой вид, qty≤0, бейдж после удаления строки) легко стыдят на демо.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **Пустой вид витрины** (нет модулей / материалов / поиск без hit):
   RU empty «ничего не найдено» + подсказка сменить chip или поиск — не EN/blank.
2. **Qty на карточке:** минимум 1; мусор/0/отрицательное не уходит в состав;
   после Add поле сбрасывается к 1 (или остаётся удобным default — зафиксировать в тесте).
3. **«В КП: N»** обновляется при удалении/уменьшении qty из панели «Состав»
   (источник = реальный draftLines, не локальный кэш карточки).
4. Переключение chips не теряет поиск зря без нужды; активный chip явен в light/dark.
5. Tests: empty kind; qty clamp; badge after remove line.
6. Строка в `proposals-create.page.md` §348 — краевые кейсы.

ИЗМЕНЯТЬ: product-rail + минимально create.page если нужен shared draft signal; page doc.
НЕ ИЗМЕНЯТЬ: PiShowcaseCard контракт; backend lineKind schema; шелл 317; каталог FullEditor;
новые виды витрины.

known_limitation: раскрытие BOM изделия подпунктами в КП — вне волны.

КРИТЕРИИ ПРИЁМКИ:
1. Пустой chip-вид не выглядит сломанным.
2. Нельзя добавить qty < 1.
3. После удаления строки бейдж «В КП» исчезает или уменьшается.
4. Gates: FE tsc; `pnpm test -- proposal-product-rail`; Prettier/ESLint/diff-check;
   browser/DOM self-check PASS.

Финализация: `tasks/_archive/2026-08/TZ-SALES-351.done.md` + lock
`.mimocode/locks/TZ-SALES-351-kp-vitrine-edge-shame.lock`.

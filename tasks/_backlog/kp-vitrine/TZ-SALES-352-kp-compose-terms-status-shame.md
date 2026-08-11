═══════════════════════════════════════════════════════════════
TZ-SALES-352: Состав / своя строка / условия / статус — стыд chrome
═══════════════════════════════════════════════════════════════

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md
WAVE: WAVE-KP-SHAME-POLISH

РОЛЬ АГЕНТА: Frontend
ЗАВИСИМОСТИ: TZ-SALES-351 DONE; фичи 342/344/347 уже в коде
LAYER: 3
PRIORITY: high
CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.html; frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts; docs/pages/proposals-create.page.md

Проверено: панели «Состав», «Условия», статус/версии в верхней строке уже есть (340–347).
Стыд = EN-хвосты, пустые панели без CTA, disabled без русской причины, рассинхрон
лейблов статуса с журналом (после 350 словарь единый).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **Состав:** empty «нет позиций» + RU куда добавить (витрина «Товары»);
   своя строка без названия — не молчаливый мусор на бланке (валидация или placeholder RU).
2. **Условия:** empty + CTA «Добавить условие» / из библиотеки — без EN.
3. **Статус / версии / «Создать заказ»:** все видимые строки RU; disabled «Создать заказ»
   с понятной причиной (не принят и т.п.); словарь статуса = 350/347.
4. Тосты/ошибки панелей — русский, один тост на проблему (канон PO-DIARY).
5. Tests на empty + disabled hint; обновить page doc.

ИЗМЕНЯТЬ: proposal-create.page.* (+ связанные тонкие child components **только если**
уже в CONFLICT зоны create; не раздувать keys без нужды).
НЕ ИЗМЕНЯТЬ: backend quotation API; PDF engine; шелл 317; витрину rail (кроме чтения);
таблицу layout 332.

known_limitation: почта клиенту / публичная ссылка — BAN волны.

КРИТЕРИИ ПРИЁМКИ:
1. Пустой состав и пустые условия не стыдят (RU + куда кликнуть).
2. Нет EN в chrome этих панелей и верхней строки статуса.
3. «Создать заказ» disabled понятен по-русски.
4. Gates: FE tsc; `pnpm test -- proposal-create`; Prettier/ESLint/diff-check;
   browser/DOM self-check PASS.

Финализация: `tasks/_archive/2026-08/TZ-SALES-352.done.md` + lock
`.mimocode/locks/TZ-SALES-352-kp-compose-terms-shame.lock`.

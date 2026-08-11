═══════════════════════════════════════════════════════════════
TZ-SALES-350: Все КП — RU-статусы = студия, empty, chrome
═══════════════════════════════════════════════════════════════

PAGES: /proposals
PAGE_DOCS: proposals.page.md
WAVE: WAVE-KP-SHAME-POLISH

РОЛЬ АГЕНТА: Frontend
ЗАВИСИМОСТИ: WAVE-KP-COMPLETE 347/348 DONE (словарь статусов студии — эталон)
LAYER: 2
PRIORITY: high (первый слот стыд-волны)
CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposals.page.ts; frontend/src/app/pages/commercial/proposals/proposals.page.html; frontend/src/app/pages/commercial/proposals/proposals.page.spec.ts; docs/pages/proposals.page.md

Проверено: `proposals.page.ts` мапит `accepted` → «Оплачена»; Create КП 347 показывает
цикл «Черновик/Отправлено/Принято/…». На показе коллегам два слова для одного статуса = стыд.
Empty / chrome — сверить с PO-DIARY (пустые состояния говорят куда кликнуть; light+dark читаемы).

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Журнал `/proposals` — плоский список quotations, page size 10, chip «Создать КП».
2. Словарь статусов в списке **расходится** со студией (accepted → «Оплачена» vs «Принято»).
3. Цель: один человеческий словарь как в верхней строке Create КП (347).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. Вынести / выровнять RU-лейблы статусов КП **как в Create КП 347**
   (Черновик, Отправлено, Принято, Отклонено, В заказе, Отменено — Exact strings
   сверить с `proposal-create.page` / status badge 347; не оставлять «Оплачена» для accepted).
2. Empty state журнала: короткий RU + явный CTA «Создать КП» (не «No data» / EN).
3. Light + dark: бейджи статусов читаемы (контраст); нет сырого EN `draft`/`accepted` в UI.
4. Тесты: `statusLabel` / badge ожидания под новый словарь; empty CTA.
5. Обновить `docs/pages/proposals.page.md` (статус accepted = «Принято», не «Оплачена»).

ИЗМЕНЯТЬ: proposals.page.* + page doc.
НЕ ИЗМЕНЯТЬ: proposal-create.* (кроме чтения эталона строк); backend; шелл TOC Сделок;
семью/variants API; deploy.

known_limitation: полная унификация «converted» vs «В заказе» если API ещё отдаёт
legacy — зафиксировать в checklist; не плодить второй статусный enum на BE.

КРИТЕРИИ ПРИЁМКИ:
1. В списке и в студии один и тот же RU для одного status code (accepted = «Принято»).
2. Пустой журнал: RU + клик ведёт на `/proposals/create`.
3. Нет EN status в пользовательском UI списка.
4. Gates: `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`;
   `cd frontend && pnpm test -- proposals.page`; Prettier/ESLint/diff-check на изменённых.
5. Browser/DOM self-check PASS (список + empty).

Финализация: `tasks/_archive/2026-08/TZ-SALES-350.done.md` + lock
`.mimocode/locks/TZ-SALES-350-proposals-list-shame.lock` + checklist Executor report.

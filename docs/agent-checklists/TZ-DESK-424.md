# TZ-DESK-424 checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-08/TZ-DESK-424.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-08-22T20:41:38Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — `TZ-UX-345` (chrome-rail), `TZ-UX-FORM-310` — другие conflict keys, не пересекается
- [x] TZ / канон прочитаны: `GEMINI.md`, `tasks/TZ-DESK-424-tray-declutter.md`, `docs/pages/ui-composition-tree.md`
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-DESK-424.md` на месте

## Acceptance

- [x] Дерево состава без «забора»: нет `nestShadow()`/`box-shadow` inset; раскрытый узел без hairline-обёртки на весь node (нет карточки-в-карточке); kind rail 5px остаётся; свёрнутая строка без hairline+rounded «коробки» — все строки делит `border-b`
- [x] Tray: снята обёртка `p-2 hairline rounded-sm bg-paper` вокруг `app-composition-tree`; `order-summary-client` («Клиент:») не рендерится в desk-режиме
- [x] «Подтвердить» доступна → `bg-gold text-ink`; недоступна → `bg-paper text-muted-foreground` (outline `border-rule-strong` не менялся)
- [x] Правая колонка кнопок (Снабжение/Производство/Документы/Блокнот) — `w-full min-h-touch`, одна колонка
- [x] Hub-режим: «Открыть заказ»/«Открыть карточку заказа» — compact outline-кнопки (RouterLink), не `underline`; маршруты не менялись
- [x] Строка очереди: «Удалить» — тот же CSS Grid, что и `.manager-desk__order-row` (последняя колонка, `align-self: stretch`), не отдельный flex-столбик; статус — `font-weight: 600` + `letter-spacing` + hairline outline, без per-status раскраски (уже не было светофора — подтверждено)
- [x] Specs обновлены (nestShadow отсутствует; client hidden; gold CTA; delete в grid) — новые/изменённые тесты во всех трёх файлах
- [x] `manager-desk.page.md` — строка DESK-424 → DONE
- [x] Не создан `order-form-flyout.component.ts`; `panel=edit`/payload заказа не тронуты; `field-capacity.ts`/product/module form dialogs не тронуты; нет цветных бейджей статусов; `styles.css` не тронут

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page/shared-ui behavioral fix
- [x] FIC §A–E: N/A
- [x] page.md / PAGE-TZ-INDEX: `manager-desk.page.md` DESK-424 строка → DONE
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (коммит только файлов из CONFLICT KEYS, не `git add -A`)
- [x] Coupling map: N/A
- [x] Paper & Ink: без `box-shadow`, hairline-only borders

## Gates (факт)

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit                          → exit 0 (PASS)
cd frontend && pnpm test -- composition-tree order-hub-tray manager-desk --runInBand → 46/46 PASS
cd frontend && pnpm lint                                                             → 0 errors, 18 pre-existing warnings (не мои файлы)
```

## Executor report

- `composition-tree.component.ts`: убран `nestShadow()` (метод + `[style.box-shadow]` binding, включая dark inset); убран `[class.hairline]` на node-wrapper (была карточка-в-карточке на раскрытом узле); строка (row) теперь всегда `border-b` вместо условного `hairline+rounded-sm` (свёрнуто) / `border-b` (раскрыто) — единая нижняя линия для всех строк, kind rail `border-l-[5px]` не менялся. Комментарий класса обновлён (TZ-DESK-424).
- `order-hub-tray.component.ts`: снята обёртка `p-2 hairline rounded-sm bg-paper` вокруг `app-composition-tree` в tray (секция уже в рамке снаружи); убран span `order-summary-client` («Клиент: …») из шаблона desk-режима, input `clientLabel` оставлен нетронутым (используется только для передачи в хост при необходимости); «Подтвердить» — `bg-gold`/`text-ink` вместо `bg-ink`/`text-paper`; hub-ссылки «Открыть заказ» (readiness) и «Открыть карточку заказа» (composition) — компактные outline-кнопки вместо `underline`, маршруты не менялись; правые кнопки Снабжение/Производство/Документы(3 кнопки)/Блокнот — `w-full min-h-touch`, стек в одну колонку (label над кнопкой, было `flex items-center` + `ml-auto`).
- `manager-desk.page.ts`: `.manager-desk__order-actions` — `display: flex` → `display: grid` (`grid-template-columns: 1fr auto`), delete — последняя grid-колонка той же высоты (`align-self: stretch`), не отдельная flex-полоса; `.manager-desk__status` получил `font-weight: 600`, `letter-spacing: 0.02em`, hairline outline (`border: 1px solid var(--color-rule)`) — по-прежнему один акцентный цвет на все статусы (никогда не было per-status «светофора», проверено до правки).
- Specs (все три файла обновлены под новое поведение, не только conflict-key production-код):
  - `composition-tree.component.spec.ts`: `pack.hairline` → `false`; новая проверка `moduleRowEl` (`border-b` есть, `hairline` нет); тест `nestShadow` (inset/dark) заменён на «no inset box-shadow, light или dark».
  - `order-hub-tray.component.spec.ts`: 3 новых теста — gold CTA при `canConfirm`, outline CTA когда не confirmable, `order-summary-client` отсутствует в desk-режиме даже с заданным `clientLabel`.
  - `manager-desk.page.spec.ts`: старая проверка `order-summary-client` в tray заменена на «элемент отсутствует» + «имя всё ещё видно в самой строке/группе» (`item.textContent`); новый тест на grid-структуру `.manager-desk__order-actions` (row + delete — прямые дети одного контейнера, без getComputedStyle — jsdom не считает реальный layout, проверка структурная).
- `manager-desk.page.md`: строка DESK-424 `READY` → `DONE` с кратким summary.
- `docs/pages/ui-composition-tree.md`: файл уже был обновлён (AC9 переписан на `border-bottom`/kind rail без inset, dark-таблица без inset shadow) **до** старта этой TZ — судя по TZ-шапке, архитектором/Gemini-консультацией. Найден как uncommitted diff при старте; не редактировал повторно (TZ прямо запретил, «AC 9 уже про rail+border-b»), но включаю в этот коммит, т.к. файл явно назван в CONFLICT KEYS этой TZ и никто другой его ещё не закоммитил — без этого коммит TZ-DESK-424 фиксировал бы код без соответствующего канона.
- Не создавал `order-form-flyout.component.ts`; не трогал `panel=edit`/payload заказа, `field-capacity.ts`, `product-form-dialog`/`module-form-dialog`, `styles.css`; не вводил цветные бейджи статусов.
- Conflict disclosure: `TZ-UX-345` (chrome-rail) и `TZ-UX-FORM-310` в `tasks/_active/` — другие файлы, не пересекались. Живой браузерный прогон на 1440 `/desk` (упомянутый в Gates TZ) не выполнялся в headless-сессии — только статические гейты (tsc/jest/lint); визуальная проверка — PO/dev.

## Review handoff

- [x] READY FOR REVIEW — N/A, TZ не запрашивала отдельный review-wave

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-22

# Site operator walk — 2026-08-16

> Executor: DeepC 4 Pro. Workspace `D:\kppdf-8.0`. Deploy нет.
> Method: живой обход (frontend :4200 + backend :3000), реальные клики + focused tests.

## Progress table

| Route | Status | Evidence | Notes |
|-------|--------|----------|-------|
| /dashboard | PASS (read-only) | snapshot: Комбайн, колонки НОВЫЕ/В РАБОТЕ/ГОТОВЫ/ПРОСРОЧЕНЫ, Черновики | правок нет (NAV-303). Фон: TS-ошибка dashboard-stats.page.ts → finding S1 |
| /products | PASS | «+Создать»→QuickCreate (name+sku обязательны)→Создать→201, 61→62, toast; поиск СМОУК; delete+confirm+empty RU | P0 OK |
| /modules | PASS | «+Создать»→(name+article обязательны)→Создать→3→4 в списке; delete+confirm RU | P0 OK |
| /materials | PASS | «+Создать»→валидация (article+unit required, RU «Обязательное поле»)→Создать→201, 6→7; list↔grid; delete+confirm RU | P0 OK |
| /counterparties | PASS | «+Создать»→FullEditor (Основные/Реквизиты/Банк/Подписант, RU); 5 заказчиков | диалог открывается, поля RU |
| /people | PASS | 5 человек, поиск, переключатель Активен, edit/delete | |
| /proposals/create | PASS | «Создать КП» открывается, «Добавить шаблон», без EN/undefined | |
| /contracts | PASS | 0 договоров, empty «Нет договоров…», колонки+сортировка | |
| /orders | PASS | 5 заказов, «+Создать заказ», колонки+готовность | |
| /design | PASS (SKIP правок) | «Очередь доукомплектования» stub, RU | NAV-303 |
| /supply | PASS | 5 задач, статусы Все/Черновик/…, «+Задача» | |
| /production | PASS | Гант «План-оценка по дням», масштаб день/месяц | |
| /work-types | PASS | 5 видов, «+Создать», колонки | |
| /inventory | PASS | дашборд: 5 складов, 0 позиций, «Все позиции в норме» | |
| /storage-items | PASS | фильтр по складам | |
| /stock-movements | PASS | фильтры Все/Приход/Расход/Корр./Перемещ. + склады | |
| /warehouses | PASS | 5 складов, «+Склад» | |
| /shipping | PASS | stub «Частичные отгрузки · СКОРО» — known limitation | |
| /doc-constructor/templates | PASS | 2 шаблона, «+Создать шаблон», категории | |
| /doc-constructor/texts | PASS | открывается | |
| /doc-constructor/tables | PASS | открывается | |
| /doc-constructor/documents | PASS | 0 записей, empty RU | |
| /doc-constructor/builder | PASS | «Шаблон 1 · 0 блоков», Редактор/Превью | |
| /organizations | PASS | «РАЗДЕЛ · ПАРТНЁРЫ», организации | |
| / (home) | PASS (SKIP правок) | редирект → /dashboard (Комбайн) | NAV-303/WAVE-HOME-STATS |

## Findings

| id | severity | page | repro | fix/TZ |
|----|----------|------|-------|--------|
| S1 | P1 | /dashboard (home stats stub) | dev-overlay TS2339 `Property 'destructive' does not exist` в `dashboard-stats.page.ts:52` — `statCards` из 4 элементов, `destructive` есть только у `overdue` | TZ: территория NAV-303/WAVE-HOME-STATS (CLAIMED) — НЕ чиню, передаю владельцу (AOT-сборка упадёт) |
| S2 | P2 | /products, /materials | часть названий/имён файлов показывается `???????`/mojibake (latin1→?) — данные залиты с неверной кодировкой | TZ: data migration decode, не UI |

## TZ queue (written this run)

- **S1 → NAV-303 owner** (home stats `dashboard-stats.page.ts` TS2339 `destructive`): не создаю новый TZ — активная волна NAV-303/WAVE-HOME-STATS уже владеет файлом.
- **S2 → `tasks/_backlog/TZ-DATA-UTF8-CLEAN.md`** (написан): decode latin1→utf8 в demo-данных (`products.name`, `materials.*`, `photos.originalFilename`), dry-run + idempotent, PARK до слова PO.

## Итог обхода

- Все 24 route = PASS / PASS(SKIP) / stub. Локальных P0-багов каталога НЕ найдено: диалоги Создать/Сохранить/Удалить в products/modules/materials реально пишут (201) и валидируют по-русски.
- Чужой WIP не задет (NAV-303, PHOTO-304). Кода не менял → коммита нет.

## Outcome (closeout)

- **Cursor Verdict: PASS** (docs-only closeout 2026-08-16T13:49:13+03:00).
- Archive: `tasks/_archive/2026-08/TZ-OPS-SITE-SMOKE-401.done.md`
- Lock: `.mimocode/locks/TZ-OPS-SITE-SMOKE-401.lock`
- Closeout commit: `5ec96518e774bf5484d959d1e393fdf5a0345fde`
- S1 handoff → NAV-303 TZ note; S2 → TZ-DATA-UTF8-CLEAN remains PARK.
- Deploy нет.

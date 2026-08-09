# /proposals — Все КП

**Route:** `/proposals`
**TZ:** SALES-301 list · SALES-302 versions · SALES-303 family API · **SALES-313 DONE** family UI (supersedes 304) · SALES-310 chrome

## Chrome

Тёмный TOC **КП | Договоры | Заказы**; chip **КП** ведёт в `/proposals/create`; жёлтые **Создать КП | Все КП** (активен Все КП на этом журнале).

## Список

- Плоский `GET /quotations`; клиентский поиск/сортировка/page size 10.
- Строки **solo/master** только — `familyRole === 'variant'` скрыты (варианты живут в expand).
- Колонка **Версии** (freeze / история) и отдельная колонка **Семья** (не смешивать).
- «Создать» открывает студию `/proposals/create`; «Редактировать» открывает ту же студию с `?id=<quotationId>`, без form-диалога.
- «Удалить КП» использует soft-delete: после успешного удаления тост «КП удалено», а удалённая строка исключается из списка и обычного GET.
- Статус `accepted` показывается как «Оплачена»; «Копировать» вызывает duplicate API и открывает новый draft в студии Создать КП.

## Семья (313)

- Expand «Семья» → `GET /quotations/:id/family`; варианты по Organization.
- «Несколько фирм» → attach dialog: org + % + колонка **оценка** (UI preview, не BE total).
- Клик variant → отдельный `ProposalVariantDialogComponent` (read-only; строки и цены не редактируются).
- «Синхронизировать» (master) → confirm → `POST …/sync-from-master`.

## Не здесь

Печать (320), schema rewrite / convert variant, экран Создать КП (312+), ModuleMaterials, deploy.

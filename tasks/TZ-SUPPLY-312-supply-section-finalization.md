# TZ-SUPPLY-312 — Финализация раздела «Снабжение»

**Status:** READY_FOR_ACCEPTANCE  
**Date:** 2026-08-20  
**Decisions:** Q1=A, Q2=A, Q3=A, Q4=A, Q5=A, Q6=A  
**Depends on:** TZ-SUPPLY-305, TZ-SUPPLY-311  
**Scope:** быстрый заказ, реестр, отгрузки, status/data contract, security и cleanup

## Цель

Довести раздел снабжения до единого production-ready потока без дублирования бизнес-сущностей и без расхождения между UI, API и фактическим бизнес-процессом.

## Уже выполнено до старта TZ

- быстрый заказ работает на Angular/Paper & Ink;
- строки быстрого заказа подключены к `/api/supply-requests`;
- реестр работает на `/api/supply-tasks`;
- при order-backed `SupplyRequest` переход «Заказано» создаёт связанную `SupplyTask`;
- материалы, цвета, поставщики, менеджеры и фотографии имеют frontend wiring;
- исправлены потеря `Material.colors` через DTO, пустой draft, повторный spawn задачи, двойная запись статуса и populated category mapping.

## Зафиксированные решения владельца продукта

- **Q1 = A:** «Заказано» означает фактическое размещение; связанная `SupplyTask` синхронно переходит в `ordered`.
- **Q2 = A:** отгрузка создаётся из `Order`, снабжение влияет на готовность заказа.
- **Q3 = A:** цвета остаются `Material.colors: string[]` с нормализацией и управлением вариантами.
- **Q4 = A:** `SupplyRequest` и `SupplyTask` получают обязательный organization scope для новых записей и фильтруются по текущей организации.
- **Q5 = A:** реализуется полный операционный MVP отгрузки: список, фильтры, создание из заказа, частичные позиции, статусы, документы.
- **Q6 = A:** загруженные, но не сохранённые в Material фото удаляются сразу при отмене модалки.

## Реализовано после ответов

1. Зафиксирована status transition matrix для `SupplyRequest → SupplyTask → Shipment`.
2. `SupplyRequest` и `SupplyTask` сохраняют organization scope на новых записях и фильтруются по нему; legacy-записи не ломаются.
3. Повторное `ordered` идемпотентно, spawn задачи реестра выполняется один раз.
4. Реализован `/shipping`: список, фильтры, создание из заказа, частичные позиции, dispatch, доставка, редактирование и документы.
5. Для `Shipment` добавлены soft-delete фильтрация и защита от обратных переходов статуса.
6. UI-фильтры, order links, counters, empty/error states и обновление после действий синхронизированы.
7. Добавлены focused-тесты для цветов, менеджеров, quick-order wiring, отгрузки, scope и soft-delete.

## Статус после 2026-08-20 (дополнение)

- Стендовый smoke/e2e выполнен: `scripts/smoke/supply-smoke.mjs` — **23/23 PASS**
  на локальном стенде (auth + Mongo + склад + upload-хранилище + полный поток
  быстрый заказ → реестр → отгрузка). Скрипт самоочищающийся.
- По ходу smoke исправлены 2 бага storage-item: partial unique index
  (`$exists: true` → `$type: 'objectId'`) и silent no-op `remove()` → hard delete.
  Backend tsc PASS; supply/shipment/storage-item/material focused **50/50**.
- Legacy-контур `PurchaseRequest/PurchaseOrder`: стратегия вынесена в
  `tasks/_backlog/TZ-SUPPLY-313-legacy-purchase-contour-strategy.md` (A/B,
  ждёт решения PO); на стенде данных в legacy-коллекциях **0**.

## Осталось вне текущего безопасного скоупа

1. Браузерный проход PO по `docs/agent-checklists/SUPPLY-SMOKE.md` после deploy/VPN (API-контур уже пройден).
2. Backfill `organizationId` для старых документов перед жёстким tenant enforcement.
3. Решение PO по legacy-контуру (TZ-SUPPLY-313: A — официальный legacy-режим, B — удаление после развязки MCP).
4. Debounce автосохранения и отдельная cleanup-политика orphan-фото на сервере.

## Acceptance criteria

- один понятный источник истины для каждого статуса;
- повторное нажатие действий идемпотентно;
- быстрый заказ, реестр и отгрузка связаны по реальным ObjectId;
- нет необъяснимых дублей коллекций или параллельных UI-контуров;
- цвета материала сохраняются и восстанавливаются после reload;
- фильтр заказа показывает согласованные данные во всех экранах;
- backend rejects cross-organization access;
- `/shipping` больше не stub;
- frontend/backend tests, typecheck, build и smoke e2e проходят.

## Gate

Решения Q1–Q6 получены 2026-08-20. Реализация MVP завершена; стендовый
smoke/e2e (auth, Mongo, склад, upload) пройден 23/23 на локальном стенде;
стратегия legacy-контура зафиксирована в TZ-SUPPLY-313 (ожидает решения PO
по варианту A/B). До production-статуса остаётся только браузерный проход PO
и решение по legacy; необратимые миграции старого `PurchaseRequest` контура не
выполнялись.

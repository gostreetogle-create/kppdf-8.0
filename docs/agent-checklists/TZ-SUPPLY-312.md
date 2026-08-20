# TZ-SUPPLY-312 checklist — аудит раздела снабжения

**Status:** READY FOR ACCEPTANCE  
**Audit date:** 2026-08-20

## Карта раздела

- [x] Быстрый заказ `/supply` reviewed.
- [x] Реестр `/supply?view=registry` reviewed.
- [x] Отгрузка `/shipping` reviewed — operational MVP реализован.
- [x] API/services/models reviewed.
- [x] `SupplyRequest`, `SupplyTask`, `Shipment`, legacy `PurchaseRequest` compared.

## Найдено и исправлено

- [x] `Material.colors` добавлен в backend DTO, чтобы whitelist не удалял цвета.
- [x] Пустой quick-order draft разрешён backend.
- [x] Повторный `ordered` не создаёт duplicate `SupplyTask`.
- [x] Двойной frontend status write устранён.
- [x] Populated category ID корректно маппится в material picker.
- [x] `orderId` поддержан в request list API и quick-order visibility filter.
- [x] Цвета нормализуются и дедуплицируются на backend/UI; `+` и выбор варианта проверены.
- [x] Телефон/email живого менеджера сохраняются через `PersonsService.update`.
- [x] Focused tests добавлены/обновлены для найденных регрессий.

## Решения Q1–Q6

- [x] «Заказано» означает фактическое размещение; `SupplyTask` получает `ordered`.
- [x] Отгрузка создаётся из `Order`.
- [x] Цвета остаются `Material.colors: string[]`.
- [x] Новые записи снабжения получают organization scope; legacy допускается до backfill.
- [x] `/shipping` реализован как операционный MVP.
- [x] Незавершённые фото очищаются при отмене модалки.

## Остаточные задачи, не блокирующие приёмку MVP

- [ ] Реальный smoke/e2e на стенде с авторизацией, Mongo, складом и upload.
- [ ] Backfill organizationId для legacy-документов.
- [ ] Отдельное решение по legacy PurchaseRequest/PurchaseOrder.
- [ ] Debounce автосохранения и серверная orphan-photo cleanup policy.

## Проверки 2026-08-20

- [x] Frontend supply/shipping focused: 35/35.
- [x] Backend supply/shipment/order focused: 97/97.
- [x] Frontend/backend typecheck и build.
- [x] `git diff --check`.
- [x] Полный backend suite проверен: 949/951; 2 baseline-падения вне снабжения.
- [x] Полный frontend suite проверен: 1807/1815; 8 baseline-падений вне снабжения.

Подробное ТЗ: `tasks/TZ-SUPPLY-312-supply-section-finalization.md`.
Аудит: `docs/audits/2026-08-20-supply-section-audit.md`.

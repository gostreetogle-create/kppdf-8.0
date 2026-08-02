═══════════════════════════════════════════════════════════════
Z-005: EAV-слой — принять решение: принять в эксплуатацию или удалить
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Backend Engineer + Architect (Decision / Cleanup)

ЗАВИСИМОСТИ: нет. Серия: `tasks/_backlog/z-series/README.md` § Z-005.

LAYER: backend (architecture decision / possibly cleanup)

CONFLICT KEYS:
backend/src/common/eav/eav.service.ts;backend/src/modules/entity-attribute-value/*;backend/src/modules/attribute-definition/*;backend/src/modules/product/product.service.ts;backend/src/modules/product/product.schema.ts

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ (верифицировано по коду 2026-08-02)
═══════════════════════════════════════════════════════════════

1. В `common/eav/` есть полноценная инфраструктура: `EavService`
   (`eav.service.ts:32` resolve, `:90` load, `: validate`) —
   resolve definitions, load values, validate по схеме атрибута.
   Сопутствующие модули: `attribute-definition` (CRUD определений
   атрибутов) и `entity-attribute-value` (хранение значений).

2. Реальный consumer — ОДИН: `product.service.ts:14,43,102,115`
   инжектит EavService и сохраняет/загружает dynamic attributes товара.
   Ни material, ни contract, ни order, ни counterparty — НИКТО другой
   EAV не использует.

3. Итого: целая инфраструктурнаяcapability (модуль + common-service +
   два feature-модуля + схемы) обслуживает одну сущность. Это либо
   «недозапущенная фича», либо «преждевременная абстракция».

═══════════════════════════════════════════════════════════════
ПОЧЕМУ ЭТО ВАЖНО
═══════════════════════════════════════════════════════════════

ERP-системы — классический consumer EAV: разные типы контрагентов,
разные наборы атрибутов у материалов разных категорий, кастомные поля
у заказов. EAV — правильный паттерн. Вопрос в зрелости ИСПОЛЬЗОВАНИЯ:
если он есть, но используется 1 раз — он не проверен на вариативности,
его evolution пойдёт вслепую. Нужно осознанное решение: либо расширять
применение (и тогда — покрыть тестами и упростить API), либо удалить
и заменить на typed-schema-per-category (если EAV не нужен).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Дать архитектурный answer (PO + architect). Два пути:

ПУТЬ A — ADOPT (расширить применение). Рекомендация, если в roadmap
   есть «кастомные атрибуты у материалов/контрагентов/заказов».
   Шаг A1: Провести аудит API EavService — достаточно ли оно эргономично
     для второго consumer. Если тяжёлое — упростить (hide schema-lookup
     за одним методом `applyAttributes(entityType, entityId, dto)`).
   Шаг A2: Подключить EAV ко второму модулю — лучше всего `material`
     (материалы разных категорий имеют разные наборы свойств — классика).
   Шаг A3: Покрыть e2e: material с dynamic attributes → список с
     фильтром по атрибуту → редактирование → валидация по схеме.
   Шаг A4: Зафиксировать в docs/data-model.md: какие сущности EAV-capable.

ПУТЬ B — REMOVE (признать premature). Если EAV не нужен в roadmap.
   Шаг B1: Согласовать с product-owner loss dynamic attributes у product.
   Шаг B2: Мигрировать product-attributes в typed fields product.schema.ts
     (если они реально используются) ИЛИ удалить вместе с фичей.
   Шаг B3: Удалить common/eav/, attribute-definition/, entity-attribute-value/.
   Шаг B4: Очистить module-registration в app.module.ts, тесты, docs.

ШАГ 2 — Независимо от пути: зафиксировать решение в ARCHITECTURE.md
   отдельной секцией с датой и обоснованием. Это снимает неопределённость
   для будущих TZ (агенты видят — решение принято).

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

Если ADOPT:
1. EavService имеет ≥2 consumers (product + material).
2. API EavService упрощён (одна точка входа applyAttributes).
3. e2e-spec покрывает create+filter+validate dynamic attribute.
4. docs/data-model.md обновлён (EAV-capable entities listed).
5. typecheck + Jest PASS.

Если REMOVE:
1. Удалены common/eav, attribute-definition, entity-attribute-value.
2. app.module.ts чист от их упоминаний; no orphan imports.
3. Product работает без dynamic attributes (или с typed fields).
4. typecheck + Jest PASS; нет dangling @Inject(EavService).
5. docs/data-model.md и ARCHITECTURE.md отражают удаление.

ОГРАНИЧЕНИЯ: НЕ держать статус-кво (1 consumer forever) — это худший
вариант (затраты на support без отдачи). Решение принимается и
фиксируется. НЕ вводить новый EAV-engine (MongoDB flexible schema
учитывается). migration данных — только при REMOVE и только если
product dynamic attributes реально имеют прод-данные (проверить).

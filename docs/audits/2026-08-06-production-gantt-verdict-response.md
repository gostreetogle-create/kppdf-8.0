# Audit response — Production Gantt verdict (2026-08-06)

**Источник:** внешний аудит кокпита `/production` (план-оценка).  
**Режим:** неисполняемый backlog + уже применённые hotfix’ы в коде.  
**Не создаём:** `_active/`, archive, deploy.

## Вердикт — согласны

Архитектура (Lego-shell, rail, timeline, facade, inspector, «план-оценка», без ProductionOrder/OrderTask и без drag-reschedule) — правильная база. Главные пробелы — **синхрон фильтров**, **безопасность WorkType.days**, **контекст заказа на полосах**, затем легенда/a11y/навигация.

## Уже применено в этой волне (hotfix, без полного TZ)

| Пункт аудита | Действие |
|--------------|----------|
| P0 фильтры rail ≠ bars | `applyFilteredActive` использует тот же `filterOrdersForRail` + `ctx.activeOnly/search/priority/dates`; поиск эмитит `filtersChanged` |
| P0 глобальные дни | `confirm` перед PATCH WorkType; rollback override при ошибке API; подпись «для всех заказов» |
| P1 контекст на полосах | номер заказа, изделие, status pip, группировка/разделитель, клик → inspector, title/aria с заказом |
| P1 легенда WorkType | полоса `gantt-worktype-legend` с именами видимых видов |
| P1 палитра | `WORK_TYPE_HUE_BUCKETS` (7) + `snapWorkTypeHue` |
| P1 действия | Обновить / Сброс фильтров / Сегодня / Весь горизонт; ссылка «Открыть в списке заказов»; deep links изделие/модуль уже были |
| P2 календарь | явное «календарные дни · выходные не исключаются» в UI шапки Ганта |
| ACL UX | `canEditCatalog` = admin\|manager **или** `production:write` (BE по-прежнему Roles) |

## Очередь TZ (документы, не в `_active`)

| ID | Scope | Когда |
|----|--------|------|
| **TZ-PRODUCTION-308** | Дожать фильтры/навигацию: responsive inspector, копирование номера, keyboard на rail↔bars, scroll-to-today в viewport | после стабилизации hotfix |
| **TZ-PRODUCTION-309** | Safe estimate: контракт `production:write` на BE WorkTypes; order-level override (тогда drag/resize); тесты read-only | **перед** любым resize |
| **TZ-PRODUCTION-310** | Visual + a11y: `role=grid`, Enter/Space на полосах, focus-visible, паттерны без цвета, weekend shading **только** после производственного календаря | после 308 |
| **303.1 / batch** | `GET /production/estimate` read-model (N+1) | не блокер UX |

## Явно не делать сейчас (304–307 и дальше)

drag-reschedule · auto status · check-in · ProductionSchedule SoT · резерв/отгрузка · production fact.

## Заметка для PO

Hotfix закрывает три обязательных пункта аудита («фильтры», «глобальные дни», «контекст на полосах»). Полный polish и ACL-контракт — через 308–310, без смешивания с календарём производства.

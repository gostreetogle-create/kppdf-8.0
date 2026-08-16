# PROMPT — Freebuff: Gantt «По рабочим» (read-only)

Скопируй в Freebuff **один** чат. После DONE — новый чат на следующий TZ.

## Контекст

`D:\kppdf-8.0`. PO: вид Ганта по рабочим. Auto-assign / ship templates — **не** в этом чате.

## Задача = TZ-GANTT-401 (создай `tasks/TZ-GANTT-401-gantt-by-workers-readonly.md` если нет)

Read-only таб/переключатель «По рабочим» на `/production`.

### Делать

1. Источник баров: существующая сборка Gantt (`gantt-bar.model` / facade) — **не** менять ACTIVE filter.  
2. Группировка строк: по `workerLabel` / People×WorkType labels **уже** на барах. Без назначения → группа «Не назначен».  
3. UI toggle рядом с масштабом: «По заказам» | «По рабочим».  
4. Gates: FE tsc + production-cockpit / gantt focused tests.

### НЕ

- Новые schema fields  
- Auto-assign / PATCH worker  
- order.service.ts  
- Deploy  
- Combine / boardLane  

### Готово

Checklist `docs/agent-checklists/TZ-GANTT-401.md` → READY FOR REVIEW. Один commit. Не archive без Cursor PASS.

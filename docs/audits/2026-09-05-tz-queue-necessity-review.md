# Ревью очереди TZ vs shared understanding (2026-09-05)

Сверка с [`PO-SHARED-UNDERSTANDING.md`](../PO-SHARED-UNDERSTANDING.md) и аудитом
[`2026-09-05-po-agent-shared-understanding-audit.md`](./2026-09-05-po-agent-shared-understanding-audit.md).

## Фильтр

Оператор NX / security факт / нет дешевле / не раздуваем продукт.

## Живая волна Freebuff — WAVE-NX-GANTT-POLISH

| TZ | Вердикт | Почему |
|----|---------|--------|
| **P1** catalog spec | **OK / DONE** | Красный full-suite мешал всем на NX; тест-only; archived `TZ-NX-REGISTRIES-CATALOG-SPEC-FIX.done.md` |
| **P2** G8 calendar + TOC | **OK** | Скрин PO + канон Ганта в PO-CANON; оператор видит календарь |
| **P3** G9 range forward | **OK** | Peer-review факт: бар уезжает за сетку при сдвиге вперёд |
| **P3b** workers read-only test | **OK (дешёво)** | Сложено в G9; не отдельная волна; сторожит реальный guard |
| **P4** S43 title wrap | **OK** | Скрин PO; витрина Данные на NX |
| **P5** G10 photo thumbs | **OK** | Честный gap L0 vs legacy; менеджер видит изделие |
| ~~P6~~ legacy Gantt delete | **СНЯТ** | Не нужен до полного cutover; PO может удалить `frontend/` целиком сам |

## Claude

| TZ | Вердикт |
|----|---------|
| ORDER-ORG-SCOPE-HARDEN (4+ методов) | **DONE** — нужный security |
| Следующий: `reserveStock` / `ship` / `cancel` / `remove` | **OK готовить** — known_limitation того же аудита; fact risk; не UI-legacy cleanup |

## Не ставить в continuous без команды PO

- Partial delete `frontend/pages/**`
- contracts / Invoice / Gantt L1+ / «следующий модуль NX» от агента
- Dual-site redirect stub «для коллег»

## Режим работы (зафиксирован)

Отчёт агента → Cursor кратко сверяет → **сразу** промпт тому же агенту (заранее из WAVE).  
Промптов нет → фраза: задачи закончили, ждём следующие ТЗ.

# Audits — kppdf-8.0

> Каталог технических аудитов проекта. Каждый аудит — это **read-only** инвентаризация / анализ / ревизия, **без переписывания production-кода**. Если по итогам аудита нужны изменения — рождаются TZ в `tasks/` (по правилам `OrchestratorKit/AGENTS.md`).

---

## Структура

```
audit/
├── README.md                          ← этот файл
├── inventory/                         ← полные инвентаризации фронт/бэк (текущее состояние)
├── architecture/                      ← архитектурные ревизии (component-graph, data-flow)
├── security/                          ← security/permissions/audit-trail ревизии
├── performance/                       ← bundle/budget/lighthouse/HTTP-latency ревизии
├── dx/                                ← developer-experience ревизии (DX, ergonomics, friction)
└── data-model/                        ← аудиты моделей данных, миграций, ER-схем
```

> ⚠️ Папки создаются **по факту появления** первого аудита этой категории — не preemptively. Сейчас существует только `inventory/`.

---

## Конвенция именования файлов

Каждый файл аудита называется:

```
<NNN>-<slug>-<YYYY-MM-DD>.md
```

| Поле | Формат | Пример |
|---|---|---|
| `NNN` | Порядковый номер в рамках КАТЕГОРИИ, 3 цифры с zero-pad | `001`, `002`, `042` |
| `slug` | kebab-case, краткое название темы | `frontend-inventory`, `softdelete-coverage`, `rbac-phase-a` |
| `YYYY-MM-DD` | Дата завершения аудита (ISO-8601) | `2026-07-27` |

Пример полного пути:
```
audit/inventory/001-frontend-inventory-2026-07-27.md
```

---

## Frontmatter каждого аудита

Каждый файл должен начинаться с YAML frontmatter (для grep-индексации):

```yaml
---
id: 001
category: inventory
title: Frontend Inventory Audit
date: 2026-07-27
author: <agent-name | human-name>
scope: <что проверено — путь / модуль / слой>
methodology: <метод: direct-grep, file-reads, browser-use, etc.>
status: FINAL | DRAFT | SUPERSEDED
supersedes: <id предыдущего аудита этой темы, если есть>
---
```

---

## Индекс аудитов

| ID | Категория | Дата | Название | Статус |
|---|---|---|---|---|
| 001 | inventory | 2026-07-27 | Frontend Inventory Audit | FINAL |

> Полный список обновляется по факту добавления нового аудита.

---

## Связь с TZ

Аудит — это **наблюдение**. Превращение наблюдения в план работ идёт через `tasks/TZ-NNN.md` по правилам `OrchestratorKit/AGENTS.md`:

1. Аудит выявляет проблемы / дубликаты / узкие места
2. По итогам аудита создаётся TZ с конкретным планом миграции / рефакторинга
3. TZ регистрируется в `OrchestratorKit/STATUS.md`
4. После DONE — TZ архивируется в `OrchestratorKit/_archive/<YYYY-MM>/TZ-NNN.done.txt`

**Пример:** audit/inventory/001 → tasks/TZ-232.md (Angular Assembly DSL master plan).

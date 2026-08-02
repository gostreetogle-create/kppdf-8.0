---
name: tz-authoring
description: >-
  Writes executable TZ specs for kppdf-8.0 local agents. Use when PO asks for a
  TZ, task spec, acceptance criteria, conflict keys, or work for Gemini/local AI.
---

# TZ Authoring (Cursor)

Пиши задачи так, чтобы локальный агент выполнил их без уточнений. Код не пиши.

Источники спеки: запрос PO, архитектурный риск, **или UX/business smell**
(дубли UI, лишние шаги, нелогичные статусы) — смотри как будущий пользователь ERP.

## Шаблон и эталон

- Скелет: `OrchestratorKit/_templates/TZ-template.txt`
- Качество эталона: `tasks/_backlog/z-series/backend/inventory/Z-001-inventory-write-transactions.md`

## Обязательные поля

1. Заголовок `TZ-ID: краткое название`
2. `РОЛЬ АГЕНТА`, `ЗАВИСИМОСТИ`, `LAYER`, `CONFLICT KEYS` (пути через `;`)
3. `ИСХОДНОЕ СОСТОЯНИЕ` — факты по коду (файлы/строки), не общие слова
4. `ЧТО ДЕЛАТЬ` — 2–7 шагов с под-шагами
5. `ИЗМЕНЯТЬ` / `НЕ ИЗМЕНЯТЬ`
6. `КРИТЕРИИ ПРИЁМКИ` — измеримые; явные `pnpm` команды для зоны
7. Указание финализации: root → `tasks/_archive/YYYY-MM/` + `GEMINI.md`; kit → TZF-00

## Split rule

- >7 шагов → несколько TZ с DEPENDENCIES
- >1 Layer-3 hot file в конфликте с параллелью → отдельные TZ или DEFER note

## Куда класть

| Место | Когда |
|---|---|
| `tasks/TZ-*.md` | PO готов выдать исполнителю сейчас |
| `tasks/_backlog/` | park / initiative (напр. z-series) |
| Индекс | новые active — строка в `tasks/README.md` |

Не дублируй уже существующий TZ: сначала `tasks/` + `_archive/2026-08/`.

## Verification block (обязателен в AC)

Укажи релевантное, например:

```text
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd backend && pnpm test -- <pattern>
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
```

## Ответ PO после написания TZ

1. Путь к файлу
2. Conflict keys (кратко)
3. Кому отдавать (backend/frontend) и deps
4. One-liner: «Прочитай `docs/AI-AGENT-GUIDE.md` и `<path>`, выполни TZ»

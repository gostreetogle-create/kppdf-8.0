# Agent context budget

## Принцип

Файл в репозитории не расходует токены сам по себе. Расход создают:

1. автоматически injected rules/AGENTS;
2. обязательное полное чтение больших файлов;
3. повтор одного канона в нескольких документах;
4. длинная история одного чата;
5. широкие поиски по worktree, dumps и архивам.

## Startup budget

### Cursor architect

Обязательно:

- auto rules;
- `docs/PO-CANON.md` для UX/приоритетов;
- `docs/TZ-AUTHORING.md` только при новой TZ;
- `docs/agent-checklists/_NOW.md` только когда нужен текущий поток;
- конкретный task/page/domain canon.

Не читать целиком: GEMINI, progress, STATUS, `_active-map`, ARCHITECTURE,
PO-DIARY history.

### Executor

Обязательно:

- `GEMINI.md`;
- один executor skill: `kppdf-executor-loop`;
- `docs/PO-CANON.md`;
- `docs/agent-checklists/_NOW.md`;
- собственные TZ + checklist;
- релевантный page/domain doc.

`OrchestratorKit/AGENTS.md` и `TZF-00.txt` читаются только для kit `TZ-NN.txt`,
не для root `tasks/TZ-*.md`.

## Лимиты live/entrypoint файлов

- `_NOW.md`: ≤120 строк.
- `PO-CANON.md`: ≤80 строк.
- Cursor/executor rule или skill: ≤100 строк.
- Wave prompt: только delta; ≤100 строк.
- Checklist status/report sections: ≤15 строк; gates ≤30.
- active-map/progress/STATUS: history, не startup.

## Ротация

- `_NOW.md` обновлять in-place.
- `_active-map.md` больше не пополнять; сохранить как историю.
- `progress.md` — одна компактная запись на закрытый TZ.
- PO session log — в `PO-DIARY.md`, читать только 3–5 релевантных записей.
- Новый чат на новый домен/волну; resume через git/task/checklist, не вставкой стенограмм.

## Workspace hygiene

Cursor indexing должен исключать:

```text
.freebuff/**
.worktrees/**
data/from-kp3/**
ruvector.db
**/__pycache__/**
**/node_modules/**
**/dist/**
**/coverage/**
```

Если `.cursorignore` нельзя создать политикой IDE, внести эти patterns через
настройки Cursor workspace indexing вручную. `.gitignore` не заменяет indexing ignore.

## Review раз в месяц

- нет вложенных copied `.cursor/rules`;
- нет более одного executor-loop skill;
- ссылки startup указывают на `_NOW` и `PO-CANON`;
- git/workspace/deploy policy не расходятся;
- live-файлы не превысили лимиты.

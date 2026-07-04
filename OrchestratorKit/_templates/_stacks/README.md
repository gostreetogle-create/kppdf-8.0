# Stack Templates — TZ-конвенции по типу проекта

> Эти шаблоны помогают PO правильно настроить **LAYER** и **CONFLICT KEYS**
> для типичных проектов. **Используй как шпаргалку при создании TZ**, не как
> копи-пасту (каждый проект уникален).

| Файл | Когда использовать | Стек |
|------|-------------------|------|
| [web-spa.md](web-spa.md) | Single-page web app (Angular, React, Vue, Svelte) | TS/CSS/HTML |
| [backend-api.md](backend-api.md) | REST/GraphQL API server (NestJS, FastAPI, Go, Spring) | Любой |
| [cli-tool.md](cli-tool.md) | Command-line утилиты (Python, Go, Rust, Node CLI) | Любой |
| mobile-app.md | (TODO) Mobile app (React Native, Flutter, Swift, Kotlin) | — |
| data-pipeline.md | (TODO) Data pipeline (Airflow, dbt, Spark) | — |

## Как использовать

1. Открой шаблон для своего стека.
2. Найди таблицу «LAYER по умолчанию» — она подсказывает, какой LAYER ставить
   в зависимости от того, какие файлы ты трогаешь.
3. Найди «CONFLICT KEYS примеры» — копируй подходящий формат, подставь свои файлы.
4. В «ШАГ 2: build/typecheck» — указаны команды для твоего стека.
5. В «Частые acceptance criteria» — типовые измеримые критерии для КРИТЕРИИ ПРИЁМКИ.

## Общие правила для всех стеков

- **LAYER 1** (только стили/документация) — до 2 параллельно.
- **LAYER 2** (новые компоненты/модули) — до 2 параллельно.
- **LAYER 3** (edit существующих файлов) — СТРОГО 1 агент.
- **LAYER 4** (manifest/lockfile) — СТРОГО 1 (ломает build).

Подробнее — в `_templates/TZF-00.txt` §ПРАВИЛА ПАРАЛЛЕЛЬНОЙ РАБОТЫ.

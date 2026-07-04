# OrchestratorKit

> 📦 **Portable orchestrator scheme** для проектов с параллельной работой ИИ-агентов.
> Скопируйте эту папку в новый проект — и у вас есть готовая система задач.

---

## 🎯 Что это

Порт-Orchestrator Scheme — это **готовая папка**, которая вставляется в корень
любого проекта и сразу даёт вам:

- **9-шаговый цикл финализации** задачи: 8 основных шагов + обязательный ШАГ 6+ проверки синхронизации (verify-status.sh) перед закрытием.
- **At-a-glance доску** статусов (`STATUS.md` файл).
- **Правила параллельности** (до 4 агентов одновременно без merge-конфликтов).
- **Авто-проверку синхронизации** (bash-скрипт `verify-status.sh`).
- **Шаблоны** для TZ-файлов и финализатора.

Когда PO говорит агенту «читай TZ-NN.txt» — агент уже знает весь flow,
потому что прочитал `AGENTS.md` и `_templates/TZF-00.txt`.

---

## 📋 Что внутри

| Файл | Назначение | Кто читает |
|------|-----------|-----------|
| [README.md](README.md) | Этот файл — обзор и как пользоваться | PO (человек) |
| [QUICKSTART.md](QUICKSTART.md) | 5 шагов от копирования до первого TZ | PO |
| [PO-HANDOFF.md](PO-HANDOFF.md) | **1-страничный quickstart** для нового пользователя kit-а (5 команд) | PO (новый) |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Частые ошибки + конкретные фиксы | PO + агент |
| [AGENTS.md](AGENTS.md) | **Полный мануал для ИИ-агента** (роль, цикл, правила, формат отчёта) | ИИ-агент |
| [STATUS.md](STATUS.md) | At-a-glance board: что в работе / готово / провалилось | PO + все агенты |
| [_templates/STATUS-template.md](_templates/STATUS-template.md) | Шаблон STATUS.md (если повредился) | PO |
| [_templates/example_tz_filled.md](_templates/example_tz_filled.md) | **Заполненный пример** реального TZ для ориентира | PO |
| [_templates/TZF-00.txt](_templates/TZF-00.txt) | Универсальный финализатор (9 шагов). **Перечитай перед ШАГ 6**. | ИИ-агент |
| [_templates/TZ-template.txt](_templates/TZ-template.txt) | Скелет нового TZ-NN.txt | PO |
| [_templates/_stacks/README.md](_templates/_stacks/README.md) | Индекс stack-специфичных шаблонов | PO |
| `kit-init.sh` | **Bootstrap**: создаёт _active/, _archive/, корневые progress.md/ARCHITECTURE.md + auto-generates `STACK.md` (идемпотентен) | PO (один раз) |
| `kit-stack.sh` | **Auto-detect stack → STACK.md**: сканирует manifests (package.json/requirements.txt/go.mod/Cargo.toml/pyproject.toml/pom.xml) и рендерит проектно-специфичный STACK.md из `_templates/STACK-template.md` | PO (при смене стека) |
| `make-tz.sh` | **1-line TZ generator**: scaffold + STATUS.md update + инструкция для handoff | PO (перед каждой задачей) |
| `auto-archive.sh` | **1-line финализация**: archive + lock file + STATUS update + verify-status | Агент (на ШАГ 6) |
| `kit-doctor.sh` | **Диагностика**: парсит verify-status FAIL и выдаёт человеко-понятные советы | PO (когда что-то сломалось) |
| `kit-smoke-test.sh` | **E2E тест**: 6 шагов валидации на fake TZ-99 (clean state → make → archive) | PO (для проверки kit-а) |
| `verify-status.sh` | Bash-чекер: STATUS.md ↔ filesystem синхрон? (ASCII-only regex для Windows/Linux/macOS) | PO + агент |

> **Какую инструкцию я даю агенту?** Один ответ: «читай `OrchestratorKit/AGENTS.md`».
> Дальше агент знает весь протокол.

---

## 🚀 Как использовать (3 команды + 1 фраза)

1. Скопировать `OrchestratorKit/` в новый проект → `my-project/OrchestratorKit/`.
2. Запустить bootstrap: `bash my-project/OrchestratorKit/kit-init.sh` — создаст структуру каталогов, progress.md, ARCHITECTURE.md, сделает скрипты executable.
3. Создать первый TZ одной командой:
   ```bash
   bash my-project/OrchestratorKit/make-tz.sh "Build user auth with JWT"
   ```
   Это автоматически создаст `TZ-01.txt` + добавит строку в `STATUS.md` (⏳ READY).
4. Открыть `TZ-01.txt` и заполнить 4-5 секций (LAYER, ИСХОДНОЕ СОСТОЯНИЕ, ЧТО ДЕЛАТЬ, КРИТЕРИИ ПРИЁМКИ).
5. Передать агенту одну фразу: «читай `OrchestratorKit/AGENTS.md` и `OrchestratorKit/TZ-01.txt`».

Дальше агент сделает 8 ШАГОВ сам, запустит `auto-archive.sh TZ-01 done` и пришлёт финальный отчёт.

> **Полный cheat sheet** + частые ошибки: см. [PO-HANDOFF.md](PO-HANDOFF.md) и [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

Дальше — по QUICKSTART.

---

## 🔁 Копирование в новый проект

```bash
# В новом проекте:
cp -R /path/to/OrchestratorKit ./OrchestratorKit
```

Или вручную (через IDE/explorer).

После копирования — **одна команда bootstrap**:
```bash
bash OrchestratorKit/kit-init.sh
```

Это автоматически:
- Создаст `_active/`, `_archive/`, `.mimocode/locks/`
- Создаст `progress.md` и `ARCHITECTURE.md` в корне (если их нет)
- **Auto-detect стек** (Angular/React/NestJS/FastAPI/Go/Rust/...) + сгенерирует `STACK.md` в корне проекта
- Сделает все `.sh` executable
- Запустит `verify-status.sh` для подтверждения

> Затем для проверки: `bash OrchestratorKit/kit-smoke-test.sh` (6-шаговый E2E).

> **STACK.md перегенерация:** если стек поменялся — `bash OrchestratorKit/kit-stack.sh --force`.

---

## 🚫 Что это НЕ

- **НЕ** task tracker (типа Jira/Trello). Очень лёгкий, без UI.
- **НЕ** dependency manager (типа npm). Для библиотек — свой, для задач — этот.
- **НЕ** version control. Используйте git отдельно.
- **НЕ** agent framework. Агенты — внешние (Codebuff, Cursor, и т.д.).

---

## 🔗 Конвенции kit-а

- **TZ-номера последовательные** (01, 02, 03…). Без пропусков, без переиспользования.
- **TZ в корне kit-а** (не в подпапке) — так PO видит их сразу.
- **`_active/` и `_archive/`** — стандартные папки.
- **Outcome = DONE или FAILED**, не «in progress», не «partial».
- **Лимит 4-5 параллельных агентов** (Layer 3 = строго 1).

Подробнее — в [AGENTS.md](AGENTS.md) и [_templates/TZF-00.txt](_templates/TZF-00.txt).

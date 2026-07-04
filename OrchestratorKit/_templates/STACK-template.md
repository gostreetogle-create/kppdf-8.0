# Stack — {{PROJECT_NAME}}

> Авто-сгенерированный STACK.md на основе манифестов проекта.
> **Дата генерации:** {{GENERATED_AT}}
> **Манифесты:** {{MANIFEST_LIST}}

## Summary

{{STACK_SUMMARY}}

> 💡 Этот файл сгенерирован автоматически. Для обновления: `bash OrchestratorKit/kit-stack.sh --force`.

---

{{#IF_FRONTEND}}
## {{SECTION_FRONTEND_NUM}}. Frontend ({{FRONTEND_DIR}}/)

**Framework:** {{FRONTEND_FRAMEWORK}} {{FRONTEND_VERSION}} — {{FRONTEND_FRAMEWORK_NOTE}}
**Builder:** {{FRONTEND_BUILDER}} {{FRONTEND_BUILDER_VERSION}}
**TypeScript:** {{FRONTEND_TS_VERSION}}
**Styling:** {{FRONTEND_STYLING}} — {{FRONTEND_STYLING_NOTE}}
**Tests:** {{FRONTEND_TEST_RUNNER}} {{FRONTEND_TEST_VERSION}} — {{FRONTEND_TEST_NOTE}}
**Package manager:** {{FRONTEND_PKG_MGR}} {{FRONTEND_PKG_MGR_VERSION}} — {{FRONTEND_PKG_MGR_NOTE}}

### Структура

```
{{FRONTEND_STRUCTURE}}
```

### Скрипты

```bash
{{FRONTEND_SCRIPTS}}
```

### Архитектурные решения

{{FRONTEND_DECISIONS}}
{{/IF_FRONTEND}}

{{#IF_BACKEND}}
## {{SECTION_BACKEND_NUM}}. Backend ({{BACKEND_DIR}}/)

**Framework:** {{BACKEND_FRAMEWORK}} {{BACKEND_VERSION}} — {{BACKEND_FRAMEWORK_NOTE}}
**Database:** {{BACKEND_DB}} {{BACKEND_DB_VERSION}} — {{BACKEND_DB_NOTE}}
**Auth:** {{BACKEND_AUTH}} {{BACKEND_AUTH_VERSION}} — {{BACKEND_AUTH_NOTE}}
**Validation:** {{BACKEND_VALIDATION}} {{BACKEND_VALIDATION_VERSION}}
**TypeScript:** {{BACKEND_TS_VERSION}}
**Tests:** {{BACKEND_TEST_RUNNER}} {{BACKEND_TEST_VERSION}}
**Package manager:** {{BACKEND_PKG_MGR}} {{BACKEND_PKG_MGR_VERSION}}

### Структура

```
{{BACKEND_STRUCTURE}}
```

### Скрипты

```bash
{{BACKEND_SCRIPTS}}
```

### Архитектурные решения

{{BACKEND_DECISIONS}}
{{/IF_BACKEND}}

{{#IF_CLI}}
## {{SECTION_CLI_NUM}}. CLI

**Language:** {{CLI_LANG}} {{CLI_LANG_VERSION}}
**Framework:** {{CLI_FRAMEWORK}} {{CLI_FRAMEWORK_VERSION}}
**Builder:** {{CLI_BUILDER}} {{CLI_BUILDER_VERSION}}
**Tests:** {{CLI_TEST_RUNNER}} {{CLI_TEST_VERSION}}
**Lint:** {{CLI_LINT}} {{CLI_LINT_VERSION}}

### Структура

```
{{CLI_STRUCTURE}}
```

### Скрипты

```bash
{{CLI_SCRIPTS}}
```
{{/IF_CLI}}

{{#IF_DOCKER}}
## {{SECTION_INFRA_NUM}}. Infrastructure

### Docker services

| Service | Image / Source | Port | Notes |
|---------|----------------|------|-------|
{{DOCKER_SERVICES_TABLE}}

**Compose file:** `{{DOCKER_COMPOSE_PATH}}`

{{DOCKER_EXTRA_NOTES}}
{{/IF_DOCKER}}

## {{SECTION_CROSSCUTTING_NUM}}. Cross-cutting

- **Runtime:** {{RUNTIME}} ({{RUNTIME_VERSION}})
- **Package manager:** {{PKG_MGR}} {{PKG_MGR_VERSION}}
- **TypeScript:** {{TS_VERSION}}
- **Lint / Format:** {{LINT_TOOL}} — {{LINT_NOTE}}

---

## {{SECTION_MODULEMAP_NUM}}. Module Map

{{MODULE_MAP_INTRO}}

| Module / Page | Path | Purpose | Owner |
|---------------|------|---------|-------|
{{MODULE_MAP_TABLE}}

{{#IF_NO_MODULES_DETECTED}}
> ℹ️ **Модули не обнаружены автоматически.** Дополни таблицу вручную по мере развития проекта:
>
> - **Backend:** создавай модули в `{{BACKEND_DIR}}/src/modules/<name>/` (controller / service / dto / schemas).
> - **Frontend:** создавай страницы в `{{FRONTEND_DIR}}/src/app/pages/<name>/`.
> - После структурных изменений запусти `bash OrchestratorKit/kit-stack.sh --force` чтобы обновить таблицу.
{{/IF_NO_MODULES_DETECTED}}

---

## {{SECTION_COMMANDS_NUM}}. Quickstart

### One-liner (если есть start.sh)

```bash
{{QUICKSTART_CMDS}}
```

### Прямые команды

```bash
{{SUBSECTION_CMDS}}
```

---

## {{SECTION_DECISIONS_NUM}}. Архитектурные решения

| Решение | Статус / Дата |
|---------|---------------|
{{ARCH_DECISIONS_TABLE}}

> 💡 Заполни таблицу по мере принятия решений. Подробности и примеры — в
> `_templates/_stacks/<stack>.md` (где `<stack>` = `web-spa` / `backend-api` /
> `cli-tool` / `fullstack`).

---

## {{SECTION_TESTING_NUM}}. Testing

| Уровень | Инструмент | Покрывает |
|---------|------------|-----------|
{{TESTING_TABLE}}

---

## {{SECTION_REFS_NUM}}. Окружение

### Env vars

| Variable | Reader / Component | Default |
|----------|--------------------|---------|
{{ENV_VARS_TABLE}}

> Используй 12-factor: все секреты через env vars, не хардкодь в коде. Файл
> `.env.example` (без реальных секретов) коммить в репозиторий для онбординга.

### URLs

| URL | Назначение |
|-----|-----------|
{{URLS_TABLE}}

---

## {{SECTION_WHATSNOT_NUM}}. Что это НЕ

- **НЕ** task tracker — для этого используй `OrchestratorKit/STATUS.md` (TZ-flow).
- **НЕ** changelog / release notes — история изменений живёт в git-коммитах и тегах.
- **НЕ** API documentation — генерируется из кода (OpenAPI / Swagger / TypeDoc).
- **НЕ** dependency manifest — для этого манифесты проекта ({{MANIFEST_LIST}}).
- **НЕ** deployment manifest — для этого `{{DOCKER_COMPOSE_PATH}}` / k8s / IaC.
- **НЕ** design doc — для этого `ARCHITECTURE.md` в корне проекта.

---

_Сгенерировано из `OrchestratorKit/_templates/STACK-template.md` скриптом `kit-stack.sh`.
Обновление: `bash OrchestratorKit/kit-stack.sh --force`._

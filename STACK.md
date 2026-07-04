# Stack — kppdf-8.0

> Авто-сгенерированный STACK.md на основе манифестов проекта.
> **Дата генерации:** 2026-07-04
> **Манифесты:** 

## Summary

** ** (frontend) + ** ** (backend) + Docker Compose.

> 💡 Этот файл сгенерирован автоматически. Для обновления: `bash OrchestratorKit/kit-stack.sh --force`.

---


## 1. Frontend (frontend/)

**Framework:**   — —
**Builder:**  
**TypeScript:** 
**Styling:** Vanilla CSS — Design tokens в src/styles.css
**Tests:**   — —
**Package manager:**   — —

### Структура

```
src/
  app/
    pages/        ← routes
    services/     ← API, auth
    components/   ← UI
  assets/
  styles.css      ← global tokens
```

### Скрипты

```bash
npm start                 # dev server
npm run build             # production build
npm test                  # vitest
```

### Архитектурные решения





## 2. Backend (src/)

**Framework:**   — —
**Database:**   — —
**Auth:**   — —
**Validation:**  
**TypeScript:** 
**Tests:**  
**Package manager:**  

### Структура

```
src/
  modules/         ← по domain (auth, users, ...)
    <module>/
      <module>.controller.ts
      <module>.service.ts
      dto/
  common/          ← shared decorators, guards
  config/          ← env loader
  main.ts
```

### Скрипты

```bash
npm run start:dev       # watch mode
npm run build            # production
npm run typecheck        # tsc --noEmit
npm test                 # vitest
```

### Архитектурные решения






## 3. Infrastructure

### Docker services

| Service | Image / Source | Port | Notes |
|---------|----------------|------|-------|
| (обнаружен docker-compose; конкретные сервисы добавь вручную) | — | — | — |

**Compose file:** `docker-compose.yml`

(дополни файлы добавь вручную)


## 4. Cross-cutting

- **Runtime:** Node.js 22+ (>=22.0.0)
- **Package manager:**  
- **TypeScript:** 
- **Lint / Format:** ESLint / Prettier — format check

---

## 5. Module Map

Список модулей/страниц, обнаруженных автоматически. Дополняй вручную по мере развития проекта.

| Module / Page | Path | Purpose | Owner |
|---------------|------|---------|-------|
| (пусто) | — | — | — |



> ℹ️ **Модули не обнаружены автоматически.** Дополни таблицу вручную по мере развития проекта:
>
> - **Backend:** создавай модули в `src/src/modules/<name>/` (controller / service / dto / schemas).
> - **Frontend:** создавай страницы в `frontend/src/app/pages/<name>/`.
> - После структурных изменений запусти `bash OrchestratorKit/kit-stack.sh --force` чтобы обновить таблицу.


---

## 6. Quickstart

### One-liner (если есть start.sh)

```bash
# Запуск (если есть start.sh)
./start.sh start    # dev: docker + backend + frontend
./start.sh status   # health check
./start.sh stop     # остановить
```

### Прямые команды

```bash
npm run dev        # замените на реальный скрипт вашего проекта
npm run build      # production build
npm test           # запустить тесты

> 💡 Замените команды на актуальные из вашего package.json/requirements.txt.
>    Этот файл сгенерирован автоматически — обновите под свой стек.
```

---

## 7. Архитектурные решения

| Решение | Статус / Дата |
|---------|---------------|
| (заполни вручную после прочтения _stacks/<stack>.md) | — |

> 💡 Заполни таблицу по мере принятия решений. Подробности и примеры — в
> `_templates/_stacks/<stack>.md` (где `<stack>` = `web-spa` / `backend-api` /
> `cli-tool` / `fullstack`).

---

## 8. Testing

| Уровень | Инструмент | Покрывает |
|---------|------------|-----------|
| Unit | vitest | Сервисы, components |
| E2E | (если есть) | Full flow |

---

## 9. Окружение

### Env vars

| Variable | Reader / Component | Default |
|----------|--------------------|---------|
| (env vars) | (кто читает) | (default) |

> Используй 12-factor: все секреты через env vars, не хардкодь в коде. Файл
> `.env.example` (без реальных секретов) коммить в репозиторий для онбординга.

### URLs

| URL | Назначение |
|-----|-----------|
| (URL) | — |

---

## 10. Что это НЕ

- **НЕ** task tracker — для этого используй `OrchestratorKit/STATUS.md` (TZ-flow).
- **НЕ** changelog / release notes — история изменений живёт в git-коммитах и тегах.
- **НЕ** API documentation — генерируется из кода (OpenAPI / Swagger / TypeDoc).
- **НЕ** dependency manifest — для этого манифесты проекта ().
- **НЕ** deployment manifest — для этого `docker-compose.yml` / k8s / IaC.
- **НЕ** design doc — для этого `ARCHITECTURE.md` в корне проекта.

---

_Сгенерировано из `OrchestratorKit/_templates/STACK-template.md` скриптом `kit-stack.sh`.
Обновление: `bash OrchestratorKit/kit-stack.sh --force`._

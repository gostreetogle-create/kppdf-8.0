# Stack Template: Backend API

> Используй для **Node.js (NestJS/Express)**, **Python (FastAPI/Django)**, **Go (Gin/Echo)**, **Java (Spring Boot)**.

## Stacks

- **Node.js 22+** — NestJS 11 (рекомендую), Express, Fastify
- **Python 3.12+** — FastAPI (рекомендую), Django, Flask
- **Go 1.22+** — Gin, Echo, Chi
- **Java 21+** — Spring Boot 3

## LAYER по умолчанию

| Файл трогает | LAYER |
|---------------|-------|
| `*.md` (только документация) | **1** — до 2 параллельно |
| `tests/*_test.go` (только тесты) | **1** — до 2 параллельно |
| Новый `module/`, `controller/`, `router/` | **2** — до 2 параллельно |
| Edit существующего module/controller | **3** — СТРОГО 1 (touch API contract) |
| `package.json` / `requirements.txt` / `go.mod` | **4** — СТРОГО 1 (ломает build) |
| `migrations/*` (DB schema) | **3** — СТРОГО 1 (миграции sequential) |

## CONFLICT KEYS — примеры

```
# TZ-01 (новый module):
backend/src/modules/users/users.controller.ts
backend/src/modules/users/users.service.ts
backend/src/modules/users/users.module.ts
backend/src/modules/users/dto/create-user.dto.ts
backend/src/modules/users/schemas/user.schema.ts

# TZ-02 (edit существующего):
backend/src/modules/auth/auth.service.ts
backend/src/modules/auth/auth.controller.ts

# TZ-03 (DB schema migration):
backend/src/database/migrations/0001_create_users_table.sql
backend/src/modules/users/schemas/user.schema.ts

# TZ-04 (только тесты):
backend/src/modules/products/products.service.spec.ts
```

## ШАГ 2: build / typecheck / test команды

```bash
# Node / NestJS:
cd backend && npm run build && npm run typecheck && npm test

# Python / FastAPI:
cd backend && python -m pytest && mypy .

# Go:
cd backend && go build ./... && go test ./...

# Java / Maven:
cd backend && mvn clean package
```

## Частые acceptance criteria

1. Build exit 0.
2. Type check / lint clean.
3. Юнит-тесты passed.
4. E2E тест на новый endpoint (curl / supertest / httpx).
5. OpenAPI/Swagger сгенерирован (если есть).
6. `bash OrchestratorKit/verify-status.sh` exit 0.

## Обязательные env vars (для каждого стека)

| Стек | Vars |
|------|------|
| Node (NestJS) | `PORT`, `MONGO_URI`, `JWT_SECRET`, `REDIS_HOST`, `UPLOADS_DIR` |
| Python (FastAPI) | `DATABASE_URL`, `SECRET_KEY`, `REDIS_URL` |
| Go (Gin) | `PORT`, `DB_DSN`, `JWT_SECRET` |
| Java (Spring) | `SPRING_PROFILES_ACTIVE`, `SPRING_DATASOURCE_URL`, `JWT_SECRET` |

> Используй 12-factor: все конфиги через env vars, не хардкодь в коде.

## Рекомендуемая структура папок

```
backend/
├── src/
│   ├── modules/         ← по domain (auth, users, products, ...)
│   │   └── <module>/
│   │       ├── <module>.controller.ts
│   │       ├── <module>.service.ts
│   │       ├── dto/
│   │       └── schemas/ (для Mongoose)
│   ├── common/          ← shared decorators, guards, pipes
│   ├── config/          ← env loader
│   ├── database/        ← connection + migrations
│   ├── bootstrap/       ← seed scripts
│   └── main.ts
├── test/                ← e2e tests
└── package.json
```

## Чеклист перед ШАГ 0

- [ ] `package.json` (или эквивалент) с `scripts.build` / `scripts.test`
- [ ] Validation глобально через pipe (class-validator / pydantic / validator)
- [ ] Все секреты через env vars (не в коде!)
- [ ] `.env.example` (без реальных секретов) для onboarding
- [ ] `.gitignore` исключает `.env`, `node_modules/`, `dist/`
- [ ] Health endpoint `/api/health` для мониторинга

# TZ: build-integrity и порядок волн (frontend-nx)

> **SoT** для Cursor (Mode A) при написании TZ и для PO при ответе «можно запускать?».  
> Дополняет [`TZ-OPS-NX-TZ-QUALITY-PROTOCOL-AUDIT`](./agent-checklists/TZ-OPS-NX-TZ-QUALITY-PROTOCOL-AUDIT.md) (честность UX/PASS) **тем же принципом для сборки приложения**.  
> Инцидент: 2026-08-30 — ~2 ч недоступен `node start.mjs --nx` при формально «PASS» архивов.

---

## 1. Что сломалось (факты)

| Факт | Следствие |
|------|-----------|
| Три READ-TZ (supply / organizations / product-passports) закрыты `gates PASS` | В прод-коде остался `registries-catalog-test-mocks.ts` с `import { jest } from '@jest/globals'` → **nx build / nx serve падали** |
| Параллельно: `REGISTRY-CRUD-UNIFY` + `DOCSTUDIO-S2-SHELL` | На бумаге **разные conflict keys** (`registries/**` vs `studio/**`) |
| Ошибка в `studio-shell.page.ts` | Роняет **весь** `nx build kppdf-web` — Angular компилирует app целиком, не route |
| Gates в TZ = `tsc` / scoped tests / lint | **Не гарантировали** полную сборку и `:4201` |

**Вывод:** формальный список путей в TZ **не защищает** от коллизии «приложение не собирается».  
Любой TZ с `apps/kppdf-web/src/**` неявно делит один **implicit conflict key**: **`kppdf-web` собирается**.

---

## 2. Обязательные правила (Cursor + executor)

### 2.1 Gate сборки — всегда полный, всегда последний

Для **любого** TZ, трогающего `frontend-nx/**`:

```bash
cd frontend-nx && pnpm exec nx build kppdf-web
```

| Когда | Обязательно |
|-------|-------------|
| **Baseline до CLAIM** (preflight) | PASS — иначе STOP, сначала hotfix-TZ |
| **Перед archive / DONE** | PASS — **последняя** команда после всех правок |
| В чеклисте `## Gates (факт)` | Строка с exit code, не «tsc only» |

`pnpm exec tsc`, `vitest` по папке, `lint` — **дополнительно**, не вместо `nx build`.

Опционально перед ответом PO «можно»:

```bash
node start.mjs --nx --no-browser
# curl :4201 или browser-smoke — если TZ UI/route
```

### 2.2 Implicit conflict key

В шапке TZ с `apps/kppdf-web/src/**` добавлять:

```text
IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — полная сборка приложения (nx build kppdf-web)
```

Формальные `CONFLICT KEYS` остаются для git merge; implicit — для **очереди и параллели**.

### 2.3 Параллельность

| Ситуация | Правило |
|----------|---------|
| Два TZ оба трогают `apps/kppdf-web/src/**` | **Последовательно**, либо второй стартует только когда первый **archived + nx build green на main** |
| Нужна параллель | Каждый агент **перед уступкой** оставляет `nx build kppdf-web` зелёным; не «сохранил и ушёл» с красным build |
| Разные route, один app | Всё равно **один** build gate — не считать «разные страницы = безопасно» |

### 2.4 Размер TZ (split rule, ужесточение)

| Было | Стало |
|------|-------|
| «Unify CRUD во всех реестрах + снести constructor» одним TZ | **Серия** under-1h TZ с DEPENDENCIES; каждая заканчивается зелёным `nx build` |
| Окно «проект не собирается» | Цель: **часы**, не полдня |

Пример нарезки вместо `REGISTRY-CRUD-UNIFY` монолита:

1. `TZ-NX-REGISTRY-BUILD-HOTFIX` — убрать `jest` из prod, baseline green  
2. `TZ-NX-REGISTRY-CRUD-UNITS`  
3. `TZ-NX-REGISTRY-CRUD-ORG-SUPPLY-PASSPORT`  
4. `TZ-NX-REGISTRY-CONSTRUCTOR-REMOVE`  
5. `TZ-NX-REGISTRY-CRUD-COPY-MODULES-DOCSTUDIO`  
6. `TZ-NX-REGISTRY-BROWSER-MATRIX` — только evidence + docs  

### 2.5 Запрет test-only импортов в prod

- `jest` / `vitest` / `@jest/globals` — только `*.spec.ts`, `*-test-mocks.ts` **вне** production import graph.  
- Если мок нужен в runtime catalog — **отдельный** `*.fixtures.ts` без test runner imports; проверка: `nx build kppdf-web` ловит регрессию.

---

## 3. Ответ PO: «можно уже запускать?»

**Да** только если оба условия:

1. `tasks/_active/` **пуст** (или единственный active не трогает `kppdf-web` и build уже green).  
2. `cd frontend-nx && pnpm exec nx build kppdf-web` → **exit 0** на текущем HEAD рабочей копии.

Иначе: **«ещё нет»** — без «вроде агенты закончили» и без исключений.

Быстрая проверка Cursor:

```powershell
git -C D:\kppdf-8.0 status -sb
Get-ChildItem D:\kppdf-8.0\tasks\_active
cd D:\kppdf-8.0\frontend-nx; pnpm exec nx build kppdf-web
```

---

## 4. Мини-чеклист перед выдачей новой волны (Cursor)

- [ ] `tasks/_active/` пуст **или** новый TZ не пересекается по implicit + file conflict keys  
- [ ] Baseline: `nx build kppdf-web` green на `main`  
- [ ] Скоуп TZ закрывается за **≤1 ч** агента + зелёный build в конце  
- [ ] В AC и PROMPT: `nx build kppdf-web` **до** и **после** (последний шаг)  
- [ ] Нет параллели двух `kppdf-web` TZ без явного sequential rule в `QUEUE-LIVE.md`  
- [ ] Для UI: browser evidence (см. TZ-OPS quality protocol), не только unit tests  

---

## 5. Шаблон блока в TZ (копировать)

```markdown
## BUILD INTEGRITY (обязательно)

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

Baseline (до CLAIM):
  cd frontend-nx && pnpm exec nx build kppdf-web  → exit 0

Gates (закрытие, nx build — ПОСЛЕДНИЙ):
  cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
  cd frontend-nx && pnpm test
  cd frontend-nx && pnpm lint
  pnpm architecture:check
  cd frontend-nx && pnpm exec nx build kppdf-web  → exit 0  ← обязательно последним

Параллель: STOP если в tasks/_active/ другой TZ с kppdf-web/src/**
```

---

## 6. Связанные файлы

| Файл | Роль |
|------|------|
| [`docs/TZ-AUTHORING.md`](./TZ-AUTHORING.md) | Канон TZ §7 |
| [`tasks/PROMPT-CURSOR-TZ-ORDERING.md`](../tasks/PROMPT-CURSOR-TZ-ORDERING.md) | Промпт для Cursor при планировании очереди |
| [`docs/agent-checklists/_TEMPLATE.md`](./agent-checklists/_TEMPLATE.md) | Build gate в чеклисте |
| [`.agents/skills/tz-authoring/SKILL.md`](../.agents/skills/tz-authoring/SKILL.md) | Skill Cursor |

_При новом классе build-инцидента — дописать §1 фактами, не переписывать правила._

# TZ-CLEANUP-R2 — Очистка проекта: лишние файлы, папки, drift в документации (Round 2)

**Source:** аудит репозитория 2026-08-01 (см. `progress.md` → «TZ-CLEANUP-R2 (аудит)»).
**Предыдущий раунд:** `tasks/_archive/2026-08/TZ-CLEANUP.done.md` (DONE-PARTIAL: 24 pre-existing failures, рефакторинг `audit-roles-coverage.spec.ts`).
**Назначение:** этот TZ — следующая итерация. Фокус: forensic-аудит репозитория + drift-fix в документации. **Без mass-destructive changes** — только то, что явно не относится к проекту или расходится с реальностью.

---

## 1. Что НЕ относится к kppdf-8.0 (высокоуверенные кандидаты на удаление)

### 1.1 Папки верхнего уровня

| Кандидат | Объяснение | Действие |
|---|---|---|
| `WindowsTheme/MinimalFlat/` | Тема для Windows (Visual Studio + Terminal + reg-файл + Install.bat/Install.ps1). Это отдельный проект-оформление ОС, не часть ERP. Не упоминается ни в README, ни в ARCHITECTURE. | **Удалить папку целиком.** |
| `vendor/codebase-memory-mcp/` | Внешний MCP-инструмент для кодовой памяти. README есть, но ничего не импортируется в `backend/` или `frontend/`. | **Удалить папку целиком** (или перенести в отдельный vendor-репо, если это когда-то понадобится). |
| `.freebuff/` | Артефакты Freebuff-сессий (worktree bookkeeping, plan-файлы). Если Freebuff не предполагает git-tracking своих внутренних артефактов, добавить в `.gitignore` + удалить. | **Добавить в .gitignore + удалить.** |

### 1.2 Файлы в корне

| Кандидат | Объяснение | Действие |
|---|---|---|
| `Пимер.pdf` (546 KB) | По-видимому «Пример.pdf» с опечаткой (русская «П» вместо «Р»). Ни один документ/код не ссылается на этот файл. Не упоминается в README, ARCHITECTURE, или docs. | **Удалить** (или добавить в `.gitignore` если это легитимный пользовательский attach). |
| `tasks/p.txt`, `tasks/p2.txt` | Черновики заметок, не следуют формату `TZ-NN.md`. Не упомянуты в STATUS.md. | **Удалить** (или перенести в `tasks-archive/`). |
| `tasks/PROJECT-PASPORT.md` | Не-TZ документ в папке задач. По смыслу это паспорт проекта — должен жить в `docs/` или в корне, но НЕ среди `TZ-NN.md`. | **Переместить** в `docs/project-passport.md`. |
| `STATUS.md` (root, 100 KB) | Дублирует `OrchestratorKit/STATUS.md`. README ссылается на оба, но в проекте есть ОДИН канонический — `OrchestratorKit/`. | **Решить canonical** (см. §readme-то-что-ниже). Если root-`STATUS.md` устарел — пометить как `MIRROR` или удалить. |

### 1.3 Build-артефакты, которые не должны быть в git

Все перечисленные папки ЕСТЬ на диске, но должны быть в `.gitignore` (117 строк уже есть):

- `backend/dist/` (NestJS build output).
- `frontend/dist/` (Angular build output).
- Приложения/фронта могут иметь `.angular/` (Angular CLI cache).
- `*.tsbuildinfo` (TS incremental cache).

**Action:** проверить через `git ls-files | grep -E '(dist/|\.tsbuildinfo|\.angular/)`. Если файлы попали в commit — нужны команды `git rm --cached`. Если только на диске — проверить `.gitignore` и при необходимости дополнить.

### 1.4 Дубликаты lock-файлов

В корне обнаружены ОБА: `pnpm-lock.yaml` И `package-lock.json`. Это конфликт — два package manager-а на одном проекте. Canonical для kppdf-8.0 = **pnpm** (по README и по CI). Action: проверить `package-lock.json` в git history; если он там — удалить, добавить в `.gitignore`.

---

## 2. Рассинхроны в документации

### 2.1 README.md

| # | Что не сходится | Где | Действие |
|---|---|---|---|
| R1 | Блок `Auth: JWT (access+refresh), bcrypt, RBAC, 30+ permission keys (TZ-04)` ДУБЛИРУЕТСЯ в секции «🛠️ Под капотом» | README.md, строки под заголовком «Под капотом» | Удалить одну из двух вхождений |
| R2 | Раздел «📊 Текущий статус» утверждает `⚠️ Код приложения: не начат` | README.md | Неверно — 89 entities, 65+ entities (по data-model.md), TZ-238..258 batch. Заменить на актуальное состояние |
| R3 | TZ-диапазоны не упомянуты явно: README ссылается на TZ-19..TZ-104 как UI-диапазон, но реальный проект уже за TZ-258 | README.md | Обновить до фактического состояния (TZ-238..258 batch — RBAC) |
| R4 | «⚠️ Стек проекта: не определён» | README.md «Текущий статус» | Неверен: `backend/` имеет `package.json` + `pnpm-lock.yaml`. Заменить |

### 2.2 ARCHITECTURE.md

| # | Что не сходится | Действие |
|---|---|---|
| A1 | Секция «Frontend UI Kit (shared/ui-kit/)» упоминает путь `shared/ui-kit/`, но реальная директория — `frontend/src/app/shared/ui/` | Заменить все ссылки с `shared/ui-kit` на `shared/ui` |
| A2 | Возможные устаревшие ссылки на TZ-NN, которые уже завершены (TZ-247..258 = DONE) | Перепроверить и обновить reference-таблицы |

### 2.3 progress.md / STATUS.md

| # | Действие |
|---|---|
| P1 | `progress.md` (255 KB) — журнал. Каждая новая TZ добавляет entry. Можно рассмотреть rotation по году (entries старше 1 года → `progress-archive-YYYY.md`). Но: **out-of-scope для этого TZ** (только audit-flagged). |
| S1 | `OrchestratorKit/STATUS.md` / root-`STATUS.md` — нужно подтвердить, что ОБНОВЛЕН после текущего аудита. Уже содержит TZ-247..258 batch (подтверждено). |

---

## 3. Acceptance criteria

| # | Критерий | Verification |
|---|---|---|
| AC1 | `WindowsTheme/MinimalFlat/` полностью удалена | `ls -la WindowsTheme 2>/dev/null` returns non-zero |
| AC2 | `vendor/codebase-memory-mcp/` либо удалена, либо помечена как `.gitignore`-d | `git ls-files vendor/` returns empty |
| AC3 | `Пимер.pdf` удалён из git-tracking (если был в git) + добавлен в `.gitignore` | `git log --all -- '*.pdf' \| head` check, `grep -F 'Пимер.pdf' .gitignore` returns 0 |
| AC4 | `tasks/p.txt`, `tasks/p2.txt` либо удалены, либо перенесены в `tasks-archive/` | `ls tasks/p*.txt 2>/dev/null` returns empty (после удаления) |
| AC5 | `tasks/PROJECT-PASSPORT.md` перенесён в `docs/project-passport.md` | `test -f docs/project-passport.md` AND `! -f tasks/PROJECT-PASPORT.md` |
| AC6 | Все build-артефакты (`dist/`, `.angular/`, `*.tsbuildinfo`) НЕ в git-tracking | `git ls-files \| grep -E '(dist/\|tsbuildinfo\|\.angular/)' \| wc -l` = 0 |
| AC7 | `package-lock.json` либо удалён, либо явно в `.gitignore` | `git ls-files package-lock.json \| wc -l` = 0 OR `grep -F 'package-lock.json' .gitignore` returns 0 |
| AC8 | `.gitignore` явно исключает `WindowsTheme/`, `vendor/`, `.freebuff/`, `Пимер.pdf` | `grep -cE 'WindowsTheme\|\\.freebuff\|Пимер\\.pdf\|^\.\?vendor' .gitignore` >= 3 |
| AC9 | README.md дубль Auth-блока устранён | `grep -c 'Auth: JWT (access+refresh), bcrypt' README.md` returns 1 |
| AC10 | README.md «Текущий статус» обновлён: TZ-247..258 упоминаются, 89 entities подтверждены | `grep -cE 'TZ-24[5-8]\|TZ-257\|TZ-258' README.md` >= 4 |
| AC11 | ARCHITECTURE.md не содержит `shared/ui-kit/` ссылки | `grep -cE 'shared/ui-kit' ARCHITECTURE.md` returns 0 |
| AC12 | `progress.md` содержит entry «TZ-CLEANUP-R2 (аудит)» | `grep -F 'TZ-CLEANUP-R2' progress.md` returns 0 |
| AC13 | `OrchestratorKit/STATUS.md` синхронен с реальной FS | `bash OrchestratorKit/verify-status.sh` exit 0 |
| AC14 | Backend typecheck не сломан | `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` exit 0 |
| AC15 | Frontend typecheck не сломан | `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` exit 0 |

---

## 4. Files to modify / delete (карта изменений)

**Удалить:**
- `WindowsTheme/` (entire directory)
- `vendor/codebase-memory-mcp/` (entire directory)
- `Пимер.pdf`
- `tasks/p.txt`
- `tasks/p2.txt`
- `package-lock.json` (если действительно лишний)

**Изменить:**
- `.gitignore` — добавить строки для удалённых папок + `Пимер.pdf` + `.freebuff` (если не добавлено)
- `README.md` — убрать дубль Auth, обновить «Текущий статус»
- `ARCHITECTURE.md` — обновить references с `shared/ui-kit/` на `shared/ui/`

**Переместить:**
- `tasks/PROJECT-PASSPORT.md` → `docs/project-passport.md`
- `STATUS.md` (root, если устарел) → удалить OR пометить как deprecated

**Обновить:**
- `progress.md` (добавить «TZ-CLEANUP-R2 (аудит)» entry)
- `OrchestratorKit/STATUS.md` (sync с changes)

---

## 5. Verification gates (после реализации)

```bash
# Backend
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit     # exit 0
cd backend && pnpm exec jest --runInBand --silent 2>&1 | tail -5  # для smoke (могут быть pre-existing failures)
cd backend && pnpm run lint                                       # pre-existing failures expected

# Frontend
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit       # exit 0

# OrchestratorKit
bash ./OrchestratorKit/verify-status.sh                          # exit 0

# Repo hygiene
git ls-files | grep -E '(dist/|\.tsbuildinfo|\.angular/)' | wc -l  # 0
git status --short                                                # чисто, кроме удалённых/перемещённых
git diff --check                                                  # clean
```

---

## 6. Out of scope (явно НЕ входит в этот TZ)

- Массовое форматирование / auto-fix ESLint.
- Рефакторинг production-кода.
- Удаление dead code в `backend/src/` или `frontend/src/`.
- Замена версий библиотек / миграции.
- Любые `git push` или изменение remote.
- Замена или удаление `node_modules/`.
- Изменение формата `.freebuff` worktree-структуры (это внешний инструмент).

---

## 7. Риски

1. **Удаление `vendor/` может оказаться преждевременным** — если будущие TZ используют codebase-memory-mcp как runtime dep. Рекомендую: перед удалением проверить `grep -r 'codebase-memory\|mcp' backend/src frontend/src 2>/dev/null` ДОЛЖЕН быть пустой.
2. **`Пимер.pdf` МОЖЕТ быть легитимным** — git log покажет, добавлен ли он намеренно. Если он не отслеживался (untracked), значит лежит как «черновик» и удаление безопасно.
3. **Удаление `package-lock.json`** сломает CI, если CI использует npm. Нужно проверить `.github/workflows/ci.yml` использует ли pnpm.

---

## 8. Связанные артефакты

- `tasks/_archive/2026-08/TZ-CLEANUP.done.md` — Round 1 (DONE-PARTIAL).
- `OrchestratorKit/STATUS.md` line ~129 (roadmap) — место для нового entry.
- `progress.md` — текущий журнал.
- `.gitignore` — 117 строк, baseline.

---

**Зафиксировано:** 2026-08-01 (audit session).
**Executor:** autonomous cleanup-audit agent (Codebuff session).
**Outcome на момент создания:** READY (аудит завершён, реализация TZ — будущая сессия).

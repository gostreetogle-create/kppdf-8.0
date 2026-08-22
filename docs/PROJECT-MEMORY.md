# PROJECT-MEMORY — тонкий склад истины для агентов

> TZ-OPS-302 · docs-only · минимальный канон: `GEMINI.md` +
> `docs/PO-CANON.md` + `docs/agent-checklists/_NOW.md`

## 1. Зачем

Этот файл — **стартовый пакет агента**: где правда, что не потерять, куда идти по задаче.
Для полной ежедневной стратегии lifecycle TZ, аудитов и prompt-файлов см. `docs/PROJECT-OPERATING-STRATEGY.md`.
Читай его после CLAIM и **до** ARCHITECTURE — не нужно читать весь репозиторий, чтобы не сломать систему.
Если задача уже сделана в другом месте — не делай повторно; сверь `_NOW.md`.

## 2. Ритуал 60 секунд (каждый старт TZ)

1. Continuous executor: `D:\kppdf-8.0`/main. Explicit Cursor Isolated:
   `.worktrees/<TASK-ID>`/своя ветка. `.freebuff/worktrees/*` запрещён.
2. `git fetch origin && git merge origin/main` (или `git pull --ff-only` при чистом дереве).
3. `git status --short` — чужие незакоммиченные правки не трогать и не коммитить.
4. CLAIM: TZ → `tasks/_active/<ID>.md`, checklist по `_TEMPLATE.md` с Claim slot (`agent_id`, `claimed_at` ISO).
5. Сверь `_NOW.md` + чужие `_active` **CONFLICT KEYS** — пересечение = STOP/DEFERRED.
6. Прочитай **этот файл**, затем релевантные `page.md` / канон — и только потом правь код.
7. Перед READY/archive — заполни **Integrity slot** в checklist (см. `docs/DOCS-INTEGRITY.md`).

## 3. Где правда (таблица)

| Вопрос | Куда смотреть |
|--------|---------------|
| Онбординг / роли / запреты | `docs/AI-AGENT-GUIDE.md` |
| Общий язык домена | `docs/CONTEXT.md` |
| Индекс решений (ADR) | `docs/adr/README.md` |
| Внешние agent-skills | `docs/agents/SKILLS-MAP.md` (mattpocock plugin не ставить) |
| PO, планка качества, вкус | `docs/PO-CANON.md`; история — `PO-DIARY.md` |
| Архитектура / конвенции | `ARCHITECTURE.md` — только при нужде зоны |
| Домен сущности (схема) | `docs/data-model.md` + **живая schema** в `backend/src/modules/<x>/` (схема побеждает) |
| UI-страница | `docs/pages/<name>.page.md` |
| Готовность раздела | `docs/SECTION-READINESS.md` |
| Способности (included/absent/removed) | `docs/CAPABILITY-LEDGER.md` |
| Режим задачи / primary signal | `docs/AGENT-TASK-MODES.md` |
| Ежедневная стратегия TZ/audit/prompt | `docs/PROJECT-OPERATING-STRATEGY.md` |
| «Не забыть списки» | `docs/FEATURE-INTEGRATION-CHECKLIST.md` (FIC) |
| Очередь агентов / бронь | `docs/agent-checklists/_NOW.md` + `tasks/_active/` |
| Север продаж → цех | `docs/audits/2026-08-08-sales-to-shop-flow-canon.md` |
| Целостность docs (closeout) | `docs/DOCS-INTEGRITY.md` — протокол триггер→файлы + Integrity slot |
| Карта домен↔модули↔страницы | `docs/DOMAIN-MAP.md` — домен → BE module → route → page.md → SoT |
| Общее поле на нескольких экранах | `docs/COUPLING-MAP.md` — смысл статуса/FK; не выдумывать локальный «активный» |

## 4. Не потерять при DONE (чеклист)

- Страница/UI менялась → `docs/pages/<name>.page.md` + строка в `docs/pages/PAGE-TZ-INDEX.md`.
- Новая страница/право/модуль/MCP → FIC §A–E по типу изменения.
- Новая/снятая способность → `docs/CAPABILITY-LEDGER.md`.
- Менялся user contour (роли/доступы/раздел) → `docs/SECTION-READINESS.md`.
- Менялись границы импортов shared↔pages / cross-controller → `pnpm architecture:check`.
- Всегда: компактная запись `progress.md` + `## Executor report (auto)` в checklist +
  обновление существующей секции `_NOW.md`.
- Чужой WIP / чужие conflict keys — не stage и не коммитить (`git add <свои файлы>` поимённо).
- Archive только после зелёных gates и (если TZ требует) Cursor/PO PASS.
- Перед READY/archive — **Integrity slot** в checklist заполнен (`docs/DOCS-INTEGRITY.md`).
- Трогал статус/фильтр «активные»/FK на ≥2 экранах → строка в `docs/COUPLING-MAP.md`.

## 5. Не ломать (BAN)

- Не писать SoT молча через MCP — правки проходят через TZ + git.
- Не деплоить по FE-прихоти (`deploy.ps1` / `deploy/` — только по явной команде).
- Не работать в `.freebuff/worktrees/*`. Explicit `.worktrees/<TASK-ID>` допустим
  только для isolated branch по `docs/how-to-connect-ai.md`.
- Graphify / Neo4j / vector DB — запрещены как замена SoT (TZ-105.1).
- Не править чужие `_active` / чужие conflict keys активных TZ (SALES/DOC).

## 6. Куда идти по задаче (if/then)

- **UI-страница** → `docs/pages/<name>.page.md` + `docs/add-new-page.md`; FIC §A.
- **Новое право / роль** → FIC §B + `docs/RBAC-CONTRACT.md`; RU-метки прав.
- **Склад / остаток qty** → `StorageItem` (остаток) + movements; **не** `Material.stockQty` как SoT.
- **КП / сделки** → `docs/audits/2026-08-08-sales-to-shop-flow-canon.md` + `proposals*.page.md`; КП ≠ Order.
- **Конструктор документов / builder** → `builder*.page.md`; не трогать чужие DOC-* ключи.
- **Desktop import / MCP** → `desktop/docs/MCP.md` + journal; FIC §E.
- **Не уверен в каноне имён** → `docs/CONTEXT.md`, затем `docs/TZ-AUTHORING.md` §1.1.
- **Домен вообще** → сначала `docs/DOMAIN-MAP.md`, затем модуль в `backend/src/modules/`.
- **Статус / фильтр «активные» / канбан / freeze / FK** → `docs/COUPLING-MAP.md`, потом свой page.md. Соседний экран того же поля — обязателен.

---

*Живой файл: обновляй при смене контура знаний (новые page/docs/протоколы). Лимит: ≤140 строк.*

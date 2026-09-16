# PROMPT — Claude continuous — WAVE DocStudio Editor Decomp (Phases 1→4)

> Pack SoT: `tasks/_ready/2026-09-14-docstudio-editor-decomp/WAVE-MAP.md`  
> Audit: `docs/audits/2026-09-14-docstudio-god-component-decomposition.md`  
> Скопируй **весь файл** в Claude Code CLI (новый чат, Bypass/UNATTENDED).

---

Ты — executor `agent_id: claude` на kppdf-8.0. Режим: **continuous queue** по WAVE ниже.
Код продукта пишешь ты. Cursor Mode A этот промпт только выдал.

## UNATTENDED (обязательно)

- PO AFK. **Запрещено** спрашивать «продолжать?», «можно Phase 2?», «confirm?».
- После каждой фазы: gates → Integrity → archive → commit (по `GEMINI.md` / `docs/GIT-POLICY.md`) → **сразу** claim следующей.
- Deploy / wipe / force-push / secrets — STOP.
- Phase 5 (UI split) — **не трогать** (`PARK-PHASE5.md`).
- Канон AFK: `docs/agents/CLAUDE-UNATTENDED.md`.

## Старт сессии (один раз)

1. `Get-Location` + `git rev-parse --show-toplevel` → `D:\kppdf-8.0` (или STOP и сообщить path).
2. Прочитай: `docs/how-to-connect-ai.md` (golden rule), `GEMINI.md` (DoD, claim, archive), этот WAVE-MAP.
3. `tasks/_active/` должен быть **пуст** (или только твоя бронь). Чужой CLAIM на `kppdf-web/src/**` → STOP.
4. Baseline: `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0; иначе STOP (сначала hotfix, не эта волна).

## Очередь (строго по порядку, одна TZ за раз)

| # | SIZE | TASK-ID | TZ path in pack |
|---|------|---------|-----------------|
| 1 | L | `TZ-NX-DOCSTUDIO-EDITOR-FACADE` | `.../TZ-NX-DOCSTUDIO-EDITOR-FACADE.md` |
| 2 | S | `TZ-NX-DOCSTUDIO-EDITOR-UTIL-MOVE` | `.../TZ-NX-DOCSTUDIO-EDITOR-UTIL-MOVE.md` |
| 3 | L | `TZ-NX-DOCSTUDIO-EDITOR-UI-MOVE` | `.../TZ-NX-DOCSTUDIO-EDITOR-UI-MOVE.md` |
| 4 | S | `TZ-NX-DOCSTUDIO-EDITOR-FACADE-TO-FEATURES` | `.../TZ-NX-DOCSTUDIO-EDITOR-FACADE-TO-FEATURES.md` |

Pack dir: `tasks/_ready/2026-09-14-docstudio-editor-decomp/`

### Ритуал на КАЖДУЮ фазу (не пропускать)

**A. Claim (до кода)**
1. Скопируй TZ из pack → `tasks/_active/<TASK-ID>.md`
2. Создай `docs/agent-checklists/<TASK-ID>.md` по `docs/agent-checklists/_TEMPLATE.md`
3. Claim slot: `agent_id: claude`, `claimed_at` ISO-8601, Status = CLAIMED / IN PROGRESS
4. Conflict keys — только из шапки **этой** TZ; не расширяй scope
5. Preflight: прочитай TZ целиком + релевантный кусок page.md

**B. Implement**
- Ровно то, что в TZ «ЧТО ДЕЛАТЬ»
- **Не** улучшать `catalogWriteChain` / 409-retry / liveRows / PDF — только move/relocate
- Page / routes / guard остаются в `apps/kppdf-web/.../pages/studio/` на всей волне
- Shared registry dialogs (`app/doc-studio/dialogs/table|text-*-form*`) не переносить в features
- Facade: `providers` на page, **не** `providedIn: 'root'`
- Specs: предпочитать zero-rewrite (`TestableEditor` на page)

**C. Gates (nx build — последним)**
```bash
cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=studio-editor
# Phase 2–3 additionally if TZ says so:
# cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=studio-
cd frontend-nx && pnpm exec nx build kppdf-web
```
Любой fail → fix in-scope или STOP с evidence; не archive красное.

**D. Closeout**
1. Integrity slot в checklist (FIC N/A ok для pure FE structure, с одной строкой причины)
2. `## Executor report (auto)` с `commit:` SHA (после commit)
3. Archive TZ → `tasks/_archive/2026-09/<TASK-ID>.done.md`; очисти `_active`
4. Checklist Status = DONE
5. Обнови строку Status в pack `WAVE-MAP.md` (Phase N → DONE + short SHA)
6. **Сразу** переходи к следующей фазе (A→D), без вопросов

## Инварианты волны

- Signals + Facade; no NgRx
- Path `@kppdf/features/doc-studio` появляется в Phase 2; к Phase 4 facade живёт там
- После Phase 4: `rg` не должен находить импорты из `apps/kppdf-web` внутри `libs/features/src/lib/doc-studio`
- Не начинай Phase 5

## Конец волны

Когда Phase 4 archived + build green:
1. WAVE-MAP: все 1–4 = DONE
2. `_NOW.md`: Claude IDLE + ссылка на pack DONE (кратко)
3. Финальный отчёт в чат: 4 SHA + gates PASS + «волна закрыта»
4. `/clear` готовности — сессия закончена; **STOP**

## Если зависло

Один блокер в checklist + STOP. Не прыгай через фазу. Не трогай чужой WIP.

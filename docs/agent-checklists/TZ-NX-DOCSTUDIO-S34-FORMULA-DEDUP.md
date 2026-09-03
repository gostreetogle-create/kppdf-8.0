# TZ-NX-DOCSTUDIO-S34-FORMULA-DEDUP checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-S34-FORMULA-DEDUP.md` (removed after archive)
> Commit/push: per `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-04T00:00:00Z
- workspace: D:\kppdf-8.0\.worktrees\TZ-NX-DOCSTUDIO-S34
- team_room_claim: unavailable (no Team Room CLI in this worktree)

## Preflight

- [x] `git status` / `git branch --show-current` → worktree `D:\kppdf-8.0\.worktrees\TZ-NX-DOCSTUDIO-S34`, branch `claude/docstudio-s34`
- [x] `_NOW.md` + `tasks/_active/` read — no other CLAIM on `studio-text-properties.component.ts` / `nx build kppdf-web`
- [x] TZ read; S33 dependency already merged
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS → DONE
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-S34-FORMULA-DEDUP.md` on place (copied from `_ready`)

## Acceptance

- [x] Ровно один «Формула» control в свойствах текста (`data-test="studio-text-formula-select"` встречается один раз)
- [x] Опции: сумма столбца / НДС / итого с НДС (+ пустой «без формулы») — сохранены из живого набора `FORMULA_OPTIONS`
- [x] Вставка токена в контент работает (через `onFormulaPick` → `richText().insertContent(token)`, поведение не менялось)
- [x] Мёртвый второй control (`formulaPick` select, hardcoded tokens) и дублирующий state (`formulaPick` signal, `formulaTokens` object, `insertFormulaToken` method) удалены
- [x] `nx build kppdf-web` PASS

## Integrity slot

- [x] Тип изменения: component (frontend-nx `apps/kppdf-web`), pure UI dedup, no new surface
- [x] FIC §A–E: N/A — no new permission/module/MCP surface, no backend contract touched
- [x] page.md / PAGE-TZ-INDEX: N/A — no route/page-contract change, `docs/pages/document-studio.page.md` §3.5 already described one control
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict key (`studio-text-properties.component.ts`) соблюдён — правка только внутри одного файла
- [x] Coupling map: N/A — no shared-field/status contract changed
- [x] docs/DOCS-INTEGRITY.md: канон соблюдён

## Build integrity

- [x] Baseline `nx build kppdf-web` перед кодом — PASS (см. Gates)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` implicit conflict — только `TZ-NX-DOCSTUDIO-S34-FORMULA-DEDUP.md` в `_active`
- [x] Закрытие: `nx build kppdf-web` — последняя команда в Gates, exit 0

## Gates (факт)

```text
cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
  → PASS, exit 0

cd frontend-nx && pnpm exec nx test kppdf-web (full suite, baseline check)
  → FAIL: 2 failing (registries.catalog.spec.ts) — ПРЕДСУЩЕСТВУЮЩИЙ baseline,
    файл вне diff этого TZ, идентично документированному в S31/S32/S33
    (350 passed / 7 skipped / 359 total)
  → нет отдельного spec-файла для studio-text-properties.component.ts (не существовал
    до и после этого TZ)

cd frontend-nx && pnpm exec eslint apps/kppdf-web/src/app/pages/studio/studio-text-properties.component.ts
  → PASS, exit 0, 0 problems

cd frontend-nx && pnpm exec nx lint kppdf-web (full project, baseline check)
  → FAIL: 21 errors / 75 warnings — идентично baseline S33 (96 problems),
    включая 1 pre-existing error в этом же файле (label-has-associated-control,
    строка 111, вне места правки — существовал до этого TZ) и остальные вне diff
    (studio-blocks-canvas.component.ts, studio-properties-panel.component.ts,
    studio-table-properties.component.ts, studio-workspace-shell.component.html,
    studio-layers-panel.component.ts, studio-editor.page.ts)

pnpm architecture:check
  → PASS: "Architecture check passed (1398 files; baseline 17; resolved since baseline: 2)."

cd frontend-nx && pnpm exec nx build kppdf-web
  → PASS, exit 0 (Successfully ran target build for project kppdf-web and 4 tasks it depends on)
```

## Executor report

**Изменено:**
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-text-properties.component.ts` —
  удалён дублирующий `<select data-test="studio-text-formula-select">` (второй control
  с hardcoded `{{table.*}}` токенами и без опции «без формулы»); оставлен первый,
  построенный на `FORMULA_OPTIONS` (сумма столбца / НДС / итого с НДС + пустая опция).
  Удалён мёртвый state: `formulaPick` signal, `formulaTokens` object,
  `insertFormulaToken()` метод — использовались только удалённым вторым control.

**Known limits:** нет.

## Review handoff

- [x] Self-reviewed diff; no wave inbox review required by TZ (no CATALOG/DICT review gate referenced)

## Closeout

- [x] archive + удалить `_active`
- Status = DONE
- closed_at: 2026-09-04

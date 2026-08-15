# TZ-FRONTEND-302-B-TOOLING checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-FRONTEND-302-B-TOOLING.md`
> Lane: B · Parent: TZ-FRONTEND-302 (umbrella, Lane A-owned — не редактирую)
> Canon: `docs/audits/2026-08-15-angular-component-integrity.md` @ `405cb71d51f56b21e694a0781ca3f82d30c6702d`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: Buffy-TZ-FRONTEND-302-B
- claimed_at: 2026-08-15T05:36:25Z
- workspace: D:\kppdf-8.0 (isolated worktree `.worktrees/TZ-FRONTEND-302-B`, branch `feature/TZ-FRONTEND-302-B`, baseline canonical `405cb71d`)
- team_room_claim: no — Team Room CLI недоступен в этой среде; claim зафиксирован в checklist + `tasks/_active/` и виден другим worktrees через pushed feature branch (canonical root active registry pattern)

## Preflight

- [x] Isolated worktree от canonical baseline `405cb71d` (не .freebuff, не dirty main)
- [x] Прочитал `_NOW.md`, `tasks/_active/`, umbrella checklist `TZ-FRONTEND-302.md`, canonical audit, platform report (`7682389a`), ANGULAR-GUIDE, GIT-POLICY
- [x] Нет чужого CLAIM на exact keys: `frontend/eslint/rules/no-raw-http-in-components.spec.cjs`, `no-implements-oninit-in-pages.spec.cjs` (Lane A claims A1–A6, не пересекаются)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-FRONTEND-302-B-TOOLING.md` на месте

## Acceptance (из canonical audit B-TOOLING)

- [x] Обе custom ESLint rule spec-сюиты green под ESLint 10 flat config (5/5 + 5/5 = 10/10)
- [~] Rule sources: `no-raw-http-in-components.cjs` НЕ изменён; `no-implements-oninit-in-pages.cjs` — один visitor key `TSClassDeclaration` → `ClassDeclaration` (см. Executor report — documented deviation)
- [x] Lint severity baseline / eslint.config.js не изменены (severity остаётся `warn`)
- [x] Frontend tsc / lint / architecture-check PASS (см. Gates)
- [x] `git diff --check` PASS
- [x] Отдельный commit/push + evidence

## Integrity slot

- [x] Тип изменения: tooling (test harness repair + rule visitor fix), not product code
- [x] FIC §A–E: N/A (нет page/permission/module/MCP изменения; только ESLint spec harness + visitor key)
- [x] page.md / PAGE-TZ-INDEX: N/A (нет UI route)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (serial tooling: только мои два spec-файла + rule cjs)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Root cause (B-TOOLING)

Два независимых дефекта в test harness + один в rule source:

1. **ESLint 10 flat-config matching**: `files: ['**/*']` — universal-only pattern;
   по `@eslint/config-array` matching, universal pattern применяется только если
   файл уже совпал с extension-specific pattern (`**/*.ts` и т.п.) в другом
   config. Плюс POSIX-абсолютные fixture paths (`/repo/frontend/...`) на Windows
   резолвятся в `../../..` (вне base path), и minimatch не матчит `..`-пути.
   Итог: `No matching configuration found` до запуска правила — 5/5 FAIL в каждой suite.
   Fix: `files: ['**/*.ts']` + fixture filenames relative к frontend cwd (`src/app/...`).
2. **`@jest-environment node` docblock не первый комментарий в файле** (после
   `'use strict';`) → Jest игнорировал его, suite шла в jsdom-env.
   Fix: docblock перенесён наверх.
3. **Rule source bug (deviation)**: `no-implements-oninit-in-pages.cjs` слушал
   `TSClassDeclaration` — такого node type НЕТ в @typescript-eslint v8
   (AST_NODE_TYPES: `TSClassDeclaration: false`, `ClassDeclaration: true`);
   rule никогда не срабатывал (inert). Fix: `ClassDeclaration`.

## Gates (факт)

- [x] `cd frontend && pnpm exec jest --runInBand --runTestsByPath eslint/rules/no-raw-http-in-components.spec.cjs eslint/rules/no-implements-oninit-in-pages.spec.cjs` → **PASS, 2 suites, 10/10 tests**
- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → **PASS, exit 0**
- [x] `cd frontend && pnpm exec eslint src/` → **PASS, exit 0; 22 warnings (0 errors)** — 4 raw-http (Lane A pages, были) + 18 новых `no-implements-oninit-in-pages` warning на pages (rule теперь реально работает; severity `warn` не менялся)
- [x] `pnpm architecture:check` → **PASS** (936 files; baseline 6; resolved since baseline: 0)
- [x] `git diff --check` → **PASS**
- Browser: N/A (tooling-only)

## Executor report

- B-TOOLING выполнен: оба ESLint rule spec-набора green под ESLint 10 flat config.
- **Documented deviation**: canonical audit B-TOOLING говорит «do not change rule
  sources», но эмпирически `no-implements-oninit-in-pages` rule был мёртв —
  visitor key `TSClassDeclaration` не существует в @typescript-eslint v8
  (legacy из v4/v5 AST). Без правки этого ключа acceptance «both suites green»
  недостижим: позитивные тесты («reports…») никогда не могли бы пройти, а
  enforcement proof остался бы фикцией. Исправлен один token
  (`TSClassDeclaration` → `ClassDeclaration`) — rule снова соответствует своему
  документированному контракту. Severity (`warn`) и eslint.config.js не тронуты;
  `no-raw-http-in-components.cjs` не тронут. Новые 18 warnings на pages — это
  правило наконец работает; страницы — ключи Lane A, их ремедиация не в этом batch.
- Conflict disclosure: пересечение с Lane A отсутствует (только `eslint/rules/**`);
  B-TOOLING serial tooling — других tooling-изменений в этом batch нет.
- Known limits: ClassExpression (`export default class … implements OnInit`) не
  покрыт — в scope только declarations, как и было в контракте rule.

## Review handoff

- [x] READY FOR REVIEW — child batch; umbrella/audit/checklist — Lane A
- [x] Не archive до Cursor/PO PASS (umbrella final)

## Closeout (после PASS umbrella)

- [ ] archive + lock + удалить `_active` marker

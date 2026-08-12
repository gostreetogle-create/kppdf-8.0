# TZ-UX-316 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-UX-316.md`
> Commit/push: **YES** — WAVE-NAV-RETURN требует commit + push origin/main на каждом TZ

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: freebuff/wave-nav-return (agent-158a657202)
- claimed_at: 2026-08-12T18:20:00Z
- workspace: D:\kppdf-8.0 (freebuff worktree d300021a)
- team_room_claim: unavailable (registry не знает TZ-UX-316/317 — «Unknown task»); claim-сообщение отправлено; checklist = source of truth

## Preflight

- [x] Get-Location + git rev-parse — worktree d300021a, branch freebuff/wave-nav-return @ origin/main 5edbf444
- [x] Прочитал `_active-map.md` + `tasks/_active/` — `_active/` ПУСТ; параллельный TZ-SALES-368 в canonical worktree (page.ts + proposals-create.page.md WIP) — мои keys не пересекаются (page.ts не трогаю; md-правки аддитивные)
- [x] TZ / канон / deps прочитаны (GEMINI.md, SKILL.md, AGENTS.md, PO-DIARY §1–§4, audit nav-return, WAVE-NAV-RETURN, TZ-UX-316)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-UX-316.md` на месте

## Acceptance (из TZ)

- [x] Из Create «Редактировать шаблон» открывает canvas `/doc-constructor/builder/:id` (не список `/templates?templateId=`)
- [x] `openBuilder()` несёт `returnUrl` (текущий Create path, вкл. query id черновика если есть)
- [x] Builder «←» с валидным same-origin `returnUrl` → туда (label «← К созданию КП»)
- [x] Builder «←» без `returnUrl` → `CatalogReturnStore.navigateBackOr('/doc-constructor/templates')` (label «← Шаблоны»)
- [x] Jest: picker navigate на builder/:id + returnUrl; builder back чтит returnUrl
- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- [x] focused Jest picker + builder.page PASS — 31/31
- [x] docs: proposals-create + builder page.md (deep-link + return), НЕ переписывать gutter-канон
- [x] archive + commit/push; Deploy НЕ

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (FE nav)
- [x] FIC §A–E пройдены или N/A — FE nav only, без API/backend; DOM-поведение покрыто Jest
- [x] page.md / PAGE-TZ-INDEX обновлены (proposals-create.page.md + builder.page.md)
- [x] SECTION-READINESS обновлён или N/A — N/A (нет новых routes/sections)
- [x] Чужой WIP не в коммите; conflict keys соблюдены (picker/builder/builder.spec + 2 page.md)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS (exit 0, 0 diagnostics)
- `pnpm exec jest --testPathPattern="proposal-create-template-picker|builder.page" --no-coverage` → PASS 31/31
- changed-file ESLint → PASS; Prettier (после --write) → PASS; `git diff --check` → PASS

## Executor report

- Сделано: picker `openBuilder()` → `/builder/:id` + `returnUrl`; builder «←» чтит returnUrl / CatalogReturnStore fallback; новый picker spec (2) + builder.page spec TZ-UX-316 (4); docs 2 page.md.
- Conflict disclosure: только CONFLICT KEYS; `proposal-create.page.ts` не тронут; TZ-SALES-368 canonical WIP (page.ts + «Вывод» section md) не пересекался; gutter-канон остался 317.
- Known limits: live browser smoke return-потока — вручную после деплоя (deploy НЕ).

## Review handoff

- [ ] READY FOR REVIEW в wave inbox (если TZ требует review — TZ-UX-316 без review-гейта)
- [ ] Не archive до Cursor Verdict PASS (если TZ требует review)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-12T18:35:00Z

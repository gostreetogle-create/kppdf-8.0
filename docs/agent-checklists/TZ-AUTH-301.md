# TZ-AUTH-301 checklist

> Status: **DONE**
> Marker: archived at `tasks/_archive/2026-08/TZ-AUTH-301.done.md`; `_active/` removed
> Commit/push: required on closeout

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: `agent-d2515d7a53`
- claimed_at: `2026-08-10T22:45:00Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: `unavailable (Unknown task; checklist is source of truth)`

## Preflight

- [x] Canonical workspace checked: `D:\kppdf-8.0`, branch `main`; current isolated worktree could not checkout `main` because it is already used by the canonical worktree.
- [x] Прочитан `_active-map.md` + `tasks/_active/` — чужих активных ключей нет.
- [x] TZ / канон / deps прочитаны.
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS.
- [x] `tasks/_active/TZ-AUTH-301.md` был на месте до кода и удалён при closeout.

## Acceptance

- [x] Notice «Личный проект для обучения и тестирования» + мягкий канон-текст (без запрещённых фраз)
- [x] В notice нет: организация* / корпоратив* / сотрудник* / «несанкционированный доступ запрещён»
- [x] `index.html`: robots `noindex, nofollow`; мягкий description
- [x] Jest: `data-test="personal-project-notice"` — 4/4 PASS
- [x] page.md: notice = косметика, не access control; ссылка на `docs/ops/home-host-access.md`
- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- [x] `cd frontend && pnpm test -- login.page --runInBand` — PASS
- [x] `docs/pages/login.page.md` + `PAGE-TZ-INDEX.md` обновлены
- [x] Archive → `tasks/_archive/2026-08/TZ-AUTH-301.done.md`

## Integrity slot (до READY / archive)

- [x] Тип изменения: page
- [x] FIC §A–E: N/A — login hygiene без нового route, permission, module или MCP
- [x] page.md / PAGE-TZ-INDEX обновлены
- [x] SECTION-READINESS: N/A — login hygiene
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: `docs/DOCS-INTEGRITY.md`

## Closeout

- [x] Archive marker: `ARCHIVE_MARKER`, outcome `DONE`
- [x] Lock: `.mimocode/locks/TZ-AUTH-301-personal-project-notice.lock`
- [x] `tasks/_active/` очищен от AUTH-301
- [x] `git diff --check` — PASS
- [ ] Checkpoint в `_active-map.md` — pending canonical map update
- [ ] Commit + push `main` — pending

## Report

- Implementation and gates complete; pre-existing OrchestratorKit `verify-status.sh` reports 72 historical FWD mismatches unrelated to this TZ.

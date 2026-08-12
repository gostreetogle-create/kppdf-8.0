# TZ-SALES-366 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-SALES-366.md` (должен существовать, пока не archive)
> Commit/push: **YES** — PO явно требует commit + push origin/main (kppdf-executor-continuous)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: kppdf-8.0/freebuff (agent-adeea875e2)
- claimed_at: 2026-08-12T09:00:00Z
- workspace: D:\kppdf-8.0 (freebuff worktree d300021a)
- team_room_claim: unavailable (registry не знает TZ-SALES-366); claim-сообщение отправлено; checklist = source of truth

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → worktree = D:\kppdf-8.0\.freebuff\worktrees\d300021a-…; HEAD == origin/main == 588e7489
- [x] Прочитал `_active-map.md` + `tasks/_active/` — канон `tasks/_active/` ПУСТ, чужих CLAIM на те же keys нет
- [x] TZ / канон / deps прочитаны (GEMINI.md, SKILL.md, AGENTS.md, PO-DIARY §1–§4, TZ-SALES-366)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-SALES-366.md` на месте

## Acceptance (из TZ)

- [x] «Скачать ▾ → Печать» открывает системный диалог печати (нет `Ignored call to 'print()'` из-за sandbox превью) — print() во временном родительском iframe (модалки разрешены)
- [x] Превью iframe по-прежнему `sandbox="allow-same-origin"` без scripts — закреплено Jest
- [x] КП с 2+ листами: в печати видны все страницы превью — полный build HTML в srcdoc temp-кадра
- [x] PDF и Архив не регрессируют (меню на месте; PDF путь не тронут в diff)
- [x] FE tsc + focused Jest по template-center / proposal-create print path — 42/42 PASS
- [x] page.md обновлён одной честной строкой

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: module (FE print path)
- [x] FIC §A–E пройдены или N/A с причиной одной строкой — FE print-only, без API/backend/permissions; FIC применим поверхностно (DOM-взаимодействие print покрыто Jest)
- [x] page.md / PAGE-TZ-INDEX обновлены (proposals-create.page.md — одна строка TZ-366)
- [x] SECTION-READINESS обновлён или N/A — N/A (нет новых routes/sections)
- [x] Чужой WIP не в коммите; conflict keys соблюдены (только template-center.component.ts/.spec.ts + page.md)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS (exit 0, 0 diagnostics)
- `cd frontend && pnpm exec jest --testPathPattern="proposal-create-template-center|proposal-create.page" --no-coverage` → PASS 42/42 (2 suites: template-center 5/5, page 37/37)
- changed-file ESLint → PASS; Prettier code style → PASS; `git diff --check` → PASS
- `git diff` без `proposal-create.page.ts`, `quotation-output*`, puppeteer, Desktop

## Executor report

- Сделано: `printPreview()` больше не печатает из sandbox-превью — временный родительский iframe печати с тем же build HTML всех листов + печатный CSS; превью-лента осталась `sandbox="allow-same-origin"` без scripts; `#previewFrame` viewChild удалён; новый spec (5 тестов); page.md — строка TZ-366.
- Conflict disclosure: только CONFLICT KEYS (template-center.component.ts/.spec.ts + page.md); `proposal-create.page.ts` не правился (вызов printPreview и toast остались); PDF/Архив/puppeteer/Desktop/table-editor не тронуты.
- Known limits: нативный диалог печати в headless-сессии не открыть — print-путь покрыт Jest (temp frame + srcdoc + print() + удаление); live smoke «Все КП → ?action=print» — вручную после деплоя (deploy НЕ).

## Review handoff

- [ ] READY FOR REVIEW в wave inbox (если TZ требует review — TZ-366 не требует Cursor verdict, closeout сам)
- [ ] Не archive до Cursor Verdict PASS (если TZ требует review)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-12T10:10:00Z

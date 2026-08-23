# TZ-UI-ROI-520 checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-UI-ROI-520.md` (должен существовать, пока не archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-08-23T07:23:37+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на `docs/qa/keyboard-only-pass.md` или `docs/audits/2026-08-23-ui-war-room-program.md` (active: TZ-UI-WR-504, TZ-UI-WR-510, TZ-UX-FORM-310/311/313 — другие файлы)
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-UI-ROI-520.md` на месте

## Acceptance

- [x] `docs/qa/keyboard-only-pass.md` создан: правило (только Tab/Shift+Tab/Enter/Space/Esc), три сценария A (/desk), B (КП create), C (каталог фильтр/dialog) с колонкой PASS/FAIL + стыд
- [x] Итоговая секция для списка FAIL → ссылки на successor TZ (не чинить в этом TZ)
- [x] Одна строка в war-room Post-WR (`docs/audits/2026-08-23-ui-war-room-program.md`): «чеклист = docs/qa/keyboard-only-pass.md»
- [x] Proof: файл существует; PO run status зафиксирован как pending

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: docs-only
- [x] FIC §A–E: N/A — docs-only, нет product-кода
- [x] page.md / PAGE-TZ-INDEX обновлены — N/A (QA-чеклист не описывает поведение страницы, ссылка не требуется по TZ)
- [x] SECTION-READINESS обновлён — N/A (не трогал readiness статус)
- [x] Чужой WIP не в коммите; conflict keys соблюдены (только 2 файла из CONFLICT KEYS + новый checklist/active marker)
- [x] Coupling map: N/A (не трогал общее поле/статус)
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён (docs-only, без code gates)

## Gates (факт)

- `git diff --check` на новые файлы этого TZ (`docs/qa/keyboard-only-pass.md`,
  `docs/agent-checklists/TZ-UI-ROI-520.md`, `tasks/_active/TZ-UI-ROI-520.md`) → PASS
  (проверено grep на trailing whitespace/tabs — 0 совпадений; untracked-файлы `git diff`
  не показывает без `git add`, staging не делался).
- `git diff --check -- docs/audits/2026-08-23-ui-war-room-program.md` — репортит
  trailing-whitespace на строках Post-WR ROI (2–4), но это **pre-existing** markdown
  hard-line-break (`  ` в конце строки) — секция уже была в рабочем дереве (unstaged,
  вне этой TZ) до claim; моя правка — только вставленная строка «Чеклист: …», сама
  чистая по этому же grep.
- Docs-only задача: FE/BE typecheck/tests/lint не запускались (не затронуты, разрешено по `GEMINI.md` §Проверки)

## Executor report

- Создан `docs/qa/keyboard-only-pass.md` — правило keyboard-only + 3 сценария (desk flyout, КП create flyout, каталог filter/dialog) с колонкой PASS/FAIL/стыд + итоговый раздел FAIL→successor TZ.
- В `docs/audits/2026-08-23-ui-war-room-program.md` секция «Post-WR ROI» пункт 1 дополнен явной ссылкой на новый файл.
- Frontend/backend не тронуты; Playwright e2e не писался; WebSocket/dirty-close не в scope (ROI-523).
- Conflict disclosure: правки только в двух файлах из CONFLICT KEYS + служебные task/checklist/archive файлы.
- `docs/agent-checklists/_NOW.md` **намеренно не тронут** — не входит в CONFLICT KEYS этой TZ, а файл активно правится другими агентами (Freebuff wave) прямо сейчас; синхронизация статуса туда — отдельная запись при следующей правке этого файла её автором, не входит в scope 520.

## Review handoff

- [x] Docs-only TZ, review волна не требуется (TZ не указывает wave inbox)
- [x] Archive разрешён без внешнего Cursor Verdict (докс-скрайб роль, TZ не требует review gate)

## Closeout (после PASS)

- [x] archive + удалить `_active` (source TZ + marker); `_NOW.md` не в CONFLICT KEYS — не трогался
- [x] Status = DONE
- closed_at: 2026-08-23

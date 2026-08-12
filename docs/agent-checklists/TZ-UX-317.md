# TZ-UX-317 checklist

> Status: **CLAIMED / IN PROGRESS** (после 316)
> Marker: `tasks/_active/TZ-UX-317.md`
> Commit/push: **YES** — WAVE-NAV-RETURN требует commit + push origin/main на каждом TZ

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: freebuff/wave-nav-return (agent-158a657202)
- claimed_at: 2026-08-12T18:20:00Z
- workspace: D:\kppdf-8.0 (freebuff worktree d300021a)
- team_room_claim: unavailable (registry не знает TZ-UX-316/317); claim-сообщение отправлено; checklist = source of truth

## Preflight

- [x] Прочитал `_active-map.md` + `tasks/_active/` — `_active/` ПУСТ
- [x] TZ / канон / deps прочитаны (TZ-UX-317, audit nav-return-gutters, page-chrome.md)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-UX-317.md` на месте

## Acceptance (из TZ)

- [ ] Store SPA history (новый `app-history.store.ts` на Router events; CatalogReturnStore API не ломать)
- [ ] В `app-layout`: кнопки ← / → в **левом** gutter (и правом) вне max-width контента; Paper & Ink; micro ≥11px; `data-test="app-nav-back"|"app-nav-forward"`
- [ ] ← = history back если можно, иначе disabled; → = forward если можно, иначе disabled (глобальная кнопка НЕ прыгает на произвольный fallback)
- [ ] Не перекрывать Create КП studio rails и builder palette; на `<md` компактно/скрыть без сдвига A4
- [ ] page-chrome.md: убрать запрет «глобальных ←→ нет»; описать gutters + приоритет returnUrl vs history
- [ ] Layout spec PASS (кнопки видны на wide, disabled корректно; после Create→builder глобальный ← тоже ведёт назад)
- [ ] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- [ ] archive + commit/push; Deploy НЕ

## Integrity slot (до READY / archive)

- [ ] Тип изменения определён: module (layout + shared nav)
- [ ] FIC §A–E пройдены или N/A с причиной одной строкой
- [ ] page.md / PAGE-TZ-INDEX обновлены (page-chrome.md)
- [ ] SECTION-READINESS обновлён или N/A
- [ ] Чужой WIP не в коммите; conflict keys соблюдены (app-layout + spec + app-history.store + page-chrome + audit)
- [ ] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- (заполнить после прогона)

## Executor report

- (заполнить)

## Review handoff

- [ ] READY FOR REVIEW в wave inbox (если TZ требует review — TZ-UX-317 без review-гейта)
- [ ] Не archive до Cursor Verdict PASS (если TZ требует review)

## Closeout (после PASS)

- [ ] archive + lock + progress + удалить `_active`
- [ ] Status = DONE
- closed_at: _(ISO)_

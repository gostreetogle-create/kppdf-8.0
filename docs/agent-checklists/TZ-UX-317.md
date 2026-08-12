# TZ-UX-317 checklist

> Status: **DONE**
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

- [x] Store SPA history (новый `app-history.store.ts` на Router events; CatalogReturnStore API не ломать)
- [x] В `app-layout`: кнопки ← / → в **левом** gutter (и правом) вне max-width контента; Paper & Ink; micro ≥11px; `data-test="app-nav-back"|"app-nav-forward"`
- [x] ← = history back если можно, иначе disabled; → = forward если можно, иначе disabled (глобальная кнопка НЕ прыгает на произвольный fallback)
- [x] Не перекрывать Create КП studio rails и builder palette (≥1680px только в полях); на узких — скрыто, A4 не сдвинут
- [x] page-chrome.md: убрать запрет «глобальных ←→ нет»; описать gutters + приоритет returnUrl vs history
- [x] Layout spec PASS (кнопки видны на wide, disabled корректно; после Create→builder глобальный ← тоже ведёт назад — cover в app-history.store.spec)
- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- [x] archive + commit/push; Deploy НЕ

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: module (layout + shared nav)
- [x] FIC §A–E пройдены или N/A — FE nav only, без API/backend; поведение покрыто Jest
- [x] page.md / PAGE-TZ-INDEX обновлены (page-chrome.md)
- [x] SECTION-READINESS обновлён или N/A — N/A (нет новых routes/sections)
- [x] Чужой WIP не в коммите; conflict keys соблюдены (app-layout + spec + app-history.store + page-chrome + audit)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS (exit 0, 0 diagnostics)
- `pnpm exec jest --testPathPattern="app-layout|app-history|catalog-return|proposal-create-template-picker|builder.page"` → PASS 57/57
  (layout 4/4, history store 6/6, nav-order, catalog-return, picker 2/2, builder.page 29/29)
- changed-file ESLint → PASS; Prettier (после --write) → PASS; `git diff --check` → PASS

## Executor report

- Сделано: AppHistoryStore (стек Router events, Location.back/forward, replaceUrl-dedupe, /login excluded); gutters ←→ в app-layout (≥1680px, disabled без истории); 2 новых spec; page-chrome.md + audit canon.
- Conflict disclosure: только CONFLICT KEYS; catalog-return.util.ts не изменялся (импорт normalizeCatalogUrl); Desktop/PDF/puppeteer не тронуты; Create studio logic не тронута.
- Known limits: live visual smoke gutters (≥1680px) — вручную после деплоя; ширина вхождения 1680px выбрана по геометрии полей (1400+2×64), при желании PO порог можно тоньше.

## Review handoff

- [ ] READY FOR REVIEW в wave inbox (если TZ требует review — TZ-UX-317 без review-гейта)
- [ ] Не archive до Cursor Verdict PASS (если TZ требует review)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-12T19:10:00Z

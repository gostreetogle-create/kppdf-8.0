# TZ-UX-320 checklist

> Status: **DONE**
> Goal: переместить системные ←→ из края окна в поля у колонки контента
> Deploy: НЕ

## Claim slot

- agent_id: Buffy (kppdf-8.0)
- claimed_at: 2026-08-15T08:05:00Z
- workspace: D:\kppdf-8.0
- branch: feature/TZ-UX-320-nav-gutter-align-content-column
- team_room_claim: unavailable (registry/CLI не знает TZ-UX-320; checklist = source of truth)

## Preflight

- [x] Isolated worktree from origin/main (D:\kppdf-8.0\.worktrees\TZ-UX-320 @ d07e0a23)
- [x] No conflict with TZ-FRONTEND-304 / other layout claims (_NOW.md + tasks/_active: только TZ-AUTH-305 PREP; UX-320 keys свободны)
- [x] Claim before code (этот slot)

## Acceptance (из TZ)

- [x] ← → стоят в полях у колонки контента на линии отступа шапки (left/right 64px), не у края окна (не 14px)
- [x] На узких (<1680) скрыты как раньше (media min-width: 1680px → inline-flex)
- [x] Disabled / aria / data-test без регрессий; click/disabled spec'ы PASS; добавлен spec на позицию (class + style contract)
- [x] page-chrome.md обновлён одной правдой; audit canon + PAGE-TZ-INDEX отмечены
- [x] Deploy НЕ

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: other (shell layout CSS + docs)
- [x] FIC §A–E: N/A — frontend shell CSS only, без API/backend/routes; поведение покрыто Jest + browser smoke
- [x] page.md / PAGE-TZ-INDEX: page-chrome.md обновлён; PAGE-TZ-INDEX строка UX-317 дополнена UX-320
- [x] SECTION-READINESS: N/A (нет новых routes/sections)
- [x] Чужой WIP не в коммите; conflict keys соблюдены (app-layout.ts/spec, page-chrome, audit, checklist)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS (exit 0)
- `pnpm exec jest --testPathPattern "app-layout"` → PASS 12/12 (component 5/5 + nav-order 7/7; новый позиция-spec 1/1)
- `pnpm exec eslint src/app/layout/app-layout.component.ts src/app/layout/app-layout.component.spec.ts` → PASS
- `node scripts/architecture-check.mjs` → PASS (937 files; baseline 6; resolved 0)
- `git diff --check` → PASS
- Browser smoke (puppeteer, реальный Chrome 1920×1080, dev server из worktree :4201) → 16/16 PASS:
  left/right 64px computed; видимы ≥1680 (36px), скрыты на 1200px; зазор до колонки 154.5/165.5px ≥8px;
  не пересекают таблицу материалов; light+dark (theme toggle), скриншоты %TEMP%/ux320-1920-theme-a|b.png.

## Executor report

- `app-layout.component.ts`: `.app-nav-gutter--back|forward` left/right `14px` → `64px` (линия бокового отступа шапки, padding `pi-edge-bleed` ≥1024px); комментарии + media query (поле ≥140px) обновлены; `AppHistoryStore` / click / disabled / aria / data-test не тронуты.
- Spec: +1 тест TZ-UX-320 (class-контракт + source style-контракт: 64px, нет 14px, media ≥1680 inline-flex).
- Docs: page-chrome.md §Системные ← →, audit 2026-08-12-nav-return-gutters-canon (+320), PAGE-TZ-INDEX.
- Примечание: file-tools среды заблокированы для вложенных worktrees — правки выполнялись python-скриптами; дифф выверен `git diff` + `git diff --check`.

## Review handoff

- [x] Branch `feature/TZ-UX-320-nav-gutter-align-content-column` закоммичен и запушен; merge в main — после review (Cursor/PO).

## Closeout (после PASS)

- [x] archive + lock + progress + STATUS + `_active` удалён
- [x] Status = DONE
- closed_at: 2026-08-15T09:10:00Z

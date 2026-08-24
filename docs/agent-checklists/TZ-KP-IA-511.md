# TZ-KP-IA-511 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-KP-IA-511.md` (archived; active marker removed)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-08-24T01:30:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Freebuff standalone)

## Preflight

- [x] `git status`, branch `main`, `git pull --ff-only` выполнены
- [x] `_NOW.md` и `tasks/_active/` проверены; TZ-KP-BIND-512 имеет другие keys
- [x] TZ и IA-510 прочитаны
- [x] Claim slot заполнен до product-кода
- [x] Запрещённые файлы registry/data-field-picker/document-template.service.ts не трогаются

## Acceptance

- [x] Right rail: params → money → deadlines → table → terms
- [x] Output отсутствует в right rail; ribbon сохранён
- [x] Inspector mode params/money/deadlines разделён
- [x] Recipient summary/CTA живёт только в left recipient panel
- [x] Все поля используют существующий draft binding/autosave
- [x] F5 hydration сохранена
- [x] Focused Jest PASS

## Integrity slot

- [x] Тип: page/UI change
- [x] FIC §A–E: N/A (существующая page, без новой capability/route)
- [x] page.md / PAGE-TZ-INDEX: уже обновлены IA-510, сверка без изменения смысла
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не трогался
- [x] Coupling map: N/A (существующие Quotation fields, write-path не меняется)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `cd frontend && pnpm exec jest --testPathPattern="proposal-workspace|proposal-create-inspector|proposal-create-recipient" --no-coverage` → PASS, 97/97
- `cd frontend && pnpm exec eslint src/app/pages/commercial/proposals/workspace src/app/pages/commercial/proposals/proposal-create-inspector.component.ts src/app/pages/commercial/proposals/proposal-create-recipient.component.ts` → PASS
- `pnpm architecture:check` → FAIL, 2 pre-existing violations outside scope (`materials` imports organizations page; `supply` imports materials page)
- `git diff --check` → pre-existing CRLF/trailing whitespace in чужом `progress.md` WIP; no TZ-owned docs staged
- Static grep → PASS: no output rail registration or output panel in proposal FE; ribbon handlers remain

## Executor report

- Right rail теперь регистрирует params/money/deadlines/table/terms с CircleDollarSign/Clock; output удалён из SECTION_DEFS и store type.
- Inspector получил `mode`: params (document/org/sheet), money (markup/VAT/discount/estimate), deadlines (prepayment/production/delivery); recipient loading/CTA удалены из inspector.
- Workspace сохраняет единый `draft.onInspectorState` write-path и ribbon print/PDF/more.
- Чужие registry/data-field-picker/document-template.service.ts и остальные чужие WIP не трогались.

## Review handoff

- [x] READY FOR REVIEW
- [x] Acceptance/tests complete; architecture failure disclosed as pre-existing

## Closeout

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-24T02:20:00+03:00

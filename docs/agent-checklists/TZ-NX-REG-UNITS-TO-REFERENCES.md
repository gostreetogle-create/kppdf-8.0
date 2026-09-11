# TZ-NX-REG-UNITS-TO-REFERENCES checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZ-NX-REG-UNITS-TO-REFERENCES.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-11T13:15:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] `tasks/_active/` пусто, нет чужого CLAIM
- [x] Audit + WAVE прочитаны; `units.registry.ts` (`category: 'Каталог'`); `registries-page.spec.ts`'s category-grouping test — синтетическая фикстура, не читает реальный `units.registry.ts`, не требует правки
- [x] Claim slot заполнен
- [x] `tasks/_active/TZ-NX-REG-UNITS-TO-REFERENCES.md` на месте

## Acceptance

- [x] На `/registries` «Единицы измерения» под заголовком **Справочники**, не Каталог
- [x] materials/details/modules/products остаются в Каталоге (не тронуты)
- [x] Gates PASS

## Integrity slot

- [x] Тип изменения: 1-строчная правка grouping-строки + docs — не API/forms/BE
- [x] FIC: N/A (grouping label, не route/page)
- [x] page.md обновлён: `registries.page.md` новая секция «Master-table section grouping» + фикс стале строки Catalog matrix
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS
- `cd frontend-nx && pnpm test` → PASS 110/758
- `cd frontend-nx && pnpm exec nx lint kppdf-web` → baseline unchanged (271/38)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS

## Executor report

- Единственная правка кода — `category: 'Каталог'` → `'Справочники'` в `units.registry.ts`. `registries-page.spec.ts`'s category-grouping test uses hand-picked category strings via a `testRegistry()` fixture helper (independent of the real registry), so it needed no change — verified by reading it, not assumed.
- Docs: `registries.page.md` gained the target section map (audit §1) plus a fix to a now-stale line in the "Supply / passport mapping" matrix that still grouped units under Catalog.
- Audit closeout appended (§5) — this file was previously untracked (Cursor-authored, never committed); this is its first commit, via this TZ's own explicit conflict-key listing of it.

## Closeout (после PASS)

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-11T13:20:00Z

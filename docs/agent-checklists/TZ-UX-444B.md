# TZ-UX-444B checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-UX-444B.md`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: buffy (Freebuff executor)
- claimed_at: 2026-08-26T16:42:56Z
- workspace: D:\kppdf-8.0
- team_room_claim: yes — UX-444 A+B в `_NOW.md` LIVE (Freebuff ×2), 444B = моя половина

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — только чужой `TZ-DOC-443.md` (builder-inspector, disjoint с моими keys)
- [x] TZ / канон / deps прочитаны (TZ-UX-444B, audit §5.1+§8, material-detail эталон, BE where-used контракт)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-UX-444B.md` на месте

## Acceptance (из TZ)

- [x] `/products/:id` — секция `product-where-used` с данными API
- [x] `/modules/:id` — секция `module-where-used` с данными API
- [x] Empty/loading/error без сырого EN
- [x] Page docs обновлены
- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- [x] `cd frontend && pnpm exec jest src/app/pages/products/product-detail.page.spec.ts src/app/pages/modules/module-detail.page.spec.ts --no-coverage --runInBand` → 13/13 PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page
- [x] FIC §A–E: N/A — где-используется — read-only агрегат, write-path не менялся
- [x] page.md / PAGE-TZ-INDEX обновлены (page.md — да; PAGE-TZ-INDEX — planned-строки уже были, не мой diff)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A (новый read-only UI на существующем API)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → **PASS**
- `pnpm exec jest src/app/pages/products/product-detail.page.spec.ts src/app/pages/modules/module-detail.page.spec.ts --no-coverage --runInBand` → **13/13 PASS**
- `pnpm exec eslint` (4 файла) → **PASS**
- `prettier --write` → unchanged · `git diff --check` → clean

## Executor report

- Секции where-used (reuse API, limit 50, паттерн material) на product-detail и module-detail, над BOM.
- Specs: создан product-detail.page.spec.ts; module-detail дополнен (rows/links/empty). 13/13 PASS.
- Docs: product-detail.page.md + module-detail.page.md обновлены.
- Conflict: DOC-443 (builder-inspector) — disjoint. Чужой WIP не трогал.
- Known limit: только прямые родители из API; лимит 50 строк без пагинации (как material).

## Review handoff

- [ ] READY FOR REVIEW в wave inbox
- [ ] **Не** archive до Cursor Verdict PASS (если TZ требует review)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-26T17:00:00Z

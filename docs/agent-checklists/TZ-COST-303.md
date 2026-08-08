# TZ-COST-303 checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-08/TZ-COST-303.done.md`
> TZ: `tasks/_backlog/cost/TZ-COST-303-cost-visibility-ui.md`
> Commit/push: YES (Cursor PASS → archive)
> Deploy: **NO**
> Аудит: `docs/audits/2026-08-08-catalog-cost-pricing-hierarchy.md`
> READY FOR REVIEW: 2026-08-08T00:20:00Z
> closed_at: 2026-08-08T00:22:00Z

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: agent-3e757640b7 (composer-executor)
- claimed_at: 2026-08-08T00:08:21Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task TZ-COST-303 — sync tasks first; best-effort send OK)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_active-map.md` + `tasks/_active/` — пуст до CLAIM; нет конфликта на products/modules/BOM
- [x] TZ / канон / deps прочитаны (302 DONE; audit 2026-08-08 cost hierarchy)
- [x] Claim slot заполнен; Status = CLAIMED → READY FOR REVIEW → DONE
- [x] `tasks/_active/TZ-COST-303.md` (removed at archive)

## Acceptance

- [x] Modules list: колонка «Себест.» = «см. карточку» (нет batch preview; detail = 302)
- [x] Product list/detail: `costPrice` рядом с `listPrice` (Себест. / Прайс)
- [x] BOM inspector: вклад строки (материал price×qty; модуль preview×qty) read-only
- [x] НЕ ручная цена модуля; не путать с RAL/kind
- [x] `npx tsc -p tsconfig.app.json --noEmit` FE PASS
- [x] Ручной сценарий задокументирован ниже
- [x] Cursor PASS перед archive

## Gates (факт)

- [x] `npx tsc -p tsconfig.app.json --noEmit` (frontend) → **PASS**
- [x] `npx jest product-bom-panel.component.spec.ts` → **4/4 PASS**

## Manual scenario

1. Каталог → Модули: колонка «Себест.» = «см. карточку» (`data-test=module-list-cost-hint`).
2. Карточка модуля: блок cost-preview (302) виден.
3. Каталог → Изделия: колонки Прайс + Себест.; grid — Прайс + «Себест. …».
4. Карточка изделия: Прайс рядом с Себест. (`product-list-price` / `product-cost-price`).
5. BOM inspector: выбрать модуль → вклад = preview×qty; материал → price×qty (`bom-line-cost`).

## Executor report

- Modules list: P0 hint (no batch endpoint from 302).
- Products list: `listPrice`→«Прайс», added `costPrice` «Себест.»; grid dual line.
- Product detail: reorder Прайс | Себест. | База | В составе.
- BOM: on-select lazy fetch MaterialsService / getCostPreview; race-safe seq.
- Docs: product-detail.page.md + ARCHITECTURE cost UI one-liner.
- Conflict disclosure: peer desktop/** and TZD-* **not staged**.
- known_limitation: module list not live rollup (batch later); nested product line cost not in inspector.

## Cursor Verdict

**PASS** (2026-08-08) — AC met; tsc+jest green; no manual module price; labels RU; archive OK.

## Review handoff

- [x] READY FOR REVIEW
- [x] Cursor Verdict PASS → archive

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-08T00:22:00Z

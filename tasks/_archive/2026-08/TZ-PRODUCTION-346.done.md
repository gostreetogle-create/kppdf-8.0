# TZ-PRODUCTION-346.done — Gantt nest indent + level tint

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T21:44:02+03:00
closed_by: local-executor-composer (kppdf-executor-loop)
TZ: TZ-PRODUCTION-346
WAVE: WAVE-GANTT-IA-PRODUCT-MODULE (visual polish after 345)
DEP: TZ-PRODUCTION-342…345 DONE
Cursor_verdict: N/A (TZ does not require review gate)

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`)
  - tests: PASS (`pnpm exec jest --testPathPattern="gantt-bars.component.spec"` — 48/48)
  - checklist: DONE
  - progress.md: UPDATED
  - status synchronization: PASS
  - deploy: NOT RUN

## Outcome

- Label column nest indent: `GANTT_NEST_INDENT_PX=10` × depth (order|worker=0, product=1, module=2, work=3) via `data-nest-depth` + CSS on `.gantt-label-btn` only.
- Quiet oklch level washes: `gantt-level-product|module|work` (+ dark); no `!important` so meta/frames keep priority.
- Timeline bars: `data-row-kind` + washes only — no horizontal shift.
- Worker lens: module depth 2 / work depth 3 same as order tree.
- Tree logic / assembly filter (347) / BE untouched.

## Evidence

- Specs: data-nest-depth + computed paddingLeft; worker lens indent; wash tokens in host styles; frame/meta tokens still present.

## Critical files

- `frontend/src/app/pages/production/blocks/gantt-bars.component.ts`
- `frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts`
- `docs/pages/production-cockpit.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`

## Lock

`.mimocode/locks/TZ-PRODUCTION-346-gantt-nest-indent-tint.lock`

---

# Original TZ

STATUS: DONE  
РОЛЬ АГЕНТА: local executor  
ЗАВИСИМОСТИ: TZ-PRODUCTION-342…345 DONE  
LAYER: 2  
PAGES: /production  
PAGE_DOCS: production-cockpit.page.md  
CONFLICT KEYS: frontend/src/app/pages/production/blocks/gantt-bars.component.ts ; frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts

Проверено: PO smoke — после IA уровни сливаются визуально; нужны отступ вправо (~3mm / ~8–12px на уровень) + лёгкие разные светлые washes по kind (order/product/module/work).

## ЧТО ДЕЛАТЬ

1. **Indent:** label column — `padding-left` / margin по глубине: order=0, product≈10px, module≈20px, work≈30px (подогнать ~3mm step). Timeline rows без горизонтального сдвига полос (только лейблы), чтобы календарь не «плыл».
2. **Washes:** разные светлые oklch тона для product / module / work rows (и dark-theme аналоги); не кричать, стиль paper. Meta-active / group frames 339–343 не ломать (иерархия силы: meta ≥ order frame ≥ level wash).
3. Worker lens: тот же indent по module/work.
4. Specs: class/data-depth или computed padding marker. Gates FE tsc + jest gantt-bars. Deploy нет.

## НЕ ИЗМЕНЯТЬ

- Tree structure / estimate / filter assembly (347) / BE

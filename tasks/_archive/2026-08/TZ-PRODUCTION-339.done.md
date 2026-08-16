# TZ-PRODUCTION-339: Gantt — крупные ▸/▾ + явные рамки групп заказов

STATUS: DONE  
РОЛЬ АГЕНТА: local executor (GEMINI.md + kppdf-executor-loop)  
LAYER: 2  
PAGES: /production  
CONFLICT KEYS: `frontend/src/app/pages/production/blocks/gantt-bars.component.ts` ;
`frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts`

---

## Что сделано

1. **Chevron:** `.gantt-chevron` 15px / font-weight 700 / ink (не muted); hit-колонка `.gantt-expand-col` = **36px**; order + work expand; `aria-expanded` сохранён.
2. **Group frame:** при tree-expanded — `gantt-order-group-start` / mid / `-end` + data-attrs на label+timeline; inset ≥2px perimeter; gap 4px после end; light+dark; meta strip mid; meta-active сильнее group chrome.
3. **Тесты:** +2 в `gantt-bars.component.spec.ts` (chevron size/hit; two expanded start/end + 320 separation).
4. **Docs:** абзац в `production-cockpit.page.md`.

## Verification

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `cd frontend && pnpm test -- gantt-bars.component` → **42/42** PASS
- Deploy: **нет**
- Не трогали: facade / hydrate / estimate / PATCH / backend / desktop

## known_limitation

Perf hydrate = TZ-PRODUCTION-338 (отдельно). Material-карточка с тенью — не цель.

# TZ-PRODUCTION-354 — Gantt: truncated-label-peek overlay

PAGES: /production
PAGE_DOCS: production-gantt.page.md ; docs/ui-rules.md § truncated-label-peek

РОЛЬ: Frontend UI Engineer

ЗАВИСИМОСТИ: none (parallel с KP-410)

CONFLICT KEYS: `frontend/src/app/pages/production/blocks/gantt-bars.component.ts` (+ spec)

═══════════════════════════════════════════════════════════════
ПРОБЛЕМА
═══════════════════════════════════════════════════════════════

Длинные названия в левой колонке Gantt обрезаются и «bleed» на сетку.

═══════════════════════════════════════════════════════════════
РЕШЕНИЕ (канон docs/ui-rules.md)
═══════════════════════════════════════════════════════════════

Pattern **truncated-label-peek** — floating overlay badge:

**Open:** hover если `scrollWidth > clientWidth` ИЛИ cascade expand через ▸ (order → first truncated child; product/module → that row).

**Close:** mouseleave 120ms, click-outside, Escape, scroll.

**Не:** click на label (product/module click = no-op; chevron still expands).

WIP уже в рабочем дереве — **верифицируй**, дополни тестами, не переписывай с нуля.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] Spec `gantt-bars.component.spec.ts` PASS (включая peek cases)
- [ ] tsc + lint PASS
- [ ] docs/ui-rules.md + docs/AI-UI-CONTRACT.md уже описывают pattern — не дублировать, только сверка
- [ ] Не менять DnD, timeline math, assignee colors

Gates:

```bash
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
pnpm test -- gantt-bars --runInBand
pnpm lint
```

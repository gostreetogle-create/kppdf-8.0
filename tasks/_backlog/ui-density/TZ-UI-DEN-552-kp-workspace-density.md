# TZ-UI-DEN-552: KP workspace — density alignment

PAGES: /proposals/workspace
PAGE_DOCS: kp-workspace.page.md ; ui-density-canon.md

РОЛЬ АГЕНТА: Frontend UI Engineer

ЗАВИСИМОСТИ: **TZ-KP-WS-409.done**; TZ-UI-DEN-501…504

LAYER: 3

CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/workspace/**

═══════════════════════════════════════════════════════════════
STOP RULE
═══════════════════════════════════════════════════════════════

Если KP-WS-404…408 в `_active` — **DEFER**. Не править workspace параллельно feature wave.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

Apply ui-density-canon to finished workspace (not re-IA):

- Overlay panels 480px — 16px padding, hairline
- Ribbon — 13px, single gold export/confirm if applicable
- Table preview area — 12px cells
- Label/value in rails via FormField
- A4 canvas — **no reflow** (kp-workspace-geometry.md law)

Backlog polish from Studio triage (if not done in 404/405): tooltips, save badge, live total in ribbon — **only if listed in kp-workspace.page.md and ≤2h scope**; else separate backlog note.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] `KP-WORKSPACE-SMOKE.md` 10 steps PASS (PO or agent)
- [ ] proposal-workspace specs PASS
- [ ] tsc + lint PASS
- [ ] Geometry audit: A4 width unchanged (grep or spec)

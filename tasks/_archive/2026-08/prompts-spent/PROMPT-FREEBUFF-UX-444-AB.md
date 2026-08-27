# PROMPT — Freebuff ×2 · волна UX-444 (legacy patterns A+B)

> Параллель. Keys не пересекаются.  
> DOC-443 если ещё LIVE — **не** трогать его keys.  
> После A+B DONE → Cursor выдаст C+D (444C зависит от A; 444D после B/C на product-detail).

История цены = **park** `tasks/_backlog/ux-hygiene/TZ-PRICE-HIST-park.md` (гибко, не эта волна).

---

## Freebuff 1 — Status banner

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0 на main.
GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md + docs/PO-CANON.md
Перед UI: docs/ui-rules.md + docs/AI-UI-CONTRACT.md + docs/paper-and-ink.md
Контекст паттерна: docs/audits/2026-08-26-legacy-erp-ux-patterns-audit.md §5.3 и §8

CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZ-UX-444A.md + checklist по docs/agent-checklists/_TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
4) _active-map + чужие _active keys → конфликт = STOP
Затем: прочитай tasks/TZ-UX-444A-status-banner.md и выполни.
Archive только после gates PASS.
НЕ deploy / wipe. НЕ трогай product-detail / DOC-443.
```

---

## Freebuff 2 — Where-used product/module

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0 на main.
GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md + docs/PO-CANON.md
Перед UI: docs/ui-rules.md + docs/AI-UI-CONTRACT.md
Эталон UI: frontend/src/app/pages/materials/material-detail.page.ts (where-used)
Контекст: docs/audits/2026-08-26-legacy-erp-ux-patterns-audit.md §5.1 и §8

CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZ-UX-444B.md + checklist по docs/agent-checklists/_TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
4) _active-map + чужие _active keys → конфликт = STOP
Затем: прочитай tasks/TZ-UX-444B-where-used-product-module.md и выполни.
Archive только после gates PASS.
НЕ deploy / wipe. НЕ трогай order-detail / status-banner / backend.
```

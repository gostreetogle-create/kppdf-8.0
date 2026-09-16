# PROMPT — Freebuff: commit print + start.mjs diagnostics

Ты executor (`agent_id: freebuff`). `D:\kppdf-8.0` main · UNATTENDED.

### Preflight
1. Claude держит FE (`TZ-NX-ORDER-WS-META-INLINE` в `_active`) — **не трогать** `frontend-nx/**`, order-workspace, hotfix remainder TZ.
2. Print CSS уже DONE в коде + archive, но **не закоммичен** — сначала закрыть git.
3. Затем ops TZ (нет conflict с Claude).

### ШАГ 0 — commit print (обязательно)
Только эти пути (не stage чужой WIP):
- `backend/src/modules/document-render/document-render.service.ts`
- `backend/src/modules/document-render/document-render.studio-canvas.spec.ts`
- `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-PRINT-CSS-BODY-LEAK.done.md`
- `docs/agent-checklists/TZ-NX-DOCSTUDIO-PRINT-CSS-BODY-LEAK.md`
- `OrchestratorKit/.mimocode/locks/TZ-NX-DOCSTUDIO-PRINT-CSS-BODY-LEAK.lock`
- tracker `docs/agent-checklists/WAVE-PO-HOTFIX-2026-09-15.md` если правишь только строку print→DONE

Убедись: нет `tasks/_active/TZ-NX-DOCSTUDIO-PRINT-CSS-BODY-LEAK.md` (если есть — удалить, TZ уже в archive).

Commit message:
`fix(docstudio): TZ-NX-DOCSTUDIO-PRINT-CSS-BODY-LEAK — body extract after </head>`

Политика: `docs/GIT-POLICY.md` — обычный commit+push если у вас разрешён push; иначе commit local + STOP note.

### ШАГ 1 — TZ-OPS-START-DIAGNOSTICS
Спека: `tasks/_ready/2026-09-15-po-hotfix-wave/TZ-OPS-START-DIAGNOSTICS.md`  
(дубль-промпт: `tasks/_ready/PROMPT-FREEBUFF-START-DIAGNOSTICS.md` — приоритет у pack TZ)

CLAIM → fix false `frontendReused` → stage= в wait → timeout dump → docs one-liner → `node --check start.mjs` → archive → commit **только** start/docs → STOP.

Не deploy. Не product UI. Не WAVE-GANTT-DARK.

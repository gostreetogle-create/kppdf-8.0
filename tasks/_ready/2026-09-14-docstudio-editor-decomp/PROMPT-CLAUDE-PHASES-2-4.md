# PROMPT — Claude — Phases 2→4 continuous (after Phase 1 DONE)

Использовать **только** когда Phase 1 archived + `nx build kppdf-web` green.  
Три TZ подряд: UTIL-MOVE → UI-MOVE → FACADE-TO-FEATURES. После каждой — archive + green build, затем next.

---

CLAIM: для **каждой** TZ заново (active file + checklist + claim slot `agent_id: claude`).

Порядок:
1. `TZ-NX-DOCSTUDIO-EDITOR-UTIL-MOVE` из pack → `_active/`
2. После archive: `TZ-NX-DOCSTUDIO-EDITOR-UI-MOVE`
3. После archive: `TZ-NX-DOCSTUDIO-EDITOR-FACADE-TO-FEATURES`

SoT: `tasks/_ready/2026-09-14-docstudio-editor-decomp/WAVE-MAP.md` + каждый TZ в той же папке.

## Правила

- Page/routes/guard **остаются** в `apps/.../pages/studio/`
- Shared `app/doc-studio/dialogs/table|text-*-form*` **не** переносить; Phase 4 — opener на page если нужно
- Path `@kppdf/features/doc-studio` (Phase 2)
- No Phase 5 split
- No behavior changes to write queue
- Gates each TZ: tsc + relevant studio tests + `nx build kppdf-web` last

## UNATTENDED

Без «продолжать?» между фазами 2–4. После Phase 4 STOP. Не трогай PARK Phase 5.

## ОТЧЁТ

По каждому TZ — Executor report (auto) + SHA; в конце обнови статус-таблицу в WAVE-MAP (docs).

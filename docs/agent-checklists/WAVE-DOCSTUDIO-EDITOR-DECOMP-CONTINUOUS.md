# WAVE-DOCSTUDIO-EDITOR-DECOMP — continuous checklist

> Живой трекер волны. Claude обновляет после **каждой** фазы.  
> Pack: `tasks/_ready/2026-09-14-docstudio-editor-decomp/`  
> Prompt: `PROMPT-CLAUDE-WAVE-1-4-CONTINUOUS.md`

updated_at: 2026-09-14T21:50:00+03:00

## Status

| # | TASK-ID | SIZE | State | commit | notes |
|---|---------|------|-------|--------|-------|
| 1 | TZ-NX-DOCSTUDIO-EDITOR-FACADE | L | DONE | 142d66e4 | in-place facade |
| 2 | TZ-NX-DOCSTUDIO-EDITOR-UTIL-MOVE | S | PENDING | — | → features util |
| 3 | TZ-NX-DOCSTUDIO-EDITOR-UI-MOVE | L | PENDING | — | → features ui |
| 4 | TZ-NX-DOCSTUDIO-EDITOR-FACADE-TO-FEATURES | S | PENDING | — | facade → features |
| 5 | TZ-NX-DOCSTUDIO-EDITOR-UI-SPLIT | — | PARK | — | не в этой сессии |

States: `PENDING` → `CLAIMED` → `DONE` | `BLOCKED` | `DEFERRED`

## Per-phase evidence (fill on DONE)

### Phase 1
- checklist: `docs/agent-checklists/TZ-NX-DOCSTUDIO-EDITOR-FACADE.md`
- gates: tsc PASS / tests PASS (129/129 suites, 980/987, 0 fail) / nx build PASS
- archive: `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-EDITOR-FACADE.done.md` · commit 142d66e4

### Phase 2
- checklist: `docs/agent-checklists/TZ-NX-DOCSTUDIO-EDITOR-UTIL-MOVE.md`
- gates: _
- archive: _

### Phase 3
- checklist: `docs/agent-checklists/TZ-NX-DOCSTUDIO-EDITOR-UI-MOVE.md`
- gates: _
- archive: _

### Phase 4
- checklist: `docs/agent-checklists/TZ-NX-DOCSTUDIO-EDITOR-FACADE-TO-FEATURES.md`
- gates: _
- archive: _

## Wave DONE when

- [ ] Rows 1–4 = DONE + SHA
- [ ] `nx build kppdf-web` green after Phase 4
- [ ] WAVE-MAP status table updated
- [ ] Phase 5 still PARK

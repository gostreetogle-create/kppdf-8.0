═══════════════════════════════════════════════════════════════
TZ-NX-DOCSTUDIO-EDITOR-UI-SPLIT
═══════════════════════════════════════════════════════════════
SIZE L · LAYER 3 · PACK B5

RECONSTRUCTED MARKER — created late (after code was already written, not
before, per the disclosed process gap in the checklist's "Executor
report"). The original TZ spec file was lost from disk (session-resume
environment issue). Reconstructed from the surviving
`tasks/_ready/2026-09-14-docstudio-editor-decomp/PARK-PHASE5.md` draft
scope note + that pack's `WAVE-MAP.md` (confirms Phases 1–4 DONE) + B5's
own `WAVE-MAP.md` goal line (captured earlier in-session, before it was
lost): "P5 | L | TZ-NX-DOCSTUDIO-EDITOR-UI-SPLIT | PARK Phase 5:
canvas/table-properties split (now authorized)". User explicitly
confirmed "proceed with my own best-judgment split" before this work
began.

ЗАВИСИМОСТИ: TZ-NX-SHIPPING-TO-FEATURES archived
CONFLICT KEYS (inferred): frontend-nx/libs/features/src/lib/doc-studio/ui/**
IMPLICIT: nx build kppdf-web

ЧТО (from PARK-PHASE5.md): split `studio-blocks-canvas` into text/table/
image presenters; split `studio-table-properties` into columns editor /
rows editor. No public Input/Output contract change, no UX IA change.

AC (reconstructed): both existing specs green unmodified; nx build last 0.
Successor: none — last TZ in the B5 chain, STOP after.

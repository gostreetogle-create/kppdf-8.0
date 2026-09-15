═══════════════════════════════════════════════════════════════
TZ-NX-SHIPPING-TO-FEATURES
═══════════════════════════════════════════════════════════════
SIZE S · LAYER 3 · PACK B5

RECONSTRUCTED MARKER — see `tasks/_active/TZ-NX-SHIPPING-PAGE-FACADE.md`'s
sibling checklist for the full disclosure: the original TZ spec file was
lost from disk (environment issue during session resume). Reconstructed
from `WAVE-MAP.md`'s goal line, captured earlier in-session:

  "S2 | S | TZ-NX-SHIPPING-TO-FEATURES | → @kppdf/features/shipping"

ЗАВИСИМОСТИ: TZ-NX-SHIPPING-PAGE-FACADE archived
CONFLICT KEYS (inferred): frontend-nx/apps/kppdf-web/src/app/pages/shipping/** ; frontend-nx/libs/features/src/lib/shipping/** ; frontend-nx/tsconfig.base.json
IMPLICIT: nx build kppdf-web

ЧТО (reconstructed, per established pattern): move `ShippingFacade` (+
the 3 shipment dialogs, if no illegal app dependency blocks it) into
`libs/features/src/lib/shipping/`. `shipping.page.ts` stays in the app as
the lazy route host (established convention this wave).

AC (reconstructed): shipping specs green; nx build last 0.
Successor: TZ-NX-DOCSTUDIO-EDITOR-UI-SPLIT

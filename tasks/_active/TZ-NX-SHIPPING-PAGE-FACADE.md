═══════════════════════════════════════════════════════════════
TZ-NX-SHIPPING-PAGE-FACADE
═══════════════════════════════════════════════════════════════
SIZE L · LAYER 3 · PACK B5

RECONSTRUCTED MARKER — the original TZ spec file
(`tasks/_ready/2026-09-15-decomp-b5-composition-shipping-studio/TZ-NX-SHIPPING-PAGE-FACADE.md`)
was lost from disk (environment issue during session resume after a
usage-limit reset — the whole B4/B5 `_ready/` pack directories emptied;
never git-tracked, not recoverable from history). This marker
reconstructs intent from `WAVE-MAP.md` (fully read earlier in-session,
before it vanished) plus this session's own established Facade-in-place
pattern, applied identically ~7 times already (B1–B4, C1/C2).

WAVE-MAP.md goal line (verbatim, captured before loss):
  "S1 | L | TZ-NX-SHIPPING-PAGE-FACADE | shipping.page → ShippingFacade in-place"

CONFLICT KEYS (inferred): frontend-nx/apps/kppdf-web/src/app/pages/shipping/**
IMPLICIT: nx build kppdf-web

ЧТО (reconstructed, per established pattern): extract `ShippingFacade`
(`@Injectable()`, component-scoped via `providers: [ShippingFacade]` on
`ShippingPage`) holding all domain signals/computed/methods moved as-is
from `shipping.page.ts`. No behavior change.

AC (reconstructed): shipping.page spec green; nx build last 0.
Successor: TZ-NX-SHIPPING-TO-FEATURES

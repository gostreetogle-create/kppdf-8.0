# Audit: NX dark contrast sweep

**Date:** 2026-09-16
**Scope:** `TZ-NX-DARK-CONTRAST-SWEEP` after the Pro palette override.

## Findings and fixes

- Shell active category links already use solid `bg-sunrise-warm` with `text-on-gold`; no white/paper text is used on the gold active state.
- Kit navigation uses the same `bg-sunrise-warm text-on-gold` contract.
- Gantt grouping and zoom chips use a dark ink fill with paper text, not a gold fill; worker/status labels use the audited muted and warning tokens. The existing light-fill WT and unassigned contrast rules remain scoped to their respective bar colors.
- The DocStudio workspace shell already keeps the A4 sheet light (`--color-paper-raised`). The page-level canvas host previously forced `#fff`, which made the dark editor desk read as a white void around the sheet. It now uses `var(--studio-desk, var(--color-paper-2))`; preview iframe/table paper remains white by design.
- Existing dark Gantt cascade panels and calendar wash use dark tokenized overrides; no catalog `accentHue` algorithm or fixed WT colors were changed.

## Explicit non-changes

- No React/Pro source or class names were ported.
- No light-theme redesign, print CSS, A4 paper surface, or production data behavior was changed.
- No deployment was performed.

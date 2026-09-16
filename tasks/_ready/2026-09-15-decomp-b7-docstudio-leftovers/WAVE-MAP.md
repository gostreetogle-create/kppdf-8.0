# WAVE B7 — DocStudio leftovers unblock (after B6 hard blockers)

## Chain

| # | SIZE | TZ |
|---|------|-----|
| 1 | S | `TZ-NX-FEATURES-TIPTAP-TSCONFIG` |
| 2 | S | `TZ-NX-DOCSTUDIO-TEXT-PROPS-TO-FEATURES` |
| 3 | L | `TZ-NX-REGISTRIES-DIALOG-HOSTS-TO-FEATURES` |
| 4 | S | `TZ-NX-DOCSTUDIO-DATA-PANEL-TO-FEATURES` |

## Goal

1) Fix `libs/features` TS so `@tiptap/extensions/placeholder` resolves (B6 blocker).  
2) Move `studio-text-properties` + `studio-properties-panel` → `@kppdf/features/doc-studio`.  
3) Move registries dialog-host factories (catalog/material) that block vitrina/panel — narrow shared path under features or data layer, as-is.  
4) Move `studio-data-vitrina` + `studio-data-panel` → doc-studio features.

No behavior change. nx build LAST each. STOP after #4.

## PARK

Deploy/Wipe · SSH · forms showcase · new product modules

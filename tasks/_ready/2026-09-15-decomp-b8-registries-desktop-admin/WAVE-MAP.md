# WAVE B8 — remaining fat surfaces (after B5–B7 COMPLETE)

## Chain

| # | SIZE | TZ |
|---|------|-----|
| 1 | L | `TZ-NX-REGISTRY-DETAIL-PANEL-FACADE` |
| 2 | S | `TZ-NX-REGISTRY-DETAIL-TO-FEATURES` |
| 3 | L | `TZ-NX-DESKTOP-PAIRING-FACADE` |
| 4 | S | `TZ-NX-DESKTOP-PAIRING-TO-FEATURES` |
| 5 | L | `TZ-NX-ADMIN-ROLES-PAGE-FACADE` |
| 6 | S | `TZ-NX-ADMIN-ROLES-TO-FEATURES` |

## Goal

1) `registry-detail-panel` (~400) → facade + `@kppdf/features/registries-shell` (or registry-forms sibling)
2) `pairing-dialog` (~388) → facade + `@kppdf/features/desktop`
3) `admin-roles.page` (~365) → facade + reuse `@kppdf/features/admin-roles`

As-is only. nx build LAST. STOP after #6.

## PARK / skip

forms.page showcase · Deploy/Wipe · SSH · supply/cockpit already facaded (further thin = optional later)

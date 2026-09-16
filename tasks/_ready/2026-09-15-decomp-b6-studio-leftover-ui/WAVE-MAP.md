# WAVE B6 — Studio leftover panels → features (close DocStudio deviation)

> After B5: 4 studio UI still in app (TipTap/registries coupling). Close that debt.

## Chain

| # | SIZE | TZ |
|---|------|-----|
| 1 | L | `TZ-NX-DOCSTUDIO-LEFTOVER-UI-TO-FEATURES` |

Move as-is into `@kppdf/features/doc-studio/ui` (or keep shared TipTap deps clean):
- `studio-data-panel.component.ts`
- `studio-data-vitrina.component.ts`
- `studio-text-properties.component.ts`
- `studio-properties-panel.component.ts`
(+ specs). Thin page imports from features. No behavior change. If TipTap/registry hard-block — document deviation and STOP that file only.

AC: studio-editor* + moved component specs; nx build LAST. Then STOP — decomp program idle.

PARK: forms.page showcase · Deploy/Wipe · SSH

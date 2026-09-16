═══════════════════════════════════════════════════════════════
TZ-NX-FEATURES-TIPTAP-TSCONFIG
═══════════════════════════════════════════════════════════════
SIZE S · LAYER 3 · PACK B7
CONFLICT KEYS: frontend-nx/libs/features/tsconfig.json ; frontend-nx/libs/features/tsconfig.lib.json ; frontend-nx/libs/features/tsconfig.spec.json (only if required)
IMPLICIT: nx build kppdf-web

ЧТО: Unblock TipTap subpath imports for files under `@kppdf/features` (B6: `Placeholder` from `@tiptap/extensions/placeholder`). Prefer minimal tsconfig alignment with `apps/kppdf-web` (`moduleResolution: bundler` + compatible `module`) **or** equivalent narrow fix that keeps jest + `nx build kppdf-web` green. No product logic.

AC: can compile a features file that imports `@kppdf/ui/rich-text`; `nx test features` + `nx build kppdf-web` last 0.
Successor: TZ-NX-DOCSTUDIO-TEXT-PROPS-TO-FEATURES

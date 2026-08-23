# UI Density — grep guards (DEN-599)

Run after DEN wave page sweeps or before PO sign-off.

## Shadow / bg-white / radius (feature pages)

```bash
# No heavy shadow on feature pages (dialog backdrop excepted in shared/ui)
cd frontend/src/app/pages && rg 'shadow-(sm|md|lg|xl)' -g '*.ts' | rg -v 'spec\.ts'

# No full-page white bleed — prefer bg-paper on page roots
cd frontend/src/app/pages && rg 'bg-white' -g '*.ts' | rg -v 'spec\.ts'

# No puffy radius on feature pages
cd frontend/src/app/pages && rg 'rounded-(md|lg|xl|2xl|3xl)' -g '*.ts' | rg -v 'spec\.ts'
```

Expected: minimal hits; document exceptions in the matching `.done.md`.

## Dev jargon in user-facing templates

```bash
cd frontend/src/app/pages frontend/src/app/shared/ui && \
  rg -i 'unfit|exception|null|undefined|NaN' -g '*.html' -g '*.ts' | \
  rg -v '\.spec\.|// |/\*|null\s*\)|null,|null;|=== null|!== null|== null|!= null|NonNullable|typeof |Number\.isNaN|signal<.*null'
```

Expected: **0 user-visible hits** after DEN-590, or listed in `TZ-UI-DEN-590.done.md`.

Runtime safety net: `humanizeEnglishApiError()` in `frontend/src/app/core/silent-http.ts`.

## Desktop Import tab

```bash
cd desktop/src && rg 'box-shadow|border-radius:\s*(8|10|12|999)' App.svelte
```

Expected after DEN-580: minimal hits, documented in `TZ-UI-DEN-580.done.md`.

## PO spot-check (manual)

| Route | Paper bg | Hairline | 11px labels | Single gold CTA | RU copy | PO ✓ |
|-------|----------|----------|-------------|-----------------|---------|------|
| `/desk` | | | | | | |
| `/products` | | | | | | |
| `/orders` | | | | | | |
| `/doc-constructor/templates` | | | | | | |
| `/login` | | | | | | |

Canon: [`docs/ui-density-canon.md`](../ui-density-canon.md) · Program: [`tasks/WAVE-UI-DENSITY-PAPER-INK.md`](../../tasks/WAVE-UI-DENSITY-PAPER-INK.md)

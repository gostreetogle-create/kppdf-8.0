# S2 shell evidence

Live Playwright capture against the running stack (`node start.mjs --nx`, viewport 1200×800, `admin` / `admin123`).

- `01-studio-list.png` — `/studio` lists documents + «Создать документ».
- `02-portrait-panel-open.png` — `/studio/:id`, empty A4 portrait, pages panel open.
- `03-panel-collapsed.png` — same rect after clicking the sheet (panel collapsed).
- `04-landscape-panel-open.png` — orientation switched to Альбомная (PATCH, revision-gated).
- `_geometry.json` — measured stage rect (non-null) + sheet rects.

Measured ratios: **portrait 0.7071**, **landscape 1.4143** (A4, DOCPLAT-01 fixed vs legacy 1.726). Panel open/close reflow: **Δ width/height/right = 0**. Panel 480px absolute overlay (content 272px).
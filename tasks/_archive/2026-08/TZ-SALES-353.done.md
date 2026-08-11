# TZ-SALES-353 DONE — preview / F5 / multipage shame

- **Status:** DONE
- **Wave:** WAVE-KP-SHAME-POLISH
- **Scope:** `/proposals/create` preview chrome only; frozen shell 317 and build engine untouched.

## Delivered

- Loading/error preview states are short and Russian: «Загрузка превью…» / «Не удалось построить превью»; raw backend/English error text is not rendered.
- Single-page chrome shows «Страница 1»; multipage chrome shows «Страница 1 из N».
- Preview iframe remains sandboxed and is explicitly view-only with `pointer-events: none`.
- Editable draft F5 hydration regression covers positions, terms, recipient flow, and saved `sheetLayout`; layout is restored after template selection resets defaults.
- Page documentation records the behavior and limitation.

## Gates

- `pnpm --dir frontend exec jest src/app/pages/commercial/proposals/proposal-create.page.spec.ts --runInBand --no-coverage` — **34/34 PASS**
- `pnpm --dir frontend exec tsc -p frontend/tsconfig.app.json --noEmit` — **PASS**
- Changed-file Prettier — **PASS**
- Changed-file ESLint — **PASS**
- `git diff --check` — **PASS** (CRLF warnings only)
- DOM/component self-check — **PASS**

## Known limitation

- Authenticated browser smoke was unavailable in this headless executor; DOM/component evidence is recorded above. No backend/PDF/infra changes were made.
- Deploy was not run.

# WAVE — Doc Studio FINISH S27→S37

Status: **CLOSED — all 6 operator smoke AC PASS, live-confirmed** · 2026-09-04  
S37C fix + live re-check: `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S37C-PREVIEW-BLOCK-LAYOUT-DROP.done.md`  
S37 final verdict: `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S37-OPERATOR-SMOKE.done.md`  
Live closeout evidence (S41 PASS / S37 AC2 root cause): `docs/audits/2026-09-04-docstudio-s37-s41-live-closeout.md`  
Earlier evidence (AC 1,3,4,5,6): `docs/audits/2026-09-04-docstudio-finish-smoke.md`  
S37B: `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S37B-COUNTERPARTY-TOKEN-PREVIEW.done.md`  
S41: `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S41-VITRINA-ADD-UX.done.md`

## Волна A–C (S27–S36, S38–S40) + closeout (S37, S37B, S37C, S41)

| # | TZ | Status |
|---|-----|--------|
| 01–13 | S27–S36, S38–S40 | [x] archived on main |
| 14 | S37 OPERATOR-SMOKE | [x] **DONE — 6/6 AC PASS, live-confirmed** |
| 15 | S37B COUNTERPARTY-TOKEN-PREVIEW | [x] DONE |
| 16 | S41 VITRINA-ADD-UX | [x] DONE `9f348118` — live-confirmed PASS (headless Chromium: 3 rapid adds, no conflict dialog, remove works) |
| 17 | S37C PREVIEW-BLOCK-LAYOUT-DROP | [x] DONE — root cause fixed: `applyTableAggregateTokensToBlocks` now `.toObject()`s before spreading a Mongoose Document, so `layout` survives and text blocks render in Preview/PDF again |

## Closeout

- [x] S27–S40 + S37 + S37B + S37C + S41 all archived DONE
- [x] `_active/` пуст (только чужой `TZ-NX-GANTT-G2-READ-MODEL.md`, не наш)
- [x] S37 AC2 confirmed live PASS after S37C — «АО «Торговая сеть „Формат“»» substitutes in Preview
- [x] QUEUE/_NOW updated

## Гигиена окружения (для следующих сессий)

`frontend-nx` dev-server может тихо перестать подхватывать изменения (наблюдалось
~24h стали 2026-09-03→04, Vite watcher). **Перед любым live browser-тестом**
проверяй PID/uptime процесса на :4201 и перезапускай `pnpm start`, если сомневаешься —
иначе тестируется устаревший код. Подробности:
`docs/audits/2026-09-04-docstudio-s37-s41-live-closeout.md`.

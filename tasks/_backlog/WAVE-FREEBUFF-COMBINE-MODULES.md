# WAVE — Freebuff: COMBINE modules (406→407→408)

Unpark по слову PO 2026-08-16. Параллельно Cursor делает мелкое (не эти keys).

| # | TZ | Keys (не пересекать с Cursor) |
|---|-----|-------------------------------|
| 1 | TZ-COMBINE-406 | `backend/src/modules/order/**` (schema/service/controller/dto/spec) |
| 2 | TZ-COMBINE-407 | `frontend/.../dashboard.page.*` ; `orders.service.ts` (+spec) |
| 3 | TZ-COMBINE-408 | `order.service` patchLane guard + dashboard toast (после 407) |

Запрет: deploy, photos/**, production/gantt (чужое), DASHBOARD-401, UTF8 data wipe.

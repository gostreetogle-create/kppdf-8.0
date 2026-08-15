# ACTIVE: TZ-FRONTEND-302-A1

Lane: A
Parent: TZ-FRONTEND-302
Owner: Buffy-TZ-FRONTEND-302-A
Status: claimed / in progress after Cursor amendment
Canonical: 6cb978a2484af108b891a87793247c76dc60329e

Exact conflict keys:
- frontend/src/app/pages/admin/users-admin.page.ts
- frontend/src/app/pages/admin/users-admin.page.spec.ts
- frontend/src/app/pages/admin/roles-admin.page.ts
- frontend/src/app/pages/admin/roles-admin.page.spec.ts
- frontend/src/app/shared/services/pi-users.service.ts
- frontend/src/app/shared/services/pi-users.service.spec.ts
- frontend/src/app/shared/services/pi-roles.service.ts
- frontend/src/app/shared/services/pi-roles.service.spec.ts

Method surface: existing page silentPost/silentPatch/silentDelete URLs and payloads move into shared services; pages call services only. No new endpoints/RBAC/UI behavior.

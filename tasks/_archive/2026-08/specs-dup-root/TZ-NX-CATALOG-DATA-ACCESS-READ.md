# TZ-NX-CATALOG-DATA-ACCESS-READ

Implement read-only data-access services for the existing Materials and Products APIs, to support future registry rows and Constructor pickers.

Use only verified legacy endpoints and existing `@kppdf/util-http` silent HTTP conventions. Mirror backend DTO/response types; do not invent fields or query parameters. Keep services in `frontend-nx/libs/data-access`, with tests and public exports.

Required scope: list/get for Materials and Products; exact supported filters; response mapping; error handling; page-size limits based on backend facts; org/auth interceptor behavior. No create/update/delete/composition changes in this wave.

Do not edit `frontend/**` or `backend/**`; do not build registry pages or Constructor forms in this wave; no new permissions, endpoints, dependencies or UI primitives.

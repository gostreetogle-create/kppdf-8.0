# QUEUE-LIVE

> **PO audit 2026-08-30:** `tasks/WAVE-NX-REGISTRIES-STUDIO-PO-AUDIT.md`  
> **S7:** COMPLETE · **S8:** READY → `tasks/WAVE-DOCSTUDIO-S8.md`  
> **Operator doc:** `docs/pages/document-studio.page.md`

| # | TZ | Статус |
|---|-----|--------|
| S7-0…S7-6 | Doc Studio S7 wave | **DONE** (commit `a7b54868`) |
| S8-1 | `TZ-NX-DOCSTUDIO-S8-TEXT-SUBSTITUTION` | **READY** |
| S8-2 | `TZ-NX-DOCSTUDIO-S8-TABLE-ERP-BIND` | **READY** (after S8-1) |
| S8-3 | `TZ-NX-DOCSTUDIO-S8-LIST-TEMPLATES` | **READY** |
| S8-4 | `TZ-NX-DOCSTUDIO-S8-PAGES-PANEL` | **READY** |
| — | `TZ-AUTH-RBAC-ROLE-PERMS` | **READY** (backend parallel) |

## Закрыто (сессия 2026-08-30)

| TZ | Archive |
|----|---------|
| S6 PO-POLISH | `TZ-NX-DOCSTUDIO-S6-PO-POLISH.done.md` |
| S8-RIBBON-NORMALIZE | `TZ-NX-DOCSTUDIO-S8-RIBBON-NORMALIZE.done.md` (local) |
| A1–A6, registries wave | `_archive/2026-08/` |

**Правило:** одна active TZ на `kppdf-web/src/**`; `nx build kppdf-web` green между волнами.

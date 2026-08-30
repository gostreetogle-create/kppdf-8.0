# TZ-NX-REGISTRIES-ROW-DIALOGS-MATERIALS

Implement the first registry dialog wave for Materials and Details only. Add toolbar create and row edit/copy/archive actions using existing Paper & Ink dialogs and real Materials API. Material is a leaf: no composition editor in this task.

Follow `tasks/_archive/2026-08/TZ-NX-REGISTRIES-CONSTRUCTOR-DIALOG-AUDIT.done.md` §1–§5 and §8. Keep `/constructor` until all dialog flows are shipped and reviewed.

Do not change backend, legacy frontend, UI library, shell rails, product/module flows, permissions, endpoints or DTOs. Use existing Material API and verify all fields against backend DTOs. Add tests and browser smoke, archive and checklist.

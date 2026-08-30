# TZ-NX-REGISTRY-UNITS-DELETE-FE

DEPENDS: backend hard-delete `DELETE /units/:key` merged and verified on main (peer WIP `unit.service.ts`).

Scope (frontend-nx only):
- `PiUnitsService.delete(key)` → existing DELETE endpoint
- Units registry row action: archive/delete icon + confirm; disabled for `isSystem`
- Click-effect tests + browser smoke row

Out of scope: backend changes.

Blocked from: `TZ-NX-REGISTRIES-FULL-CLOSEOUT` (G4).

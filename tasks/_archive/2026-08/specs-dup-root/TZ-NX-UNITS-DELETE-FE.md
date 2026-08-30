# TZ-NX-UNITS-DELETE-FE

Wire DELETE for Units only after the backend hard-delete change is landed and independently verified.

Required precondition: `UnitService.remove()` hard-deletes non-system units, protects system units, has regression tests, and the change is committed/verified on the current base. If precondition is absent, stop as BLOCKED and do not add the UI action.

When unblocked: add icon-only destructive delete action with confirmation, correct API/error/success/reload behavior, and tests/browser smoke. Keep system-unit delete disabled with explanation. No other registry or backend changes.

# Session close-board checklist
- [x] TZ-UI-TABLE-305 CLAIM → code → gates → ARCHIVE → commit → push
- [x] TZ-UI-TABLE-303 CLAIM → code → gates → ARCHIVE → commit → push
- [x] _active/ empty
- [x] _active-map: queue empty / READY TO PROPOSE DEPLOY
- [x] Policy fix 2026-08-05: no «поехали» gate; no auto-deploy on empty queue

OUT OF SCOPE / STOP RULES:
- TZ-UI-TABLE-304 — only if PO asks (склад)
- `deploy.ps1` — only on explicit PO deploy command («задеплой» / «деплой» / «кати на сервер»)
- never `-Wipe` without separate explicit PO
- do not commit `__pycache__` or `tasks/Данные`

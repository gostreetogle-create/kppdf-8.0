# PROMPT — Freebuff continuous: KP PDF from proposals list

Ты executor (`agent_id: freebuff`). `D:\kppdf-8.0` main · UNATTENDED.

### Preflight
`_active` пуст. Pack: `tasks/_ready/2026-09-17-kp-pdf-list/WAVE-MAP.md`.  
BE эталон: `backend/src/modules/generated-document/quotation-output.controller.ts` (`POST :id/pdf`).  
FE эталон blob: studio `downloadPdf` / `consumePdfBlob`.

### Цепочка → STOP
0. `TZ-NX-QUOTATIONS-PDF-CLIENT`
1. `TZ-NX-PROPOSALS-LIST-PDF`
2. `TZ-DOCS-QA-GENERATED-DOC-CLOSE`

Каждый: CLAIM → code/docs → gates → archive → commit → next.

Gates #0–1: focused specs + `cd frontend-nx && pnpm exec nx build kppdf-web`.

### НЕ
Deploy · legacy KP workspace · invent archive UI · registries RBAC

### STOP
WAVE CLOSED · отчёт SHA×3.

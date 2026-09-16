# PROMPT — Freebuff/Claude: print CSS `<body>` leak fix

Ты executor. `D:\kppdf-8.0` · backend-only.

PO: на 2-й странице печати виден CSS-комментарий про multi-page/table-overflow.

### Claim
`tasks/_ready/TZ-NX-DOCSTUDIO-PRINT-CSS-BODY-LEAK.md`  
Audit: `docs/audits/2026-09-15-docstudio-print-css-body-leak.md`

### Fix
1. Убрать `<body>` из CSS comment в `buildDocumentContentStyles`  
2. Extract body only after `</head>` in `renderHtmlPages`  
3. Specs → gates → archive → STOP  

Можно параллельно с FE drag TZ (разные conflict keys). Не deploy.

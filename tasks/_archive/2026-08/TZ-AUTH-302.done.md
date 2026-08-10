# TZ-AUTH-302.done — remove CSP-blocked inline desktop URL script

ARCHIVE_MARKER: DONE (code); deploy smoke pending PO «деплой»
Date: 2026-08-11
Agent: cursor-architect-ops
Workspace: D:\kppdf-8.0

## Summary
Removed inline `<script>window.__DESKTOP_DOWNLOAD_URL__` from `frontend/src/index.html`.
Desktop URL now via `<meta name="kppdf-desktop-download-url">` + `readDesktopDownloadUrlFromDom`.
`deploy.py` injects meta `content` (CSP-safe). Helmet `scriptSrc` unchanged (no unsafe-inline).

## Gates
- frontend tsc PASS
- jest `desktop-download-url.spec.ts` 7/7 PASS

## Deploy
Warm deploy **not** run in this closeout. After PO «деплой»: verify no CSP inline error on `/login`, admin login OK.

## Lock
`.mimocode/locks/TZ-AUTH-302-csp-inline-desktop-url.lock` (local; may be gitignored)

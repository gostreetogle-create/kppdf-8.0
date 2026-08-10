# TZ-AUTH-302 checklist — CSP inline / login

> Status: **DONE** (code + warm deploy 2026-08-11)  
> Spec: `tasks/_backlog/ops/TZ-AUTH-302-csp-inline-desktop-url.md`  
> Archive: `tasks/_archive/2026-08/TZ-AUTH-302.done.md`

## Claim slot

- agent_id: cursor-architect-ops
- claimed_at: 2026-08-11T00:24:00+03:00
- workspace: D:\kppdf-8.0

## Acceptance

- [x] Inline script removed from index.html
- [x] desktop-download-url reads meta/data (specs green)
- [x] deploy.py patch updated if needed
- [x] No `'unsafe-inline'` in helmet scriptSrc
- [x] FE tsc + jest desktop-download-url PASS
- [x] Warm deploy; login smoke after Basic Auth
- [x] Archive + lock + push (code)

## Notes

- Prod still serves old inline script until warm deploy.
- API `POST /api/auth/login` with Basic + admin password already 200 on prod; browser 401 = wrong app password (не путать с Basic `kppdf`).

# TZ-AUTH-302 checklist — CSP inline / login

> Status: **READY** P0  
> Spec: `tasks/_backlog/ops/TZ-AUTH-302-csp-inline-desktop-url.md`

## Claim slot

- agent_id:
- claimed_at:
- workspace: D:\kppdf-8.0

## Acceptance

- [ ] Inline script removed from index.html
- [ ] desktop-download-url reads meta/data (specs green)
- [ ] deploy.py patch updated if needed
- [ ] No `'unsafe-inline'` in helmet scriptSrc
- [ ] FE/BE gates PASS
- [ ] Warm deploy; login smoke after Basic Auth
- [ ] Archive + lock + push

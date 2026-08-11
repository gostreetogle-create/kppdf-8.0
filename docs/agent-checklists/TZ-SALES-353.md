# TZ-SALES-353 checklist — preview / F5 shame

> Status: **DONE**
> Spec: `tasks/_backlog/kp-vitrine/TZ-SALES-353-kp-preview-f5-shame.md`  
> Wave: WAVE-KP-SHAME-POLISH

## Claim slot

- agent_id: Buffy executor
- claimed_at: 2026-08-11
- workspace: D:\kppdf-8.0

## Acceptance

- [x] Preview loading/error RU
- [x] F5 hydrate happy-path (including sheetLayout)
- [x] Page N of M chrome OK (single page omits «из 1»)

## Evidence

- 34/34 focused `proposal-create.page.spec.ts` tests PASS.
- DOM self-check covers RU loading/error, one/multi-page chrome, sandboxed view-only iframe, and F5 `sheetLayout` restoration.
- Known limitation: authenticated browser smoke unavailable in headless executor; no backend/PDF/infra changes; Deploy NO.
- [x] FE tsc + `pnpm test -- proposal-create` + lint
- [x] Archive + lock + commit/push; Deploy NO

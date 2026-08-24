# TZ-KP-BIND-513 checklist

> Status: **READY**
> TZ: `tasks/TZ-KP-BIND-513-kp-build-substitution-bag.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id:
- claimed_at:
- workspace: D:\kppdf-8.0

## Preflight

- [ ] git status — note dirty WIP in document-template.service.ts (photo-column)
- [ ] Claim `tasks/_active/TZ-KP-BIND-513.md`
- [ ] CONFLICT: только bag/substitute hunks в document-template.service.ts

## Acceptance

- [ ] mergeDraftContextIntoBag — proposalNumber, dates, totals в bag
- [ ] Top-level aliases: client_name, kp_number, … в body substitute
- [ ] Legacy TipTap split-token fallback + unit test
- [ ] e2e: counterparty + kp_number in build body
- [ ] FE buildPreview уже шлёт organizationId/counterpartyId (или минимальный fix)

## Gates

- [ ] backend tsc
- [ ] backend jest document-template*
- [ ] frontend tsc
- [ ] architecture:check

## Archive

- [ ] `tasks/_archive/2026-08/TZ-KP-BIND-513.done.md`
- [ ] progress.md

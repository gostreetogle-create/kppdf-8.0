# TZ-PARTY-301 checklist

> Status: **READY** · Wave: PARTY-DOCS #1  
> Source: `tasks/_backlog/party-docs/TZ-PARTY-301-hygiene.md`

## Claim slot
- agent_id:
- claimed_at:
- workspace: D:\kppdf-8.0

## Acceptance
- [ ] IDOR: чужой CP/Org → 404
- [ ] quickCreate штампует organizationId из JWT
- [ ] Soft-delete работает; list без deleted
- [ ] INN index: нет global unique; compound org+inn
- [ ] Stub badge «ИНН временный»
- [ ] isOurCompany / current Org

## Gates
- [ ] `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit`
- [ ] targeted jest counterparty/organization
- [ ] `git diff --check`

## Closeout
- [ ] Archive + lock + progress + WAVE checkpoint
- [ ] Commit/push; deploy NO

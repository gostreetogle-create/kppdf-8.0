# TZ-INN-301 checklist

> Status: **PARKED** · Wave: PARTY-DOCS #8  
> Source: `tasks/_backlog/party-docs/TZ-INN-301-lookup-PARKED.md`  
> Unpark: только по явной команде PO + ключ API

## Claim slot
- agent_id: — (не claim пока PARKED)
- claimed_at:
- workspace: D:\kppdf-8.0

## Acceptance (после unpark)
- [ ] Lookup adapter + env key
- [ ] FE «Заполнить по ИНН» Org/CP
- [ ] Success → innIsStub=false
- [ ] Без ключа — graceful

## Gates
- [ ] BE+FE tests
- [ ] `git diff --check`

## Closeout
- [ ] Archive + lock + progress
- [ ] Commit/push; deploy NO

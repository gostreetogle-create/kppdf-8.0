# TZ-ORDERS-306 checklist

> Status: **READY** · Wave: PARTY-DOCS #4 · Depends: PARTY-301 DONE  
> Source: `tasks/_backlog/party-docs/TZ-ORDERS-306-stub-commercial.md`

## Claim slot
- agent_id:
- claimed_at:
- workspace: D:\kppdf-8.0

## Acceptance
- [ ] API stub КП из order; proposalId доступен
- [ ] Идемпотентность / понятная ошибка при повторе
- [ ] FE «Создать черновик КП» на order detail
- [ ] Не трогать supply/line-ready
- [ ] orders.page.md

## Gates
- [ ] BE order tests + FE smoke
- [ ] `git diff --check`

## Closeout
- [ ] Archive + lock + progress
- [ ] Commit/push; deploy NO

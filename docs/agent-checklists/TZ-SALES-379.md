# TZ-SALES-379 checklist

> Status: **DONE**
> Spec: `tasks/_archive/2026-08/TZ-SALES-379.done.md`
> Deploy: **NOT DONE** (await PO «кати»)

## Claim slot

- agent_id: composer-executor-subagent
- claimed_at: 2026-08-17T20:00:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Acceptance

- [x] Alpine prod image has Chromium + cyrillic fonts + PUPPETEER_EXECUTABLE_PATH
- [x] compose `shm_size: "1gb"`
- [x] puppeteer `--disable-dev-shm-usage`
- [x] tsc + quotation-output spec PASS
- [x] Archive; no deploy

## Integrity slot

- [x] page.md updated (379 server PDF engine note)
- [x] Conflict keys only; proposal-create.page.ts not touched
- [x] No foreign WIP staged

## Gates (fact)

```
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit  → PASS
cd backend && pnpm exec jest --testPathPattern=quotation-output.service.spec --no-coverage  → PASS (4/4)
docker build -t kppdf-be-pdf ./backend  → PASS (local)
docker run --rm kppdf-be-pdf ls /usr/bin/chromium-browser  → PASS
```

## Executor report

- Root cause fixed: prod Alpine had no Chromium → puppeteer 503 on live KP PDF.
- Docker image now ships Chromium + Noto/DejaVu Cyrillic fonts; compose shm 1gb; launch hardened for Docker.
- Live PDF smoke deferred to post-deploy «кати».

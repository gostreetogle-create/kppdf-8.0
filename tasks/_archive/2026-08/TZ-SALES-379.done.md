# TZ-SALES-379 DONE — Chromium в Docker для PDF КП

```
ARCHIVE_MARKER
task: TZ-SALES-379
outcome: DONE
date: 2026-08-17
agent: executor (Composer subagent)
workspace: D:\kppdf-8.0 (main)
deploy: NOT DONE (await PO «кати»)
```

## Outcome

- Prod-stage `backend/Dockerfile`: `apk add` chromium, nss, freetype, harfbuzz, ca-certificates, ttf-dejavu, font-noto, font-noto-cjk; `ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser`.
- `docker-compose.prod.yml` backend: `shm_size: "1gb"`.
- `quotation-output.service.ts`: puppeteer launch args `--disable-dev-shm-usage`, `--disable-gpu` (plus existing `--no-sandbox`, `--disable-setuid-sandbox`).
- `proposals-create.page.md`: prod-образ обязателен для server PDF; 503 только если бинарь сломан.
- `proposal-create.page.ts` **не тронут** (FE toast copy unchanged).

## Verification

- [x] `pnpm exec tsc -p tsconfig.build.json --noEmit` — PASS
- [x] `pnpm exec jest --testPathPattern=quotation-output.service.spec --no-coverage` — PASS (4/4)
- [x] `docker build -t kppdf-be-pdf ./backend` — PASS locally
- [x] `docker run --rm kppdf-be-pdf ls /usr/bin/chromium-browser` — symlink present; `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser`
- [ ] Live PDF smoke — after PO «кати», not this TZ

## Known limitations

- Deploy not run; live KP PDF smoke pending warm deploy.
- Dev without Chrome still 503 → browser print fallback (by design).

lock: `.mimocode/locks/TZ-SALES-379-kp-pdf-chromium-docker.lock`

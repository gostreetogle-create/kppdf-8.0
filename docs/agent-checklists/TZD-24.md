# TZD-24 checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-08/TZD-24.done.md`
> TZ: `tasks/_backlog/desktop/TZD-24-desktop-installer-zip-download.md`
> Deploy: **NO**
> READY FOR REVIEW: 2026-08-08T01:20:00Z
> closed_at: 2026-08-08T01:22:00Z

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: agent-3e757640b7 (composer-executor)
- claimed_at: 2026-08-08T01:07:13Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task TZD-24; best-effort send OK)

## Preflight

- [x] Get-Location + git rev-parse → `D:\kppdf-8.0`
- [x] `_active/` пуст до CLAIM; keys ≠ TZD-21
- [x] GEMINI.md + TZ прочитаны
- [x] Claim slot заполнен
- [x] `tasks/_active/TZD-24.md` (removed at archive)
- [x] WT `main.ts` downloads static + SPA skip сохранён / уточнён

## Acceptance

- [x] ZIP при наличии файла → не HTML, size >> 1KB (~9.4MB)
- [x] Отсутствующий `/downloads/*` → 404 (не index.html)
- [x] Default pairing URL = `/downloads/kppdf-desktop-setup.zip`
- [x] `publish-installer` + `deploy.py` кладут zip рядом с exe
- [x] Docs согласованы; Jest PASS
- [x] BE+FE tsc PASS; binary не в git (gitignore `*.zip`)

## Gates (факт)

- [x] `backend pnpm exec tsc -p tsconfig.build.json --noEmit` → PASS
- [x] `frontend pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- [x] `jest desktop-download-url|pairing-dialog` → **14/14 PASS**
- [x] `node desktop/scripts/publish-installer.mjs` → exe+zip in staging/browser
- [x] smoke HEAD: zip **200** `application/zip` len≈9472235; missing **404**; other SPA html ~1.5KB

## Executor report

- Nest: static `/downloads/` + SPA skip (TZD-24 comment); missing → next → 404
- Default URL → `.zip`; injection empty disable intact
- publish-installer: minimal DEFLATE zip (zlib), arcname = setup.exe
- deploy.py: zipfile.ZIP_DEFLATED + size logs
- Docs: PAIRING/INSTALL/desktop README/synology README/downloads README
- `.gitignore`: `frontend/downloads/*.zip`
- Conflict disclosure: peer desktop WIP outside keys — only staged CONFLICT KEYS + checklist/progress/map/gitignore
- known_limitation: prod 404 until explicit deploy with staging zip; macOS/Linux OOS

## Cursor Verdict

**PASS** (2026-08-08) — AC met; gates green; deploy NO.

## Closeout

- [x] archive + lock + progress + удалить `_active`
- closed_at: 2026-08-08T01:22:00Z

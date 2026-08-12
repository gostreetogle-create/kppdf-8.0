# TZD-46 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZD-46.md`
> Commit/push: **YES** — TZ требует archive + commit + push origin/main

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: freebuff/tzd-46 (agent-158a657202)
- claimed_at: 2026-08-12T22:20:00Z
- workspace: D:\kppdf-8.0 (freebuff worktree d300021a)
- team_room_claim: best-effort (registry не знает TZD-46; checklist = source of truth)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → repo root D:\kppdf-8.0 (worktree d300021a)
- [x] Прочитал `_active-map.md` + `tasks/_active/` — только чужой TZ-MIG-301 (KP3 data-migrate, disjoint domain, нет пересечения conflict keys)
- [x] TZ / канон / deps прочитаны (TZD-46 TZ + desktop-download-version-naming-canon; base b91de8df уже содержит docs)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZD-46.md` на месте

## Acceptance (из TZ)

- [x] publish-installer: versioned zip+exe **и** unversioned aliases при наличии exe; имя содержит `v{semver}` из package.json — PASS (функц. тест fake exe: 4 файла в обоих download-каталогах)
- [x] Semver SoT: assert package.json == tauri.conf.json; FAIL publish при расхождении — PASS (readSemver + FAIL branch)
- [x] NSIS `0.1.0` hardcode убран; candidate `KPPDF Desktop_{semver}_x64-setup.exe` (+ старый путь fallback WARN) — PASS
- [x] deploy.py publish_desktop_installer зеркалит схему имён (versioned + alias), semver из desktop/package.json, WARN про versioned zip — PASS (функц. тест python)
- [x] FE: DEFAULT_DESKTOP_DOWNLOAD_URL остаётся unversioned alias (вариант A); compat/meta указывают versioned; pairing показывает semver — PASS
- [x] Docs: INSTALL.md, PAIRING.md, deploy README, config.env.example отражают канон; audit canon linked — PASS
- [x] Gates PASS: desktop version-compat (tsx 10/10) + tsc; FE tsc; jest pairing/desktop-download-url 14/14; eslint/prettier/diff-check — PASS
- [x] Нет deploy.ps1 / wipe; known_limitation: live Synology обновится только на следующем warm deploy — зафиксировано
- [x] Archive + lock + commit + push origin/main

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: module (desktop publish + deploy scripts + FE URL + docs)
- [x] FIC §A–E пройдены или N/A — publish/installer scripts + FE token; без API/backend; поведение покрыто тестами
- [x] page.md / PAGE-TZ-INDEX обновлены или N/A — N/A (нет UI route; INSTALL/PAIRING обновлены)
- [x] SECTION-READINESS обновлён или N/A — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (только keys TZ: publish-installer.mjs, deploy.py, desktop-download-url.ts, INSTALL/PAIRING, version-compat.test, pairing spec)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd desktop && pnpm exec tsc --noEmit` → PASS (0)
- `cd desktop && pnpm exec tsx --test src/core/version-compat.test.ts` → PASS 10/10 (tsx из mcp — канон TZD-40; `node --test` не резолвит extensionless ESM-импорт)
- publish dry-run без exe → FAIL c понятным message (exit 1) — PASS по смыслу TZ
- publish functional test (fake exe): versioned zip+exe + aliases, arcname = versioned exe — PASS
- `deploy.py publish_desktop_installer` functional test (python, tmp root) — PASS (versioned + alias, zip byte-identical)
- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS (0)
- `pnpm exec jest --testPathPattern="pairing-dialog|desktop-download-url" --no-coverage` → PASS 14/14
- ESLint (2 changed FE files) → PASS; Prettier (FE config) → PASS; `git diff --check` → PASS
- desktop Prettier N/A (binary нет в desktop; файл не переформатирован — CRLF канон сохранён)

## Executor report

- Сделано: publish-installer.mjs (semver SoT + FAIL при расхождении package/tauri; versioned zip+exe + aliases; NSIS candidate versioned; legacy fallback WARN); deploy.py publish_desktop_installer (зеркало схемы, semver из package.json); FE desktop-download-url.ts (доккоммент канона, default = alias вариант A); INSTALL.md + PAIRING.md (канон имён); version-compat.test +1; pairing spec — compat fixture versioned + 2 теста кнопки (alias default / versioned token).
- Conflict disclosure: только CONFLICT KEYS TZ-46; MCP host / sidecar / Desktop app code не тронуты; MIG-301 (KP3 data) не пересекался (disjoint domain, `_active/` scan PASS); `proposal-create*` / PDF / puppeteer не тронуты.
- Known limits: live Synology обновится только на следующем warm deploy (tauri build + publish-installer на build-машине, VPN off + слово PO); локальный publish-тест использовал фейковый exe (артефакты убраны); `node --test` не резолвит extensionless ESM — канон запуска version-compat = `tsx --test` (как в TZD-40).

## Review handoff

- [x] READY FOR REVIEW в wave inbox (если TZ требует review — TZD-46 без review-гейта)
- [x] Не archive до Cursor Verdict PASS (если TZ требует review)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-12T22:40:00Z

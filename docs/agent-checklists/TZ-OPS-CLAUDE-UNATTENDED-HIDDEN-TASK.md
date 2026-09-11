# TZ-OPS-CLAUDE-UNATTENDED-HIDDEN-TASK checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZ-OPS-CLAUDE-UNATTENDED-HIDDEN-TASK.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-11T09:20:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто, нет чужого CLAIM
- [x] TZ прочитан; `scripts/ensure-claude-unattended.mjs` (`ensureWindowsSchedule` ~207–223), `docs/agents/CLAUDE-UNATTENDED.md`
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-OPS-CLAUDE-UNATTENDED-HIDDEN-TASK.md` на месте

## Acceptance

- [x] `Get-ScheduledTask -TaskName KppdfClaudeUnattended` → Action Execute = `powershell.exe` (hidden wrapper), не прямой `node.exe`
- [x] `Start-ScheduledTask` → `LastTaskResult` = **0**; проверено без визуального окна (`-WindowStyle Hidden`)
- [x] Повторный `node scripts/ensure-claude-unattended.mjs` (`/F`) → 1 задача (не дубликат), GrowthBook overrides (`tengu_quill_harbor`, `tengu_permission_friction`, `tengu_disable_bypass_permissions_mode`) в `~/.claude.json` не тронуты
- [x] `isWin === false` ветка не менялась (`if (!isWin || noSchedule) return;` — первая строка функции, без изменений)

## Integrity slot (до READY / archive)

- [x] Тип изменения: dev-tooling script, одна функция (`ensureWindowsSchedule`) + doc note
- [x] FIC: N/A — scripts/ops, не NX page/route
- [x] page.md: N/A (PAGES: — в TZ); note добавлена в `docs/agents/CLAUDE-UNATTENDED.md`
- [x] Чужой WIP не в коммите; conflict keys соблюдены — только заявленные `scripts/ensure-claude-unattended.mjs`, `docs/agents/CLAUDE-UNATTENDED.md`, `docs/agent-checklists/_NOW.md`
- [x] Канон: docs/DOCS-INTEGRITY.md — без новых `.ps1`/`.cmd`/`.vbs` в репо, только inline `-Command`

## Gates (факт)

- `node --check scripts/ensure-claude-unattended.mjs` → **PASS** exit 0
- `node scripts/ensure-claude-unattended.mjs` (Windows) → **PASS**, task recreated
- `Get-ScheduledTask -TaskName KppdfClaudeUnattended | Format-List TaskName, State` → `Ready`
- `(Get-ScheduledTask -TaskName KppdfClaudeUnattended).Actions` → `Execute: powershell.exe`, `Arguments: -NoLogo -NonInteractive -WindowStyle Hidden -Command "& node D:\kppdf-8.0\scripts\ensure-claude-unattended.mjs --quiet --no-schedule"`
- `Start-ScheduledTask` + `Get-ScheduledTaskInfo … LastTaskResult` → **PASS** `0`
- Повторный `node scripts/ensure-claude-unattended.mjs` → **PASS**, `(Get-ScheduledTask -TaskName KppdfClaudeUnattended | Measure-Object).Count` = `1` (без дублей)
- GrowthBook regression check: `Select-String -Path ~/.claude.json -Pattern tengu_...` → все 3 ключа/значения на месте

## Executor report

- **Root cause confirmed, not assumed.** `node.exe` used directly as the `/TR` target is a console app; Task Scheduler flashes its window every 5 min with no wrapper. PO's manual `powershell -WindowStyle Hidden` fix worked but any `/F` re-create (every `start.mjs`) silently reverted it back to a bare node target.
- **First attempt (`-Command "& '<node>' '<script>' ..."` with single-quoted paths, exactly as the TZ suggested) failed live verification** — `LastTaskResult=1` after being stored via `schtasks /Create /TR`, even though the *identical* text run directly as a PowerShell command line succeeded (exit 0). Diagnosed by dumping the stored task XML (`schtasks /Query /TN … /XML`): `schtasks` rewrites embedded single quotes to double quotes when it stores `/TR`, and the resulting nested `""` then breaks PowerShell's own argv reconstruction for `-Command` at trigger time. This is a `schtasks.exe` quirk, not a Node escaping bug (verified spawnSync's own argument passed exactly one correctly-escaped argv element).
- **Second attempt (`-EncodedCommand`, base64 UTF-16LE) avoids quote-mangling entirely but hits a separate, unrelated `schtasks` limit** — `/TR` has a hard 261-character cap; the base64-inflated command exceeded it (`"Значение параметра /TR не может содержать более 261 символа"`).
- **Final fix:** removed quoting from the `-Command` body altogether by using tokens that never need it — bare `node` (PATH-resolved; verified `Get-Command node` resolves correctly under a plain, non-bash PowerShell, and the scheduled task runs as `LogonType=InteractiveToken` under the same signed-in user, so it inherits the same `PATH`) plus the repo script path, which has no spaces in this checkout. Added a runtime warning log if the script path ever does contain a space (would need quoting, which would reopen the same mangling bug) rather than silently producing a broken task.
- Verified live, three times over: (1) initial broken attempt caught before commit via `LastTaskResult=1`, (2) `-EncodedCommand` attempt caught via the 261-char schtasks error, (3) final quote-free form → `Actions.Execute = powershell.exe`, `Start-ScheduledTask` → `LastTaskResult = 0`, no visible console window (`-WindowStyle Hidden`), repeat `/F` run → still exactly 1 task, GrowthBook overrides in `~/.claude.json` unaffected.
- `docs/agents/CLAUDE-UNATTENDED.md`: added a dated note explaining the hidden-wrapper requirement and the quote-mangling/261-char pitfalls, so a future agent doesn't "fix" this back to a quoted or encoded form that looks more correct on paper but fails live.
- Nothing touched outside the declared conflict keys: `ensureGrowthBookOverrides`, `ensureDesktopConfig`, `ensureProjectSettings`, `ensureHomeSettings`, `start.mjs`, macOS/Linux branch (`isWin` guard, first line, untouched) all left exactly as-is.

## Closeout (после PASS)

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-11T09:50:00Z

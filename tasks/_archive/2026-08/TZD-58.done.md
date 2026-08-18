═══════════════════════════════════════════════════════════════
TZD-58: Desktop — честный installer v0.5.6 (build + publish gate)
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-18
closed_by: executor (TZD-58)

result:
- Strict `publish-installer.mjs`: source only `KPPDF Desktop_{semver}_x64-setup.exe` or verified staging; PE FileVersion check on Windows; no dist-installers first.
- `release-installer` = `pnpm tauri build && pnpm run publish-installer` in desktop/package.json.
- deploy/synology/deploy.py candidate order: versioned NSIS → versioned staging → unversioned alias (no legacy 0.1.0 fallback).
- Fresh NSIS build + publish to frontend/downloads + frontend/browser/downloads.

verification:
  - acceptance criteria: PASS
  - release-installer: PASS (tauri build ~2m + publish)
  - exe: 45339307 bytes, mtime 2026-08-18, PE FileVersion 0.5.6
  - publish without NSIS/staging: FAIL (exit 1, stale 0.5.4 ignored)
  - tsc: PASS (`cd desktop && npx tsc --noEmit`)
  - deploy/wipe: not run

known_limitation:
- Prod `/downloads/` updates only after PO deploy; local browser/downloads ready for smoke.

commits: 237fd049 (gate), pending (syntax fix + closeout)

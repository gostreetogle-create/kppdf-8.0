═══════════════════════════════════════════════════════════════
TZD-16: Web pairing dialog — «Скачать приложение» + installer delivery — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-06
closed_by: Buffy (desktop/MCP executor)
acceptance_status: PASS (soft waive for local installer build)
verification:
  - Pairing dialog «Скачать приложение» + data-test pairing-download-button: PASS
  - Configured installer URL via DESKTOP_DOWNLOAD_URL: PASS
  - Unset URL defaults to /downloads/kppdf-desktop-setup.exe: PASS
  - Explicit empty URL disables the button with Russian hint: PASS
  - Jest pairing/download: 2 suites / 14 tests PASS
  - Frontend tsc: PASS
  - Frontend scoped ESLint: PASS
  - Frontend scoped Prettier: PASS
  - Desktop typecheck: PASS
  - Desktop svelte-check: PASS (0 errors, 0 warnings)
  - Runtime deploy.py URL injection + Python syntax check: PASS
  - git diff --check: PASS
  - pnpm tauri build: SOFT WAIVE — pre-existing missing desktop/src-tauri/icons/icon.ico; no binary produced
known_limitation: tauri build / installer binary requires the missing icon.ico; successor TZD-16.1/TZD-17 if a real installer artifact is required.
checklist: docs/agent-checklists/TZD-16.md
source: tasks/_backlog/desktop/TZD-16-pairing-download-installer.md
commits: 873a70b, 3d12fdf, 103e7f1

---

## Summary

- Added the «Скачать приложение» action to the existing web pairing dialog.
- Added configured/default/explicit-empty URL handling and focused Jest coverage.
- Added `desktop/dist-installers/` ignore rule; installer binaries were not committed.
- Documented download → install → paste JSON in desktop pairing docs and README.
- Documented Synology `/downloads/` publication and runtime `DESKTOP_DOWNLOAD_URL` injection.
- Kept TZD-15 inbox/MCP, production, catalog, warehouse, and SoT code outside scope.

## Closeout note

The feature is DONE on `origin/main`. The Tauri build gate is recorded as a
soft waiver only because the repository has no `desktop/src-tauri/icons/icon.ico`.
Do not repair or generate icons in this TZ; use the successor task if an actual
`.exe`/`.msi` artifact is required.

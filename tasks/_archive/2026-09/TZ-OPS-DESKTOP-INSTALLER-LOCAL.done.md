# TZ-OPS-DESKTOP-INSTALLER-LOCAL: собрать и отдать ZIP для NX скачивания

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-06
closed_by: claude
lock_file: `.mimocode/locks/TZ-OPS-DESKTOP-INSTALLER-LOCAL.lock` (local; ignored by Git)

## Verification

- acceptance criteria: PASS — все 5 пунктов из TZ (alias zip on disk, HEAD 200 на `:3000`/`:4201`, NX pairing dialog download, Desktop install + smoke start + pairing, бинарники вне git).
- typecheck / tests / lint: N/A — задача ops/packaging (пересборка существующего `release-installer` pipeline), product-код не менялся.
- checklist: `docs/agent-checklists/TZ-OPS-DESKTOP-INSTALLER-LOCAL.md` — заполнен полностью, все секции PASS.
- GUI-smoke: PO PASS (2026-09-06) — скачано с NX pairing dialog, Desktop v0.5.7 установлен и запущен, pairing к local API прошёл, скрин показывает Connected: admin.

## Delivered

- `release-installer` (`tauri build` + `publish-installer`) собран: semver **0.5.7**.
- Артефакты в `frontend/downloads/` и `frontend/browser/downloads/` (не в git, `.gitignore`):
  `kppdf-desktop-setup-v0.5.7.exe` (42 142 377 bytes, PE 0.5.7), `kppdf-desktop-setup-v0.5.7.zip` (42 136 055 bytes),
  aliases `kppdf-desktop-setup.{exe,zip}` (те же байты).
- Подтверждён HTTP 200 без рестарта backend:
  `curl -I http://127.0.0.1:3000/downloads/kppdf-desktop-setup.zip` → 200, `application/zip`, `Content-Length: 42136055`;
  то же через NX proxy `:4201`.
- `docs/audits/2026-09-06-nx-desktop-download-404-audit.md` дополнен разделом Resolution.
- Root cause подтверждён как диагностировано в аудите: отсутствие собранного NSIS/ZIP на диске, а не баг NX/proxy/pairing кода — код не менялся.

## Smoke (evidence summary)

1. Build: `pnpm run release-installer` → tauri build release (1m 31s) + publish-installer, exit 0.
2. HTTP `:3000/downloads/kppdf-desktop-setup.zip` → 200 (application/zip, 42136055 bytes).
3. HTTP `:4201/downloads/kppdf-desktop-setup.zip` (NX proxy) → 200, идентично.
4. GUI: скачивание из NX pairing dialog → PASS (PO).
5. Установка Desktop + запуск + pairing к local API → PASS (PO, скрин v0.5.7 Connected: admin).
6. Бинарники не в git: `git status --short` / `git check-ignore -v` подтверждают отсутствие в индексе.

Commit: `7cfbde42` (claim/checklist/audit docs, docs-only, no binaries) + closeout commit (этот archive).

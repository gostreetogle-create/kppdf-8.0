═══════════════════════════════════════════════════════════════
TZD-40: Desktop version gate — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-12
closed_by: Buffy (фоновый desktop исполнитель)
acceptance_status: PASS
verification:
  - GET /api/desktop/compat возвращает min/recommended/downloadUrl/serverBuildId: PASS (env-driven, fail-open)
  - Desktop ниже min → блок-баннер + MCP не стартует: PASS (gating в connect + onMount restore)
  - между min и recommended → жёлтый баннер, MCP работает: PASS
  - ≥ recommended → нет баннера: PASS
  - semver compare fail-open + UI/API tests: PASS (desktop 9/9, BE 10/10, FE 12/12)
  - backend tsc --noEmit: PASS
  - backend jest desktop: 10/10 PASS
  - desktop typecheck + svelte-check + mcp:check 110/110: PASS
  - git diff --check: PASS
  - RU copy; пароли не в логах: PASS
checklist: docs/agent-checklists/TZD-40.md
lock: .mimocode/locks/TZD-40-desktop-version-gate.lock
source: tasks/_backlog/desktop/TZD-40-desktop-version-gate.md

## Что сделано

- BE: `DesktopCompatService` + `@Public() GET /api/desktop/compat` (env:
  `DESKTOP_MIN_VERSION`, `DESKTOP_RECOMMENDED_VERSION`, `DESKTOP_DOWNLOAD_URL`,
  `APP_VERSION`; без env — fail-open, min/recommended = 0.0.0).
- Desktop: `version-compat.ts` (semver compare + block/warn/ok + resolve download URL);
  `App.svelte` баннер block/warn + гейт автозапуска MCP; capability `shell:allow-open`.
- FE pairing dialog: строка «Актуальная версия Desktop: X (мин. Y)» рядом с «Скачать приложение».
- Docs: `desktop/docs/INSTALL.md` / `PAIRING.md`; `deploy/synology/config.env.example`.

## Known limitation

- Без warm deploy новых env на VM баннер не появится на проде.
- Старый установленный Desktop без этого кода баннер не покажет — нужен один
  ручной update после TZD-39/40 (курица-яйцо: download со сайта).

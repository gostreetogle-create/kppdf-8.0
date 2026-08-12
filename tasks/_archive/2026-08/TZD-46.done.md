# TZD-46 DONE — Desktop ZIP имя с semver (versioned + alias publish)

```
ARCHIVE_MARKER
task: TZD-46
outcome: DONE
closed_at: 2026-08-12
closed_by: agent-158a657202 (freebuff/tzd-46)
workspace: D:\kppdf-8.0
verification:
  - acceptance criteria: PASS (см. ниже)
  - desktop version-compat tests: PASS (tsx 10/10)
  - desktop tsc --noEmit: PASS
  - publish dry-run (нет exe): PASS — FAIL c понятным message (exit 1)
  - publish functional test (fake exe): PASS — versioned zip+exe + aliases созданы, arcname versioned
  - deploy.py publish_desktop_installer functional test: PASS (fake project root, versioned + alias, zip byte-identical)
  - frontend tsc -p tsconfig.app.json: PASS (0 errors)
  - frontend jest pairing-dialog + desktop-download-url: PASS (14/14)
  - eslint/prettier/diff-check: PASS
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS
```

## Что сделано

- **`desktop/scripts/publish-installer.mjs`:** Semver SoT — читает `desktop/package.json`,
  при расхождении с `tauri.conf.json` **FAIL** publish с явной ошибкой. Публикует в
  `frontend/downloads/` и `frontend/browser/downloads/`:
  `kppdf-desktop-setup-v{semver}.exe` + `kppdf-desktop-setup-v{semver}.zip`
  (внутри ZIP — versioned exe) **и** unversioned aliases `kppdf-desktop-setup.exe/.zip`
  (копия тех же байт). NSIS candidate больше не хардкодит `0.1.0`:
  `KPPDF Desktop_{semver}_x64-setup.exe`; старый путь — fallback WARN.
  В конце лог: versioned URL path.
- **`deploy/synology/deploy.py` `publish_desktop_installer`:** зеркало той же схемы —
  semver из `desktop/package.json` на build-машине, versioned + alias в
  `frontend/browser/downloads/`; WARN про versioned zip; fallback legacy NSIS WARN.
- **FE:** `DEFAULT_DESKTOP_DOWNLOAD_URL` остаётся unversioned **alias** (вариант A канона);
  доккоммент фиксирует, что деплой должен инжектить versioned URL через meta
  `kppdf-desktop-download-url` (`DESKTOP_DOWNLOAD_URL`). pairing-диалог показывает semver
  из compat; кнопка открывает token-URL.
- **Docs:** `desktop/docs/INSTALL.md` и `desktop/docs/PAIRING.md` — канон имён
  (versioned = канон, alias = старые закладки); `deploy README` + `config.env.example`
  уже обновлены в base (b91de8df).
- **Tests:** `version-compat.test.ts` +1 (versioned путь резолвится от apiBaseUrl);
  `pairing-dialog.component.spec.ts` — compat fixture на versioned URL, +2 теста
  download-button (alias default; versioned token через отдельный setupModule).

## Критерии приёмки

- [x] publish-installer (при наличии exe) создаёт versioned zip+exe **и** unversioned aliases — PASS (функц. тест)
- [x] Имя versioned zip содержит `v` + semver из package.json — PASS (`kppdf-desktop-setup-v0.5.1.zip`)
- [x] deploy.py не ссылается на NSIS `0.1.0` как единственный candidate — PASS (versioned candidate; legacy = fallback WARN)
- [x] Docs/README/example отражают канон; audit canon linked — PASS
- [x] Gates PASS; нет deploy — PASS
- [x] known_limitation: без warm deploy сайт всё ещё отдаёт старый файл (PO VPN) — зафиксировано

## Known limitation

- Live Synology обновится только на следующем «деплой» после merge TZD-46 + `tauri build` +
  `publish-installer` на build-машине (VPN off + слово PO). Пока — кнопка/парный диалог
  отдают alias/старый файл.
- Локальный publish functional test использовал фейковый exe в `dist-installers/` —
  артефакты убраны после проверки; в git бинарники не попадают.

═══════════════════════════════════════════════════════════════
TZ-OPS-DESKTOP-INSTALLER-LOCAL: собрать и отдать ZIP для NX скачивания
═══════════════════════════════════════════════════════════════

SIZE: L (долгий `tauri build` на Windows)
РОЛЬ АГЕНТА: Desktop ops / packaging
ЗАВИСИМОСТИ: нет (параллельно с hotfix/orphan-clean — другие keys)
LAYER: ops (не product SPA)
PAGES: N/A (chrome pairing download)

CONFLICT KEYS: desktop/scripts/publish-installer.mjs; frontend/downloads/README.md; docs/audits/2026-09-06-nx-desktop-download-404-audit.md; docs/agent-checklists/TZ-OPS-DESKTOP-INSTALLER-LOCAL.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

PO на NX: «Подключить десктоп» → Скачать →
`{"statusCode":404,"path":"/downloads/kppdf-desktop-setup.zip",...}`.

Проверено 2026-09-06: UI/proxy/Nest mount OK; в `frontend/downloads/` нет zip/exe;
нет NSIS в `desktop/src-tauri/target/release/bundle/nsis/`.
Аудит: `docs/audits/2026-09-06-nx-desktop-download-404-audit.md`.
Канон: `frontend/downloads/README.md`, `desktop/scripts/publish-installer.mjs`, TZD-46.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Сборка и publish

  1.1 `cd desktop && pnpm install` (если нужно).
  1.2 `pnpm run release-installer` (= `tauri build` + `publish-installer`).
      Semver SoT: `desktop/package.json` == `src-tauri/tauri.conf.json`.
  1.3 Убедись, что появились:
      - `frontend/downloads/kppdf-desktop-setup-v{semver}.zip` (+ .exe)
      - aliases `kppdf-desktop-setup.zip` / `.exe`
  1.4 НЕ коммитить бинарники.

ШАГ 2: Проверка раздачи

  2.1 Backend на :3000 должен уже mount'ить `frontend/downloads` (файл подхватится без рестарта; если mount не было — рестарт backend).
  2.2 `curl -I http://127.0.0.1:3000/downloads/kppdf-desktop-setup.zip` → **200**, Content-Type/length > 1KB (не HTML/JSON).
  2.3 То же через NX: `http://127.0.0.1:4201/downloads/kppdf-desktop-setup.zip` → 200.
  2.4 В браузере NX (admin / desktop:admin): диалог → «Скачать Desktop» → файл качается; установить и smoke: старт + pairing к локальному API (кратко в checklist).

ШАГ 3: Closeout docs

  3.1 Checklist + audit: PASS + semver + sizes.
  3.2 Commit только docs/checklist (если менял); бинарники вне git.
  3.3 `_NOW`: Claude IDLE после DONE.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Pairing dialog / RBAC / soft-delete / orphan-clean (другие TZ)
- Не `KPPDF_PUBLISH_ALLOW_STALE=1`, если нет свежего NSIS — собрать заново
- Production Synology deploy (если PO не просил отдельно)

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] Alias zip на диске в `frontend/downloads/`
- [ ] HEAD/GET `:3000` и `:4201` `/downloads/kppdf-desktop-setup.zip` = 200
- [ ] Скачивание из NX pairing dialog работает
- [ ] Desktop установлен локально; краткий smoke start (в отчёте)
- [ ] Бинарники не в git commit

CLAIM: `agent_id: claude`, conflict keys vs `_active`.

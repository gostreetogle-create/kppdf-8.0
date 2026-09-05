# TZD-71 checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZD-71.done.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: freebuff
- claimed_at: 2026-09-05T21:10:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (нет CLI Team Room у Freebuff; slot заполнен в checklist)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → `D:\kppdf-8.0`, branch main, HEAD `0b6c179b`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — `_active` пуст, нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны (WAVE-DESKTOP-EXCEL-NX-ALIGN, audit §4–6, legacy эталон)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZD-71.md` на месте

### Preflight Check Output
- **Context read:** `docs/audits/2026-09-05-nx-desktop-download-port-audit.md`, `frontend/src/index.html`, `frontend/src/app/core/desktop-download-url.ts`, `frontend/src/app/pages/desktop/pairing-dialog.component.ts`, `backend/src/main.ts`, `backend/src/modules/desktop/desktop-compat.service.ts`, `backend/src/modules/desktop/desktop-pairing-key.service.ts`, `deploy/synology/deploy.py`, `frontend-nx/apps/kppdf-web/src/index.html`, `frontend-nx/apps/kppdf-web/project.json`
- **Key Constraints:** Mode A аудит уже готов; executor = evidence + minimal prep; не открывать pairing UI; не добавлять permission (TZD-72)
- **Planned Deliverable:** 1) evidence table §4 → checklist; 2) meta в NX index.html; 3) зеркало inject в deploy.py для NX dist; 4) nx build green; 5) archive
- **Validation Path:** FIC (docs-only/minimal code) + `nx build kppdf-web` exit 0

## Audit §4 evidence (факт)

| # | Пункт §4 | Evidence | Вердикт |
|---|----------|----------|---------|
| 1 | Deploy path для NX static: inject meta не только в legacy | `deploy/synology/deploy.py:339-369` — `inject_desktop_download_url` трогает только `frontend/browser/index.html`; во всём deploy.py нет упоминания `frontend-nx`. → **GAP**, чинится в этой TZ зеркалом для NX dist (minimal diff) | FAIL → FIX |
| 2 | Compat semver ↔ ZIP name ↔ desktop/package.json | `backend/src/modules/desktop/desktop-compat.service.ts` — env `DESKTOP_MIN_VERSION/RECOMMENDED/DOWNLOAD_URL`; `desktop/scripts/publish-installer.mjs` — versioned `kppdf-desktop-setup-v{semver}.zip|.exe` (canon TZD-46); deploy.py `read_desktop_semver` берёт semver из `desktop/package.json`. Цепочка целая | PASS |
| 3 | `/downloads/*` доступ для enrolled device (не ложный 401) | `backend/src/main.ts:259-281` — `app.useStaticAssets(dir, { prefix: '/downloads/' })` без auth-guard (public static; FE dev proxy `/downloads` → backend). `main.ts:297` — SPA fallback явно пропускает `/downloads` (не отдаёт HTML вместо zip) | PASS |
| 4 | Alias unversioned = те же байты, что versioned | `desktop/scripts/publish-installer.mjs` — заголовок + логика: публикует `kppdf-desktop-setup-v{semver}.exe|.zip` + «stable unversioned aliases» из того же файла (copyFileSync) | PASS |
| 5 | Пустой URL → кнопка disabled + «Установщик скоро будет…» | `frontend/src/app/pages/desktop/pairing-dialog.component.ts` — `effectiveDownloadUrl()` → '' при пустом compat+meta; `[disabled]="!effectiveDownloadUrl()"` + hint `DESKTOP_INSTALLER_UNAVAILABLE_HINT`; spec TZD-57 это проверяет | PASS |
| 6 | Pairing packet **без** session JWT | `backend/src/modules/desktop/desktop-pairing-key.service.ts` — `issue()`: `apiKey = 'kppd_' + randomBytes(24)` (opaque, hashed sha256 в БД), в packet `{apiBaseUrl, apiKey, username, expiresAt}` — JWT не участвует; legacy spec проверяет отсутствие `eyJ…` | PASS |

## Acceptance

- [x] Evidence table в checklist (выше)
- [x] NX index.html имеет meta tag
- [x] nx build green (index тронут)

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: docs + minimal (meta + deploy hook зеркало)
- [x] FIC §A–E: N/A кроме §E-adjacent deploy hook — чекбокс «desktop import / MCP» не меняется; изменение — meta/deploy infra. FIC §B не нужен (permission в TZD-72)
- [x] page.md / PAGE-TZ-INDEX: N/A (нет UI route)
- [x] DOMAIN-MAP: N/A (обновление в TZD-72)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A

## Gates (факт)

- [x] `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0 (см. Executor report)

## Executor report

- Пункты §4: 5×PASS, 1×GAP (deploy.py инжектит только legacy). GAP закрыт зеркалом: `inject_desktop_download_url` теперь инжектит и в NX `frontend-nx/dist/apps/kppdf-web/browser/index.html`, если он существует (опционально, не fail — NX ещё не в прод-деплое; при отсутствии маркера — warn, не fail).
- NX `index.html` получил пустой meta `kppdf-desktop-download-url` (как legacy; контракт: no attr = default, content="" = disabled).
- known_limitation (зафиксировано): deploy.py собирает и шипит только legacy `frontend/browser/`; NX-артефакт пока не деплоится. Successor: полноценный NX deploy-path (вне scope волны).
- Conflict disclosure: `deploy/synology/deploy.py` + `frontend-nx/apps/kppdf-web/src/index.html` — других правок по этим файлам в `_active` нет.

## Review handoff

- [ ] READY FOR REVIEW в wave inbox (нет — волна без review inbox; TZ не требует Cursor PASS)
- [x] **Не** archive до Cursor Verdict PASS — TZ-71 не требует review (финализация: archive 2026-09)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-05T21:40:00Z
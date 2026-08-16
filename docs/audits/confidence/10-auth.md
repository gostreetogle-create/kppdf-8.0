# LEDGER-10 — Auth / device
date: 2026-08-16T17:40:00+03:00
agent: Buffy (freebuff)

## Score (0–100)
overall: 92
subscores:
  evidence_quality: 93
  sync_code_docs: 90
  risk_holes: 93

## What I opened (paths)
- docs/pages/enroll.page.md — passwordless device grant, RU flows, invariants
- docs/pages/login.page.md — password login (form, HTTP Basic, CSP)
- backend/src/modules/device-enrollment/device-enrollment.service.ts — ConsumedDevice.sessionKind: 'device' (L54), enroll result (L327)
- backend/src/modules/device-enrollment/device-enrollment.controller.ts — enroll/session ответы с sessionKind
- backend/src/modules/auth/auth.service.ts — password login (bcrypt, refreshTokenVersion, no-enumeration)
- frontend/src/app/core/auth.service.ts — DEVICE_KEY 'kppdf.device' (L35), applyDeviceAccess (L306), bootstrapDevice (L386), renewDevice
- frontend/src/app/pages/enroll/enroll.page.ts — applyDeviceAccess (L126)
- tasks/_park/TZ-AUTH-307-auth-cutover-cleanup.md — park status, deps

## PASS evidence
- **Passwordless device ≠ password session — инвариант в коде:** `ConsumedDevice.sessionKind: 'device'` (device-enrollment.service L54) + комментарий «so the SPA never mixes a device session (cookie-renew) with a password session (refresh-token renew)»; enroll/session ответы несут `sessionKind`.
- **FE разделяет сессии:** маркер `kppdf.device`; `applyDeviceAccess(access)` сохраняет ТОЛЬКО короткий access JWT (refresh не хранится); bootstrap → `/device/status` + `/device/session` (cookie-only) → свежий access; interceptor `renewDevice` single-flight; deny → «Доступ этого компьютера отключён» (RU) — совпадает с enroll.page.md.
- **Доки:** enroll.page.md описывает одноразовую ссылку, «GET не активирует», 409 «ссылка уже использована», 410/400/404 «приглашение недействительно» — документация passwordless пути согласована с кодом (RU копирайт).
- **AUTH-307 park честно:** файл в `tasks/_park/` с явными DEP (TZ-AUTH-305 DONE, post-cutover smoke), «не очищать старый вход до готовности нового»; _NOW.md тоже помечает park.
- **Password путь:** auth.service (bcrypt + DUMMY_BCRYPT_HASH против enumeration, refreshTokenVersion), login.page.md (form + Basic + CSP) — break-glass owner (AUTH-306) живёт через этот вход.

## FINDINGS
| id | sev | area | repro/proof | action |
|----|-----|------|-------------|--------|
| F-01 | P3 | login.page.md | Страница логина не описывает device-сессии и break-glass owner (AUTH-306) — различие «пароль vs устройство» документировано только в enroll.page.md и PAGE-TZ-INDEX | accept / TZ-later (дополнить страницу одной секцией) |

## TZ drafted (if any)
- Нет

## Confidence note for Cursor
- Инвариант «device-сессия ≠ password-сессия» доказан в коде (sessionKind, cookie-renew vs refresh-token-renew) и доках; AUTH-307 корректно в park.
- Не проверял: живой enroll-флоу на реальном стенде (нужен запущенный backend + invite); /admin/devices UI.
- F-01 — документационный пробел P3, не дыра.

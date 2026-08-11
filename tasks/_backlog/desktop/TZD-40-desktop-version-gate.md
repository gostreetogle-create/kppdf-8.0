═══════════════════════════════════════════════════════════════
TZD-40: Desktop version gate — предупреждение обновить приложение
═══════════════════════════════════════════════════════════════

> Domain preflight: Desktop companion + Nest health; не путать pairing key
> с session JWT; download URL уже есть (`DESKTOP_DOWNLOAD_URL` / meta).

РОЛЬ АГЕНТА: Desktop + Backend (compat endpoint) — Cursor zone desktop/MCP

ЗАВИСИМОСТИ: TZD-39 Basic Auth coexist (Desktop↔nginx) желательно уже на проде;
  иначе версия «не сходится» маскируется Failed to fetch.

LAYER: 3 (desktop App + FE pairing dialog + BE desktop module)

CONFLICT KEYS: desktop/src/App.svelte; desktop/src/core/api.ts; desktop/package.json; backend/src/modules/desktop/desktop-pairing.controller.ts; backend/src/modules/desktop/desktop-compat.service.ts; frontend/src/app/pages/desktop/pairing-dialog.component.ts; desktop/docs/PAIRING.md; desktop/docs/INSTALL.md

PAGES: /desktop (pairing dialog)
PAGE_DOCS: (нет отдельной page.md — desktop companion)

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Проверено:
- `desktop/package.json` version `0.1.0` — локальная версия приложения
- Nest `/api/health` — **нет** поля min/recommended desktop version
- Pairing dialog: кнопка «Скачать приложение» есть, **нет** сравнения версий
- PO 2026-08-11: не видит предупреждения «версия Desktop ≠ сайта / обновите»
- Канон: FE+BE деплоятся согласованно (PO-DIARY); Desktop — тот же принцип

Проблемы:
1. Старый Desktop после деплоя Nest молча ломается (API drift) или «вроде работает»
2. Нет единого SoT: какую версию Desktop сайт считает минимальной
3. Нельзя «просто тост» без download URL и без блокировки при hard min

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Compat contract на Nest

Добавить публичный (или pairing-auth) endpoint, напр. `GET /api/desktop/compat`:

```json
{
  "minDesktopVersion": "0.1.1",
  "recommendedDesktopVersion": "0.1.2",
  "downloadUrl": "https://…/KPPDF-Desktop-Setup.exe",
  "serverBuildId": "<git sha или APP_VERSION из env>"
}
```

- Источник: env `DESKTOP_MIN_VERSION` / `DESKTOP_RECOMMENDED_VERSION` + уже существующий
  download URL (deploy inject / config) — **не** хардкод в UI.
- Semver compare (major.minor.patch); неверный semver → treat as equal (fail-open soft).

ШАГ 2: Desktop — проверка при connect и при старте paired session

- Читать `desktop/package.json` version (или Tauri app version — один SoT, зафиксировать в TZ).
- После успешного `/auth/me` (или параллельно) вызвать `/api/desktop/compat`.
- Если `desktop < min` → **блок**: красный баннер «Нужно обновить приложение»,
  кнопка «Скачать» (downloadUrl), MCP **не** стартовать / остановить.
- Если `min ≤ desktop < recommended` → жёлтый баннер «Рекомендуем обновить»,
  MCP можно стартовать.
- Если `desktop ≥ recommended` → тишина.
- RU copy только; без EN.

ШАГ 3: Веб pairing dialog

- Если compat доступен — показать строку «Актуальная версия Desktop: X (мин. Y)»
  рядом со «Скачать приложение».
- Не дублировать сложный update-engine (auto-updater NSIS) — только warn + link.
  Auto-update = successor.

ШАГ 4: Docs

- `desktop/docs/INSTALL.md` + `PAIRING.md`: когда виден баннер, что делать.
- Не логировать пароли/ключи.

═══════════════════════════════════════════════════════════════
ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- `backend/src/modules/desktop/*` (compat endpoint + tests)
- `desktop/src/App.svelte` + тонкий `desktop/src/core/version-compat.ts`
- pairing dialog (опц. hint)
- docs INSTALL/PAIRING
- deploy env example: `DESKTOP_MIN_VERSION`, `DESKTOP_RECOMMENDED_VERSION`

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- nginx Basic Auth / htpasswd
- pairing key format `kppd_…`
- Electron/Tauri auto-updater wiring (отдельный TZ)
- MCP tool registry / commercial tools
- wipe / deploy scripts behavior

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] `GET /api/desktop/compat` возвращает min/recommended/downloadUrl/serverBuildId
- [ ] Desktop ниже min → баннер блок + MCP не running; кнопка скачать ведёт на URL
- [ ] Desktop между min и recommended → soft banner, MCP может работать
- [ ] Desktop ≥ recommended → нет баннера
- [ ] Unit: semver compare + UI/API tests
- [ ] `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit`
- [ ] `cd backend && pnpm test -- desktop`
- [ ] `cd desktop && pnpm typecheck && pnpm mcp:check`
- [ ] `git diff --check` PASS
- [ ] RU copy; пароли не в логах

Финализация: `tasks/_archive/YYYY-MM/TZD-40.done.md` + checklist + progress по GEMINI.md

═══════════════════════════════════════════════════════════════
KNOWN LIMITATION
═══════════════════════════════════════════════════════════════

- Без warm deploy новых env на VM баннер не появится на проде.
- Старый установленный Desktop без этого кода баннер не покажет — нужен один
  ручной update после TZD-39/40 (курица-яйцо: download со сайта).

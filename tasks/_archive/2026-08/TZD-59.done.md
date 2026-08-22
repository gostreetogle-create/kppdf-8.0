# TZD-59: Desktop pairing — версия никогда не «v?»

> Аудит: сессия Claude (Cowork) 2026-08-22 по жалобе PO — на сайте кнопка
> «Скачать Desktop» показывала буквально `v?`.
> Deps: TZD-40 DONE (compat contract), TZD-46 DONE (versioned filename canon).
> Не требует деплоя для merge; деплой — отдельно по слову PO.

РОЛЬ АГЕНТА: Frontend Component Engineer

ЗАВИСИМОСТИ: TZD-40 DONE, TZD-46 DONE

LAYER: 3 (edit существующего компонента — строго 1 агент)

CONFLICT KEYS: `frontend/src/app/pages/desktop/pairing-dialog.component.ts` ; `frontend/src/app/pages/desktop/pairing-dialog.component.spec.ts`

PAGES: (pairing dialog surface — no new route)
PAGE_DOCS: N/A

Проверено:
- `frontend/src/app/pages/desktop/pairing-dialog.component.ts:360-366` — `desktopVersionLabel()`:
  1) парсит semver из `effectiveDownloadUrl()` регэкспом `-v(\d+\.\d+\.\d+)`;
  2) иначе берёт `compat()?.recommendedDesktopVersion`;
  3) иначе **литерально возвращает строку `'v?'`**.
- `compat` — `signal<DesktopCompatInfo | null>(null)`, грузится в `ngOnInit → reloadCompat()`
  через `pairingApi.compat()` (`GET {baseUrl}/desktop/compat`, `@Public()`, без авторизации —
  `backend/src/modules/desktop/desktop-pairing.controller.ts:38-41`).
- Пока запрос не завершился ИЛИ завершился ошибкой (сеть/CORS/5xx) — `compat()` остаётся `null`
  и код всегда падает в ветку 3 → `v?`, если URL из `configuredDownloadUrl`
  (`DEFAULT_DESKTOP_DOWNLOAD_URL = '/downloads/kppdf-desktop-setup.zip'`, без версии в имени)
  не матчит регэксп.
- Компонент никак не различает «ещё грузится» / «запрос упал» / «сервер не отдал версию» —
  все три состояния схлопнуты в один и тот же видимый текст `v?`, который выглядит как баг,
  а не как осознанное состояние.

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. PO открыл диалог паринга на проде — кнопка показала «Скачать Desktop v?». Это как раз
   ветка 3 из `desktopVersionLabel()` — либо `/api/desktop/compat` не ответил вовремя/упал,
   либо ответил без `recommendedDesktopVersion`, а URL не versioned.
2. Ошибка выглядит как «сломанный сайт», хотя по логике это осознанный (но не оформленный)
   fallback. Отдельный вопрос — почему сам `/api/desktop/compat` не отвечает на проде —
   **вне scope этой TZ** (см. known_limitation, это deploy/config, не код).
3. Тестов на этот fallback-путь нет: `pairing-dialog.component.spec.ts` не проверяет
   поведение при `compat()` = null / error.

---

## ЧТО ДЕЛАТЬ

### ШАГ 1: Различить состояния compat

В `reloadCompat()` добавь явный сигнал состояния запроса (например
`compatStatus = signal<'loading' | 'ready' | 'error'>('loading')`), выставляемый по
результату `pairingApi.compat().subscribe(res => …)` (`res.ok` / `!res.ok`).
Не трогай саму форму `DesktopCompatInfo` и HTTP-контракт.

### ШАГ 2: Убрать литеральный `v?`

`desktopVersionLabel()` не должен возвращать строку `'v?'` пользователю:
- пока `compatStatus() === 'loading'` — кнопка показывает «Скачать Desktop» без версии
  (или лёгкий индикатор загрузки), не «v?»;
- при `compatStatus() === 'error'` — кнопка показывает «Скачать Desktop» без версии
  **и** `versionSubtitle()`/новый хинт показывает «Не удалось проверить версию» вместо
  пустого/бессмысленного текста;
- версия показывается **только** когда она реально известна (из URL или из
  `recommendedDesktopVersion`, как сейчас в ветках 1–2).

### ШАГ 3: Тесты

В `pairing-dialog.component.spec.ts` добавь кейсы:
- `compat()` ещё не пришёл → label без `v?`.
- `pairingApi.compat()` возвращает `{ ok: false, error }` → label без `v?`, есть
  различимый hint об ошибке.
- Существующие кейсы (URL с версией / `recommendedDesktopVersion` из compat) не ломать.

---

## ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ

ИЗМЕНЯТЬ:
- `frontend/src/app/pages/desktop/pairing-dialog.component.ts` — `compatStatus`, `desktopVersionLabel()`, `versionSubtitle()`
- `frontend/src/app/pages/desktop/pairing-dialog.component.spec.ts` — новые кейсы

НЕ ИЗМЕНЯТЬ:
- `backend/src/modules/desktop/desktop-compat.service.ts` — контракт/дефолты не трогать
- `deploy/synology/config.env` / `config.env.example` — это TZD-60/ops, не эта TZ
- `desktop/scripts/publish-installer.mjs`, `desktop/src-tauri/*` — desktop-installer, не FE
- semver / версии нигде не бампать

---

## КРИТЕРИИ ПРИЁМКИ

1. Ни при каком состоянии (loading / error / no data) UI не показывает буквальную строку `v?`.
2. При ошибке запроса `/desktop/compat` пользователь видит объясняющий текст, не пустоту/мусор.
3. Существующее поведение (URL с версией, `recommendedDesktopVersion` от сервера) не сломано.
4. `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit && pnpm test && pnpm lint` — PASS
   (минимум для затронутых файлов/фокусный прогон).
5. known_limitation ниже зафиксирован в отчёте.

known_limitation: эта TZ чинит **отображение**, не первопричину, почему `/api/desktop/compat`
может не отвечать на проде (см. `docs/audits/2026-08-12-desktop-download-version-naming-canon.md`
и TZD-60/ops-заметку в PROMPT-FREEBUFF — там же actual `DESKTOP_DOWNLOAD_URL/MIN/RECOMMENDED_VERSION`
всё ещё указывают на `v0.5.4`, а `desktop/package.json` уже `0.5.6`; сама публикация/деплой —
отдельное действие по явному слову PO, не для Freebuff.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-22
closed_by: claude-computer
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: PASS
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS

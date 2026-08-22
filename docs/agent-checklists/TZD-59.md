# TZD-59 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZD-59.md` (существует до archive)
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: `claude-computer`
- claimed_at: 2026-08-22T18:30:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable _(Team Room CLI недоступен в этой сессии)_

## Preflight

- [x] `git rev-parse --show-toplevel` → `D:/kppdf-8.0`, branch `main`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто, чужого CLAIM на conflict keys нет
- [x] TZ прочитан (`tasks/TZD-59-desktop-compat-version-failsafe.md`); deps TZD-40 / TZD-46 DONE
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZD-59.md` на месте

## Conflict keys

- `frontend/src/app/pages/desktop/pairing-dialog.component.ts`
- `frontend/src/app/pages/desktop/pairing-dialog.component.spec.ts`

## Acceptance

- [x] AC1: ни при loading / error / no-data UI не показывает литеральную строку `v?`
- [x] AC2: при ошибке `/desktop/compat` пользователь видит объясняющий текст
- [x] AC3: существующее поведение (versioned URL, `recommendedDesktopVersion`) не сломано
- [x] AC4: `frontend` tsc + jest (focused) + lint — PASS
- [x] AC5: known_limitation зафиксирован в отчёте

## План

1. `compatStatus = signal<'loading' | 'ready' | 'error'>('loading')`, выставляется в `reloadCompat()`.
2. `desktopVersionLabel()` возвращает `''` вместо `'v?'`; новый `downloadButtonLabel()` собирает
   «Скачать Desktop» / «Скачать Desktop v{semver}» — литерал `v?` удалён из кода.
3. `versionSubtitle()` при `compatStatus() === 'error'` → «Не удалось проверить версию».
4. Spec: кейсы loading (`NEVER`) и error (`{ ok: false }`), существующие кейсы не менять.

## Integrity slot (до READY / archive)

- [x] Тип изменения: page (FE-компонент диалога, без нового route)
- [x] FIC §A–E — N/A: нет нового поля/permission/модуля, только рендер-состояние компонента
- [x] page.md / PAGE-TZ-INDEX — N/A: TZ объявляет `PAGES: (pairing dialog surface — no new route)`, `PAGE_DOCS: N/A`
- [x] SECTION-READINESS — N/A: секция не меняет готовность, багфикс отображения
- [x] Чужой WIP не в коммите; stage только 2 файла conflict keys + checklist + archive + _NOW
- [x] Coupling map — N/A: общее поле/статус не тронут
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

Окружение: node v20 (Windows-хост D:\\kppdf-8.0), `pnpm` в этой сессии недоступен →
tsc запускался напрямую через `node node_modules\\typescript\\bin\\tsc`.
Jest/eslint на Windows-хосте не запускаются: `child_process.spawn` возвращает `EPERM`
для любого бинаря (проверено на `node.exe`, `cmd.exe`, `where.exe`), поэтому jest-worker и
sync-service esbuild падают до старта. Тесты и lint прогнаны на идентичном срезе
(`frontend/src` + `frontend/eslint` + package.json/pnpm-lock/jest.config/tsconfig*/eslint.config,
`pnpm install --frozen-lockfile`, тот же pnpm-lock.yaml) в Linux-окружении.

| Гейт | Команда | Результат |
| --- | --- | --- |
| typecheck | `node node_modules/typescript/bin/tsc -p tsconfig.app.json --noEmit` (Windows-хост) | **PASS** (exit 0) |
| tests (focused) | `npx jest --ci --runTestsByPath src/app/pages/desktop/pairing-dialog.component.spec.ts` | **PASS** — 14/14, в т.ч. 3 новых TZD-59 |
| tests (full suite) | `npx jest --ci --maxWorkers=2` | 175/177 suites, 1832/1840 tests PASS; 2 упавших suite — **pre-existing, вне scope** |
| lint | `npx eslint src/app/pages/desktop/` | **PASS** (exit 0, 0 warnings) |

Pre-existing падения (НЕ трогал, вне «Файлы для изменения»):
- `src/app/pages/login/login.page.spec.ts` — 4 теста, `NG0201: No provider found for ActivatedRoute` (RouterLink в шаблоне без `provideRouter`/stub в TestBed).
- `src/app/pages/production/production-read.facade.spec.ts` — 4 теста, `loadBarsForOrders` возвращает `[]` вместо ожидаемых bars.
Оба файла не пересекаются с conflict keys TZD-59; фиксирую как находку для PO, фикс отдельным TZ.

## Executor report

Изменено 2 файла (ровно conflict keys):

`frontend/src/app/pages/desktop/pairing-dialog.component.ts`
- добавлены `DESKTOP_DOWNLOAD_LABEL = 'Скачать Desktop'`, `DESKTOP_COMPAT_UNAVAILABLE_HINT = 'Не удалось проверить версию'`, тип `DesktopCompatStatus = 'loading' | 'ready' | 'error'`;
- новый сигнал `compatStatus`, выставляется в `reloadCompat()` через `subscribe({ next, error })` (на ошибке `compat` очищается);
- `desktopVersionLabel()` возвращает `''` вместо литерала `'v?'` — литерал `v?` удалён из кодовой базы компонента;
- новый `downloadButtonLabel()`: версия добавляется к подписи только когда известна; шаблон и `aria-label` используют его;
- `versionSubtitle()` при `compatStatus() === 'error'` отдаёт объясняющий текст.

`frontend/src/app/pages/desktop/pairing-dialog.component.spec.ts`
- +3 теста: loading (`NEVER`) → нет `v?`/версии/хинта; error (`{ ok: false, error }`) → хинт «Не удалось проверить версию» и нет `v?`; compat без версии и без URL → подпись кнопки ровно «Скачать Desktop». Существующие 11 тестов не менялись и проходят.

known_limitation (AC5): фикс — **display-only**. Он убирает `v?`/молчаливый провал в UI, но не устраняет причину, по которой `/api/desktop/compat` может отвечать ошибкой на prod. Смежная находка: `deploy/synology/config.env` держит `DESKTOP_RECOMMENDED_VERSION=0.5.4` и `DESKTOP_DOWNLOAD_URL=.../v0.5.4.zip`, тогда как `desktop/package.json` уже `0.5.6` — рассинхрон вне scope этого TZ (файл не трогал), решение и warm deploy — за PO.

Вне scope, не менял: `deploy/synology/config.env`, login/production specs, `desktop/`.

## Closeout

- [x] archive + lock + удалить `tasks/_active/TZD-59.md`
- [x] Status = DONE
- closed_at: 2026-08-22T19:05:00+03:00

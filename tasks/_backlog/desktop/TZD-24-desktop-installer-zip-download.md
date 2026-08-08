═══════════════════════════════════════════════════════════════
TZD-24: Desktop installer — раздача ZIP + не отдавать SPA на /downloads
═══════════════════════════════════════════════════════════════

> READY · LAYER 2 (ops/FE URL + Nest static) · можно параллелить с TZD-21
> (разные CONFLICT KEYS: здесь нет `auth/**` / pairing API).
>
> Триггер (PO 2026-08-08): «может зипом будем отдавать, если проблемы».
> На prod `GET /downloads/kppdf-desktop-setup.exe` → **text/html ~1.5KB**
> (Angular `index.html`) → CSP `script-src 'self'` ругается на inline в HTML.
> Это **не** «браузер не любит .exe»: файла нет / SPA fallback глотает путь.
>
> Проверено:
> - `HEAD` `backend/src/main.ts` — SPA `sendFile(index.html)` для **всех** GET
>   кроме `/api` и `/uploads` (**нет** исключения `/downloads`)
> - WT уже содержит черновик: static `/downloads/` + skip SPA (не закоммичен)
> - `deploy/synology/deploy.py` `publish_desktop_installer` копирует только `.exe`
> - `DEFAULT_DESKTOP_DOWNLOAD_URL` = `/downloads/kppdf-desktop-setup.exe`
> - Staging: `frontend/downloads/kppdf-desktop-setup.exe` ~9.5MB (gitignored)
> - Angular assets: `angular.json` `input: downloads` → `/downloads`

STATUS: DONE (archived 2026-08-08)

РОЛЬ АГЕНТА: Backend Nest bootstrap + deploy/publish scripts + FE default URL + docs.

ЗАВИСИМОСТИ:
- TZD-16 DONE (кнопка скачивания + injection `DESKTOP_DOWNLOAD_URL`)
- Локально должен существовать `frontend/downloads/kppdf-desktop-setup.exe`
  (или `desktop/dist-installers/…` после `pnpm tauri build`)

LAYER: 2

PAGES: pairing dialog (кнопка «Скачать приложение»)
PAGE_DOCS: `desktop/docs/PAIRING.md`; `desktop/docs/INSTALL.md`; `frontend/downloads/README.md`

CONFLICT KEYS:
backend/src/main.ts;
frontend/src/app/core/desktop-download-url.ts;
frontend/src/app/core/desktop-download-url.spec.ts;
frontend/src/app/pages/desktop/pairing-dialog.component.spec.ts;
desktop/scripts/publish-installer.mjs;
deploy/synology/deploy.py;
deploy/synology/README.md;
frontend/downloads/README.md;
desktop/docs/INSTALL.md;
desktop/docs/PAIRING.md;
desktop/README.md;
docs/agent-checklists/TZD-24.md;

---

## Domain preflight

| Тема | Канон |
|------|--------|
| Артефакт | Windows NSIS setup `.exe` **внутри** ZIP; пользователь скачивает ZIP |
| URL по умолчанию | `/downloads/kppdf-desktop-setup.zip` |
| Имя внутри ZIP | `kppdf-desktop-setup.exe` (один файл, без папки-обёртки) |
| Старый `.exe` URL | опционально оставить раздачу файла рядом; default кнопки = **только ZIP** |
| Unique / schema | N/A (статика, без Mongo) |

НЕ путать с: деплоем Docker образа, wipe Mongo, TZD-21 (pairing keys).

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. Prod/local backend без исключения `/downloads` → SPA HTML вместо бинарника.
2. Даже при skip SPA: если файла нет в `FRONTEND_PATH/downloads/` → 404
   (лучше HTML, но кнопка всё равно мёртвая).
3. Deploy копирует `.exe` в `frontend/browser/downloads/` только если кандидат
   найден; ZIP не создаёт.
4. CSP-шум в DevTools — **симптом** HTML, не причина.

---

## ЧТО ДЕЛАТЬ

### 1. Nest: никогда не отдавать SPA на `/downloads/*`
В `backend/src/main.ts` (можно взять незакоммиченный WT-дифф как базу):
- Mount `useStaticAssets` на каталог downloads (FRONTEND_PATH/downloads →
  browser/downloads → staging), prefix `/downloads/`.
- В SPA fallback middleware: `if (p.startsWith('/downloads')) return next();`
  (после `/api` / `/uploads`).
- Итог при отсутствии файла: **404**, не `index.html`.

### 2. Default URL → ZIP
- `DEFAULT_DESKTOP_DOWNLOAD_URL = '/downloads/kppdf-desktop-setup.zip'`
- Обновить Jest expectations в `desktop-download-url.spec.ts` и
  `pairing-dialog.component.spec.ts` (если хардкодят `.exe` default).
- Injection `DESKTOP_DOWNLOAD_URL` / пустая строка = disable — **не ломать**.

### 3. Publish + deploy: собирать ZIP
- `desktop/scripts/publish-installer.mjs`: после копирования `.exe` создать
  `kppdf-desktop-setup.zip` (внутри один `kppdf-desktop-setup.exe`) в
  `frontend/downloads/` и `frontend/browser/downloads/`.
  Кроссплатформа: Node `zlib` недостаточно для ZIP-контейнера — допустимы
  `powershell Compress-Archive` на win32 **или** чистый ZIP через stdlib/
  минимальную зависимость уже в репо; не тащить тяжёлый пакет без нужды.
- `deploy/synology/deploy.py` `publish_desktop_installer`:
  - копировать `.exe` как сейчас;
  - писать рядом `.zip` (`zipfile.ZipFile`, `ZIP_DEFLATED`, arcname =
    `kppdf-desktop-setup.exe`);
  - в лог — размеры обоих файлов;
  - warn если источника нет (как сейчас).

### 4. Docs (коротко)
Обновить пути в README/INSTALL/PAIRING/`frontend/downloads/README.md` /
`deploy/synology/README.md`: кнопка → `.zip`; внутри ZIP — setup.exe.

### 5. Verify локально до «закрыта»
```text
# после publish / ручного zip в frontend/browser/downloads/
# с запущенным Nest (NODE_ENV=production FRONTEND_PATH=… или dev static path)
curl -sI http://127.0.0.1:3000/downloads/kppdf-desktop-setup.zip
# → 200, Content-Type application/zip (или octet-stream),
#    Content-Length >> 100000 (не ~1500)
curl -sI http://127.0.0.1:3000/downloads/missing.bin
# → 404 (не text/html)
```

Gates:
```text
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- --testPathPattern=desktop-download-url
cd frontend && pnpm test -- --testPathPattern=pairing-dialog.component
```

### 6. Closeout
Checklist `docs/agent-checklists/TZD-24.md` + archive
`tasks/_archive/2026-08/TZD-24.done.md` + lock + progress + active-map.
**Deploy не запускать** без явной команды PO.

---

## ИЗМЕНЯТЬ

Файлы из CONFLICT KEYS (+ checklist/archive/progress/active-map по процедуре).

## НЕ ИЗМЕНЯТЬ

- Tauri/NSIS build pipeline (кроме publish-installer copy/zip)
- Pairing API / JWT / TZD-21 scope
- Helmet CSP (чинить раздачу файла, не ослаблять CSP под HTML)
- Коммит бинарников `.exe`/`.zip` в git (оставить gitignore)
- Mongo wipe / docker-compose секреты

---

## КРИТЕРИИ ПРИЁМКИ

- [ ] `GET /downloads/kppdf-desktop-setup.zip` при наличии файла → не HTML,
      размер ≈ размера ZIP (>> 1KB)
- [ ] Отсутствующий `/downloads/*` → **не** `index.html` (404 или empty next)
- [ ] Default кнопки pairing = `/downloads/kppdf-desktop-setup.zip`
- [ ] `publish-installer` и `deploy.py` кладут zip рядом с exe
- [ ] Docs согласованы; Jest default URL PASS
- [ ] BE+FE tsc PASS; binary не в git

known_limitation:
- Пока на сервере нет zip в образе/volume — кнопка 404 (ожидаемо);
  после следующего **явного** deploy с локальным staging exe — заработает.
- macOS/Linux installer — out of scope.

---

## Промпт исполнителю

```text
Прочитай GEMINI.md и tasks/_backlog/desktop/TZD-24-desktop-installer-zip-download.md.
Сделай checklist docs/agent-checklists/TZD-24.md до правок. Выполни TZD-24.
Не деплой без PO. WT-дифф backend/src/main.ts (downloads static + SPA skip) —
можно взять как базу, не потеряй.
```

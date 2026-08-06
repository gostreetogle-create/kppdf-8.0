═══════════════════════════════════════════════════════════════
TZD-16: Web pairing dialog — «Скачать приложение» + раздача установщика
═══════════════════════════════════════════════════════════════

> READY · LAYER 2 · web FE + deploy static (не параллелить с TZD-15 на `desktop/src/**` UI
> без согласования — этот TZ трогает **веб** pairing + **раздачу файла**, не inbox).
> Vision: `desktop/docs/PAIRING.md`, кнопка «Подключить десктоп» уже в layout.

РОЛЬ АГЕНТА: Frontend + light deploy (static file).

ЗАВИСИМОСТИ: TZD-05 (pairing dialog) DONE; TZD-14 DONE (host MCP). MSI/NSIS build
существует через `cd desktop && pnpm tauri build`.

LAYER: 2

PAGES: (web) pairing dialog from layout desktop button
PAGE_DOCS: optional note in `desktop/docs/PAIRING.md` + `desktop/README.md`

CONFLICT KEYS:
frontend/src/app/pages/desktop/pairing-dialog.component.ts;
frontend/src/app/pages/desktop/pairing-dialog.component.spec.ts;
frontend/src/app/layout/app-layout.component.ts (только если URL/конфиг прокидывается отсюда);
desktop/docs/PAIRING.md;
desktop/README.md;
deploy/synology/** (static path for installer — если трогаем nginx/compose);
.env.example / frontend environment (DESKTOP_DOWNLOAD_URL);

---

## ИСХОДНОЕ / ОТВЕТЫ PO (2026-08-06)

1. В диалоге «Подключить десктоп» нужна кнопка **«Скачать приложение»**.
2. Установщик (.exe NSIS или .msi) раздаёт **свой сервер** (Synology static) —
   пользователь скачивает и ставит локально.
3. Сейчас для проверки: локальный `tauri build`, артефакт **не** коммитить в git
   (бинарник большой); положить в gitignored папку или сразу на static.
4. Размер: Tauri обычно **десятки МБ**, не сотни как Electron — нормально для
   Synology. Node для MCP **не** бандлится в MSI (limit TZD-14) — в docs
   написать «нужен Node на машине» или successor bundling.

---

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Сборка артефакта (локально / CI later)

```text
cd desktop
pnpm install
pnpm tauri build
```

Ожидаемый путь (Windows):  
`desktop/src-tauri/target/release/bundle/nsis/*.exe` и/или `msi/*.msi`.

- Добавить `desktop/dist-installers/` в `.gitignore` (если ещё нет).
- Не коммитить `.exe`/`.msi` в репозиторий.

### ШАГ 2 — Раздача с Synology (deploy)

- Положить установщик на static, напр.  
  `https://<host>/downloads/kppdf-desktop-setup.exe`
- Nginx/Caddy/compose volume: read-only static dir.
- Документировать путь в `deploy/synology/README.md` (1 абзац).

### ШАГ 3 — Кнопка в pairing dialog

- В `pairing-dialog.component.ts` footer: secondary/outline  
  **«Скачать приложение»** (`data-test="pairing-download-button"`).
- `window.open(downloadUrl, '_blank')` или `<a [href] download>`.
- URL из environment / injection token, напр. `DESKTOP_DOWNLOAD_URL`
  (default relative `/downloads/kppdf-desktop-setup.exe` same origin).
- Если URL пустой — кнопка disabled + hint «Установщик скоро будет на сервере».
- Jest: кнопка видна; клик вызывает open/href с ожидаемым URL.

### ШАГ 4 — Docs

- `PAIRING.md`: шаги «скачать → установить → вставить JSON».
- Known limit: без bundled Node MCP host требует Node (TZD-14).

---

## НЕ

- Не бандлить Node в MSI в этом TZ.
- Не трогать TZD-15 inbox / MCP tools.
- Не `git add` бинарников.
- Не auto-update updater framework (successor).

---

## ACCEPTANCE

1. В диалоге паринга есть «Скачать приложение».
2. Клик открывает/скачивает файл с настроенного URL сервера.
3. Synology (или local static) отдаёт `.exe`/`.msi` 200 OK.
4. Бинарник не в git; docs описывают build + куда класть на сервер.
5. `pairing-dialog` jest PASS; FE scoped tsc/lint PASS.

---

## KNOWN LIMITATIONS

- Auto-update / signed code — later.
- macOS/Linux bundles — optional later; Windows first (PO).
- Node sidecar in MSI — separate TZ.

ФИНАЛИЗАЦИЯ: checklist `docs/agent-checklists/TZD-16.md`; archive после Cursor/PO PASS.

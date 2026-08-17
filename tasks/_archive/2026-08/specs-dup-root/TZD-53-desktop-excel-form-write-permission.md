═══════════════════════════════════════════════════════════════
TZD-53: Hotfix — Excel-форма не сохраняется на диск
═══════════════════════════════════════════════════════════════

> PO 2026-08-16: Desktop 0.5.4 — «Скачать Excel-форму» открывает диалог,
> папка пустая. MCP/модель не виноваты.
> Диагноз Cursor: binary `writeFile` без `fs:allow-write-file` в capabilities.

РОЛЬ АГЕНТА: Desktop (Tauri capabilities + тонкий UX ошибки)

ЗАВИСИМОСТИ: TZD-50/51/52 DONE (Form Studio + 0.5.4 на проде)

LAYER: 3

CONFLICT KEYS: `desktop/src-tauri/capabilities/default.json` ; `desktop/src/App.svelte` ; `docs/agent-checklists/TZD-53.md` ; (если bump) `desktop/package.json` ; `desktop/src-tauri/tauri.conf.json` ; `desktop/src-tauri/Cargo.toml`

PAGES: N/A
PAGE_DOCS: N/A ; `desktop/docs/INSTALL.md` — одна строка если уместно

STATUS: READY (P0 hotfix)

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ (проверено)
═══════════════════════════════════════════════════════════════

1. `downloadExcelForm()` в `App.svelte` (~1770): `serializeFormWorkbook` →
   `plugin-dialog` `save()` → `plugin-fs` **`writeFile(path, bytes)`** (бинарный .xlsx).
2. Hint явно: «Аккаунт для скачивания не нужен» — pairing / MCP / AI-модель
   **не требуются**.
3. `capabilities/default.json` имеет `fs:allow-write-text-file` (для CSV-отчёта),
   но **нет** `fs:allow-write-file` → бинарная запись отклоняется ACL Tauri 2.
4. Ошибка ловится в `catch` → `formMessage`, но файл не появляется; пользователь
   видит «диалог был / папка пустая».
5. Scope `$HOME/**` уже есть — путь в Загрузки пользователя ок; проблема permission, не scope.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Capabilities

  1.1. В `desktop/src-tauri/capabilities/default.json` добавить:
       - `"fs:allow-write-file"` (обязательно)
       - при необходимости `"dialog:allow-save"` (если save() требует явного; `dialog:default` уже есть — проверь schema)
  1.2. Не расширять scope сверх текущего без нужды.

ШАГ 2: UX ошибки / успеха

  2.1. После успешного `writeFile`: `formMessage` с **полным путём** файла
       (не только «сохранена»).
  2.2. В `catch`: русское сообщение + текст ошибки плагина (не глотать).
       Если permission denied — явная фраза: «Нет права записи файла (обновите Desktop)».
  2.3. Не требовать pairing для скачивания (оставить как есть).

ШАГ 3: Проверка

  3.1. `cd desktop && npx tsc --noEmit` + svelte-check threshold error.
  3.2. Ручной smoke (dev или rebuild): категория→таблица→Скачать→выбрать
       `%USERPROFILE%\Downloads\kppdf-material-form.xlsx` → файл существует,
       открывается в Excel, есть лист «Данные» + скрытый `_kppdf`.
  3.3. Регрессия: отчёт отклонений CSV (`writeTextFile`) всё ещё работает.

ШАГ 4: Релиз (в том же TZ, PO уже катил 0.5.4)

  4.1. Bump **0.5.5** (package + tauri.conf + Cargo.toml одинаково).
  4.2. `pnpm tauri build` + `publish-installer` (не травить stale dist-installers —
       см. TZD-52 gotcha).
  4.3. Warm deploy `WIPE=false` + `DESKTOP_*` на v0.5.5 (как TZD-52).
  4.4. Если LAN/VPN блок — STOP после локального publish, доложи; не fake deploy.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Логику колонок Form Studio / allowlist
- Требование MCP/модели для скачивания (его быть не должно)
- WIPE=true, чужой WIP seeds/PO-*
- Google Sheets

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] `fs:allow-write-file` в default capabilities
- [ ] Скачать форму без pairing → файл на диске по выбранному пути
- [ ] При ошибке — видимый RU `formMessage` с причиной
- [ ] Gates desktop tsc + svelte-check PASS
- [ ] 0.5.5 на сайте/LAN zip 200 (или BLOCKED с причиной deploy)
- [ ] Executor report (auto) + archive после Cursor PASS

known_limitation: если пользователь отменил диалог (`path` null) — файла нет, это норма.

HANDOFF: CLAIM → TZD-53.md + checklist → fix → bump 0.5.5 → build → warm deploy → READY FOR REVIEW.

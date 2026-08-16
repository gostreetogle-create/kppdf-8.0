# TZD-53: Hotfix — Excel-форма не сохраняется на диск (0.5.5)

> **P0 hotfix:** «Скачать Excel-форму» открывал диалог, но файл не появлялся.
> Причина: бинарный `writeFile` без `fs:allow-write-file` в Tauri capabilities
> (был только `fs:allow-write-text-file` для CSV).
>
> РОЛЬ АГЕНТА: Desktop (Tauri capabilities + тонкий UX ошибки) + bump 0.5.5.
>
> ЗАВИСИМОСТИ: TZD-50/51/52 DONE (Form Studio + 0.5.4 на проде).

LAYER: 3 (desktop capabilities + App.svelte + version trio)

CONFLICT KEYS: `desktop/src-tauri/capabilities/default.json` ; `desktop/src/App.svelte` ;
`desktop/package.json` ; `desktop/src-tauri/tauri.conf.json` ; `desktop/src-tauri/Cargo.toml` ;
`docs/agent-checklists/TZD-53.md`

CHECKLIST: `docs/agent-checklists/TZD-53.md`
REVIEW: required (Cursor Verdict **PASS** 2026-08-16, код — до closeout)

---

## Что сделано (коротко)

1. **Capabilities:** `default.json` += `fs:allow-write-file` (бинарный `.xlsx`);
   scope `$HOME/**` не расширялся.
2. **UX:** `downloadExcelForm()` — success: полный путь в `formMessage`;
   catch: RU + текст ошибки плагина; permission-denied → «нет права записи файла
   (обновите Desktop)». Pairing не требуется.
3. **Release:** bump trio == **0.5.5** (package.json / tauri.conf.json / Cargo.toml).
4. **Deploy: DEFERRED** — VPN off у PO; `tauri build` + `publish-installer` +
   warm deploy (WIPE=false) — после слова PO «кати» + VPN off.

## Verification

- `cd desktop && npx tsc --noEmit` → **PASS** (0 ошибок)
- `cd desktop && npx svelte-check --threshold error` → **PASS** (0 errors, 0 warnings)
- Version trio == **0.5.5**
- checklist: DONE (`docs/agent-checklists/TZD-53.md`)
- cursor verdict: PASS (код, 2026-08-16)

ARCHIVE_MARKER
outcome: DONE (код; deploy DEFERRED)
closed_at: 2026-08-16T19:47:00+03:00
closed_by: freebuff (deepseek-v4-pro)
TZ: TZD-53
DEP: TZD-50/51/52 DONE

verification:
  - acceptance criteria: PASS (код + gates; «zip на сайте» DEFERRED — VPN off)
  - typecheck: PASS (desktop tsc --noEmit)
  - svelte-check: PASS (0 errors, 0 warnings)
  - version: PASS (package.json == tauri.conf.json == Cargo.toml == 0.5.5)
  - checklist: DONE (docs/agent-checklists/TZD-53.md, Status DONE + closed_at)
  - cursor verdict: PASS (код ac7a49ed; deploy 0.5.5 DEFERRED до «кати» + VPN off)
  - commit: ac7a49ed3dca563404693a24c03546e27444a01b (chore(desktop): bump 0.5.5 — fs:allow-write-file for Excel form)
  - deploy: DEFERRED (VPN off у PO) — не деплоил

## Files

- `desktop/src-tauri/capabilities/default.json` (+`fs:allow-write-file`)
- `desktop/src/App.svelte` (полный путь + RU-ошибка permission)
- `desktop/package.json`, `desktop/src-tauri/tauri.conf.json`, `desktop/src-tauri/Cargo.toml` (0.5.5)
- `docs/agent-checklists/TZD-53.md`

## Known limits (successor)

- Deploy 0.5.5 — по слову PO «кати» + VPN off (warm, WIPE=false)
- Ручной smoke сохранения формы — после install/rebuild 0.5.5
- Отмена диалога (`path` null) → файла нет (норма)

# TZD-54: Desktop — три двери UI (Подключение | Импорт | AI)

> **IA shell** волны WAVE-DESKTOP-IA-SHELL. PO доверил раскладку «как архитектор
> считает» → канон три двери. Логику импорта/MCP/модели не переписывал — только shell.
>
> РОЛЬ АГЕНТА: Desktop UI (Svelte App.svelte + тонкий CSS).
>
> ЗАВИСИМОСТИ: TZD-53 code DONE (`ac7a49ed`, 0.5.5). TZD-55 — successor (раннер NSIS).

LAYER: 3

CONFLICT KEYS: `desktop/src/App.svelte` ; `desktop/src/ai-runner/index.ts` (строка) ;
`desktop/README.md` ; `desktop/docs/MCP.md` ; `docs/agent-checklists/TZD-54.md` ;
`tasks/_backlog/desktop/WAVE-DESKTOP-IA-SHELL.md`

CHECKLIST: `docs/agent-checklists/TZD-54.md`
REVIEW: required (Cursor Verdict **PASS** 2026-08-16 до archive)

---

## Что сделано (коротко)

1. **Tab model:** `DesktopTab = 'connection' | 'import' | 'ai'` (было `import|mcp|model`), default = `import`.
2. **Три вкладки RU:** Подключение | Импорт | AI (`data-test` tab-connection/tab-import/tab-ai; старые tab-mcp/tab-model удалены). Subtitle шапки без «MCP».
3. **Подключение** — только паринг (JSON, Подключиться/Отключиться, статус, compat-баннер).
4. **Импорт** — без изменений логики + шпаргалка 3 шага; `h2` → «Импорт».
5. **AI** — баннер «Импорт и Excel-формы работают без модели и без MCP.» + два блока: «Локальная модель» (status/выбор/Запустить/Скачать/Перезапустить + кнопка «Открыть папку моделей») и «MCP для агентов» (start/stop/порт/LAN/copy mcp.json + hint).
6. **`openModelFolder()`** — `defaultModelDir()` (app-data/models) + `openExternal` (паттерн inbox); `HINTS.openModelFolder`.
7. Ссылки «во вкладке «Модель»/«MCP»» → «во вкладке «AI»» (App.svelte + `ai-runner/index.ts`).
8. Docs: `desktop/README.md` (раздел «Три двери (TZD-54)») + `desktop/docs/MCP.md` («Где это в приложении»).

## Verification

- `cd desktop && npx tsc --noEmit` → **PASS** (0 ошибок)
- `cd desktop && npx svelte-check --threshold error` → **PASS** (0 errors, 0 warnings)
- `npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts` → **PASS 64/64**
- checklist: DONE (`docs/agent-checklists/TZD-54.md`)
- cursor verdict: PASS (2026-08-16, до closeout)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T20:29:00+03:00
closed_by: freebuff (deepseek-v4-pro)
TZ: TZD-54
DEP: TZD-53 DONE; TZD-55 successor

verification:
  - acceptance criteria: PASS (все чекбоксы TZD-54 + Cursor Verdict PASS)
  - typecheck: PASS (desktop tsc --noEmit)
  - svelte-check: PASS (0 errors, 0 warnings)
  - desktop tests: PASS 64/64
  - checklist: DONE (docs/agent-checklists/TZD-54.md, Status DONE + closed_at)
  - cursor verdict: PASS (2026-08-16; SHA 7db734d2a3d2fb9ddd9b5499561a44202bff5796)
  - commit: 7db734d2a3d2fb9ddd9b5499561a44202bff5796 (feat(desktop): TZD-54 — три двери Подключение|Импорт|AI (IA shell))
  - deploy: NO (не делал; bump версии не делал — 0.5.5 из TZD-53)

## Files

- `desktop/src/App.svelte` (tab model + три вкладки + баннер AI + openModelFolder + HINTS + ссылки)
- `desktop/src/ai-runner/index.ts` (строка «вкладке «Модель»» → «AI»)
- `desktop/README.md`, `desktop/docs/MCP.md`
- `docs/agent-checklists/TZD-54.md`

## Known limits (successor)

- Раннер в установленном NSIS-билде падает «path does not have a parent» (resolveDesktopDir ищет исходники) → **TZD-55**
- Ручной smoke UI — после установки/rebuild
- `resolveDesktopDir` / NSIS runner упаковка — TZD-55

# TZD-68 checklist — Desktop Excel: скачать реестр с данными

> Status: **DONE**
> Marker: `tasks/_active/TZD-68-excel-export-with-data.md` (removed after archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-05T20:00:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI configured in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` — Freebuff W2 warehouse `frontend-nx/**` only, не пересекается с `desktop/**`
- [x] `tasks/_active/` — только `TZ-NX-WAREHOUSE-W2-BALANCES.md` (Freebuff), нет конфликта по CONFLICT KEYS
- [x] TZ / WAVE / аудит прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZD-68-excel-export-with-data.md` на месте

### Preflight Check Output
- **Context read:** `tasks/_ready/desktop/TZD-68-excel-export-with-data.md`, `docs/audits/2026-09-05-desktop-excel-nx-align-audit.md`, `desktop/src/core/excel-form-template.ts(+.test.ts)`, `desktop/src/core/import-targets.ts`, `desktop/src/core/api.ts`, `desktop/src/App.svelte` (Form Studio section + existing `fetchDedupeKeys` GET patterns for `/api/materials`, `/api/work-types`), `desktop/docs/MCP.md`
- **Key Constraints:** только `desktop/**`; pilot export = material + workType only; export disabled без pairing; template-mode regression must stay green
- **Planned Deliverable:** `buildFormWorkbook(targetKey, {mode, rows})` + «Скачать с данными» button reusing existing GET helpers
- **Validation Path:** `desktop && npx tsc --noEmit` + `npx tsx --test src/core/excel-form-template.test.ts` (+ full core/importers suite) + `svelte-check` (extra, App.svelte isn't covered by bare `tsc`)

**Проверено:** `buildFormWorkbook` был только пустым скелетом; кнопка «Скачать Excel-форму» и dedupe-fetch (`/api/materials`, `/api/work-types`) уже в App.svelte — переиспользованы, не задублированы.

---

## Acceptance (из TZ)

- [x] Template mode поведение V1 без регрессии (все 14 прежних теста зелёные)
- [x] Export materials/workType: файл открывается, заголовки с ` *`, строки из API (round-trip тест через реальный `parseExcelWorkbook`)
- [x] Export → правка ячейки → загрузка в Import → fingerprint узнаёт targetKey (тот же fingerprint-механизм, `mode` — новое необязательное поле, не ломает parse старых форм)
- [x] Без pairing: export disabled (кнопка `disabled` без `connected`, плюс явная RU-проверка `cfg.apiKey`/`apiBaseUrl` в обработчике)
- [x] Gates desktop PASS

## Integrity slot

- [x] Тип изменения: other (desktop app feature, не web page/permission/module/MCP)
- [x] FIC: N/A — не веб-страница/право/модуль/MCP-сервер
- [x] page.md: N/A — `desktop/docs/MCP.md` обновлён одной секцией (TZ явно просил один liner про export)
- [x] DOMAIN-MAP: N/A
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; `frontend-nx/**` не открывался; conflict keys — только `excel-form-template.ts(+.test.ts)`, `App.svelte`, checklist/docs
- [x] COUPLING-MAP: N/A
- [x] Канон: `docs/DOCS-INTEGRITY.md` соблюдён

## Gates (факт)

- `cd desktop && npx tsc --noEmit` → PASS (не проверяет `.svelte`, см. ниже)
- `cd desktop && npx svelte-check --tsconfig ./tsconfig.json` → 0 ERRORS 0 WARNINGS (доп. проверка `<script lang="ts">` внутри `App.svelte`, т.к. голый `tsc` его не видит — `include` в `tsconfig.json` не покрывает `.svelte`)
- `cd desktop && npx tsx --test src/core/excel-form-template.test.ts` → PASS (21 тестов: 14 прежних без регрессии + 7 новых export)
- `cd desktop && npx tsx --test src/core/*.test.ts src/importers/*.test.ts` → PASS (88 тестов, 4 suites, 0 fail) — полный core+importers прогон по требованию TZ

## Executor report

**`desktop/src/core/excel-form-template.ts`:**
- `BuildFormWorkbookOptions { mode?: 'template'|'export', rows?: readonly Record<string,unknown>[] }`; `buildFormWorkbook`/`serializeFormWorkbook` accept it (default `mode: 'template'` — старое поведение байт-в-байт то же).
- `export` mode: data rows built from `options.rows` mapped by `column.key` (supports dotted keys like `dimensions.length` for future targets, though the V1 pilot columns don't need it); missing field → blank cell (never the string `"undefined"`).
- `mode` field added to the `_kppdf` fingerprint (new key, ignored gracefully by any older parser that doesn't know it) and to `FormFingerprint`/`readFormFingerprint` (defaults to `'template'` for forms generated before this TZ).
- `formFileName(targetKey, mode?)` — `export` suffix; `template` (default, omitted) unchanged.
- `EXPORT_PILOT_TARGET_KEYS = ['material', 'workType']` + `isExportPilotTargetKey()` — single source of truth reused by both the workbook builder (throws for out-of-pilot keys) and the UI (disables the button).

**`desktop/src/App.svelte`:**
- `fetchExportRows(api, targetKey)` — reuses the exact same GET calls `fetchDedupeKeys` already used (`/api/work-types` flat array; `/api/materials?limit=100&page=N` paginated `{items,total}`), no new endpoints.
- `downloadExcelExport()` — RU no-pairing guard, builds the export workbook, native save dialog (same pattern as `downloadExcelForm`), RU success/error message with row count.
- New «Скачать с данными» button next to «Скачать Excel-форму»; `disabled` when no table selected, busy, table outside the pilot, or not `connected`; inline RU hint explaining which case applies.

**`desktop/docs/MCP.md`:** one new paragraph under the existing Form Studio section describing «Скачать с данными» (pilot scope, pairing requirement).

**Conflict disclosure:** touched exactly `desktop/src/core/excel-form-template.ts(+.test.ts)`, `desktop/src/App.svelte`, `desktop/docs/MCP.md`, this checklist. Nothing in `frontend-nx/**`, `frontend/**`, Nest backend, or `/registries` Excel buttons (there are none — canon respected). Units and worker are explicitly TZD-69 scope, not touched here.

**Known limits (disclosed by the TZ itself):** export pilot is material+workType only; product/module/counterparty/etc. export is successor scope (TZD-69 adds worker as an *import* target, not export).

## Review handoff

- [x] No review-inbox wave requirement — archive directly after gates

## Closeout

- [x] archive + удалить `_active` + следующий TZD-69
- Status = DONE
- closed_at: 2026-09-05T20:20:00Z

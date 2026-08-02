# TZ-PRODUCTS-301-export-mismatch — verification log

**Scope (Layer-3 frontend only):**
- `frontend/src/app/pages/dictionaries/color-references-form-dialog.component.ts` — import/inject `ColorReferencesService` → `PiColorReferencesService` (существующий экспорт сервиса), комментарий про typed-result pattern.
- `frontend/src/app/shared/services/pi-color-references.service.ts` — `sortOrder?: number` в `ColorReference` interface + create/update payload types (минимально, по директиве b).

**Backend НЕ изменялся** (out of scope).

## Verification

| Gate | Result |
|---|---|
| frontend tsc (scope) | 0 errors in color-reference/pi-color files (49 total errors только в parallel-session `commercial/proposals/` — TZ-DEPLOY-301 WIP) |
| frontend jest pi-color-references color-references | 24/24 PASS (2 suites) |
| frontend ng build | exit 1 — ТОЛЬКО на `commercial/proposals/` + `pi-proposals.service.ts` (parallel TZ-DEPLOY-301, untracked WIP) — disclosure, не fix-force |
| git diff --check (мои файлы) | clean (только LF→CRLF warning) |
| verify-status.sh | PASS, 0 warnings |

## Known limitations / successors
- **Backend gap `sortOrder`:** frontend interface + payload types несут `sortOrder?: number`, но backend `ColorReference` schema/DTO его не имеют (backend out of scope). Если форма реально отправит `sortOrder` в POST/PATCH → backend whitelist вернёт 400. **Successor обязательный:** добавить `sortOrder` в backend DTO/schema (TZ-PRODUCTS.colorId / TZ-COLOR цепочка) ИЛИ убрать поле из формы. Документировано, не замалчивается.
- **Dead code:** `color-references-form-dialog.component.ts` (мн. число) — orphaned-файл (ничего его не импортирует), но компилируется; теперь починен и компилируется. Кандидат на удаление в cleanup-задаче, отмечено в archive.
- Parallel-сессиионные изменения не трогались (skills/, docs/, TZ-DEPLOY-301 proposals/).

## Executor report (auto) — TZ-PRODUCTS-301-export-mismatch
status: DONE
commits: b3beb13 (fix) + e2a4308e5dfb907181f8b68a000ac590c437a1f4 (closeout)
gates: jest 24/24 PASS; tsc 0 errors в моём scope (49 в чужих proposals WIP); ng build FAIL только на TZ-DEPLOY-301 proposals — out of scope; diff-check clean; verify-status PASS
known: backend sortOrder gap → successor; plural form-dialog = orphaned dead code (fixed to compile); sortOrder только в frontend, backend 400 если отправить
ask: —

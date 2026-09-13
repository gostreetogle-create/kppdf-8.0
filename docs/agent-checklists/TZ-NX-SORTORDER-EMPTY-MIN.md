# TZ-NX-SORTORDER-EMPTY-MIN checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-SORTORDER-EMPTY-MIN.md`
> Wave: `docs/agent-checklists/WAVE-2026-09-13-SUCCESSORS.md` (2.3)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-13T20:00:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (unattended CLI, no team-room MCP)

## Preflight

- [x] git fetch/merge, status checked — up to date, `_active` empty before claim
- [x] TZ read in full — ШАГ 0 (live Network evidence) explicitly mandatory,
  done before any code change
- [x] Claim slot filled; marker in `tasks/_active/`

### Preflight Check Output
- **Context read:** TZ text; `http-exception.filter.ts` (RU message canon);
  `table-template-form-dialog.component.ts` (full — `sortOrder: [0]`, raw
  `v.sortOrder` in payload); `doc-studio-payloads.ts` (full —
  `tableTemplatePayload`/`textBlockPayload` both pass `sortOrder` through
  unchanged); `create-table-template.dto.ts` / `update-table-template.dto.ts`
  (confirmed `@Min(0)`, no `@Type`); `text-block-form-dialog.component.ts`
  + `create-text-block.dto.ts` (same FE pattern, no `@Min` on its DTO);
  `input.component.ts`'s CVA (`onInput($any($event.target).value)` — always
  string, confirms the domain-preflight's mechanics claim)
- **Key Constraints:** ШАГ 0 live evidence mandatory before any fix; don't
  globally rewrite number inputs; don't weaken `@Min` semantics for real
  negative values; 1–2 forms is an acceptable scope per the TZ's own
  known_limitation, not every DTO the preflight speculatively listed
- **Planned Deliverable:** FE payload fix in the shared
  `doc-studio-payloads.ts` (closes table-template AND text-block at once,
  same file); BE `@Transform` belt on `CreateTableTemplateDto.sortOrder`
  only (the one DTO with `@Min` that ШАГ 0 actually reproduced); specs both
  sides
- **Validation Path:** live Network repro before AND after; BE tsc/jest +
  FE tsc/jest (scoped then full) + eslint (scoped) + architecture:check +
  `nx build kppdf-web` last

## Evidence

См. `docs/agent-checklists/evidence/TZ-NX-SORTORDER-EMPTY-MIN.txt`

## Acceptance (из TZ)

- [x] 1. Evidence: endpoint (`POST /api/table-templates`) + сырое значение
  (`sortOrder:""`) + полное сообщение (`Значение слишком мало; Должно быть
  числом`) — зафиксировано до фикса
- [x] 2. Пустой «Порядок» сохраняет сущность без этой ошибки —
  live-подтверждено (400→201, `sortOrder` omitted, схемный default 0)
- [x] 3. Specs FE payload и BE DTO — 5 FE + 5 BE новых тестов, все PASS
- [x] 4. Gates зоны — PASS, см. Gates

## Integrity slot (до READY / archive)

- [x] Тип изменения: bugfix (FE payload omission + BE belt-and-braces
  transform), не новая архитектура
- [x] FIC: N/A (no new page/permission/module)
- [x] page.md: не требуется — не новый контракт страницы, исправление
  существующего поведения формы «Вид таблицы»/«Тексты» без изменения UI
- [x] DOMAIN-MAP: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены: `doc-studio-payloads.ts`
  (+ `.spec.ts`), `create-table-template.dto.ts` (+ новый `.spec.ts`) — ровно
  файлы, подтверждённые ШАГ 0
- [x] Канон: не трогал глобальный `app-pi-input`; не ослаблял `@Min(0)` для
  реальных отрицательных значений (spec подтверждает -1 всё ещё 400); не
  добавлял `@Transform` в `create-text-block.dto.ts` (нет `@Min`, не нужно);
  не проверял/трогал остальные DTO из preflight-списка (unit, role,
  document-table-type, quotation lines, composition-line) — нет живой
  evidence по ним в этой сессии, per known_limitation; тестовый вид таблицы
  удалён сразу после live-проверки (no pollution)

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → exit 0
- `cd backend && pnpm exec jest create-table-template.dto --silent` → 5/5 PASS (new file)
- `cd backend && pnpm exec jest --silent` (full) → 136 suites / 1353 tests PASS (was 1348)
- `cd backend && pnpm exec eslint src/modules/table-template/dto/create-table-template.dto.ts src/modules/table-template/dto/create-table-template.dto.spec.ts` → 0 problems
- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → exit 0
- `cd frontend-nx && pnpm exec nx test kppdf-web --skip-nx-cache --testFile=doc-studio-payloads.spec.ts` → 8/8 PASS (was 3)
- `cd frontend-nx && pnpm exec nx test kppdf-web --skip-nx-cache` (full) → 125 suites / 897 passed + 7 skipped (904 total) PASS (was 899)
- `cd frontend-nx && pnpm exec eslint apps/kppdf-web/src/app/doc-studio/shared/doc-studio-payloads.ts apps/kppdf-web/src/app/doc-studio/shared/doc-studio-payloads.spec.ts` → 0 problems
- `pnpm architecture:check` (repo root) → PASS
- `cd frontend-nx && pnpm exec nx build kppdf-web` (last) → exit 0, pre-existing unrelated warnings only
- Live Playwright/curl (local dev, admin/admin123): before-fix 400 with the
  exact PO-reported message reproduced; after-fix 201, `sortOrder` omitted
  from request, no visible alert, test record cleaned up

## Executor report

**ШАГ 0 followed literally — evidence before any code:** reproduced the
exact PO-reported message live on `/registries/table-templates` before
writing a single line of fix code, confirming both the endpoint
(`POST /api/table-templates`) and the raw request shape
(`sortOrder: ""`) exactly as the TZ's own domain-preflight predicted.

**Fixed the shared root cause once, not per-form:** `doc-studio-payloads.ts`
is the payload builder for BOTH `table-template-form-dialog` and
`text-block-form-dialog` (same file, same "Порядок" pattern, same missing
`Number()` wrap) — fixing the one shared function closed both forms'
instance of the bug in a single change, not two separate patches.

**Scoped the BE belt to what evidence actually showed:** only
`CreateTableTemplateDto` got the `@Transform` belt, because only its
`@Min(0)` produced the exact PO-reported "Значение слишком мало". Text-block's
DTO has no `@Min` (would only ever say "Должно быть числом"), and is
already fixed by the FE change — adding an unrequested `@Transform` there
would be untested scope, not the necessity-driven fix the TZ asked for.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-13T20:35:00Z

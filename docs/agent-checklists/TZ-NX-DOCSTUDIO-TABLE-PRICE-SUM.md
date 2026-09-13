# TZ-NX-DOCSTUDIO-TABLE-PRICE-SUM checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-TABLE-PRICE-SUM.md`
> Wave: `docs/agent-checklists/WAVE-2026-09-13-SUCCESSORS.md` (3.1)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-13T23:15:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (unattended CLI, no team-room MCP)

## Preflight

- [x] git fetch/merge, status checked — up to date with origin/main
  (`3c122f96`), `_active` empty before claim
- [x] TZ + audit read in full; `studio-data-resolver.ts` (`COLUMN_ALIASES`,
  `lineValue`, `fetchLiveRows`'s catalog price read) read in full;
  `studio-table-defaults.ts` (`STUDIO_STANDARD_COLUMN_ALIASES`/`_FIELDS`,
  `missingStandardColumnFields`) read in full; `studio-table-properties.component.ts`
  read in full (quick-add chips, type-select, `emitColumnStructure` choke
  point); existing spec files read for fixture/pattern conventions
- [x] Claim slot filled; marker in `tasks/_active/`

### Preflight Check Output
- **Context read:** TZ text (incl. Domain preflight, known_limitation);
  audit `docs/audits/2026-09-13-docstudio-table-price-sum.md`;
  `studio-data-resolver.ts`/`.spec.ts` (full); `studio-table-defaults.ts`/
  `.spec.ts` (full); `studio-table-properties.component.ts`/`.spec.ts`
  (full); `document-studio.page.md` §1.3/§3.6 current text
- **Key Constraints:** modules have no price field — 0 is correct, not a
  bug (don't add a schema field); price stays read-only on canvas (qty
  override is the only editable live cell, unchanged); type-select lock is
  cosmetic/UX only (`lineValue` never reads `type`) — don't remove the
  field from the schema; don't touch other TZ waves' files
- **Planned Deliverable:** BE+FE price alias parity; FE sum alias group +
  quick-add chip; label-heal + type-canon on every column-structure change;
  type-select lock for standard keys; specs both sides; page.md
- **Validation Path:** BE tsc/jest (resolver) + FE tsc/jest (kppdf-web,
  both touched spec files + full suite) + eslint (scoped) +
  architecture:check + `nx build kppdf-web` + live curl (real Mongo
  product, real preview render, qty-override recompute) + live Playwright
  (quick-add chip + type-select lock in a real browser)

## Evidence

См. `docs/agent-checklists/evidence/TZ-NX-DOCSTUDIO-TABLE-PRICE-SUM.txt`

## Acceptance (из TZ)

- [x] 1. Изделие с `listPrice`, qty override 5 -> price/sum корректны —
  live-подтверждено curl'ом на реальном товаре (`021`, listPrice=300):
  qty=1 -> sum=300; qty override 5 -> sum=1500. Тот же сценарий с qty=1/3
  уже был покрыт существующими spec'ами TZ-NX-DOCSTUDIO-TABLE-LINE-QTY
  (не переписывал — только добавил alias/module-специфичные тесты)
- [x] 2. Chip «+ Сумма» появляется и добавляет key=sum/label=Сумма;
  liveRows пересчитываются — live-подтверждено Playwright (реальный
  браузер) + spec
- [x] 3. Дубль «Цена»/«Цена» после heal -> «Цена»/«Сумма» — spec
  (`healStudioTableColumns`, точный repro из PO-скрина)
- [x] 4. Модули без цены -> price/sum = 0, не падают — BE spec (реальная
  форма `ProductModule`-мока без ценового поля через
  `StudioDataResolverService`, не только через `lineValue` напрямую)
- [x] 5. Type-select не крутится оператором для known key — live-
  подтверждено Playwright (price disabled=True И новый sum disabled=True
  сразу после add) + spec (price disabled, custom key `col4` enabled)
- [x] 6. Gates — все PASS, см. Gates ниже

## Integrity slot (до READY / archive)

- [x] Тип изменения: alias-list extension (BE+FE parity) + один новый quick-
  add field + один новый чистый helper (`healStudioTableColumns`) wired в
  уже существующий choke point (`emitColumnStructure`) + один `[disabled]`
  binding на уже существующем select — не новая архитектура, не второй
  write-path
- [x] FIC: N/A (no new route/permission/module)
- [x] page.md: `docs/pages/document-studio.page.md` обновлён (§1.3 alias-
  список + новый абзац "Цена из каталога + «Сумма»" с known_limitation про
  модули, §3.6 quick-add палитра + type-select упоминание)
- [x] DOMAIN-MAP: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены — ровно перечисленные
  в TZ файлы (BE resolver+spec, FE defaults+spec, FE properties+spec,
  page.md)
- [x] Канон: не трогал Product/Module schema (никакого нового ценового
  поля модулям); не трогал inline-edit цены на холсте (остаётся read-only,
  только qty editable — не менял); не трогал второй select «источник»/
  wipe/deploy; не трогал чужие волны (WAVE1/2 закрытое, ISSUER 403-WARN,
  TOKEN-EDITOR-CHIP — следующий TZ этой же волны, ещё не начат на момент
  этого коммита); оба throwaway документа удалены сразу после проверки
  (один через API до появления доп. полей, оба — через прямой Mongo delete
  в конце, поскольку блоки таблиц удаляются не через studio-documents API)

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → exit 0
- `cd backend && pnpm exec jest studio-data-resolver --silent` → 37/37 PASS (was 34)
- `cd backend && pnpm exec jest --silent` (full) → 136 suites / 1364 tests PASS (was 1361)
- `cd backend && pnpm exec eslint src/modules/studio-document/studio-data-resolver.ts src/modules/studio-document/studio-data-resolver.spec.ts` → 0 problems
- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → exit 0
- `cd frontend-nx && pnpm exec nx test kppdf-web --testFile=studio-table-defaults.spec.ts` → 30/30 PASS (was 17)
- `cd frontend-nx && pnpm exec nx test kppdf-web --testFile=studio-table-properties.component.spec.ts` → 24/24 PASS (was 21)
- `cd frontend-nx && pnpm exec nx test kppdf-web` (full) → 125 suites / 916 passed + 7 skipped (923 total) PASS (was 903)
- `cd frontend-nx && pnpm exec eslint apps/kppdf-web/src/app/pages/studio/studio-table-defaults.ts apps/kppdf-web/src/app/pages/studio/studio-table-defaults.spec.ts apps/kppdf-web/src/app/pages/studio/studio-table-properties.component.ts apps/kppdf-web/src/app/pages/studio/studio-table-properties.component.spec.ts` → 0 errors, 39 pre-existing-style warnings
- `pnpm architecture:check` (repo root) → PASS
- `cd frontend-nx && pnpm exec nx build kppdf-web` (last) → exit 0, pre-existing unrelated warnings only
- Live curl + real Mongo (listPrice-key bind, sum=price*qty at qty=1 and
  qty=5) + live Playwright (quick-add chip, type-select lock on both
  pre-existing and newly-added columns) — both PASS, both throwaway
  documents deleted (docker exec mongosh)

## Executor report

**Root-caused the exact PO screenshot, not just the general class of bug:**
the audit already pinned "second Цена column showing 0" to a sum column
mislabeled "Цена" — `healStudioTableColumns` targets precisely that (empty
or "цена"-duplicate label on a sum-alias key -> "Сумма"), leaving any
deliberate custom label untouched rather than blanket-relabeling every
column that happens to match a key.

**Verified the `price*qty` acceptance scenario was already covered before
writing a duplicate test:** TZ-NX-DOCSTUDIO-TABLE-LINE-QTY's existing
`blockWithSum` tests already exercised qty=1 default and qty=3 override
with a `sum` column present — confirmed by reading, not assuming, and only
added the alias-parity and module-specific gaps that were genuinely
missing (price aliases, sum aliases, modules-without-price).

**Live-verified on a real backend + real browser, not just mocks:** curl
against the running dev BE with a real product (not a test fixture)
confirmed the `listPrice` key literally binds through the resolver end-to-
end into the rendered preview HTML; Playwright against the actual running
FE confirmed the quick-add chip and type-select lock render and behave
correctly in a live browser, including that a column added mid-session
gets the lock immediately (not just pre-existing ones from initial load).

**One project-specific testing nuance re-applied, not re-discovered:** the
new type-select-disabled test needed the same `await fixture.whenStable();
fixture.detectChanges();` microtask flush already documented elsewhere in
this exact spec file for `[ngModel]`-bound elements — confirmed the
underlying logic (`isKnownColumnKey('price')`) was already correct
synchronously before reaching for that fix, to avoid papering over an
actual bug with a timing workaround.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-14T00:15:00Z

# TZ-NX-DOCSTUDIO-TOKEN-EDITOR-CHIP checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-TOKEN-EDITOR-CHIP.md`
> Wave: `docs/agent-checklists/WAVE-2026-09-13-SUCCESSORS.md` (3.2, last in wave — WAVE3_DONE)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-14T00:15:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (unattended CLI, no team-room MCP)

## Preflight

- [x] git fetch/merge, status checked — up to date with origin/main
  (`12c35ee1`), `_active` empty before claim
- [x] TZ + audit read in full; `substitution-token.extension.ts`,
  `pi-rich-text-editor.component.ts` (RTE's own migrate-on-load +
  chip CSS), `studio-blocks-canvas.component.ts` (`textHtml`, dead S44
  CSS) read in full; `studio-text-properties.component.ts`,
  `studio-properties-panel.component.ts`, `studio-editor.page.ts`
  (viewMode/preview split, existing loaded-context signals) read in full;
  `document-render.service.ts`'s `substitute()` read (dotted-path walk to
  mirror client-side); `document-template.service.ts`'s
  `buildSubstitutionBag`/`resolveSourceIds`/`organizationRenderData` read
  (bag field-shape parity for the client-side bag)
- [x] Claim slot filled; marker in `tasks/_active/`

### Preflight Check Output
- **Context read:** TZ text (incl. Domain/PO decision, known accept
  criteria); audit `docs/audits/2026-09-13-docstudio-token-editor-chip.md`;
  every file listed above, full reads not excerpts
- **Key Constraints:** default = chips; toggle is session-level (not
  per-block, not persisted); «Значения» must not write to `block.content`
  or open a second write-path; dblclick must always edit tokens regardless
  of canvas mode; PDF/Просмотр must stay chip-free; no confusing this
  toggle with chrome «Просмотр»
- **Planned Deliverable:** canvas chip rendering (reuse RTE's existing
  `migratePlainTokensToNodes`, now exported publicly); session toggle in
  Свойства текста; client-side substitution bag from already-loaded editor
  context (no new backend endpoint — TZ's own preferred option); specs;
  docs
- **Validation Path:** FE tsc/jest (4 touched/new spec files + full
  kppdf-web suite + paper-and-ink lib suite) + eslint (scoped) +
  architecture:check + `nx build kppdf-web` + live Playwright (chip
  default, values-mode substitution with a real DB value, dblclick
  independence, mode-switch-back)

## Evidence

См. `docs/agent-checklists/evidence/TZ-NX-DOCSTUDIO-TOKEN-EDITOR-CHIP.txt`

## Acceptance (из TZ)

- [x] 1. Default: `{{organization.shortName}}` = заметный chip, не body
  text — live-подтверждено Playwright + spec
- [x] 2. Свойства → Значения: на холсте видно значение (если в контексте
  есть данные); content в API по-прежнему с `{{…}}` — live-подтверждено
  (реальный counterparty.shortName подставился на холсте; RTE открытый
  дабл-кликом по-прежнему показывает raw `{{…}}`) + spec
- [x] 3. Снова Токены → chip'ы возвращаются без reload документа — live-
  подтверждено Playwright + spec
- [x] 4. Режим переживает смену блока в сессии; F5 → снова default
  Токены — по конструкции (session signal in `studio-editor.page.ts`, не
  персистится); spec подтверждает default и toggle
- [x] 5. Просмотр/PDF без editor-chip стилей — по конструкции: canvas
  component (и его новый CSS) рендерится ТОЛЬКО в `viewMode() !== 'preview'`
  ветке шаблона `studio-editor.page.ts` (подтверждено чтением, не
  предположением); `document-render.service.ts`'s `substitute()` никогда
  не оборачивал значение в span — этот TZ его не трогал
- [x] 6. Gates — все PASS, см. Gates ниже

## Integrity slot (до READY / archive)

- [x] Тип изменения: reuse existing `migratePlainTokensToNodes` (was
  RTE-only, now also exported + used by canvas) + один новый session
  signal + один client-side computed bag (без нового backend API, per
  TZ's own preferred option) — не новая архитектура, не второй write-path
- [x] FIC: N/A (no new route/permission/module)
- [x] page.md: `docs/pages/document-studio.page.md` обновлён (§2.1
  table row, §2.2 новый абзац с known_limitation, §3.5 bullet для сегмента)
- [x] DOMAIN-MAP: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены — ровно
  перечисленные в TZ файлы (`studio-blocks-canvas.component.ts/.spec.ts`,
  `studio-text-properties.component.ts/.spec.ts`, `studio-editor.page.ts`,
  `substitution-token.extension.ts` — untouched, only its barrel export
  widened — `pi-rich-text-editor.component.ts` — untouched, page.md) plus
  `studio-block-helpers.ts/.spec.ts` (new pure functions — natural home,
  already imported by the canvas component), `rich-text/index.ts` (barrel
  export addition, required to import `migratePlainTokensToNodes` outside
  the lib), `studio-properties-panel.component.ts` (thin pass-through,
  unavoidable — it sits between the editor and the text-properties
  component in the existing component tree), and a new
  `studio-editor-token-display.spec.ts` (matches this page's established
  one-file-per-concern spec-split convention, not scope creep)
- [x] Канон: no BE changes at all (the "тонкий resolve API" SIZE
  escape-hatch was not needed); did not persist the display mode to Mongo;
  did not write substituted values back into `block.content`; did not
  touch chrome «Просмотр»/PDF rendering; RTE dialog needed zero changes
  (dblclick-independence came for free from the existing component split);
  both throwaway test documents (one abandoned after hitting the
  DOCSTUDIO-ISSUER-SELECT known_limitation lockout, one used for the final
  successful verification) deleted via direct Mongo immediately after use

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → exit 0 (one interim TS1005 self-caught: backticks inside a `styles: [\`...\`]` JSDoc comment — fixed to a plain comment, a previously-logged pitfall applied proactively)
- `cd frontend-nx && pnpm exec nx test kppdf-web --testFile=studio-block-helpers.spec.ts` → all PASS (+22 new)
- `cd frontend-nx && pnpm exec nx test kppdf-web --testFile=studio-blocks-canvas.component.spec.ts` → 18/18 PASS (was 14)
- `cd frontend-nx && pnpm exec nx test kppdf-web --testFile=studio-text-properties.component.spec.ts` → 5/5 PASS (was 2)
- `cd frontend-nx && pnpm exec nx test kppdf-web --testFile=studio-editor-token-display.spec.ts` → 4/4 PASS (new file)
- `cd frontend-nx && pnpm exec nx test kppdf-web` (full) → 126 suites / 937 passed + 7 skipped (944 total) PASS (was 125/916)
- `cd frontend-nx && pnpm exec nx test paper-and-ink` (lib, rich-text barrel touched) → 35/35 suites, 363/363 tests PASS
- `cd frontend-nx && pnpm exec eslint <all touched files>` → 0 errors, 30 pre-existing-style warnings
- `pnpm architecture:check` (repo root) → PASS
- `cd frontend-nx && pnpm exec nx build kppdf-web` (last) → exit 0, pre-existing unrelated warnings only
- Live Playwright (chip default, Значения-mode substitution with a real
  counterparty value, dblclick-always-tokens via the RTE dialog,
  mode-switch-back without reload) — PASS, both throwaway docs/blocks
  deleted via direct Mongo

## Executor report

**Reused, not reinvented:** `migratePlainTokensToNodes` already existed
and was already correct (the RTE dialog proved it) — this TZ's entire
ШАГ1 was widening its export surface (it was accidentally lib-internal)
and calling the SAME function from the canvas, not writing a second
token-chip implementation. The chip CSS was copied from the RTE's own
style block rather than invented fresh, so a token looks identical in
both places.

**Picked the TZ's own preferred, simpler option over the escape hatch:**
the TZ explicitly offered a "тонкий resolve API" as a fallback (SIZE
S→M) but preferred building the bag from context the editor session
already loads. Confirmed that option covers every token namespace the
audit's own repro and the ACCEPT criteria actually need
(`organization`/`counterparty`/`anchor`/`quotation`/`order`), so no new
backend endpoint was written — zero BE files touched by this TZ.

**Chose and documented the unresolved-token treatment the TZ explicitly
left open:** "оставить chip или «—»" — picked "keep the chip" (reusing the
exact same markup `migratePlainTokensToNodes` already produces, rather
than inventing a third string template) since a resolved-to-ink token
sitting next to a still-chipped one is itself a legible signal, and
documented the choice in both the evidence file and page.md per the TZ's
own "выбрать одно, задокументировать" instruction.

**Caught a known project pitfall proactively:** a JSDoc comment with
inline-code backticks inside a component's `styles: [\`...\`]` array
broke the build with a cryptic `TS1005` and no useful location — this
exact failure mode was already in this agent's own memory from a prior
session, so it was fixed on sight (plain comment, no backticks) rather
than re-diagnosed from scratch.

**Live-verified the exact audit repro on a real DB value, not a mock:** a
throwaway document's canvas literally showed "Klient: Загородный Дом" (a
real Counterparty's shortName) after switching to «Значения», then
reverted to the raw `{{counterparty.shortName}}` chip on switching back —
and double-clicking the SAME block into the RTE dialog showed the raw
token throughout, confirming dblclick-independence needed no special-case
code at all, purely a consequence of the RTE being a structurally separate
component.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-14T01:15:00Z

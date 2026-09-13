# TZ-NX-DOCSTUDIO-SELECTED-REPLACE-JUMP checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-SELECTED-REPLACE-JUMP.md`
> Wave: `docs/agent-checklists/WAVE-2026-09-13-STUDIO-OPS.md` (1.3)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-13T11:15:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (unattended CLI, no team-room MCP)

## Preflight

- [x] `tasks/_active/` empty before claim (TZ 1.2 archived first)
- [x] TZ + audit (`docs/audits/2026-09-13-docstudio-selected-replace.md`) read
- [x] Claim slot filled; marker in `tasks/_active/`

### Preflight Check Output
- **Context read:** TZ text, audit, `studio-data-panel.component.ts` (chip rendering, `mode='selected'`, anchors/catalog chip actions), `studio-editor.page.ts` (`onSection`, `activeCategory`/TOC focus wiring)
- **Key Constraints:** no new picker/modal — reuse existing Данные TOC selects; not parallel with ADD-PAGE/NECESSITY on `studio-editor.page.ts` (both now DONE for wave 1, no conflict)
- **Planned Deliverable:** «Изменить» button on anchor/catalog chips → `editSelection` emit → editor jump map → section 'data' + TOC category + focus target select
- **Validation Path:** panel + editor specs; `nx build kppdf-web` last; short page.md note

## Evidence (ШАГ 0)

См. `docs/agent-checklists/evidence/TZ-NX-DOCSTUDIO-SELECTED-REPLACE-JUMP.txt`

## Acceptance (из TZ)

- [x] 1. Чип Клиента: «Изменить» → панель Данные, TOC Кому, виден select Клиент с текущим значением — подтверждено живым Playwright-прогоном (focus на select после jump)
- [x] 2. Чип Поставщика: → TOC Ещё + select Поставщик — jump map + unit-тест (`supplier` → `more`)
- [x] 3. Чип «N изделия»: «Изменить» → Товары/витрина; × по-прежнему чистит selection — unit-тест подтверждает оба (editSelection + catalogRemove отдельно)
- [x] 4. Specs + `nx build kppdf-web` last — все PASS, см. Gates
- [x] 5. `document-studio.page.md` §Выбрано обновлён

## Integrity slot (до READY / archive)

- [x] Тип изменения: UI (jump wiring, reuse existing TOC/select, no new dialog)
- [x] FIC: N/A
- [x] page.md: `docs/pages/document-studio.page.md` §Выбрано — новый абзац
- [x] DOMAIN-MAP: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (`studio-data-panel.component.ts`/.spec + `studio-editor.page.ts` + новый editor spec)
- [x] Канон: не создавал новый Counterparty picker; не трогал BE context schema; переиспользовал существующие TOC/select/write-path

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → exit 0
- `cd frontend-nx && pnpm exec jest studio-data-panel.component.spec.ts studio-editor-selected-jump.spec.ts --silent` → 26/26 PASS
- `cd frontend-nx && pnpm test` (full) → 125 suites / 865 passed + 7 skipped (872 total) PASS
- `cd frontend-nx && pnpm exec eslint apps/kppdf-web/src/app/pages/studio/studio-data-panel.component.ts apps/kppdf-web/src/app/pages/studio/studio-data-panel.component.spec.ts apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts apps/kppdf-web/src/app/pages/studio/studio-editor-selected-jump.spec.ts` → 0 errors, 5 pre-existing-pattern warnings
- `pnpm architecture:check` (repo root) → PASS
- `cd frontend-nx && pnpm exec nx build kppdf-web` (last) → exit 0
- Live Playwright (local dev, real backend): picked a real Client counterparty, opened «Выбрано», clicked «Изменить» → landed on Данные/Кому with the counterparty select actually focused (`document.activeElement`) — see evidence/

## Executor report

**Root cause / gap (matches audit exactly):** anchor chips in the «Выбрано» buffer had no action at all (only catalog chips had `×`), and `studio-data-panel.component.ts`'s `activeCategory` TOC state was a private signal with no way for the host editor to command it from outside — the write-paths (`onCounterpartyChange`/`onAnchorChange`/`onCatalogSelectionChange`) already existed, so a second picker/modal was never needed, only a jump.

**Fix:**
1. `StudioDataPanelCategoryJump { category, nonce }` — new input + a constructor `effect()` on the data panel that forces `activeCategory` when it changes. `nonce` exists specifically to defeat Angular's value-equality short-circuit: jumping to `whom` twice in a row (Client, then Payer) with a plain string input would silently no-op the second jump.
2. Anchor chips get a single «Изменить» button (no separate ×, per TZ); catalog chips keep their existing `×` and additionally get «Изменить», both wired to a new `editSelection` output.
3. Editor's `onEditSelection(key)` — a static jump map (`client`/`payer` → `whom`, `supplier` → `more`, any catalog kind → `products`) sets `pendingDataJump` (with an incrementing nonce), switches to the `data` section, and — for anchors — focuses the actual field via the same `requestAnimationFrame` + global `data-test` query pattern already used elsewhere on this page. Discovered mid-implementation that `app-pi-select`'s own host isn't focusable (the real focus target is the inner `app-pi-select-trigger` `<button>`) — verified and fixed via a live browser check, not assumed.

**Live-verified, not just unit-tested:** the focus behavior specifically depends on the real `app-pi-select` component tree, which jsdom can approximate but not fully certify — ran a real Playwright pass against the actual dev backend confirming `document.activeElement` really lands inside the counterparty select after the jump.

**Not touched:** no new Counterparty/Supplier picker or dialog; BE `context`/`anchors` schema unchanged; `insert-table` CTA; ADD-PAGE write queue (already DONE in 1.2, no overlap).

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-13T12:05:00Z

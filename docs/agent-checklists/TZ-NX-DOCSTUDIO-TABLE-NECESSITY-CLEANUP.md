# TZ-NX-DOCSTUDIO-TABLE-NECESSITY-CLEANUP checklist

> Status: **CLAIMED / IN PROGRESS**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-TABLE-NECESSITY-CLEANUP.md`
> Wave: `docs/agent-checklists/WAVE-2026-09-13-STUDIO-OPS.md` (2, этапы A→B→C)
> Absorbs: TABLE-KIND-IA, TABLE-SOURCE-FIX, INSERT-APPLY-KIND (superseded, не отдельные TZ), TABLE-COL-WIDTH-APPLY (этап C)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-13T10:29:47Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (unattended CLI, no team-room MCP)

## Preflight

- [x] git fetch/merge, status checked — tip 670a9e7b, no conflicting `_active` claims
- [x] TZ + 3 audits read (necessity-wave, kind-vs-source, source-select) + COL-WIDTH-APPLY TZ
- [x] Claim slot filled; marker in `tasks/_active/`

### Preflight Check Output
- **Context read:** TZ text, 3 audits, COL-WIDTH-APPLY TZ, will read: `studio-table-properties.component.ts`/.spec.ts, `studio-editor.page.ts` (insertCatalogTable/createTableBlock/setBlockCatalogSource/onTableSourceChange), `studio-table-defaults.ts`, `studio-blocks-canvas.component.ts`, `studio-data-resolver.ts` (BE width), TableTemplate service/schema
- **Key Constraints:** one master TZ, 3 stages A→B→C, commit+push after each; must not regress addPage write-queue / Selected «Изменить» / canvas photo onerror (wave 1); no parallel edit on same editor/resolver files without queue (already sole active claim)
- **Planned Deliverable:** A = status/label IA on table properties; B = Insert→registry-template SoT + source round-trip fixes; C = col-width apply (absorbing COL-WIDTH-APPLY TZ) + ≤1 active template assert
- **Validation Path:** FE specs (properties/canvas/editor) + BE jest (resolver, stage C) + `nx build kppdf-web` last each stage; page.md updated

## Necessity matrix (from audit, source of truth for A/B/C decisions)

См. `docs/audits/2026-09-13-docstudio-table-necessity-wave.md` §NECESSITY MATRIX — не переизобретать здесь.

## Acceptance (из TZ, модуль «готово»)

- [ ] 1. Happy path без обучения: Insert → колонки канона из реестра → строки из Выбрано
- [ ] 2. В Свойствах нет контрола, который повторяет Insert без статуса
- [ ] 3. manual↔catalog round-trip восстанавливает строки при непустом Выбрано
- [ ] 4. Нет видимого width без эффекта (apply or removed)
- [ ] 5. page.md + specs + nx build; checklist WAVE с этапами A/B/C DONE

## Stage progress

- [x] Этап A — IA (status/labels, «Макет колонок» rename, page.md happy path) — DONE
- [ ] Этап B — SoT (Insert→registry template) + source round-trip fixes
- [ ] Этап C — dead controls (col.width apply, absorb COL-WIDTH-APPLY) + ≤1 active template assert

## Evidence

См. `docs/agent-checklists/evidence/TZ-NX-DOCSTUDIO-TABLE-NECESSITY-CLEANUP.txt`

## Integrity slot (до READY / archive)

- [ ] Тип изменения: UI IA + SoT correctness fix + dead-control removal/apply
- [ ] FIC: N/A
- [ ] page.md: `docs/pages/document-studio.page.md` — happy path + удалённые/слитые контролы
- [ ] DOMAIN-MAP: N/A
- [ ] Чужой WIP не в коммите; conflict keys соблюдены
- [ ] Канон: не удалял реестр видов/putDataSet/Insert; не трогал Photo pipeline/category forms/wipe/deploy; не регрессировал wave1 (addPage queue, Selected «Изменить», photo onerror)

## Gates (факт)

_(заполняется по этапам)_

## Executor report

_(заполняется в конце)_

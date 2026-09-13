# TZ-NX-DOCSTUDIO-TABLE-NECESSITY-CLEANUP checklist

> Status: **DONE**
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

- [x] 1. Happy path без обучения: Insert → колонки канона из реестра → строки из Выбрано
- [x] 2. В Свойствах нет контрола, который повторяет Insert без статуса
- [x] 3. manual↔catalog round-trip восстанавливает строки при непустом Выбрано
- [x] 4. Нет видимого width без эффекта (apply or removed)
- [x] 5. page.md + specs + nx build; checklist WAVE с этапами A/B/C DONE

## Stage progress

- [x] Этап A — IA (status/labels, «Макет колонок» rename, page.md happy path) — DONE (`726641e3`)
- [x] Этап B — SoT (Insert→registry template) + source round-trip fixes — DONE (`2dfc367b`)
- [x] Этап C — dead controls (col.width apply, absorb COL-WIDTH-APPLY) + ≤1 active template assert — DONE

## Evidence

См. `docs/agent-checklists/evidence/TZ-NX-DOCSTUDIO-TABLE-NECESSITY-CLEANUP.txt`

## Integrity slot (до READY / archive)

- [x] Тип изменения: UI IA (этап A) + SoT correctness fix (этап B) + dead-control apply (этап C) — bugfix/UX, не новая архитектура
- [x] FIC: N/A (нет новой page/permission/module)
- [x] page.md: `docs/pages/document-studio.page.md` — 3 абзаца (по этапу) + happy path/удалённые-слитые контролы
- [x] DOMAIN-MAP: N/A (не менял module/route/page контур)
- [x] Чужой WIP не в коммите; conflict keys соблюдены (только заявленные файлы + одна декларированная девиация: `studio-properties-panel.component.ts`, флагирована в evidence этапа A)
- [x] Канон: не удалял реестр видов/putDataSet/Insert; не трогал Photo pipeline/category forms/wipe/deploy; не регрессировал wave1 (addPage write-queue/Selected «Изменить»/canvas photo onerror — все живут в своих зелёных specs через все 3 прогона full-suite этой волны)

## Gates (факт)

Полная сводка по каждому этапу — `docs/agent-checklists/evidence/TZ-NX-DOCSTUDIO-TABLE-NECESSITY-CLEANUP.txt`. Кратко:
- BE: tsc + jest (135 suites/1336 tests) + eslint — PASS на этапах B/C (BE-файлы не тронуты в A)
- FE: tsc + jest (125 suites, растёт 875→881→885 tests по этапам) + eslint (0 errors) + `nx build kppdf-web` (last, каждый этап) — все PASS
- `pnpm architecture:check` — PASS на каждом этапе
- Живые Playwright-прогоны на каждом этапе (местный dev, admin/admin123, реальный backend+Mongo) — А: status/Обновить/Сменить видны и кликабельны; B: dataSource-формат реестра пойман живой проверкой Mongo ДО отправки (не после), persistence через свежую сессию; C: `<th>` реально меняет ширину на холсте (20px→116px)

## Executor report

**Necessity-driven, не smoke.** Каждый этап устранял реальный, задокументированный в аудитах дефект (ложный дубль-select, хардкод-колонки при Insert, сломанный round-trip источника, мёртвое поле ширины) — не «починили клик».

**Самое ценное найденное вживую (этап B):** реальный вид «Продукты» в реестре тегирован `dataSource: "product"` (единственное число, без префикса `catalog-`), а не `"catalog-products"`, как предполагала первая версия кода. Строгое сравнение никогда бы не сработало против настоящих данных — поймано ДО коммита живой проверкой Mongo, не постфактум багом у PO. Исправлено нормализованным сравнением (снимает префикс `catalog-` и хвостовое `s` с обеих сторон), терпимым к любой конвенции именования в реестре.

**Слито, не задублировано:** `onTableSourceChange` и `setBlockCatalogSource` — почти идентичные write-пути (аудит source-select) — слиты в один `applyTableSource`, поставлены в общую очередь wave-1 (`catalogWriteChain`), поскольку несут `expectedRevision` документа так же, как addPage/hydrate.

**Обнаруженная и задекларированная девиация:** `studio-properties-panel.component.ts` — тонкий pass-through wrapper, структурно обязательный для проводки нового output (этап A), не входил в буквальный список conflict keys TZ — тронут минимально и явно, не молча.

**Absorbed:** `TZ-NX-DOCSTUDIO-TABLE-COL-WIDTH-APPLY.md` (standalone TZ в `tasks/_ready/2026-09-13-studio-ops/`) полностью поглощён этапом C — не запускать отдельно, superseded этим TZ.

**Regression:** wave-1 write-queue (addPage), Selected «Изменить» jump, canvas photo onerror — ни разу не сломаны за 3 полных прогона FE test suite (этапы A/B/C), их собственные specs зелёные каждый раз.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-13T13:10:00Z

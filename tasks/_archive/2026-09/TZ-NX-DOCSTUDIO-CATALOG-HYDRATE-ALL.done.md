# TZ-NX-DOCSTUDIO-CATALOG-HYDRATE-ALL: serial hydrate всех live tables + helper по kind

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** PO lock один буфер / одна таблица на kind; S41 catalogWriteChain уже есть  
**LAYER:** 3 · **SIZE:** M  
**PAGES:** `/studio/:id`  

### Preflight Check Output
- **Context read:** `refreshLiveDataSetsOnLoad` L1588–1610 — **for-loop + void putDataSet без await** → все tables бьют **один** `expectedRevision` → при ≥2 live tables (типично 4 kind) → **409 cascade**, `if (!result.ok) return` **молча**; `commitCatalogSelectionChange` L1834–1886 уже **serial await**; `catalogWriteChain` S41
- **Key Constraints:** НЕ bake liveRows в GET; НЕ expand S15 на все unwired; serial = must
- **Planned Deliverable:** serial on-load hydrate + `refreshCatalogTablesOfKind` shared
- **Validation Path:** spec multi-table sequential revisions; nx build

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` (`refreshLiveDataSetsOnLoad`, `catalogWriteChain`, новый helper) ;  
`studio-editor-*.spec.ts` (live-rows / catalog-queue / новый hydrate-serial spec) ;  
page.md one-liner hydrate

IMPLICIT CONFLICT: nx build kppdf-web

## КОРЕНЬ (не «улучшение», а баг)

При документе с таблицами изделий+модулей+… текущий on-load hydrate **параллельно** шлёт putDataSet с одной revision. Это объясняет «данные только в одной таблице» после reopen даже когда **все** wired.

## ЧТО ДЕЛАТЬ

1. Переписать `refreshLiveDataSetsOnLoad` на **последовательную** очередь (тот же паттерн, что `commitCatalogSelectionChange` / `catalogWriteChain`):
   - собрать все table blocks с `STUDIO_LIVE_HYDRATABLE_SOURCE_TYPES`
   - для каждого: свежий `this.document()?.revision`, await putDataSet, applyLiveRows, next
   - ошибка на одном: toast.error или conflict() **один раз**, **продолжить** остальные (не abort всю цепочку молча)
2. Вынести `refreshCatalogTablesOfKind(kind: StudioShowcaseKind): Promise<void>`:
   - все blocks с `catalog-{kind}` (если когда-то завели дубль — обновить все; PO не плодит новые)
   - serial putDataSet с `catalogSelectionCount` из текущего буфера
   - использовать из: Insert heal, commitCatalogSelectionChange (можно упростить loop), **VITRINA-EDIT after Save**
3. После успешного Save сущности каталога из студии (VITRINA-EDIT) — вызов helper обязателен (AC там).
4. Specs:
   - 2+ hydratable tables on load → putDataSet N раз с **возрастающими** expectedRevision (2,3,…) как в catalog-queue.spec
   - одна table fail → вторая всё равно вызывается
5. page.md: GET без liveRows; open = serial putDataSet всех live sources.

## НЕ
Bake rows в GET; parallel fire-and-forget; expand S15; wipe orphans; менять BE hydrate semantics кроме как если FE нельзя serial (тогда тонкий BE — маловероятно).

## AC
1. Doc с 4 wired catalog tables + non-empty Выбрано → после open **все четыре** с строками (не только первая).  
2. Spec доказывает serial revisions.  
3. Helper существует и вызывается из Insert (#1) / готов для VITRINA-EDIT (#4).  
4. nx build green.

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-12
closed_by: Claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (nx test kppdf-web — 121 suites / 840 tests)
  - lint: not re-run separately this stage — no new lint-relevant files beyond #1's already-clean set; pre-existing repo-wide debt unrelated
  - checklist: ADDED (docs/agent-checklists/TZ-NX-DOCSTUDIO-CATALOG-HYDRATE-ALL.md)
  - progress.md: N/A (combined entry at WAVE COMPLETE)
  - status synchronization: PASS

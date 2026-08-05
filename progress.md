## [2026-08-05] — TZD-11 DONE: MCP server foundation
**Исполнитель:** Cursor / Auto
**Статус:** DONE; archive + lock; on main `de27bf2` (TZD-12 unblocked)
**Что сделано кратко:** Пакет `desktop/mcp` (`@kppdf/desktop-mcp`): Streamable HTTP на `127.0.0.1:9743` + stdio; auth pairing JWT (`KPPDF_API_KEY` + Bearer); tool `kppdf_ping`; docs `desktop/docs/MCP.md`; workspace member в `desktop/pnpm-workspace.yaml`.
**Gates:** `pnpm typecheck` PASS; `pnpm test` 2/2 PASS; smoke `/healthz` ok + Bearer mismatch → 401.
**Archive:** `tasks/_archive/2026-08/TZD-11.done.md`
**Lock:** `.mimocode/locks/TZD-11-mcp-foundation.lock`
**Next:** TZD-12 read tools (после push на main). Параллельно OK: TZD-05.

---

## [2026-08-05] — TZ-CATALOG-310 DONE: Where-used API
**Исполнитель:** Buffy / openai-gpt-5.6-luna
**Статус:** DONE; archive + lock created; commit/push pending
**Что сделано кратко:** Добавлены authenticated read-only where-used routes для Product, Module, Material и WorkType; общий paginated response, org scope для owned parent records, legacy composition fallback, orphan tolerance и Swagger docs.
**Gates:** backend tsc PASS; focused Jest 4 suites / 46 tests PASS; scoped ESLint PASS (0 errors, 6 existing test-mock warnings); diff --check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-310.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-310-where-used.lock`
**Known limit:** ProductModule/WorkType остаются shared, так как текущие схемы не имеют organizationId.

---

## [2026-08-05] — TZ-CATALOG-UI-301 DONE: Catalog Group Chip Workspace
**Исполнитель:** Cursor Architect (+ FE subagent)
**Статус:** DONE
**Что сделано кратко:** Каталог (продукция/модули/материалы/виды работ/люди) на `PiGroupWorkspace`; top-nav Каталог и Справочники — entry без dropdown; SoT + DEVELOPMENT-PATTERNS §18; table mapping Expandable+Card grid / Flat+photo.
**Gates:** fe tsc PASS; jest catalog list specs PASS (32).
**Archive:** `tasks/_archive/2026-08/TZ-CATALOG-UI-301.done.md`
**Lock:** `.mimocode/locks/TZ-CATALOG-UI-301-group-chip.lock`
**Canon:** `docs/superpowers/specs/2026-08-05-group-chip-workspace-canon.md`

---

## [2026-08-05] — TZ-UI-TABLE-303 DONE: shared Expandable contract
**Исполнитель:** openai/gpt-5.6-luna (Buffy)
**Статус:** DONE; archive + lock created per session close-board
**Что сделано кратко:** `app-pi-table` получил active-row predicate and named detail-region API; Products теперь single-expand с keyboard Enter/Space, `aria-expanded` and one detail row.
**Gates:** fe tsc PASS; targeted Jest 4 suites / 45 tests PASS; diff --check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UI-TABLE-303.done.md`
**Lock:** `.mimocode/locks/TZ-UI-TABLE-303-expandable.lock`

---

## [2026-08-05] — TZ-UI-TABLE-305 DONE: raw registries on shared Flat kit
**Исполнитель:** openai/gpt-5.6-luna (Buffy)
**Статус:** DONE; archive + lock created per session close-board
**Что сделано кратко:** семь raw registry tables переведены на `app-pi-table`; CRUD, filters, actions, loading/empty, sorting and pagination preserved. Added focused smoke specs for Documents, Forms and Inventory Dashboard.
**Gates:** fe tsc PASS; targeted Jest 11 suites / 86 tests PASS; raw registry scan PASS; diff --check PASS.
**Archive:** `tasks/_archive/2026-08/TZ-UI-TABLE-305.done.md`
**Lock:** `.mimocode/locks/TZ-UI-TABLE-305-flat-kit.lock`

---

## [2026-08-05] — TZ-UI-TABLE-302 READY FOR REVIEW: shared Tree kit + categories
**Исполнитель:** openai/gpt-5.6-luna (Buffy)
**Статус:** READY FOR REVIEW; Cursor PASS → archive; не DONE
**Что сделано кратко:** добавлен `app-pi-table-tree` для nested rows, indent, expand/collapse и drag capability; CategoriesPage переведён с page-local grid/CDK markup на kit, reorder API сохранён.
**Gates:** fe tsc PASS; targeted jest 6 suites / 59 tests PASS; diff --check PASS.
**Документы:** categories.page.md, checklist, active marker/map.
**Известные ограничения:** MVP два уровня; filtered drag index behavior прежний; browser screenshot smoke не запускался.

---

## [2026-08-05] — TZ-DICT-312 READY FOR REVIEW: Group Chip chrome polish
**Исполнитель:** openai/gpt-5.6-luna (Buffy)
**Статус:** READY FOR REVIEW; Cursor PASS → archive; не DONE
**Что сделано кратко:** убран gap header→chips через dense main для dictionary group routes; chips+tools собраны в адаптивный sticky top-0 stack; CTA tools защищён от правого clip.
**Gates:** fe tsc PASS; targeted jest 10 suites / 91 tests PASS; diff --check PASS.
**Документы:** checklist, DICT-WAVE1-REVIEW, page docs, PAGE-TZ-INDEX, active-map.
**Известные ограничения:** browser screenshot smoke не запускался; UI-TABLE Tree/305 не входят.

---

## [2026-08-05] — TZ-DICT-312 + TZ-UI-TABLE-302 DONE (Architect PASS)
**Исполнитель:** Buffy + Cursor (tsc + 119 jest + archive)
**Статус:** PASS; archives `TZ-DICT-312.done.md`, `TZ-UI-TABLE-302.done.md`
**Что сделано кратко:** Group Chip sticky/dense polish; PiTableTree + categories migrate.
**Критерии:** AC 312 + 302
**Известные ограничения:** UI-TABLE-305 backlog; browser smoke optional PO

---

## [2026-08-05] — Authored TZ-DICT-312 (Group Chip polish tomorrow)
**Исполнитель:** Cursor Mode A (docs)
**Статус:** TZ READY — код завтра
**Что сделано кратко:** баги после warm: gap header→chips + clipped CTA; TZ+checklist.
**Файлы:** `tasks/TZ-DICT-312.md`, checklist, active-map, PO-DIARY
**Критерии:** executable TZ
**Известные ограничения:** не чинить сегодня без запроса PO

---

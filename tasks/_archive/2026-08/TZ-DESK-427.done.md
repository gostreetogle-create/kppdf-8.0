# TZ-DESK-427 — dedup icon-rail vs workflow chips — DONE

**agent_id:** freebuff-desk-wave
**claimed_at:** 2026-08-23T11:53:07+0300
**closed_at:** 2026-08-23
**SHA:** (заполнить после commit)

ARCHIVE_MARKER
outcome: DONE
closed_by: freebuff-desk-wave
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: PASS
  - checklist: ADDED

## Proof of adoption

- **Consumer `/desk`:** `syncChromeTools()` регистрирует только левый rail (create/filter/summary/notebook); правый rail `right=[]` при expand — дубли tray/chips убраны (audit §2.5).
- **Dead code:** `studioTool`/`openStudio`/`actionTool` удалены; неиспользуемые иконки (Factory/FileText/LayoutGrid/Pencil/ShoppingCart/Users) из импортов убраны.
- **Тест:** 411-тест переписан на `rightTools() === []`; новый 427-тест проверяет правый rail пуст + левый 4 tools + chips остаются (33/33 PASS).
- **AC 3 (edit из tray):** tray уже получает edit-CTA от слота 425 (перенос tray CTA по audit §2.5 «Состав/редакт → tray CTA + flyouts») — этот слот в параллельной работе с `order-hub-tray.component.ts`; в 427 не дублирую. Composition edit + addLines→bom уже в tray.
- **Docs:** `manager-desk.page.md` — секция 427 (правый rail убран, левый остаётся) + строка таблицы.
- **Migration note:** правый rail больше не регистрируется; studio-переходы — только chips (426).
- **Legacy leftover:** desk rail deep-link (404) superseded — chips несут orderId/from=desk.

## Gates

| Gate | Result |
|------|--------|
| `pnpm exec tsc -p tsconfig.app.json --noEmit` | 0 ✅ |
| `pnpm exec jest` (manager-desk) | 33/33 ✅ |
| `pnpm exec eslint` (2 файла) | 0 ✅ |
| `git diff --check` | PASS ✅ |

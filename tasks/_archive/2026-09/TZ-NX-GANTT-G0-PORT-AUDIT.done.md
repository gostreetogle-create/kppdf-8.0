# TZ-NX-GANTT-G0-PORT-AUDIT: матрица переноса legacy → NX

**РОЛЬ:** Executor (docs + read-only code)
**LAYER:** 1
**PAGES:** production
**PAGE_DOCS:** `docs/pages/production-cockpit.page.md`
**DEPENDENCIES:** none
**CONFLICT KEYS:** `docs/audits/2026-09-04-gantt-nx-port-audit.md` (создан); `docs/agent-checklists/WAVE-NX-PRODUCTION-GANTT.md`

## Claim slot

- agent_id: freebuff (Buffy)
- claimed_at: 2026-09-04T21:10:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (нет Team Room CLI в этом контуре)

## Preflight Check Output

- **Context read:** `GEMINI.md`, `.agents/skills/kppdf-executor-loop/SKILL.md`, `docs/PO-CANON.md`, `docs/agent-checklists/_NOW.md`, `tasks/PROMPT-FREEBUFF-NX-GANTT-MASTER.md`, `docs/agent-checklists/WAVE-NX-PRODUCTION-GANTT.md`, `docs/ux/production-gantt-studio-spec.md`, `docs/pages/production-cockpit.page.md`, `docs/audits/2026-08-15-gantt-bar-resize-drag-audit.md`, `docs/audits/2026-08-15-gantt-cascade-no-bottom-card.md`, TZ G0–G7, legacy `frontend/src/app/pages/production/**` (глобы + page/facade/context контракты), NX: `app.routes.ts`, `nav-categories.ts`, `shell-tool-rail.service.ts`, `tool-rail-definitions.ts` (имплицитно), `pi-orders.service.ts`, `capabilities.metadata.ts`, `studio-editor.page.ts` (эталон setTools).
- **Key Constraints:** docs-only; legacy читать не редактировать; не L1–L6/факт цеха; граница волны = WAVE checklist.
- **Planned Deliverable:** audit md (file-map + UX checklist + known pan/drag bugs + API + NX gaps) → WAVE G0 [x] → archive.
- **Validation Path:** FIC N/A (docs-only) + Integrity docs-only + WAVE AC.

## Что сделано

Создан `docs/audits/2026-09-04-gantt-nx-port-audit.md`:

1. **Общая картина/разрывы**: route `/production` объявлен в `nav-categories.ts`, но отсутствует в `app.routes.ts` → чип «Гант» скрыт (G1 это закроет); `production:read` уже есть в capabilities metadata; NX chrome tools = `ShellToolRailService` (эталон `studio-editor.page.ts`), не `PiChromeToolsService`; `PiOrdersService` не имеет estimate-методов (G2 добавит); `production:write` — проверить для G5.
2. **File map** legacy (15 файлов `frontend/src/app/pages/production/**`) → целевые NX пути `frontend-nx/apps/kppdf-web/src/app/pages/production/**` с этапом (G1–G6).
3. **UX checklist 1:1** (дерево ▸ Заказ→Изделие→Модуль→WT, крупный chevron, каскад meta под summary, work-detail под WT, zoom День/Месяц/Вместить сроки, Сегодня non-no-op, фильтры Counterparty/active-only без draft, «По рабочим» read-only, skip сборк/упаков, scroll-контракт, dismiss, layout full-width).
4. **Known pan/drag bugs**: «после сдвига на более раннюю дату экран/диапазон не обновлялся» (Боль PO → G4), RU-тики/zoom-регрессии, monotonic nonce scrollRequest, QA-445E pulse, причины из audit 2026-08-15 (order-level override, а не каталог).
5. **API-контракты**: GET orders/products/modules/work-types/workers (?limit=100), PATCH orders (plannedDate), PATCH estimate-days/estimate-start (клиент — G2, UI — G5), PATCH work-types только по явному confirm.
6. **NX gaps** (7 пунктов): route, chrome tools, PiOrdersService estimate-методы, work-types/workers клиенты, `production:write` capability, `?orderId=`/`?from=desk` deep-links, scrollRequest-контракт.

Никакого product-кода не менялось; legacy не редактировался.

## Gates (факт)

- docs-only: markdown/diff review; кодовые тесты не применимы (зафиксировано в Integrity slot).
- `nx build kppdf-web` — не применимо (G0 без FE-кода; первый FE-код волны — G1).

## Финализация

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-04
closed_by: freebuff (Buffy)
verification:
  - acceptance criteria: PASS (audit md существует: file-map + API + bug list; WAVE G0 отмечен [x])
  - typecheck: N/A (docs-only)
  - tests: N/A (docs-only)
  - lint: N/A (docs-only)
  - checklist: ADDED (`docs/agent-checklists/TZ-NX-GANTT-G0-PORT-AUDIT.md`)
  - progress.md: REDIRECT (не ведётся; статус — `_NOW.md`)
  - status synchronization: PASS
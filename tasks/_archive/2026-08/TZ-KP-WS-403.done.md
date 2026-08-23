# TZ-KP-WS-403 — DONE

**agent_id:** freebuff-1 · **claimed_at:** 2026-08-23T15:10:00+0300 · **workspace:** D:\kppdf-8.0
**Dep:** TZ-KP-WS-402 DONE · **Layer:** frontend (left panels + draft)

## DoD

| TZ | SHA | Proof of adoption | Gates |
|----|-----|-------------------|-------|
| **KP-WS-403** (left panels + hydration + autosave + preview) | *(заполнить после commit)* | ✅ consumer `/proposals/workspace?id=` — 3 левые панели (каталог/шаблон/клиент) смонтированы в shell-панель, A4-центр = `ProposalCreateTemplateCenterComponent`; draft-сервис (hydration `?id`/`new`/`source=order`/resume + autosave 1200ms + build) — тесты **9**; page-спека **11** (38 в workspace); product-rail/template-picker/recipient спеки не тронуты и зелёные; docs kp-workspace.page.md | tsc 0 · jest proposal **152/152** · eslint 0 · `ng build` 0 errors · diff --check PASS |

## Что сделано

1. **`ProposalWorkspaceDraftService`** (`proposal-workspace-draft.service.ts`) — зеркало
   create-пайплайна (один write-path: те же `ProposalsService.create/update` payload'ы):
   - hydration: `?id` → `resumeDraftById` · `?new=1` · `source=order&sourceId` (DESK-426 prefill) ·
     resume `kp.create.lastDraftId` / `kp.create.lastTemplateId`;
   - `onTemplateChange` (сброс table-target/layout, default rows из шаблона, rebuild+autosave);
   - `onProductAdd` (merge qty для каталога/модуля/материала, custom-строки), `onRecipientState`,
     `onTermsChange` → `refreshComposition` (rebuild 200ms + autosave 1200ms);
   - `saveDraft` с `templateSnapshot` (html + tableLayout + sheetLayout), stale-pointer fallback
     (404/400 → create), accepted-draft snapshot без rebuild.
2. **Workspace page** — панели по `store.activeSection()`:
   - `@case('catalog')` → `ProposalProductRailComponent` (полная витрина, `panelWide` tier-L 58rem);
   - `@case('template')` → `ProposalCreateTemplatePickerComponent` (returnUrl автоматически =
     `/proposals/workspace`, т.к. picker берёт `router.url`);
   - `@case('recipient')` → `ProposalCreateRecipientComponent`;
   - A4-центр: `ProposalCreateTemplateCenterComponent` в `[kpWsSheet]` при выбранном шаблоне
     (shell `sheetHost` — прозрачный хост без двойной A4-рамки).
3. **Shell-расширения:** `panelWide` (tier-L каталог), `sheetHost` (прозрачный sheet-хост) —
   A4 не reflow (geometry checklist #3 сохранён: только transform панели).
4. **Тесты:** draft-сервис 9 (hydration, merge qty + autosave→update, recipient, template change →
   build, guard без шаблона, accepted snapshot, `new=1`, composition total, custom line);
   page-спека +3 интеграции (каталог смонтирован + tier-wide, picker, recipient).

## AC

- [x] Open workspace с `?id=` гидратирует template + lines + recipient
- [x] Add product из каталога → autosave → F5 persists (lastDraftId пишется; тест update payload)
- [x] Template change пересобирает превью
- [x] Builder returnUrl → workspace (pick по router.url)
- [x] Panel 480px; каталог — tier-L wide (58rem), без reflow A4
- [x] `pnpm test -- "proposal-(workspace|product-rail|template-picker|recipient)"` PASS
- [x] tsc + lint PASS

## Notes

- Create page НЕ рефакторился (остаётся frozen до cutover 408); draft-логика продублирована
  в сервисе с одинаковыми payload'ами — консолидация в 409.
- Autosave-тайминг в тестах: rebuild (200ms) перезапускает autosave-таймер → tick(2000).
- Чужие dirty-файлы не трогал; demo не тронут (403 scope — только workspace).

## Legacy leftover

- Правые панели (params/table/terms/output) — TZ-404.
- `proposal-create.page.ts` god-page — до cutover 408/409.
- Ribbon-действия (Печать/PDF/Архив) — TZ-404.

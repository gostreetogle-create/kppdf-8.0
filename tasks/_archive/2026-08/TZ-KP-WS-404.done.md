# TZ-KP-WS-404 — DONE

**Status:** DONE · archived 2026-08-23
**Agent:** freebuff-1 (executor, KP wave session 3)
**Depends on:** TZ-KP-WS-403 DONE

## Proof of adoption

| Пункт | Артефакт |
|-------|----------|
| Consumer | `/proposals/workspace` — right rails: Параметры / Редактор таблицы / Условия / Вывод |
| Тесты | page.spec +8 (inspector, table tier-L overlay, custom line, terms library, output gates, catalog review ×2 + Esc-exception); draft.service.spec +4 (params→rebuild, terms, print gate, pdf gate) |
| Docs | `docs/pages/kp-workspace.page.md` (route/state/dialogs/files/Wave 404 DONE) |
| Migration note | create остаётся god-page до cutover 408; workspace пишет через один `ProposalWorkspaceDraftService` write-path — **не** дублировать правые панели вручную |
| Leftover | `kp-create-*` алиасы до cleanup 409; ribbon print/PDF дубли (канон 368) |

## Что сделано

1. **Right panels mounted** in workspace host: `ProposalCreateInspectorComponent` (params), `ProposalCreateTableEditorComponent` (table), `ProposalCreateTermsComponent` (terms), output buttons (print/PDF/archive, канон 368).
2. **Tier-L table** = wide overlay (`kp-ws-panel--wide`, ~794px) — A4-центр не рефлоу (geometry law: overlay only).
3. **Catalog review** на exit из таблицы: `requestTableExit` guard (dirty catalog rows → modal), resolve (kp-only / update / copy), focus trap + return-focus; **Esc намеренно НЕ закрывает** (formal exception KP-CATALOG-REVIEW-NO-ESC, TZ-UI-WR-510).
4. **Draft-сервис**: перенесены все правые хендлеры (inspector/table/terms/output) — один write-path, parity с create; `attachPrinter` для превью; output gates 368 (print free; PDF/archive требуют сохранённый черновик).
5. **Read-only** при `status === accepted` (isReadOnly) на всех панелях.

## Gates

- FE tsc: 0 errors
- jest proposal-workspace: 49/49 (page 17, draft service 13, shell 8, store 11)
- jest proposals сет: 163/163
- eslint workspace/: 0
- ng build (dev): 0 errors (pre-existing NG8113 warning в pi-nav-dropdown — не мой)
- diff --check: PASS

## Коммиты

- SHA кода: `5d27f39c` (push PASS, pre-push hook OK)

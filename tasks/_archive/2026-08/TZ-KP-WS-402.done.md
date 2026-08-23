# TZ-KP-WS-402 — DONE

**agent_id:** freebuff-1 · **claimed_at:** 2026-08-23T14:30:00+0300 · **workspace:** D:\kppdf-8.0
**Dep:** TZ-KP-WS-401 DONE · **Layer:** frontend (store + chrome rails)

## DoD

| TZ | SHA | Proof of adoption | Gates |
|----|-----|-------------------|-------|
| **KP-WS-402** (store + chrome rails IA) | *(заполнить после commit)* | ✅ consumer `/proposals/workspace` (L3+R4 tools, unique Lucide, RU labels); store spec **11** + page spec **8** (27 total в workspace); docs kp-workspace.page.md + rail-ia STATUS note; legacy: demo не тронут, create не тронут | tsc 0 · jest proposal **141/141** · eslint 0 · `ng build` PASS · diff --check PASS |

## Что сделано

1. **`ProposalWorkspaceStore`** (injectable, per-page provider): `activeLeft`/`activeRight`/
   `panelOpen`/`orientation`/`quotationId` + computed `activeSection`/`panelTitle`;
   actions `openSection`/`toggleSection` (same+open → collapse, else switch)/`closePanel`/
   `setOrientation`. Спека 11 кейсов state machine.
2. **Chrome rails по IA** (rail-ia.md §1): left = Каталог `Package` · Шаблон `FileText` ·
   Клиент `ContactRound`; right = Параметры `SlidersHorizontal` · Редактор таблицы
   `TableProperties` · Условия `ScrollText` · Вывод `Printer` — регистрация через
   `PiChromeToolsService` **right** slot (существует в layout — правка layout не нужна).
   Иконки уникальны (7/7, тест dedup).
3. **Wiring на `/proposals/workspace`:** клик chrome tool → `toggleSection` (overlay-панель
   480px, A4 не reflow); повторный клик → collapse; sheet click → close; **Escape** → close;
   `quotationId` из query `id`.
4. **Отклонение от TZ (зафиксировано):** пункт «inject store в shell» реализован иначе —
   shell остался controlled (inputs/outputs), store внедрён на уровне страницы. Причина:
   demo использует shell со своими сигналами (6 секций); инъекция root-store в shell сломала
   бы визуальную идентичность demo. Эффект тот же (TZ-AC по поведению workspace выполнены).
5. **Отклонение от rail-ia:** «Вывод» временно в правом rail (TZ-402 требует Params·Table·Terms·
   Output), ribbon-перенос — в TZ-404; в rail-ia добавлена STATUS-заметка.
6. Docs: kp-workspace.page.md (store/files/wave 402 DONE), rail-ia STATUS note.

## AC

- [x] Left 3 + right 4 в chrome, unique Lucide icons + RU labels
- [x] Store tests ≥8 (11) + chrome registration snapshot (page spec)
- [x] Panel overlay; A4 rect unchanged (geometry — только transform панели)
- [x] No duplicate icon Template vs Terms
- [x] tsc + lint PASS

## Notes

- Escape — `@HostListener('document:keydown.escape')` → `closePanel()`; modal-гард
  catalog-review появится с его successor-панелью (TZ-404+), зеркально create.
- Demo (`proposal-workspace-demo.page.*`) остался dummy (свои сигналы + 6 секций) — minimal.
- Чужие dirty-файлы не трогал.

## Legacy leftover

- Панели секций (catalog/template/recipient/params/table/terms/output content) — TZ-403/404.
- Demo-секции `composition`/`client` — только в demo (не в workspace rails).
- `proposal-create.page.ts` — до cutover 408.

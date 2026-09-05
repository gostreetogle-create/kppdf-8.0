# TZ-NX-DOCSTUDIO-D50-DATA-IA-SHELL checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-D50-DATA-IA-SHELL.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-05T12:00:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — только `TZ-NX-GANTT-G14-BAR-ASSIGNEE.md` (production, не пересекается)
- [x] TZ / канон прочитаны: `tasks/_ready/docstudio-data-ia/TZ-NX-DOCSTUDIO-D50-DATA-IA-SHELL.md`, audit `docs/audits/2026-09-05-docstudio-data-panel-ia-audit.md`, текущий `studio-data-panel.component.ts` + `studio-data-vitrina.component.ts`, `document-studio.page.md` §1.3/§2.4/§3.3
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-D50-DATA-IA-SHELL.md` на месте

## Acceptance

- [x] В панели видны 5 категорий (Товары | Выбрано | Кому | Связи | Ещё); по умолчанию активен Товары
- [x] Переключение TOC не ломает Add/Remove витрины (те же `catalogChange`/`(catalogChange)` emitters, не тронуты)
- [x] Build PASS

## Integrity slot

- [x] Тип изменения: page (frontend-nx UI IA)
- [x] FIC: page.md обновление отложено до D54 (по плану волны — «Docs smoke» — единая точка обновления `document-studio.page.md`, не дублирую на каждом шаге)
- [x] SECTION-READINESS N/A
- [x] Чужой WIP не в коммите (registries/work-types Freebuff WIP не staged)
- [x] Coupling map N/A
- [x] Канон: docs/DOCS-INTEGRITY.md соблюдён

## Build integrity

- [x] Нет другого `tasks/_active/*` с пересекающимися `studio-data-panel.component.ts`
- [x] Закрытие: `nx build kppdf-web` — последняя команда, exit 0

## Gates (факт)

```
cd frontend-nx
pnpm exec nx test kppdf-web --testPathPattern="studio-data-panel" → PASS (79 suites, 501 passed, 0 failed; 8 tests в файле, вкл. 4 новых D50-теста)
pnpm exec nx lint kppdf-web → 0 ошибок в touched files
pnpm exec nx build kppdf-web → PASS, exit 0
```

## Executor report

- `studio-data-panel.component.ts`: добавлен TOC (`activeCategory` signal, 5 категорий) + `@switch` секций. Механический разрез существующих полей (без смены copy/hint — это D53): **Товары** = существующая vitrina; **Выбрано** = существующий блок anchors+catalog chips; **Кому** = Клиент+Плательщик; **Связи** = КП+Статус КП+Заказ; **Ещё** = Поставщик + read-only Исполнитель.
- Не менял `context` API, не трогал `catalogChange`/`catalogRemove`/`counterpartyChange`/... outputs — те же emitters, тот же `studio-editor.page.ts` wiring (0 diff там на этом шаге).
- **Совмещено с D51** в этом же коммите кода (см. отдельный checklist `TZ-NX-DOCSTUDIO-D51-SELECTED-BUFFER.md`): пустое состояние + badge на «Выбрано» добавлены сразу, чтобы не переписывать один и тот же `@case('selected')` блок дважды подряд в одной сессии. Оба TZ прошли свои gates отдельно (в этом отчёте и в D51).
- Тесты: расширен `studio-data-panel.component.spec.ts` — TOC рендер/переключение, разбивка полей по секциям (Кому/Связи/Ещё), regression на vitrina-grid CSS (не менял).

## Review handoff

- [x] READY FOR REVIEW — WAVE-DOCSTUDIO-DATA-IA
- Archive без отдельного Cursor Verdict (Executor-only wave)

## Closeout

- archive сразу — переходим к D51 (уже реализовано в этом же диффе, отдельный checklist).

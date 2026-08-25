# TZ-UX-440 checklist

> Status: **DONE**
> Marker: `tasks/_archive/2026-08/TZ-UX-440.done.md`
> Conflict keys: `frontend/src/app/pages/supply/supply-quick-order.component.ts`; `frontend/src/app/pages/people/people.page.ts`; `frontend/src/app/pages/people/people-form-dialog.component.ts`; `frontend/src/app/pages/admin/users-admin.page.ts`; `frontend/src/app/pages/admin/user-form-dialog.component.ts`; `frontend/src/app/pages/desktop/pairing-dialog.component.ts`; `frontend/src/app/pages/commercial/proposals/workspace/proposal-workspace.page.ts`; `frontend/src/app/pages/commercial/proposals/workspace/proposal-workspace.page.spec.ts`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-08-25T18:40:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Team Room CLI не предоставлен)

## Preflight

- [x] TZ прочитан целиком, preflight пункты сверены с реальным кодом (grep на каждую строку)
- [x] `tasks/_active/` до claim не содержал конфликтующих conflict keys (только `TZ-DESK-440-tray-honest-cta.md`, другой файл)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → теперь READY FOR REVIEW

## Что сделано

1. **Почта везде** — заменены RU-лейблы (типы полей `email`/`formControlName` не тронуты):
   - `supply-quick-order.component.ts:550` — «Email org» → «Почта организации»
   - `people.page.ts:218` — колонка «Email» → «Почта»
   - `people-form-dialog.component.ts:134` — label «Email» → «Почта»
   - `users-admin.page.ts:187` — колонка «Email» → «Почта»
   - `user-form-dialog.component.ts:88` — «Email (необязательно)» → «Почта (необязательно)»
2. **Pairing** — `pairing-dialog.component.ts:96` placeholder «Office PC» → «Офисный ПК»
3. **KP catalog review dirty chips** — `proposal-workspace.page.ts:661` убран сырой `<span>{{ entry.line.catalogDirtyFields?.join(', ') }}</span>`; оставлена уже существующая RU-строка `<small>{{ draft.catalogDiffText(entry) }}</small>` (маппинг `productName→Наименование` и т.п. уже был в `proposal-workspace-draft.service.ts:717-745`, логика не менялась).
4. Spec `proposal-workspace.page.spec.ts` — изменения не потребовались: тестовые данные используют `productName` как поле фикстуры (не DOM-ассерт), DOM-ассертов на сырой `catalogDirtyFields` текст не было.
5. `people.page.ts` не имеет собственного `*.spec.ts` (есть только `people-form-dialog.component.spec.ts`) — skip по правилу TZ.

## Gates (факт)

```
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit   → PASS (no output)
cd frontend && pnpm test -- proposal-workspace.page.spec     → 28/31 PASS; 3 pre-existing failures
                                                                 (terms/library panel, TZ-405) confirmed
                                                                 present on main via git stash — unrelated
                                                                 to this TZ, not touched by this change
cd frontend && pnpm test -- people                           → 9/9 PASS (people-form-dialog.component.spec.ts;
                                                                 people.page.ts has no spec file — skip)
cd frontend && pnpm test -- users-admin                       → 14/14 PASS
cd frontend && pnpm test -- pairing-dialog                    → 14/14 PASS
cd frontend && pnpm test -- supply-quick-order                → 46/46 PASS
cd frontend && pnpm lint                                      → 0 errors, 17 pre-existing OnInit warnings
                                                                 (unrelated files, not touched by this TZ)
```

Residual grep (все conflict keys): нет `Email org`, `>Email<`/`label="Email"`, `Office PC` — PASS.

## Acceptance

- [x] Grep по CONFLICT KEYS: нет user-visible `Email org`, label `Email`, `Office PC`
- [x] KP review row: нет `productName`/`productSku` как подписей поля в DOM (только RU `catalogDiffText`)
- [x] Gates выполнены (см. выше), tsc+lint чистые

## Integrity slot (до READY / archive)

- [x] Тип изменения: UI labels only, без изменения API field names / DTO
- [x] FIC §A–E: N/A — нет новых routes/permissions/backend модулей
- [x] `catalogDiffText` логика не менялась, только удалён дублирующий сырой span
- [x] Чужой WIP не в коммите; правки строго в conflict keys (order-hub-tray.component.ts тронут другим агентом DESK-440 параллельно, не мной)

## Executor report

- Реализовано по TZ 1:1, все 4 шага. Известные ограничения TZ (form-field error slot, dictionary EN slug placeholders, Product form «Статус»+«Активен») — backlog, не в scope.
- Conflict disclosure: в рабочем дереве присутствуют незакоммиченные правки `order-hub-tray.component.ts` от параллельного агента (DESK-440) — не мои, не трогал.

## Review handoff

- [x] READY FOR REVIEW
- [x] Cursor/PO PASS accepted from supplied evidence; no additional live review required for this closeout

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-25T20:27:06+03:00

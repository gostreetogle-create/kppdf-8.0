# KP Workspace Manager Smoke — Evidence

> **Дата:** 2026-08-23 · **Агент:** freebuff-2  
> **Контекст:** TZ-KP-WS-408.done в архиве. Cutover 408 выполнен (Freebuff-1).  
> **Чеклист:** [`docs/agent-checklists/KP-WORKSPACE-SMOKE.md`](../agent-checklists/KP-WORKSPACE-SMOKE.md)  
> **Полный E2E:** [`docs/agent-checklists/KP-E2E-SMOKE.md`](../agent-checklists/KP-E2E-SMOKE.md)

---

## Автоматические гейты (пройдены)

| Gate | Статус |
|------|--------|
| `pnpm exec tsc -p tsconfig.app.json --noEmit` | ✅ PASS (exit 0) |
| `pnpm test -- proposal-workspace proposal-create --runInBand` | ✅ PASS 118/118 (11 suites) |
| `pnpm lint` | ✅ 0 errors, 18 pre-existing warnings |

| Suite | Tests |
|-------|-------|
| proposal-workspace.store.spec.ts | PASS |
| proposal-create-template-center.component.spec.ts | PASS |
| proposal-create-recipient.component.spec.ts | PASS |
| proposal-workspace-shell.component.spec.ts | PASS |
| proposal-create-template-picker.component.spec.ts | PASS |
| proposal-create-terms.component.spec.ts | PASS |
| proposal-create-inspector.component.spec.ts | PASS |
| proposal-workspace-draft.service.spec.ts | PASS |
| proposal-create.autosave.spec.ts | PASS |
| proposal-workspace.page.spec.ts | PASS |
| proposal-create.page.spec.ts | PASS |

## Ручной smoke (10 шагов) — ⚠️ PENDING PO

> Требуется: VPN + dev-сервер + браузер. Freebuff-2 не имеет доступа к browser/preview.

| № | Шаг | PASS / FAIL |
|---|-----|-------------|
| 1 | Новое КП: номер/дата, статус сохранения, tooltips на иконках | ⏳ PENDING |
| 2 | Шаблон: лента = текущий, левая панель = выбор | ⏳ PENDING |
| 3 | Наша фирма: заметно, НДС/наценка, переключение без сюрприза | ⏳ PENDING |
| 4 | Клиент: быстрый выбор + создание без ухода из КП | ⏳ PENDING |
| 5 | Каталог: 2–3 позиции, итого ₽ в ленте, F5 восстанавливает | ⏳ PENDING |
| 6 | Геометрия: левая/правая панель, A4 не прыгает | ⏳ PENDING |
| 7 | Таблица: Применить и закрыть, результат на листе | ⏳ PENDING |
| 8 | Параметры: скидка + наценка в одном месте | ⏳ PENDING |
| 9 | Условия: аванс % + срок рядом с текстом условий | ⏳ PENDING |
| 10 | Печать/PDF: предупреждение при несохранённых, кнопки только в ленте | ⏳ PENDING |

## Три обязательных риска

- [ ] Правка цены в строке не переписала справочник — ⏳ PENDING
- [ ] Быстрый клиент на входящем звонке без ухода из КП — ⏳ PENDING
- [ ] Масштаб фото + шрифт таблицы под A4 — ⏳ PENDING

## Итог

- **Дата:** 2026-08-23
- **Страница:** workspace (cutover 408 выполнен)
- **Авто:** PASS 118/118
- **Ручной:** PENDING (VPN/dev-сервер PO)
- **Решение PO:** ☐ к cutover 409  ☐ доработка
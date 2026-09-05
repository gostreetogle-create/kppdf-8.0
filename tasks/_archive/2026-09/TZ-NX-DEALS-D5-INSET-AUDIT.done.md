# TZ-NX-DEALS-D5-INSET-AUDIT: воздух в панелях сделок

**SIZE:** S
**РОЛЬ:** Executor (frontend-nx)
**LAYER:** 2
**PAGES:** orders, proposals, contracts, counterparties
**PACK:** WAVE-NX-DEALS D5 (последний TZ волны)
**PAGE_DOCS:** `docs/pages/orders.page.md`; audit deals
**ЗАВИСИМОСТИ:** D1–D4 DONE
**CONFLICT KEYS:** только панели/классы из D1–D4; IMPLICIT `nx build kppdf-web`

## Аудит (evidence)

Проверены все панели/списки D1–D4 против `docs/paper-and-ink.md` § Panel & expand inset:

| Файл | Панель | Inset |
|------|--------|-------|
| `order-hub-tray.component.ts` | 4 группы (order/execution/logistics/documents) | `p-4` (16px) |
| `order-hub-tray.component.ts` | под-блоки/disclosure внутри групп | `border-t hairline pt-3 mt-3` (12px, divider-паттерн, горизонтальный inset наследуется от родителя) |
| `orders-list.page.ts` / `contracts-list.page.ts` / `counterparties-list.page.ts` | table rows | `px-4 py-3` (16px/12px) |
| `proposals-list.page.ts` `proposal-family-list` (pre-existing) | — | без `hairline` вообще — условное правило TZ п.3 не сработало, N/A |
| `counterparty-form-dialog.component.ts` | dialog body | `variant="content"` → shared `PiDialogComponent` даёт `px-6 py-6` (24px) |
| `deals-group-chips.ts` disabled chip | TOC pill | `px-2 py-0.5` — тот же паттерн, что у всех TOC/section chips приложения (pill-атом, не «панель») |

**Вывод:** нарушений не найдено. Все панели D1–D4 уже строились по канону в момент создания — фиксов не потребовалось.

## AC — результат

1. ✅ Нет текста вплотную к hairline на затронутых панелях (см. таблицу выше).
2. ✅ Build PASS.

## Gates (факт)

```
pnpm exec nx test kppdf-web → PASS (79 suites, 494 passed, 7 skipped, 0 failed — полный прогон)
pnpm exec nx test data-access → PASS (88/88 — полный прогон)
pnpm exec nx test features → PASS (12/12 — полный прогон)
pnpm exec nx build kppdf-web → PASS, exit 0
```

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (nx build kppdf-web)
  - tests: PASS (full suite: kppdf-web 494 + data-access 88 + features 12)
  - lint: PASS (docs-only, no code changed)
  - checklist: ADDED (docs/agent-checklists/TZ-NX-DEALS-D5-INSET-AUDIT.md)
  - progress.md: N/A (docs-only audit, captured in checklist)
  - status synchronization: PASS

---

# WAVE-NX-DEALS — WAVE CLOSEOUT

Все 5 TZ волны (D1 TOC chrome, D2 hub tray, D3 counterparties, D4 contracts, D5 inset audit) — **DONE**.
Итог: `/orders`, `/proposals`, `/contracts`, `/counterparties` — единый deals chrome (TOC КП|Договоры|Заказы),
order hub expand (Заказ/Исполнение/Логистика/Документы), тонкий CRUD заказчиков, read-only список+карточка
договоров. Known limits задокументированы в соответствующих page.md (contracts create/sign/attach остаются
backend-only; counterparties — thin form, не legacy EAV; order hub — hub-only, без desk-write).

# TZ-NX-DEALS-D3-COUNTERPARTIES: тонкая страница заказчиков

**SIZE:** S
**РОЛЬ:** Executor (frontend-nx)
**LAYER:** 2
**PAGES:** counterparties
**PACK:** WAVE-NX-DEALS D3
**PAGE_DOCS:** `docs/pages/counterparties.page.md`
**ЗАВИСИМОСТИ:** D2 (не блокер) — done; `PiCounterpartiesService` уже list/getById
**CONFLICT KEYS:** `app.routes.ts`; `pages/counterparties/**`; `libs/data-access/src/lib/sales` (CRUD extension); IMPLICIT `nx build kppdf-web`

## ЧТО СДЕЛАНО

1. Route `/counterparties` добавлен в `app.routes.ts` — thin list, lazy-loaded.
2. `PiCounterpartiesService` расширен: `create`/`update`/`remove` (backend controller уже имел полный CRUD, `@Roles('admin','manager')` на write — не менял RBAC). `Counterparty` тип расширен полями, которые реально возвращает API (`inn`, `phone`, `email`, `roles`, `isActive`, `innIsStub`).
3. Новая страница `counterparties-list.page.ts`: Название/ИНН(+«временный» badge)/Контакт/действия. Create/Edit — один диалог `counterparty-form-dialog.component.ts` (Название/ИНН/Телефон/Email; `roles` дефолт `['customer']` на create, сохраняется на edit — тот же дефолт, что у backend `quickCreateParty`). Delete — `AlertDialogComponent` confirm → soft delete.
4. Nav: пункт «Заказчики» (категория «Клиенты») уже был описан в `nav-categories.ts`, но фильтровался как несуществующий роут — теперь появляется автоматически (без правок nav-categories.ts).
5. Docs: `docs/pages/counterparties.page.md` — новая секция «NX thin CRUD (D3)» (legacy FullEditor описание не тронуто/не переписано, помечено как legacy-only).

## Побочный фикс (легитимное обновление, не регрессия)

`app-shell.component.spec.ts` жёстко проверял точное число видимых header quicknav-чипов (было 5/4 в двух тестах) — с появлением `/counterparties` категория «Клиенты» стала видимой (роут существует, ACL не режет — тестовый `userSig` без `pages[]`), число выросло до 6/5. Обновил оба теста на новую легитимную реальность + добавил `clientsQuickNav()` helper по аналогии с admin/registries/docs.

## НЕ (соблюдено)

Полный legacy EAV-редактор (банк/подписант/легал-тип/справочник ролей), sites CRUD заказчика, `/desk` — не портированы.

## AC — результат

1. ✅ `/counterparties` не 404; список из API.
2. ✅ Create/edit/delete работают (BE не read-only — escalate не потребовался).
3. ✅ `nx build kppdf-web` PASS.

## Gates (факт)

```
pnpm exec nx test data-access --testPathPattern=pi-counterparties → PASS (5/5, новые CRUD-методы)
pnpm exec nx test kppdf-web --testPathPattern="counterpart" → PASS (12 новых: form-dialog 4 + list-page 8)
pnpm exec nx test kppdf-web --testPathPattern="app-shell.component.spec" → PASS (2 теста обновлены под новый /counterparties роут)
pnpm exec nx lint kppdf-web / data-access → 0 ошибок в touched files
pnpm exec nx build kppdf-web → PASS, exit 0
```

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (nx build kppdf-web)
  - tests: PASS (data-access + kppdf-web focused specs, 17 new/updated tests total)
  - lint: PASS (0 errors in touched files)
  - checklist: ADDED (docs/agent-checklists/TZ-NX-DEALS-D3-COUNTERPARTIES.md)
  - progress.md: N/A (captured in checklist + page.md per token-budget policy)
  - status synchronization: PASS

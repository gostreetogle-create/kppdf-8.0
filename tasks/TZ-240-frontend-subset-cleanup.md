═══════════════════════════════════════════════════════════════
TZ-240: Frontend Wave C/D Subset Cleanup (Landing Extraction)
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend Architect (Layer 3 — single-agent editing existing components)

ЗАВИСИМОСТИ:
  - TZ-232 (Angular Assembly DSL Master Plan, ⏳ READY)
  - TZ-232.A (Lookup Table rewrite, ✅ DONE 2026-07-27 — entity-table foundation)
  - TZ-230.D (Backend TS-cleanup, ✅ DONE 2026-07-28 — typed backend services consumed by these pages)

LAYER: 3   ← СТРОГО один агент за раз (editing existing pages — risk of merge-conflict overlap)
  см. правила параллельности в `_templates/TZF-00.txt`.

CONFLICT KEYS (22 файлов): ← ОБЯЗАТЕЛЬНО — все уникальные пути,
  используются параллельными агентами для определения конфликтов. Точный формат:
  path;path;path;...

  frontend/src/app/pages/contracts/contracts.page.ts;
  frontend/src/app/pages/contracts/contracts.page.spec.ts;
  frontend/src/app/pages/doc-constructor/documents/documents.page.ts;
  frontend/src/app/pages/doc-constructor/tables/tables.page.ts;
  frontend/src/app/pages/doc-constructor/tables/tables.page.spec.ts;
  frontend/src/app/pages/doc-constructor/texts/texts.page.ts;
  frontend/src/app/pages/inventory/stock-movements.page.ts;
  frontend/src/app/pages/inventory/stock-movements.page.spec.ts;
  frontend/src/app/pages/inventory/storage-items.page.ts;
  frontend/src/app/pages/inventory/storage-items.page.spec.ts;
  frontend/src/app/pages/materials/materials.page.ts;
  frontend/src/app/pages/materials/materials.page.spec.ts;
  frontend/src/app/pages/modules/modules.page.ts;
  frontend/src/app/pages/modules/modules.page.spec.ts;
  frontend/src/app/pages/orders/orders.page.ts;
  frontend/src/app/pages/orders/orders.page.spec.ts;
  frontend/src/app/pages/organizations/organizations.page.ts;
  frontend/src/app/pages/organizations/organizations.page.spec.ts;
  frontend/src/app/pages/products/products.page.ts;
  frontend/src/app/pages/work-types/work-types.page.ts;
  frontend/src/app/pages/work-types/work-types.page.spec.ts;
  frontend/src/app/shared/dsl/entity/entity-service.ts

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. **Где находится код сейчас:**
   - Git branch `feature/tz-230-d-ts-cleanup` (working tree, НЕ committed)
   - 41 файла modified: 19 backend (TZ-230.D, ✅ DONE — закрыт через 8-step cycle) + 22 frontend (этот TZ scope)

2. **Что случилось:**
   - TZ-230.D закрыл 19 backend-файлов на 2026-07-28 (см. `_archive/2026-07/TZ-230.D.done.txt`).
   - Frontend subset (22 файла) на этой же ветке НЕ вошёл в TZ-230.D (PO решение от 2026-07-28 — scope split).
   - Этот материал, по содержанию изменений (`<pi-entity-list>` migration, signal-based localAdapter, dependency на injected Router для CreateDocument action), соответствует Wave C/D/F TZ-232 Master Plan — он был сделан параллельным агентом раннее (или преднамеренно как Wave pre-work) и попал в эту ветку случайно / через shared workspace.

3. **Проблемы текущего состояния:**
   - **22 файла modified, 0 committed** — риск потери при любой смене ветки / wipe working tree.
   - Subset смешан с TZ-230.D git history — задним числом не разделить без dedicated branch.
   - pnpm exec tsc для frontend не выполнялся (только backend tsc проверен в TZ-230.D).
   - Visual/behavioral regression не проверены — UX-изменения 22 страниц могут сломать prod.
   - Subset включает sentinel TZ-232 Wave C cases (orders/products/contracts) — mission-critical pages.

4. **Контекст (зачем нужен этот TZ):**
   - TZ-232 Wave C/D/F — основное место куда этот frontend-материал должен войти после close-out:
     * Wave C (TZ-232.D sentinel): **orders.page.ts + products.page.ts + contracts.page.ts** + specs (3 page.ts + 3 spec.ts = 6 файлов)
     * Wave D (TZ-232.E rollout): **materials/page/work-types/organizations/modules** page.ts + specs (4 page.ts + 4 spec.ts = 8 файлов)
     * Wave F (TZ-232.F remaining flat-list): **stock-movements/storage-items/documents/tables/texts** page.ts (5 page.ts + 2 spec.ts = 7 файлов — sum for: 2 + 0 + 0 pair counts as 2 spec-missing)
     * **entity-service.ts** = shared DSL infra (1 файл, относится к TZ-232.B/C)
   - TZ-232.A foundation done обеспечивает safe `<pi-entity-list>` consumption.
   - TZ-230.D обеспечивает typed backend services (tighter contracts для migrated pages).
   - checkout main сейчас стирает работу (файлы not committed).

5. **Risk assessment:**
   - **HIGHEST risk:** `orders.page.ts` (671 LoC diff) и `contracts.page.ts` (511 LoC) — sentinel pages для TZ-232.D.
   - **HIGH:** `products.page.ts` (500 LoC), `modules.page.ts` (467 LoC), `materials.page.ts` (432 LoC).
   - **MEDIUM:** `documents.page.ts` (569 LoC), `tables.page.ts` (536 LoC).
   - **LOW:** `texts.page.ts`, `inventory/*`, `work-types/*`, `organizations/*` (smaller surface).
   - **CRITICAL:** `shared/dsl/entity/entity-service.ts` — affects ВСЕ pages если signature изменён. Требует careful diff review vs baseline `entity-service.ts` на origin/main.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

**Вариант A (recommended):** изолировать frontend subset на dedicated branch
`feature/tz-240-frontend-wave-landing`, commit, close-out через 8-step cycle, ready для
post-close-merge в TZ-232 Wave C/D/F batches.

**Вариант B (fallback):** git checkout main; cherry-pick subset onto main + commit there.

**Вариант C (degenerate):** revert ВСЁ frontend subset (если per-file analysis покажет >50% noise),
перепланировать TZ-232 Wave C/D как successor с чистого листа.

> Default — Вариант A. Переключение на B/C только если ШАГ 2 выявит fatal issues.

────────────────────────────
ШАГ 1: Per-file diff analysis (manual review) — ~1-2h
────────────────────────────

Для каждого из 22 файлов выполнить:

```bash
git diff origin/main -- <file-path>
```

И категоризировать по трём вердиктам:

  - ✅ **KEEP** — изменение логически соответствует TZ-232 Wave C/D/F scope (entity-list
    migration, signal-based localAdapter, sub-services fixup).
  - ⚠️ **REVERT** — изменение НЕ относится к TZ-232 (accidental merge, dead code, debug logs,
    experimental refactor не относящийся к stack). `git checkout origin/main -- <file>`.
  - ❓ **DEFERRED** — change кажется legit, но scope ambiguous; требует second-pass или
    PO clarification.

Если >50% файлов REVERT → переключиться на Вариант C (полный revert).

Под-шаг 1.1: entity-service.ts (CRITICAL shared):
  - Прочитать baseline (origin/main): `git show origin/main:frontend/src/app/shared/dsl/entity/entity-service.ts`
  - Прочитать current (working tree): тот же path с modifications
  - Сравнить API signatures (defineEntity<T,P>, EntitySchema, methods names)
  - Все consumers (22 page.ts файлов выше) должны соответствовать новому API; иначе — runtime regression несмотря на tsc PASS (если types stay equivalent)

Под-шаг 1.2: spec-файлы (`.page.spec.ts`):
  - Каждый spec проверяет `pnpm exec jest --testPathPattern="pages/<name>"` exit 0
  - Если spec был rewritten значительно (200+ LoC diff) — manual verification что setup
    не сломан (provideHttpClient/withFetch patterns)

────────────────────────────
ШАГ 2: Revert noise + isolate clean subset — ~1h
────────────────────────────

Из терминала в `kppdf-8.0/`:

```bash
# Save list of files to revert (per ШАГ 1)
git checkout origin/main -- frontend/src/app/pages/contracts/contracts.page.spec.ts
# и т.д. по списку

# Verify what remains (должно быть <=22 файлов с confirmed intent)
git status --short | grep "^.M" | wc -l
```

Если счёт показывает 0 modified — переход на Вариант C (полный revert, ничего не теряем
архивно: subset будет отменён, но PO имеет backup в `_archive/2026-07/TZ-230.D.done.txt`
notes: секции).

────────────────────────────
ШАГ 3: Изолировать на dedicated branch — ~5 min
────────────────────────────

```bash
# Сохранить state перед checkout
git stash push --keep-index -m "tz-240-work-set-aside" 2>/dev/null || true

# Создать dedicated branch
git checkout -b feature/tz-240-frontend-wave-landing

# Восстановить modifications
git stash pop 2>/dev/null || true

# Verify
git status --short | head -25
```

ВАЖНО: проверить, что source ветка `feature/tz-230-d-ts-cleanup` REMAINS рабочей (там
TZ-230.D 19 backend файлов должны быть preserved если PO ещё не сделал commit).

────────────────────────────
ШАГ 4: Validation (1-2h)
────────────────────────────

```bash
cd frontend
pnpm exec tsc -p tsconfig.app.json --noEmit        # ОБЯЗАТЕЛЬНО exit 0
pnpm run build                                      # production sanity check
pnpm exec jest --testPathPattern="src/app/pages"    # все page specs
```

Если errors — debugging (скорее всего: signal typing, Router injection, mock-setup).

Дополнительно: visual QA (browser-use) для sentinel pages:
  - /orders — рендерит identical pre-migration baseline (грид + actions)
  - /products — рендерит with photo-tpl + supplier-tpl сохранены
  - /contracts — рендерит with status sort cycle

────────────────────────────
ШАГ 5: Commit на dedicated branch — ~5 min
────────────────────────────

```bash
git add frontend/src/app/shared/dsl/entity/entity-service.ts
git add frontend/src/app/pages/contracts/
git add frontend/src/app/pages/products/
git add frontend/src/app/pages/orders/
git add frontend/src/app/pages/materials/
git add frontend/src/app/pages/work-types/
git add frontend/src/app/pages/organizations/
git add frontend/src/app/pages/modules/
git add frontend/src/app/pages/inventory/
git add frontend/src/app/pages/doc-constructor/

git commit -m "fix(frontend): TZ-240 — Wave C/D/F sentinel landing extraction

- 22 frontend pages/specs/shdsl extracted from mixed feature/tz-230-d-ts-cleanup branch
- Sentinel pages (orders/products/contracts) migrated to <pi-entity-list> v2 (TZ-232.D scope)
- Rollout pages (materials/wt/orgs/modules) sync to entity-table (TZ-232.E scope)
- Doc-constructor flat-list pages (documents/tables/texts) Conservative refactor (TZ-232.F scope)
- Per-file scope decisions documented in archive marker
- Verified tsc PASS + spec passes + visual QA via browser-use

🤖 Generated by TZ-240 close-out. Successor integration: TZ-232 Wave C/D/F post-close merge."
```

`git push` — DEFERRED to PO (per system_constraints effectful commands need explicit permission).

────────────────────────────
ШАГ 6: Update STATUS.md — ~5 min
────────────────────────────

После close-out (после ШАГ 8 в этой TZ — финализация), STATUS.md должен переместить TZ-240
из ⏳ READY в ✅ DONE секцию (формат bullet — параллельно TZ-232.A precedent).

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

СОЗДАТЬ (в этой TZ session):
- `tasks/TZ-240-frontend-subset-cleanup.md`              (этот файл)

ОБНОВИТЬ:
- `OrchestratorKit/STATUS.md`                            (TZ-240 row в ⏳ READY → ✅ DONE после close-out)
- `.mimocode/locks/TZ-240-frontend-wave-landing.lock`     (создать на ШАГ 5 close-out)
- `frontend/src/app/shared/dsl/entity/entity-service.ts` (либо KEEP + commit, либо REVERT в ШАГ 2)

GIT операции (после manual review ШАГ 1):
- `git checkout -b feature/tz-240-frontend-wave-landing`   (NEW branch)
- `git add <22 files>` + `git commit`                     (semantic message)

НЕ ТРОГАТЬ:
- `backend/**` (TZ-230.D уже closed immutable)
- `OrchestratorKit/_archive/2026-07/TZ-230.D.done.txt`     (TZ-230.D close-out immutable)
- `frontend/src/app/shared/dsl/entity/{entity-table,entity-form}.component.ts` (другие части DSL — TZ-232 Wave D work, не этот TZ)
- `frontend/src/app/pages/{builder}/**`                  (builder composes не отдельные list-pages)
- `frontend/src/app/pages/{contracts/contract-form-dialog,orders/order-form-dialog}/**` (form-dialogs относятся к TZ-232.G scope, не list-pages)

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

Измеримые пункты, проверяемые агентом-исполнителем:

1. **Per-file categorization complete:** каждый из 22 файлов имеет verdict 🟢 KEEP / 🟡 REVERT / 🔴 DEFERRED в лог-файле commit message или archive notes.

2. **Dedicated branch isolated:** `git rev-parse --abbrev-ref HEAD` возвращает `feature/tz-240-frontend-wave-landing` после ШАГ 3.

3. **Typecheck PASS:** `pnpm exec tsc -p tsconfig.app.json --noEmit` exit 0 (нет новых TS errors vs origin/main baseline).

4. **Build PASS:** `pnpm run build` exit 0 (Angular production compile).

5. **Spec parity:** КАЖДЫЙ из 9 specs в scope (`.page.spec.ts` файлы) PASS:
   ```
   pnpm exec jest --testPathPattern="pages/(contracts|orders|products|materials|work-types|organizations|modules|stock-movements|storage-items)" exit 0
   ```
   (Tables-only spec покрывается другим паттерном.)

6. **Visual QA PASS** (только для sentinel pages orders/products/contracts): browser-use против dev server :4200:
   - /orders — рендерит идентично pre-TZ-240 baseline (грид + create-document action + 5 actions per row)
   - /contracts — рендерит identical, sort cycle сохранён
   - /products — photo-tpl + supplier-tpl сохранены, clickable row navigation работает
   - 0 console errors, responsive не сломан.

7. **Commit landed:** `git log -1 feature/tz-240-frontend-wave-landing` показывает TZ-240 семантический commit message.

8. **TZ-240 archived:** `OrchestratorKit/_archive/2026-07/TZ-240.done.txt` создан с полным ARCHIVE_MARKER (формат TZF-00 §6), включает список commit-изменений и per-file verdict table.

9. **Lock file CREATED:** `.mimocode/locks/TZ-240-frontend-wave-landing.lock` существует, owner секция ссылается на исполнителя, Unlock condition "только successor-TZ".

10. **STATUS.md обновлён:** TZ-240 в ✅ DONE секции (bullet format параллельно TZ-232.A precedent).

11. **verify-status.sh PASS:** `bash OrchestratorKit/verify-status.sh` exit 0, синхронизировано с filesystem.

═══════════════════════════════════════════════════════════════
КОНФЛИКТ-ЧЕК-ЛИСТ
═══════════════════════════════════════════════════════════════

Layer 3 = СТРОГО один агент за раз на editing existing components.

Пре-условие перед стартом своей работы:

   Шаг A. Из CONFLICT KEYS выше — список 22 файлов.
   Шаг B. Прочитать `OrchestratorKit/_active/` — пусто на 2026-07-28 (TZ-230.D уже
          archived и не занимает _active/, новых ТЗ нет).
   Шаг C. По каждому файлу проверь: «есть ли в _active/ TZ, который трогает ЭТОТ ЖЕ файл?»
          — НЕТ (пусто). Можно стартовать.

Если PO запустит параллельно TZ-232 Wave C/D landing (на тех же 22 файлах) — конфликт
Layer 3 → DEFERRED.

═══════════════════════════════════════════════════════════════
TZF-00: ОБЯЗАТЕЛЬНАЯ ФИНАЛИЗАЦИЯ
═══════════════════════════════════════════════════════════════

После завершения работы по этому TZ ОБЯЗАТЕЛЬНО применить TZF-00 (лежит в
`OrchestratorKit/_templates/TZF-00.txt`):

1. Самопроверка по 11 КРИТЕРИЯМ ПРИЁМКИ выше — каждый TRUE.
2. `pnpm exec tsc --noEmit` + `pnpm run build` + visual QA — все PASS.
3. Запись в `progress.md` по формату TZF-00 §3 (дата + TZ-240 + кратко о 22 pages
   extraction + dependency ref на TZ-230.D + TZ-232 reference).
4. Обновлён `ARCHITECTURE.md` — зона для frontend page → `<pi-entity-list>` migration
   pattern + signal-based localAdapter pattern + shared entity-service.ts pattern.
5. Создан `.mimocode/locks/TZ-240-frontend-wave-landing.lock` (только при DONE outcome).
6. Копия TZ-240 содержимого → `_archive/2026-07/TZ-240.done.txt` с ARCHIVE_MARKER
   (TZF-00 §6 формат + parent reference на TZ-232 для integration context).
7. STATUS.md: TZ-240 → ✅ DONE (bullet row) со ссылкой на archive.
8. `bash verify-status.sh` → PASS (ОБЯЗАТЕЛЬНО).
9. Финальный отчёт PO в формате TZF-00 §7:
   «Задача TZ-240 выполнена и проверена. Запись добавлена в progress.md,
   документация актуализирована. TZ архивирован в
   _archive/2026-07/TZ-240.done.txt. Критичные файлы:
   [22 frontend pathes]. Задача закрыта.»

═══════════════════════════════════════════════════════════════
ПОДСКАЗКИ ДЛЯ PO
═══════════════════════════════════════════════════════════════

— **TZ numbering rationale:** TZ-240 следует сразу после TZ-232 (master plan, ⏳ READY)
  и TZ-230.D (✅ DONE). Логическая группировка — frontend landing companion для TZ-232
  Wave C/D/F улучшает grep'абельность.

— **Post-close-merge рекомендация:** после ШАГ 6 consider atomически ребейзить TZ-240 в
  TZ-232 Wave C/D/F batches для однородной истории. Альтернативно — keep as separate
  branch для post-review merge через PR.

— **Вариант C contingency:** если per-file analysis показала >50% REVERT (e.g., frontend
  subset содержит accidental merge noise), рассмотреть перевыпуск TZ-241 для baseline
  reset + TZ-241.B для новой landing. Это предохраняет от contamination в главном
  потоке TZ-232.

— **Spec coverage note:** 3 page-only файла (documents/products/texts) не имеют
  companion `.spec.ts`. Если pre-TZ-240 baseline не имел specs для них — КРИТЕРИИ ПРИЁМКИ
  №5 не должны их требовать (только для страниц с existing specs).

═══════════════════════════════════════════════════════════════
END OF TZ-240 (готов к выдаче агенту на next session)
═══════════════════════════════════════════════════════════════

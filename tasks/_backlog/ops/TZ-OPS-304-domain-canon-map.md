═══════════════════════════════════════════════════════════════
TZ-OPS-304: Domain Canon Map — связность домен ↔ модули ↔ страницы
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: docs/process executor (read-only по коду, write только docs)
ЗАВИСИМОСТИ: TZ-OPS-302 DONE; TZ-OPS-303 DONE
LAYER: 1
CONFLICT KEYS: docs/DOMAIN-MAP.md; docs/PROJECT-MEMORY.md; docs/DOCS-INTEGRITY.md; docs/pages/README.md; ARCHITECTURE.md; docs/agent-checklists/TZ-OPS-304.md; docs/agent-checklists/_active-map.md; tasks/_active/TZ-OPS-304.md; progress.md; tasks/_archive/2026-08/TZ-OPS-304.done.md

Проверено: docs/pages/README.md; docs/SECTION-READINESS.md;
  docs/audits/2026-08-09-project-knowledge-integrity-analysis.md §3 P1;
  backend/src/modules/ (список папок); frontend routes via docs/pages + app.routes (read-only)
Domain preflight: имена сущностей = код-канон (Counterparty ≠ Organization; qty SoT = StorageItem).

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. Есть page index и огромный ARCHITECTURE, но **нет одной таблицы** «домен → BE modules → FE routes → page.md → SoT docs → не путать с».
2. Агент тратит токены на поиск связей; слабый агент путает Organization/Counterparty, склад/каталог, КП/Order.
3. Часть routes может быть без `*.page.md` — нужен **inventory gaps**, не массовое написание page.md.

---

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Создать `docs/DOMAIN-MAP.md`

Объём: **≤180 строк**. Формат:

#### 1.1 Шапка
- Зачем: быстрый канон связности для агентов.
- Правило: при споре — живой schema/route; карта обновляется в той же TZ, что меняет контур.
- Ссылки: PROJECT-MEMORY, DOCS-INTEGRITY, SECTION-READINESS, data-model (осторожно: может отставать).

#### 1.2 Таблица доменов (обязательные строки)

Заполни **фактами из репо** (проверь пути read-only). Колонки:

`Домен | BE modules (папки) | FE routes | page.md | SoT / канон docs | Не путать`

Минимум домены:

1. **Auth / Users / Roles** — `auth`, `user`, `role`, `permissions`…
2. **Party (контрагенты / орг)** — `counterparty`, `organization`, `person`/`worker`…
3. **Catalog** — `product`, `product-module`, `material`, `bom`, `category`, `catalog*`…
4. **Warehouse / Inventory** — `warehouse`, `storage-item`, `stock-movement`, `reservation`, `inventory`…
5. **Sales / КП / Orders** — `quotation`, `order`, `contract`, `shipment`… (+ page proposals/orders)
6. **Documents / Builder** — `document-template*`, `text-block*`, `table-template`, `generated-document`, `doc-type`…
7. **Production** — `production-order`, `work-order*`, `work-type`, `work-center`, `routing-step`… + `/production`
8. **Supply** — `supply`, `purchase-*`…
9. **Desktop / Import / MCP bridge** — `desktop`, `mutation-journal`, `import-task`, `import-todo`, `import-jobs`…
10. **Admin / Settings** — `admin`, `setting`, `form-profiles`, `feature-flag`…
11. **Cost** — `actual-cost`, `cost-calculation`… (если UI нет — честно N/A)

Если модуля/route/page нет — пиши `—` или `N/A`, не выдумывай.

В колонке «Не путать» обязательно:
- Counterparty = клиент сделки; Organization = наша фирма / supplier org
- Остаток: `StorageItem` / movements; не `Material.stockQty` как SoT
- КП (`quotation` / proposals UI) ≠ Order (цех)
- Catalog composition ≠ warehouse stock

#### 1.3 Gap inventory (таблица)

Прочитай `frontend/src/app/app.routes.ts` (read-only) + `docs/pages/README.md`.

Составь таблицу:

`Route | Есть page.md? (yes/path/NO) | Примечание`

Включи **все** бизнес-routes (можно пропустить `/kit/*`, playground, foundations, если это demo).  
Для `NO` — **не** пиши page.md в этой TZ; только gap.

В конце: `Successor hint: TZ-OPS-305+ или точечные DOC/PAGE TZ на missing page.md (P1 сначала user-facing READY sections).`

### ШАГ 2 — Проводка ссылок

1. `PROJECT-MEMORY.md` — живая ссылка на DOMAIN-MAP; в «Куда идти» добавь «сначала DOMAIN-MAP».
2. `DOCS-INTEGRITY.md` — ссылка на DOMAIN-MAP (обновлять строку домена при смене контура).
3. `ARCHITECTURE.md` — **только** короткий pointer (≤5 строк) в начале или в оглавлении: «Быстрая карта доменов: docs/DOMAIN-MAP.md». Не переписывай архитектуру.
4. Опционально 1 строка в `docs/pages/README.md` → DOMAIN-MAP.

### ШАГ 3 — Closeout

Checklist + Integrity slot (docs-only) → progress → `_active-map` → Executor report (auto) → archive.

---

## ИЗМЕНЯТЬ

- `docs/DOMAIN-MAP.md` (new)
- `docs/PROJECT-MEMORY.md`, `docs/DOCS-INTEGRITY.md` (ссылки)
- `ARCHITECTURE.md` (≤5 строк pointer)
- опционально `docs/pages/README.md` (1 строка)
- checklist / active-map / progress / archive

## НЕ ИЗМЕНЯТЬ

- Любой product code (только **чтение** routes/modules)
- Не создавать пачку missing `*.page.md`
- Не «чинить» data-model.md целиком
- Не трогать активные FE keys DOC/SALES

---

## КРИТЕРИИ ПРИЁМКИ

- [ ] `DOMAIN-MAP.md` ≤180 строк; ≥11 доменных строк таблицы; колонка «Не путать» с 4 канонами выше
- [ ] Gap inventory таблица есть; каждый `NO` без созданного page.md в этом коммите
- [ ] PROJECT-MEMORY + DOCS-INTEGRITY ссылаются на DOMAIN-MAP
- [ ] ARCHITECTURE содержит короткий pointer
- [ ] `git diff` не содержит `frontend/**` или `backend/**` (кроме если случайно — **откатить**)
- [ ] Archive + Executor report (auto)

Verification:

```text
rg -n "DOMAIN-MAP" docs/PROJECT-MEMORY.md docs/DOCS-INTEGRITY.md ARCHITECTURE.md
powershell -Command "(Get-Content docs/DOMAIN-MAP.md).Count"
git diff --name-only
# убедиться: нет frontend/ backend/ product paths
```

---

## known_limitation

- data-model.md может оставаться частично устаревшим — отдельный audit/successor.
- Заполнение всех NO page.md — не эта TZ.
- Автоскрипт сверки routes↔docs — optional successor.

ARCHIVE: `tasks/_archive/2026-08/TZ-OPS-304.done.md`. Docs-only self-archive OK после AC.

═══════════════════════════════════════════════════════════════
TZ-DAY-2026-08-07: Закрыть CATALOG-314 → выполнить CATALOG-320
═══════════════════════════════════════════════════════════════

> **Завтрашнее ТЗ на одну сессию исполнителя (Buffy / Freebuff).**
> Сегодня (2026-08-06 ночь): сессия Freebuff оборвалась («No active free session» /
> Calpost). Код 314 **есть в working tree**, gates заявлены PASS, **коммита/archive нет**.
> Склад / MCP / UI-kit dirty — на паузе, не трогать.
>
> **Канон stop/resume по 314 (детали conflict keys + allowlist):**  
> `docs/agent-handoff-2026-08-06-TZ-CATALOG-314.md`  
> Этот DAY-07 = оркестрация A→B; handoff = чеклист closeout 314.

РОЛЬ АГЕНТА: Backend closeout (часть A) → Frontend UI Engineer (часть B)

ЗАВИСИМОСТИ: main актуален; 313 DONE (`cde79fc`); спека 320 уже в backlog (`2ddf106`)

LAYER: 4 затем 3 (последовательно, не параллельно)

═══════════════════════════════════════════════════════════════
ГДЕ ОСТАНОВИЛИСЬ (факт на 2026-08-06)
═══════════════════════════════════════════════════════════════

| Item | Fact |
|------|------|
| HEAD docs | `a0d54f5` (DAY-07 script) — на origin; 320/311 specs с `2ddf106` |
| TZ-CATALOG-314 code | **uncommitted** в WT: soft-delete/`deletedAt`, org-scope, archive guards, `catalog-314.archive.spec.ts` |
| Claim | `tasks/_active/TZ-CATALOG-314.md` — READY FOR REVIEW |
| Checklist | `docs/agent-checklists/TZ-CATALOG-314.md` — gates PASS; closeout **не** сделан |
| Commit/push 314 | **нет** |
| Archive/lock 314 | **нет** |
| Buffy | сессия умерла mid-handoff; review subagent отработал; финальный closeout не начат |
| Чужой dirty | UI-kit removal, start.mjs, deals, `tasks/Данные`, docker… — **НЕ stage** |
| Next FE | `tasks/_backlog/catalog/TZ-CATALOG-320.md` (каскад + детали) |
| Later | 311 CompositionTree — **не** стартовать в этот день |

Проверено Cursor: `deletedAt` в `product-module.schema.ts`; `organizationId` на Product service;
active marker + checklist READY FOR REVIEW; conflict-key files modified/untracked.

═══════════════════════════════════════════════════════════════
ЧАСТЬ A — TZ-CATALOG-314 closeout (сначала)
═══════════════════════════════════════════════════════════════

Источник: `docs/agent-handoff-2026-08-06-TZ-CATALOG-314.md` + `tasks/_active/TZ-CATALOG-314.md` + checklist.
(Backlog `TZ-CATALOG-314.md` = pointer only.)

### A0. CLAIM / preflight

```text
1) Get-Location + git rev-parse --show-toplevel → D:\kppdf-8.0
2) git pull --ff-only
3) Прочитать _active-map + tasks/_active/ — 314 уже claimed READY FOR REVIEW
4) Не создавать второй claim; продолжить closeout того же TZ-CATALOG-314
5) Team Room claim best-effort
```

### A1. Re-verify gates (только conflict keys 314)

```text
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd backend && pnpm test -- --runInBand catalog-314.archive product-module.service material.service work-type.service product-module-photo
scoped ESLint (без --fix) на conflict-key backend sources + archive spec
git diff --check на conflict keys 314
```

Если FAIL — чинить **только** 314 keys, снова gates. Не расползаться.

### A2. Cursor/PO PASS

- Если Cursor уже дал PASS в чате — идти к A3.
- Если нет — короткий diff-report по conflict keys и ждать PASS.
- Блокеры: hard-delete Module; archive без 409 на structured refs; поломан 313 photo dual-write;
  staged чужой dirty.

### A3. Commit + push **только** scope 314

Включить:
- все conflict-key backend files из `tasks/_active/TZ-CATALOG-314.md`
- `backend/src/modules/catalog/catalog-314.archive.spec.ts`
- `docs/agent-checklists/TZ-CATALOG-314.md`
- `docs/agent-checklists/_active-map.md` (строка 314 → DONE)
- `progress.md` — **только** запись 314 (не мешать чужие правки файла: аккуратно)
- `tasks/_archive/2026-08/TZ-CATALOG-314.done.md` + ARCHIVE_MARKER
- удаление `tasks/_active/TZ-CATALOG-314.md`
- `.mimocode/locks/TZ-CATALOG-314-*.lock` при необходимости

**НЕ** stage: frontend kit removal, start.mjs, warehouse, desktop/MCP, TZD-*,
`tasks/Данные`, `__pycache__`, deals chips, docker-compose чужой, FEATURE-INTEGRATION
если не из 314.

Сообщение:
```text
feat(catalog): soft-delete archive and org-scope for catalog entities (TZ-CATALOG-314)
```

Push на origin/main после успешного commit (PO на этот день разрешает push closeout 314).

Сообщи hash. Только после этого — Часть B.

═══════════════════════════════════════════════════════════════
ЧАСТЬ B — TZ-CATALOG-320 (после A DONE)
═══════════════════════════════════════════════════════════════

Источник: `tasks/_backlog/catalog/TZ-CATALOG-320.md` (полный AC там).

### B0. CLAIM (до кода)

```text
CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZ-CATALOG-320.md + checklist docs/agent-checklists/TZ-CATALOG-320.md
   (из docs/agent-checklists/_TEMPLATE.md)
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
4) _active-map + чужие _active keys → конфликт = STOP
5) Team Room claim best-effort
Затем: прочитай docs/AI-AGENT-GUIDE.md + tasks/_backlog/catalog/TZ-CATALOG-320.md и выполни TZ.
Archive только после Cursor/PO PASS.
```

### B1. Суть работы (кратко; детали в 320)

1. FE types: `lineType` += `product`, опц. `unitPriceOverride`
2. Module dialog: состав = material **и** child module
3. Product form/detail: module + material≠raw + product; бейдж «Комплекс»
4. Kind-лейблы (деталь/покупное/…) в пикерах
5. Fix `module-form-dialog`: `formGroupName="dimensions"` (ошибка width/height/depth/unit)
6. Page docs + Jest gates из TZ-320

### B2. Commit/push 320

- Только CONFLICT KEYS из TZ-320.
- Чужой dirty не трогать.
- Commit/push после gates + Cursor/PO PASS (или явного «коммить 320» / «пушь»).

### B3. НЕ делать завтра

- TZ-CATALOG-311 (CompositionTree) — следующий день / после 320 DONE
- TZ-CATALOG-315
- Deploy / wipe
- Склад, MCP/desktop, UI-kit cleanup

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ ДНЯ
═══════════════════════════════════════════════════════════════

1. 314: на origin, archive DONE, `_active` без 314, lock/progress ок.
2. 320: CLAIM → реализация → gates PASS → READY FOR REVIEW или DONE (если PASS в тот же день).
3. Working tree: чужой dirty не уехал в commit.
4. Короткий отчёт PO: hash 314; статус 320; что осталось на 311.

Verification дня:
```text
git log -3 --oneline
git status --short   # нет случайно закоммиченного kit/start/Данные
```

═══════════════════════════════════════════════════════════════
ПРОМПТ СКОПИРОВАТЬ ИСПОЛНИТЕЛЮ ЗАВТРА УТРОМ
═══════════════════════════════════════════════════════════════

```text
Ты executor в D:\kppdf-8.0. Сегодня одно ТЗ-дня:
tasks/_backlog/catalog/TZ-DAY-2026-08-07-catalog-314-closeout-then-320.md

Порядок строгий: Часть A (закрыть TZ-CATALOG-314) → только потом Часть B (TZ-CATALOG-320).

Часть A:
- git pull --ff-only
- Перепроверь gates 314 (tsc + focused jest + scoped eslint + diff-check)
- Commit+push ТОЛЬКО conflict keys 314 + archive/checklist/active-map/progress/lock
- Чужой dirty (UI-kit, start.mjs, warehouse, MCP, tasks/Данные) НЕ stage
- Сообщи hash 314

Часть B (после hash 314 на origin):
CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZ-CATALOG-320.md + checklist по docs/agent-checklists/_TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
4) _active-map + чужие _active keys → конфликт = STOP
5) Team Room claim best-effort
Затем: прочитай docs/AI-AGENT-GUIDE.md + tasks/_backlog/catalog/TZ-CATALOG-320.md и выполни TZ.
Archive только после Cursor/PO PASS.
Не стартуй 311. Не деплой.
```

═══════════════════════════════════════════════════════════════
ИЗМЕНЯТЬ / НЕ ИЗМЕНЯТЬ (этот docs-файл)
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ сейчас (Cursor): этот файл; `_active-map` указатель «завтра»; опц. PO-DIARY §5.

НЕ ИЗМЕНЯТЬ: product code 314/320 (исполнитель завтра); чужой dirty.

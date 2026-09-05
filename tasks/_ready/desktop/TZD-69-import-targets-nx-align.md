═══════════════════════════════════════════════════════════════
TZD-69: Desktop IMPORT_TARGETS align с NX + target worker
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Desktop core only (`desktop/src/core/**` + App.svelte write-path для worker). **Не** править `frontend-nx/**`.

ЗАВИСИМОСТИ: TZD-68 DONE (или DEFER note если только worker без export touch). Wave WAVE-DESKTOP-EXCEL-NX-ALIGN. Аудит excel-nx-align.

LAYER: 3
**SIZE:** L
**PACK:** WAVE-DESKTOP-EXCEL-NX-ALIGN

CONFLICT KEYS: `desktop/src/core/import-targets.ts` ; `desktop/src/core/multi-import.ts` ; `desktop/src/core/multi-import.test.ts` ; `desktop/src/core/excel-form-template.ts` ; `desktop/src/App.svelte` ; `docs/agent-checklists/TZD-69.md`

PAGES: N/A
STATUS: READY

═══════════════════════════════════════════════════════════════
DOMAIN PREFLIGHT
═══════════════════════════════════════════════════════════════

| PO | Канон |
|----|--------|
| Люди / рабочие | `Worker` / `POST /api/workers` — targetKey **`worker`** |
| Клиент | Counterparty ≠ Organization |
| Единицы | **НЕ трогать** — NX read-slice осознанный |

Проверено: `CreateWorkerDto` lastName+firstName required; NX worker-form-dialog; `warehouse.type` enum совпадает с Desktop — **не менять type**; Units OUT.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

1. Нет `worker` в IMPORT_TARGETS / FORM_TEMPLATES.
2. Колонки material/product/workType могут чуть расходиться с NX forms — сверить и поправить только desktop.
3. `createEntities` не умеет worker.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Target `worker`

  1.1. Добавить в `IMPORT_TARGETS` + `IMPORT_TARGET_ORDER` + Form category `references` (или новая «Люди» — предпочтение: category `references` / label «Люди»).
  1.2. Columns (RU labels как NX dialog):
       required: lastName, firstName
       optional: patronymic, position, department, email, phone, grade, ratePerHour, isActive, workTypeNames
  1.3. `workTypeNames`: строка имён через `;` → resolve к workTypeIds по name (org list); неизвестное имя → invalid.
  1.4. Dedupe: email (lower) если есть; иначе lastName|firstName|patronymic casefold.
  1.5. validateTableRows ветка + tests.
  1.6. `createEntities`: POST `/api/workers` с whitelist DTO (без organizationId с клиента).

ШАГ 2: Align существующих (только desktop)

  2.1. Сверить material/workType columns с NX form fields; добавить недостающие fillable; не ломать aliases.
  2.2. **Не** убирать/менять warehouse.type.
  2.3. Units — **не** добавлять.

ШАГ 3: Form Studio allowlist + tests round-trip worker form.

═══════════════════════════════════════════════════════════════
ИЗМЕНЯТЬ / НЕ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ: import-targets, multi-import (+test), excel-form-template, App.svelte createEntities/dedupe fetch.

НЕ: frontend-nx; Units target; warehouse.type removal; BE schema; Excel на вебе.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] Скачать форму Люди → 1 валидная строка → validate ok_new → POST worker создаёт запись
- [ ] Дубль email → duplicate; пустая фамилия → invalid
- [ ] Битое имя вида работ → invalid с RU message
- [ ] Units по-прежнему нет в Form Studio dropdown
- [ ] desktop tests PASS

known_limitation: workTypeNames только по точному name; bulk skills later.

Финализация: archive 2026-09 + lock.

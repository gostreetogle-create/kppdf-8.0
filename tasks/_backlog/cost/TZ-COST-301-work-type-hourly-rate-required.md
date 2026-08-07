═══════════════════════════════════════════════════════════════
TZ-COST-301: WorkType hourlyRate обязателен
═══════════════════════════════════════════════════════════════

> READY · LAYER 3/4 · BE DTO + FE form/list · **review before archive**
>
> Аудит: `docs/audits/2026-08-08-catalog-cost-pricing-hierarchy.md`
> PO: расценка вида работ обязательна (₽/час); без неё себестоимость модуля/изделия врёт.
> Проверено: `work-type.schema.ts` (`hourlyRate?`); create/update DTO `@IsOptional`;
> `work-type-form-dialog` — поле без required; CostCalculation использует `hourlyRate ?? 0`.

STATUS: DONE — archive `tasks/_archive/2026-08/TZ-COST-301.done.md` · `79edbea`

РОЛЬ АГЕНТА: Backend + Frontend (work-types)

ЗАВИСИМОСТИ: Нет (первый в cost-wave)

LAYER: 3 (FE form) + 4 (BE) — строгий = 3 для параллели с CATALOG-331:
  если `_active` держит те же FE files → DEFER или согласовать.
  Conflict с CATALOG-331: **нет** (331 = appearance/settings; 301 = work-types).

PAGES: `/work-types`
PAGE_DOCS: (создать/обновить `docs/pages/work-types.page.md` если нет — кратко)

CONFLICT KEYS:
backend/src/modules/work-type/work-type.schema.ts;
backend/src/modules/work-type/dto/create-work-type.dto.ts;
backend/src/modules/work-type/dto/update-work-type.dto.ts;
frontend/src/app/pages/work-types/work-type-form-dialog.component.ts;
frontend/src/app/pages/work-types/work-types.page.ts;
docs/pages/work-types.page.md;
docs/agent-checklists/TZ-COST-301.md;
progress.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

1. `hourlyRate` optional → labor cost в расчёте = 0 молча.
2. Nav: Каталог / Виды работ — **не переносить** в Справочники (канон аудита).
3. Существующие записи без ставки: backfill `0` допустим; UI должен требовать
   явное число ≥ 0 при create/update (0 = «бесплатно», но осознанно).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — BE
- Create/Update DTO: `hourlyRate` **required**, `@IsNumber() @Min(0)`.
- Schema: оставить Number; default 0 для старых docs ок.
- Одноразовый безопасный backfill в seed **или** migration note в progress:
  `updateMany({ hourlyRate: { $exists: false } }, { $set: { hourlyRate: 0 } })`
  — если есть принятый паттерн OnApplicationBootstrap seed; иначе скрипт
  `backend/scripts/` + строка в progress «запустить вручную». Предпочтительно
  idempotent boot-safe update в существующем work-type seed, если файл есть.

ШАГ 2 — FE
- Form: Validators.required + min 0; RU label «Ставка, ₽/час».
- List: колонка ставки (если ещё нет) — видно без открытия карточки.
- Не ломать accentHue / Gantt color save.

ШАГ 3 — Docs + checklist
- Checklist до кода; page doc 5–15 строк канон «ставка обязательна».
- Не трогать CostCalculation (это 302).

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Перенос `/work-types` в Справочники
- CostCalculation / Product.costPrice
- CATALOG-331 appearance WIP
- desktop/** , mass page-chrome

═══════════════════════════════════════════════════════════════
AC
═══════════════════════════════════════════════════════════════

1. POST/PATCH work-type без `hourlyRate` → 400.
2. FE не даёт Submit без ставки.
3. Список показывает ₽/час.
4. Gates:
   ```text
   cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   ```
   + точечный jest/spec если уже есть на work-type form; иначе не invent suite ради suite.
5. Commit только conflict keys. Archive после Cursor PASS.

known_limitation: значение 0 разрешено (явный «ноль»); «строго >0» — только если PO скажет отдельно.

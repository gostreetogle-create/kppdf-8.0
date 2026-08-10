═══════════════════════════════════════════════════════════════
TZ-DICT-319: Kind labels dictionary — backend
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Backend Developer
ЗАВИСИМОСТИ: PRODUCTS-310 желательно DONE (не блокер по keys)
LAYER: 4
CONFLICT KEYS: backend/src/modules/dictionary-label; backend/src/app.module.ts; docs/agent-checklists/TZ-DICT-319.md

PAGES: (API only; UI = DICT-320)
PAGE_DOCS: —

Проверено: ProductKind/MaterialKind — TS unions + hardcoded RU labels in FE; нет API для rename «Услуга».

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Модель
  - Коллекция (имя на усмотрение, напр. `dictionary_labels` / `ref_labels`):
    `{ scope: 'productKind' | 'materialKind', key: string, label: string, sortOrder: number, isActive: boolean, isSystem?: boolean, organizationId? }`
  - Unique: `(organizationId|global, scope, key)`.
  - Seed idempotent: productKind good/service/work → Изделие/Услуга/Работа; materialKind — текущие FE labels из materials.service.

ШАГ 2: API
  - `GET /dictionary-labels?scope=` — list (admin/manager/user read)
  - `GET /dictionary-labels/active?scope=` — compact for selects
  - `PATCH /dictionary-labels/:id` — label, sortOrder, isActive (admin/manager); **key immutable**
  - POST new key — optional in this TZ; минимум seed + rename. Если POST: key slug validation.

ШАГ 3: Tests — seed idempotent; patch label; unique; active filter.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Status FSM enums; WorkType module; EAV attribute-definition
- FE wire (DICT-320)

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. After boot: active productKind ≥3; materialKind ≥ seeded set.
2. PATCH label «Услуга»→«Услуги цеха» persists; GET active returns new label; key `service` unchanged.
3. Gates: `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` + jest module.
4. Archive + report.

known_limitation: dimension types / legal forms = Phase 2 park (audit §3).

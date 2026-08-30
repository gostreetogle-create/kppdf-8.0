# PROMPT — Freebuff: F3 closeout v2 (features slim + archive)

**Claim:** продолжай `tasks/_active/TZ-NX-F3-data-access.md` · `agent_id: freebuff-nx-f3`

**Диагноз:** `features:build` (@nx/js:tsc) тянет `@kppdf/ui/*` в program → TS6059. `paper-and-ink:build` не лечит — paths в `tsconfig.base.json` всё равно на исходники.

**Решение (канон TZ):** admin UI **только** в `apps/kppdf-web`; в `libs/features` оставить **только** `pi-group-workspace` (+ spec).

---

## Шаги

### 1. Удалить из `libs/features/src/lib/` (файлы + exports)

Удалить полностью:

- `admin-group-chips.ts`
- `permission-labels.ru.ts`
- `role-form-dialog.component.ts`
- `device-invite-dialog.component.ts`
- `owner-device-invite-dialog.component.ts`
- `device-role-dialog.component.ts`
- `on-dialog-close-once.ts`

**Оставить:** `pi-group-workspace.component.ts`, `pi-group-workspace.component.spec.ts`, `features.ts`, `features.spec.ts`

### 2. `libs/features/src/index.ts` — только:

```ts
export const KPPDF_FEATURES_VERSION = '0.0.0-f0';
export * from './lib/features';
export { PiGroupWorkspaceComponent } from './lib/pi-group-workspace.component';
export type { GroupChip } from './lib/pi-group-workspace.component';
```

### 3. App pages — локальные импорты

В `apps/kppdf-web/src/app/pages/` **уже есть** копии admin-файлов. Проверь:

- `admin-devices.page.ts`, `admin-roles.page.ts`:
  - `onDialogCloseOnce` → `import { onDialogCloseOnce } from './on-dialog-close-once'`
  - **Создай** `apps/kppdf-web/src/app/pages/on-dialog-close-once.ts` (перенеси из удалённого features-файла)
  - `PiGroupWorkspaceComponent` → `@kppdf/features` (OK)
  - dialogs → `./device-*`, `./role-form-dialog` (локально)
- Убери любые `import { … } from '@kppdf/features'` кроме `PiGroupWorkspaceComponent` / `GroupChip`

### 4. `pi-group-workspace` spec

- Mock `@kppdf/data-access`, не legacy paths.

### 5. Не трогать

- `legacy frontend/**`
- `tsconfig.base.json` paths hack / rootDir tricks
- kit pages

### 6. Gates (все PASS перед archive)

```bash
cd backend && pnpm test -- auth.service permissions.guard jwt.strategy
cd frontend-nx && pnpm exec nx build kppdf-web
cd frontend-nx && pnpm exec nx run-many -t lint --all
```

### 7. Archive

- `tasks/_archive/2026-08/TZ-NX-F3-data-access.done.md`
- очистить `tasks/_active/TZ-NX-F3-data-access.md`
- checklist: Integrity slot + Executor report (auto)

---

## AC

- [ ] `features` lib не импортирует `@kppdf/ui/*`
- [ ] `nx build kppdf-web` PASS
- [ ] backend auth tests PASS
- [ ] archive + `_active` пуст по F3

После PASS → PO: «продолжай kit» → Claude фаза B (`tasks/PROMPT-CLAUDE-NX-KIT-AUDIT.md`).

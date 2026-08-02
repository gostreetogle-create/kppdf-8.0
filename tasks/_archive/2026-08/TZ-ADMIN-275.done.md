ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: Buffy
commit: 058ff7c
verification:
  - acceptance criteria: PASS
  - frontend jest: PASS (699/699 full)
  - backend jest: PASS (320/320 full)
  - ng build (development): PASS
  - frontend typecheck: PASS (targeted; full tsc blocked by foreign categories.page.ts)
  - backend typecheck: PASS
  - git diff --check: PASS
  - code review: PASS
  - verify-status.sh: PASS
browser: MANUAL_BROWSER_CHECK_REQUIRED (no live dev-stack credentials in this session)

═══════════════════════════════════════════════════════════════
TZ-ADMIN-275: Role form — удалить подтверждённые hex-fallback
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend CSS Architect

ЗАВИСИМОСТИ: TZ-265 (Paper & Ink комплаенс admin-диалогов)

LAYER: 1 (CSS-only, в существующем компоненте)

CONFLICT KEYS:
frontend/src/app/pages/admin/role-form-dialog.component.ts

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Файл: `frontend/src/app/pages/admin/role-form-dialog.component.ts`.
2. Подтверждённые grep-ом остаточные hex-фолбэки в `var()`:
   - `#8a8172` — 3 вхождения (строки 201, 275, 332)
     `color: var(--color-muted-foreground, #8a8172);`
   - `#f0ece2` — 1 вхождение (строка 305)
     `background: var(--color-paper-2, #f0ece2);`
3. Токены `--color-muted-foreground` и `--color-paper-2` определены
   глобально в `frontend/src/styles.css`.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Убрать hex-фолбэки из `var()`
- `var(--color-muted-foreground, #8a8172)` → `var(--color-muted-foreground)`
- `var(--color-paper-2, #f0ece2)` → `var(--color-paper-2)`

ШАГ 2: Проверить
- grep по файлу: 0× `#8a8172`, 0× `#f0ece2`, 0× прямых hex-значений
  в целевой области;
- НЕ вводить новые hex-цвета;
- НЕ менять поведение формы, permissions catalog, API;
- НЕ мигрировать нативные inputs на shared-компоненты в рамках
  этой задачи.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- frontend/src/app/pages/admin/role-form-dialog.component.ts

НЕ ИЗМЕНЯТЬ:
- frontend/src/styles.css (токены не менять)
- backend/*, прочие admin-файлы, _templates/*

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. `grep -n '#8a8172\|#f0ece2' role-form-dialog.component.ts` → пусто.
2. `grep -n '#[0-9a-fA-F]\{3,6\}' role-form-dialog.component.ts` →
   пусто (в целевой области компонента).
3. `pnpm exec tsc -p tsconfig.app.json --noEmit` → exit 0.
4. `pnpm exec ng build --configuration=development` → exit 0.
5. admin Jest (`npx jest src/app/pages/admin`) → PASS.
6. Browser check `/admin/roles` (диалог роли рендерится) — выполнен
   ИЛИ честно помечен MANUAL_BROWSER_CHECK_REQUIRED.

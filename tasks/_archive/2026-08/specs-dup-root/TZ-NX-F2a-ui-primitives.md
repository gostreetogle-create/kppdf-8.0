# TZ-NX-F2a: Pure UI primitives → `libs/ui/paper-and-ink`

**РОЛЬ АГЕНТА:** Executor (Freebuff / Gemini / Claude CLI)  
**ЗАВИСИМОСТИ:** `tasks/TZ-NX-F1-foundation.md` — **DONE**  
**LAYER:** 2 (UI kit)  
**CONFLICT KEYS:** `frontend/shared-ui`; `frontend/cdk-overlays`; `frontend/tiptap`; `frontend-nx/libs/ui/paper-and-ink/**`; `frontend-nx/tsconfig.base.json`; `frontend-nx/package.json`; `frontend-nx/libs/features/**` (только `pi-group-workspace`)

**PAGES:** N/A (инфра; smoke через `tsc` + lint; kit routes — F4)  
**PAGE_DOCS:** N/A

---

## ИСХОДНОЕ СОСТОЯНИЕ

- **F1 DONE:** `global.css` в ui-lib, `util/http` в nx, boundaries green, `paper-and-ink` = 4 scaffold `.ts`.
- **Legacy источник:** `frontend/src/app/shared/ui/` (161 `.ts`), `shared/page/` (11), `shared/theme/` (4).
- **Цель nx:** `libs/ui/paper-and-ink/src/lib/` + `page/` + `theme/`; **~140** файлов после exclusions.
- **Boundaries:** `type:ui` → только `type:ui`; **запрещён** импорт `@kppdf/util-http` и любого `type:util`.

**Проверено:** `frontend/src/app/shared/ui/`; `frontend/package.json`; `frontend-nx/libs/ui/paper-and-ink/`; `tasks/TZ-NX-F1-foundation.md`; план §F2a; инвентаризация 2026-08-29 (143 `.ts` gross, ~140 net).

---

## EXCLUDE LIST (не копировать)

| Путь | Причина |
|------|---------|
| `ui/quick-create/**` | domain coupling |
| `ui/composition/**` | domain coupling |
| `ui/catalog/**` | domain coupling |
| `ui/notifications/**` | domain coupling (см. stub ниже) |
| `ui/forbidden/**` | domain coupling |
| `ui/error-banner/**` | F3d (util/http) |
| `ui/photo/**` | model coupling |
| `ui/dialog/document-template-category-form-dialog.component.ts` | domain |
| `ui/menu/pi-nav-dropdown.component.ts` | PermissionKey |
| `page/pi-group-workspace.component.ts` (+ spec) | auth/page-acl → **F4/features**, не F2a |

---

## ЧТО ДЕЛАТЬ

### F2a-0 — Claim + deps

1. Claim slot → `tasks/_active/TZ-NX-F2a-ui-primitives.md`
2. В `frontend-nx/package.json` добавить deps **= legacy versions**:
   - `@angular/cdk` (уже pinned F0)
   - `lucide-angular`, `clsx`, `tailwind-merge`
   - `@tiptap/core`, `@tiptap/starter-kit`, `@tiptap/pm`, `@tiptap/extensions` + extensions из legacy `package.json`
3. `pnpm install`

### F2a-1 — Bulk copy (byte-copy, zero logic changes)

4. Скопировать `frontend/src/app/shared/ui/**` → `libs/ui/paper-and-ink/src/lib/` с **EXCLUDE LIST**.
5. Скопировать `frontend/src/app/shared/page/**` → `libs/ui/paper-and-ink/src/page/` **кроме** `pi-group-workspace*`.
6. Скопировать `frontend/src/app/shared/theme/**` → `libs/ui/paper-and-ink/src/theme/`.
7. Исправить относительные импорты `../ui/` → `../lib/` где сломалось (theme editor).
8. **Не трогать** `frontend/**`.

### F2a-2 — Toast ↔ notifications decouple (ui-internal stub)

9. `toast/pi-toast.service.ts` импортирует excluded `notifications/`. Создать **минимальный stub**:
   - `libs/ui/paper-and-ink/src/lib/notifications/pi-notification-center.service.ts`
   - `@Injectable`, метод `push()` no-op
   - **Не** копировать excluded `notifications/` целиком
   - Stub остаётся в `type:ui` (без util/data-access)

### F2a-3 — ESLint selectors (legacy parity)

10. Обновить `libs/ui/paper-and-ink/eslint.config.mjs`:
    - `component-selector` / `directive-selector`: `prefix: ''` (legacy `app-pi-*`, `pi-*`)
    - `no-output-native`, `no-empty-function`, template a11y — `off` для миграционной волны (как legacy)
11. **Не** менять root `eslint.config.mjs` boundaries.

### F2a-4 — Secondary entry paths (no god-barrel)

12. В `tsconfig.base.json` добавить paths для каждой папки с `index.ts` (24 шт.):
    ```text
    "@kppdf/ui/button" → libs/ui/paper-and-ink/src/lib/button/index.ts
  ...
    "@kppdf/ui/toast" → ...
    "@kppdf/ui/page" → libs/ui/paper-and-ink/src/page/index.ts
    "@kppdf/ui/theme" → libs/ui/paper-and-ink/src/theme/index.ts
    ```
13. Корневой `libs/ui/paper-and-ink/src/index.ts` — **только** scaffold `paper-and-ink` (не re-export всех Pi).

### F2a-5 — pi-group-workspace → features (domain chrome)

14. Скопировать `pi-group-workspace.component.ts` (+ spec) → `libs/features/src/lib/`
15. Импорты auth/ACL — **временные stubs** в `libs/data-access/` (`AuthService`, `filterByPageAcl`) до F3; features may import data-access per boundaries.
16. Убрать export group-workspace из `page/index.ts` ui-lib; экспорт из `@kppdf/features`.

### F2a-6 — Verify gates

17. Прогнать AC; зафиксировать error count → 0.

---

## STOP RULES

1. **Никакого** нового HTML/CSS для отсутствующих Pi — STOP.
2. **Никакого** импорта `@kppdf/util-http` в `libs/ui/**`.
3. **Никаких** правок legacy `frontend/**`.
4. **Никакого** kit routes / app wiring кроме stubs — F4.
5. Рефактор signals/control-flow — **не** в этой волне.

---

## ИЗМЕНЯТЬ

- `frontend-nx/libs/ui/paper-and-ink/**`
- `frontend-nx/libs/features/**` (только group-workspace)
- `frontend-nx/libs/data-access/**` (только временные stubs для group-workspace)
- `frontend-nx/tsconfig.base.json`
- `frontend-nx/package.json`, `pnpm-lock.yaml`

## НЕ ИЗМЕНЯТЬ

- `frontend/**` legacy
- `libs/util/http/**` (F1 closed)
- `apps/kppdf-web` routes / kit pages (F4)
- `scripts/architecture-check.mjs` (TZ-NX-GATES)

---

## КРИТЕРИИ ПРИЁМКИ

```bash
cd frontend-nx && pnpm install
cd frontend-nx && pnpm exec tsc -p libs/ui/paper-and-ink/tsconfig.lib.json --noEmit
cd frontend-nx && pnpm exec tsc -p libs/features/tsconfig.lib.json --noEmit
cd frontend-nx && pnpm exec nx build kppdf-web
cd frontend-nx && pnpm exec nx run-many -t lint --all
cd frontend-nx && pnpm exec nx test paper-and-ink --passWithNoTests
```

- [ ] ~140 `.ts` в ui-lib; exclude-list соблюдён (grep forbidden paths = 0)
- [ ] `tsc` paper-and-ink + features — **0 errors**
- [ ] `nx build kppdf-web` — SUCCESS
- [ ] lint — 0 errors
- [ ] `@kppdf/ui/button` … `@kppdf/ui/toast` резолвятся (smoke import в spec или tsc path check)
- [ ] Корневой `@kppdf/ui` index — **не** god-barrel
- [ ] `type:ui` файлы не импортируют `@kppdf/util-http`
- [ ] Legacy `frontend/` git-clean

### Proof of adoption

- Минимум один `import from '@kppdf/ui/button'` (или другой secondary) в `apps/kppdf-web` **или** в `libs/features` — допустимо в F2a как smoke в `paper-and-ink` spec; полный kit consumer — F4.

---

## known_limitation

- `pi-group-workspace` stubs auth до F3
- Kit visual parity `:4200` vs `:4201` — F4
- `error-banner` — F3d
- Domain UI (quick-create, catalog, …) — features wave позже

---

## CLAIM

```text
agent_id: (executor fills)
claimed_at: (ISO-8601)
task: TZ-NX-F2a-ui-primitives
```

## ARCHIVE

`tasks/_archive/2026-08/TZ-NX-F2a-ui-primitives.done.md`

---

## F2a COMPLETION (2026-08-29)

**Outcome:** **DONE** — Architect verified + PO PASS

**Executor:** freebuff-nx-f2a  
**claimed_at:** 2026-08-29T09:49:00+03:00 (corrected from placeholder)

### Evidence (architect re-run)

```text
tsc paper-and-ink                              → 0 errors
tsc features                                   → 0 errors
nx build kppdf-web                             → SUCCESS
nx run-many -t lint --all                      → 0 errors (36 warnings legacy)
exclude-list grep                              → clean
@kppdf/util-http in paper-and-ink              → clean
```

### Delivered

- ~146 migrated files (lib 133 incl. scaffold, page 13, theme 4)
- Secondary paths: 24 `@kppdf/ui/*` + page + theme
- Toast stub `PiNotificationCenterService` (ui-internal)
- `pi-group-workspace` → `@kppdf/features` + data-access stubs
- Root `@kppdf/ui` index — scaffold-only

### known_limitation (carry to F3/F4)

- `data-access` stubs — replace in F3
- Kit routes / side-by-side verify — F4
- `error-banner` — F3d

### Next wave

- **TZ-NX-F4-kit-shell** (можно параллельно с подготовкой F3)
- **TZ-NX-F3-data-access** (заменить stubs)


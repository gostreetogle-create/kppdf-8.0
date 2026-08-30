# Freebuff — Nx F2a: bulk Pi primitives → `frontend-nx`

> **Самая большая волна foundation.** Один claim, один агент, без параллели на те же paths.  
> **TZ:** `tasks/TZ-NX-F2a-ui-primitives.md`  
> **Conflict keys:** `frontend-nx/libs/ui/paper-and-ink/**`; `frontend-nx/tsconfig.base.json`; `frontend-nx/package.json`

## Старт (обязательно)

```text
cd D:\kppdf-8.0
git pull --ff-only
git status
```

Прочитай целиком:
- `GEMINI.md`
- `.agents/skills/kppdf-executor-loop/SKILL.md`
- `tasks/TZ-NX-F2a-ui-primitives.md`

**CLAIM** → `tasks/_active/TZ-NX-F2a-ui-primitives.md` · `agent_id: freebuff-nx-f2a` · ISO `claimed_at`

**Зона:** только `frontend-nx/**`. **`frontend/**` READ-ONLY** — не править.

---

## Порядок работ (строго)

### 1) Dependencies (F2a-0)

В `frontend-nx/package.json` добавь из `frontend/package.json`:
`lucide-angular`, `clsx`, `tailwind-merge`, `@tiptap/*` (все пакеты tiptap как в legacy).

```bash
cd frontend-nx && pnpm install
```

### 2) Bulk copy (F2a-1) — byte-copy, zero logic edits

**Источник → цель:**
- `frontend/src/app/shared/ui/` → `frontend-nx/libs/ui/paper-and-ink/src/lib/`
- `frontend/src/app/shared/page/` → `frontend-nx/libs/ui/paper-and-ink/src/page/`
- `frontend/src/app/shared/theme/` → `frontend-nx/libs/ui/paper-and-ink/src/theme/`

**EXCLUDE (не копировать):**
```
ui/quick-create/
ui/composition/
ui/catalog/
ui/notifications/
ui/forbidden/
ui/error-banner/
ui/photo/
ui/dialog/document-template-category-form-dialog.component.ts
ui/menu/pi-nav-dropdown.component.ts
page/pi-group-workspace.component.ts
page/pi-group-workspace.component.spec.ts
```

Оставь scaffold `src/lib/paper-and-ink/` (4 файла) — не удаляй.

**Import fix:** `theme/pi-theme-editor.component.ts` — `../ui/` → `../lib/` если есть.

### 3) Toast stub (F2a-2)

Создай `libs/ui/paper-and-ink/src/lib/notifications/pi-notification-center.service.ts`:
- `@Injectable({ providedIn: 'root' })`
- `push(_input: unknown): void {}` — no-op
- Чтобы `toast/pi-toast.service.ts` компилировался без excluded notifications/

### 4) ESLint (F2a-3)

`libs/ui/paper-and-ink/eslint.config.mjs` — legacy selectors:
- `prefix: ''` для component + directive
- `no-output-native`, `no-empty-function`, template a11y rules → `off`

### 5) Secondary entries (F2a-4)

В `frontend-nx/tsconfig.base.json` добавь paths для 24 папок с `index.ts`:
`avatar`, `badge`, `button`, `card`, `charts`, `checkbox`, `fact-card`, `filter-panel`, `form-field`, `form-section`, `input`, `label`, `progress`, `radio`, `scroll-area`, `select`, `select-add-row`, `separator`, `skeleton`, `slider`, `status-banner`, `switch`, `textarea`, `toast`

Плюс:
```json
"@kppdf/ui/page": ["libs/ui/paper-and-ink/src/page/index.ts"],
"@kppdf/ui/theme": ["libs/ui/paper-and-ink/src/theme/index.ts"]
```

**Корневой** `libs/ui/paper-and-ink/src/index.ts` — **не** god-barrel (только scaffold export).

### 6) group-workspace → features (F2a-5)

- Скопируй `pi-group-workspace*` → `libs/features/src/lib/`
- Stubs в `libs/data-access/src/lib/`:
  - `auth.service.stub.ts` — `AuthService` с `user$` signal
  - `page-acl.ts` — `filterByPageAcl()` pass-through
- `features/src/index.ts` — export `PiGroupWorkspaceComponent`
- `page/index.ts` — убрать group-workspace exports

### 7) Gates (F2a-6)

```bash
cd frontend-nx
pnpm exec tsc -p libs/ui/paper-and-ink/tsconfig.lib.json --noEmit
pnpm exec tsc -p libs/features/tsconfig.lib.json --noEmit
pnpm exec nx build kppdf-web
pnpm exec nx run-many -t lint --all
```

**Цель:** 0 tsc errors, 0 lint errors, build SUCCESS.

Проверь:
```bash
# exclude-list compliance
rg "quick-create|composition/|catalog-appearance|error-banner|pi-nav-dropdown" libs/ui/paper-and-ink/src --glob "*.ts" -l
# должно быть пусто (кроме комментариев)

# ui isolation
rg "@kppdf/util-http" libs/ui/paper-and-ink/src --glob "*.ts"
# должно быть пусто
```

### 8) Archive + commit

- Completion note в `tasks/TZ-NX-F2a-ui-primitives.md`
- Archive → `tasks/_archive/2026-08/TZ-NX-F2a-ui-primitives.done.md`
- Commit message: `feat(nx): F2a pure Pi primitives to paper-and-ink lib`
- Push только если PO явно попросил (иначе commit local OK per git policy)

---

## STOP (немедленно эскалируй)

- Нужен новый UI-примитив которого нет в legacy → STOP, не изобретай HTML
- Импорт `type:util` в ui-lib → STOP
- Правка `frontend/**` → STOP
- tsc > 50 errors → зафиксируй первые 20, не рефактори логику

---

## Отчёт PO (формат)

```text
TZ-NX-F2a: DONE|FAILED
Files copied: N
tsc paper-and-ink: 0 errors
tsc features: 0 errors
nx build: SUCCESS|FAIL
nx lint --all: 0 errors
Exclude-list grep: clean|VIOLATION
Archive: tasks/_archive/2026-08/TZ-NX-F2a-ui-primitives.done.md
```

═══════════════════════════════════════════════════════════════
TZ-UI-WR-505: ErrorBanner API — string | HttpError coerce
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend Component Engineer
ЗАВИСИМОСТИ: Нет (разблокирует 511)
LAYER: 2
CONFLICT KEYS: frontend/src/app/shared/ui/error-banner/error-banner.component.ts; frontend/src/app/shared/ui/error-banner/error-banner.component.spec.ts; frontend/src/app/shared/ui/error-banner/index.ts

PAGES: cross-cutting
PAGE_DOCS: N/A

Проверено: error-banner.component.ts — `input<{message, canRetry?} | null>`;
  0 использований `app-error-banner` в pages/; inline errors ~20+.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Расширить input (без breaking)
Принимать:
- `null`
- `{ message: string; canRetry?: boolean }` (как сейчас)
- `string` → `{ message }`
Опционально: маленький helper `toBannerError(unknown)` в том же файле/util —
если передан Error/Http-like с `.message` / `.error.message`.

ШАГ 2 — Template без изменений UX (role=alert, retry button).

ШАГ 3 — Specs: string input renders; object input; null hides; retry emit.

ШАГ 4 — НЕ мигрировать pages здесь (это 511). Можно 1 smoke usage в kit
после 506 — optional.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

```
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest --testPathPattern="error-banner"
cd frontend && pnpm lint
```
Существующие callers с object-input не ломаются.

Finalization: archive + Executor report (auto).

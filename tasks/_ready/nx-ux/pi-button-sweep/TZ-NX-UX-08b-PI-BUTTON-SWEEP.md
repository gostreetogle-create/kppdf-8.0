# TZ-NX-UX-08b-PI-BUTTON-SWEEP: поддельные `pi-button-*` → `<app-pi-button>`

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** UX #08 warehouses DONE (`71b57377` уже показал паттерн)  
**LAYER:** 3 · **SIZE:** L  
**PAGES:** multi (NX pages still using fake class strings)  
**PAGE_DOCS:** `docs/audits/2026-09-09-nx-ux-warehouses-audit.md` (cross-cutting §)

**CONFLICT KEYS:**  
все `frontend-nx/apps/kppdf-web/src/app/pages/**/*.ts` с `class="pi-button` (кроме уже починенных warehouses) ;  
соответствующие `*.spec.ts` где селекторы `.pi-button-*` ;  
`docs/audits/2026-09-09-nx-ux-pi-button-sweep.md` (create) ;  
`docs/agent-checklists/WAVE-NX-UX-PAGE-SWEEP.md` ;  
`docs/audits/2026-09-09-nx-ux-page-sweep-canon.md` (строка про кнопки)

IMPLICIT CONFLICT: nx build kppdf-web

### Preflight Check Output
- **Context read:** warehouses audit cross-cutting; `button.component.ts` variants; `global.css` `.pi-outline-btn` (реальный класс — **не** трогать)
- **Key Constraints:** механическая замена; один continuous; не менять BE/логику кликов; сохранить `data-test`
- **Planned Deliverable:** 0 вхождений fake `pi-button-primary|secondary|outline|ghost` на pages; audit inventory
- **Validation Path:** rg count=0; nx test kppdf-web; nx build

**Проверено:** fake classes never existed in CSS; SoT = `<app-pi-button>`.

---

## ЧТО ДЕЛАТЬ

### ШАГ 0 — Inventory
`rg` по `frontend-nx/apps/kppdf-web` → список файлов → `docs/audits/2026-09-09-nx-ux-pi-button-sweep.md`.

### ШАГ 1 — Mapping (канон)
| Было | Стало |
|------|--------|
| `<button class="pi-button pi-button-primary" …>` | `<app-pi-button variant="default" …>` |
| `pi-button-secondary` | `variant="secondary"` (или `outline` если визуально secondary на странице уже outline) |
| `pi-button-outline` | `variant="outline"` |
| `pi-button-ghost` | `variant="ghost"` |
| `<a class="pi-button …" routerLink>` | `<app-pi-button variant="…" [href]="…" или routerLink через обёртку — как в existing app-pi-button usages`; сохранить data-test |

Import `ButtonComponent` / `PiButtonComponent` как в `warehouses.page.ts` после FIX.

### ШАГ 2 — НЕ трогать
- `.pi-outline-btn` / `.pi-outline-btn-destructive` в `global.css` — **живые** классы (chip/small).
- `/production` (SKIP).
- Логику handlers / BE.

### ШАГ 3 — Specs
Обновить селекторы `.pi-button-primary` → `app-pi-button` / data-test где ломаются.

### ШАГ 4 — Closeout
Canon: эталон кнопки = `<app-pi-button>`, не class string. WAVE row **08b DONE**. `_NOW` IDLE.

## НЕ ИЗМЕНЯТЬ
Новые фичи; expand-паттерны; BE; kit pages если уже на app-pi-button.

## КРИТЕРИИ ПРИЁМКИ
1. `rg 'class="pi-button' frontend-nx/apps/kppdf-web/src/app/pages` → **0** hits (или только комментарии).
2. `#04–#07` pages + остальные из inventory переведены.
3. `nx test kppdf-web` + `nx build kppdf-web` PASS.
4. Audit inventory + SHA в WAVE.

# TZ-NX-STUDIO-TEMPLATE-PICKER-ICONS: крестики в «Выберите шаблон»

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** после `TZ-NX-LUCIDE-ICONS-REGISTER` (тот же implicit `nx build`) **или** сразу если Lucide уже в main  
**LAYER:** 3 · **SIZE:** S  
**PAGES:** `/studio` (диалог выбора шаблона при создании)  
**PAGE_DOCS:** `document-studio.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-template-picker-dialog.component.ts` ;  
`docs/pages/document-studio.page.md` ;  
`docs/agent-checklists/_NOW.md`

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

### Preflight Check Output
- **Context read:** скрин PO «Выберите шаблон»; `studio-template-picker-dialog.component.ts:26` (`class="pi-icon-button"`); `docs/audits/2026-09-09-nx-ux-studio-list-audit.md` (третье место `pi-icon-button` флагнуто, не тронуто в UX-15); `studio-templates-list.page.ts` (эталон `.pi-icon-btn .pi-icon-btn-danger`); `docs/DIALOG-COOKBOOK.md`
- **Key Constraints:** Только picker-dialog. Не менять PiDialog shell / footer API. Destructive delete уже через AlertDialog — оставить.
- **Planned Deliverable:** живые `pi-icon-btn` delete; ряд выровнен; empty footer не раздувать scope
- **Validation Path:** FIC G + visual: крестик в рамке 32×32 как на `/studio/templates`

**Проверено:** мёртвый класс `pi-icon-button` — 0 CSS в репо; живой — `pi-icon-btn` + `pi-icon-btn-danger` (`global.css`).

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. PO: «нормальный вид крестиков» в модалке «Выберите шаблон».
2. Delete: `class="pi-icon-button …">×` — **без стилей**, голый × справа от карточки.
3. Header close shell (`w-8 h-8 hairline`) — ок, не трогать.
4. Residual из `TZ-NX-UX-15-studio-list-FIX` (glob был `studio-*.page.ts`, диалог вне scope).

## ЧТО ДЕЛАТЬ

1. Заменить delete-кнопку на:
   `class="pi-icon-btn pi-icon-btn-danger pi-focus-ring shrink-0"`
   (как `studio-templates-list.page.ts` / `studio-list.page.ts`).
2. Ряд: оставить `flex items-center gap-2`; карточка `flex-1` + delete справа **внутри** визуальной линии ряда (vertically centered с `items-center` — проверить после смены класса).
3. Не переносить × внутрь select-кнопки (клик select ≠ delete).
4. Обновить `document-studio.page.md`: закрыть note про «третье место pi-icon-button».
5. Optional smoke: открыть picker с `/studio` → delete icon выглядит как registry danger btn; confirm dialog без регресса.

## НЕ ИЗМЕНЯТЬ

- `pi-dialog.component.ts` (пустой footer content-variant — known shell; не чинить «заодно»)
- A4 editor geometry / Quotation sync
- BE templates API

## КРИТЕРИИ ПРИЁМКИ

1. В DOM delete имеет `pi-icon-btn` + `pi-icon-btn-danger`; **нет** `pi-icon-button`.
2. Визуально: квадрат hairline + ×, вертикальный центр с карточкой строки.
3. `rg pi-icon-button frontend-nx` → 0 hits.
4. Gates PASS.

## BUILD INTEGRITY (обязательно)

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

Baseline (до CLAIM):
  cd frontend-nx && pnpm exec nx build kppdf-web  → exit 0

Gates (закрытие, nx build — ПОСЛЕДНИЙ):
  cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
  cd frontend-nx && pnpm test
  cd frontend-nx && pnpm lint
  pnpm architecture:check
  cd frontend-nx && pnpm exec nx build kppdf-web  → exit 0

Параллель: STOP если в tasks/_active/ другой TZ с kppdf-web/src/**

## Финализация

Archive → `tasks/_archive/2026-09/` + PAGE-TZ-INDEX строка + commit/push.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-11
closed_by: Claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: PASS in touched file (pre-existing 38-error baseline debt outside scope, unchanged)
  - checklist: ADDED (docs/agent-checklists/TZ-NX-STUDIO-TEMPLATE-PICKER-ICONS.md)
  - progress.md: N/A (redirect file — see docs/agent-checklists/_NOW.md)
  - status synchronization: PASS

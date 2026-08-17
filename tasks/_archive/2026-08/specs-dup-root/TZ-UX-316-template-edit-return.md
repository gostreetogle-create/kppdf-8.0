═══════════════════════════════════════════════════════════════
TZ-UX-316: «Редактировать шаблон» из Create КП → /builder/:id + returnUrl
═══════════════════════════════════════════════════════════════

PAGES: /proposals/create ; /doc-constructor/builder/:id
PAGE_DOCS: proposals-create.page.md ; builder.page.md ; page-chrome.md
Аудит: docs/audits/2026-08-12-nav-return-gutters-canon.md
WAVE: tasks/_backlog/ui/WAVE-NAV-RETURN.md

РОЛЬ АГЕНТА: Frontend
ЗАВИСИМОСТИ: нет
LAYER: 2

CONFLICT KEYS:
  frontend/src/app/pages/commercial/proposals/proposal-create-template-picker.component.ts ;
  frontend/src/app/pages/doc-constructor/builder/builder.page.ts ;
  frontend/src/app/pages/doc-constructor/builder/builder.page.spec.ts ;
  docs/pages/proposals-create.page.md ;
  docs/pages/builder.page.md

ИСХОДНОЕ СОСТОЯНИЕ (Проверено в коде):
- `openBuilder()` в `proposal-create-template-picker.component.ts` делает
  `navigate(['/doc-constructor/templates'], { queryParams: { templateId, source: 'quotation-create' } })`.
- Templates list **не** читает `templateId` → пользователь остаётся на списке (баг PO).
- Живой editor = `/doc-constructor/builder/:id` (`templates.page` `onEdit` уже так).
- Builder `goToTemplates()` всегда → `/doc-constructor/templates` (возврат в Create сломан).
- Прецедент возврата: `CatalogReturnStore` (`catalog-return.util.ts`, TZ-UX-313).

ЧТО ДЕЛАТЬ:
1. `openBuilder()` → `navigate(['/doc-constructor/builder', id], { queryParams: { returnUrl } })`
   где `returnUrl` = текущий Create path (`/proposals/create` + существенные query id черновика если есть).
2. Builder кнопка «← …»:
   - valid same-origin `returnUrl` query → navigate туда; label «← К созданию КП» (или «← Назад»);
   - иначе `CatalogReturnStore.navigateBackOr('/doc-constructor/templates')`; label «← Шаблоны».
3. Jest: picker → builder/:id + returnUrl; builder back чтит returnUrl.
4. Docs: proposals-create + builder page.md (deep-link + return). Не переписывать gutter-канон (317).

ИЗМЕНЯТЬ: CONFLICT KEYS выше.
НЕ ИЗМЕНЯТЬ: app-layout gutters; proposal-create.page.ts без нужды; Desktop; PDF/print; templates list logic кроме docs.

КРИТЕРИИ ПРИЁМКИ:
- [ ] Из Create «Редактировать шаблон» открывает canvas этого id (не список).
- [ ] «←» из builder с returnUrl возвращает в Create.
- [ ] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- [ ] focused Jest picker + builder.page PASS
- [ ] archive + commit/push; Deploy НЕ

Финализация: `tasks/_archive/2026-08/` + lock + progress/ARCHITECTURE зона docs; verify если kit.

PROMPT: tasks/_backlog/ui/PROMPT-NAV-RETURN.md

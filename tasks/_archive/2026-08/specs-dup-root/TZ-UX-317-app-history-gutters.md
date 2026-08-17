═══════════════════════════════════════════════════════════════
TZ-UX-317: системные ← → в полях app shell (весь сайт)
═══════════════════════════════════════════════════════════════

PAGES: (shell — все маршруты app-layout)
PAGE_DOCS: page-chrome.md
Аудит: docs/audits/2026-08-12-nav-return-gutters-canon.md
WAVE: tasks/_backlog/ui/WAVE-NAV-RETURN.md
DEPENDS ON: TZ-UX-316 желательно DONE (returnUrl уже в ходу)

РОЛЬ АГЕНТА: Frontend
ЗАВИСИМОСТИ: TZ-UX-316 (мягкая)
LAYER: 3

CONFLICT KEYS:
  frontend/src/app/layout/app-layout.component.ts ;
  frontend/src/app/layout/app-layout.component.spec.ts ;
  frontend/src/app/shared/navigation/catalog-return.util.ts ;
  frontend/src/app/shared/navigation/app-history.store.ts ;
  docs/pages/page-chrome.md ;
  docs/audits/2026-08-12-nav-return-gutters-canon.md

ИСХОДНОЕ СОСТОЯНИЕ:
- page-chrome.md: «Глобальных ←→ в app shell нет (by design)» — **PO отменяет** (скрин gutters + запрос).
- Пустые поля слева/справа от max-width колонки — место под системный chrome.
- CatalogReturnStore уже знает previous URL для каталога; нужен site-wide history ←→.

ЧТО ДЕЛАТЬ:
1. Store SPA history (новый `app-history.store.ts` или расширение CatalogReturnStore без ломки API).
2. В `app-layout`: кнопки ← / → в **левом** gutter (и при необходимости правом) вне max-width контента;
   Paper & Ink; micro ≥11px; `data-test="app-nav-back"|"app-nav-forward"`.
3. ← = history back если можно, иначе disabled. → = forward если можно, иначе disabled.
   Глобальная кнопка **не** прыгает на произвольный fallback раздела.
4. Не перекрывать Create КП studio rails и builder palette (z-index/position в gutter).
   На `<md`: компактно / только ← / скрыть — без сдвига A4.
5. page-chrome.md: убрать запрет; описать gutters + приоритет returnUrl vs history.
6. Spec layout + visual AC на `/doc-constructor/templates` wide.

ИЗМЕНЯТЬ: CONFLICT KEYS.
НЕ ИЗМЕНЯТЬ: куча контекстных кнопок v1; TOC/chips; Desktop; deploy; proposal-create studio logic.

КРИТЕРИИ ПРИЁМКИ:
- [ ] Wide: ←→ видны в полях; disabled корректно.
- [ ] После Create→builder (316) глобальный ← тоже ведёт назад по истории.
- [ ] Create studio / builder не сдвинуты.
- [ ] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- [ ] layout spec PASS; archive + commit/push; Deploy НЕ

PROMPT: tasks/_backlog/ui/PROMPT-NAV-RETURN.md

═══════════════════════════════════════════════════════════════
TZ-UI-WR-506: /kit routes + primitive passports
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend Architect
ЗАВИСИМОСТИ: Нет (бывший WR-512 влит; paper-and-ink z-table — зона WR-501,
  здесь только kit pointer на foundations/kit-layout если нужно).
LAYER: 3
CONFLICT KEYS: frontend/src/app/app.routes.ts; frontend/src/app/app.routes.spec.ts; frontend/src/app/layout/kit-layout.component.ts; frontend/src/app/pages/overlays/overlays.page.ts; frontend/src/app/pages/forms/forms.page.ts; frontend/src/app/pages/foundations/foundations.page.ts

PAGES: /kit ; /kit/foundations ; /kit/forms ; /kit/overlays ; …
PAGE_DOCS: N/A

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Lazy routes `/kit/*` + kit-layout; auth как `/design`.
ШАГ 2 — app.routes.spec.ts: ожидать path==='kit' (снять «kit отсутствует»).
ШАГ 3 — Passports на overlays/forms/foundations: назначение / anti-use /
  keyboard / status canonical|experimental (≤8 строк RU на primitive).
  Минимум: Dialog, Sheet, Drawer, OverflowSelect, PiSelect, error-banner,
  skeleton, dropdown-menu.
ШАГ 4 — Smoke /kit/overlays.

НЕ: Storybook; paper-and-ink.md (конфликт с Agent A / WR-501); business pages;
  ui-dialog-canon.md (зона WR-510/501).

## Proof of adoption
- consumer: /kit/* routed + ссылка из kit-layout nav
- test: app.routes.spec kit registered
- docs: passport blocks on kit pages
- migration: offline showcase / новый primitive без /kit entry — запрещены
- leftover: неполные kit sections — перечислить

Finalization: archive TZ-UI-WR-506.done.md (WR-512 merged).

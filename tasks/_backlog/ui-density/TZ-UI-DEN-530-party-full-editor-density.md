# TZ-UI-DEN-530: FullEditor — organizations & counterparties

PAGES: /organizations ; /counterparties
PAGE_DOCS: organizations.page.md ; counterparties.page.md

РОЛЬ АГЕНТА: Frontend UI Engineer

ЗАВИСИМОСТИ: TZ-UI-DEN-502

LAYER: 3

CONFLICT KEYS: frontend/src/app/pages/organizations/organization-full-editor-dialog.component.ts; frontend/src/app/pages/counterparties/counterparty-full-editor-dialog.component.ts

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: All fields via `app-pi-form-field` eyebrow labels

ШАГ 2: Section headers 14px max; hairline between sections

ШАГ 3: Role/type chips — gold only selected primary; others outline

ШАГ 4: Dialog footer: one gold «Сохранить», cancel = outline

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] org/counterparty editor specs PASS
- [ ] tsc + lint PASS

# WAVE-KP-STUDIO-CHROME — размеры меню + дубли иконок

**Канон:** `docs/audits/2026-08-12-kp-studio-flyout-chrome-audit.md`  
**Параллель:** WAVE-KP-TABLE-EDITOR (359→361) — **не** делить `proposal-create.page.ts`.

Порядок: **363 (parallel) → 362 (после 359 на page.ts)**. Deploy только по PO.

---

## TZ-SALES-363 — polish содержимого панелей (PARALLEL OK)

**LAYER:** 2  
**CONFLICT KEYS:**

```text
frontend/src/app/pages/commercial/proposals/proposal-create-terms.component.ts
frontend/src/app/pages/commercial/proposals/proposal-create-recipient.component.ts
frontend/src/app/pages/commercial/proposals/proposal-create-template-picker.component.ts
frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts
frontend/src/app/pages/commercial/proposals/proposal-product-rail.component.ts
frontend/src/app/pages/commercial/proposals/proposal-create-terms.component.spec.ts
docs/pages/proposals-create.page.md
```

**НЕ ТРОГАТЬ:** `proposal-create.page.ts`, composition, table-studio, table-editor, backend.

**ЧТО ДЕЛАТЬ**

1. Убрать визуальный/текстовый дубль хинтов («A4 только…» / повтор заголовков) внутри этих панелей, где есть.
2. Плотность Paper & Ink: лишний eyebrow/абзац → один короткий; кнопки `PiButton`.
3. Recipient / Terms / Template picker / Params (inspector, `tableOnly` ветку не раздувать — 359 её уберёт): читаемость, без карточного дашборда.
4. Product rail: без изменения ширины flyout (ширина = 362); только внутренние отступы/пустое состояние, если явно шум.

**AC:** FE tsc; focused specs панелей, что есть; page.ts diff пустой.

---

## TZ-SALES-362 — тиры S/L + иконки рейла (AFTER 359)

**Зависимость:** 359 смержен (или page.ts больше не в `_active` у table-editor).  
**LAYER:** 3  
**CONFLICT KEYS:**

```text
frontend/src/app/pages/commercial/proposals/proposal-create.page.ts
frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts
docs/pages/proposals-create.page.md
```

**ЧТО ДЕЛАТЬ**

1. CSS-токены:
   - `--kp-flyout-s: min(20rem, calc(100% - (var(--kp-rail) * 2) - 1rem));`
   - `--kp-flyout-l: min(794px, calc(100% - (var(--kp-rail) * 2) - 1rem));`
2. Назначить: `template` / `params` / `terms` → S; `products` / `table` / `recipient` → L.  
   Убрать разрозненные `50vw` / `58rem` / дубль padding products.
3. Иконка Условий ≠ Шаблон: `termsIcon` → `ScrollText` (или `NotebookText`), не `FileText`.
4. Spec: ширины data-flyout; aria-labels рейла; иконки разные в DOM (по `data-test` / svg path не обязательно — достаточно разных `[img]`).

**AC:** канон audit; FE tsc; `proposal-create.page.spec.ts` зелёный.

---

## Out of scope

Merge Состав/Таблица · фото A4 · Desktop · PATCH TableTemplate.

## Gates

- 363: FE tsc + точечные panel specs  
- 362: FE tsc + `proposal-create.page.spec.ts` + `pnpm architecture:check`

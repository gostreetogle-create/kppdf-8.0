# TZ-UX-444D — DONE

> Статус: DONE · Закрыт: 2026-08-27 · agent: freebuff-1
> TZ: `tasks/TZ-UX-444D-empty-thumb-hatch.md`
> PAGES: `/products/:id`

## Что сделано

1. **CSS utility** `.pi-thumb-empty` в `frontend/src/styles.css` `@layer components`:
   - `bg` = `var(--color-paper-2)`; diagonal hatch = `repeating-linear-gradient` + `var(--color-rule)`;
   - размер как gallery thumbs (`max-width: 9rem`, `aspect-ratio: 1`); без raw hex.

2. **Product detail adoption:**
   - hero без фото → `.pi-thumb-empty` (`aria-hidden`, `data-test="pi-thumb-empty"`);
   - gallery `@empty` → тот же placeholder (не «Нет фото…», не spinner).

3. **Docs:** AI-UI-CONTRACT row + overlay anti-pattern; product-detail.page.md one-liner; PAGE-TZ-INDEX DONE.

4. **Tests:** focused jest — hero + expanded gallery empty hatch.

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → **PASS**
- `pnpm test -- --testPathPattern="product-detail.page.spec" --no-coverage` → **1 suite / 11 tests PASS**
- `pnpm exec eslint` (product-detail page + spec) → **PASS**

## Conflict disclosure

- Parallel: `TZ-QA-445A` (claude, work-types) — not touched.
- Gantt / 445E — not touched.
- `PiEmptyState` tables / photo upload pipeline — not touched.

## Known limits

- Kit overview photo demo not updated (optional in TZ; no kit demo required for acceptance).
- Dropzone empty strip still prior pattern (outside product-detail adoption scope).

## Files

- `frontend/src/styles.css`
- `frontend/src/app/pages/products/product-detail.page.ts` (+.spec.ts)
- `docs/AI-UI-CONTRACT.md`
- `docs/pages/product-detail.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`

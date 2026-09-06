# TZ-UI-DCI-602: focus-visible + tri-state segmented controls

**РОЛЬ АГЕНТА:** Executor (Gemini / Claude CLI)  
**LAYER:** 2 (global CSS + kit comment)  
**CONFLICT KEYS:** `frontend/src/styles.css`; `docs/DARK-THEME.md`; `docs/paper-and-ink.md`  
**ЗАВИСИМОСТИ:** нет  
**ИСТОЧНИК:** `docs/audits/2026-08-31-dark-control-interface-audit.md` § A2, A5

## ИСХОДНОЕ СОСТОЯНИЕ

- `:focus-visible` частично на интерактивах; единого global rule нет.
- Segmented controls (`DARK-THEME.md` § Segmented) описывают фон/текст, но не требуют одновременно border + bg + text weight.
- Reference pattern: DCI `outline: 2px solid var(--ice); outline-offset: 4px` → у нас `--color-gold-deep`.

## ЧТО ДЕЛАТЬ

1. В `frontend/src/styles.css` добавить global:
   ```css
   :focus-visible {
     outline: 2px solid var(--color-gold-deep);
     outline-offset: 4px;
   }
   ```
   Исключения: элементы с собственным focus-ring (PiButton, inputs) — не дублировать двойной outline.

2. Дополнить segmented/chip active state: active pill = **bg tint + gold-ish border + ink text** (tri-state). Проверить существующие `.pi-segmented-*` / chip classes.

3. Обновить `docs/DARK-THEME.md` § Segmented — явная строка «tri-state: не только цвет текста».

4. Kit: в `/kit/basics` или passport-комментарий — одна строка про focus-visible + segmented tri-state.

## НЕ ИЗМЕНЯТЬ

- Цветовую палитру (gold canon).
- Компоненты вне styles.css + kit comment.
- ERP pages layout.

## КРИТЕРИИ ПРИЁМКИ

- [ ] Tab через segmented control показывает visible focus ring (gold-deep, 4px offset)
- [ ] Active segmented: видны bg + border + readable text в light **и** dark
- [ ] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- [ ] `cd frontend && pnpm lint` PASS (changed files)
- [ ] Docs: `DARK-THEME.md` обновлён

## Integrity slot

- [ ] Тип: docs + CSS tokens
- [ ] FIC: N/A (no route/API)
- [ ] page.md: N/A

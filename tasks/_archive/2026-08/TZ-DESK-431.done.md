# TZ-DESK-431 — Paper & Ink: padding + grid в tray и supply flyout — DONE

**agent_id:** freebuff-desk-wave
**claimed_at:** 2026-08-23T12:06:16+0300
**closed_at:** 2026-08-23
**SHA:** `03d2c37d`

ARCHIVE_MARKER
outcome: DONE
closed_by: freebuff-desk-wave
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: PASS
  - checklist: ADDED

## Proof of adoption

- **Consumer `/desk`:** wide flyout покрывает create/edit/bom/supply/docs (supply/docs — 431; create/edit/bom — pre-existing); supply-контент обёрнут `w-full min-w-0`. AC 1 тест +1 (34-й в manager-desk spec).
- **Consumer `/supply`:** `.supply-quick-order__expanded` получил `container-type: inline-size`; layout strips переведён с viewport-`@media (max-width: 1100px)` на **`@container`**: ≥36rem — 3 equal col, <36rem — full-width стек + 2-col subgroups (нет «дыр» в узком flyout); `gap 0.75rem→1rem`, strip-label `px-4 py-3`, fields/panel `p-4` (было 0.35rem у panel), инпуты `height/min-height: var(--touch-comfortable)` + `padding-inline: var(--space-control-x)`, overflow-select host выравнен (его триггер — тоже `.pi-input`).
- **Consumer `/desk` tray:** 4 карточки `p-3`→`p-4` (16px, текст не у hairline); документ-кнопки `gap-1.5`→`gap-2` (min-h-touch уже был).
- **Docs:** `manager-desk.page.md` (431 wide) + `supply.page.md` (container grid).
- **Migration note:** в supply expanded больше нельзя полагаться на viewport-медиа — layout управляется контейнером; full page /supply на широком экране сохраняет 3-col (контейнер ≥36rem).
- **Legacy leftover:** PiSheet-миграция широких flyout — successor (как 509 note).

## Gates

| Gate | Result |
|------|--------|
| `pnpm exec tsc -p tsconfig.app.json --noEmit` | 0 ✅ |
| `pnpm exec jest` (supply-quick-order 28, order-hub-tray 10, manager-desk 34, supply.page 6) | 78/78 ✅ |
| `pnpm exec eslint` (5 файлов) | 0 errors ✅ |
| `git diff --check` | PASS ✅ |

## Заметка по процессу

По указанию PO ждал merge TZ-DESK-430 (claude-агент, WIP в tray/manager-desk). 430 влился в `136759ad` (+ ship-confirm-dialog), wide-docs — `b2f56152`. После merge tray/manager-desk чистые, применил свои правки 431.

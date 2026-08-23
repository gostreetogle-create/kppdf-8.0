# TZ-PARTY-306 — DONE

**Status:** DONE · archived 2026-08-23
**Agent:** cursor-executor

## Что сделано

1. **Shared `PersonQuickCreateDialogComponent`** — compact PiDialog form (фамилия, имя*, отчество, телефон, почта, должность) → `PersonsService.create`.
2. **Counterparty FullEditor** — `+` рядом с overflow-select «Контактное лицо»; после save → person в списке и выбран в форме.
3. **KP recipient** — `<select>` заменён на overflow-select со всеми Person + `+`.
4. **Shared styles** — `.pi-select-add-row` / `.pi-select-add-btn` в `styles.css` (canon supply-quick-order).

## Gates

- FE tsc: PASS
- jest focused (person + counterparty + recipient): 22/22 PASS
- eslint changed TS: PASS

## Archive marker

```
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-23
closed_by: cursor-executor
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: PASS
  - checklist: ADDED
```

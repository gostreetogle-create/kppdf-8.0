# NOW

updated_at: 2026-09-05T08:20:00+03:00

## ACTIVE / LIVE

- **Freebuff** → polish P1–P5 (`PROMPT-FREEBUFF-NX-GANTT-POLISH.md`); **P6 снят**
- **Claude HARDEN DONE** — `TZ-BACKEND-ORDER-ORG-SCOPE-HARDEN.md`: 5 методов
  (`update`/`setItemStatus`/`patchLineBoardLane`/`patchModuleLane`/`setLineReady`)
  теперь отклоняют cross-org caller до save(); `reserveStock`/`ship`/`cancel`/
  `remove` остаются known_limitation (session-transaction-wrapped, отдельный TZ
  если PO захочет полное покрытие). Claude terminal free.

Смысл cutover: `docs/PO-PLAIN-LANGUAGE-CHANGES.md` (один NX в финале; старый frontend — эталон до конца).

## NEXT

Ждать closeout Freebuff polish. Новые TZ для Claude — после отчётов PO / новых скринов,
или явная команда на `reserveStock`/`ship`/`cancel`/`remove` org-scope (не начинать самому).

## DONE

Gantt L0 · peer review · **org-scope harden (5 методов Order)** · Doc Studio FINISH

## PARK

Полный снос `frontend/` — только на cutover NX · contracts · Invoice · L1+

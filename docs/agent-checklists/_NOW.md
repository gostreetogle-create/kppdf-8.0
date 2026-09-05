# NOW

updated_at: 2026-09-05T08:30:00+03:00

## ACTIVE / LIVE

- **Freebuff:** WAVE polish P2→P5 (P1 DONE). Промпт уже выдан ранее.  
- **Claude TX DONE** — `TZ-BACKEND-ORDER-ORG-SCOPE-TX.md`: `reserveStock`/`ship`/
  `cancel`/`remove` теперь отклоняют cross-org caller до side-effect (save/
  reservation/shipment/soft-delete). Весь known_limitation после HARDEN закрыт —
  `OrderService` полностью org-scoped на запись. Claude terminal free.

Канон режима: `docs/PO-SHARED-UNDERSTANDING.md` §5.  
Ревью TZ: `docs/audits/2026-09-05-tz-queue-necessity-review.md`.

## NEXT

1. Freebuff: добить Gantt polish P2–P5  
2. **Готово заранее (не стартовать до P5):** Doc Studio Data IA D50–D54 — `WAVE-DOCSTUDIO-DATA-IA.md` / `PROMPT-FREEBUFF-DOCSTUDIO-DATA-IA.md`  
3. Дальше модули — только по команде/скрину PO

## DONE

Gantt L0 · peer review · HARDEN · TX (org-scope Order writes fully closed) · P1 catalog-spec · shared-understanding docs

## PARK

Полный снос `frontend/` на cutover · contracts · Invoice · Gantt L1+

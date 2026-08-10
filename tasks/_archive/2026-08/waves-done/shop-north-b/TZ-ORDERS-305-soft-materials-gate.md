═══════════════════════════════════════════════════════════════
TZ-ORDERS-305: Soft materials gate (D19)
═══════════════════════════════════════════════════════════════

STATUS: READY · WAVE-SHOP-NORTH-B #3
DEPENDS ON: TZ-ORDERS-304 DONE
LAYER: 3
CHECKLIST: docs/agent-checklists/TZ-ORDERS-305.md

РОЛЬ: Backend order + Frontend order-detail

CONFLICT KEYS:
backend/src/modules/order/**;
frontend/src/app/pages/orders/**;
docs/agent-checklists/TZ-ORDERS-305.md;

Canon: sales-to-shop D19 — soft gate; `materialsSource: own|customer`; warning, не hard ban.

---

## ИСХОДНОЕ

Нет флага «материалы заказчика» / предупреждения при старте без склада.

## ЧТО ДЕЛАТЬ

1. Поле на Order или line: `materialsSource: 'own' | 'customer'` (default own).  
2. UI select/radio на order-detail.  
3. Soft warning banner если readyForWork=true и source=own и (best-effort) нет confirmed supply — текст по-русски, не блок PATCH.  
4. Опц. один system notification / toast mirror — без переписывания bell Phase2.  
5. НЕ hard-block Gantt/production start.

## НЕ

INVENTORY reserve (INVENTORY-301); PROCUREMENT auto-PR; desktop; Gantt.

## AC

1. materialsSource сохраняется.  
2. customer → нет ложного «нет на складе» hard error.  
3. own + ready → warning виден (даже если supply пуст).  
4. Gates BE+FE tsc.

known_limitation: точный stock check → INVENTORY-301 later.

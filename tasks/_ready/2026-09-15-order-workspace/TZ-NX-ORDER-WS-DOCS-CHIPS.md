# TZ-NX-ORDER-WS-DOCS-CHIPS: документы + workflow chips + tools

> **SIZE:** S · Depends: LOGISTICS archived · **WAVE STOP** after  
> **CONFLICT KEYS:** `order-workspace/ui/order-ws-documents*`; `order-ws-workflow-chips*`; order-detail page; shell setTools if used

**IMPLICIT CONFLICT:** `nx build kppdf-web`

## ЧТО ДЕЛАТЬ

1. **Документы:** deep-link «Шаблоны документов» `source=order&sourceId=`; список связанных studio docs — **только** если есть существующий list API; иначе empty «Нет связанных документов» без fake PDF rows.
2. **Workflow chips** (как `/home`): Главная · КП · Гант · Снабжение · Отгрузка; current = Заказ; chips с `orderId` where needed.
3. Page `setTools`: только **живые** иконки (напр. открыть список заказов / supply) — disabled «скоро» запрещены; если нечего — rails остаются history-only.
4. Docs page.md финальный operator scenario; tracker WAVE DONE.
5. Specs chips hrefs; no fake audit section.

## НЕ
- Audit timeline
- Print pack generator
- Right summary ₽ rail

## AC
Chips + docs link работают; страница визуально цельная A→E без demo chrome; build LAST PASS; WAVE STOP.

# WAVE-KP-PAGE-MODE-FINISH — страничный режим КП «до конца»

> Триггер: PO 2026-08-19 — «перенос строк / фон / страничный режим в Create КП и в шаблоне
> не доделан как в KP3». Warm deploy **после** этой волны (не смешивать с desk hotfix).

## Уже на main (не переделывать)

| TZ | Что |
|----|-----|
| 346 | `sheetLayout.rowsFirstPage/rowsNextPage`, лента A4, фон на каждой странице build |
| 376 | Auto capacity по **высоте рамки** таблицы в шаблоне; `pageBreakBefore` режет build |
| 378 | Multipage CSS (фон не слетает); стр.2+ = полный лист, remap table layout |
| 370 | «С новой страницы» на строке в Редакторе таблицы |

**Где сейчас:** Параметры → «Вид листа» (только в Create КП). В конструкторе шаблона у блока
таблицы — только высота рамки, **без** «строк на 1-й / следующих».

## Дыры (PO smell)

1. **Шаблон не задаёт дефолт переноса** — менеджер каждый раз вручную в Параметрах; высота
   рамки и число строк не связаны в UI конструктора (KP3: `tablePageBreakFirstPage/NextPages`).
2. **377 PARK** — на стр.2+ повторяются декоративные блоки стр.1 (логотип/шапка); PO хочет
   «фон + таблица» на продолжении.
3. **Multi-page canvas в builder** — `layout.page` clamped to 1; отдельный шаблон на каждую
   страницу **не** в этой волне (successor / never без PO).

## Очередь волны

| # | TZ | Суть | Layer |
|---|-----|------|-------|
| 1 | **TZ-SALES-380** | Дефолт переноса строк на блоке таблицы в builder + hydrate Create КП | 3 |
| 2 | **TZ-SALES-377** | Continuation: стр.2+ = фон + line-items (+ итог/условия на последней) | 3 |

**Deps:** 380 → 377 (377 меняет renderHtmlPages; 380 только schema/UI/hydrate).

**Deploy gate:** после 377 PASS — один warm deploy (desk + KP page mode + desktop installer).

## Не брать параллельно

- `document-template.service.ts` (Layer 3) — строго по очереди 380 then 377
- Desk wave hotfix уже на `5b4a3268` — deploy можно до KP wave, но PO просил «сначала доделать КП»

## Smoke после deploy

- Create КП 25+ позиций: ≥2 листа, фон на всех, стр.2+ без лишней шапки (377)
- Новый шаблон: задал строки в builder → новый КП подхватил в «Вид листа» (380)
- `docs/agent-checklists/DESK-SMOKE.md` — отдельно на проде

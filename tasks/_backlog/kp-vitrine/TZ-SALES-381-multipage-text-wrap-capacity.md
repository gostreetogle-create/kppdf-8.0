# TZ-SALES-381: Multipage row capacity — учёт переноса текста (BACKLOG)

> P0 smell из аудита 2026-08-19: `estimateAutoRowCapacity` не учитывает wrap описаний →
> `overflow:hidden` клипает строки на PDF/печати.

PAGES: /proposals/create
DEP: TZ-SALES-377 DONE

## Intent

При split строк учитывать длину `productName`/`description` или conservative multiplier;
либо уменьшить capacity на 1–2 строки при длинных текстах.

## Не в этой волне

380/377/deploy идут первыми. Unpark после PO smoke на prod.

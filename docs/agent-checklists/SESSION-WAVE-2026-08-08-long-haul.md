# SESSION WAVE — long-haul executor (2026-08-08)

> Параллельно peer на **TZ-CATALOG-DEDUP-301** (product-form-dialog).  
> Эта волна **НЕ** трогает `product-form-dialog*`.

## STRICT order

1. **TZ-CATALOG-DEDUP-302** — retire ModuleMaterials  
2. **TZ-CATALOG-DEDUP-303** — delete orphan CompositionEditor  
3. **TZ-UX-FORM-306** — Module QuickCreate L + BomPanel  
4. **TZ-CATALOG-DEDUP-304** — detail «Редактировать» openers (после 301 на main; если 301 ещё IN WORK — **пропусти 304**, сделай 5–6, вернись к 304)  
5. **TZ-UX-309** — page chrome supply/shipping/design/docs  
6. **TZ-UX-310** — chrome drift audit (docs)

## НЕ брать

- TZ-CATALOG-DEDUP-301 (peer)  
- TZ-SALES-304 (нужны пробы PO по КП)  
- `tasks/_park/**` production/desktop/z-series  
- deploy  

## DONE критерий

Все 1–6 (кроме skip 304 если блокер) в `_archive/2026-08/*.done.md`,  
`_active/` пуст от своих TZ, map NEXT idle/SALES. Deploy NO.

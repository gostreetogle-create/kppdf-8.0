# WAVE-KP-TABLE-CONFIG — Пресет + экземпляр таблицы + НДС/цены в Create КП

**STATUS:** READY (docs)  
**Канон:** [`docs/audits/2026-08-09-kp-table-config-canon.md`](../../../docs/audits/2026-08-09-kp-table-config-canon.md)  
**SoT:** `D:\kppdf-8.0` · Deploy: только по команде PO

## Зачем

Рыба бланка есть; для живого КП не хватает пресета колонок, правки вида **на сделку**, фоновой наценки и подвала Итого/НДС — без второго хаотичного конструктора.

## Порядок

| # | TZ | Scope | После |
|---|-----|--------|--------|
| 1 | **TZ-DOC-TABLES-307** | Category `kp` + seed «КП — позиции» + apply-preset в Документах | 305 visual желательно |
| 2 | **TZ-SALES-330** | Create: `kpTableLayout` instance + панель «Таблица» | 325 DONE; 307 желательно |
| 3 | **TZ-SALES-331** | Наценка→цена на листе; VAT %; footer Итого/НДС | после 330 |

## BAN

- Колонка «Скидка» на бланке  
- PATCH shared TableTemplate из Create  
- Per-line VAT/discount  
- Save/snapshot layout (322 зона) · print 320 · deploy без PO  

## Промпт

[`PROMPT-KP-TABLE-CONFIG-CONTINUOUS.md`](./PROMPT-KP-TABLE-CONFIG-CONTINUOUS.md)

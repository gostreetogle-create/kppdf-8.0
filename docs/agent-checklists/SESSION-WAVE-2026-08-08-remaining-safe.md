# WAVE — Remaining safe (continuation)

> Для агента, который уже ведёт long-haul **или** стартует когда long-haul DONE.  
> Не ждать «поехали» / «дай промпт».

## Фаза A — добить long-haul (если ещё не всё в archive)

1. TZ-CATALOG-DEDUP-302  
2. TZ-CATALOG-DEDUP-303  
3. TZ-UX-FORM-306  
4. TZ-CATALOG-DEDUP-304  
5. TZ-UX-309  
6. TZ-UX-310  

Пропуск: ID уже в `tasks/_archive/2026-08/*.done.md`.

## Фаза B — карточка изделия (сразу после A, без паузы)

1. TZ-UX-DETAIL-301  
2. TZ-UX-DETAIL-302  
3. TZ-UX-DETAIL-303  
4. TZ-UX-DETAIL-304  
5. TZ-UX-FACT-302  

FACT-301 · UX-312 · DEDUP-301 — уже DONE, не трогать.

## НЕ брать

SALES-304 · `tasks/_park/**` · deploy · composition-tree (UX-312 done)

## Правило

Каждая TZ: claim → code → gates → archive → **отдельный commit+push** → next.

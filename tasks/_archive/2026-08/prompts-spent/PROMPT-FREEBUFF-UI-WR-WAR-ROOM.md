# PROMPT — UI War Room: запуск 3 агентов (итог порядка)

> PO копирует **три** промта в **три** чата Freebuff (или 2+1 Claude).  
> Не один гигантский чат — keys разведены под параллель.

## Что отдать

| Чат | Файл | TZ (после merge) |
|-----|------|------------------|
| **A** | `tasks/PROMPT-FREEBUFF-UI-WR-A.md` | 500 → 501 → 503 → 509 → 510 |
| **B** | `tasks/PROMPT-FREEBUFF-UI-WR-B.md` | 505 → 506 |
| **C** | `tasks/PROMPT-FREEBUFF-UI-WR-C.md` | 508 → 504 → (wait 501+505) → 507 |

SoT: `docs/audits/2026-08-23-ui-war-room-program.md`  
Правило closeout: **Proof of adoption** в каждом `.done.md`.

## Слияния (дубликаты убраны)

| Было | Стало |
|------|--------|
| WR-501 + WR-502 | **WR-501** (return-focus + z-tokens) |
| WR-506 + WR-512 | **WR-506** (routes + passports) |
| WR-507 + WR-511 | **WR-507** (filter + skeleton/error) |
| TZ-UI-STD-* | на диске нет — не трогаем / не воскрешаем |

## Почему не 1 промт

501 и бывший 502 делили dialog/drawer/sheet → слили.  
507 и 511 делили catalog pages → слили.  
Остальное **три слота** без пересечения keys (C ждёт 501+505 только перед 507).

## После волны

Cursor: **«подготовь к деплою»**. TEST-421 — отдельный чат.

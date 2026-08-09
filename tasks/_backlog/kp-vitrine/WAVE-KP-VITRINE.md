# WAVE-KP-VITRINE — Создать КП / Все КП (слои)

**STATUS:** READY — #1–#5 DONE; next #6–7 (315→316); 320 PARKED
**SoT:** `D:\kppdf-8.0` на `main`  
**Промпт:** [`PROMPT-CONTINUOUS.md`](./PROMPT-CONTINUOUS.md)  
**Deploy:** только по команде PO

## Lock имён (UI)

| Ряд | Chip | Route (канон) |
|-----|------|----------------|
| TOC тёмный | КП · Договоры · Заказы | `/proposals…` · `/contracts` · `/orders` |
| Жёлтый (только под КП) | **Создать КП** · **Все КП** | `/proposals/create` · `/proposals` |
| Код/API | Quotation / proposals | не переименовывать коллекцию |

Сущности: клиент = **Counterparty**; наша фирма/бланк = **Organization**.

## Порядок (после чего)

| # | TZ | После |
|---|-----|--------|
| 1 | **TZ-SALES-310** IA chrome | **DONE** |
| 2 | **TZ-SALES-311** design-spec Создать КП | **DONE** |
| 3 | **TZ-SALES-312** shell Создать КП | **DONE** |
| 4 | **TZ-SALES-313** Все КП + семья (ex-304) | 310 DONE |
| 5 | **TZ-SALES-314** левый рейл товаров | 312 DONE |
| 6 | **TZ-SALES-315** правая панель org/% | 312 DONE |
| 7 | **TZ-SALES-316** шаблон в центре | 314+315 желательно; min 312 |
| 8 | **TZ-SALES-320** печать пачкой | **PARK** до PO: «витрина собирает» |

Параллель после 312: **313** (журнал) и **314/315** (создание) — CONFLICT KEYS разные страницы; не трогать чужие keys.

## BAN

- Печать в 310–316  
- Schema rewrite семьи / convert variant  
- ModuleMaterials / второй write-path  
- deploy без PO  
- Воскрешать тонкий «только диалог = создать КП» как основной путь  

## SUPERSEDED

`tasks/_backlog/TZ-SALES-304-kp-family-ui.md` → содержание семьи в **313**.

## DoD волны (до печати)

Создать КП = 3-колоночный каркас + товары + правая панель + шаблон; Все КП = список с expand семьи; сумма attach = подсказка.

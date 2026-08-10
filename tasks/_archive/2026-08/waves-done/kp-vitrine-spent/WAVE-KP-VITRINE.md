# WAVE-KP-VITRINE — Создать КП / Все КП (слои)

**STATUS:** DONE fill #1–#7 (310–316); **317/319/321 DONE**; wave-2 READY **323→324→325** (канон сверен); **318** cascade; **320/322 PARKED**  
**SoT:** `D:\kppdf-8.0` на `main`  
**Spec v2:** [`docs/ux/kp-create-studio-spec.md`](../../../docs/ux/kp-create-studio-spec.md)  
**Аудит wave-2:** [`docs/audits/2026-08-09-kp-create-preview-wave2.md`](../../../docs/audits/2026-08-09-kp-create-preview-wave2.md)  
**Промпт wave-2 (все TZ):** [`PROMPT-WAVE2-CONTINUOUS.md`](./PROMPT-WAVE2-CONTINUOUS.md)  
**Промпт витрины товаров:** [`PROMPT-SALES-VITRINE.md`](./PROMPT-SALES-VITRINE.md) · аудит: [`2026-08-09-kp-create-product-vitrine.md`](../../../docs/audits/2026-08-09-kp-create-product-vitrine.md)  
**Остаток очереди (без лишних стопов):** [`PROMPT-CONTINUOUS-KP-REMAINING.md`](./PROMPT-CONTINUOUS-KP-REMAINING.md)  
**По одной:** [`PROMPT-SALES-323.md`](./PROMPT-SALES-323.md) · [`324`](./PROMPT-SALES-324.md) · [`325`](./PROMPT-SALES-325.md)  
**Legacy continuous (310–316):** [`PROMPT-CONTINUOUS.md`](./PROMPT-CONTINUOUS.md)  
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
| 8 | **TZ-SALES-317** focus shell (A4 + icon rails + cascade stub) | **DONE** |
| 9 | **TZ-SALES-319** center = `build()` HTML | **DONE**; visual accepted with 321 fidelity integration |
| 9b | **TZ-SALES-321** preview fidelity (layout/bg/scale) | **DONE**; Cursor/PO PASS |
| 9c | **TZ-SALES-322** stale template → «Обновить бланк» в Параметрах | **PARK** до snapshot Save + 321 |
| 9d | **TZ-SALES-323** A4 fit без scrollbar | READY — [`TZ-SALES-323…`](./TZ-SALES-323-create-kp-a4-fit-no-scroll.md) |
| 9e | **TZ-SALES-324** empty table skeleton blank | READY after/|| 323 — [`TZ-SALES-324…`](./TZ-SALES-324-empty-table-skeleton-blank.md) |
| 9f | **TZ-SALES-325** draftLines → **target** line-items table (не все live) | READY after 323+324 — [`TZ-SALES-325…`](./TZ-SALES-325-draftlines-table-bind.md) |
| 10 | **TZ-SALES-318** cascade | **SUPERSEDED** → **328** (фильтр категорий в shop-витрине) |
| 10a | **TZ-SALES-326** шире flyout + dismiss | READY after 323 — [`TZ-SALES-326…`](./TZ-SALES-326-products-flyout-wide-dismiss.md) |
| 10b | **TZ-SALES-327** md card equal-height | READY ∥ — [`TZ-SALES-327…`](./TZ-SALES-327-showcase-card-md-equal-height.md) |
| 10c | **TZ-SALES-328** shop-витрина Add/Edit/Create | READY after 326+327 — [`TZ-SALES-328…`](./TZ-SALES-328-create-kp-shop-vitrine.md) |
| 10d | **TZ-SALES-329** default land = Создать КП | READY — [`TZ-SALES-329…`](./TZ-SALES-329-default-land-create-kp.md) |
| 11 | **TZ-SALES-320** печать пачкой | **PARK** до PO: «витрина собирает» |
| — | **NOTE** snapshot/lock + «оплачена» | [`NOTE-KP-template-snapshot-lock.md`](./NOTE-KP-template-snapshot-lock.md) |

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

Создать КП = focus shell (A4 центр + icon-rails) + товары + параметры + **шаблон через `build` HTML (319)**; Все КП = список с expand семьи; сумма attach = подсказка.  
v1 always-on 3 columns (311/312 desktop) → **superseded** spec v2 / **317**.  
Center stub (316/317) → **superseded** **319**.

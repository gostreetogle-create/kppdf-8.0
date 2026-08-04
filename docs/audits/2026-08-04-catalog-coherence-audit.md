# Catalog coherence audit — accepted findings (2026-08-04)

> Источник: GPT peer audit (`TZ-CATALOG-306-catalog-coherence-audit-gpt`).  
> **Код из аудита не писать.** Канон состава: [`tasks/TZ-CATALOG-300.md`](../tasks/TZ-CATALOG-300.md).  
> Wave 1 backend: **302→305**. Wave 2 UI/where-used: скелеты в `tasks/_backlog/catalog/`.

## Статус относительно Wave 1

| Пункт аудита | Наше решение |
|--------------|--------------|
| Закрыть 301 + Mongo e2e | **Уже PASS** (architect + e2e 6/6); архив `TZ-CATALOG-301.done.md` |
| Legacy vs composition | Подтверждает **302→305** строго по порядку; UI-деревья поверх legacy — **запрет** |
| Hard-delete / история | AC усилены в 304; successor **314** (archive/auth) |
| Material detail / where-used / photo unify | **Wave 2** (310–315), **после** стабильного composition read API |
| Excel / BOM write / Gantt | Out of scope (как в 300) |

## P0 (Wave 1 only)

1. Рассинхрон `productModuleIds[]` / `materials[]` vs будущий `composition[]` → **302–304**.
2. Миграция без dual-write forever; dry-run + idempotent → **304**.
3. Cycle/depth на смешанном пути + legacy bypass → **303**.
4. Product→Product → **305**.

## P1 → Wave 2 child-TZ (парк)

| ID | Тема | После |
|----|------|-------|
| **310** | Where-used / backlinks API (read-only, paginated, org-scoped) | 305 |
| **311** | Unified CompositionTree / CompositionEditor UI | 302+ read API (+ лучше после 304) |
| **312** | Material detail `/materials/:id` + shell как product/module | 310 (нужен where-used) |
| **313** | Photo/document/attachment unify (Module photoIds; attachments) | 305 |
| **314** | Archive/soft-delete/auth consistency (Module hard-delete audit) | 304 |
| **315** | List/dialog polish, pagination parity Modules/WorkTypes, a11y | 311+ |

## Explicit out of scope (этот аудит)

Web Excel, desktop import, BOM write, Orders/Production/Gantt, kit rewrite ради косметики.

## Verdict (Cursor)

Аудит **принят** как backlog-карта. Не блокирует старт **TZ-CATALOG-302**.  
Не плодить второй «master» — 300 остаётся SoT; 306 = audit trail only.

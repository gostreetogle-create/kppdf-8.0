# WAVE Doc Studio S7 — доводка студии после PO-сессии 2026-08-30

> **Оркестратор:** Cursor (Mode A)  
> **Исполнители:** Freebuff ×2 + Claude terminal (по `PO-CANON` п.6–8)  
> **STATUS:** **COMPLETE** (2026-08-30) — S7-0…S7-6 archived.
>
> **Правило:** одна active TZ на `kppdf-web`; `nx build kppdf-web` green между волнами.

## Контекст

PO-сессия в Cursor накопила **uncommitted WIP** в `frontend-nx/.../studio/**` (слои, свойства текста/таблиц, геометрия листа). S6 формально DONE в QUEUE, но часть требований PO **переопределена** (все видимые слои, не изоляция одного).

## Очередь (строго по порядку)

| # | TZ | Зона | Параллель |
|---|-----|------|-----------|
| **S7-0** | `TZ-NX-DOCSTUDIO-S7-WIP-CLOSEOUT` | studio WIP + gates + doc sync | **ACTIVE** |
| S7-1 | `TZ-NX-DOCSTUDIO-S7-RAILS-DATA` | rail «Данные» (КП/заказ, org) | после S7-0 |
| S7-2 | `TZ-NX-DOCSTUDIO-S7-RAILS-TEMPLATE` | rail «Шаблон» + save-as-template UX | после S7-1 |
| S7-3 | `TZ-NX-DOCSTUDIO-S7-TEXT-LEGACY-PARITY` | колонки, шрифт, поля ERP из legacy | после S7-2 |
| S7-4 | `TZ-NX-DOCSTUDIO-S7-TABLE-POLISH` | колонки таблицы, категории видов | после S7-3 |
| S7-5 | `TZ-NX-DOCSTUDIO-S7-RIBBON-EXPORT` | PDF + «В архив» smoke + preview | после S7-4 |
| S7-6 | `TZ-NX-DOCSTUDIO-S7-PASSPORT-BG` | фон/тайлинг для паспорта изделия | после S7-5 |

## Промпты Freebuff

- `tasks/PROMPT-FREEBUFF-DOCSTUDIO-S7-WIP.md`
- (следующие — после archive предыдущей TZ)

## PO review

После каждой TZ — PO смотрит `/studio/:id` в браузере; правки → новая микро-TZ, не правки в чате Cursor.

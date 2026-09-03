# WAVE Doc Studio S8 — подстановка данных и закрытие дыр S7

> **Статус:** READY (2026-08-30, post-audit)  
> **Предусловие:** S7 committed `a7b54868`; `nx build kppdf-web` green  
> **SoT оператора:** `docs/pages/document-studio.page.md` §2–§7

## Цель волны

Оператор выбирает **Клиент / КП / заказ** → видит **реальные данные** в Просмотре и PDF (текстовые токены и строки таблицы). Список документов умеет создавать из шаблона.

## Очередь (строго по порядку)

| # | TZ | Зависимость | Даёт оператору |
|---|-----|-------------|----------------|
| **S8-1** | `TZ-NX-DOCSTUDIO-S8-TEXT-SUBSTITUTION` | — | `{{counterparty.name}}` и др. в Preview/PDF |
| **S8-2** | `TZ-NX-DOCSTUDIO-S8-TABLE-ERP-BIND` | S8-1 желателен (общий context) | Таблица тянет строки из выбранного КП/заказа |
| **S8-3** | `TZ-NX-DOCSTUDIO-S8-LIST-TEMPLATES` | — | «Из шаблона», «Дублировать» на `/studio` |
| **S8-4** | `TZ-NX-DOCSTUDIO-S8-PAGES-PANEL` | — | Фон страницы, поля, правило переноса строк (S5 legacy parity) |
| **—** | `TZ-AUTH-RBAC-ROLE-PERMS` | параллель backend | Guard читает permissions роли |

**PARK (не S8):** catalog-products dataSet (D3) → **перенесено в S9-B**; Ctrl+Z, Fit/zoom toolbar, nested ValidationPipe i18n.

**Successor S9 (design):** `tasks/_backlog/doc-studio/WAVE-DOCSTUDIO-S9-DATA-CONTEXT.md` — якоря, витрина, сводка выбранного.

## Правила

- Одна active TZ на `kppdf-web/src/**`; build green между шагами.
- PO проверяет **Просмотр** после S8-1 и **таблицу+КП** после S8-2.

## Промпты

- `tasks/PROMPT-FREEBUFF-DOCSTUDIO-S8-TEXT-SUBSTITUTION.md` (создать при старте S8-1)

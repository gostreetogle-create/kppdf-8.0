# Dictionaries UX/IA audit — справочники

**Date:** 2026-08-04  
**Mode:** Audit + remediation plan (docs only; no product code)  
**Canon follow-up:** `tasks/TZ-DICT-300.md` · wave `tasks/DICT-WAVE1.md`  
**PO smell (dictation):** верхняя половина экрана — «тупые тексты»; нет люксовой sticky-панели поиск/фильтр/сорт; таблицы/CRUD/drag не единообразны; меню справочников плоское без групп.

## Inventory (факт кода)

| Route | Page | Header pattern | Toolbar | Table/Tree | Reorder |
|-------|------|----------------|---------|------------|---------|
| `/dictionaries` | Units (не hub!) | eyebrow + title + long description | inline add form | pi-table | client sort only |
| `/categories` | Categories tree | eyebrow + title + description про drag | search + create | CDK tree | root + children API |
| `/doc-template-categories` | Doc template cats | типичный page-header | toolbar | pi-table | ? |
| `/dictionaries/text-block-categories` | Text block cats | типичный page-header | toolbar | pi-table | ? |
| `/dictionaries/color-references` | RAL colors | eyebrow + title + description | toolbar | pi-table | — |

Nav (`app-layout` · category `reference`): плоский список — «Все справочники», Категории, Категории шаблонов, Категории текстов, Цвета. **Без групп.**

## P0 smells

1. **Chrome bloat:** `eyebrow="раздел · справочники"` + H1 + paragraph + `pi-section` title/hint/eyebrow («Каталог», «Классификация…», «Перетаскивайте…») съедают ~40–50% first viewport.
2. **`/dictionaries` = Units**, не индекс. «Все справочники» врёт ожиданиям.
3. **Нет единого Dictionary List Shell:** sticky toolbar (search / filter / sort / primary CTA) прилипший к таблице отсутствует как канон.
4. **Несогласованность:** Units — inline form; Colors/Doc cats — dialog; Categories — tree+drag. Нормально по модели, плохо по chrome.
5. **Дублирующие подсказки:** description header + section hint + toolbar hint про одно и то же (drag/order).

## P1

6. Routes разбросаны (`/categories` vs `/dictionaries/...`) — IA и bookmarks.
7. Нет меню-групп (Классификация / Документы / Оформление / Измерения).
8. Фильтры: Categories type badges есть, но нет единого compact filter pattern; Units category filter слабый.
9. a11y/drag: Categories имеет handle — эталон; другие flat-lists без reorder где API есть — проверить в child TZ.

## P2

10. Page docs устарели относительно желаемого chrome.
11. Showcase / DSL revival (Z-002) — не блокер этой волны; Dictionary Shell = конкретный FE primitive, не полный DSL.

## Recommended IA (меню «Справочники»)

```
Справочники
├── Обзор                 → /dictionaries          (hub cards)
├── Классификация
│   └── Категории         → /categories            (tree; later alias /dictionaries/categories)
├── Измерения
│   └── Единицы           → /dictionaries/units
├── Оформление
│   └── Цвета (RAL)       → /dictionaries/color-references
└── Документы
    ├── Категории шаблонов → /doc-template-categories
    └── Категории текстов   → /dictionaries/text-block-categories
```

Redirect: старый `/dictionaries` content (units) → `/dictionaries/units`; `/dictionaries` = hub.

## Visual canon (target)

- **Page header:** только короткий title (без eyebrow «раздел · …», без multi-line description). Optional one-line muted count.
- **Sticky chrome:** одна полоса над таблицей/деревом: search | filters | sort | primary CTA | densified count. Hairline, Paper & Ink, `pi-focus-ring`.
- **No** `pi-section` eyebrow/title/hint дублирующих header.
- Empty state: одна фраза + CTA (PO-DIARY).
- Table/tree occupies first viewport below sticky chrome.

## Out of scope this wave

- Backend schema changes / new dictionary entities.
- Catalog Wave 1 (304/305) conflict keys.
- Full DSL revival (Z-002).
- Renaming Category entity types.

## Child TZ map

See `tasks/DICT-WAVE1.md` · master `tasks/TZ-DICT-300.md`.

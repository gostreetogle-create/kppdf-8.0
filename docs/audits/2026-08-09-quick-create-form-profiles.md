# Audit: Quick-create form profiles (S/M/L)

**Date:** 2026-08-08 (session) / file stamp 2026-08-09  
**TZ:** TZ-DICT-313  
**Status:** DONE (docs) · successors DICT-314…316  
**Product code:** not touched

## 1. Glossary

| Term | Meaning |
|------|---------|
| **Entity** | Whitelist target: `product` \| `module` (P0); later `material` |
| **FieldKey** | Stable allowlist id mapped to control + RU label + validators (code registry) |
| **Size** | `S` \| `M` \| `L` — field set + dialog width |
| **Profile** | Org-scoped matrix: which FieldKeys visible for `(entity, size)` |
| **LockedRequired** | Field always on; checkbox disabled (union of BE DTO required + FE business) |
| **FullEditor** | Existing heavy create/edit dialogs (product-form / module-form) |
| **QuickCreate** | Shared dialog driven by Profile — **create only** P0 |

Это **не** генератор таблиц БД и **не** EAV «любые поля из воздуха».

## 2. Why Dictionaries (not Catalog Appearance)

| Surface | Owns |
|---------|------|
| **Справочники** `/dictionaries/form-profiles` | Operator-tunable **form UX** (какие поля в быстром create) |
| **Каталог → Оформление** (`catalog-appearance`) | Visual kind colors for catalog tables/tree — stays where it is |

**IA phrase:** Справочники = «как заполняем / что показываем в формах»; Каталог/Оформление = «как красим kind в списках». Не смешивать в одну помойку настроек.

## 3. Decision table (chosen)

| # | Choice | Rationale |
|---|--------|-----------|
| **D1** | **(a)** `/dictionaries/form-profiles` | PO lean «настройки в справочниках» |
| **D2** | **(a)** per Organization | ~10 users, one workshop org settings |
| **D3** | **(b)** product + module | Matches BOM/list entry points; material → later |
| **D4** | **(b)** fields + `pi-dialog` width | S=sm, M=md, L=lg |
| **D5** | Locked required always on | Prevent silent 400 / broken create |
| **D6** | Create only; edit → FullEditor | Keeps QuickCreate thin |
| **D7** | Code allowlist FieldKey → control | No inventing fields via checkboxes |
| **D8** | Seed S/M/L for product + module | See §4 |

## 4. FieldKey allowlist P0

### Product (`product-form-dialog` evidence)

| FieldKey | RU | Locked | S | M | L |
|----------|-----|--------|---|---|---|
| `name` | Название | ✓ | ✓ | ✓ | ✓ |
| `kind` | Вид | ✓ | ✓ | ✓ | ✓ |
| `unit` | Ед. | ✓ | ✓ | ✓ | ✓ |
| `sku` | Артикул | | | ✓ | ✓ |
| `listPrice` | Прайс | | | ✓ | ✓ |
| `categoryId` | Категория | | | ✓ | ✓ |
| `isActive` | Активен | | | ✓ | ✓ |
| `status` | Статус | | | | ✓ |
| `dimLength` / `dimWidth` / `dimHeight` / `dimUnit` | Габариты | | | | ✓ |
| `weightKg` | Вес | | | | ✓ |
| `description` | Описание | | | | ✓ |
| `notes` | Заметки | | | | ✓ |

Out of QuickCreate P0: modules attach, photos, cost recalculate, RAL (edit in FullEditor).

### Module (`module-form-dialog` evidence)

| FieldKey | RU | Locked | S | M | L |
|----------|-----|--------|---|---|---|
| `name` | Название | ✓ | ✓ | ✓ | ✓ |
| `article` | Артикул | | ✓ | ✓ | ✓ |
| `width` / `height` / `depth` / `unit` | Габариты | | | ✓ | ✓ |
| `weight` | Вес | | | ✓ | ✓ |
| `notes` | Заметки | | | | ✓ |

Out of QuickCreate P0: `workTypes[]` (FullEditor / module detail).

## 5. Wire map (consumers → 316)

| Entry | Today | After 316 |
|-------|-------|-----------|
| `/products` «Добавить» | Full product-form | QuickCreate `product`+size (default M) |
| `/modules` «Добавить» | Full module-form | QuickCreate `module`+size |
| BOM / picker «новый …» | n/a or full | optional second wire if slots remain |
| Edit row / detail | FullEditor | **unchanged** |

## 6. Storage sketch (for 314)

```text
FormProfile {
  organizationId,
  entity: 'product'|'module',
  size: 'S'|'M'|'L',
  visibleFieldKeys: string[],  // must include all LockedRequired
  unique: (organizationId, entity, size)
}
```

API: GET list / GET one / PUT replace matrix; seed on org bootstrap.

## 7. Threats / НЕ

- Uncheck required → forbidden
- Three copy-paste form components → forbidden (one renderer)
- Mix with composition-tree / cost override / catalog-appearance colors
- Arbitrary EAV fields from UI checkboxes

## 8. Successors

| ID | Scope |
|----|-------|
| **TZ-DICT-314** | BE schema + API + seed |
| **TZ-DICT-315** | FE settings page (entity select + checkbox matrix × S/M/L) |
| **TZ-DICT-316** | QuickCreate dialog + wire products/modules list |

---

_Closed with TZ-DICT-313. Impl only after map slot / PO._

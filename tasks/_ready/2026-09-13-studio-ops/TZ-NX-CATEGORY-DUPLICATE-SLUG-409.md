# TZ-NX-CATEGORY-DUPLICATE-SLUG-409: дубль slug категории → 409, не сырой 500

> **SIZE:** XS · **PACK:** successor studio-ops WAVE3  
> **РОЛЬ:** Freebuff / Claude  
> **LAYER:** 3  
> **ИСТОЧНИК:** evidence `docs/agent-checklists/evidence/TZ-NX-CATALOG-CATEGORY-INLINE-CREATE.txt` (после 3.2)

**CONFLICT KEYS:**  
`backend/src/modules/category/category.service.ts; backend/src/modules/category/category.service.spec.ts`

**PAGES:** `/registries` Категории; inline «+» из catalog forms  
**PAGE_DOCS:** `docs/pages/registries.page.md`

---

## Domain preflight

- **Проверено:** unique index `{ type, slug }`. `create()` на коллизии slug (часто после truncate translit ~16 символов у похожих имён) → Mongo E11000 → сырой **500**, не `ConflictException` 409 (эталон: ProductService и др.).
- **Necessity:** да — inline «+» после WAVE3.2; оператор видит Internal server error вместо «такая категория уже есть».

## ЧТО ДЕЛАТЬ

1. В `create` (и `update` slug, если есть): поймать duplicate key → `ConflictException` с понятным RU/EN сообщением (slug/type занят).  
2. Spec: mock/integration duplicate → status 409, не 500.  
3. Опционально (если дёшево): при авто-slug из имени — суффикс `-2`/`-3` до успешного create; иначе достаточно честного 409 + FE toast уже показывает ошибку.

## НЕ

Менять правила slug DTO; wipe; FE slug UI redesign.

## ACCEPT

1. Повторный create с тем же type+slug → **409**, тело/сообщение читаемое.  
2. Spec зелёный.  
3. Живой curl/Playwright: нет 500 на дубле.

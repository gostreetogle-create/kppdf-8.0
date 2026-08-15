# TZ-UX-322 (PARK): page-tools → универсальная chrome-панель

> Park / successor после TZ-UX-321. **Не брать**, пока 321 не LANDED + PO visual PASS.

## Intent

Страницы могут отдавать в левый `app-chrome-rail-left` глобальные кнопки
(пример PO: фильтр на `/modules`), не дублируя их хаотично в контенте.

## Scope sketch

- Shell slot / projection API (один write-path в rail).
- Первая миграция-кандидат: filter control каталожных списков.
- Не переносить жёлтое меню разделов; не делать второй sidebar IA.

## Depends

- TZ-UX-321 DONE (rail exists, ←→ inside).

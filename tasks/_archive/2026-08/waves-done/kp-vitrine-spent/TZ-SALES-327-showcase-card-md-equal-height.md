# TZ-SALES-327: PiShowcaseCard md — равная высота + фото (эталон витрины)

PAGES: /kit (если есть card demo) ; /products  
PAGE_DOCS: products.page.md  
Аудит: `docs/audits/2026-08-09-kp-create-product-vitrine.md`  
Зависит от: нет блокирующих; **можно ∥ wave-2** (keys ≠ proposal-create)

РОЛЬ АГЕНТА: frontend (UI kit)  
ЗАВИСИМОСТИ: TZ-PRODUCTS-305 DONE (`PiShowcaseCard` sm/md/lg уже на main)  
LAYER: 2  
CONFLICT KEYS: frontend/src/app/shared/ui/card/pi-showcase-card.component.ts; frontend/src/app/shared/ui/card/pi-showcase-card.component.spec.ts; docs/pages/products.page.md; docs/audits/2026-08-09-kp-create-product-vitrine.md

Проверено: `pi-showcase-card.component.ts` — sm/md/lg; md = title + media 16:9 + desc + actions; каталог `/products` уже умеет `mainPhotoUrl` + `photoListUrl`; Create KP rail ещё не использует card. Не invent второй card-system.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

1. PO хочет 3 эталона карточек — **они уже есть** (sm/md/lg). Нужно довести **md** до shop-тайла: большие фото, равная высота в сетке, длинные названия не ломают ряд.
2. Без равной высоты сетка «прыгает» — антипаттерн витрины.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **Equal-height md recipe (в компоненте + CSS)**
   - Media: фиксированный `aspect-ratio` (уже 16:9 — зафиксировать `object-fit: cover`, без роста от картинки).
   - Title/description: **line-clamp** (title 2 строки, desc 2) — высота текста предсказуема.
   - Host md: `height: 100%` + flex column, чтобы в CSS grid `align-items: stretch` все плитки одного ряда были одной высоты.
   - Actions slot внизу (margin-top: auto) — кнопки на одной линии у низа карточки.

2. **Фото**
   - Документировать: `mediaUrl` = thumb/list URL (`photoListUrl`); пустой media → нейтральный placeholder (бумага/rule), **не** ломать layout.
   - Не писать новый photo pipeline — reuse `photos.service` helpers.

3. **Канон размеров (docs only + JSDoc)**
   - sm = компактная строка/иконка-ряд (каталог list-ish / BOM thumbs).
   - **md = витрина КП / сетки** (эталон для SALES-328).
   - lg = detail/журнальный.
   - Строка в `products.page.md` + audit: «не плодить вторую карточку».

4. **Tests**
   - Jest: md host stretch / line-clamp classes present; media cover; empty media placeholder.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- proposal-product-rail / create page → **328 / 326**
- Backend photos API
- sm/lg контракты ломать без нужды
- deploy

known_limitation: подключение в Create KP — 328; полная миграция всех страниц на md — out of scope.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Две md-карточки в grid с разной длиной title — **одинаковая высота** ряда; медиа одной пропорции.
2. Длинный title обрезается clamp’ом, не раздувает карточку.
3. Gates:
   ```
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   cd frontend && pnpm test -- --testPathPattern=pi-showcase-card
   ```
4. Docs обновлены; archive после PASS (visual optional Cursor).

Финализация: `tasks/_archive/2026-08/TZ-SALES-327.done.md`.

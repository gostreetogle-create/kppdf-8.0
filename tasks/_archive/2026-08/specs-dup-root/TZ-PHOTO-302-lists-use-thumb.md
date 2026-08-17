# TZ-PHOTO-302: Списки и сетки показывают превью, не оригинал

```
PAGES: /products ; /products/:id ; /materials ; /materials/:id ; /modules ; /modules/:id
PAGE_DOCS: products.page.md ; materials.page.md
DEPENDS ON: TZ-PHOTO-301 DONE
```

РОЛЬ АГЕНТА: Frontend UI Engineer  
ЗАВИСИМОСТИ: TZ-PHOTO-301  
LAYER: 3  
CONFLICT KEYS: frontend/src/app/shared/services/photos.service.ts; frontend/src/app/pages/products/products.page.ts; frontend/src/app/pages/materials/materials.page.ts; frontend/src/app/pages/modules/modules.page.ts; frontend/src/app/shared/ui/card/pi-showcase-card.component.ts

Проверено: `products.page.ts` `mainPhotoUrl` → `photo.storageUrl` (часто original); schema умеет variant, но FE не выбирает thumb.

---

## Простыми словами

После 301 у каждого нового фото есть лёгкая копия. Этот TZ: **везде, где фото в списке/сетке**, показывать лёгкую. На экране «открыли карточку / смотрим крупно» — можно оригинал или medium. Внешний вид карточек тот же.

---

## ЧТО ДЕЛАТЬ

### ШАГ 1 — один helper (обязательно общий)

В photos service / shared util, например:

`photoListUrl(photo): string` — предпочитает `variant==='thumb'` (или linked thumb), иначе fallback на `storageUrl`.

Не копипастить логику в каждую страницу.

### ШАГ 2 — все list/grid поверхности (чеклист — все галочки)

Отметить в Executor report каждую строку:

- [ ] `/products` таблица (ячейка фото) — сейчас `mp.storageUrl`
- [ ] `/products` grid / showcase — `mainPhotoUrl` / `mediaUrl`
- [ ] `/materials` список — `mp.storageUrl`
- [ ] production cockpit / facade thumb helper (`production-read.facade.ts`)
- [ ] grep `storageUrl` по `pages/` — каждый list/grid каталога, не только products

Карточка detail / lightbox / form-dialog: **можно** оставить original — перечислить в report что оставлено сознательно.

### ШАГ 3 — если API списка отдаёт только id без variant

Либо populate уже отдаёт Photo с variant; либо после 301 upload FE сохраняет thumb id; либо list helper резолвит. Не оставлять «на половине страниц».

### ШАГ 4 — gates

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- --include=**/products.page.spec.ts --include=**/materials.page*.spec.ts
```

---

## НЕ ИЗМЕНЯТЬ

- Дизайн карточек (размеры layout), кроме src URL
- Backend upload (301)
- PAGE_SIZE (уже 10)

## КРИТЕРИИ ПРИЁМКИ

1. Grep list/grid: нет прямого `storageUrl` для витрины без helper (или helper внутри всегда предпочитает thumb).
2. Network на `/products` grid: запросы картинок — thumb-файлы, не полноразмерные original (для свежих фото после 301).
3. Чеклист страниц в Executor report — **все** пункты, не «только products».
4. tsc + specs PASS; archive.

## One-liner

```text
GEMINI.md + tasks/_backlog/perf/TZ-PHOTO-302-lists-use-thumb.md (после 301). CLAIM. Общий photoListUrl; все list/grid каталога на thumb; чеклист в report; gates; archive.
```

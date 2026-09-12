# TZ-NX-PO-SWEEP-04: studio Данные — thumb в строках + список до низа панели

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** WAVE #04  
**LAYER:** 3 · **SIZE:** M  
**PAGES:** `/studio` панель «Данные» / витрина  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`  

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-vitrina.component.ts` (+ specs) ;  
`frontend-nx/libs/ui/paper-and-ink/src/lib/card/pi-showcase-card.component.ts` (+ specs) — только если нужен always-on thumb slot / taller sm ;  
parent panel layout где встраивается vitrina (studio-editor / data section) — flex height ;  
при необходимости FE resolve photo URL (если list отдаёт bare id)

IMPLICIT CONFLICT: nx build kppdf-web

### Preflight Check Output
- **Context read:** `studio-data-vitrina` — `mediaUrl` уже прокидывается, но `size="sm"` рендерит медиа только `@if (mediaUrl())`; grid `max-height: 480px` → белая дыра под списком на скрине PO; PO-CANON: витрина как магазин, компактные карточки с фото
- **Key Constraints:** все 4 вкладки (Изделия/Модули/Детали/Материалы); placeholder если нет файла; не раздувать в плитки md
- **Planned Deliverable:** thumb слева всегда; чуть выше строка; список flex до низа панели
- **Validation Path:** specs vitrina + showcase sm; nx build

**Проверено:** PO скрин — нет превью, список обрывается ~середине панели.

---

## РЕШЕНИЕ (PO)

1. В начале каждой строки — **маленькое фото**, затем название / артикул / кнопки. Обязательно на всех четырёх вкладках.
2. Высоту строки чуть увеличить, чтобы thumb был читаем (~48–56px, не огромные плитки).
3. Рамку/скролл списка **дотянуть до низа** доступной высоты панели «Данные» (убрать искусственный потолок `max-height: 480px` + flex `min-height: 0` / `flex: 1`), чтобы помещалось больше карточек.

## ЧТО ДЕЛАТЬ

### Thumb
1. `app-pi-showcase-card` size=`sm`: всегда слот медиа слева (если нет `mediaUrl` — нейтральный placeholder «нет фото» / empty media class, как md empty). Не скрывать блок целиком.
2. Чуть увеличить `.sc-media--sm` (сейчас 40×40 по комментарию S41 → ~48–56).
3. Vitrina: убедиться, что `photoUrl` реально даёт URL для products/modules/parts/materials. Если list API отдаёт `photoIds: ObjectId[]` без populate — resolve через существующий photos helper/service (reuse WAVE-NX-CATALOG-PHOTOS path), **без** orphan disk cleanup. Broken URL → placeholder (img onerror → empty).

### Высота списка
4. `.vitrina` / `:host` / parent data panel: колонный flex; `.vitrina-grid { flex: 1; min-height: 0; max-height: none; overflow-y: auto }` так, чтобы низ списка = низ доступной панели (до footer/кромок flyout).
5. Не ломать геометрию A4 / `--kp-panel-w`.

### Specs
6. Все 4 kind: карточка имеет media slot (url или placeholder).  
7. Grid не ограничен 480px в unit/DOM assert по class/style.  
8. Add/Remove spam-safe поведение S41 сохранить.

## НЕ ИЗМЕНЯТЬ

Wipe/orphan photo DB cleanup; A4 geometry; правый chrome table props (#02/#03); product form save (#01).

## КРИТЕРИИ ПРИЁМКИ

1. PO: на Изделия/Модули/Детали/Материалы слева thumb (или placeholder), текст справа.  
2. Список визуально заполняет высоту панели вниз; скролл внутри рамки.  
3. Specs + `nx build kppdf-web` green.

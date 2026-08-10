═══════════════════════════════════════════════════════════════
TZ-PRODUCTS-309: Состав изделия внутри FullEditor (reuse BomPanel)
═══════════════════════════════════════════════════════════════

STATUS: READY · WAVE-PRODUCT-EDITOR #2
DEPENDS ON: TZ-PRODUCTS-308 DONE
LAYER: 3
PAGES: /products ; /products/:id
PAGE_DOCS: products.page.md
CHECKLIST: docs/agent-checklists/TZ-PRODUCTS-309.md

РОЛЬ: Frontend

CONFLICT KEYS:
frontend/src/app/pages/products/product-form-dialog.component.ts;
frontend/src/app/pages/products/product-form-dialog.component.spec.ts;
frontend/src/app/pages/products/product-bom-panel.component.ts;
docs/pages/products.page.md;
docs/agent-checklists/TZ-PRODUCTS-309.md;

Проверено: DEDUP-301 убрал состав из FullEditor (hint only); SoT write-path =
`ProductBomPanel` + composition API; карточка `/products/:id` уже хостит панель.
PO 2026-08-08: хочет править паспорт **и** состав в одном окне — supersede
«только hint» из DEDUP-301 **без** второго write-path.

---

## ИСХОДНОЕ

1. После 308 диалог плотный, без блока состава.
2. `ProductBomPanel` требует `productId` — на **create** id ещё нет.

---

## ЧТО ДЕЛАТЬ

1. **Edit mode** (`data._id` есть): внизу FullEditor (ниже фото/описания)
   встроить `<app-product-bom-panel [productId]="data._id" />` (или тонкая
   обёртка). Один write-path — **тот же** BomPanel, что на карточке.
2. **Create mode:** короткая русская подсказка без жаргона:
   «Сначала сохраните изделие — затем откройте редактирование, чтобы собрать состав.»
   Не «профиль L».
3. Высота: панель состава в диалоге — разумный max-height + внутренний scroll
   дерева (не раздувать диалог на весь экран бесконечно); sticky footer Save
   остаётся.
4. Если BomPanel открывает nested FullEditor изделия — не зациклить
   (уже есть guard’ы; проверить вручную один сценарий).
5. `(changed)` с панели → не ломать submit паспорта; опционально emit наружу
   для reload списка — достаточно toast’ов панели.
6. Тесты: edit mode рендерит `data-test="product-bom-panel"`; create — нет панели,
   есть hint.
7. Обновить page doc: FullEditor edit = паспорт + состав.

---

## НЕ

- Не копипастить второй UI состава / ModuleMaterials.
- Не менять composition API / backend.
- Не требовать состав на create в одном submit (нет id).
- Не deploy.

---

## AC

1. Edit FullEditor: виден и кликабелен тот же BOM (добавить линию / дерево).
2. Create: нет BomPanel; понятный RU hint без «L»/«карточка или профиль».
3. Write-path линий = существующие composition endpoints (сеть = как на detail).
4. FE tsc + focused jest form (+ bom panel smoke если затронут).
5. Archive + push + Checkpoint idle / deploy propose only.

ARCHIVE: `tasks/_archive/2026-08/TZ-PRODUCTS-309.done.md`

KNOWN: DEDUP-301 «состав только на карточке» **снят для FullEditor edit** по
решению PO; карточка detail по-прежнему показывает состав (два входа, один код).

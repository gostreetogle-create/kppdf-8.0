# TZ-SUPPLY-309 checklist — материал: цвета, фото, edit/copy, контакт, сетка

> Status: **READY FOR REVIEW** (PO visual accept pending)
> Предшественник: TZ-SUPPLY-308 (`docs/agent-checklists/TZ-SUPPLY-308.md`)
> Canon §13: `docs/audits/2026-08-19-supply-quick-order-design-canon.md`

## Claim slot

- agent_id: freebuff desktop agent
- claimed_at: 2026-08-19
- conflict keys:
  `frontend/src/app/pages/supply/supply-quick-order.component.ts`,
  `frontend/src/app/pages/supply/supply-quick-order.component.spec.ts`,
  `frontend/src/app/pages/supply/supply-quick-order.mock.ts`

## Требования PO (по голосу, 2026-08-19)

1. [x] Три карточки в одну линию (одинаковая высота, не «каскадом»).
2. [x] У карточек лёгкие цветовые подложки, чтобы блоки различались; зазоры между карточками меньше.
3. [x] Высота инпутов уменьшена до 36px (как `.pi-input` сайта).
4. [x] Кнопки «+» зелёные и крупнее.
5. [x] Цвет материала — выпадающий список цветов этого материала + «+» новый цвет,
      новый цвет сохраняется в материал; при повторном выборе материала список его цветов виден.
6. [x] В блоке «Контакт» добавлен «Телефон менеджера» перед «Почтой менеджера».
7. [x] Фото материала: несколько фото + одно главное (★); главное фото показывается
      в свёрнутой строке перед названием.
8. [x] У материала кнопки «Редактировать» и «Копировать»; копия создаётся с префиксом
      «копия» и сразу открывается в редакторе.
9. [x] Отдельный чек-лист (этот файл) зафиксирован, чтобы требования не терялись.

## Acceptance

- [x] `.supply-quick-order__strips` — `gap: 0.75rem; align-items: stretch` (карточки в одну линию).
- [x] Карточки: `what` = sunrise-tint, `where` = info-tint, `details` = success-tint
      (`color-mix(in oklch, … N%, var(--color-paper))`).
- [x] `.supply-quick-order__strip .pi-input` и `.readonly` — `height: 2.25rem` (36px).
- [x] `.supply-quick-order__add-btn` — зелёный (`--color-success`), белый «+», `2.4rem × 2.25rem`.
- [x] Цвет: `data-test="supply-quick-material-color"` стал `<select>`, `supply-quick-color-add`
      открывает inline-панель `supply-quick-color-panel` (`-name`, `-save`).
- [x] Модель: `QuickOrderMaterial.colors: string[]` (legacy `color` — первый цвет без дубля),
      `SupplyQuickOrderRow.color` — выбранный цвет строки; `materialColorOptions()` дедуплицирует.
- [x] Контакт: `supply-quick-manager-phone` перед `supply-quick-manager-email`.
- [x] Фото: `QuickOrderMaterial.photos: QuickOrderMaterialPhoto[]` + `mainPhotoId`;
      `materialMainPhoto()` отдаёт главное фото для миниатюры в summary.
      Панель материала — мок-фото: thumbs со ★ (главное), `+` добавляет макет-фото.
- [x] Edit/copy: `supply-quick-material-edit` / `supply-quick-material-copy`;
      edit предзаполняет панель, copy клонирует с `копия ` префиксом и открывает редактор.
- [x] Gates: jest supply 23 PASS · tsc PASS · build PASS (только прежние budget warnings).

## Gates

```text
cd frontend; pnpm exec jest --config jest.config.js --runInBand src/app/pages/supply/  — PASS (23 tests)
cd frontend; pnpm typecheck                                                             — PASS
cd frontend; pnpm build                                                                 — PASS (budget warnings only)
```

## Files changed

- `frontend/src/app/pages/supply/supply-quick-order.mock.ts` — `QuickOrderMaterialPhoto`,
  `colors`/`photos`/`mainPhotoId` у материала, `row.color`, seed, `materialColorOptions`,
  `materialMainPhoto`.
- `frontend/src/app/pages/supply/supply-quick-order.component.ts` — цвета (select + «+»),
  телефон менеджера, фото-макет со ★, edit/copy материала, выравнивание карточек, tint'ы,
  36px инпуты, зелёные «+».
- `frontend/src/app/pages/supply/supply-quick-order.component.spec.ts` — +5 тестов 309.

## Данные для 305 (wiring на сервер) — выявлено в этом аудите

- Реальный `Material` (`frontend/src/app/shared/services/materials.service.ts`) **уже** имеет
  `photoIds?: string[]` и `mainPhotoId?: string | Photo` — фото переносятся 1:1.
- Реальный `Material` **не имеет** поля `colors`. Для справочника «цвета материала» в 305 нужно
  добавить `colors?: string[]` в бэкенд-схему и миграцию; UI-контракт уже готов в моке
  (`QuickOrderMaterial.colors` / `SupplyQuickOrderRow.color`).
- Реальные `MaterialsService.duplicate()` (TZ-MATERIALS-310) и `update()` уже есть — mock-копия
  и edit зеркалят эти контракты; при wiring «Копировать» должен звать `duplicate(id)`.

## Known limitation

- Фото — макет (swatch), без бинарного upload/storage (как в 304). Реальный upload — 305.
- Мок in-memory: F5 сбрасывает созданные цвета/фото/материалы.
- «Цвет» в панели материала — первый цвет; дальнейшие цвета добавляются через «+» у поля «Цвет»
  в строке заявки (это и есть канон «цвета хранятся на материале»).

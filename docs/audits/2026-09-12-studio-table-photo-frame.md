# Audit — фото в видах таблиц DocStudio (2026-09-12)

## PO симптом

В таблице на A4 / видах везде «Нет фото». Не смог сохранить фото в карточке изделия (→ слот WAVE #01). Просит: проверить пайплайн + **контроль** как фото вставлено/масштабировано в ячейке.

## Пайплайн (как есть)

| Шаг | Статус |
|-----|--------|
| Upload + ★ + **РАМКА** в карточке изделия/модуля/материала | Есть (`WAVE-NX-CATALOG-PHOTOS` P0–P3, `pi-photo-frame-editor`) |
| Save паспорта пишет `photoIds` / `mainPhotoId` | Ломается UX при invalid form → **#01** |
| Live table resolve `mainPhotoId`/`photoIds` → `Photo.storageUrl` | Есть (`studio-data-resolver.resolveCatalogPhotoUrls`) |
| Файл на диске отсутствует | → честное «Нет фото» (orphan ~78% local DB) — **не баг рендера** |
| Canvas / preview / PDF | `<img>` или «Нет фото» (S48); **жёсткий** `object-fit: contain`, max ~72×48 |
| `Photo.frame` (pan/fit из РАМКИ) в ячейке таблицы | **НЕ подключён** (known_limitation P3: DocStudio thumbs) |
| Отдельное меню «как вставить фото в таблицу» в Свойствах таблицы | **Нет** |

## Вывод

1. «Нет фото» сейчас часто **правда** (нет файла / не сохранился passport / orphan). После #01 PO перепроверит на свежем upload.  
2. Рендер колонки фото **работает** (aliases `photo`/`photoIds`/…).  
3. **Дыра продукта:** нет применения `Photo.frame` и нет UI в Свойствах таблицы для режима вставки (contain/cover, размер). Кадрирование уже есть в карточке («РАМКА») — студия его игнорирует.

## Рекомендация в волну

- **#05** FIX: прокинуть `Photo.frame` в canvas + BE preview/PDF photo cell; в Свойствах таблицы — блок «Фото в ячейке» (fit contain|cover + опционально max size); hint «кадр — в карточке каталога (РАМКА)».  
- Не второй полный frame-editor внутри таблицы (reuse P3).

## Closeout (2026-09-12)

`TZ-NX-PO-SWEEP-05` DONE. Пайплайн подтверждён рабочим (S48/TABLE-PHOTO-SMOKE
тесты не трогал, всё ещё зелёные) — «Нет фото» по-прежнему бывает честным
(orphan/отсутствующий файл), не рендер-багом. Дыра `Photo.frame` закрыта:
`resolveCatalogPhotoUrls` резолвит `frame` вместе с `storageUrl`;
`resolveDataSets`/`fetchLiveRows` прокидывают `photoFrames` (keyed by URL)
параллельно `rows` (cell остаётся plain string URL — TZ Pref, без реструктуры
`liveRows`); canvas (`photoCellStyle`) и BE render (`renderPhotoCellHtml` +
`injectTableContent` + `studio-multipage.utils.ts` PDF-пагинация) применяют
тот же frame через `object-fit`/`object-position` — full canvas/PDF parity.
Свойства таблицы получили секцию «Фото в ячейке» (`tablePhotoDisplay.fit`
override + `maxHeightPx`, persisted как обычный block.settings patch);
пан/крап остаются catalog-owned (РАМКА в карточке), второй pan-редактор не
строил. Архив: `tasks/_archive/2026-09/TZ-NX-PO-SWEEP-05-studio-table-photo-frame.done.md`.

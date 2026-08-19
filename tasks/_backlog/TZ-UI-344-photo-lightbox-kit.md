# TZ-UI-344: Photo lightbox — UI kit + audit подключений

## Intent (PO)

Клик по фото → почти полный экран, единая рамка по дизайну. Сначала kit, потом быстрый audit где подключить: каталог, **состав заказа** (мелкие thumbs сейчас не видны).

## Шаг 1 — Kit

- `PiPhotoLightboxComponent` или dialog: img contain, dark backdrop, Escape/клик закрыть, aria.
- Story/spec в ui kit folder.

## Шаг 2 — Wire (thin TZ each or one wave)

- Product showcase cards
- `app-composition-tree` thumbs
- KP preview optional later

## НЕ

- zoom/pan gallery

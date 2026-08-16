# WAVE — Photo frame / position in upload pattern

> PO 2026-08-16: default show photo **целиком**; optionally position inside a **rectangle**
> frame (как Instagram circle crop, но прямоугольник под table/card slots).
> Сохранённое позиционирование = то, как потом видно на сайте.
> Встроить в общий паттерн загрузки фото (TZ-UI-PHOTO-343 dropzone), не ad-hoc на одной странице.

**Статус:** #0 UX-344 DONE · #1 PHOTO-304 DONE · #2–#3 ещё PARK до PO.  
**Сделано:** TZ-UX-344 (contain display) + TZ-PHOTO-304 (persist frame meta API).

## Канон продукта (черновик)

1. **Default display:** `contain` + center — весь кадр виден (letterbox ok).
2. **Optional framing:** при upload/edit в dropzone — UI «Позиция в кадре»:
   - прямоугольный viewport (aspect зависит от слота: list thumb ~1:1, showcase md ~16:9 — **один** сохранённый frame на photo или per-slot later);
   - drag/pan (+ optional zoom) как в Instagram, но **rect**, не circle;
   - preview = то же, что увидит list/card.
3. **Persist:** на сущности Photo (или attachment meta) хранить frame:
   - минимум v1: `objectPosition` (`x% y%`) + `objectFit: 'contain' | 'cover'`  
   - или v1b: crop rect `{ x, y, w, h }` в нормализованных 0..1 относительно original.
4. **Consumers:** showcase card, list thumbs, detail hero читают meta; fallback = contain/center.
5. **Один write-path:** только через shared photo upload / dropzone pattern — не второй cropper на каждой форме.

## Порядок TZ (когда unpark)

| # | ID | Суть | Deps |
|---|-----|------|------|
| 0 | **TZ-UX-344** | Default contain в showcase (без persist) | — IN WORK / review |
| 1 | **TZ-PHOTO-304** | BE(+FE types): meta frame на Photo; API patch; migration optional | UX-344 done желательно |
| 2 | **TZ-UX-PHOTO-302** | Dropzone UI: rect positioner + save frame; RU copy | PHOTO-304 |
| 3 | **TZ-UX-PHOTO-303** | Consumers: showcase + catalog list thumbs читают frame | UX-PHOTO-302 |

Не смешивать #1–#3 в один агент (BE + UI + sweep = дорого).

## НЕ (пока)

- Circle avatar crop  
- Server-side re-encode crop как обязательный v1 (можно later sharp)  
- Deploy / wipe  

## Freebuff prompt (когда PO скажет «делаем позиционирование»)

См. `tasks/_backlog/PROMPT-WAVE-PHOTO-FRAME.md` — стартовать с **TZ-PHOTO-304** после UX-344 DONE.

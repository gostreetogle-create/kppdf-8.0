# TZ-PHOTO-301: При загрузке фото — оригинал + лёгкое превью (sharp)

```
PAGES: (API) /api/photos/upload
PAGE_DOCS: —
DEPENDS ON: нет (первый слой волны WAVE-PERF-PHOTOS)
```

РОЛЬ АГЕНТА: Backend Developer  
ЗАВИСИМОСТИ: Нет  
LAYER: 4  
CONFLICT KEYS: backend/src/modules/photos/photos.service.ts; backend/src/modules/photos/photos.controller.ts; backend/src/modules/photos/photo.schema.ts; backend/package.json; backend/pnpm-lock.yaml

Проверено: `photo.schema.ts` уже имеет `variant: original|full|medium|thumb` и `parentPhotoId`, но upload пишет только `original`; в schema TODO про sharp; `sharp` в package.json нет.

---

## Простыми словами (для PO)

Сейчас фото сохраняется как есть (тяжёлое). Нужно: при загрузке сервер **сам**
делает маленькую копию для списков. Оригинал **не портим и не удаляем**.
Открытый инструмент: **sharp** (стандарт для Node, быстро, не грузит сервер
на наших объёмах ~десятки фото).

---

## Domain preflight

| Говорят | Канон |
|---------|--------|
| «оптимизация фото на сервере» | `sharp` → варианты `thumb` (+ опционально `medium`) рядом с `original` |
| Качество | оригинал без перекодирования «в ноль»; превью — отдельный файл |
| 1 загрузка | 1 parent `Photo` (original) + N child Photo records (thumb/medium) с `parentPhotoId` |

---

## ЧТО ДЕЛАТЬ

### ШАГ 1 — зависимость

- Добавить `sharp` в `backend` через **pnpm** (не npm).

### ШАГ 2 — генерация при upload

В `POST /photos/upload` после сохранения оригинала на диск:

1. Запись Photo `variant: 'original'` (как сейчас) — **это главный файл**.
2. Сгенерировать файл превью:
   - `thumb`: длинная сторона ≤ **320px**, JPEG/WebP quality ~80, без увеличения маленьких картинок.
3. Запись Photo `variant: 'thumb'`, `parentPhotoId = original._id`, свой `storageUrl`/`sizeBytes`/`widthPx`/`heightPx`.
4. Опционально (если дёшево в том же проходе): `medium` ≤ **960px** — для карточки изделия; иначе только thumb в этом TZ, medium — known_limitation → 303/follow-up.

Ошибки sharp: оригинал всё равно сохранён; залогировать WARN; upload не падает 500 из‑за превью (или явный fallback — зафиксировать в коде).

### ШАГ 3 — API ответа

Upload response должен позволять клиенту сразу знать URL превью, напр.:

- вернуть original как сейчас **и** `variants: { thumb: { _id, storageUrl } }`,  
  **или** массив созданных Photo;
- не ломать существующих клиентов: поля original (`_id`, `storageUrl`, …) остаются.

### ШАГ 4 — тесты

- unit/spec: upload mock file → создаётся original + thumb на диске/в model.
- gates: `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` + `pnpm test -- photos`

---

## НЕ ИЗМЕНЯТЬ

- UI страниц (это 302)
- Удаление/перекодирование уже лежащих original
- Бизнес-поля Product/Material (только Photo pipeline)
- Deploy

## КРИТЕРИИ ПРИЁМКИ

1. Новая загрузка фото → в `uploads/` ≥2 файла (оригинал + thumb).
2. В Mongo: original + thumb с `parentPhotoId`.
3. Оригинал байт-в-байт не «пережат вместо себя».
4. tsc + photos tests PASS.
5. Archive + Executor report.

## One-liner

```text
GEMINI.md + tasks/_backlog/perf/TZ-PHOTO-301-upload-variants-sharp.md. CLAIM. sharp на upload: original + thumb (parentPhotoId); ответ API с variants; тесты; archive.
```

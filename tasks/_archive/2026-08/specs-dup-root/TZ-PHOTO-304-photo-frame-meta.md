# TZ-PHOTO-304: Photo frame meta (position in rect) — DONE

> Часть `WAVE-PHOTO-FRAME-POSITION`. Unparked PO («дочинить всё» / WAVE-DEPLOY-98).
> **DONE** 2026-08-16 — archive `tasks/_archive/2026-08/TZ-PHOTO-304.done.md`.

РОЛЬ АГЕНТА: Backend + FE types

ЗАВИСИМОСТИ: TZ-UX-344 DONE (желательно); shared Photos module

LAYER: 3

CONFLICT KEYS: `backend/src/modules/**/photo*` (schema/DTO/controller) ; FE `photos.service.ts` / Photo interface ; migration если нужна

PAGES: N/A (API)  
PAGE_DOCS: note в photo/upload canon doc если есть

STATUS: **DONE** (landed main)

---

## Цель

Сохранить на Photo метаданные кадра для прямоугольного слота:

**Рекомендуемый v1 (тонкий):**

```ts
frame?: {
  fit: 'contain' | 'cover';  // default 'contain'
  posX: number;             // 0..100, CSS object-position %
  posY: number;             // 0..100
}
```

Альтернатива v1b (если cover-crop жёстче): нормализованный `crop: { x,y,w,h }` 0..1 — выбрать **один** в Domain preflight по живому schema, не оба.

Default без meta = `{ fit: 'contain', posX: 50, posY: 50 }`.

PATCH photo frame без перезагрузки файла. List/get отдают frame.

## НЕ

- Dropzone UI (→ TZ-UX-PHOTO-302)  
- Consumer sweep (→ TZ-UX-PHOTO-303)  
- Deploy  

## AC (когда снимут PARK)

- [ ] Schema + DTO + PATCH + FE type  
- [ ] Default contain/center documented  
- [ ] Gates BE tsc + focused photo tests  

Archive после DONE.

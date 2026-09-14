# TZ-NX-DOCSTUDIO-IMAGE-PASSPORT-FIT-WYSIWYG: Фон фото — размер как в PDF

**РОЛЬ АГЕНТА:** Executor (FE canvas CSS + BE render parity check) — freebuff или claude  
**ЗАВИСИМОСТИ:** Нет (независимо от PREVIEW-UPLOADS-INLINE)  
**LAYER:** 3 · **SIZE:** S  
**PAGES:** `/studio/:id`  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.spec.ts` (если есть / создать focused) ;  
`backend/src/modules/document-render/document-render.service.ts` (только если нужен комментарий/док — **не** менять passport `contain` без причины) ;  
`backend/src/modules/document-render/document-render.studio-canvas.spec.ts` (регресс contain) ;  
`docs/pages/document-studio.page.md` ;  
`docs/audits/2026-09-13-docstudio-image-passport-fit-wysiwyg.md`

IMPLICIT CONFLICT: `nx build kppdf-web`

### Preflight (domain)

Проверено: `studio-blocks-canvas.component.ts` (passport + image CSS); `document-render.service.ts` (`.doc-bg--block` contain, foreground cover); `docs/pages/document-studio.page.md` §3.7; audit выше.  
Loose wording PO «фоновый рисунок стайл» → код: image `settings.overlay=true` («Сделать фоном»), не `document.backgroundImage`.

### Symptom

После «Сделать фоном» на холсте фото заполняет лист (`cover` из‑за CSS override), PDF — letterbox (`contain`) → «в PDF уменьшилось».

### Root cause

См. audit. Passport-article имеет `studio-block--image` → поздний `object-fit:cover` перебивает `contain`.

### ЧТО ДЕЛАТЬ

1. **FE — passport fit win:** в `studio-blocks-canvas.component.ts` styles:
   - Селектор сильнее, чем `.studio-block--image img`, напр. `.studio-block--passport-bg.studio-block--image img` **или** порядок + specificity, чтобы passport всегда был `object-fit: contain` (и `object-position: center`).
   - Не ломать foreground: обычные `.studio-block--image img` остаются `cover`.
2. **FE — padding parity (image):** у обычных image-блоков `padding:0` (как у passport / как PDF box), чтобы рамка layout % = содержимое img; text/table padding не трогать без нужды.
3. **BE:** оставить `.doc-bg--block img { object-fit: contain }`. Регресс-спек `document-render.studio-canvas.spec.ts` уже ждёт contain — не ломать. Если правишь только FE — BE-файл не в diff.
4. **Test:** unit/component или CSS-контракт: passport background block → computed/style rule contain; non-overlay image → cover. Минимум — расширить существующий canvas/helpers spec.
5. **page.md:** одна строка — passport фон: contain на холсте = PDF; обычное фото-блок: cover.
6. **Live AC:** фото «Сделать фоном» → холст letterbox как PDF; скачать PDF — тот же кадр (не crop на холсте / letterbox в PDF). Обычное фото (не фон) — по-прежнему заполняет свой прямоугольник cover, PDF ≈ холст.

### НЕ

- Менять passport PDF на `cover` «чтобы как сейчас на багованом холсте»
- PREVIEW-UPLOADS-INLINE / table photo / UNSCOPED
- Рисовать page-level `backgroundImage` на sheet в этом TZ (отдельный gap)
- Deploy / wipe

### AC

1. Computed/style: overlay image на canvas = `contain`; non-overlay = `cover`.  
2. Live: один документ — passport на холсте визуально совпадает с PDF (letterbox, не fill-crop).  
3. Gates: focused studio canvas tests; `cd frontend-nx && pnpm exec nx build kppdf-web` PASS последним.

### Claim

```
agent_id: claude
claimed_at: 2026-09-14T06:42:40Z
branch: main
baseline_sha: 0d4587b8
```

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-14
closed_by: Claude
verification:
  - acceptance criteria: PASS (all 3, including live smoke — see checklist Gates section)
  - typecheck: PASS
  - tests: PASS
  - lint: PASS (0 new errors vs pre-existing baseline of 38, verified via git-stash A/B)
  - checklist: ADDED (docs/agent-checklists/TZ-NX-DOCSTUDIO-IMAGE-PASSPORT-FIT-WYSIWYG.md)
  - progress.md: N/A (redirected to docs/agent-checklists/_NOW.md per repo convention)
  - status synchronization: PASS

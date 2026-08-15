═══════════════════════════════════════════════════════════════
TZ-UX-PHOTO-301: Индикатор загрузки фото (видно, что идёт upload)
═══════════════════════════════════════════════════════════════

STATUS: READY
ACTIVE: claim → tasks/_active/TZ-UX-PHOTO-301.md
SOURCE: PO 2026-08-15 — «фото в итоге есть, но не понимаю грузится или нет / нет шкалы»
DEPENDENCIES: none
LAYER: 3

PAGES: forms с фото (изделие / материал / QuickCreate) — см. CONFLICT KEYS
PAGE_DOCS: product-detail.page.md ; materials (если есть page-doc) — обновить note

РОЛЬ АГЕНТА: Frontend UX

CONFLICT KEYS:
frontend/src/app/shared/ui/photo/photo-dropzone.component.ts;
frontend/src/app/shared/ui/photo/photo-dropzone.component.spec.ts;
frontend/src/app/shared/services/photos.service.ts;
frontend/src/app/pages/products/product-form-dialog.component.ts;
frontend/src/app/pages/materials/material-form-dialog.component.ts;
frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.ts;
docs/agent-checklists/TZ-UX-PHOTO-301.md;
docs/pages/PAGE-TZ-INDEX.md;
progress.md

Проверено: photo-dropzone показывает только текст «Загрузка фото…»;
  product/material form — «Загрузка…» мелким muted; PhotosService.upload —
  silentPost без HttpEvent/progress; на медленном deploy PO не видит шкалу.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Upload на deploy работает (PO подтвердил: фото появилось), но feedback слабый:
только строка текста. Нет прогресс-бара / percent / aria-busy на зоне дропа.
Save иногда пишет «Загрузка фото…», но зона выбора файла выглядит «мёртвой».

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — CLAIM + checklist `docs/agent-checklists/TZ-UX-PHOTO-301.md`

ШАГ 2 — PhotosService (опционально, предпочтительно)
Добавить upload с `reportProgress: true` + `observe: 'events'` (или тонкий
`uploadWithProgress(file)`), эмитя `{ type:'progress', percent }` и
`{ type:'done', photo }`. Сохранить существующий `upload()` для совместимости
ИЛИ перевести всех потребителей на progress API без ломания SilentResult.

ШАГ 3 — `app-pi-photo-dropzone`
Пока `uploading()`:
- `aria-busy="true"` на drop-target; pointer-events disabled / не открывать file picker;
- видимый **progress bar** (indeterminate, если % нет; determinate 0–100, если есть);
- RU status: «Загрузка фото…» + при наличии «N%»;
- data-test: `photo-upload-progress`.
Вход: опциональный `progressPercent = input<number | null>(null)`.

ШАГ 4 — Выровнять product + material form dialogs
Те же правила: не только tiny «Загрузка…»; либо перевести на dropzone, либо
добавить тот же progress UI рядом с photo-input. Кнопка Save остаётся disabled
на время upload (уже есть).

ШАГ 5 — QuickCreate
Уже передаёт `[uploading]`; прокинуть percent если появился.

ШАГ 6 — Gates + archive
Jest dropzone + затронутые specs; FE tsc; diff-check.
Archive + lock + PAGE-TZ-INDEX + progress.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- backend photos API / multer limits / sharp variants (PHOTO-301 archive)
- storage paths / wipe / deploy
- nav dropdown / workers limit / PDF chromium (отдельные запахи)
- Production Studio B–D

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. При выборе файла сразу виден явный индикатор (bar + RU status), не только
   бледный текст.
2. Dropzone не принимает повторный клик пока uploading.
3. По завершении индикатор исчезает; превью появляется без «тишины».
4. Ошибка upload — `role="alert"` RU (уже есть errorMessage — сохранить).
5. Light/dark читаемо; tsc + Jest PASS.
6. known_limitation: точный % зависит от браузера/прокси; если events недоступны —
   indeterminate bar обязателен (не «ничего»).

Verification:
```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest src/app/shared/ui/photo/photo-dropzone.component.spec.ts --runInBand --no-coverage
git diff --check
```

Промпт исполнителю:
`Прочитай GEMINI.md + tasks/TZ-UX-PHOTO-301-upload-progress.md. Сделай видимую шкалу/индикатор загрузки фото (dropzone + product/material/quick-create). Backend не трогать.`

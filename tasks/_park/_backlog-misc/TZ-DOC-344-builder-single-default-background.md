═══════════════════════════════════════════════════════════════
TZ-DOC-344: builder — один фон на холсте + жёлтая звезда default
═══════════════════════════════════════════════════════════════

> Domain preflight: DocumentTemplate.backgroundImage[] + defaultBackgroundIndex;
> unique N/A. Проверено: `builder.page.ts` backgroundImages при idx=-1
> возвращает **весь** массив → несколько слоёв на холсте; upload FE
> обновляет только backgroundImage, не defaultBackgroundIndex; звезда
> StarFilledIcon === StarIcon + `.is-active` без gold/fill.

РОЛЬ АГЕНТА: Frontend Engineer (builder backgrounds UX)

ЗАВИСИМОСТИ: Нет (hotfix поверх D.2.1 / DOC-343). Не трогать DOC-342 BE keys.

LAYER: 2

PAGES: /doc-constructor/builder/:id
PAGE_DOCS: docs/pages/builder.page.md

CONFLICT KEYS: frontend/src/app/pages/doc-constructor/builder/builder.page.ts; frontend/src/app/pages/doc-constructor/builder/builder-inspector.component.ts; frontend/src/app/pages/doc-constructor/builder/builder.page.spec.ts; frontend/src/app/shared/services/pi-document-templates.service.ts; docs/pages/builder.page.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. `builder.page.ts` `backgroundImages` computed:
   `if (idx >= 0) return [all[idx]]; return all;` — при `-1` на холсте
   **все** загруженные фото.

2. `onBackgroundUpload` пишет только `backgroundImage` из ответа; BE уже
   ставит `defaultBackgroundIndex=0` на первый upload, но FE это теряет.

3. Inspector: `StarFilledIcon = Star` (тот же outline); `.is-active` только
   `color: var(--color-ink)` — звезда не «загорается» жёлтым.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: CANVAS — ВСЕГДА ОДИН ФОН

  `backgroundImages`: если массив пуст → `[]`; иначе взять
  `defaultBackgroundIndex` если валиден, иначе **0**. Никогда не
  возвращать весь массив.

ШАГ 2: UPLOAD — СИНХРОН DEFAULT + ЗВЕЗДА

  После успешного upload:
  - обновить `backgroundImage` из ответа;
  - если предыдущий массив был пуст ИЛИ `defaultBackgroundIndex` невалиден
    (`<0` / out of range) → выставить локально `0`;
  - если пришлось heal при уже существующих фонах и сервер ещё `-1` —
    вызвать `setDefaultBackground(0)` (persist).

  Опционально: расширить `UploadBackgroundResponse` полем
  `defaultBackgroundIndex` **только если** BE endpoint уже отдаёт его
  без правки DOC-342 keys. Иначе — FE heal выше достаточен.

ШАГ 3: INSPECTOR — ЖЁЛТАЯ АКТИВНАЯ ЗВЕЗДА

  Для default-item:
  - `.bg-grid__action-btn.is-active`: `color` / `border-color` =
    `var(--color-gold-deep)` (или gold token проекта);
  - SVG fill `currentColor` на активной звезде (CSS на
    `.is-active lucide-icon svg` / `fill: currentColor`).
  - Effective default для UI: тот же правило, что холст (invalid → 0),
    чтобы первая звезда горела сразу после первой загрузки.

ШАГ 4: ТЕСТЫ + DOCS

  - Jest: computed/upload sync (builder.page.spec) и/или inspector
    is-active class при default index.
  - Одна строка в `builder.page.md`: на холсте только default фон;
    первый upload → index 0 + звезда.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- DOC-342 controller/service upload null-file guards
- SALES-317 proposal-create FE
- MIME / 5MB / max 5 backgrounds лимиты
- Deploy

═══════════════════════════════════════════════════════════════
ACCEPTANCE CRITERIA
═══════════════════════════════════════════════════════════════

1. Загрузка 2+ фонов → на холсте виден **ровно один** слой (default).
2. После первой загрузки `defaultBackgroundIndex === 0` в UI (звезда на первом).
3. Клик «сделать по умолчанию» → звезда жёлтая (gold) + fill; не ink-only outline.
4. FE tsc + focused Jest PASS.
5. Строка в builder.page.md.

═══════════════════════════════════════════════════════════════
KNOWN LIMITATION
═══════════════════════════════════════════════════════════════

Print/HTML build path в BE при `defaultBackgroundIndex=-1` ещё может
клеить все слои — отдельный successor, если PO увидит в PDF. Этот TZ —
builder canvas + inspector.

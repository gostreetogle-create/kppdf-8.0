# TZ-NX-PO-SWEEP-04 checklist — studio data vitrina thumbs + height

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-PO-SWEEP-04-studio-data-vitrina-thumbs.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-12T00:00:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (CLI local, no Team Room in this session)

## Preflight

- [x] `_NOW.md` + `tasks/_active/` — только этот TZ
- [x] TZ прочитан

### Preflight Check Output
- **Context read:** `pi-showcase-card.component.ts` (sm case `@if(mediaUrl())` — весь media-слот пропадал без фото; `.sc-media--sm` 40×40; md уже имеет `sc-media--empty` паттерн), `studio-data-vitrina.component.ts` (`photoUrl()` returned bare ObjectId string as-is — 404 img; `.vitrina-grid { max-height: 480px }`), `production-read.facade.ts` (`firstPhotoUrl`/`firstPhotoThumb` — существующий safe-resolution паттерн WAVE-NX-CATALOG-PHOTOS, populated-only + thumb variant preference), `studio-workspace-shell.component.css` (`.kp-ws-panel__body { flex:1; min-height:0; overflow-y:auto }` — панель уже единый скролл-контейнер)
- **Key Constraints:** не импортировать поперёк pages (production→studio) — переиспользовал тот же safe-algorithm локально, не литеральный shared import; не трогать A4 geometry; не менять md/lg card behaviour
- **Planned Deliverable:** sm always-on media slot + placeholder + onerror fallback; media 40→48px; photoUrl() populated-only (mainPhotoId aware); убрать vitrina-grid max-height/overflow-y (панель уже скроллит)
- **Validation Path:** showcase-card specs (sm placeholder/broken/resolved) + новый studio-data-vitrina spec (все 4 kind) + studio-data-panel spec (no max-height assert) + nx build last

## Acceptance (из TZ)

- [x] На Изделия/Модули/Детали/Материалы слева thumb (или placeholder), текст справа
- [x] Список визуально заполняет высоту панели вниз (панель — единый scroll)
- [x] Specs + `nx build kppdf-web` green

## Integrity slot

- [x] Тип изменения: page + shared UI lib (`pi-showcase-card` в `@kppdf/ui/card`)
- [x] FIC / page.md / DOMAIN-MAP / SECTION-READINESS / COUPLING-MAP: N/A (UX/visual fix, тот же route/entity)
- [x] Чужой WIP не в коммите

## Gates (факт)

- `nx test kppdf-web` (full suite) → PASS 823/830 (7 skipped), +8 новых (3 showcase-card sm, 4 vitrina, 1 data-panel)
- `nx build kppdf-web` → PASS (после фикса случайных backtick внутри CSS-комментария внутри styles template literal — см. Executor report; pre-existing NG8102/gantt-bars warnings не мои)

## Executor report

- **`pi-showcase-card.component.ts` (sm):** media slot теперь всегда рендерится (не только `@if(mediaUrl())`); `[class.sc-media--empty]` при отсутствии url ИЛИ broken image; `data-test="showcase-media"` (параллель md); `.sc-media--sm` 40×40 → 48×48; `.sc-row` min-height 56→60px; новый `.sc-media--sm.sc-media--empty` градиент (тот же паттерн, что у md empty).
- **Broken image → placeholder:** новый `mediaBroken` signal + `(error)="onMediaError()"` на `<img>`; сбрасывается effect'ом на смену `mediaUrl()` (переиспользуемый инстанс в `@for`); `onMediaActivate` тоже игнорирует клик, если `mediaBroken()`.
- **`studio-data-vitrina.component.ts` `photoUrl()`:** переписан на safe populated-only resolution (mirror `production-read.facade.ts` `firstPhotoUrl`/`firstPhotoThumb` — thumb-variant preference + mainPhotoId first + populated object only). Бывший код трактовал bare ObjectId string как готовый URL → гарантированный 404 `<img>`; теперь bare string → '' → placeholder. `mainPhotoId` теперь передаётся отдельным параметром для всех 4 kind (products/modules/parts/materials), не только parts/materials веткой.
- **`.vitrina-grid`:** убран `max-height: 480px; overflow-y: auto` — `.kp-ws-panel__body` (flyout панель) уже `flex:1; min-height:0; overflow-y:auto`, так что искусственный потолок создавал mёртвую зону под списком при большей высоте панели. Теперь один скролл на весь Data-раздел (табы+поиск+сетка), без раннего обрыва.
- **Specs:** +3 в `pi-showcase-card.component.spec.ts` (sm placeholder/resolved/broken-error), новый `studio-data-vitrina.component.spec.ts` (4 теста — по одному на Изделия/Модули/Детали/Материалы, populated vs bare-id vs no-photo), `studio-data-panel.component.spec.ts` — старый ассерт `overflow-y: auto` заменён на «нет max-height:/overflow-y: свойств в блоке» (с учётом того, что комментарии внутри блока могут содержать эти слова как прозу — regex требует `:` после свойства).
- **Инцидент в процессе:** первая версия CSS-комментария в `.vitrina-grid` содержала литеральные backtick-и (`` `.kp-ws-panel__body` ``) внутри TS template literal `styles: [\`...\`]` — это преждевременно обрывало строку и валило `nx build` с криптичной ошибкой компилятора `Code: 1010 Failed to resolve styles at position 0` без указания файла. Нашёл через grep по backtick в изменённых файлах; исправил на обычные кавычки. Отмечаю для будущих агентов: **не использовать backtick внутри Angular `styles: [\`…\`]` template literal**, даже в комментариях.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-12

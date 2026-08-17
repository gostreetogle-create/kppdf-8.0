# PROMPT — WAVE-KP-TABLE-STUDIO

Непрерывный промпт для исполнителя. Порядок строгий: **356 → 357 → 358**. Deploy только по явному «деплой» от PO.

## Канон

- Vision: `docs/audits/2026-08-11-kp-table-studio-vision.md`
- Table config: `docs/audits/2026-08-09-kp-table-config-canon.md` (shared template не трогать)

## TZ-SALES-356 — footer + рейл

- «Своя строка» внизу состава (full-width), не в шапке.
- Правый рейл: Параметры → Состав → Таблица → Условия.
- Jest smoke: empty/add custom + rail order.

## TZ-SALES-357 — Table Studio UI

- Новый `proposal-create-table-studio.component.ts` вместо `tableOnly` inspector.
- Flyout `data-flyout="table"`: `min(794px, calc(100% - rails))`.
- Toolbar: рамка thin|normal|thick, шапка normal|bold, поля КП, ссылка в Документы.
- Column strip: порядок, видимость, widthPercent.
- Live table из `draftLines`; qty/цена → `onCompositionLineChange`.
- Persist: layout + chrome в snapshot / autosave path.

## TZ-SALES-358 — build widths/chrome

- DTO: `widthPercent`, `tableChrome.borderWeight|headerWeight`.
- `table-template.service.preview` применяет colgroup % и border/header на HTML.
- Backend tsc + focused unit на preview HTML.

## Out of scope

Merge Состав+Таблица · DnD строк · запись в shared TableTemplate · полный column constructor.

## Gates

- FE: `pnpm exec tsc -p tsconfig.app.json --noEmit` + `proposal-create.page.spec.ts`
- BE (358): `pnpm exec tsc -p tsconfig.build.json --noEmit` + `table-template.service.spec.ts`

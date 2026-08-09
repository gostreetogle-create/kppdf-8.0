# /proposals/create — Создать КП

**Route:** `/proposals/create` (вход из «Сделки» → КП по умолчанию ведёт сюда; «Все КП» остаётся `/proposals`)
**TZ:** **310–317 DONE** · **319 + 321 DONE** · wave-2 **323/324/325** · витрина **326–328 READY** (318→328) · **320/322 PARK**  
**Spec LOCK:** [`docs/ux/kp-create-studio-spec.md`](../ux/kp-create-studio-spec.md) §0 FROZEN  
**Аудит:** layout + overlay · [`preview-wave2`](../audits/2026-08-09-kp-create-preview-wave2.md) · [`product-vitrine`](../audits/2026-08-09-kp-create-product-vitrine.md)

## Зафиксировано (не менять без PO)

- Центр = только A4; flyout **overlay** (grid rails|center|rails fixed)
- Left rail: **Шаблон** + **Товары**; Right: **Параметры**
- Под chips нет ghost tools-strip; `flushBody` — студия вплотную к жёлтым chips
- CTA «Добавить шаблон»; pick закрывает панель шаблона
- `draftLines` in-memory only (в rail / inspector estimate); до Save не пишутся в Quotation/Mongo
- Empty table-template with declared columns renders a blank skeleton (`thead` + one empty row), not a plain empty-state paragraph (324).
- 325: preview request carries `previewLines`; the assigned `settings.kpLineItems`/`role: line-items` table is filled by canonical `column.key` aliases. Without an explicit target, exactly one live table is eligible; snapshots and other live tables stay untouched.
- 330: the right-flyout «Таблица» is a copy-on-write `kpTableLayout` for this КП: ↑/↓ and «Показать/Скрыто» rebuild the live line-items table; the shared TableTemplate is never patched. «Пресет в Документах» links back to the preset library.

## Center preview (TZ-SALES-319)

- При выборе шаблона или добавлении изделия: `DocumentTemplatesService.build(id, { previewLines, organizationId? })`; `previewLines` — request-only
- Лист = sandboxed `iframe` `srcdoc` (`data-test="kp-tpl-html-preview"`); без имени / «упрощённое» / bullet draftLines
- Смена шаблона или org из inspector `stateChange` → rebuild (debounce ~200ms)
- Loading / error — короткий RU на листе
- `<base href="{origin}/">` и absolute app-origin rewrite для `/uploads/...`; iframe `sandbox="allow-same-origin"` без scripts
- A4 iframe имеет intrinsic 794×1123px, `transform: scale(contain)` через ResizeObserver; sheet и документ `overflow: hidden` без H/V scroll; документ — единый A4 page box

## Дальше

- **323–325** — fit / empty skeleton / draftLines bind (wave-2)
- **326** — products flyout **36–40rem** (≈×2) + transparent backdrop dismiss вне панели (вкл. iframe); A4 center/rails не сжимаются
- **327** — PiShowcaseCard md equal-height (эталон; sm/md/lg уже есть)
- **328** — visual trial: `PiShowcaseCard md` grid **3-col** in the wider ~58rem products flyout (narrow fallback 2→1), slightly compact rail spacing, search + category + pager, `Добавить` / `Редактировать` / `Создать изделие` без выхода из студии
- Persist Quotation / snapshot → later · **322 PARK** · Печать → **320 PARK**
- **318** cascade — SUPERSEDED by 328
- **WAVE-KP-TABLE-CONFIG** (канон [`…-kp-table-config-canon.md`](../audits/2026-08-09-kp-table-config-canon.md)): **307** пресет КП в Документах → **330** экземпляр раскладки (панель «Таблица») → **331** наценка→цена + footer Итого/НДС; скидка не колонкой

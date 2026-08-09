# /proposals/create — Создать КП

**Route:** `/proposals/create`  
**TZ:** **310–317 DONE** · **319 + 321 DONE** (`build` HTML fidelity) · wave-2 **323/324/325 READY** · **318** cascade · **320/322 PARK**  
**Spec LOCK:** [`docs/ux/kp-create-studio-spec.md`](../ux/kp-create-studio-spec.md) §0 FROZEN  
**Аудит:** layout + overlay-correction + [`template-insert-fidelity`](../audits/2026-08-09-kp-create-template-insert-fidelity-audit.md) · [`preview-wave2`](../audits/2026-08-09-kp-create-preview-wave2.md)

## Зафиксировано (не менять без PO)

- Центр = только A4; flyout **overlay** (grid rails|center|rails fixed)
- Left rail: **Шаблон** + **Товары**; Right: **Параметры**
- Под chips нет ghost tools-strip; `flushBody` — студия вплотную к жёлтым chips
- CTA «Добавить шаблон»; pick закрывает панель шаблона
- `draftLines` in-memory only (в rail / inspector estimate; **не** на листе)

## Center preview (TZ-SALES-319)

- При выборе шаблона: `DocumentTemplatesService.build(id, { organizationId? })`
- Лист = sandboxed `iframe` `srcdoc` (`data-test="kp-tpl-html-preview"`); без имени / «упрощённое» / bullet draftLines
- Смена шаблона или org из inspector `stateChange` → rebuild (debounce ~200ms)
- Loading / error — короткий RU на листе
- `<base href="{origin}/">` и absolute app-origin rewrite для `/uploads/...`; iframe `sandbox="allow-same-origin"` без scripts
- A4 iframe имеет intrinsic 794×1123px, `transform: scale(contain)` через ResizeObserver; sheet `overflow: hidden` без H/V scroll

## Дальше

- **323** — A4 fit без scrollbar (FE scale + build HTML overflow/padding)
- **324** — empty table = skeleton thead + пустая строка (не `<p>Нет данных</p>`)
- **325** — live `draftLines` → **target** line-items table (key aliases; не все live tables; после 323+324)
- Overlay-каскад категорий → **318**
- Persist Quotation / snapshot → later · stale refresh → **322 PARK** · Печать → **320 PARK**

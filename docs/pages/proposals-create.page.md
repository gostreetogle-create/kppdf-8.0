# /proposals/create — Создать КП

**Route:** `/proposals/create`  
**TZ:** **310–317 DONE** · **319 + 321** READY FOR REVIEW (`build` HTML fidelity) · **318+** · **320 PARK**
**Spec LOCK:** [`docs/ux/kp-create-studio-spec.md`](../ux/kp-create-studio-spec.md) §0 FROZEN  
**Аудит:** layout + overlay-correction + [`template-insert-fidelity`](../audits/2026-08-09-kp-create-template-insert-fidelity-audit.md)

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

- Overlay-каскад категорий → **318**
- Bind draftLines → table blocks / Counterparty → later
- Persist Quotation → later · Печать → **320 PARK**

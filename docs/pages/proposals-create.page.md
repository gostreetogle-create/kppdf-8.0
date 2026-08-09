# /proposals/create — Создать КП

**Route:** `/proposals/create`  
**TZ:** **310–316 DONE** · **317 READY** (focus shell) · **318+** cascade fill · **320** print PARKED  
**Spec:** [`docs/ux/kp-create-studio-spec.md`](../ux/kp-create-studio-spec.md) (**v2** focus shell)  
**Аудит:** [`docs/audits/2026-08-09-kp-create-studio-layout-audit.md`](../audits/2026-08-09-kp-create-studio-layout-audit.md)

## Сейчас (после 316)

- Left: product rail → in-memory `draftLines` (всегда-open колонка на desktop)
- Center: DocumentTemplate select + A4 preview zone + «Редактировать шаблон» → `/doc-constructor/templates`
- Right: Organization + % + оценка (UI) + open-org link
- Page H1 «Создать КП» + zone titles (дубль жёлтого chip)
- Write-path draft: in-memory only

## Цель 317

- Убрать H1 / zone titles; фокус = A4 top, fit viewport, без page-scroll
- Left/Right → icon-rails; cascade flyout товаров; параметры default свёрнуты
- Наполнение категорий/фильтров → 318+

## Не здесь

Печать пачкой (**320 PARK**), ModuleMaterials, schema rewrite, deploy, quotation persist.

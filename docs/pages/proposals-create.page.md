# /proposals/create — Создать КП

**Route:** `/proposals/create`  
**TZ:** **310–316 DONE** · **320** print PARKED  
**Spec:** [`docs/ux/kp-create-studio-spec.md`](../ux/kp-create-studio-spec.md)

## Сейчас (витрина слоёв)

- Left: product rail → in-memory `draftLines`
- Center: DocumentTemplate select + A4 preview zone + «Редактировать шаблон» → `/doc-constructor/templates`
- Right: Organization + % + оценка (UI) + open-org link
- Write-path draft: in-memory only (persist later)

## Не здесь

Печать пачкой (**320 PARK**), ModuleMaterials, schema rewrite, deploy.

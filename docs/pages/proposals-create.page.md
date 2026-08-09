# /proposals/create — Создать КП

**Route:** `/proposals/create`  
**TZ:** **310–316 DONE** · **317** review (overlay RMK) · **319 READY** (`build` HTML preview) · **318+** · **320 PARK**  
**Spec LOCK:** [`docs/ux/kp-create-studio-spec.md`](../ux/kp-create-studio-spec.md) §0 FROZEN  
**Аудит:** layout + overlay-correction + [`template-insert-fidelity`](../audits/2026-08-09-kp-create-template-insert-fidelity-audit.md)

## Зафиксировано (не менять без PO)

- Центр = только A4; flyout **overlay** (grid rails|center|rails fixed)
- Left rail: **Шаблон** + **Товары**; Right: **Параметры**
- Под chips нет ghost tools-strip; `flushBody` — студия вплотную к жёлтым chips
- CTA «Добавить шаблон»; pick закрывает панель шаблона
- `draftLines` in-memory only (в rail; **не** chrome на листе после **319**)

## Дальше

- **319:** center ← `POST .../build` HTML (фон, позиции, таблицы); без имени шаблона на листе
- Overlay-каскад категорий → **318**
- Persist / Counterparty → later · Печать → **320 PARK**

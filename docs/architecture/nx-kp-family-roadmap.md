# NX KP Family — дорожная карта (после Sales canon)

> **SoT:** `docs/architecture/MASTER-CORE.md` §2.4 / §4 п.4 · legacy UX `docs/pages/proposals.page.md` §Семья  
> **Очередь:** `docs/agent-checklists/WAVE-NX-KP-FAMILY.md`  
> **Предыдущая:** Sales canon S30–S39 **DONE** (`28acaff7`)

## Север

Один состав КП заполняется один раз (master) и **раскатывается** в варианты под разные наши `Organization` (бланк/НДС/подписант).  
Backend **уже есть** (SALES-303). Волна = NX UI + data-access, без новой schema.

## Уже есть

| API | Путь |
|-----|------|
| GET family | `GET /quotations/:id/family` |
| Attach | `POST /quotations/:id/family/attach-organizations` |
| Sync | `POST /quotations/:id/family/sync-from-master` |
| Convert guard | variant → 400 (только master/solo) |

## Волна S40–S48

**DONE** 2026-09-03. WAVE: `docs/agent-checklists/WAVE-NX-KP-FAMILY.md`.  
**НЕ:** Invoice, авто-резерв, statusOverride, guest KP, CRM timeline.

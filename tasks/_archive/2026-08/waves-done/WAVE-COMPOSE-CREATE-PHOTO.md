# WAVE — Compose Create + Photo Upload Canon

**Цель:** пикер состава → «Создать»; модуль с файловым фото; единый dropzone (файл / drag / paste) по проекту.
**Audit:** [`docs/audits/2026-08-15-compose-create-and-photo-upload-audit.md`](../../../docs/audits/2026-08-15-compose-create-and-photo-upload-audit.md)
**Prompt:** [`PROMPT-COMPOSE-CREATE-PHOTO-CONTINUOUS.md`](../prompts-spent/PROMPT-COMPOSE-CREATE-PHOTO-CONTINUOUS.md)
**MASTER checklist:** [`docs/agent-checklists/WAVE-COMPOSE-CREATE-PHOTO.md`](../../../docs/agent-checklists/WAVE-COMPOSE-CREATE-PHOTO.md)

## Порядок (строго)

| # | TZ | Суть |
|---|-----|------|
| 1 | **TZ-CATALOG-340** | Пикер «Добавить в состав»: кнопка Создать → QuickCreate по вкладке |
| 2 | **TZ-UI-PHOTO-342** | Dropzone: Ctrl+V paste + RU hint «файл / перетащить / Ctrl+V» |
| 3 | **TZ-MODULES-341** | Module form + detail + QC module: dropzone → Photo → link; URL не primary |
| 4 | **TZ-UI-PHOTO-343** | Sweep: все UI добавления фото → dropzone canon; убрать/спрятать URL-only primary |

Deploy только по явной команде PO.

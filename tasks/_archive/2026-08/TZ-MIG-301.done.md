# TZ-MIG-301.done — КП3 extract + field mapping audit

> Статус: **DONE** · 2026-08-12 · agent-buffy
> Источник: VPS `130.49.129.240` (Mongo `kp-app`, `/opt/kppdf/media`) → локальный `data/from-kp3/`
> Checklist: `docs/agent-checklists/TZ-MIG-301.md` · Аудит: `docs/audits/2026-08-12-kp3-to-kp8-field-map.md`

## Что сделано

- **SSH read-only**: выгружены коллекции `products` (699), `counterparties` (23), `kps` (28) → `data/from-kp3/raw/*.json` (mongosh `JSON.stringify`, `_id`/вложенные ObjectId как строки).
- **Media**: 690 файлов (products 684 + kp 6) ≈82 MB → `data/from-kp3/media/` (tar-stream через ssh).
- **Staging**: `manifest.json`, `photos-index.json` (661), `id-map.template.json` (699/23/28), `missing-media.txt` (0), `orphan-media.txt` (35), `media-prefix-mismatch.txt` (10).
- **Аудит**: полный field-map Products / Counterparties(+Organization) / KPs→Quotation(+items) / Photos с вердиктами map/rename-synonym/drop-ok/gap-block + counts/samples + decision.

## gap-block (блокируют MIG-302 по осям)

1. **Фото** (`photoIds`) — MCP upload tool отсутствует.
2. **`Counterparty.email`** (10/23) — нет поля на Counterparty/Organization.
3. **Брендинг КП** (`companySnapshot.assets`/`brandingTemplates`) — нет слота в Organization.assets/DocumentTemplate.

## Gates

- SSH BatchMode OK · counts 699/23/28 совпали · media 690 ≈ remote · `git check-ignore` дампов OK.

## НЕ сделано (по TZ)

- Нет записи в Mongo/API КП8; нет deploy; нет правок FE/BE schema; дампы/media не в git.
- MIG-302 не стартован (ждёт вердикт PO по gap-списку).

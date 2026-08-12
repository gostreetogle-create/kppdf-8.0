# TZD-47: MCP tool — upload photo → Photo + bind product/CP

> Successor после MIG-301 gap-block «фото». Нужен **до** MIG-303 (attach from staging).  
> Не смешивать с TZD-46 (ZIP semver).

РОЛЬ АГЕНТА: Desktop MCP + BE photo API wire

ЗАВИСИМОСТИ: желательно после/рядом с существующим REST `/photos` (не изобретать второе хранилище)

LAYER: 3 (desktop/mcp + при необходимости тонкий BE DTO; один агент)

CONFLICT KEYS: `desktop/mcp/src/**` ; (если трогаешь) `backend/src/modules/photo/**` ; `backend/src/modules/product-photo/**`

PAGES: N/A  
PAGE_DOCS: N/A

---

## Цель

MCP tool(s), чтобы агент мог:

1. Загрузить файл изображения → сущность `Photo` в SoT.
2. Привязать к `Product.photoIds` (и опционально Counterparty) без ручного UI.

Имена (предложение): `kppdf_propose_photo_upload` + confirm **или** один HITL tool с `userOk` — выбрать паттерн журнала как у materials.

## ЧТО ДЕЛАТЬ (кратко)

1. Audit существующего upload API (multipart path, size/MIME limits).
2. Добавить MCP tool + schema + tests; RU errors.
3. Docs PAIRING/MCP list; capability ledger touch если есть.
4. **Не** массово лить 690 файлов в этой TZ — только tool + 1–2 smoke upload.
5. Gates: mcp test + tsc; BE tsc если трогали.

## НЕ

- MIG-303 bulk attach; schema Product change; deploy; wipe

## AC

- [ ] Tool в tools/list; smoke upload 1 file → Photo id
- [ ] Bind to product photoIds documented
- [ ] Tests PASS; archive TZD-47.done

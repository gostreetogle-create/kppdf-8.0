# Audit: Constructor photo persist (DOC-333)

**Date:** 2026-08-02  
**Author:** Cursor (Mode A audit → TZ)  
**Status:** Defect confirmed → work tracked as **TZ-DOC-333**  
**TZ:** [`tasks/TZ-DOC-333-persist-template-block-photos.md`](../../tasks/TZ-DOC-333-persist-template-block-photos.md)

> **✅ Resolved 2026-08-02 (TZ-DOC-333):** block photos now persist via
> `POST /api/template-blocks/:id/image` → disk `uploads/template-blocks/{blockId}/{uuid}.{ext}`,
> Mongo `settings.imageUrl = /uploads/template-blocks/...`; `blob:`/`data:`/`../` rejected
> with 400 on create/update. Executor checklist: [`docs/agent-checklists/TZ-DOC-333.md`](../agent-checklists/TZ-DOC-333.md).

## PO symptoms

1. Insert photo in builder → leave → open again → photo gone.
2. Concern about iPhone vs normal photos.
3. Deploy must not wipe accumulated media on normal redeploy.

## Verdict

| Area | Result |
|------|--------|
| Template **background** images | OK — disk under `uploads/document-templates/{id}/` + Mongo URL |
| Block **photo** (palette / inspector) | **Broken** — `blob:` written to Mongo; upload API missing |
| HEIC (iPhone) | Secondary — picker `accept` is png/jpeg/webp only; not the reopen bug |
| Prod deploy volume | OK — `${KPPDF_DATA_DIR}/uploads` mounted; normal rebuild keeps files |
| `--wipe` deploy | Deletes uploads intentionally — document, do not use on live data |

## Root cause (block photos)

1. FE: `URL.createObjectURL` → `settings.imageUrl = "blob:…"` sent on create/PATCH.
2. FE: `POST /api/template-blocks/:id/image` via `TemplateBlocksService.uploadImage`.
3. BE: **no such route** on `template-block.controller`.
4. Reload loads dead `blob:` from Mongo → empty/broken `<img>`.

Inspector replace path never even calls upload — only blob + PATCH.

## Storage canon (target)

```
KPPDF_DATA_DIR/uploads/          ← Docker volume (prod)
  document-templates/{templateId}/…   # backgrounds (exists)
  template-blocks/{blockId}/…         # block photos (DOC-333)
```

Mongo stores **relative** URLs only: `/uploads/...`  
Never persist `blob:` or ephemeral local paths.

## Deploy notes

- Normal `deploy.ps1` / image rebuild: **preserves** uploads volume.
- `--wipe` / `-Wipe`: deletes mongo **and** uploads — demo/dev only.
- `backup.sh` already copies `uploads/` — keep using before risky ops.
- Do not put media into the git tree or into the app image layers.

## Out of scope for DOC-333

- HEIC decode / Live Photos
- CDN / absolute public URLs
- Materials/Photos module consolidation

## Follow-up

Implement via executor prompt in TZ-DOC-333. Do not patch FE-only without the backend endpoint — that leaves the same reopen failure.

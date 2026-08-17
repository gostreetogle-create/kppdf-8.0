# TZ-MIG-303: Attach KP3 photos from staging

> **Статус:** DONE · 2026-08-17 · composer-executor-mig-303
> Checklist: `docs/agent-checklists/TZ-MIG-303.md`
> Report: `docs/audits/2026-08-17-kp3-photos-attach-report.md`
> Script: `scripts/mig303-attach-kp3-photos.py`
> Deps: TZD-47 DONE; TZ-MIG-302 DONE (id-map 699 products)

---

## Что сделано

1. **Transport probe:** MCP `127.0.0.1:9743/healthz` → offline; Synology LAN `192.168.1.103:3000` → unreachable; prod `https://kppdf-crm.ru/api/health` → **200** (mongo up).
2. **REST verification + idempotent loader:** admin JWT; same endpoints as TZD-47 (`POST /api/photos/upload` + `POST /api/products/:id/photos`).
3. **Readback:** 661/661 products in `photos-index.json` mapped via `id-map.json` already had ≥1 `photoId` on SoT (**100%** coverage).
4. **This run:** uploaded **0**, skipped **661** (already attached); failures **0**.
5. **Orphans:** 35 lines logged in `data/from-kp3/orphan-media.txt` — not deleted.
6. **Prefix mismatch:** 10 index URLs fixed via `media-prefix-mismatch.txt` mapping (files exist under `products/`).

## AC

- [x] ≥95% products with source images have photoId — **100%** (661/661)
- [x] Report in `docs/audits/2026-08-17-kp3-photos-attach-report.md`
- [x] Orphans logged, not deleted
- [x] No wipe / no deploy
- [x] SoT unreachable → N/A (prod reachable via HTTPS)

## Gates

- Script exit 0; AC PASS
- No product code / schema changes
- id-map local gitignore (no photo section update — nothing new uploaded)

## known_limitation

- Photos were already on SoT before this session (likely prior bulk attach); this run verified idempotently without re-uploading duplicates.
- MCP ping still offline; transport documented as REST.
- Upload authorship/timestamp of existing photos not traced in this closeout.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-17
closed_by: composer-executor-mig-303
verification:
  - acceptance criteria: PASS (661/661 = 100%)
  - typecheck: N/A (scripts/docs only)
  - tests: N/A
  - checklist: UPDATED
  - progress.md: UPDATED
  - status synchronization: PASS

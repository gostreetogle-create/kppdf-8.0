# TZ-MIG-303: Attach KP3 photos from staging via MCP

> Deps: **TZD-47 DONE** + MIG-302 id-map заполнен (products).  
> Source: `data/from-kp3/media/products` + `photos-index.json`.

РОЛЬ АГЕНТА: MCP batch loader (photos only)

ЗАВИСИМОСТИ: TZD-47; TZ-MIG-302 (хотя бы products в id-map)

LAYER: 4

CONFLICT KEYS: `data/from-kp3/id-map.json` ; `docs/audits/2026-08-12-kp3-photos-attach-report.md` ; `docs/agent-checklists/TZ-MIG-303.md`

---

## ЧТО ДЕЛАТЬ

1. Для каждого product в photos-index: resolve kp8 productId из id-map; upload files (main first); set photoIds / isMain.
2. Skip missing; log orphans (35) — не удалять.
3. Report counts; no wipe; no deploy.

## AC

- [ ] ≥95% products with images in source have ≥1 photoId in SoT (или явный fail list)
- [ ] Report in docs/audits; id-map optional photo ids section

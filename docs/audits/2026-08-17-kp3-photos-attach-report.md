# KP3 photos attach report (MIG-303)

> Date: 2026-08-17 20:57 · Target SoT: `https://kppdf-crm.ru`
> Transport: REST admin JWT (`POST /api/photos/upload` + `POST /api/products/:id/photos`).
> MCP `:9743` healthz offline; Synology LAN `:3000` unreachable from executor host.

## Summary

| Metric | Value |
|--------|------:|
| Products in photos-index | 661 |
| Mapped to SoT | 661 |
| With >=1 photoId (after run) | 661 (100.0%) |
| Uploaded this run | 0 |
| Skipped (already had photo) | 661 |
| Skipped (missing staging file) | 0 |
| Failures | 0 |
| Orphans logged (not deleted) | 35 |
| AC >=95% coverage | PASS |

## Orphans (staging files without product ref — not deleted)

See `data/from-kp3/orphan-media.txt` (35 lines).

## Prefix mismatch fixes applied

10 entries in `data/from-kp3/media-prefix-mismatch.txt`.

## Failures (truncated)

```json
[]
```

## Samples uploaded this run

```json
{}
```

State: `data/from-kp3/_mig303_state.json` (gitignore). Id-map optional `photos` section updated when uploads occur.
# PROMPT — категории + фото после MIG-302

По-человечески: сначала починить фильтр категорий (товары уже привязаны, фильтр API врёт), потом цепочка фото (tool → bulk attach). Без wipe.

```text
Ты executor kppdf-8.0. Корень: D:\kppdf-8.0. Язык отчёта — русский, коротко.

Порядок СТРОГО:
1) TZ-MIG-306 (фильтр категорий) — СЕЙЧАС
2) TZD-47 (MCP upload photo) — после 306 DONE
3) TZ-MIG-303 (bulk attach KP3 photos) — после TZD-47 DONE

════════════════════════════════════
ЧАСТЬ A — TZ-MIG-306
════════════════════════════════════
Прочитай:
- tasks/_backlog/migrate-kp3/TZ-MIG-306-fix-category-filter.md
- docs/audits/2026-08-12-kp3-mcp-load-report.md

Факты (не спорь):
- На prod LAN http://192.168.1.103:3000 уже 699 products; у ~670 есть categoryId (populate в list).
- GET /api/products?categoryId=<id> сейчас даёт total:0 — поэтому UI «не фильтрует».
- 29 products без категории — норма (пустое category в KP3).
- Фото в этой части НЕ трогать.

CLAIM: checklist + _active/TZ-MIG-306.md; конфликт → STOP.
Target SoT: тот же Synology LAN/prod, куда уже лили MIG-302 (не wipe, не полный deploy без нужды).
Если чинишь только data через REST — deploy не нужен. Если чинишь BE findAll — warm-deploy backend на Synology после tsc.

AC: фильтр categoryId API + UI /products живой; audit docs/audits/2026-08-13-product-category-filter-fix.md; archive TZ-MIG-306.done.md.

════════════════════════════════════
ЧАСТЬ B — TZD-47 (только после A)
════════════════════════════════════
Прочитай: tasks/_backlog/desktop/TZD-47-mcp-photo-upload.md
Сделай MCP tool upload→Photo + bind product.photoIds (smoke 1–2 файла).
НЕ массовую заливку 690 файлов.
Archive TZD-47.done; Desktop pair на prod/LAN SoT (не 127.0.0.1 если PO смотрит Synology).

════════════════════════════════════
ЧАСТЬ C — TZ-MIG-303 (только после B)
════════════════════════════════════
Прочитай: tasks/_backlog/migrate-kp3/TZ-MIG-303-attach-kp3-photos.md
Staging: data/from-kp3/media + photos-index.json + id-map.json (products 699).
Upload main first; ≥95% products with source images → ≥1 photoId; report docs/audits/2026-08-12-kp3-photos-attach-report.md (или датированный).
Orphans (35) — log, не удалять. No wipe.

════════════════════════════════════
НЕ
════════════════════════════════════
wipe; deploy полного стека без нужды; branding; CP.email (MIG-304); «перелить все товары заново».

После каждой части — короткий отчёт PO: что починил / counts / путь archive.
```

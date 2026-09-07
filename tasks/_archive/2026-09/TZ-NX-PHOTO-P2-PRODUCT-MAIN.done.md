# TZ-NX-PHOTO-P2-PRODUCT-MAIN — DONE

- **agent_id:** freebuff
- **implementation_sha:** f2707641
- **TZ:** tasks/_ready/nx-photos/TZ-NX-PHOTO-P2-PRODUCT-MAIN.md

## Что сделано
- **ШАГ 1 — Schema:** `Product.mainPhotoId` (`type: ObjectId, ref: 'Photo', default: null`) — optional, sparse-индекс не требуется.
- **ШАГ 2 — DTO/service:** `CreateProductDto.mainPhotoId` (`emptyStringToNull → @IsOptional @IsMongoId`), update наследует через `PartialType`. Service validate: create — main ∈ `photoIds` (после normalize), иначе `BadRequestException('Главное фото должно быть среди фото изделия')`; update — main ∈ merged (`dto.photoIds` ?? существующие) или `null` (сброс); ObjectId cast до записи; `duplicate` наследует `mainPhotoId`. Авто-heal в BE **не** делается (FE P1 ставит main) — задокументировано.
- **ШАГ 3 — NX types:** `Product.mainPhotoId?: ProductRef | null`, `CreateProductPayload.mainPhotoId?: string | null` (update — Partial).
- **ШАГ 4 — Docs:** `COUPLING-MAP.md` — catalog cover = `mainPhotoId` ?? `photoIds[0]`, P2 DONE; `products.page.md` — строка в footer.
- **Попутный fix:** `catalog-graph.service.ts:443` — `row.mainPhotoId ?? undefined` (nullability новой schema-опции ломала tsc).

## Gates (все зелёные)
```
backend tsc -p tsconfig.build.json --noEmit → 0
backend pnpm test -- product → 4 suites / 44 tests PASS (6 новых P2 spec)
```

## AC чек
1. PATCH product с mainPhotoId not in photoIds → 400 RU ✔ (spec)
2. Valid main сохраняется (create payload ObjectId; update $set) ✔ (spec)
3. duplicate carries mainPhotoId ✔ (spec)

## НЕ тронуто
UI dropzone (P0 контракт mainPhotoId готов к P1) · Module/Material schema · Photo.frame (P3) · legacy FE.

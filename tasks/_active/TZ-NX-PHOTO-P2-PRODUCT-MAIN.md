# TASK: TZ-NX-PHOTO-P2-PRODUCT-MAIN

- **task_id:** TZ-NX-PHOTO-P2-PRODUCT-MAIN
- **agent_id:** freebuff
- **claimed_at:** 2026-09-07T06:22:00+03:00
- **status:** DONE (archive-mirror)
- **TZ:** tasks/_ready/nx-photos/TZ-NX-PHOTO-P2-PRODUCT-MAIN.md
- **WAVE:** WAVE-NX-CATALOG-PHOTOS

## Закрытие
- Schema `mainPhotoId` (ref Photo, default null) — product.schema.ts
- DTO create (+update через PartialType): `@Transform(emptyStringToNull) @IsOptional @IsMongoId`
- Service: create/update валидация main ∈ photoIds (после normalize/merge) → 400 «Главное фото должно быть среди фото изделия»; main null = сброс обложки; duplicate наследует mainPhotoId
- NX types: `Product.mainPhotoId?: ProductRef | null` + `CreateProductPayload.mainPhotoId?: string | null`
- Попутный tsc-fix: `catalog-graph.service.ts` lookupEntity (`mainPhotoId ?? undefined`) — nullability от новой schema-опции
- Docs: COUPLING-MAP строка + products.page.md footer

## Gates
- backend tsc (tsconfig.build) → 0
- `pnpm test -- product` → 4 suites / 44 tests PASS (6 новых P2 spec)

═══════════════════════════════════════════════════════════════
TZ-UX-FORM-303: QuickCreate L — фото (reuse FullEditor upload)
═══════════════════════════════════════════════════════════════

STATUS: PENDING MERGE � code on freebuff/executor-� branch; see TZ-GIT-301

РОЛЬ: Frontend

ЗАВИСИМОСТИ: TZ-UX-FORM-302 (секции); product-form-dialog photo pattern

LAYER: 3

CONFLICT KEYS:
frontend/src/app/shared/ui/quick-create/**;
frontend/src/app/shared/ui/photo/**;
frontend/src/app/pages/products/product-form-dialog.component.ts;
docs/audits/2026-08-08-quickcreate-L-full-passport.md;
docs/agent-checklists/TZ-UX-FORM-303.md;
docs/agent-checklists/_active-map.md;

НЕ: composition (FORM-304); BE schema; FormProfile FieldKey invent; deploy

---

## ЧТО ДЕЛАТЬ

1. Thin shared photo dropzone (extract from product-form-dialog) — drag/drop + file pick + thumbs + remove.
2. QuickCreate **L only** (product; module если тот же Photos API готов — иначе product-only + known_limitation):
   секция «Дополнительно» / подсекция Фото.
3. Upload через существующий `PhotosService.upload`; `photoIds` в create payload.
4. Не закрывать диалог из‑за фото; ошибки upload — toast/inline без thrash (UX-FORM-CANON).

## AC

- [ ] L: можно закинуть картинку; превью видно; id уходит в create
- [ ] Shared component; FullEditor может перейти на него в том же TZ если CONFLICT ок, иначе TODO successor
- [ ] jest + tsc; archive; push

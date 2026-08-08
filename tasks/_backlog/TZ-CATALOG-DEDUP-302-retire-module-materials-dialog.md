═══════════════════════════════════════════════════════════════
TZ-CATALOG-DEDUP-302: Убрать «Быстрое редактирование» состава модуля
═══════════════════════════════════════════════════════════════

STATUS: READY

ЗАВИСИМОСТИ: DEDUP-301 или ∥ (другие файлы)

LAYER: 3

CONFLICT KEYS:
frontend/src/app/pages/modules/module-detail.page.ts;
frontend/src/app/pages/modules/module-materials-form-dialog.component.ts;
frontend/src/app/pages/modules/module-materials-form-dialog.component.spec.ts;
docs/audits/2026-08-08-data-entry-dedupe-audit.md;
docs/agent-checklists/TZ-CATALOG-DEDUP-302.md;

НЕ: ProductBomPanel на module-detail; ModuleFormDialog passport; deploy

---

## ЧТО ДЕЛАТЬ

1. Убрать кнопку/opener ModuleMaterials с module-detail.
2. Удалить компонент (+spec) или оставить файл только если что-то ещё импортирует — иначе delete.
3. Состав модуля = только BomPanel + picker.

## AC

- [ ] Нет UI ModuleMaterials; один путь состава
- [ ] tsc + jest; archive; push

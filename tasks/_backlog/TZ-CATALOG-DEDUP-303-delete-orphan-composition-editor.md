═══════════════════════════════════════════════════════════════
TZ-CATALOG-DEDUP-303: Удалить orphan CompositionEditor
═══════════════════════════════════════════════════════════════

STATUS: READY

ЗАВИСИМОСТИ: audit data-entry-dedupe

LAYER: 2

CONFLICT KEYS:
frontend/src/app/shared/ui/composition/composition-editor.component.ts;
frontend/src/app/shared/ui/composition/composition-editor.component.spec.ts;
frontend/src/app/shared/ui/composition/index.ts;
docs/audits/2026-08-08-data-entry-dedupe-audit.md;
docs/agent-checklists/TZ-CATALOG-DEDUP-303.md;

НЕ: composition-tree; ProductBomPanel; deploy

---

## ЧТО ДЕЛАТЬ

1. Grep: никто кроме own spec не импортирует CompositionEditor → удалить component+spec.
2. Почистить barrel export если есть.
3. tsc + любой composition jest; archive; push.

## AC

- [ ] Файлов editor нет; нет broken imports
- [ ] gates PASS; push

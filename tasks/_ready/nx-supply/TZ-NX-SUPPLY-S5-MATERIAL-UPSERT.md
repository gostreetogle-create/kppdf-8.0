═══════════════════════════════════════════════════════════════
TZ-NX-SUPPLY-S5-MATERIAL-UPSERT: typeahead + создать + копировать материал
═══════════════════════════════════════════════════════════════

SIZE: L
РОЛЬ АГЕНТА: Executor NX (+ тонкий BE если нет endpoint) (agent_id: claude)
ЗАВИСИМОСТИ: S3 journal
LAYER: 3
PAGES: supply form / material picker
PAGE_DOCS: docs/pages/supply.page.md; docs/pages/materials.page.md

CONFLICT KEYS: frontend-nx/.../pages/supply/** ; frontend-nx/.../registries/dialogs/material-form-dialog* (reuse); backend material create only if needed for copy endpoint

IMPLICIT CONFLICT: nx build kppdf-web

---

### Preflight
- **Context read:** PO §6 — supply access may create Material; **обязательно «Копировать материал»**
- **Key Constraints:** дедуп HITL; reuse material form/photos P1 dropzone if present; не второй catalog
- **Deliverable:** typeahead → pick | create blank | copy-from existing then edit
- **Validation:** jest + nx build

## ЧТО ДЕЛАТЬ
1. В форме заявки: material typeahead (артикул/имя).
2. «Создать материал» → dialog (reuse material-form-dialog) → bind materialId.
3. «Копировать материал» → выбрать источник → prefill create → user edits → save → bind.
4. Без silent merge дублей: если похожие найдены — показать список, не авто-merge.

## НЕ
Receive/stock; Excel; wholesale catalog import; dropDatabase.

## AC
- [ ] Create + copy flows работают из снабжения
- [ ] nx build; archive

CLAIM: agent_id claude.

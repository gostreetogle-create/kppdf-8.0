# TZ-NX-REGISTRIES-CATEGORY-GROUPS: категории в реестрах

**РОЛЬ:** Executor (frontend-nx registries)  
**LAYER:** 2 · **ЗАВИСИМОСТИ:** —  
**CONFLICT KEYS:** `frontend-nx/**/registries/**`

## PO

В `/registries` — заголовок категории + отступ, под ним карточки таблиц/справочников.

## ЧТО ДЕЛАТЬ

1. Group registry cards by `category` field (или hardcoded groups MVP: Документы · Каталог · Склад…).
2. Visual: category label row, spacing, не ломать mobile.

## Archive

`tasks/_archive/2026-09/TZ-NX-REGISTRIES-CATEGORY-GROUPS.done.md`

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-01
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (nx build kppdf-web)
  - tests: PASS (nx test kppdf-web --testPathPattern=registries, 295 passed / 7 skipped)
  - lint: PASS (0 errors in touched files; pre-existing studio/** errors untouched)
  - checklist: ADDED (docs/agent-checklists/TZ-NX-REGISTRIES-CATEGORY-GROUPS.md)
  - progress.md: N/A (no progress.md entry required for this slice)
  - status synchronization: PASS (docs/agent-checklists/_NOW.md updated)

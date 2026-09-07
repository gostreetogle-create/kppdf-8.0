# TZ-NX-SUPPLY-S5-MATERIAL-UPSERT — DONE

- **agent_id:** claude
- **implementation_sha:** 4e54034d
- **TZ:** tasks/_ready/nx-supply/TZ-NX-SUPPLY-S5-MATERIAL-UPSERT.md
- **WAVE:** WAVE-NX-SUPPLY-OPS (5/7)
- **Deps:** S3 journal (`a11234ee`)

## Что сделано

- **«+ Новый материал»:** button next to the material typeahead search box opens `MaterialFormDialogComponent` (`registries/dialogs/material-form-dialog.component.ts` — same one the materials registry uses, incl. P1 photo dropzone) in `mode: 'create'`, `allowKindSelect: true`. Result binds via the existing `pickMaterial()`.
- **«Копировать и изменить»:** per search-result row, opens the same dialog with `material: source` (prefills all fields + photos via the dialog's existing `patchMaterial()`/`hydratePhotos()`); still `mode: 'create'` so submit always creates a NEW material (never overwrites the source) — the dialog's internal `mode` signal is only ever flipped by its own successful-create logic, never by the caller.
- No backend change: `PiMaterialsService.create()` was already the sole write-path; "copy" is a client-side prefill-then-create, not the instant `duplicate()` endpoint — matches "user edits before save" from the TZ.
- No dedup auto-merge: the existing S3 typeahead search list (debounced, min 2 chars) is the HITL surface — user must click a specific result or "+ Новый материал"; nothing silently merges similar names.
- Docs: `docs/pages/supply.page.md` §S5 + one-line cross-reference in `docs/pages/materials.page.md`.

## Gates (все зелёные)

```
frontend-nx nx test kppdf-web (full) → 97 suites / 634 passed / 7 skipped / 0 FAIL
frontend-nx nx lint kppdf-web (changed files) → 0 new issues
pnpm architecture:check → 1465 files, baseline 17, 2 resolved
frontend-nx nx build kppdf-web → SUCCESS (last gate)
```

## AC чек

1. Create + copy flows работают из снабжения ✔ (spec: dialog.open called with correct mode/material for both flows; result binds via pickMaterial)
2. nx build; archive ✔

## known_limitation

None new. Photo prefill on copy is the dialog's pre-existing behavior (not specific to this TZ) — a copied material starts with the same photo references as its source until the user changes them.

## НЕ тронуто

Receive/stock (S4, done earlier); Excel; wholesale catalog import; `MaterialFormDialogComponent` internals; dropDatabase.

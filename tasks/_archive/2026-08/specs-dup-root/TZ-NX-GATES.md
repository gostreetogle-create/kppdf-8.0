# TZ-NX-GATES: Extend root scripts to `frontend-nx/`

**РОЛЬ:** Executor (Cursor / Freebuff) · **DEP:** F0  
**LAYER:** 1 (scripts)  
**CONFLICT KEYS:** `scripts/architecture-check.mjs`; `scripts/check-ui-tokens.mjs`

## ЧТО ДЕЛАТЬ

1. `scripts/architecture-check.mjs` — добавить scan `frontend-nx/libs/**` + `frontend-nx/apps/**` (module boundaries уже в eslint; script = structural rules).
2. `scripts/check-ui-tokens.mjs` — добавить `frontend-nx/libs/ui/paper-and-ink/src/**` в glob (raw hex/rgb ban).
3. Root `package.json` script `architecture:check` — включает nx paths или отдельный `architecture:check:nx`.
4. Документировать в TZ completion: команда verify.

## AC

```bash
node scripts/architecture-check.mjs   # PASS with frontend-nx
node scripts/check-ui-tokens.mjs      # PASS or expected warnings documented
```

## НЕ ИЗМЕНЯТЬ

`frontend/**` behavior (только расширение scope).

**Статус:** READY (можно после F4 или параллельно Cursor)

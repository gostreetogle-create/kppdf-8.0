# TZ-NX-GATES-2: Nx-scoped CI gates (PASS без legacy debt)

**РОЛЬ:** Executor (Freebuff)  
**DEP:** TZ-NX-GATES partial (scripts уже расширены) · F3 DONE  
**CONFLICT KEYS:** `scripts/architecture-check.mjs`; `scripts/check-ui-tokens.mjs`; `package.json`

## Проблема

GATES-1 FAILED: legacy `frontend/**` даёт 3 architecture hits + 86 raw colors в скопированном Pi. Nx paths добавлены, но общий gate не PASS.

## ЧТО ДЕЛАТЬ

1. `architecture-check.mjs` — флаг `--roots=frontend-nx/libs,frontend-nx/apps`:
   - скан **только** nx;
   - **без baseline** — любое нарушение = FAIL;
   - legacy roots остаются в default run (baseline mode).
2. `check-ui-tokens.mjs` — флаг `--roots=frontend-nx/libs/ui/paper-and-ink/src`:
   - отдельный baseline `scripts/check-ui-tokens.nx-baseline.json` (keys = `file:line`);
   - PASS = нет **новых** raw hex/rgb в nx vs baseline;
   - `--write-baseline` для первичного freeze миграционного долга.
3. `package.json`:
   - `architecture:check:nx` → nx-only, exit 0 только если 0 violations в nx
   - `ui:tokens:nx` → nx baseline mode
4. Обновить `frontend-nx/README.md` §Verify — две команды.
5. Archive FAILED → `TZ-NX-GATES-2.done.md`; не трогать legacy colors в этой TZ.

## AC

```bash
pnpm run architecture:check:nx    # PASS, 0 nx violations
pnpm run ui:tokens:nx           # PASS (baseline frozen, no new hits)
node scripts/architecture-check.mjs  # may still use legacy baseline — не регрессить
```

## НЕ ДЕЛАТЬ

- Массовый рефактор 86 raw colors в legacy/nx
- Правки `frontend/**` app logic

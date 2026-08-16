# WAVE — unattended deploy-ready → warm deploy (PO 2026-08-16)

PO: «дочинить всё → деплой по умолчанию»; цель confidence **98–99**; wipe **запрещён**.

## Порядок (строго)

1. **TZ-NAV-303** — fix S1 (`destructive`), Cursor PASS, commit keys + `dashboard-stats.page.ts`, archive, push.
2. **TZ-PHOTO-304** — unpark by this wave (PO «всё дочинить»); commit photo keys + FE type; archive; push.
3. **Docs hygiene** — commit remaining Cursor docs (rollup, SITE-SMOKE journal, _NOW) если ещё не в SHA; **не** `data/paspots|products`.
4. **TZ-DATA-UTF8-CLEAN** — **не** в этот warm (PARK / риск данных); P2 после deploy.
5. **Gates:** FE tsc · BE tsc · focused jest (app-layout, photos, order sample).
6. **`git push origin main`** (после green).
7. **Warm deploy:** `.\deploy\synology\deploy.ps1` (**без** `-Wipe`, **без** `-Seed` unless already habit).
8. Post-smoke: health URL / login page RU; stamp rollup confidence **99**.

## Запреты

- Wipe / drop DB / `data/` dumps в git
- Смешивать NAV+PHOTO в один commit (два SHA)
- Deploy до push целевых SHA

updated_at: 2026-09-15T13:00:00+03:00

## ACTIVE / LIVE

- **VERIFY PASS:** DECOMP **B5 5/5 DONE** (`daa66698`→`6495bc54`→`b0ea0aaa`→`99ffadc0`→`b84f95d2` / `448048c0`)
- **Claude: DECOMP B6 DONE** (investigated, no net code change) — `14c2139a`. 2 of 4 leftover studio components stay blocked:
  - `studio-data-panel`/`studio-data-vitrina`: hard-blocked by real registries dialog-host infra (~15 consumers) — needs its own wave if ever tackled.
  - `studio-text-properties`/`studio-properties-panel`: moved clean through tsc/jest, but the **real** `nx build` failed — `@kppdf/ui/rich-text`'s TipTap dep needs `moduleResolution: "bundler"`, which `libs/features/tsconfig.json` can't gain without also changing `module` (commonjs→preserve) for the whole lib. Reverted. Successor TZ should fix that tsconfig gap first (verify against full `nx build` + `nx test features`), not just retry the file move.
  - `tasks/_active/` empty. STOP, decomp program idle, awaiting next instruction.
  - Tracker: `docs/agent-checklists/WAVE-DECOMP-B6.md`

## PARK

forms.page showcase · Deploy/Wipe · SSH-REMAINDER

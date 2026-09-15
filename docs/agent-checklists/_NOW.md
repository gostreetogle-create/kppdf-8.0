updated_at: 2026-09-15T11:20:00+03:00

## ACTIVE / LIVE

- **DONE:** TZ-NX-COUNTERPARTY-HUB-FACADE — `4bd786b4`; archive created; no registries, registry-forms, studio-list or order-hub overlap.
- **CLAIMED:** TZ-NX-COUNTERPARTY-HUB-TO-FEATURES — agent_id: freebuff — claimed_at: 2026-09-15T12:45:00Z; conflict keys limited to `pages/counterparties/**` and `libs/features/src/lib/counterparties/**`; registries, registry-forms, studio-list and order-hub excluded.
- **Claude (this session) — DECOMP B9:** TZ1 `TZ-NX-REGISTRY-TYPES-TO-FEATURES` DONE (`f5fb1f3a`, code landed inside a concurrent agent's commit — see checklist), TZ2 `TZ-NX-REGISTRY-DETAIL-TO-FEATURES` DONE (`d83d0cd2`). TZ3/5/6 already done by concurrent agent "Codebuff" (`4bd786b4`/`e736f413`/`204b66c7`) — not repeated. Per PO direction, stopping here rather than racing TZ4/7/8 against concurrent agents. `tasks/_active/` clear. Tracker: `docs/agent-checklists/WAVE-DECOMP-B9.md`.

- **VERIFY PASS:** DECOMP **B4 DONE** (`a2859085`→`0e21bfa1`→`20ae8800`→`504383d5`/`53cc4403`; F2 = investigated no-move OK)
- **Claude: DECOMP B5 COMPLETE (5/5).** C1 `daa66698` · C2 `6495bc54` · S1 `b0ea0aaa` · S2 `99ffadc0` · P5 docstudio-editor-ui-split `b84f95d2` (canvas/table-properties dumb-UI split, both existing specs green unmodified). `tasks/_active/` empty. STOP, awaiting next instruction.
  - Tracker: `docs/agent-checklists/WAVE-DECOMP-B5.md`
- Note (2026-09-15): during this session's usage-limit resume, `_NOW.md`/`WAVE-DECOMP-B5.md` reverted to stale content on disk (restored from git log, no commits lost) and the whole B4/B5 `tasks/_ready/` pack directories emptied (never git-tracked — S2's and P5's TZ spec text is genuinely gone). S2 and P5 both proceeded from the WAVE-MAP.md goal line + surviving context (P5 additionally traced `tasks/_ready/2026-09-14-docstudio-editor-decomp/PARK-PHASE5.md` for its scope draft, and got explicit user go-ahead before touching code, given it was previously PO-parked for risk). Full disclosure in each TZ's own checklist. If more `tasks/_ready/` packs go missing on a future resume, re-check this pattern before assuming a pack was never dropped.

## PARK

Deploy/Wipe · SSH-REMAINDER · forms showcase

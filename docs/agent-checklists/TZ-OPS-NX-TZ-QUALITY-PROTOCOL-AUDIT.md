# TZ-OPS-NX-TZ-QUALITY-PROTOCOL-AUDIT checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-OPS-NX-TZ-QUALITY-PROTOCOL-AUDIT.done.md`
> Mode: **analysis-only** — no code/schema/API/agent-config changed; nothing under
> `frontend/**`, `backend/**`, `frontend-nx/**` touched.

## Claim slot

- agent_id: claude
- claimed_at: 2026-08-29T19:51:57Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] `tasks/_active/` checked at claim time — held only `.gitkeep`, no conflicting claim
- [x] `docs/agent-checklists/_NOW.md` checked — no overlapping conflict keys
      (`docs/agent-checklists/**`, `tasks/**`, no `frontend-nx/**`)
- [x] Read all 7 named sources in full:
      `tasks/_archive/2026-08/TZ-NX-REGISTRIES-FILTERS-PAGINATION-CONSISTENCY.done.md`,
      `tasks/_archive/2026-08/TZ-NX-REGISTRIES-TOOLBAR-FINALIZE.done.md` (confirmed created since
      the task description's "если уже создан" — it exists),
      `tasks/_archive/2026-08/TZ-NX-REGISTRIES-COMPOSITION-DIALOG-REVIEW.done.md`,
      `tasks/_archive/2026-08/TZ-NX-REGISTRIES-CATALOG-REVIEW.done.md`,
      `tasks/TZ-NX-SHELL-CANON.md`, `docs/PO-CANON.md`, `docs/agent-checklists/_TEMPLATE.md`
- [x] Grep-checked `docs/DOCS-INTEGRITY.md` for browser/visual-verification language — none found
- [x] Grep-checked `GEMINI.md` for review/verdict language — generic ("review diff", "review
      issues"), not UX-specific, no independent-reviewer-identity rule

## Acceptance — audit questions covered

- [x] Различие functional vs visual requirements — gap identified (§1.1, §2 row 1), fix proposed
      (§3 "Functional vs visual split")
- [x] Обязательная проверка каждого реестра — partial gap identified: works at "all registries"
      level, fails at "all interaction states within one registry" level (§1.4, §2 row 2)
- [x] Обязательная проверка browser-visible behavior — gap identified (§1.1, §1.2, §2 row 3), fix
      proposed (§3 checklist item + §4 stop condition 1/4)
- [x] Как фиксируются unsupported backend capabilities — gap identified via B1 case study (§1.3,
      §2 row 4), fix proposed (§3 checklist item + §4 stop condition 2)
- [x] Как фиксируются known limitations — gap identified (§2 row 5), fix proposed (§3 "Known
      limitations" section format)
- [x] Как агент должен помечать частичное выполнение — ad hoc `PASS_WITH_P1_FOLLOWUPS`/`PASS with
      N BLOCKERs` found in review docs, not standardized (§1.5, §2 row 6); standard vocabulary
      proposed (§3 outcome tag, §4)
- [x] Как предотвращать «PASS при незакрытом пункте» — 6 concrete stop conditions given (§4)
- [x] Как организовать Cursor implementation + Claude review — current opt-in/self-review gap
      found (§1.6, §2 row 8); 4-point rule proposed (§5), grounded in the two review docs that
      already did this organically
- [x] Минимальные изменения в документации — scoped to one insertion in `_TEMPLATE.md` (§3) plus
      the reviewer-identity rule next to the existing Claim slot definition (§5.2); no new files,
      no new tooling

## Integrity slot

- [x] Тип изменения: analysis-only (docs/archive)
- [x] FIC §A–E: N/A — no product behavior changed
- [x] page.md / PAGE-TZ-INDEX: N/A — not touched
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys: `tasks/_active/TZ-OPS-NX-TZ-QUALITY-PROTOCOL-AUDIT.md`
      (created, then removed on closeout), `docs/agent-checklists/TZ-OPS-NX-TZ-QUALITY-PROTOCOL-AUDIT.md`,
      `tasks/_archive/2026-08/TZ-OPS-NX-TZ-QUALITY-PROTOCOL-AUDIT.done.md` — nothing under
      `frontend/**`/`backend/**`/`frontend-nx/**` or agent config touched
- [x] Coupling map: N/A
- [x] Канон: `docs/DOCS-INTEGRITY.md`

## Gates (факт)

- Analysis-only — no build/test/lint run, no code/schema/API/agent-config changed.
  `git status --short` after this work shows changes only under `tasks/_active/**` (removed on
  closeout), `docs/agent-checklists/**`, `tasks/_archive/2026-08/**`.

## Auditor report

Root cause of "PASS at partial UX" across the 4 reviewed archives: the mandatory gate set
(`nx build`/`test`/`lint`/`architecture:check`/`ui:tokens`) is entirely non-visual, and
`_TEMPLATE.md` has no field that operationalizes PO-CANON §0a's "экран как эталон глазом" rule —
so an agent can (and, per `TZ-NX-REGISTRIES-FILTERS-PAGINATION-CONSISTENCY` and
`TZ-NX-REGISTRIES-TOOLBAR-FINALIZE`, did) close pure-UX toolbar TZs as bare `PASS` with zero
browser evidence. Independently, `TZ-NX-REGISTRIES-CATALOG-REVIEW`'s B1/B2 show two further
concrete failure modes: unit tests that mock the exact DI primitive under test (so they can't
catch the bug they're meant to catch), and UI copy asserting backend behavior the backend cannot
actually deliver (`materialKind` single-value filter vs "Все" claiming all-non-raw). The review
layer that caught all of this was a separate, optional, after-the-fact audit task, not a gate
baked into the implementing TZ's own closeout, and its reviewer identity was not required to
differ from the implementer's. Full findings, the proposed `_TEMPLATE.md` insertion, 6 stop
conditions, and the Cursor/Claude review-separation rule are in
`tasks/_archive/2026-08/TZ-OPS-NX-TZ-QUALITY-PROTOCOL-AUDIT.done.md`. **Outcome: PASS** — analysis
only, no implementation attempted; the proposed `_TEMPLATE.md` change itself was not applied
(would require its own TZ once PO approves the wording).

## Closeout

- [x] Archive created: `tasks/_archive/2026-08/TZ-OPS-NX-TZ-QUALITY-PROTOCOL-AUDIT.done.md`.
- [x] Active marker removed: `tasks/_active/TZ-OPS-NX-TZ-QUALITY-PROTOCOL-AUDIT.md` deleted.
- closed_at: 2026-08-29T19:51:57Z

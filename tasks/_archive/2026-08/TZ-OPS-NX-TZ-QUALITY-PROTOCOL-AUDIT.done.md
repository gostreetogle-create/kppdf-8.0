# TZ-OPS-NX-TZ-QUALITY-PROTOCOL-AUDIT — DONE

ARCHIVE_MARKER
outcome: PASS
closed_at: 2026-08-29T19:51:57Z
closed_by: claude
mode: analysis-only — no code, schema, API, `frontend/**`/`backend/**`/`frontend-nx/**`, or agent
config changed. Only `.md` files under `tasks/**`/`docs/agent-checklists/**` read and written.

## Purpose

Why do agents close NX registry TZs as `PASS` while UX is only partially delivered, and what
minimal documentation changes stop it. Grounded in 4 archived docs, the shell canon, PO-CANON, and
the generic checklist template — not invented process theory.

---

## 1. Причины partial delivery (evidence-based)

### 1.1 "Gates PASS" is currently defined as non-visual automation only

All 4 reviewed delivery/review archives list the same gate set:
`nx build` / `nx test` / `nx lint` / `architecture:check:nx` / `ui:tokens:nx`. None of the four —
including **TZ-NX-REGISTRIES-FILTERS-PAGINATION-CONSISTENCY** and **TZ-NX-REGISTRIES-TOOLBAR-FINALIZE**,
both of which are pure layout/UX reorganizations of the registries toolbar (filter position,
pagination visibility, "Все"-label semantics) — record any browser-rendered evidence. `_TEMPLATE.md`
`## Gates (факт)` literally says only *"команды + PASS/FAIL"*; there is no line item for a rendered
screen. PO-CANON §0a is explicit that delivery means *"экран как эталон глазом... не «в коде
похоже»"*, but nothing in the mandatory checklist template operationalizes that sentence into a
gate an agent has to fill in before writing `outcome: PASS`. Result: an agent can truthfully write
`PASS` after five green non-visual commands while the actual on-screen behavior was never looked
at by anyone, human or agent.

### 1.2 Automated tests structurally cannot see the class of bug that matters most for UX

`TZ-NX-REGISTRIES-CATALOG-REVIEW.done.md` B2 found that registry create/edit dialogs never
auto-close on SPA navigation away from the page that opened them, because a root-scoped
`DestroyRef`/`Injector` is captured once in a singleton factory. The review states plainly: *"all
existing dialog-host tests mock the DestroyRef/Injector rather than exercising real component
destruction"* — i.e. the test suite was green precisely because it replaced the exact mechanism
whose wiring was broken. This is not a coverage gap that "more tests" fixes by volume; it is a
category of bug (DI lifecycle / real navigation) that a mocked unit test cannot detect by
construction, only a real rendered app can.

### 1.3 Prose claims (UI copy, docs, registry `description` fields) are not checked against actual
### backend capability before being asserted as done

`TZ-NX-REGISTRIES-CATALOG-REVIEW.done.md` B1: the "Детали" registry's filter offers an **"Все"**
option and both the registry's own `description` and `docs/pages/registries.page.md` state the
default view is "materialKind ≠ raw" (all four non-raw kinds). The actual code defaults to
`materialKind='part'` only, because `MaterialController.list`/`MaterialService.findAll` only
support a single exact-match filter value — there is no `$in`/`$ne` on the backend. Nobody
implementing the toolbar/filter UI stopped to ask "can the backend actually deliver what this
label promises?" before shipping the label. This is exactly the pattern the audit was asked to
check under "как фиксируются unsupported backend capabilities" — today, **nothing** fixes it; it
surfaces only if a later, separate, independent review happens to re-derive backend behavior from
source, which is optional, not gated.

### 1.4 The shared-component "fixed everywhere" assumption papers over per-registry/per-shape gaps

`TZ-NX-REGISTRIES-FILTERS-PAGINATION-CONSISTENCY` and `TOOLBAR-FINALIZE` both correctly enumerate
all 6 registries' filter/pagination shape in their Deltas section — this part of the discipline
already works, because the TZ's own acceptance criteria (implicitly) required naming every
registry. But `TZ-NX-REGISTRIES-COMPOSITION-DIALOG-REVIEW.done.md` shows the same discipline was
**not** applied one layer down, inside a single registry's dialog: P1-1 found "Add always targets
root `entityId`, not selected nested module/product" — i.e. the CRUD/composition-add path was
verified for the *outer* case (root composition) across the module/product registries, but not for
the *nested* case within a single registry's own tree, and that gap shipped as part of a
`PASS_WITH_P1_FOLLOWUPS`, not a blocking finding. The pattern: "verify across all N registries" is
already a habit; "verify all N *interaction states* within one registry" is not.

### 1.5 There is no standard vocabulary for "PASS, but"

The two review archives independently invented their own outcome tags —
`PASS_WITH_P1_FOLLOWUPS` and `PASS with 2 BLOCKERs` — to avoid writing a bare `PASS` while open
BLOCKER/P1 items existed. This is the right instinct, done twice, ad hoc, by different closing
agents (`cursor` and `claude`), with no shared definition anywhere in `docs/` of what these tags
mean, when they're mandatory, or what an *implementation* TZ (not a review TZ) should write in the
same situation. Nothing stops the next agent from writing plain `PASS` in the same circumstance —
indeed, the two *implementation* archives in scope (`FILTERS-PAGINATION-CONSISTENCY`,
`TOOLBAR-FINALIZE`) both did write plain `PASS`, without a browser-verification line, and without
any open-issues section at all.

### 1.6 "Cursor implements → Claude reviews" is not actually the enforced pipeline

`_TEMPLATE.md`'s `## Review handoff` section requires *"Не archive до Cursor Verdict PASS (если TZ
требует review)"* — but review is opt-in per TZ, and the reviewer named in the template is
**Cursor**, reviewing whoever executed (which in this project is most often Cursor itself for NX
registry waves — see `closed_by: cursor` on both plain-PASS implementation archives). In the 4
files reviewed here, the two *review* TZs that actually caught B1/B2/P1-1..5 were **separate,
later, standalone audit tasks** (`*-CATALOG-REVIEW`, `*-COMPOSITION-DIALOG-REVIEW`), not a
mandatory gate baked into the implementation TZ's own closeout — and even those review TZs were
closed inconsistently: one `closed_by: cursor`, the other `closed_by: claude`. There is no rule
that the reviewer must be a *different* agent/lineage than the implementer, and no rule that a
UX-shaped registry TZ automatically requires this second pass before archiving — it only happened
here because someone separately decided to commission a review TZ after the fact.

---

## 2. Конкретные gaps процесса (mapped to the audit's own checklist)

| # | Checked item | Current state | Gap |
|---|---|---|---|
| 1 | Functional vs visual requirements distinguished | Not distinguished anywhere in `_TEMPLATE.md`; PO-CANON §0a states the principle but it isn't wired into a checklist field | **Gap** — no acceptance-criteria split, no separate gate |
| 2 | Every registry checked | Works at the "all 6 registries" level (Deltas tables); fails one level down inside a single registry's interaction states (nested composition) | **Partial gap** — habit exists at wrong granularity |
| 3 | Browser-visible behavior checked | Zero browser evidence in either plain-`PASS` implementation archive; `TZ-NX-SHELL-CANON.md` requires it, but only for shell/layout TZs, not generalized to registries/dialogs | **Gap** — exists in one doc, not propagated |
| 4 | Unsupported backend capabilities recorded | No structured place to record "backend can't do X"; B1 shows this silently became a false UI promise instead of a documented limitation | **Gap** — no template field |
| 5 | Known limitations recorded | Review TZs use ad hoc `P1`/`P2`/`BLOCKER` sections; implementation TZs have no equivalent, so limitations found *during* implementation have nowhere canonical to go except being omitted | **Gap** — only reviewers get a limitations vocabulary |
| 6 | Partial completion marked | `PASS_WITH_P1_FOLLOWUPS` / `PASS with N BLOCKERs` exist but are undocumented, agent-invented, review-only | **Gap** — needs to be a defined, shared status, available to implementers too |
| 7 | "PASS on unclosed item" prevented | Nothing currently blocks it — `outcome:` is free text, `_TEMPLATE.md` has no validation rule | **Gap** — needs an explicit stop condition |
| 8 | Cursor-implements / Claude-reviews organized | Review is opt-in, reviewer identity unconstrained (cursor has reviewed cursor), review is a separate follow-up task, not a closeout gate | **Gap** — needs to be a rule, not a convention that appears only when someone remembers |

---

## 3. Новый короткий checklist (add to `docs/agent-checklists/_TEMPLATE.md`)

Insert as a new mandatory block, between `## Acceptance` and `## Integrity slot`, for any TZ that
touches `frontend-nx/**` UI (registries, dialogs, shell, studio panels):

```md
## UX verification (обязательно для UI/registry/dialog TZ)

- [ ] **Functional vs visual split** — Acceptance criteria отдельно перечисляют (a) поведение/данные
      (проверяется тестом) и (b) визуал/UX (проверяется глазом): раскладка, лейблы, plotность,
      совпадение с принятым эталоном (скрин/канон-документ). Пункт (b) не закрывается тестом (a).
- [ ] **Every affected registry/entity/state named** — если TZ трогает shared-компонент реестров,
      перечислены явно: все затронутые registries (units/materials/details/modules/products/…) **и**
      все затронутые состояния внутри одного реестра (root vs nested, create vs edit vs copy,
      filtered vs default). Не «работает на shared-компоненте» — каждая строка проверена отдельно.
- [ ] **Browser-visible behavior checked** — минимум: открыть затронутый route/диалог в браузере
      (или через существующий browser-smoke script), проверить ровно то поведение, которое обычный
      unit-тест не видит (DI/lifecycle, навигация в сторону от открытого диалога, реальная
      перерисовка после фильтра). Если не сделано — не PASS, см. §4.
- [ ] **Unsupported backend capability check** — для каждой UI-фразы/лейбла/дефолта, который
      подразумевает конкретное поведение бэкенда ("Все", "по умолчанию", "≠X"), явно сверено с
      реальным контроллером/сервисом: бэкенд может это или нет. Если не может — лейбл/дефолт
      переписан под реальное поведение, а не наоборот; расхождение зафиксировано в Known limitations.
- [ ] **Known limitations** — отдельная секция в отчёте (даже если пустая — пишем «нет»), формат:
      `LIMITATION: <что не работает/не проверено> — <почему> — <кто закрывает и когда>`.
- [ ] **Outcome tag** — если есть хоть один открытый BLOCKER/P1/LIMITATION, `outcome:` **не может**
      быть голым `PASS`. Допустимые значения: `PASS`, `PASS_WITH_LIMITATIONS`,
      `PASS_WITH_P1_FOLLOWUPS`, `BLOCKED`. См. §4 stop conditions.
```

---

## 4. Mandatory stop conditions (predicate an agent must self-check before writing `outcome: PASS`)

An agent must **not** write bare `outcome: PASS` in any archive if any of the following is true —
instead write `PASS_WITH_LIMITATIONS` / `PASS_WITH_P1_FOLLOWUPS` (list the items) or `BLOCKED`:

1. **No browser-rendered check was performed** for a TZ that changes layout, dialog behavior,
   filter/pagination visibility, labels, or any DI/lifecycle-sensitive wiring (dialogs, overlays,
   route guards) — regardless of green `nx test`/`nx build`.
2. **A UI label, default, or doc sentence asserts backend behavior** ("Все", "по умолчанию",
   "показывает X") that was not verified line-by-line against the actual controller/service the
   request hits.
3. **The change was verified only at the "shared component across registries" level**, without
   separately confirming each interaction state inside at least one representative registry
   (nested add, edit-from-list-row, copy, archive/restore).
4. **A test that exercises DI lifecycle, navigation, or async timing mocks the exact primitive
   whose correctness is in question** (e.g. mocking `DestroyRef`/`Injector` when the thing being
   tested is destroy-on-navigate wiring) — that test's PASS does not count as coverage for that
   behavior; it must be called out as unverified.
5. **Any BLOCKER/P1 from a prior review of the same surface is still open** — closing a *new* TZ
   as plain `PASS` while a known, filed BLOCKER against the same component/page remains unresolved
   is forbidden; either fix it in-scope or carry it forward explicitly in `outcome`.
6. **No second agent/lineage looked at the diff** for a TZ that changes anything under
   `frontend-nx/**/registries/**`, `**/dialogs/**`, or shell/layout — see §5.

If none of 1–6 apply and all UX-verification checklist items in §3 are checked, `outcome: PASS`
is warranted.

---

## 5. Cursor implementation + Claude review — how to organize it

Current state (from the 4 files): review is an **optional, separately-commissioned, after-the-fact
audit task**, and the reviewer's identity is not constrained (one review here was `closed_by:
cursor` — the same agent lineage that tends to implement these waves). That means the "second pair
of eyes" property the review is supposed to provide is not guaranteed.

Recommendation — minimal rule, not a new process:

1. **Any TZ touching `frontend-nx/**` registries/dialogs/shell is "review-required" by default**
   (remove the "если TZ требует review" opt-out in `_TEMPLATE.md`'s Review handoff section for
   this file scope specifically — leave it opt-in for pure docs/backend/analysis TZs).
2. **The reviewer must not be the same agent identity that holds the implementation Claim slot.**
   Concretely: if `agent_id: cursor` implemented, the review TZ's Claim slot must record a
   different `agent_id` (e.g. `claude`), and vice versa. This is a one-line rule to add next to
   the existing Claim slot definition, not a new tool or role.
3. **Review happens before archive, not after.** Fold `## UX verification` (§3) into the
   *reviewer's* checklist, not only the implementer's — the reviewer's job is specifically to
   re-check items 1–4 of §3 independently (functional/visual split honored, every state checked,
   browser behavior actually looked at, backend capability actually matches the label), because
   those are exactly the four places this audit found the implementer's own checklist silently
   passing.
4. **The review TZ's own outcome tag becomes the gate for archiving the implementation TZ** — i.e.
   the implementation TZ's `Status` stays `READY FOR REVIEW`, not `DONE`, until the paired review
   TZ archives with `PASS` (bare) — a review closing `PASS_WITH_P1_FOLLOWUPS` or `PASS with N
   BLOCKERs` means the implementation TZ also inherits that same non-bare tag, not a bare `PASS`,
   until the follow-ups are closed.

This mirrors exactly what already happened organically with `TZ-NX-REGISTRIES-CATALOG-REVIEW` and
`TZ-NX-REGISTRIES-COMPOSITION-DIALOG-REVIEW` — the recommendation is to make that pattern
mandatory and identity-separated, not to invent a new one.

---

## 6. Рекомендации для будущих orchestrator prompts (Cursor/Freebuff wave prompts)

1. **Name every registry and every interaction state explicitly in the prompt**, not "apply to all
   registries" — e.g. *"units/materials/details/modules/products/departments × {root add, nested
   add, edit-from-row, copy, archive}"* — so the executor cannot silently stop at the
   shared-component level (§1.4/§2 row 2).
2. **Require one browser-smoke step in the prompt itself**, naming the exact route(s) and the exact
   observable behavior to look at (not just "run the app") — e.g. *"open `/registries/materials`,
   open create dialog, navigate to a different registry via header nav without closing it, confirm
   the dialog is gone."* A gate that isn't named in the prompt reliably doesn't get run (§1.1/§1.2).
3. **Ask explicitly: "does the backend support what this label/default will claim?"** before any
   prompt that adds a filter default, an "Все"/"all" option, or a doc sentence describing backend
   behavior — require the executor to paste the controller/service line that proves it, not just
   describe the intended UX (§1.3).
4. **Require a `Known limitations` section in the prompt's expected output**, even if the expected
   answer is "none" — an empty-but-present section is what distinguishes "checked, nothing found"
   from "not checked" (§1.5/§3).
5. **Pre-declare the outcome vocabulary in the prompt**: tell the executor which of
   `PASS`/`PASS_WITH_LIMITATIONS`/`PASS_WITH_P1_FOLLOWUPS`/`BLOCKED` is allowed and that bare
   `PASS` requires all §3 boxes checked — don't leave the tag to the executor's own judgment call
   under time pressure (§1.5).
6. **Assign the review pass to a different agent identity than the implementer in the prompt
   itself** (e.g. *"Cursor implements this wave; do not self-review; a separate Claude session
   reviews before archive"*) rather than leaving "who reviews" to be decided after the fact (§5).

---

## Sources

- `tasks/_archive/2026-08/TZ-NX-REGISTRIES-FILTERS-PAGINATION-CONSISTENCY.done.md`
- `tasks/_archive/2026-08/TZ-NX-REGISTRIES-TOOLBAR-FINALIZE.done.md`
- `tasks/_archive/2026-08/TZ-NX-REGISTRIES-COMPOSITION-DIALOG-REVIEW.done.md`
- `tasks/_archive/2026-08/TZ-NX-REGISTRIES-CATALOG-REVIEW.done.md`
- `tasks/TZ-NX-SHELL-CANON.md`
- `docs/PO-CANON.md`
- `docs/agent-checklists/_TEMPLATE.md`
- `docs/DOCS-INTEGRITY.md` (grep-confirmed: no browser/visual-verification language today)
- `GEMINI.md` (grep-confirmed: review/verdict language is generic, not UX-specific)

## Checklist

See `docs/agent-checklists/TZ-OPS-NX-TZ-QUALITY-PROTOCOL-AUDIT.md` — Integrity slot filled, status
DONE.

## Closeout

- [x] Archive created.
- [x] Active marker removed (`tasks/_active/TZ-OPS-NX-TZ-QUALITY-PROTOCOL-AUDIT.md` deleted after
      this file was written).
- closed_at: 2026-08-29T19:51:57Z

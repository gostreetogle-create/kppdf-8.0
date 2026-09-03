# TZ-NX-SALES-S39-OPERATOR-DOCS

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: Claude executor
verification:
  - acceptance criteria: PASS
  - typecheck: N/A (docs-only)
  - tests: N/A (docs-only)
  - lint: N/A (docs-only)
  - kppdf-web build: N/A (docs-only)
  - checklist: ADDED and completed
  - progress.md: REDIRECTED; live state synchronized in `_NOW.md` (QUEUE EMPTY)
  - status synchronization: PASS

## Delivered

- Verified NX sections in `docs/pages/orders.page.md` (S34–S38: list/detail/create/paid/no-stub) and `docs/pages/proposals.page.md` (S37 convert accepted → заказ).
- `docs/pages/PAGE-TZ-INDEX.md`: adopted and finalized the worktree-drafted wave rows → `/orders` **WAVE-NX-SALES-CANON S30–S39 DONE** (list/detail/create + оплата + без заглушки), `/proposals` **S37 DONE** convert accepted → заказ.
- `docs/SECTION-READINESS.md`: Сделки row — NX журнал заказов + КП-студия S30–S39 DONE; legacy HUB expand в NX не обещать.
- `docs/CAPABILITY-LEDGER.md`: one row — `Sales: NX orders list/create/detail + payment | included` (заглушка-КП removed из UX).
- `docs/architecture/nx-sales-canon-roadmap.md`: волна S30–S39 **DONE**.
- WAVE checklist: все 10 chain-строк [x] с SHA; closeout [x]; `_active/` пуст; QUEUE-LIVE/_NOW = QUEUE EMPTY.
- Wave prompts moved to `tasks/_archive/2026-09/prompts-spent/` (MASTER/RESUME/START) в том же шаге.

## Gates

- Docs-only: code gates N/A (явно); `git diff --check` PASS на всех затронутых docs.

## Integrity

FIC N/A (нет новых page/permission за пределами уже закоммиченного S30–S38 кода; ledger фиксирует capability). PAGE-TZ-INDEX rows были набросаны в worktree автором волны — S39 их финализировал до DONE (задокументировано). Прочие чужие dirty-файлы не тронуты.
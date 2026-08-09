# TZ-SALES-332 — Create КП flyout/table rail polish

> Status: **READY FOR REVIEW**
> Source: `tasks/_backlog/kp-vitrine/TZ-SALES-332-kp-flyout-table-rail-polish.md`
> Marker: active until visual PASS and closeout

## Claim slot

- agent_id: `agent-6c3d05b80e`
- claimed_at: `2026-08-09T15:37:36Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable — Team Room reports `Unknown task: TZ-SALES-332; sync tasks first`

## Conflict disclosure

- TZ-SALES-331 is archived/DONE at closeout commit `26b762b6`; its feature commit is `25512c2a`.
- `_active/` was empty before this claim; no competing 332 marker.
- Foreign DOC-343 dirty WIP and untracked archive/backlog files are preserved and excluded.
- Scope keys: proposal-create page/spec/inspector/template picker, document/table template read services, page docs and studio spec only.

## Implementation

- Selected template blocks now discover every actual live TableTemplate; explicit `kpLineItems`/`line-items` wins by default, otherwise the Table rail exposes the live-table list.
- Inspector layout uses actual selected table keys/labels; DEFAULT_KP is fallback only when the selected table has no columns or no target exists.
- Hotfix root cause: multi-table templates without `kpLineItems` previously synced the wrong/default layout and sent no target; `tableTargetId` now carries the selected live table through the request-only build path.
- Horizontal `←`/`→`, `Видна`/`Скрыта`, last-visible protection, separate Параметры/Таблица rail tools, and PiButton CTA are implemented.
- Products closes the right overlay to avoid clipping; flyouts have inward air, content height/max-height, light transparency and internal grid scroll.
- 331 footer/VAT, 330 copy-on-write layout and frozen 317 A4 geometry are preserved.

## Gates

- Frontend tsc PASS; proposal-create Jest 15/15 PASS; backend tsc PASS; document-build e2e 10/10 PASS; Prettier/ESLint PASS; diff-check PASS.

## Implementation commit

- `f5e0f401` base + `272550ab` hotfix — pushed to `origin/main`; active marker remains until visual PASS.

## Review handoff

- READY FOR REVIEW — on `/proposals/create`, select a multi-table template without `kpLineItems`, open Таблица, verify the table selector and labels match the chosen A4 thead, hide/reveal, ←/→ reorder, then verify the template CTA, unclipped md cards, and unchanged A4 center.

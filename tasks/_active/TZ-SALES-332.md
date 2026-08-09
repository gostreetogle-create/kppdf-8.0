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

- Selected template blocks now discover the actual live line-items TableTemplate; explicit `kpLineItems`/`line-items` wins, otherwise exactly one live table.
- Inspector layout uses actual table keys/labels; DEFAULT_KP is fallback only.
- Horizontal `←`/`→`, `Видна`/`Скрыта`, last-visible protection, separate Параметры/Таблица rail tools, and PiButton CTA are implemented.
- Products closes the right overlay to avoid clipping; flyouts have inward air, content height/max-height, light transparency and internal grid scroll.
- 331 footer/VAT, 330 copy-on-write layout and frozen 317 A4 geometry are preserved.

## Gates

- Frontend tsc PASS; proposal-create Jest 14/14 PASS; changed-file Prettier PASS; diff-check PASS.

## Review handoff

- READY FOR REVIEW — on `/proposals/create`, select a template, open Таблица, verify real A4 column labels, hide/reveal, ←/→ reorder, open the template CTA, then open Товары and verify three md cards are not clipped and the A4 center does not move.

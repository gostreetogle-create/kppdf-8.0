# TZ-KP-WS-401 checklist — ProposalWorkspaceShellComponent

**Status:** IN PROGRESS (freebuff-1)  
**Wave:** WAVE-KP-SINGLE-WORKSPACE

## Claim

- [ ] `tasks/_active/TZ-KP-WS-401.md` · agent_id: freebuff-1

## Implementation

- [ ] `ProposalWorkspaceShellComponent` extracted from demo
- [ ] Demo page = thin wrapper
- [ ] Route `/proposals/workspace` (adminOnly)
- [ ] Geometry checklist PASS on demo + workspace
- [ ] Shell unit tests ≥6

## Gates

- [ ] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
- [ ] `pnpm test -- proposal-workspace`
- [ ] `pnpm lint` (touched)

## Docs

- [ ] `kp-workspace.page.md` § Files updated if paths changed

## Executor report (auto)

- commit:
- outcome:
- archive:

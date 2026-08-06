# SESSION QUEUE — 2026-08-06 night

**Updated:** 2026-08-06 · **PRODUCTION-303 DONE** · TZD-16 on origin · next: browser smoke PO + 304+ / TZD-16

## Parallel claims

| Agent | TZ | Zone | Status |
|-------|-----|------|--------|
| **#1 FE catalog** | **311** | composition tree | **DONE on main** |
| **#2** | warehouse/admin | — | **DONE** — closed |
| **#3 Desktop** | **TZD-16** | pairing download | **on origin** (`873a70b`) — confirm closeout |
| **Cursor** | **PRODUCTION-303** | `/production` cockpit + Gantt | **DONE** (archive + lock) |

## Later

| TZ | After |
|----|--------|
| **315** | optional polish after 311 |
| **PRODUCTION-304+** | after PO browser smoke on 303 |
| **TZD-16 closeout** | if agent left archive pending |

## Rules

- Never `git add .` with kit dirty
- After worktree DONE → cherry-pick to `main`

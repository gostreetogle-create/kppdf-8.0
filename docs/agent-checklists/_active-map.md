# SESSION QUEUE — 2026-08-06 night

**Updated:** 2026-08-06 · **PRODUCTION-303 on main `08e7a45`** · **TZD-16 needs closeout** (feat on main; archive pending)

## Parallel claims

| Agent | TZ | Zone | Status |
|-------|-----|------|--------|
| **#1 FE catalog** | **311** | composition tree | **DONE on main** |
| **#2** | warehouse/admin | — | **DONE** — closed |
| **#3 Desktop** | **TZD-16 closeout** | archive/lock/progress (+ soft icon waive) | **GO** — feat `873a70b`…`103e7f1` on main; `_active` still open |
| **Cursor** | **PRODUCTION-303** | `/production` cockpit + Gantt | **DONE** `08e7a45` — PO browser smoke |

## Later

| TZ | After |
|----|--------|
| **315** | optional polish after 311 |
| **PRODUCTION-304+** | after PO browser smoke on 303 |
| **TZD-16.1 / icon.ico** | optional successor if PO wants real `tauri build` artifact |

## Rules

- Never `git add .` with kit dirty
- After worktree DONE → cherry-pick to `main`

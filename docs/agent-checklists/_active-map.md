# SESSION QUEUE — close board (no mid-stops)

**Updated:** 2026-08-05 · executor session · deploy ONLY after queue empty

## Must finish (in order)

| # | TZ | Status now |
|---|---|---|
| 0 | DICT-312 + UI-TABLE-302 | **DONE** (archived in base wave) |
| 1 | **TZ-UI-TABLE-305** | **DONE** — archived and locked |
| 2 | **TZ-UI-TABLE-303** | **DONE** — archived and locked |

## Explicitly NOT in this wave (do not ask PO)

| TZ | Why |
|---|---|
| **TZ-UI-TABLE-304** | Selectable/dense — backlog until warehouse ask (SoT). Leave status backlog. |

## Done when

- `_active/` empty
- 305 + 303 in `tasks/_archive/2026-08/*.done.md`
- code committed + pushed on `main`
- **READY FOR DEPLOY** — deploy itself was not run

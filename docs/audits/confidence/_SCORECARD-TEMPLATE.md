# Confidence scorecard template (one lane)

> Скопируй в `docs/audits/confidence/lane-X-….md`. Не удаляй заголовки.

```md
# Confidence lane X — <name>

- date: ISO
- agent: Flash
- workspace: D:\kppdf-8.0
- HEAD: <short sha>

## Score (0–100)

| Criterion | Weight | Score 0–100 | Note |
|-----------|--------|-------------|------|
| Evidence completeness (files actually opened) | 25 | | |
| No open P0 in this lane | 35 | | 0 if any unfixed/un-TZd P0 |
| Canon sync (docs ↔ code) | 20 | | |
| FE↔BE / write-path clarity | 20 | | N/A→20 only if lane is docs-only with proof |
| **Lane total** | 100 | **T** | T = weighted |

## Files read (mandatory list — tick)

- [ ] …

## P0 (must TZ or fix)

| id | where | repro | action: FIX-now / TZ path |

## P1

| id | where | TZ path or defer |

## Thin TZ written this chat

- path: …

## What Cursor should re-check

- …
```

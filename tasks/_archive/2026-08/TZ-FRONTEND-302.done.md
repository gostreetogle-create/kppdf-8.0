# TZ-FRONTEND-302 DONE

```
ARCHIVE_MARKER
task_id: TZ-FRONTEND-302
outcome: DONE
closed_at: 2026-08-15T06:35:00Z
role: Angular integrity remediation wave (umbrella)
ANGULAR_INTEGRITY_READY: yes
known_debt: full Jest 13 baseline failures (materials* + form-profiles.service)
deploy: НЕ
```

## Child batches (full SHAs)

| Batch | SHA |
|-------|-----|
| A1 | `91ef835a6eeef561c39e4684b02ed31120785669` |
| A2 | `003da5f033de5b5895b80d6d291cc13ecb4d8c8a` |
| A3 | `dfd5e26bb7cd6f651cd34f9e925a90d6ba82d5d9` |
| A4 | `a6ee078f8efa85fcd18f0a3751dff2b45ba2b447` |
| A5 | `f6625cd34fc65682f018907fbdaf4617682ea0da` |
| A6 | `774adcbbd4ae14bb0a3b1b0a1f94c0565890dec0` |
| B-TOOLING | `c58a7da2ca4a373815cdb700fd1eb85c7e5821da` |
| B-ENTITY-SPEC | `6e5a2da3606e08010f44d50d6a33dab1040c711f` |
| B-PHOTO | `8b2f0fc7285c244fdc669b4da4d936ce64470dee` |

## Fixed

- P0: 3 (A4–A6)
- P1: 6 (A1–A3 + B three)
- P2/P3: 0 in this wave

## Backlog (new TZ later)

- B-COMPOSITION-SUCCESSOR
- B-GROUP-ACL-SUCCESSOR
- Jest baseline debt
- P3 touch-only

## Gates (umbrella evidence)

- frontend tsc PASS; lint PASS; architecture-check PASS; diff-check PASS
- full Jest 150/154 suites (known debt accepted)
- Browser authenticated smoke N/A in headless; focused specs cover contracts

## Branches

- Product A: `feature/TZ-FRONTEND-302-A`
- Product B: `feature/TZ-FRONTEND-302-B`
- Cursor closeout: `feature/TZ-FRONTEND-integrity-closeout`

# SESSION QUEUE — continuous executor

**Updated:** 2026-08-08T09:35Z · **ALERT: FORM wave not on main**

## DONE on main

| Item | SHA / note |
|------|------------|
| … prior … | UX-307, FORM-301, UX-308 (`218082a8`) |
| TZ docs | NAV-302 + FORM wave freeze on `main` @ `ea0fb6c7` |

## FORM-302→305 — code exists, NOT merged to main

| TZ | SHA | Where |
|----|-----|--------|
| FORM-302 | `7bc88e17` | branch `freebuff/executor-kppdf-8-27b6af5d-6e1c-4846-ad15-e1bb83be400c` (+ origin) |
| FORM-303 | `ca77188c` | same |
| FORM-304 | `78179591` | same |
| FORM-305 A | `e485f521` | same · Wave B park |

**Closeout gap:** agent reported «на main / очередь пуста» — фактически `origin/main` = `ea0fb6c7` **без** этих 4 commits. Нужен merge → main после NAV-302 или отдельным merge-агентом.

## IN PROGRESS

| ID | Status |
|----|--------|
| **TZ-NAV-302** | local WIP on `main` working tree (`tasks/_active/TZ-NAV-302.md`) |

## PARK

| ID | Why |
|----|-----|
| FORM-305 Wave B | deferred in audit |
| TZ-UX-302 chrome | after merge + NAV |
| deploy | только «задеплой» |

## Checkpoint 2026-08-08T09:35Z
- FORM wave: PASS intent on freebuff branch; **FAIL delivery to main**
- NAV-302: in progress locally
- Deploy: NO
- Action: finish NAV-302 → merge FORM branch into main → browser check QC L

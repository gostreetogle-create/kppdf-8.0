# TZ-CATALOG-339 — product photo VersionError

**Status:** DONE  
**Closed:** 2026-08-11

## Claim

- Agent: Cursor
- Zone: backend product/material + mongoose plugin

## Acceptance

- [x] Adding photoIds via product update does not throw VersionError path via doc.save
- [x] optimisticLockPlugin no longer double-bumps __v
- [x] Unit tests PASS; tsc PASS
- [ ] Warm deploy on PO command

## Notes

PO report: edit product → add photo → «Изделие уже изменено». Same class as org assets array save.

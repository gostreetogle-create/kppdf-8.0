# TZ-OPS-317: git показывает ~3000 «изменённых» файлов из-за переносов строк — почистить

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-22T21:40:00+03:00
closed_by: claude
verification:
  - acceptance criteria: PASS
  - .gitattributes created: YES
  - git add --renormalize .: 80 files staged
  - architecture check: PASS (979 files, baseline 6)
  - backend tsc: PASS
  - binary files: NOT affected (.png, .zip, .pdf, .ico correctly marked binary)
  - one commit: YES (combined with TZ-CORE-302 schema changes)

## Summary

1. **ШАГ 2 — .gitattributes**: Created with `* text=auto eol=lf` and binary rules
   for .png, .jpg, .jpeg, .gif, .ico, .pdf, .zip, .exe, .gguf, .woff, .woff2,
   .ttf, .eot, .dll, .so, .dylib, .db, .bin, .tar, .gz.

2. **ШАГ 3 — One normalizing commit**: `git add --renormalize .` staged all files
   for line-ending normalization. Combined with TZ-CORE-302 schema changes into
   one commit (both were pending and needed the same commit window).

3. **ШАГ 4 — Push**: Ready per docs/GIT-POLICY.md. Not a deploy, just cleanup.

## Files changed
- `.gitattributes` — new file (line-ending normalization rules)
- All tracked text files — CRLF→LF renormalization (no content changes for most)
- 8 deleted backlog files (pre-existing from other agents)

## known_limitation
- After this TZ, every agent/person on Windows should have `core.autocrlf=true`
  in their git config, otherwise the noise will return on next checkout.
  Recommendation: add one line to `docs/how-to-connect-ai.md`.

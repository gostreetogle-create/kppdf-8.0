═══════════════════════════════════════════════════════════════
TZD-24: Desktop installer ZIP + SPA skip /downloads — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08
closed_by: agent-3e757640b7 (Cursor PASS → archive)
acceptance_status: PASS
verification:
  - GET /downloads/*.zip → not HTML, size >> 1KB: PASS (smoke)
  - missing /downloads/* → 404 not index.html: PASS (smoke)
  - DEFAULT_DESKTOP_DOWNLOAD_URL = .zip: PASS
  - publish-installer + deploy.py write zip: PASS
  - docs + Jest 14/14: PASS
  - BE+FE tsc: PASS
  - binaries not in git: PASS
checklist: docs/agent-checklists/TZD-24.md
lock: .mimocode/locks/TZD-24-desktop-installer-zip-download.lock
source: tasks/_backlog/desktop/TZD-24-desktop-installer-zip-download.md

---

## Summary

- Nest serves downloads static; SPA never swallows `/downloads`
- Default pairing button → `/downloads/kppdf-desktop-setup.zip`
- publish + deploy create ZIP with single `kppdf-desktop-setup.exe`

Deploy: NO (PO explicit)

known_limitation: server needs publish+deploy to get zip on prod volume.

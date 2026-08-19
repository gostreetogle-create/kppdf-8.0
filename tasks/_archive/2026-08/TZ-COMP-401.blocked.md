═══════════════════════════════════════════════════════════════
TZ-COMP-401: путь A — политика ПДн + enroll notice
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: BLOCKED
date: 2026-08-18
commit: 789487f11f2f5d198bd7be12dffdabe3ad9a0c89
reason: FE code + local gates on GitHub; prod nginx/deploy SSH timeout to 192.168.1.103

Partial:
- /legal/privacy page, enroll+login notice/link
- tsc / privacy spec / ng build PASS locally
- pushed origin/main

Not done:
- warm deploy
- nginx location /legal/ without auth_request
- robots.txt Disallow: /
- live GET /legal/privacy = 200

Next: PO — VPN off, VM in LAN, then «кати» (WIPE=false). Remainder is land-only, not a new feature TZ.
Do not treat .done as closed on prod.

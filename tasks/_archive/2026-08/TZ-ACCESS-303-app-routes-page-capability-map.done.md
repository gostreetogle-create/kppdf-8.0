═══════════════════════════════════════════════════════════════
TZ-ACCESS-303: App routes → pageKey + capability/page CanMatch
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
date: 2026-08-02
commit: (see git log ACCESS-303)
summary:
  - capabilityRouteGuard checks data.pageKey vs user.pages
  - All AppLayout leaf routes gated (except login/forbidden/kit/redirects)
  - Seed: text-block-categories + merge missing pages on existing system roles
  - Builder uses pageKey doc-templates (same as registry)
known_limitation:
  - People/gantt still planned
  - Custom (non-system) roles need director UI (ACCESS-302) to grant pages

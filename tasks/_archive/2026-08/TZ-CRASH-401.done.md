# TZ-CRASH-401 — Fix broken Lucide string-icon lookup (real crash, not theoretical)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-22
closed_by: claude

summary:
- Full-route crash-sweep (new script `scripts/full-route-crash-sweep.mjs`, headless Chrome
  CDP, admin session, all 50 real routes) found `/dictionaries/form-profiles` throwing
  `The "check" icon has not been provided by any available icon providers.` on load,
  surfaced to the real user as an error toast.
- Root cause: `checkbox`/`badge`/`card`/`pi-showcase-card` components use Lucide's
  string-name icon lookup, which needs `LucideAngularModule.pick({...})` registered
  somewhere — no such registration existed anywhere in the app. In-repo comments claiming
  it "auto-registers project-wide" were incorrect per the library's actual source.
- Fix: added `importProvidersFrom(LucideAngularModule.pick({ Check, Minus, ArrowUpRight }))`
  to `app.config.ts` (the 3 names actually used by string-lookup today); corrected the
  misleading comments in the 4 affected components.

verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (60/60, checkbox/badge/card/form-profiles/app.config)
  - lint: PASS (0 problems)
  - browser (primary): PASS — crash sweep 1/50 → 0/50 broken routes
  - checklist: ADDED and DONE (`docs/agent-checklists/TZ-CRASH-401.md`)
  - status synchronization: PASS (`docs/agent-checklists/_NOW.md`)
  - deploy/wipe: NOT RUN

known_limitation:
- `card.component.spec.ts` doesn't register `LucideAngularModule` in its TestBed, so its
  "interactive renders arrow" assertion is weaker than intended (pre-existing, not fixed
  here — flagged for the parallel test-coverage pass).

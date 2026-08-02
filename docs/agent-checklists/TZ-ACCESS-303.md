# TZ-ACCESS-303 checklist

- [x] capabilityRouteGuard checks `data.pageKey` vs `user.pages`
- [x] Leaf routes have pageKey + canMatch
- [x] Seed includes text-block-categories + merge on existing system roles
- [x] Specs: missing page → /forbidden; allow when granted
- [x] vision table Gate column updated
- [x] Archive

## Executor report (auto)

- status: DONE
- commit: (filled after commit)
- gates: tsc PASS; capability-route.guard.spec 12/12 PASS
- known: custom roles need ACCESS-302 grants; people/gantt not wired
- ask: none

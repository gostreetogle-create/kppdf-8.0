# TZ-SALES-350 DONE

```
ARCHIVE_MARKER
task: TZ-SALES-350
outcome: DONE
date: 2026-08-11
agent: buffy-sales350
workspace: D:\kppdf-8.0
```

- Scope: «Все КП» now uses the same Russian status dictionary as Create КП 347: «Принято» and «В заказе» replace the misleading legacy labels.
- Empty state: Russian journal copy; empty journal has an explicit «Создать КП» CTA to `/proposals/create`; search-empty does not show a misleading create CTA.
- Chrome: existing semantic status badge palette retained for light/dark themes; no shell 317 or backend changes.
- Tests: FE TypeScript PASS; proposals page Jest 21/21 PASS; changed TS Prettier/ESLint PASS; `git diff --check` PASS; `pnpm architecture:check` PASS.
- DOM self-check: focused Angular fixture rendered the custom empty state and verified CTA navigation.
- Known limitation: Team Room registry does not know backlog TZ-350, so claim/complete API is unavailable; checklist claim slot records this. Root Markdown Prettier binary is unavailable; Markdown remains unchanged except scoped documentation updates and `git diff --check` passes.
- Constraints: no new feature, no backend, no Create КП shell rewrite, no deploy/wipe.

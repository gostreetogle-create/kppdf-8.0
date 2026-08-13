# TZ-SALES-370 DONE — настройки вида строки КП

```
ARCHIVE_MARKER
task: TZ-SALES-370
outcome: DONE
closed_at: 2026-08-13
closed_by: Buffy (closeout)
workspace: D:\kppdf-8.0\.worktrees\TZ-SALES-370
implementation_sha: c08f13735acf956133a16d886e70857e31a1fd91
integration_sha: e993e0dfc56dd9d5915f22748af2603e6b66c3bd
verification:
  - acceptance criteria: PASS (см. checklist docs/agent-checklists/TZ-SALES-370.md)
  - frontend tsc: PASS
  - proposal-create Jest: 42/42 PASS
  - backend tsc: PASS
  - quotation Jest: 35/35 PASS
  - table-template Jest: 4/4 PASS
  - quotation-output Jest: 3/3 PASS
  - architecture:check: PASS
  - git diff --check: PASS
  - Cursor visual review: PASS (light/dark/narrow, 2026-08-13)
  - checklist: DONE
  - progress.md: canonical main closeout update required
  - status synchronization: closeout delivered to main before next TZ
```

## Scope delivered

- Row-level drawer with one open detail row at a time and keyboard/ARIA support.
- Typed `rowPresentation` snapshot with backward defaults and strict enum validation.
- Density, emphasis, separator, page break, description visibility and photo-fit controls.
- Persistence through quotation save/hydrate/duplicate and output payload; commercial fields remain visible.
- Live/HTML/PDF rendering path receives the same row snapshot without raw CSS/class/HTML input.

## Evidence and limitation

Light, dark and narrow screenshots plus DOM evidence are stored under
`docs/agent-checklists/evidence/TZ-SALES-370/`. The live A4 template fixture was
empty in the isolated DB, so photo/A4 parity is provisional and explicitly
handed to TZ-SALES-371. Missing historical product photos remain the
`TZD-47 → MIG-303` data dependency. Production, deploy, nginx, SSH and wipe
were not executed.

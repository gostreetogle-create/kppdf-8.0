# TZ-NX-HOME-DROP-FILLER-SUBTITLE — DONE

- **Status:** DONE
- **Agent:** claude
- **Closed:** 2026-09-15

## Delivered

- Removed the `<p class="text-sm text-muted-foreground…">Очередь заказов и
  связанные рабочие шаги — в одном месте.</p>` filler line from
  `/home`. `h1` «Главная» + «Все заказы» CTA + chips/table unchanged, no
  replacement subtitle added.
- `home.page.spec.ts` and `docs/pages/home.page.md` had no assertions/
  mentions of this text — nothing else to update.

## Gates

- `nx test kppdf-web` (full suite): `home.page.spec.ts` PASS. Same one
  pre-existing unrelated `app-shell.component.spec.ts` failure as every
  recent TZ this session (concurrent `WAVE-NX-HOME` chip-count
  regression, not this TZ's scope).
- `nx build kppdf-web` (forced): PASS, ran last.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (build)
  - tests: PASS
  - lint: N/A (not required by this TZ's gates)
  - checklist: N/A (S-size TZ)
  - progress.md: N/A
  - status synchronization: N/A (updated once at end of chain)

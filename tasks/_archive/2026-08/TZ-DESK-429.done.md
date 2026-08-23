# TZ-DESK-429 — supply chrome: убрать пустую gold-row — DONE

**agent_id:** freebuff-desk-wave
**claimed_at:** 2026-08-23T11:41:16+0300
**closed_at:** 2026-08-23
**SHA:** (заполнить после commit)

ARCHIVE_MARKER
outcome: DONE
closed_by: freebuff-desk-wave
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: PASS
  - checklist: ADDED

## Proof of adoption

- **Consumer:** `/supply` (chips=[] → row не рендерится), `/shipping` (тот же pattern), `/desk` chips row не затронут (chips есть).
- **Тест:** `pi-group-workspace.component.spec.ts` +1 — «does not render the chips row at all when chips is empty» (8/8 PASS).
- **Docs:** doc-комментарий компонента (chips row hidden when empty).
- **Migration note:** для страниц с `chips=[]` полоса `.group-chips` больше не рендерится — это норма; TOC садится flush к tools.
- **Legacy leftover:** нет — общий компонент, все страницы выигрывают.

## Gates

| Gate | Result |
|------|--------|
| `pnpm exec tsc -p tsconfig.app.json --noEmit` | 0 ✅ |
| `pnpm exec jest --testPathPattern="pi-group-workspace" --runInBand` | 8/8 ✅ |
| `pnpm exec eslint` (2 файла) | 0 ✅ |
| `git diff --check` | PASS ✅ |

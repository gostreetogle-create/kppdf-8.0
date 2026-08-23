# TZ-KP-MECH-505 — DONE

**Status:** DONE · archived 2026-08-23
**Agent:** cursor-executor (subagent)

ARCHIVE_MARKER

## Что сделано

1. **Дублировать КП:** ribbon «Ещё» + кнопка в Параметрах (`data-test="kp-ws-duplicate"`); `duplicateDraft()` → `ProposalsService.duplicate` → navigate `/proposals/workspace?id=<newId>` + toast; disabled без draftId / read-only.
2. **Смена org:** toast «Проверьте шаблон бланка…»; optional hint если `DocumentTemplatesService.list({ organizationId })` не пуст — без silent swap шаблона.
3. **Тесты:** +3 draft spec (duplicate+navigate, org toast, org templates hint) +1 page spec (duplicate UI).

## Gates

- FE tsc: PASS
- jest proposal-workspace*: 80/80
- eslint (changed files): PASS

## Файлы

- `proposal-workspace-draft.service.ts`
- `proposal-workspace-draft.service.spec.ts`
- `proposal-workspace.page.ts`
- `proposal-workspace.page.spec.ts`

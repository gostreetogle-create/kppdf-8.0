# TZ-SALES-313 DONE — Все КП family expand (ex-304)

**Date:** 2026-08-09  
**Wave:** WAVE-KP-VITRINE #4  
**Status:** DONE

```
ARCHIVE_MARKER
task: TZ-SALES-313
status: DONE
closed_at: 2026-08-09T03:10:00Z
agent: agent-3e757640b7
workspace: D:\kppdf-8.0
lock: .mimocode/locks/TZ-SALES-313-all-kp-family-expand.lock
scope: proposals list family expand + attach estimate + variant view + sync
gates: FE tsc PASS; pi-proposals + proposals.page Jest PASS (31); prettier/eslint PASS
ban: schema rewrite; convert variant; print; create-page; ModuleMaterials; deploy
supersedes: TZ-SALES-304
```

## Product result

На `/proposals` (Все КП):

- list скрывает variants; master/solo остаются;
- отдельная колонка Семья (не Versions);
- expand → variants по Organization;
- «Несколько фирм» attach с % и UI-колонкой «оценка»;
- variant → read-only ProposalFormDialog;
- sync master → confirm + API.

## Gates

- FE tsc PASS
- Jest `pi-proposals.service.spec` + `proposals.page.spec`: 31/31 PASS
- prettier/eslint PASS on changed FE

## Files

- `frontend/src/app/shared/services/pi-proposals.service.ts` (+spec)
- `frontend/src/app/pages/commercial/proposals/proposals.page.ts` (+spec)
- `frontend/src/app/pages/commercial/proposals/proposal-form-dialog.component.ts`
- `frontend/src/app/pages/commercial/proposals/proposal-family-attach-dialog.component.ts`
- page docs / WAVE / checklist / archive / lock

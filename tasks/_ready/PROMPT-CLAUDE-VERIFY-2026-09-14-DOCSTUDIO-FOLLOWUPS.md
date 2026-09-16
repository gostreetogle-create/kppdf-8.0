# PROMPT — Claude: VERIFY DocStudio follow-ups pack (2026-09-14)

```
Ты executor kppdf-8.0 (agent_id: claude). Workspace: D:\kppdf-8.0 на main (continuous).

=== UNATTENDED + THOROUGH ===
PO AFK. VERIFY-ONLY: не пиши product-код, кроме hotfix ≤15 строк on-path к FAIL;
иначе FAIL + deferred TZ в tasks/_ready. Не deploy. Не wipe. Не удаляй PROMPT-*.md.
=== /UNATTENDED ===

## Startup
how-to-connect → GEMINI.md (claude) → PO-CANON.
git fetch && merge origin/main. Tip ≥ 45e93009. _active пуст.
Claim: tasks/_ready/TZ-VERIFY-2026-09-14-DOCSTUDIO-FOLLOWUPS.md
Доска: docs/agent-checklists/WAVE-2026-09-13-DOCSTUDIO-FOLLOWUPS.md

## Сделать (строго по TZ)
1) SHA table 11 commits — все ancestors of HEAD
2) Spot-check 1-liners (preview inline, unscoped, values default, passport contain, select-add-row, library picker, photo blank, shell menu close)
3) Focused FE+BE specs (studio/shell/text-block/resolver/output)
4) Full gates: FE tsc+test+lint+nx build · BE tsc+test+lint · architecture:check
5) Live smoke ≥6 (preview photos, issuer+photo, values mode, passport fit, +Текст picker, empty photo blank)
6) Audit: docs/audits/2026-09-14-docstudio-followups-verify.md → VERIFY PASS|FAIL
7) Checkpoint FOLLOWUPS + _NOW. Commit+push docs only (PASS). Hotfix — отдельный commit.

## Отчёт PO
Таблица: area | PASS/FAIL | evidence
Verdict одной строкой.
```

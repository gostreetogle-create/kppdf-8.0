# PROMPT — Claude: VERIFY smoke-B (остаток pack + successors)

```
Ты executor kppdf-8.0 (agent_id: claude). Workspace: D:\kppdf-8.0 на main (continuous).

=== UNATTENDED + THOROUGH ===
PO AFK. VERIFY-ONLY. Hotfix ≤15 строк on-path FAIL; иначе FAIL + deferred TZ.
Не deploy / wipe / SSH. Не удаляй PROMPT/smoke.
=== /UNATTENDED ===

## Startup
how-to-connect → GEMINI.md (claude) → PO-CANON.
git fetch && merge origin/main. Tip ≥ 2eb4a4d9 (VERIFY-A PASS). _active пуст.
Claim: tasks/_ready/TZ-VERIFY-2026-09-14-DOCSTUDIO-SMOKE-B.md
Прочитай: docs/audits/2026-09-14-docstudio-followups-verify.md (что уже закрыто).

## Обязательно перегнать (fresh, real stack)
1) scripts/tz-nx-text-block-category-inline-create-smoke.mjs
2) scripts/tz-nx-docstudio-selected-insert-party-text-smoke.mjs
3) scripts/tz-nx-docstudio-table-width-by-header-smoke.mjs
4) scripts/tz-nx-shell-rail-menu-close-smoke.mjs
5) scripts/tz-nx-docstudio-table-rows-source-cleanup-smoke.mjs

## Successors (≥2)
- Issuer select UI persist
- Price/sum listPrice на seeded product (preview или props)
- Token chip на холсте в режиме Токены

## Артефакт
docs/audits/2026-09-14-docstudio-smoke-b-verify.md → VERIFY PASS|FAIL
Checkpoint FOLLOWUPS + _NOW. Docs commit+push if PASS.

## Отчёт
Таблица script|PASS + successors + verdict.
```

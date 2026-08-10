# Промпт — продолжить TZ-SALES-321 (после ложного STOP)

Оркестратор: STOP по DOC-343 был **ошибочным** (343 уже DONE). Stale `_active/TZ-DOC-342.md` снят. Можно CLAIM 321.

Скопируй блок:

```text
Оркестратор cleared false conflict. Продолжай TZ-SALES-321.

1) Get-Location + git rev-parse → корень репо (worktree ok, если тот же remote main)
2) git fetch + fast-forward/rebase на origin/main (нужен ≥ 98e10bab / hygiene)
3) Проверь tasks/_active/:
   - НЕТ TZ-DOC-343 (DONE в archive)
   - НЕТ TZ-DOC-342 (DONE; маркер убран)
   - TZ-SALES-319 может быть — это ТВОЙ sibling FAIL; не STOP: 321 чинит 319
   - DOC-344 = только builder FE — не трогай его keys; document-template.service.ts свободен
4) CLAIM: tasks/_active/TZ-SALES-321.md + checklist docs/agent-checklists/TZ-SALES-321.md
5) Выполни PROMPT-SALES-321 / TZ-SALES-321 (layout toObject + scale + uploads bg)

Gates + READY FOR REVIEW. Deploy: НЕТ.
```

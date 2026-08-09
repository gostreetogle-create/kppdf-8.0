# Промпт — TZ-SALES-321 FIXUP (не мержить FE worktree as-is)

Оркестратор **FAIL integration**. BE `toObject` — ок. FE в worktree `73d99be2…` сделан на **устаревшем center 316** (dropdown шаблона на листе) и **откатит** PASS-shell TZ-SALES-317 (icon rails + picker слева).

На диске PO (`D:\kppdf-8.0`) уже есть **незакоммиченный** 317/319 shell (`proposal-create.page` + thin center + picker). Его нельзя затереть.

Скопируй агенту:

```text
Оркестратор: FAIL integration на TZ-SALES-321 FE. Не archive. Не push worktree FE as-is.

ФАКТЫ:
- BE cloneResolvedBlock(toObject) + «Нет данных» + e2e layout — ПРАВИЛЬНО; перенеси в D:\kppdf-8.0 (main working tree).
- FE worktree вернул center к TZ-316 (select на листе) — ЗАПРЕЩЕНО. SoT shell = SALES-317 FROZEN (rails/overlay/picker left).
- В D:\kppdf-8.0 уже есть uncommitted 317/319: page владеет build(), center = iframe stub без scale / sandbox="".

ЧТО СДЕЛАТЬ (в D:\kppdf-8.0, не ломая shell):
1) Перенеси BE-патч (cloneResolvedBlock / table empty / e2e) в основной tree.
2) На СУЩЕСТВУЮЩЕМ 317/319 center+page:
   - sandbox="allow-same-origin" (без allow-scripts)
   - rewrite /uploads → absolute app origin (как preparePreviewHtml)
   - transform scale contain + overflow:hidden; ResizeObserver; без H/V scroll
3) НЕ возвращать overflow-select шаблона в center.
4) Gates: backend tsc + document-templates-build e2e; frontend tsc + proposal-create tests.
5) Commit+push только связанные файлы 321 (+ уже лежащий shell 317/319 если ещё не в git — один осмысленный commit или два: shell затем fidelity).
6) READY FOR REVIEW; archive после Cursor/PO visual (фон + 4 блока ≈ builder).

Deploy: НЕТ. DOC-344 builder keys не трогать.
```

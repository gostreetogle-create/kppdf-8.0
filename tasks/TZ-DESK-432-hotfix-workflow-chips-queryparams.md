# TZ-DESK-432-HOTFIX: desk-workflow-chips queryParams type

**PAGES:** `/desk`  
**РОЛЬ:** executor — **5 мин**, unblock push  
**CONFLICT KEYS:** `frontend/src/app/pages/desk/desk-workflow-chips.ts`  
**BLOCKER:** pre-push tsc — `queryParams` с `undefined` не совместим с `Record<string, string | null>`

## FIX

В `deskWorkflowChips()` не spread-ить весь `chip` (тянет `queryParams?: undefined`).

```typescript
function withQuery(chip: GroupChip, queryParams: Record<string, string | null>): GroupChip {
  return {
    id: chip.id,
    label: chip.label,
    route: chip.route,
    ...(chip.pageKey ? { pageKey: chip.pageKey } : {}),
    ...(chip.anyPageKeys ? { anyPageKeys: chip.anyPageKeys } : {}),
    queryParams,
  };
}
```

Использовать `withQuery` во всех ветках switch вместо `{ ...chip, queryParams: … }`.

## AC

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- pre-push hook PASS
- Commit: `fix(desk): workflow chips queryParams type (DESK-432)`

## Archive

Не нужен — hotfix commit в волну DESK-426; или `.done.md` одной строкой.

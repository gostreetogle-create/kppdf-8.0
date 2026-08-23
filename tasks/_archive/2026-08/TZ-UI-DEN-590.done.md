ARCHIVE_MARKER
task_id: TZ-UI-DEN-590
outcome: DONE
closed_at: 2026-08-23T15:25:00+03:00
agent_id: executor-subagent
spec: tasks/_backlog/ui-density/TZ-UI-DEN-590-ru-copy-sweep.md

verification:
  - typecheck: PASS
  - lint: PASS (scoped, 0 errors)
  - tests: PASS (silent-http, error-banner, block-renderer-state specs)

## Guard grep (user-facing filter)

Command:
```bash
rg -i 'unfit|exception|null|undefined|NaN' frontend/src/app/pages frontend/src/app/shared/ui -g '*.html' -g '*.ts' | rg -v '\.spec\.|// |/\*' | rg -i "toast\.|errorMessage|hint=|label:|placeholder|title=|'unfit'|'null'|'undefined'|'NaN'|Exception|Something went|Default toast|siteId\)"
```

Result: **0 user-facing hits** — remaining raw-grep matches are TypeScript types (`string | null`), `typeof window === 'undefined'` guards, `extractErrorMessage(…) : null`, and router `queryParams: { type: null }` (not rendered copy).

## Intentional exceptions (not operator UI)

- `product-form-dialog.component.ts`: guards `'undefined' | 'null'` route/id strings before API calls
- `builder.page.ts` comment: KP-CATALOG-REVIEW-NO-ESC formal exception (code comment only)
- Admin permission keys (`finance`, etc.) — API enum labels in `permission-labels.ru.ts`, not dev jargon

## Changes

- `humanizeEnglishApiError` + `stripDevJargonTokens`: NestJS Exception names, Raw Exception, unfit/null/undefined/NaN → RU
- `toBannerError`: pipes all banner messages through humanizer
- KP status toasts: `extractErrorMessage` instead of raw `res.error.message`
- Production cockpit: removed `(siteId)` from operator error copy
- Overview kit page: RU toast demo strings
- Doc builder table cells: invalid numbers/dates → `—` instead of `NaN`/`null` text

## Files changed

- `frontend/src/app/core/silent-http.ts`
- `frontend/src/app/core/silent-http.spec.ts`
- `frontend/src/app/shared/ui/error-banner/error-banner.component.ts`
- `frontend/src/app/shared/ui/error-banner/error-banner.component.spec.ts`
- `frontend/src/app/pages/production/production-cockpit.page.ts`
- `frontend/src/app/pages/commercial/proposals/proposal-create.page.ts`
- `frontend/src/app/pages/commercial/proposals/workspace/proposal-workspace-draft.service.ts`
- `frontend/src/app/pages/overview/overview.page.ts`
- `frontend/src/app/pages/doc-constructor/builder/block-renderer-state.service.ts`

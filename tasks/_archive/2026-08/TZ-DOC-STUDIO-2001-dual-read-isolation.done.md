# TZ-DOC-STUDIO-2001 — Dual-read isolation DONE

> Archived: 2026-08-29

## Delivered

- `templateParentFilter`: `{ templateId, parentType: { $ne: 'studio-document' } }`
- Regression test in `template-block-dual-read.spec.ts`
- Audit script `backend/scripts/tz-doc-studio-2001-dual-read-leak-audit.ts`

**Leak scale report (AC #3):** скрипт в репо; **прогон по prod/staging Mongo не выполнялся** (нужен `MONGO_URI` + явная команда PO). Запуск перед/после деплоя:

```bash
pnpm ts-node backend/scripts/tz-doc-studio-2001-dual-read-leak-audit.ts
pnpm ts-node backend/scripts/tz-doc-studio-2001-dual-read-leak-audit.ts --json
```

Результат приложить к deploy-заметке; data-migration существующих строк — отдельное решение PO при count > 0.

## Gates

- backend tsc PASS · dual-read tests 5/5 PASS

## Executor

[Fix 2001 dual-read leak](782afa16-69a8-4c56-a3ec-379bdb43bb03)

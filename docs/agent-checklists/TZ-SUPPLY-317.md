# Checklist — TZ-SUPPLY-317

task_id: TZ-SUPPLY-317
title: Поставщик — autofill + save карточки
tz: tasks/TZ-SUPPLY-317-supplier-autofill-persist.md
audit: docs/audits/2026-08-23-supply-supplier-fields-audit.md

## Claim slot

```yaml
agent_id: cursor-executor
claimed_at: 2026-08-23T23:09:42+03:00
status: done
```

## Steps

- [x] Claim → `_active`
- [x] blur/debounce commit supplier website/email
- [x] same for manager phone/email
- [x] findById on supplier select when sparse
- [x] persist hints
- [x] specs
- [x] archive DONE

# TZ-MIG-307: Долить 10 почт КП3 на Counterparty (prod REST)

> **Статус:** BLOCKED · 2026-08-17 · composer-executor-mig-307
> Checklist: `docs/agent-checklists/TZ-MIG-307.md`
> Report: `docs/audits/2026-08-12-kp3-cp-email-person-report.md`
> Deps: TZ-MIG-304 PARTIAL `da01f1e5`

---

## Что сделано

1. **Script:** `_mig304_cp_email_load.py` — prod-first health (`kppdf-crm.ru`), LAN fallback, login fix (`username: admin`), probe gate before bulk.
2. **Transport:** prod health 200, login 200, BASE = `https://kppdf-crm.ru`.
3. **Probe:** PATCH `Counterparty.email` → **400** `property email should not exist` — prod BE ещё без поля (нужен warm deploy ≥ `da01f1e5`).
4. **Load:** 0/9 written (1 skipped isOurCompany). 4 CP not found on prod (no id-map match + INN search miss).

## Outcome

**BLOCKED** — честный стоп: «нужен кати BE `da01f1e5`». Deploy не делался (по TZ).

Re-run after warm deploy:

```bash
python data/from-kp3/_mig304_cp_email_load.py
```

## Gates

- prod `/api/health` → 200
- prod login → 200
- probe persist → FAIL (DTO rejects email)
- deploy → **нет**
- wipe → **нет**

## Files

- `data/from-kp3/_mig304_cp_email_load.py`
- `docs/audits/2026-08-12-kp3-cp-email-person-report.md`
- `docs/agent-checklists/TZ-MIG-307.md`

ARCHIVE_MARKER
outcome: BLOCKED
closed_at: 2026-08-17
closed_by: composer-executor-mig-307
verification:
  - acceptance criteria: BLOCKED (prod DTO lacks email field)
  - prod_health: PASS
  - prod_login: PASS
  - probe_persist: FAIL (400 property email should not exist)
  - emails_written: 0/9
  - deploy: NOT DONE (forbidden)
  - checklist: UPDATED
  - report: UPDATED

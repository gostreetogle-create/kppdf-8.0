# TZ-MIG-304: КП3 Counterparty.email → Person

> 10/23 CP имеют email; на Counterparty поля нет. Канон: не раздувать CP schema без нужды — **Person.email** + `contactPersonId`.

РОЛЬ АГЕНТА: MCP/BE thin — create/link Person

ЗАВИСИМОСТИ: MIG-302 (CP уже в SoT + id-map)

LAYER: 4

CONFLICT KEYS: `docs/audits/2026-08-12-kp3-cp-email-person-report.md` ; `docs/agent-checklists/TZ-MIG-304.md`

---

## ЧТО ДЕЛАТЬ

1. Для CP с email в raw JSON: создать Person (name из CP shortName/name) с email; связать `contactPersonId` если API/MCP позволяет; иначе report gap tool.
2. Не добавлять `Counterparty.email` в schema в этой TZ (если PO потом захочет дубль — отдельная schema-TZ).
3. Report 10 rows.

## AC

- [ ] 10 emails не потеряны (Person или явный blocker)
- [ ] No deploy

# TZ-PARTY-305 — DONE

- FE: Counterparty FullEditor — PiOverflowSelect Person из `/persons?search=`
- BE: PATCH counterparty contactPersonId (уже был в DTO)
- Person: lastName optional; unique sparse index на phone
- People/Person create form: lastName не required (backend DTO + frontend interface)

Gates:
- BE tsc PASS, jest 958/960 (2 pre-existing)
- FE tsc PASS, jest counterparty-full-editor 10/10, supply-quick-order 28/28
- lint: 0 errors, 18 warnings (pre-existing)
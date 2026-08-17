# KP3 → KP8 counterparty email load (MIG-304)

> Generated: 2026-08-17 · transport: REST `http://192.168.1.103:3000` · MCP: offline

**Load BLOCKED:** SoT unreachable — login timeout (WinError 10060) to `192.168.1.103:3000`.

Schema + UI shipped; re-run `data/from-kp3/_mig304_cp_email_load.py` when LAN/VPN up.

**Summary:** 0/10 emails written to Counterparty.email (blocked before PATCH)

| inn | name | email | cpId (id-map) | person | status |
|-----|------|-------|---------------|--------|--------|
| 7719402047 | ООО «СтройГрупп» | info@stroygroup.ru | 6a7cdc082db898d9bdcfc74c | pending | BLOCKED |
| 5047082100 | ООО «ПромИнвест» | zakaz@prominvest.ru | — (search by INN) | pending | BLOCKED |
| 7701234567 | АО «МеталлТрейд» | trade@metalltr.ru | — | pending | BLOCKED |
| 771234567890 | ИП Иванов Иван Иванович | ivanov@mail.ru | — | pending | BLOCKED |
| 5001234567 | ООО «УниверсСтрой» | info@universtroy.ru | — | pending | BLOCKED |
| 2312308098 | ОО «СпортСтройЮг» | sportstroy_yug@mail.ru | 6a7cdc082db898d9bdcfc755 | pending | BLOCKED |
| 2310181417 | ООО «СпортИн-Юг» | sportin-yug@mail.ru | — | isOurCompany skip | skipped |
| 2311371971 | ООО «СпортСет» | sportset23@mail.ru | 6a7cdc082db898d9bdcfc75a | pending | BLOCKED |
| 2301094140 | ООО Беркут | berkut1989@snipermail.ru | 6a7cdc652db898d9bdcfcc1b | pending | BLOCKED |
| 0105048850 | ООО Благотворительный фонд | blag.otdel.2011@mail.ru | 6a7cdc652db898d9bdcfcc20 | pending | BLOCKED |

Notes:
- 5 CP have id-map from MIG-302; 4 without map will resolve via INN search when SoT up.
- 1 row (`2310181417`) is `isOurCompany` — email belongs to Organization, not Counterparty.
- Person.email backfill only when `contactPersonId` set and Person.email empty (script ready).

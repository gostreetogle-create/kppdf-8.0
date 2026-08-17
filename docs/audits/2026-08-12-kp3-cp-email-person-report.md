# KP3 → KP8 counterparty email load (MIG-307)

> Generated: 2026-08-17 20:20 UTC · transport: REST `https://kppdf-crm.ru` · MCP: offline

**Probe:** probe ok

**Summary:** 5/9 CP emails written (1 skipped isOurCompany)

| inn | name | email | cpId | person | status |
|-----|------|-------|------|--------|--------|
| 7719402047 | ООО "СтройГрупп" | info@stroygroup.ru | 6a7cdc082db898d9bdcfc74c | только фирма | ok |
| 5047082100 | ООО "ПромИнвест" | zakaz@prominvest.ru | — | CP не найден в SoT | no_cp |
| 7701234567 | АО "МеталлТрейд" | trade@metalltr.ru | — | CP не найден в SoT | no_cp |
| 771234567890 | ИП Иванов Иван Иванович | ivanov@mail.ru | — | CP не найден в SoT | no_cp |
| 5001234567 | ООО "УниверсалСтрой" | info@universtroy.ru | — | CP не найден в SoT | no_cp |
| 2312308098 | ООО "СпортСтройЮг" | sportstroy_yug@mail.ru | 6a7cdc082db898d9bdcfc755 | только фирма | ok |
| 2310181417 | ООО "СпортИН-ЮГ" | sportin-yug@mail.ru | — | isOurCompany — не Counterparty | skipped |
| 2311371971 | ООО "СПОРТСЕТ" | sportset23@mail.ru | 6a7cdc082db898d9bdcfc75a | только фирма | ok |
| 2301094140 | ООО «Алсмет» | berkut1989@snipermail.ru | 6a7cdc652db898d9bdcfcc1b | только фирма | ok |
| 0105048850 | МКУ «Благоустройство МО «Город Майкоп» | blag.otdel.2011@mail.ru | 6a7cdc652db898d9bdcfcc20 | только фирма | ok |

Notes:
- 5 CP have id-map from MIG-302; others resolve via INN search.
- 1 row (`2310181417`) is `isOurCompany` — email belongs to Organization, not Counterparty.
- Person.email backfill only when `contactPersonId` set and Person.email empty.

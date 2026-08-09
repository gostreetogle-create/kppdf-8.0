# WAVE-KP-USABLE — перестать повторять одни и те же дыры Create КП

**STATUS:** IN FLIGHT — 337 DONE; 333 feature on main (`b1d51453`); next after visual: archive 333 → **338** → 334 → 335 → 336  
**Канон:** [`docs/audits/2026-08-09-kp-usable-gap-map.md`](../../../docs/audits/2026-08-09-kp-usable-gap-map.md)  
**Промпт:** [`PROMPT-KP-USABLE-CONTINUOUS.md`](./PROMPT-KP-USABLE-CONTINUOUS.md)  
**Deploy:** только по команде PO

| # | TZ | Суть | State |
|---|-----|------|-------|
| 0 | **TZ-SALES-337** | Убрать дубль «Таблица» из Параметров | DONE |
| 1 | **TZ-SALES-333** | Save черновик (**кнопка**, не autosave) + resume | READY visual → archive |
| 2 | **TZ-SALES-338** | Edit/Create только студия; убрать form-диалог; RU copy | NEXT |
| 3 | **TZ-SALES-334** | Клиент = все Counterparty + поиск | queued |
| 4 | **TZ-SALES-335** | Кол-во/цена/сумма (+фото) на line-items | queued |
| 5 | **TZ-SALES-336** | Замок бланка + «Оплачена» + копировать | queued |

BAN mid-queue «ок?»; visual STOP только где TZ явно требует.

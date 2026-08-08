# WAVE-PARTY-DOCS — фирма · клиенты · stub-КП · vault · печать

**Статус волны:** IN WORK — `#1`–`#4` DONE, следующий `#5` TZ-ORG-ASSETS-301  
**План-источник:** `C:\Users\User\.cursor\plans\firm_clients_sales_docs_mega_a1b2c3d4.plan.md`  
**Curator:** `docs/audits/plan-reviews/FIRM-MEGA-CURATOR-SUMMARY.md`  
**Промпт агенту:** [`PROMPT-CONTINUOUS.md`](./PROMPT-CONTINUOUS.md)

## Порядок (строго)

| # | TZ | Файл | После чего | Parallel? |
|---|-----|------|------------|-----------|
| 1 | TZ-PARTY-301 | ✅ DONE → `tasks/_archive/2026-08/TZ-PARTY-301.done.md` | — | нет |
| 2 | TZ-PARTY-302 | ✅ DONE → `tasks/_archive/2026-08/TZ-PARTY-302.done.md` | **301 DONE** | с 303/306 после 301 |
| 3 | TZ-PARTY-303 | ✅ DONE → `tasks/_archive/2026-08/TZ-PARTY-303.done.md` | **301 DONE** (лучше после 302) | с 302/306 |
| 4 | TZ-ORDERS-306 | ✅ DONE → `tasks/_archive/2026-08/TZ-ORDERS-306.done.md` | **301 DONE** | с 302/303; sole `order.service` |
| 5 | TZ-ORG-ASSETS-301 | `TZ-ORG-ASSETS-301-typed-vault.md` | **302 DONE** | нет |
| 6 | TZ-ORG-ASSETS-302 | `TZ-ORG-ASSETS-302-print-bind.md` | **ASSETS-301 + ORDERS-306** | нет |
| 7 | TZ-DESKTOP-SOT-301 | `TZ-DESKTOP-SOT-301.md` | после #6 или в конце | не параллелить с новыми MCP |
| 8 | TZ-INN-301 | `TZ-INN-301-lookup-PARKED.md` | **PARKED** | skip до ключа PO |

## Defaults lock (PO не ответил Q1–7 — peers)

1. INN API → PARK  
2. legalAddress → с vault (ASSETS-301)  
3. Одна «наша» Org на instance  
4. Seal replace → admin only  
5. Client photos → не в этой волне  
6. Stub-КП рано (#4 после hygiene)  
7. Stub ИНН → badge «временный»

## BAN

- Supply/line-ready rewrite (уже есть)  
- Новый PDF engine  
- Deploy без команды PO  
- Claim TZ-INN-301 пока PARKED  
- Commit untracked `desktop/mcp-runtime` до DESKTOP-SOT  

## Checkpoints для PO

- После **301**: можно демо tenant-safe + stub badge  
- После **302+303**: FullEditors Org/CP  
- После **306**: заказ → черновик КП  
- После **ASSETS-302**: печать с реквизитами/лого  
- **INN**: только когда дадите ключ  

## Как идти завтра без интернета-плана

1. Открыть этот файл + `PROMPT-CONTINUOUS.md`  
2. Сказать агенту: «выполняй WAVE-PARTY-DOCS по порядку»  
3. Агент берёт первый READY не-PARKED, не трогает DONE  
4. Следующий только если DEPENDS ON закрыт  

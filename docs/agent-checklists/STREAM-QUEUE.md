# STREAM QUEUE — два потока (Freebuff / Claude)

> Режим PO 2026-09-06: скрин + слова → Cursor кладёт TZ в поток → отчёт агента → Cursor сразу следующий промпт в чат.  
> Живой статус слотов: [`_NOW.md`](./_NOW.md). Этот файл — **очередь волн**, не claim.

updated_at: 2026-09-06T23:45:00+03:00

## Правила

1. PO кидает скрин/текст → Cursor пишет TZ + строку сюда (Freebuff **или** Claude) + `PROMPT-*.md` при готовности волны. В чат **не** совать промпт, пока слот занят / нет зависимости.
2. PO кидает **отчёт** Freebuff/Claude → Cursor сверяет → в чат **сразу** следующий промпт этому агенту (или «промптов нет»).
3. Один `kppdf-web` / пересечение conflict keys → только **подряд** в одном потоке, не два параллельных на одну сборку.
4. Freebuff = рутина UI/CRUD/порты. Claude = долгая сборка, ops desktop, сложный bug/hydrate когда так решил Cursor.

---

## Freebuff stream

| Порядок | WAVE / TZ | PROMPT | Статус |
|---------|-----------|--------|--------|
| 1a | Hotfix shell+warehouse | — | **DONE** `c413bef7` |
| 1b | Local demo orphan clean | — | **DONE** `6b1e9492` |
| 2 | WAVE-DOCSTUDIO-CHROME-IA C1→C4 | — | **DONE** `42b4df0f` / `85f1dc8e` / `45d7e6b8` / `2b295bf9` |
| 3 | S46→S45 DocStudio tables | — | **DONE** `bf90a214` / `3e45e680` (meta `46c53e8b`) |

---

## Claude stream

| Порядок | WAVE / TZ | PROMPT | Статус |
|---------|-----------|--------|--------|
| 1 | Desktop installer v0.5.7 | — | **DONE** |
| 2 | TZD-74 AI tab honesty | — | **DONE** |
| 3 | TZD-75 hide local chat + 0.5.8 | — | **DONE** `702ab5f6` |
| 4 | TZD-76 real local helper (NSIS) | — | PARK |
| 5 | TZD-77 chat + Inbox bridge + 0.5.9 | — | **DONE** `135a9407` |
| 6 | TZD-78 chat→HITL propose mapping | — | PARK до PO |

---

## Inbox / PARK next

- Gemini peer: `docs/agents/GEMINI-BROWSER-NOTEBOOK.md`
- TZD-76 GGUF NSIS · TZD-78 mapping HITL · WAVE-NX-SUPPLY-OPS · WAVE-NX-CATALOG-PHOTOS · Orders inset · G12
- Visual QA DocStudio chrome+tables (PO глазом) · lint debt production/gantt (не этой волны)

# STREAM QUEUE — два потока (Freebuff / Claude)

> Режим PO 2026-09-06: скрин + слова → Cursor кладёт TZ в поток → отчёт агента → Cursor сразу следующий промпт в чат.  
> Живой статус слотов: [`_NOW.md`](./_NOW.md). Этот файл — **очередь волн**, не claim.

updated_at: 2026-09-06T11:30:00+03:00

## Правила

1. PO кидает скрин/текст → Cursor пишет TZ + строку сюда (Freebuff **или** Claude) + `PROMPT-*.md` при готовности волны. В чат **не** совать промпт, пока слот занят / нет зависимости.
2. PO кидает **отчёт** Freebuff/Claude → Cursor сверяет → в чат **сразу** следующий промпт этому агенту (или «промптов нет»).
3. Один `kppdf-web` / пересечение conflict keys → только **подряд** в одном потоке, не два параллельных на одну сборку.
4. Freebuff = рутина UI/CRUD/порты. Claude = долгая сборка, ops desktop, сложный bug/hydrate когда так решил Cursor.

---

## Freebuff stream

| Порядок | WAVE / TZ | PROMPT | Статус |
|---------|-----------|--------|--------|
| 1a | Hotfix shell+warehouse | — | **DONE** `c413bef7` on origin |
| 1b | Local demo orphan clean | `tasks/PROMPT-FREEBUFF-RESUME-B-ORPHAN-CLEAN.md` | **RESUME** (dry-run done; apply/archive pending; prior session loop) |
| 2 | WAVE-DOCSTUDIO-CHROME-IA C1→C4 | `tasks/PROMPT-FREEBUFF-DOCSTUDIO-CHROME-IA.md` | после B |
| 3 | S46→S45 DocStudio tables | `tasks/PROMPT-FREEBUFF-DOCSTUDIO-S45-S46.md` | после C4 |

---

## Claude stream

| Порядок | WAVE / TZ | PROMPT | Статус |
|---------|-----------|--------|--------|
| 1 | Desktop installer v0.5.7 | — | **DONE** |
| 2 | TZD-74 AI tab honesty | — | **DONE** |
| 3 | TZD-75 hide local chat + 0.5.8 installer | `tasks/PROMPT-CLAUDE-TZD-75-DESKTOP-0.5.8.md` | **DONE** — archived `tasks/_archive/2026-09/TZD-75-AI-TAB-SOON-AND-0.5.8.done.md` |
| 4 | TZD-76 real local helper (NSIS) | — | PARK до PO + acceptance |

---

## Inbox

- Gemini peer: `docs/agents/GEMINI-BROWSER-NOTEBOOK.md`
- **Desktop AI:** design accepted → `docs/peer/gemini-desktop-ai-ux-design.md`; runner plan → `gemini-desktop-ai-runner-plan.md`; TZD-75 NEXT (MCP layout + «Скоро», не полный чат)
- **Снабжение Google→NX:** `WAVE-NX-SUPPLY-OPS` — PARK (решения locked)

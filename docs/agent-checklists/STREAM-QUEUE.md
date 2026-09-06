# STREAM QUEUE — два потока (Freebuff / Claude)

> Режим PO 2026-09-06: скрин + слова → Cursor кладёт TZ в поток → отчёт агента → Cursor сразу следующий промпт в чат.  
> Живой статус слотов: [`_NOW.md`](./_NOW.md). Этот файл — **очередь волн**, не claim.

updated_at: 2026-09-06T10:45:00+03:00

## Правила

1. PO кидает скрин/текст → Cursor пишет TZ + строку сюда (Freebuff **или** Claude) + `PROMPT-*.md` при готовности волны. В чат **не** совать промпт, пока слот занят / нет зависимости.
2. PO кидает **отчёт** Freebuff/Claude → Cursor сверяет → в чат **сразу** следующий промпт этому агенту (или «промптов нет»).
3. Один `kppdf-web` / пересечение conflict keys → только **подряд** в одном потоке, не два параллельных на одну сборку.
4. Freebuff = рутина UI/CRUD/порты. Claude = долгая сборка, ops desktop, сложный bug/hydrate когда так решил Cursor.

---

## Freebuff stream

| Порядок | WAVE / TZ | PROMPT | Статус |
|---------|-----------|--------|--------|
| 1 | Hotfix shell+warehouse (+ demo clean) | `tasks/PROMPT-FREEBUFF-HOTFIX-THEN-DEMO-CLEAN.md` | IN PROGRESS / claim |
| 2 | WAVE-DOCSTUDIO-CHROME-IA C1→C4 | `tasks/PROMPT-FREEBUFF-DOCSTUDIO-CHROME-IA.md` | NEXT после hotfix |
| 3 | S46 liveRows после drag → S45 table→Свойства | `tasks/PROMPT-FREEBUFF-DOCSTUDIO-S45-S46.md` | READY (после C4) |

---

## Claude stream

| Порядок | WAVE / TZ | PROMPT | Статус |
|---------|-----------|--------|--------|
| 1 | Desktop installer v0.5.7 | `PROMPT-CLAUDE-DESKTOP-INSTALLER-LOCAL.md` | **DONE** — archived `tasks/_archive/2026-09/TZ-OPS-DESKTOP-INSTALLER-LOCAL.done.md` |
| 2 | TZD-74 AI tab honesty | `tasks/PROMPT-CLAUDE-DESKTOP-AI-TAB-HONESTY.md` | CLAIMED / IN PROGRESS |

---

## Inbox

- Gemini peer: `docs/agents/GEMINI-BROWSER-NOTEBOOK.md`
- Desktop «ИИ» → занесено в Claude #2 (не удалять вкладку)

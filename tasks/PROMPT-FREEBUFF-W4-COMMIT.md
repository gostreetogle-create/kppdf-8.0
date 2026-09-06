# PROMPT — Freebuff W4 CLOSEOUT commit only (session ended mid-push)

Скопируй целиком. **Не трогать product code.** W3 уже в main.

```
Ты executor kppdf-8.0 (agent_id: freebuff). GEMINI.md + docs/how-to-connect-ai.md.

═══ ФАКТ ═══
W3 DONE+pushed: 7f90a28d (не переоткрывать, не править warehouse/*.ts).
W4 docs почти готовы, но сессия умерла ДО commit/push:
- _active всё ещё: tasks/_active/TZ-NX-WAREHOUSE-W4-CLOSEOUT.md
- archive уже есть: tasks/_archive/2026-09/TZ-NX-WAREHOUSE-W4-CLOSEOUT.done.md
- checklist: docs/agent-checklists/TZ-NX-WAREHOUSE-W4-CLOSEOUT.md (AC [x])
- UNCOMMITTED docs: docs/DOMAIN-MAP.md, docs/agent-checklists/WAVE-NX-WAREHOUSE.md, docs/pages/PAGE-TZ-INDEX.md, docs/pages/README.md, docs/pages/warehouses.page.md, (+ FIC если dirty), checklist W4

═══ СДЕЛАТЬ ТОЛЬКО ═══
1) git status. Убедись нет FE/BE в stage. Если есть правки stock-movements/*.ts сверх 7f90a28d — НЕ коммить (откати или оставь unstaged; спроси Cursor только если реально нужны).
2) Дочитай TZ tasks/_ready/nx-warehouse/TZ-NX-WAREHOUSE-W4-CLOSEOUT.md — добей любой пробел в FIC §A / CAPABILITY если ещё не на диске.
3) Stage ТОЛЬКО W4 doc paths + checklist + archive done + WAVE. Commit message: docs(warehouse): W4 closeout WAVE-NX-WAREHOUSE DONE
4) Создай .mimocode/locks/TZ-NX-WAREHOUSE-W4-CLOSEOUT.done.lock
5) Удали tasks/_active/TZ-NX-WAREHOUSE-W4-CLOSEOUT.md
6) В checklist/archive проставь реальный commit SHA; push.
7) _NOW: Freebuff IDLE. STOP. Не начинай TZD-71 и не S1 (это отдельные промпты PO/Cursor).

Не спрашивай «продолжать?».
```

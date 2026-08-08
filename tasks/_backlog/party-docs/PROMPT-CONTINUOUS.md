# PROMPT — continuous executor · WAVE-PARTY-DOCS

Скопируй целиком в новый чат агента-исполнителя (Gemini / Buffy / local).

---

Ты исполнитель kppdf-8.0. Прочитай:

1. `OrchestratorKit/AGENTS.md` (цикл claim → code → gates → archive)  
2. `.agents/skills/kppdf-executor-continuous/SKILL.md`  
3. `tasks/_backlog/party-docs/WAVE-PARTY-DOCS.md` — **источник порядка**  
4. Следующий незакрытый TZ из таблицы волны (не PARKED)

## Правила волны

- Порядок: **301 → 302 → 303 → 306 → ASSETS-301 → ASSETS-302 → DESKTOP-SOT-301**.  
- **TZ-INN-301** не трогать (PARKED), пока PO не скажет unpark + ключ.  
- После **301 DONE** можно параллелить 302 / 303 / 306 **только если** CONFLICT KEYS не пересекаются; иначе строго по таблице. Один агент в этом чате → иди **последовательно** по #1…#7.  
- Deploy **запрещён**, пока PO явно не скажет «деплой».  
- Не коммить чужой WIP (`desktop/mcp-runtime` до DESKTOP-SOT).  
- После каждого TZ: archive + commit/push своей зоны + heartbeat Team Room.  
- Когда волна #1–#7 DONE (INN остаётся PARKED) — остановись и отчитайся PO: «WAVE-PARTY-DOCS #1–7 закрыты; INN parked; жду deploy или unpark INN».

## Старт сейчас

1. `node OrchestratorKit/team-room/cli.mjs join` + `inbox`  
2. Проверь `_active/` и CONFLICT KEYS  
3. Claim первый READY: `tasks/_backlog/party-docs/TZ-PARTY-301-hygiene.md` (если ещё не DONE)  
4. Выполни acceptance → archive → следующий файл волны  

Не спрашивай «поехали?» — работай до пустой очереди волны (кроме PARKED) или до блокера CONFLICT / verify-status FAIL.

---

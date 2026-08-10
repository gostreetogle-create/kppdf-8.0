# Промпт: WAVE-MCP-GAP (TZD-31→34) — continuous

**Для PO:** скопируй блок ниже целиком в чат исполнителя (Gemini / Buffy / Claude / local).

---

Ты — непрерывный исполнитель **kppdf-8.0**, волна **WAVE-MCP-GAP**.

Корень: `D:\kppdf-8.0`, ветка **`main`**.  
Канон: `GEMINI.md` + `OrchestratorKit/AGENTS.md` + `.agents/skills/kppdf-executor-continuous/SKILL.md` + `docs/PO-DIARY.md` §1–§4.

## Очередь этой сессии (только она)

Serial, строго по порядку:

1. `tasks/TZD-31-mcp-runtime-sync.md` · checklist `docs/agent-checklists/TZD-31.md`
2. `tasks/TZD-32-material-propose-fields.md` · `TZD-32.md`
3. `tasks/TZD-33-commercial-mcp-hitl.md` · `TZD-33.md`
4. `tasks/TZD-34-stock-movement-mcp.md` · `TZD-34.md`

Карта волны: `tasks/_backlog/desktop/WAVE-MCP-GAP-2026-08-10.md`  
Аудит: `docs/audits/2026-08-10-mcp-sport-demo-audit.md`

**Не брать** в этой сессии: WAVE-DICT-DEMO, WAVE-KP-COMPLETE, OPS deploy, TZD-35, любые PARKED.

## Движение

- **Без остановок** mid-queue: не жди «ок / поехали / продолжай».
- Цикл каждой TZ: CLAIM → код по AC → gates → progress → lock → archive → **commit+push** → checkpoint `_active-map` → **сразу следующий**.
- Стоп только если: CONFLICT KEYS заняты чужим `_active`; gates красные и не чинятся в зоне; нужны wipe/secrets/необратимая schema-развилка; или очередь 31–34 закрыта.

## CLAIM (до кода, каждая TZ)

1. `Get-Location` + `git rev-parse --show-toplevel` → оба `D:\kppdf-8.0`
2. `git fetch` + `git pull --ff-only` (чужой dirty WIP не затирай — отчёт и STOP)
3. Проверь `tasks/_active/` и CONFLICT KEYS TZ
4. Создай `tasks/_active/TZD-NN.md` + заполни claim slot в checklist (CLAIMED)
5. Team Room best-effort: `node OrchestratorKit/team-room/cli.mjs join` / claim
6. Потом код

## Запреты

- `deploy.ps1` / wipe / production deploy
- commit `desktop/mcp-runtime/**`
- FE redesign Create КП / studio
- Новые mutation-journal kinds для КП/заказа (явно out of TZD-33)
- Выдумывать TZ вне волны

## Когда 31–34 в archive DONE

1. Checkpoint: WAVE-MCP-GAP DONE · NEXT idle · `_active/` empty  
2. Короткий отчёт PO: что закрыто + «готово предложить деплой»  
3. **Idle.** Деплой не запускать.

## Старт сейчас

CLAIM первым TZD-31. Если 31 уже DONE в archive — бери первый неархивированный из 32–34. Не спрашивай разрешения продолжить.

# PROMPT — Desktop AI-чат (вертикаль до рабочего чата)

> Не путать с агентами 1–2 (Angular). Эта очередь только `desktop/**`.
> Deploy / wipe — запрещены. Push — можно.
> Исполнитель: **Claude Code или Gemini**. Freebuff — только если Medium и строго по шагам;
> TZD-62 не отдавать самой слабой модели.

**PO:** новый чат, скопируй блок ниже целиком.

---

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0
Прочитай: GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md
+ docs/superpowers/specs/2026-08-22-desktop-local-ai-onboarding.md

Канон: локальная модель = уже вшитый llama.cpp + .gguf в app-data/models.
НЕ ставить Ollama. НЕ трогать frontend Angular и backend app logic.
НЕ merge с LM Studio. LIMITED_HELPER: чат не пишет в SoT, не деплоит, не claim.

Параллельно могут работать Freebuff на Angular — их файлы не трогай.
Свой hot file: desktop/src/App.svelte — только ты, три TZ подряд (не параллелить 62/63/64).

Deploy / wipe — ЗАПРЕЩЕНЫ. Push — можно. .github/ не трогать.

CLAIM первым (до кода), на каждый TZ:
1) Get-Location + git rev-parse → D:\kppdf-8.0 (не .freebuff/worktrees)
2) TZ → tasks/_active/<ID>.md; checklist _TEMPLATE.md
3) Claim slot: agent_id + claimed_at ISO + workspace
4) Чужой _active на те же conflict keys → STOP этот TZ
5) Team Room claim best-effort

Цикл: CLAIM → код по Scope → gates из TZ → archive 2026-08/<ID>.done.md + lock
+ commit + push (только свои пути, не git add -A) → одна строка _NOW → следующий TZ.
Перед каждым TZ: git fetch && git merge origin/main.

ОЧЕРЕДЬ:
1. tasks/TZD-62-desktop-ai-chat.md
2. tasks/TZD-63-desktop-model-folder-any-gguf.md
3. tasks/TZD-64-desktop-ai-project-prompt.md

НЕ БРАТЬ: TZD-60 (installer), пакетный drop на вкладке AI, Angular волны.

СТОП: gates FAIL ×2 → .failed.md, дальше только если keys свободны.

DoD: таблица ID | outcome | archive | SHA | gates. Без деплоя.
Живой smoke: вкладка AI → чат; нет модели → папка открывается; скачать → модель грузится без третьего клика «Перезапустить».
```

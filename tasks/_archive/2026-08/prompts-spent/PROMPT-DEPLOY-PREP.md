# PROMPT — Deploy prep (без деплоя)

**Для PO:** скопируй блок ниже в новый чат исполнителя.  
После отчёта «готово предложить деплой» — **отдельным** сообщением скажи «задеплой», если ок.

Не путать с WAVE-KP-COMPLETE (новые фичи КП) — это только гигиена + smoke.

---

Ты — исполнитель kppdf-8.0 · workspace ТОЛЬКО `D:\kppdf-8.0` · ветка `main`.  
Skills: `.agents/skills/kppdf-executor-continuous/SKILL.md` + `GEMINI.md`  
TZ: `tasks/_backlog/ops/TZ-OPS-309-deploy-prep-hygiene-smoke.md`  
PO: `docs/PO-DIARY.md` §1–§4  

**Deploy НЕ запускать.** WAVE-KP-COMPLETE / TZ-SALES-340+ НЕ трогать. DOC-344 НЕ реализовывать.

## СТАРТ
1. `cd D:\kppdf-8.0` && `git pull --ff-only` && `git status -sb`
2. CLAIM до правок: `tasks/_active/TZ-OPS-309.md` + `docs/agent-checklists/TZ-OPS-309.md`
3. Если `_active/` не пуст чужим claim — STOP + доклад

## СДЕЛАЙ
1. Закоммить+push только:
   - `tasks/_archive/2026-08/TZ-DOC-343.done.md`
   - `tasks/_backlog/TZ-DOC-344-builder-single-default-background.md` (park, без кода)
2. Один Nest на `:3000` (EADDRINUSE = уже запущен; не дублируй). Health ok.
3. Smoke браузер admin: Все КП / Создать КП / Роли (Edit на системной, без Delete).
4. FE+BE `tsc --noEmit` PASS. Hotfix только если smoke ломает показ.
5. Checkpoint `_active-map`: READY TO PROPOSE DEPLOY · NEXT idle · Deploy NO
6. Archive TZ-OPS-309 + lock + remove `_active` + commit/push своих файлов
7. Финал PO: SHA + «можно предлагать деплой» · **idle**

## BAN
- `deploy.ps1` / wipe / secrets  
- WAVE-KP-COMPLETE · SALES-340…348 · TABLE-CONFIG фичи  
- Реализация DOC-344  
- Чужие dirty вне CONFLICT KEYS

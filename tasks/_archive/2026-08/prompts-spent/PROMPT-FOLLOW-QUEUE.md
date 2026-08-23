# PROMPT — один раз на сессию исполнителя (дальше без копипаста TZ)

> PO: в новый чат Freebuff / Claude **один раз**. Следующие TZ — из `tasks/QUEUE-LIVE.md`.
> Обрыв: этот же блок + `PROMPT-RESUME-ANY.md`.

---

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0 на main.
GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md + docs/PO-CANON.md
Перед UI: docs/ui-rules.md

Очередь правды: tasks/QUEUE-LIVE.md

ЦИКЛ:
1) git pull --ff-only
2) QUEUE-LIVE.md + tasks/_active/ (должно быть пусто между задачами)
3) CLAIM → код → gates → archive → commit/push → следующая из backlog только если PO дал
4) НЕ deploy / wipe / кати без русской фразы PO

Сейчас LIVE TZ в корне tasks/ нет — волна WR+ROI закрыта.
Следующее для PO: Cursor «подготовь к деплою» (PROMPT-DEPLOY-READY.md).
```

# PROMPT — Gantt expand UX (TZ-PRODUCTION-339)

```text
Прочитай GEMINI.md + tasks/TZ-PRODUCTION-339-gantt-expand-group-frames.md.

PO: стрелки ▸ слишком мелкие (не видно открыто/закрыто); 2–3 раскрытых заказа сливаются — нужны жирные рамки групп.

CLAIM → chevron ≥14–16px + hit ≥36px → group frame для expanded order (light/dark) → jest gantt-bars → archive.
Не трогать estimate/PATCH/facade. Deploy запрещён.
Параллельно с TZ-PRODUCTION-338 OK (разные conflict keys).
```

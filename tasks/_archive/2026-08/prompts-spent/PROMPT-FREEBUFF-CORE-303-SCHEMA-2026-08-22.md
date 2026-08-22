# PROMPT — Freebuff: бэкенд не стартует (снят @ у Schema)

> Локальный `start.mjs`: frontend :4200 живой, backend падает на boot.
> Не desktop, не UI-414. Deploy / wipe — нет.

**PO:** новый чат Freebuff, скопируй блок ниже.

---

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0
GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md
TZ: tasks/TZ-CORE-303-restore-schema-decorator.md

НЕ ТРОГАТЬ: frontend/**, desktop/**, doc-type.service.ts, deploy/wipe, .github/.
Не git checkout schema-файлов — сотрёшь softDelete: false.

CLAIM до кода: TZ → tasks/_active/TZ-CORE-303.md; checklist _TEMPLATE.md;
agent_id=freebuff; claimed_at ISO. Чужой _active на те же KEYS → DEFER.

Суть: в ~17 *.schema.ts строка `Schema({` без `@`. Nest собирает пустую
схему → StrictModeError Path "slug" is not in schema на
DocTypeService.onModuleInit. Верни `@Schema({`, оставь softDelete: false.

Цикл: CLAIM → правка → rg ^Schema( = 0 → backend tsc →
node start.mjs --stop ; node start.mjs --no-browser → /api/health 200 →
archive 2026-08/TZ-CORE-303.done.md + lock + commit + push.
DoD: SHA + health 200. Без деплоя.
```

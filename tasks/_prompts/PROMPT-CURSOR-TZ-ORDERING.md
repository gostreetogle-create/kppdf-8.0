# PROMPT — Cursor: как составлять и упорядочивать TZ (build-integrity)

Скопировать в Cursor Mode A **перед** новой волной frontend-nx или при ответе PO «можно запускать?».

```text
Ты — Cursor Mode A (архитектор/TZ). Код не пиши.

Прочитай и примени:
- docs/TZ-NX-BUILD-INTEGRITY.md          ← SoT инцидента 2026-08-30
- docs/TZ-AUTHORING.md §7
- docs/agent-checklists/TZ-OPS-NX-TZ-QUALITY-PROTOCOL-AUDIT.md (UX/PASS честность)
- .agents/skills/tz-authoring/SKILL.md
- tasks/_active/ + docs/agent-checklists/_NOW.md + tasks/QUEUE-LIVE.md

КОНТЕКСТ ИНЦИДЕНТА (не забывать):
- READ-TZ закрылись с gates PASS, но jest import в prod сломал nx build/serve.
- S2 (/studio) и REGISTRY-CRUD (/registries) формально без общих conflict keys,
  но Angular собирает ВЕСЬ kppdf-web — любая ошибка где угодно в apps/kppdf-web/src/**
  блокирует PO на :4201.
- PO ~2ч не мог запустить проект, потому что ни один TZ не требовал
  «nx build kppdf-web зелёный» как последний шаг.

ПРАВИЛА ПРИ НАПИСАНИИ/ВЫДАЧЕ TZ:

1) IMPLICIT CONFLICT
   Любой TZ с apps/kppdf-web/src/** → в шапке:
   IMPLICIT CONFLICT: nx build kppdf-web (всё приложение)

2) GATES
   nx build kppdf-web — baseline ДО claim И последний шаг ПЕРЕД archive.
   tsc/vitest/lint — дополнение, не замена.

3) ПАРАЛЕЛЬ
   Не выдавать два активных TZ на kppdf-web/src/**.
   Очередь: archive + green build → следующий TZ.

4) SPLIT
   TZ >1ч или >7 шагов → нарезать серию с DEPENDENCIES;
   каждый кусок заканчивается зелёным nx build.

5) ОТВЕТ PO «МОЖНО ЗАПУСКАТЬ?»
   Только если tasks/_active/ пуст И
   cd frontend-nx && pnpm exec nx build kppdf-web → exit 0.
   Иначе: «ещё нет» + что блокирует (active TZ / красный build / uncommitted WIP).

6) PROMPT ИСПОЛНИТЕЛЮ
   В каждый PROMPT-FREEBUFF-* вставлять BUILD INTEGRITY блок из TZ-NX-BUILD-INTEGRITY.md §5.
   Явно: «S3 не начинать пока REGISTRY archived и build green».

ЗАДАНИЕ PO: <вставить запрос — нарезать очередь / проверить можно ли запускать / переписать монолитный TZ>

Deliverable:
- обновлённые или новые tasks/TZ-*.md с BUILD INTEGRITY блоком
- tasks/QUEUE-LIVE.md — строго последовательная очередь kppdf-web волн
- короткий loader для Freebuff (CLAIM → gates → archive)
- одна строка PO: можно / нельзя запускать + почему
```

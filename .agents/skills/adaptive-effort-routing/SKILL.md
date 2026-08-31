---
name: adaptive-effort-routing
description: >-
  Pick the cheapest capable agent/model for each kppdf engineering stage and
  escalate when risk grows. Use before a new TZ wave or materially different
  stage; not for casual chat.
---

# Адаптивный выбор усилия (kppdf)

Канон: `docs/agents/MULTI-AGENT-WORKFLOW.md` § Effort.  
Карта пакета (Codex Luna/Terra/Sol): `data/multi-agent-production-workflow-v1/public-package/docs/EFFORT_ROUTING_RULES.md`.

## Маршрут

| Этап | Минимум |
|------|---------|
| Поиск файла, SHA, статус | дешёвая / Luna / Flash |
| Docs, механический текст | Freebuff / Luna |
| CSS / presentation-only | Freebuff |
| Обычный FE+BE сценарий | Freebuff или Claude Sonnet |
| Auth, RBAC, IDOR, DB write, concurrency | Claude Sonnet+ / Gemini Pro; Cursor peer Claude до TZ |
| Деньги, склад, historical, shared guard | Opus / max; Mode A + MCP Claude |
| Неделимая архитектура | Cursor + MCP Claude analysis-only → TZ |

## Gate

1. Инвариант, цена ошибки, blast radius, SoT.
2. Минимально достаточный агент/модель.
3. Не считать обещание в чате подтверждением настроек.
4. При росте риска — стоп изменений, новый gate на более сильном уровне.

Модель не расширяет authority и не заменяет Claim, тесты, review, rollback, слово PO на deploy.

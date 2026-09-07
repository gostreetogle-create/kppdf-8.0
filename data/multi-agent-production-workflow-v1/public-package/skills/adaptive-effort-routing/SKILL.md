---
name: adaptive-effort-routing
description: Select the least expensive capable Codex model and reasoning effort for each engineering stage, verify the actual platform setting, and escalate when risk grows. Use before a new task or materially different stage; do not use for casual chat or a continuation with unchanged scope.
---

# Адаптивный выбор модели и усилия

## Назначение

Не расходовать дорогие токены на механическую работу и не экономить на критических инвариантах.

## Маршрутизация

- `GPT-5.6 Luna · high` — короткий read-only поиск, статус, механическая правка текста.
- `GPT-5.6 Terra · high` — документация, presentation-only UI и низкорисковая техническая рутина.
- `GPT-5.6 Sol · high` — runtime-поведение, несколько связанных файлов, неоднозначная интеграция.
- `GPT-5.6 Sol · xhigh` — auth, роли, БД, concurrency, деньги, склад, historical data, production.
- `GPT-5.6 Sol · max` — одна неделимая задача предельной сложности.
- `GPT-5.6 Sol · ultra` — несколько независимых критических направлений с ограниченными read-heavy проверками и интеграцией главным агентом.

## Gate

1. Определить изменяемый инвариант, цену ошибки, охват, источник истины, побочные эффекты и blast radius.
2. Выбрать минимально достаточную пару model/effort.
3. Если платформа поддерживает same-task переключение, запросить exact пару и дождаться доверенного подтверждения фактических настроек.
4. Не считать текстовое обещание, успешную доставку сообщения или название режима подтверждением.
5. Если автоматическое переключение недоступно, попросить владельца вручную включить точную пару и явно подтвердить её.
6. При росте риска остановить изменения, сохранить state и повторить gate на более сильном уровне.

Модель и effort никогда не расширяют authority и не заменяют тесты, review, rollback или отдельное разрешение production.

Полная карта: `docs/EFFORT_ROUTING_RULES.md`.

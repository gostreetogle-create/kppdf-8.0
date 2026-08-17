# PROMPT — TZ-NAV-303 only (Freebuff / лёгкая модель)

Ты лёгкий executor. **Один TZ. Не волну целиком.** Не угадывай.

Workspace MUST be: `D:\kppdf-8.0`
Проверь: `Get-Location` + `git rev-parse --show-toplevel` → оба пути совпадают.

## CLAIM (до любой правки кода)
1. Создай `docs/agent-checklists/TZ-NAV-303.md` из `docs/agent-checklists/_TEMPLATE.md`
2. Создай `tasks/_active/TZ-NAV-303.md` (короткий marker: id, claimed_at ISO, workspace)
3. Status = CLAIMED. Заполни Claim slot.
4. Если в `tasks/_active/` уже есть чужой файл с теми же keys (`app-layout*`, `app.routes.ts`) → STOP, напиши PO.

## Сделай ТОЛЬКО
Прочитай и выполни буквально:
`tasks/TZ-NAV-303-combine-to-design-home-stats.md`

Кратко цель:
- Канбан «Комбайн» переехать на `/design/combine`, пункт nav **Проект** (design)
- `/` и `/dashboard` = stub «Обзор» (НЕ канбан)
- Brand chip aria/title: не «Комбайн…», а «Обзор — главная» (или «Дашборд — главная»)
- Убрать `/dashboard` из deals `activeAliases` и chip «Комбайн» в TOC Сделок если есть

## НЕ трогать (STOP если полезешь)
- `/inventory` и его label «Дашборд»
- Логику kanban ship/cancel (SWEEP-401)
- `materials.page`, PHOTO frame, desktop
- TZ-DASHBOARD-401 виджеты — **другой чат**
- Deploy / wipe

## Gates (скопируй вывод)
```
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- --testPathPattern="app-layout" --coverage=false
```

## Конец
READY FOR REVIEW + Executor report. **Не archive** до Cursor PASS.
Не начинай DASHBOARD-401.

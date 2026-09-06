# UI Design Adoptions — backlog queue

> Источник: [`docs/audits/2026-08-31-dark-control-interface-audit.md`](../../docs/audits/2026-08-31-dark-control-interface-audit.md)  
> PO запрос: интегрировать полезное из `data/DESIGN.zip` в Paper & Ink.

## Порядок выдачи исполнителю

1. **TZ-UI-DCI-602** — **LIVE** → `tasks/TZ-UI-DCI-602-focus-segmented.md` + `PROMPT-FREEBUFF-DCI-601-602.md`
2. **TZ-UI-DCI-601** — **READY after 602** → `tasks/TZ-UI-DCI-601-flow-diagram.md`
3. **TZ-UI-DCI-603** — status pulse на production/shipping (ещё backlog)
4. **TZ-UI-DCI-604** — login dark grid (косметика)
5. **TZ-UI-DCI-605** — carousel (когда PO попросит каталог-карточки)

## Conflict keys (общие)

`frontend/src/styles.css`; `docs/paper-and-ink.md`; `docs/DARK-THEME.md`; `docs/ui-rules.md`

Не смешивать с параллельными TZ на `styles.css` без очереди.

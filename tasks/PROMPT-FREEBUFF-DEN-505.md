# Freebuff — DEN-505 framed content inset (после 410+354)

> Брать **только после** archived 410 и 354 на origin. Параллель с deploy-prep OK (разные keys).

```text
cd D:\kppdf-8.0 && git pull --ff-only
GEMINI.md · kppdf-executor-loop · docs/ui-density-canon.md

TZ: tasks/TZ-UI-DEN-505-framed-content-inset.md
CLAIM → tasks/_active/TZ-UI-DEN-505.md · agent_id: freebuff-N

PO bug: /desk «Загрузка заказов» прилипла к hairline — search рядом с нормальным inset.

Порядок: token styles.css → desk hotfix → grep sweep pages → archive

Gates:
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
pnpm test -- manager-desk --runInBand
pnpm lint

Commit: fix(ui): framed content inset canon (DEN-505)
Archive: tasks/_archive/2026-08/TZ-UI-DEN-505.done.md
STOP — deploy без PO
```
